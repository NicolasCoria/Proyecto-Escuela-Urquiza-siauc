<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Grado;

class GradoController extends Controller
{
    public function getAllGrados()
    {
        $grados = Grado::select(['id_grado', 'grado', 'division', 'detalle'])
            ->orderBy('grado')
            ->orderBy('division')
            ->get();
        return response()->json($grados);
    }
}
