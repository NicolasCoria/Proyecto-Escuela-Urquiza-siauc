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
    const preguntasSinRespuesta = encuesta.preguntas.filter(
      (pregunta) => !respuestas[pregunta.id_pregunta]
    );

    if (preguntasSinRespuesta.length > 0) {
      setError('Por favor, responde todas las preguntas antes de enviar.');
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      // Preparar las respuestas en el formato que espera el backend
      const respuestasFormateadas = Object.entries(respuestas).map(([idPregunta, idOpcion]) => ({
        id_pregunta: parseInt(idPregunta),
        id_opcion: parseInt(idOpcion)
      }));

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
      setError(err.response?.data?.error || 'Error al enviar las respuestas. Inténtalo de nuevo.');
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
          borderRadius: '4px',
          textAlign: 'center',
          marginTop: '10px'
        }}
      >
        ✅ ¡Gracias por responder la encuesta!
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
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px'
          }}
        >
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
                        respuestas[pregunta.id_pregunta] === opcion.id_opcion ? '#e3f2fd' : '#fff'
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
            borderRadius: '4px',
            fontSize: '16px',
            cursor: enviando ? 'not-allowed' : 'pointer',
            minWidth: '120px'
          }}
        >
          {enviando ? 'Enviando...' : 'Enviar Encuesta'}
        </button>
      </div>
    </form>
  );
}
