<?php

// Script para probar el rendimiento del login
$baseUrl = 'http://localhost:8000/api';

echo "=== PRUEBA DE RENDIMIENTO LOGIN ===\n\n";

// Test 1: Login básico (sin unidades disponibles)
echo "1. Probando login básico...\n";
$start = microtime(true);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/alumnos/login');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'test@test.com',
    'password' => 'password'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$end = microtime(true);
$time = ($end - $start) * 1000; // Convertir a milisegundos

echo "Tiempo de respuesta: " . number_format($time, 2) . " ms\n";
echo "Código HTTP: $httpCode\n";
echo "Respuesta: " . substr($response, 0, 200) . "...\n\n";

// Test 2: Login con unidades disponibles (endpoint optimizado)
if ($httpCode === 200) {
    $data = json_decode($response, true);
    if (isset($data['token'])) {
        echo "2. Probando carga de unidades disponibles...\n";
        $start = microtime(true);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $baseUrl . '/alumno/unidades-disponibles-optimized');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $data['token'],
            'Accept: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $end = microtime(true);
        $time = ($end - $start) * 1000;

        echo "Tiempo de respuesta: " . number_format($time, 2) . " ms\n";
        echo "Código HTTP: $httpCode\n";
        echo "Respuesta: " . substr($response, 0, 200) . "...\n\n";
    }
}

echo "=== FIN DE PRUEBA ===\n"; 