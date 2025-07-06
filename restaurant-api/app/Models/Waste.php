<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Waste extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_id',
        'quantity',
        'unit_cost',
        'total_cost',
        'reason',
        'waste_date',
        'recorded_by',
        'notes',
        'waste_type',
        'disposal_method',
        'approved_by',
        'category',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'waste_date' => 'date',
    ];

    public function inventory()
    {
        return $this->belongsTo(Inventory::class);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('waste_date', [$startDate, $endDate]);
    }

    public function scopeByReason($query, $reason)
    {
        return $query->where('reason', $reason);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('reason', 'like', "%{$search}%")
              ->orWhere('notes', 'like', "%{$search}%")
              ->orWhere('category', 'like', "%{$search}%")
              ->orWhereHas('inventory', function ($iq) use ($search) {
                  $iq->where('name', 'like', "%{$search}%");
              });
        });
    }

    public function calculateTotal()
    {
        $this->total_cost = $this->quantity * $this->unit_cost;
        return $this->total_cost;
    }
} 