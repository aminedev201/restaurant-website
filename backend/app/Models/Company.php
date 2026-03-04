<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Company extends Model
{
    protected $fillable = [
        'name',
        'logo',
        'address',
        'location_url',
        'phones',
        'emails',
        'working_datetime',
        'social_media',
    ];

    protected $casts = [
        'phones'           => 'array',
        'emails'           => 'array',
        'working_datetime' => 'array',
        'social_media'     => 'array',
    ];

    protected $appends = ['logo_url'];

    // ── Accessors ───────────────────────────────────────────────────────────────

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo
            ? config('app.url') . Storage::url($this->logo)
            : null;
    }
}
