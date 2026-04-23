<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuthToken extends Model
{
    protected $table      = 'auth_tokens';
    protected $primaryKey = 'token_id';

    protected $fillable = ['klient_id', 'token', 'perdorur', 'expires_at'];

    protected $casts = ['expires_at' => 'datetime', 'perdorur' => 'boolean'];

    public function klient()
    {
        return $this->belongsTo(Client::class, 'klient_id', 'klient_id');
    }

    public function isValid(): bool
    {
        return !$this->perdorur && $this->expires_at->isFuture();
    }
}
