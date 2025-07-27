<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('alumno', function (Blueprint $table) {
            $table->string('email', 40)->change();
        });
    }

    public function down()
    {
        Schema::table('alumno', function (Blueprint $table) {
            $table->string('email', 30)->change();
        });
    }
}; 