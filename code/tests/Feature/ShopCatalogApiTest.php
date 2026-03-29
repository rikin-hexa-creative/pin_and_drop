<?php

use App\Models\Admin;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\Size;
use App\Models\User;
use App\Models\UserAddress;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function createAdmin(array $overrides = []): Admin
{
    return Admin::create(array_merge([
        'full_name' => 'Test Admin',
        'email' => 'admin-' . Str::random(8) . '@example.com',
        'password' => 'password',
        'role' => 'super_admin',
        'is_active' => true,
    ], $overrides));
}

function createVendor(Admin $admin, array $overrides = []): Vendor
{
    $businessName = $overrides['business_name'] ?? ('Vendor ' . Str::random(6));

    return Vendor::create(array_merge([
        'business_name' => $businessName,
        'slug' => Str::slug($businessName . '-' . Str::random(4)),
        'email' => Str::slug($businessName) . '-' . Str::random(6) . '@example.com',
        'password' => 'password',
        'status' => 'approved',
        'approved_by' => $admin->id,
        'approved_at' => now(),
    ], $overrides));
}

function createCategory(Admin $admin, array $overrides = []): Category
{
    $name = $overrides['name'] ?? ('Category ' . Str::random(6));
    $isApproved = $overrides['is_approved'] ?? true;

    return Category::create(array_merge([
        'name' => $name,
        'slug' => Str::slug($name . '-' . Str::random(4)),
        'is_active' => true,
        'is_approved' => $isApproved,
        'sort_order' => 1,
        'created_by' => $admin->id,
        'approved_by' => $isApproved ? $admin->id : null,
        'approved_at' => $isApproved ? now() : null,
    ], $overrides));
}

function createProduct(Vendor $vendor, Category $category, array $overrides = []): Product
{
    $name = $overrides['name'] ?? ('Product ' . Str::random(6));

    return Product::create(array_merge([
        'vendor_id' => $vendor->id,
        'category_id' => $category->id,
        'name' => $name,
        'slug' => Str::slug($name . '-' . Str::random(4)),
        'description' => 'Catalog test product',
        'base_price' => 250,
        'discount_price' => null,
        'sku' => 'SKU-' . Str::upper(Str::random(8)),
        'status' => 'active',
        'is_featured' => false,
    ], $overrides));
}

function createVariant(Product $product, array $overrides = []): ProductVariant
{
    return ProductVariant::create(array_merge([
        'product_id' => $product->id,
        'size' => 'M',
        'color' => '#111111',
        'stock_qty' => 5,
        'actual_price' => 200,
        'selling_price' => 180,
        'offer_price' => 150,
        'sku' => 'VAR-' . Str::upper(Str::random(8)),
    ], $overrides));
}

function createUser(array $overrides = []): User
{
    return User::create(array_merge([
        'full_name' => 'User ' . Str::random(6),
        'email' => 'user-' . Str::random(8) . '@example.com',
        'password' => 'password',
        'is_active' => true,
    ], $overrides));
}

function createAddress(User $user, array $overrides = []): UserAddress
{
    return UserAddress::create(array_merge([
        'user_id' => $user->id,
        'label' => 'Home',
        'full_name' => $user->full_name,
        'phone' => '1234567890',
        'address_line1' => '123 Archive Street',
        'city' => 'Lahore',
        'postal_code' => '54000',
        'country' => 'Pakistan',
        'is_default' => true,
    ], $overrides));
}

function createOrder(User $user, UserAddress $address, array $overrides = []): Order
{
    return Order::create(array_merge([
        'user_id' => $user->id,
        'order_number' => 'ORD-' . Str::upper(Str::random(8)),
        'status' => 'delivered',
        'total_amount' => 200,
        'discount_amount' => 0,
        'shipping_amount' => 0,
        'grand_total' => 200,
        'shipping_address_id' => $address->id,
    ], $overrides));
}

function createOrderItem(Order $order, Product $product, ?ProductVariant $variant = null, array $overrides = []): OrderItem
{
    return OrderItem::create(array_merge([
        'order_id' => $order->id,
        'vendor_id' => $product->vendor_id,
        'product_id' => $product->id,
        'product_variant_id' => $variant?->id,
        'product_name' => $product->name,
        'variant_info' => OrderItem::buildVariantInfo($variant),
        'quantity' => 1,
        'unit_price' => 150,
        'total_price' => 150,
        'item_status' => 'pending',
    ], $overrides));
}

function createReview(User $user, Product $product, Order $order, array $overrides = []): Review
{
    return Review::create(array_merge([
        'user_id' => $user->id,
        'product_id' => $product->id,
        'order_id' => $order->id,
        'rating' => 4,
        'comment' => 'Strong construction and excellent leather quality.',
        'is_approved' => true,
    ], $overrides));
}

it('returns only approved categories with public active products', function () {
    $admin = createAdmin();
    $approvedVendor = createVendor($admin, ['business_name' => 'Archive Studio']);
    $pendingVendor = createVendor($admin, [
        'business_name' => 'Pending Studio',
        'status' => 'pending',
        'approved_by' => null,
        'approved_at' => null,
    ]);

    $visibleCategory = createCategory($admin, ['name' => 'Outerwear']);
    $hiddenCategory = createCategory($admin, [
        'name' => 'Hidden Category',
        'is_approved' => false,
    ]);
    $inactiveCategory = createCategory($admin, [
        'name' => 'Inactive Category',
        'is_active' => false,
    ]);

    createProduct($approvedVendor, $visibleCategory, ['name' => 'Visible Coat']);
    createProduct($approvedVendor, $visibleCategory, [
        'name' => 'Draft Coat',
        'status' => 'draft',
    ]);
    createProduct($approvedVendor, $hiddenCategory, ['name' => 'Hidden Coat']);
    createProduct($approvedVendor, $inactiveCategory, ['name' => 'Inactive Coat']);
    createProduct($pendingVendor, $visibleCategory, ['name' => 'Pending Vendor Coat']);

    $response = $this->getJson('/api/categories');

    $response
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Outerwear')
        ->assertJsonPath('data.0.products_count', 1);
});

it('filters products by search, category, size, color, and price range', function () {
    $admin = createAdmin();
    $vendor = createVendor($admin, ['business_name' => 'Rick Archive']);
    $category = createCategory($admin, ['name' => 'Jackets']);
    $hiddenCategory = createCategory($admin, [
        'name' => 'Hidden Jackets',
        'is_approved' => false,
    ]);

    Size::create(['name' => 'M', 'is_active' => true, 'sort_order' => 1]);
    Size::create(['name' => 'L', 'is_active' => true, 'sort_order' => 2]);

    $matchingProduct = createProduct($vendor, $category, [
        'name' => 'Leather Jacket',
        'base_price' => 320,
    ]);
    createVariant($matchingProduct, [
        'size' => 'M',
        'color' => '#111111',
        'actual_price' => 240,
        'selling_price' => 180,
        'offer_price' => 150,
    ]);
    ProductImage::create([
        'product_id' => $matchingProduct->id,
        'image_url' => 'products/leather-jacket.jpg',
        'is_primary' => true,
        'sort_order' => 1,
    ]);

    $nonMatchingProduct = createProduct($vendor, $category, [
        'name' => 'Wool Blazer',
        'base_price' => 480,
    ]);
    createVariant($nonMatchingProduct, [
        'size' => 'L',
        'color' => '#ff0000',
        'actual_price' => 480,
        'selling_price' => 420,
        'offer_price' => 390,
    ]);

    $inactiveProduct = createProduct($vendor, $category, [
        'name' => 'Inactive Leather',
        'status' => 'inactive',
    ]);
    createVariant($inactiveProduct);

    $hiddenCategoryProduct = createProduct($vendor, $hiddenCategory, [
        'name' => 'Hidden Leather',
    ]);
    createVariant($hiddenCategoryProduct);

    $query = http_build_query([
        'search' => 'leather',
        'category' => [$category->id],
        'size' => ['M'],
        'color' => ['#111111'],
        'sort' => 'price_asc',
        'min_price' => 100,
        'max_price' => 200,
    ]);

    $response = $this->getJson("/api/products?{$query}");

    $response
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.name', 'Leather Jacket')
        ->assertJsonPath('data.0.brand', 'Rick Archive')
        ->assertJsonPath('data.0.price', 150)
        ->assertJsonPath('data.0.size', 'M');
});

it('returns shop filter metadata from active public products only', function () {
    $admin = createAdmin();
    $vendor = createVendor($admin, ['business_name' => 'Studio Black']);
    $pendingVendor = createVendor($admin, [
        'business_name' => 'Studio Pending',
        'status' => 'pending',
        'approved_by' => null,
        'approved_at' => null,
    ]);
    $category = createCategory($admin, ['name' => 'Tops']);
    $hiddenCategory = createCategory($admin, [
        'name' => 'Secret Tops',
        'is_approved' => false,
    ]);

    Size::create(['name' => 'S', 'is_active' => true, 'sort_order' => 1]);
    Size::create(['name' => 'M', 'is_active' => true, 'sort_order' => 2]);

    $visibleProduct = createProduct($vendor, $category, ['name' => 'Visible Tee']);
    createVariant($visibleProduct, [
        'size' => 'M',
        'color' => '#222222',
        'offer_price' => 90,
        'selling_price' => 120,
        'actual_price' => 140,
    ]);

    $pendingVendorProduct = createProduct($pendingVendor, $category, [
        'name' => 'Pending Tee',
    ]);
    createVariant($pendingVendorProduct, [
        'size' => 'S',
        'color' => '#ff00ff',
        'offer_price' => 40,
        'selling_price' => 60,
        'actual_price' => 80,
    ]);

    $hiddenCategoryProduct = createProduct($vendor, $hiddenCategory, [
        'name' => 'Hidden Tee',
    ]);
    createVariant($hiddenCategoryProduct, [
        'size' => 'S',
        'color' => '#00ff00',
        'offer_price' => 70,
        'selling_price' => 90,
        'actual_price' => 120,
    ]);

    $response = $this->getJson('/api/products/filters');

    $response->assertOk();

    expect($response->json('data.designers'))->toHaveCount(1);
    expect($response->json('data.designers.0.name'))->toBe('Studio Black');
    expect($response->json('data.categories.0.name'))->toBe('Tops');
    expect(collect($response->json('data.sizes'))->pluck('name')->all())->toBe(['M']);
    expect(collect($response->json('data.colors'))->pluck('value')->all())->toBe(['#222222']);
    expect($response->json('data.price_range.min'))->toBe(90);
    expect($response->json('data.price_range.max'))->toBe(90);
});

it('returns dynamic product detail data for a public catalog product', function () {
    $admin = createAdmin();
    $vendor = createVendor($admin, ['business_name' => 'Detail Studio']);
    $category = createCategory($admin, ['name' => 'Leather']);
    $product = createProduct($vendor, $category, [
        'name' => 'Detail Jacket',
        'description' => '<p>Rich detail narrative.</p>',
        'size_chart' => '<table><tr><td>48</td></tr></table>',
        'is_featured' => true,
    ]);

    ProductImage::create([
        'product_id' => $product->id,
        'image_url' => 'products/detail-jacket-main.jpg',
        'is_primary' => true,
        'sort_order' => 1,
    ]);

    $firstVariant = createVariant($product, [
        'size' => '48',
        'color' => '#111111',
        'stock_qty' => 3,
        'actual_price' => 450,
        'selling_price' => 400,
        'offer_price' => 350,
        'image_url' => 'product-variants/detail-jacket-black.jpg',
        'images' => ['product-variants/detail-jacket-black-alt.jpg'],
    ]);

    createVariant($product, [
        'size' => '50',
        'color' => '#999999',
        'stock_qty' => 0,
        'actual_price' => 470,
        'selling_price' => 420,
        'offer_price' => 390,
    ]);

    $user = createUser(['full_name' => 'Marc G.']);
    $address = createAddress($user);
    $order = createOrder($user, $address);

    createReview($user, $product, $order, [
        'rating' => 5,
        'comment' => 'Archive-level quality and excellent condition.',
    ]);

    $response = $this->getJson("/api/products/{$product->id}");

    $response
        ->assertOk()
        ->assertJsonPath('data.id', $product->id)
        ->assertJsonPath('data.name', 'Detail Jacket')
        ->assertJsonPath('data.brand', 'Detail Studio')
        ->assertJsonPath('data.category.name', 'Leather')
        ->assertJsonPath('data.badge', 'Featured')
        ->assertJsonPath('data.default_variant_id', $firstVariant->id)
        ->assertJsonPath('data.review_summary.count', 1)
        ->assertJsonPath('data.reviews.0.author', 'Marc G.')
        ->assertJsonPath('data.variants.0.size', '48')
        ->assertJsonPath('data.variants.0.price', 350)
        ->assertJsonPath('data.gallery.0.src', url('storage/products/detail-jacket-main.jpg'));
});

it('returns checkout defaults for the authenticated user', function () {
    $user = createUser([
        'full_name' => 'Checkout User',
        'email' => 'checkout@example.com',
        'phone' => '03001234567',
    ]);
    $address = createAddress($user, [
        'label' => 'Studio',
        'city' => 'Karachi',
    ]);

    Sanctum::actingAs($user);

    $response = $this->getJson('/api/checkout');

    $response
        ->assertOk()
        ->assertJsonPath('data.customer.full_name', 'Checkout User')
        ->assertJsonPath('data.customer.email', 'checkout@example.com')
        ->assertJsonPath('data.default_address.id', $address->id)
        ->assertJsonPath('data.default_address.city', 'Karachi')
        ->assertJsonPath('data.payment_methods.0.value', 'cod');
});

it('adds items to the authenticated users cart and returns cart totals', function () {
    $admin = createAdmin();
    $vendor = createVendor($admin, ['business_name' => 'Cart Studio']);
    $category = createCategory($admin, ['name' => 'Bags']);
    $product = createProduct($vendor, $category, ['name' => 'Cart Bag']);
    $variant = createVariant($product, [
        'offer_price' => 120,
        'stock_qty' => 4,
    ]);
    $user = createUser();

    Sanctum::actingAs($user);

    $response = $this->postJson('/api/cart/items', [
        'product_id' => $product->id,
        'variant_id' => $variant->id,
        'quantity' => 2,
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.items_count', 2)
        ->assertJsonPath('data.items.0.product_name', 'Cart Bag')
        ->assertJsonPath('data.items.0.quantity', 2)
        ->assertJsonPath('data.totals.subtotal', 240);

    expect(Cart::count())->toBe(1);
    expect(CartItem::count())->toBe(1);
});

it('creates an order, payment, and decrements stock during checkout', function () {
    $admin = createAdmin();
    $vendor = createVendor($admin, ['business_name' => 'Checkout Studio']);
    $category = createCategory($admin, ['name' => 'Outerwear']);
    $product = createProduct($vendor, $category, [
        'name' => 'Checkout Coat',
        'base_price' => 520,
    ]);
    $variant = createVariant($product, [
        'size' => 'L',
        'color' => '#000000',
        'stock_qty' => 5,
        'actual_price' => 520,
        'selling_price' => 470,
        'offer_price' => 430,
    ]);

    $user = createUser([
        'full_name' => 'Buyer One',
        'phone' => '03005551234',
    ]);
    createAddress($user, ['is_default' => true]);

    Sanctum::actingAs($user);

    $response = $this->postJson('/api/checkout', [
        'product_id' => $product->id,
        'variant_id' => $variant->id,
        'quantity' => 2,
        'payment_method' => 'cod',
        'notes' => 'Leave at reception.',
        'save_as_default' => true,
        'shipping_address' => [
            'label' => 'Office',
            'full_name' => 'Buyer One',
            'phone' => '03005551234',
            'address_line1' => '45 Archive Avenue',
            'address_line2' => 'Floor 3',
            'city' => 'Lahore',
            'state' => 'Punjab',
            'postal_code' => '54000',
            'country' => 'Pakistan',
        ],
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonPath('data.payment_status', 'pending')
        ->assertJsonPath('data.payment_method', 'cod')
        ->assertJsonPath('data.item.product_name', 'Checkout Coat')
        ->assertJsonPath('data.item.quantity', 2)
        ->assertJsonPath('data.grand_total', 860)
        ->assertJsonPath('data.discount_amount', 180);

    expect(Order::count())->toBe(1);
    expect(OrderItem::count())->toBe(1);
    expect(Payment::count())->toBe(1);
    expect($variant->fresh()->stock_qty)->toBe(3);
});

it('checks out the authenticated users cart and clears it after order creation', function () {
    $admin = createAdmin();
    $vendor = createVendor($admin, ['business_name' => 'Cart Checkout Studio', 'slug' => 'cart-checkout-studio']);
    $category = createCategory($admin, ['name' => 'Shoes']);
    $productA = createProduct($vendor, $category, ['name' => 'Cart Boot']);
    $productB = createProduct($vendor, $category, ['name' => 'Cart Sneaker']);
    $variantA = createVariant($productA, [
        'size' => '42',
        'offer_price' => 180,
        'selling_price' => 220,
        'actual_price' => 250,
        'stock_qty' => 3,
    ]);
    $variantB = createVariant($productB, [
        'size' => '43',
        'offer_price' => 90,
        'selling_price' => 120,
        'actual_price' => 150,
        'stock_qty' => 5,
    ]);
    $user = createUser([
        'full_name' => 'Cart Buyer',
        'phone' => '03009990000',
    ]);

    Sanctum::actingAs($user);

    $this->postJson('/api/cart/items', [
        'product_id' => $productA->id,
        'variant_id' => $variantA->id,
        'quantity' => 2,
    ])->assertCreated();
    $this->postJson('/api/cart/items', [
        'product_id' => $productB->id,
        'variant_id' => $variantB->id,
        'quantity' => 1,
    ])->assertCreated();

    $response = $this->postJson('/api/checkout', [
        'source' => 'cart',
        'payment_method' => 'cod',
        'save_as_default' => true,
        'shipping_address' => [
            'label' => 'Home',
            'full_name' => 'Cart Buyer',
            'phone' => '03009990000',
            'address_line1' => '99 Cart Street',
            'city' => 'Lahore',
            'state' => 'Punjab',
            'postal_code' => '54000',
            'country' => 'Pakistan',
        ],
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.items_count', 2)
        ->assertJsonPath('data.items.0.product_name', 'Cart Boot')
        ->assertJsonPath('data.items.1.product_name', 'Cart Sneaker')
        ->assertJsonPath('data.grand_total', 450);

    expect(Order::count())->toBe(1);
    expect(OrderItem::count())->toBe(2);
    expect(CartItem::count())->toBe(0);
    expect($variantA->fresh()->stock_qty)->toBe(1);
    expect($variantB->fresh()->stock_qty)->toBe(4);
});

it('rejects checkout when requested quantity exceeds stock', function () {
    $admin = createAdmin();
    $vendor = createVendor($admin, ['business_name' => 'Stock Studio']);
    $category = createCategory($admin, ['name' => 'Accessories']);
    $product = createProduct($vendor, $category, ['name' => 'Limited Bag']);
    $variant = createVariant($product, [
        'stock_qty' => 1,
        'offer_price' => 180,
    ]);
    $user = createUser();

    Sanctum::actingAs($user);

    $response = $this->postJson('/api/checkout', [
        'product_id' => $product->id,
        'variant_id' => $variant->id,
        'quantity' => 2,
        'payment_method' => 'cod',
        'shipping_address' => [
            'full_name' => $user->full_name,
            'phone' => '03001112222',
            'address_line1' => '10 Stock Lane',
            'city' => 'Islamabad',
            'postal_code' => '44000',
            'country' => 'Pakistan',
        ],
    ]);

    $response
        ->assertStatus(422)
        ->assertJsonValidationErrors('quantity');

    expect(Order::count())->toBe(0);
    expect(Payment::count())->toBe(0);
    expect($variant->fresh()->stock_qty)->toBe(1);
});

it('returns the authenticated users orders with nested item and vendor details', function () {
    $admin = createAdmin();
    $vendor = createVendor($admin, ['business_name' => 'Ordered Studio', 'slug' => 'ordered-studio']);
    $category = createCategory($admin, ['name' => 'Coats']);
    $product = createProduct($vendor, $category, ['name' => 'Ordered Coat']);
    $variant = createVariant($product, [
        'size' => 'M',
        'color' => '#111111',
        'offer_price' => 150,
    ]);

    ProductImage::create([
        'product_id' => $product->id,
        'image_url' => 'products/ordered-coat.jpg',
        'is_primary' => true,
        'sort_order' => 1,
    ]);

    $user = createUser(['full_name' => 'Orders User']);
    $address = createAddress($user, ['city' => 'Lahore']);
    $order = createOrder($user, $address, [
        'order_number' => 'ORD-ORDERS-001',
        'status' => 'confirmed',
        'discount_amount' => 20,
        'shipping_amount' => 10,
        'grand_total' => 290,
    ]);

    createOrderItem($order, $product, $variant, [
        'quantity' => 2,
        'unit_price' => 140,
        'total_price' => 280,
        'item_status' => 'confirmed',
    ]);

    Payment::create([
        'order_id' => $order->id,
        'method' => 'cod',
        'status' => 'pending',
        'amount' => 290,
    ]);

    $otherUser = createUser();
    $otherAddress = createAddress($otherUser);
    $otherOrder = createOrder($otherUser, $otherAddress, [
        'order_number' => 'ORD-OTHER-001',
    ]);
    createOrderItem($otherOrder, $product, $variant);

    Sanctum::actingAs($user);

    $response = $this->getJson('/api/users/orders');

    $response
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.order_number', 'ORD-ORDERS-001')
        ->assertJsonPath('data.0.items.0.product_name', 'Ordered Coat')
        ->assertJsonPath('data.0.items.0.vendor.name', 'Ordered Studio')
        ->assertJsonPath('data.0.items.0.vendor.link', '/vendors/ordered-studio')
        ->assertJsonPath('data.0.items.0.quantity', 2)
        ->assertJsonPath('data.0.items.0.total_price', 280)
        ->assertJsonPath('data.0.shipping_address.full_address', '123 Archive Street, Lahore, 54000, Pakistan');
});

it('returns a public vendor profile with public posted products only', function () {
    $admin = createAdmin();
    $vendor = createVendor($admin, [
        'business_name' => 'Profile Studio',
        'slug' => 'profile-studio',
        'description' => 'Architectural tailoring and archive outerwear.',
        'logo' => 'vendors/profile-studio/logo.jpg',
        'banner' => 'vendors/profile-studio/banner.jpg',
    ]);
    $category = createCategory($admin, ['name' => 'Outerwear']);

    $visibleProduct = createProduct($vendor, $category, [
        'name' => 'Profile Coat',
        'is_featured' => true,
    ]);
    createVariant($visibleProduct, [
        'offer_price' => 180,
        'selling_price' => 220,
        'actual_price' => 260,
    ]);
    ProductImage::create([
        'product_id' => $visibleProduct->id,
        'image_url' => 'products/profile-coat.jpg',
        'is_primary' => true,
        'sort_order' => 1,
    ]);

    $hiddenProduct = createProduct($vendor, $category, [
        'name' => 'Hidden Draft',
        'status' => 'draft',
    ]);
    createVariant($hiddenProduct);

    $user = createUser();
    $address = createAddress($user);
    $order = createOrder($user, $address);
    createOrderItem($order, $visibleProduct, $visibleProduct->variants()->first(), [
        'item_status' => 'delivered',
    ]);

    $response = $this->getJson('/api/vendors/profile-studio');

    $response
        ->assertOk()
        ->assertJsonPath('data.name', 'Profile Studio')
        ->assertJsonPath('data.slug', 'profile-studio')
        ->assertJsonPath('data.profile_link', '/vendors/profile-studio')
        ->assertJsonPath('data.stats.products_count', 1)
        ->assertJsonPath('data.stats.featured_products_count', 1)
        ->assertJsonPath('data.stats.sold_items_count', 1)
        ->assertJsonPath('data.products.0.name', 'Profile Coat')
        ->assertJsonMissing(['name' => 'Hidden Draft']);
});
