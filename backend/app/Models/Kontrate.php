<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kontrate extends Model
{
    protected $table      = 'kontratat';
    protected $primaryKey = 'kontrate_id';

    protected $fillable = [
        'numri_kontrates',
        'klient_id',
        'paket_id',
        'pajisje_id',
        'zbritja_perqindje',
        'kodi_promo',
        'data_fillimit',
        'data_mbarimit',
        'statusi',
    ];

    protected $casts = [
        'data_fillimit'  => 'date',
        'data_mbarimit'  => 'date',
    ];

    public function pajisje()
    {
        return $this->belongsTo(Pajisje::class, 'pajisje_id', 'pajisje_id');
    }

    public function klient()
    {
        return $this->belongsTo(Client::class, 'klient_id', 'klient_id');
    }

    public function paket()
    {
        return $this->belongsTo(Paket::class, 'paket_id', 'paket_id');
    }

    public function faturat()
    {
        return $this->hasMany(Fature::class, 'kontrate_id', 'kontrate_id');
    }

    public function numratTelefonit()
    {
        return $this->hasMany(NumriTelefonit::class, 'kontrate_id', 'kontrate_id');
    }

    public function sherbimetShtesa()
    {
        return $this->belongsToMany(
            SherbimShtese::class,
            'kontrate_sherbime',
            'kontrate_id',
            'sherbim_id'
        )->withTimestamps();
    }
}
