<?php
namespace App\Http\Controllers;
use App\Models\Antenna;
use Illuminate\Http\Request;

class AntennaController extends Controller {
    public function index(Request $request) {
        $query = Antenna::with('installuesiNgaUser:id,name,roli');
        if ($request->filled('tipi')) $query->where('tipi', $request->tipi);
        if ($request->filled('statusi')) $query->where('statusi', $request->statusi);
        return response()->json($query->orderBy('antenna_id')->get());
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'emri' => 'required|string|max:100',
            'lat' => 'required|numeric',
            'lon' => 'required|numeric',
            'tipi' => 'required|in:5G,LTE,3G',
            'statusi' => 'required|in:active,maintenance,offline',
            'coverage_radius_m' => 'nullable|integer|min:100|max:50000',
            'qyteti' => 'nullable|string|max:100',
            'shenimet' => 'nullable|string',
        ]);
        $validated['installed_by'] = auth()->id();
        return response()->json(Antenna::create($validated), 201);
    }

    public function show($id) {
        return response()->json(Antenna::with('installuesiNgaUser:id,name,roli', 'tasks')->findOrFail($id));
    }

    public function update(Request $request, $id) {
        $antenna = Antenna::findOrFail($id);
        $validated = $request->validate([
            'emri' => 'sometimes|string|max:100',
            'statusi' => 'sometimes|in:active,maintenance,offline',
            'coverage_radius_m' => 'sometimes|integer',
            'shenimet' => 'nullable|string',
        ]);
        $antenna->update($validated);
        return response()->json($antenna);
    }

    public function destroy($id) {
        Antenna::findOrFail($id)->delete();
        return response()->json(['message' => 'Antena u fshi.']);
    }

    // GET /api/antennas/nearby?lat=&lon=&radius=
    public function nearby(Request $request) {
        $request->validate(['lat' => 'required|numeric', 'lon' => 'required|numeric']);
        $lat = (float)$request->lat;
        $lon = (float)$request->lon;
        $radius = (int)($request->radius ?? 5000);

        $antennas = Antenna::where('statusi', 'active')->get()->filter(function($a) use ($lat, $lon, $radius) {
            $dist = $this->haversine($lat, $lon, $a->lat, $a->lon);
            $a->distance_m = round($dist);
            return $dist <= $radius;
        })->values();

        return response()->json($antennas);
    }

    private function haversine($lat1, $lon1, $lat2, $lon2): float {
        $R = 6371000;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat/2)**2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon/2)**2;
        return $R * 2 * asin(sqrt($a));
    }
}
