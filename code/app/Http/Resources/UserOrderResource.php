<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $itemsSubtotal = (float) $this->items->sum('total_price');

        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'payment_status' => $this->payment?->status,
            'payment_method' => $this->payment?->method,
            'created_at' => $this->created_at?->format('M d, Y'),
            'created_at_iso' => $this->created_at?->toIso8601String(),
            'items_count' => $this->items->count(),
            'shipping_address' => $this->shippingAddress ? [
                'full_name' => $this->shippingAddress->full_name,
                'phone' => $this->shippingAddress->phone,
                'full_address' => $this->shippingAddress->full_address,
            ] : null,
            'totals' => [
                'subtotal' => $itemsSubtotal,
                'subtotal_formatted' => $this->formatPlainNumber($itemsSubtotal),
                'discount_amount' => (float) $this->discount_amount,
                'discount_amount_formatted' => $this->formatPlainNumber((float) $this->discount_amount),
                'shipping_amount' => (float) $this->shipping_amount,
                'shipping_amount_formatted' => $this->formatPlainNumber((float) $this->shipping_amount),
                'grand_total' => (float) $this->grand_total,
                'grand_total_formatted' => $this->formatPlainNumber((float) $this->grand_total),
            ],
            'items' => $this->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'product_link' => $item->product_id ? '/product/' . $item->product_id : null,
                    'image' => $item->product ? $this->resolveProductImage($item->product) : null,
                    'vendor' => $item->vendor ? [
                        'id' => $item->vendor->id,
                        'name' => $item->vendor->business_name,
                        'slug' => $item->vendor->slug,
                        'link' => '/vendors/' . ($item->vendor->slug ?: $item->vendor->id),
                    ] : null,
                    'variant_info' => $item->variant_info,
                    'quantity' => (int) $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'unit_price_formatted' => $this->formatPlainNumber((float) $item->unit_price),
                    'total_price' => (float) $item->total_price,
                    'total_price_formatted' => $this->formatPlainNumber((float) $item->total_price),
                    'item_status' => $item->item_status,
                ];
            })->values()->all(),
        ];
    }

    private function resolveProductImage(Product $product): ?string
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

    private function formatPlainNumber(float $amount): string
    {
        return number_format($amount, 2, '.', '');
    }
}
