<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'table_number',
        'subtotal',
        'tax',
        'delivery_fee',
        'total',
        'status',
        'completed_time',
        'assigned_chef',
        'assigned_station',
        'assigned_time',
        'urgent',
        'urgent_time',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'total' => 'decimal:2',
        'completed_time' => 'datetime',
        'assigned_time' => 'datetime',
        'urgent_time' => 'datetime',
        'urgent' => 'boolean',
        'notes' => 'array',
    ];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function table()
    {
        return $this->belongsTo(Table::class, 'table_number', 'number');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['new', 'preparing', 'ready']);
    }

    public function scopeUrgent($query)
    {
        return $query->where('urgent', true);
    }

    public function scopeByChef($query, $chefName)
    {
        return $query->where('assigned_chef', $chefName);
    }

    public function scopeByStation($query, $stationName)
    {
        return $query->where('assigned_station', $stationName);
    }
}
