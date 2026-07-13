<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class MicroserviceMigrate extends Command
{
    protected $signature = 'microservice:migrate {--seed : Run domain seeders after migrating}';

    protected $description = 'Run core and domain-specific migrations for the current microservice';

    public function handle(): int
    {
        $domain = env('SERVICE_DOMAIN', 'monolith');

        if ($domain === 'monolith') {
            Artisan::call('migrate', ['--force' => true]);
            $this->output->write(Artisan::output());

            if ($this->option('seed')) {
                Artisan::call('db:seed', ['--force' => true]);
                $this->output->write(Artisan::output());
            }

            return self::SUCCESS;
        }

        $paths = config('microservice.core_migrations', []);

        foreach ($paths as $path) {
            Artisan::call('migrate', [
                '--force' => true,
                '--path' => $path,
            ]);
            $this->output->write(Artisan::output());
        }

        $domainMigrations = config("microservice.domains.{$domain}.migrations", []);

        foreach ($domainMigrations as $path) {
            Artisan::call('migrate', [
                '--force' => true,
                '--path' => $path,
            ]);
            $this->output->write(Artisan::output());
        }

        if ($this->option('seed')) {
            Artisan::call('db:seed', [
                '--force' => true,
                '--class' => 'Database\\Seeders\\MicroserviceSeeder',
            ]);
            $this->output->write(Artisan::output());
        }

        return self::SUCCESS;
    }
}
