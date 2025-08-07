<?php

// Script para insertar un mensaje de prueba
// Ejecutar desde la raíz del proyecto: php database/insertar_mensaje_prueba.php

require_once __DIR__ . '/../vendor/autoload.php';

// Inicializar Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== INSERTAR MENSAJE DE PRUEBA ===\n\n";

try {
    // Verificar si las tablas existen
    if (!DB::getSchemaBuilder()->hasTable('mensajes') || !DB::getSchemaBuilder()->hasTable('destinatarios_mensaje')) {
        echo "❌ ERROR: Las tablas de mensajes no existen.\n";
        echo "   Ejecute primero: php database/verificar_mensajes.php\n";
        exit(1);
    }
    
    // Buscar un administrador
    $admin = DB::table('administrador')->first();
    if (!$admin) {
        echo "❌ ERROR: No hay administradores en la base de datos.\n";
        echo "   Cree un administrador primero.\n";
        exit(1);
    }
    
    // Buscar un alumno
    $alumno = DB::table('alumno')->first();
    if (!$alumno) {
        echo "❌ ERROR: No hay alumnos en la base de datos.\n";
        echo "   Cree un alumno primero.\n";
        exit(1);
    }
    
    echo "✅ Administrador encontrado: {$admin->nombre} {$admin->apellido}\n";
    echo "✅ Alumno encontrado: {$alumno->nombre} {$alumno->apellido}\n\n";
    
    // Insertar mensaje de prueba
    $mensajeId = DB::table('mensajes')->insertGetId([
        'titulo' => 'Mensaje de Prueba - Sistema de Comunicaciones',
        'contenido' => "Este es un mensaje de prueba para verificar que el sistema de comunicaciones funciona correctamente.\n\nCaracterísticas del sistema:\n- Prioridades: baja, media, alta, urgente\n- Estados: leído/no leído\n- Estadísticas en tiempo real\n- Interfaz responsive\n\n¡El sistema está funcionando!",
        'prioridad' => 'media',
        'id_admin_creador' => $admin->id_admin,
        'created_at' => now(),
        'updated_at' => now()
    ]);
    
    echo "✅ Mensaje creado con ID: $mensajeId\n";
    
    // Insertar destinatario
    DB::table('destinatarios_mensaje')->insert([
        'id_mensaje' => $mensajeId,
        'id_alumno' => $alumno->id_alumno,
        'leido' => false,
        'created_at' => now(),
        'updated_at' => now()
    ]);
    
    echo "✅ Destinatario asignado\n\n";
    
    // Verificar que se creó correctamente
    $mensaje = DB::table('mensajes')->where('id_mensaje', $mensajeId)->first();
    $destinatario = DB::table('destinatarios_mensaje')->where('id_mensaje', $mensajeId)->first();
    
    echo "=== VERIFICACIÓN ===\n";
    echo "✅ Mensaje: {$mensaje->titulo}\n";
    echo "✅ Prioridad: {$mensaje->prioridad}\n";
    echo "✅ Leído: " . ($destinatario->leido ? 'Sí' : 'No') . "\n";
    echo "✅ Fecha: {$mensaje->created_at}\n\n";
    
    echo "🎉 ¡Mensaje de prueba creado exitosamente!\n";
    echo "   Ahora puede probar el sistema desde la interfaz web.\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n=== FIN ===\n"; 