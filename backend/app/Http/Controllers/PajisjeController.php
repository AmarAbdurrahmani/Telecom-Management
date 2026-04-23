<?php

namespace App\Http\Controllers;

use App\Models\Pajisje;
use Illuminate\Http\Request;

class PajisjeController extends Controller
{
    public function index(Request $request)
    {
        $query = Pajisje::query();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('emri',  'like', "%$s%")
                  ->orWhere('marka', 'like', "%$s%")
                  ->orWhere('pershkrimi', 'like', "%$s%");
            });
        }

        if ($request->filled('marka')) {
            $query->where('marka', $request->marka);
        }

        if ($request->filled('disponueshme') && $request->disponueshme !== '') {
            $query->where('disponueshme', filter_var($request->disponueshme, FILTER_VALIDATE_BOOLEAN));
        }

        $perPage   = (int) $request->get('per_page', 12);
        $paginator = $query->orderBy('marka')->orderBy('emri')->paginate($perPage);

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
            'emri'          => 'required|string|max:150',
            'marka'         => 'required|string|max:60',
            'cmimi_cash'    => 'required|numeric|min:0',
            'cmimi_keste'   => 'required|numeric|min:0',
            'muajt_kestes'  => 'nullable|integer|min:1|max:60',
            'disponueshme'  => 'boolean',
            'pershkrimi'    => 'nullable|string',
        ]);

        $validated['muajt_kestes'] = $validated['muajt_kestes'] ?? 24;

        return response()->json(Pajisje::create($validated), 201);
    }

    public function show($id)
    {
        return response()->json(Pajisje::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $pajisje   = Pajisje::findOrFail($id);

        $validated = $request->validate([
            'emri'         => 'sometimes|required|string|max:150',
            'marka'        => 'sometimes|required|string|max:60',
            'cmimi_cash'   => 'sometimes|required|numeric|min:0',
            'cmimi_keste'  => 'sometimes|required|numeric|min:0',
            'muajt_kestes' => 'nullable|integer|min:1|max:60',
            'disponueshme' => 'boolean',
            'pershkrimi'   => 'nullable|string',
        ]);

        $pajisje->update($validated);

        return response()->json($pajisje);
    }

    public function destroy($id)
    {
        Pajisje::findOrFail($id)->delete();
        return response()->json(['message' => 'Pajisja u fshi me sukses.']);
    }

    /** Dropdown list for contract form */
    public function listAktive()
    {
        return response()->json(
            Pajisje::where('disponueshme', true)
                ->orderBy('marka')->orderBy('emri')
                ->get(['pajisje_id', 'emri', 'marka', 'cmimi_cash', 'cmimi_keste', 'muajt_kestes'])
        );
    }
}
