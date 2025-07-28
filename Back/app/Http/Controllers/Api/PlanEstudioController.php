<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Alumno;
use App\Models\Carrera;
use App\Models\PlanEstudio;

class PlanEstudioController extends Controller
{
    /**
     * Obtener el plan de estudios completo de la carrera del alumno
     */
    public function getPlanEstudioAlumno(Request $request)
    {
        try {
            $alumno = $request->user();
            
            // Obtener la carrera del alumno
            $carrera = $alumno->carreras()->first();
            
            if (!$carrera) {
                return response()->json([
                    'success' => false,
                    'message' => 'El alumno no está inscrito en ninguna carrera'
                ], 404);
            }

            // Obtener el plan de estudios completo de la carrera usando la estructura existente
            $planEstudio = DB::table('carrera_uc as cu')
                ->join('unidad_curricular as uc', 'cu.id_uc', '=', 'uc.id_uc')
                ->join('grado_uc as gu', 'uc.id_uc', '=', 'gu.id_uc')
                ->join('grado as g', 'gu.id_grado', '=', 'g.id_grado')
                ->where('cu.id_carrera', $carrera->id_carrera)
                ->select(
                    'g.grado as anio',
                    'uc.id_uc',
                    'uc.Unidad_Curricular as unidad_curricular',
                    'uc.Tipo as tipo',
                    'uc.HorasSem as horas_sem',
                    'uc.HorasAnual as horas_anual',
                    'uc.Formato as formato'
                )
                ->orderBy('g.grado', 'asc')
                ->orderBy('uc.id_uc', 'asc')
                ->get();

            // Organizar por años
            $planOrganizado = [];
            foreach ($planEstudio as $materia) {
                $anio = $materia->anio;
                if (!isset($planOrganizado[$anio])) {
                    $planOrganizado[$anio] = [];
                }
                
                $planOrganizado[$anio][] = [
                    'id_uc' => $materia->id_uc,
                    'unidad_curricular' => $materia->unidad_curricular,
                    'tipo' => $materia->tipo,
                    'horas_sem' => $materia->horas_sem,
                    'horas_anual' => $materia->horas_anual,
                    'formato' => $materia->formato,
                    'orden' => count($planOrganizado[$anio]) + 1,
                    'contenido' => $this->getContenidoMateria($materia->unidad_curricular)
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'carrera' => [
                        'id_carrera' => $carrera->id_carrera,
                        'nombre' => $carrera->carrera
                    ],
                    'plan_estudio' => $planOrganizado
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el plan de estudios: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener el plan de estudios de una carrera específica (para administradores)
     */
    public function getPlanEstudioCarrera(Request $request, $idCarrera)
    {
        try {
            // Verificar que la carrera existe
            $carrera = Carrera::find($idCarrera);
            
            if (!$carrera) {
                return response()->json([
                    'success' => false,
                    'message' => 'Carrera no encontrada'
                ], 404);
            }

            // Obtener el plan de estudios de la carrera usando la estructura existente
            $planEstudio = DB::table('carrera_uc as cu')
                ->join('unidad_curricular as uc', 'cu.id_uc', '=', 'uc.id_uc')
                ->join('grado_uc as gu', 'uc.id_uc', '=', 'gu.id_uc')
                ->join('grado as g', 'gu.id_grado', '=', 'g.id_grado')
                ->where('cu.id_carrera', $idCarrera)
                ->select(
                    'g.grado as anio',
                    'uc.id_uc',
                    'uc.Unidad_Curricular as unidad_curricular',
                    'uc.Tipo as tipo',
                    'uc.HorasSem as horas_sem',
                    'uc.HorasAnual as horas_anual',
                    'uc.Formato as formato'
                )
                ->orderBy('g.grado', 'asc')
                ->orderBy('uc.id_uc', 'asc')
                ->get();

            // Organizar por años
            $planOrganizado = [];
            foreach ($planEstudio as $materia) {
                $anio = $materia->anio;
                if (!isset($planOrganizado[$anio])) {
                    $planOrganizado[$anio] = [];
                }
                
                $planOrganizado[$anio][] = [
                    'id_uc' => $materia->id_uc,
                    'unidad_curricular' => $materia->unidad_curricular,
                    'tipo' => $materia->tipo,
                    'horas_sem' => $materia->horas_sem,
                    'horas_anual' => $materia->horas_anual,
                    'formato' => $materia->formato,
                    'orden' => count($planOrganizado[$anio]) + 1,
                    'contenido' => $this->getContenidoMateria($materia->unidad_curricular)
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'carrera' => [
                        'id_carrera' => $carrera->id_carrera,
                        'nombre' => $carrera->carrera
                    ],
                    'plan_estudio' => $planOrganizado
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el plan de estudios: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener resumen del plan de estudios (para el sidebar)
     */
    public function getResumenPlanEstudio(Request $request)
    {
        try {
            $alumno = $request->user();
            
            // Obtener la carrera del alumno
            $carrera = $alumno->carreras()->first();
            
            if (!$carrera) {
                return response()->json([
                    'success' => false,
                    'message' => 'El alumno no está inscrito en ninguna carrera'
                ], 404);
            }

            // Obtener solo el conteo de materias por año
            $resumen = DB::table('carrera_uc as cu')
                ->join('unidad_curricular as uc', 'cu.id_uc', '=', 'uc.id_uc')
                ->join('grado_uc as gu', 'uc.id_uc', '=', 'gu.id_uc')
                ->join('grado as g', 'gu.id_grado', '=', 'g.id_grado')
                ->where('cu.id_carrera', $carrera->id_carrera)
                ->select('g.grado as anio', DB::raw('COUNT(*) as total_materias'))
                ->groupBy('g.grado')
                ->orderBy('g.grado', 'asc')
                ->get();

            $totalMaterias = $resumen->sum('total_materias');

            return response()->json([
                'success' => true,
                'data' => [
                    'carrera' => [
                        'id_carrera' => $carrera->id_carrera,
                        'nombre' => $carrera->carrera
                    ],
                    'resumen' => [
                        'total_materias' => $totalMaterias,
                        'por_anio' => $resumen
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el resumen del plan de estudios: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener contenido de ejemplo para una materia
     */
    private function getContenidoMateria($nombreMateria)
    {
        $contenidos = [
            'Comunicación' => [
                'objetivos' => 'Desarrollar habilidades de comunicación efectiva en contextos profesionales',
                'unidades' => [
                    'Comunicación oral y escrita',
                    'Técnicas de presentación',
                    'Comunicación digital',
                    'Redacción técnica'
                ],
                'metodologia' => 'Clases teórico-prácticas con ejercicios de comunicación real'
            ],
            'UDI 1' => [
                'objetivos' => 'Integrar conocimientos de diferentes disciplinas en proyectos prácticos',
                'unidades' => [
                    'Metodología de proyectos',
                    'Trabajo en equipo',
                    'Resolución de problemas',
                    'Presentación de resultados'
                ],
                'metodologia' => 'Proyectos integradores con enfoque interdisciplinario'
            ],
            'Matemática' => [
                'objetivos' => 'Desarrollar pensamiento lógico-matemático aplicado a la informática',
                'unidades' => [
                    'Álgebra lineal',
                    'Cálculo diferencial',
                    'Estadística descriptiva',
                    'Matemática discreta'
                ],
                'metodologia' => 'Clases teóricas con ejercicios prácticos de aplicación'
            ],
            'Administración' => [
                'objetivos' => 'Comprender los principios básicos de la administración empresarial',
                'unidades' => [
                    'Introducción a la administración',
                    'Planificación estratégica',
                    'Organización y control',
                    'Gestión de recursos'
                ],
                'metodologia' => 'Casos de estudio y análisis de empresas reales'
            ],
            'Inglés Técnico 1' => [
                'objetivos' => 'Desarrollar competencias en inglés técnico para el ámbito informático',
                'unidades' => [
                    'Vocabulario técnico básico',
                    'Comprensión de manuales',
                    'Comunicación en inglés',
                    'Documentación técnica'
                ],
                'metodologia' => 'Práctica intensiva con material técnico real'
            ],
            'Tecnología de la Información' => [
                'objetivos' => 'Conocer las tecnologías fundamentales de la información',
                'unidades' => [
                    'Historia de la informática',
                    'Arquitectura de computadoras',
                    'Sistemas operativos básicos',
                    'Redes de datos'
                ],
                'metodologia' => 'Clases teóricas con demostraciones prácticas'
            ],
            'Lógica y Estructura de Datos' => [
                'objetivos' => 'Desarrollar pensamiento lógico y estructuras de datos',
                'unidades' => [
                    'Lógica proposicional',
                    'Algoritmos básicos',
                    'Estructuras de datos simples',
                    'Análisis de complejidad'
                ],
                'metodologia' => 'Programación práctica con ejercicios de lógica'
            ],
            'Ingeniería de Software 1' => [
                'objetivos' => 'Introducir conceptos fundamentales de ingeniería de software',
                'unidades' => [
                    'Ciclo de vida del software',
                    'Metodologías ágiles',
                    'Análisis de requisitos',
                    'Diseño de software'
                ],
                'metodologia' => 'Proyectos de desarrollo con metodologías ágiles'
            ],
            'Sistemas Operativos' => [
                'objetivos' => 'Comprender el funcionamiento de los sistemas operativos',
                'unidades' => [
                    'Arquitectura de sistemas operativos',
                    'Gestión de procesos',
                    'Gestión de memoria',
                    'Sistemas de archivos'
                ],
                'metodologia' => 'Práctica con diferentes sistemas operativos'
            ],
            'Problemáticas Socio Contemporáneas' => [
                'objetivos' => 'Analizar problemáticas sociales actuales desde una perspectiva crítica',
                'unidades' => [
                    'Globalización y tecnología',
                    'Desigualdades digitales',
                    'Ética en la tecnología',
                    'Impacto social de la informática'
                ],
                'metodologia' => 'Análisis de casos y debates grupales'
            ],
            'UDI 2' => [
                'objetivos' => 'Desarrollar proyectos integradores de segundo año',
                'unidades' => [
                    'Proyectos interdisciplinarios',
                    'Innovación tecnológica',
                    'Desarrollo sostenible',
                    'Presentación y defensa'
                ],
                'metodologia' => 'Proyectos reales con empresas o instituciones'
            ],
            'Estadística' => [
                'objetivos' => 'Aplicar métodos estadísticos en análisis de datos',
                'unidades' => [
                    'Estadística descriptiva',
                    'Probabilidad',
                    'Inferencia estadística',
                    'Análisis de datos'
                ],
                'metodologia' => 'Análisis de datos reales con software estadístico'
            ],
            'Innovación y Desarrollo Emprendedor' => [
                'objetivos' => 'Desarrollar habilidades emprendedoras e innovación',
                'unidades' => [
                    'Creatividad e innovación',
                    'Modelos de negocio',
                    'Planificación empresarial',
                    'Pitch de proyectos'
                ],
                'metodologia' => 'Desarrollo de ideas de negocio y presentaciones'
            ],
            'Práctica Profesionalizante 1' => [
                'objetivos' => 'Aplicar conocimientos en contextos profesionales reales',
                'unidades' => [
                    'Práctica en empresas',
                    'Desarrollo de proyectos reales',
                    'Trabajo en equipo profesional',
                    'Documentación de experiencias'
                ],
                'metodologia' => 'Prácticas profesionales supervisadas'
            ],
            'Inglés Técnico 2' => [
                'objetivos' => 'Profundizar en inglés técnico avanzado',
                'unidades' => [
                    'Inglés técnico avanzado',
                    'Documentación técnica compleja',
                    'Comunicación profesional',
                    'Certificaciones internacionales'
                ],
                'metodologia' => 'Preparación para certificaciones y práctica avanzada'
            ],
            'Programación 1' => [
                'objetivos' => 'Desarrollar habilidades de programación básica',
                'unidades' => [
                    'Fundamentos de programación',
                    'Estructuras de control',
                    'Funciones y procedimientos',
                    'Arrays y strings'
                ],
                'metodologia' => 'Programación práctica con ejercicios progresivos'
            ],
            'Ingeniería de Software 2' => [
                'objetivos' => 'Aplicar metodologías avanzadas de desarrollo',
                'unidades' => [
                    'Patrones de diseño',
                    'Arquitectura de software',
                    'Testing y calidad',
                    'DevOps básico'
                ],
                'metodologia' => 'Desarrollo de proyectos con metodologías avanzadas'
            ],
            'Bases de Datos 1' => [
                'objetivos' => 'Diseñar y gestionar bases de datos relacionales',
                'unidades' => [
                    'Modelo entidad-relación',
                    'Normalización',
                    'SQL básico',
                    'Administración de BD'
                ],
                'metodologia' => 'Diseño y desarrollo de bases de datos reales'
            ],
            'Ética y Responsabilidad Social' => [
                'objetivos' => 'Desarrollar conciencia ética en el ejercicio profesional',
                'unidades' => [
                    'Ética profesional',
                    'Responsabilidad social',
                    'Códigos de conducta',
                    'Casos éticos en tecnología'
                ],
                'metodologia' => 'Análisis de casos éticos y debates'
            ],
            'Derecho y Legislación laboral' => [
                'objetivos' => 'Conocer el marco legal del trabajo en tecnología',
                'unidades' => [
                    'Derecho laboral básico',
                    'Contratos de trabajo',
                    'Propiedad intelectual',
                    'Marco legal tecnológico'
                ],
                'metodologia' => 'Análisis de casos legales y normativas'
            ],
            'Práctica Profesionalizante 2' => [
                'objetivos' => 'Desarrollar proyectos profesionales complejos',
                'unidades' => [
                    'Proyectos empresariales',
                    'Gestión de equipos',
                    'Innovación tecnológica',
                    'Presentación final'
                ],
                'metodologia' => 'Proyectos reales con empresas del sector'
            ],
            'Redes y Comunicación' => [
                'objetivos' => 'Diseñar e implementar redes de comunicación',
                'unidades' => [
                    'Arquitectura de redes',
                    'Protocolos de comunicación',
                    'Seguridad en redes',
                    'Administración de redes'
                ],
                'metodologia' => 'Configuración y administración de redes reales'
            ],
            'Programación 2' => [
                'objetivos' => 'Desarrollar aplicaciones avanzadas',
                'unidades' => [
                    'Programación orientada a objetos',
                    'Estructuras de datos avanzadas',
                    'Interfaces gráficas',
                    'Conectividad y APIs'
                ],
                'metodologia' => 'Desarrollo de aplicaciones completas'
            ],
            'Gestión de Proyectos de Software' => [
                'objetivos' => 'Gestionar proyectos de desarrollo de software',
                'unidades' => [
                    'Metodologías de gestión',
                    'Planificación y control',
                    'Gestión de riesgos',
                    'Herramientas de gestión'
                ],
                'metodologia' => 'Simulación de gestión de proyectos reales'
            ],
            'Bases de Datos 2' => [
                'objetivos' => 'Implementar bases de datos avanzadas',
                'unidades' => [
                    'Bases de datos NoSQL',
                    'Optimización de consultas',
                    'Replicación y backup',
                    'Big Data básico'
                ],
                'metodologia' => 'Implementación de sistemas de BD avanzados'
            ]
        ];

        return $contenidos[$nombreMateria] ?? [
            'objetivos' => 'Desarrollar competencias específicas en el área de estudio',
            'unidades' => [
                'Contenido teórico fundamental',
                'Aplicaciones prácticas',
                'Desarrollo de proyectos',
                'Evaluación continua'
            ],
            'metodologia' => 'Enfoque teórico-práctico con proyectos integradores'
        ];
    }
} 