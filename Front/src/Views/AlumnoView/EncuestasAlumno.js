import React, { useEffect, useState } from 'react';
import axiosClient from '../../Components/Shared/Axios';
import EncuestaForm from './EncuestaForm';
import Spinner from '../../Components/Shared/Spinner';
import styles from './alumnoView.module.css';

const EncuestasAlumno = () => {
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleEncuestaRespondida = (idEncuesta) => {
    setEncuestas((prevEncuestas) =>
      prevEncuestas.map((encuesta) =>
        encuesta.id_encuesta === idEncuesta
          ? { ...encuesta, respondida: true, fecha_respuesta: new Date().toISOString() }
          : encuesta
      )
    );
  };

  const isEncuestaVencida = (encuesta) => {
    if (!encuesta.fecha_fin) return false;
    return new Date() > new Date(encuesta.fecha_fin);
  };

  const isEncuestaDisponible = (encuesta) => {
    if (!encuesta.activa) return false;
    if (encuesta.fecha_inicio && new Date() < new Date(encuesta.fecha_inicio)) return false;
    if (encuesta.fecha_fin && new Date() > new Date(encuesta.fecha_fin)) return false;
    return true;
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
    <div className={styles.encuestasContainer}>
      <h2 className={styles.encuestasTitle}>Encuestas Académicas</h2>

      <div className={styles.encuestasGrid}>
        {encuestas.map((encuesta) => {
          const vencida = isEncuestaVencida(encuesta);
          const disponible = isEncuestaDisponible(encuesta);

          return (
            <div
              key={encuesta.id_encuesta}
              className={`${styles.encuestaCard} ${encuesta.respondida ? styles.respondida : ''}`}
            >
              <div className={styles.encuestaHeader}>
                <div className={styles.encuestaContent}>
                  <h3 className={styles.encuestaTitle}>{encuesta.titulo}</h3>
                  {encuesta.descripcion && (
                    <p className={styles.encuestaDescription}>{encuesta.descripcion}</p>
                  )}
                  <div className={styles.encuestaInfo}>
                    <p>
                      <strong>Asignada:</strong>{' '}
                      {new Date(encuesta.fecha_asignacion).toLocaleDateString()}
                    </p>
                    {encuesta.fecha_inicio && encuesta.fecha_fin && (
                      <p>
                        <strong>Período:</strong>{' '}
                        {new Date(encuesta.fecha_inicio).toLocaleDateString()} -{' '}
                        {new Date(encuesta.fecha_fin).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className={styles.encuestaStatus}>
                  {encuesta.respondida ? (
                    <span className={`${styles.statusBadge} ${styles.statusRespondida}`}>
                      ✅ Respondida
                    </span>
                  ) : vencida ? (
                    <span className={`${styles.statusBadge} ${styles.statusVencida}`}>
                      ⏰ Vencida
                    </span>
                  ) : !disponible ? (
                    <span className={`${styles.statusBadge} ${styles.statusNoDisponible}`}>
                      🔒 No disponible
                    </span>
                  ) : (
                    <span className={`${styles.statusBadge} ${styles.statusPendiente}`}>
                      ⏳ Pendiente
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.encuestaBody}>
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
                      {new Date(encuesta.fecha_respuesta).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {!encuesta.respondida && vencida && (
                  <div className={styles.vencidaMessage}>
                    <div className={styles.vencidaTitle}>⏰ Encuesta vencida</div>
                    <div className={styles.vencidaDescription}>
                      El período para responder esta encuesta ha finalizado.
                    </div>
                  </div>
                )}

                {!encuesta.respondida && !disponible && !vencida && (
                  <div className={styles.noDisponibleMessage}>
                    <div className={styles.noDisponibleTitle}>🔒 Encuesta no disponible</div>
                    <div className={styles.noDisponibleDescription}>
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
