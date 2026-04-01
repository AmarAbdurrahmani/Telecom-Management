<?php

namespace App\Http\Controllers;

use App\Helpers\HistoryLogger;
use App\Models\Client;
use App\Models\NumriTelefonit;
use App\Models\SimKartela;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SimKartelaController extends Controller
{
    /** GET /klientet/{id}/sim-kartela */
    public function indexByKlient($id)
    {
        Client::findOrFail($id);

        $sims = SimKartela::where('klient_id', $id)
            ->with('numriTelefonit:numri_id,numri_telefonit')
            ->orderByDesc('sim_id')
            ->get();

        return response()->json($sims);
    }

    /** GET /sim-kartela */
    public function index(Request $request)
    {
        $query = SimKartela::with(['klient', 'numriTelefonit:numri_id,numri_telefonit']);

        if ($request->filled('klient_id')) {
            $query->where('klient_id', $request->klient_id);
        }
        if ($request->filled('statusi')) {
            $query->where('statusi', $request->statusi);
        }
        if ($request->filled('tip')) {
            $query->where('tip', $request->tip);
        }

        return response()->json($query->orderByDesc('sim_id')->get());
    }

    /** POST /klientet/{id}/sim-kartela */
    public function store(Request $request, $id)
    {
        $client = Client::findOrFail($id);

        $validated = $request->validate([
            'numri_id'      => 'nullable|exists:numrat_telefonit,numri_id',
            'nr_karteles'   => 'required|string|max:25|unique:sim_kartela,nr_karteles',
            'pin'           => 'nullable|string|max:10',
            'puk'           => 'nullable|string|max:10',
            'tip'           => 'required|in:sim,esim',
            'statusi'       => 'required|in:aktive,joaktive,bllokuar,e_zvendesuar',
            'data_leshimit' => 'nullable|date',
            'koment'        => 'nullable|string|max:500',
        ]);

        $validated['klient_id'] = $id;
        $sim = SimKartela::create($validated);

        // Count how many SIMs this client has (including the new one)
        $simCount = SimKartela::where('klient_id', $id)->count();
        $eshte_falas = $simCount === 1;
        $kostoja     = $eshte_falas ? 0 : 5.00;

        $tipLabel = $validated['tip'] === 'esim' ? 'eSIM' : 'SIM Kartelë';
        $ordinal  = $simCount === 1 ? 'parë' : "{$simCount}-të";
        $kostoCopy = $eshte_falas ? 'Falas.' : "Kosto: {$kostoja}€.";
        HistoryLogger::log(
            $id,
            'sim_kartele',
            "{$tipLabel} e {$ordinal} u lëshua. Nr: {$sim->nr_karteles}. {$kostoCopy}",
            $kostoja > 0 ? $kostoja : null,
            'portal',
            ['sim_id' => $sim->sim_id, 'tip' => $sim->tip, 'nr_karteles' => $sim->nr_karteles]
        );

        return response()->json($sim->load('numriTelefonit:numri_id,numri_telefonit'), 201);
    }

    /** PUT /sim-kartela/{id} */
    public function update(Request $request, $id)
    {
        $sim = SimKartela::findOrFail($id);

        $validated = $request->validate([
            'numri_id'      => 'nullable|exists:numrat_telefonit,numri_id',
            'nr_karteles'   => 'sometimes|required|string|max:25|unique:sim_kartela,nr_karteles,' . $id . ',sim_id',
            'pin'           => 'nullable|string|max:10',
            'puk'           => 'nullable|string|max:10',
            'tip'           => 'sometimes|required|in:sim,esim',
            'statusi'       => 'sometimes|required|in:aktive,joaktive,bllokuar,e_zvendesuar',
            'data_leshimit' => 'nullable|date',
            'koment'        => 'nullable|string|max:500',
        ]);

        $oldStatusi = $sim->statusi;
        $sim->update($validated);

        // Log status change
        if (isset($validated['statusi']) && $validated['statusi'] !== $oldStatusi) {
            $labels = [
                'aktive'        => 'Aktive',
                'joaktive'      => 'Joaktive',
                'bllokuar'      => 'Bllokuar',
                'e_zvendesuar'  => 'E Zëvendësuar',
            ];
            HistoryLogger::log(
                $sim->klient_id,
                'sim_kartele',
                "SIM {$sim->nr_karteles} statusi u ndryshua: {$labels[$oldStatusi]} → {$labels[$validated['statusi']]}.",
                null,
                'portal',
                ['sim_id' => $sim->sim_id]
            );
        }

        return response()->json($sim->load('numriTelefonit:numri_id,numri_telefonit'));
    }

    /** DELETE /sim-kartela/{id} */
    public function destroy($id)
    {
        SimKartela::findOrFail($id)->delete();
        return response()->json(['message' => 'SIM kartela u fshi.']);
    }

    /** GET /klientet/{id}/numrat-per-sim — phone numbers not yet assigned to a SIM */
    public function numratPerSim($klientId)
    {
        // Get numrat belonging to this client's contracts, not already assigned to a SIM
        $assignedNumriIds = SimKartela::where('klient_id', $klientId)
            ->whereNotNull('numri_id')
            ->pluck('numri_id');

        $numrat = NumriTelefonit::whereHas('kontrate', fn($q) => $q->where('klient_id', $klientId))
            ->whereNotIn('numri_id', $assignedNumriIds)
            ->get(['numri_id', 'numri_telefonit', 'statusi']);

        return response()->json($numrat);
    }
}
