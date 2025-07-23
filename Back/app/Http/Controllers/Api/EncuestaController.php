<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Encuesta;
use App\Models\Pregunta;
use App\Models\Opcion;
use App\Models\Respuesta;
use App\Models\AlumnoEncuesta;
use App\Models\Alumno;
use App\Models\AlumnoCarrera;
use Illuminate\Support\Facades\DB;

class EncuestaController extends Controller
{
    // Listar encuestas activas, con preguntas y opciones
    public function index(Request $request)
    {
        $query = Encuesta::with(['preguntas.opciones']);
        
        if ($request->has('id_carrera')) {
            $query->where('id_carrera', $request->input('id_carrera'));
        }
        
        // Filtrar por fechas si se especifica
        if ($request->has('fecha_actual')) {
            $fechaActual = $request->input('fecha_actual');
            $query->where(function($q) use ($fechaActual) {
                $q->whereNull('fecha_inicio')
                  ->orWhere('fecha_inicio', '<=', $fechaActual);
            })->where(function($q) use ($fechaActual) {
                $q->whereNull('fecha_fin')
                  ->orWhere('fecha_fin', '>=', $fechaActual);
            });
        }
        
        $query->where('activa', true);
        $encuestas = $query->get();
        return response()->json(['success' => true, 'encuestas' => $encuestas]);
    }

    // Crear una nueva encuesta con preguntas y opciones
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:255',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date',
            'activa' => 'boolean',
            'id_carrera' => 'nullable|integer|exists:carrera,id_carrera', // ahora puede ser null
            'preguntas' => 'required|array|min:1',
            'preguntas.*.texto' => 'required|string|max:255',
            'preguntas.*.tipo' => 'required|in:opcion_unica,opcion_multiple',
            'preguntas.*.orden' => 'nullable|integer',
            'preguntas.*.opciones' => 'required|array|min:1',
            'preguntas.*.opciones.*.texto' => 'required|string|max:100',
            'preguntas.*.opciones.*.valor' => 'nullable|integer',
        ]);

        DB::beginTransaction();
        try {
            $encuesta = Encuesta::create($request->only([
                'titulo', 'descripcion', 'fecha_inicio', 'fecha_fin', 'activa', 'id_carrera'
            ]));

            foreach ($request->preguntas as $preguntaData) {
                $pregunta = $encuesta->preguntas()->create([
                    'texto' => $preguntaData['texto'],
                    'tipo' => $preguntaData['tipo'],
                    'orden' => $preguntaData['orden'] ?? 0,
                ]);
                foreach ($preguntaData['opciones'] as $opcionData) {
                    $pregunta->opciones()->create([
                        'texto' => $opcionData['texto'],
                        'valor' => $opcionData['valor'] ?? null,
                    ]);
                }
            }
            DB::commit();
            return response()->json(['success' => true, 'encuesta' => $encuesta->load('preguntas.opciones')], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Guardar respuestas de un alumno
    public function responder(Request $request)
    {
        $validated = $request->validate([
            'id_encuesta' => 'required|integer|exists:encuesta,id_encuesta',
            'respuestas' => 'required|array|min:1',
            'respuestas.*.id_pregunta' => 'required|integer|exists:pregunta,id_pregunta',
            'respuestas.*.id_opcion' => 'required|integer|exists:opcion,id_opcion',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $idAlumno = $user->id_alumno ?? $user->id ?? null;
        if (!$idAlumno) {
            return response()->json(['error' => 'No se pudo determinar el alumno'], 400);
        }

        // Verificar si ya respondió esta encuesta
        $yaRespondio = AlumnoEncuesta::where('id_alumno', $idAlumno)
            ->where('id_encuesta', $validated['id_encuesta'])
            ->where('respondida', true)
            ->exists();

        if ($yaRespondio) {
            return response()->json([
                'error' => 'Ya has respondido esta encuesta anteriormente',
                'duplicada' => true
            ], 400);
        }

        // Verificar que la encuesta esté activa
        $encuesta = Encuesta::find($validated['id_encuesta']);
        if (!$encuesta || !$encuesta->activa) {
            return response()->json([
                'error' => 'La encuesta no está disponible'
            ], 400);
        }

        // Verificar que esté dentro del período de la encuesta si tiene fechas
        $fechaActual = now();
        if ($encuesta->fecha_inicio && $fechaActual < $encuesta->fecha_inicio) {
            return response()->json([
                'error' => 'La encuesta aún no está disponible'
            ], 400);
        }

        if ($encuesta->fecha_fin && $fechaActual > $encuesta->fecha_fin) {
            return response()->json([
                'error' => 'La encuesta ya no está disponible'
            ], 400);
        }

        // Verificar que el alumno tenga la encuesta asignada
        $asignacion = AlumnoEncuesta::where('id_alumno', $idAlumno)
            ->where('id_encuesta', $validated['id_encuesta'])
            ->first();

        if (!$asignacion) {
            return response()->json([
                'error' => 'No tienes esta encuesta asignada'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Eliminar respuestas previas si las hubiera (por si acaso)
            Respuesta::where('id_alumno', $idAlumno)
                ->where('id_encuesta', $validated['id_encuesta'])
                ->delete();

            // Insertar las nuevas respuestas
            $toInsert = [];
            foreach ($request->respuestas as $resp) {
                $toInsert[] = [
                    'id_encuesta' => $validated['id_encuesta'],
                    'id_pregunta' => $resp['id_pregunta'],
                    'id_opcion' => $resp['id_opcion'],
                    'id_alumno' => $idAlumno,
                    'created_at' => now(),
                ];
            }
            Respuesta::insert($toInsert);

            // Marcar la encuesta como respondida
            $asignacion->update([
                'respondida' => true,
                'fecha_respuesta' => now()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Encuesta respondida exitosamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al guardar las respuestas: ' . $e->getMessage()
            ], 500);
        }
    }

    // Obtener estadísticas de una encuesta
    public function estadisticas($id_encuesta)
    {
        $encuesta = Encuesta::with(['preguntas.opciones'])->findOrFail($id_encuesta);
        $stats = [];
        foreach ($encuesta->preguntas as $pregunta) {
            $opcionesStats = [];
            foreach ($pregunta->opciones as $opcion) {
                $count = Respuesta::where('id_pregunta', $pregunta->id_pregunta)
                    ->where('id_opcion', $opcion->id_opcion)
                    ->count();
                $opcionesStats[] = [
                    'id_opcion' => $opcion->id_opcion,
                    'texto' => $opcion->texto,
                    'cantidad' => $count,
                ];
            }
            $total = array_sum(array_column($opcionesStats, 'cantidad'));
            foreach ($opcionesStats as &$opStat) {
                $opStat['porcentaje'] = $total > 0 ? round($opStat['cantidad'] * 100 / $total, 2) : 0;
            }
            $stats[] = [
                'id_pregunta' => $pregunta->id_pregunta,
                'texto' => $pregunta->texto,
                'opciones' => $opcionesStats,
                'total_respuestas' => $total,
            ];
        }
        return response()->json(['success' => true, 'estadisticas' => $stats]);
    }

    // Asignar encuesta a alumnos específicos
    public function asignarAAlumnos(Request $request)
    {
        $validated = $request->validate([
            'id_encuesta' => 'required|integer|exists:encuesta,id_encuesta',
            'alumnos' => 'required|array|min:1',
            'alumnos.*' => 'integer|exists:alumno,id_alumno',
        ]);

        $asignaciones = [];
        foreach ($validated['alumnos'] as $id_alumno) {
            $asignaciones[] = [
                'id_encuesta' => $validated['id_encuesta'],
                'id_alumno' => $id_alumno,
                'fecha_asignacion' => now(),
                'notificado' => false,
                'respondida' => false,
            ];
        }

        AlumnoEncuesta::insertOrIgnore($asignaciones);

        return response()->json([
            'success' => true,
            'message' => 'Encuesta asignada a ' . count($validated['alumnos']) . ' alumnos'
        ]);
    }

    // Asignar encuesta a todos los alumnos de una carrera
    public function asignarACarrera(Request $request)
    {
        $validated = $request->validate([
            'id_encuesta' => 'required|integer|exists:encuesta,id_encuesta',
            'id_carrera' => 'required|integer|exists:carrera,id_carrera',
        ]);

        // Obtener todos los alumnos de la carrera
        $alumnos = AlumnoCarrera::where('id_carrera', $validated['id_carrera'])
            ->pluck('id_alumno')
            ->toArray();

        if (empty($alumnos)) {
            return response()->json([
                'success' => false,
                'message' => 'No hay alumnos en la carrera especificada'
            ], 400);
        }

        $asignaciones = [];
        foreach ($alumnos as $id_alumno) {
            $asignaciones[] = [
                'id_encuesta' => $validated['id_encuesta'],
                'id_alumno' => $id_alumno,
                'fecha_asignacion' => now(),
                'notificado' => false,
                'respondida' => false,
            ];
        }

        AlumnoEncuesta::insertOrIgnore($asignaciones);

        return response()->json([
            'success' => true,
            'message' => 'Encuesta asignada a ' . count($alumnos) . ' alumnos de la carrera'
        ]);
    }

    // Asignar encuesta a alumnos filtrados por carrera, grado y/o materia
    public function asignarFiltrado(Request $request)
    {
        $validated = $request->validate([
            'id_encuesta' => 'required|integer|exists:encuesta,id_encuesta',
            'id_carrera' => 'nullable|integer|exists:carrera,id_carrera',
            'id_grado' => 'nullable|integer|exists:grado,id_grado',
            'id_uc' => 'nullable|integer|exists:unidad_curricular,id_uc',
        ]);

        // Si la encuesta es global (id_carrera null), buscar todos los alumnos
        if (empty($validated['id_carrera'])) {
            $alumnos = \App\Models\Alumno::pluck('id_alumno')->toArray();
        } else {
            $query = \App\Models\AlumnoCarrera::where('id_carrera', $validated['id_carrera']);
            $alumnos = $query->pluck('id_alumno')->toArray();
        }
        $alumnosFiltrados = $alumnos;
        if ($request->filled('id_grado')) {
            $alumnosGrado = \App\Models\AlumnoGrado::where('id_grado', $validated['id_grado'])->pluck('id_alumno')->toArray();
            $alumnosFiltrados = array_intersect($alumnosFiltrados, $alumnosGrado);
        }
        if ($request->filled('id_uc')) {
            $alumnosUc = \App\Models\AlumnoUc::where('id_uc', $validated['id_uc'])->pluck('id_alumno')->toArray();
            $alumnosFiltrados = array_intersect($alumnosFiltrados, $alumnosUc);
        }
        if (empty($alumnosFiltrados)) {
            return response()->json([
                'success' => false,
                'message' => 'No hay alumnos que cumplan con los filtros.'
            ], 400);
        }
        $asignaciones = [];
        foreach ($alumnosFiltrados as $id_alumno) {
            $asignaciones[] = [
                'id_encuesta' => $validated['id_encuesta'],
                'id_alumno' => $id_alumno,
                'fecha_asignacion' => now(),
                'notificado' => false,
                'respondida' => false,
            ];
        }
        \App\Models\AlumnoEncuesta::insertOrIgnore($asignaciones);
        return response()->json([
            'success' => true,
            'message' => 'Encuesta asignada a ' . count($alumnosFiltrados) . ' alumnos filtrados.'
        ]);
    }

    // Obtener encuestas asignadas al alumno autenticado
    public function encuestasAsignadas(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $id_alumno = $user->id_alumno ?? $user->id ?? null;
        if (!$id_alumno) {
            return response()->json(['error' => 'No se pudo determinar el alumno'], 400);
        }

        $encuestas = AlumnoEncuesta::with(['encuesta.preguntas.opciones'])
            ->where('id_alumno', $id_alumno)
            ->whereHas('encuesta', function ($query) {
                $query->where('activa', true);
            })
            ->get()
            ->map(function ($alumnoEncuesta) {
                return [
                    'id_encuesta' => $alumnoEncuesta->encuesta->id_encuesta,
                    'titulo' => $alumnoEncuesta->encuesta->titulo,
                    'descripcion' => $alumnoEncuesta->encuesta->descripcion,
                    'fecha_inicio' => $alumnoEncuesta->encuesta->fecha_inicio,
                    'fecha_fin' => $alumnoEncuesta->encuesta->fecha_fin,
                    'preguntas' => $alumnoEncuesta->encuesta->preguntas,
                    'fecha_asignacion' => $alumnoEncuesta->fecha_asignacion,
                    'notificado' => $alumnoEncuesta->notificado,
                    'respondida' => $alumnoEncuesta->respondida,
                    'fecha_respuesta' => $alumnoEncuesta->fecha_respuesta,
                ];
            });

        return response()->json([
            'success' => true,
            'encuestas' => $encuestas
        ]);
    }

    // Marcar encuesta como notificada
    public function marcarNotificada(Request $request)
    {
        $validated = $request->validate([
            'id_encuesta' => 'required|integer|exists:encuesta,id_encuesta',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $id_alumno = $user->id_alumno ?? $user->id ?? null;
        if (!$id_alumno) {
            return response()->json(['error' => 'No se pudo determinar el alumno'], 400);
        }

        AlumnoEncuesta::where('id_alumno', $id_alumno)
            ->where('id_encuesta', $validated['id_encuesta'])
            ->update(['notificado' => true]);

        return response()->json(['success' => true]);
    }
} 