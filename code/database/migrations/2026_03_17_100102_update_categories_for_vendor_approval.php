<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->boolean('is_approved')->default(false)->after('is_active');
            $table->foreignId('approved_by')->nullable()->constrained('admins')->nullOnDelete()->after('is_approved');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->foreignId('created_by_vendor')->nullable()->constrained('vendors')->nullOnDelete()->after('created_by');
        });

        DB::statement('ALTER TABLE categories MODIFY created_by BIGINT UNSIGNED NULL');

        // Approve existing admin-created categories so they remain selectable.
        DB::table('categories')
            ->whereNotNull('created_by')
            ->whereNull('created_by_vendor')
            ->update([
                'is_approved' => true,
                'approved_by' => DB::raw('created_by'),
                'approved_at' => now(),
            ]);
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropConstrainedForeignId('created_by_vendor');
            $table->dropConstrainedForeignId('approved_by');
            $table->dropColumn(['approved_at', 'is_approved']);
        });

        DB::statement('ALTER TABLE categories MODIFY created_by BIGINT UNSIGNED NOT NULL');
    }
};
