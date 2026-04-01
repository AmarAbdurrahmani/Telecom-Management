<?php

namespace App\Http\Controllers;

use App\Helpers\HistoryLogger;
use App\Models\Ankese;
use App\Models\Client;
use App\Models\User;
use Illuminate\Http\Request;

class AnkesaController extends Controller
{
    public function index(Request $request)
    {
        $query = Ankese::with([
            'klient:klient_id,emri,mbiemri,email,lloji_klientit',
            'punonjes:id,name,roli,pozita',
        ]);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('pershkrimi', 'like', "%$s%")
                  ->orWhere('pergjigja', 'like', "%$s%")
                  ->orWhereHas('klient', fn($k) =>
                      $k->where('emri', 'like', "%$s%")
                        ->orWhere('mbiemri', 'like', "%$s%")
                        ->orWhere('email', 'like', "%$s%")
                  );
            });
        }

        if ($request->filled('statusi')) {
            $query->where('statusi', $request->statusi);
        }

        if ($request->filled('kategoria')) {
            $query->where('kategoria', $request->kategoria);
        }

        if ($request->filled('klient_id')) {
            $query->where('klient_id', $request->klient_id);
        }

        $perPage   = (int) $request->get('per_page', 15);
        $paginator = $query->orderBy('ankese_id', 'desc')->paginate($perPage);

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
            'klient_id'       => 'required|exists:clients,klient_id',
            'punonjes_id'          => 'nullable|exists:users,id',
            'kategoria'            => 'required|in:teknik,faturim,sherbimi,portabiliteti,tjeter',
            'pershkrimi'           => 'required|string|max:2000',
            'data_ankeses'         => 'required|date',
            'statusi'              => 'required|in:e_re,ne_process,e_zgjidhur,e_mbyllur',
            'pergjigja'            => 'nullable|string|max:2000',
            'data_zgjidhjes'       => 'nullable|date',
            'ka_kompensim'         => 'boolean',
            'arsyeja_kompensimit'  => 'nullable|string|max:255',
            'shuma_kompensimit'    => 'nullable|numeric|min:0|max:9999',
            'kanali_njoftimit'     => 'nullable|in:email,sms,poste,portal',
        ]);

        $ankese = Ankese::create($validated);

        return response()->json(
            $ankese->load(['klient:klient_id,emri,mbiemri,email,lloji_klientit', 'punonjes:id,name,roli,pozita']),
            201
        );
    }

    public function show($id)
    {
        return response()->json(
            Ankese::with([
                'klient:klient_id,emri,mbiemri,email,lloji_klientit',
                'punonjes:id,name,roli,pozita',
            ])->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $ankese = Ankese::findOrFail($id);

        $validated = $request->validate([
            'klient_id'            => 'sometimes|required|exists:clients,klient_id',
            'punonjes_id'          => 'nullable|exists:users,id',
            'kategoria'            => 'sometimes|required|in:teknik,faturim,sherbimi,portabiliteti,tjeter',
            'pershkrimi'           => 'sometimes|required|string|max:2000',
            'data_ankeses'         => 'sometimes|required|date',
            'statusi'              => 'sometimes|required|in:e_re,ne_process,e_zgjidhur,e_mbyllur',
            'pergjigja'            => 'nullable|string|max:2000',
            'data_zgjidhjes'       => 'nullable|date',
            // Compensation
            'ka_kompensim'         => 'boolean',
            'arsyeja_kompensimit'  => 'nullable|string|max:255',
            'shuma_kompensimit'    => 'nullable|numeric|min:0|max:9999',
            'kanali_njoftimit'     => 'nullable|in:email,sms,poste,portal',
        ]);

        // Auto-set data_zgjidhjes when marking as resolved/closed
        if (
            isset($validated['statusi']) &&
            in_array($validated['statusi'], ['e_zgjidhur', 'e_mbyllur']) &&
            empty($ankese->data_zgjidhjes) &&
            empty($validated['data_zgjidhjes'])
        ) {
            $validated['data_zgjidhjes'] = now()->toDateString();
        }

        $wasKompensim    = $ankese->ka_kompensim;
        $newKompensim    = $validated['ka_kompensim'] ?? false;
        $shuma           = $validated['shuma_kompensimit'] ?? null;
        $arsyeja         = $validated['arsyeja_kompensimit'] ?? null;
        $kanali          = $validated['kanali_njoftimit'] ?? 'email';
        $klientId        = $ankese->klient_id;

        $ankese->update($validated);

        // Apply compensation when first approved
        if ($newKompensim && !$wasKompensim && $shuma > 0) {
            // Add credit to client
            Client::where('klient_id', $klientId)
                ->increment('krediti', $shuma);

            HistoryLogger::log(
                $klientId,
                'kompensim',
                "Kompensim i aprovuar: {$arsyeja}. Shuma: {$shuma}€ u shtua si kredit.",
                $shuma,
                $kanali,
                ['ankese_id' => $ankese->ankese_id, 'arsyeja' => $arsyeja]
            );
        }

        return response()->json(
            $ankese->load(['klient:klient_id,emri,mbiemri,email,lloji_klientit', 'punonjes:id,name,roli,pozita'])
        );
    }

    public function destroy($id)
    {
        Ankese::findOrFail($id)->delete();
        return response()->json(['message' => 'Ankesa u fshi me sukses.']);
    }

    /** Dropdown list of clients for the form */
    public function klientetList()
    {
        return response()->json(
            Client::orderBy('emri')->get(['klient_id', 'emri', 'mbiemri', 'email', 'lloji_klientit'])
        );
    }

    /** Dropdown list of staff for the form */
    public function punonjesitList()
    {
        return response()->json(
            User::whereIn('roli', ['admin', 'tl', 'sv', 'agent'])
                ->where('aktiv', true)
                ->orderBy('name')
                ->get(['id', 'name', 'roli', 'pozita'])
        );
    }
}
