<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pagese extends Model
{
    protected $table      = 'pagesat';
    protected $primaryKey = 'pagese_id';

    protected $fillable = [
        'fature_id',
        'shuma',
        'data_pageses',
        'metoda',
        'referenca',
        'shenime',
    ];

    protected $casts = [
        'shuma'        => 'decimal:2',
        'data_pageses' => 'date',
    ];

    public function fature()
    {
        return $this->belongsTo(Fature::class, 'fature_id', 'fature_id');
    }
}
