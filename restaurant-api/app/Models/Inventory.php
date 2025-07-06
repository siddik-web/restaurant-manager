<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inventory extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inventory';

    protected $fillable = [
        'name',
        'sku',
        'category',
        'unit',
        'current_stock',
        'min_stock',
        'max_stock',
        'cost_per_unit',
        'supplier_id',
        'location',
        'description',
        'is_active',
        'last_updated',
        'expiry_date',
        'barcode',
        'image',
        'notes',
    ];

    protected $casts = [
        'current_stock' => 'decimal:4',
        'min_stock' => 'decimal:4',
        'max_stock' => 'decimal:4',
        'cost_per_unit' => 'decimal:2',
        'is_active' => 'boolean',
        'last_updated' => 'datetime',
        'expiry_date' => 'date',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }

    public function waste()
    {
        return $this->hasMany(Waste::class);
    }

    public function stockTransactions()
    {
        return $this->hasMany(StockTransaction::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeLowStock($query)
    {
        return $query->whereRaw('current_stock <= min_stock');
    }

    public function scopeOutOfStock($query)
    {
        return $query->where('current_stock', '<=', 0);
    }

    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->where('expiry_date', '<=', now()->addDays($days))
                    ->where('expiry_date', '>=', now());
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('sku', 'like', "%{$search}%")
              ->orWhere('category', 'like', "%{$search}%")
              ->orWhere('barcode', 'like', "%{$search}%");
        });
    }

    public function getStockStatusAttribute()
    {
        if ($this->current_stock <= 0) {
            return 'out_of_stock';
        } elseif ($this->current_stock <= $this->min_stock) {
            return 'low_stock';
        } elseif ($this->current_stock >= $this->max_stock) {
            return 'overstocked';
        } else {
            return 'normal';
        }
    }

    public function getStockValueAttribute()
    {
        return $this->current_stock * $this->cost_per_unit;
    }

    public function isLowStock()
    {
        return $this->current_stock <= $this->min_stock;
    }

    public function isOutOfStock()
    {
        return $this->current_stock <= 0;
    }

    public function isExpiringSoon($days = 30)
    {
        return $this->expiry_date && $this->expiry_date->diffInDays(now()) <= $days;
    }
} 