<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description');
            $table->json('images');
            $table->decimal('actual_price', 10, 2);
            $table->decimal('compare_at_price', 10, 2)->nullable();
            $table->string('condition', 100);
            $table->date('created_date')->nullable();
            $table->string('sale_status', 20)->default('not_sold');
            $table->string('status', 20)->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_sales');
    }
};
