<?php

namespace App\Http\Resources;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->items ?? collect();
        $subtotal = (float) $items->sum(fn ($item) => (float) $item->unit_price * (int) $item->quantity);
        $compareAtTotal = (float) $items->sum(function ($item) {
            $unitPrice = (float) $item->unit_price;
            $compareAtPrice = $this->resolveVariantCompareAtPrice($item->product, $item->variant, $unitPrice);

            return ($compareAtPrice ?: $unitPrice) * (int) $item->quantity;
        });
        $discountAmount = round(max($compareAtTotal - $subtotal, 0), 2);

        return [
            'id' => $this->id,
            'items_count' => (int) $items->sum('quantity'),
            'totals' => [
                'subtotal' => $subtotal,
                'subtotal_formatted' => $this->formatPlainNumber($subtotal),
                'discount_amount' => $discountAmount,
                'discount_amount_formatted' => $this->formatPlainNumber($discountAmount),
                'shipping_amount' => 0.0,
                'shipping_amount_formatted' => '0.00',
                'grand_total' => $subtotal,
                'grand_total_formatted' => $this->formatPlainNumber($subtotal),
            ],
            'items' => $items->map(function ($item) {
                $unitPrice = (float) $item->unit_price;
                $totalPrice = round($unitPrice * (int) $item->quantity, 2);

                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'variant_id' => $item->product_variant_id,
                    'product_name' => $item->product?->name,
                    'product_link' => $item->product_id ? '/product/' . $item->product_id : null,
                    'brand' => $item->product?->vendor?->business_name,
                    'category' => $item->product?->category ? [
                        'id' => $item->product->category->id,
                        'name' => $item->product->category->name,
                        'slug' => $item->product->category->slug,
                    ] : null,
                    'vendor' => $item->product?->vendor ? [
                        'id' => $item->product->vendor->id,
                        'name' => $item->product->vendor->business_name,
                        'slug' => $item->product->vendor->slug,
                        'link' => '/vendors/' . ($item->product->vendor->slug ?: $item->product->vendor->id),
                    ] : null,
                    'image' => $item->product ? $this->resolveProductImage($item->product, $item->variant) : null,
                    'quantity' => (int) $item->quantity,
                    'available_quantity' => (int) ($item->variant?->stock_qty ?? 0),
                    'unit_price' => $unitPrice,
                    'unit_price_formatted' => $this->formatPlainNumber($unitPrice),
                    'total_price' => $totalPrice,
                    'total_price_formatted' => $this->formatPlainNumber($totalPrice),
                    'variant_info' => $item->variant ? $item->variant->variant_label : null,
                    'size' => $item->variant?->size,
                    'color' => $item->variant?->color,
                    'in_stock' => $item->variant?->isInStock() ?? false,
                ];
            })->values()->all(),
        ];
    }

    private function resolveProductImage(Product $product, ?ProductVariant $variant): ?string
    {
        $imagePath = $variant?->image_url
            ?? $product->primaryImage?->image_url
            ?? $product->images?->first()?->image_url
            ?? collect($variant?->images ?? [])->filter()->first();

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

    private function resolveVariantCompareAtPrice(?Product $product, ?ProductVariant $variant, float $unitPrice): ?float
    {
        if (! $product || ! $variant) {
            return null;
        }

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

    private function formatPlainNumber(float $amount): string
    {
        return number_format($amount, 2, '.', '');
    }
}
