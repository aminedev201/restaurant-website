<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'delivery_address',
        'status',
        'payment_method',
        'payment_status',
        'stripe_payment_intent_id',
        'shipping',
        'final_total',
    ];

    protected $casts = [
        'shipping'    => 'double',
        'final_total' => 'double',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orderPlates()
    {
        return $this->hasMany(OrderPlate::class);
    }
    public function plates()
    {
        return $this->hasMany(OrderPlate::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Generate a unique order number like ORD-20250305-XXXX
     */
    public static function generateOrderNumber(): string
    {
        do {
            $number = 'ORD-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
        } while (self::where('order_number', $number)->exists());

        return $number;
    }
}
