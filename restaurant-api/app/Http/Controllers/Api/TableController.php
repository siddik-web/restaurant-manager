<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Table;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TableController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Table::query();

        // Status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Location filter
        if ($request->has('location')) {
            $query->byLocation($request->location);
        }

        // Capacity filter
        if ($request->has('capacity')) {
            $query->byCapacity($request->capacity);
        }

        // Search functionality
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('number', 'like', "%{$request->search}%")
                  ->orWhere('location', 'like', "%{$request->search}%")
                  ->orWhere('notes', 'like', "%{$request->search}%");
            });
        }

        $tables = $query->orderBy('number')->get();

        return response()->json([
            'success' => true,
            'data' => $tables,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'number' => 'required|integer|unique:tables,number',
            'capacity' => 'required|integer|min:1|max:20',
            'status' => 'required|in:available,reserved,occupied,cleaning,maintenance',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:255',
            'reservation_time' => 'nullable|date',
        ]);

        $table = Table::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Table created successfully',
            'data' => $table,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Table $table): JsonResponse
    {
        $table->load(['orders' => function ($query) {
            $query->whereIn('status', ['new', 'preparing', 'ready'])
                  ->orderBy('created_at', 'desc');
        }]);

        return response()->json([
            'success' => true,
            'data' => $table,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Table $table): JsonResponse
    {
        $validated = $request->validate([
            'number' => 'sometimes|required|integer|unique:tables,number,' . $table->id,
            'capacity' => 'sometimes|required|integer|min:1|max:20',
            'status' => 'sometimes|required|in:available,reserved,occupied,cleaning,maintenance',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:255',
            'reservation_time' => 'nullable|date',
        ]);

        $table->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Table updated successfully',
            'data' => $table,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Table $table): JsonResponse
    {
        // Check if table has active orders
        $activeOrders = Order::where('table_number', $table->number)
            ->whereIn('status', ['new', 'preparing', 'ready'])
            ->count();

        if ($activeOrders > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete table with active orders',
            ], 400);
        }

        $table->delete();

        return response()->json([
            'success' => true,
            'message' => 'Table deleted successfully',
        ]);
    }

    /**
     * Make reservation for a table
     */
    public function makeReservation(Request $request, Table $table): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:255',
            'reservation_time' => 'required|date|after:now',
        ]);

        if ($table->status !== 'available') {
            return response()->json([
                'success' => false,
                'message' => 'Table is not available for reservation',
            ], 400);
        }

        $table->update([
            'status' => 'reserved',
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'reservation_time' => $validated['reservation_time'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reservation made successfully',
            'data' => $table,
        ]);
    }

    /**
     * Cancel reservation for a table
     */
    public function cancelReservation(Table $table): JsonResponse
    {
        if ($table->status !== 'reserved') {
            return response()->json([
                'success' => false,
                'message' => 'Table is not reserved',
            ], 400);
        }

        $table->update([
            'status' => 'available',
            'customer_name' => null,
            'customer_phone' => null,
            'reservation_time' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reservation cancelled successfully',
            'data' => $table,
        ]);
    }

    /**
     * Close table (mark as available)
     */
    public function closeTable(Table $table): JsonResponse
    {
        if ($table->status !== 'occupied') {
            return response()->json([
                'success' => false,
                'message' => 'Table is not occupied',
            ], 400);
        }

        $table->update([
            'status' => 'available',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Table closed successfully',
            'data' => $table,
        ]);
    }

    /**
     * Get table orders
     */
    public function getOrders(Table $table): JsonResponse
    {
        $orders = Order::where('table_number', $table->number)
            ->with(['orderItems.recipe'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Get table statistics
     */
    public function getStats(Table $table): JsonResponse
    {
        $orders = Order::where('table_number', $table->number)
            ->where('status', 'completed')
            ->get();

        $totalRevenue = $orders->sum('total');
        $totalOrders = $orders->count();
        $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Calculate average occupancy time (simplified)
        $totalTime = $orders->sum(function ($order) {
            if ($order->completed_time && $order->created_at) {
                return $order->completed_time->diffInMinutes($order->created_at);
            }
            return 0;
        });
        $averageOccupancyTime = $totalOrders > 0 ? $totalTime / $totalOrders : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'average_order_value' => $averageOrderValue,
                'average_occupancy_time' => $averageOccupancyTime,
            ],
        ]);
    }

    /**
     * Get available tables
     */
    public function getAvailable(): JsonResponse
    {
        $tables = Table::available()->orderBy('number')->get();

        return response()->json([
            'success' => true,
            'data' => $tables,
        ]);
    }

    /**
     * Get table locations
     */
    public function getLocations(): JsonResponse
    {
        $locations = Table::distinct()->pluck('location')->filter();

        return response()->json([
            'success' => true,
            'data' => $locations,
        ]);
    }
}
