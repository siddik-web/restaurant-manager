<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Waste;
use App\Models\Inventory;
use App\Models\StockTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class WasteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Waste::with(['inventory']);

        // Apply filters
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('reason')) {
            $query->byReason($request->reason);
        }

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        if ($request->filled('inventory_id')) {
            $query->where('inventory_id', $request->inventory_id);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->byDateRange($request->start_date, $request->end_date);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'waste_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $waste = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $waste,
            'summary' => [
                'total_waste_records' => Waste::count(),
                'total_waste_value' => Waste::sum('total_cost'),
                'total_waste_quantity' => Waste::sum('quantity'),
                'by_reason' => Waste::selectRaw('reason, COUNT(*) as count, SUM(total_cost) as total_value')
                    ->groupBy('reason')
                    ->get(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'inventory_id' => 'required|exists:inventory,id',
            'quantity' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:255',
            'waste_date' => 'required|date',
            'recorded_by' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'waste_type' => 'nullable|string|max:100',
            'disposal_method' => 'nullable|string|max:100',
            'approved_by' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
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

            $inventory = Inventory::findOrFail($request->inventory_id);
            
            // Check if there's enough stock
            if ($inventory->current_stock < $request->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock for waste recording',
                    'available_stock' => $inventory->current_stock
                ], 422);
            }

            // Calculate waste cost
            $unitCost = $inventory->cost_per_unit;
            $totalCost = $request->quantity * $unitCost;

            // Create waste record
            $waste = Waste::create([
                'inventory_id' => $request->inventory_id,
                'quantity' => $request->quantity,
                'unit_cost' => $unitCost,
                'total_cost' => $totalCost,
                'reason' => $request->reason,
                'waste_date' => $request->waste_date,
                'recorded_by' => $request->recorded_by,
                'notes' => $request->notes,
                'waste_type' => $request->waste_type,
                'disposal_method' => $request->disposal_method,
                'approved_by' => $request->approved_by,
                'category' => $request->category,
            ]);

            // Update inventory stock
            $oldStock = $inventory->current_stock;
            $newStock = $oldStock - $request->quantity;

            $inventory->update([
                'current_stock' => $newStock,
                'last_updated' => now(),
            ]);

            // Create stock transaction
            StockTransaction::create([
                'inventory_id' => $inventory->id,
                'transaction_type' => 'waste',
                'quantity' => $request->quantity,
                'previous_stock' => $oldStock,
                'new_stock' => $newStock,
                'reference_type' => 'waste',
                'reference_id' => $waste->id,
                'notes' => "Waste: {$request->reason}",
                'transaction_date' => now(),
                'unit_cost' => $unitCost,
                'total_value' => $totalCost,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Waste record created successfully',
                'data' => $waste->load('inventory')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create waste record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Waste $waste)
    {
        $waste->load('inventory');

        return response()->json([
            'success' => true,
            'data' => $waste
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Waste $waste)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'sometimes|required|numeric|min:0.01',
            'reason' => 'sometimes|required|string|max:255',
            'waste_date' => 'sometimes|required|date',
            'recorded_by' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'waste_type' => 'nullable|string|max:100',
            'disposal_method' => 'nullable|string|max:100',
            'approved_by' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
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

            $oldQuantity = $waste->quantity;
            $newQuantity = $request->quantity ?? $oldQuantity;

            // If quantity changed, adjust inventory stock
            if ($newQuantity != $oldQuantity) {
                $inventory = $waste->inventory;
                $difference = $oldQuantity - $newQuantity; // Positive if reducing waste, negative if increasing

                // Check if there's enough stock to reduce waste
                if ($difference > 0 && $inventory->current_stock < $difference) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Insufficient stock to reduce waste quantity',
                        'available_stock' => $inventory->current_stock
                    ], 422);
                }

                $oldStock = $inventory->current_stock;
                $newStock = $oldStock + $difference; // Add back the difference

                $inventory->update([
                    'current_stock' => $newStock,
                    'last_updated' => now(),
                ]);

                // Update stock transaction
                $stockTransaction = StockTransaction::where('reference_type', 'waste')
                    ->where('reference_id', $waste->id)
                    ->first();

                if ($stockTransaction) {
                    $stockTransaction->update([
                        'quantity' => $newQuantity,
                        'previous_stock' => $oldStock,
                        'new_stock' => $newStock,
                        'total_value' => $newQuantity * $waste->unit_cost,
                    ]);
                }
            }

            // Update waste record
            $waste->update($request->all());

            // Recalculate total cost if quantity changed
            if ($newQuantity != $oldQuantity) {
                $waste->update([
                    'total_cost' => $newQuantity * $waste->unit_cost
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Waste record updated successfully',
                'data' => $waste->load('inventory')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update waste record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Waste $waste)
    {
        try {
            DB::beginTransaction();

            // Restore inventory stock
            $inventory = $waste->inventory;
            $oldStock = $inventory->current_stock;
            $newStock = $oldStock + $waste->quantity;

            $inventory->update([
                'current_stock' => $newStock,
                'last_updated' => now(),
            ]);

            // Create reversal stock transaction
            StockTransaction::create([
                'inventory_id' => $inventory->id,
                'transaction_type' => 'adjustment',
                'quantity' => $waste->quantity,
                'previous_stock' => $oldStock,
                'new_stock' => $newStock,
                'reference_type' => 'waste_reversal',
                'reference_id' => $waste->id,
                'notes' => "Waste record deletion - stock restored",
                'transaction_date' => now(),
                'unit_cost' => $waste->unit_cost,
                'total_value' => $waste->quantity * $waste->unit_cost,
            ]);

            // Delete the waste record
            $waste->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Waste record deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete waste record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get waste reasons
     */
    public function reasons()
    {
        $reasons = Waste::distinct()->pluck('reason')->filter()->sort()->values();
        
        return response()->json([
            'success' => true,
            'data' => $reasons
        ]);
    }

    /**
     * Get waste categories
     */
    public function categories()
    {
        $categories = Waste::distinct()->pluck('category')->filter()->sort()->values();
        
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Get waste statistics
     */
    public function getStats(Request $request)
    {
        $query = Waste::query();

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->byDateRange($request->start_date, $request->end_date);
        }

        $stats = [
            'total_waste_records' => $query->count(),
            'total_waste_value' => $query->sum('total_cost'),
            'total_waste_quantity' => $query->sum('quantity'),
            'average_waste_value' => $query->avg('total_cost') ?? 0,
            'by_reason' => $query->selectRaw('reason, COUNT(*) as count, SUM(total_cost) as total_value, SUM(quantity) as total_quantity')
                ->groupBy('reason')
                ->orderBy('total_value', 'desc')
                ->get(),
            'by_category' => $query->selectRaw('category, COUNT(*) as count, SUM(total_cost) as total_value, SUM(quantity) as total_quantity')
                ->groupBy('category')
                ->orderBy('total_value', 'desc')
                ->get(),
            'by_inventory' => $query->with('inventory')
                ->selectRaw('inventory_id, COUNT(*) as count, SUM(total_cost) as total_value, SUM(quantity) as total_quantity')
                ->groupBy('inventory_id')
                ->orderBy('total_value', 'desc')
                ->limit(10)
                ->get(),
            'daily_trends' => $query->selectRaw('DATE(waste_date) as date, COUNT(*) as count, SUM(total_cost) as total_value')
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->limit(30)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Bulk create waste records
     */
    public function bulkCreate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'waste_records' => 'required|array|min:1',
            'waste_records.*.inventory_id' => 'required|exists:inventory,id',
            'waste_records.*.quantity' => 'required|numeric|min:0.01',
            'waste_records.*.reason' => 'required|string|max:255',
            'waste_records.*.waste_date' => 'required|date',
            'waste_records.*.recorded_by' => 'nullable|string|max:255',
            'waste_records.*.notes' => 'nullable|string',
            'waste_records.*.category' => 'nullable|string|max:100',
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

            $createdCount = 0;
            $errors = [];

            foreach ($request->waste_records as $index => $wasteRecord) {
                try {
                    $inventory = Inventory::findOrFail($wasteRecord['inventory_id']);
                    
                    // Check if there's enough stock
                    if ($inventory->current_stock < $wasteRecord['quantity']) {
                        $errors[] = "Record {$index}: Insufficient stock for {$inventory->name}";
                        continue;
                    }

                    // Calculate waste cost
                    $unitCost = $inventory->cost_per_unit;
                    $totalCost = $wasteRecord['quantity'] * $unitCost;

                    // Create waste record
                    $waste = Waste::create([
                        'inventory_id' => $wasteRecord['inventory_id'],
                        'quantity' => $wasteRecord['quantity'],
                        'unit_cost' => $unitCost,
                        'total_cost' => $totalCost,
                        'reason' => $wasteRecord['reason'],
                        'waste_date' => $wasteRecord['waste_date'],
                        'recorded_by' => $wasteRecord['recorded_by'] ?? null,
                        'notes' => $wasteRecord['notes'] ?? null,
                        'category' => $wasteRecord['category'] ?? null,
                    ]);

                    // Update inventory stock
                    $oldStock = $inventory->current_stock;
                    $newStock = $oldStock - $wasteRecord['quantity'];

                    $inventory->update([
                        'current_stock' => $newStock,
                        'last_updated' => now(),
                    ]);

                    // Create stock transaction
                    StockTransaction::create([
                        'inventory_id' => $inventory->id,
                        'transaction_type' => 'waste',
                        'quantity' => $wasteRecord['quantity'],
                        'previous_stock' => $oldStock,
                        'new_stock' => $newStock,
                        'reference_type' => 'waste',
                        'reference_id' => $waste->id,
                        'notes' => "Waste: {$wasteRecord['reason']}",
                        'transaction_date' => now(),
                        'unit_cost' => $unitCost,
                        'total_value' => $totalCost,
                    ]);

                    $createdCount++;

                } catch (\Exception $e) {
                    $errors[] = "Record {$index}: " . $e->getMessage();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully created {$createdCount} waste records",
                'created_count' => $createdCount,
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create waste records',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 