<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Services\NetworkCoverageService;
use Illuminate\Http\Request;

class NetworkCoverageController extends Controller
{
    public function __construct(private NetworkCoverageService $service) {}

    /**
     * GET /klientet/{id}/network-coverage
     *
     * Returns the network coverage status for a client based on their coordinates.
     * If the client has no coordinates, returns a prompt to add them.
     */
    public function show($hash)
    {
        $id     = Client::decodeHashId($hash) ?? abort(404);
        $client = Client::findOrFail($id);

        if (!$client->latitude || !$client->longitude) {
            return response()->json([
                'statusi'    => 'pa_koordinata',
                'etiketa'    => 'Nuk ka koordinata — shto adresën GPS të klientit',
                'ngjyra'     => 'gray',
                'distanca_m' => null,
                'kulla'      => null,
            ]);
        }

        $result = $this->service->evaluate(
            (float) $client->latitude,
            (float) $client->longitude
        );

        return response()->json($result);
    }

    /**
     * PATCH /klientet/{id}/koordinata
     *
     * Staff can update the GPS coordinates of a client.
     */
    public function updateCoordinates(Request $request, $hash)
    {
        $id     = Client::decodeHashId($hash) ?? abort(404);
        $client = Client::findOrFail($id);

        $validated = $request->validate([
            'latitude'  => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $client->update($validated);

        return response()->json([
            'message'   => 'Koordinatat u ruajtën.',
            'latitude'  => $client->latitude,
            'longitude' => $client->longitude,
        ]);
    }
}
