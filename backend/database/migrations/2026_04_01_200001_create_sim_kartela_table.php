<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sim_kartela', function (Blueprint $table) {
            $table->id('sim_id');
            $table->foreignId('klient_id')->constrained('clients', 'klient_id')->cascadeOnDelete();
            $table->foreignId('numri_id')->nullable()->constrained('numrat_telefonit', 'numri_id')->nullOnDelete();
            $table->string('nr_karteles')->unique();      // ICCID
            $table->string('pin',  10)->nullable();       // PIN code
            $table->string('puk',  10)->nullable();       // PUK code
            $table->string('tip')->default('sim');        // sim | esim
            $table->string('statusi')->default('aktive'); // aktive | joaktive | bllokuar | e_zvendesuar
            $table->date('data_leshimit')->nullable();
            $table->text('koment')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sim_kartela');
    }
};
