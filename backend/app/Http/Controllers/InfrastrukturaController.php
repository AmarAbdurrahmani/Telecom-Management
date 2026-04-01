<?php

namespace App\Http\Controllers;

use App\Models\Infrastruktura;
use Illuminate\Http\Request;

class InfrastrukturaController extends Controller
{
    private const LLOJET   = ['router', 'server', 'olt', 'antena', 'switch', 'kabllo', 'firewall', 'tjeter'];
    private const STATUSET = ['aktive', 'joaktive', 'ne_mirembajtje', 'defekt'];

    public function index(Request $request)
    {
        $query = Infrastruktura::query();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('lokacioni', 'like', "%$s%")
                  ->orWhere('lloji',   'like', "%$s%")
                  ->orWhere('kapaciteti', 'like', "%$s%")
                  ->orWhere('pershkrimi', 'like', "%$s%");
            });
        }

        if ($request->filled('lloji')) {
            $query->where('lloji', $request->lloji);
        }

        if ($request->filled('statusi')) {
            $query->where('statusi', $request->statusi);
        }

        $perPage   = (int) $request->get('per_page', 15);
        $paginator = $query->orderBy('infrastrukture_id', 'desc')->paginate($perPage);

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
            'lloji'                    => 'required|in:' . implode(',', self::LLOJET),
            'lokacioni'                => 'required|string|max:255',
            'kapaciteti'               => 'nullable|string|max:100',
            'statusi'                  => 'required|in:' . implode(',', self::STATUSET),
            'data_instalimit'          => 'nullable|date',
            'data_mirembajtjes_fundit' => 'nullable|date',
            'pershkrimi'               => 'nullable|string',
        ]);

        $infra = Infrastruktura::create($validated);

        return response()->json($infra, 201);
    }

    public function show($id)
    {
        return response()->json(Infrastruktura::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $infra = Infrastruktura::findOrFail($id);

        $validated = $request->validate([
            'lloji'                    => 'sometimes|required|in:' . implode(',', self::LLOJET),
            'lokacioni'                => 'sometimes|required|string|max:255',
            'kapaciteti'               => 'nullable|string|max:100',
            'statusi'                  => 'sometimes|required|in:' . implode(',', self::STATUSET),
            'data_instalimit'          => 'nullable|date',
            'data_mirembajtjes_fundit' => 'nullable|date',
            'pershkrimi'               => 'nullable|string',
        ]);

        $infra->update($validated);

        return response()->json($infra);
    }

    public function destroy($id)
    {
        Infrastruktura::findOrFail($id)->delete();
        return response()->json(['message' => 'Infrastruktura u fshi me sukses.']);
    }
}
