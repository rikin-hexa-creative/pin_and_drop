<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CheckoutStoreRequest;
use App\Http\Resources\CheckoutOrderResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\UserSale;
use App\Models\UserAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    private const PAYMENT_METHODS = [
        [
            'value' => 'cod',
            'label' => 'Cash On Delivery',
            'description' => 'Pay when the order arrives.',
        ],
        [
            'value' => 'stripe',
            'label' => 'Stripe',
            'description' => 'Card payment gateway placeholder.',
        ],
        [
            'value' => 'paypal',
            'label' => 'PayPal',
            'description' => 'PayPal gateway placeholder.',
        ],
        [
            'value' => 'bank_transfer',
            'label' => 'Bank Transfer',
            'description' => 'Manual bank transfer confirmation.',
        ],
        [
            'value' => 'jazzcash',
            'label' => 'JazzCash',
            'description' => 'Mobile wallet payment placeholder.',
        ],
        [
            'value' => 'easypaisa',
            'label' => 'Easypaisa',
            'description' => 'Mobile wallet payment placeholder.',
        ],
    ];

    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('defaultAddress');
        $defaultAddress = $user->defaultAddress;

        return response()->json([
            'data' => [
                'customer' => [
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ],
                'default_address' => $defaultAddress ? [
                    'id' => $defaultAddress->id,
                    'label' => $defaultAddress->label,
                    'full_name' => $defaultAddress->full_name,
                    'phone' => $defaultAddress->phone,
                    'address_line1' => $defaultAddress->address_line1,
                    'address_line2' => $defaultAddress->address_line2,
                    'city' => $defaultAddress->city,
                    'state' => $defaultAddress->state,
                    'postal_code' => $defaultAddress->postal_code,
                    'country' => $defaultAddress->country,
                ] : null,
                'shipping_amount' => 0,
                'shipping_amount_formatted' => '0.00',
                'payment_methods' => self::PAYMENT_METHODS,
            ],
        ]);
    }

    public function store(CheckoutStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $order = DB::transaction(function () use ($validated, $user) {
            $checkoutSource = $validated['source'] ?? 'buy_now';
            $lines = match ($checkoutSource) {
                'cart' => $this->buildCartCheckoutLines($user->id),
                'user_sale' => [$this->buildUserSaleCheckoutLine($validated, $user->id)],
                default => [$this->buildBuyNowCheckoutLine($validated)],
            };
            $subtotal = round(collect($lines)->sum('subtotal'), 2);
            $compareAtTotal = round(collect($lines)->sum('compare_at_total'), 2);
            $discountAmount = round(max($compareAtTotal - $subtotal, 0), 2);
            $shippingAmount = 0.00;
            $grandTotal = round($subtotal + $shippingAmount, 2);
            $address = $this->createShippingAddress($user->id, $validated);

            if (($validated['save_as_default'] ?? false) || ! $user->defaultAddress()->exists()) {
                $address->makeDefault();
            }

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => Order::generateOrderNumber(),
                'status' => 'pending',
                'total_amount' => $compareAtTotal ?: $subtotal,
                'discount_amount' => $discountAmount,
                'shipping_amount' => $shippingAmount,
                'grand_total' => $grandTotal,
                'shipping_address_id' => $address->id,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($lines as $line) {
                $this->createOrderItemFromLine($order, $line);
                $this->finalizeCheckoutLine($line);
            }

            Payment::create([
                'order_id' => $order->id,
                'method' => $validated['payment_method'],
                'status' => 'pending',
                'amount' => $grandTotal,
                'gateway_response' => [
                    'message' => 'Gateway integration is not configured yet. Payment remains pending.',
                ],
            ]);

            if ($checkoutSource === 'cart') {
                Cart::firstOrCreate(['user_id' => $user->id])->clear();
            }

            return $this->loadOrder($order);
        });

        return response()->json([
            'message' => 'Checkout completed successfully.',
            'data' => CheckoutOrderResource::make($order),
        ], 201);
    }

    private function buildBuyNowCheckoutLine(array $validated): array
    {
        $product = Product::query()
            ->publicCatalog()
            ->with([
                'vendor:id,business_name,slug',
                'category:id,name,slug',
                'primaryImage:id,product_id,image_url,is_primary',
                'images:id,product_id,image_url,is_primary,sort_order',
            ])
            ->findOrFail($validated['product_id']);

        $variant = ProductVariant::query()
            ->where('product_id', $product->id)
            ->whereKey($validated['variant_id'])
            ->lockForUpdate()
            ->first();

        if (! $variant) {
            throw ValidationException::withMessages([
                'variant_id' => 'The selected variant does not belong to this product.',
            ]);
        }

        $quantity = (int) $validated['quantity'];

        if (! $variant->isInStock()) {
            throw ValidationException::withMessages([
                'quantity' => 'This variant is currently out of stock.',
            ]);
        }

        if ($variant->stock_qty < $quantity) {
            throw ValidationException::withMessages([
                'quantity' => "Only {$variant->stock_qty} item(s) are available for this variant.",
            ]);
        }

        return $this->buildCheckoutLine($product, $variant, $quantity);
    }

    private function buildUserSaleCheckoutLine(array $validated, int $buyerId): array
    {
        $sale = UserSale::query()
            ->with('user:id,full_name,avatar')
            ->lockForUpdate()
            ->find($validated['user_sale_id']);

        if (! $sale || $sale->status !== 'active' || $sale->sale_status !== 'not_sold') {
            throw ValidationException::withMessages([
                'user_sale_id' => 'This sell listing is no longer available.',
            ]);
        }

        if ((int) $sale->user_id === $buyerId) {
            throw ValidationException::withMessages([
                'user_sale_id' => 'You cannot buy your own sell listing.',
            ]);
        }

        $unitPrice = (float) $sale->actual_price;
        $compareAtPrice = $sale->compare_at_price !== null && (float) $sale->compare_at_price > $unitPrice
            ? (float) $sale->compare_at_price
            : null;

        return [
            'source' => 'user_sale',
            'sale' => $sale,
            'seller' => $sale->user,
            'quantity' => 1,
            'unit_price' => $unitPrice,
            'compare_at_price' => $compareAtPrice,
            'subtotal' => round($unitPrice, 2),
            'compare_at_total' => round($compareAtPrice ?: $unitPrice, 2),
        ];
    }

    private function buildCartCheckoutLines(int $userId): array
    {
        $cart = Cart::firstOrCreate(['user_id' => $userId]);
        $cartItems = CartItem::query()
            ->where('cart_id', $cart->id)
            ->get();

        if ($cartItems->isEmpty()) {
            throw ValidationException::withMessages([
                'source' => 'Your cart is empty.',
            ]);
        }

        return $cartItems->map(function (CartItem $cartItem) {
            $product = Product::query()
                ->publicCatalog()
                ->with([
                    'vendor:id,business_name,slug',
                    'category:id,name,slug',
                    'primaryImage:id,product_id,image_url,is_primary',
                    'images:id,product_id,image_url,is_primary,sort_order',
                ])
                ->find($cartItem->product_id);

            if (! $product) {
                throw ValidationException::withMessages([
                    'source' => 'One or more cart items are no longer available.',
                ]);
            }

            $variant = ProductVariant::query()
                ->where('product_id', $product->id)
                ->whereKey($cartItem->product_variant_id)
                ->lockForUpdate()
                ->first();

            if (! $variant) {
                throw ValidationException::withMessages([
                    'source' => 'One or more cart variants are no longer available.',
                ]);
            }

            if (! $variant->isInStock()) {
                throw ValidationException::withMessages([
                    'source' => "The variant for {$product->name} is currently out of stock.",
                ]);
            }

            if ($variant->stock_qty < $cartItem->quantity) {
                throw ValidationException::withMessages([
                    'source' => "Only {$variant->stock_qty} item(s) are available for {$product->name}.",
                ]);
            }

            return $this->buildCheckoutLine($product, $variant, (int) $cartItem->quantity);
        })->values()->all();
    }

    private function buildCheckoutLine(Product $product, ProductVariant $variant, int $quantity): array
    {
        $unitPrice = (float) $variant->final_price;
        $compareAtPrice = $this->resolveVariantCompareAtPrice($product, $variant, $unitPrice);
        $subtotal = round($unitPrice * $quantity, 2);

        return [
            'source' => 'product',
            'product' => $product,
            'variant' => $variant,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'compare_at_price' => $compareAtPrice,
            'subtotal' => $subtotal,
            'compare_at_total' => round(($compareAtPrice ?: $unitPrice) * $quantity, 2),
        ];
    }

    private function createOrderItemFromLine(Order $order, array $line): void
    {
        if (($line['source'] ?? 'product') === 'user_sale') {
            OrderItem::create([
                'order_id' => $order->id,
                'item_source' => 'user_sale',
                'vendor_id' => null,
                'product_id' => null,
                'product_variant_id' => null,
                'user_sale_id' => $line['sale']->id,
                'sale_seller_user_id' => $line['seller']?->id,
                'seller_name' => $line['seller']?->full_name ?? $line['sale']->user?->full_name,
                'product_name' => $line['sale']->name,
                'variant_info' => OrderItem::buildUserSaleInfo($line['sale']),
                'quantity' => $line['quantity'],
                'unit_price' => $line['unit_price'],
                'total_price' => $line['subtotal'],
                'item_status' => 'pending',
            ]);

            return;
        }

        OrderItem::create([
            'order_id' => $order->id,
            'item_source' => 'product',
            'vendor_id' => $line['product']->vendor_id,
            'product_id' => $line['product']->id,
            'product_variant_id' => $line['variant']->id,
            'user_sale_id' => null,
            'sale_seller_user_id' => null,
            'seller_name' => null,
            'product_name' => $line['product']->name,
            'variant_info' => OrderItem::buildVariantInfo($line['variant']),
            'quantity' => $line['quantity'],
            'unit_price' => $line['unit_price'],
            'total_price' => $line['subtotal'],
            'item_status' => 'pending',
        ]);
    }

    private function finalizeCheckoutLine(array $line): void
    {
        if (($line['source'] ?? 'product') === 'user_sale') {
            $line['sale']->update([
                'sale_status' => 'sold',
                'status' => 'inactive',
            ]);

            return;
        }

        $line['variant']->decrement('stock_qty', $line['quantity']);
    }

    private function createShippingAddress(int $userId, array $validated): UserAddress
    {
        return UserAddress::create([
            'user_id' => $userId,
            'label' => $validated['shipping_address']['label'] ?? 'Shipping',
            'full_name' => $validated['shipping_address']['full_name'],
            'phone' => $validated['shipping_address']['phone'],
            'address_line1' => $validated['shipping_address']['address_line1'],
            'address_line2' => $validated['shipping_address']['address_line2'] ?? null,
            'city' => $validated['shipping_address']['city'],
            'state' => $validated['shipping_address']['state'] ?? null,
            'postal_code' => $validated['shipping_address']['postal_code'],
            'country' => $validated['shipping_address']['country'],
            'is_default' => false,
        ]);
    }

    private function loadOrder(Order $order): Order
    {
        return $order->load([
            'shippingAddress',
            'payment',
            'items.vendor:id,business_name,slug',
            'items.product:id,name,slug',
            'items.product.primaryImage:id,product_id,image_url,is_primary',
            'items.product.images:id,product_id,image_url,is_primary,sort_order',
            'items.userSale:id,user_id,name,images,actual_price,compare_at_price,condition,created_date,sale_status,status',
            'items.saleSeller:id,full_name,avatar',
        ]);
    }

    private function resolveVariantCompareAtPrice(Product $product, ProductVariant $variant, float $unitPrice): ?float
    {
        $compareAtPrice = collect([
            $variant->actual_price,
            $variant->selling_price,
            $product->base_price,
        ])
            ->filter()
            ->map(fn ($value) => (float) $value)
            ->first(fn ($value) => $value > $unitPrice);

        return $compareAtPrice ?: null;
    }
}
