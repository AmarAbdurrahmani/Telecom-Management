<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fature extends Model
{
    protected $table      = 'faturat';
    protected $primaryKey = 'fature_id';

    protected $fillable = [
        'kontrate_id',
        'periudha',
        'shuma_baze',
        'shuma_shtese',
        'tatimi',
        'totali',
        'data_leshimit',
        'data_pageses',
        'statusi',
    ];

    protected $casts = [
        'shuma_baze'   => 'float',
        'shuma_shtese' => 'float',
        'tatimi'       => 'float',
        'totali'       => 'float',
        'data_leshimit'=> 'date',
        'data_pageses' => 'date',
    ];

    public function kontrate()
    {
        return $this->belongsTo(Kontrate::class, 'kontrate_id', 'kontrate_id');
    }
}
