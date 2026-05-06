<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->roli, $roles, true)) {
            return response()->json([
                'message' => 'Nuk keni qasje në këtë burim.',
            ], 403);
        }

        return $next($request);
    }
}
