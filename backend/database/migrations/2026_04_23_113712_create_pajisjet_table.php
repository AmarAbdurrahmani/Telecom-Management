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
        Schema::create('pajisjet', function (Blueprint $table) {
            $table->id('pajisje_id');
            $table->string('emri');                      // "iPhone 15 Pro"
            $table->string('marka');                     // Apple | Samsung | Google ...
            $table->decimal('cmimi_cash', 10, 2);
            $table->decimal('cmimi_keste', 10, 2);       // per muaj
            $table->unsignedTinyInteger('muajt_kestes')->default(24);
            $table->boolean('disponueshme')->default(true);
            $table->text('pershkrimi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pajisjet');
    }
};
