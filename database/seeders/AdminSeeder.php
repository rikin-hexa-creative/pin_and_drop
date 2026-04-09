<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admins = [
            [
                'full_name'  => 'Super Admin',
                'email'      => 'superadmin@marketplace.com',
                'password'   => Hash::make('password'),
                'role'       => 'super_admin',
                'is_active'  => true,
            ],
            [
                'full_name'  => 'Moderator Admin',
                'email'      => 'moderator@marketplace.com',
                'password'   => Hash::make('password'),
                'role'       => 'moderator',
                'is_active'  => true,
            ],
            [
                'full_name'  => 'Support Admin',
                'email'      => 'support@marketplace.com',
                'password'   => Hash::make('password'),
                'role'       => 'support',
                'is_active'  => true,
            ],
        ];

        foreach ($admins as $admin) {
            Admin::updateOrCreate(
                ['email' => $admin['email']],
                $admin
            );
        }

        $this->command->info('✅ Admins seeded successfully.');
        $this->command->table(
            ['Name', 'Email', 'Password', 'Role'],
            collect($admins)->map(fn($a) => [
                $a['full_name'],
                $a['email'],
                'password',
                $a['role'],
            ])->toArray()
        );
    }
}
