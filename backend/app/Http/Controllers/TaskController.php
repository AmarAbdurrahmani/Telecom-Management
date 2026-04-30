<?php
namespace App\Http\Controllers;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller {
    public function index(Request $request) {
        $query = Task::with(['assignedTo:id,name,roli','assignedBy:id,name,roli','antenna']);
        if ($request->filled('assigned_to')) $query->where('assigned_to', $request->assigned_to);
        if ($request->filled('statusi')) $query->where('statusi', $request->statusi);
        if ($request->filled('mine')) $query->where('assigned_to', auth()->id());
        return response()->json($query->orderByRaw("FIELD(prioriteti,'urgent','high','medium','low')")->orderBy('due_date')->get());
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'titulli' => 'required|string|max:200',
            'pershkrimi' => 'nullable|string',
            'tipi' => 'required|in:antenna_setup,maintenance,contract_renewal,complaint,general',
            'prioriteti' => 'required|in:low,medium,high,urgent',
            'assigned_to' => 'required|exists:users,id',
            'antenna_id' => 'nullable|exists:antennas,antenna_id',
            'due_date' => 'nullable|date',
        ]);
        $validated['assigned_by'] = auth()->id();
        $task = Task::create($validated);
        $task->load(['assignedTo:id,name,roli','assignedBy:id,name,roli']);
        return response()->json($task, 201);
    }

    public function update(Request $request, $id) {
        $task = Task::findOrFail($id);
        $validated = $request->validate([
            'statusi' => 'sometimes|in:pending,in_progress,completed,cancelled',
            'pershkrimi' => 'sometimes|string',
        ]);
        $task->update($validated);
        return response()->json($task->load(['assignedTo:id,name,roli']));
    }
}
