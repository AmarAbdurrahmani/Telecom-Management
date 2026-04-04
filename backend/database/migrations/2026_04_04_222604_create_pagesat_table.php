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
        Schema::create('pagesat', function (Blueprint $table) {
            $table->id('pagese_id');
            $table->foreignId('fature_id')->constrained('faturat', 'fature_id')->cascadeOnDelete();
            $table->decimal('shuma', 10, 2);
            $table->date('data_pageses');
            $table->string('metoda')->default('kesh'); // kesh|banke|transfere|kartele|online|tjeter
            $table->string('referenca')->nullable();
            $table->text('shenime')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagesat');
    }
};
