<?php

namespace App\Http\Controllers;

use App\Helpers\HistoryLogger;
use App\Models\Client;
use App\Models\Fature;
use App\Models\Kontrate;
use Illuminate\Http\Request;

class FatureController extends Controller
{
    public function index(Request $request)
    {
        $query = Fature::with([
            'kontrate.klient',
            'kontrate.paket',
        ]);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('periudha', 'like', "%$s%")
                  ->orWhereHas('kontrate', fn($k) =>
                      $k->where('numri_kontrates', 'like', "%$s%")
                        ->orWhereHas('klient', fn($kl) =>
                            $kl->where('emri',    'like', "%$s%")
                               ->orWhere('mbiemri', 'like', "%$s%")
                        )
                  );
            });
        }

        if ($request->filled('statusi')) {
            $query->where('statusi', $request->statusi);
        }

        if ($request->filled('kontrate_id')) {
            $query->where('kontrate_id', $request->kontrate_id);
        }

        $perPage   = (int) $request->get('per_page', 12);
        $paginator = $query->orderBy('fature_id', 'desc')->paginate($perPage);

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
            'kontrate_id'  => 'required|exists:kontratat,kontrate_id',
            'periudha'     => 'required|string|max:50',
            'shuma_baze'   => 'required|numeric|min:0',
            'shuma_shtese' => 'nullable|numeric|min:0',
            'tatimi'       => 'nullable|numeric|min:0',
            'totali'       => 'required|numeric|min:0',
            'data_leshimit'=> 'required|date',
            'data_pageses' => 'nullable|date',
            'statusi'      => 'required|in:e_papaguar,e_paguar,e_vonuar,anulluar',
        ]);

        $validated['shuma_shtese'] = $validated['shuma_shtese'] ?? 0;
        $validated['tatimi']       = $validated['tatimi']       ?? 0;

        $fature = Fature::create($validated);
        $fature->load(['kontrate.klient', 'kontrate.paket']);

        return response()->json($fature, 201);
    }

    public function show($hash)
    {
        $id = is_numeric($hash) ? (int)$hash : (Fature::decodeHashId($hash) ?? abort(404));
        return response()->json(
            Fature::with(['kontrate.klient', 'kontrate.paket'])->findOrFail($id)
        );
    }

    public function update(Request $request, $hash)
    {
        $id     = is_numeric($hash) ? (int)$hash : (Fature::decodeHashId($hash) ?? abort(404));
        $fature = Fature::findOrFail($id);

        $validated = $request->validate([
            'kontrate_id'  => 'sometimes|required|exists:kontratat,kontrate_id',
            'periudha'     => 'sometimes|required|string|max:50',
            'shuma_baze'   => 'sometimes|required|numeric|min:0',
            'shuma_shtese' => 'nullable|numeric|min:0',
            'tatimi'       => 'nullable|numeric|min:0',
            'totali'       => 'sometimes|required|numeric|min:0',
            'data_leshimit'=> 'sometimes|required|date',
            'data_pageses' => 'nullable|date',
            'statusi'      => 'sometimes|required|in:e_papaguar,e_paguar,e_vonuar,anulluar',
        ]);

        $fature->update($validated);
        $fature->load(['kontrate.klient', 'kontrate.paket']);

        return response()->json($fature);
    }

    public function destroy($hash)
    {
        $id = is_numeric($hash) ? (int)$hash : (Fature::decodeHashId($hash) ?? abort(404));
        Fature::findOrFail($id)->delete();
        return response()->json(['message' => 'Fatura u fshi me sukses.']);
    }

    /**
     * POST /klientet/{id}/gjenero-fature
     * Generate invoices for all active contracts of a client for a given month/year.
     */
    public function generate(Request $request, $klientHash)
    {
        $klientId = Client::decodeHashId($klientHash) ?? abort(404);
        $client   = Client::with([
            'kontratat' => fn($q) => $q->where('statusi', 'aktive')
                ->with(['paket', 'sherbimetShtesa']),
        ])->findOrFail($klientId);

        $request->validate([
            'muaji'          => 'required|integer|min:1|max:12',
            'viti'           => 'required|integer|min:2020|max:2099',
            'tvsh_perqindja' => 'nullable|numeric|min:0|max:100',
        ]);

        $muaji  = (int) $request->muaji;
        $viti   = (int) $request->viti;
        $tvsh   = (float) ($request->tvsh_perqindja ?? 18);

        $muajat_shqip = [
            1 => 'Janar', 2 => 'Shkurt', 3 => 'Mars',    4 => 'Prill',
            5 => 'Maj',   6 => 'Qershor',7 => 'Korrik', 8 => 'Gusht',
            9 => 'Shtator',10 => 'Tetor',11 => 'Nëntor',12 => 'Dhjetor',
        ];
        $periudha = $muajat_shqip[$muaji] . ' ' . $viti;

        $kontratat   = $client->kontratat;
        $te_gjenuara = [];
        $ekzistuese  = [];

        foreach ($kontratat as $kontrate) {
            // Skip if invoice already exists for this period + contract
            $exists = Fature::where('kontrate_id', $kontrate->kontrate_id)
                ->where('periudha', $periudha)
                ->exists();

            if ($exists) {
                $ekzistuese[] = $kontrate->numri_kontrates;
                continue;
            }

            $shuma_baze   = (float) $kontrate->paket->cmimi_mujor;
            $shuma_shtese = $kontrate->sherbimetShtesa->sum('cmimi_mujor');
            $tatimi       = round(($shuma_baze + $shuma_shtese) * $tvsh / 100, 2);
            $totali       = round($shuma_baze + $shuma_shtese + $tatimi, 2);

            $fature = Fature::create([
                'kontrate_id'  => $kontrate->kontrate_id,
                'periudha'     => $periudha,
                'shuma_baze'   => $shuma_baze,
                'shuma_shtese' => $shuma_shtese,
                'tatimi'       => $tatimi,
                'totali'       => $totali,
                'data_leshimit'=> now()->toDateString(),
                'statusi'      => 'e_papaguar',
            ]);
            $te_gjenuara[] = $fature;
        }

        if (count($te_gjenuara) > 0) {
            $shumaTotal = collect($te_gjenuara)->sum('totali');
            HistoryLogger::log(
                $klientId,
                'fature_gjeneruar',
                "U gjeneruan " . count($te_gjenuara) . " faturë(a) për periudhën {$periudha}. Totali: " . number_format($shumaTotal, 2) . "€.",
                $shumaTotal,
                'portal',
                ['periudha' => $periudha, 'nr_faturave' => count($te_gjenuara)]
            );
        }

        return response()->json([
            'te_gjenuara' => $te_gjenuara,
            'ekzistuese'  => $ekzistuese,
            'mesazh'      => count($te_gjenuara) > 0
                ? count($te_gjenuara) . ' faturë(a) u gjeneruan me sukses për ' . $periudha . '.'
                : 'Të gjitha faturat ekzistojnë tashmë për ' . $periudha . '.',
        ]);
    }

    // Dropdown list of active contracts for the form
    public function kontratatList()
    {
        return response()->json(
            Kontrate::with(['klient', 'paket'])
                ->where('statusi', 'aktive')
                ->orderBy('numri_kontrates')
                ->get()
                ->map(fn($k) => [
                    'kontrate_id'     => $k->kontrate_id,
                    'numri_kontrates' => $k->numri_kontrates,
                    'klient_emri'     => $k->klient ? "{$k->klient->emri} {$k->klient->mbiemri}" : '—',
                    'paket_emri'      => $k->paket?->emri_paketes ?? '—',
                    'cmimi_mujor'     => $k->paket?->cmimi_mujor  ?? 0,
                ])
        );
    }
}
