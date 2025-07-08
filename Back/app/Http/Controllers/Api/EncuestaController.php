<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Encuesta;
use App\Models\Carrera;

class EncuestaController extends Controller
{
    // Listar encuestas activas, con filtro opcional por carrera
    public function index(Request $request)
    {
        $query = Encuesta::where('estado', 'activa');
        if ($request->has('id_carrera')) {
            $query->where('id_carrera', $request->input('id_carrera'));
        }
        $encuestas = $query->get();
        return response()->json(['success' => true, 'encuestas' => $encuestas]);
    }

    // Crear una nueva encuesta (solo admin/docente)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'link_google_forms' => 'required|url',
            'id_carrera' => 'required|integer|exists:carrera,id_carrera',
        ]);
        $encuesta = new Encuesta($validated);
        $encuesta->creador_id = auth()->id() ?? 1; // Asume autenticación, si no, usa 1
        $encuesta->save();
        return response()->json(['success' => true, 'encuesta' => $encuesta], 201);
    }
} 