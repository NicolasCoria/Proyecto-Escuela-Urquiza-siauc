import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStateContext } from '../../Components/Contexts';

const EncuestasAlumno = () => {
  const { carrera } = useStateContext();
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!carrera || !carrera.id_carrera) {
      setLoading(false);
      return;
    }
    axios
      .get(`/api/encuestas?id_carrera=${carrera.id_carrera}`)
      .then((res) => {
        setEncuestas(res.data.encuestas);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [carrera]);

  if (loading) return <div>Cargando encuestas...</div>;
  if (!carrera || !carrera.id_carrera) return <div>No se detectó tu carrera.</div>;
  if (encuestas.length === 0) return <div>No hay encuestas disponibles para tu carrera.</div>;

  return (
    <div>
      <h2>Encuestas Académicas</h2>
      <ul>
        {encuestas.map((encuesta) => (
          <li key={encuesta.id} style={{ marginBottom: 20 }}>
            <h3>{encuesta.titulo}</h3>
            <p>{encuesta.descripcion}</p>
            <a
              href={encuesta.link_google_forms}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'blue', textDecoration: 'underline' }}
            >
              Responder encuesta
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EncuestasAlumno;
