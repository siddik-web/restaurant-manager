// js/recipes.js
// Recipe management module for Alpine.js

import api from './api.js';

export const createRecipesModule = () => ({
    // Recipe form management
    editRecipe(recipe) {
        this.editingRecipe = recipe;
        this.recipeForm = {
            ...recipe,
            tags: recipe.tags || [],
            allergens: recipe.allergens || [],
            ingredients: recipe.ingredients || [{name: '', quantity: 0, unit: '', notes: ''}]
        };
        this.showRecipeForm = true;
    },

    async saveRecipe() {
        // Validate required fields
        if (!this.recipeForm.name.trim() || !this.recipeForm.category.trim() || this.recipeForm.price <= 0) {
            alert('Please fill in all required fields (name, category, price)');
            return;
        }

        try {
            const recipeData = {
                ...this.recipeForm,
                tags: Array.isArray(this.recipeForm.tags) ? this.recipeForm.tags : [],
                allergens: Array.isArray(this.recipeForm.allergens) ? this.recipeForm.allergens : [],
                ingredients: Array.isArray(this.recipeForm.ingredients) ? this.recipeForm.ingredients : [{name: '', quantity: 0, unit: '', notes: ''}]
            };

            let response;
            if (this.editingRecipe) {
                // Update existing recipe
                response = await api.updateRecipe(this.recipeForm.id, recipeData);
            } else {
                // Add new recipe
                response = await api.createRecipe(recipeData);
            }

            if (response.success) {
                // Update local state
                if (this.editingRecipe) {
                    const index = this.recipes.findIndex(r => r.id === this.recipeForm.id);
                    if (index !== -1) {
                        this.recipes[index] = response.data;
                    }
                } else {
                    this.recipes.push(response.data);
                }

                // Save to localStorage as fallback
                localStorage.setItem('restaurant_recipes', JSON.stringify(this.recipes));
                
                this.showRecipeForm = false;
                this.editingRecipe = null;
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
        if (confirm(this.translations.deleteRecipeConfirm)) {
            try {
                const response = await api.deleteRecipe(id);
                if (response.success) {
                    this.recipes = this.recipes.filter(recipe => recipe.id !== id);
                    localStorage.setItem('restaurant_recipes', JSON.stringify(this.recipes));
                    this.selectedRecipe = null;
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
        this.recipeForm = {
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
        this.recipes.push(duplicatedRecipe);
        localStorage.setItem('restaurant_recipes', JSON.stringify(this.recipes));
    },

    async toggleRecipeActive(recipeId) {
        try {
            const response = await api.request('patch', `/recipes/${recipeId}/toggle-active`);
            if (response.success) {
                const recipe = this.recipes.find(r => r.id === recipeId);
                if (recipe) {
                    recipe.isActive = !recipe.isActive;
                    recipe.updatedAt = Date.now();
                    localStorage.setItem('restaurant_recipes', JSON.stringify(this.recipes));
                }
            }
        } catch (error) {
            console.error('Error toggling recipe active status:', error);
        }
    },

    // Recipe filtering and sorting
    getFilteredRecipes() {
        let filteredRecipes = this.recipes.filter(recipe => recipe.isActive !== false);
        
        // Determine which search term to use based on current tab
        const searchTerm = this.currentTab === 'pos' ? this.posSearchTerm : this.recipeSearchTerm;
        const filterCategory = this.currentTab === 'pos' ? this.posFilterCategory : this.recipeFilterCategory;
        const sortBy = this.currentTab === 'pos' ? this.posSortBy : this.recipeSortBy;
        const activeCategory = this.currentTab === 'pos' ? this.posActiveCategory : 'all';
        const quickFilter = this.currentTab === 'pos' ? this.posQuickFilter : 'all';
        
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
        if (this.currentTab === 'pos' && quickFilter !== 'all') {
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
            
            const sortOrder = this.currentTab === 'pos' ? 'asc' : this.recipeSortOrder;
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
        if (category && !this.recipeCategories.includes(category)) {
            this.recipeCategories.push(category);
            localStorage.setItem('restaurant_recipe_categories', JSON.stringify(this.recipeCategories));
        }
    },

    removeRecipeCategory(category) {
        const index = this.recipeCategories.indexOf(category);
        if (index > -1) {
            this.recipeCategories.splice(index, 1);
            localStorage.setItem('restaurant_recipe_categories', JSON.stringify(this.recipeCategories));
        }
    },

    // Recipe scaling
    calculateScaledQuantity(quantity, portions, basePortions) {
        return (quantity * portions / basePortions).toFixed(2);
    },

    // Recipe form helpers
    addIngredient() {
        this.recipeForm.ingredients.push({name: '', quantity: 0, unit: '', notes: ''});
    },

    removeIngredient(index) {
        this.recipeForm.ingredients.splice(index, 1);
    },

    addTag() {
        const tagInput = document.getElementById('tagInput');
        if (tagInput && tagInput.value.trim()) {
            if (!this.recipeForm.tags.includes(tagInput.value.trim())) {
                this.recipeForm.tags.push(tagInput.value.trim());
            }
            tagInput.value = '';
        }
    },

    removeTag(tag) {
        this.recipeForm.tags = this.recipeForm.tags.filter(t => t !== tag);
    },

    addAllergen() {
        const allergenInput = document.getElementById('allergenInput');
        if (allergenInput && allergenInput.value.trim()) {
            if (!this.recipeForm.allergens.includes(allergenInput.value.trim())) {
                this.recipeForm.allergens.push(allergenInput.value.trim());
            }
            allergenInput.value = '';
        }
    },

    removeAllergen(allergen) {
        this.recipeForm.allergens = this.recipeForm.allergens.filter(a => a !== allergen);
    }
}); 