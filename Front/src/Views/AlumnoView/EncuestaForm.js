import React, { useState } from 'react';
import axiosClient from '../../Components/Shared/Axios';

export default function EncuestaForm({ encuesta, onEncuestaRespondida }) {
  const [respuestas, setRespuestas] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (idPregunta, idOpcion) => {
    setRespuestas({ ...respuestas, [idPregunta]: idOpcion });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que todas las preguntas tengan respuesta
    const preguntasSinRespuesta = encuesta.preguntas.filter((pregunta) => {
      const respuesta = respuestas[pregunta.id_pregunta];
      if (pregunta.tipo === 'opcion_multiple') {
        return !respuesta || !Array.isArray(respuesta) || respuesta.length === 0;
      } else {
        return !respuesta;
      }
    });

    if (preguntasSinRespuesta.length > 0) {
      setError('Por favor, responde todas las preguntas antes de enviar.');
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      // Preparar las respuestas en el formato que espera el backend
      const respuestasFormateadas = [];

      Object.entries(respuestas).forEach(([idPregunta, valor]) => {
        if (Array.isArray(valor)) {
          // Para preguntas de opción múltiple, crear una respuesta por cada opción seleccionada
          valor.forEach((idOpcion) => {
            respuestasFormateadas.push({
              id_pregunta: parseInt(idPregunta),
              id_opcion: parseInt(idOpcion)
            });
          });
        } else {
          // Para preguntas de opción única
          respuestasFormateadas.push({
            id_pregunta: parseInt(idPregunta),
            id_opcion: parseInt(valor)
          });
        }
      });

      const response = await axiosClient.post('/encuestas/responder', {
        id_encuesta: encuesta.id_encuesta,
        respuestas: respuestasFormateadas
      });

      if (response.data.success) {
        setEnviado(true);
        if (onEncuestaRespondida) {
          onEncuestaRespondida();
        }
      } else {
        setError('Error al enviar las respuestas. Inténtalo de nuevo.');
      }
    } catch (err) {
      console.error('Error enviando encuesta:', err);

      // Manejar errores específicos
      if (err.response?.data?.duplicada) {
        setError(
          '❌ Ya has respondido esta encuesta anteriormente. No puedes responderla nuevamente.'
        );
        // Marcar como respondida en el frontend
        if (onEncuestaRespondida) {
          onEncuestaRespondida();
        }
      } else if (err.response?.status === 400) {
        setError(
          err.response?.data?.error ||
            'Error al enviar las respuestas. Verifica que la encuesta esté disponible.'
        );
      } else if (err.response?.status === 401) {
        setError('❌ Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else {
        setError(
          err.response?.data?.error || 'Error al enviar las respuestas. Inténtalo de nuevo.'
        );
      }
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div
        style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center',
          marginTop: '10px',
          border: '1px solid #c3e6cb'
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
          ✅ ¡Gracias por responder la encuesta!
        </div>
        <div style={{ fontSize: '14px', color: '#0f5132' }}>
          Tu respuesta ha sido registrada exitosamente.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
      {error && (
        <div
          style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '15px',
            border: '1px solid #f5c6cb',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '16px' }}>⚠️</span>
          {error}
        </div>
      )}

      {encuesta.preguntas &&
        encuesta.preguntas.map((pregunta, index) => (
          <div key={pregunta.id_pregunta} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ fontSize: '16px', color: '#333' }}>
                {index + 1}. {pregunta.texto}
              </strong>
              {pregunta.tipo === 'opcion_multiple' && (
                <span
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    marginLeft: '10px',
                    fontStyle: 'italic'
                  }}
                >
                  (Puedes seleccionar múltiples opciones)
                </span>
              )}
            </div>

            <div style={{ paddingLeft: '20px' }}>
              {pregunta.opciones &&
                pregunta.opciones.map((opcion) => (
                  <label
                    key={opcion.id_opcion}
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      backgroundColor:
                        pregunta.tipo === 'opcion_multiple'
                          ? respuestas[pregunta.id_pregunta]?.includes(opcion.id_opcion)
                            ? '#e3f2fd'
                            : '#fff'
                          : respuestas[pregunta.id_pregunta] === opcion.id_opcion
                            ? '#e3f2fd'
                            : '#fff',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type={pregunta.tipo === 'opcion_multiple' ? 'checkbox' : 'radio'}
                      name={`pregunta_${pregunta.id_pregunta}`}
                      value={opcion.id_opcion}
                      checked={
                        pregunta.tipo === 'opcion_multiple'
                          ? respuestas[pregunta.id_pregunta]?.includes(opcion.id_opcion)
                          : respuestas[pregunta.id_pregunta] === opcion.id_opcion
                      }
                      onChange={() => {
                        if (pregunta.tipo === 'opcion_multiple') {
                          const respuestasActuales = respuestas[pregunta.id_pregunta] || [];
                          const nuevasRespuestas = respuestasActuales.includes(opcion.id_opcion)
                            ? respuestasActuales.filter((id) => id !== opcion.id_opcion)
                            : [...respuestasActuales, opcion.id_opcion];
                          setRespuestas({
                            ...respuestas,
                            [pregunta.id_pregunta]: nuevasRespuestas
                          });
                        } else {
                          handleChange(pregunta.id_pregunta, opcion.id_opcion);
                        }
                      }}
                      required={pregunta.tipo === 'opcion_unica'}
                      style={{ marginRight: '10px' }}
                    />
                    {opcion.texto}
                  </label>
                ))}
            </div>
          </div>
        ))}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          type="submit"
          disabled={enviando}
          style={{
            backgroundColor: enviando ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: enviando ? 'not-allowed' : 'pointer',
            minWidth: '120px',
            transition: 'all 0.2s ease',
            boxShadow: enviando ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {enviando ? 'Enviando...' : 'Enviar Encuesta'}
        </button>
      </div>
    </form>
  );
}
