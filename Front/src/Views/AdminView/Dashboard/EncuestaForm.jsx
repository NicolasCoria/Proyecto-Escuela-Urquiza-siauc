import React, { useState } from 'react';
import axiosClient from '../../../Components/Shared/Axios';
import styles from './dashboard.module.css';

const defaultPregunta = () => ({
  texto: '',
  tipo: 'opcion_unica',
  orden: 0,
  opciones: [
    { texto: '', valor: '' },
    { texto: '', valor: '' }
  ]
});

const EncuestaForm = ({ onSuccess }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [activa, setActiva] = useState(true);
  const [preguntas, setPreguntas] = useState([defaultPregunta()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePreguntaChange = (idx, field, value) => {
    const updated = [...preguntas];
    updated[idx][field] = value;
    setPreguntas(updated);
  };

  const handleOpcionChange = (idxPregunta, idxOpcion, field, value) => {
    const updated = [...preguntas];
    updated[idxPregunta].opciones[idxOpcion][field] = value;
    setPreguntas(updated);
  };

  const addPregunta = () => setPreguntas([...preguntas, defaultPregunta()]);
  const removePregunta = (idx) => setPreguntas(preguntas.filter((_, i) => i !== idx));

  const addOpcion = (idxPregunta) => {
    const updated = [...preguntas];
    updated[idxPregunta].opciones.push({ texto: '', valor: '' });
    setPreguntas(updated);
  };
  const removeOpcion = (idxPregunta, idxOpcion) => {
    const updated = [...preguntas];
    updated[idxPregunta].opciones = updated[idxPregunta].opciones.filter((_, i) => i !== idxOpcion);
    setPreguntas(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Crear la encuesta
      const encuestaData = {
        titulo,
        descripcion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        activa,
        id_carrera: null, // Siempre null para encuestas globales
        preguntas: preguntas.map((p, idx) => ({
          texto: p.texto,
          tipo: p.tipo,
          orden: idx,
          opciones: p.opciones.map((o) => ({ texto: o.texto, valor: o.valor || null }))
        }))
      };

      await axiosClient.post('/encuestas', encuestaData);

      setSuccess('Encuesta creada correctamente');
      setTitulo('');
      setDescripcion('');
      setFechaInicio('');
      setFechaFin('');
      setActiva(true);
      setPreguntas([defaultPregunta()]);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error creating encuesta:', err);
      setError(err.response?.data?.error || 'Error al crear la encuesta');
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
      <div className={styles.selectGroup}>
        <label>
          <strong>Título:</strong>
        </label>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          className={styles.select}
        />
      </div>
      <div className={styles.selectGroup}>
        <label>
          <strong>Descripción:</strong>
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className={styles.textarea}
        />
      </div>
      <div className={styles.selectGroup}>
        <label>
          <strong>Fecha inicio:</strong>
        </label>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className={styles.select}
        />
      </div>
      <div className={styles.selectGroup}>
        <label>
          <strong>Fecha fin:</strong>
        </label>
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className={styles.select}
        />
      </div>
      <div className={styles.selectGroup}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={activa}
            onChange={(e) => setActiva(e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          <strong>Activa</strong>
        </label>
      </div>

      <div className={styles.info}>
        🌐 <strong>Encuesta Global:</strong> Esta encuesta se creará como global y podrás asignarla
        a carreras específicas desde &quot;Gestionar Asignaciones&quot;.
      </div>
      <hr />
      <h4>Preguntas</h4>
      {preguntas.map((pregunta, idx) => (
        <div
          key={idx}
          style={{ border: '1px solid #ccc', padding: 12, marginBottom: 16, borderRadius: 6 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Pregunta {idx + 1}</strong>
            {preguntas.length > 1 && (
              <button type="button" onClick={() => removePregunta(idx)} style={{ color: 'red' }}>
                Eliminar
              </button>
            )}
          </div>
          <div style={{ marginBottom: 8 }}>
            <input
              value={pregunta.texto}
              onChange={(e) => handlePreguntaChange(idx, 'texto', e.target.value)}
              placeholder="Texto de la pregunta"
              required
              className={styles.select}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>
              Tipo:
              <select
                value={pregunta.tipo}
                onChange={(e) => handlePreguntaChange(idx, 'tipo', e.target.value)}
                className={styles.select}
                style={{ marginLeft: 8, width: 'auto' }}
              >
                <option value="opcion_unica">Opción única</option>
                <option value="opcion_multiple">Opción múltiple</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>
              Orden:
              <input
                type="number"
                value={pregunta.orden}
                onChange={(e) => handlePreguntaChange(idx, 'orden', e.target.value)}
                className={styles.select}
                style={{ width: 80, marginLeft: 8 }}
                min={0}
              />
            </label>
          </div>
          <div>
            <strong>Opciones</strong>
            {pregunta.opciones.map((opcion, idxOpcion) => (
              <div
                key={idxOpcion}
                style={{ display: 'flex', alignItems: 'center', marginBottom: 4, gap: 8 }}
              >
                <input
                  value={opcion.texto}
                  onChange={(e) => handleOpcionChange(idx, idxOpcion, 'texto', e.target.value)}
                  placeholder={`Opción ${idxOpcion + 1}`}
                  required
                  className={styles.select}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  value={opcion.valor}
                  onChange={(e) => handleOpcionChange(idx, idxOpcion, 'valor', e.target.value)}
                  placeholder="Valor (opcional)"
                  className={styles.select}
                  style={{ width: 100 }}
                />
                {pregunta.opciones.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOpcion(idx, idxOpcion)}
                    style={{ color: 'red' }}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addOpcion(idx)} style={{ marginTop: 4 }}>
              Agregar opción
            </button>
          </div>
        </div>
      ))}
      <div className={styles.buttonGroup}>
        <button
          type="button"
          onClick={addPregunta}
          className={`${styles.button} ${styles['button.secondary']}`}
        >
          Agregar pregunta
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`${styles.button} ${styles['button.primary']}`}
        >
          {loading ? 'Guardando...' : 'Guardar Encuesta'}
        </button>
      </div>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
    </form>
  );
};

export default EncuestaForm;
