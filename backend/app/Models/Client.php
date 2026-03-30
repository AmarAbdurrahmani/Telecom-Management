<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $table = 'clients';
    protected $primaryKey = 'klient_id';

    public function kontratat()
    {
        return $this->hasMany(Kontrate::class, 'klient_id', 'klient_id');
    }

    protected $fillable = [
        'user_id',
        'emri',
        'mbiemri',
        'numri_personal',
        'email',
        'telefoni',
        'adresa',
        'lloji_klientit',
        'statusi',
        'data_regjistrimit',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function ankesat()
    {
        return $this->hasMany(Ankese::class, 'klient_id', 'klient_id');
    }
}