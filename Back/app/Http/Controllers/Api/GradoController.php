<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Grado;

class GradoController extends Controller
{
    public function getAllGrados()
    {
        $grados = Grado::all(['id_grado', 'grado']);
        return response()->json($grados);
    }
}
