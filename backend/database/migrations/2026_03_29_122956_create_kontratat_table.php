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
        Schema::create('kontratat', function (Blueprint $table) {
            $table->id('kontrate_id');
            $table->string('numri_kontrates')->unique();
            $table->foreignId('klient_id')->constrained('clients',  'klient_id')->cascadeOnDelete();
            $table->foreignId('paket_id')->constrained('paketat', 'paket_id')->cascadeOnDelete();
            $table->date('data_fillimit');
            $table->date('data_mbarimit')->nullable();
            $table->string('statusi')->default('aktive'); // aktive, e_skaduar, anulluar
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kontratat');
    }
};
