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
        Schema::create('clients', function (Blueprint $table) {
            $table->id('klient_id');
            $table->string('emri');
            $table->string('mbiemri');
            $table->string('numri_personal')->unique();
            $table->string('email')->unique();
            $table->string('telefoni');
            $table->string('adresa')->nullable();
            $table->string('lloji_klientit'); // individual / biznes
            $table->date('data_regjistrimit');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
