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
        Schema::create('infrastruktura', function (Blueprint $table) {
            $table->id('infrastrukture_id');
            $table->string('lloji');                             // router|server|olt|antena|switch|kabllo|firewall|tjeter
            $table->string('lokacioni');
            $table->string('kapaciteti')->nullable();
            $table->string('statusi')->default('aktive');        // aktive|joaktive|ne_mirembajtje|defekt
            $table->date('data_instalimit')->nullable();
            $table->date('data_mirembajtjes_fundit')->nullable();
            $table->text('pershkrimi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('infrastruktura');
    }
};
