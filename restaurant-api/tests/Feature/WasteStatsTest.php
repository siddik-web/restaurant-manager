<?php

namespace Tests\Feature;

use App\Models\Inventory;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Waste;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WasteStatsTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->create());
    }

    private function waste(Inventory $inventory, string $reason, ?string $category, float $quantity, float $cost, string $date): Waste
    {
        return Waste::create([
            'inventory_id' => $inventory->id,
            'quantity' => $quantity,
            'unit_cost' => $cost / $quantity,
            'total_cost' => $cost,
            'reason' => $reason,
            'category' => $category,
            'waste_date' => $date,
        ]);
    }

    private function seedWaste(): array
    {
        [$a, $b] = Inventory::orderBy('id')->take(2)->get()->all();

        // reason / category / item deliberately cross each other
        $this->waste($a, 'expired', 'spoilage', 2, 10, '2026-10-01');
        $this->waste($a, 'damaged', 'spoilage', 1, 4, '2026-10-01');
        $this->waste($b, 'expired', 'prep', 3, 6, '2026-10-02');
        $this->waste($b, 'spilled', 'prep', 1, 20, '2026-10-03');

        return [$a, $b];
    }

    public function test_totals_cover_every_record(): void
    {
        $this->seedWaste();

        $data = $this->getJson('/api/waste/stats')->assertOk()->json('data');

        $this->assertSame(4, $data['total_waste_records']);
        $this->assertEquals(40, $data['total_waste_value']);
        $this->assertEquals(7, $data['total_waste_quantity']);
        $this->assertEquals(10, $data['average_waste_value']);
    }

    public function test_breakdown_by_reason(): void
    {
        $this->seedWaste();

        $rows = collect($this->getJson('/api/waste/stats')->json('data.by_reason'))->keyBy('reason');

        $this->assertCount(3, $rows);
        $this->assertEquals(16, $rows['expired']['total_value']);
        $this->assertEquals(2, $rows['expired']['count']);
        $this->assertEquals(4, $rows['damaged']['total_value']);
        $this->assertEquals(20, $rows['spilled']['total_value']);
    }

    public function test_breakdown_by_category(): void
    {
        $this->seedWaste();

        $rows = collect($this->getJson('/api/waste/stats')->json('data.by_category'))->keyBy('category');

        $this->assertCount(2, $rows);
        $this->assertEquals(14, $rows['spoilage']['total_value']);
        $this->assertEquals(26, $rows['prep']['total_value']);
        $this->assertEquals(2, $rows['prep']['count']);
    }

    public function test_breakdown_by_inventory_item(): void
    {
        [$a, $b] = $this->seedWaste();

        $rows = collect($this->getJson('/api/waste/stats')->json('data.by_inventory'))->keyBy('inventory_id');

        $this->assertCount(2, $rows);
        $this->assertEquals(14, $rows[$a->id]['total_value']);
        $this->assertEquals(26, $rows[$b->id]['total_value']);
        $this->assertSame($b->id, $rows->first()['inventory_id'], 'ordered by value, highest first');
    }

    public function test_daily_trends(): void
    {
        $this->seedWaste();

        $rows = collect($this->getJson('/api/waste/stats')->json('data.daily_trends'))->keyBy('date');

        $this->assertCount(3, $rows);
        $this->assertEquals(14, $rows['2026-10-01']['total_value']);
        $this->assertEquals(2, $rows['2026-10-01']['count']);
        $this->assertEquals(20, $rows['2026-10-03']['total_value']);
    }

    public function test_date_range_includes_both_end_dates(): void
    {
        $this->seedWaste();

        $data = $this->getJson('/api/waste/stats?start_date=2026-10-02&end_date=2026-10-03')->json('data');

        $this->assertSame(2, $data['total_waste_records']);
        $this->assertEquals(26, $data['total_waste_value']);
        $this->assertEquals(26, collect($data['by_category'])->sum('total_value'));
    }

    public function test_date_range_filter_on_the_waste_list_includes_the_end_date(): void
    {
        $this->seedWaste();

        $this->getJson('/api/waste?start_date=2026-10-01&end_date=2026-10-01')
            ->assertOk()
            ->assertJsonPath('data.total', 2);
    }

    public function test_inventory_item_lists_the_purchases_that_include_it(): void
    {
        [$a, $b] = Inventory::orderBy('id')->take(2)->get()->all();
        $supplier = Supplier::first();

        $both = Purchase::create([
            'purchase_number' => 'PO-1', 'supplier_id' => $supplier->id,
            'order_date' => '2026-10-01', 'status' => 'pending', 'total_amount' => 50,
        ]);
        $onlyB = Purchase::create([
            'purchase_number' => 'PO-2', 'supplier_id' => $supplier->id,
            'order_date' => '2026-10-02', 'status' => 'pending', 'total_amount' => 30,
        ]);

        foreach ([[$both, $a], [$both, $b], [$both, $a], [$onlyB, $b]] as [$purchase, $item]) {
            PurchaseItem::create([
                'purchase_id' => $purchase->id, 'inventory_id' => $item->id,
                'quantity' => 1, 'unit_cost' => 5, 'total_cost' => 5,
            ]);
        }

        $this->assertEquals([$both->id], $a->purchases()->pluck('purchases.id')->all(), 'listed once even with two lines');
        $this->assertEqualsCanonicalizing([$both->id, $onlyB->id], $b->purchases()->pluck('purchases.id')->all());
    }
}
