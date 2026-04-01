<?php

namespace App\Helpers;

use App\Models\ClientHistory;
use Illuminate\Support\Facades\Auth;

class HistoryLogger
{
    public static function log(
        int    $klient_id,
        string $veprimi,
        string $pershkrimi,
        ?float  $shuma       = null,
        string $kanali       = 'portal',
        array  $meta_data    = []
    ): void {
        ClientHistory::create([
            'klient_id'   => $klient_id,
            'veprimi'     => $veprimi,
            'pershkrimi'  => $pershkrimi,
            'shuma'       => $shuma,
            'kanali'      => $kanali,
            'punonjes_id' => Auth::id(),
            'meta_data'   => $meta_data ?: null,
        ]);
    }
}
