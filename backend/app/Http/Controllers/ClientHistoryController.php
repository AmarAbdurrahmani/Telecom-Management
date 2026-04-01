<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientHistory;
use Illuminate\Http\Request;

class ClientHistoryController extends Controller
{
    /**
     * GET /klientet/{id}/historia
     * Returns paginated history for a client, newest first.
     */
    public function index(Request $request, $id)
    {
        Client::findOrFail($id); // 404 if not found

        $paginator = ClientHistory::where('klient_id', $id)
            ->with('punonjes:id,name')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'data' => $paginator->items(),
            'pagination' => [
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
            ],
        ]);
    }
}
