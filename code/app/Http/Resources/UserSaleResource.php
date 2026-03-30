<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserSaleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $actualPrice = (float) $this->actual_price;
        $compareAtPrice = $this->compare_at_price !== null
            ? (float) $this->compare_at_price
            : null;
        $images = collect($this->images ?? [])
            ->filter()
            ->map(fn (string $path) => $this->resolveImageUrl($path))
            ->values();
        $gallery = $images->values()->map(fn (string $src, int $index) => [
            'id' => "sale-{$this->id}-{$index}",
            'src' => $src,
            'alt' => $this->name,
            'is_primary' => $index === 0,
        ]);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'images' => $images->all(),
            'image' => $images->first(),
            'images_count' => $images->count(),
            'gallery' => $gallery->all(),
            'actual_price' => $actualPrice,
            'actual_price_formatted' => $this->formatPlainNumber($actualPrice),
            'compare_at_price' => $compareAtPrice,
            'compare_at_price_formatted' => $compareAtPrice !== null
                ? $this->formatPlainNumber($compareAtPrice)
                : null,
            'condition' => $this->condition,
            'created_date' => $this->created_date?->toDateString(),
            'created_date_formatted' => $this->created_date?->format('M d, Y'),
            'sale_status' => $this->sale_status,
            'status' => $this->status,
            'is_sold' => $this->sale_status === 'sold',
            'seller' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->full_name,
                'avatar' => $this->user->avatar
                    ? $this->resolveImageUrl($this->user->avatar)
                    : null,
            ] : null,
            'posted_at' => $this->created_at?->toISOString(),
            'posted_at_formatted' => $this->created_at?->format('M d, Y'),
        ];
    }

    private function resolveImageUrl(string $imagePath): string
    {
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
