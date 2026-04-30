<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model {
    protected $table = 'chat_messages';
    protected $primaryKey = 'message_id';
    protected $fillable = ['sender_id','mesazhi','emoji_reaction','read_at'];
    protected $casts = ['read_at' => 'datetime'];

    public function sender() { return $this->belongsTo(User::class, 'sender_id'); }
}
