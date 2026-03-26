<?php

namespace App\Http\Resources;

use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class CatalogProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $variants = $this->whenLoaded('variants', fn () => $this->variants, collect());
        $sizes = $this->pluckDistinctValues($variants, 'size');
        $colors = $this->pluckDistinctValues($variants, 'color');
        $price = (float) ($this->shop_price ?? $this->effective_price);
        $compareAtPrice = $this->resolveCompareAtPrice($variants, $price);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'brand' => $this->vendor?->business_name,
            'category' => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null,
            'image' => $this->resolveProductImage($variants),
            'price' => $price,
            'price_formatted' => $this->formatPlainNumber($price),
            'compare_at_price' => $compareAtPrice,
            'compare_at_price_formatted' => $compareAtPrice ? $this->formatPlainNumber($compareAtPrice) : null,
            'size' => $this->buildSizeLabel($sizes),
            'sizes' => $sizes->values()->all(),
            'colors' => $colors->values()->all(),
            'badge' => $this->resolveBadge($compareAtPrice),
        ];
    }

    protected function resolveBadge(?float $compareAtPrice): ?string
    {
        if ($this->is_featured) {
            return 'Featured';
        }

        if ($compareAtPrice && $compareAtPrice > (float) ($this->shop_price ?? $this->effective_price)) {
            return 'Sale';
        }

        return null;
    }

    protected function buildSizeLabel(Collection $sizes): string
    {
        if ($sizes->isEmpty()) {
            return 'One Size';
        }

        if ($sizes->count() <= 2) {
            return $sizes->implode(' / ');
        }

        return $sizes->take(2)->implode(' / ') . ' +' . ($sizes->count() - 2);
    }

    protected function pluckDistinctValues(Collection $variants, string $key): Collection
    {
        return $variants
            ->pluck($key)
            ->filter()
            ->unique()
            ->values();
    }

    protected function resolveCompareAtPrice(Collection $variants, float $price): ?float
    {
        $variantCompareAtPrice = $variants
            ->map(fn (ProductVariant $variant) => $variant->actual_price ?? $variant->selling_price)
            ->filter()
            ->map(fn ($variantPrice) => (float) $variantPrice)
            ->sort()
            ->first();

        $productCompareAtPrice = $this->base_price ? (float) $this->base_price : null;
        $compareAtPrice = $variantCompareAtPrice ?? $productCompareAtPrice;

        if (! $compareAtPrice || $compareAtPrice <= $price) {
            return null;
        }

        return $compareAtPrice;
    }

    protected function resolveProductImage(Collection $variants): ?string
    {
        $imagePath = $this->primaryImage?->image_url
            ?? $this->images?->first()?->image_url
            ?? $variants->pluck('image_url')->filter()->first();

        if (! $imagePath) {
            $variantImages = $variants
                ->pluck('images')
                ->filter(fn ($images) => is_array($images) && ! empty($images))
                ->flatten(1)
                ->filter()
                ->values();

            $imagePath = $variantImages->first();
        }

        if (! $imagePath) {
            return null;
        }

        return $this->resolveImageUrl((string) $imagePath);
    }

    protected function resolveImageUrl(string $path): string
    {
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $normalizedPath = ltrim($path, '/');

        if (str_starts_with($normalizedPath, 'storage/')) {
            return url($normalizedPath);
        }

        return Storage::disk('public')->url($normalizedPath);
    }

    protected function formatPlainNumber(float $amount): string
    {
        return number_format($amount, 2, '.', '');
    }
}
