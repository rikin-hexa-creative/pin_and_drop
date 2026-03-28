<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CheckoutStoreRequest;
use App\Http\Resources\CheckoutOrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
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
            $product = Product::query()
                ->publicCatalog()
                ->with([
                    'vendor:id,business_name',
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

            $requestedQuantity = (int) $validated['quantity'];

            if (! $variant->isInStock()) {
                throw ValidationException::withMessages([
                    'quantity' => 'This variant is currently out of stock.',
                ]);
            }

            if ($variant->stock_qty < $requestedQuantity) {
                throw ValidationException::withMessages([
                    'quantity' => "Only {$variant->stock_qty} item(s) are available for this variant.",
                ]);
            }

            $unitPrice = (float) $variant->final_price;
            $compareAtPrice = $this->resolveVariantCompareAtPrice($product, $variant, $unitPrice);
            $subtotal = round($unitPrice * $requestedQuantity, 2);
            $totalAmount = $compareAtPrice
                ? round($compareAtPrice * $requestedQuantity, 2)
                : $subtotal;
            $discountAmount = round(max($totalAmount - $subtotal, 0), 2);
            $shippingAmount = 0.00;
            $grandTotal = round($subtotal + $shippingAmount, 2);

            $address = UserAddress::create([
                'user_id' => $user->id,
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

            if (($validated['save_as_default'] ?? false) || ! $user->defaultAddress()->exists()) {
                $address->makeDefault();
            }

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => Order::generateOrderNumber(),
                'status' => 'pending',
                'total_amount' => $totalAmount,
                'discount_amount' => $discountAmount,
                'shipping_amount' => $shippingAmount,
                'grand_total' => $grandTotal,
                'shipping_address_id' => $address->id,
                'notes' => $validated['notes'] ?? null,
            ]);

            OrderItem::create([
                'order_id' => $order->id,
                'vendor_id' => $product->vendor_id,
                'product_id' => $product->id,
                'product_variant_id' => $variant->id,
                'product_name' => $product->name,
                'variant_info' => OrderItem::buildVariantInfo($variant),
                'quantity' => $requestedQuantity,
                'unit_price' => $unitPrice,
                'total_price' => $subtotal,
                'item_status' => 'pending',
            ]);

            Payment::create([
                'order_id' => $order->id,
                'method' => $validated['payment_method'],
                'status' => 'pending',
                'amount' => $grandTotal,
                'gateway_response' => [
                    'message' => 'Gateway integration is not configured yet. Payment remains pending.',
                ],
            ]);

            $variant->decrement('stock_qty', $requestedQuantity);

            return $order->load([
                'shippingAddress',
                'payment',
                'items.vendor:id,business_name',
                'items.product:id,name',
                'items.product.primaryImage:id,product_id,image_url,is_primary',
                'items.product.images:id,product_id,image_url,is_primary,sort_order',
            ]);
        });

        return response()->json([
            'message' => 'Checkout completed successfully.',
            'data' => CheckoutOrderResource::make($order),
        ], 201);
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
