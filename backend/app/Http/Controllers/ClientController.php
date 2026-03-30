<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::with('user:id,email,aktiv,last_login_at');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('emri', 'like', "%$s%")
                  ->orWhere('mbiemri', 'like', "%$s%")
                  ->orWhere('email', 'like', "%$s%")
                  ->orWhere('numri_personal', 'like', "%$s%")
                  ->orWhere('telefoni', 'like', "%$s%");
            });
        }

        if ($request->filled('lloji_klientit')) {
            $query->where('lloji_klientit', $request->lloji_klientit);
        }

        if ($request->filled('statusi')) {
            $query->where('statusi', $request->statusi);
        }

        $perPage   = (int) $request->get('per_page', 12);
        $paginator = $query->orderBy('klient_id', 'desc')->paginate($perPage);

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
            'emri'              => 'required|string|max:100',
            'mbiemri'           => 'required|string|max:100',
            'numri_personal'    => 'required|string|max:20|unique:clients,numri_personal',
            'email'             => 'required|email|max:150|unique:clients,email|unique:users,email',
            'telefoni'          => 'required|string|max:20',
            'adresa'            => 'nullable|string|max:255',
            'lloji_klientit'    => 'required|in:individual,biznes,vip',
            'statusi'           => 'required|in:aktiv,pasiv,pezulluar',
            'data_regjistrimit' => 'required|date',
            // Portal account fields
            'password'          => 'nullable|string|min:6',
        ]);

        // Create the portal user account
        $password = $validated['password'] ?? null;
        unset($validated['password']);

        $user = User::create([
            'name'     => $validated['emri'] . ' ' . $validated['mbiemri'],
            'email'    => $validated['email'],
            'password' => Hash::make($password ?? str()->random(16)),
            'roli'     => 'klient',
            'aktiv'    => $password ? true : false, // only active if password was set
        ]);

        $validated['user_id'] = $user->id;
        $client = Client::create($validated);

        return response()->json($client->load('user:id,email,aktiv,last_login_at'), 201);
    }

    public function show($id)
    {
        return response()->json(
            Client::with('user:id,email,aktiv,last_login_at')->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $client = Client::findOrFail($id);

        $validated = $request->validate([
            'emri'              => 'sometimes|required|string|max:100',
            'mbiemri'           => 'sometimes|required|string|max:100',
            'numri_personal'    => 'sometimes|required|string|max:20|unique:clients,numri_personal,' . $id . ',klient_id',
            'email'             => 'sometimes|required|email|max:150|unique:clients,email,' . $id . ',klient_id',
            'telefoni'          => 'sometimes|required|string|max:20',
            'adresa'            => 'nullable|string|max:255',
            'lloji_klientit'    => 'sometimes|required|in:individual,biznes,vip',
            'statusi'           => 'sometimes|required|in:aktiv,pasiv,pezulluar',
            'data_regjistrimit' => 'sometimes|required|date',
            // Portal account
            'password'          => 'nullable|string|min:6',
            'portal_aktiv'      => 'nullable|boolean',
        ]);

        $password    = $validated['password']    ?? null;
        $portalAktiv = $validated['portal_aktiv'] ?? null;
        unset($validated['password'], $validated['portal_aktiv']);

        $client->update($validated);

        // Keep linked user in sync
        if ($client->user_id && $client->user) {
            $userUpdate = [];
            if (isset($validated['email'])) {
                $userUpdate['email'] = $validated['email'];
            }
            if (isset($validated['emri']) || isset($validated['mbiemri'])) {
                $userUpdate['name'] = ($validated['emri'] ?? $client->emri) . ' ' . ($validated['mbiemri'] ?? $client->mbiemri);
            }
            if ($password) {
                $userUpdate['password'] = Hash::make($password);
                $userUpdate['aktiv']    = true;
            }
            if ($portalAktiv !== null) {
                $userUpdate['aktiv'] = $portalAktiv;
            }
            if ($validated['statusi'] ?? null === 'pezulluar') {
                $userUpdate['aktiv'] = false;
            }
            if ($userUpdate) {
                $client->user->update($userUpdate);
            }
        }

        return response()->json($client->load('user:id,email,aktiv,last_login_at'));
    }

    public function destroy($id)
    {
        $client = Client::with('user')->findOrFail($id);
        // Also delete linked user if they have klient role
        if ($client->user && $client->user->roli === 'klient') {
            $client->user->delete();
        }
        $client->delete();
        return response()->json(['message' => 'Klienti u fshi me sukses.']);
    }

    public function detail($id)
    {
        $client = Client::with('user:id,email,aktiv,roli,last_login_at,created_at')->findOrFail($id);

        $kontratat = $client->kontratat()
            ->with(['paket', 'sherbimetShtesa', 'numratTelefonit', 'faturat'])
            ->get();

        $totalFatura = 0;
        $totalPaguar = 0;
        $totalBorxh  = 0;

        foreach ($kontratat as $k) {
            foreach ($k->faturat as $f) {
                $totalFatura += $f->totali;
                if ($f->statusi === 'e_paguar') {
                    $totalPaguar += $f->totali;
                } elseif (in_array($f->statusi, ['e_papaguar', 'e_vonuar'])) {
                    $totalBorxh += $f->totali;
                }
            }
        }

        return response()->json([
            'klient'    => $client,
            'kontratat' => $kontratat,
            'summary'   => [
                'total_kontrata'   => $kontratat->count(),
                'kontrata_aktive'  => $kontratat->where('statusi', 'aktive')->count(),
                'total_numra'      => $kontratat->sum(fn($k) => $k->numratTelefonit->count()),
                'total_fatura'     => round($totalFatura, 2),
                'total_paguar'     => round($totalPaguar, 2),
                'total_borxh'      => round($totalBorxh, 2),
                'sherbimet_shtesa' => $kontratat->flatMap(fn($k) => $k->sherbimetShtesa)->unique('sherbim_id')->count(),
            ],
        ]);
    }
}
