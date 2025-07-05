<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recipe extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'price',
        'base_portions',
        'prep_time',
        'cook_time',
        'difficulty',
        'allergens',
        'tags',
        'ingredients',
        'instructions',
        'notes',
        'image',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'allergens' => 'array',
        'tags' => 'array',
        'ingredients' => 'array',
        'is_active' => 'boolean',
    ];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('category', 'like', "%{$search}%")
              ->orWhereJsonContains('tags', $search);
        });
    }
}
