<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = Admin::where('role', 'super_admin')->first();

        $vendors = [
            [
                'business_name' => 'StyleHub Store',
                'email'         => 'stylehub@marketplace.com',
                'password'      => Hash::make('password'),
                'phone'         => '+92-300-1111111',
                'description'   => 'Premium clothing store for men and women.',
                'status'        => 'approved',
            ],
            [
                'business_name' => 'Urban Threads',
                'email'         => 'urbanthreads@marketplace.com',
                'password'      => Hash::make('password'),
                'phone'         => '+92-300-2222222',
                'description'   => 'Trendy urban fashion for the modern generation.',
                'status'        => 'approved',
            ],
            [
                'business_name' => 'Classic Wardrobe',
                'email'         => 'classicwardrobe@marketplace.com',
                'password'      => Hash::make('password'),
                'phone'         => '+92-300-3333333',
                'description'   => 'Timeless classics and formal wear.',
                'status'        => 'pending',
            ],
        ];

        foreach ($vendors as $vendorData) {
            $slug = Str::slug($vendorData['business_name']);

            Vendor::updateOrCreate(
                ['email' => $vendorData['email']],
                array_merge($vendorData, [
                    'slug'                => $slug,
                    'approved_by'         => $superAdmin?->id,
                    'approved_at'         => $vendorData['status'] === 'approved' ? now() : null,
                    'email_verified_at'   => now(),
                ])
            );
        }

        $this->command->info('✅ Vendors seeded successfully.');
        $this->command->table(
            ['Business Name', 'Email', 'Password', 'Status'],
            collect($vendors)->map(fn($v) => [
                $v['business_name'],
                $v['email'],
                'password',
                $v['status'],
            ])->toArray()
        );
    }
}
