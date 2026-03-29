<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UserSaleStoreRequest;
use App\Http\Resources\UserSaleResource;
use App\Models\UserSale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserSaleController extends Controller
{
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
}
