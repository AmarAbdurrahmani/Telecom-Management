<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * POST /api/auth/login
     * Returns: { data: { access_token, user } }
     * Also sets an HTTP-Only cookie with the token for silent refresh.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email ose fjalëkalimi është i gabuar.'], 401);
        }

        if (! $user->aktiv) {
            return response()->json(['message' => 'Llogaria juaj është çaktivizuar.'], 403);
        }

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Revoke old tokens to keep DB clean (optional but good practice)
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = response()->json([
            'data' => [
                'access_token' => $token,
                'user'         => $user->makeHidden(['password', 'remember_token']),
            ],
        ]);

        // HTTP-Only cookie used for silent refresh on page reload
        return $response->cookie(
            'refresh_token',
            $token,
            60 * 24 * 30, // 30 days in minutes
            '/',
            null,
            false, // secure — set to true in production (HTTPS)
            true,  // httpOnly
            false,
            'lax'
        );
    }

    /**
     * POST /api/auth/refresh
     * Reads the HTTP-Only cookie and returns a fresh token response.
     */
    public function refresh(Request $request)
    {
        $cookieToken = $request->cookie('refresh_token');

        if (! $cookieToken) {
            return response()->json(['message' => 'Pa autentifikim.'], 401);
        }

        // Find the token in the database
        $tokenHash = hash('sha256', $cookieToken);
        $pat = \Laravel\Sanctum\PersonalAccessToken::where('token', $tokenHash)->first();

        if (! $pat) {
            return response()->json(['message' => 'Token i pavlefshëm.'], 401);
        }

        $user = $pat->tokenable;

        if (! $user || ! $user->aktiv) {
            return response()->json(['message' => 'Pa autentifikim.'], 401);
        }

        // Issue a fresh token
        $pat->delete();
        $newToken = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'data' => [
                'access_token' => $newToken,
                'user'         => $user->makeHidden(['password', 'remember_token']),
            ],
        ])->cookie('refresh_token', $newToken, 60 * 24 * 30, '/', null, false, true, false, 'lax');
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request)
    {
        $request->user()?->tokens()->delete();

        return response()->json(['message' => 'U çkyçët me sukses.'])
            ->withoutCookie('refresh_token');
    }

    /**
     * GET /api/auth/me
     */
    public function me(Request $request)
    {
        return response()->json($request->user()->makeHidden(['password', 'remember_token']));
    }

    /**
     * GET /api/auth/portal  — used by klient role to get their own data
     * Returns the client record linked to the logged-in user.
     */
    public function portal(Request $request)
    {
        $user = $request->user();
        $klient = $user->klient()->with([
            'kontratat.paket',
            'kontratat.sherbimetShtesa',
            'kontratat.numratTelefonit',
            'kontratat.faturat',
        ])->first();

        if (! $klient) {
            return response()->json(['message' => 'Profili i klientit nuk u gjet.'], 404);
        }

        $kontratat = $klient->kontratat;

        $totalFatura  = 0;
        $totalPaguar  = 0;
        $totalBorxh   = 0;

        foreach ($kontratat as $k) {
            foreach ($k->faturat as $f) {
                $totalFatura += $f->totali;
                if ($f->statusi === 'e_paguar') {
                    $totalPaguar += $f->totali;
                } else {
                    $totalBorxh += $f->totali;
                }
            }
        }

        return response()->json([
            'klient'   => $klient,
            'kontratat' => $kontratat,
            'summary'  => [
                'total_kontrata'    => $kontratat->count(),
                'kontrata_aktive'   => $kontratat->where('statusi', 'aktive')->count(),
                'total_borxh'       => $totalBorxh,
                'total_paguar'      => $totalPaguar,
                'total_fatura'      => $totalFatura,
            ],
        ]);
    }
}
