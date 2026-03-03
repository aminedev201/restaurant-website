<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Plate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'short_desc',
        'desc',
        'old_price',
        'price',
        'discount',
        'image_path',
        'status',
        'category_id',
    ];

    protected $appends = ['image_url'];

    protected $casts = [
        'old_price' => 'double',
        'price'     => 'double',
        'discount'  => 'integer',
        'status'    => 'boolean',
    ];

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getImageUrlAttribute(): ?string
    {
        return config('app.url') . Storage::url($this->image_path);
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
