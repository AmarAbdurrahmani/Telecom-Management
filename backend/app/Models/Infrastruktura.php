<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Infrastruktura extends Model
{
    protected $table      = 'infrastruktura';
    protected $primaryKey = 'infrastrukture_id';

    protected $fillable = [
        'lloji',
        'lokacioni',
        'kapaciteti',
        'statusi',
        'data_instalimit',
        'data_mirembajtjes_fundit',
        'pershkrimi',
    ];

    protected $casts = [
        'data_instalimit'           => 'date',
        'data_mirembajtjes_fundit'  => 'date',
    ];
}
