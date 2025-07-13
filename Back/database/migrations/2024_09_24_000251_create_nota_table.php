<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNotaTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('nota', function (Blueprint $table) {
            $table->increments('id_nota');
            $table->integer('id_alumno')->nullable();
            $table->integer('id_uc')->nullable();
            $table->decimal('nota', 4, 2)->nullable(); // Permite decimales
            $table->dateTime('fecha')->nullable();
            $table->string('tipo', 20)->nullable();
            $table->string('observaciones', 255)->nullable();

            $table->foreign('id_alumno')->references('id_alumno')->on('alumno');
            $table->foreign('id_uc')->references('id_uc')->on('unidad_curricular');
            $table->index('id_alumno');
            $table->index('id_uc');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('nota');
    }
} 