<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::query();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('emri', 'like', "%$s%")
                  ->orWhere('mbiemri', 'like', "%$s%")
                  ->orWhere('email', 'like', "%$s%")
                  ->orWhere('numri_personal', 'like', "%$s%")
                  ->orWhere('telefoni', 'like', "%$s%");
            });
        }

        if ($request->filled('lloji_klientit')) {
            $query->where('lloji_klientit', $request->lloji_klientit);
        }

        if ($request->filled('statusi')) {
            $query->where('statusi', $request->statusi);
        }

        $perPage = (int) $request->get('per_page', 12);
        $paginator = $query->orderBy('klient_id', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'pagination' => [
                'total'     => $paginator->total(),
                'per_page'  => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'from'      => $paginator->firstItem(),
                'to'        => $paginator->lastItem(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'emri'             => 'required|string|max:100',
            'mbiemri'          => 'required|string|max:100',
            'numri_personal'   => 'required|string|max:20|unique:clients,numri_personal',
            'email'            => 'required|email|max:150|unique:clients,email',
            'telefoni'         => 'required|string|max:20',
            'adresa'           => 'nullable|string|max:255',
            'lloji_klientit'   => 'required|in:individual,biznes,vip',
            'statusi'          => 'required|in:aktiv,pasiv,pezulluar',
            'data_regjistrimit'=> 'required|date',
        ]);

        $client = Client::create($validated);

        return response()->json($client, 201);
    }

    public function show($id)
    {
        return response()->json(Client::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $client = Client::findOrFail($id);

        $validated = $request->validate([
            'emri'             => 'sometimes|required|string|max:100',
            'mbiemri'          => 'sometimes|required|string|max:100',
            'numri_personal'   => 'sometimes|required|string|max:20|unique:clients,numri_personal,' . $id . ',klient_id',
            'email'            => 'sometimes|required|email|max:150|unique:clients,email,' . $id . ',klient_id',
            'telefoni'         => 'sometimes|required|string|max:20',
            'adresa'           => 'nullable|string|max:255',
            'lloji_klientit'   => 'sometimes|required|in:individual,biznes,vip',
            'statusi'          => 'sometimes|required|in:aktiv,pasiv,pezulluar',
            'data_regjistrimit'=> 'sometimes|required|date',
        ]);

        $client->update($validated);

        return response()->json($client);
    }

    public function destroy($id)
    {
        Client::findOrFail($id)->delete();
        return response()->json(['message' => 'Klienti u fshi me sukses.']);
    }
}
