<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'path' => $this->path,
            'parent_id' => $this->parent_id,
            'listing_kind' => $this->listing_kind,
            'depth' => $this->depth,
            'order' => $this->sort_order,
            'icon' => $this->icon,
        ];
    }
}
