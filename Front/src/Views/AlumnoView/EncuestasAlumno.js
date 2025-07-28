import React, { useEffect, useState } from 'react';
import axiosClient from '../../Components/Shared/Axios';
import EncuestaForm from './EncuestaForm';
import Spinner from '../../Components/Shared/Spinner';

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
          setEncuestas(response.data.encuestas);
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
    if (!encuesta.fecha_fin) return false;
    if (encuesta.respondida) return false;

    const fechaActual = new Date();
    const fechaFin = new Date(encuesta.fecha_fin);
    const fechaActualStr = fechaActual.toISOString().split('T')[0];
    const fechaFinStr = fechaFin.toISOString().split('T')[0];

    return fechaActualStr > fechaFinStr;
  };

  const isEncuestaDisponible = (encuesta) => {
    if (!encuesta.activa) return false;
    if (encuesta.respondida) return false;

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
  };

  // Función para ordenar encuestas por prioridad
  const ordenarEncuestas = (encuestas) => {
    return encuestas.sort((a, b) => {
      const aVencida = isEncuestaVencida(a);
      const bVencida = isEncuestaVencida(b);
      const aRespondida = a.respondida;
      const bRespondida = b.respondida;
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
      const fechaA = new Date(a.fecha_asignacion);
      const fechaB = new Date(b.fecha_asignacion);
      return fechaB - fechaA;
    });
  };

  const handleEncuestaRespondida = (idEncuesta) => {
    setEncuestas((prevEncuestas) => {
      const encuestasActualizadas = prevEncuestas.map((encuesta) =>
        encuesta.id_encuesta === idEncuesta
          ? { ...encuesta, respondida: true, fecha_respuesta: new Date().toISOString() }
          : encuesta
      );
      return ordenarEncuestas(encuestasActualizadas);
    });
  };

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto'
        }}
      >
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (encuestas.length === 0) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto'
        }}
      >
        <h2>Encuestas Académicas</h2>
        <p>No tienes encuestas asignadas en este momento.</p>
      </div>
    );
  }

  return (
    <div className="encuestasContainer">
      <h2 className="encuestasTitle">Encuestas Académicas</h2>

      <div className={styles.encuestasGrid}>
        {ordenarEncuestas([...encuestas]).map((encuesta) => {
          const vencida = isEncuestaVencida(encuesta);
          const disponible = isEncuestaDisponible(encuesta);

          return (
            <div
              key={encuesta.id_encuesta}
              className={`encuestaCard ${encuesta.respondida ? 'respondida' : ''}`}
            >
              <div className="encuestaHeader">
                <div className="encuestaContent">
                  <h3 className="encuestaTitle">{encuesta.titulo}</h3>
                  {encuesta.descripcion && (
                    <p className="encuestaDescription">{encuesta.descripcion}</p>
                  )}
                  <div className="encuestaInfo">
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
                <div className="encuestaStatus">
                  {encuesta.respondida ? (
                    <span className="statusBadge statusRespondida">✅ Respondida</span>
                  ) : vencida ? (
                    <span className="statusBadge statusVencida">⏰ Vencida</span>
                  ) : !disponible ? (
                    <span className="statusBadge statusNoDisponible">🔒 No disponible</span>
                  ) : (
                    <span className="statusBadge statusPendiente">⏳ Pendiente</span>
                  )}
                </div>
              </div>

              <div className="encuestaBody">
                {!encuesta.respondida && disponible && !vencida && (
                  <EncuestaForm
                    encuesta={encuesta}
                    onEncuestaRespondida={() => handleEncuestaRespondida(encuesta.id_encuesta)}
                  />
                )}

                {encuesta.respondida && (
                  <div className={styles.completedMessage}>
                    <div className={styles.completedTitle}>✅ Encuesta completada</div>
                    <div className={styles.completedDate}>
                      {formatearFecha(encuesta.fecha_respuesta)}
                    </div>
                  </div>
                )}

                {!encuesta.respondida && vencida && (
                  <div className="vencidaMessage">
                    <div className="vencidaTitle">⏰ Encuesta vencida</div>
                    <div className="vencidaDescription">
                      El período para responder esta encuesta ha finalizado.
                    </div>
                  </div>
                )}

                {!encuesta.respondida && !disponible && !vencida && (
                  <div className="noDisponibleMessage">
                    <div className="noDisponibleTitle">🔒 Encuesta no disponible</div>
                    <div className="noDisponibleDescription">
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
