<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateApiToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if request has valid API token in header
        $apiToken = $request->header('X-API-Token');
        $expectedToken = config('app.api_token');

        if (!$apiToken || $apiToken !== $expectedToken) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or missing API token'
            ], 401);
        }

        return $next($request);
    }
}
