<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('waste', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity', 10, 4);
            $table->decimal('unit_cost', 10, 2);
            $table->decimal('total_cost', 12, 2);
            $table->string('reason');
            $table->date('waste_date');
            $table->string('recorded_by')->nullable();
            $table->text('notes')->nullable();
            $table->string('waste_type')->nullable();
            $table->string('disposal_method')->nullable();
            $table->string('approved_by')->nullable();
            $table->string('category')->nullable();
            $table->timestamps();
            
            $table->index(['inventory_id', 'waste_date']);
            $table->index(['reason', 'waste_date']);
            $table->index(['category', 'waste_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waste');
    }
}; 