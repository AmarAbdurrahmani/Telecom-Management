<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ankesat', function (Blueprint $table) {
            $table->id('ankese_id');
            $table->foreignId('klient_id')->constrained('clients', 'klient_id')->cascadeOnDelete();
            $table->foreignId('punonjes_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('kategoria');          // teknik | faturim | sherbimi | portabiliteti | tjeter
            $table->text('pershkrimi');
            $table->date('data_ankeses');
            $table->string('statusi')->default('e_re'); // e_re | ne_process | e_zgjidhur | e_mbyllur
            $table->text('pergjigja')->nullable();
            $table->date('data_zgjidhjes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ankesat');
    }
};
