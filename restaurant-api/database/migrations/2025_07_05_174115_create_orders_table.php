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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['dine-in', 'takeaway', 'delivery']);
            $table->integer('table_number')->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax', 10, 2);
            $table->decimal('delivery_fee', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->enum('status', ['new', 'preparing', 'ready', 'completed'])->default('new');
            $table->timestamp('completed_time')->nullable();
            $table->string('assigned_chef')->nullable();
            $table->string('assigned_station')->nullable();
            $table->timestamp('assigned_time')->nullable();
            $table->boolean('urgent')->default(false);
            $table->timestamp('urgent_time')->nullable();
            $table->json('notes')->nullable(); // array of note objects
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
