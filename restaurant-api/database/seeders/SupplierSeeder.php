<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Supplier;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = [
            [
                'name' => 'Fresh Foods Co.',
                'contact_person' => 'John Smith',
                'email' => 'john@freshfoods.com',
                'phone' => '+1-555-0123',
                'address' => '123 Market Street',
                'city' => 'New York',
                'state' => 'NY',
                'postal_code' => '10001',
                'country' => 'USA',
                'website' => 'https://freshfoods.com',
                'payment_terms' => 'Net 30',
                'credit_limit' => 50000.00,
                'is_active' => true,
                'rating' => 4.5,
                'lead_time_days' => 3,
                'minimum_order' => 500.00,
                'delivery_fee' => 25.00,
                'notes' => 'Primary supplier for fresh produce and dairy products.',
            ],
            [
                'name' => 'Quality Meats Ltd.',
                'contact_person' => 'Sarah Johnson',
                'email' => 'sarah@qualitymeats.com',
                'phone' => '+1-555-0456',
                'address' => '456 Butcher Avenue',
                'city' => 'Chicago',
                'state' => 'IL',
                'postal_code' => '60601',
                'country' => 'USA',
                'website' => 'https://qualitymeats.com',
                'payment_terms' => 'Net 15',
                'credit_limit' => 75000.00,
                'is_active' => true,
                'rating' => 4.8,
                'lead_time_days' => 2,
                'minimum_order' => 1000.00,
                'delivery_fee' => 35.00,
                'notes' => 'Premium meat supplier with excellent quality.',
            ],
            [
                'name' => 'Ocean Seafood Supply',
                'contact_person' => 'Mike Wilson',
                'email' => 'mike@oceanseafood.com',
                'phone' => '+1-555-0789',
                'address' => '789 Harbor Drive',
                'city' => 'Seattle',
                'state' => 'WA',
                'postal_code' => '98101',
                'country' => 'USA',
                'website' => 'https://oceanseafood.com',
                'payment_terms' => 'Net 30',
                'credit_limit' => 40000.00,
                'is_active' => true,
                'rating' => 4.2,
                'lead_time_days' => 1,
                'minimum_order' => 750.00,
                'delivery_fee' => 40.00,
                'notes' => 'Fresh seafood supplier with daily deliveries.',
            ],
            [
                'name' => 'Bakery Essentials',
                'contact_person' => 'Lisa Brown',
                'email' => 'lisa@bakeryessentials.com',
                'phone' => '+1-555-0321',
                'address' => '321 Flour Street',
                'city' => 'Los Angeles',
                'state' => 'CA',
                'postal_code' => '90001',
                'country' => 'USA',
                'website' => 'https://bakeryessentials.com',
                'payment_terms' => 'Net 7',
                'credit_limit' => 25000.00,
                'is_active' => true,
                'rating' => 4.6,
                'lead_time_days' => 2,
                'minimum_order' => 300.00,
                'delivery_fee' => 20.00,
                'notes' => 'Specialized bakery ingredients and supplies.',
            ],
            [
                'name' => 'Beverage Solutions',
                'contact_person' => 'David Lee',
                'email' => 'david@beveragesolutions.com',
                'phone' => '+1-555-0654',
                'address' => '654 Drink Boulevard',
                'city' => 'Miami',
                'state' => 'FL',
                'postal_code' => '33101',
                'country' => 'USA',
                'website' => 'https://beveragesolutions.com',
                'payment_terms' => 'Net 30',
                'credit_limit' => 30000.00,
                'is_active' => true,
                'rating' => 4.3,
                'lead_time_days' => 5,
                'minimum_order' => 400.00,
                'delivery_fee' => 30.00,
                'notes' => 'Beverage supplier with wide selection of drinks.',
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create($supplier);
        }
    }
} 