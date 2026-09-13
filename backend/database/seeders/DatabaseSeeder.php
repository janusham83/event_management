<?php

namespace Database\Seeders;

use App\Models\FunctionEvent;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@event.com'],
            [
                'name' => 'System Admin',
                'password' => 'admin123',
                'role' => 'admin',
                'phone' => '0770000000',
                'is_active' => true,
            ]
        );

        $staff = User::updateOrCreate(
            ['email' => 'staff@event.com'],
            [
                'name' => 'Event Staff',
                'password' => 'staff123',
                'role' => 'staff',
                'phone' => '0771111111',
                'is_active' => true,
            ]
        );

        FunctionEvent::firstOrCreate(
            ['name' => 'Annual Get Together 2026'],
            [
                'date' => '2026-12-15',
                'start_time' => '18:00:00',
                'end_time' => '22:00:00',
                'venue' => 'Grand Hall',
                'description' => 'Main annual gathering for all members.',
                'status' => 'active',
                'created_by' => $admin->id,
            ]
        );
    }
}
