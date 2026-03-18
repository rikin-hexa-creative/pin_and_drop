<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vendor_id',
        'category_id',
        'name',
        'slug',
        'description',
        'size_chart',
        'base_price',
        'discount_price',
        'sku',
        'status',
        'is_featured',
        'approved_by',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'base_price'     => 'decimal:2',
            'discount_price' => 'decimal:2',
            'is_featured'    => 'boolean',
            'approved_at'    => 'datetime',
            'size_chart'     => 'array',
        ];
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'approved_by');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function approvedReviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('is_approved', true);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function wishlistedByUsers(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeByVendor($query, int $vendorId)
    {
        return $query->where('vendor_id', $vendorId);
    }

    public function scopeByCategory($query, int $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopePriceRange($query, float $min, float $max)
    {
        return $query->whereBetween('base_price', [$min, $max]);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function getEffectivePriceAttribute(): float
    {
        return $this->discount_price ?? $this->base_price;
    }

    public function isOnSale(): bool
    {
        return !is_null($this->discount_price) && $this->discount_price < $this->base_price;
    }

    public function getDiscountPercentageAttribute(): int
    {
        if (!$this->isOnSale()) {
            return 0;
        }

        return (int) round((($this->base_price - $this->discount_price) / $this->base_price) * 100);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
