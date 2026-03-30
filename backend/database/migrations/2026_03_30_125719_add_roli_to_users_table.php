<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('roli')->default('agent')->after('email'); // admin, tl, sv, agent, klient
            $table->boolean('aktiv')->default(true)->after('roli');
            $table->timestamp('last_login_at')->nullable()->after('aktiv');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['roli', 'aktiv', 'last_login_at']);
        });
    }
};
