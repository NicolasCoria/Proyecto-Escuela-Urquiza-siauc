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
        .stats-section {
            margin-bottom: 30px;
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
        }
        .stats-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
        }
        .stat-item {
            flex: 1;
            min-width: 200px;
            background: white;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #ddd;
        }
        .stat-title {
            font-weight: bold;
            color: #555;
            margin-bottom: 5px;
        }
        .stat-value {
            font-size: 16px;
            font-weight: bold;
            color: #333;
        }
        .categoria-stats, .estado-stats {
            margin-bottom: 15px;
        }
        .categoria-stats h4, .estado-stats h4 {
            margin: 0 0 10px 0;
            color: #555;
        }
        .categoria-item, .estado-item {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            border-bottom: 1px solid #eee;
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
        <p><strong>Total de solicitudes:</strong> {{ $datos['estadisticas']['total_solicitudes'] }}</p>
    </div>

    @if($datos['estadisticas']['total_solicitudes'] > 0)
        <!-- Estadísticas Generales -->
        <div class="stats-section">
            <h3>Estadísticas Generales</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-title">Tiempo Promedio de Respuesta</div>
                    <div class="stat-value">{{ $datos['estadisticas']['tiempo_promedio_respuesta'] }} horas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-title">Tiempo Mínimo de Respuesta</div>
                    <div class="stat-value">{{ $datos['estadisticas']['tiempo_minimo_respuesta'] }} horas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-title">Tiempo Máximo de Respuesta</div>
                    <div class="stat-value">{{ $datos['estadisticas']['tiempo_maximo_respuesta'] }} horas</div>
                </div>
            </div>

            <!-- Estadísticas por Categoría -->
            <div class="categoria-stats">
                <h4>Solicitudes por Categoría</h4>
                @foreach($datos['estadisticas']['por_categoria'] as $categoria => $cantidad)
                    <div class="categoria-item">
                        <span>{{ ucfirst(str_replace('_', ' ', $categoria)) }}</span>
                        <span><strong>{{ $cantidad }}</strong></span>
                    </div>
                @endforeach
            </div>

            <!-- Estadísticas por Estado -->
            <div class="estado-stats">
                <h4>Solicitudes por Estado</h4>
                @foreach($datos['estadisticas']['por_estado'] as $estado => $cantidad)
                    <div class="estado-item">
                        <span>{{ ucfirst(str_replace('_', ' ', $estado)) }}</span>
                        <span><strong>{{ $cantidad }}</strong></span>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- Tabla de Solicitudes -->
        <h3>Detalle de Solicitudes</h3>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Alumno</th>
                    <th>DNI</th>
                    <th>Categoría</th>
                    <th>Asunto</th>
                    <th>Estado</th>
                    <th>Fecha Creación</th>
                    <th>Fecha Respuesta</th>
                    <th>Tiempo Respuesta (horas)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($datos['solicitudes'] as $solicitud)
                    <tr>
                        <td>{{ $solicitud->id }}</td>
                        <td>{{ $solicitud->nombre_alumno }} {{ $solicitud->apellido_alumno }}</td>
                        <td>{{ $solicitud->dni_alumno }}</td>
                        <td>{{ ucfirst(str_replace('_', ' ', $solicitud->categoria)) }}</td>
                        <td>{{ $solicitud->asunto }}</td>
                        <td>{{ ucfirst(str_replace('_', ' ', $solicitud->estado)) }}</td>
                        <td>{{ \Carbon\Carbon::parse($solicitud->fecha_creacion)->format('d/m/Y H:i') }}</td>
                        <td>
                            @if($solicitud->fecha_respuesta)
                                {{ \Carbon\Carbon::parse($solicitud->fecha_respuesta)->format('d/m/Y H:i') }}
                            @else
                                -
                            @endif
                        </td>
                        <td>
                            @if($solicitud->fecha_respuesta && in_array($solicitud->estado, ['respondida', 'rechazada']))
                                @php
                                    $creacion = \Carbon\Carbon::parse($solicitud->fecha_creacion);
                                    $respuesta = \Carbon\Carbon::parse($solicitud->fecha_respuesta);
                                    $tiempo = $creacion->diffInHours($respuesta);
                                @endphp
                                {{ $tiempo }}
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="no-data">
            No se encontraron solicitudes para generar el informe.
        </div>
    @endif

    <div class="footer">
        <p>Informe generado automáticamente por el Sistema de Gestión Escolar</p>
        <p>Página 1</p>
    </div>
</body>
</html> 