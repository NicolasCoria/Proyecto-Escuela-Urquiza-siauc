<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Comprobante de Inscripción</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 15px;
            background: #fff;
            color: #222;
            margin: 0;
            padding: 0;
        }
        .comprobante-container {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.07);
            max-width: 600px;
            margin: 30px auto;
            padding: 32px 28px 28px 28px;
            border: 1px solid #e0e0e0;
        }
        .header {
            text-align: center;
            margin-bottom: 24px;
        }
        .header h2 {
            margin: 0 0 8px 0;
            font-size: 24px;
            font-weight: 700;
        }
        .info {
            margin-bottom: 24px;
            background: #f8f8f8;
            border-radius: 8px;
            padding: 16px 18px;
        }
        .info strong {
            display: inline-block;
            min-width: 90px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 18px;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
        }
        th, td {
            border: 1px solid #e0e0e0;
            padding: 10px 8px;
            text-align: left;
        }
        th {
            background: #f0f0f0;
            font-weight: 600;
        }
        tr:nth-child(even) {
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div class="comprobante-container">
        <div class="header">
            <h2>Comprobante de Inscripción</h2>
            <p>Fecha y hora: {{ $fecha }}</p>
        </div>
        <div class="info">
            <div><strong>Alumno:</strong> {{ $alumno->nombre }} {{ $alumno->apellido }}</div>
            @if($carrera)
                <div><strong>Carrera:</strong> {{ $carrera->nombre ?? $carrera->Carrera ?? $carrera->carrera ?? '' }}</div>
            @endif
        </div>
        <h3 style="margin-bottom: 10px;">Unidades Curriculares Inscriptas</h3>
        <table>
            <thead>
                <tr>
                    <th style="width: 40px;">#</th>
                    <th>Unidad Curricular</th>
                </tr>
            </thead>
            <tbody>
                @foreach($ucs as $i => $uc)
                    <tr>
                        <td>{{ $i+1 }}</td>
                        <td>{{ $uc->unidad_curricular ?? $uc->Unidad_Curricular ?? $uc->nombre ?? '' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</body>
</html> 