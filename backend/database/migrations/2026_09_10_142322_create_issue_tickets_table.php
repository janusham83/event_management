<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issue_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->foreignId('participant_id')->constrained('participants')->cascadeOnDelete();
            $table->foreignId('function_id')->constrained('function_events');
            $table->string('category');
            $table->text('description');
            $table->string('priority')->default('Medium');
            $table->string('status')->default('Open');
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issue_tickets');
    }
};
