<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Collection;

class ReportDataResolver
{
    public function __construct(private InterServiceClient $services)
    {
    }

    public function orders(array $query = []): Collection
    {
        if (! $this->services->isMicroserviceMode()) {
            $builder = Order::query();

            foreach ($query as $key => $value) {
                match ($key) {
                    'date' => $builder->whereDate('created_at', $value),
                    'year' => $builder->whereYear('created_at', $value),
                    'month' => $builder->whereMonth('created_at', $value),
                    default => null,
                };
            }

            return $builder->get();
        }

        $records = collect($this->services->fetchCollection('orders?per_page=1000'));

        if (isset($query['date'])) {
            $records = $records->filter(
                fn ($order) => isset($order['created_at']) && str_starts_with($order['created_at'], $query['date'])
            );
        }

        if (isset($query['year'])) {
            $records = $records->filter(
                fn ($order) => isset($order['created_at']) && (int) date('Y', strtotime($order['created_at'])) === (int) $query['year']
            );
        }

        if (isset($query['month'])) {
            $records = $records->filter(
                fn ($order) => isset($order['created_at']) && (int) date('n', strtotime($order['created_at'])) === (int) $query['month']
            );
        }

        return $records->map(fn ($order) => (object) $order);
    }

    public function inventoryItems(): Collection
    {
        if (! $this->services->isMicroserviceMode()) {
            return collect();
        }

        return collect($this->services->fetchCollection('inventory?per_page=1000'));
    }
}
