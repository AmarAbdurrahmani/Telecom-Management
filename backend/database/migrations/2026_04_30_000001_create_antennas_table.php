<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('antennas', function (Blueprint $table) {
            $table->id('antenna_id');
            $table->string('emri');
            $table->double('lat', 10, 6);
            $table->double('lon', 10, 6);
            $table->enum('tipi', ['5G', 'LTE', '3G'])->default('LTE');
            $table->enum('statusi', ['active', 'maintenance', 'offline'])->default('active');
            $table->integer('coverage_radius_m')->default(2000);
            $table->unsignedBigInteger('installed_by')->nullable();
            $table->foreign('installed_by')->references('id')->on('users')->nullOnDelete();
            $table->string('qyteti')->nullable();
            $table->text('shenimet')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('antennas'); }
};
