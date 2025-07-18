<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\CarreraController;
use App\Http\Controllers\Api\InformeController;
use App\Http\Controllers\Api\EncuestaController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/alumno/info', [AuthController::class, 'getAlumnoInfo']);
    Route::get('/alumno/unidades-disponibles', [\App\Http\Controllers\Api\InscripcionUnidadCurricularController::class, 'disponiblesParaInscripcion']);
    Route::post('/alumno/inscribir-unidades', [\App\Http\Controllers\Api\InscripcionUnidadCurricularController::class, 'inscribir']);
    Route::post('/alumno/comprobante-inscripcion', [\App\Http\Controllers\Api\InscripcionUnidadCurricularController::class, 'comprobantePdf']);
    
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

// Rutas para encuestas académicas (CU-005)
Route::get('/encuestas', [EncuestaController::class, 'index']); // Listar encuestas activas con preguntas y opciones
Route::post('/encuestas', [EncuestaController::class, 'store']); // Crear encuesta completa
Route::post('/encuestas/responder', [EncuestaController::class, 'responder']); // Guardar respuestas de alumno
Route::get('/encuestas/{id}/estadisticas', [EncuestaController::class, 'estadisticas']); // Estadísticas de encuesta

// Nuevas rutas para asignación de encuestas
Route::post('/encuestas/asignar-alumnos', [EncuestaController::class, 'asignarAAlumnos']); // Asignar a alumnos específicos
Route::post('/encuestas/asignar-carrera', [EncuestaController::class, 'asignarACarrera']); // Asignar a toda una carrera

// Rutas para alumnos (requieren autenticación)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/alumno/encuestas', [EncuestaController::class, 'encuestasAsignadas']); // Obtener encuestas asignadas al alumno
    Route::post('/alumno/encuestas/marcar-notificada', [EncuestaController::class, 'marcarNotificada']); // Marcar como notificada
});

// Rutas para plantillas de informe (CU-004)
Route::get('/plantillas-informe', [\App\Http\Controllers\PlantillaInformeController::class, 'index']);
Route::post('/plantillas-informe', [\App\Http\Controllers\PlantillaInformeController::class, 'store']);
Route::put('/plantillas-informe/{id}', [\App\Http\Controllers\PlantillaInformeController::class, 'update']);
Route::delete('/plantillas-informe/{id}', [\App\Http\Controllers\PlantillaInformeController::class, 'destroy']);

Route::get('/grados', [\App\Http\Controllers\Api\GradoController::class, 'getAllGrados']);
Route::get('/unidades-curriculares', [\App\Http\Controllers\Api\UnidadCurricularController::class, 'getAllUnidadesCurriculares']);
Route::get('/unidades-curriculares/por-carrera-grado', [\App\Http\Controllers\Api\UnidadCurricularController::class, 'getPorCarreraGrado']);

// Rutas para alumnos filtrados y asignación avanzada
Route::get('/alumnos/filtrados', [\App\Http\Controllers\Api\AlumnoController::class, 'filtrados']);
Route::post('/encuestas/asignar-filtrado', [\App\Http\Controllers\Api\EncuestaController::class, 'asignarFiltrado']);
