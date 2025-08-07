<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMensajesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('mensajes', function (Blueprint $table) {
            $table->id('id_mensaje');
            $table->string('titulo', 200);
            $table->text('contenido');
            $table->enum('prioridad', ['baja', 'media', 'alta', 'urgente'])->default('media');
            $table->unsignedBigInteger('id_admin_creador');
            $table->timestamps();

            $table->foreign('id_admin_creador')
                  ->references('id_admin')
                  ->on('administrador')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('mensajes');
    }
}