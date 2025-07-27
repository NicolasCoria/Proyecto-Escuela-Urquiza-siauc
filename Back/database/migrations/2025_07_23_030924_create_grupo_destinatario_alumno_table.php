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
        Schema::create('grupo_destinatario_alumno', function (Blueprint $table) {
            $table->unsignedBigInteger('id_grupo');
            $table->unsignedInteger('id_alumno');
            $table->timestamp('fecha_agregado')->useCurrent();
            
            $table->primary(['id_grupo', 'id_alumno']);
            
            $table->foreign('id_grupo')
                  ->references('id_grupo')
                  ->on('grupos_destinatarios')
                  ->onDelete('cascade');
                  
            $table->foreign('id_alumno')
                  ->references('id_alumno')
                  ->on('alumno')
                  ->onDelete('cascade');
                  
            $table->index(['id_grupo', 'id_alumno']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grupo_destinatario_alumno');
    }
};
