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
        Schema::create('stock_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_id')->constrained()->onDelete('cascade');
            $table->enum('transaction_type', ['purchase', 'sale', 'waste', 'adjustment', 'transfer', 'return', 'expiry', 'damage']);
            $table->decimal('quantity', 10, 4);
            $table->decimal('previous_stock', 10, 4);
            $table->decimal('new_stock', 10, 4);
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('transaction_date');
            $table->string('performed_by')->nullable();
            $table->decimal('unit_cost', 10, 2)->default(0);
            $table->decimal('total_value', 12, 2)->default(0);
            $table->timestamps();
            
            $table->index(['inventory_id', 'transaction_date']);
            $table->index(['transaction_type', 'transaction_date']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_transactions');
    }
}; 