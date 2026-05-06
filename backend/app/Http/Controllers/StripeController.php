<?php

namespace App\Http\Controllers;

use App\Models\Fature;
use App\Models\Pagese;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class StripeController extends Controller
{
    private const STRIPE_API = 'https://api.stripe.com/v1';

    /**
     * Create a Stripe Checkout Session for an invoice payment.
     * Uses Laravel Http (Guzzle) instead of the Stripe SDK to avoid
     * curl_version() issues in some PHP-FPM / FastCGI environments.
     *
     * POST /api/stripe/checkout  (auth:sanctum)
     * Body: { fature_id: int, shuma: float }
     */
    public function createCheckoutSession(Request $request)
    {
        $validated = $request->validate([
            'fature_id' => 'required|exists:faturat,fature_id',
            'shuma'     => 'required|numeric|min:0.01',
        ]);

        $fature = Fature::with([
            'kontrate:kontrate_id,numri_kontrates,klient_id',
            'kontrate.klient:klient_id,emri,mbiemri',
        ])->findOrFail($validated['fature_id']);

        $secret       = config('services.stripe.secret');
        $frontendUrl  = rtrim(config('services.stripe.frontend_url'), '/');
        $shumaInCents = (int) round((float) $validated['shuma'] * 100);

        $klientEmri = $fature->kontrate?->klient
            ? "{$fature->kontrate->klient->emri} {$fature->kontrate->klient->mbiemri}"
            : 'Klient';

        $productName = "Fatura {$fature->periudha}";
        if ($fature->kontrate?->numri_kontrates) {
            $productName .= " — {$fature->kontrate->numri_kontrates}";
        }

        // Build the request as application/x-www-form-urlencoded (Stripe's format)
        $response = Http::withBasicAuth($secret, '')
            ->asForm()
            ->post(self::STRIPE_API . '/checkout/sessions', [
                'payment_method_types[]'                      => 'card',
                'mode'                                        => 'payment',
                'line_items[0][price_data][currency]'         => 'eur',
                'line_items[0][price_data][unit_amount]'      => $shumaInCents,
                'line_items[0][price_data][product_data][name]'        => $productName,
                'line_items[0][price_data][product_data][description]' => $klientEmri,
                'line_items[0][quantity]'                     => 1,
                'metadata[fature_id]'                         => $fature->fature_id,
                'metadata[shuma]'                             => (string) $validated['shuma'],
                'success_url'                                 => "{$frontendUrl}/pagesat?stripe_success=1",
                'cancel_url'                                  => "{$frontendUrl}/pagesat?stripe_cancel=1",
            ]);

        if ($response->failed()) {
            $error = $response->json('error.message', 'Gabim i panjohur nga Stripe.');
            // Always return 422 — never forward Stripe's 401/4xx directly,
            // because Axios would interpret a 401 as a session expiry and log the user out.
            return response()->json(['message' => $error], 422);
        }

        return response()->json(['checkout_url' => $response->json('url')]);
    }

    /**
     * Handle incoming Stripe webhook events.
     * Signature is verified using PHP's built-in hash_hmac (no curl needed).
     *
     * POST /api/stripe/webhook  (public — no auth middleware)
     */
    public function webhook(Request $request)
    {
        $payload      = $request->getContent();
        $sigHeader    = $request->header('Stripe-Signature', '');
        $webhookSecret = config('services.stripe.webhook_secret');

        // Verify the Stripe webhook signature
        if (!$this->verifyStripeSignature($payload, $sigHeader, $webhookSecret)) {
            return response()->json(['error' => 'Invalid signature.'], 400);
        }

        $event = json_decode($payload, true);

        if (($event['type'] ?? '') === 'checkout.session.completed') {
            $session       = $event['data']['object'];
            $paymentStatus = $session['payment_status'] ?? '';

            if ($paymentStatus !== 'paid') {
                return response()->json(['received' => true]);
            }

            $meta      = $session['metadata'] ?? [];
            $fatureId  = (int)   ($meta['fature_id'] ?? 0);
            $shuma     = (float) ($meta['shuma']      ?? 0);
            $reference = $session['payment_intent'] ?? $session['id'];

            if (!$fatureId || $shuma <= 0) {
                return response()->json(['error' => 'Missing metadata.'], 422);
            }

            // Idempotency guard — ignore duplicate webhook deliveries
            if (Pagese::where('referenca', $reference)->exists()) {
                return response()->json(['received' => true, 'note' => 'duplicate']);
            }

            Pagese::create([
                'fature_id'    => $fatureId,
                'shuma'        => $shuma,
                'data_pageses' => now()->toDateString(),
                'metoda'       => 'online',
                'referenca'    => $reference,
                'shenime'      => 'Paguar automatikisht nëpërmjet Stripe Checkout.',
            ]);

            $this->syncFatureStatusi($fatureId);
        }

        return response()->json(['received' => true]);
    }

    /**
     * Manually verify Stripe webhook signature (RFC: HMAC-SHA256).
     * Does NOT use curl — only PHP's built-in hash_hmac.
     *
     * Stripe-Signature header format: t=TIMESTAMP,v1=HASH[,v1=HASH2...]
     */
    private function verifyStripeSignature(string $payload, string $sigHeader, string $secret): bool
    {
        if (!$sigHeader || !$secret) return false;

        // Parse: t=...,v1=...
        $parts     = explode(',', $sigHeader);
        $timestamp = null;
        $signatures = [];

        foreach ($parts as $part) {
            [$key, $val] = array_pad(explode('=', $part, 2), 2, '');
            if ($key === 't')  $timestamp    = $val;
            if ($key === 'v1') $signatures[] = $val;
        }

        if (!$timestamp || empty($signatures)) return false;

        // Reject if timestamp is older than 5 minutes (replay attack protection)
        if (abs(time() - (int) $timestamp) > 300) return false;

        $signedPayload   = "{$timestamp}.{$payload}";
        $expectedSig     = hash_hmac('sha256', $signedPayload, $secret);

        foreach ($signatures as $sig) {
            if (hash_equals($expectedSig, $sig)) return true;
        }

        return false;
    }

    /**
     * Portal Stripe Checkout — called by klient role from their own portal.
     * Validates that the invoice belongs to the requesting client.
     *
     * POST /api/portal/stripe/checkout  (auth:sanctum, any role)
     * Body: { fature_id: int, shuma: float }
     */
    public function createPortalCheckoutSession(Request $request)
    {
        $validated = $request->validate([
            'fature_id' => 'required|exists:faturat,fature_id',
            'shuma'     => 'required|numeric|min:0.01',
        ]);

        $fature = Fature::with([
            'kontrate:kontrate_id,numri_kontrates,klient_id',
            'kontrate.klient:klient_id,emri,mbiemri,user_id',
        ])->findOrFail($validated['fature_id']);

        // Ownership check: klient can only pay their own invoices
        $user = $request->user();
        if ($user->roli === 'klient') {
            $klient = $user->klient;
            if (!$klient || $fature->kontrate?->klient_id !== $klient->klient_id) {
                return response()->json(['message' => 'Nuk keni qasje në këtë faturë.'], 403);
            }
        }

        $secret       = config('services.stripe.secret');
        $frontendUrl  = rtrim(config('services.stripe.frontend_url'), '/');
        $shumaInCents = (int) round((float) $validated['shuma'] * 100);

        $klientEmri = $fature->kontrate?->klient
            ? "{$fature->kontrate->klient->emri} {$fature->kontrate->klient->mbiemri}"
            : 'Klient';

        $productName = "Fatura {$fature->periudha}";
        if ($fature->kontrate?->numri_kontrates) {
            $productName .= " — {$fature->kontrate->numri_kontrates}";
        }

        $response = Http::withBasicAuth($secret, '')
            ->asForm()
            ->post(self::STRIPE_API . '/checkout/sessions', [
                'payment_method_types[]'                               => 'card',
                'mode'                                                 => 'payment',
                'line_items[0][price_data][currency]'                  => 'eur',
                'line_items[0][price_data][unit_amount]'               => $shumaInCents,
                'line_items[0][price_data][product_data][name]'        => $productName,
                'line_items[0][price_data][product_data][description]' => $klientEmri,
                'line_items[0][quantity]'                              => 1,
                'metadata[fature_id]'                                  => $fature->fature_id,
                'metadata[shuma]'                                      => (string) $validated['shuma'],
                'success_url'                                          => "{$frontendUrl}/portal?stripe_success=1",
                'cancel_url'                                           => "{$frontendUrl}/portal?stripe_cancel=1",
            ]);

        if ($response->failed()) {
            $error = $response->json('error.message', 'Gabim i panjohur nga Stripe.');
            return response()->json(['message' => $error], 422);
        }

        return response()->json(['checkout_url' => $response->json('url')]);
    }

    /** Keep invoice status in sync after payment recorded. */
    private function syncFatureStatusi(int $fatureId): void
    {
        $fature = Fature::find($fatureId);
        if (!$fature || $fature->statusi === 'anulluar') return;

        $totalPaguar = Pagese::where('fature_id', $fatureId)->sum('shuma');

        if ($totalPaguar >= $fature->totali) {
            $fature->update(['statusi' => 'e_paguar', 'data_pageses' => now()->toDateString()]);
        } elseif ($fature->statusi === 'e_paguar') {
            $isPast = $fature->data_leshimit && $fature->data_leshimit->isPast();
            $fature->update([
                'statusi'      => $isPast ? 'e_vonuar' : 'e_papaguar',
                'data_pageses' => null,
            ]);
        }
    }
}
