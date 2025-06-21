<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIdUcToInscripcionTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('inscripcion', function (Blueprint $table) {
            $table->integer('id_uc')->nullable()->after('id_alumno');
            $table->foreign('id_uc')->references('id_uc')->on('unidad_curricular')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('inscripcion', function (Blueprint $table) {
            $table->dropForeign(['id_uc']);
            $table->dropColumn('id_uc');
        });
    }
} 