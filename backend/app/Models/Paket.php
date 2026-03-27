<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paket extends Model
{
    protected $table = 'paketat';
    protected $primaryKey = 'paket_id';

    protected $fillable = [
        'emri_paketes',
        'pershkrimi',
        'cmimi_mujor',
        'lloji_sherbimit',
        'shpejtesia_mb',
        'minuta',
        'sms',
        'data_gb',
        'aktive',
    ];

    protected $casts = [
        'aktive'       => 'boolean',
        'cmimi_mujor'  => 'float',
        'shpejtesia_mb'=> 'integer',
        'minuta'       => 'integer',
        'sms'          => 'integer',
        'data_gb'      => 'float',
    ];
}
