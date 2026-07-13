<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class MicroserviceSeeder extends Seeder
{
    public function run(): void
    {
        $domain = env('SERVICE_DOMAIN', 'monolith');

        if ($domain === 'monolith') {
            $this->call(DatabaseSeeder::class);

            return;
        }

        $seeders = config("microservice.domains.{$domain}.seeders", []);

        foreach ($seeders as $seeder) {
            $this->call($seeder);
        }
    }
}
