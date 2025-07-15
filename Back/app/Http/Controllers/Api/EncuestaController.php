<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Encuesta;
use App\Models\Pregunta;
use App\Models\Opcion;
use App\Models\Respuesta;
use Illuminate\Support\Facades\DB;

class EncuestaController extends Controller
{
    // Listar encuestas activas, con preguntas y opciones
    public function index(Request $request)
    {
        $query = Encuesta::with(['preguntas.opciones']);
        if ($request->has('id_carrera')) {
            $query->where('id_carrera', $request->input('id_carrera'));
        }
        $query->where('activa', true);
        $encuestas = $query->get();
        return response()->json(['success' => true, 'encuestas' => $encuestas]);
    }

    // Crear una nueva encuesta con preguntas y opciones
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:255',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date',
            'activa' => 'boolean',
            'id_carrera' => 'nullable|integer|exists:carrera,id_carrera',
            'preguntas' => 'required|array|min:1',
            'preguntas.*.texto' => 'required|string|max:255',
            'preguntas.*.tipo' => 'required|in:opcion_unica,opcion_multiple',
            'preguntas.*.orden' => 'nullable|integer',
            'preguntas.*.opciones' => 'required|array|min:1',
            'preguntas.*.opciones.*.texto' => 'required|string|max:100',
            'preguntas.*.opciones.*.valor' => 'nullable|integer',
        ]);

        DB::beginTransaction();
        try {
            $encuesta = Encuesta::create($request->only([
                'titulo', 'descripcion', 'fecha_inicio', 'fecha_fin', 'activa', 'id_carrera'
            ]));

            foreach ($request->preguntas as $preguntaData) {
                $pregunta = $encuesta->preguntas()->create([
                    'texto' => $preguntaData['texto'],
                    'tipo' => $preguntaData['tipo'],
                    'orden' => $preguntaData['orden'] ?? 0,
                ]);
                foreach ($preguntaData['opciones'] as $opcionData) {
                    $pregunta->opciones()->create([
                        'texto' => $opcionData['texto'],
                        'valor' => $opcionData['valor'] ?? null,
                    ]);
                }
            }
            DB::commit();
            return response()->json(['success' => true, 'encuesta' => $encuesta->load('preguntas.opciones')], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Guardar respuestas de un alumno
    public function responder(Request $request)
    {
        $validated = $request->validate([
            'id_encuesta' => 'required|integer|exists:encuesta,id_encuesta',
            'respuestas' => 'required|array|min:1',
            'respuestas.*.id_pregunta' => 'required|integer|exists:pregunta,id_pregunta',
            'respuestas.*.id_opcion' => 'required|integer|exists:opcion,id_opcion',
        ]);
        $idAlumno = auth()->id() ?? null;
        $toInsert = [];
        foreach ($request->respuestas as $resp) {
            $toInsert[] = [
                'id_encuesta' => $request->id_encuesta,
                'id_pregunta' => $resp['id_pregunta'],
                'id_opcion' => $resp['id_opcion'],
                'id_alumno' => $idAlumno,
                'created_at' => now(),
            ];
        }
        Respuesta::insert($toInsert);
        return response()->json(['success' => true]);
    }

    // Obtener estadísticas de una encuesta
    public function estadisticas($id_encuesta)
    {
        $encuesta = Encuesta::with(['preguntas.opciones'])->findOrFail($id_encuesta);
        $stats = [];
        foreach ($encuesta->preguntas as $pregunta) {
            $opcionesStats = [];
            foreach ($pregunta->opciones as $opcion) {
                $count = Respuesta::where('id_pregunta', $pregunta->id_pregunta)
                    ->where('id_opcion', $opcion->id_opcion)
                    ->count();
                $opcionesStats[] = [
                    'id_opcion' => $opcion->id_opcion,
                    'texto' => $opcion->texto,
                    'cantidad' => $count,
                ];
            }
            $total = array_sum(array_column($opcionesStats, 'cantidad'));
            foreach ($opcionesStats as &$opStat) {
                $opStat['porcentaje'] = $total > 0 ? round($opStat['cantidad'] * 100 / $total, 2) : 0;
            }
            $stats[] = [
                'id_pregunta' => $pregunta->id_pregunta,
                'texto' => $pregunta->texto,
                'opciones' => $opcionesStats,
                'total_respuestas' => $total,
            ];
        }
        return response()->json(['success' => true, 'estadisticas' => $stats]);
    }
} 