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
        Schema::create('kontrate_sherbime', function (Blueprint $table) {
            $table->foreignId('kontrate_id')->constrained('kontratat',      'kontrate_id')->cascadeOnDelete();
            $table->foreignId('sherbim_id')->constrained('sherbimet_shtesa','sherbim_id')->cascadeOnDelete();
            $table->primary(['kontrate_id', 'sherbim_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kontrate_sherbime');
    }
};
