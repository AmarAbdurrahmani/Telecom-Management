<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SimKartela extends Model
{
    protected $table      = 'sim_kartela';
    protected $primaryKey = 'sim_id';

    protected $fillable = [
        'klient_id',
        'numri_id',
        'nr_karteles',
        'pin',
        'puk',
        'tip',
        'statusi',
        'data_leshimit',
        'koment',
    ];

    protected function casts(): array
    {
        return [
            'data_leshimit' => 'date',
        ];
    }

    public function klient()
    {
        return $this->belongsTo(Client::class, 'klient_id', 'klient_id');
    }

    public function numriTelefonit()
    {
        return $this->belongsTo(NumriTelefonit::class, 'numri_id', 'numri_id');
    }
}
