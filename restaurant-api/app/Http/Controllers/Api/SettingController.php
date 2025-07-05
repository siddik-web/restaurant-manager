<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Setting::query();

        // Search functionality
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('key', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        // Type filter
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $settings = $query->orderBy('key')->get();

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255|unique:settings,key',
            'value' => 'required|string',
            'type' => 'required|in:string,number,boolean,json',
            'description' => 'nullable|string',
        ]);

        $setting = Setting::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Setting created successfully',
            'data' => $setting,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Setting $setting): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $setting,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Setting $setting): JsonResponse
    {
        $validated = $request->validate([
            'key' => 'sometimes|required|string|max:255|unique:settings,key,' . $setting->id,
            'value' => 'sometimes|required|string',
            'type' => 'sometimes|required|in:string,number,boolean,json',
            'description' => 'nullable|string',
        ]);

        $setting->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Setting updated successfully',
            'data' => $setting,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Setting $setting): JsonResponse
    {
        $setting->delete();

        return response()->json([
            'success' => true,
            'message' => 'Setting deleted successfully',
        ]);
    }

    /**
     * Get setting value by key
     */
    public function getValue(string $key): JsonResponse
    {
        $value = Setting::getValue($key);

        return response()->json([
            'success' => true,
            'data' => [
                'key' => $key,
                'value' => $value,
            ],
        ]);
    }

    /**
     * Set setting value by key
     */
    public function setValue(Request $request, string $key): JsonResponse
    {
        $validated = $request->validate([
            'value' => 'required',
            'type' => 'sometimes|in:string,number,boolean,json',
            'description' => 'nullable|string',
        ]);

        $type = $validated['type'] ?? 'string';
        $description = $validated['description'] ?? null;

        $setting = Setting::setValue($key, $validated['value'], $type, $description);

        return response()->json([
            'success' => true,
            'message' => 'Setting value updated successfully',
            'data' => $setting,
        ]);
    }

    /**
     * Get all restaurant settings
     */
    public function getRestaurantSettings(): JsonResponse
    {
        $settings = [
            'restaurant_name' => Setting::getValue('restaurant_name', 'Restaurant Manager'),
            'address' => Setting::getValue('address', ''),
            'phone' => Setting::getValue('phone', ''),
            'email' => Setting::getValue('email', ''),
            'website' => Setting::getValue('website', ''),
            'tax_rate' => Setting::getValue('tax_rate', 10),
            'delivery_fee' => Setting::getValue('delivery_fee', 5),
            'currency' => Setting::getValue('currency', 'USD'),
            'receipt_footer' => Setting::getValue('receipt_footer', ''),
            'print_header' => Setting::getValue('print_header', true),
            'print_footer' => Setting::getValue('print_footer', true),
            'auto_print' => Setting::getValue('auto_print', false),
            'receipt_width' => Setting::getValue('receipt_width', 80),
            'font_size' => Setting::getValue('font_size', 12),
        ];

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update restaurant settings
     */
    public function updateRestaurantSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'restaurant_name' => 'sometimes|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
            'tax_rate' => 'sometimes|numeric|min:0|max:100',
            'delivery_fee' => 'sometimes|numeric|min:0',
            'currency' => 'sometimes|string|max:10',
            'receipt_footer' => 'nullable|string',
            'print_header' => 'sometimes|boolean',
            'print_footer' => 'sometimes|boolean',
            'auto_print' => 'sometimes|boolean',
            'receipt_width' => 'sometimes|integer|min:50|max:120',
            'font_size' => 'sometimes|integer|min:8|max:16',
        ]);

        foreach ($validated as $key => $value) {
            $type = is_bool($value) ? 'boolean' : (is_numeric($value) ? 'number' : 'string');
            Setting::setValue($key, $value, $type);
        }

        return response()->json([
            'success' => true,
            'message' => 'Restaurant settings updated successfully',
        ]);
    }

    /**
     * Get setting types
     */
    public function getTypes(): JsonResponse
    {
        $types = ['string', 'number', 'boolean', 'json'];

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }
}
