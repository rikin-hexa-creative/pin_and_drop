<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $addIsApproved = ! Schema::hasColumn('categories', 'is_approved');
        $addApprovedBy = ! Schema::hasColumn('categories', 'approved_by');
        $addApprovedAt = ! Schema::hasColumn('categories', 'approved_at');
        $addCreatedByVendor = ! Schema::hasColumn('categories', 'created_by_vendor');

        if ($addIsApproved || $addApprovedBy || $addApprovedAt || $addCreatedByVendor) {
            Schema::table('categories', function (Blueprint $table) use (
                $addIsApproved,
                $addApprovedBy,
                $addApprovedAt,
                $addCreatedByVendor
            ) {
                if ($addIsApproved) {
                    $table->boolean('is_approved')->default(false)->after('is_active');
                }
                if ($addApprovedBy) {
                    $table->foreignId('approved_by')->nullable()->constrained('admins')->nullOnDelete()->after('is_approved');
                }
                if ($addApprovedAt) {
                    $table->timestamp('approved_at')->nullable()->after('approved_by');
                }
                if ($addCreatedByVendor) {
                    $table->foreignId('created_by_vendor')->nullable()->constrained('vendors')->nullOnDelete()->after('created_by');
                }
            });
        }

        if (Schema::hasColumn('categories', 'created_by')) {
            $driver = Schema::getConnection()->getDriverName();
            if ($driver === 'mysql') {
                DB::statement('ALTER TABLE categories MODIFY created_by BIGINT UNSIGNED NULL');
            }
        }

        if (
            Schema::hasColumn('categories', 'is_approved')
            && Schema::hasColumn('categories', 'approved_by')
            && Schema::hasColumn('categories', 'approved_at')
            && Schema::hasColumn('categories', 'created_by_vendor')
        ) {
            DB::table('categories')
                ->whereNotNull('created_by')
                ->whereNull('created_by_vendor')
                ->where('is_approved', false)
                ->update([
                    'is_approved' => true,
                    'approved_by' => DB::raw('created_by'),
                    'approved_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        $dropCreatedByVendor = Schema::hasColumn('categories', 'created_by_vendor');
        $dropApprovedBy = Schema::hasColumn('categories', 'approved_by');
        $dropApprovedAt = Schema::hasColumn('categories', 'approved_at');
        $dropIsApproved = Schema::hasColumn('categories', 'is_approved');

        if ($dropCreatedByVendor || $dropApprovedBy || $dropApprovedAt || $dropIsApproved) {
            Schema::table('categories', function (Blueprint $table) use (
                $dropCreatedByVendor,
                $dropApprovedBy,
                $dropApprovedAt,
                $dropIsApproved
            ) {
                if ($dropCreatedByVendor) {
                    $table->dropConstrainedForeignId('created_by_vendor');
                }
                if ($dropApprovedBy) {
                    $table->dropConstrainedForeignId('approved_by');
                }
                if ($dropApprovedAt) {
                    $table->dropColumn('approved_at');
                }
                if ($dropIsApproved) {
                    $table->dropColumn('is_approved');
                }
            });
        }

        if (Schema::hasColumn('categories', 'created_by')) {
            $driver = Schema::getConnection()->getDriverName();
            if ($driver === 'mysql') {
                DB::statement('ALTER TABLE categories MODIFY created_by BIGINT UNSIGNED NOT NULL');
            }
        }
    }
};
