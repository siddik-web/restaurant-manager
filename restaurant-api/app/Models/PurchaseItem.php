<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_id',
        'inventory_id',
        'quantity',
        'unit_cost',
        'total_cost',
        'received_quantity',
        'notes',
        'expiry_date',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'received_quantity' => 'decimal:4',
        'expiry_date' => 'date',
    ];

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function inventory()
    {
        return $this->belongsTo(Inventory::class);
    }

    public function getRemainingQuantityAttribute()
    {
        return $this->quantity - $this->received_quantity;
    }

    public function isFullyReceived()
    {
        return $this->received_quantity >= $this->quantity;
    }

    public function isPartiallyReceived()
    {
        return $this->received_quantity > 0 && $this->received_quantity < $this->quantity;
    }

    public function calculateTotal()
    {
        $this->total_cost = $this->quantity * $this->unit_cost;
        return $this->total_cost;
    }
} 