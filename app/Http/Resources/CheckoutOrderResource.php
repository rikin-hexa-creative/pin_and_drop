<?php

namespace App\Http\Resources;

use App\Models\UserSale;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CheckoutOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $item = $this->items->first();
        $items = $this->items
            ->map(fn ($lineItem) => $this->transformItem($lineItem))
            ->values();

        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'payment_status' => $this->payment?->status,
            'payment_method' => $this->payment?->method,
            'currency' => 'NRS',
            'total_amount' => (float) $this->total_amount,
            'total_amount_formatted' => number_format((float) $this->total_amount, 2, '.', ''),
            'discount_amount' => (float) $this->discount_amount,
            'discount_amount_formatted' => number_format((float) $this->discount_amount, 2, '.', ''),
            'shipping_amount' => (float) $this->shipping_amount,
            'shipping_amount_formatted' => number_format((float) $this->shipping_amount, 2, '.', ''),
            'grand_total' => (float) $this->grand_total,
            'grand_total_formatted' => number_format((float) $this->grand_total, 2, '.', ''),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'items_count' => $items->count(),
            'shipping_address' => $this->shippingAddress ? [
                'id' => $this->shippingAddress->id,
                'label' => $this->shippingAddress->label,
                'full_name' => $this->shippingAddress->full_name,
                'phone' => $this->shippingAddress->phone,
                'address_line1' => $this->shippingAddress->address_line1,
                'address_line2' => $this->shippingAddress->address_line2,
                'city' => $this->shippingAddress->city,
                'state' => $this->shippingAddress->state,
                'postal_code' => $this->shippingAddress->postal_code,
                'country' => $this->shippingAddress->country,
                'full_address' => $this->shippingAddress->full_address,
            ] : null,
            'items' => $items->all(),
            'item' => $item ? $this->transformItem($item) : null,
        ];
    }

    private function transformItem($lineItem): array
    {
        $sellerName = $lineItem->vendor?->business_name
            ?? $lineItem->seller_name
            ?? $lineItem->saleSeller?->full_name;

        return [
            'id' => $lineItem->id,
            'item_source' => $lineItem->item_source ?? 'product',
            'product_id' => $lineItem->product_id,
            'user_sale_id' => $lineItem->user_sale_id,
            'product_link' => $lineItem->product_id ? '/product/' . $lineItem->product_id : null,
            'variant_id' => $lineItem->product_variant_id,
            'product_name' => $lineItem->product_name,
            'brand' => $sellerName,
            'vendor' => $lineItem->vendor ? [
                'id' => $lineItem->vendor->id,
                'name' => $lineItem->vendor->business_name,
                'slug' => $lineItem->vendor->slug,
                'link' => '/vendors/' . ($lineItem->vendor->slug ?: $lineItem->vendor->id),
            ] : null,
            'seller' => $sellerName ? [
                'id' => $lineItem->sale_seller_user_id,
                'name' => $sellerName,
            ] : null,
            'variant_info' => $lineItem->variant_info,
            'quantity' => (int) $lineItem->quantity,
            'unit_price' => (float) $lineItem->unit_price,
            'unit_price_formatted' => number_format((float) $lineItem->unit_price, 2, '.', ''),
            'total_price' => (float) $lineItem->total_price,
            'total_price_formatted' => number_format((float) $lineItem->total_price, 2, '.', ''),
            'image' => $lineItem->product
                ? $this->resolveProductImage($lineItem->product)
                : $this->resolveSaleImage($lineItem->userSale),
        ];
    }

    private function resolveProductImage($product): ?string
    {
        $imagePath = $product->primaryImage?->image_url ?? $product->images?->first()?->image_url;

        if (! $imagePath) {
            return null;
        }

        if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
            return $imagePath;
        }

        $normalizedPath = ltrim($imagePath, '/');

        if (str_starts_with($normalizedPath, 'storage/')) {
            return url($normalizedPath);
        }

        return url('storage/' . $normalizedPath);
    }

    private function resolveSaleImage(?UserSale $sale): ?string
    {
        $imagePath = collect($sale?->images ?? [])->first();

        if (! $imagePath) {
            return null;
        }

        if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
            return $imagePath;
        }

        $normalizedPath = ltrim($imagePath, '/');

        if (str_starts_with($normalizedPath, 'storage/')) {
            return url($normalizedPath);
        }

        return url('storage/' . $normalizedPath);
    }
}
