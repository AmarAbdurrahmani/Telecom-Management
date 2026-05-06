<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BlockDeleteForTL
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethod('DELETE') && $request->user()?->roli === 'tl') {
            return response()->json([
                'message' => 'Team Lead nuk mund të fshijë rekorde kryesore.',
            ], 403);
        }

        return $next($request);
    }
}
