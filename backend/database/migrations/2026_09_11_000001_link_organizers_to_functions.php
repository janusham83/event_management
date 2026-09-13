<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('function_id')->nullable()->unique()->after('role')->constrained('function_events')->nullOnDelete();
        });

        Schema::table('function_events', function (Blueprint $table) {
            $table->foreignId('organizer_id')->nullable()->unique()->after('created_by')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('function_events', function (Blueprint $table) {
            $table->dropForeign(['organizer_id']);
            $table->dropUnique(['organizer_id']);
            $table->dropColumn('organizer_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['function_id']);
            $table->dropUnique(['function_id']);
            $table->dropColumn('function_id');
        });
    }
};
