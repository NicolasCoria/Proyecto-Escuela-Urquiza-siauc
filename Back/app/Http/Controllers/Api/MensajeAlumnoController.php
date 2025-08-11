<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DestinatarioMensaje;
use App\Models\Mensaje;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class MensajeAlumnoController extends Controller
{
    /**
     * Obtener todos los mensajes del alumno autenticado
     */
    public function index()
    {
        try {
            $start = microtime(true);
            $user = Auth::user();
            
            if (!$user) {
                Log::error('MensajeAlumnoController - No hay usuario autenticado');
                return response()->json(['error' => 'No autenticado'], 401);
            }

            $id_alumno = $user->id_alumno ?? $user->id ?? null;
            
            if (!$id_alumno) {
                Log::error('MensajeAlumnoController - No se pudo determinar el ID del alumno');
                return response()->json(['error' => 'No se pudo determinar el alumno'], 400);
            }

            // Verificar si las tablas existen
            try {
                $cacheKey = "alumno:{$id_alumno}:mensajes";
                $mensajesFormateados = Cache::remember($cacheKey, 60, function () use ($id_alumno) {
                    $mensajes = DestinatarioMensaje::with(['mensaje.admin_creador'])
                        ->where('id_alumno', $id_alumno)
                        ->orderBy('created_at', 'desc')
                        ->get();

                    return $mensajes->map(function ($destinatario) {
                        return [
                            'id_mensaje' => $destinatario->mensaje->id_mensaje,
                            'titulo' => $destinatario->mensaje->titulo,
                            'contenido' => $destinatario->mensaje->contenido,
                            'prioridad' => $destinatario->mensaje->prioridad,
                            'admin_creador' => $destinatario->mensaje->admin_creador->nombre . ' ' . $destinatario->mensaje->admin_creador->apellido,
                            'fecha_envio' => $destinatario->mensaje->created_at->format('d/m/Y H:i'),
                            'leido' => $destinatario->leido,
                            'fecha_lectura' => $destinatario->fecha_lectura ? $destinatario->fecha_lectura->format('d/m/Y H:i') : null,
                            'tiempo_desde_lectura' => $destinatario->getTiempoDesdeLectura()
                        ];
                    });
                });

                Log::info('MensajeAlumnoController@index', [
                    'id_alumno' => $id_alumno,
                    'count' => $mensajesFormateados->count(),
                    'duration_ms' => round((microtime(true) - $start) * 1000, 2)
                ]);

                return response()->json([
                    'success' => true,
                    'mensajes' => $mensajesFormateados
                ]);

            } catch (\Exception $e) {
                Log::error('MensajeAlumnoController - Error al consultar mensajes:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                // Verificar si es un error de tabla no existente
                if (str_contains($e->getMessage(), "doesn't exist") || str_contains($e->getMessage(), "Table")) {
                    return response()->json([
                        'success' => false,
                        'error' => 'Las tablas de mensajes no están creadas. Ejecute el SQL de configuración.',
                        'debug' => 'Tabla no encontrada'
                    ], 500);
                }
                
                return response()->json([
                    'success' => false,
                    'error' => 'Error al obtener mensajes: ' . $e->getMessage()
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('MensajeAlumnoController - Error general:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener mensajes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un mensaje específico del alumno
     */
    public function show($id_mensaje)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'No autenticado'], 401);
            }

            $id_alumno = $user->id_alumno ?? $user->id ?? null;
            if (!$id_alumno) {
                return response()->json(['error' => 'No se pudo determinar el alumno'], 400);
            }

            $destinatario = DestinatarioMensaje::with(['mensaje.admin_creador'])
                ->where('id_mensaje', $id_mensaje)
                ->where('id_alumno', $id_alumno)
                ->first();

            if (!$destinatario) {
                return response()->json([
                    'success' => false,
                    'error' => 'Mensaje no encontrado'
                ], 404);
            }

            // Marcar como leído si no lo está
            if (!$destinatario->leido) {
                $destinatario->marcarComoLeido();
            }

            return response()->json([
                'success' => true,
                'mensaje' => [
                    'id_mensaje' => $destinatario->mensaje->id_mensaje,
                    'titulo' => $destinatario->mensaje->titulo,
                    'contenido' => $destinatario->mensaje->contenido,
                    'prioridad' => $destinatario->mensaje->prioridad,
                    'admin_creador' => $destinatario->mensaje->admin_creador->nombre . ' ' . $destinatario->mensaje->admin_creador->apellido,
                    'fecha_envio' => $destinatario->mensaje->created_at->format('d/m/Y H:i'),
                    'leido' => $destinatario->leido,
                    'fecha_lectura' => $destinatario->fecha_lectura ? $destinatario->fecha_lectura->format('d/m/Y H:i') : null,
                    'tiempo_desde_lectura' => $destinatario->getTiempoDesdeLectura()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('MensajeAlumnoController - Error al obtener mensaje:', [
                'error' => $e->getMessage(),
                'id_mensaje' => $id_mensaje
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener mensaje: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marcar mensaje como leído
     */
    public function marcarComoLeido($id_mensaje)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'No autenticado'], 401);
            }

            $id_alumno = $user->id_alumno ?? $user->id ?? null;
            if (!$id_alumno) {
                return response()->json(['error' => 'No se pudo determinar el alumno'], 400);
            }

            $destinatario = DestinatarioMensaje::where('id_mensaje', $id_mensaje)
                ->where('id_alumno', $id_alumno)
                ->first();

            if (!$destinatario) {
                return response()->json([
                    'success' => false,
                    'error' => 'Mensaje no encontrado'
                ], 404);
            }

            $destinatario->marcarComoLeido();

            return response()->json([
                'success' => true,
                'message' => 'Mensaje marcado como leído'
            ]);

        } catch (\Exception $e) {
            Log::error('MensajeAlumnoController - Error al marcar mensaje:', [
                'error' => $e->getMessage(),
                'id_mensaje' => $id_mensaje
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Error al marcar mensaje: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de mensajes del alumno
     */
    public function estadisticas()
    {
        try {
            $start = microtime(true);
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'No autenticado'], 401);
            }

            $id_alumno = $user->id_alumno ?? $user->id ?? null;
            if (!$id_alumno) {
                return response()->json(['error' => 'No se pudo determinar el alumno'], 400);
            }

            $cacheKey = "alumno:{$id_alumno}:mensajes_estadisticas";
            $stats = Cache::remember($cacheKey, 60, function () use ($id_alumno) {
                $totalMensajes = DestinatarioMensaje::where('id_alumno', $id_alumno)->count();
                $mensajesLeidos = DestinatarioMensaje::where('id_alumno', $id_alumno)
                    ->where('leido', true)
                    ->count();
                $mensajesNoLeidos = $totalMensajes - $mensajesLeidos;

                // Mensajes por prioridad
                $mensajesPorPrioridad = DestinatarioMensaje::join('mensajes', 'destinatarios_mensaje.id_mensaje', '=', 'mensajes.id_mensaje')
                    ->where('destinatarios_mensaje.id_alumno', $id_alumno)
                    ->selectRaw('mensajes.prioridad, COUNT(*) as cantidad')
                    ->groupBy('mensajes.prioridad')
                    ->get()
                    ->keyBy('prioridad');

                return [
                    'total_mensajes' => $totalMensajes,
                    'mensajes_leidos' => $mensajesLeidos,
                    'mensajes_no_leidos' => $mensajesNoLeidos,
                    'por_prioridad' => [
                        'urgente' => $mensajesPorPrioridad->get('urgente', (object)['cantidad' => 0])->cantidad,
                        'alta' => $mensajesPorPrioridad->get('alta', (object)['cantidad' => 0])->cantidad,
                        'media' => $mensajesPorPrioridad->get('media', (object)['cantidad' => 0])->cantidad,
                        'baja' => $mensajesPorPrioridad->get('baja', (object)['cantidad' => 0])->cantidad,
                    ]
                ];
            });

            Log::info('MensajeAlumnoController@estadisticas', [
                'id_alumno' => $id_alumno,
                'duration_ms' => round((microtime(true) - $start) * 1000, 2)
            ]);

            return response()->json([
                'success' => true,
                'estadisticas' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('MensajeAlumnoController - Error al obtener estadísticas:', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marcar todos los mensajes como leídos
     */
    public function marcarTodosComoLeidos()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'No autenticado'], 401);
            }

            $id_alumno = $user->id_alumno ?? $user->id ?? null;
            if (!$id_alumno) {
                return response()->json(['error' => 'No se pudo determinar el alumno'], 400);
            }

            $mensajesActualizados = DestinatarioMensaje::where('id_alumno', $id_alumno)
                ->where('leido', false)
                ->update([
                    'leido' => true,
                    'fecha_lectura' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => "Se marcaron {$mensajesActualizados} mensajes como leídos"
            ]);

        } catch (\Exception $e) {
            Log::error('MensajeAlumnoController - Error al marcar mensajes:', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Error al marcar mensajes: ' . $e->getMessage()
            ], 500);
        }
    }
} 