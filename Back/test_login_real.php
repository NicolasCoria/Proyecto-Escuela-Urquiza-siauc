<?php

// Script para probar el rendimiento del login con credenciales reales
$baseUrl = 'http://localhost:8000/api';

echo "=== PRUEBA DE RENDIMIENTO LOGIN (CREDENCIALES REALES) ===\n\n";

// Test 1: Login básico optimizado
echo "1. Probando login básico optimizado...\n";
$start = microtime(true);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/alumnos/login');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'prueba@terciariourquiza.edu.ar', // Cambiar por email real
    'password' => 'Prueba123'    // Cambiar por password real
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
echo "Respuesta: " . substr($response, 0, 300) . "...\n\n";

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

        // Test 3: Cargar datos adicionales en paralelo
        echo "3. Probando carga de datos adicionales en paralelo...\n";
        $start = microtime(true);

        $ch1 = curl_init();
        curl_setopt($ch1, CURLOPT_URL, $baseUrl . '/alumno/unidades-carrera');
        curl_setopt($ch1, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $data['token'],
            'Accept: application/json'
        ]);
        curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);

        $ch2 = curl_init();
        curl_setopt($ch2, CURLOPT_URL, $baseUrl . '/alumno/unidades-aprobadas');
        curl_setopt($ch2, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $data['token'],
            'Accept: application/json'
        ]);
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);

        $ch3 = curl_init();
        curl_setopt($ch3, CURLOPT_URL, $baseUrl . '/alumno/unidades-inscriptas');
        curl_setopt($ch3, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $data['token'],
            'Accept: application/json'
        ]);
        curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);

        $mh = curl_multi_init();
        curl_multi_add_handle($mh, $ch1);
        curl_multi_add_handle($mh, $ch2);
        curl_multi_add_handle($mh, $ch3);

        $active = null;
        do {
            $mrc = curl_multi_exec($mh, $active);
        } while ($mrc == CURLM_CALL_MULTI_PERFORM);

        while ($active && $mrc == CURLM_OK) {
            if (curl_multi_select($mh) != -1) {
                do {
                    $mrc = curl_multi_exec($mh, $active);
                } while ($mrc == CURLM_CALL_MULTI_PERFORM);
            }
        }

        $response1 = curl_multi_getcontent($ch1);
        $response2 = curl_multi_getcontent($ch2);
        $response3 = curl_multi_getcontent($ch3);

        curl_multi_remove_handle($mh, $ch1);
        curl_multi_remove_handle($mh, $ch2);
        curl_multi_remove_handle($mh, $ch3);
        curl_multi_close($mh);

        $end = microtime(true);
        $time = ($end - $start) * 1000;

        echo "Tiempo de respuesta paralela: " . number_format($time, 2) . " ms\n";
        echo "Respuestas obtenidas: " . strlen($response1) + strlen($response2) + strlen($response3) . " bytes\n\n";
    }
}

echo "=== FIN DE PRUEBA ===\n";
echo "\nNOTA: Cambia las credenciales en el script para usar datos reales\n"; 