<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['shipping'];

    protected $casts = [
        'shipping' => 'double',
    ];

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Get the single settings row, creating it with defaults if it doesn't exist.
     */
    public static function instance(): self
    {
        return self::firstOrCreate([], ['shipping' => 0]);
    }
}
