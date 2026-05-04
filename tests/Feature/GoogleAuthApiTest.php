<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

it('creates and signs in a user from a verified google account', function () {
    config()->set('services.google.client_id', 'google-client-id');

    Http::fake([
        'https://www.googleapis.com/oauth2/v1/tokeninfo*' => Http::response([
            'issued_to' => 'google-client-id',
            'audience' => 'google-client-id',
            'verified_email' => true,
        ]),
        'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
            'sub' => 'google-user-123',
            'name' => 'Google Member',
            'email' => 'google-member@example.com',
            'email_verified' => true,
            'picture' => 'https://example.com/avatar.jpg',
        ]),
    ]);

    $response = $this->postJson('/api/auth/google', [
        'access_token' => 'valid-google-token',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('message', 'Google sign in successful.')
        ->assertJsonPath('user.email', 'google-member@example.com')
        ->assertJsonPath('user.google_id', 'google-user-123');

    $user = User::query()->where('email', 'google-member@example.com')->first();

    expect($user)->not->toBeNull();
    expect($user->full_name)->toBe('Google Member');
    expect($user->google_id)->toBe('google-user-123');
    expect($user->avatar)->toBe('https://example.com/avatar.jpg');
    expect($user->email_verified_at)->not->toBeNull();
    expect($response->json('token'))->not->toBeEmpty();
});

it('rejects google sign in when the token cannot be verified', function () {
    config()->set('services.google.client_id', 'google-client-id');

    Http::fake([
        'https://www.googleapis.com/oauth2/v1/tokeninfo*' => Http::response([
            'error' => 'invalid_token',
        ], 401),
    ]);

    $response = $this->postJson('/api/auth/google', [
        'access_token' => 'invalid-google-token',
    ]);

    $response
        ->assertStatus(422)
        ->assertJsonValidationErrors('access_token');

    expect(User::count())->toBe(0);
});
