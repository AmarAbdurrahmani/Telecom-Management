<?php

namespace App\Http\Controllers;

use App\Models\Fature;
use App\Models\Pagese;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;


class PageseController extends Controller
{
    public function createStripeSession(Request $request)
    {
        $validated = $request->validate([
            'fature_id' => 'required|exists:faturat,fature_id',
            'shuma'     => 'required|numeric|min:0.50',
        ]);

        $fature = Fature::with([
            'kontrate:kontrate_id,numri_kontrates,klient_id',
            'kontrate.klient:klient_id,emri,mbiemri',
        ])->findOrFail($validated['fature_id']);

        // ── Stripe secret key ────────────────────────────────────────────────
        $secret = config('services.stripe.secret');
        if (!$secret) {
            return response()->json(['message' => 'Stripe nuk është konfiguruar (STRIPE_SECRET mungon).'], 500);
        }

        // ── Shuma: DUHET të jetë integer (cent) ─────────────────────────────
        // 29.99 € → (int) round(29.99 * 100) = 2999  (jo 2998.9999...)
        $shumaInCents = (int) round((float) $validated['shuma'] * 100);

        // ── URL-të nga .env me fallback të sigurt ───────────────────────────
        $frontendUrl = rtrim(
            config('services.stripe.frontend_url', 'http://localhost:5173'),
            '/'
        );

        $successUrl = $frontendUrl
            . '/pagesat?stripe_success=1'
            . '&fature_id=' . $fature->fature_id
            . '&shuma='     . $validated['shuma'];

        $cancelUrl = $frontendUrl . '/pagesat?stripe_cancel=1';

        // ── Krijimi i sesionit me Http:: (pa Stripe SDK, pa curl_version) ───
        $klientEmri = $fature->kontrate?->klient
            ? "{$fature->kontrate->klient->emri} {$fature->kontrate->klient->mbiemri}"
            : 'Klient';

        $response = Http::withBasicAuth($secret, '')
            ->asForm()
            ->post('https://api.stripe.com/v1/checkout/sessions', [
                'payment_method_types[]'                               => 'card',
                'mode'                                                 => 'payment',
                'line_items[0][price_data][currency]'                  => 'eur',
                'line_items[0][price_data][unit_amount]'               => $shumaInCents,
                'line_items[0][price_data][product_data][name]'        => "Fatura {$fature->periudha} — {$fature->kontrate?->numri_kontrates}",
                'line_items[0][price_data][product_data][description]' => $klientEmri,
                'line_items[0][quantity]'                              => 1,
                'metadata[fature_id]'                                  => $fature->fature_id,
                'metadata[shuma]'                                      => (string) $validated['shuma'],
                'success_url'                                          => $successUrl,
                'cancel_url'                                           => $cancelUrl,
            ]);

        if ($response->failed()) {
            $error = $response->json('error.message', 'Gabim i panjohur nga Stripe.');
            return response()->json(['message' => $error], 422);
        }

        return response()->json(['url' => $response->json('url')]);
    }



    private const METODAT = ['cash', 'online', 'transfer'];

    public function index(Request $request)
    {
        $query = Pagese::with([
            'fature:fature_id,kontrate_id,periudha,totali,statusi',
            'fature.kontrate:kontrate_id,numri_kontrates,klient_id',
            'fature.kontrate.klient:klient_id,emri,mbiemri',
        ]);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('referenca', 'like', "%$s%")
                  ->orWhere('shenime',  'like', "%$s%")
                  ->orWhereHas('fature', fn($f) =>
                      $f->where('periudha', 'like', "%$s%")
                        ->orWhereHas('kontrate.klient', fn($kl) =>
                            $kl->where('emri',    'like', "%$s%")
                               ->orWhere('mbiemri', 'like', "%$s%")
                        )
                  );
            });
        }

        if ($request->filled('fature_id')) {
            $query->where('fature_id', $request->fature_id);
        }

        if ($request->filled('metoda')) {
            $query->where('metoda', $request->metoda);
        }

        $perPage   = (int) $request->get('per_page', 15);
        $paginator = $query->orderBy('pagese_id', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'pagination' => [
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fature_id'    => 'required|exists:faturat,fature_id',
            'shuma'        => 'required|numeric|min:0.01',
            'data_pageses' => 'required|date',
            'metoda'       => 'required|in:' . implode(',', self::METODAT),
            'referenca'    => 'nullable|string|max:100',
            'shenime'      => 'nullable|string|max:500',
        ]);

        $pagese = Pagese::create($validated);

        // Auto-update fature statusi based on total payments
        $this->syncFatureStatusi($validated['fature_id']);

        return response()->json(
            $pagese->load([
                'fature:fature_id,kontrate_id,periudha,totali,statusi',
                'fature.kontrate:kontrate_id,numri_kontrates,klient_id',
                'fature.kontrate.klient:klient_id,emri,mbiemri',
            ]),
            201
        );
    }

    public function show($id)
    {
        return response()->json(
            Pagese::with([
                'fature:fature_id,kontrate_id,periudha,totali,statusi',
                'fature.kontrate:kontrate_id,numri_kontrates,klient_id',
                'fature.kontrate.klient:klient_id,emri,mbiemri',
            ])->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $pagese = Pagese::findOrFail($id);

        $validated = $request->validate([
            'fature_id'    => 'sometimes|required|exists:faturat,fature_id',
            'shuma'        => 'sometimes|required|numeric|min:0.01',
            'data_pageses' => 'sometimes|required|date',
            'metoda'       => 'sometimes|required|in:' . implode(',', self::METODAT),
            'referenca'    => 'nullable|string|max:100',
            'shenime'      => 'nullable|string|max:500',
        ]);

        $oldFatureId = $pagese->fature_id;
        $pagese->update($validated);

        // Re-sync both the old and new fature (if fature_id changed)
        $this->syncFatureStatusi($oldFatureId);
        if (isset($validated['fature_id']) && $validated['fature_id'] != $oldFatureId) {
            $this->syncFatureStatusi($validated['fature_id']);
        }

        return response()->json(
            $pagese->load([
                'fature:fature_id,kontrate_id,periudha,totali,statusi',
                'fature.kontrate:kontrate_id,numri_kontrates,klient_id',
                'fature.kontrate.klient:klient_id,emri,mbiemri',
            ])
        );
    }

    public function destroy($id)
    {
        $pagese = Pagese::findOrFail($id);
        $fatureId = $pagese->fature_id;
        $pagese->delete();

        $this->syncFatureStatusi($fatureId);

        return response()->json(['message' => 'Pagesa u fshi me sukses.']);
    }

    /** Dropdown list of unpaid/overdue invoices for the form */
    public function faturatList()
    {
        return response()->json(
            Fature::with(['kontrate:kontrate_id,numri_kontrates,klient_id', 'kontrate.klient:klient_id,emri,mbiemri'])
                ->whereIn('statusi', ['e_papaguar', 'e_vonuar'])
                ->orderBy('fature_id', 'desc')
                ->get()
                ->map(fn($f) => [
                    'fature_id'   => $f->fature_id,
                    'periudha'    => $f->periudha,
                    'totali'      => $f->totali,
                    'statusi'     => $f->statusi,
                    'klient_emri' => $f->kontrate?->klient
                        ? "{$f->kontrate->klient->emri} {$f->kontrate->klient->mbiemri}"
                        : '—',
                    'numri_kontrates' => $f->kontrate?->numri_kontrates ?? '—',
                ])
        );
    }

    /** Auto-sync fature statusi based on total payments made */
    private function syncFatureStatusi(int $fatureId): void
    {
        $fature = Fature::find($fatureId);
        if (!$fature) return;

        // Skip if already annulled
        if ($fature->statusi === 'anulluar') return;

        $totalPaguar = Pagese::where('fature_id', $fatureId)->sum('shuma');

        if ($totalPaguar >= $fature->totali) {
            $fature->update(['statusi' => 'e_paguar', 'data_pageses' => now()->toDateString()]);
        } elseif ($fature->statusi === 'e_paguar') {
            // Payment was removed — revert to unpaid or overdue
            $isPast = $fature->data_leshimit && $fature->data_leshimit->isPast();
            $fature->update(['statusi' => $isPast ? 'e_vonuar' : 'e_papaguar', 'data_pageses' => null]);
        }
    }
}
