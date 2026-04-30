<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        // Staff page — exclude klient accounts (managed via Clients page)
        $query = User::where('roli', '!=', 'klient');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) =>
                $q->where('name', 'like', "%$s%")
                  ->orWhere('email', 'like', "%$s%")
                  ->orWhere('departamenti', 'like', "%$s%")
                  ->orWhere('pozita', 'like', "%$s%")
            );
        }

        if ($request->filled('roli')) {
            $query->where('roli', $request->roli);
        }

        if ($request->filled('aktiv') && $request->aktiv !== '') {
            $query->where('aktiv', filter_var($request->aktiv, FILTER_VALIDATE_BOOLEAN));
        }

        $perPage   = (int) $request->get('per_page', 20);
        $paginator = $query->orderBy('id', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'pagination' => [
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:100',
            'email'        => 'required|email|unique:users,email',
            'password'     => 'required|string|min:6',
            'roli'         => 'required|in:admin,tl,sv,agent,klient',
            'aktiv'        => 'boolean',
            'departamenti' => 'nullable|string|max:100',
            'pozita'       => 'nullable|string|max:100',
            'telefoni'     => 'nullable|string|max:30',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        return response()->json($user->makeHidden(['password', 'remember_token']), 201);
    }

    public function show($id)
    {
        return response()->json(User::findOrFail($id)->makeHidden(['password', 'remember_token']));
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'         => 'sometimes|required|string|max:100',
            'email'        => 'sometimes|required|email|unique:users,email,' . $id,
            'roli'         => 'sometimes|required|in:admin,tl,sv,agent,klient',
            'aktiv'        => 'boolean',
            'departamenti' => 'nullable|string|max:100',
            'pozita'       => 'nullable|string|max:100',
            'telefoni'     => 'nullable|string|max:30',
        ]);

        $user->update($validated);

        return response()->json($user->makeHidden(['password', 'remember_token']));
    }

    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $user = User::findOrFail($id);
        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Fjalëkalimi u ndryshua me sukses.']);
    }

    public function destroy($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'Përdoruesi u fshi me sukses.']);
    }

    public function staffList() {
        return response()->json(
            \App\Models\User::where('roli', '!=', 'klient')
                ->where('aktiv', true)
                ->select('id', 'name', 'roli')
                ->orderBy('name')
                ->get()
        );
    }
}
