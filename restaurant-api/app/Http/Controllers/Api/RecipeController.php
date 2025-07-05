<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RecipeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Recipe::query();

        // Search functionality
        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Category filter
        if ($request->has('category') && $request->category !== 'all') {
            $query->byCategory($request->category);
        }

        // Active filter
        if ($request->has('active')) {
            $query->active();
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        
        switch ($sortBy) {
            case 'price':
                $query->orderBy('price', $sortOrder);
                break;
            case 'category':
                $query->orderBy('category', $sortOrder);
                break;
            case 'date':
                $query->orderBy('created_at', $sortOrder);
                break;
            default:
                $query->orderBy('name', $sortOrder);
        }

        $recipes = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $recipes,
            'categories' => Recipe::distinct()->pluck('category'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'base_portions' => 'required|integer|min:1',
            'prep_time' => 'required|integer|min:0',
            'cook_time' => 'required|integer|min:0',
            'difficulty' => 'required|in:easy,medium,hard',
            'allergens' => 'nullable|array',
            'tags' => 'nullable|array',
            'ingredients' => 'required|array',
            'instructions' => 'required|string',
            'notes' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $recipe = Recipe::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Recipe created successfully',
            'data' => $recipe,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Recipe $recipe): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $recipe,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Recipe $recipe): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'base_portions' => 'sometimes|required|integer|min:1',
            'prep_time' => 'sometimes|required|integer|min:0',
            'cook_time' => 'sometimes|required|integer|min:0',
            'difficulty' => 'sometimes|required|in:easy,medium,hard',
            'allergens' => 'nullable|array',
            'tags' => 'nullable|array',
            'ingredients' => 'sometimes|required|array',
            'instructions' => 'sometimes|required|string',
            'notes' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $recipe->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Recipe updated successfully',
            'data' => $recipe,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Recipe $recipe): JsonResponse
    {
        $recipe->delete();

        return response()->json([
            'success' => true,
            'message' => 'Recipe deleted successfully',
        ]);
    }

    /**
     * Toggle recipe active status
     */
    public function toggleActive(Recipe $recipe): JsonResponse
    {
        $recipe->update(['is_active' => !$recipe->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Recipe status updated successfully',
            'data' => $recipe,
        ]);
    }

    /**
     * Duplicate a recipe
     */
    public function duplicate(Recipe $recipe): JsonResponse
    {
        $newRecipe = $recipe->replicate();
        $newRecipe->name = $recipe->name . ' (Copy)';
        $newRecipe->save();

        return response()->json([
            'success' => true,
            'message' => 'Recipe duplicated successfully',
            'data' => $newRecipe,
        ], 201);
    }

    /**
     * Get recipe categories
     */
    public function categories(): JsonResponse
    {
        $categories = Recipe::distinct()->pluck('category');

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
