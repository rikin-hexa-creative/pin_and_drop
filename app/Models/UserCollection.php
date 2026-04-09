<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserCollection extends Model
{
    protected $fillable = [
        'user_id',
        'name',
    ];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_user_collection');
    }
}
