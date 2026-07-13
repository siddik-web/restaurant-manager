<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\Recipe;
use App\Models\Setting;
use App\Models\StockTransaction;
use App\Models\Table;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InterServiceClient
{
    public function isMicroserviceMode(): bool
    {
        $domain = env('SERVICE_DOMAIN', 'monolith');

        return $domain !== 'monolith' && $domain !== null && $domain !== '';
    }

    public function gatewayUrl(): string
    {
        return rtrim(env('GATEWAY_URL', 'http://gateway'), '/');
    }

    private function client(int $timeout = 10): \Illuminate\Http\Client\PendingRequest
    {
        $client = Http::timeout($timeout);
        $token = request()->bearerToken();
        
        if ($token) {
            $client = $client->withToken($token);
        }
        
        return $client;
    }

    public function getRecipe(int $recipeId): ?array
    {
        if (! $this->isMicroserviceMode()) {
            $recipe = Recipe::find($recipeId);

            return $recipe ? $recipe->toArray() : null;
        }

        $response = $this->client(10)->get("{$this->gatewayUrl()}/api/recipes/{$recipeId}");

        if (! $response->successful()) {
            return null;
        }

        $payload = $response->json();

        return $payload['data'] ?? null;
    }

    public function getSettingValue(string $key, mixed $default = null): mixed
    {
        if (! $this->isMicroserviceMode()) {
            return Setting::getValue($key, $default);
        }

        $response = $this->client(10)->get("{$this->gatewayUrl()}/api/settings/value/{$key}");

        if (! $response->successful()) {
            return $default;
        }

        $payload = $response->json();

        return $payload['data']['value'] ?? $default;
    }

    public function updateTableStatus(int $tableNumber, string $status): void
    {
        if (! $this->isMicroserviceMode()) {
            Table::where('number', $tableNumber)->update(['status' => $status]);

            return;
        }

        $response = $this->client(10)->get("{$this->gatewayUrl()}/api/tables");

        if (! $response->successful()) {
            return;
        }

        $tables = $response->json()['data'] ?? [];
        $table = collect($tables)->first(fn ($item) => (int) ($item['number'] ?? 0) === $tableNumber);

        if (! $table || ! isset($table['id'])) {
            return;
        }

        $this->client(10)->patch("{$this->gatewayUrl()}/api/tables/{$table['id']}", [
            'status' => $status,
        ]);
    }

    public function deductInventoryForOrder(array $ingredient, int $recipeQuantity, ?int $orderId = null): void
    {
        if (! $this->isMicroserviceMode()) {
            $this->deductInventoryLocally($ingredient, $recipeQuantity, $orderId);

            return;
        }

        $this->client(10)->post("{$this->gatewayUrl()}/api/inventory/internal/deduct-ingredient", [
            'ingredient' => $ingredient,
            'recipe_quantity' => $recipeQuantity,
            'order_id' => $orderId,
        ]);
    }

    public function fetchCollection(string $path): array
    {
        if (! $this->isMicroserviceMode()) {
            return [];
        }

        $response = $this->client(15)->get("{$this->gatewayUrl()}/api/{$path}");

        if (! $response->successful()) {
            return [];
        }

        $payload = $response->json();
        $data = $payload['data'] ?? [];

        if (isset($data['data']) && is_array($data['data'])) {
            return $data['data'];
        }

        return is_array($data) ? $data : [];
    }

    private function deductInventoryLocally(array $ingredient, int $recipeQuantity, ?int $orderId): void
    {
        try {
            $inventory = Inventory::whereRaw('LOWER(name) = ?', [strtolower($ingredient['name'])])
                ->orWhere('sku', $ingredient['name'])
                ->first();

            if (! $inventory) {
                Log::warning("Inventory item not found for ingredient: {$ingredient['name']}");

                return;
            }

            $requiredQuantity = ($ingredient['quantity'] ?? 0) * $recipeQuantity;

            if ($requiredQuantity <= 0) {
                return;
            }

            if ($inventory->current_stock < $requiredQuantity) {
                $requiredQuantity = $inventory->current_stock;
            }

            if ($requiredQuantity <= 0) {
                return;
            }

            $oldStock = $inventory->current_stock;
            $newStock = $oldStock - $requiredQuantity;

            $inventory->update([
                'current_stock' => $newStock,
                'last_updated' => now(),
            ]);

            StockTransaction::create([
                'inventory_id' => $inventory->id,
                'transaction_type' => 'sale',
                'quantity' => $requiredQuantity,
                'previous_stock' => $oldStock,
                'new_stock' => $newStock,
                'reference_type' => 'order',
                'reference_id' => $orderId,
                'notes' => "Stock used for recipe: {$ingredient['name']}",
                'transaction_date' => now(),
                'unit_cost' => $inventory->cost_per_unit,
                'total_value' => $requiredQuantity * $inventory->cost_per_unit,
            ]);
        } catch (\Throwable $e) {
            Log::error('Error deducting inventory stock: '.$e->getMessage());
        }
    }
}
