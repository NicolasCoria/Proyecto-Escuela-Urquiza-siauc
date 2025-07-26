import React, { useState, useEffect } from 'react';
import axios from '../../Components/Shared/Axios';

const categorias = [
  { value: 'general', label: 'General' },
  { value: 'certificado', label: 'Certificado' },
  { value: 'homologacion_interna', label: 'Homologación Interna' },
  { value: 'homologacion_externa', label: 'Homologación Externa' }
];

const tiposCertificado = [
  { value: 'alumno_regular', label: 'Alumno regular' },
  { value: 'unidades_aprobadas', label: 'Unidades curriculares aprobadas' },
  { value: 'titulo_tramite', label: 'Título en trámite' },
  { value: 'fin_cursado', label: 'Fin de cursado' }
];

const SolicitudNueva = ({ idAlumno }) => {
  const [form, setForm] = useState({
    id_alumno: idAlumno || '',
    categoria: '',
    tipo_certificado: '',
    asunto: '',
    mensaje: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Función para generar el asunto automático según la categoría
  const generarAsuntoAutomatico = (categoria, tipoCertificado) => {
    switch (categoria) {
      case 'certificado': {
        const tipo = tiposCertificado.find((t) => t.value === tipoCertificado);
        return tipo ? `Solicitud de certificado de ${tipo.label}` : '';
      }
      case 'homologacion_interna':
        return 'Solicitud de homologación interna';
      case 'homologacion_externa':
        return 'Solicitud de homologación externa';
      default:
        return '';
    }
  };

  // Función para verificar si el asunto debe ser editable
  const esAsuntoEditable = (categoria) => {
    return categoria === 'general';
  };

  // Actualizar asunto cuando cambia la categoría o tipo de certificado
  useEffect(() => {
    if (form.categoria && form.categoria !== 'general') {
      const asuntoAutomatico = generarAsuntoAutomatico(form.categoria, form.tipo_certificado);
      setForm((prev) => ({ ...prev, asunto: asuntoAutomatico }));
    } else if (form.categoria === 'general') {
      setForm((prev) => ({ ...prev, asunto: '' }));
    }
  }, [form.categoria, form.tipo_certificado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar que si es certificado, tenga tipo seleccionado
    if (form.categoria === 'certificado' && !form.tipo_certificado) {
      setError('Debe seleccionar el tipo de certificado');
      return;
    }

    try {
      await axios.post('/solicitudes', form);
      setSuccess('Solicitud enviada correctamente');
      setForm({
        id_alumno: idAlumno || '',
        categoria: '',
        tipo_certificado: '',
        asunto: '',
        mensaje: ''
      });
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

        {/* Select adicional para tipos de certificado */}
        {form.categoria === 'certificado' && (
          <div>
            <label>Tipo de Certificado:</label>
            <select
              name="tipo_certificado"
              value={form.tipo_certificado}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione el tipo de certificado</option>
              {tiposCertificado.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label>Asunto:</label>
          <input
            type="text"
            name="asunto"
            value={form.asunto}
            onChange={handleChange}
            maxLength={255}
            required
            disabled={!esAsuntoEditable(form.categoria)}
            style={{
              backgroundColor: esAsuntoEditable(form.categoria) ? 'white' : '#f5f5f5',
              color: esAsuntoEditable(form.categoria) ? 'black' : '#666'
            }}
          />
          {!esAsuntoEditable(form.categoria) && (
            <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
              El asunto se genera automáticamente según la categoría seleccionada
            </small>
          )}
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
