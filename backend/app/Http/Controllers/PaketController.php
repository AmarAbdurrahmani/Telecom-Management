<?php

namespace App\Http\Controllers;

use App\Models\Paket;
use Illuminate\Http\Request;

class PaketController extends Controller
{
    public function index(Request $request)
    {
        $query = Paket::query();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('emri_paketes', 'like', "%$s%")
                  ->orWhere('pershkrimi', 'like', "%$s%");
            });
        }

        if ($request->filled('lloji_sherbimit')) {
            $query->where('lloji_sherbimit', $request->lloji_sherbimit);
        }

        if ($request->filled('aktive') && $request->aktive !== '') {
            $query->where('aktive', filter_var($request->aktive, FILTER_VALIDATE_BOOLEAN));
        }

        $perPage   = (int) $request->get('per_page', 12);
        $paginator = $query->orderBy('paket_id', 'desc')->paginate($perPage);

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
            'emri_paketes'    => 'required|string|max:150',
            'pershkrimi'      => 'nullable|string',
            'cmimi_mujor'     => 'required|numeric|min:0',
            'lloji_sherbimit' => 'required|in:internet,telefoni,tv,combo',
            'shpejtesia_mb'   => 'nullable|integer|min:0',
            'minuta'          => 'nullable|integer|min:0',
            'sms'             => 'nullable|integer|min:0',
            'data_gb'         => 'nullable|numeric|min:0',
            'aktive'          => 'boolean',
        ]);

        $paket = Paket::create($validated);

        return response()->json($paket, 201);
    }

    public function show($id)
    {
        return response()->json(Paket::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $paket = Paket::findOrFail($id);

        $validated = $request->validate([
            'emri_paketes'    => 'sometimes|required|string|max:150',
            'pershkrimi'      => 'nullable|string',
            'cmimi_mujor'     => 'sometimes|required|numeric|min:0',
            'lloji_sherbimit' => 'sometimes|required|in:internet,telefoni,tv,combo',
            'shpejtesia_mb'   => 'nullable|integer|min:0',
            'minuta'          => 'nullable|integer|min:0',
            'sms'             => 'nullable|integer|min:0',
            'data_gb'         => 'nullable|numeric|min:0',
            'aktive'          => 'boolean',
        ]);

        $paket->update($validated);

        return response()->json($paket);
    }

    public function destroy($id)
    {
        Paket::findOrFail($id)->delete();
        return response()->json(['message' => 'Paketa u fshi me sukses.']);
    }
}
