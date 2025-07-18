<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Alumno;
use App\Models\AlumnoCarrera;
use App\Models\AlumnoGrado;
use App\Models\AlumnoUc;

class AlumnoController extends Controller
{
    // GET /alumnos/filtrados?id_carrera=...&id_grado=...&id_uc=...
    public function filtrados(Request $request)
    {
        $idCarrera = $request->input('id_carrera');
        $idGrado = $request->input('id_grado');
        $idUc = $request->input('id_uc');

        // Si no se filtra por carrera, devolver todos los alumnos
        if (!$idCarrera) {
            $alumnosFiltrados = \App\Models\Alumno::pluck('id_alumno')->toArray();
        } else {
            // Alumnos de la carrera
            $alumnosCarrera = \App\Models\AlumnoCarrera::where('id_carrera', $idCarrera)->pluck('id_alumno')->toArray();
            $alumnosFiltrados = $alumnosCarrera;
        }

        // Si se filtra por grado (año)
        if ($idGrado) {
            $alumnosGrado = \App\Models\AlumnoGrado::where('id_grado', $idGrado)->pluck('id_alumno')->toArray();
            $alumnosFiltrados = array_intersect($alumnosFiltrados, $alumnosGrado);
        }

        // Si se filtra por unidad curricular (materia)
        if ($idUc) {
            $alumnosUc = \App\Models\AlumnoUc::where('id_uc', $idUc)->pluck('id_alumno')->toArray();
            $alumnosFiltrados = array_intersect($alumnosFiltrados, $alumnosUc);
        }

        // Traer info de los alumnos filtrados
        $alumnos = \App\Models\Alumno::whereIn('id_alumno', $alumnosFiltrados)
            ->select('id_alumno', 'nombre', 'apellido', 'email', 'DNI')
            ->orderBy('apellido')
            ->get();

        return response()->json(['success' => true, 'alumnos' => $alumnos]);
    }
} 