<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NumriTelefonit extends Model
{
    protected $table      = 'numrat_telefonit';
    protected $primaryKey = 'numri_id';

    protected $fillable = [
        'kontrate_id',
        'numri_telefonit',
        'statusi',
        'data_aktivizimit',
        'lloji',
    ];

    protected $casts = [
        'data_aktivizimit' => 'date',
    ];

    public function kontrate()
    {
        return $this->belongsTo(Kontrate::class, 'kontrate_id', 'kontrate_id');
    }
}
