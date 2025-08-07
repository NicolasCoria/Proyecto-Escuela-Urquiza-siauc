<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDestinatariosMensajeTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('destinatarios_mensaje', function (Blueprint $table) {
            $table->id('id_destinatario');
            $table->unsignedBigInteger('id_mensaje');
            $table->unsignedBigInteger('id_alumno');
            $table->boolean('leido')->default(false);
            $table->timestamp('fecha_lectura')->nullable();
            $table->timestamps();

            $table->foreign('id_mensaje')
                  ->references('id_mensaje')
                  ->on('mensajes')
                  ->onDelete('cascade');

            $table->foreign('id_alumno')
                  ->references('id_alumno')
                  ->on('alumno')
                  ->onDelete('cascade');

            $table->unique(['id_mensaje', 'id_alumno']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('destinatarios_mensaje');
    }
}