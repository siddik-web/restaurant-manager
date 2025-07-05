// js/recipes.js
// Recipe management module for Alpine.js

import api from './api.js';

export const createRecipesModule = (state) => ({
    // Recipe form management
    editRecipe(recipe) {
        state.editingRecipe = recipe;
        state.recipeForm = {
            ...recipe,
            tags: recipe.tags || [],
            allergens: recipe.allergens || [],
            ingredients: recipe.ingredients || [{name: '', quantity: 0, unit: '', notes: ''}]
        };
        state.showRecipeForm = true;
    },

    async saveRecipe() {
        // Validate required fields
        if (!state.recipeForm.name.trim() || !state.recipeForm.category.trim() || state.recipeForm.price <= 0) {
            alert('Please fill in all required fields (name, category, price)');
            return;
        }

        try {
            const recipeData = {
                ...state.recipeForm,
                tags: Array.isArray(state.recipeForm.tags) ? state.recipeForm.tags : [],
                allergens: Array.isArray(state.recipeForm.allergens) ? state.recipeForm.allergens : [],
                ingredients: Array.isArray(state.recipeForm.ingredients) ? state.recipeForm.ingredients : [{name: '', quantity: 0, unit: '', notes: ''}]
            };

            let response;
            if (state.editingRecipe) {
                // Update existing recipe
                response = await api.updateRecipe(state.recipeForm.id, recipeData);
            } else {
                // Add new recipe
                response = await api.createRecipe(recipeData);
            }

            if (response.success) {
                // Update local state
                if (state.editingRecipe) {
                    const index = state.recipes.findIndex(r => r.id === state.recipeForm.id);
                    if (index !== -1) {
                        state.recipes[index] = response.data;
                    }
                } else {
                    state.recipes.push(response.data);
                }

                // Save to localStorage as fallback
                localStorage.setItem('restaurant_recipes', JSON.stringify(state.recipes));
                
                state.showRecipeForm = false;
                state.editingRecipe = null;
                this.resetRecipeForm();
            } else {
                alert('Error saving recipe: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving recipe:', error);
            alert('Error saving recipe. Please try again.');
        }
    },

    async deleteRecipe(id) {
        if (confirm(state.translations.deleteRecipeConfirm)) {
            try {
                const response = await api.deleteRecipe(id);
                if (response.success) {
                    state.recipes = state.recipes.filter(recipe => recipe.id !== id);
                    localStorage.setItem('restaurant_recipes', JSON.stringify(state.recipes));
                    state.selectedRecipe = null;
                } else {
                    alert('Error deleting recipe: ' + (response.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error deleting recipe:', error);
                alert('Error deleting recipe. Please try again.');
            }
        }
    },

    resetRecipeForm() {
        state.recipeForm = {
            id: null,
            name: '',
            category: '',
            price: 0,
            basePortions: 4,
            prepTime: 15,
            cookTime: 20,
            difficulty: 'medium',
            allergens: [],
            tags: [],
            ingredients: [{name: '', quantity: 0, unit: '', notes: ''}],
            instructions: '',
            notes: '',
            image: '',
            isActive: true,
            createdAt: null,
            updatedAt: null
        };
    },

    duplicateRecipe(recipe) {
        const duplicatedRecipe = {
            ...recipe,
            id: Date.now(),
            name: recipe.name + ' (Copy)',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        state.recipes.push(duplicatedRecipe);
        localStorage.setItem('restaurant_recipes', JSON.stringify(state.recipes));
    },

    async toggleRecipeActive(recipeId) {
        try {
            const response = await api.request('patch', `/recipes/${recipeId}/toggle-active`);
            if (response.success) {
                const recipe = state.recipes.find(r => r.id === recipeId);
                if (recipe) {
                    recipe.isActive = !recipe.isActive;
                    recipe.updatedAt = Date.now();
                    localStorage.setItem('restaurant_recipes', JSON.stringify(state.recipes));
                }
            }
        } catch (error) {
            console.error('Error toggling recipe active status:', error);
        }
    },

    // Recipe filtering and sorting
    getFilteredRecipes() {
        let filteredRecipes = state.recipes.filter(recipe => recipe.isActive !== false);
        
        // Determine which search term to use based on current tab
        const searchTerm = state.currentTab === 'pos' ? state.posSearchTerm : state.recipeSearchTerm;
        const filterCategory = state.currentTab === 'pos' ? state.posFilterCategory : state.recipeFilterCategory;
        const sortBy = state.currentTab === 'pos' ? state.posSortBy : state.recipeSortBy;
        const activeCategory = state.currentTab === 'pos' ? state.posActiveCategory : 'all';
        const quickFilter = state.currentTab === 'pos' ? state.posQuickFilter : 'all';
        
        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filteredRecipes = filteredRecipes.filter(recipe => 
                recipe.name.toLowerCase().includes(searchLower) ||
                recipe.category.toLowerCase().includes(searchLower) ||
                (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
                (recipe.ingredients && recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchLower)))
            );
        }
        
        // Apply category filter
        if (filterCategory !== 'all') {
            filteredRecipes = filteredRecipes.filter(recipe => 
                recipe.category === filterCategory
            );
        }
        
        // Apply active category filter (for POS tabs)
        if (activeCategory !== 'all') {
            filteredRecipes = filteredRecipes.filter(recipe => 
                recipe.category === activeCategory
            );
        }
        
        // Apply quick filters (POS only)
        if (state.currentTab === 'pos' && quickFilter !== 'all') {
            switch (quickFilter) {
                case 'popular':
                    filteredRecipes = filteredRecipes.filter(recipe => 
                        (recipe.tags && recipe.tags.includes('popular')) ||
                        recipe.price > 15
                    );
                    break;
                case 'vegetarian':
                    filteredRecipes = filteredRecipes.filter(recipe => 
                        recipe.tags && recipe.tags.includes('vegetarian')
                    );
                    break;
                case 'spicy':
                    filteredRecipes = filteredRecipes.filter(recipe => 
                        recipe.tags && recipe.tags.includes('spicy')
                    );
                    break;
                case 'healthy':
                    filteredRecipes = filteredRecipes.filter(recipe => 
                        recipe.tags && recipe.tags.includes('healthy')
                    );
                    break;
            }
        }
        
        // Apply sorting
        filteredRecipes.sort((a, b) => {
            let aValue, bValue;
            
            switch(sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'price':
                    aValue = a.price;
                    bValue = b.price;
                    break;
                case 'popularity':
                    aValue = (a.tags && a.tags.includes('popular')) ? 1 : 0;
                    bValue = (b.tags && b.tags.includes('popular')) ? 1 : 0;
                    if (aValue === bValue) {
                        aValue = a.price;
                        bValue = b.price;
                    }
                    break;
                case 'category':
                    aValue = a.category.toLowerCase();
                    bValue = b.category.toLowerCase();
                    break;
                case 'date':
                    aValue = a.createdAt || 0;
                    bValue = b.createdAt || 0;
                    break;
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }
            
            const sortOrder = state.currentTab === 'pos' ? 'asc' : state.recipeSortOrder;
            if (sortOrder === 'desc') {
                return aValue < bValue ? 1 : -1;
            } else {
                return aValue > bValue ? 1 : -1;
            }
        });
        
        return filteredRecipes;
    },

    // Recipe category management
    addRecipeCategory(category) {
        if (category && !state.recipeCategories.includes(category)) {
            state.recipeCategories.push(category);
            localStorage.setItem('restaurant_recipe_categories', JSON.stringify(state.recipeCategories));
        }
    },

    removeRecipeCategory(category) {
        const index = state.recipeCategories.indexOf(category);
        if (index > -1) {
            state.recipeCategories.splice(index, 1);
            localStorage.setItem('restaurant_recipe_categories', JSON.stringify(state.recipeCategories));
        }
    },

    // Recipe scaling
    calculateScaledQuantity(quantity, portions, basePortions) {
        return (quantity * portions / basePortions).toFixed(2);
    },

    // Recipe form helpers
    addIngredient() {
        state.recipeForm.ingredients.push({name: '', quantity: 0, unit: '', notes: ''});
    },

    removeIngredient(index) {
        state.recipeForm.ingredients.splice(index, 1);
    },

    addTag() {
        const tagInput = document.getElementById('tagInput');
        if (tagInput && tagInput.value.trim()) {
            if (!state.recipeForm.tags.includes(tagInput.value.trim())) {
                state.recipeForm.tags.push(tagInput.value.trim());
            }
            tagInput.value = '';
        }
    },

    removeTag(tag) {
        state.recipeForm.tags = state.recipeForm.tags.filter(t => t !== tag);
    },

    addAllergen() {
        const allergenInput = document.getElementById('allergenInput');
        if (allergenInput && allergenInput.value.trim()) {
            if (!state.recipeForm.allergens.includes(allergenInput.value.trim())) {
                state.recipeForm.allergens.push(allergenInput.value.trim());
            }
            allergenInput.value = '';
        }
    },

    removeAllergen(allergen) {
        state.recipeForm.allergens = state.recipeForm.allergens.filter(a => a !== allergen);
    }
}); 