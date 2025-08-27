import React, { useEffect, useState } from 'react';
import axiosClient from '../../Components/Shared/Axios';

const NotificacionesEncuestas = () => {
  const [encuestasNuevas, setEncuestasNuevas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEncuestasNuevas = async () => {
      try {
        const response = await axiosClient.get('/alumno/encuestas');

        if (response.data.success) {
          // Filtrar solo las encuestas que no han sido notificadas
          const nuevas = response.data.encuestas.filter(
            (encuesta) => !encuesta.notificado && !encuesta.respondida
          );
          setEncuestasNuevas(nuevas);
        }
      } catch (err) {
        console.error('Error fetching encuestas nuevas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEncuestasNuevas();
  }, []);

  const marcarComoNotificada = async (idEncuesta) => {
    try {
      await axiosClient.post('/alumno/encuestas/marcar-notificada', {
        id_encuesta: idEncuesta
      });

      // Remover la encuesta de la lista de nuevas
      setEncuestasNuevas((prev) => prev.filter((encuesta) => encuesta.id_encuesta !== idEncuesta));
    } catch (err) {
      console.error('Error marcando como notificada:', err);
    }
  };

  if (loading) return null;
  if (encuestasNuevas.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        maxWidth: '400px'
      }}
    >
      {encuestasNuevas.map((encuesta) => (
        <div
          key={encuesta.id_encuesta}
          style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>
                📋 Nueva Encuesta Disponible
              </h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#856404' }}>
                <strong>{encuesta.titulo}</strong>
              </p>
              {encuesta.descripcion && (
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#856404' }}>
                  {encuesta.descripcion}
                </p>
              )}
              <button
                onClick={() => marcarComoNotificada(encuesta.id_encuesta)}
                style={{
                  backgroundColor: '#856404',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  marginRight: '8px'
                }}
              >
                Entendido
              </button>
              <button
                onClick={() => (window.location.href = '/alumno/encuestas')}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Ver Encuesta
              </button>
            </div>
            <button
              onClick={() => marcarComoNotificada(encuesta.id_encuesta)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#856404',
                padding: '0',
                marginLeft: '10px'
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `
        }}
      />
    </div>
  );
};

export default NotificacionesEncuestas;
