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
        Schema::create('plates', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->text('short_desc')->nullable();
            $table->longText('desc')->nullable();
            $table->double('old_price')->nullable();
            $table->double('price');
            $table->tinyInteger('discount')->nullable()->default(0);
            $table->string('image_path', 255);
            $table->boolean('status')->default(true);
            $table->foreignId('category_id')
                ->constrained('categories')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plates');
    }
};
