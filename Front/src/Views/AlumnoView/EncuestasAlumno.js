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

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (encuestas.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Encuestas Académicas</h2>
        <p>No tienes encuestas asignadas en este momento.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Encuestas Académicas</h2>
      <div style={{ display: 'grid', gap: '20px' }}>
        {encuestas.map((encuesta) => (
          <div
            key={encuesta.id_encuesta}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: encuesta.respondida ? '#f8f9fa' : '#ffffff'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{encuesta.titulo}</h3>
                {encuesta.descripcion && (
                  <p style={{ margin: '0 0 10px 0', color: '#666' }}>{encuesta.descripcion}</p>
                )}
                <div style={{ fontSize: '14px', color: '#888' }}>
                  <p>Asignada: {new Date(encuesta.fecha_asignacion).toLocaleDateString()}</p>
                  {encuesta.fecha_inicio && encuesta.fecha_fin && (
                    <p>
                      Período: {new Date(encuesta.fecha_inicio).toLocaleDateString()} -{' '}
                      {new Date(encuesta.fecha_fin).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {encuesta.respondida ? (
                  <span
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    Respondida
                  </span>
                ) : (
                  <span
                    style={{
                      backgroundColor: '#ffc107',
                      color: 'black',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    Pendiente
                  </span>
                )}
              </div>
            </div>

            {!encuesta.respondida && (
              <EncuestaForm
                encuesta={encuesta}
                onEncuestaRespondida={() => handleEncuestaRespondida(encuesta.id_encuesta)}
              />
            )}

            {encuesta.respondida && (
              <div
                style={{
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  padding: '10px',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}
              >
                ✅ Encuesta completada el {new Date(encuesta.fecha_respuesta).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EncuestasAlumno;
