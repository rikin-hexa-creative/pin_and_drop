<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasName;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Admin extends Authenticatable implements FilamentUser, HasName
{
    use HasFactory, Notifiable;

    protected $guard = 'admin';

    protected $fillable = [
        'full_name',
        'email',
        'password',
        'role',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password'      => 'hashed',
            'is_active'     => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function approvedVendors(): HasMany
    {
        return $this->hasMany(Vendor::class, 'approved_by');
    }

    public function approvedProducts(): HasMany
    {
        return $this->hasMany(Product::class, 'approved_by');
    }

    public function createdCategories(): HasMany
    {
        return $this->hasMany(Category::class, 'created_by');
    }

    public function createdCoupons(): HasMany
    {
        return $this->hasMany(Coupon::class, 'created_by');
    }

    public function approvedReviews(): HasMany
    {
        return $this->hasMany(Review::class, 'approved_by');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isModerator(): bool
    {
        return $this->role === 'moderator';
    }

    // -------------------------------------------------------------------------
    // Filament
    // -------------------------------------------------------------------------

    public function canAccessPanel(Panel $panel): bool
    {
        return $panel->getId() === 'admin' && $this->is_active;
    }

    public function getFilamentName(): string
    {
        return $this->full_name ?? $this->email;
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRole($query, string $role)
    {
        return $query->where('role', $role);
    }
}
