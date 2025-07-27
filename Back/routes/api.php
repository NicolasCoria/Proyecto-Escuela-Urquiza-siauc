<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\CarreraController;
use App\Http\Controllers\Api\InformeController;
use App\Http\Controllers\Api\EncuestaController;
use App\Http\Controllers\Api\GruposDestinatariosController;
use App\Http\Controllers\Solicitudes\SolicitudController;
use App\Http\Controllers\Api\FaqController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/alumno/info', [AuthController::class, 'getAlumnoInfo']);
    Route::get('/alumno/unidades-disponibles', [\App\Http\Controllers\Api\InscripcionUnidadCurricularController::class, 'disponiblesParaInscripcion']);
    Route::get('/alumno/unidades-disponibles-optimized', [AuthController::class, 'getUnidadesDisponibles']);
    Route::get('/alumno/unidades-inscriptas', [\App\Http\Controllers\Api\InscripcionUnidadCurricularController::class, 'unidadesInscriptas']);
    Route::post('/alumno/inscribir-unidades', [\App\Http\Controllers\Api\InscripcionUnidadCurricularController::class, 'inscribir']);
    Route::post('/alumno/comprobante-inscripcion', [\App\Http\Controllers\Api\InscripcionUnidadCurricularController::class, 'comprobantePdf']);
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
Route::get('/admin/info', [AdminAuthController::class, 'getAdminInfo']);

// Grupo de rutas protegidas para Administradores
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    // Solicitudes
    Route::get('solicitudes', [SolicitudController::class, 'index']);
    Route::put('solicitudes/{id}', [SolicitudController::class, 'update']);
});

// Grupo de rutas protegidas para Alumnos
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/alumno/encuestas', [EncuestaController::class, 'encuestasAsignadas']); // Obtener encuestas asignadas al alumno
    Route::post('/alumno/encuestas/marcar-notificada', [EncuestaController::class, 'marcarNotificada']); // Marcar como notificada
    Route::get('solicitudes', [SolicitudController::class, 'index']);
    Route::post('solicitudes', [SolicitudController::class, 'store']);
    Route::post('solicitudes/{id}/marcar-visto', [SolicitudController::class, 'marcarEstadoVisto']);
});

// Rutas para grupos de destinatarios
Route::get('/grupos-destinatarios', [GruposDestinatariosController::class, 'index']); // Listar grupos
Route::get('/grupos-destinatarios/{id}', [GruposDestinatariosController::class, 'show']); // Obtener grupo específico
Route::post('/grupos-destinatarios', [GruposDestinatariosController::class, 'store']); // Crear grupo
Route::put('/grupos-destinatarios/{id}', [GruposDestinatariosController::class, 'update']); // Actualizar grupo
Route::delete('/grupos-destinatarios/{id}', [GruposDestinatariosController::class, 'destroy']); // Eliminar grupo
Route::get('/grupos-destinatarios/datos/creacion', [GruposDestinatariosController::class, 'getDatosCreacion']); // Datos para crear
Route::post('/grupos-destinatarios/filtrar-alumnos', [GruposDestinatariosController::class, 'filtrarAlumnos']); // Filtrar alumnos

// Rutas para encuestas académicas (CU-005)
Route::get('/encuestas', [EncuestaController::class, 'index']); // Listar encuestas activas con preguntas y opciones
Route::get('/encuestas/{id}', [EncuestaController::class, 'show']); // Obtener una encuesta específica
Route::post('/encuestas', [EncuestaController::class, 'store']); // Crear encuesta completa
Route::put('/encuestas/{id}', [EncuestaController::class, 'update']); // Actualizar encuesta
Route::delete('/encuestas/{id}', [EncuestaController::class, 'destroy']); // Eliminar encuesta
Route::post('/encuestas/responder', [EncuestaController::class, 'responder']); // Guardar respuestas de alumno
Route::get('/encuestas/{id}/estadisticas', [EncuestaController::class, 'estadisticas']); // Estadísticas de encuesta

// Nuevas rutas para asignación de encuestas
Route::post('/encuestas/asignar-alumnos', [EncuestaController::class, 'asignarAAlumnos']); // Asignar a alumnos específicos
Route::post('/encuestas/asignar-carrera', [EncuestaController::class, 'asignarACarrera']); // Asignar a toda una carrera
Route::post('/encuestas/asignar-grupos', [EncuestaController::class, 'asignarGrupos']); // Asignar a grupos de destinatarios

// Rutas para plantillas de informe (CU-004)
Route::get('/plantillas-informe', [\App\Http\Controllers\PlantillaInformeController::class, 'index']);
Route::post('/plantillas-informe', [\App\Http\Controllers\PlantillaInformeController::class, 'store']);
Route::put('/plantillas-informe/{id}', [\App\Http\Controllers\PlantillaInformeController::class, 'update']);

// Ruta optimizada para datos del dashboard
Route::get('/dashboard-data', [\App\Http\Controllers\Api\DashboardController::class, 'getDashboardData']);
Route::delete('/plantillas-informe/{id}', [\App\Http\Controllers\PlantillaInformeController::class, 'destroy']);

Route::get('/grados', [\App\Http\Controllers\Api\GradoController::class, 'getAllGrados']);
Route::get('/unidades-curriculares', [\App\Http\Controllers\Api\UnidadCurricularController::class, 'getAllUnidadesCurriculares']);
Route::get('/unidades-curriculares/por-carrera-grado', [\App\Http\Controllers\Api\UnidadCurricularController::class, 'getPorCarreraGrado']);

// Rutas para alumnos filtrados y asignación avanzada
Route::get('/alumnos/filtrados', [\App\Http\Controllers\Api\AlumnoController::class, 'filtrados']);
Route::post('/encuestas/asignar-filtrado', [\App\Http\Controllers\Api\EncuestaController::class, 'asignarFiltrado']);

// Rutas para FAQs
Route::get('/faqs/admin', [FaqController::class, 'getAdminFaqs']);
Route::get('/faqs/alumno', [FaqController::class, 'getAlumnoFaqs']);
Route::get('/faqs', [FaqController::class, 'index']);
Route::get('/faqs/{id}', [FaqController::class, 'show']);
Route::post('/faqs', [FaqController::class, 'store']);
Route::put('/faqs/{id}', [FaqController::class, 'update']);
Route::delete('/faqs/{id}', [FaqController::class, 'destroy']);
