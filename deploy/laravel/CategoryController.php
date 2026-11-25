<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'parent' => ['sometimes', 'string', 'max:80'],
            'path' => ['sometimes', 'string', 'max:255'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:500'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $perPage = min(max((int) $request->integer('per_page', 100), 1), 500);

        $query = Category::query()->where('is_published', true);

        if ($request->filled('parent')) {
            $parent = (string) $request->query('parent');
            $query->where('parent_id', $parent === 'root' ? null : $parent);
        }

        if ($request->filled('path')) {
            $query->where('path', (string) $request->query('path'));
        }

        $page = $query->orderBy('depth')->orderBy('sort_order')->orderBy('name')->paginate($perPage);

        return CategoryResource::collection($page->items())->additional([
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
        $category = Category::query()->where('is_published', true)->find($id);
        if (! $category) {
            abort(404, 'Category not found');
        }

        return new CategoryResource($category);
    }
}
