<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['orderItems.recipe']);

        // Status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->byStatus($request->status);
        }

        // Type filter
        if ($request->has('type') && $request->type !== 'all') {
            $query->byType($request->type);
        }

        // Date filters
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        if ($request->has('today')) {
            $query->today();
        }

        if ($request->has('this_month')) {
            $query->thisMonth();
        }

        // Chef filter
        if ($request->has('chef')) {
            $query->byChef($request->chef);
        }

        // Station filter
        if ($request->has('station')) {
            $query->byStation($request->station);
        }

        // Urgent filter
        if ($request->has('urgent')) {
            $query->urgent();
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        switch ($sortBy) {
            case 'time':
                $query->orderBy('created_at', $sortOrder);
                break;
            case 'priority':
                $query->orderBy('urgent', 'desc')->orderBy('created_at', 'asc');
                break;
            case 'table':
                $query->orderBy('table_number', $sortOrder);
                break;
            default:
                $query->orderBy('created_at', $sortOrder);
        }

        $orders = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:dine-in,takeaway,delivery',
            'table_number' => 'nullable|integer',
            'items' => 'required|array|min:1',
            'items.*.recipe_id' => 'required|exists:recipes,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.modifications' => 'nullable|array',
            'items.*.notes' => 'nullable|string',
            'notes' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();

            // Calculate totals
            $subtotal = 0;
            $items = [];

            foreach ($validated['items'] as $item) {
                $recipe = Recipe::find($item['recipe_id']);
                $itemTotal = $recipe->price * $item['quantity'];
                $subtotal += $itemTotal;

                $items[] = [
                    'recipe_id' => $recipe->id,
                    'name' => $recipe->name,
                    'price' => $recipe->price,
                    'quantity' => $item['quantity'],
                    'total' => $itemTotal,
                    'modifications' => $item['modifications'] ?? null,
                    'notes' => $item['notes'] ?? null,
                ];
            }

            // Get settings for tax and delivery fee
            $taxRate = \App\Models\Setting::getValue('tax_rate', 10);
            $deliveryFee = $validated['type'] === 'delivery' ? \App\Models\Setting::getValue('delivery_fee', 5) : 0;
            
            $tax = $subtotal * ($taxRate / 100);
            $total = $subtotal + $tax + $deliveryFee;

            // Create order
            $order = Order::create([
                'type' => $validated['type'],
                'table_number' => $validated['table_number'],
                'subtotal' => $subtotal,
                'tax' => $tax,
                'delivery_fee' => $deliveryFee,
                'total' => $total,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create order items
            foreach ($items as $item) {
                $order->orderItems()->create($item);
            }

            // Update table status if dine-in
            if ($validated['type'] === 'dine-in' && $validated['table_number']) {
                \App\Models\Table::where('number', $validated['table_number'])
                    ->update(['status' => 'occupied']);
            }

            DB::commit();

            $order->load(['orderItems.recipe']);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order): JsonResponse
    {
        $order->load(['orderItems.recipe', 'table']);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|required|in:new,preparing,ready,completed',
            'assigned_chef' => 'nullable|string',
            'assigned_station' => 'nullable|string',
            'urgent' => 'sometimes|boolean',
            'notes' => 'nullable|array',
        ]);

        if (isset($validated['assigned_chef']) || isset($validated['assigned_station'])) {
            $validated['assigned_time'] = now();
        }

        if (isset($validated['urgent']) && $validated['urgent']) {
            $validated['urgent_time'] = now();
        }

        if (isset($validated['status']) && $validated['status'] === 'completed') {
            $validated['completed_time'] = now();
        }

        $order->update($validated);

        $order->load(['orderItems.recipe', 'table']);

        return response()->json([
            'success' => true,
            'message' => 'Order updated successfully',
            'data' => $order,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order): JsonResponse
    {
        // Update table status if dine-in
        if ($order->type === 'dine-in' && $order->table_number) {
            \App\Models\Table::where('number', $order->table_number)
                ->update(['status' => 'available']);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order deleted successfully',
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:new,preparing,ready,completed',
        ]);

        $data = ['status' => $validated['status']];

        if ($validated['status'] === 'completed') {
            $data['completed_time'] = now();
        }

        $order->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
            'data' => $order,
        ]);
    }

    /**
     * Assign chef and station to order
     */
    public function assignChefStation(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'assigned_chef' => 'required|string',
            'assigned_station' => 'required|string',
        ]);

        $order->update([
            'assigned_chef' => $validated['assigned_chef'],
            'assigned_station' => $validated['assigned_station'],
            'assigned_time' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Chef and station assigned successfully',
            'data' => $order,
        ]);
    }

    /**
     * Mark order as urgent
     */
    public function markUrgent(Order $order): JsonResponse
    {
        $order->update([
            'urgent' => !$order->urgent,
            'urgent_time' => $order->urgent ? null : now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order urgency updated successfully',
            'data' => $order,
        ]);
    }

    /**
     * Complete order
     */
    public function complete(Order $order): JsonResponse
    {
        $order->update([
            'status' => 'completed',
            'completed_time' => now(),
        ]);

        // Update table status if dine-in
        if ($order->type === 'dine-in' && $order->table_number) {
            \App\Models\Table::where('number', $order->table_number)
                ->update(['status' => 'available']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order completed successfully',
            'data' => $order,
        ]);
    }
}
