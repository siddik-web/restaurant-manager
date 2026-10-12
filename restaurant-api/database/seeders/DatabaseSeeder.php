<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@example.com')],
            ['name' => 'Admin', 'password' => env('ADMIN_PASSWORD', 'password')]
        );

        $this->call([
            SettingSeeder::class,
            RecipeSeeder::class,
            TableSeeder::class,
            ChefSeeder::class,
            StationSeeder::class,
            SupplierSeeder::class,
            InventorySeeder::class,
        ]);
    }
}
