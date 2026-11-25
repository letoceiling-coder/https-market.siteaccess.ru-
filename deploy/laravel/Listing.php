<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Listing extends Model
{
    protected $fillable = [
        'public_id',
        'user_id',
        'category_id',
        'category_path',
        'title',
        'slug',
        'description',
        'price',
        'currency',
        'price_suffix',
        'region_id',
        'place',
        'kind',
        'status',
        'attributes',
        'lat',
        'lng',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'attributes' => 'array',
            'published_at' => 'datetime',
            'price' => 'integer',
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Listing $listing): void {
            $listing->public_id ??= (string) Str::uuid();
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }
}
