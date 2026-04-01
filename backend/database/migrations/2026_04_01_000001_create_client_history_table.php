<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('klient_id')->constrained('clients', 'klient_id')->cascadeOnDelete();
            $table->string('veprimi');           // kompensim|sim_kartele|ndryshim_ciklit|krijim|ndryshim_pakete|etc.
            $table->text('pershkrimi');           // Human-readable log entry
            $table->decimal('shuma', 10, 2)->nullable();  // For financial events
            $table->string('kanali')->nullable(); // email|sms|poste|portal
            $table->foreignId('punonjes_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('meta_data')->nullable(); // Extra context (old/new values etc.)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_history');
    }
};
