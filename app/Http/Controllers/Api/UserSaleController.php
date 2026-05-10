<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UserSaleStoreRequest;
use App\Http\Resources\UserSaleResource;
use App\Models\UserSale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserSaleController extends Controller
{
    public function catalogIndex(Request $request): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'search' => ['nullable', 'string', 'max:255'],
            'condition' => ['nullable', 'array'],
            'condition.*' => ['string', 'max:100'],
            'sort' => ['nullable', Rule::in(['latest', 'oldest', 'price_asc', 'price_desc'])],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:24'],
        ])->validate();

        $baseQuery = UserSale::query()
            ->with('user:id,full_name,avatar')
            ->active()
            ->notSold();

        $query = clone $baseQuery;
        $conditions = Arr::wrap($validated['condition'] ?? []);
        $search = trim((string) ($validated['search'] ?? ''));
        $minPrice = isset($validated['min_price'])
            ? (float) $validated['min_price']
            : null;
        $maxPrice = isset($validated['max_price'])
            ? (float) $validated['max_price']
            : null;
        $sort = $validated['sort'] ?? 'latest';
        $perPage = (int) ($validated['per_page'] ?? 12);

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('condition', 'like', "%{$search}%");
            });
        }

        if (! empty($conditions)) {
            $query->whereIn('condition', $conditions);
        }

        if ($minPrice !== null) {
            $query->where('actual_price', '>=', $minPrice);
        }

        if ($maxPrice !== null) {
            $query->where('actual_price', '<=', $maxPrice);
        }

        match ($sort) {
            'oldest' => $query->orderBy('created_date')->orderBy('id'),
            'price_asc' => $query->orderBy('actual_price')->orderByDesc('id'),
            'price_desc' => $query->orderByDesc('actual_price')->orderByDesc('id'),
            default => $query->orderByDesc('created_date')->orderByDesc('id'),
        };

        $sales = $query->paginate($perPage)->withQueryString();
        $conditionOptions = (clone $baseQuery)
            ->select('condition', DB::raw('COUNT(*) as listings_count'))
            ->groupBy('condition')
            ->orderBy('condition')
            ->get()
            ->map(fn ($sale) => [
                'value' => $sale->condition,
                'label' => $sale->condition,
                'listings_count' => (int) $sale->listings_count,
            ])
            ->values()
            ->all();
        $priceRange = [
            'min' => (float) ((clone $baseQuery)->min('actual_price') ?? 0),
            'max' => (float) ((clone $baseQuery)->max('actual_price') ?? 0),
        ];

        return response()->json([
            'data' => UserSaleResource::collection($sales->getCollection()),
            'meta' => [
                'current_page' => $sales->currentPage(),
                'last_page' => $sales->lastPage(),
                'per_page' => $sales->perPage(),
                'total' => $sales->total(),
                'from' => $sales->firstItem(),
                'to' => $sales->lastItem(),
                'next_page' => $sales->hasMorePages()
                    ? $sales->currentPage() + 1
                    : null,
                'filters' => [
                    'search' => $search,
                    'conditions' => $conditionOptions,
                    'sort' => $sort,
                    'price_range' => $priceRange,
                    'applied_conditions' => $conditions,
                    'min_price' => $minPrice,
                    'max_price' => $maxPrice,
                ],
            ],
        ]);
    }

    public function showPublic(int $id): JsonResponse
    {
        $sale = UserSale::query()
            ->with('user:id,full_name,avatar')
            ->active()
            ->notSold()
            ->findOrFail($id);

        return response()->json([
            'data' => UserSaleResource::make($sale),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'search' => ['nullable', 'string', 'max:255'],
            'sale_status' => ['nullable', Rule::in(UserSale::saleStatuses())],
            'status' => ['nullable', Rule::in(UserSale::statuses())],
        ])->validate();

        $summaryQuery = $request->user()->sales()->getQuery();
        $query = $request->user()->sales()->getQuery()
            ->latest('created_date')
            ->latest('id');

        if (! empty($validated['search'])) {
            $search = trim((string) $validated['search']);

            $query->where(function ($builder) use ($search): void {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('condition', 'like', "%{$search}%");
            });
        }

        if (! empty($validated['sale_status'])) {
            $query->where('sale_status', $validated['sale_status']);
        }

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        $sales = $query->get();

        return response()->json([
            'data' => UserSaleResource::collection($sales),
            'meta' => [
                'total' => $sales->count(),
                'filters' => [
                    'search' => $validated['search'] ?? '',
                    'sale_status' => $validated['sale_status'] ?? null,
                    'status' => $validated['status'] ?? null,
                ],
                'summary' => [
                    'all' => (clone $summaryQuery)->count(),
                    'not_sold' => (clone $summaryQuery)->where('sale_status', 'not_sold')->count(),
                    'sold' => (clone $summaryQuery)->where('sale_status', 'sold')->count(),
                    'active' => (clone $summaryQuery)->where('status', 'active')->count(),
                    'inactive' => (clone $summaryQuery)->where('status', 'inactive')->count(),
                ],
            ],
        ]);
    }

    public function store(UserSaleStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();
        $images = collect($request->file('images', []))
            ->map(fn ($file) => $file->store("user-sales/{$user->id}", 'public'))
            ->all();

        $sale = $user->sales()->create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'images' => $images,
            'actual_price' => $validated['actual_price'],
            'compare_at_price' => $validated['compare_at_price'] ?? null,
            'condition' => $validated['condition'],
            'created_date' => $validated['created_date'] ?? now()->toDateString(),
            'sale_status' => $validated['sale_status'],
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Sale listing created successfully.',
            'data' => UserSaleResource::make($sale->fresh()),
        ], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $sale = $request->user()->sales()->findOrFail($id);

        if (is_array($sale->images)) {
            foreach ($sale->images as $image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($image);
            }
        }

        $sale->delete();

        return response()->json([
            'message' => 'Sale listing deleted successfully.',
        ]);
    }
}
