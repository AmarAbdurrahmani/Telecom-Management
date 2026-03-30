<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ankese extends Model
{
    protected $table      = 'ankesat';
    protected $primaryKey = 'ankese_id';

    protected $fillable = [
        'klient_id',
        'punonjes_id',
        'kategoria',
        'pershkrimi',
        'data_ankeses',
        'statusi',
        'pergjigja',
        'data_zgjidhjes',
    ];

    protected function casts(): array
    {
        return [
            'data_ankeses'    => 'date',
            'data_zgjidhjes'  => 'date',
        ];
    }

    public function klient()
    {
        return $this->belongsTo(Client::class, 'klient_id', 'klient_id');
    }

    public function punonjes()
    {
        return $this->belongsTo(User::class, 'punonjes_id');
    }
}
