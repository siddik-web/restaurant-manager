<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Table;

class TableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tables = [
            [
                'number' => 1,
                'capacity' => 4,
                'status' => 'available',
                'location' => 'Window',
                'notes' => 'Great view of the street',
            ],
            [
                'number' => 2,
                'capacity' => 4,
                'status' => 'available',
                'location' => 'Window',
                'notes' => 'Great view of the street',
            ],
            [
                'number' => 3,
                'capacity' => 6,
                'status' => 'available',
                'location' => 'Center',
                'notes' => 'Large table for groups',
            ],
            [
                'number' => 4,
                'capacity' => 2,
                'status' => 'available',
                'location' => 'Bar',
                'notes' => 'Intimate seating',
            ],
            [
                'number' => 5,
                'capacity' => 2,
                'status' => 'available',
                'location' => 'Bar',
                'notes' => 'Intimate seating',
            ],
            [
                'number' => 6,
                'capacity' => 8,
                'status' => 'available',
                'location' => 'Back',
                'notes' => 'Private area for large groups',
            ],
            [
                'number' => 7,
                'capacity' => 4,
                'status' => 'available',
                'location' => 'Patio',
                'notes' => 'Outdoor seating',
            ],
            [
                'number' => 8,
                'capacity' => 4,
                'status' => 'available',
                'location' => 'Patio',
                'notes' => 'Outdoor seating',
            ],
        ];

        foreach ($tables as $table) {
            Table::create($table);
        }
    }
}
