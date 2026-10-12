<?php

namespace Tests\Feature;

use App\Models\Recipe;
use App\Models\Table;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderCreationTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->create());
    }

    public function test_takeaway_order_can_be_created_without_table_number(): void
    {
        $recipe = Recipe::first();

        $this->postJson('/api/orders', [
            'type' => 'takeaway',
            'items' => [['recipe_id' => $recipe->id, 'quantity' => 2]],
        ])
            ->assertCreated()
            ->assertJsonPath('data.type', 'takeaway')
            ->assertJsonPath('data.table_number', null);
    }

    public function test_delivery_order_can_be_created_without_table_number(): void
    {
        $recipe = Recipe::first();

        $this->postJson('/api/orders', [
            'type' => 'delivery',
            'items' => [['recipe_id' => $recipe->id, 'quantity' => 1]],
        ])->assertCreated();
    }

    public function test_dine_in_order_marks_table_occupied(): void
    {
        $recipe = Recipe::first();
        $table = Table::where('status', 'available')->first();

        $this->postJson('/api/orders', [
            'type' => 'dine-in',
            'table_number' => $table->number,
            'items' => [['recipe_id' => $recipe->id, 'quantity' => 1]],
        ])
            ->assertCreated()
            ->assertJsonPath('data.table_number', $table->number);

        $this->assertSame('occupied', $table->fresh()->status);
    }
}
