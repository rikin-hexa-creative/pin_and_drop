<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserCollection;

class UserCollectionController extends Controller
{
    /**
     * Display a listing of the authenticated user's collections.
     */
    public function index(Request $request)
    {
        $collections = $request->user()->collections()
            ->withCount('products')
            ->with(['products' => function ($query) {
                // Get the latest 4 products for imagery grid
                $query->latest()->take(4)->with(['primaryImage', 'images']);
            }])
            ->latest()
            ->get();
            
        return response()->json([
            'data' => $collections->map(function ($collection) {
                $images = collect();
                
                foreach ($collection->products as $product) {
                    if ($product->primaryImage) {
                        $images->push($product->primaryImage->src);
                    } elseif ($product->images->isNotEmpty()) {
                        $images->push($product->images->first()->src);
                    }
                }
                
                return [
                    'id' => $collection->id,
                    'name' => $collection->name,
                    'item_count' => $collection->products_count,
                    'updated_at_human' => tap($collection->updated_at)->diffForHumans(),
                    'updated_at' => $collection->updated_at,
                    'images' => array_pad($images->take(4)->values()->all(), 4, null) // Ensure 4 elements for UI (null if missing)
                ];
            })
        ]);
    }

    /**
     * Store a newly created collection in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $collection = $request->user()->collections()->create($validated);

        return response()->json([
            'message' => 'Collection created', 
            'data' => $collection
        ], 201);
    }

    /**
     * Display the specified collection.
     */
    public function show(Request $request, $id)
    {
        $collection = $request->user()->collections()
            ->with(['products.primaryImage', 'products.images', 'products.category', 'products.vendor'])
            ->findOrFail($id);
            
        return response()->json([
            'data' => $collection
        ]);
    }

    /**
     * Remove the specified collection from storage.
     */
    public function destroy(Request $request, $id)
    {
        $collection = $request->user()->collections()->findOrFail($id);
        $collection->delete();

        return response()->json(['message' => 'Collection deleted']);
    }

    /**
     * Add a product to the user collection.
     */
    public function pinProduct(Request $request, $id)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $collection = $request->user()->collections()->findOrFail($id);
        
        // Sync without detaching, attach only if not already attached
        if (!$collection->products()->where('product_id', $validated['product_id'])->exists()) {
             $collection->products()->attach($validated['product_id']);
             $collection->touch(); // Update updated_at
        }

        return response()->json(['message' => 'Product pinned to collection successfully']);
    }

    /**
     * Remove a product from the user collection.
     */
    public function unpinProduct(Request $request, $id)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $collection = $request->user()->collections()->findOrFail($id);
        $collection->products()->detach($validated['product_id']);
        $collection->touch(); // Update updated_at

        return response()->json(['message' => 'Product unpinned from collection']);
    }
}
