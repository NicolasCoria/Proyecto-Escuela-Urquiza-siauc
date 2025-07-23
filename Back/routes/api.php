<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\CarreraController;
use App\Http\Controllers\Api\InformeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/alumno/info', [AuthController::class, 'getAlumnoInfo']);
    Route::get('/alumno/unidades-disponibles', [\App\Http\Controllers\Api\InscripcionUnidadCurricularController::class, 'disponiblesParaInscripcion']);
    Route::post('/alumno/inscribir-unidades', [\App\Http\Controllers\Api\InscripcionUnidadCurricularController::class, 'inscribir']);
    Route::post('/alumno/comprobante-inscripcion', [\App\Http\Controllers\Api\InscripcionUnidadCurricularController::class, 'comprobantePdf']);
    Route::get('/alumno/unidades-inscriptas', [\App\Http\Controllers\Api\InscripcionUnidadCurricularController::class, 'unidadesInscriptas']);
    Route::get('/alumno/unidades-carrera', [\App\Http\Controllers\Api\InscripcionUnidadCurricularController::class, 'unidadesCarrera']);
    Route::get('/alumno/unidades-aprobadas', [\App\Http\Controllers\Api\InscripcionUnidadCurricularController::class, 'unidadesAprobadas']);
    
    // Rutas para administrador - Informes
    Route::prefix('admin/informes')->group(function () {
        Route::get('/plantillas', [InformeController::class, 'getPlantillas']);
        Route::get('/filtros', [InformeController::class, 'getFiltrosPlantilla']);
        Route::post('/generar', [InformeController::class, 'generarInforme']);
    });
});

// Rutas públicas para carreras
Route::get('/carreras', [CarreraController::class, 'getAllCarreras']);
Route::get('/carreras/{id}', [CarreraController::class, 'getCarreraById']);

Route::post('/alumnos/register', [AuthController::class, 'registerAlumno']);
Route::post('/alumnos/login', [AuthController::class, 'loginAlumno']);

// Rutas de autenticación para administradores
Route::post('/admin/register', [AdminAuthController::class, 'registerAdmin']);
Route::post('/admin/login', [AdminAuthController::class, 'loginAdmin']);
