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
        Schema::create('order_plates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plate_id')->nullable()->nullOnDelete(); // nullable so plate can be deleted without losing order history
            $table->string('plate_name');
            $table->string('category_name')->nullable();
            $table->decimal('plate_price', 8, 2);
            $table->decimal('plate_old_price', 8, 2)->nullable();
            $table->unsignedTinyInteger('discount')->default(0);
            $table->unsignedInteger('quantity');
            $table->decimal('total', 10, 2);  // plate_price * quantity
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_plates');
    }
};
