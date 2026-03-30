<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('punonjesit', function (Blueprint $table) {
            $table->id('punonjes_id');
            $table->string('emri');
            $table->string('mbiemri');
            $table->string('departamenti')->nullable();
            $table->string('pozita')->nullable();
            $table->string('email')->unique();
            $table->string('telefoni')->nullable();
            $table->boolean('aktiv')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('punonjesit');
    }
};
