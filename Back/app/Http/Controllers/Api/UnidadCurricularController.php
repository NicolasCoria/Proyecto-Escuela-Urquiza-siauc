<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UnidadCurricular;

class UnidadCurricularController extends Controller
{
    public function getAllUnidadesCurriculares()
    {
        $ucs = UnidadCurricular::all(['id_uc', 'unidad_curricular']);
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
        // Buscar materias asociadas a ese grado y carrera
        $idsUc = \DB::table('grado_uc')
            ->join('carrera_uc', 'grado_uc.id_uc', '=', 'carrera_uc.id_uc')
            ->where('grado_uc.id_grado', $idGrado)
            ->where('carrera_uc.id_carrera', $idCarrera)
            ->pluck('grado_uc.id_uc');
        $materias = UnidadCurricular::whereIn('id_uc', $idsUc)->get(['id_uc', 'unidad_curricular']);
        return response()->json(['success' => true, 'materias' => $materias]);
    }
}
