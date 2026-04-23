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
        Schema::table('kontratat', function (Blueprint $table) {
            $table->foreignId('pajisje_id')
                  ->nullable()
                  ->after('paket_id')
                  ->constrained('pajisjet', 'pajisje_id')
                  ->nullOnDelete();
            $table->unsignedTinyInteger('zbritja_perqindje')->default(0)->after('pajisje_id'); // 0-100%
            $table->string('kodi_promo', 50)->nullable()->after('zbritja_perqindje');
        });
    }

    public function down(): void
    {
        Schema::table('kontratat', function (Blueprint $table) {
            $table->dropForeign(['pajisje_id']);
            $table->dropColumn(['pajisje_id', 'zbritja_perqindje', 'kodi_promo']);
        });
    }
};
