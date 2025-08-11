<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePeriodosInscripcionTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('periodos_inscripcion', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_periodo');
            $table->text('descripcion')->nullable();
            $table->dateTime('fecha_inicio');
            $table->dateTime('fecha_fin');
            $table->boolean('activo')->default(false);
            $table->integer('id_carrera')->nullable();
            $table->integer('id_grado')->nullable();
            $table->timestamps();
            
            $table->foreign('id_carrera')->references('id_carrera')->on('carrera')->onDelete('cascade');
            $table->foreign('id_grado')->references('id_grado')->on('grado')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('periodos_inscripcion');
    }
} 