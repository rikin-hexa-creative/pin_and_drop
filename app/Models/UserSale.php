<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSale extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'images',
        'actual_price',
        'compare_at_price',
        'condition',
        'created_date',
        'sale_status',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'actual_price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'created_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeSold($query)
    {
        return $query->where('sale_status', 'sold');
    }

    public function scopeNotSold($query)
    {
        return $query->where('sale_status', 'not_sold');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public static function saleStatuses(): array
    {
        return ['not_sold', 'sold'];
    }

    public static function statuses(): array
    {
        return ['active', 'inactive'];
    }
}
