<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'actor_type',
        'actor_id',
        'type',
        'data',
        'is_read',
    ];

    protected function casts(): array
    {
        return [
            'data'       => 'array',
            'is_read'    => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    public function scopeForActor($query, string $actorType, int $actorId)
    {
        return $query->where('actor_type', $actorType)
                     ->where('actor_id', $actorId);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function markAsRead(): void
    {
        $this->update(['is_read' => true]);
    }

    public static function send(string $actorType, int $actorId, string $type, array $data = []): static
    {
        return static::create([
            'actor_type' => $actorType,
            'actor_id'   => $actorId,
            'type'       => $type,
            'data'       => $data,
            'is_read'    => false,
            'created_at' => now(),
        ]);
    }

    /**
     * Bulk mark all unread notifications as read for an actor.
     */
    public static function markAllRead(string $actorType, int $actorId): void
    {
        static::forActor($actorType, $actorId)
            ->unread()
            ->update(['is_read' => true]);
    }

    public static function unreadCount(string $actorType, int $actorId): int
    {
        return static::forActor($actorType, $actorId)->unread()->count();
    }
}
