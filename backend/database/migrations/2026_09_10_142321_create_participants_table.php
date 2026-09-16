<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participants', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('mobile_number');
            $table->string('email')->nullable();
            $table->string('organization')->nullable();
            $table->integer('number_of_guests')->default(0);
            $table->string('registration_number')->unique();
            $table->foreignId('function_id')->constrained('function_events');
            $table->string('qr_token')->unique();
            $table->string('status')->default('registered');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};
