<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Supplier::withCount(['inventory', 'purchases']);

        // Apply filters
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $suppliers = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $suppliers,
            'summary' => [
                'total_suppliers' => Supplier::count(),
                'active_suppliers' => Supplier::active()->count(),
                'total_purchases' => Supplier::with('purchases')->get()->sum('purchases_count'),
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
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'tax_id' => 'nullable|string|max:100',
            'payment_terms' => 'nullable|string|max:255',
            'credit_limit' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:5',
            'lead_time_days' => 'nullable|integer|min:0',
            'minimum_order' => 'nullable|numeric|min:0',
            'delivery_fee' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $supplier = Supplier::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Supplier created successfully',
                'data' => $supplier
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        $supplier->load(['inventory', 'purchases' => function ($query) {
            $query->orderBy('order_date', 'desc')->limit(10);
        }]);

        return response()->json([
            'success' => true,
            'data' => $supplier
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Supplier $supplier)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'tax_id' => 'nullable|string|max:100',
            'payment_terms' => 'nullable|string|max:255',
            'credit_limit' => 'nullable|numeric|min:0',
            'is_active' => 'sometimes|boolean',
            'notes' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:5',
            'lead_time_days' => 'nullable|integer|min:0',
            'minimum_order' => 'nullable|numeric|min:0',
            'delivery_fee' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $supplier->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Supplier updated successfully',
                'data' => $supplier
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        try {
            // Check if supplier has associated inventory or purchases
            if ($supplier->inventory()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete supplier with associated inventory items'
                ], 422);
            }

            if ($supplier->purchases()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete supplier with associated purchase orders'
                ], 422);
            }

            $supplier->delete();

            return response()->json([
                'success' => true,
                'message' => 'Supplier deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle supplier active status
     */
    public function toggleActive(Supplier $supplier)
    {
        try {
            $supplier->update(['is_active' => !$supplier->is_active]);

            return response()->json([
                'success' => true,
                'message' => 'Supplier status updated successfully',
                'data' => [
                    'is_active' => $supplier->is_active
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update supplier status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get supplier statistics
     */
    public function getStats(Supplier $supplier)
    {
        $stats = [
            'total_purchases' => $supplier->purchases()->count(),
            'total_purchase_value' => $supplier->purchases()->sum('total_amount'),
            'average_rating' => $supplier->purchases()->whereNotNull('rating')->avg('rating') ?? 0,
            'inventory_items' => $supplier->inventory()->count(),
            'active_inventory' => $supplier->inventory()->active()->count(),
            'recent_purchases' => $supplier->purchases()
                ->orderBy('order_date', 'desc')
                ->limit(5)
                ->get(),
            'purchase_trends' => $supplier->purchases()
                ->selectRaw('DATE(order_date) as date, COUNT(*) as count, SUM(total_amount) as total')
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
     * Get active suppliers
     */
    public function getActive()
    {
        $suppliers = Supplier::active()
            ->orderBy('name')
            ->get(['id', 'name', 'contact_person', 'phone', 'email']);

        return response()->json([
            'success' => true,
            'data' => $suppliers
        ]);
    }

    /**
     * Get suppliers by performance
     */
    public function getByPerformance(Request $request)
    {
        $query = Supplier::withCount(['purchases'])
            ->withSum('purchases', 'total_amount')
            ->withAvg('purchases', 'rating');

        if ($request->filled('sort_by')) {
            switch ($request->sort_by) {
                case 'purchases':
                    $query->orderBy('purchases_count', 'desc');
                    break;
                case 'value':
                    $query->orderBy('purchases_sum_total_amount', 'desc');
                    break;
                case 'rating':
                    $query->orderBy('purchases_avg_rating', 'desc');
                    break;
                default:
                    $query->orderBy('name');
            }
        } else {
            $query->orderBy('purchases_sum_total_amount', 'desc');
        }

        $suppliers = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $suppliers
        ]);
    }
} 