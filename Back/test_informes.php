<?php

// Configuración
$baseUrl = 'http://127.0.0.1:8000';
$adminEmail = 'admin.test@test.com';
$adminPassword = '123456';

echo "🧪 Testing Informes CU-003\n";
echo "==========================\n\n";

// 1. Test login admin
echo "1. Testing admin login...\n";
$loginData = json_encode([
    'email' => $adminEmail,
    'password' => $adminPassword
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/api/admin/login');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $loginData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   HTTP Code: $httpCode\n";
if ($httpCode === 200) {
    $loginResponse = json_decode($response, true);
    $token = $loginResponse['token'];
    echo "   ✅ Login exitoso\n";
    echo "   Token: " . substr($token, 0, 20) . "...\n\n";
} else {
    echo "   ❌ Error en login: $response\n";
    exit(1);
}

// 2. Test obtener plantillas
echo "2. Testing obtener plantillas...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/api/admin/informes/plantillas');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   HTTP Code: $httpCode\n";
if ($httpCode === 200) {
    $plantillasResponse = json_decode($response, true);
    echo "   ✅ Plantillas obtenidas: " . count($plantillasResponse['plantillas']) . " plantillas\n";
    foreach ($plantillasResponse['plantillas'] as $plantilla) {
        echo "      - " . $plantilla['nombre'] . "\n";
    }
    echo "\n";
} else {
    echo "   ❌ Error obteniendo plantillas: $response\n";
    exit(1);
}

// 3. Test generar informe (plantilla 1 - Alumnos por Carrera)
echo "3. Testing generar informe (Alumnos por Carrera)...\n";
$informeData = json_encode([
    'plantilla_id' => 1,
    'formato' => 'pdf',
    'filtros' => []
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/api/admin/informes/generar');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $informeData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json',
    'Accept: application/pdf'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   HTTP Code: $httpCode\n";
if ($httpCode === 200) {
    echo "   ✅ Informe generado exitosamente\n";
    echo "   Tamaño del archivo: " . strlen($response) . " bytes\n";
    
    // Guardar el PDF como archivo
    $filename = 'informe_test_' . date('Y-m-d_H-i-s') . '.pdf';
    file_put_contents($filename, $response);
    echo "   📄 Archivo guardado como: $filename\n";
} else {
    echo "   ❌ Error generando informe: $response\n";
}

echo "\n🎉 Testing completado!\n"; 