<?php

namespace App\Http\Controllers;

use App\Models\NumriTelefonit;
use App\Models\Kontrate;
use Illuminate\Http\Request;

class NumriTelefonitController extends Controller
{
    public function index(Request $request)
    {
        $query = NumriTelefonit::with(['kontrate.klient']);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('numri_telefonit', 'like', "%$s%")
                  ->orWhereHas('kontrate.klient', fn($k) =>
                      $k->where('emri',    'like', "%$s%")
                        ->orWhere('mbiemri', 'like', "%$s%")
                  );
            });
        }

        if ($request->filled('statusi')) {
            $query->where('statusi', $request->statusi);
        }

        if ($request->filled('lloji')) {
            $query->where('lloji', $request->lloji);
        }

        $perPage   = (int) $request->get('per_page', 12);
        $paginator = $query->orderBy('numri_id', 'desc')->paginate($perPage);

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
            'kontrate_id'      => 'nullable|exists:kontratat,kontrate_id',
            'numri_telefonit'  => 'required|string|max:20|unique:numrat_telefonit,numri_telefonit',
            'statusi'          => 'required|in:aktiv,joaktiv,i_rezervuar,i_portuar',
            'data_aktivizimit' => 'nullable|date',
            'lloji'            => 'required|in:prepaid,postpaid,biznes',
        ]);

        $numri = NumriTelefonit::create($validated);
        $numri->load(['kontrate.klient']);

        return response()->json($numri, 201);
    }

    public function show($id)
    {
        return response()->json(
            NumriTelefonit::with(['kontrate.klient'])->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $numri = NumriTelefonit::findOrFail($id);

        $validated = $request->validate([
            'kontrate_id'      => 'nullable|exists:kontratat,kontrate_id',
            'numri_telefonit'  => 'sometimes|required|string|max:20|unique:numrat_telefonit,numri_telefonit,' . $id . ',numri_id',
            'statusi'          => 'sometimes|required|in:aktiv,joaktiv,i_rezervuar,i_portuar',
            'data_aktivizimit' => 'nullable|date',
            'lloji'            => 'sometimes|required|in:prepaid,postpaid,biznes',
        ]);

        $numri->update($validated);
        $numri->load(['kontrate.klient']);

        return response()->json($numri);
    }

    public function destroy($id)
    {
        NumriTelefonit::findOrFail($id)->delete();
        return response()->json(['message' => 'Numri u fshi me sukses.']);
    }

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
}
