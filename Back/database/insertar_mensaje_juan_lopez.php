<?php

// Script para insertar un mensaje específico para Juan Lopez
// Ejecutar desde la raíz del proyecto: php database/insertar_mensaje_juan_lopez.php

require_once __DIR__ . '/../vendor/autoload.php';

// Inicializar Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== INSERTAR MENSAJE PARA JUAN LOPEZ ===\n\n";

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
    
    // Buscar específicamente a Juan Lopez
    $alumno = DB::table('alumno')->where('id_alumno', 27)->first();
    if (!$alumno) {
        echo "❌ ERROR: No se encontró Juan Lopez (ID: 27)\n";
        exit(1);
    }
    
    echo "✅ Administrador encontrado: {$admin->nombre} {$admin->apellido}\n";
    echo "✅ Alumno encontrado: {$alumno->nombre} {$alumno->apellido} (ID: {$alumno->id_alumno})\n\n";
    
    // Insertar mensaje de prueba
    $mensajeId = DB::table('mensajes')->insertGetId([
        'titulo' => '¡Bienvenido al Sistema de Comunicaciones!',
        'contenido' => "Hola Juan,\n\nEste es un mensaje de prueba para verificar que el sistema de comunicaciones funciona correctamente.\n\nCaracterísticas del sistema:\n- Prioridades: baja, media, alta, urgente\n- Estados: leído/no leído\n- Estadísticas en tiempo real\n- Interfaz responsive\n\n¡El sistema está funcionando perfectamente!\n\nSaludos,\nAdministración",
        'prioridad' => 'alta',
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
    
    echo "🎉 ¡Mensaje creado exitosamente para Juan Lopez!\n";
    echo "   Ahora puede probar el sistema desde la interfaz web.\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n=== FIN ===\n"; 