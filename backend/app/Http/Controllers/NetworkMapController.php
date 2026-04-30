<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class NetworkMapController extends Controller
{
    /**
     * GET /api/network/towers?lat=&lon=&radius=
     *
     * Proxies the OpenCelliD getInArea request so the API key
     * never leaves the server.
     */
    public function towers(Request $request)
    {
        $request->validate([
            'lat'    => 'required|numeric|between:-90,90',
            'lon'    => 'required|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:100|max:5000',
        ]);

        $lat    = (float) $request->lat;
        $lon    = (float) $request->lon;
        $radius = (int)   ($request->radius ?? 2000);

        $apiKey = config('services.opencellid.key');

        if (!$apiKey) {
            return response()->json([
                'demo'  => true,
                'cells' => $this->demoTowers($lat, $lon),
            ]);
        }

        $cacheKey = "towers_{$lat}_{$lon}_{$radius}";

        $cells = Cache::remember($cacheKey, now()->addHours(6), function () use ($lat, $lon, $radius, $apiKey) {
            $resp = Http::timeout(10)->get('https://opencellid.org/cell/getInArea', [
                'key'    => $apiKey,
                'lat'    => $lat,
                'lon'    => $lon,
                'radius' => $radius,
                'format' => 'json',
                'limit'  => 50,
            ]);

            if ($resp->failed()) {
                return null; // will trigger fallback below
            }

            return collect($resp->json('cells') ?? [])->map(fn($c) => [
                'lat'      => (float) $c['lat'],
                'lon'      => (float) $c['lon'],
                'radio'    => $c['radio']  ?? 'LTE',
                'mcc'      => $c['mcc']    ?? 221,
                'mnc'      => $c['mnc']    ?? null,
                'range'    => $c['range']  ?? null,
                'samples'  => $c['samples'] ?? null,
            ])->values()->all();
        });

        if ($cells === null) {
            return response()->json([
                'demo'  => true,
                'cells' => $this->demoTowers($lat, $lon),
            ], 200);
        }

        return response()->json([
            'demo'  => false,
            'cells' => $cells,
        ]);
    }

    /**
     * Returns a handful of realistic-looking demo towers
     * scattered around the given centre (used when no API key or API error).
     */
    private function demoTowers(float $lat, float $lon): array
    {
        $offsets = [
            [0.005,  0.003,  'LTE', 'Demo Operator', 300],
            [-0.003, 0.007,  'LTE', 'Demo Operator', 450],
            [0.008, -0.004,  'LTE', 'Demo Operator', 600],
            [-0.006, -0.002, 'NR',  'Demo Operator', 200],
            [0.002,  0.009,  'LTE', 'Demo Operator', 800],
        ];

        return array_map(fn($o) => [
            'lat'     => round($lat + $o[0], 6),
            'lon'     => round($lon + $o[1], 6),
            'radio'   => $o[2],
            'mcc'     => 221,
            'mnc'     => 1,
            'range'   => $o[4],
            'samples' => null,
        ], $offsets);
    }
}
