<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('departamenti')->nullable()->after('roli');
            $table->string('pozita')->nullable()->after('departamenti');
            $table->string('telefoni')->nullable()->after('pozita');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['departamenti', 'pozita', 'telefoni']);
        });
    }
};
