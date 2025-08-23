<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Encuesta;
use App\Models\Carrera;
use App\Models\Grado;
use App\Models\UnidadCurricular;

class DashboardController extends Controller
{
    /**
     * Obtener todos los datos necesarios para el dashboard en una sola llamada
     */
    public function getDashboardData(Request $request)
    {
        try {
            $fechaActual = $request->input('fecha_actual');
            
            // Cargar encuestas con filtro de fechas
            $encuestasQuery = Encuesta::with(['preguntas.opciones']);
            
            if ($fechaActual) {
                $encuestasQuery->where(function($query) use ($fechaActual) {
                    $query->whereNull('fecha_inicio')
                          ->orWhere('fecha_inicio', '<=', $fechaActual);
                })->where(function($query) use ($fechaActual) {
                    $query->whereNull('fecha_fin')
                          ->orWhere('fecha_fin', '>=', $fechaActual);
                });
                // Solo filtrar por activas cuando se proporciona fecha_actual
                $encuestasQuery->where('activa', true);
            }
            // Si no hay fecha_actual, obtener todas las encuestas (activas e inactivas)
            
            $encuestas = $encuestasQuery->get();
            
            // Cargar datos estáticos optimizados
            $carreras = Carrera::select(['id_carrera', 'carrera'])
                ->orderBy('carrera')
                ->get();
                
            $grados = Grado::select(['id_grado', 'grado', 'division', 'detalle'])
                ->orderBy('grado')
                ->orderBy('division')
                ->get()
                ->map(function($grado) {
                    // Formatear el texto de visualización
                    $grado->display_text = $grado->grado . '-' . $grado->division . '°';
                    return $grado;
                });
                
            $materias = UnidadCurricular::select(['id_uc', 'Unidad_Curricular'])
                ->orderBy('Unidad_Curricular')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'encuestas' => $encuestas,
                    'carreras' => $carreras,
                    'grados' => $grados,
                    'materias' => $materias
                ],
                'timestamp' => now()->toISOString()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener datos del dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 