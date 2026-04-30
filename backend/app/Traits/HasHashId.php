<?php

namespace App\Traits;

use App\Services\HashIdService;

/**
 * Appends a `hash_id` computed attribute to any Eloquent model.
 *
 * Usage:
 *   protected $appends = ['hash_id'];
 *   use HasHashId;
 *
 * The primary key remains an integer in the database (fast indexing).
 * The hash is only computed when serialising to JSON / array.
 */
trait HasHashId
{
    public function getHashIdAttribute(): string
    {
        return app(HashIdService::class)->encode((int) $this->getKey());
    }

    /**
     * Decode a hash string to its integer ID.
     * Returns null if the hash is invalid (controller should abort 404).
     */
    public static function decodeHashId(string $hash): ?int
    {
        return app(HashIdService::class)->decode($hash);
    }
}
