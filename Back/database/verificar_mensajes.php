<?php

// Script de verificación para las tablas de mensajes
// Ejecutar desde la raíz del proyecto: php database/verificar_mensajes.php

require_once __DIR__ . '/../vendor/autoload.php';

// Inicializar Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== VERIFICACIÓN DE TABLAS DE MENSAJES ===\n\n";

try {
    // Verificar conexión a la base de datos
    echo "1. Verificando conexión a la base de datos...\n";
    DB::connection()->getPdo();
    echo "✅ Conexión exitosa\n\n";

    // Verificar si las tablas existen
    echo "2. Verificando existencia de tablas...\n";
    
    $tablas = ['mensajes', 'destinatarios_mensaje'];
    foreach ($tablas as $tabla) {
        if (Schema::hasTable($tabla)) {
            echo "✅ Tabla '$tabla' existe\n";
            
            // Contar registros
            $count = DB::table($tabla)->count();
            echo "   - Registros: $count\n";
        } else {
            echo "❌ Tabla '$tabla' NO existe\n";
        }
    }
    
    echo "\n3. Verificando estructura de tablas...\n";
    
    if (Schema::hasTable('mensajes')) {
        $columnas = DB::select("DESCRIBE mensajes");
        echo "✅ Tabla 'mensajes' - Columnas:\n";
        foreach ($columnas as $columna) {
            echo "   - {$columna->Field} ({$columna->Type})\n";
        }
    }
    
    if (Schema::hasTable('destinatarios_mensaje')) {
        $columnas = DB::select("DESCRIBE destinatarios_mensaje");
        echo "✅ Tabla 'destinatarios_mensaje' - Columnas:\n";
        foreach ($columnas as $columna) {
            echo "   - {$columna->Field} ({$columna->Type})\n";
        }
    }
    
    echo "\n4. Verificando datos de prueba...\n";
    
    // Verificar si hay administradores
    $adminCount = DB::table('administrador')->count();
    echo "   - Administradores: $adminCount\n";
    
    // Verificar si hay alumnos
    $alumnoCount = DB::table('alumno')->count();
    echo "   - Alumnos: $alumnoCount\n";
    
    // Verificar si hay mensajes
    if (Schema::hasTable('mensajes')) {
        $mensajeCount = DB::table('mensajes')->count();
        echo "   - Mensajes: $mensajeCount\n";
        
        if ($mensajeCount > 0) {
            $mensajes = DB::table('mensajes')->limit(3)->get();
            echo "   - Últimos mensajes:\n";
            foreach ($mensajes as $mensaje) {
                echo "     * ID: {$mensaje->id_mensaje}, Título: {$mensaje->titulo}\n";
            }
        }
    }
    
    // Verificar destinatarios
    if (Schema::hasTable('destinatarios_mensaje')) {
        $destinatarioCount = DB::table('destinatarios_mensaje')->count();
        echo "   - Destinatarios: $destinatarioCount\n";
    }
    
    echo "\n=== RESUMEN ===\n";
    
    if (!Schema::hasTable('mensajes') || !Schema::hasTable('destinatarios_mensaje')) {
        echo "❌ PROBLEMA: Las tablas de mensajes no están creadas.\n";
        echo "   Solución: Ejecute el SQL en Back/database/sql_mensajes.sql\n";
    } elseif ($adminCount == 0) {
        echo "⚠️  ADVERTENCIA: No hay administradores en la base de datos.\n";
        echo "   Los mensajes necesitan un administrador creador.\n";
    } elseif ($alumnoCount == 0) {
        echo "⚠️  ADVERTENCIA: No hay alumnos en la base de datos.\n";
        echo "   Los mensajes necesitan destinatarios.\n";
    } else {
        echo "✅ Todo parece estar configurado correctamente.\n";
        echo "   Si sigue teniendo problemas, revise los logs de Laravel.\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n=== FIN DE VERIFICACIÓN ===\n"; 