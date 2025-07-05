<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Recipe;
use App\Models\Table;
use App\Models\Chef;
use App\Models\Station;
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
}
