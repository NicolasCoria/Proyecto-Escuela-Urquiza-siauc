<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UnidadCurricular;
use App\Models\Correlatividad;
use App\Models\Nota;
use App\Models\AlumnoUc;
use Illuminate\Support\Facades\Auth;

class InscripcionUnidadCurricularController extends Controller
{
    // Devuelve las unidades curriculares disponibles para inscripción para el alumno autenticado
    public function disponiblesParaInscripcion(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $id_alumno = $user->id_alumno ?? $user->id ?? null;
        if (!$id_alumno) {
            return response()->json(['error' => 'No se pudo determinar el alumno autenticado'], 400);
        }

        // Obtener la carrera del alumno
        $alumnoCarrera = \App\Models\AlumnoCarrera::where('id_alumno', $id_alumno)->first();
        if (!$alumnoCarrera) {
            return response()->json(['error' => 'El alumno no está registrado en ninguna carrera'], 400);
        }
        $id_carrera = $alumnoCarrera->id_carrera;

        // Unidades curriculares en las que ya está inscripto
        $inscripto_ids = AlumnoUc::where('id_alumno', $id_alumno)->pluck('id_uc')->toArray();

        // Unidades curriculares de la carrera del alumno (desde carrera_uc)
        $uc_carrera = \App\Models\CarreraUc::where('id_carrera', $id_carrera)->pluck('id_uc')->toArray();
        
        // Obtener las unidades curriculares de la carrera
        $todas_uc = UnidadCurricular::whereIn('id_uc', $uc_carrera)->get();
        $disponibles = [];

        foreach ($todas_uc as $uc) {
            // Si ya está inscripto, no la agrego
            if (in_array($uc->id_uc, $inscripto_ids)) continue;

            // Correlatividades requeridas para esta unidad curricular
            $correlativas = Correlatividad::where('id_uc', $uc->id_uc)->pluck('correlativa')->toArray();
            $aprobadas = true;
            
            // Si no tiene correlativas, puede inscribirse
            if (empty($correlativas)) {
                $disponibles[] = $uc;
                continue;
            }
            
            // Verificar que tenga aprobadas todas las correlativas
            foreach ($correlativas as $id_correlativa) {
                if (!$id_correlativa) continue;
                // Buscar nota aprobada para la correlativa
                $nota = Nota::where('id_alumno', $id_alumno)
                    ->where('id_uc', $id_correlativa)
                    ->where('nota', '>=', 6)
                    ->first();
                if (!$nota) {
                    $aprobadas = false;
                    break;
                }
            }
            if ($aprobadas) {
                $disponibles[] = $uc;
            }
        }
        return response()->json($disponibles);
    }

    // Inscribir al alumno autenticado en varias unidades curriculares
    public function inscribir(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }
        $id_alumno = $user->id_alumno ?? $user->id ?? null;
        if (!$id_alumno) {
            return response()->json(['error' => 'No se pudo determinar el alumno autenticado'], 400);
        }

        $validated = $request->validate([
            'unidades' => 'required|array|min:1',
            'unidades.*' => 'integer|exists:unidad_curricular,id_uc',
        ]);

        // Buscar carrera y grado del alumno consultando las relaciones
        $id_carrera = null;
        $id_grado = null;
        $alumno = \App\Models\Alumno::find($id_alumno);
        if ($alumno) {
            // Obtener la carrera del alumno desde alumno_carrera
            $alumnoCarrera = \App\Models\AlumnoCarrera::where('id_alumno', $id_alumno)->first();
            if ($alumnoCarrera) {
                $id_carrera = $alumnoCarrera->id_carrera;
            }
            
            // Obtener el grado del alumno desde alumno_grado
            $alumnoGrado = \App\Models\AlumnoGrado::where('id_alumno', $id_alumno)->first();
            if ($alumnoGrado) {
                $id_grado = $alumnoGrado->id_grado;
            }
        }

        $fechaHora = now();
        $inscripciones = [];
        foreach ($validated['unidades'] as $id_uc) {
            // Registrar en alumno_uc (registro de unidades curriculares del alumno)
            \App\Models\AlumnoUc::firstOrCreate([
                'id_alumno' => $id_alumno,
                'id_uc' => $id_uc
            ]);
            
            // Registrar en inscripcion (registro de la inscripción con fecha, carrera, grado)
            $maxId = \App\Models\Inscripcion::max('id_inscripcion') ?? 0;
            $id_inscripcion = $maxId + 1;
            $insc = \App\Models\Inscripcion::create([
                'id_inscripcion' => $id_inscripcion,
                'FechaHora' => $fechaHora,
                'id_alumno' => $id_alumno,
                'id_uc' => $id_uc,
                'id_carrera' => $id_carrera,
                'id_grado' => $id_grado
            ]);
            $inscripciones[] = $insc;
        }
        return response()->json([
            'success' => true,
            'inscripciones' => $inscripciones
        ]);
    }
} 