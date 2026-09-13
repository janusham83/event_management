<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_id')->unique()->constrained('participants')->cascadeOnDelete();
            $table->foreignId('function_id')->constrained('function_events');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->timestamp('marked_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};