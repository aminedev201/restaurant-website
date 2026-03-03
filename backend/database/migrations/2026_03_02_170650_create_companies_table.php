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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('logo')->nullable();
            $table->text('address')->nullable();
            $table->text('location_url')->nullable();
            $table->json('phones')->nullable();       // ["0612345678", "0687654321"]
            $table->json('emails')->nullable();       // ["info@co.com", "support@co.com"]
            $table->json('working_datetime')->nullable(); // { "mon": { "open": "09:00", "close": "18:00" }, ... }
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
