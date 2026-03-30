<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Null out ankesat.punonjes_id (values referenced punonjesit, not users)
        DB::table('ankesat')->update(['punonjes_id' => null]);

        // Drop FK from ankesat → punonjesit
        Schema::table('ankesat', function (Blueprint $table) {
            $table->dropForeign(['punonjes_id']);
        });

        // Add FK from ankesat → users
        Schema::table('ankesat', function (Blueprint $table) {
            $table->foreign('punonjes_id')
                  ->references('id')
                  ->on('users')
                  ->nullOnDelete();
        });

        // Drop punonjesit table
        Schema::dropIfExists('punonjesit');
    }

    public function down(): void
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

        DB::table('ankesat')->update(['punonjes_id' => null]);

        Schema::table('ankesat', function (Blueprint $table) {
            $table->dropForeign(['punonjes_id']);
            $table->foreign('punonjes_id')
                  ->references('punonjes_id')
                  ->on('punonjesit')
                  ->nullOnDelete();
        });
    }
};
