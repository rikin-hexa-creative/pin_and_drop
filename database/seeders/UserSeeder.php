<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'full_name' => 'John Doe',
                'email'     => 'john@example.com',
                'password'  => Hash::make('password'),
                'phone'     => '+92-300-4444444',
                'is_active' => true,
                'address'   => [
                    'label'         => 'Home',
                    'full_name'     => 'John Doe',
                    'phone'         => '+92-300-4444444',
                    'address_line1' => '123 Main Street',
                    'city'          => 'Karachi',
                    'state'         => 'Sindh',
                    'postal_code'   => '74000',
                    'country'       => 'Pakistan',
                    'is_default'    => true,
                ],
            ],
            [
                'full_name' => 'Jane Smith',
                'email'     => 'jane@example.com',
                'password'  => Hash::make('password'),
                'phone'     => '+92-300-5555555',
                'is_active' => true,
                'address'   => [
                    'label'         => 'Home',
                    'full_name'     => 'Jane Smith',
                    'phone'         => '+92-300-5555555',
                    'address_line1' => '456 Garden Road',
                    'city'          => 'Lahore',
                    'state'         => 'Punjab',
                    'postal_code'   => '54000',
                    'country'       => 'Pakistan',
                    'is_default'    => true,
                ],
            ],
            [
                'full_name' => 'Test User',
                'email'     => 'user@example.com',
                'password'  => Hash::make('password'),
                'phone'     => '+92-300-6666666',
                'is_active' => true,
                'address'   => [
                    'label'         => 'Office',
                    'full_name'     => 'Test User',
                    'phone'         => '+92-300-6666666',
                    'address_line1' => '789 Blue Area',
                    'city'          => 'Islamabad',
                    'state'         => 'ICT',
                    'postal_code'   => '44000',
                    'country'       => 'Pakistan',
                    'is_default'    => true,
                ],
            ],
        ];

        foreach ($users as $userData) {
            $address = $userData['address'];
            unset($userData['address']);

            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, ['email_verified_at' => now()])
            );

            // Create address only if not already exists
            if ($user->addresses()->count() === 0) {
                $user->addresses()->create($address);
            }
        }

        $this->command->info('✅ Users seeded successfully.');
        $this->command->table(
            ['Name', 'Email', 'Password'],
            collect($users)->map(fn($u) => [
                $u['full_name'],
                $u['email'],
                'password',
            ])->toArray()
        );
    }
}
