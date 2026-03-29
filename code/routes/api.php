<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductFilterController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\UserCollectionController;
use App\Http\Controllers\Api\VendorController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/sign-up', [AuthController::class, 'signUp']);
    Route::post('/sign-in', [AuthController::class, 'signIn']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart/items', [CartController::class, 'storeItem']);
    Route::patch('/cart/items/{item}', [CartController::class, 'updateItem'])->whereNumber('item');
    Route::delete('/cart/items/{item}', [CartController::class, 'destroyItem'])->whereNumber('item');
    Route::get('/users/profile', [AuthController::class, 'profile']);
    Route::get('/users/orders', [OrderController::class, 'index']);
    Route::get('/checkout', [CheckoutController::class, 'show']);
    Route::post('/checkout', [CheckoutController::class, 'store']);

    // User Collections
    Route::get('/user/collections', [UserCollectionController::class, 'index']);
    Route::post('/user/collections', [UserCollectionController::class, 'store']);
    Route::get('/user/collections/{id}', [UserCollectionController::class, 'show']);
    Route::delete('/user/collections/{id}', [UserCollectionController::class, 'destroy']);
    Route::post('/user/collections/{id}/pin', [UserCollectionController::class, 'pinProduct']);
    Route::post('/user/collections/{id}/unpin', [UserCollectionController::class, 'unpinProduct']);
});

Route::get('/menus/vendors', [MenuController::class, 'vendors']);
Route::get('/menus/categories', [MenuController::class, 'categories']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/vendors', [VendorController::class, 'index']);
Route::get('/vendors/{identifier}', [VendorController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/filters', [ProductFilterController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show'])->whereNumber('id');
