<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id('task_id');
            $table->string('titulli');
            $table->text('pershkrimi')->nullable();
            $table->enum('tipi', ['antenna_setup', 'maintenance', 'contract_renewal', 'complaint', 'general'])->default('general');
            $table->enum('prioriteti', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('statusi', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->unsignedBigInteger('assigned_by')->nullable();
            $table->foreign('assigned_to')->references('id')->on('users')->nullOnDelete();
            $table->foreign('assigned_by')->references('id')->on('users')->nullOnDelete();
            $table->unsignedBigInteger('antenna_id')->nullable();
            $table->foreign('antenna_id')->references('antenna_id')->on('antennas')->nullOnDelete();
            $table->date('due_date')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('tasks'); }
};
