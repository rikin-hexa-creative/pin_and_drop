<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('🌱 Starting Marketplace Seeder...');
        $this->command->info('');

        $this->call([
            AdminSeeder::class,
            VendorSeeder::class,
            UserSeeder::class,
        ]);

        $this->command->info('');
        $this->command->info('🎉 All seeders completed!');
        $this->command->info('');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('  LOGIN CREDENTIALS (password: password)');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('  ADMIN   → superadmin@marketplace.com');
        $this->command->info('  VENDOR  → stylehub@marketplace.com');
        $this->command->info('  USER    → john@example.com');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('');
    }
}
