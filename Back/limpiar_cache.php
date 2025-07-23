<?php
// 🧹 Script para limpiar caché cuando sea necesario
// Ejecutar: php limpiar_cache.php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Cache;

// Limpiar caché específico
Cache::forget('carreras_list');
Cache::forget('grados_list');
Cache::forget('materias_list');

echo "✅ Caché limpiado exitosamente\n";
echo "📊 Cachés eliminados:\n";
echo "   - carreras_list\n";
echo "   - grados_list\n";
echo "   - materias_list\n"; 