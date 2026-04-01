<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ankesat', function (Blueprint $table) {
            $table->boolean('ka_kompensim')->default(false)->after('data_zgjidhjes');
            $table->string('arsyeja_kompensimit')->nullable()->after('ka_kompensim');
            $table->decimal('shuma_kompensimit', 10, 2)->nullable()->after('arsyeja_kompensimit');
            $table->string('kanali_njoftimit')->default('email')->after('shuma_kompensimit');
        });
    }

    public function down(): void
    {
        Schema::table('ankesat', function (Blueprint $table) {
            $table->dropColumn(['ka_kompensim', 'arsyeja_kompensimit', 'shuma_kompensimit', 'kanali_njoftimit']);
        });
    }
};
