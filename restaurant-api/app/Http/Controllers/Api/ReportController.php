<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Recipe;
use App\Models\Table;
use App\Models\Chef;
use App\Models\Station;
use App\Models\Inventory;
use App\Models\Purchase;
use App\Models\StockTransaction;
use App\Models\Supplier;
use App\Models\Waste;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Get daily sales report
     */
    public function dailySales(Request $request): JsonResponse
    {
        $date = $request->get('date', now()->toDateString());
        
        $orders = Order::whereDate('created_at', $date)->get();
        
        $totalSales = $orders->sum('total');
        $totalOrders = $orders->count();
        $completedOrders = $orders->where('status', 'completed')->count();
        $averageOrder = $totalOrders > 0 ? $totalSales / $totalOrders : 0;
        $completionRate = $totalOrders > 0 ? ($completedOrders / $totalOrders) * 100 : 0;
        $totalTax = $orders->sum('tax');
        $totalDeliveryFees = $orders->sum('delivery_fee');
        $netSales = $totalSales - $totalTax - $totalDeliveryFees;

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $date,
                'total_sales' => $totalSales,
                'total_orders' => $totalOrders,
                'completed_orders' => $completedOrders,
                'average_order' => $averageOrder,
                'completion_rate' => $completionRate,
                'total_tax' => $totalTax,
                'total_delivery_fees' => $totalDeliveryFees,
                'net_sales' => $netSales,
            ],
        ]);
    }

    /**
     * Get monthly sales report
     */
    public function monthlySales(Request $request): JsonResponse
    {
        $year = $request->get('year', now()->year);
        $month = $request->get('month', now()->month);
        
        $orders = Order::whereYear('created_at', $year)
                      ->whereMonth('created_at', $month)
                      ->get();
        
        $totalSales = $orders->sum('total');
        $totalOrders = $orders->count();
        $completedOrders = $orders->where('status', 'completed')->count();
        $averageOrder = $totalOrders > 0 ? $totalSales / $totalOrders : 0;
        $completionRate = $totalOrders > 0 ? ($completedOrders / $totalOrders) * 100 : 0;
        $totalTax = $orders->sum('tax');
        $totalDeliveryFees = $orders->sum('delivery_fee');
        $netSales = $totalSales - $totalTax - $totalDeliveryFees;
        
        // Calculate average daily sales
        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
        $averageDailySales = $daysInMonth > 0 ? $totalSales / $daysInMonth : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'year' => $year,
                'month' => $month,
                'total_sales' => $totalSales,
                'total_orders' => $totalOrders,
                'completed_orders' => $completedOrders,
                'average_order' => $averageOrder,
                'completion_rate' => $completionRate,
                'total_tax' => $totalTax,
                'total_delivery_fees' => $totalDeliveryFees,
                'net_sales' => $netSales,
                'average_daily_sales' => $averageDailySales,
            ],
        ]);
    }

    /**
     * Get top selling items
     */
    public function topItems(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);
        $period = $request->get('period', 'all'); // all, today, week, month
        
        $query = DB::table('order_items')
            ->join('recipes', 'order_items.recipe_id', '=', 'recipes.id')
            ->select(
                'recipes.id',
                'recipes.name',
                'recipes.category',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.total) as total_revenue'),
                DB::raw('COUNT(DISTINCT order_items.order_id) as order_count')
            )
            ->groupBy('recipes.id', 'recipes.name', 'recipes.category');

        // Apply period filter
        if ($period !== 'all') {
            $query->join('orders', 'order_items.order_id', '=', 'orders.id');
            
            switch ($period) {
                case 'today':
                    $query->whereDate('orders.created_at', today());
                    break;
                case 'week':
                    $query->whereBetween('orders.created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                    break;
                case 'month':
                    $query->whereMonth('orders.created_at', now()->month)
                          ->whereYear('orders.created_at', now()->year);
                    break;
            }
        }

        $topItems = $query->orderBy('total_quantity', 'desc')
                         ->limit($limit)
                         ->get();

        return response()->json([
            'success' => true,
            'data' => $topItems,
        ]);
    }

    /**
     * Get category sales report
     */
    public function categorySales(Request $request): JsonResponse
    {
        $period = $request->get('period', 'all');
        
        $query = DB::table('order_items')
            ->join('recipes', 'order_items.recipe_id', '=', 'recipes.id')
            ->select(
                'recipes.category',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.total) as total_revenue'),
                DB::raw('COUNT(DISTINCT order_items.order_id) as order_count')
            )
            ->groupBy('recipes.category');

        // Apply period filter
        if ($period !== 'all') {
            $query->join('orders', 'order_items.order_id', '=', 'orders.id');
            
            switch ($period) {
                case 'today':
                    $query->whereDate('orders.created_at', today());
                    break;
                case 'week':
                    $query->whereBetween('orders.created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                    break;
                case 'month':
                    $query->whereMonth('orders.created_at', now()->month)
                          ->whereYear('orders.created_at', now()->year);
                    break;
            }
        }

        $categorySales = $query->orderBy('total_revenue', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $categorySales,
        ]);
    }

    /**
     * Get kitchen statistics
     */
    public function kitchenStats(Request $request): JsonResponse
    {
        $date = $request->get('date', now()->toDateString());
        
        $orders = Order::whereDate('created_at', $date)->get();
        
        $totalOrders = $orders->count();
        $completedOrders = $orders->where('status', 'completed')->count();
        $pendingOrders = $orders->whereIn('status', ['new', 'preparing', 'ready'])->count();
        
        // Calculate average prep time for completed orders
        $completedOrdersWithTime = $orders->where('status', 'completed')
            ->filter(function ($order) {
                return $order->completed_time && $order->created_at;
            });
        
        $avgPrepTime = 0;
        if ($completedOrdersWithTime->count() > 0) {
            $totalTime = $completedOrdersWithTime->sum(function ($order) {
                return $order->completed_time->diffInMinutes($order->created_at);
            });
            $avgPrepTime = $totalTime / $completedOrdersWithTime->count();
        }
        
        // Calculate efficiency (orders completed within estimated time)
        $efficientOrders = $completedOrdersWithTime->filter(function ($order) {
            $actualTime = $order->completed_time->diffInMinutes($order->created_at);
            $estimatedTime = 30; // Default estimated time in minutes
            return $actualTime <= $estimatedTime;
        })->count();
        
        $efficiency = $completedOrders > 0 ? ($efficientOrders / $completedOrders) * 100 : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $date,
                'total_orders' => $totalOrders,
                'completed_orders' => $completedOrders,
                'pending_orders' => $pendingOrders,
                'avg_prep_time' => round($avgPrepTime, 2),
                'efficiency' => round($efficiency, 2),
            ],
        ]);
    }

    /**
     * Get table statistics
     */
    public function tableStats(Request $request): JsonResponse
    {
        $tables = Table::all();
        $stats = [];
        
        foreach ($tables as $table) {
            $orders = Order::where('table_number', $table->number)
                          ->where('status', 'completed')
                          ->get();
            
            $totalRevenue = $orders->sum('total');
            $totalOrders = $orders->count();
            $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;
            
            // Calculate average occupancy time
            $totalTime = $orders->sum(function ($order) {
                if ($order->completed_time && $order->created_at) {
                    return $order->completed_time->diffInMinutes($order->created_at);
                }
                return 0;
            });
            $averageOccupancyTime = $totalOrders > 0 ? $totalTime / $totalOrders : 0;
            
            $stats[] = [
                'table_number' => $table->number,
                'capacity' => $table->capacity,
                'location' => $table->location,
                'status' => $table->status,
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'average_order_value' => $averageOrderValue,
                'average_occupancy_time' => round($averageOccupancyTime, 2),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get chef performance report
     */
    public function chefPerformance(Request $request): JsonResponse
    {
        $period = $request->get('period', 'all');
        
        $query = Order::whereNotNull('assigned_chef')
                     ->where('status', 'completed')
                     ->select(
                         'assigned_chef',
                         DB::raw('COUNT(*) as total_orders'),
                         DB::raw('SUM(total) as total_revenue'),
                         DB::raw('AVG(total) as average_order_value')
                     )
                     ->groupBy('assigned_chef');

        // Apply period filter
        switch ($period) {
            case 'today':
                $query->whereDate('created_at', today());
                break;
            case 'week':
                $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
            case 'month':
                $query->whereMonth('created_at', now()->month)
                      ->whereYear('created_at', now()->year);
                break;
        }

        $chefPerformance = $query->orderBy('total_revenue', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $chefPerformance,
        ]);
    }

    /**
     * Get station performance report
     */
    public function stationPerformance(Request $request): JsonResponse
    {
        $period = $request->get('period', 'all');
        
        $query = Order::whereNotNull('assigned_station')
                     ->where('status', 'completed')
                     ->select(
                         'assigned_station',
                         DB::raw('COUNT(*) as total_orders'),
                         DB::raw('SUM(total) as total_revenue'),
                         DB::raw('AVG(total) as average_order_value')
                     )
                     ->groupBy('assigned_station');

        // Apply period filter
        switch ($period) {
            case 'today':
                $query->whereDate('created_at', today());
                break;
            case 'week':
                $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
            case 'month':
                $query->whereMonth('created_at', now()->month)
                      ->whereYear('created_at', now()->year);
                break;
        }

        $stationPerformance = $query->orderBy('total_revenue', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $stationPerformance,
        ]);
    }

    /**
     * Export data
     */
    public function exportData(Request $request): JsonResponse
    {
        $type = $request->get('type', 'orders');
        $format = $request->get('format', 'json');
        $period = $request->get('period', 'all');
        
        $data = [];
        
        switch ($type) {
            case 'orders':
                $query = Order::with(['orderItems.recipe']);
                
                if ($period !== 'all') {
                    switch ($period) {
                        case 'today':
                            $query->whereDate('created_at', today());
                            break;
                        case 'week':
                            $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                            break;
                        case 'month':
                            $query->whereMonth('created_at', now()->month)
                                  ->whereYear('created_at', now()->year);
                            break;
                    }
                }
                
                $data = $query->get();
                break;
                
            case 'recipes':
                $data = Recipe::all();
                break;
                
            case 'tables':
                $data = Table::all();
                break;
                
            case 'chefs':
                $data = Chef::all();
                break;
                
            case 'stations':
                $data = Station::all();
                break;
        }

        return response()->json([
            'success' => true,
            'data' => $data,
            'export_info' => [
                'type' => $type,
                'format' => $format,
                'period' => $period,
                'exported_at' => now()->toISOString(),
                'total_records' => count($data),
            ],
        ]);
    }

    /**
     * Get inventory stock levels report
     */
    public function inventoryStock(Request $request): JsonResponse
    {
        $query = Inventory::with('supplier:id,name')->active();

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        $items = $query->orderBy('category')->orderBy('name')->get();

        $data = $items->map(fn ($item) => [
            'id' => $item->id,
            'name' => $item->name,
            'sku' => $item->sku,
            'category' => $item->category,
            'unit' => $item->unit,
            'current_stock' => $item->current_stock,
            'min_stock' => $item->min_stock,
            'max_stock' => $item->max_stock,
            'stock_status' => $item->stock_status,
            'stock_value' => $item->stock_value,
            'expiry_date' => $item->expiry_date?->toDateString(),
            'supplier' => $item->supplier?->name,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'total_items' => $items->count(),
                'low_stock_count' => $items->filter(fn ($item) => $item->isLowStock() && !$item->isOutOfStock())->count(),
                'out_of_stock_count' => $items->filter(fn ($item) => $item->isOutOfStock())->count(),
                'expiring_soon_count' => (clone $query)->expiringSoon()->count(),
                'items' => $data->values(),
            ],
        ]);
    }

    /**
     * Get inventory value report
     */
    public function inventoryValue(Request $request): JsonResponse
    {
        $byCategory = Inventory::active()
            ->selectRaw('category, COUNT(*) as item_count, SUM(current_stock * cost_per_unit) as total_value')
            ->groupBy('category')
            ->orderByDesc('total_value')
            ->get();

        $totalValue = $byCategory->sum('total_value');

        return response()->json([
            'success' => true,
            'data' => [
                'total_value' => $totalValue,
                'total_items' => $byCategory->sum('item_count'),
                'by_category' => $byCategory->map(fn ($row) => [
                    'category' => $row->category,
                    'item_count' => (int) $row->item_count,
                    'total_value' => (float) $row->total_value,
                    'percentage' => $totalValue > 0 ? ($row->total_value / $totalValue) * 100 : 0,
                ]),
            ],
        ]);
    }

    /**
     * Get inventory movement report
     */
    public function inventoryMovement(Request $request): JsonResponse
    {
        [$startDate, $endDate] = $this->dateRange($request);

        $query = StockTransaction::whereDate('transaction_date', '>=', $startDate)
            ->whereDate('transaction_date', '<=', $endDate);

        if ($request->filled('inventory_id')) {
            $query->byInventory($request->inventory_id);
        }

        $byType = (clone $query)
            ->selectRaw('transaction_type, COUNT(*) as count, SUM(quantity) as total_quantity, SUM(total_value) as total_value')
            ->groupBy('transaction_type')
            ->get();

        $mostActive = (clone $query)
            ->with('inventory:id,name,unit')
            ->selectRaw('inventory_id, COUNT(*) as transaction_count, SUM(ABS(quantity)) as total_quantity')
            ->groupBy('inventory_id')
            ->orderByDesc('transaction_count')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'total_transactions' => $byType->sum('count'),
                'by_type' => $byType,
                'most_active_items' => $mostActive,
            ],
        ]);
    }

    /**
     * Get purchase analysis report
     */
    public function purchaseAnalysis(Request $request): JsonResponse
    {
        [$startDate, $endDate] = $this->dateRange($request);

        $purchases = Purchase::with('supplier:id,name')
            ->whereDate('order_date', '>=', $startDate)
            ->whereDate('order_date', '<=', $endDate)
            ->get();

        $active = $purchases->where('status', '!=', 'cancelled');

        return response()->json([
            'success' => true,
            'data' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'total_purchases' => $purchases->count(),
                'total_spent' => $active->sum('total_amount'),
                'average_purchase' => $active->count() > 0 ? $active->sum('total_amount') / $active->count() : 0,
                'by_status' => $purchases->countBy('status'),
                'by_payment_status' => $purchases->countBy('payment_status'),
                'by_supplier' => $active->groupBy('supplier_id')->map(fn ($group) => [
                    'supplier_id' => $group->first()->supplier_id,
                    'supplier' => $group->first()->supplier?->name,
                    'purchase_count' => $group->count(),
                    'total_spent' => $group->sum('total_amount'),
                ])->sortByDesc('total_spent')->values(),
            ],
        ]);
    }

    /**
     * Get waste analysis report
     */
    public function wasteAnalysis(Request $request): JsonResponse
    {
        [$startDate, $endDate] = $this->dateRange($request);

        $waste = Waste::with('inventory:id,name,unit')
            ->whereDate('waste_date', '>=', $startDate)
            ->whereDate('waste_date', '<=', $endDate)
            ->get();

        $summarize = fn ($group) => [
            'count' => $group->count(),
            'total_quantity' => $group->sum('quantity'),
            'total_cost' => $group->sum('total_cost'),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'total_records' => $waste->count(),
                'total_cost' => $waste->sum('total_cost'),
                'by_reason' => $waste->groupBy('reason')->map($summarize),
                'by_category' => $waste->groupBy(fn ($w) => $w->category ?? 'uncategorized')->map($summarize),
                'top_items' => $waste->groupBy('inventory_id')->map(fn ($group) => [
                    'inventory_id' => $group->first()->inventory_id,
                    'name' => $group->first()->inventory?->name,
                    'unit' => $group->first()->inventory?->unit,
                ] + $summarize($group))->sortByDesc('total_cost')->take(10)->values(),
            ],
        ]);
    }

    /**
     * Get supplier performance report
     */
    public function supplierPerformance(Request $request): JsonResponse
    {
        [$startDate, $endDate] = $this->dateRange($request);

        $suppliers = Supplier::with(['purchases' => fn ($q) => $q->whereDate('order_date', '>=', $startDate)
            ->whereDate('order_date', '<=', $endDate)])
            ->orderBy('name')
            ->get();

        $data = $suppliers->map(function ($supplier) {
            $purchases = $supplier->purchases;
            $delivered = $purchases->where('status', 'delivered');
            $onTime = $delivered->filter(fn ($p) => $p->expected_delivery && $p->delivery_date
                && $p->delivery_date->lte($p->expected_delivery));
            $withDates = $delivered->filter(fn ($p) => $p->expected_delivery && $p->delivery_date);

            return [
                'id' => $supplier->id,
                'name' => $supplier->name,
                'is_active' => $supplier->is_active,
                'total_purchases' => $purchases->count(),
                'total_spent' => $purchases->where('status', '!=', 'cancelled')->sum('total_amount'),
                'delivered_count' => $delivered->count(),
                'cancelled_count' => $purchases->where('status', 'cancelled')->count(),
                'on_time_rate' => $withDates->count() > 0 ? ($onTime->count() / $withDates->count()) * 100 : null,
                'average_rating' => $purchases->whereNotNull('rating')->avg('rating') ?? $supplier->rating,
            ];
        })->sortByDesc('total_spent')->values();

        return response()->json([
            'success' => true,
            'data' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'suppliers' => $data,
            ],
        ]);
    }

    /**
     * Resolve start/end dates from the request, defaulting to the last 30 days
     */
    private function dateRange(Request $request): array
    {
        return [
            $request->get('start_date', now()->subDays(30)->toDateString()),
            $request->get('end_date', now()->toDateString()),
        ];
    }
}
