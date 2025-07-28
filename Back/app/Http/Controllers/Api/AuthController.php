<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response('', 204);
    }

    /**
     * Registro de alumno
     */
    public function registerAlumno(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:20',
            'apellido' => 'required|string|max:20',
            'email' => 'required|email|unique:alumno,email',
            'password' => 'required|string|min:6',
        ]);

        // Validar que el email termine con el dominio educativo
        if (!str_ends_with($validated['email'], '@terciariourquiza.edu.ar')) {
            return response()->json([
                'error' => 'El email debe ser de dominio educativo (@terciariourquiza.edu.ar)',
                'field' => 'email'
            ], 422);
        }

        $alumno = new \App\Models\Alumno();
        $alumno->nombre = $validated['nombre'];
        $alumno->apellido = $validated['apellido'];
        $alumno->email = $validated['email'];
        $alumno->password = bcrypt($validated['password']);
        $alumno->save();

        return response()->json([
            'success' => true,
            'alumno' => $alumno
        ], 201);
    }

    /**
     * Login de alumno
     */
    public function loginAlumno(Request $request)
    {
        $startTotal = microtime(true);
        
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Validar que el email termine con el dominio educativo
        if (!str_ends_with($validated['email'], '@terciariourquiza.edu.ar')) {
            return response()->json([
                'error' => 'El email debe ser de dominio educativo (@terciariourquiza.edu.ar)',
                'field' => 'email'
            ], 422);
        }

        $startQuery = microtime(true);
        $alumno = \App\Models\Alumno::where('email', $validated['email'])->first();
        $endQuery = microtime(true);
        
        \Log::info('Tiempo consulta Alumno: ' . ($endQuery - $startQuery) . ' segundos');

        if (!$alumno || !\Illuminate\Support\Facades\Hash::check($validated['password'], $alumno->password)) {
            $endTotal = microtime(true);
            \Log::info('Tiempo total login (credenciales incorrectas): ' . ($endTotal - $startTotal) . ' segundos');
            return response()->json(['error' => 'Credenciales incorrectas'], 401);
        }

        // Obtener la carrera del alumno (consulta simple)
        $startCarrera = microtime(true);
        $alumnoCarrera = \App\Models\AlumnoCarrera::where('id_alumno', $alumno->id_alumno)->first();
        $carrera = null;
        if ($alumnoCarrera) {
            $carrera = \App\Models\Carrera::find($alumnoCarrera->id_carrera);
        }
        $endCarrera = microtime(true);
        \Log::info('Tiempo consulta Carrera: ' . ($endCarrera - $startCarrera) . ' segundos');
        $alumno->carrera = $carrera;

        // Crear token de Sanctum inmediatamente
        $startToken = microtime(true);
        $token = $alumno->createToken('alumno_token')->plainTextToken;
        $endToken = microtime(true);
        \Log::info('Tiempo creación token: ' . ($endToken - $startToken) . ' segundos');

        $endTotal = microtime(true);
        \Log::info('Tiempo total login optimizado: ' . ($endTotal - $startTotal) . ' segundos');

        // Retornar respuesta básica sin las UCs disponibles (se cargarán después)
        return response()->json([
            'success' => true,
            'token' => $token,
            'alumno' => $alumno,
            'carrera' => $carrera,
            'unidades_disponibles' => [] // Se cargarán en background
        ]);
    }

    /**
     * Obtener información completa del alumno
     */
    public function getAlumnoInfo(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $alumno = \App\Models\Alumno::find($user->id_alumno ?? $user->id);
        if (!$alumno) {
            return response()->json(['error' => 'Alumno no encontrado'], 404);
        }

        // Obtener la carrera del alumno
        $alumnoCarrera = \App\Models\AlumnoCarrera::where('id_alumno', $alumno->id_alumno)->first();
        $carrera = null;
        if ($alumnoCarrera) {
            $carrera = \App\Models\Carrera::find($alumnoCarrera->id_carrera);
        }

        // Agregar la información de la carrera al objeto alumno
        $alumno->carrera = $carrera ? $carrera->carrera : null;

        return response()->json([
            'success' => true,
            'alumno' => $alumno
        ]);
    }

    /**
     * Obtener unidades disponibles para inscribirse (carga en background)
     */
    public function getUnidadesDisponibles(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $startTotal = microtime(true);
        $id_alumno = $user->id_alumno ?? $user->id;
        
        // Obtener la carrera del alumno
        $alumnoCarrera = \App\Models\AlumnoCarrera::where('id_alumno', $id_alumno)->first();
        if (!$alumnoCarrera) {
            return response()->json(['unidades_disponibles' => []]);
        }

        $id_carrera = $alumnoCarrera->id_carrera;
        $unidades_disponibles = [];

        // Traer IDs de UCs en las que ya está inscripto
        $inscripto_ids = \App\Models\AlumnoUc::where('id_alumno', $id_alumno)->pluck('id_uc')->toArray();
        
        // Traer IDs de todas las UCs de la carrera
        $uc_carrera = \App\Models\CarreraUc::where('id_carrera', $id_carrera)->pluck('id_uc')->toArray();
        
        // Traer todas las UCs de la carrera
        $todas_uc = \App\Models\UnidadCurricular::whereIn('id_uc', $uc_carrera)->get()->keyBy('id_uc');
        
        // Traer todas las correlatividades de las UCs de la carrera
        $correlatividades = \App\Models\Correlatividad::whereIn('id_uc', $uc_carrera)->get()->groupBy('id_uc');
        
        // Traer todas las notas del alumno de las UCs de la carrera
        $notas = \App\Models\Nota::where('id_alumno', $id_alumno)
            ->whereIn('id_uc', $uc_carrera)
            ->where('nota', '>=', 6)
            ->get()
            ->keyBy('id_uc');

        foreach ($todas_uc as $uc_id => $uc) {
            if (in_array($uc_id, $inscripto_ids)) continue;
            
            $correlativas = $correlatividades->get($uc_id, collect())->pluck('correlativa')->filter();
            if ($correlativas->isEmpty()) {
                $unidades_disponibles[] = $uc;
                continue;
            }
            
            $aprobadas = true;
            foreach ($correlativas as $id_correlativa) {
                if (!$notas->has($id_correlativa)) {
                    $aprobadas = false;
                    break;
                }
            }
            if ($aprobadas) {
                $unidades_disponibles[] = $uc;
            }
        }

        $endTotal = microtime(true);
        \Log::info('Tiempo carga UCs disponibles: ' . ($endTotal - $startTotal) . ' segundos');

        return response()->json([
            'unidades_disponibles' => $unidades_disponibles
        ]);
    }
}
