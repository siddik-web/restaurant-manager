<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin Manager',
                'email' => 'admin@restaurant.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ],
            [
                'name' => 'POS Cashier',
                'email' => 'cashier@restaurant.com',
                'password' => Hash::make('password'),
                'role' => 'cashier',
            ],
            [
                'name' => 'Kitchen Chef',
                'email' => 'chef@restaurant.com',
                'password' => Hash::make('password'),
                'role' => 'chef',
            ],
            [
                'name' => 'Inventory Manager',
                'email' => 'inventory@restaurant.com',
                'password' => Hash::make('password'),
                'role' => 'inventory_manager',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(['email' => $user['email']], $user);
        }
    }
}
