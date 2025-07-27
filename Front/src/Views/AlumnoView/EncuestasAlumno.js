import React, { useEffect, useState } from 'react';
import axiosClient from '../../Components/Shared/Axios';
import EncuestaForm from './EncuestaForm';
import Spinner from '../../Components/Shared/Spinner';

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
    <div className="encuestasContainer">
      <h2 className="encuestasTitle">Encuestas Académicas</h2>

      <div className="encuestasGrid">
        {encuestas.map((encuesta) => {
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
                  <div className="completedMessage">
                    <div className="completedTitle">✅ Encuesta completada</div>
                    <div className="completedDate">
                      {new Date(encuesta.fecha_respuesta).toLocaleDateString()}
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
