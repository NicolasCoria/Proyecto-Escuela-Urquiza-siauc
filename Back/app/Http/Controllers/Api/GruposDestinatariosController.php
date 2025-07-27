<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GruposDestinatarios;
use App\Models\Alumno;
use App\Models\Carrera;
use App\Models\Grado;
use App\Models\UnidadCurricular;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Administrador; // Added this import

class GruposDestinatariosController extends Controller
{
    /**
     * Listar todos los grupos de destinatarios
     */
    public function index()
    {
        try {
            $grupos = GruposDestinatarios::with(['admin', 'alumnos'])
                ->activos()
                ->orderBy('nombre')
                ->get()
                ->map(function($grupo) {
                    return [
                        'id_grupo' => $grupo->id_grupo,
                        'nombre' => $grupo->nombre,
                        'descripcion' => $grupo->descripcion,
                        'admin_creador' => $grupo->admin->nombre . ' ' . $grupo->admin->apellido,
                        'fecha_creacion' => $grupo->fecha_creacion->format('d/m/Y H:i'),
                        'cantidad_alumnos' => $grupo->cantidad_alumnos,
                        'activo' => $grupo->activo
                    ];
                });

            return response()->json([
                'success' => true,
                'grupos' => $grupos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener grupos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un grupo específico con sus alumnos
     */
    public function show($id_grupo)
    {
        try {
            $grupo = GruposDestinatarios::with(['admin', 'alumnos'])
                ->find($id_grupo);

            if (!$grupo) {
                return response()->json([
                    'success' => false,
                    'error' => 'Grupo no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'grupo' => [
                    'id_grupo' => $grupo->id_grupo,
                    'nombre' => $grupo->nombre,
                    'descripcion' => $grupo->descripcion,
                    'admin_creador' => $grupo->admin->nombre . ' ' . $grupo->admin->apellido,
                    'fecha_creacion' => $grupo->fecha_creacion->format('d/m/Y H:i'),
                    'cantidad_alumnos' => $grupo->cantidad_alumnos,
                    'alumnos' => $grupo->alumnos->map(function($alumno) {
                        return [
                            'id_alumno' => $alumno->id_alumno,
                            'nombre' => $alumno->nombre,
                            'apellido' => $alumno->apellido,
                            'email' => $alumno->email,
                            'fecha_agregado' => $alumno->pivot->fecha_agregado->format('d/m/Y H:i')
                        ];
                    }),
                    'activo' => $grupo->activo
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener grupo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un nuevo grupo de destinatarios
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:100|unique:grupos_destinatarios,nombre',
                'descripcion' => 'nullable|string|max:500',
                'alumnos' => 'required|array|min:1',
                'alumnos.*' => 'integer|exists:alumno,id_alumno'
            ]);

            // Obtener el primer administrador disponible o crear uno por defecto
            $admin = Administrador::first();
            if (!$admin) {
                return response()->json([
                    'success' => false,
                    'error' => 'No hay administradores disponibles en el sistema'
                ], 400);
            }

            DB::beginTransaction();

            // Crear el grupo
            $grupo = GruposDestinatarios::create([
                'nombre' => $validated['nombre'],
                'descripcion' => $validated['descripcion'],
                'id_admin_creador' => $admin->id_admin,
                'activo' => true
            ]);

            // Asignar alumnos al grupo
            $grupo->alumnos()->attach($validated['alumnos']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Grupo creado correctamente',
                'grupo' => [
                    'id_grupo' => $grupo->id_grupo,
                    'nombre' => $grupo->nombre,
                    'cantidad_alumnos' => count($validated['alumnos'])
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Error al crear grupo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un grupo de destinatarios
     */
    public function update(Request $request, $id_grupo)
    {
        try {
            $grupo = GruposDestinatarios::find($id_grupo);

            if (!$grupo) {
                return response()->json([
                    'success' => false,
                    'error' => 'Grupo no encontrado'
                ], 404);
            }

            $validated = $request->validate([
                'nombre' => 'required|string|max:100|unique:grupos_destinatarios,nombre,' . $id_grupo . ',id_grupo',
                'descripcion' => 'nullable|string|max:500',
                'alumnos' => 'required|array|min:1',
                'alumnos.*' => 'integer|exists:alumno,id_alumno',
                'activo' => 'boolean'
            ]);

            DB::beginTransaction();

            // Actualizar el grupo
            $grupo->update([
                'nombre' => $validated['nombre'],
                'descripcion' => $validated['descripcion'],
                'activo' => $validated['activo'] ?? true
            ]);

            // Sincronizar alumnos (reemplaza todos los existentes)
            $grupo->alumnos()->sync($validated['alumnos']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Grupo actualizado correctamente',
                'grupo' => [
                    'id_grupo' => $grupo->id_grupo,
                    'nombre' => $grupo->nombre,
                    'cantidad_alumnos' => count($validated['alumnos'])
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Error al actualizar grupo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un grupo de destinatarios (soft delete)
     */
    public function destroy($id_grupo)
    {
        try {
            $grupo = GruposDestinatarios::find($id_grupo);

            if (!$grupo) {
                return response()->json([
                    'success' => false,
                    'error' => 'Grupo no encontrado'
                ], 404);
            }

            // Verificar si el grupo está siendo usado en asignaciones de encuestas
            $tieneAsignaciones = DB::table('alumno_encuesta')
                ->whereIn('id_alumno', $grupo->alumnos->pluck('id_alumno'))
                ->exists();

            if ($tieneAsignaciones) {
                return response()->json([
                    'success' => false,
                    'error' => 'No se puede eliminar el grupo porque tiene alumnos con encuestas asignadas'
                ], 400);
            }

            // Soft delete - marcar como inactivo
            $grupo->update(['activo' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Grupo eliminado correctamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al eliminar grupo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener datos para crear/editar grupos (carreras, grados, materias)
     */
    public function getDatosCreacion()
    {
        try {
            // ✅ OPTIMIZACIÓN: Usar caché para datos que no cambian frecuentemente
            $carreras = \Cache::remember('carreras_list', 3600, function () {
                return Carrera::select(['id_carrera', 'carrera'])
                    ->orderBy('carrera')
                    ->get();
            });

            $grados = \Cache::remember('grados_list', 3600, function () {
                return Grado::select(['id_grado', 'grado', 'division', 'detalle'])
                    ->orderBy('grado')
                    ->orderBy('division')
                    ->get()
                    ->map(function($grado) {
                        $grado->display_text = $grado->grado . '-' . $grado->division . '°';
                        return $grado;
                    });
            });

            $materias = \Cache::remember('materias_list', 3600, function () {
                return UnidadCurricular::select(['id_uc', 'unidad_curricular'])
                    ->orderBy('unidad_curricular')
                    ->get();
            });

            return response()->json([
                'success' => true,
                'datos' => [
                    'carreras' => $carreras,
                    'grados' => $grados,
                    'materias' => $materias
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener datos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Filtrar alumnos según criterios (para agregar al grupo)
     */
    public function filtrarAlumnos(Request $request)
    {
        try {
            $validated = $request->validate([
                'id_carreras' => 'nullable|array',
                'id_carreras.*' => 'integer|exists:carrera,id_carrera',
                'id_grados' => 'nullable|array',
                'id_grados.*' => 'integer|exists:grado,id_grado',
                'id_ucs' => 'nullable|array',
                'id_ucs.*' => 'integer|exists:unidad_curricular,id_uc'
            ]);

            // ✅ OPTIMIZACIÓN: Usar JOINs en lugar de whereHas para mejor rendimiento
            $query = DB::table('alumno as a')
                ->select([
                    'a.id_alumno',
                    'a.nombre',
                    'a.apellido',
                    'a.email'
                ]);

            // Aplicar filtros con JOINs optimizados
            if (!empty($validated['id_carreras'])) {
                $query->join('alumno_carrera as ac', 'a.id_alumno', '=', 'ac.id_alumno')
                      ->whereIn('ac.id_carrera', $validated['id_carreras']);
            }

            if (!empty($validated['id_grados'])) {
                $query->join('alumno_grado as ag', 'a.id_alumno', '=', 'ag.id_alumno')
                      ->whereIn('ag.id_grado', $validated['id_grados']);
            }

            if (!empty($validated['id_ucs'])) {
                $query->join('alumno_uc as auc', 'a.id_alumno', '=', 'auc.id_alumno')
                      ->whereIn('auc.id_uc', $validated['id_ucs']);
            }

            // ✅ OPTIMIZACIÓN: Usar distinct para evitar duplicados
            $alumnos = $query->distinct()->get();

            // ✅ OPTIMIZACIÓN: Cargar relaciones solo para los alumnos filtrados
            $alumnoIds = $alumnos->pluck('id_alumno');
            
            if ($alumnoIds->isNotEmpty()) {
                // Cargar carreras
                $carreras = DB::table('alumno_carrera as ac')
                    ->join('carrera as c', 'ac.id_carrera', '=', 'c.id_carrera')
                    ->whereIn('ac.id_alumno', $alumnoIds)
                    ->select(['ac.id_alumno', 'c.carrera'])
                    ->get()
                    ->groupBy('id_alumno');

                // Cargar grados
                $grados = DB::table('alumno_grado as ag')
                    ->join('grado as g', 'ag.id_grado', '=', 'g.id_grado')
                    ->whereIn('ag.id_alumno', $alumnoIds)
                    ->select(['ag.id_alumno', 'g.grado', 'g.division'])
                    ->get()
                    ->groupBy('id_alumno');

                // Mapear resultados
                $alumnos = $alumnos->map(function($alumno) use ($carreras, $grados) {
                    $carrerasAlumno = $carreras->get($alumno->id_alumno, collect())->pluck('carrera')->join(', ');
                    $gradosAlumno = $grados->get($alumno->id_alumno, collect())->map(function($g) {
                        return $g->grado . '-' . $g->division . '°';
                    })->join(', ');

                    return [
                        'id_alumno' => $alumno->id_alumno,
                        'nombre' => $alumno->nombre,
                        'apellido' => $alumno->apellido,
                        'email' => $alumno->email,
                        'carreras' => $carrerasAlumno,
                        'grados' => $gradosAlumno
                    ];
                });
            }

            return response()->json([
                'success' => true,
                'alumnos' => $alumnos,
                'total' => $alumnos->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al filtrar alumnos: ' . $e->getMessage()
            ], 500);
        }
    }
}
