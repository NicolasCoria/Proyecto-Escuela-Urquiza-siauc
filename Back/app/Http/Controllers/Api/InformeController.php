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
        
        switch ($plantillaId) {
            case 1: // Informe de Alumnos por Carrera
                $filtros = [
                    'carrera' => [
                        'tipo' => 'select',
                        'label' => 'Carrera',
                        'opciones' => Carrera::select('id_carrera', 'carrera')->get()->map(function($c) {
                            return ['value' => $c->id_carrera, 'label' => $c->carrera];
                        })
                    ],
                    'grado' => [
                        'tipo' => 'select',
                        'label' => 'Grado',
                        'opciones' => [
                            ['value' => 1, 'label' => 'Primer Año'],
                            ['value' => 2, 'label' => 'Segundo Año'],
                            ['value' => 3, 'label' => 'Tercer Año'],
                            ['value' => 4, 'label' => 'Cuarto Año']
                        ]
                    ],
                    'estado_inscripcion' => [
                        'tipo' => 'select',
                        'label' => 'Estado de Inscripción',
                        'opciones' => [
                            ['value' => 'activo', 'label' => 'Activo'],
                            ['value' => 'inactivo', 'label' => 'Inactivo']
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
                        'opciones' => Carrera::select('id_carrera', 'carrera')->get()->map(function($c) {
                            return ['value' => $c->id_carrera, 'label' => $c->carrera];
                        })
                    ],
                    'unidad_curricular' => [
                        'tipo' => 'select',
                        'label' => 'Unidad Curricular',
                        'opciones' => UnidadCurricular::select('id_uc', 'Unidad_Curricular')->get()->map(function($uc) {
                            return ['value' => $uc->id_uc, 'label' => $uc->Unidad_Curricular];
                        })
                    ]
                ];
                break;
                
            case 3: // Informe de Rendimiento Académico
                $filtros = [
                    'carrera' => [
                        'tipo' => 'select',
                        'label' => 'Carrera',
                        'opciones' => Carrera::select('id_carrera', 'carrera')->get()->map(function($c) {
                            return ['value' => $c->id_carrera, 'label' => $c->carrera];
                        })
                    ],
                    'unidad_curricular' => [
                        'tipo' => 'select',
                        'label' => 'Unidad Curricular',
                        'opciones' => UnidadCurricular::select('id_uc', 'Unidad_Curricular')->get()->map(function($uc) {
                            return ['value' => $uc->id_uc, 'label' => $uc->Unidad_Curricular];
                        })
                    ],
                    'promedio_minimo' => [
                        'tipo' => 'number',
                        'label' => 'Promedio Mínimo',
                        'min' => 1,
                        'max' => 10
                    ]
                ];
                break;
                
            case 4: // Informe de Asistencia
                $filtros = [
                    'carrera' => [
                        'tipo' => 'select',
                        'label' => 'Carrera',
                        'opciones' => Carrera::select('id_carrera', 'carrera')->get()->map(function($c) {
                            return ['value' => $c->id_carrera, 'label' => $c->carrera];
                        })
                    ],
                    'unidad_curricular' => [
                        'tipo' => 'select',
                        'label' => 'Unidad Curricular',
                        'opciones' => UnidadCurricular::select('id_uc', 'Unidad_Curricular')->get()->map(function($uc) {
                            return ['value' => $uc->id_uc, 'label' => $uc->Unidad_Curricular];
                        })
                    ],
                    'porcentaje_asistencia' => [
                        'tipo' => 'number',
                        'label' => 'Porcentaje Mínimo de Asistencia',
                        'min' => 0,
                        'max' => 100
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
     * Generar PDF
     */
    private function generarPDF($datos, $plantillaId)
    {
        $plantillas = [
            1 => 'Informe de Alumnos por Carrera',
            2 => 'Informe de Inscripciones por Período',
            3 => 'Informe de Rendimiento Académico',
            4 => 'Informe de Asistencia'
        ];

        $titulo = $plantillas[$plantillaId] ?? 'Informe';

        $pdf = PDF::loadView('informes.pdf', [
            'datos' => $datos,
            'titulo' => $titulo,
            'fecha_generacion' => now()->format('d/m/Y H:i:s')
        ]);

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

        $callback = function() use ($datos) {
            $file = fopen('php://output', 'w');
            
            if (!empty($datos)) {
                // Headers
                fputcsv($file, array_keys((array) $datos[0]));
                
                // Data
                foreach ($datos as $row) {
                    fputcsv($file, (array) $row);
                }
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
} 