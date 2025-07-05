<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'restaurant_name',
                'value' => 'Restaurant Manager',
                'type' => 'string',
                'description' => 'Restaurant name for receipts and branding',
            ],
            [
                'key' => 'address',
                'value' => '123 Main Street, City, State 12345',
                'type' => 'string',
                'description' => 'Restaurant address',
            ],
            [
                'key' => 'phone',
                'value' => '+1 (555) 123-4567',
                'type' => 'string',
                'description' => 'Restaurant phone number',
            ],
            [
                'key' => 'email',
                'value' => 'info@restaurant.com',
                'type' => 'string',
                'description' => 'Restaurant email address',
            ],
            [
                'key' => 'website',
                'value' => 'www.restaurant.com',
                'type' => 'string',
                'description' => 'Restaurant website',
            ],
            [
                'key' => 'tax_rate',
                'value' => '10',
                'type' => 'number',
                'description' => 'Tax rate percentage',
            ],
            [
                'key' => 'delivery_fee',
                'value' => '5.00',
                'type' => 'number',
                'description' => 'Delivery fee amount',
            ],
            [
                'key' => 'currency',
                'value' => 'USD',
                'type' => 'string',
                'description' => 'Currency code',
            ],
            [
                'key' => 'receipt_footer',
                'value' => 'Thank you for dining with us!',
                'type' => 'string',
                'description' => 'Receipt footer message',
            ],
            [
                'key' => 'print_header',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Print restaurant header on receipts',
            ],
            [
                'key' => 'print_footer',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Print footer on receipts',
            ],
            [
                'key' => 'auto_print',
                'value' => 'false',
                'type' => 'boolean',
                'description' => 'Auto print receipts',
            ],
            [
                'key' => 'receipt_width',
                'value' => '80',
                'type' => 'number',
                'description' => 'Receipt width in mm',
            ],
            [
                'key' => 'font_size',
                'value' => '12',
                'type' => 'number',
                'description' => 'Receipt font size',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }
}
