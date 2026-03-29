<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\VendorProfileResource;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VendorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));

        $vendors = Vendor::query()
            ->approved()
            ->when($search !== '', function ($query) use ($search) {
                $query->where('business_name', 'like', '%' . $search . '%');
            })
            ->withCount([
                'products as products_count' => fn ($productQuery) => $productQuery->publicCatalog(),
                'products as featured_products_count' => fn ($productQuery) => $productQuery->publicCatalog()->featured(),
                'orderItems as sold_items_count' => fn ($orderItemQuery) => $orderItemQuery
                    ->whereNotIn('item_status', ['cancelled', 'refunded']),
            ])
            ->orderBy('business_name')
            ->get([
                'id',
                'business_name',
                'slug',
                'logo',
                'banner',
                'description',
                'created_at',
                'approved_at',
            ])
            ->map(function (Vendor $vendor) {
                return [
                    'id' => $vendor->id,
                    'name' => $vendor->business_name,
                    'slug' => $vendor->slug,
                    'logo' => $this->resolveImageUrl($vendor->logo),
                    'banner' => $this->resolveImageUrl($vendor->banner),
                    'description' => $vendor->description,
                    'profile_link' => '/vendors/' . ($vendor->slug ?: $vendor->id),
                    'stats' => [
                        'products_count' => (int) $vendor->products_count,
                        'featured_products_count' => (int) $vendor->featured_products_count,
                        'sold_items_count' => (int) $vendor->sold_items_count,
                    ],
                    'member_since' => $vendor->created_at?->format('Y'),
                ];
            })
            ->values();

        return response()->json([
            'data' => $vendors,
        ]);
    }

    public function show(string $identifier): JsonResponse
    {
        $vendor = Vendor::query()
            ->approved()
            ->withCount([
                'products as products_count' => fn ($productQuery) => $productQuery->publicCatalog(),
                'products as featured_products_count' => fn ($productQuery) => $productQuery->publicCatalog()->featured(),
                'orderItems as sold_items_count' => fn ($orderItemQuery) => $orderItemQuery
                    ->whereNotIn('item_status', ['cancelled', 'refunded']),
            ])
            ->where(function ($query) use ($identifier) {
                if (is_numeric($identifier)) {
                    $query->where('id', (int) $identifier)
                        ->orWhere('slug', $identifier);

                    return;
                }

                $query->where('slug', $identifier);
            })
            ->firstOrFail();

        $priceExpression = Product::catalogPriceExpression();
        $products = Product::query()
            ->select('products.*')
            ->selectRaw("{$priceExpression} as shop_price")
            ->publicCatalog()
            ->where('vendor_id', $vendor->id)
            ->with([
                'vendor:id,business_name,slug',
                'category:id,name,slug',
                'primaryImage:id,product_id,image_url,is_primary',
                'images:id,product_id,image_url,is_primary,sort_order',
                'variants:id,product_id,size,color,stock_qty,actual_price,selling_price,offer_price,image_url,images',
            ])
            ->latest()
            ->get();

        $vendor->setRelation('profileProducts', $products);

        return response()->json([
            'data' => VendorProfileResource::make($vendor),
        ]);
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
