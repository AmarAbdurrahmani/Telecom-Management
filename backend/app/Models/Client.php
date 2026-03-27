<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $table = 'clients';
    protected $primaryKey = 'klient_id';

    protected $fillable = [
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
}