<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'vendor_id',
        'product_id',
        'product_variant_id',
        'product_name',
        'variant_info',
        'quantity',
        'unit_price',
        'total_price',
        'item_status',
    ];

    protected function casts(): array
    {
        return [
            'unit_price'  => 'decimal:2',
            'total_price' => 'decimal:2',
            'quantity'    => 'integer',
        ];
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    public function scopeForVendor($query, int $vendorId)
    {
        return $query->where('vendor_id', $vendorId);
    }

    public function scopeByItemStatus($query, string $status)
    {
        return $query->where('item_status', $status);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function isDelivered(): bool  { return $this->item_status === 'delivered'; }
    public function isCancelled(): bool  { return $this->item_status === 'cancelled'; }

    /**
     * Build a snapshot of variant details at time of purchase.
     */
    public static function buildVariantInfo(?ProductVariant $variant): ?string
    {
        if (!$variant) {
            return null;
        }

        $parts = array_filter([
            $variant->size  ? "Size: {$variant->size}"   : null,
            $variant->color ? "Color: {$variant->color}" : null,
        ]);

        return implode(' | ', $parts) ?: null;
    }
}
