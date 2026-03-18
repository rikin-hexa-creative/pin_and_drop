<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'size',
        'color',
        'stock_qty',
        'extra_price',
        'actual_price',
        'selling_price',
        'offer_price',
        'sku',
        'image_url',
        'images',
    ];

    protected function casts(): array
    {
        return [
            'extra_price' => 'decimal:2',
            'actual_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'offer_price' => 'decimal:2',
            'stock_qty'   => 'integer',
            'images' => 'array',
        ];
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    public function scopeInStock($query)
    {
        return $query->where('stock_qty', '>', 0);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function getFinalPriceAttribute(): float
    {
        $price = $this->offer_price
            ?? $this->selling_price
            ?? $this->actual_price
            ?? $this->product->effective_price;

        return (float) $price;
    }

    public function isInStock(): bool
    {
        return $this->stock_qty > 0;
    }

    public function decrementStock(int $qty = 1): bool
    {
        if ($this->stock_qty < $qty) {
            return false;
        }

        $this->decrement('stock_qty', $qty);

        return true;
    }

    public function getVariantLabelAttribute(): string
    {
        $parts = array_filter([
            $this->size  ? "Size: {$this->size}"   : null,
            $this->color ? "Color: {$this->color}" : null,
        ]);

        return implode(' | ', $parts);
    }
}
