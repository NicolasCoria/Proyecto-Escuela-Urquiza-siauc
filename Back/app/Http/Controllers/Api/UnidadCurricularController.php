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
}
