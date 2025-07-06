<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\StockTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Inventory::with(['supplier']);

        // Apply filters
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->filled('status')) {
            switch ($request->status) {
                case 'low_stock':
                    $query->lowStock();
                    break;
                case 'out_of_stock':
                    $query->outOfStock();
                    break;
                case 'active':
                    $query->active();
                    break;
            }
        }

        if ($request->filled('expiring_soon')) {
            $query->expiringSoon($request->expiring_soon);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $inventory = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $inventory,
            'summary' => [
                'total_items' => Inventory::count(),
                'low_stock_count' => Inventory::lowStock()->count(),
                'out_of_stock_count' => Inventory::outOfStock()->count(),
                'total_value' => Inventory::sum(DB::raw('current_stock * cost_per_unit')),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100|unique:inventory',
            'category' => 'required|string|max:100',
            'unit' => 'required|string|max:50',
            'current_stock' => 'nullable|numeric|min:0',
            'min_stock' => 'nullable|numeric|min:0',
            'max_stock' => 'nullable|numeric|min:0',
            'cost_per_unit' => 'nullable|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'expiry_date' => 'nullable|date',
            'barcode' => 'nullable|string|max:100',
            'image' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $inventory = Inventory::create($request->all());

            // Create initial stock transaction if current_stock is provided
            if ($request->filled('current_stock') && $request->current_stock > 0) {
                StockTransaction::create([
                    'inventory_id' => $inventory->id,
                    'transaction_type' => 'adjustment',
                    'quantity' => $request->current_stock,
                    'previous_stock' => 0,
                    'new_stock' => $request->current_stock,
                    'reference_type' => 'inventory_creation',
                    'reference_id' => $inventory->id,
                    'notes' => 'Initial stock setup',
                    'transaction_date' => now(),
                    'unit_cost' => $request->cost_per_unit ?? 0,
                    'total_value' => ($request->current_stock ?? 0) * ($request->cost_per_unit ?? 0),
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Inventory item created successfully',
                'data' => $inventory->load('supplier')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create inventory item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Inventory $inventory)
    {
        $inventory->load(['supplier', 'stockTransactions' => function ($query) {
            $query->orderBy('transaction_date', 'desc')->limit(10);
        }]);

        return response()->json([
            'success' => true,
            'data' => $inventory
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Inventory $inventory)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'sku' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('inventory')->ignore($inventory->id)
            ],
            'category' => 'sometimes|required|string|max:100',
            'unit' => 'sometimes|required|string|max:50',
            'current_stock' => 'nullable|numeric|min:0',
            'min_stock' => 'nullable|numeric|min:0',
            'max_stock' => 'nullable|numeric|min:0',
            'cost_per_unit' => 'nullable|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'expiry_date' => 'nullable|date',
            'barcode' => 'nullable|string|max:100',
            'image' => 'nullable|string',
            'notes' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $oldStock = $inventory->current_stock;
            $inventory->update($request->all());

            // Create stock transaction if stock was adjusted
            if ($request->filled('current_stock') && $request->current_stock != $oldStock) {
                $difference = $request->current_stock - $oldStock;
                $transactionType = $difference > 0 ? 'adjustment' : 'adjustment';

                StockTransaction::create([
                    'inventory_id' => $inventory->id,
                    'transaction_type' => $transactionType,
                    'quantity' => abs($difference),
                    'previous_stock' => $oldStock,
                    'new_stock' => $request->current_stock,
                    'reference_type' => 'inventory_update',
                    'reference_id' => $inventory->id,
                    'notes' => 'Manual stock adjustment',
                    'transaction_date' => now(),
                    'unit_cost' => $inventory->cost_per_unit,
                    'total_value' => abs($difference) * $inventory->cost_per_unit,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Inventory item updated successfully',
                'data' => $inventory->load('supplier')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update inventory item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inventory $inventory)
    {
        try {
            $inventory->delete();
            return response()->json([
                'success' => true,
                'message' => 'Inventory item deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete inventory item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Adjust stock for an inventory item
     */
    public function adjustStock(Request $request, Inventory $inventory)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|numeric',
            'adjustment_type' => 'required|in:add,subtract,set',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $oldStock = $inventory->current_stock;
            $adjustmentQuantity = $request->quantity;

            switch ($request->adjustment_type) {
                case 'add':
                    $newStock = $oldStock + $adjustmentQuantity;
                    $transactionType = 'adjustment';
                    break;
                case 'subtract':
                    $newStock = max(0, $oldStock - $adjustmentQuantity);
                    $transactionType = 'adjustment';
                    break;
                case 'set':
                    $newStock = $adjustmentQuantity;
                    $transactionType = 'adjustment';
                    break;
            }

            $inventory->update([
                'current_stock' => $newStock,
                'last_updated' => now(),
            ]);

            // Create stock transaction
            StockTransaction::create([
                'inventory_id' => $inventory->id,
                'transaction_type' => $transactionType,
                'quantity' => abs($newStock - $oldStock),
                'previous_stock' => $oldStock,
                'new_stock' => $newStock,
                'reference_type' => 'manual_adjustment',
                'reference_id' => $inventory->id,
                'notes' => $request->reason . ($request->notes ? ': ' . $request->notes : ''),
                'transaction_date' => now(),
                'unit_cost' => $inventory->cost_per_unit,
                'total_value' => abs($newStock - $oldStock) * $inventory->cost_per_unit,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stock adjusted successfully',
                'data' => [
                    'previous_stock' => $oldStock,
                    'new_stock' => $newStock,
                    'adjustment' => $newStock - $oldStock,
                    'inventory' => $inventory->load('supplier')
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to adjust stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory categories
     */
    public function categories()
    {
        $categories = Inventory::distinct()->pluck('category')->filter()->sort()->values();
        
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Get low stock alerts
     */
    public function lowStockAlerts()
    {
        $lowStockItems = Inventory::with('supplier')
            ->lowStock()
            ->orderBy('current_stock', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $lowStockItems,
            'count' => $lowStockItems->count()
        ]);
    }

    /**
     * Get expiring items
     */
    public function expiringItems(Request $request)
    {
        $days = $request->get('days', 30);
        $expiringItems = Inventory::with('supplier')
            ->expiringSoon($days)
            ->orderBy('expiry_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $expiringItems,
            'count' => $expiringItems->count(),
            'days_ahead' => $days
        ]);
    }

    /**
     * Get stock transactions for an inventory item
     */
    public function transactions(Inventory $inventory, Request $request)
    {
        $query = $inventory->stockTransactions();

        if ($request->filled('type')) {
            $query->byType($request->type);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->byDateRange($request->start_date, $request->end_date);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }

    /**
     * Bulk update inventory items
     */
    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.id' => 'required|exists:inventory,id',
            'items.*.current_stock' => 'nullable|numeric|min:0',
            'items.*.cost_per_unit' => 'nullable|numeric|min:0',
            'items.*.min_stock' => 'nullable|numeric|min:0',
            'items.*.max_stock' => 'nullable|numeric|min:0',
            'items.*.is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $updatedCount = 0;
            foreach ($request->items as $item) {
                $inventory = Inventory::find($item['id']);
                $oldStock = $inventory->current_stock;
                
                $inventory->update($item);

                // Create stock transaction if stock was changed
                if (isset($item['current_stock']) && $item['current_stock'] != $oldStock) {
                    StockTransaction::create([
                        'inventory_id' => $inventory->id,
                        'transaction_type' => 'adjustment',
                        'quantity' => abs($item['current_stock'] - $oldStock),
                        'previous_stock' => $oldStock,
                        'new_stock' => $item['current_stock'],
                        'reference_type' => 'bulk_update',
                        'reference_id' => $inventory->id,
                        'notes' => 'Bulk stock update',
                        'transaction_date' => now(),
                        'unit_cost' => $inventory->cost_per_unit,
                        'total_value' => abs($item['current_stock'] - $oldStock) * $inventory->cost_per_unit,
                    ]);
                }

                $updatedCount++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully updated {$updatedCount} inventory items",
                'updated_count' => $updatedCount
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update inventory items',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 