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
        Schema::create('paketat', function (Blueprint $table) {
            $table->id('paket_id');
            $table->string('emri_paketes');
            $table->text('pershkrimi')->nullable();
            $table->decimal('cmimi_mujor', 8, 2);
            $table->string('lloji_sherbimit'); // internet, telefoni, tv, combo
            $table->integer('shpejtesia_mb')->nullable();
            $table->integer('minuta')->nullable();
            $table->integer('sms')->nullable();
            $table->decimal('data_gb', 6, 2)->nullable();
            $table->boolean('aktive')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paketat');
    }
};
