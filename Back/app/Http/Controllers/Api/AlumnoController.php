<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Alumno;
use App\Models\AlumnoCarrera;
use App\Models\AlumnoGrado;
use App\Models\AlumnoUc;
use App\Models\CarreraUc;
use App\Models\UnidadCurricular;
use App\Models\Nota;
use Illuminate\Support\Facades\Auth;

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

    // GET /alumno/bootstrap → devuelve datos básicos del alumno y datos académicos clave en una sola llamada
    public function bootstrapAlumno(Request $request)
    {
        $start = microtime(true);
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $id_alumno = $user->id_alumno ?? $user->id ?? null;
        if (!$id_alumno) {
            return response()->json(['error' => 'No se pudo determinar el alumno autenticado'], 400);
        }

        // Alumno
        $alumno = Alumno::find($id_alumno);

        // Carrera del alumno
        $alumnoCarrera = AlumnoCarrera::where('id_alumno', $id_alumno)->first();
        $id_carrera = $alumnoCarrera ? $alumnoCarrera->id_carrera : null;
        $carrera = $alumnoCarrera ? \App\Models\Carrera::find($id_carrera) : null;

        // UC de carrera
        $uc_carrera_ids = $id_carrera
            ? CarreraUc::where('id_carrera', $id_carrera)->pluck('id_uc')->toArray()
            : [];
        $unidades_carrera = !empty($uc_carrera_ids)
            ? UnidadCurricular::whereIn('id_uc', $uc_carrera_ids)->get()
            : collect();

        // UC aprobadas (nota >= 6)
        $notas_aprobadas = Nota::where('id_alumno', $id_alumno)->where('nota', '>=', 6)->pluck('id_uc')->unique()->toArray();
        $unidades_aprobadas = !empty($notas_aprobadas)
            ? UnidadCurricular::whereIn('id_uc', $notas_aprobadas)->get()
            : collect();

        // UC inscriptas
        $inscripto_ids = AlumnoUc::where('id_alumno', $id_alumno)->pluck('id_uc')->toArray();
        $unidades_inscriptas = !empty($inscripto_ids)
            ? UnidadCurricular::whereIn('id_uc', $inscripto_ids)->get()
            : collect();

        // UC disponibles (mismo criterio optimizado que en AuthController)
        $todas_uc = UnidadCurricular::whereIn('id_uc', $uc_carrera_ids)->get()->keyBy('id_uc');
        $correlatividades = \App\Models\Correlatividad::whereIn('id_uc', $uc_carrera_ids)->get()->groupBy('id_uc');
        $notas_map = Nota::where('id_alumno', $id_alumno)
            ->whereIn('id_uc', $uc_carrera_ids)
            ->where('nota', '>=', 6)
            ->get()
            ->keyBy('id_uc');

        $unidades_disponibles = [];
        foreach ($todas_uc as $uc_id => $uc) {
            if (in_array($uc_id, $inscripto_ids)) continue;
            $corr = $correlatividades->get($uc_id, collect())->pluck('correlativa')->filter();
            if ($corr->isEmpty()) { $unidades_disponibles[] = $uc; continue; }
            $ok = true;
            foreach ($corr as $c) { if (!$notas_map->has($c)) { $ok = false; break; } }
            if ($ok) $unidades_disponibles[] = $uc;
        }

        $response = [
            'success' => true,
            'alumno' => $alumno,
            'carrera' => $carrera,
            'unidades_carrera' => $unidades_carrera,
            'unidades_aprobadas' => $unidades_aprobadas,
            'unidades_inscriptas' => $unidades_inscriptas,
            'unidades_disponibles' => $unidades_disponibles,
        ];

        \Log::info('API alumno/bootstrap', [
            'id_alumno' => $id_alumno,
            'carrera' => $id_carrera,
            'counts' => [
                'carrera' => $unidades_carrera->count(),
                'aprobadas' => $unidades_aprobadas->count(),
                'inscriptas' => $unidades_inscriptas->count(),
                'disponibles' => count($unidades_disponibles),
            ],
            'duration_ms' => round((microtime(true) - $start) * 1000, 2)
        ]);

        return response()->json($response);
    }
} 