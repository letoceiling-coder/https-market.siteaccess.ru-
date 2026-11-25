<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ListingResource;
use App\Models\Listing;
use Illuminate\Http\Request;

class ListingController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'category' => ['sometimes', 'string', 'max:255'],
            'q' => ['sometimes', 'string', 'max:120'],
            'region' => ['sometimes', 'string', 'max:40'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $perPage = min(max((int) $request->integer('per_page', 20), 1), 100);

        $query = Listing::query()->published();

        if ($request->filled('category')) {
            $path = (string) $request->query('category');
            $query->where(function ($inner) use ($path) {
                $inner->where('category_path', $path)
                    ->orWhere('category_path', 'like', $path.'/%');
            });
        }

        if ($request->filled('q')) {
            $q = (string) $request->query('q');
            $like = $query->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where('title', $like, '%'.$q.'%');
        }

        if ($request->filled('region')) {
            $query->where('region_id', (string) $request->query('region'));
        }

        $page = $query->orderByDesc('published_at')->orderByDesc('id')->paginate($perPage);

        return ListingResource::collection($page->items())->additional([
            'meta' => [
                'current_page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
                'last_page' => $page->lastPage(),
            ],
        ]);
    }

    public function show(string $id)
    {
        $listing = Listing::query()->published()->find($id);
        if (! $listing) {
            abort(404, 'Listing not found');
        }

        return new ListingResource($listing);
    }
}
