<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Normalise existing data → new values
        DB::table('pagesat')
            ->whereIn('metoda', ['kesh', 'banke', 'kartele', 'tjeter'])
            ->update(['metoda' => 'cash']);

        DB::table('pagesat')
            ->where('metoda', 'transfere')
            ->update(['metoda' => 'transfer']);

        // 2. Lock the column to the three allowed values
        DB::statement(
            "ALTER TABLE pagesat
             MODIFY COLUMN metoda ENUM('cash','online','transfer') NOT NULL DEFAULT 'cash'"
        );
    }

    public function down(): void
    {
        DB::statement(
            "ALTER TABLE pagesat
             MODIFY COLUMN metoda VARCHAR(255) NOT NULL DEFAULT 'cash'"
        );
    }
};
