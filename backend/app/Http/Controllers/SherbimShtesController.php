<?php

namespace App\Http\Controllers;

use App\Models\SherbimShtese;
use App\Models\Kontrate;
use Illuminate\Http\Request;

class SherbimShtesController extends Controller
{
    // ---------------------------------------------------------------
    // CRUD për Shërbimet Shtesë
    // ---------------------------------------------------------------

    public function index(Request $request)
    {
        $query = SherbimShtese::withCount('kontratat');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('emri_sherbimit', 'like', "%$s%")
                  ->orWhere('pershkrimi',   'like', "%$s%");
            });
        }

        if ($request->filled('aktiv') && $request->aktiv !== '') {
            $query->where('aktiv', filter_var($request->aktiv, FILTER_VALIDATE_BOOLEAN));
        }

        $perPage   = (int) $request->get('per_page', 12);
        $paginator = $query->orderBy('sherbim_id', 'desc')->paginate($perPage);

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
            'emri_sherbimit' => 'required|string|max:150',
            'pershkrimi'     => 'nullable|string',
            'cmimi_mujor'    => 'required|numeric|min:0',
            'aktiv'          => 'boolean',
        ]);

        $sherbim = SherbimShtese::create($validated);

        return response()->json($sherbim->loadCount('kontratat'), 201);
    }

    public function show($id)
    {
        return response()->json(
            SherbimShtese::withCount('kontratat')
                ->with(['kontratat.klient'])
                ->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $sherbim = SherbimShtese::findOrFail($id);

        $validated = $request->validate([
            'emri_sherbimit' => 'sometimes|required|string|max:150',
            'pershkrimi'     => 'nullable|string',
            'cmimi_mujor'    => 'sometimes|required|numeric|min:0',
            'aktiv'          => 'boolean',
        ]);

        $sherbim->update($validated);

        return response()->json($sherbim->loadCount('kontratat'));
    }

    public function destroy($id)
    {
        SherbimShtese::findOrFail($id)->delete();
        return response()->json(['message' => 'Shërbimi u fshi me sukses.']);
    }

    // ---------------------------------------------------------------
    // N:M — cakto / hiq shërbime nga një kontratë
    // ---------------------------------------------------------------

    public function kontratatList()
    {
        return response()->json(
            Kontrate::with('klient')
                ->where('statusi', 'aktive')
                ->orderBy('numri_kontrates')
                ->get()
                ->map(fn($k) => [
                    'kontrate_id'     => $k->kontrate_id,
                    'numri_kontrates' => $k->numri_kontrates,
                    'klient_emri'     => $k->klient ? "{$k->klient->emri} {$k->klient->mbiemri}" : '—',
                ])
        );
    }

    // GET /sherbimet-shtesa/{id}/kontratat  — kontratat që e kanë këtë shërbim
    public function sherbimKontratat($id)
    {
        $sherbim = SherbimShtese::with('kontratat.klient')->findOrFail($id);
        return response()->json($sherbim->kontratat);
    }

    // POST /sherbimet-shtesa/{id}/sync  — body: { kontrate_ids: [1,2,3] }
    public function syncKontratat(Request $request, $id)
    {
        $request->validate([
            'kontrate_ids'   => 'required|array',
            'kontrate_ids.*' => 'exists:kontratat,kontrate_id',
        ]);

        $sherbim = SherbimShtese::findOrFail($id);
        $sherbim->kontratat()->sync($request->kontrate_ids);

        return response()->json(['message' => 'Kontratat u sinkronizuan me sukses.']);
    }

    // POST /kontratat/{kontrate_id}/sherbimet  — body: { sherbim_ids: [1,2] }
    public function syncSherbimetForKontrate(Request $request, $kontrate_id)
    {
        $request->validate([
            'sherbim_ids'   => 'required|array',
            'sherbim_ids.*' => 'exists:sherbimet_shtesa,sherbim_id',
        ]);

        $kontrate = Kontrate::findOrFail($kontrate_id);
        $kontrate->sherbimetShtesa()->sync($request->sherbim_ids);

        return response()->json(['message' => 'Shërbimet u sinkronizuan me sukses.']);
    }
}
