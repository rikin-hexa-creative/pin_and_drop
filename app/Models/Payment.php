<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'method',
        'status',
        'transaction_id',
        'amount',
        'paid_at',
        'gateway_response',
    ];

    protected function casts(): array
    {
        return [
            'amount'           => 'decimal:2',
            'paid_at'          => 'datetime',
            'gateway_response' => 'array',
        ];
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function isPaid(): bool     { return $this->status === 'paid'; }
    public function isFailed(): bool   { return $this->status === 'failed'; }
    public function isRefunded(): bool { return $this->status === 'refunded'; }

    public function markAsPaid(string $transactionId): void
    {
        $this->update([
            'status'         => 'paid',
            'transaction_id' => $transactionId,
            'paid_at'        => now(),
        ]);
    }
}
