import React, { useState, useEffect } from 'react';
import axiosClient from '../../../Components/Shared/Axios';
import Spinner from '../../../Components/Shared/Spinner';

const EditarEncuestas = () => {
  const [encuestas, setEncuestas] = useState([]);
  const [selectedEncuesta, setSelectedEncuesta] = useState(null);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEncuestas, setLoadingEncuestas] = useState(false);
  const [loadingEncuesta, setLoadingEncuesta] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para el formulario de edición
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [activa, setActiva] = useState(true);
  const [preguntas, setPreguntas] = useState([]);

  useEffect(() => {
    cargarEncuestas();
  }, []);

  const cargarEncuestas = async () => {
    try {
      setLoadingEncuestas(true);
      const response = await axiosClient.get('/encuestas');
      if (response.data.success) {
        setEncuestas(response.data.encuestas || []);
      }
    } catch (err) {
      console.error('Error cargando encuestas:', err);
      setError('Error al cargar las encuestas');
    } finally {
      setLoadingEncuestas(false);
    }
  };

  const handleSeleccionarEncuesta = async (idEncuesta) => {
    try {
      setLoadingEncuesta(true);
      const response = await axiosClient.get(`/encuestas/${idEncuesta}`);
      if (response.data.success) {
        const encuesta = response.data.encuesta;
        setSelectedEncuesta(encuesta);
        setTitulo(encuesta.titulo || '');
        setDescripcion(encuesta.descripcion || '');
        setFechaInicio(encuesta.fecha_inicio || '');
        setFechaFin(encuesta.fecha_fin || '');
        setActiva(encuesta.activa !== false);
        setPreguntas(encuesta.preguntas || []);
        setEditando(true);
      }
    } catch (err) {
      console.error('Error cargando encuesta:', err);
      setError('Error al cargar la encuesta seleccionada');
    } finally {
      setLoadingEncuesta(false);
    }
  };

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

  const addPregunta = () => {
    const nuevaPregunta = {
      texto: '',
      tipo: 'opcion_unica',
      orden: preguntas.length,
      opciones: [
        { texto: '', valor: '' },
        { texto: '', valor: '' }
      ]
    };
    setPreguntas([...preguntas, nuevaPregunta]);
  };

  const removePregunta = (idx) => {
    setPreguntas(preguntas.filter((_, i) => i !== idx));
  };

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

  const handleGuardar = async () => {
    if (!selectedEncuesta) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axiosClient.put(`/encuestas/${selectedEncuesta.id_encuesta}`, {
        titulo,
        descripcion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        activa,
        preguntas: preguntas.map((p, idx) => ({
          id_pregunta: p.id_pregunta,
          texto: p.texto,
          tipo: p.tipo,
          orden: idx,
          opciones: p.opciones.map((o) => ({
            id_opcion: o.id_opcion,
            texto: o.texto,
            valor: o.valor || null
          }))
        }))
      });

      setSuccess('Encuesta actualizada correctamente');
      setEditando(false);
      setSelectedEncuesta(null);
      cargarEncuestas();
    } catch (err) {
      console.error('Error actualizando encuesta:', err);
      setError(err.response?.data?.error || 'Error al actualizar la encuesta');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    setEditando(false);
    setSelectedEncuesta(null);
    setTitulo('');
    setDescripcion('');
    setFechaInicio('');
    setFechaFin('');
    setActiva(true);
    setPreguntas([]);
    setError('');
    setSuccess('');
  };

  const handleEliminar = async () => {
    if (
      !selectedEncuesta ||
      !window.confirm('¿Estás seguro de que quieres eliminar esta encuesta?')
    ) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axiosClient.delete(`/encuestas/${selectedEncuesta.id_encuesta}`);
      setSuccess('Encuesta eliminada correctamente');
      setEditando(false);
      setSelectedEncuesta(null);
      cargarEncuestas();
    } catch (err) {
      console.error('Error eliminando encuesta:', err);
      setError(err.response?.data?.error || 'Error al eliminar la encuesta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f9f9f9', padding: 24, borderRadius: 8, marginBottom: 32 }}>
      <h3>Editar Encuestas Existentes</h3>

      {error && (
        <div
          style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}
        >
          ❌ {error}
        </div>
      )}

      {success && (
        <div
          style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}
        >
          ✅ {success}
        </div>
      )}

      {!editando ? (
        <div>
          <div style={{ marginBottom: 20 }}>
            <label>
              <strong>Seleccionar Encuesta para Editar:</strong>
              <br />
              {loadingEncuestas ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '20px',
                    minHeight: '100px'
                  }}
                >
                  <Spinner />
                </div>
              ) : (
                <select
                  value={selectedEncuesta?.id_encuesta || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleSeleccionarEncuesta(parseInt(e.target.value));
                    } else {
                      setSelectedEncuesta(null);
                    }
                  }}
                  style={{ width: '100%', marginTop: 5 }}
                >
                  <option value="">Selecciona una encuesta</option>
                  {encuestas.map((encuesta) => (
                    <option key={encuesta.id_encuesta} value={encuesta.id_encuesta}>
                      {encuesta.titulo} - {encuesta.activa ? 'Activa' : 'Inactiva'}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>

          {loadingEncuesta ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '20px',
                minHeight: '200px'
              }}
            >
              <Spinner />
            </div>
          ) : (
            selectedEncuesta && (
              <div
                style={{
                  backgroundColor: '#e3f2fd',
                  padding: '15px',
                  borderRadius: '6px',
                  marginBottom: '20px'
                }}
              >
                <h4>Vista Previa: {selectedEncuesta.titulo}</h4>
                <p>
                  <strong>Descripción:</strong> {selectedEncuesta.descripcion || 'Sin descripción'}
                </p>
                <p>
                  <strong>Estado:</strong> {selectedEncuesta.activa ? 'Activa' : 'Inactiva'}
                </p>
                <p>
                  <strong>Preguntas:</strong> {selectedEncuesta.preguntas?.length || 0}
                </p>
                <button
                  onClick={() => setEditando(true)}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={handleEliminar}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            )
          )}
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h4>Editando: {selectedEncuesta?.titulo}</h4>
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
          </div>

          <h4>Preguntas</h4>
          {preguntas.map((pregunta, idx) => (
            <div
              key={idx}
              style={{ border: '1px solid #ccc', padding: 12, marginBottom: 16, borderRadius: 6 }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <strong>Pregunta {idx + 1}</strong>
                <button type="button" onClick={() => removePregunta(idx)} style={{ color: 'red' }}>
                  Eliminar
                </button>
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
                    <button
                      type="button"
                      onClick={() => removeOpcion(idx, idxOpcion)}
                      style={{ color: 'red' }}
                    >
                      Eliminar
                    </button>
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
          <button
            onClick={handleGuardar}
            disabled={loading}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px'
            }}
          >
            {loading ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
          <button
            onClick={handleCancelar}
            disabled={loading}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            ❌ Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default EditarEncuestas;
