<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carrera;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CarreraController extends Controller
{
    /**
     * Obtener información de una carrera por ID
     */
    public function getCarreraById($id): JsonResponse
    {
        try {
            $carrera = Carrera::find($id);
            
            if (!$carrera) {
                return response()->json([
                    'success' => false,
                    'message' => 'Carrera no encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'carrera' => $carrera
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la información de la carrera',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener todas las carreras
     */
    public function getAllCarreras(): JsonResponse
    {
        try {
            $carreras = Carrera::all();
            
            return response()->json([
                'success' => true,
                'carreras' => $carreras
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las carreras',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 