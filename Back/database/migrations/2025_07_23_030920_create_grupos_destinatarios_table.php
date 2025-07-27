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
        Schema::create('grupos_destinatarios', function (Blueprint $table) {
            $table->id('id_grupo');
            $table->string('nombre', 100)->unique();
            $table->text('descripcion')->nullable();
            $table->unsignedInteger('id_admin_creador');
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->boolean('activo')->default(true);
            
            $table->foreign('id_admin_creador')
                  ->references('id_admin')
                  ->on('administrador')
                  ->onDelete('cascade');
                  
            $table->index(['activo', 'id_admin_creador']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grupos_destinatarios');
    }
};
