<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PeriodoInscripcion;
use App\Models\Carrera;
use App\Models\Grado;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class PeriodoInscripcionController extends Controller
{
    // Listar todos los períodos de inscripción
    public function index()
    {
        $periodos = PeriodoInscripcion::with(['carrera', 'grado'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'periodos' => $periodos
        ]);
    }

    // Crear un nuevo período de inscripción
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_periodo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'required|date|after_or_equal:today',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'activo' => 'boolean',
            'id_carrera' => 'nullable|exists:carrera,id_carrera',
            'id_grado' => 'nullable|exists:grado,id_grado'
        ]);

        $periodo = PeriodoInscripcion::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Período de inscripción creado exitosamente',
            'periodo' => $periodo->load(['carrera', 'grado'])
        ], 201);
    }

    // Actualizar un período de inscripción
    public function update(Request $request, $id)
    {
        $periodo = PeriodoInscripcion::findOrFail($id);

        $validated = $request->validate([
            'nombre_periodo' => 'sometimes|required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'sometimes|required|date|after_or_equal:today',
            'fecha_fin' => 'sometimes|required|date|after:fecha_inicio',
            'activo' => 'sometimes|boolean',
            'id_carrera' => 'nullable|exists:carrera,id_carrera',
            'id_grado' => 'nullable|exists:grado,id_grado'
        ]);

        $periodo->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Período de inscripción actualizado exitosamente',
            'periodo' => $periodo->load(['carrera', 'grado'])
        ]);
    }

    // Eliminar un período de inscripción
    public function destroy($id)
    {
        $periodo = PeriodoInscripcion::findOrFail($id);
        $periodo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Período de inscripción eliminado exitosamente'
        ]);
    }

    // Activar/Desactivar un período
    public function toggleActivo($id)
    {
        $periodo = PeriodoInscripcion::findOrFail($id);
        $periodo->activo = !$periodo->activo;
        $periodo->save();

        return response()->json([
            'success' => true,
            'message' => $periodo->activo ? 'Período activado' : 'Período desactivado',
            'periodo' => $periodo->load(['carrera', 'grado'])
        ]);
    }

    // Obtener datos para el formulario
    public function getDatosCreacion()
    {
        $carreras = Carrera::all();
        $grados = Grado::all();

        return response()->json([
            'success' => true,
            'carreras' => $carreras,
            'grados' => $grados
        ]);
    }

    // Verificar si hay períodos activos para un alumno específico
    public function verificarPeriodoActivo(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $id_alumno = $user->id_alumno ?? $user->id ?? null;
        if (!$id_alumno) {
            return response()->json(['error' => 'No se pudo determinar el alumno'], 400);
        }

        // Obtener carrera y grado del alumno
        $alumnoCarrera = \App\Models\AlumnoCarrera::where('id_alumno', $id_alumno)->first();
        $alumnoGrado = \App\Models\AlumnoGrado::where('id_alumno', $id_alumno)->first();

        $id_carrera = $alumnoCarrera ? $alumnoCarrera->id_carrera : null;
        $id_grado = $alumnoGrado ? $alumnoGrado->id_grado : null;

        // Buscar períodos activos que apliquen para este alumno (cache 60s)
        $cacheKey = "alumno:{$id_alumno}:periodos_activos";
        $periodosActivos = Cache::remember($cacheKey, 60, function () use ($id_carrera, $id_grado) {
            return PeriodoInscripcion::where('activo', true)
                ->where('fecha_inicio', '<=', Carbon::now())
                ->where('fecha_fin', '>=', Carbon::now())
                ->where(function($query) use ($id_carrera, $id_grado) {
                    $query->where(function($q) use ($id_carrera) {
                        $q->whereNull('id_carrera')->orWhere('id_carrera', $id_carrera);
                    })->where(function($q) use ($id_grado) {
                        $q->whereNull('id_grado')->orWhere('id_grado', $id_grado);
                    });
                })
                ->get();
        });

        if ($periodosActivos->isEmpty()) {
            return response()->json([
                'success' => false,
                'inscripcion_habilitada' => false,
                'message' => 'No hay períodos de inscripción activos en este momento'
            ]);
        }

        return response()->json([
            'success' => true,
            'inscripcion_habilitada' => true,
            'periodos_activos' => $periodosActivos,
            'message' => 'Período de inscripción activo'
        ]);
    }
} 