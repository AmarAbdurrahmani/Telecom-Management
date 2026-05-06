<?php

namespace App\Http\Controllers;

use App\Models\ChatbotSession;
use App\Models\Paket;
use App\Models\SherbimShtese;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIChatbotController extends Controller
{
    private const MAX_TOKENS = 1024;
    private const API_URL    = 'https://api.groq.com/openai/v1/chat/completions';

    // ─── Main endpoint ────────────────────────────────────────────────────────
    public function chat(Request $request)
    {
        $request->validate([
            'message'       => 'required|string|max:2000',
            'session_token' => 'nullable|string|max:64',
        ]);

        $apiKey = config('services.groq.key');
        if (! $apiKey) {
            return response()->json([
                'reply'         => 'Shërbimi AI nuk është konfiguruar ende. Ju lutemi kontaktoni mbështetjen.',
                'session_token' => $request->session_token ?? ChatbotSession::generateToken(),
            ]);
        }

        // Get or create session -----------------------------------------------
        $token   = $request->session_token ?? ChatbotSession::generateToken();
        $userId  = optional($request->user())->id;
        $session = ChatbotSession::findOrCreate($token, $userId);

        // Build system prompt from live DB data --------------------------------
        $systemPrompt = $this->buildSystemPrompt($request->user());

        // Add the new user message to history ---------------------------------
        $session->appendMessage('user', $request->message);

        // Call Groq API -------------------------------------------------------
        $reply = $this->callGroq($systemPrompt, $session->messages);

        // Save AI reply -------------------------------------------------------
        $session->appendMessage('assistant', $reply);

        return response()->json([
            'reply'         => $reply,
            'session_token' => $token,
        ]);
    }

    // ─── Reset session ────────────────────────────────────────────────────────
    public function reset(Request $request)
    {
        $request->validate(['session_token' => 'required|string|max:64']);
        ChatbotSession::where('session_token', $request->session_token)->delete();
        return response()->json(['session_token' => ChatbotSession::generateToken()]);
    }

    // ─── Build system prompt with live DB context ─────────────────────────────
    private function buildSystemPrompt(?object $user): string
    {
        $packages = Paket::where('aktive', true)->get();
        $services = SherbimShtese::where('aktiv', true)->get();

        $packagesText = $packages->map(function ($p) {
            $details = [];
            if ($p->shpejtesia_mb) $details[] = "{$p->shpejtesia_mb} Mbps internet";
            if ($p->minuta)        $details[] = "{$p->minuta} min bisedë";
            if ($p->data_gb)       $details[] = "{$p->data_gb} GB të dhëna";
            if ($p->sms)           $details[] = "{$p->sms} SMS";
            $detail = $details ? ' (' . implode(', ', $details) . ')' : '';
            return "• {$p->emri_paketes}{$detail}: {$p->cmimi_mujor}€/muaj — {$p->pershkrimi}";
        })->join("\n");

        $servicesText = $services->map(function ($s) {
            return "• {$s->emri_sherbimit}: {$s->cmimi_mujor}€/muaj — {$s->pershkrimi}";
        })->join("\n");

        $clientInfo = '';
        if ($user && $user->roli === 'klient') {
            $klient = $user->klient()->with(['kontratat.paket'])->first();
            if ($klient) {
                $clientInfo  = "\n\n=== KLIENTI AKTUAL ===\n";
                $clientInfo .= "Emri: {$klient->emri} {$klient->mbiemri}\n";
                $clientInfo .= "Email: {$klient->email}\n";
                foreach ($klient->kontratat as $k) {
                    $clientInfo .= "Kontrata: {$k->paket->emri_paketes} (statusi: {$k->statusi}), skadon: {$k->data_mbarimit}\n";
                }
            }
        }

        return <<<PROMPT
Ti je Asistenti Virtual i TelekomiYt, kompanisë kryesore të telekomunikacionit në Kosovë. Ndihmo klientët me pyetje rreth paketave, shërbimeve, faturave dhe çështjeve teknike.

=== RREGULLAT ===
- Gjithmonë fol SHQIP. Asnjëherë mos përdor gjuhë tjetër.
- Ji miqësor, i shkurtër dhe i saktë.
- Jep çmimin e saktë nga lista e mëposhtme kur dikush pyet.
- Për çështje specifike të llogarisë (fatura, ndërprerje), drejtoje te: support@telekomyt.com ose 038-XXX-XXX.
- Mos premto asgjë që nuk është e listuar.
- Nëse nuk di, thuaj sinqerisht dhe ofroj ndihmë alternative.

=== PAKETAT AKTIVE ===
{$packagesText}

=== SHËRBIMET SHTESË ===
{$servicesText}
{$clientInfo}
=== INFO ===
TelekomiYt operon në të gjithë Kosovën. Mbështetja: 24/7.
PROMPT;
    }

    // ─── HTTP call to Groq API ────────────────────────────────────────────────
    private function callGroq(string $system, array $storedMessages): string
    {
        $messages = [['role' => 'system', 'content' => $system]];

        foreach ($storedMessages as $m) {
            $messages[] = ['role' => $m['role'], 'content' => $m['content']];
        }

        $payload = [
            'model'       => config('services.groq.model', 'llama-3.3-70b-versatile'),
            'messages'    => $messages,
            'max_tokens'  => self::MAX_TOKENS,
            'temperature' => 0.7,
        ];

        try {
            $response = Http::timeout(30)
                ->withToken(config('services.groq.key'))
                ->post(self::API_URL, $payload);

            if ($response->failed()) {
                \Log::error('Groq API error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return 'Na vjen keq, ndodhi një gabim. Provoni sërish ose kontaktoni mbështetjen.';
            }

            return $response->json('choices.0.message.content')
                ?? 'Na vjen keq, nuk mora përgjigje nga AI. Provoni sërish.';

        } catch (\Exception $e) {
            \Log::error('Groq exception: ' . $e->getMessage());
            return 'Lidhja me asistentin AI dështoi. Kontrolloni lidhjen dhe provoni sërish.';
        }
    }
}
