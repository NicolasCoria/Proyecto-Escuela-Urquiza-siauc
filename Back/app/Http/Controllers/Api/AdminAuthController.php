<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Administrador;

class AdminAuthController extends Controller
{
    /**
     * Login de administrador
     */
    public function loginAdmin(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $admin = Administrador::where('email', $validated['email'])->first();
        
        if (!$admin || !Hash::check($validated['password'], $admin->password)) {
            return response()->json(['error' => 'Credenciales incorrectas'], 401);
        }

        // Crear token de Sanctum
        $token = $admin->createToken('admin_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'admin' => $admin
        ]);
    }

    /**
     * Registro de administrador (solo para desarrollo)
     */
    public function registerAdmin(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:20',
            'apellido' => 'required|string|max:20',
            'email' => 'required|email|unique:administrador,email',
            'password' => 'required|string|min:6',
        ]);

        $admin = new Administrador();
        $admin->nombre = $validated['nombre'];
        $admin->apellido = $validated['apellido'];
        $admin->email = $validated['email'];
        $admin->password = Hash::make($validated['password']);
        $admin->DNI = 12345678;
        $admin->telefono = '1234567890';
        $admin->genero = 'Masculino';
        $admin->fecha_nac = '1980-01-01';
        $admin->nacionalidad = 'Argentina';
        $admin->direccion = 'Calle Admin 123';
        $admin->id_localidad = 1;
        $admin->save();

        return response()->json([
            'success' => true,
            'admin' => $admin
        ], 201);
    }

    /**
     * Logout de administrador
     */
    public function logoutAdmin(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response('', 204);
    }

    /**
     * Obtener información del administrador autenticado
     */
    public function getAdminInfo(Request $request)
    {
        $admin = $request->user();
        
        if (!$admin) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        return response()->json([
            'success' => true,
            'admin' => $admin
        ]);
    }
} 