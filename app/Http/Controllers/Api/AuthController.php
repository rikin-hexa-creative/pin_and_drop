<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\GoogleSignInRequest;
use App\Http\Requests\Auth\SignInRequest;
use App\Http\Requests\Auth\SignUpRequest;
use App\Models\User;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function signUp(SignUpRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'full_name' => $validated['full_name'],
            'email'     => $validated['email'],
            'password'  => $validated['password'],
            'phone'     => $validated['phone'] ?? null,
            'is_active' => true,
        ]);

        if (isset($validated['avatar'])) {
            $avatar = $validated['avatar'];
            $avatarDirectory = "user/{$user->id}/avatar";
            $avatarName = time().'_'.$user->id.'.'.$avatar->getClientOriginalExtension();
            $avatarPath = $avatar->storeAs($avatarDirectory, $avatarName, 'public');

            $user->update([
                'avatar' => '/'.$avatarPath,
            ]);
        }

        return response()->json([
            'message' => 'Sign up successful.',
            'user'    => $user->fresh(),
        ], 201);
    }

    public function signIn(SignInRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'This account is inactive.',
            ], 403);
        }

        $token = $user->createToken('user_token')->plainTextToken;

        return response()->json([
            'message' => 'Sign in successful.',
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    public function googleSignIn(GoogleSignInRequest $request): JsonResponse
    {
        $googleProfile = $this->fetchGoogleProfile($request->validated('access_token'));

        $email = $googleProfile['email'] ?? null;
        $googleId = $googleProfile['sub'] ?? null;
        $hasVerifiedEmail = filter_var(
            $googleProfile['email_verified'] ?? $googleProfile['verified_email'] ?? false,
            FILTER_VALIDATE_BOOLEAN
        );

        if (! $email || ! $googleId || ! $hasVerifiedEmail) {
            throw ValidationException::withMessages([
                'access_token' => 'Google did not return a verified email address.',
            ]);
        }

        $user = User::firstOrNew(['email' => $email]);

        if ($user->exists && $user->google_id && $user->google_id !== $googleId) {
            return response()->json([
                'message' => 'This email address is already linked to another Google account.',
            ], 409);
        }

        $user->fill([
            'full_name' => $googleProfile['name'] ?? $user->full_name ?? Str::before($email, '@'),
            'google_id' => $googleId,
            'avatar' => $googleProfile['picture'] ?? $user->avatar,
            'is_active' => $user->exists ? $user->is_active : true,
        ]);

        if (! $user->exists || blank($user->password)) {
            $user->password = Str::password(32);
        }

        if ($hasVerifiedEmail && ! $user->email_verified_at) {
            $user->email_verified_at = now();
        }

        $user->save();

        if (! $user->is_active) {
            return response()->json([
                'message' => 'This account is inactive.',
            ], 403);
        }

        $token = $user->createToken('user_token')->plainTextToken;

        return response()->json([
            'message' => 'Google sign in successful.',
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'User profile fetched successfully.',
            'data'    => $request->user(),
        ]);
    }

    private function fetchGoogleProfile(string $accessToken): array
    {
        $clientId = config('services.google.client_id');

        if (! $clientId) {
            throw ValidationException::withMessages([
                'access_token' => 'Google sign in is not configured.',
            ]);
        }

        try {
            $tokenInfo = Http::acceptJson()
                ->get('https://www.googleapis.com/oauth2/v1/tokeninfo', [
                    'access_token' => $accessToken,
                ])
                ->throw()
                ->json();

            $audience = $tokenInfo['audience'] ?? $tokenInfo['issued_to'] ?? null;

            if ($audience !== $clientId) {
                throw ValidationException::withMessages([
                    'access_token' => 'Google token audience is invalid.',
                ]);
            }

            $profile = Http::acceptJson()
                ->withToken($accessToken)
                ->get('https://www.googleapis.com/oauth2/v3/userinfo')
                ->throw()
                ->json();
        } catch (RequestException) {
            throw ValidationException::withMessages([
                'access_token' => 'Google token is invalid or has expired.',
            ]);
        }

        return array_merge($tokenInfo, $profile);
    }
}
