<?php
namespace App\Http\Controllers;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\Request;

class ChatController extends Controller {
    public function index(Request $request) {
        $perPage = (int)$request->get('per_page', 50);
        $messages = ChatMessage::with('sender:id,name,roli')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // Mark all as read for current user
        ChatMessage::where('read_at', null)
            ->where('sender_id', '!=', auth()->id())
            ->update(['read_at' => now()]);

        return response()->json([
            'data' => array_reverse($messages->items()),
            'pagination' => ['total' => $messages->total(), 'last_page' => $messages->lastPage(), 'current_page' => $messages->currentPage()],
        ]);
    }

    public function store(Request $request) {
        $request->validate(['mesazhi' => 'required|string|max:1000']);
        $msg = ChatMessage::create([
            'sender_id' => auth()->id(),
            'mesazhi'   => $request->mesazhi,
        ]);
        return response()->json($msg->load('sender:id,name,roli'), 201);
    }

    public function react(Request $request, $id) {
        $request->validate(['emoji' => 'required|string|max:10']);
        $msg = ChatMessage::findOrFail($id);
        $msg->update(['emoji_reaction' => $request->emoji]);
        return response()->json($msg);
    }

    public function unread() {
        $count = ChatMessage::where('read_at', null)->where('sender_id', '!=', auth()->id())->count();
        return response()->json(['unread' => $count]);
    }
}
