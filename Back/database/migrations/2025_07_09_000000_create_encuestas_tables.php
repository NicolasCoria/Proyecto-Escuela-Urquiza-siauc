<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEncuestasTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Tabla encuestas
        Schema::create('encuesta', function (Blueprint $table) {
            $table->increments('id_encuesta');
            $table->string('titulo', 100);
            $table->string('descripcion', 255)->nullable();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->boolean('activa')->default(true);
            $table->integer('id_carrera')->nullable();

            $table->foreign('id_carrera', 'fk_encuesta_carrera')->references('id_carrera')->on('carrera')->onDelete('set null');
        });

        // Tabla preguntas
        Schema::create('pregunta', function (Blueprint $table) {
            $table->increments('id_pregunta');
            $table->integer('id_encuesta')->unsigned();
            $table->string('texto', 255);
            $table->enum('tipo', ['opcion_unica', 'opcion_multiple'])->default('opcion_unica');
            $table->integer('orden')->default(0);
            $table->foreign('id_encuesta', 'fk_pregunta_encuesta')->references('id_encuesta')->on('encuesta')->onDelete('cascade');
        });

        // Tabla opciones
        Schema::create('opcion', function (Blueprint $table) {
            $table->increments('id_opcion');
            $table->integer('id_pregunta')->unsigned();
            $table->string('texto', 100);
            $table->integer('valor')->nullable();
            $table->foreign('id_pregunta', 'fk_opcion_pregunta')->references('id_pregunta')->on('pregunta')->onDelete('cascade');
        });

        // Tabla respuestas
        Schema::create('respuesta', function (Blueprint $table) {
            $table->increments('id_respuesta');
            $table->integer('id_encuesta')->unsigned();
            $table->integer('id_pregunta')->unsigned();
            $table->integer('id_opcion')->unsigned();
            $table->integer('id_alumno')->unsigned()->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('id_encuesta', 'fk_respuesta_encuesta')->references('id_encuesta')->on('encuesta')->onDelete('cascade');
            $table->foreign('id_pregunta', 'fk_respuesta_pregunta')->references('id_pregunta')->on('pregunta')->onDelete('cascade');
            $table->foreign('id_opcion', 'fk_respuesta_opcion')->references('id_opcion')->on('opcion')->onDelete('cascade');
            $table->foreign('id_alumno', 'fk_respuesta_alumno')->references('id_alumno')->on('alumno')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('respuesta');
        Schema::dropIfExists('opcion');
        Schema::dropIfExists('pregunta');
        Schema::dropIfExists('encuesta');
    }
} 