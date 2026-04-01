<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->unsignedTinyInteger('data_faturimit')->nullable();       // 7 or 22
            $table->unsignedTinyInteger('ndrysho_ciklin_count')->default(0);
            $table->decimal('krediti', 10, 2)->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['data_faturimit', 'ndrysho_ciklin_count', 'krediti']);
        });
    }
};
