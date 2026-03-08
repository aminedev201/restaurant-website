<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class OrderPlate extends Model
{
    protected $fillable = [
        'order_id',
        'plate_id',
        'plate_name',
        'category_name',
        'plate_price',
        'plate_old_price',
        'discount',
        'quantity',
        'total',
    ];

    protected $casts = [
        'plate_price'     => 'double',
        'plate_old_price' => 'double',
        'discount'        => 'integer',
        'quantity'        => 'integer',
        'total'           => 'double',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function plate()
    {
        return $this->belongsTo(Plate::class)->withDefault();
    }
}
