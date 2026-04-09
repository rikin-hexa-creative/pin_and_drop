<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class VendorProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $products = $this->whenLoaded('profileProducts', fn () => $this->profileProducts, collect());

        return [
            'id' => $this->id,
            'name' => $this->business_name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo' => $this->resolveImageUrl($this->logo),
            'banner' => $this->resolveImageUrl($this->banner),
            'email' => $this->email,
            'phone' => $this->phone,
            'profile_link' => '/vendors/' . ($this->slug ?: $this->id),
            'member_since' => $this->created_at?->format('Y'),
            'approved_at' => $this->approved_at?->toDateString(),
            'stats' => [
                'products_count' => (int) ($this->products_count ?? 0),
                'featured_products_count' => (int) ($this->featured_products_count ?? 0),
                'sold_items_count' => (int) ($this->sold_items_count ?? 0),
            ],
            'products' => CatalogProductResource::collection($products),
        ];
    }

    private function resolveImageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $normalizedPath = ltrim($path, '/');

        if (str_starts_with($normalizedPath, 'storage/')) {
            return url($normalizedPath);
        }

        return Storage::disk('public')->url($normalizedPath);
    }
}
