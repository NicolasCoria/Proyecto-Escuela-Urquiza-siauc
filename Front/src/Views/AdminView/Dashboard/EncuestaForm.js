import React, { useState, useEffect } from 'react';
import axiosClient from '../../../Components/Shared/Axios';

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
  const [idCarrera, setIdCarrera] = useState('');
  const [carreras, setCarreras] = useState([]);
  const [preguntas, setPreguntas] = useState([defaultPregunta()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        const response = await axiosClient.get('/carreras');
        setCarreras(response.data.carreras || []);
      } catch (err) {
        console.error('Error fetching carreras:', err);
        setError('Error al cargar las carreras');
      }
    };
    fetchCarreras();
  }, []);

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
      await axiosClient.post('/encuestas', {
        titulo,
        descripcion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        activa,
        id_carrera: idCarrera || null,
        preguntas: preguntas.map((p, idx) => ({
          texto: p.texto,
          tipo: p.tipo,
          orden: idx,
          opciones: p.opciones.map((o) => ({ texto: o.texto, valor: o.valor || null }))
        }))
      });

      setSuccess('Encuesta creada correctamente');
      setTitulo('');
      setDescripcion('');
      setFechaInicio('');
      setFechaFin('');
      setActiva(true);
      setIdCarrera('');
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
          Fecha inicio:
          <br />
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>
          Fecha fin:
          <br />
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>
          Activa:
          <input
            type="checkbox"
            checked={activa}
            onChange={(e) => setActiva(e.target.checked)}
            style={{ marginLeft: 8 }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>
          Carrera (Opcional - Selecciona para encuesta específica o deja vacío para encuesta
          global):
          <br />
          <select
            value={idCarrera}
            onChange={(e) => setIdCarrera(e.target.value)}
            style={{ width: '100%' }}
            required={false}
          >
            <option value="">Todas las carreras (Encuesta global)</option>
            {carreras.map((c) => (
              <option key={c.id_carrera} value={c.id_carrera}>
                {c.carrera}
              </option>
            ))}
          </select>
        </label>
        <div
          style={{
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            padding: '8px',
            borderRadius: '4px',
            marginTop: '5px',
            fontSize: '12px'
          }}
        >
          💡 <strong>Tip:</strong> Deja vacío para crear una encuesta global que puedas asignar a
          múltiples carreras desde &quot;Gestionar Asignaciones&quot;
        </div>
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
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>
              Tipo:
              <select
                value={pregunta.tipo}
                onChange={(e) => handlePreguntaChange(idx, 'tipo', e.target.value)}
                style={{ marginLeft: 8 }}
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
                style={{ width: 60, marginLeft: 8 }}
                min={0}
              />
            </label>
          </div>
          <div>
            <strong>Opciones</strong>
            {pregunta.opciones.map((opcion, idxOpcion) => (
              <div
                key={idxOpcion}
                style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}
              >
                <input
                  value={opcion.texto}
                  onChange={(e) => handleOpcionChange(idx, idxOpcion, 'texto', e.target.value)}
                  placeholder={`Opción ${idxOpcion + 1}`}
                  required
                  style={{ marginRight: 8 }}
                />
                <input
                  type="number"
                  value={opcion.valor}
                  onChange={(e) => handleOpcionChange(idx, idxOpcion, 'valor', e.target.value)}
                  placeholder="Valor (opcional)"
                  style={{ width: 80, marginRight: 8 }}
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
      <button type="button" onClick={addPregunta} style={{ marginBottom: 16 }}>
        Agregar pregunta
      </button>
      <br />
      <button type="submit" disabled={loading} style={{ marginTop: 8 }}>
        {loading ? 'Guardando...' : 'Crear Encuesta'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
    </form>
  );
};

export default EncuestaForm;
