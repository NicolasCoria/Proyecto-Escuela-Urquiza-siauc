<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlanEstudioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Datos del plan de estudios según el JSON proporcionado
        $planesEstudio = [
            // Técnico Superior en Infraestructura de Tecnología de la Información
            [
                'id_carrera' => 3, // ITI
                'anio' => 1,
                'unidades_curriculares' => [
                    'Comunicación',
                    'UDI1',
                    'Matemática',
                    'FísicaAplicadaaLasTecnologíasDeLaInformación',
                    'Administración',
                    'InglésTécnico',
                    'ArquitecturaDeLasComputadoras',
                    'LógicaYProgramación',
                    'InfraestructuraDeRedes1'
                ]
            ],
            [
                'id_carrera' => 3, // ITI
                'anio' => 2,
                'unidades_curriculares' => [
                    'ProblemáticasSocioContemporáneas',
                    'UDI2',
                    'Estadística',
                    'InnovaciónYDesarrolloEmprendedor',
                    'SistemasOperativos',
                    'AlgoritmosYEstructuraDeDatos',
                    'BasesDeDatos',
                    'InfraestructuraDeRedes2',
                    'PrácticaProfesionalizante1'
                ]
            ],
            [
                'id_carrera' => 3, // ITI
                'anio' => 3,
                'unidades_curriculares' => [
                    'ÉticaYResponsabilidadSocial',
                    'DerechoYLegislaciónLaboral',
                    'AdministraciónDeBasesDeDatos',
                    'SeguridadDeLosSistemas',
                    'IntegridadYMigraciónDeDatos',
                    'AdministraciónDeSistemasOperativosYRedes',
                    'PrácticaProfesionalizante2'
                ]
            ],
            // Técnico Superior en Desarrollo de Software
            [
                'id_carrera' => 2, // DS
                'anio' => 1,
                'unidades_curriculares' => [
                    'Comunicación',
                    'UDI1',
                    'Matemática',
                    'InglésTécnico1',
                    'Administración',
                    'TecnologíaDeLaInformación',
                    'LógicaYEstructuraDeDatos',
                    'IngenieríaDeSoftware1',
                    'SistemasOperativos'
                ]
            ],
            [
                'id_carrera' => 2, // DS
                'anio' => 2,
                'unidades_curriculares' => [
                    'ProblemáticasSocioContemporáneas',
                    'UDI2',
                    'InglésTécnico2',
                    'InnovaciónYDesarrolloEmprendedor',
                    'Estadística',
                    'Programación1',
                    'IngenieríaDeSoftware2',
                    'BasesDeDatos1',
                    'PrácticaProfesionalizante1'
                ]
            ],
            [
                'id_carrera' => 2, // DS
                'anio' => 3,
                'unidades_curriculares' => [
                    'ÉticaYResponsabilidadSocial',
                    'DerechoYLegislaciónLaboral',
                    'RedesYComunicación',
                    'Programación2',
                    'GestiónDeProyectosDeSoftware',
                    'BasesDeDatos2',
                    'PrácticaProfesionalizante2'
                ]
            ],
            // Técnico Superior en Análisis Funcional de Sistemas Informáticos
            [
                'id_carrera' => 1, // AF
                'anio' => 1,
                'unidades_curriculares' => [
                    'Comunicación',
                    'UDI1',
                    'Matemática',
                    'InglésTécnico1',
                    'PsicosociologíaDeLasOrganizaciones',
                    'ModelosDeNegocios',
                    'ArquitecturaDeLasComputadoras',
                    'GestiónDeSoftware1',
                    'AnálisisDeSistemasOrganizacionales'
                ]
            ],
            [
                'id_carrera' => 1, // AF
                'anio' => 2,
                'unidades_curriculares' => [
                    'ProblemáticasSocioContemporáneas',
                    'UDI2',
                    'InglésTécnico2',
                    'Estadística',
                    'InnovaciónYDesarrolloEmprendedor',
                    'GestiónDeSoftware2',
                    'EstrategiasDeNegocios',
                    'DesarrolloDeSistemas',
                    'PrácticaProfesionalizante1'
                ]
            ],
            [
                'id_carrera' => 1, // AF
                'anio' => 3,
                'unidades_curriculares' => [
                    'ÉticaYResponsabilidadSocial',
                    'DerechoYLegislaciónLaboral',
                    'RedesYComunicaciones',
                    'SeguridadDeLosSistemas',
                    'BasesDeDatos',
                    'SistemaDeInformaciónOrganizacional',
                    'DesarrolloDeSistemasWeb',
                    'PrácticaProfesionalizante2'
                ]
            ]
        ];

        // Insertar datos usando la estructura existente de carrera_uc
        foreach ($planesEstudio as $plan) {
            // Insertar las unidades curriculares del plan
            foreach ($plan['unidades_curriculares'] as $index => $nombreUC) {
                // Primero verificar si la unidad curricular existe, si no, crearla
                $idUC = DB::table('unidad_curricular')
                    ->where('Unidad_Curricular', $nombreUC)
                    ->value('id_uc');

                if (!$idUC) {
                    // Obtener el siguiente ID disponible
                    $maxId = DB::table('unidad_curricular')->max('id_uc') ?? 0;
                    $idUC = $maxId + 1;
                    
                    DB::table('unidad_curricular')->insert([
                        'id_uc' => $idUC,
                        'Unidad_Curricular' => $nombreUC,
                        'Tipo' => 'Teórico-Práctico',
                        'HorasSem' => 4,
                        'HorasAnual' => 120,
                        'Formato' => 'Presencial'
                    ]);
                }

                // Verificar si ya existe la relación carrera_uc
                $existeRelacion = DB::table('carrera_uc')
                    ->where('id_carrera', $plan['id_carrera'])
                    ->where('id_uc', $idUC)
                    ->exists();

                if (!$existeRelacion) {
                    // Insertar la relación carrera_uc
                    DB::table('carrera_uc')->insert([
                        'id_carrera' => $plan['id_carrera'],
                        'id_uc' => $idUC
                    ]);
                }

                // También crear la relación con grado para organizar por año
                // Buscar o crear el grado correspondiente al año
                $grado = DB::table('grado')
                    ->where('grado', $plan['anio'])
                    ->first();

                if (!$grado) {
                    // Obtener el siguiente ID disponible
                    $maxGradoId = DB::table('grado')->max('id_grado') ?? 0;
                    $idGrado = $maxGradoId + 1;
                    
                    DB::table('grado')->insert([
                        'id_grado' => $idGrado,
                        'grado' => $plan['anio'],
                        'division' => 1,
                        'detalle' => $plan['anio'] . ' año',
                        'capacidad' => 50
                    ]);
                } else {
                    $idGrado = $grado->id_grado;
                }

                // Verificar si ya existe la relación grado_uc
                $existeGradoUc = DB::table('grado_uc')
                    ->where('id_grado', $idGrado)
                    ->where('id_uc', $idUC)
                    ->exists();

                if (!$existeGradoUc) {
                    // Insertar la relación grado_uc
                    DB::table('grado_uc')->insert([
                        'id_grado' => $idGrado,
                        'id_uc' => $idUC
                    ]);
                }
            }
        }
    }
} 