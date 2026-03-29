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
        'data_fillimit',
        'data_mbarimit',
        'statusi',
    ];

    protected $casts = [
        'data_fillimit'  => 'date',
        'data_mbarimit'  => 'date',
    ];

    public function klient()
    {
        return $this->belongsTo(Client::class, 'klient_id', 'klient_id');
    }

    public function paket()
    {
        return $this->belongsTo(Paket::class, 'paket_id', 'paket_id');
    }
}
