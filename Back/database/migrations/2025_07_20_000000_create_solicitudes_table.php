<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSolicitudesTable extends Migration
{
    public function up()
    {
        Schema::create('solicitudes', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('id_alumno');
            $table->enum('categoria', ['general', 'certificado', 'homologacion_interna', 'homologacion_externa']);
            $table->string('asunto', 255);
            $table->text('mensaje');
            $table->enum('estado', ['pendiente', 'en_proceso', 'respondida', 'rechazada'])->default('pendiente');
            $table->text('respuesta')->nullable();
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_respuesta')->nullable();
            $table->unsignedInteger('id_admin')->nullable();
            $table->foreign('id_alumno')->references('id_alumno')->on('alumno');
            $table->foreign('id_admin')->references('id_admin')->on('administrador');
        });
    }

    public function down()
    {
        Schema::dropIfExists('solicitudes');
    }
} 