<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'public_id' => $this->public_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'price' => $this->price,
            'currency' => $this->currency ?? 'RUB',
            'price_suffix' => $this->price_suffix,
            'region' => $this->region_id,
            'place' => $this->place,
            'category_id' => $this->category_id,
            'category_path' => $this->category_path,
            'kind' => $this->kind,
            'status' => $this->status,
            'published_at' => optional($this->published_at)?->toIso8601String(),
        ];
    }
}
