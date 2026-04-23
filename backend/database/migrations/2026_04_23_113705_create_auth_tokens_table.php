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
        Schema::create('auth_tokens', function (Blueprint $table) {
            $table->id('token_id');
            $table->foreignId('klient_id')->constrained('clients', 'klient_id')->cascadeOnDelete();
            $table->char('token', 6);
            $table->boolean('perdorur')->default(false);
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['klient_id', 'perdorur', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auth_tokens');
    }
};
