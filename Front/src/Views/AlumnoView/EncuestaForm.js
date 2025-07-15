import React, { useState } from 'react';

const preguntasMock = [
  {
    id: 1,
    texto: '¿Te gusta el helado de chocolate?',
    opciones: [
      { id: 'si', texto: 'Sí' },
      { id: 'no', texto: 'No' }
    ]
  },
  {
    id: 2,
    texto: '¿Prefieres estudiar por la mañana o por la tarde?',
    opciones: [
      { id: 'manana', texto: 'Mañana' },
      { id: 'tarde', texto: 'Tarde' }
    ]
  },
  {
    id: 3,
    texto: '¿Te gustaría participar en actividades extracurriculares?',
    opciones: [
      { id: 'si', texto: 'Sí' },
      { id: 'no', texto: 'No' }
    ]
  }
];

export default function EncuestaForm() {
  const [respuestas, setRespuestas] = useState({});
  const [enviado, setEnviado] = useState(false);

  const handleChange = (idPregunta, idOpcion) => {
    setRespuestas({ ...respuestas, [idPregunta]: idOpcion });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
    // Aquí luego se enviarán las respuestas al backend
  };

  if (enviado)
    return <div style={{ color: 'green', marginTop: 10 }}>¡Gracias por responder la encuesta!</div>;

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 10, marginBottom: 10 }}>
      {preguntasMock.map((pregunta) => (
        <div key={pregunta.id} style={{ marginBottom: 10 }}>
          <strong>{pregunta.texto}</strong>
          <div>
            {pregunta.opciones.map((opcion) => (
              <label key={opcion.id} style={{ marginRight: 15 }}>
                <input
                  type="radio"
                  name={`pregunta_${pregunta.id}`}
                  value={opcion.id}
                  checked={respuestas[pregunta.id] === opcion.id}
                  onChange={() => handleChange(pregunta.id, opcion.id)}
                  required
                />
                {opcion.texto}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button type="submit">Enviar</button>
    </form>
  );
}
