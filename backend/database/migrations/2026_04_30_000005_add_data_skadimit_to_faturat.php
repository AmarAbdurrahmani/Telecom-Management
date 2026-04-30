<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('faturat', function (Blueprint $table) {
            $table->date('data_skadimit')->nullable()->after('data_leshimit');
        });
    }
    public function down(): void {
        Schema::table('faturat', function (Blueprint $table) {
            $table->dropColumn('data_skadimit');
        });
    }
};
