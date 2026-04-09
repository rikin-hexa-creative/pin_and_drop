<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->string('item_source', 30)->default('product')->after('order_id')->index();
            $table->foreignId('user_sale_id')->nullable()->after('product_variant_id')->constrained('user_sales')->nullOnDelete();
            $table->foreignId('sale_seller_user_id')->nullable()->after('user_sale_id')->constrained('users')->nullOnDelete();
            $table->string('seller_name', 200)->nullable()->after('sale_seller_user_id');
        });

        if (DB::getDriverName() === 'sqlite') {
            Schema::table('order_items', function (Blueprint $table) {
                $table->unsignedBigInteger('vendor_id')->nullable()->change();
                $table->unsignedBigInteger('product_id')->nullable()->change();
            });

            return;
        }

        DB::statement('ALTER TABLE order_items MODIFY vendor_id BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE order_items MODIFY product_id BIGINT UNSIGNED NULL');
    }

    public function down(): void
    {
        DB::table('order_items')
            ->where('item_source', 'user_sale')
            ->delete();

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['item_source']);
            $table->dropConstrainedForeignId('sale_seller_user_id');
            $table->dropConstrainedForeignId('user_sale_id');
            $table->dropColumn(['seller_name', 'item_source']);
        });

        if (DB::getDriverName() === 'sqlite') {
            Schema::table('order_items', function (Blueprint $table) {
                $table->unsignedBigInteger('vendor_id')->nullable(false)->change();
                $table->unsignedBigInteger('product_id')->nullable(false)->change();
            });

            return;
        }

        DB::statement('ALTER TABLE order_items MODIFY vendor_id BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE order_items MODIFY product_id BIGINT UNSIGNED NOT NULL');
    }
};
