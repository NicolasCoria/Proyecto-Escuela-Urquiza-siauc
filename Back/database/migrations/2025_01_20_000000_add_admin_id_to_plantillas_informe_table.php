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
            $table->unsignedInteger('admin_id')->nullable()->after('campos_configurables');
            $table->string('descripcion')->nullable()->after('admin_id');
            
            $table->foreign('admin_id')->references('id_admin')->on('administrador')->onDelete('cascade');
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
