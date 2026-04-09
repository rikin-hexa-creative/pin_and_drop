<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CartItemStoreRequest;
use App\Http\Requests\Api\CartItemUpdateRequest;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $cart = $this->resolveCart($request->user()->id);

        return response()->json([
            'data' => CartResource::make($cart),
        ]);
    }

    public function storeItem(CartItemStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $cart = DB::transaction(function () use ($request, $validated) {
            $cart = $this->resolveCart($request->user()->id);
            $product = Product::query()
                ->publicCatalog()
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

            if (! $variant->isInStock()) {
                throw ValidationException::withMessages([
                    'quantity' => 'This variant is currently out of stock.',
                ]);
            }

            $quantity = (int) $validated['quantity'];
            $cartItem = $cart->items()
                ->where('product_id', $product->id)
                ->where('product_variant_id', $variant->id)
                ->first();
            $nextQuantity = $quantity + (int) ($cartItem?->quantity ?? 0);

            if ($variant->stock_qty < $nextQuantity) {
                throw ValidationException::withMessages([
                    'quantity' => "Only {$variant->stock_qty} item(s) are available for this variant.",
                ]);
            }

            $payload = [
                'quantity' => $nextQuantity,
                'unit_price' => (float) $variant->final_price,
            ];

            if ($cartItem) {
                $cartItem->update($payload);
            } else {
                $cart->items()->create([
                    'product_id' => $product->id,
                    'product_variant_id' => $variant->id,
                    ...$payload,
                ]);
            }

            return $this->refreshCart($cart);
        });

        return response()->json([
            'message' => 'Cart updated successfully.',
            'data' => CartResource::make($cart),
        ], 201);
    }

    public function updateItem(CartItemUpdateRequest $request, CartItem $item): JsonResponse
    {
        $validated = $request->validated();

        $cart = DB::transaction(function () use ($request, $item, $validated) {
            $cart = $this->resolveCart($request->user()->id);
            $cartItem = $cart->items()
                ->whereKey($item->id)
                ->firstOrFail();
            $variant = ProductVariant::query()
                ->whereKey($cartItem->product_variant_id)
                ->lockForUpdate()
                ->first();

            if (! $variant || ! $variant->isInStock()) {
                throw ValidationException::withMessages([
                    'quantity' => 'This variant is currently out of stock.',
                ]);
            }

            $quantity = (int) $validated['quantity'];

            if ($variant->stock_qty < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => "Only {$variant->stock_qty} item(s) are available for this variant.",
                ]);
            }

            $cartItem->update([
                'quantity' => $quantity,
                'unit_price' => (float) $variant->final_price,
            ]);

            return $this->refreshCart($cart);
        });

        return response()->json([
            'message' => 'Cart item updated successfully.',
            'data' => CartResource::make($cart),
        ]);
    }

    public function destroyItem(Request $request, CartItem $item): JsonResponse
    {
        $cart = $this->resolveCart($request->user()->id);
        $cart->items()->whereKey($item->id)->firstOrFail()->delete();

        $cart = $this->refreshCart($cart);

        return response()->json([
            'message' => 'Cart item removed successfully.',
            'data' => CartResource::make($cart),
        ]);
    }

    private function resolveCart(int $userId): Cart
    {
        return $this->refreshCart(
            Cart::firstOrCreate(['user_id' => $userId])
        );
    }

    private function refreshCart(Cart $cart): Cart
    {
        return $cart->fresh([
            'items.product.vendor:id,business_name,slug',
            'items.product.category:id,name,slug',
            'items.product.primaryImage:id,product_id,image_url,is_primary',
            'items.product.images:id,product_id,image_url,is_primary,sort_order',
            'items.variant:id,product_id,size,color,stock_qty,actual_price,selling_price,offer_price,sku,image_url,images',
        ]);
    }
}
