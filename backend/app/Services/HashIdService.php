<?php

namespace App\Services;

use Hashids\Hashids;

class HashIdService
{
    private Hashids $hashids;

    public function __construct()
    {
        $this->hashids = new Hashids(
            config('hashids.salt',     'telekomyt_secret_2026'),
            config('hashids.length',   8),
            config('hashids.alphabet', 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789')
        );
    }

    public function encode(int $id): string
    {
        return $this->hashids->encode($id);
    }

    public function decode(string $hash): ?int
    {
        $decoded = $this->hashids->decode($hash);
        return isset($decoded[0]) ? (int) $decoded[0] : null;
    }
}
