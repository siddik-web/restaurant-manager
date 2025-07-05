<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Station;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Station::query();

        // Active filter
        if ($request->has('active')) {
            $query->active();
        }

        // Search functionality
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $stations = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $stations,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:stations,name',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $station = Station::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Station created successfully',
            'data' => $station,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Station $station): JsonResponse
    {
        $station->load(['orders' => function ($query) {
            $query->whereIn('status', ['new', 'preparing', 'ready'])
                  ->orderBy('created_at', 'desc');
        }]);

        return response()->json([
            'success' => true,
            'data' => $station,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Station $station): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:stations,name,' . $station->id,
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $station->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Station updated successfully',
            'data' => $station,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Station $station): JsonResponse
    {
        // Check if station has active orders
        $activeOrders = $station->orders()->whereIn('status', ['new', 'preparing', 'ready'])->count();

        if ($activeOrders > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete station with active orders',
            ], 400);
        }

        $station->delete();

        return response()->json([
            'success' => true,
            'message' => 'Station deleted successfully',
        ]);
    }

    /**
     * Toggle station active status
     */
    public function toggleActive(Station $station): JsonResponse
    {
        $station->update(['is_active' => !$station->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Station status updated successfully',
            'data' => $station,
        ]);
    }

    /**
     * Get station statistics
     */
    public function getStats(Station $station): JsonResponse
    {
        $orders = $station->orders()->where('status', 'completed')->get();

        $totalOrders = $orders->count();
        $totalRevenue = $orders->sum('total');
        $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Calculate average completion time
        $totalTime = $orders->sum(function ($order) {
            if ($order->completed_time && $order->created_at) {
                return $order->completed_time->diffInMinutes($order->created_at);
            }
            return 0;
        });
        $averageCompletionTime = $totalOrders > 0 ? $totalTime / $totalOrders : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'average_order_value' => $averageOrderValue,
                'average_completion_time' => $averageCompletionTime,
            ],
        ]);
    }

    /**
     * Get active stations
     */
    public function getActive(): JsonResponse
    {
        $stations = Station::active()->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $stations,
        ]);
    }
}
