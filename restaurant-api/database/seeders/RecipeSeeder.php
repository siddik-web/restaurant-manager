<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Recipe;

class RecipeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $recipes = [
            [
                'name' => 'Margherita Pizza',
                'category' => 'Pizza',
                'price' => 12.99,
                'base_portions' => 2,
                'prep_time' => 15,
                'cook_time' => 12,
                'difficulty' => 'medium',
                'allergens' => ['gluten', 'dairy'],
                'tags' => ['vegetarian', 'classic'],
                'ingredients' => [
                    ['name' => 'Pizza Dough', 'quantity' => 1, 'unit' => 'pc', 'notes' => 'Fresh pizza dough'],
                    ['name' => 'Tomato Sauce', 'quantity' => 150, 'unit' => 'g', 'notes' => 'San Marzano tomatoes'],
                    ['name' => 'Mozzarella', 'quantity' => 200, 'unit' => 'g', 'notes' => 'Fresh mozzarella'],
                    ['name' => 'Basil', 'quantity' => 5, 'unit' => 'leaves', 'notes' => 'Fresh basil leaves']
                ],
                'instructions' => "1. Preheat oven to 250°C\n2. Roll out pizza dough\n3. Spread tomato sauce evenly\n4. Add mozzarella cheese\n5. Add fresh basil leaves\n6. Bake for 10-12 minutes until golden",
                'notes' => 'Classic Italian pizza with simple, fresh ingredients',
                'is_active' => true,
            ],
            [
                'name' => 'Caesar Salad',
                'category' => 'Salads',
                'price' => 8.99,
                'base_portions' => 1,
                'prep_time' => 10,
                'cook_time' => 0,
                'difficulty' => 'easy',
                'allergens' => ['eggs', 'gluten'],
                'tags' => ['healthy', 'classic'],
                'ingredients' => [
                    ['name' => 'Romaine Lettuce', 'quantity' => 200, 'unit' => 'g', 'notes' => 'Fresh romaine hearts'],
                    ['name' => 'Parmesan Cheese', 'quantity' => 50, 'unit' => 'g', 'notes' => 'Freshly grated'],
                    ['name' => 'Croutons', 'quantity' => 30, 'unit' => 'g', 'notes' => 'Homemade croutons'],
                    ['name' => 'Caesar Dressing', 'quantity' => 60, 'unit' => 'ml', 'notes' => 'House-made dressing']
                ],
                'instructions' => "1. Wash and chop romaine lettuce\n2. Toss with Caesar dressing\n3. Add croutons and parmesan\n4. Serve immediately",
                'notes' => 'Classic Caesar salad with house-made dressing',
                'is_active' => true,
            ],
            [
                'name' => 'Classic Burger',
                'category' => 'Burgers',
                'price' => 14.99,
                'base_portions' => 1,
                'prep_time' => 15,
                'cook_time' => 8,
                'difficulty' => 'medium',
                'allergens' => ['gluten', 'dairy'],
                'tags' => ['popular', 'comfort'],
                'ingredients' => [
                    ['name' => 'Beef Patty', 'quantity' => 180, 'unit' => 'g', 'notes' => '80/20 ground beef'],
                    ['name' => 'Burger Bun', 'quantity' => 1, 'unit' => 'pc', 'notes' => 'Brioche bun'],
                    ['name' => 'Lettuce', 'quantity' => 20, 'unit' => 'g', 'notes' => 'Fresh iceberg lettuce'],
                    ['name' => 'Tomato', 'quantity' => 30, 'unit' => 'g', 'notes' => 'Sliced tomato'],
                    ['name' => 'Cheese', 'quantity' => 30, 'unit' => 'g', 'notes' => 'American cheese']
                ],
                'instructions' => "1. Form beef patty and season\n2. Grill patty 4 minutes each side\n3. Add cheese in last minute\n4. Toast bun\n5. Assemble with toppings",
                'notes' => 'Classic American burger with all the fixings',
                'is_active' => true,
            ],
            [
                'name' => 'Chicken Wings',
                'category' => 'Appetizers',
                'price' => 11.99,
                'base_portions' => 1,
                'prep_time' => 20,
                'cook_time' => 25,
                'difficulty' => 'medium',
                'allergens' => ['gluten'],
                'tags' => ['spicy', 'popular'],
                'ingredients' => [
                    ['name' => 'Chicken Wings', 'quantity' => 500, 'unit' => 'g', 'notes' => 'Fresh chicken wings'],
                    ['name' => 'Hot Sauce', 'quantity' => 100, 'unit' => 'ml', 'notes' => 'Buffalo hot sauce'],
                    ['name' => 'Butter', 'quantity' => 50, 'unit' => 'g', 'notes' => 'Unsalted butter'],
                    ['name' => 'Flour', 'quantity' => 100, 'unit' => 'g', 'notes' => 'All-purpose flour']
                ],
                'instructions' => "1. Coat wings in flour\n2. Deep fry until golden\n3. Mix hot sauce with butter\n4. Toss wings in sauce\n5. Serve with blue cheese dip",
                'notes' => 'Spicy buffalo wings with crispy coating',
                'is_active' => true,
            ],
            [
                'name' => 'Spaghetti Carbonara',
                'category' => 'Pasta',
                'price' => 13.99,
                'base_portions' => 1,
                'prep_time' => 10,
                'cook_time' => 15,
                'difficulty' => 'medium',
                'allergens' => ['gluten', 'eggs', 'dairy'],
                'tags' => ['classic', 'creamy'],
                'ingredients' => [
                    ['name' => 'Spaghetti', 'quantity' => 200, 'unit' => 'g', 'notes' => 'Al dente spaghetti'],
                    ['name' => 'Pancetta', 'quantity' => 100, 'unit' => 'g', 'notes' => 'Cubed pancetta'],
                    ['name' => 'Eggs', 'quantity' => 2, 'unit' => 'pc', 'notes' => 'Fresh eggs'],
                    ['name' => 'Parmesan', 'quantity' => 80, 'unit' => 'g', 'notes' => 'Freshly grated parmesan']
                ],
                'instructions' => "1. Cook pasta al dente\n2. Crisp pancetta in pan\n3. Mix eggs and parmesan\n4. Toss hot pasta with egg mixture\n5. Add pancetta and serve",
                'notes' => 'Classic Roman pasta with creamy egg sauce',
                'is_active' => true,
            ],
        ];

        foreach ($recipes as $recipe) {
            Recipe::create($recipe);
        }
    }
}
