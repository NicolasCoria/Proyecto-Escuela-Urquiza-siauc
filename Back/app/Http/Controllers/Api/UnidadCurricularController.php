<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UnidadCurricular;

class UnidadCurricularController extends Controller
{
    public function getAllUnidadesCurriculares()
    {
        // ✅ Optimizado: Solo campos necesarios y ordenado
        $ucs = UnidadCurricular::select(['id_uc', 'Unidad_Curricular'])
            ->orderBy('Unidad_Curricular')
            ->get();
        return response()->json($ucs);
    }

    // GET /unidades-curriculares/por-carrera-grado?id_carrera=...&id_grado=...
    public function getPorCarreraGrado(Request $request)
    {
        $idCarrera = $request->input('id_carrera');
        $idGrado = $request->input('id_grado');
        if (!$idCarrera || !$idGrado) {
            return response()->json(['success' => false, 'error' => 'id_carrera e id_grado son obligatorios'], 400);
        }
        
        // ✅ Optimizado: Consulta más eficiente con índices
        $materias = UnidadCurricular::select(['id_uc', 'Unidad_Curricular'])
            ->whereExists(function ($query) use ($idCarrera, $idGrado) {
                $query->select(\DB::raw(1))
                    ->from('grado_uc')
                    ->whereColumn('grado_uc.id_uc', 'unidad_curricular.id_uc')
                    ->where('grado_uc.id_grado', $idGrado)
                    ->whereExists(function ($subQuery) use ($idCarrera) {
                        $subQuery->select(\DB::raw(1))
                            ->from('carrera_uc')
                            ->whereColumn('carrera_uc.id_uc', 'unidad_curricular.id_uc')
                            ->where('carrera_uc.id_carrera', $idCarrera);
                    });
            })
            ->orderBy('Unidad_Curricular')
            ->get();
            
        return response()->json(['success' => true, 'materias' => $materias]);
    }
}
