<?php

namespace App\Http\Controllers\Solicitudes;

use App\Http\Controllers\Controller;
use App\Models\Solicitudes\Solicitud;
use App\Models\Administrador;
use App\Models\Alumno;
use Illuminate\Http\Request;

class SolicitudController extends Controller
{
    // Listar todas las solicitudes (para admin) o solo las del alumno autenticado
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user instanceof Administrador) {
            return response()->json(Solicitud::with('alumno')->get());
        }

        if ($user instanceof Alumno) {
            return response()->json(Solicitud::where('id_alumno', $user->id_alumno)->with('alumno')->get());
        }

        return response()->json(['message' => 'No autorizado'], 403);
    }

    // Crear una nueva solicitud
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_alumno' => 'required|integer|exists:alumno,id_alumno',
            'categoria' => 'required|in:general,certificado,homologacion_interna,homologacion_externa',
            'asunto' => 'required|string|max:255',
            'mensaje' => 'required|string',
        ]);

        $solicitud = Solicitud::create([
            'id_alumno' => $validated['id_alumno'],
            'categoria' => $validated['categoria'],
            'asunto' => $validated['asunto'],
            'mensaje' => $validated['mensaje'],
            'estado' => 'pendiente',
            'estado_visto' => 'pendiente',
            'fecha_creacion' => now(),
        ]);

        return response()->json($solicitud, 201);
    }

    // Actualizar una solicitud (para admin)
    public function update(Request $request, $id)
    {
        $admin = $request->user();
        $validated = $request->validate([
            'respuesta' => 'required|string',
            'estado' => 'required|in:en_proceso,respondida,rechazada',
        ]);

        $solicitud = Solicitud::findOrFail($id);

        $solicitud->update([
            'respuesta' => $validated['respuesta'],
            'estado' => $validated['estado'],
            'fecha_respuesta' => now(),
            'id_admin' => $admin->id_admin ?? $admin->id ?? null,
        ]);

        return response()->json($solicitud);
    }

    // Marcar el estado como visto por el alumno
    public function marcarEstadoVisto(Request $request, $id)
    {
        $user = $request->user();
        // Solo el alumno dueño de la solicitud puede marcarla como vista
        $solicitud = Solicitud::findOrFail($id);
        if (!$user || $solicitud->id_alumno != $user->id_alumno) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $solicitud->estado_visto = $solicitud->estado;
        $solicitud->save();
        return response()->json(['success' => true, 'estado_visto' => $solicitud->estado_visto]);
    }
} 