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
        Schema::create('faturat', function (Blueprint $table) {
            $table->id('fature_id');
            $table->foreignId('kontrate_id')->constrained('kontratat', 'kontrate_id')->cascadeOnDelete();
            $table->string('periudha');               // p.sh. "Janar 2026"
            $table->decimal('shuma_baze',   10, 2);
            $table->decimal('shuma_shtese', 10, 2)->default(0);
            $table->decimal('tatimi',       10, 2)->default(0);
            $table->decimal('totali',       10, 2);
            $table->date('data_leshimit');
            $table->date('data_pageses')->nullable();
            $table->string('statusi')->default('e_papaguar'); // e_papaguar, e_paguar, e_vonuar, anulluar
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faturat');
    }
};
