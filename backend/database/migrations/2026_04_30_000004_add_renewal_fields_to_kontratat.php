<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('kontratat', function (Blueprint $table) {
            $table->boolean('auto_renew')->default(false)->after('statusi');
            $table->integer('renewal_months')->nullable()->after('auto_renew');
            $table->timestamp('renewed_at')->nullable()->after('renewal_months');
            $table->unsignedBigInteger('renewed_by')->nullable()->after('renewed_at');
        });
    }
    public function down(): void {
        Schema::table('kontratat', function (Blueprint $table) {
            $table->dropColumn(['auto_renew', 'renewal_months', 'renewed_at', 'renewed_by']);
        });
    }
};
