import React, { useState } from 'react';
import axios from '../../Components/Shared/Axios';

const categorias = [
  { value: 'general', label: 'General' },
  { value: 'certificado', label: 'Certificado' },
  { value: 'homologacion_interna', label: 'Homologación Interna' },
  { value: 'homologacion_externa', label: 'Homologación Externa' }
];

const SolicitudNueva = ({ idAlumno }) => {
  const [form, setForm] = useState({
    id_alumno: idAlumno || '',
    categoria: '',
    asunto: '',
    mensaje: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('/solicitudes', form);
      setSuccess('Solicitud enviada correctamente');
      setForm({ ...form, categoria: '', asunto: '', mensaje: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar la solicitud');
    }
  };

  return (
    <div>
      <h2>Nueva Solicitud</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Categoría:</label>
          <select name="categoria" value={form.categoria} onChange={handleChange} required>
            <option value="">Seleccione una categoría</option>
            {categorias.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Asunto:</label>
          <input
            type="text"
            name="asunto"
            value={form.asunto}
            onChange={handleChange}
            maxLength={255}
            required
          />
        </div>
        <div>
          <label>Mensaje:</label>
          <textarea
            name="mensaje"
            value={form.mensaje}
            onChange={handleChange}
            required
            rows={4}
            style={{
              resize: 'vertical',
              minHeight: '80px',
              maxHeight: '200px',
              width: '100%',
              maxWidth: '400px'
            }}
          />
        </div>
        <button type="submit">Enviar Solicitud</button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
    </div>
  );
};

export default SolicitudNueva;
