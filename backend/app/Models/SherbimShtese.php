<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SherbimShtese extends Model
{
    protected $table      = 'sherbimet_shtesa';
    protected $primaryKey = 'sherbim_id';

    protected $fillable = [
        'emri_sherbimit',
        'pershkrimi',
        'cmimi_mujor',
        'aktiv',
    ];

    protected $casts = [
        'aktiv'       => 'boolean',
        'cmimi_mujor' => 'float',
    ];

    public function kontratat()
    {
        return $this->belongsToMany(
            Kontrate::class,
            'kontrate_sherbime',
            'sherbim_id',
            'kontrate_id'
        )->withTimestamps();
    }
}
