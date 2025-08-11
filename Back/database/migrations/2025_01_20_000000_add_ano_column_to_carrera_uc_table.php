<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAnoColumnToCarreraUcTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('carrera_uc', function (Blueprint $table) {
            $table->integer('ano')->nullable()->after('id_uc')->comment('Año de cursado de la UC en la carrera');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('carrera_uc', function (Blueprint $table) {
            $table->dropColumn('ano');
        });
    }
}
