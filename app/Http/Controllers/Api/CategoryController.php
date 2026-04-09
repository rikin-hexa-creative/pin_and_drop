<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CatalogCategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->visibleInCatalog()
            ->whereHas('products', fn ($productQuery) => $productQuery->publicCatalog())
            ->withCount([
                'products as products_count' => fn ($productQuery) => $productQuery->publicCatalog(),
            ])
            ->ordered()
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => CatalogCategoryResource::collection($categories),
        ]);
    }
}
