<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_id',
        'transaction_type',
        'quantity',
        'previous_stock',
        'new_stock',
        'reference_type',
        'reference_id',
        'notes',
        'transaction_date',
        'performed_by',
        'unit_cost',
        'total_value',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'previous_stock' => 'decimal:4',
        'new_stock' => 'decimal:4',
        'unit_cost' => 'decimal:2',
        'total_value' => 'decimal:2',
        'transaction_date' => 'datetime',
    ];

    public function inventory()
    {
        return $this->belongsTo(Inventory::class);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('transaction_type', $type);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }

    public function scopeByInventory($query, $inventoryId)
    {
        return $query->where('inventory_id', $inventoryId);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('transaction_type', 'like', "%{$search}%")
              ->orWhere('notes', 'like', "%{$search}%")
              ->orWhereHas('inventory', function ($iq) use ($search) {
                  $iq->where('name', 'like', "%{$search}%");
              });
        });
    }

    public function getTransactionTypeLabelAttribute()
    {
        $types = [
            'purchase' => 'Purchase',
            'sale' => 'Sale',
            'waste' => 'Waste',
            'adjustment' => 'Adjustment',
            'transfer' => 'Transfer',
            'return' => 'Return',
            'expiry' => 'Expiry',
            'damage' => 'Damage',
        ];

        return $types[$this->transaction_type] ?? $this->transaction_type;
    }

    public function getTransactionTypeBadgeAttribute()
    {
        $badges = [
            'purchase' => 'success',
            'sale' => 'primary',
            'waste' => 'danger',
            'adjustment' => 'warning',
            'transfer' => 'info',
            'return' => 'secondary',
            'expiry' => 'dark',
            'damage' => 'danger',
        ];

        return $badges[$this->transaction_type] ?? 'secondary';
    }

    public function isPositive()
    {
        return in_array($this->transaction_type, ['purchase', 'return', 'adjustment']);
    }

    public function isNegative()
    {
        return in_array($this->transaction_type, ['sale', 'waste', 'expiry', 'damage']);
    }

    public function calculateValue()
    {
        $this->total_value = $this->quantity * $this->unit_cost;
        return $this->total_value;
    }
} 