<?php

use App\Models\User;
use App\Models\UserSale;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
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

it('returns a public sell feed with active unsold listings only and supports filters', function () {
    $seller = createSaleUser(['full_name' => 'Archive Seller']);
    $otherSeller = createSaleUser([
        'email' => 'public-' . uniqid() . '@example.com',
        'full_name' => 'Second Seller',
    ]);

    UserSale::create([
        'user_id' => $seller->id,
        'name' => 'Guidi Back Zip Boots',
        'description' => 'Black leather boots with stacked heel.',
        'images' => ['user-sales/public/guidi-boots.jpg'],
        'actual_price' => 280.00,
        'compare_at_price' => 320.00,
        'condition' => 'Excellent',
        'created_date' => '2026-03-28',
        'sale_status' => 'not_sold',
        'status' => 'active',
    ]);

    UserSale::create([
        'user_id' => $otherSeller->id,
        'name' => 'Vintage Coat',
        'description' => 'Long wool coat.',
        'images' => ['user-sales/public/vintage-coat.jpg'],
        'actual_price' => 180.00,
        'compare_at_price' => null,
        'condition' => 'Good',
        'created_date' => '2026-03-20',
        'sale_status' => 'not_sold',
        'status' => 'active',
    ]);

    UserSale::create([
        'user_id' => $seller->id,
        'name' => 'Sold Hidden Jacket',
        'description' => 'Should not appear in sell feed.',
        'images' => ['user-sales/public/sold-hidden.jpg'],
        'actual_price' => 210.00,
        'compare_at_price' => null,
        'condition' => 'Excellent',
        'created_date' => '2026-03-22',
        'sale_status' => 'sold',
        'status' => 'active',
    ]);

    UserSale::create([
        'user_id' => $seller->id,
        'name' => 'Inactive Hidden Bag',
        'description' => 'Should not appear in sell feed.',
        'images' => ['user-sales/public/inactive-hidden.jpg'],
        'actual_price' => 190.00,
        'compare_at_price' => null,
        'condition' => 'Very Good',
        'created_date' => '2026-03-24',
        'sale_status' => 'not_sold',
        'status' => 'inactive',
    ]);

    $response = $this->getJson('/api/sell?search=boots&condition[]=Excellent&min_price=200&max_price=300&per_page=1');

    $response
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('meta.next_page', null)
        ->assertJsonPath('meta.filters.conditions.0.value', 'Excellent')
        ->assertJsonPath('data.0.name', 'Guidi Back Zip Boots')
        ->assertJsonPath('data.0.seller.name', 'Archive Seller')
        ->assertJsonPath('data.0.status', 'active')
        ->assertJsonPath('data.0.sale_status', 'not_sold');
});

it('returns a public sell product detail only for active unsold listings', function () {
    $seller = createSaleUser(['full_name' => 'Archive Seller']);

    $sale = UserSale::create([
        'user_id' => $seller->id,
        'name' => 'Carol Christian Poell Bag',
        'description' => 'Rare horse leather bag.',
        'images' => [
            'user-sales/public/ccp-bag-main.jpg',
            'user-sales/public/ccp-bag-detail.jpg',
        ],
        'actual_price' => 520.00,
        'compare_at_price' => 580.00,
        'condition' => 'Very Good',
        'created_date' => '2026-03-27',
        'sale_status' => 'not_sold',
        'status' => 'active',
    ]);

    $hiddenSale = UserSale::create([
        'user_id' => $seller->id,
        'name' => 'Hidden Sold Bag',
        'description' => 'No longer public.',
        'images' => ['user-sales/public/hidden-sold-bag.jpg'],
        'actual_price' => 410.00,
        'compare_at_price' => null,
        'condition' => 'Good',
        'created_date' => '2026-03-21',
        'sale_status' => 'sold',
        'status' => 'active',
    ]);

    $response = $this->getJson("/api/sell/{$sale->id}");

    $response
        ->assertOk()
        ->assertJsonPath('data.id', $sale->id)
        ->assertJsonPath('data.name', 'Carol Christian Poell Bag')
        ->assertJsonPath('data.seller.name', 'Archive Seller')
        ->assertJsonPath('data.gallery.0.src', url('storage/user-sales/public/ccp-bag-main.jpg'))
        ->assertJsonPath('data.gallery.1.src', url('storage/user-sales/public/ccp-bag-detail.jpg'));

    $this->getJson("/api/sell/{$hiddenSale->id}")
        ->assertNotFound();
});

it('creates an order from a user sale checkout and marks the listing sold', function () {
    $seller = createSaleUser(['full_name' => 'Sell Seller']);
    $buyer = createSaleUser([
        'email' => 'buyer-' . uniqid() . '@example.com',
        'full_name' => 'Sell Buyer',
        'phone' => '9800000000',
    ]);

    $sale = UserSale::create([
        'user_id' => $seller->id,
        'name' => 'Archive Leather Vest',
        'description' => 'Single-piece user listing.',
        'images' => ['user-sales/public/archive-leather-vest.jpg'],
        'actual_price' => 360.00,
        'compare_at_price' => 420.00,
        'condition' => 'Excellent',
        'created_date' => '2026-03-29',
        'sale_status' => 'not_sold',
        'status' => 'active',
    ]);

    Sanctum::actingAs($buyer);

    $response = $this->postJson('/api/checkout', [
        'source' => 'user_sale',
        'user_sale_id' => $sale->id,
        'payment_method' => 'cod',
        'shipping_address' => [
            'label' => 'Home',
            'full_name' => 'Sell Buyer',
            'phone' => '9800000000',
            'address_line1' => 'Durbar Marg',
            'city' => 'Kathmandu',
            'state' => 'Bagmati',
            'postal_code' => '44600',
            'country' => 'Nepal',
        ],
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.item.item_source', 'user_sale')
        ->assertJsonPath('data.item.user_sale_id', $sale->id)
        ->assertJsonPath('data.item.product_name', 'Archive Leather Vest')
        ->assertJsonPath('data.item.brand', 'Sell Seller')
        ->assertJsonPath('data.item.quantity', 1)
        ->assertJsonPath('data.grand_total', 360)
        ->assertJsonPath('data.discount_amount', 60);

    expect(Order::count())->toBe(1);
    expect(OrderItem::count())->toBe(1);
    expect(Payment::count())->toBe(1);

    $orderItem = OrderItem::query()->first();

    expect($orderItem->item_source)->toBe('user_sale');
    expect($orderItem->user_sale_id)->toBe($sale->id);
    expect($orderItem->seller_name)->toBe('Sell Seller');
    expect($orderItem->product_id)->toBeNull();
    expect($orderItem->vendor_id)->toBeNull();
    expect($sale->fresh()->sale_status)->toBe('sold');
    expect($sale->fresh()->status)->toBe('inactive');

    $this->getJson('/api/users/orders')
        ->assertOk()
        ->assertJsonPath('data.0.items.0.item_source', 'user_sale')
        ->assertJsonPath('data.0.items.0.seller.name', 'Sell Seller')
        ->assertJsonPath('data.0.items.0.product_link', null);

    $this->getJson("/api/sell/{$sale->id}")
        ->assertNotFound();
});

it('rejects user sale checkout when the buyer owns the listing', function () {
    $seller = createSaleUser([
        'full_name' => 'Self Seller',
        'phone' => '9800000001',
    ]);

    $sale = UserSale::create([
        'user_id' => $seller->id,
        'name' => 'Cannot Buy Myself',
        'description' => 'Owner should not purchase this listing.',
        'images' => ['user-sales/public/cannot-buy-myself.jpg'],
        'actual_price' => 120.00,
        'compare_at_price' => null,
        'condition' => 'Good',
        'created_date' => '2026-03-29',
        'sale_status' => 'not_sold',
        'status' => 'active',
    ]);

    Sanctum::actingAs($seller);

    $this->postJson('/api/checkout', [
        'source' => 'user_sale',
        'user_sale_id' => $sale->id,
        'payment_method' => 'cod',
        'shipping_address' => [
            'label' => 'Home',
            'full_name' => 'Self Seller',
            'phone' => '9800000001',
            'address_line1' => 'Patan',
            'city' => 'Lalitpur',
            'state' => 'Bagmati',
            'postal_code' => '44700',
            'country' => 'Nepal',
        ],
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('user_sale_id');

    expect(Order::count())->toBe(0);
    expect(OrderItem::count())->toBe(0);
    expect(Payment::count())->toBe(0);
    expect($sale->fresh()->sale_status)->toBe('not_sold');
});
