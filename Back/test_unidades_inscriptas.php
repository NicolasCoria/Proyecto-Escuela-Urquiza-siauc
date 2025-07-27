<?php

// Script para probar el endpoint de unidades inscriptas
$baseUrl = 'http://localhost:8000/api';

echo "=== PRUEBA ENDPOINT UNIDADES INSCRIPTAS ===\n\n";

// Primero hacer login para obtener token
echo "1. Haciendo login...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/alumnos/login');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'prueba@terciariourquiza.edu.ar',
    'password' => 'Prueba123'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if (isset($data['token'])) {
        echo "Login exitoso. Token obtenido.\n\n";
        
        // Probar endpoint de unidades inscriptas
        echo "2. Probando endpoint unidades inscriptas...\n";
        $start = microtime(true);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $baseUrl . '/alumno/unidades-inscriptas');
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
        echo "Respuesta completa: " . $response . "\n\n";
        
        // Verificar si es un array
        $responseData = json_decode($response, true);
        if (is_array($responseData)) {
            echo "✅ Respuesta es un array válido\n";
            echo "Cantidad de elementos: " . count($responseData) . "\n";
            if (count($responseData) > 0) {
                echo "Primer elemento: " . json_encode($responseData[0]) . "\n";
            }
        } else {
            echo "❌ Respuesta NO es un array\n";
            echo "Tipo de respuesta: " . gettype($responseData) . "\n";
        }
        
    } else {
        echo "❌ No se pudo obtener token del login\n";
    }
} else {
    echo "❌ Error en login. Código HTTP: $httpCode\n";
    echo "Respuesta: $response\n";
}

echo "\n=== FIN DE PRUEBA ===\n"; 