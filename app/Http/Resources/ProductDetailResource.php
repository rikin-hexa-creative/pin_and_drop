<?php

namespace App\Http\Resources;

use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ProductDetailResource extends CatalogProductResource
{
    public function toArray(Request $request): array
    {
        $variants = $this->whenLoaded('variants', fn () => $this->variants->values(), collect());
        $defaultVariant = $variants->first(fn (ProductVariant $variant) => $variant->isInStock()) ?? $variants->first();
        $basePrice = $defaultVariant?->final_price ?? (float) ($this->shop_price ?? $this->effective_price);
        $baseCompareAtPrice = $defaultVariant
            ? $this->resolveVariantCompareAtPrice($defaultVariant, $basePrice)
            : $this->resolveCompareAtPrice($variants, $basePrice);
        $gallery = $this->buildGallery($variants);
        $reviews = $this->approvedReviews?->map(function ($review) {
            return [
                'id' => $review->id,
                'author' => $review->user?->full_name ?? 'Verified Buyer',
                'rating' => (int) $review->rating,
                'comment' => $review->comment,
                'date' => $review->created_at?->format('M d, Y'),
            ];
        })->values() ?? collect();
        $colors = $this->buildColorOptions($variants);
        $sizes = $this->buildSizeOptions($variants);

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
            'badge' => $this->resolveBadge($baseCompareAtPrice),
            'price' => $basePrice,
            'price_formatted' => $this->formatPlainNumber($basePrice),
            'compare_at_price' => $baseCompareAtPrice,
            'compare_at_price_formatted' => $baseCompareAtPrice
                ? $this->formatPlainNumber($baseCompareAtPrice)
                : null,
            'description_html' => $this->description,
            'size_chart_html' => $this->size_chart,
            'sku' => $this->sku,
            'is_featured' => (bool) $this->is_featured,
            'collection_label' => 'Archive Selection',
            'gallery' => $gallery->values()->all(),
            'variants' => $variants->map(function (ProductVariant $variant) {
                $price = (float) $variant->final_price;
                $compareAtPrice = $this->resolveVariantCompareAtPrice($variant, $price);
                $images = collect($variant->images ?? [])
                    ->filter()
                    ->map(fn ($path) => $this->resolveImageUrl((string) $path))
                    ->values();
                $primaryImage = $variant->image_url
                    ? $this->resolveImageUrl((string) $variant->image_url)
                    : $images->first();

                return [
                    'id' => $variant->id,
                    'size' => $variant->size,
                    'color' => $variant->color,
                    'sku' => $variant->sku,
                    'stock_qty' => (int) $variant->stock_qty,
                    'in_stock' => $variant->isInStock(),
                    'price' => $price,
                    'price_formatted' => $this->formatPlainNumber($price),
                    'compare_at_price' => $compareAtPrice,
                    'compare_at_price_formatted' => $compareAtPrice
                        ? $this->formatPlainNumber($compareAtPrice)
                        : null,
                    'image' => $primaryImage,
                    'images' => $images->all(),
                ];
            })->values()->all(),
            'colors' => $colors->values()->all(),
            'sizes' => $sizes->values()->all(),
            'default_variant_id' => $defaultVariant?->id,
            'review_summary' => [
                'count' => (int) ($this->reviews_count ?? 0),
                'average' => round((float) ($this->reviews_average ?? 0), 1),
            ],
            'reviews' => $reviews->all(),
        ];
    }

    private function buildGallery(Collection $variants): Collection
    {
        $gallery = collect();

        foreach ($this->images ?? [] as $image) {
            if (! $image->image_url) {
                continue;
            }

            $gallery->push([
                'id' => "product-{$image->id}",
                'src' => $this->resolveImageUrl((string) $image->image_url),
                'alt' => $this->name,
                'is_primary' => (bool) $image->is_primary,
            ]);
        }

        $variants->each(function (ProductVariant $variant) use ($gallery): void {
            $variantImages = collect();

            if ($variant->image_url) {
                $variantImages->push($variant->image_url);
            }

            foreach ($variant->images ?? [] as $variantImage) {
                if ($variantImage) {
                    $variantImages->push($variantImage);
                }
            }

            $variantImages
                ->filter()
                ->unique()
                ->values()
                ->each(function ($path, $index) use ($gallery, $variant): void {
                    $resolvedPath = $this->resolveImageUrl((string) $path);

                    if ($gallery->contains(fn ($item) => $item['src'] === $resolvedPath)) {
                        return;
                    }

                    $gallery->push([
                        'id' => "variant-{$variant->id}-{$index}",
                        'src' => $resolvedPath,
                        'alt' => $this->name,
                        'is_primary' => false,
                    ]);
                });
        });

        return $gallery->values();
    }

    private function buildColorOptions(Collection $variants): Collection
    {
        return $variants
            ->pluck('color')
            ->filter()
            ->unique()
            ->values()
            ->map(function (string $color) use ($variants) {
                $matchingVariants = $variants->where('color', $color);

                return [
                    'id' => Str::slug($color . '-' . substr(md5($color), 0, 6)),
                    'value' => $color,
                    'label' => $color,
                    'in_stock' => $matchingVariants->contains(fn (ProductVariant $variant) => $variant->isInStock()),
                ];
            });
    }

    private function buildSizeOptions(Collection $variants): Collection
    {
        return $variants
            ->pluck('size')
            ->filter()
            ->unique()
            ->values()
            ->map(function (string $size) use ($variants) {
                $matchingVariants = $variants->where('size', $size);

                return [
                    'value' => $size,
                    'available' => $matchingVariants->contains(fn (ProductVariant $variant) => $variant->isInStock()),
                ];
            });
    }

    private function resolveVariantCompareAtPrice(ProductVariant $variant, float $price): ?float
    {
        $compareAtPrice = collect([
            $variant->actual_price,
            $variant->selling_price,
            $this->base_price,
        ])
            ->filter()
            ->map(fn ($value) => (float) $value)
            ->first(fn ($value) => $value > $price);

        return $compareAtPrice ?: null;
    }
}
