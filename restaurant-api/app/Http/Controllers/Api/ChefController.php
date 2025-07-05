<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chef;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChefController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Chef::query();

        // Active filter
        if ($request->has('active')) {
            $query->active();
        }

        // Specialty filter
        if ($request->has('specialty')) {
            $query->bySpecialty($request->specialty);
        }

        // Search functionality
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('specialty', 'like', "%{$request->search}%");
            });
        }

        $chefs = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $chefs,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'specialty' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $chef = Chef::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Chef created successfully',
            'data' => $chef,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Chef $chef): JsonResponse
    {
        $chef->load(['orders' => function ($query) {
            $query->whereIn('status', ['new', 'preparing', 'ready'])
                  ->orderBy('created_at', 'desc');
        }]);

        return response()->json([
            'success' => true,
            'data' => $chef,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Chef $chef): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'specialty' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $chef->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Chef updated successfully',
            'data' => $chef,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Chef $chef): JsonResponse
    {
        // Check if chef has active orders
        $activeOrders = $chef->orders()->whereIn('status', ['new', 'preparing', 'ready'])->count();

        if ($activeOrders > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete chef with active orders',
            ], 400);
        }

        $chef->delete();

        return response()->json([
            'success' => true,
            'message' => 'Chef deleted successfully',
        ]);
    }

    /**
     * Toggle chef active status
     */
    public function toggleActive(Chef $chef): JsonResponse
    {
        $chef->update(['is_active' => !$chef->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Chef status updated successfully',
            'data' => $chef,
        ]);
    }

    /**
     * Get chef statistics
     */
    public function getStats(Chef $chef): JsonResponse
    {
        $orders = $chef->orders()->where('status', 'completed')->get();

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
     * Get active chefs
     */
    public function getActive(): JsonResponse
    {
        $chefs = Chef::active()->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $chefs,
        ]);
    }

    /**
     * Get chef specialties
     */
    public function getSpecialties(): JsonResponse
    {
        $specialties = Chef::distinct()->pluck('specialty')->filter();

        return response()->json([
            'success' => true,
            'data' => $specialties,
        ]);
    }
}
