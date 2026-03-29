<?php

use App\Models\User;
use App\Models\UserSale;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function createSaleUser(array $overrides = []): User
{
    return User::create(array_merge([
        'full_name' => 'Seller User',
        'email' => 'seller-' . uniqid() . '@example.com',
        'password' => 'password',
        'is_active' => true,
    ], $overrides));
}

it('returns the authenticated users sale listings with search and filters', function () {
    $user = createSaleUser();
    $otherUser = createSaleUser(['email' => 'other-' . uniqid() . '@example.com']);

    UserSale::create([
        'user_id' => $user->id,
        'name' => 'Rick Jacket',
        'description' => 'Black leather archive piece',
        'images' => ['user-sales/1/rick-jacket.jpg'],
        'actual_price' => 240.00,
        'compare_at_price' => 300.00,
        'condition' => 'Excellent',
        'created_date' => '2026-03-20',
        'sale_status' => 'sold',
        'status' => 'inactive',
    ]);

    UserSale::create([
        'user_id' => $user->id,
        'name' => 'Vintage Denim',
        'description' => 'Faded blue denim',
        'images' => ['user-sales/1/vintage-denim.jpg'],
        'actual_price' => 120.00,
        'compare_at_price' => null,
        'condition' => 'Good',
        'created_date' => '2026-03-25',
        'sale_status' => 'not_sold',
        'status' => 'active',
    ]);

    UserSale::create([
        'user_id' => $otherUser->id,
        'name' => 'Hidden Coat',
        'description' => 'Should not appear',
        'images' => ['user-sales/2/hidden-coat.jpg'],
        'actual_price' => 90.00,
        'compare_at_price' => null,
        'condition' => 'Fair',
        'created_date' => '2026-03-29',
        'sale_status' => 'sold',
        'status' => 'active',
    ]);

    Sanctum::actingAs($user);

    $response = $this->getJson('/api/user/sales?search=jacket&sale_status=sold');

    $response
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('meta.summary.all', 2)
        ->assertJsonPath('meta.summary.sold', 1)
        ->assertJsonPath('meta.summary.not_sold', 1)
        ->assertJsonPath('data.0.name', 'Rick Jacket')
        ->assertJsonPath('data.0.sale_status', 'sold')
        ->assertJsonPath('data.0.status', 'inactive')
        ->assertJsonPath('data.0.actual_price_formatted', '240.00')
        ->assertJsonPath('data.0.compare_at_price_formatted', '300.00');
});

it('creates a sale listing with uploaded images for the authenticated user', function () {
    Storage::fake('public');
    $user = createSaleUser();

    Sanctum::actingAs($user);

    $response = $this->postJson('/api/user/sales', [
        'name' => 'Distressed Boots',
        'description' => 'Heavy leather boots with archive wear.',
        'actual_price' => 180,
        'compare_at_price' => 220,
        'condition' => 'Very Good',
        'created_date' => '2026-03-29',
        'sale_status' => 'not_sold',
        'status' => 'active',
        'images' => [
            UploadedFile::fake()->image('boots-front.jpg'),
            UploadedFile::fake()->image('boots-side.jpg'),
        ],
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.name', 'Distressed Boots')
        ->assertJsonPath('data.images_count', 2)
        ->assertJsonPath('data.actual_price_formatted', '180.00')
        ->assertJsonPath('data.compare_at_price_formatted', '220.00')
        ->assertJsonPath('data.sale_status', 'not_sold')
        ->assertJsonPath('data.status', 'active');

    $sale = UserSale::query()->first();

    expect($sale)->not->toBeNull();
    expect($sale->user_id)->toBe($user->id);
    expect($sale->images)->toHaveCount(2);

    foreach ($sale->images as $imagePath) {
        Storage::disk('public')->assertExists($imagePath);
    }
});
