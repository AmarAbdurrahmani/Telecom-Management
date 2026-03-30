<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Null out any existing punonjes_id values (they referenced users, not punonjesit)
        DB::table('ankesat')->update(['punonjes_id' => null]);

        Schema::table('ankesat', function (Blueprint $table) {
            $table->foreign('punonjes_id')
                  ->references('punonjes_id')
                  ->on('punonjesit')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('ankesat', function (Blueprint $table) {
            $table->dropForeign(['punonjes_id']);
        });
    }
};
