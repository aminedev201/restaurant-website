<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Chef extends Model
{
    use HasFactory;

    protected $fillable = [
        'fullname',
        'position',
        'image_path',
        'short_desc',
        'social_media',
        'status',
    ];

    protected $appends = ['image_url'];

    protected $casts = [
        'social_media' => 'array',
        'status'       => 'boolean',
    ];

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? config('app.url') . Storage::url($this->image_path) : null;
    }
}