<?php

namespace App\Http\Controllers;

use App\Mail\ContractApprovedMail;
use App\Models\Kontrate;
use App\Models\Client;
use App\Models\Paket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class KontratController extends Controller
{
    public function index(Request $request)
    {
        $query = Kontrate::with(['klient', 'paket', 'pajisje']);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('numri_kontrates', 'like', "%$s%")
                  ->orWhereHas('klient', fn($k) =>
                      $k->where('emri', 'like', "%$s%")
                        ->orWhere('mbiemri', 'like', "%$s%")
                        ->orWhere('email', 'like', "%$s%")
                  );
            });
        }

        if ($request->filled('statusi')) {
            $query->where('statusi', $request->statusi);
        }

        if ($request->filled('klient_id')) {
            $query->where('klient_id', $request->klient_id);
        }

        if ($request->filled('paket_id')) {
            $query->where('paket_id', $request->paket_id);
        }

        $perPage   = (int) $request->get('per_page', 12);
        $paginator = $query->orderBy('kontrate_id', 'desc')->paginate($perPage);

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
            'numri_kontrates'   => 'required|string|max:50|unique:kontratat,numri_kontrates',
            'klient_id'         => 'required|exists:clients,klient_id',
            'paket_id'          => 'required|exists:paketat,paket_id',
            'pajisje_id'        => 'nullable|exists:pajisjet,pajisje_id',
            'zbritja_perqindje' => 'nullable|integer|min:0|max:100',
            'kodi_promo'        => 'nullable|string|max:50',
            'data_fillimit'     => 'required|date',
            'data_mbarimit'     => 'nullable|date|after:data_fillimit',
            'statusi'           => 'required|in:aktive,e_skaduar,anulluar',
        ]);

        $kontrate = Kontrate::create($validated);
        $kontrate->load(['klient', 'paket', 'pajisje']);

        if ($validated['statusi'] === 'aktive' && $kontrate->klient?->email) {
            Mail::to($kontrate->klient->email)->send(new ContractApprovedMail($kontrate));
        }

        return response()->json($kontrate, 201);
    }

    public function show($id)
    {
        return response()->json(
            Kontrate::with(['klient', 'paket'])->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $kontrate = Kontrate::findOrFail($id);

        $validated = $request->validate([
            'numri_kontrates'   => 'sometimes|required|string|max:50|unique:kontratat,numri_kontrates,' . $id . ',kontrate_id',
            'klient_id'         => 'sometimes|required|exists:clients,klient_id',
            'paket_id'          => 'sometimes|required|exists:paketat,paket_id',
            'pajisje_id'        => 'nullable|exists:pajisjet,pajisje_id',
            'zbritja_perqindje' => 'nullable|integer|min:0|max:100',
            'kodi_promo'        => 'nullable|string|max:50',
            'data_fillimit'     => 'sometimes|required|date',
            'data_mbarimit'     => 'nullable|date|after:data_fillimit',
            'statusi'           => 'sometimes|required|in:aktive,e_skaduar,anulluar',
        ]);

        $oldStatus = $kontrate->statusi;
        $kontrate->update($validated);
        $kontrate->load(['klient', 'paket', 'pajisje']);

        if (
            isset($validated['statusi']) &&
            $validated['statusi'] === 'aktive' &&
            $oldStatus !== 'aktive' &&
            $kontrate->klient?->email
        ) {
            Mail::to($kontrate->klient->email)->send(new ContractApprovedMail($kontrate));
        }

        return response()->json($kontrate);
    }

    public function destroy($id)
    {
        Kontrate::findOrFail($id)->delete();
        return response()->json(['message' => 'Kontrata u fshi me sukses.']);
    }

    // Return minimal lists for dropdowns (no pagination needed)
    public function klientetList()
    {
        return response()->json(
            Client::select('klient_id', 'emri', 'mbiemri', 'email')
                  ->orderBy('emri')
                  ->get()
        );
    }

    public function paketaList()
    {
        return response()->json(
            Paket::select('paket_id', 'emri_paketes', 'cmimi_mujor', 'lloji_sherbimit')
                 ->where('aktive', true)
                 ->orderBy('emri_paketes')
                 ->get()
        );
    }

    public function renew(Request $request, $id) {
        $kontrate = Kontrate::with(['klient', 'paket'])->findOrFail($id);

        if ($kontrate->statusi === 'anulluar') {
            return response()->json(['message' => 'Kontrata e anulluar nuk mund të rinovohet.'], 422);
        }

        $validated = $request->validate([
            'muajt' => 'required|in:12,24',
        ]);

        $muajt = (int)$validated['muajt'];
        $today = now()->startOfDay();

        // New end date: from today or current end (whichever is later) + months
        $base = ($kontrate->data_mbarimit && $kontrate->data_mbarimit->gt($today))
            ? $kontrate->data_mbarimit
            : $today;

        $newEnd = $base->copy()->addMonths($muajt);

        // Penalty for early renewal if >30 days remain
        $ditetMbetur = $today->diffInDays($kontrate->data_mbarimit, false);
        $penaliteti = 0;
        if ($ditetMbetur > 30) {
            $penaliteti = round($ditetMbetur / 30 * ($kontrate->paket->cmimi_mujor ?? 0) * 0.1, 2);
        }

        $oldStatus = $kontrate->statusi;

        // Update contract
        $kontrate->update([
            'data_mbarimit' => $newEnd,
            'statusi'       => 'aktive',
            'auto_renew'    => true,
            'renewal_months'=> $muajt,
            'renewed_at'    => now(),
            'renewed_by'    => auth()->id(),
        ]);

        if ($oldStatus !== 'aktive' && $kontrate->klient?->email) {
            Mail::to($kontrate->klient->email)->send(new ContractApprovedMail($kontrate->fresh(['klient','paket'])));
        }

        // Generate renewal invoice
        $periudha = $today->format('M Y') . ' – ' . $newEnd->format('M Y');
        $total = ($kontrate->paket->cmimi_mujor ?? 0) * $muajt + $penaliteti;

        $fature = \App\Models\Fature::create([
            'kontrate_id'    => $kontrate->kontrate_id,
            'periudha'       => "Rinovim {$muajt}M: {$periudha}",
            'shuma_baze'     => round(($kontrate->paket->cmimi_mujor ?? 0) * $muajt, 2),
            'shuma_shtese'   => round($penaliteti, 2),
            'tatimi'         => 0,
            'totali'         => round($total, 2),
            'statusi'        => 'e_papaguar',
            'data_leshimit'  => today(),
            'data_pageses'   => null,
        ]);

        return response()->json([
            'kontrate'  => $kontrate->fresh(['klient','paket']),
            'fature'    => $fature,
            'penaliteti'=> $penaliteti,
            'new_end'   => $newEnd->format('Y-m-d'),
        ]);
    }

    /**
     * GET /kontratat-skaduese
     * Contracts expiring within 90 days — for lifecycle panel.
     */
    public function skaduese()
    {
        $kontratat = Kontrate::with(['klient', 'paket', 'pajisje'])
            ->where('statusi', 'aktive')
            ->whereNotNull('data_mbarimit')
            ->whereBetween('data_mbarimit', [now(), now()->addDays(90)])
            ->orderBy('data_mbarimit')
            ->get()
            ->map(function ($k) {
                $ditetMbetur = now()->diffInDays($k->data_mbarimit);
                $cmimi_paket = (float) ($k->paket?->cmimi_mujor ?? 0);
                $cmimi_pajisje = (float) ($k->pajisje?->cmimi_keste ?? 0);
                $muajt_mbetur = ceil($ditetMbetur / 30);
                return [
                    'kontrate_id'     => $k->kontrate_id,
                    'numri_kontrates' => $k->numri_kontrates,
                    'klient'          => $k->klient ? ['klient_id' => $k->klient->klient_id, 'emri' => $k->klient->emri, 'mbiemri' => $k->klient->mbiemri, 'email' => $k->klient->email] : null,
                    'paket'           => $k->paket ? ['emri_paketes' => $k->paket->emri_paketes, 'cmimi_mujor' => $cmimi_paket] : null,
                    'pajisje'         => $k->pajisje ? ['emri' => $k->pajisje->emri, 'cmimi_keste' => $cmimi_pajisje] : null,
                    'data_mbarimit'   => $k->data_mbarimit,
                    'ditet_mbetur'    => $ditetMbetur,
                    'penaliteti'      => round($muajt_mbetur * ($cmimi_paket + $cmimi_pajisje), 2),
                ];
            });

        return response()->json($kontratat);
    }
}
