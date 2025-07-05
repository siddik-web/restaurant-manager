<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Chef;

class ChefSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $chefs = [
            [
                'name' => 'Chef Anna',
                'specialty' => 'Italian Cuisine',
                'is_active' => true,
            ],
            [
                'name' => 'Chef Ben',
                'specialty' => 'Grill & BBQ',
                'is_active' => true,
            ],
            [
                'name' => 'Chef Carlos',
                'specialty' => 'Pastry & Desserts',
                'is_active' => true,
            ],
            [
                'name' => 'Chef Maria',
                'specialty' => 'Asian Fusion',
                'is_active' => true,
            ],
            [
                'name' => 'Chef David',
                'specialty' => 'Seafood',
                'is_active' => true,
            ],
        ];

        foreach ($chefs as $chef) {
            Chef::create($chef);
        }
    }
}
