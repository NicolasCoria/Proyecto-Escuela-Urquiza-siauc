import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EncuestaForm = ({ onSuccess }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [link, setLink] = useState('');
  const [idCarrera, setIdCarrera] = useState('');
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/carreras').then((res) => {
      setCarreras(res.data.carreras || []);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:8000/api/encuestas', {
        titulo,
        descripcion,
        link_google_forms: link,
        id_carrera: idCarrera
      });
      setSuccess('Encuesta creada correctamente');
      setTitulo('');
      setDescripcion('');
      setLink('');
      setIdCarrera('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Error al crear la encuesta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ marginBottom: 32, background: '#f9f9f9', padding: 24, borderRadius: 8 }}
    >
      <h3>Cargar nueva encuesta académica</h3>
      <div style={{ marginBottom: 12 }}>
        <label>
          Título:
          <br />
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>
          Descripción:
          <br />
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>
          Link de Google Forms:
          <br />
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
            type="url"
            style={{ width: '100%' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>
          Carrera:
          <br />
          <select
            value={idCarrera}
            onChange={(e) => setIdCarrera(e.target.value)}
            required
            style={{ width: '100%' }}
          >
            <option value="">Seleccionar carrera</option>
            {carreras.map((c) => (
              <option key={c.id_carrera} value={c.id_carrera}>
                {c.carrera}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button type="submit" disabled={loading} style={{ marginTop: 8 }}>
        {loading ? 'Guardando...' : 'Crear Encuesta'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
    </form>
  );
};

export default EncuestaForm;
