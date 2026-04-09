<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ProductIndexRequest;
use App\Http\Resources\CatalogProductResource;
use App\Http\Resources\ProductDetailResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(ProductIndexRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $priceExpression = Product::catalogPriceExpression();
        $perPage = (int) ($validated['per_page'] ?? 12);
        $search = isset($validated['search']) ? Str::squish($validated['search']) : null;

        $catalogProducts = Product::query()
            ->select('products.id', 'products.created_at')
            ->selectRaw("{$priceExpression} as shop_price")
            ->publicCatalog()
            ->when($search, function ($query, $value) {
                $query->where(function ($searchQuery) use ($value) {
                    $like = '%' . $value . '%';

                    $searchQuery
                        ->where('products.name', 'like', $like)
                        ->orWhere('products.slug', 'like', $like)
                        ->orWhereHas('vendor', fn ($vendorQuery) => $vendorQuery->where('business_name', 'like', $like))
                        ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->where('name', 'like', $like));
                });
            })
            ->when(! empty($validated['category']), fn ($query) => $query->whereIn('products.category_id', $validated['category']))
            ->when(! empty($validated['designer']), function ($query) use ($validated) {
                $query->whereHas('vendor', fn ($vendorQuery) => $vendorQuery->whereIn('business_name', $validated['designer']));
            })
            ->when(! empty($validated['size']), function ($query) use ($validated) {
                $query->whereHas('variants', fn ($variantQuery) => $variantQuery->whereIn('size', $validated['size']));
            })
            ->when(! empty($validated['color']), function ($query) use ($validated) {
                $query->whereHas('variants', fn ($variantQuery) => $variantQuery->whereIn('color', $validated['color']));
            });

        $catalogListingQuery = DB::query()
            ->fromSub($catalogProducts->toBase(), 'catalog_products')
            ->when(array_key_exists('min_price', $validated), fn ($query) => $query->whereRaw('CAST(shop_price AS REAL) >= ?', [(float) $validated['min_price']]))
            ->when(array_key_exists('max_price', $validated), fn ($query) => $query->whereRaw('CAST(shop_price AS REAL) <= ?', [(float) $validated['max_price']]));

        match ($validated['sort'] ?? 'latest') {
            'price_asc' => $catalogListingQuery->orderByRaw('CAST(shop_price AS REAL) asc')->orderByDesc('created_at'),
            'price_desc' => $catalogListingQuery->orderByRaw('CAST(shop_price AS REAL) desc')->orderByDesc('created_at'),
            default => $catalogListingQuery->orderByDesc('created_at'),
        };

        $paginatedCatalogProducts = $catalogListingQuery->paginate($perPage)->withQueryString();
        $productIds = collect($paginatedCatalogProducts->items())->pluck('id')->all();
        $shopPriceLookup = collect($paginatedCatalogProducts->items())->keyBy('id');

        $products = Product::query()
            ->with([
                'vendor:id,business_name,slug',
                'category:id,name,slug',
                'primaryImage:id,product_id,image_url,is_primary',
                'images:id,product_id,image_url,is_primary,sort_order',
                'variants:id,product_id,size,color,stock_qty,actual_price,selling_price,offer_price,image_url,images',
            ])
            ->whereIn('products.id', $productIds)
            ->get()
            ->sortBy(fn (Product $product) => array_search($product->id, $productIds, true))
            ->values()
            ->each(function (Product $product) use ($shopPriceLookup): void {
                $product->setAttribute(
                    'shop_price',
                    isset($shopPriceLookup[$product->id])
                        ? (float) $shopPriceLookup[$product->id]->shop_price
                        : (float) $product->effective_price
                );
            });

        return response()->json([
            'data' => CatalogProductResource::collection($products),
            'meta' => [
                'current_page' => $paginatedCatalogProducts->currentPage(),
                'last_page' => $paginatedCatalogProducts->lastPage(),
                'per_page' => $paginatedCatalogProducts->perPage(),
                'total' => $paginatedCatalogProducts->total(),
                'from' => $paginatedCatalogProducts->firstItem(),
                'to' => $paginatedCatalogProducts->lastItem(),
                'has_more_pages' => $paginatedCatalogProducts->hasMorePages(),
                'next_page' => $paginatedCatalogProducts->hasMorePages()
                    ? $paginatedCatalogProducts->currentPage() + 1
                    : null,
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $priceExpression = Product::catalogPriceExpression();

        $product = Product::query()
            ->select('products.*')
            ->selectRaw("{$priceExpression} as shop_price")
            ->publicCatalog()
            ->with([
                'vendor:id,business_name,slug',
                'category:id,name,slug',
                'primaryImage:id,product_id,image_url,is_primary,sort_order',
                'images:id,product_id,image_url,is_primary,sort_order',
                'variants:id,product_id,size,color,stock_qty,actual_price,selling_price,offer_price,sku,image_url,images',
                'approvedReviews' => fn ($query) => $query
                    ->with('user:id,full_name')
                    ->latest()
                    ->limit(5),
            ])
            ->withCount([
                'approvedReviews as reviews_count',
            ])
            ->withAvg('approvedReviews as reviews_average', 'rating')
            ->findOrFail($id);

        return response()->json([
            'data' => ProductDetailResource::make($product),
        ]);
    }
}
