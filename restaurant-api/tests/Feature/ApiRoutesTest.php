<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ApiRoutesTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    public static function staticRoutes(): array
    {
        return [
            ['/api/recipes/categories'],
            ['/api/tables/available'],
            ['/api/tables/locations'],
            ['/api/chefs/active'],
            ['/api/chefs/specialties'],
            ['/api/stations/active'],
            ['/api/settings/restaurant'],
            ['/api/settings/types'],
            ['/api/inventory/categories'],
            ['/api/inventory/alerts/low-stock'],
            ['/api/inventory/alerts/expiring'],
            ['/api/suppliers/active'],
            ['/api/suppliers/performance'],
            ['/api/purchases/alerts/overdue'],
            ['/api/purchases/stats'],
            ['/api/waste/reasons'],
            ['/api/waste/categories'],
        ];
    }

    public function test_api_routes_are_registered(): void
    {
        $this->getJson('/api/recipes')->assertOk()->assertJson(['success' => true]);
    }

    #[DataProvider('staticRoutes')]
    public function test_static_routes_are_not_shadowed_by_resource_routes(string $uri): void
    {
        $this->getJson($uri)->assertOk();
    }

    public function test_resource_show_routes_still_resolve(): void
    {
        $this->getJson('/api/tables/1')->assertOk();
        $this->getJson('/api/inventory/1')->assertOk();
    }
}
