<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Alumno;
use App\Models\Carrera;
use App\Models\UnidadCurricular;
use App\Models\Inscripcion;
use Carbon\Carbon;

class InformeController extends Controller
{
    /**
     * Obtener todas las plantillas de informes disponibles
     */
    public function getPlantillas()
    {
        $plantillas = [
            [
                'id' => 1,
                'nombre' => 'Informe de Alumnos por Carrera',
                'descripcion' => 'Lista de alumnos organizados por carrera',
                'filtros_disponibles' => ['carrera', 'grado', 'estado_inscripcion']
            ],
            [
                'id' => 2,
                'nombre' => 'Informe de Inscripciones por Período',
                'descripcion' => 'Inscripciones realizadas en un período específico',
                'filtros_disponibles' => ['fecha_desde', 'fecha_hasta', 'carrera', 'unidad_curricular']
            ],
            [
                'id' => 3,
                'nombre' => 'Informe de Rendimiento Académico',
                'descripcion' => 'Rendimiento de alumnos por materia',
                'filtros_disponibles' => ['carrera', 'unidad_curricular', 'promedio_minimo']
            ],
            [
                'id' => 4,
                'nombre' => 'Informe de Asistencia',
                'descripcion' => 'Asistencia de alumnos por materia',
                'filtros_disponibles' => ['carrera', 'unidad_curricular', 'porcentaje_asistencia']
            ],
            [
                'id' => 5,
                'nombre' => 'Informe de Solicitudes',
                'descripcion' => 'Volumen y estadísticas de solicitudes recibidas',
                'filtros_disponibles' => ['fecha_desde', 'fecha_hasta', 'categoria', 'estado']
            ]
        ];

        return response()->json([
            'success' => true,
            'plantillas' => $plantillas
        ]);
    }

    /**
     * Obtener filtros disponibles para una plantilla específica
     */
    public function getFiltrosPlantilla(Request $request)
    {
        $plantillaId = (int) $request->input('plantilla_id');
        
        $filtros = [];
        
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
                ->get();
        });

        $materias = \Cache::remember('materias_list', 3600, function () {
            return UnidadCurricular::select(['id_uc', 'Unidad_Curricular'])
                ->orderBy('Unidad_Curricular')
                ->get();
        });
        
        switch ($plantillaId) {
            case 1: // Informe de Alumnos por Carrera
                $filtros = [
                    'carrera' => [
                        'tipo' => 'select',
                        'label' => 'Carrera',
                        'opciones' => $carreras->map(function($c) {
                            return ['value' => $c->id_carrera, 'label' => $c->carrera];
                        })
                    ],
                    'grado' => [
                        'tipo' => 'select',
                        'label' => 'Año (Grado)',
                        'opciones' => collect([
                            ['value' => 'todos', 'label' => 'Todos los años']
                        ])->merge($grados->map(function($g) {
                            return ['value' => $g->id_grado, 'label' => $g->grado . '-' . $g->division . '°'];
                        }))
                    ],
                    'estado_inscripcion' => [
                        'tipo' => 'select',
                        'label' => 'Estado de Inscripción',
                        'opciones' => [
                            ['value' => 'activa', 'label' => 'Activa'],
                            ['value' => 'inactiva', 'label' => 'Inactiva'],
                            ['value' => 'pendiente', 'label' => 'Pendiente']
                        ]
                    ]
                ];
                break;
                
            case 2: // Informe de Inscripciones por Período
                $filtros = [
                    'fecha_desde' => [
                        'tipo' => 'date',
                        'label' => 'Fecha Desde'
                    ],
                    'fecha_hasta' => [
                        'tipo' => 'date',
                        'label' => 'Fecha Hasta'
                    ],
                    'carrera' => [
                        'tipo' => 'select',
                        'label' => 'Carrera',
                        'opciones' => $carreras->map(function($c) {
                            return ['value' => $c->id_carrera, 'label' => $c->carrera];
                        })
                    ],
                    'unidad_curricular' => [
                        'tipo' => 'select',
                        'label' => 'Unidad Curricular',
                        'opciones' => $materias->map(function($uc) {
                            return ['value' => $uc->id_uc, 'label' => $uc->unidad_curricular];
                        })
                    ]
                ];
                break;
                
            case 3: // Informe de Rendimiento Académico
                $filtros = [
                    'carrera' => [
                        'tipo' => 'select',
                        'label' => 'Carrera',
                        'opciones' => $carreras->map(function($c) {
                            return ['value' => $c->id_carrera, 'label' => $c->carrera];
                        })
                    ],
                    'unidad_curricular' => [
                        'tipo' => 'select',
                        'label' => 'Unidad Curricular',
                        'opciones' => $materias->map(function($uc) {
                            return ['value' => $uc->id_uc, 'label' => $uc->unidad_curricular];
                        })
                    ],
                    'promedio_minimo' => [
                        'tipo' => 'number',
                        'label' => 'Promedio Mínimo',
                        'min' => 0,
                        'max' => 10,
                        'step' => 0.1
                    ]
                ];
                break;
                
            case 4: // Informe de Asistencia
                $filtros = [
                    'carrera' => [
                        'tipo' => 'select',
                        'label' => 'Carrera',
                        'opciones' => $carreras->map(function($c) {
                            return ['value' => $c->id_carrera, 'label' => $c->carrera];
                        })
                    ],
                    'unidad_curricular' => [
                        'tipo' => 'select',
                        'label' => 'Unidad Curricular',
                        'opciones' => $materias->map(function($uc) {
                            return ['value' => $uc->id_uc, 'label' => $uc->unidad_curricular];
                        })
                    ],
                    'porcentaje_asistencia' => [
                        'tipo' => 'number',
                        'label' => 'Porcentaje Mínimo de Asistencia',
                        'min' => 0,
                        'max' => 100,
                        'step' => 1
                    ]
                ];
                break;
                
            case 5: // Informe de Solicitudes
                $filtros = [
                    'fecha_desde' => [
                        'tipo' => 'date',
                        'label' => 'Fecha Desde'
                    ],
                    'fecha_hasta' => [
                        'tipo' => 'date',
                        'label' => 'Fecha Hasta'
                    ],
                    'categoria' => [
                        'tipo' => 'select',
                        'label' => 'Categoría',
                        'opciones' => [
                            ['value' => 'general', 'label' => 'General'],
                            ['value' => 'certificado', 'label' => 'Certificado'],
                            ['value' => 'homologacion_interna', 'label' => 'Homologación Interna'],
                            ['value' => 'homologacion_externa', 'label' => 'Homologación Externa']
                        ]
                    ],
                    'estado' => [
                        'tipo' => 'select',
                        'label' => 'Estado',
                        'opciones' => [
                            ['value' => 'pendiente', 'label' => 'Pendiente'],
                            ['value' => 'en_proceso', 'label' => 'En Proceso'],
                            ['value' => 'respondida', 'label' => 'Respondida'],
                            ['value' => 'rechazada', 'label' => 'Rechazada']
                        ]
                    ]
                ];
                break;
        }

        return response()->json([
            'success' => true,
            'filtros' => $filtros
        ]);
    }

    /**
     * Generar informe basado en plantilla y filtros
     */
    public function generarInforme(Request $request)
    {
        $validated = $request->validate([
            'plantilla_id' => 'required|integer',
            'filtros' => 'array',
            'formato' => 'required|in:pdf,excel,csv'
        ]);

        $plantillaId = $validated['plantilla_id'];
        $filtros = $validated['filtros'] ?? [];
        $formato = $validated['formato'];

        $datos = $this->obtenerDatosInforme($plantillaId, $filtros);

        if ($formato === 'pdf') {
            return $this->generarPDF($datos, $plantillaId);
        } elseif ($formato === 'excel') {
            return $this->generarExcel($datos, $plantillaId);
        } else {
            return $this->generarCSV($datos, $plantillaId);
        }
    }

    /**
     * Obtener datos según la plantilla y filtros
     */
    private function obtenerDatosInforme($plantillaId, $filtros)
    {
        switch ($plantillaId) {
            case 1: // Informe de Alumnos por Carrera
                return $this->obtenerAlumnosPorCarrera($filtros);
                
            case 2: // Informe de Inscripciones por Período
                return $this->obtenerInscripcionesPorPeriodo($filtros);
                
            case 3: // Informe de Rendimiento Académico
                return $this->obtenerRendimientoAcademico($filtros);
                
            case 4: // Informe de Asistencia
                return $this->obtenerAsistencia($filtros);
                
            case 5: // Informe de Solicitudes
                return $this->obtenerSolicitudes($filtros);
                
            default:
                return [];
        }
    }

    /**
     * Obtener alumnos por carrera
     */
    private function obtenerAlumnosPorCarrera($filtros)
    {
        $query = Alumno::with(['carreras', 'grados'])
            ->join('alumno_carrera', 'alumno.id_alumno', '=', 'alumno_carrera.id_alumno')
            ->join('carrera', 'alumno_carrera.id_carrera', '=', 'carrera.id_carrera');

        if (isset($filtros['carrera'])) {
            $query->where('carrera.id_carrera', $filtros['carrera']);
        }

        if (isset($filtros['grado'])) {
            $query->join('alumno_grado', 'alumno.id_alumno', '=', 'alumno_grado.id_alumno')
                  ->where('alumno_grado.id_grado', $filtros['grado']);
        }

        return $query->select(
            'alumno.id_alumno',
            'alumno.nombre',
            'alumno.apellido',
            'alumno.dni',
            'alumno.email',
            'carrera.carrera as nombre_carrera'
        )->get()->map(function($item) {
            return [
                'ID' => $item->id_alumno,
                'Nombre' => $item->nombre,
                'Apellido' => $item->apellido,
                'DNI' => $item->dni,
                'Email' => $item->email,
                'Carrera' => $item->nombre_carrera,
            ];
        })->toArray();
    }

    /**
     * Obtener inscripciones por período
     */
    private function obtenerInscripcionesPorPeriodo($filtros)
    {
        $query = \DB::table('inscripcion')
            ->join('alumno', 'inscripcion.id_alumno', '=', 'alumno.id_alumno')
            ->join('carrera', 'inscripcion.id_carrera', '=', 'carrera.id_carrera');

        if (isset($filtros['fecha_desde'])) {
            $query->where('inscripcion.FechaHora', '>=', $filtros['fecha_desde'] . ' 00:00:00');
        }

        if (isset($filtros['fecha_hasta'])) {
            $query->where('inscripcion.FechaHora', '<=', $filtros['fecha_hasta'] . ' 23:59:59');
        }

        if (isset($filtros['carrera'])) {
            $query->where('inscripcion.id_carrera', $filtros['carrera']);
        }

        if (isset($filtros['unidad_curricular'])) {
            $query->where('inscripcion.id_uc', $filtros['unidad_curricular']);
        }

        return $query->select(
            'inscripcion.id_inscripcion',
            'alumno.nombre as nombre_alumno',
            'alumno.apellido as apellido_alumno',
            'carrera.carrera as nombre_carrera',
            'inscripcion.FechaHora',
            'inscripcion.id_uc',
            'inscripcion.id_grado'
        )->get();
    }

    /**
     * Obtener rendimiento académico
     */
    private function obtenerRendimientoAcademico($filtros)
    {
        $query = \DB::table('nota')
            ->join('alumno', 'nota.id_alumno', '=', 'alumno.id_alumno')
            ->join('unidad_curricular', 'nota.id_uc', '=', 'unidad_curricular.id_uc');

        if (isset($filtros['carrera'])) {
            $query->join('alumno_carrera', 'alumno.id_alumno', '=', 'alumno_carrera.id_alumno')
                  ->join('carrera', 'alumno_carrera.id_carrera', '=', 'carrera.id_carrera')
                  ->where('carrera.id_carrera', $filtros['carrera']);
        }

        if (isset($filtros['unidad_curricular'])) {
            $query->where('unidad_curricular.id_uc', $filtros['unidad_curricular']);
        }

        if (isset($filtros['promedio_minimo'])) {
            $query->where('nota.nota', '>=', $filtros['promedio_minimo']);
        }

        return $query->select(
            'alumno.nombre as nombre_alumno',
            'alumno.apellido as apellido_alumno',
            'unidad_curricular.unidad_curricular as nombre_uc',
            'nota.nota',
            'nota.fecha',
            'nota.tipo',
            'nota.observaciones'
        )->get();
    }

    /**
     * Obtener asistencia
     */
    private function obtenerAsistencia($filtros)
    {
        $query = \DB::table('asistencia')
            ->join('alumno', 'asistencia.id_alumno', '=', 'alumno.id_alumno')
            ->join('unidad_curricular', 'asistencia.id_uc', '=', 'unidad_curricular.id_uc');

        if (isset($filtros['carrera'])) {
            $query->join('alumno_carrera', 'alumno.id_alumno', '=', 'alumno_carrera.id_alumno')
                  ->join('carrera', 'alumno_carrera.id_carrera', '=', 'carrera.id_carrera')
                  ->where('carrera.id_carrera', $filtros['carrera']);
        }

        if (isset($filtros['unidad_curricular'])) {
            $query->where('unidad_curricular.id_uc', $filtros['unidad_curricular']);
        }

        return $query->select(
            'alumno.nombre as nombre_alumno',
            'alumno.apellido as apellido_alumno',
            'unidad_curricular.unidad_curricular as nombre_uc',
            'asistencia.asistencia',
            'asistencia.fecha'
        )->get();
    }

    /**
     * Obtener datos de solicitudes
     */
    private function obtenerSolicitudes($filtros)
    {
        $query = \DB::table('solicitudes')
            ->join('alumno', 'solicitudes.id_alumno', '=', 'alumno.id_alumno');

        // Aplicar filtros
        if (isset($filtros['fecha_desde'])) {
            $query->where('solicitudes.fecha_creacion', '>=', $filtros['fecha_desde']);
        }

        if (isset($filtros['fecha_hasta'])) {
            $query->where('solicitudes.fecha_creacion', '<=', $filtros['fecha_hasta'] . ' 23:59:59');
        }

        if (isset($filtros['categoria'])) {
            $query->where('solicitudes.categoria', $filtros['categoria']);
        }

        if (isset($filtros['estado'])) {
            $query->where('solicitudes.estado', $filtros['estado']);
        }

        // Obtener datos detallados
        $solicitudes = $query->select(
            'solicitudes.id',
            'solicitudes.categoria',
            'solicitudes.asunto',
            'solicitudes.estado',
            'solicitudes.fecha_creacion',
            'solicitudes.fecha_respuesta',
            'alumno.nombre as nombre_alumno',
            'alumno.apellido as apellido_alumno',
            'alumno.dni as dni_alumno'
        )->get();

        // Calcular estadísticas
        $estadisticas = [
            'total_solicitudes' => $solicitudes->count(),
            'por_categoria' => $solicitudes->groupBy('categoria')->map->count(),
            'por_estado' => $solicitudes->groupBy('estado')->map->count(),
            'tiempo_promedio_respuesta' => $this->calcularTiempoPromedioRespuesta($solicitudes),
            'tiempo_minimo_respuesta' => $this->calcularTiempoMinimoRespuesta($solicitudes),
            'tiempo_maximo_respuesta' => $this->calcularTiempoMaximoRespuesta($solicitudes)
        ];

        return [
            'solicitudes' => $solicitudes,
            'estadisticas' => $estadisticas
        ];
    }

    /**
     * Calcular tiempo promedio de respuesta
     */
    private function calcularTiempoPromedioRespuesta($solicitudes)
    {
        $solicitudesRespondidas = $solicitudes->filter(function($solicitud) {
            return $solicitud->fecha_respuesta && in_array($solicitud->estado, ['respondida', 'rechazada']);
        });

        if ($solicitudesRespondidas->isEmpty()) {
            return 0;
        }

        $tiempos = $solicitudesRespondidas->map(function($solicitud) {
            $creacion = \Carbon\Carbon::parse($solicitud->fecha_creacion);
            $respuesta = \Carbon\Carbon::parse($solicitud->fecha_respuesta);
            return $creacion->diffInHours($respuesta);
        });

        return round($tiempos->avg(), 2);
    }

    /**
     * Calcular tiempo mínimo de respuesta
     */
    private function calcularTiempoMinimoRespuesta($solicitudes)
    {
        $solicitudesRespondidas = $solicitudes->filter(function($solicitud) {
            return $solicitud->fecha_respuesta && in_array($solicitud->estado, ['respondida', 'rechazada']);
        });

        if ($solicitudesRespondidas->isEmpty()) {
            return 0;
        }

        $tiempos = $solicitudesRespondidas->map(function($solicitud) {
            $creacion = \Carbon\Carbon::parse($solicitud->fecha_creacion);
            $respuesta = \Carbon\Carbon::parse($solicitud->fecha_respuesta);
            return $creacion->diffInHours($respuesta);
        });

        return $tiempos->min();
    }

    /**
     * Calcular tiempo máximo de respuesta
     */
    private function calcularTiempoMaximoRespuesta($solicitudes)
    {
        $solicitudesRespondidas = $solicitudes->filter(function($solicitud) {
            return $solicitud->fecha_respuesta && in_array($solicitud->estado, ['respondida', 'rechazada']);
        });

        if ($solicitudesRespondidas->isEmpty()) {
            return 0;
        }

        $tiempos = $solicitudesRespondidas->map(function($solicitud) {
            $creacion = \Carbon\Carbon::parse($solicitud->fecha_creacion);
            $respuesta = \Carbon\Carbon::parse($solicitud->fecha_respuesta);
            return $creacion->diffInHours($respuesta);
        });

        return $tiempos->max();
    }

    /**
     * Generar PDF
     */
    private function generarPDF($datos, $plantillaId)
    {
        $plantillas = [
            1 => 'Informe de Alumnos por Carrera',
            2 => 'Informe de Inscripciones por Período',
            3 => 'Informe de Rendimiento Académico',
            4 => 'Informe de Asistencia',
            5 => 'Informe de Solicitudes'
        ];

        $titulo = $plantillas[$plantillaId] ?? 'Informe';

        // Para el informe de solicitudes, usar una vista especial
        if ($plantillaId == 5) {
            $pdf = PDF::loadView('informes.solicitudes', [
                'datos' => $datos,
                'titulo' => $titulo,
                'fecha_generacion' => now()->format('d/m/Y H:i:s')
            ]);
        } else {
            $pdf = PDF::loadView('informes.pdf', [
                'datos' => $datos,
                'titulo' => $titulo,
                'fecha_generacion' => now()->format('d/m/Y H:i:s')
            ]);
        }

        return $pdf->download('informe_' . $plantillaId . '_' . now()->format('Y-m-d_H-i-s') . '.pdf');
    }

    /**
     * Generar Excel (placeholder)
     */
    private function generarExcel($datos, $plantillaId)
    {
        // Aquí se implementaría la generación de Excel
        // Por ahora retornamos un JSON
        return response()->json([
            'success' => true,
            'mensaje' => 'Funcionalidad de Excel en desarrollo',
            'datos' => $datos
        ]);
    }

    /**
     * Generar CSV
     */
    private function generarCSV($datos, $plantillaId)
    {
        $filename = 'informe_' . $plantillaId . '_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($datos, $plantillaId) {
            $file = fopen('php://output', 'w');
            
            if ($plantillaId == 5) {
                // Formato especial para solicitudes
                $this->generarCSVSolicitudes($file, $datos);
            } else {
                // Formato estándar para otros informes
                if (!empty($datos)) {
                    // Headers
                    fputcsv($file, array_keys((array) $datos[0]));
                    
                    // Data
                    foreach ($datos as $row) {
                        fputcsv($file, (array) $row);
                    }
                }
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Generar CSV específico para solicitudes
     */
    private function generarCSVSolicitudes($file, $datos)
    {
        // Escribir estadísticas
        fputcsv($file, ['ESTADÍSTICAS DE SOLICITUDES']);
        fputcsv($file, ['']);
        fputcsv($file, ['Total de Solicitudes', $datos['estadisticas']['total_solicitudes']]);
        fputcsv($file, ['Tiempo Promedio de Respuesta (horas)', $datos['estadisticas']['tiempo_promedio_respuesta']]);
        fputcsv($file, ['Tiempo Mínimo de Respuesta (horas)', $datos['estadisticas']['tiempo_minimo_respuesta']]);
        fputcsv($file, ['Tiempo Máximo de Respuesta (horas)', $datos['estadisticas']['tiempo_maximo_respuesta']]);
        fputcsv($file, ['']);
        
        // Solicitudes por categoría
        fputcsv($file, ['SOLICITUDES POR CATEGORÍA']);
        foreach ($datos['estadisticas']['por_categoria'] as $categoria => $cantidad) {
            fputcsv($file, [ucfirst(str_replace('_', ' ', $categoria)), $cantidad]);
        }
        fputcsv($file, ['']);
        
        // Solicitudes por estado
        fputcsv($file, ['SOLICITUDES POR ESTADO']);
        foreach ($datos['estadisticas']['por_estado'] as $estado => $cantidad) {
            fputcsv($file, [ucfirst(str_replace('_', ' ', $estado)), $cantidad]);
        }
        fputcsv($file, ['']);
        
        // Detalle de solicitudes
        fputcsv($file, ['DETALLE DE SOLICITUDES']);
        fputcsv($file, ['ID', 'Alumno', 'DNI', 'Categoría', 'Asunto', 'Estado', 'Fecha Creación', 'Fecha Respuesta', 'Tiempo Respuesta (horas)']);
        
        foreach ($datos['solicitudes'] as $solicitud) {
            $tiempoRespuesta = '-';
            if ($solicitud->fecha_respuesta && in_array($solicitud->estado, ['respondida', 'rechazada'])) {
                $creacion = Carbon::parse($solicitud->fecha_creacion);
                $respuesta = Carbon::parse($solicitud->fecha_respuesta);
                $tiempoRespuesta = $creacion->diffInHours($respuesta);
            }
            
            fputcsv($file, [
                $solicitud->id,
                $solicitud->nombre_alumno . ' ' . $solicitud->apellido_alumno,
                $solicitud->dni_alumno,
                ucfirst(str_replace('_', ' ', $solicitud->categoria)),
                $solicitud->asunto,
                ucfirst(str_replace('_', ' ', $solicitud->estado)),
                Carbon::parse($solicitud->fecha_creacion)->format('d/m/Y H:i'),
                $solicitud->fecha_respuesta ? Carbon::parse($solicitud->fecha_respuesta)->format('d/m/Y H:i') : '-',
                $tiempoRespuesta
            ]);
        }
    }

    /**
     * Obtener plantillas personalizadas del usuario
     */
    public function getMisPlantillas()
    {
        try {
            $plantillas = \App\Models\PlantillaInforme::where('admin_id', auth()->id())->get();
            
            return response()->json([
                'success' => true,
                'plantillas' => $plantillas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener plantillas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva plantilla personalizada
     */
    public function storePlantilla(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'campos' => 'required|array',
                'descripcion' => 'nullable|string'
            ]);

            $plantilla = \App\Models\PlantillaInforme::create([
                'nombre' => $validated['nombre'],
                'campos_configurables' => $validated['campos'],
                'descripcion' => $validated['descripcion'] ?? '',
                'admin_id' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'plantilla' => $plantilla
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al crear plantilla: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar plantilla personalizada
     */
    public function updatePlantilla(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'campos' => 'required|array',
                'descripcion' => 'nullable|string'
            ]);

            $plantilla = \App\Models\PlantillaInforme::where('id', $id)
                ->where('admin_id', auth()->id())
                ->firstOrFail();

            $plantilla->update([
                'nombre' => $validated['nombre'],
                'campos_configurables' => $validated['campos'],
                'descripcion' => $validated['descripcion'] ?? ''
            ]);

            return response()->json([
                'success' => true,
                'plantilla' => $plantilla
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al actualizar plantilla: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar plantilla personalizada
     */
    public function destroyPlantilla($id)
    {
        try {
            $plantilla = \App\Models\PlantillaInforme::where('id', $id)
                ->where('admin_id', auth()->id())
                ->firstOrFail();

            $plantilla->delete();

            return response()->json([
                'success' => true,
                'message' => 'Plantilla eliminada correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al eliminar plantilla: ' . $e->getMessage()
            ], 500);
        }
    }
} 