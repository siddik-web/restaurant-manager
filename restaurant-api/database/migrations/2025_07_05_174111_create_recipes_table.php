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
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category');
            $table->decimal('price', 10, 2);
            $table->integer('base_portions')->default(4);
            $table->integer('prep_time')->default(15); // minutes
            $table->integer('cook_time')->default(20); // minutes
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->json('allergens')->nullable(); // array of allergen strings
            $table->json('tags')->nullable(); // array of tag strings
            $table->json('ingredients'); // array of ingredient objects
            $table->text('instructions');
            $table->text('notes')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recipes');
    }
};
