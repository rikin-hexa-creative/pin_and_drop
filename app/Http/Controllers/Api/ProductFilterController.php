<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Size;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;

class ProductFilterController extends Controller
{
    public function index(): JsonResponse
    {
        $priceExpression = Product::catalogPriceExpression();
        $variantQuery = ProductVariant::query()
            ->join('products', 'products.id', '=', 'product_variants.product_id')
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->join('vendors', 'vendors.id', '=', 'products.vendor_id')
            ->where('products.status', 'active')
            ->where('vendors.status', 'approved')
            ->where('categories.is_active', true)
            ->where('categories.is_approved', true);

        $designers = Vendor::query()
            ->approved()
            ->whereHas('products', fn ($productQuery) => $productQuery->publicCatalog())
            ->withCount([
                'products as products_count' => fn ($productQuery) => $productQuery->publicCatalog(),
            ])
            ->orderBy('business_name')
            ->get(['id', 'business_name', 'slug'])
            ->map(fn ($vendor) => [
                'id' => $vendor->id,
                'name' => $vendor->business_name,
                'slug' => $vendor->slug,
                'products_count' => (int) $vendor->products_count,
            ])
            ->values();

        $categories = Category::query()
            ->visibleInCatalog()
            ->whereHas('products', fn ($productQuery) => $productQuery->publicCatalog())
            ->withCount([
                'products as products_count' => fn ($productQuery) => $productQuery->publicCatalog(),
            ])
            ->ordered()
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'products_count' => (int) $category->products_count,
            ])
            ->values();

        $sizeCounts = (clone $variantQuery)
            ->whereNotNull('product_variants.size')
            ->where('product_variants.size', '!=', '')
            ->selectRaw('product_variants.size as name, COUNT(DISTINCT products.id) as products_count')
            ->groupBy('product_variants.size')
            ->pluck('products_count', 'name');

        $orderedSizes = Size::query()
            ->active()
            ->ordered()
            ->get(['name'])
            ->pluck('name');

        $sizes = $orderedSizes
            ->filter(fn ($sizeName) => $sizeCounts->has($sizeName))
            ->map(fn ($sizeName) => [
                'name' => $sizeName,
                'products_count' => (int) $sizeCounts[$sizeName],
            ])
            ->values();

        $additionalSizes = $sizeCounts
            ->keys()
            ->diff($orderedSizes)
            ->sort()
            ->values()
            ->map(fn ($sizeName) => [
                'name' => $sizeName,
                'products_count' => (int) $sizeCounts[$sizeName],
            ]);

        $colors = (clone $variantQuery)
            ->whereNotNull('product_variants.color')
            ->where('product_variants.color', '!=', '')
            ->selectRaw('product_variants.color as value, COUNT(DISTINCT products.id) as products_count')
            ->groupBy('product_variants.color')
            ->orderBy('product_variants.color')
            ->get()
            ->map(fn ($color) => [
                'value' => $color->value,
                'products_count' => (int) $color->products_count,
            ])
            ->values();

        $priceRange = Product::query()
            ->publicCatalog()
            ->selectRaw("MIN({$priceExpression}) as min_price")
            ->selectRaw("MAX({$priceExpression}) as max_price")
            ->first();

        return response()->json([
            'data' => [
                'categories' => $categories,
                'designers' => $designers,
                'sizes' => $sizes->concat($additionalSizes)->values(),
                'colors' => $colors,
                'price_range' => [
                    'min' => $priceRange?->min_price !== null ? (float) $priceRange->min_price : 0,
                    'max' => $priceRange?->max_price !== null ? (float) $priceRange->max_price : 0,
                ],
            ],
        ]);
    }
}
