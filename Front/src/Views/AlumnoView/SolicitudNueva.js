import React, { useState, useEffect } from 'react';
import axios from '../../Components/Shared/Axios';
import styles from './solicitudes.module.css';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const esAsuntoEditable = (categoria) => categoria === 'general';

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
    if (isSubmitting) return;

    setError('');
    setSuccess('');

    if (form.categoria === 'certificado' && !form.tipo_certificado) {
      setError('Debe seleccionar el tipo de certificado');
      return;
    }

    try {
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.formCard} ${styles.cardPadding}`}>
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>Nueva Solicitud</h2>
      {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
      {success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.formRow}>
            <label className={styles.label}>Categoría</label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              required
              className={styles.select}
              disabled={isSubmitting}
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {form.categoria === 'certificado' && (
            <div className={styles.formRow}>
              <label className={styles.label}>Tipo de Certificado</label>
              <select
                name="tipo_certificado"
                value={form.tipo_certificado}
                onChange={handleChange}
                required
                className={styles.select}
                disabled={isSubmitting}
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

          <div className={styles.formRow}>
            <label className={styles.label}>Asunto</label>
            <input
              type="text"
              name="asunto"
              value={form.asunto}
              onChange={handleChange}
              maxLength={255}
              required
              disabled={!esAsuntoEditable(form.categoria) || isSubmitting}
              className={styles.input}
              style={{
                backgroundColor: esAsuntoEditable(form.categoria) ? '#fff' : '#f9fafb',
                color: esAsuntoEditable(form.categoria) ? '#111827' : '#6b7280'
              }}
            />
            {!esAsuntoEditable(form.categoria) && (
              <small className={styles.helperText}>
                El asunto se genera automáticamente según la categoría seleccionada
              </small>
            )}
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>Mensaje</label>
            <textarea
              name="mensaje"
              value={form.mensaje}
              onChange={handleChange}
              required
              rows={4}
              className={styles.textarea}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.actions} style={{ marginTop: 12 }}>
          <button
            type="submit"
            className={`${styles.button} ${styles.primaryButton}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando…' : 'Enviar Solicitud'}
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={() =>
              setForm({
                id_alumno: idAlumno || '',
                categoria: '',
                tipo_certificado: '',
                asunto: '',
                mensaje: ''
              })
            }
            disabled={isSubmitting}
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
};

export default SolicitudNueva;
