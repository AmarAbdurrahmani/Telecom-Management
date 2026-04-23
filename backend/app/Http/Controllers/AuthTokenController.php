<?php

namespace App\Http\Controllers;

use App\Models\AuthToken;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuthTokenController extends Controller
{
    /**
     * POST /klientet/{id}/kerko-tan
     * Agent requests a TAN for a client.
     * Returns the token so the agent can relay it to the client verbally/on-screen.
     * (In production: send via SMS/email to client only, never expose to agent.)
     */
    public function generate(Request $request, $klientId)
    {
        $client = Client::findOrFail($klientId);

        // Invalidate any existing active tokens for this client
        AuthToken::where('klient_id', $klientId)
            ->where('perdorur', false)
            ->where('expires_at', '>', now())
            ->update(['perdorur' => true]);

        // Generate 6-digit numeric TAN
        $token = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        AuthToken::create([
            'klient_id'  => $klientId,
            'token'      => $token,
            'perdorur'   => false,
            'expires_at' => now()->addMinutes(10),
        ]);

        return response()->json([
            'message'    => 'TAN u gjenerua. Jepja kodin klientit.',
            'tan'        => $token,          // Demo: visible to agent
            'skadon_ne'  => '10 minuta',
            'klient'     => $client->emri . ' ' . $client->mbiemri,
        ]);
    }

    /**
     * POST /klientet/{id}/verifiko-tan
     * Agent submits the TAN that the client confirmed.
     */
    public function verify(Request $request, $klientId)
    {
        $request->validate(['token' => 'required|string|size:6']);

        $authToken = AuthToken::where('klient_id', $klientId)
            ->where('token', $request->token)
            ->where('perdorur', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$authToken) {
            return response()->json([
                'valid'   => false,
                'message' => 'TAN-i është i gabuar ose ka skaduar.',
            ], 422);
        }

        $authToken->update(['perdorur' => true]);

        return response()->json([
            'valid'   => true,
            'message' => 'TAN i verifikuar. Qasja u miratua.',
        ]);
    }

    /**
     * GET /klientet/{id}/tan-aktiv
     * Client portal: returns active TAN if any (for client to see their code).
     */
    public function active($klientId)
    {
        $token = AuthToken::where('klient_id', $klientId)
            ->where('perdorur', false)
            ->where('expires_at', '>', now())
            ->latest('token_id')
            ->first();

        if (!$token) {
            return response()->json(['ka_tan' => false]);
        }

        return response()->json([
            'ka_tan'    => true,
            'tan'       => $token->token,
            'skadon_ne' => $token->expires_at->diffForHumans(),
        ]);
    }
}
