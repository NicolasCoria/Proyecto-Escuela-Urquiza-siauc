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
        Schema::table('plantillas_informe', function (Blueprint $table) {
            // Verificar si admin_id no existe y agregarlo
            if (!Schema::hasColumn('plantillas_informe', 'admin_id')) {
                $table->unsignedInteger('admin_id')->nullable()->after('campos_configurables');
            }
            
            // Verificar si descripcion no existe y agregarlo
            if (!Schema::hasColumn('plantillas_informe', 'descripcion')) {
                $table->string('descripcion')->nullable()->after('admin_id');
            }
        });
        
        // Agregar la clave foránea solo si no existe
        Schema::table('plantillas_informe', function (Blueprint $table) {
            if (!Schema::hasColumn('plantillas_informe', 'admin_id')) {
                $table->foreign('admin_id')->references('id_admin')->on('administrador')->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plantillas_informe', function (Blueprint $table) {
            $table->dropForeign(['admin_id']);
            $table->dropColumn(['admin_id', 'descripcion']);
        });
    }
};
