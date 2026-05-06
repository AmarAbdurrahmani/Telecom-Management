<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ChatbotSession extends Model
{
    protected $table    = 'chatbot_sessions';
    protected $fillable = ['session_token', 'user_id', 'messages'];
    protected $casts    = ['messages' => 'array'];

    public static function findOrCreate(string $token, ?int $userId = null): self
    {
        return self::firstOrCreate(
            ['session_token' => $token],
            ['user_id' => $userId, 'messages' => []]
        );
    }

    public static function generateToken(): string
    {
        return Str::random(48);
    }

    public function appendMessage(string $role, string $content): void
    {
        $messages   = $this->messages ?: [];
        $messages[] = ['role' => $role, 'content' => $content];

        // Keep only the last 20 messages (10 exchanges) to stay within token limits
        if (count($messages) > 20) {
            $messages = array_slice($messages, -20);
        }

        $this->update(['messages' => $messages]);
    }
}
