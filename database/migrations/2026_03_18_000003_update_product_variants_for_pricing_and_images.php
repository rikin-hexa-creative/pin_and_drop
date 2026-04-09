<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->decimal('actual_price', 10, 2)->nullable()->after('extra_price');
            $table->decimal('selling_price', 10, 2)->nullable()->after('actual_price');
            $table->decimal('offer_price', 10, 2)->nullable()->after('selling_price');
            $table->json('images')->nullable()->after('image_url');
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn(['actual_price', 'selling_price', 'offer_price', 'images']);
        });
    }
};
