<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Station;

class StationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stations = [
            [
                'name' => 'Grill',
                'description' => 'Main grill station for burgers, steaks, and grilled items',
                'is_active' => true,
            ],
            [
                'name' => 'Fry',
                'description' => 'Deep fryer station for wings, fries, and fried items',
                'is_active' => true,
            ],
            [
                'name' => 'Salad',
                'description' => 'Cold station for salads, appetizers, and cold prep',
                'is_active' => true,
            ],
            [
                'name' => 'Pizza',
                'description' => 'Pizza oven station for all pizza orders',
                'is_active' => true,
            ],
            [
                'name' => 'Dessert',
                'description' => 'Dessert station for cakes, pastries, and sweet items',
                'is_active' => true,
            ],
            [
                'name' => 'Pasta',
                'description' => 'Pasta station for all pasta dishes',
                'is_active' => true,
            ],
        ];

        foreach ($stations as $station) {
            Station::create($station);
        }
    }
}
