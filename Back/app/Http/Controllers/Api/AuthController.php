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
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $alumno = \App\Models\Alumno::where('email', $validated['email'])->first();
        if (!$alumno || !\Illuminate\Support\Facades\Hash::check($validated['password'], $alumno->password)) {
            return response()->json(['error' => 'Credenciales incorrectas'], 401);
        }

        // Obtener la carrera del alumno
        $alumnoCarrera = \App\Models\AlumnoCarrera::where('id_alumno', $alumno->id_alumno)->first();
        $carrera = null;
        if ($alumnoCarrera) {
            $carrera = \App\Models\Carrera::find($alumnoCarrera->id_carrera);
        }
        $alumno->carrera = $carrera;

        // Obtener las UCs disponibles para inscribirse (lógica de InscripcionUnidadCurricularController)
        $id_alumno = $alumno->id_alumno;
        $id_carrera = $alumnoCarrera ? $alumnoCarrera->id_carrera : null;
        $unidades_disponibles = [];
        if ($id_carrera) {
            $inscripto_ids = \App\Models\AlumnoUc::where('id_alumno', $id_alumno)->pluck('id_uc')->toArray();
            $uc_carrera = \App\Models\CarreraUc::where('id_carrera', $id_carrera)->pluck('id_uc')->toArray();
            $todas_uc = \App\Models\UnidadCurricular::whereIn('id_uc', $uc_carrera)->get();
            foreach ($todas_uc as $uc) {
                if (in_array($uc->id_uc, $inscripto_ids)) continue;
                $correlativas = \App\Models\Correlatividad::where('id_uc', $uc->id_uc)->pluck('correlativa')->toArray();
                $aprobadas = true;
                if (empty($correlativas)) {
                    $unidades_disponibles[] = $uc;
                    continue;
                }
                foreach ($correlativas as $id_correlativa) {
                    if (!$id_correlativa) continue;
                    $nota = \App\Models\Nota::where('id_alumno', $id_alumno)
                        ->where('id_uc', $id_correlativa)
                        ->where('nota', '>=', 6)
                        ->first();
                    if (!$nota) {
                        $aprobadas = false;
                        break;
                    }
                }
                if ($aprobadas) {
                    $unidades_disponibles[] = $uc;
                }
            }
        }

        // Crear token de Sanctum
        $token = $alumno->createToken('alumno_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'alumno' => $alumno,
            'carrera' => $carrera,
            'unidades_disponibles' => $unidades_disponibles
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
}
