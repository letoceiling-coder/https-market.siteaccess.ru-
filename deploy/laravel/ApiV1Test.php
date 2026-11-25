<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiV1Test extends TestCase
{
    use RefreshDatabase;

    public function test_health_returns_structured_payload(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(in_array($response->status(), [200, 503], true) ? $response->status() : 200)
            ->assertJsonStructure([
                'data' => [
                    'service',
                    'status',
                    'checks' => ['app', 'database', 'redis'],
                ],
            ])
            ->assertJsonMissingPath('data.env')
            ->assertJsonMissingPath('data.key');
    }

    public function test_categories_return_collection_envelope(): void
    {
        $this->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonPath('data', [])
            ->assertJsonPath('meta.total', 0)
            ->assertJsonPath('meta.per_page', 100);
    }

    public function test_seeded_category_is_listed_and_shown(): void
    {
        Category::query()->create($this->categoryPayload());

        $this->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.path', 'uslugi');

        $this->getJson('/api/v1/categories/tax-uslugi')
            ->assertOk()
            ->assertJsonPath('data.name', 'Услуги');
    }

    public function test_listings_return_only_published_rows(): void
    {
        $category = Category::query()->create($this->categoryPayload());

        Listing::query()->create([
            'category_id' => $category->id,
            'category_path' => $category->path,
            'title' => 'Черновик',
            'slug' => 'draft-item',
            'kind' => 'service',
            'status' => 'draft',
        ]);

        $this->getJson('/api/v1/listings')
            ->assertOk()
            ->assertJsonPath('data', [])
            ->assertJsonPath('meta.total', 0);
    }

    public function test_missing_listing_uses_error_envelope(): void
    {
        $this->getJson('/api/v1/listings/1')
            ->assertNotFound()
            ->assertJsonPath('error.code', 'not_found')
            ->assertJsonPath('error.status', 404);
    }

    public function test_invalid_pagination_is_rejected(): void
    {
        $this->getJson('/api/v1/listings?per_page=0')
            ->assertUnprocessable()
            ->assertJsonPath('error.code', 'validation_error');
    }

    /**
     * @return array<string, mixed>
     */
    private function categoryPayload(): array
    {
        return [
            'id' => 'tax-uslugi',
            'parent_id' => null,
            'slug' => 'uslugi',
            'path' => 'uslugi',
            'name' => 'Услуги',
            'description' => 'Справочный раздел',
            'listing_kind' => 'service',
            'attribute_set' => 'service',
            'moderation' => 'review',
            'icon' => 'Wrench',
            'sort_order' => 1,
            'depth' => 0,
            'is_published' => true,
        ];
    }
}
