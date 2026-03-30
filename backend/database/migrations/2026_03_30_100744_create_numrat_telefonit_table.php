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
        Schema::create('numrat_telefonit', function (Blueprint $table) {
            $table->id('numri_id');
            $table->foreignId('kontrate_id')->nullable()->constrained('kontratat', 'kontrate_id')->nullOnDelete();
            $table->string('numri_telefonit')->unique();
            $table->string('statusi')->default('aktiv');   // aktiv, joaktiv, i_rezervuar, i_portuar
            $table->date('data_aktivizimit')->nullable();
            $table->string('lloji')->default('postpaid'); // prepaid, postpaid, biznes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('numrat_telefonit');
    }
};
