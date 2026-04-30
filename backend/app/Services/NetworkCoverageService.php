<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class NetworkCoverageService
{
    // Earth radius in metres
    private const EARTH_RADIUS = 6371000;

    // Thresholds (metres)
    private const THRESH_5G   = 500;
    private const THRESH_4G   = 1500;

    // MCC for Kosovo = 221, MNC = 01 (IPKO) or 02 (Vala)
    private const MCC = 221;

    /**
     * Evaluate network coverage for a given coordinate pair.
     *
     * @return array{statusi: string, ngjyra: string, distanca_m: float|null, kulla: array|null}
     */
    public function evaluate(float $lat, float $lon): array
    {
        $apiKey = config('services.opencellid.key');

        if (!$apiKey) {
            return $this->noApiKey();
        }

        // Cache result for 24 h per location (rounded to ~100m)
        $cacheKey = 'network_' . round($lat, 3) . '_' . round($lon, 3);

        return Cache::remember($cacheKey, now()->addHours(24), function () use ($lat, $lon, $apiKey) {
            return $this->fetchAndEvaluate($lat, $lon, $apiKey);
        });
    }

    private function fetchAndEvaluate(float $lat, float $lon, string $apiKey): array
    {
        try {
            $response = Http::timeout(8)->get('https://opencellid.org/cell/getInArea', [
                'key'    => $apiKey,
                'MCCMNC' => self::MCC . '01,' . self::MCC . '02',
                'lat'    => $lat,
                'lon'    => $lon,
                'radius' => 2000,   // 2 km search radius
                'format' => 'json',
                'limit'  => 10,
            ]);

            if ($response->failed()) {
                return $this->error('OpenCelliD API i padisponueshëm.');
            }

            $cells = $response->json('cells') ?? [];

            if (empty($cells)) {
                return [
                    'statusi'    => 'i_dobet',
                    'etiketa'    => 'Sinjal i dobët / Nevojitet përforcues',
                    'ngjyra'     => 'red',
                    'distanca_m' => null,
                    'kulla'      => null,
                ];
            }

            // Find nearest cell tower using Haversine formula
            $nearest  = null;
            $minDist  = PHP_FLOAT_MAX;

            foreach ($cells as $cell) {
                $d = $this->haversine($lat, $lon, (float)$cell['lat'], (float)$cell['lon']);
                if ($d < $minDist) {
                    $minDist = $d;
                    $nearest = $cell;
                }
            }

            return $this->classify($minDist, $nearest);

        } catch (\Throwable $e) {
            return $this->error('Gabim gjatë lidhjes me OpenCelliD.');
        }
    }

    /**
     * Haversine great-circle distance in metres.
     */
    private function haversine(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) ** 2
           + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;

        return 2 * self::EARTH_RADIUS * asin(sqrt($a));
    }

    private function classify(float $distanceM, array $cell): array
    {
        if ($distanceM < self::THRESH_5G) {
            return [
                'statusi'    => 'potencial_5g',
                'etiketa'    => 'Potencial i lartë për 5G',
                'ngjyra'     => 'green',
                'distanca_m' => round($distanceM),
                'kulla'      => $this->formatCell($cell),
            ];
        }

        if ($distanceM < self::THRESH_4G) {
            return [
                'statusi'    => 'mbulueshmeri_4g',
                'etiketa'    => 'Mbulueshmëri e mirë 4G+',
                'ngjyra'     => 'orange',
                'distanca_m' => round($distanceM),
                'kulla'      => $this->formatCell($cell),
            ];
        }

        return [
            'statusi'    => 'i_dobet',
            'etiketa'    => 'Sinjal i dobët / Nevojitet përforcues',
            'ngjyra'     => 'red',
            'distanca_m' => round($distanceM),
            'kulla'      => $this->formatCell($cell),
        ];
    }

    private function formatCell(array $cell): array
    {
        return [
            'lat'    => $cell['lat']    ?? null,
            'lon'    => $cell['lon']    ?? null,
            'radio'  => $cell['radio']  ?? 'LTE',
            'mcc'    => $cell['mcc']    ?? self::MCC,
            'mnc'    => $cell['mnc']    ?? null,
            'range'  => $cell['range']  ?? null,
        ];
    }

    private function noApiKey(): array
    {
        return [
            'statusi'    => 'pa_api',
            'etiketa'    => 'API key mungon — konfiguro OPENCELLID_KEY në .env',
            'ngjyra'     => 'gray',
            'distanca_m' => null,
            'kulla'      => null,
        ];
    }

    private function error(string $msg): array
    {
        return [
            'statusi'    => 'gabim',
            'etiketa'    => $msg,
            'ngjyra'     => 'gray',
            'distanca_m' => null,
            'kulla'      => null,
        ];
    }
}
