<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Alumno;
use App\Models\Carrera;
use Illuminate\Support\Facades\DB;

$email = 'mirko.test@test.com';
$carreraNombre = 'Desarrollador de Software';

$alumno = Alumno::where('email', $email)->first();
if (!$alumno) {
    echo "❌ Alumno no encontrado\n";
    exit(1);
}

$carrera = Carrera::where('carrera', $carreraNombre)->first();
if (!$carrera) {
    echo "❌ Carrera no encontrada\n";
    exit(1);
}

// Verificar si ya está inscripto
$yaInscripto = DB::table('alumno_carrera')
    ->where('id_alumno', $alumno->id_alumno)
    ->where('id_carrera', $carrera->id_carrera)
    ->exists();

if ($yaInscripto) {
    echo "ℹ️ El alumno ya está inscripto en la carrera.\n";
    exit(0);
}

DB::table('alumno_carrera')->insert([
    'id_alumno' => $alumno->id_alumno,
    'id_carrera' => $carrera->id_carrera,
]);
echo "✅ Alumno inscripto en la carrera 'Desarrollador de Software'.\n"; 