<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAlumnoEncuestaTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('alumno_encuesta', function (Blueprint $table) {
            $table->unsignedInteger('id_alumno');
            $table->unsignedInteger('id_encuesta');
            $table->timestamp('fecha_asignacion')->useCurrent();
            $table->boolean('notificado')->default(false);
            $table->boolean('respondida')->default(false);
            $table->timestamp('fecha_respuesta')->nullable();
            
            $table->primary(['id_alumno', 'id_encuesta']);
            $table->foreign('id_alumno', 'fk_alumno_encuesta_alumno')->references('id_alumno')->on('alumno')->onDelete('cascade');
            $table->foreign('id_encuesta', 'fk_alumno_encuesta_encuesta')->references('id_encuesta')->on('encuesta')->onDelete('cascade');
            $table->index('id_alumno');
            $table->index('id_encuesta');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('alumno_encuesta');
    }
}
