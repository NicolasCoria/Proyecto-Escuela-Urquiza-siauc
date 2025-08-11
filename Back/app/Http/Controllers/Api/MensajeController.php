<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Mensaje;
use App\Models\DestinatarioMensaje;
use App\Models\Alumno;
use App\Models\Carrera;
use App\Models\Grado;
use App\Models\UnidadCurricular;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Administrador;

class MensajeController extends Controller
{
    /**
     * Listar todos los mensajes enviados
     */
    public function index()
    {
        try {
            $mensajes = Mensaje::with(['admin_creador', 'destinatarios.alumno'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function($mensaje) {
                    return [
                        'id_mensaje' => $mensaje->id_mensaje,
                        'titulo' => $mensaje->titulo,
                        'contenido' => $mensaje->contenido,
                        'admin_creador' => $mensaje->admin_creador->nombre . ' ' . $mensaje->admin_creador->apellido,
                        'fecha_envio' => $mensaje->created_at->format('d/m/Y H:i'),
                        'cantidad_destinatarios' => $mensaje->destinatarios->count(),
                        'leido_por' => $mensaje->destinatarios->where('leido', true)->count(),
                        'prioridad' => $mensaje->prioridad
                    ];
                });

            return response()->json([
                'success' => true,
                'mensajes' => $mensajes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener mensajes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un mensaje específico con sus destinatarios
     */
    public function show($id_mensaje)
    {
        try {
            $mensaje = Mensaje::with(['admin_creador', 'destinatarios.alumno'])
                ->find($id_mensaje);

            if (!$mensaje) {
                return response()->json([
                    'success' => false,
                    'error' => 'Mensaje no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'mensaje' => [
                    'id_mensaje' => $mensaje->id_mensaje,
                    'titulo' => $mensaje->titulo,
                    'contenido' => $mensaje->contenido,
                    'admin_creador' => $mensaje->admin_creador->nombre . ' ' . $mensaje->admin_creador->apellido,
                    'fecha_envio' => $mensaje->created_at->format('d/m/Y H:i'),
                    'prioridad' => $mensaje->prioridad,
                    'destinatarios' => $mensaje->destinatarios->map(function($destinatario) {
                        return [
                            'id_alumno' => $destinatario->alumno->id_alumno,
                            'nombre' => $destinatario->alumno->nombre,
                            'apellido' => $destinatario->alumno->apellido,
                            'email' => $destinatario->alumno->email,
                            'leido' => $destinatario->leido,
                            'fecha_lectura' => $destinatario->fecha_lectura ? $destinatario->fecha_lectura->format('d/m/Y H:i') : null
                        ];
                    })
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener mensaje: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un nuevo mensaje
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'titulo' => 'required|string|max:200',
                'contenido' => 'required|string|max:2000',
                'prioridad' => 'required|in:baja,media,alta,urgente',
                'destinatarios' => 'required|array|min:1',
                'destinatarios.*' => 'integer|exists:alumno,id_alumno'
            ]);

            // Obtener el administrador autenticado
            $admin = Auth::user();
            if (!$admin || !$admin->id_admin) {
                return response()->json([
                    'success' => false,
                    'error' => 'No se pudo determinar el administrador'
                ], 400);
            }

            DB::beginTransaction();

            // Crear el mensaje
            $mensaje = Mensaje::create([
                'titulo' => $validated['titulo'],
                'contenido' => $validated['contenido'],
                'prioridad' => $validated['prioridad'],
                'id_admin_creador' => $admin->id_admin
            ]);

            // Asignar destinatarios al mensaje
            $destinatarios = [];
            foreach ($validated['destinatarios'] as $id_alumno) {
                $destinatarios[] = [
                    'id_mensaje' => $mensaje->id_mensaje,
                    'id_alumno' => $id_alumno,
                    'leido' => false,
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }
            
            DestinatarioMensaje::insert($destinatarios);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Mensaje enviado correctamente',
                'mensaje' => [
                    'id_mensaje' => $mensaje->id_mensaje,
                    'titulo' => $mensaje->titulo,
                    'cantidad_destinatarios' => count($validated['destinatarios'])
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Error al enviar mensaje: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un mensaje
     */
    public function update(Request $request, $id_mensaje)
    {
        try {
            $mensaje = Mensaje::find($id_mensaje);

            if (!$mensaje) {
                return response()->json([
                    'success' => false,
                    'error' => 'Mensaje no encontrado'
                ], 404);
            }

            $validated = $request->validate([
                'titulo' => 'required|string|max:200',
                'contenido' => 'required|string|max:2000',
                'prioridad' => 'required|in:baja,media,alta,urgente',
                'destinatarios' => 'required|array|min:1',
                'destinatarios.*' => 'integer|exists:alumno,id_alumno'
            ]);

            DB::beginTransaction();

            // Actualizar el mensaje
            $mensaje->update([
                'titulo' => $validated['titulo'],
                'contenido' => $validated['contenido'],
                'prioridad' => $validated['prioridad']
            ]);

            // Sincronizar destinatarios (reemplaza todos los existentes)
            $mensaje->destinatarios()->delete();
            
            $destinatarios = [];
            foreach ($validated['destinatarios'] as $id_alumno) {
                $destinatarios[] = [
                    'id_mensaje' => $mensaje->id_mensaje,
                    'id_alumno' => $id_alumno,
                    'leido' => false,
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }
            
            DestinatarioMensaje::insert($destinatarios);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Mensaje actualizado correctamente',
                'mensaje' => [
                    'id_mensaje' => $mensaje->id_mensaje,
                    'titulo' => $mensaje->titulo,
                    'cantidad_destinatarios' => count($validated['destinatarios'])
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Error al actualizar mensaje: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un mensaje
     */
    public function destroy($id_mensaje)
    {
        try {
            $mensaje = Mensaje::find($id_mensaje);

            if (!$mensaje) {
                return response()->json([
                    'success' => false,
                    'error' => 'Mensaje no encontrado'
                ], 404);
            }

            DB::beginTransaction();

            // Eliminar destinatarios primero
            $mensaje->destinatarios()->delete();
            
            // Eliminar el mensaje
            $mensaje->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Mensaje eliminado correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Error al eliminar mensaje: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener datos para crear/editar mensajes (carreras, grados, materias)
     */
    public function getDatosCreacion()
    {
        try {
            // Usar caché para datos que no cambian frecuentemente
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
     * Filtrar alumnos según criterios (para agregar como destinatarios)
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

            // Usar JOINs en lugar de whereHas para mejor rendimiento
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

            // Usar distinct para evitar duplicados
            $alumnos = $query->distinct()->get();

            // Cargar relaciones solo para los alumnos filtrados
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

    /**
     * Obtener alumnos de grupos específicos
     */
    public function obtenerAlumnosDeGrupos(Request $request)
    {
        try {
            $validated = $request->validate([
                'grupos' => 'required|array|min:1',
                'grupos.*' => 'integer|exists:grupos_destinatarios,id_grupo'
            ]);

            // Obtener todos los alumnos de los grupos seleccionados
            $alumnosIds = DB::table('grupo_destinatario_alumno')
                ->whereIn('id_grupo', $validated['grupos'])
                ->pluck('id_alumno')
                ->unique()
                ->toArray();

            if (empty($alumnosIds)) {
                return response()->json([
                    'success' => true,
                    'alumnos' => [],
                    'total' => 0
                ]);
            }

            // Obtener información completa de los alumnos
            $alumnos = DB::table('alumno as a')
                ->select([
                    'a.id_alumno',
                    'a.nombre',
                    'a.apellido',
                    'a.email'
                ])
                ->whereIn('a.id_alumno', $alumnosIds)
                ->orderBy('a.apellido')
                ->orderBy('a.nombre')
                ->get();

            return response()->json([
                'success' => true,
                'alumnos' => $alumnos,
                'total' => $alumnos->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener alumnos de grupos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enviar mensaje a grupos de destinatarios
     */
    public function enviarAGrupos(Request $request)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:200',
            'contenido' => 'required|string|max:2000',
            'prioridad' => 'required|in:baja,media,alta,urgente',
            'grupos' => 'required|array|min:1',
            'grupos.*' => 'integer|exists:grupos_destinatarios,id_grupo'
        ]);

        try {
            DB::beginTransaction();

            // Obtener el administrador autenticado
            $admin = Auth::user();
            if (!$admin || !$admin->id_admin) {
                return response()->json([
                    'success' => false,
                    'error' => 'No se pudo determinar el administrador'
                ], 400);
            }

            // Crear el mensaje
            $mensaje = Mensaje::create([
                'titulo' => $validated['titulo'],
                'contenido' => $validated['contenido'],
                'prioridad' => $validated['prioridad'],
                'id_admin_creador' => $admin->id_admin
            ]);

            $alumnosAsignados = [];
            $totalAsignados = 0;

            foreach ($validated['grupos'] as $idGrupo) {
                // Obtener alumnos del grupo
                $alumnosGrupo = DB::table('grupo_destinatario_alumno')
                    ->where('id_grupo', $idGrupo)
                    ->pluck('id_alumno')
                    ->toArray();
                
                foreach ($alumnosGrupo as $idAlumno) {
                    // Verificar si ya está asignado
                    $yaAsignado = DestinatarioMensaje::where('id_alumno', $idAlumno)
                        ->where('id_mensaje', $mensaje->id_mensaje)
                        ->exists();

                    if (!$yaAsignado) {
                        DestinatarioMensaje::create([
                            'id_alumno' => $idAlumno,
                            'id_mensaje' => $mensaje->id_mensaje,
                            'leido' => false
                        ]);
                        $totalAsignados++;
                    }
                    $alumnosAsignados[] = $idAlumno;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Mensaje enviado a {$totalAsignados} alumno(s) de los grupos seleccionados",
                'total_asignados' => $totalAsignados,
                'total_alumnos_grupos' => count(array_unique($alumnosAsignados))
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Error al enviar mensaje a grupos: ' . $e->getMessage()
            ], 500);
        }
    }
}