<?php

namespace Tests\Feature;

use App\Models\Inventory;
use App\Models\Purchase;
use App\Models\StockTransaction;
use App\Models\Supplier;
use App\Models\Waste;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryReportsTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    private function createWaste(array $attributes = []): Waste
    {
        $inventory = Inventory::first();

        return Waste::create(array_merge([
            'inventory_id' => $inventory->id,
            'quantity' => 2,
            'unit_cost' => 5,
            'total_cost' => 10,
            'reason' => 'expired',
            'category' => 'spoilage',
            'waste_date' => now()->toDateString(),
        ], $attributes));
    }

    public function test_waste_endpoints_use_the_waste_table(): void
    {
        $waste = $this->createWaste();

        $this->getJson('/api/waste')->assertOk();
        $this->getJson("/api/waste/{$waste->id}")->assertOk();
    }

    public function test_inventory_stock_report(): void
    {
        $this->getJson('/api/reports/inventory-stock')
            ->assertOk()
            ->assertJsonPath('data.total_items', Inventory::active()->count())
            ->assertJsonStructure(['data' => ['low_stock_count', 'out_of_stock_count', 'expiring_soon_count', 'items']]);
    }

    public function test_inventory_value_report(): void
    {
        $expected = Inventory::active()->get()->sum(fn ($i) => $i->current_stock * $i->cost_per_unit);

        $response = $this->getJson('/api/reports/inventory-value')->assertOk();

        $this->assertEqualsWithDelta($expected, $response->json('data.total_value'), 0.01);
    }

    public function test_inventory_movement_report(): void
    {
        $inventory = Inventory::first();
        StockTransaction::create([
            'inventory_id' => $inventory->id,
            'transaction_type' => 'adjustment',
            'quantity' => 5,
            'previous_stock' => 0,
            'new_stock' => 5,
            'transaction_date' => now(),
            'unit_cost' => 2,
            'total_value' => 10,
        ]);

        $this->getJson('/api/reports/inventory-movement')
            ->assertOk()
            ->assertJsonPath('data.total_transactions', 1)
            ->assertJsonPath('data.most_active_items.0.inventory_id', $inventory->id);
    }

    public function test_purchase_and_supplier_reports(): void
    {
        $supplier = Supplier::first();
        Purchase::create([
            'purchase_number' => 'PO-TEST-1',
            'supplier_id' => $supplier->id,
            'order_date' => now()->toDateString(),
            'expected_delivery' => now()->toDateString(),
            'delivery_date' => now()->toDateString(),
            'status' => 'delivered',
            'total_amount' => 120,
        ]);

        $this->getJson('/api/reports/purchase-analysis')
            ->assertOk()
            ->assertJsonPath('data.total_purchases', 1)
            ->assertJsonPath('data.by_supplier.0.supplier_id', $supplier->id);

        $response = $this->getJson('/api/reports/supplier-performance')->assertOk();
        $row = collect($response->json('data.suppliers'))->firstWhere('id', $supplier->id);
        $this->assertSame(1, $row['delivered_count']);
        $this->assertEquals(100, $row['on_time_rate']);
    }

    public function test_waste_analysis_report(): void
    {
        $this->createWaste();
        $this->createWaste(['reason' => 'damaged', 'total_cost' => 4]);

        $response = $this->getJson('/api/reports/waste-analysis')
            ->assertOk()
            ->assertJsonPath('data.total_records', 2);

        $this->assertEqualsWithDelta(14, $response->json('data.total_cost'), 0.01);
    }
}
