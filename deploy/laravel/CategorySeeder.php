<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/taxonomy.json');
        if (! is_file($path)) {
            throw new \RuntimeException('taxonomy.json is missing at database/data/taxonomy.json');
        }

        $payload = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        $nodes = $payload['nodes'] ?? [];

        usort($nodes, static function (array $left, array $right): int {
            return ($left['depth'] ?? 0) <=> ($right['depth'] ?? 0)
                ?: ($left['order'] ?? 0) <=> ($right['order'] ?? 0);
        });

        foreach ($nodes as $node) {
            Category::query()->updateOrCreate(
                ['id' => $node['id']],
                [
                    'parent_id' => $node['parentId'] ?: null,
                    'slug' => $node['slug'],
                    'path' => $node['path'],
                    'name' => $node['name'],
                    'description' => $node['description'] ?? null,
                    'listing_kind' => $node['listingKind'],
                    'attribute_set' => $node['attributeSet'],
                    'moderation' => $node['moderation'] ?? 'review',
                    'icon' => $node['icon'] ?? null,
                    'sort_order' => $node['order'] ?? 0,
                    'depth' => $node['depth'] ?? 0,
                    'seo_title' => $node['seoTitle'] ?? null,
                    'seo_description' => $node['seoDescription'] ?? null,
                    'sorts' => $node['sorts'] ?? [],
                    'rules' => $node['rules'] ?? [],
                    'is_published' => true,
                ],
            );
        }
    }
}
