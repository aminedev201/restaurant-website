<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Category extends Model
{
    protected $fillable = [
        'name',
        'description',
        'status',
        'image_path',
    ];

    protected $casts = [
        'status'    => 'boolean',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        return config('app.url') . Storage::url($this->image_path);
    }

    public function plates()
    {
        return $this->hasMany(Plate::class,'category_id');
    }
}
