import React, { useState, useEffect } from 'react';
import axiosClient from '../../../Components/Shared/Axios';
import Spinner from '../../../Components/Shared/Spinner';

const GruposDestinatarios = () => {
  const [grupos, setGrupos] = useState([]);
  const [selectedGrupo, setSelectedGrupo] = useState(null);
  const [editando, setEditando] = useState(false);
  const [creando, setCreando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [loadingFiltros, setLoadingFiltros] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para el formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [selectedAlumnos, setSelectedAlumnos] = useState([]);
  const [activo, setActivo] = useState(true);

  // Estados para filtros
  const [carreras, setCarreras] = useState([]);
  const [grados, setGrados] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [todasLasMaterias, setTodasLasMaterias] = useState([]); // Guardar todas las materias originales
  const [selectedCarreras, setSelectedCarreras] = useState([]);
  const [selectedGrados, setSelectedGrados] = useState([]);
  const [selectedMaterias, setSelectedMaterias] = useState([]);
  const [alumnosFiltrados, setAlumnosFiltrados] = useState([]);
  const [gradosFiltrados, setGradosFiltrados] = useState([]);
  const [loadingMaterias, setLoadingMaterias] = useState(false);

  // Función para generar nombre sugerido
  const generarNombreSugerido = () => {
    const partes = [];

    if (selectedCarreras.length > 0) {
      const carrerasText = carreras
        .filter((c) => selectedCarreras.includes(c.id_carrera))
        .map((c) => c.carrera)
        .join(' + ');
      partes.push(carrerasText);
    }

    if (selectedGrados.length > 0) {
      const gradosText = grados
        .filter((g) => selectedGrados.includes(g.id_grado))
        .map((g) => g.display_text || `${g.grado}-${g.division}°`)
        .join(' + ');
      partes.push(gradosText);
    }

    if (selectedMaterias.length > 0) {
      const materiasText = materias
        .filter((m) => selectedMaterias.includes(m.id_uc))
        .map((m) => m.unidad_curricular)
        .join(' + ');
      partes.push(materiasText);
    }

    if (partes.length === 0) return '';

    return partes.join(' - ');
  };

  // Función para auto-completar nombre
  const autoCompletarNombre = () => {
    const nombreSugerido = generarNombreSugerido();
    if (nombreSugerido) {
      setNombre(nombreSugerido);
    }
  };

  // Función para filtrar grados según carreras seleccionadas
  const filtrarGradosPorCarreras = () => {
    if (selectedCarreras.length === 0) {
      setGradosFiltrados(grados);
      return;
    }

    // Por ahora mostramos todos los grados, pero aquí podrías implementar
    // la lógica para filtrar grados específicos por carrera si tienes esa relación
    setGradosFiltrados(grados);
  };

  // Función para filtrar materias según carreras seleccionadas
  const filtrarMateriasPorCarreras = async () => {
    if (selectedCarreras.length === 0) {
      setMaterias(todasLasMaterias);
      return;
    }

    try {
      setLoadingMaterias(true);
      const response = await axiosClient.post('/grupos-destinatarios/materias-por-carrera', {
        id_carreras: selectedCarreras
      });

      if (response.data.success) {
        setMaterias(response.data.materias);
        // Limpiar materias seleccionadas que ya no están disponibles
        const materiasDisponibles = response.data.materias.map((m) => m.id_uc);
        setSelectedMaterias((prev) => prev.filter((id) => materiasDisponibles.includes(id)));
      }
    } catch (err) {
      console.error('Error filtrando materias por carrera:', err);
      setError('Error al filtrar materias por carrera');
    } finally {
      setLoadingMaterias(false);
    }
  };

  // Efecto para filtrar grados cuando cambian las carreras
  useEffect(() => {
    filtrarGradosPorCarreras();
  }, [selectedCarreras, grados]);

  // Efecto para filtrar materias cuando cambian las carreras
  useEffect(() => {
    if (todasLasMaterias.length > 0) {
      filtrarMateriasPorCarreras();
    }
  }, [selectedCarreras, todasLasMaterias]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const response = await axiosClient.get('/grupos-destinatarios/datos/creacion');
        if (response.data.success) {
          setCarreras(response.data.datos.carreras || []);
          setGrados(response.data.datos.grados || []);
          setGradosFiltrados(response.data.datos.grados || []); // Inicializar grados filtrados
          setMaterias(response.data.datos.materias || []);
          setTodasLasMaterias(response.data.datos.materias || []); // Guardar todas las materias
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar datos');
      }
    };

    cargarDatos();
    cargarGrupos();
  }, []);

  const cargarGrupos = async () => {
    try {
      setLoadingGrupos(true);
      const response = await axiosClient.get('/grupos-destinatarios');
      if (response.data.success) {
        setGrupos(response.data.grupos || []);
      }
    } catch (err) {
      console.error('Error cargando grupos:', err);
      setError('Error al cargar grupos');
    } finally {
      setLoadingGrupos(false);
    }
  };

  const handleFiltrarAlumnos = async () => {
    try {
      setLoadingFiltros(true);
      const params = {};
      if (selectedCarreras.length > 0) params.id_carreras = selectedCarreras;
      if (selectedGrados.length > 0) params.id_grados = selectedGrados;
      if (selectedMaterias.length > 0) params.id_ucs = selectedMaterias;

      const response = await axiosClient.post('/grupos-destinatarios/filtrar-alumnos', params);
      if (response.data.success) {
        setAlumnosFiltrados(response.data.alumnos || []);
      }
    } catch (err) {
      console.error('Error filtrando alumnos:', err);
      setError('Error al filtrar alumnos');
    } finally {
      setLoadingFiltros(false);
    }
  };

  const handleAlumnoToggle = (alumnoId) => {
    setSelectedAlumnos((prev) =>
      prev.includes(alumnoId) ? prev.filter((id) => id !== alumnoId) : [...prev, alumnoId]
    );
  };

  const handleSelectAllAlumnos = () => {
    if (selectedAlumnos.length === alumnosFiltrados.length) {
      setSelectedAlumnos([]);
    } else {
      setSelectedAlumnos(alumnosFiltrados.map((a) => a.id_alumno));
    }
  };

  const handleCrearGrupo = async () => {
    if (!nombre.trim()) {
      setError('El nombre del grupo es obligatorio');
      return;
    }

    if (selectedAlumnos.length === 0) {
      setError('Debes seleccionar al menos un alumno');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axiosClient.post('/grupos-destinatarios', {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        alumnos: selectedAlumnos
      });

      if (response.data.success) {
        setSuccess('Grupo creado correctamente');
        setCreando(false);
        resetForm();
        cargarGrupos();
      }
    } catch (err) {
      console.error('Error creando grupo:', err);
      setError(err.response?.data?.error || 'Error al crear el grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarGrupo = async (idGrupo) => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/grupos-destinatarios/${idGrupo}`);
      if (response.data.success) {
        const grupo = response.data.grupo;
        setSelectedGrupo(grupo);
        setNombre(grupo.nombre);
        setDescripcion(grupo.descripcion || '');
        setActivo(grupo.activo);
        setSelectedAlumnos(grupo.alumnos.map((a) => a.id_alumno));
        // Resetear filtros múltiples
        setSelectedCarreras([]);
        setSelectedGrados([]);
        setSelectedMaterias([]);
        setEditando(true);
      }
    } catch (err) {
      console.error('Error cargando grupo:', err);
      setError('Error al cargar el grupo seleccionado');
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarGrupo = async () => {
    if (!selectedGrupo) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axiosClient.put(`/grupos-destinatarios/${selectedGrupo.id_grupo}`, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        alumnos: selectedAlumnos,
        activo
      });

      if (response.data.success) {
        setSuccess('Grupo actualizado correctamente');
        setEditando(false);
        resetForm();
        cargarGrupos();
      }
    } catch (err) {
      console.error('Error actualizando grupo:', err);
      setError(err.response?.data?.error || 'Error al actualizar el grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarGrupo = async (idGrupo) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este grupo?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axiosClient.delete(`/grupos-destinatarios/${idGrupo}`);
      if (response.data.success) {
        setSuccess('Grupo eliminado correctamente');
        setEditando(false);
        resetForm();
        cargarGrupos();
      }
    } catch (err) {
      console.error('Error eliminando grupo:', err);
      setError(err.response?.data?.error || 'Error al eliminar el grupo');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setSelectedAlumnos([]);
    setActivo(true);
    setSelectedGrupo(null);
    setSelectedCarreras([]);
    setSelectedGrados([]);
    setSelectedMaterias([]);
    setAlumnosFiltrados([]);
    setGradosFiltrados([]);
    setMaterias(todasLasMaterias); // Restaurar todas las materias
    setError('');
    setSuccess('');
  };

  const handleCancelar = () => {
    setEditando(false);
    setCreando(false);
    resetForm();
  };

  return (
    <div style={{ background: '#f9f9f9', padding: 24, borderRadius: 8, marginBottom: 32 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }}
      >
        <h3>Grupos de Destinatarios</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setCreando(true)}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ➕ Crear Grupo
          </button>
          <button
            onClick={cargarGrupos}
            style={{
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Recargar
          </button>
        </div>
      </div>

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

      {!editando && !creando ? (
        <div>
          <h4>Grupos Existentes</h4>
          {loadingGrupos ? (
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
          ) : grupos.length === 0 ? (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
              No hay grupos de destinatarios creados. Crea el primer grupo para empezar.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {grupos.map((grupo) => (
                <div
                  key={grupo.id_grupo}
                  style={{
                    backgroundColor: 'white',
                    padding: '15px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div>
                      <h5 style={{ margin: '0 0 8px 0', color: '#333' }}>{grupo.nombre}</h5>
                      <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                        {grupo.descripcion || 'Sin descripción'}
                      </p>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        <span>👥 {grupo.cantidad_alumnos} alumnos</span> |
                        <span> 👤 Creado por: {grupo.admin_creador}</span> |
                        <span> 📅 {grupo.fecha_creacion}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleSeleccionarGrupo(grupo.id_grupo)}
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleEliminarGrupo(grupo.id_grupo)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h4>{editando ? 'Editando Grupo' : 'Crear Nuevo Grupo'}</h4>

          <div style={{ marginBottom: '15px' }}>
            <label>
              <strong>Nombre del Grupo:</strong>
              <br />
              <div style={{ display: 'flex', gap: '8px', marginTop: 5 }}>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Todos los 1er años, DS Completo, etc."
                  style={{ flex: 1 }}
                />
                <button
                  onClick={autoCompletarNombre}
                  disabled={
                    selectedCarreras.length === 0 &&
                    selectedGrados.length === 0 &&
                    selectedMaterias.length === 0
                  }
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    whiteSpace: 'nowrap'
                  }}
                  title="Generar nombre basado en criterios seleccionados"
                >
                  ✨ Auto-nombre
                </button>
              </div>
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>
              <strong>Carrera y Grupos:</strong>
              <br />
              <div
                style={{
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '10px',
                  marginTop: 5,
                  minHeight: '60px',
                  fontSize: '14px'
                }}
              >
                {selectedCarreras.length > 0 ||
                selectedGrados.length > 0 ||
                selectedMaterias.length > 0 ? (
                  <div>
                    <strong>📊 Criterios Seleccionados:</strong>
                    <div style={{ marginTop: '8px' }}>
                      {selectedCarreras.length > 0 && (
                        <div style={{ marginBottom: '4px' }}>
                          <span style={{ fontWeight: 'bold', color: '#007bff' }}>🏫 Carreras:</span>{' '}
                          {carreras
                            .filter((c) => selectedCarreras.includes(c.id_carrera))
                            .map((c) => c.carrera)
                            .join(', ')}
                        </div>
                      )}
                      {selectedGrados.length > 0 && (
                        <div style={{ marginBottom: '4px' }}>
                          <span style={{ fontWeight: 'bold', color: '#28a745' }}>📚 Años:</span>{' '}
                          {grados
                            .filter((g) => selectedGrados.includes(g.id_grado))
                            .map((g) => g.display_text || `${g.grado}-${g.division}°`)
                            .join(', ')}
                        </div>
                      )}
                      {selectedMaterias.length > 0 && (
                        <div style={{ marginBottom: '4px' }}>
                          <span style={{ fontWeight: 'bold', color: '#ffc107' }}>📖 Materias:</span>{' '}
                          {materias
                            .filter((m) => selectedMaterias.includes(m.id_uc))
                            .map((m) => m.unidad_curricular)
                            .join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
                    Selecciona criterios abajo para ver el resumen aquí...
                  </div>
                )}
              </div>
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>
              <strong>Descripción:</strong>
              <br />
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción opcional del grupo..."
                style={{ width: '100%', marginTop: 5, minHeight: '80px' }}
              />
            </label>
          </div>

          {editando && (
            <div style={{ marginBottom: 20 }}>
              <label>
                <strong>Estado:</strong>
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  style={{ marginLeft: 8 }}
                />
                Activo
              </label>
            </div>
          )}

          <h5>Seleccionar Destinatarios</h5>

          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '15px'
              }}
            >
              <div>
                <label>
                  <strong>🏫 Carreras y Grupos:</strong>
                  <br />
                  <div
                    style={{
                      maxHeight: 200,
                      overflowY: 'auto',
                      border: '1px solid #ddd',
                      padding: '8px',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      marginTop: 5
                    }}
                  >
                    {/* Opción "Todas las carreras" */}
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        borderBottom: '1px solid #eee',
                        paddingBottom: '4px'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCarreras.length === carreras.length && carreras.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCarreras(carreras.map((c) => c.id_carrera));
                          } else {
                            setSelectedCarreras([]);
                          }
                        }}
                        style={{ marginRight: 6 }}
                      />
                      🌟 Todas las carreras
                    </label>

                    {/* Carreras individuales */}
                    {carreras.map((carrera) => (
                      <label
                        key={carrera.id_carrera}
                        style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCarreras.includes(carrera.id_carrera)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCarreras([...selectedCarreras, carrera.id_carrera]);
                            } else {
                              setSelectedCarreras(
                                selectedCarreras.filter((id) => id !== carrera.id_carrera)
                              );
                            }
                          }}
                          style={{ marginRight: 6 }}
                        />
                        {carrera.carrera}
                      </label>
                    ))}

                    <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #ddd' }} />

                    {/* Grados/Grupos */}
                    <div style={{ marginTop: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#666' }}>📚 Años/Grupos:</strong>
                      {gradosFiltrados.map((grado) => (
                        <label
                          key={grado.id_grado}
                          style={{
                            display: 'block',
                            marginBottom: '4px',
                            fontSize: '13px',
                            marginLeft: '10px'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedGrados.includes(grado.id_grado)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGrados([...selectedGrados, grado.id_grado]);
                              } else {
                                setSelectedGrados(
                                  selectedGrados.filter((id) => id !== grado.id_grado)
                                );
                              }
                            }}
                            style={{ marginRight: 6 }}
                          />
                          {grado.display_text || `${grado.grado}-${grado.division}°`}
                        </label>
                      ))}
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label>
                  <strong>📖 Materias:</strong>
                  {selectedCarreras.length > 0 && (
                    <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                      (Filtradas por carrera{selectedCarreras.length > 1 ? 's' : ''} seleccionada
                      {selectedCarreras.length > 1 ? 's' : ''})
                    </span>
                  )}
                  <br />
                  <div
                    style={{
                      maxHeight: 200,
                      overflowY: 'auto',
                      border: '1px solid #ddd',
                      padding: '8px',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      marginTop: 5
                    }}
                  >
                    {loadingMaterias ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        🔄 Cargando materias...
                      </div>
                    ) : materias.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '20px',
                          color: '#666',
                          fontStyle: 'italic'
                        }}
                      >
                        {selectedCarreras.length > 0
                          ? 'No hay materias disponibles para la(s) carrera(s) seleccionada(s)'
                          : 'Selecciona una carrera para ver las materias'}
                      </div>
                    ) : (
                      materias.map((materia) => (
                        <label
                          key={materia.id_uc}
                          style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedMaterias.includes(materia.id_uc)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMaterias([...selectedMaterias, materia.id_uc]);
                              } else {
                                setSelectedMaterias(
                                  selectedMaterias.filter((id) => id !== materia.id_uc)
                                );
                              }
                            }}
                            style={{ marginRight: 6 }}
                          />
                          {materia.unidad_curricular}
                        </label>
                      ))
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <button
                onClick={() => {
                  setSelectedCarreras(carreras.map((c) => c.id_carrera));
                  setSelectedGrados([]);
                  setSelectedMaterias([]);
                }}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '8px',
                  fontSize: '12px'
                }}
              >
                🎯 Todas las carreras
              </button>
              <button
                onClick={() => {
                  setSelectedCarreras([]);
                  setSelectedGrados(grados.map((g) => g.id_grado));
                  setSelectedMaterias([]);
                }}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '8px',
                  fontSize: '12px'
                }}
              >
                🎯 Todos los años
              </button>
              <button
                onClick={() => {
                  setSelectedCarreras([]);
                  setSelectedGrados([]);
                  setSelectedMaterias([]);
                }}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🗑️ Limpiar filtros
              </button>
            </div>

            {/* Resumen de filtros seleccionados */}
            {(selectedCarreras.length > 0 ||
              selectedGrados.length > 0 ||
              selectedMaterias.length > 0) && (
              <div
                style={{
                  backgroundColor: '#e3f2fd',
                  padding: '10px',
                  borderRadius: '4px',
                  marginBottom: '15px',
                  fontSize: '14px'
                }}
              >
                <strong>📊 Filtros Aplicados:</strong>
                <div style={{ marginTop: '5px' }}>
                  {selectedCarreras.length > 0 && (
                    <div>
                      <span style={{ fontWeight: 'bold' }}>Carreras:</span>{' '}
                      {carreras
                        .filter((c) => selectedCarreras.includes(c.id_carrera))
                        .map((c) => c.carrera)
                        .join(', ')}
                    </div>
                  )}
                  {selectedGrados.length > 0 && (
                    <div>
                      <span style={{ fontWeight: 'bold' }}>Años:</span>{' '}
                      {grados
                        .filter((g) => selectedGrados.includes(g.id_grado))
                        .map((g) => g.display_text || `${g.grado}-${g.division}°`)
                        .join(', ')}
                    </div>
                  )}
                  {selectedMaterias.length > 0 && (
                    <div>
                      <span style={{ fontWeight: 'bold' }}>Materias:</span>{' '}
                      {materias
                        .filter((m) => selectedMaterias.includes(m.id_uc))
                        .map((m) => m.unidad_curricular)
                        .join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleFiltrarAlumnos}
              disabled={loading}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              🔍 Filtrar Alumnos
            </button>
          </div>

          {alumnosFiltrados.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}
              >
                <strong>Alumnos Filtrados ({alumnosFiltrados.length})</strong>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedAlumnos.length === alumnosFiltrados.length}
                    onChange={handleSelectAllAlumnos}
                    style={{ marginRight: 8 }}
                  />
                  Seleccionar todos
                </label>
              </div>

              <div
                style={{
                  maxHeight: 200,
                  overflowY: 'auto',
                  border: '1px solid #ddd',
                  padding: '10px',
                  borderRadius: '4px',
                  backgroundColor: 'white'
                }}
              >
                {loadingFiltros ? (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '20px',
                      minHeight: '150px'
                    }}
                  >
                    <Spinner />
                  </div>
                ) : (
                  alumnosFiltrados.map((alumno) => (
                    <label key={alumno.id_alumno} style={{ display: 'block', marginBottom: '8px' }}>
                      <input
                        type="checkbox"
                        checked={selectedAlumnos.includes(alumno.id_alumno)}
                        onChange={() => handleAlumnoToggle(alumno.id_alumno)}
                        style={{ marginRight: 8 }}
                      />
                      <span style={{ fontSize: '14px' }}>
                        {alumno.apellido}, {alumno.nombre} - {alumno.email}
                      </span>
                      <br />
                      <span style={{ fontSize: '12px', color: '#666', marginLeft: '20px' }}>
                        {alumno.carreras} | {alumno.grados}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={editando ? handleActualizarGrupo : handleCrearGrupo}
              disabled={loading || !nombre.trim() || selectedAlumnos.length === 0}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor:
                  loading || !nombre.trim() || selectedAlumnos.length === 0
                    ? 'not-allowed'
                    : 'pointer'
              }}
            >
              {loading ? 'Guardando...' : editando ? '💾 Actualizar Grupo' : '💾 Guardar Grupo'}
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

          {selectedAlumnos.length > 0 && (
            <div
              style={{
                backgroundColor: '#e3f2fd',
                padding: '10px',
                borderRadius: '4px',
                marginTop: '15px',
                fontSize: '14px'
              }}
            >
              📊 <strong>Resumen:</strong> {selectedAlumnos.length} alumno(s) seleccionado(s) para
              el grupo
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GruposDestinatarios;
