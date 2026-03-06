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
             $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('order_number')->unique();
            $table->text('delivery_address');
            $table->enum('status', [
                'pending',
                'confirmed',
                'preparing',
                'out_for_delivery',
                'delivered',
                'cancelled',
            ])->default('pending');
            $table->enum('payment_method', ['stripe', 'cod'])->default('cod');
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            $table->string('stripe_payment_intent_id')->nullable();
            $table->decimal('shipping', 8, 2)->default(0);
            $table->decimal('final_total', 10, 2);
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
