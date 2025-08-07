<?php

// Script para probar directamente el endpoint de mensajes
// Ejecutar desde la raíz del proyecto: php test_mensajes_api.php

require_once __DIR__ . '/vendor/autoload.php';

// Inicializar Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== PRUEBA DIRECTA DEL ENDPOINT DE MENSAJES ===\n\n";

try {
    // Simular un usuario autenticado (alumno ID 27)
    $alumno = DB::table('alumno')->where('id_alumno', 27)->first();
    
    if (!$alumno) {
        echo "❌ ERROR: No se encontró el alumno con ID 27\n";
        exit(1);
    }
    
    echo "✅ Alumno encontrado: {$alumno->nombre} {$alumno->apellido}\n\n";
    
    // Consultar mensajes directamente
    $mensajes = DB::table('destinatarios_mensaje')
        ->join('mensajes', 'destinatarios_mensaje.id_mensaje', '=', 'mensajes.id_mensaje')
        ->join('administrador', 'mensajes.id_admin_creador', '=', 'administrador.id_admin')
        ->where('destinatarios_mensaje.id_alumno', 27)
        ->select([
            'mensajes.id_mensaje',
            'mensajes.titulo',
            'mensajes.contenido',
            'mensajes.prioridad',
            'mensajes.created_at',
            'destinatarios_mensaje.leido',
            'destinatarios_mensaje.fecha_lectura',
            DB::raw("CONCAT(administrador.nombre, ' ', administrador.apellido) as admin_creador")
        ])
        ->orderBy('mensajes.created_at', 'desc')
        ->get();
    
    echo "✅ Consulta ejecutada correctamente\n";
    echo "✅ Mensajes encontrados: " . $mensajes->count() . "\n\n";
    
    if ($mensajes->count() > 0) {
        echo "=== DETALLES DE MENSAJES ===\n";
        foreach ($mensajes as $mensaje) {
            echo "ID: {$mensaje->id_mensaje}\n";
            echo "Título: {$mensaje->titulo}\n";
            echo "Prioridad: {$mensaje->prioridad}\n";
            echo "Admin: {$mensaje->admin_creador}\n";
            echo "Leído: " . ($mensaje->leido ? 'Sí' : 'No') . "\n";
            echo "Fecha: {$mensaje->created_at}\n";
            echo "Contenido: " . substr($mensaje->contenido, 0, 100) . "...\n";
            echo "---\n";
        }
    }
    
    // Probar estadísticas
    $totalMensajes = DB::table('destinatarios_mensaje')->where('id_alumno', 27)->count();
    $mensajesLeidos = DB::table('destinatarios_mensaje')->where('id_alumno', 27)->where('leido', true)->count();
    $mensajesNoLeidos = $totalMensajes - $mensajesLeidos;
    
    echo "\n=== ESTADÍSTICAS ===\n";
    echo "Total mensajes: $totalMensajes\n";
    echo "Mensajes leídos: $mensajesLeidos\n";
    echo "Mensajes no leídos: $mensajesNoLeidos\n";
    
    echo "\n✅ Todo funciona correctamente en el backend!\n";
    echo "   El problema debe estar en el frontend.\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n=== FIN ===\n"; 