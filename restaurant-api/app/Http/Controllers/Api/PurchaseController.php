<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Inventory;
use App\Models\StockTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PurchaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Purchase::with(['supplier', 'purchaseItems.inventory']);

        // Apply filters
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('payment_status')) {
            $query->byPaymentStatus($request->payment_status);
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->byDateRange($request->start_date, $request->end_date);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'order_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $purchases = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $purchases,
            'summary' => [
                'total_purchases' => Purchase::count(),
                'pending_purchases' => Purchase::byStatus('pending')->count(),
                'overdue_purchases' => Purchase::where('expected_delivery', '<', now())
                    ->where('status', '!=', 'delivered')->count(),
                'total_value' => Purchase::sum('total_amount'),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'expected_delivery' => 'nullable|date|after:order_date',
            'status' => 'nullable|in:pending,ordered,shipped,delivered,cancelled,returned',
            'payment_status' => 'nullable|in:pending,partial,paid,overdue',
            'payment_method' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'invoice_number' => 'nullable|string|max:100',
            'tracking_number' => 'nullable|string|max:100',
            'items' => 'required|array|min:1',
            'items.*.inventory_id' => 'required|exists:inventory,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'items.*.notes' => 'nullable|string',
            'items.*.expiry_date' => 'nullable|date',
            'shipping_cost' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
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

            // Generate purchase number
            $purchaseNumber = 'PO-' . date('Ymd') . '-' . str_pad(Purchase::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

            // Calculate totals
            $subtotal = 0;
            foreach ($request->items as $item) {
                $subtotal += $item['quantity'] * $item['unit_cost'];
            }

            $totalAmount = $subtotal + 
                ($request->shipping_cost ?? 0) + 
                ($request->tax_amount ?? 0) - 
                ($request->discount_amount ?? 0);

            // Create purchase
            $purchase = Purchase::create([
                'purchase_number' => $purchaseNumber,
                'supplier_id' => $request->supplier_id,
                'order_date' => $request->order_date,
                'expected_delivery' => $request->expected_delivery,
                'status' => $request->status ?? 'pending',
                'payment_status' => $request->payment_status ?? 'pending',
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
                'invoice_number' => $request->invoice_number,
                'tracking_number' => $request->tracking_number,
                'subtotal' => $subtotal,
                'shipping_cost' => $request->shipping_cost ?? 0,
                'tax_amount' => $request->tax_amount ?? 0,
                'discount_amount' => $request->discount_amount ?? 0,
                'total_amount' => $totalAmount,
            ]);

            // Create purchase items
            foreach ($request->items as $item) {
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'inventory_id' => $item['inventory_id'],
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'total_cost' => $item['quantity'] * $item['unit_cost'],
                    'notes' => $item['notes'] ?? null,
                    'expiry_date' => $item['expiry_date'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Purchase order created successfully',
                'data' => $purchase->load(['supplier', 'purchaseItems.inventory'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create purchase order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Purchase $purchase)
    {
        $purchase->load(['supplier', 'purchaseItems.inventory']);

        return response()->json([
            'success' => true,
            'data' => $purchase
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Purchase $purchase)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'order_date' => 'sometimes|required|date',
            'expected_delivery' => 'nullable|date|after:order_date',
            'delivery_date' => 'nullable|date',
            'status' => 'nullable|in:pending,ordered,shipped,delivered,cancelled,returned',
            'payment_status' => 'nullable|in:pending,partial,paid,overdue',
            'payment_method' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'invoice_number' => 'nullable|string|max:100',
            'tracking_number' => 'nullable|string|max:100',
            'rating' => 'nullable|numeric|min:0|max:5',
            'received_by' => 'nullable|string|max:255',
            'approved_by' => 'nullable|string|max:255',
            'shipping_cost' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
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

            $oldStatus = $purchase->status;
            $purchase->update($request->all());

            // Recalculate total if financial fields changed
            if ($request->hasAny(['shipping_cost', 'tax_amount', 'discount_amount'])) {
                $purchase->calculateTotal();
                $purchase->save();
            }

            // If status changed to delivered, update delivery date
            if ($request->status === 'delivered' && $oldStatus !== 'delivered') {
                $purchase->update(['delivery_date' => now()]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Purchase order updated successfully',
                'data' => $purchase->load(['supplier', 'purchaseItems.inventory'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update purchase order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Purchase $purchase)
    {
        try {
            // Only allow deletion of pending purchases
            if ($purchase->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending purchases can be deleted'
                ], 422);
            }

            $purchase->delete();

            return response()->json([
                'success' => true,
                'message' => 'Purchase order deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete purchase order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update purchase status
     */
    public function updateStatus(Request $request, Purchase $purchase)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,ordered,shipped,delivered,cancelled,returned',
            'delivery_date' => 'nullable|date',
            'received_by' => 'nullable|string|max:255',
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

            $oldStatus = $purchase->status;
            $purchase->update([
                'status' => $request->status,
                'delivery_date' => $request->status === 'delivered' ? ($request->delivery_date ?? now()) : null,
                'received_by' => $request->received_by,
            ]);

            // If status changed to delivered, process received items
            if ($request->status === 'delivered' && $oldStatus !== 'delivered') {
                $this->processReceivedItems($purchase);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Purchase status updated successfully',
                'data' => $purchase->load(['supplier', 'purchaseItems.inventory'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update purchase status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Receive items from purchase order
     */
    public function receiveItems(Request $request, Purchase $purchase)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.purchase_item_id' => 'required|exists:purchase_items,id',
            'items.*.received_quantity' => 'required|numeric|min:0',
            'received_by' => 'nullable|string|max:255',
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

            foreach ($request->items as $item) {
                $purchaseItem = PurchaseItem::find($item['purchase_item_id']);
                
                if ($purchaseItem->purchase_id !== $purchase->id) {
                    throw new \Exception('Purchase item does not belong to this purchase order');
                }

                $purchaseItem->update([
                    'received_quantity' => $item['received_quantity']
                ]);

                // Update inventory stock
                $inventory = $purchaseItem->inventory;
                $oldStock = $inventory->current_stock;
                $newStock = $oldStock + $item['received_quantity'];

                $inventory->update([
                    'current_stock' => $newStock,
                    'last_updated' => now(),
                ]);

                // Create stock transaction
                StockTransaction::create([
                    'inventory_id' => $inventory->id,
                    'transaction_type' => 'purchase',
                    'quantity' => $item['received_quantity'],
                    'previous_stock' => $oldStock,
                    'new_stock' => $newStock,
                    'reference_type' => 'purchase_item',
                    'reference_id' => $purchaseItem->id,
                    'notes' => "Received from PO: {$purchase->purchase_number}",
                    'transaction_date' => now(),
                    'unit_cost' => $purchaseItem->unit_cost,
                    'total_value' => $item['received_quantity'] * $purchaseItem->unit_cost,
                ]);
            }

            // Update purchase status if all items received
            $allReceived = $purchase->purchaseItems()->get()->every(function ($item) {
                return $item->received_quantity >= $item->quantity;
            });

            if ($allReceived) {
                $purchase->update([
                    'status' => 'delivered',
                    'delivery_date' => now(),
                    'received_by' => $request->received_by,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Items received successfully',
                'data' => $purchase->load(['supplier', 'purchaseItems.inventory'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to receive items',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process received items when purchase is marked as delivered
     */
    private function processReceivedItems(Purchase $purchase)
    {
        foreach ($purchase->purchaseItems as $purchaseItem) {
            if ($purchaseItem->received_quantity < $purchaseItem->quantity) {
                // Auto-receive remaining items
                $remainingQuantity = $purchaseItem->quantity - $purchaseItem->received_quantity;
                
                $purchaseItem->update([
                    'received_quantity' => $purchaseItem->quantity
                ]);

                // Update inventory stock
                $inventory = $purchaseItem->inventory;
                $oldStock = $inventory->current_stock;
                $newStock = $oldStock + $remainingQuantity;

                $inventory->update([
                    'current_stock' => $newStock,
                    'last_updated' => now(),
                ]);

                // Create stock transaction
                StockTransaction::create([
                    'inventory_id' => $inventory->id,
                    'transaction_type' => 'purchase',
                    'quantity' => $remainingQuantity,
                    'previous_stock' => $oldStock,
                    'new_stock' => $newStock,
                    'reference_type' => 'purchase_item',
                    'reference_id' => $purchaseItem->id,
                    'notes' => "Auto-received from PO: {$purchase->purchase_number}",
                    'transaction_date' => now(),
                    'unit_cost' => $purchaseItem->unit_cost,
                    'total_value' => $remainingQuantity * $purchaseItem->unit_cost,
                ]);
            }
        }
    }

    /**
     * Get overdue purchases
     */
    public function getOverdue()
    {
        $overduePurchases = Purchase::with(['supplier'])
            ->where('expected_delivery', '<', now())
            ->where('status', '!=', 'delivered')
            ->orderBy('expected_delivery', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $overduePurchases,
            'count' => $overduePurchases->count()
        ]);
    }

    /**
     * Get purchase statistics
     */
    public function getStats(Request $request)
    {
        $query = Purchase::query();

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->byDateRange($request->start_date, $request->end_date);
        }

        $stats = [
            'total_purchases' => $query->count(),
            'total_value' => $query->sum('total_amount'),
            'average_value' => $query->avg('total_amount') ?? 0,
            'by_status' => $query->selectRaw('status, COUNT(*) as count, SUM(total_amount) as total')
                ->groupBy('status')
                ->get(),
            'by_supplier' => $query->with('supplier')
                ->selectRaw('supplier_id, COUNT(*) as count, SUM(total_amount) as total')
                ->groupBy('supplier_id')
                ->orderBy('total', 'desc')
                ->limit(10)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
} 