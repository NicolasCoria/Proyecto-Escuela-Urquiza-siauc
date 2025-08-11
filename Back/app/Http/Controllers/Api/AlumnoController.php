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
use Carbon\Carbon;

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
            ? CarreraUc::where('id_carrera', $id_carrera)
                ->join('unidad_curricular', 'carrera_uc.id_uc', '=', 'unidad_curricular.id_uc')
                ->select('unidad_curricular.*', 'carrera_uc.ano')
                ->orderBy('carrera_uc.ano')
                ->orderBy('unidad_curricular.unidad_curricular')
                ->get()
            : collect();

        // UC aprobadas con umbral según formato
        // Materia: >= 8, Taller: >= 6, Laboratorio/Proyecto: >= 7, default: >= 6
        $notas_aprobadas = Nota::where('nota.id_alumno', $id_alumno)
            ->join('unidad_curricular', 'nota.id_uc', '=', 'unidad_curricular.id_uc')
            ->whereRaw("nota.nota >= CASE 
                WHEN unidad_curricular.Formato = 'Materia' THEN 8 
                WHEN unidad_curricular.Formato = 'Taller' THEN 6 
                WHEN unidad_curricular.Formato IN ('Laboratorio','Proyecto') THEN 7 
                ELSE 6 END")
            ->pluck('nota.id_uc')
            ->unique()
            ->toArray();
        $unidades_aprobadas = !empty($notas_aprobadas)
            ? CarreraUc::where('id_carrera', $id_carrera)
                ->whereIn('carrera_uc.id_uc', $notas_aprobadas)
                ->join('unidad_curricular', 'carrera_uc.id_uc', '=', 'unidad_curricular.id_uc')
                ->select('unidad_curricular.*', 'carrera_uc.ano')
                ->orderBy('carrera_uc.ano')
                ->orderBy('unidad_curricular.unidad_curricular')
                ->get()
            : collect();

        // UC inscriptas con fecha de inscripción y estado de aprobación
        $inscripto_ids = AlumnoUc::where('id_alumno', $id_alumno)->pluck('id_uc')->toArray();
        $unidades_inscriptas = !empty($inscripto_ids)
            ? CarreraUc::where('carrera_uc.id_carrera', $id_carrera)
                ->whereIn('carrera_uc.id_uc', $inscripto_ids)
                ->join('unidad_curricular', 'carrera_uc.id_uc', '=', 'unidad_curricular.id_uc')
                ->join('inscripcion', function($join) use ($id_alumno) {
                    $join->on('carrera_uc.id_uc', '=', 'inscripcion.id_uc')
                         ->where('inscripcion.id_alumno', '=', $id_alumno);
                })
                ->select(
                    'unidad_curricular.*', 
                    'carrera_uc.ano',
                    'inscripcion.FechaHora as fecha_inscripcion',
                    'inscripcion.id_inscripcion'
                )
                ->orderBy('carrera_uc.ano')
                ->orderBy('unidad_curricular.unidad_curricular')
                ->get()
            : collect();

        // Marcar UCs inscriptas como aprobadas o no aprobadas
        $unidades_inscriptas = $unidades_inscriptas->map(function($uc) use ($notas_aprobadas) {
            $uc->esta_aprobada = in_array($uc->id_uc, $notas_aprobadas);
            $uc->puede_reinscribirse = !$uc->esta_aprobada; // Solo si no está aprobada
            return $uc;
        });

        // UC disponibles (mismo criterio optimizado que en AuthController)
        $todas_uc = CarreraUc::where('id_carrera', $id_carrera)
            ->join('unidad_curricular', 'carrera_uc.id_uc', '=', 'unidad_curricular.id_uc')
            ->select('unidad_curricular.*', 'carrera_uc.ano')
            ->get()
            ->keyBy('id_uc');
        $correlatividades = \App\Models\Correlatividad::whereIn('id_uc', $uc_carrera_ids)->get()->groupBy('id_uc');
        $notas_map = Nota::where('nota.id_alumno', $id_alumno)
            ->whereIn('nota.id_uc', $uc_carrera_ids)
            ->join('unidad_curricular', 'nota.id_uc', '=', 'unidad_curricular.id_uc')
            ->whereRaw("nota.nota >= CASE 
                WHEN unidad_curricular.Formato = 'Materia' THEN 8 
                WHEN unidad_curricular.Formato = 'Taller' THEN 6 
                WHEN unidad_curricular.Formato IN ('Laboratorio','Proyecto') THEN 7 
                ELSE 6 END")
            ->select('nota.*')
            ->get()
            ->keyBy('id_uc');

        $unidades_disponibles = [];
        foreach ($todas_uc as $uc_id => $uc) {
            // Si ya está inscripto, verificar si puede reinscribirse
            if (in_array($uc_id, $inscripto_ids)) {
                // Verificar si está aprobada
                if ($notas_map->has($uc_id)) {
                    continue; // ya aprobada, no disponible
                }
                
                // Verificar si pasó más de un año desde la inscripción
                $inscripcion = \App\Models\Inscripcion::where('id_alumno', $id_alumno)
                    ->where('id_uc', $uc_id)
                    ->orderBy('FechaHora', 'desc')
                    ->first();
                
                if ($inscripcion) {
                    $fechaInscripcion = new \Carbon\Carbon($inscripcion->FechaHora);
                    $fechaActual = \Carbon\Carbon::now();
                    $mesesTranscurridos = $fechaInscripcion->diffInMonths($fechaActual);
                    
                    // Si no pasó más de 12 meses, no está disponible para reinscripción
                    if ($mesesTranscurridos <= 12) {
                        continue;
                    }
                    // Si pasó más de 12 meses y no está aprobada, está disponible para reinscripción
                }
            }

            $corr = $correlatividades->get($uc_id, collect())->pluck('correlativa')->filter();
            if ($corr->isEmpty()) { 
                $unidades_disponibles[] = $uc; 
                continue; 
            }
            $ok = true;
            foreach ($corr as $c) { 
                if (!$notas_map->has($c)) { 
                    $ok = false; 
                    break; 
                } 
            }
            if ($ok) {
                $unidades_disponibles[] = $uc;
            }
        }

        // Agrupar UCs por año para el frontend
        $unidades_carrera_por_ano = $unidades_carrera->groupBy('ano');
        $unidades_aprobadas_por_ano = $unidades_aprobadas->groupBy('ano');
        $unidades_inscriptas_por_ano = $unidades_inscriptas->groupBy('ano');
        $unidades_disponibles_por_ano = collect($unidades_disponibles)->groupBy('ano');

        $response = [
            'success' => true,
            'alumno' => $alumno,
            'carrera' => $carrera,
            'unidades_carrera' => $unidades_carrera,
            'unidades_carrera_por_ano' => $unidades_carrera_por_ano,
            'unidades_aprobadas' => $unidades_aprobadas,
            'unidades_aprobadas_por_ano' => $unidades_aprobadas_por_ano,
            'unidades_inscriptas' => $unidades_inscriptas,
            'unidades_inscriptas_por_ano' => $unidades_inscriptas_por_ano,
            'unidades_disponibles' => $unidades_disponibles,
            'unidades_disponibles_por_ano' => $unidades_disponibles_por_ano,
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