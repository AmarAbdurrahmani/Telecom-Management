<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pajisje extends Model
{
    protected $table      = 'pajisjet';
    protected $primaryKey = 'pajisje_id';

    protected $fillable = [
        'emri', 'marka', 'cmimi_cash', 'cmimi_keste', 'muajt_kestes', 'disponueshme', 'pershkrimi',
    ];

    protected $casts = [
        'cmimi_cash'    => 'decimal:2',
        'cmimi_keste'   => 'decimal:2',
        'disponueshme'  => 'boolean',
    ];

    public function kontratat()
    {
        return $this->hasMany(Kontrate::class, 'pajisje_id', 'pajisje_id');
    }
}
