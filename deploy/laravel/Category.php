<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'parent_id',
        'slug',
        'path',
        'name',
        'description',
        'listing_kind',
        'attribute_set',
        'moderation',
        'icon',
        'sort_order',
        'depth',
        'seo_title',
        'seo_description',
        'sorts',
        'rules',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'sorts' => 'array',
            'rules' => 'array',
            'is_published' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order');
    }

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class, 'category_id');
    }
}
