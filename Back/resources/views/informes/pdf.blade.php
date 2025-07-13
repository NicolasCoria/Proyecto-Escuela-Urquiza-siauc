<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $titulo }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .subtitle {
            font-size: 14px;
            color: #666;
        }
        .info {
            margin-bottom: 20px;
        }
        .info p {
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        .no-data {
            text-align: center;
            font-style: italic;
            color: #666;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">{{ $titulo }}</div>
        <div class="subtitle">Escuela Urquiza</div>
    </div>

    <div class="info">
        <p><strong>Fecha de generación:</strong> {{ $fecha_generacion }}</p>
        <p><strong>Total de registros:</strong> {{ count($datos) }}</p>
    </div>

    @if(count($datos) > 0)
        <table>
            <thead>
                <tr>
                    @foreach(array_keys((array) $datos[0]) as $header)
                        <th>{{ ucfirst(str_replace('_', ' ', $header)) }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @foreach($datos as $row)
                    <tr>
                        @foreach((array) $row as $value)
                            <td>{{ is_array($value) ? json_encode($value) : $value }}</td>
                        @endforeach
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="no-data">
            No se encontraron datos para generar el informe.
        </div>
    @endif

    <div class="footer">
        <p>Informe generado automáticamente por el Sistema de Gestión Escolar</p>
        <p>Página 1</p>
    </div>
</body>
</html> 