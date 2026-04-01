<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientHistory extends Model
{
    protected $table = 'client_history';

    protected $fillable = [
        'klient_id',
        'veprimi',
        'pershkrimi',
        'shuma',
        'kanali',
        'punonjes_id',
        'meta_data',
    ];

    protected function casts(): array
    {
        return [
            'meta_data' => 'array',
            'shuma'     => 'decimal:2',
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
