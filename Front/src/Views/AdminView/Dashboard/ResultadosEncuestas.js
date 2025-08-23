import React, { useState, useEffect } from 'react';
import axiosClient from '../../../Components/Shared/Axios';
import Spinner from '../../../Components/Shared/Spinner';
import styles from './dashboard.module.css';

const ResultadosEncuestas = () => {
  const [encuestas, setEncuestas] = useState([]);
  const [selectedEncuesta, setSelectedEncuesta] = useState('');
  const [resultados, setResultados] = useState(null);
  const [loadingEncuestas, setLoadingEncuestas] = useState(false);
  const [loadingResultados, setLoadingResultados] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mostrarTodasEncuestas, setMostrarTodasEncuestas] = useState(false);

  // Cargar encuestas al montar el componente
  useEffect(() => {
    cargarEncuestas();
  }, [mostrarTodasEncuestas]);

  // Cargar resultados cuando se selecciona una encuesta
  useEffect(() => {
    if (selectedEncuesta) {
      cargarResultados(selectedEncuesta);
    }
  }, [selectedEncuesta]);

  const cargarEncuestas = async () => {
    try {
      setLoadingEncuestas(true);
      setError('');

      const params = {};
      if (!mostrarTodasEncuestas) {
        params.fecha_actual = new Date().toISOString().split('T')[0];
      }

      const response = await axiosClient.get('/admin/dashboard-data', { params });

      if (response.data.success) {
        const data = response.data.data;
        setEncuestas(data.encuestas || []);
      }
    } catch (err) {
      console.error('Error cargando encuestas:', err);
      setError('Error al cargar las encuestas');
    } finally {
      setLoadingEncuestas(false);
    }
  };

  const cargarResultados = async (idEncuesta) => {
    try {
      setLoadingResultados(true);
      setError('');

      const response = await axiosClient.get(`/encuestas/${idEncuesta}/estadisticas`);

      if (response.data.success) {
        setResultados(response.data.estadisticas);
      } else {
        setError('Error al cargar los resultados de la encuesta');
      }
    } catch (err) {
      console.error('Error cargando resultados:', err);
      if (err.response?.status === 404) {
        setError('Esta encuesta no tiene respuestas aún');
      } else {
        setError('Error al cargar los resultados de la encuesta');
      }
      setResultados(null);
    } finally {
      setLoadingResultados(false);
    }
  };

  const recargarDatos = async () => {
    setError('');
    setSuccess('');
    await cargarEncuestas();
    if (selectedEncuesta) {
      await cargarResultados(selectedEncuesta);
    }
    setSuccess('Datos actualizados correctamente');
    setTimeout(() => setSuccess(''), 3000);
  };

  const calcularTotalRespuestas = () => {
    if (!resultados || resultados.length === 0) return 0;
    return resultados[0]?.total_respuestas || 0;
  };

  const calcularTasaRespuesta = () => {
    if (!resultados || resultados.length === 0) return 0;
    // Aquí podrías obtener el total de alumnos asignados desde la API
    // Por ahora usamos el total de respuestas como aproximación
    const totalRespuestas = calcularTotalRespuestas();
    return totalRespuestas > 0 ? 'Con respuestas' : 'Sin respuestas';
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className={`${styles.statCard} ${styles[color] || styles.blue}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statContent}>
        <h3>{title}</h3>
        <div className={styles.statValue}>{value}</div>
        {subtitle && <div className={styles.statSubtitle}>{subtitle}</div>}
      </div>
    </div>
  );

  return (
    <div style={{ background: '#f9f9f9', padding: 24, borderRadius: 8, marginBottom: 32 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }}
      >
        <h3>📋 Resultados de Encuestas</h3>
        <div className={styles.buttonGroup}>
          <button
            onClick={recargarDatos}
            className={`${styles.button} ${styles['button.secondary']}`}
            title="Recargar datos"
          >
            🔄 Recargar
          </button>
          <button
            onClick={() => setMostrarTodasEncuestas(!mostrarTodasEncuestas)}
            className={`${styles.button} ${
              mostrarTodasEncuestas ? styles['button.danger'] : styles['button.success']
            }`}
          >
            {mostrarTodasEncuestas ? 'Mostrar Solo Activas' : 'Mostrar Todas'}
          </button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: mostrarTodasEncuestas ? '#fff3cd' : '#d4edda',
          color: mostrarTodasEncuestas ? '#856404' : '#155724',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '14px'
        }}
      >
        {mostrarTodasEncuestas
          ? '⚠️ Mostrando todas las encuestas (incluyendo vencidas)'
          : '✅ Mostrando solo encuestas activas en el período actual'}
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}
        >
          ❌ {error}
        </div>
      )}

      {success && (
        <div
          style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}
        >
          ✅ {success}
        </div>
      )}

      {/* Selector de Encuesta */}
      <div className={styles.selectGroup}>
        <label>
          <strong>Seleccionar Encuesta:</strong>
          {loadingEncuestas ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '20px',
                minHeight: '100px'
              }}
            >
              <Spinner />
            </div>
          ) : (
            <select
              value={selectedEncuesta}
              onChange={(e) => setSelectedEncuesta(e.target.value)}
              style={{ marginTop: '10px' }}
            >
              <option value="">Selecciona una encuesta para ver sus resultados</option>
              {encuestas.map((encuesta) => {
                const fechaActual = new Date();
                const fechaInicio = encuesta.fecha_inicio ? new Date(encuesta.fecha_inicio) : null;
                const fechaFin = encuesta.fecha_fin ? new Date(encuesta.fecha_fin) : null;

                let estado = '';
                if (fechaInicio && fechaFin) {
                  if (fechaActual < fechaInicio) {
                    estado = ' (Próximamente)';
                  } else if (fechaActual > fechaFin) {
                    estado = ' (Vencida)';
                  } else {
                    estado = ' (Activa)';
                  }
                } else if (fechaInicio && !fechaFin) {
                  if (fechaActual < fechaInicio) {
                    estado = ' (Próximamente)';
                  } else {
                    estado = ' (Activa)';
                  }
                } else if (!fechaInicio && fechaFin) {
                  if (fechaActual > fechaFin) {
                    estado = ' (Vencida)';
                  } else {
                    estado = ' (Activa)';
                  }
                } else {
                  estado = ' (Sin fechas)';
                }

                return (
                  <option
                    key={encuesta.id_encuesta}
                    value={encuesta.id_encuesta}
                    style={{
                      color: estado.includes('Vencida')
                        ? '#dc3545'
                        : estado.includes('Próximamente')
                          ? '#ffc107'
                          : estado.includes('Activa')
                            ? '#28a745'
                            : '#6c757d'
                    }}
                  >
                    {encuesta.titulo} - {encuesta.carrera?.carrera || 'Sin carrera'} {estado}
                  </option>
                );
              })}
            </select>
          )}
        </label>
      </div>

      {/* Resultados de la Encuesta Seleccionada */}
      {selectedEncuesta && (
        <div style={{ marginTop: '30px' }}>
          <h4 style={{ marginBottom: '20px', color: '#333' }}>
            📊 Resultados de: {encuestas.find((e) => e.id_encuesta === selectedEncuesta)?.titulo}
          </h4>

          {loadingResultados ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '40px',
                minHeight: '200px'
              }}
            >
              <Spinner />
            </div>
          ) : resultados && resultados.length > 0 ? (
            <>
              {/* Métricas principales */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px',
                  marginBottom: '30px'
                }}
              >
                <StatCard
                  title="Total de Respuestas"
                  value={calcularTotalRespuestas()}
                  icon="📝"
                  color="blue"
                  subtitle="Alumnos que respondieron"
                />

                <StatCard
                  title="Estado"
                  value={calcularTasaRespuesta()}
                  icon="📊"
                  color="green"
                  subtitle="Tasa de participación"
                />

                <StatCard
                  title="Preguntas"
                  value={resultados.length}
                  icon="❓"
                  color="purple"
                  subtitle="Total de preguntas"
                />
              </div>

              {/* Resultados por pregunta */}
              <div style={{ marginBottom: '30px' }}>
                <h5 style={{ marginBottom: '15px', color: '#555' }}>📋 Respuestas por Pregunta:</h5>

                {resultados.map((pregunta, index) => (
                  <div
                    key={pregunta.id_pregunta}
                    style={{
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '20px',
                      marginBottom: '20px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <h6 style={{ marginBottom: '15px', color: '#333', fontSize: '16px' }}>
                      {index + 1}. {pregunta.texto}
                    </h6>

                    <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                      Total de respuestas: <strong>{pregunta.total_respuestas}</strong>
                    </div>

                    {/* Gráfico de barras para las opciones */}
                    <div style={{ marginTop: '15px' }}>
                      {pregunta.opciones.map((opcion) => (
                        <div
                          key={opcion.id_opcion}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '10px',
                            padding: '8px',
                            background: '#f8f9fa',
                            borderRadius: '4px'
                          }}
                        >
                          <div style={{ minWidth: '200px', marginRight: '15px' }}>
                            <span style={{ fontSize: '14px' }}>{opcion.texto}</span>
                          </div>

                          <div style={{ flex: 1, marginRight: '15px' }}>
                            <div
                              style={{
                                width: '100%',
                                height: '20px',
                                background: '#e9ecef',
                                borderRadius: '10px',
                                overflow: 'hidden'
                              }}
                            >
                              <div
                                style={{
                                  width: `${opcion.porcentaje}%`,
                                  height: '100%',
                                  background: '#007bff',
                                  borderRadius: '10px',
                                  transition: 'width 0.3s ease'
                                }}
                              />
                            </div>
                          </div>

                          <div style={{ minWidth: '80px', textAlign: 'right' }}>
                            <span style={{ fontWeight: 'bold', color: '#333' }}>
                              {opcion.cantidad}
                            </span>
                            <span style={{ color: '#666', marginLeft: '5px' }}>
                              ({opcion.porcentaje}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Información adicional */}
              <div
                style={{
                  background: '#e3f2fd',
                  border: '1px solid #2196f3',
                  borderRadius: '8px',
                  padding: '15px',
                  marginTop: '20px'
                }}
              >
                <h6 style={{ marginBottom: '10px', color: '#1976d2' }}>ℹ️ Información:</h6>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#1976d2' }}>
                  <li>Los porcentajes se calculan sobre el total de respuestas por pregunta</li>
                  <li>Una pregunta puede tener múltiples respuestas por alumno</li>
                  <li>Los resultados se actualizan en tiempo real</li>
                </ul>
              </div>
            </>
          ) : (
            <div
              style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                color: '#856404'
              }}
            >
              <h5 style={{ marginBottom: '10px' }}>📭 Sin Respuestas</h5>
              <p style={{ margin: 0 }}>
                Esta encuesta aún no tiene respuestas de los alumnos.
                <br />
                Los resultados aparecerán aquí una vez que los alumnos comiencen a responder.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mensaje informativo */}
      {!selectedEncuesta && (
        <div
          style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '30px',
            textAlign: 'center',
            marginTop: '30px'
          }}
        >
          <h4 style={{ color: '#6c757d', marginBottom: '15px' }}>📋 Selecciona una Encuesta</h4>
          <p style={{ color: '#6c757d', margin: 0 }}>
            Para ver los resultados, selecciona una encuesta del menú desplegable arriba.
            <br />
            Podrás ver estadísticas detalladas, gráficos y respuestas individuales.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultadosEncuestas;
