import React, { useEffect, useState } from 'react';
import axiosClient from '../../Components/Shared/Axios';
import EncuestaForm from './EncuestaForm';
import Spinner from '../../Components/Shared/Spinner';
import styles from './alumnoView.module.css';
import './EncuestasAlumno.css'; // Estilos de respaldo

const EncuestasAlumno = () => {
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función helper para formatear fechas en zona horaria de Argentina
  const formatearFecha = (fechaString) => {
    if (!fechaString) return '';

    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return fechaString;
    }
  };

  useEffect(() => {
    const fetchEncuestas = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosClient.get('/alumno/encuestas');

        if (response.data.success) {
          setEncuestas(response.data.encuestas || []);
        } else {
          setError('Error al cargar las encuestas');
        }
      } catch (err) {
        console.error('Error fetching encuestas:', err);
        setError(err.response?.data?.error || 'Error al cargar las encuestas');
      } finally {
        setLoading(false);
      }
    };

    fetchEncuestas();
  }, []);

  const isEncuestaVencida = (encuesta) => {
    if (!encuesta?.fecha_fin) return false;
    if (encuesta?.respondida) return false;

    try {
      const fechaActual = new Date();
      const fechaFin = new Date(encuesta.fecha_fin);
      const fechaActualStr = fechaActual.toISOString().split('T')[0];
      const fechaFinStr = fechaFin.toISOString().split('T')[0];

      return fechaActualStr > fechaFinStr;
    } catch (error) {
      console.error('Error verificando si encuesta está vencida:', error);
      return false;
    }
  };

  const isEncuestaDisponible = (encuesta) => {
    if (!encuesta?.activa) return false;
    if (encuesta?.respondida) return false;

    try {
      const fechaActual = new Date();

      if (encuesta.fecha_inicio) {
        const fechaInicio = new Date(encuesta.fecha_inicio);
        const fechaActualStr = fechaActual.toISOString().split('T')[0];
        const fechaInicioStr = fechaInicio.toISOString().split('T')[0];

        if (fechaActualStr < fechaInicioStr) {
          return false;
        }
      }

      if (encuesta.fecha_fin) {
        const fechaFin = new Date(encuesta.fecha_fin);
        const fechaActualStr = fechaActual.toISOString().split('T')[0];
        const fechaFinStr = fechaFin.toISOString().split('T')[0];

        if (fechaActualStr > fechaFinStr) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error verificando disponibilidad de encuesta:', error);
      return false;
    }
  };

  // Función para ordenar encuestas por prioridad
  const ordenarEncuestas = (encuestas) => {
    if (!Array.isArray(encuestas)) return [];

    return encuestas.sort((a, b) => {
      const aVencida = isEncuestaVencida(a);
      const bVencida = isEncuestaVencida(b);
      const aRespondida = a?.respondida || false;
      const bRespondida = b?.respondida || false;
      const aDisponible = isEncuestaDisponible(a);
      const bDisponible = isEncuestaDisponible(b);

      // Prioridad 1: Encuestas disponibles (no respondidas, no vencidas)
      if (aDisponible && !bDisponible) return -1;
      if (!aDisponible && bDisponible) return 1;

      // Prioridad 2: Encuestas respondidas
      if (aRespondida && !bRespondida) return -1;
      if (!aRespondida && bRespondida) return 1;

      // Prioridad 3: Encuestas vencidas (al final)
      if (aVencida && !bVencida) return 1;
      if (!aVencida && bVencida) return -1;

      // Prioridad 4: Por fecha de asignación (más reciente primero)
      try {
        const fechaA = new Date(a?.fecha_asignacion || 0);
        const fechaB = new Date(b?.fecha_asignacion || 0);
        return fechaB - fechaA;
      } catch (error) {
        return 0;
      }
    });
  };

  const handleEncuestaRespondida = async (idEncuesta) => {
    // Actualizar estado local inmediatamente para mejor UX
    setEncuestas((prevEncuestas) => {
      const encuestasActualizadas = prevEncuestas.map((encuesta) =>
        encuesta?.id_encuesta === idEncuesta
          ? { ...encuesta, respondida: true, fecha_respuesta: new Date().toISOString() }
          : encuesta
      );
      return ordenarEncuestas(encuestasActualizadas);
    });

    // Recargar datos desde el servidor para asegurar sincronización
    try {
      const response = await axiosClient.get('/alumno/encuestas');
      if (response.data.success) {
        const nuevasEncuestas = response.data.encuestas || [];
        setEncuestas(ordenarEncuestas(nuevasEncuestas));
      }
    } catch (err) {
      console.error('Error recargando encuestas después de responder:', err);
      // Si falla la recarga, mantener el estado local actualizado
    }
  };

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>Error</h3>
        <p style={{ color: '#666' }}>{error}</p>
      </div>
    );
  }

  if (!Array.isArray(encuestas) || encuestas.length === 0) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <h2 style={{ color: '#333', marginBottom: '15px' }}>Encuestas Académicas</h2>
        <p style={{ color: '#666' }}>No tienes encuestas asignadas en este momento.</p>
      </div>
    );
  }

  return (
    <div className={styles.encuestasContainer || 'encuestas-container'}>
      <h2 className={styles.encuestasTitle || 'encuestas-title'}>Encuestas Académicas</h2>

      <div className={styles.encuestasGrid || 'encuestas-grid'}>
        {ordenarEncuestas([...encuestas]).map((encuesta) => {
          if (!encuesta || !encuesta.id_encuesta) {
            return null; // Skip invalid encuestas
          }

          const vencida = isEncuestaVencida(encuesta);
          const disponible = isEncuestaDisponible(encuesta);

          return (
            <div
              key={encuesta.id_encuesta}
              className={`${styles.encuestaCard || 'encuesta-card'} ${encuesta.respondida ? styles.respondida || 'respondida' : ''}`}
            >
              <div className={styles.encuestaHeader || 'encuesta-header'}>
                <div className={styles.encuestaContent || 'encuesta-content'}>
                  <h3 className={styles.encuestaTitle || 'encuesta-title'}>
                    {encuesta.titulo || 'Sin título'}
                  </h3>
                  {encuesta.descripcion && (
                    <p className={styles.encuestaDescription || 'encuesta-description'}>
                      {encuesta.descripcion}
                    </p>
                  )}
                  <div className={styles.encuestaInfo || 'encuesta-info'}>
                    <p>
                      <strong>Asignada:</strong> {formatearFecha(encuesta.fecha_asignacion)}
                    </p>
                    {encuesta.fecha_inicio && encuesta.fecha_fin && (
                      <p>
                        <strong>Período:</strong> {formatearFecha(encuesta.fecha_inicio)} -{' '}
                        {formatearFecha(encuesta.fecha_fin)}
                      </p>
                    )}
                  </div>
                </div>
                <div className={styles.encuestaStatus || 'encuesta-status'}>
                  {encuesta.respondida ? (
                    <span
                      className={`${styles.statusBadge || 'status-badge'} ${styles.statusRespondida || 'status-respondida'}`}
                    >
                      ✅ Respondida
                    </span>
                  ) : vencida ? (
                    <span
                      className={`${styles.statusBadge || 'status-badge'} ${styles.statusVencida || 'status-vencida'}`}
                    >
                      ⏰ Vencida
                    </span>
                  ) : !disponible ? (
                    <span
                      className={`${styles.statusBadge || 'status-badge'} ${styles.statusNoDisponible || 'status-no-disponible'}`}
                    >
                      🔒 No disponible
                    </span>
                  ) : (
                    <span
                      className={`${styles.statusBadge || 'status-badge'} ${styles.statusPendiente || 'status-pendiente'}`}
                    >
                      ⏳ Pendiente
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.encuestaBody || 'encuesta-body'}>
                {!encuesta.respondida && disponible && !vencida && (
                  <EncuestaForm
                    encuesta={encuesta}
                    onEncuestaRespondida={() => handleEncuestaRespondida(encuesta.id_encuesta)}
                  />
                )}

                {encuesta.respondida && (
                  <div className={styles.completedMessage || 'completed-message'}>
                    <div className={styles.completedTitle || 'completed-title'}>
                      ✅ Encuesta completada
                    </div>
                    <div className={styles.completedDate || 'completed-date'}>
                      {formatearFecha(encuesta.fecha_respuesta)}
                    </div>
                  </div>
                )}

                {!encuesta.respondida && vencida && (
                  <div className={styles.vencidaMessage || 'vencida-message'}>
                    <div className={styles.vencidaTitle || 'vencida-title'}>
                      ⏰ Encuesta vencida
                    </div>
                    <div className={styles.vencidaDescription || 'vencida-description'}>
                      El período para responder esta encuesta ha finalizado.
                    </div>
                  </div>
                )}

                {!encuesta.respondida && !disponible && !vencida && (
                  <div className={styles.noDisponibleMessage || 'no-disponible-message'}>
                    <div className={styles.noDisponibleTitle || 'no-disponible-title'}>
                      🔒 Encuesta no disponible
                    </div>
                    <div className={styles.noDisponibleDescription || 'no-disponible-description'}>
                      Esta encuesta aún no está disponible para responder o ya la respondiste.
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EncuestasAlumno;
