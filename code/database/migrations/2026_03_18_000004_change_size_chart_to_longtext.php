<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('products', 'size_chart')) {
            $driver = Schema::getConnection()->getDriverName();

            if ($driver === 'mysql') {
                DB::statement('ALTER TABLE products MODIFY size_chart LONGTEXT NULL');
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('products', 'size_chart')) {
            $driver = Schema::getConnection()->getDriverName();

            if ($driver === 'mysql') {
                DB::statement('ALTER TABLE products MODIFY size_chart JSON NULL');
            }
        }
    }
};
