<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserOrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->forUser($request->user()->id)
            ->with([
                'payment',
                'shippingAddress',
                'items.vendor:id,business_name,slug',
                'items.product:id,name,slug',
                'items.product.primaryImage:id,product_id,image_url,is_primary',
                'items.product.images:id,product_id,image_url,is_primary,sort_order',
            ])
            ->latest()
            ->get();

        return response()->json([
            'data' => UserOrderResource::collection($orders),
        ]);
    }
}
