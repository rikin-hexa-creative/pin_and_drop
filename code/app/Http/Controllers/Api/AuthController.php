<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SignInRequest;
use App\Http\Requests\Auth\SignUpRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

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

    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'User profile fetched successfully.',
            'data'    => $request->user(),
        ]);
    }
}
