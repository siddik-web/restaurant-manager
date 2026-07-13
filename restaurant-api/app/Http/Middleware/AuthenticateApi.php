<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Models\User;

class AuthenticateApi
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $domain = env('SERVICE_DOMAIN', 'monolith');

        if ($domain === 'monolith') {
            // Monolith mode: Use default Laravel Sanctum authentication
            $user = Auth::guard('sanctum')->user();
            
            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            Auth::setUser($user);
            return $next($request);
        }

        // Microservice mode: Call settings-service internally to verify token
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated: Token missing',
            ], 401);
        }

        try {
            $gatewayUrl = rtrim(env('GATEWAY_URL', 'http://gateway'), '/');
            // Call settings-service directly inside Docker network to verify the token
            $response = Http::timeout(5)
                ->withToken($token)
                ->get("{$gatewayUrl}/api/auth/verify-token");

            if (! $response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated: Invalid token',
                ], 401);
            }

            $payload = $response->json();
            $userData = $payload['data'] ?? null;

            if (! $userData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated: Invalid user data',
                ], 401);
            }

            // Create a transient User model instance with the retrieved details
            $user = new User([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'role' => $userData['role'],
            ]);
            $user->id = $userData['id'];

            Auth::setUser($user);
            return $next($request);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication service unavailable: ' . $e->getMessage(),
            ], 503);
        }
    }
}
