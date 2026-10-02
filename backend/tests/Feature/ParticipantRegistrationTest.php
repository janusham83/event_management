<?php

namespace Tests\Feature;

use App\Models\FunctionEvent;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ParticipantRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_number_does_not_reuse_count_after_an_id_gap(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $function = FunctionEvent::create([
            'name' => 'Test Function',
            'date' => '2026-12-01',
            'start_time' => '09:00:00',
            'end_time' => '17:00:00',
            'venue' => 'Test Venue',
            'created_by' => $admin->id,
        ]);

        Participant::unguarded(fn () => Participant::create([
            'id' => 4,
            'full_name' => 'Existing Participant',
            'mobile_number' => '0771234567',
            'registration_number' => 'REG-' . date('Y') . '-000002',
            'function_id' => $function->id,
            'qr_token' => 'existing-qr-token',
            'status' => 'registered',
        ]));

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/participants', [
            'full_name' => 'New Participant',
            'mobile_number' => '0777654321',
            'function_id' => $function->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('registration_number', 'REG-' . date('Y') . '-000005');
    }
}