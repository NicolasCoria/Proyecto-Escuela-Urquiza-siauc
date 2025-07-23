import React, { useState, useEffect } from 'react';
import axiosClient from '../../../Components/Shared/Axios';
import Spinner from '../../../Components/Shared/Spinner';

const GestionarAsignaciones = () => {
  const [encuestas, setEncuestas] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [grados, setGrados] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [selectedEncuesta, setSelectedEncuesta] = useState('');
  const [selectedCarrera, setSelectedCarrera] = useState('');
  const [selectedGrado, setSelectedGrado] = useState('');
  const [selectedMateria, setSelectedMateria] = useState('');
  const [alumnos, setAlumnos] = useState([]);
  const [selectedAlumnos, setSelectedAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(false);
  const [loadingFiltros, setLoadingFiltros] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mostrarTodasEncuestas, setMostrarTodasEncuestas] = useState(false);

  // Estados para grupos de destinatarios
  const [grupos, setGrupos] = useState([]);
  const [selectedGrupos, setSelectedGrupos] = useState([]);
  const [cargandoGrupos, setCargandoGrupos] = useState(false);
  const [usarGrupos, setUsarGrupos] = useState(false);

  // Cargar encuestas, carreras, grados y materias al inicio
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingDatos(true);
        // ✅ Optimizado: Una sola llamada con caché
        const cacheKey = 'dashboardData';
        const cached = sessionStorage.getItem(cacheKey);
        const cacheAge = cached ? JSON.parse(cached).timestamp : 0;
        const now = Date.now();

        // Usar caché si tiene menos de 5 minutos
        if (cached && now - cacheAge < 300000) {
          const data = JSON.parse(cached).data;
          setEncuestas(data.encuestas || []);
          setCarreras(data.carreras || []);
          setGrados(data.grados || []);
          setMaterias(data.materias || []);
          setLoadingDatos(false);
          return;
        }

        const params = {};
        if (!mostrarTodasEncuestas) {
          params.fecha_actual = new Date().toISOString().split('T')[0];
        }

        // ✅ Una sola llamada HTTP optimizada
        const response = await axiosClient.get('/dashboard-data', { params });

        if (response.data.success) {
          const data = response.data.data;
          setEncuestas(data.encuestas || []);
          setCarreras(data.carreras || []);
          setGrados(data.grados || []);
          setMaterias(data.materias || []);

          // Guardar en caché
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              data: data,
              timestamp: now
            })
          );
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Error al cargar datos iniciales');
      } finally {
        setLoadingDatos(false);
      }
    };
    fetchData();
  }, [mostrarTodasEncuestas]);

  // Cargar grupos de destinatarios
  useEffect(() => {
    const cargarGrupos = async () => {
      try {
        setCargandoGrupos(true);
        const response = await axiosClient.get('/grupos-destinatarios');
        if (response.data.success) {
          setGrupos(response.data.grupos || []);
        }
      } catch (err) {
        console.error('Error cargando grupos:', err);
      } finally {
        setCargandoGrupos(false);
      }
    };

    cargarGrupos();
  }, []);

  // Sincronizar carrera con la encuesta seleccionada
  useEffect(() => {
    if (selectedEncuesta && encuestas.length > 0) {
      const encuesta = encuestas.find((e) => e.id_encuesta === selectedEncuesta);
      if (encuesta && encuesta.id_carrera) {
        setSelectedCarrera(String(encuesta.id_carrera));
      }
    }
    // eslint-disable-next-line
  }, [selectedEncuesta]);

  // Filtrar materias por carrera y grado
  useEffect(() => {
    const fetchMaterias = async () => {
      if (selectedCarrera) {
        // Traer todas las materias de la carrera
        let todasMaterias = [];
        try {
          const resAll = await axiosClient.get('/unidades-curriculares', {
            params: { id_carrera: selectedCarrera }
          });
          todasMaterias = resAll.data || [];
        } catch (err) {
          todasMaterias = [];
        }
        if (selectedGrado) {
          // Traer materias del año
          try {
            const res = await axiosClient.get('/unidades-curriculares/por-carrera-grado', {
              params: { id_carrera: selectedCarrera, id_grado: selectedGrado }
            });
            const idsVerdes = (res.data.materias || []).map((m) => m.id_uc);
            setMaterias(
              todasMaterias.map((m) => ({
                ...m,
                esDelAnio: idsVerdes.includes(m.id_uc)
              }))
            );
          } catch (err) {
            setMaterias(todasMaterias.map((m) => ({ ...m, esDelAnio: false })));
          }
        } else {
          setMaterias(todasMaterias.map((m) => ({ ...m, esDelAnio: false })));
        }
      } else {
        setMaterias([]);
      }
    };
    fetchMaterias();
    // eslint-disable-next-line
  }, [selectedCarrera, selectedGrado]);

  // Filtrar alumnos según los selects
  const handleFiltrarAlumnos = async () => {
    setLoadingFiltros(true);
    setError('');
    setSuccess('');
    setAlumnos([]);
    setSelectedAlumnos([]);
    try {
      if (usarGrupos) {
        // Modo grupos: obtener alumnos de grupos seleccionados
        if (selectedGrupos.length === 0) {
          setError('Debes seleccionar al menos un grupo de destinatarios');
          return;
        }

        const params = { grupos: selectedGrupos };
        const res = await axiosClient.post('/grupos-destinatarios/filtrar-alumnos', params);
        setAlumnos(res.data.alumnos || []);
      } else {
        // Modo normal: filtrar por carrera/año/materia
        const params = {};

        // Manejar "todas las carreras"
        if (selectedCarrera === 'todas') {
          // No enviar id_carrera para obtener todas las carreras
        } else if (selectedCarrera) {
          params.id_carrera = selectedCarrera;
        }

        if (selectedGrado) params.id_grado = selectedGrado;
        if (selectedMateria) params.id_uc = selectedMateria;

        const res = await axiosClient.get('/alumnos/filtrados', { params });
        setAlumnos(res.data.alumnos || []);
      }
    } catch (err) {
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

  const handleSelectAll = () => {
    if (selectedAlumnos.length === alumnos.length) {
      setSelectedAlumnos([]);
    } else {
      setSelectedAlumnos(alumnos.map((a) => a.id_alumno));
    }
  };

  const handleGrupoToggle = (grupoId) => {
    setSelectedGrupos((prev) =>
      prev.includes(grupoId) ? prev.filter((id) => id !== grupoId) : [...prev, grupoId]
    );
  };

  const handleSelectAllGrupos = () => {
    if (selectedGrupos.length === grupos.length) {
      setSelectedGrupos([]);
    } else {
      setSelectedGrupos(grupos.map((g) => g.id_grupo));
    }
  };

  const toggleModoAsignacion = () => {
    setUsarGrupos(!usarGrupos);
    // Limpiar selecciones al cambiar modo
    if (!usarGrupos) {
      // Cambiando a modo grupos
      setSelectedCarrera('');
      setSelectedGrado('');
      setSelectedMateria('');
      setAlumnos([]);
      setSelectedAlumnos([]);
    } else {
      // Cambiando a modo normal
      setSelectedGrupos([]);
      setAlumnos([]);
      setSelectedAlumnos([]);
    }
  };

  // Asignar encuesta a los seleccionados o a todos los filtrados
  const handleAsignar = async () => {
    // Validación según modo
    if (usarGrupos) {
      if (selectedGrupos.length === 0) {
        setError('Debes seleccionar al menos un grupo de destinatarios');
        return;
      }
    } else {
      if (!selectedCarrera) {
        setError('Debes seleccionar una carrera o "Todas las carreras" para asignar la encuesta');
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (selectedAlumnos.length > 0) {
        // Asignar solo a los seleccionados
        await axiosClient.post('/encuestas/asignar-alumnos', {
          id_encuesta: selectedEncuesta,
          alumnos: selectedAlumnos
        });
        setSuccess(`Encuesta asignada a ${selectedAlumnos.length} alumno(s)`);
      } else {
        // Asignar a todos los filtrados
        if (usarGrupos) {
          // Asignar por grupos
          await axiosClient.post('/encuestas/asignar-grupos', {
            id_encuesta: selectedEncuesta,
            grupos: selectedGrupos
          });
          setSuccess('Encuesta asignada a todos los alumnos de los grupos seleccionados');
        } else {
          // Asignar por filtros normales
          const params = {
            id_encuesta: selectedEncuesta,
            id_grado: selectedGrado || undefined,
            id_uc: selectedMateria || undefined
          };

          // Solo enviar id_carrera si no es "todas las carreras"
          if (selectedCarrera !== 'todas') {
            params.id_carrera = selectedCarrera;
          }

          await axiosClient.post('/encuestas/asignar-filtrado', params);
          setSuccess('Encuesta asignada a todos los alumnos filtrados');
        }
      }
      setSelectedAlumnos([]);
    } catch (err) {
      setError('Error al asignar la encuesta');
    } finally {
      setLoading(false);
    }
  };

  // Función para recargar encuestas
  const recargarEncuestas = async () => {
    try {
      setError('');
      setSuccess('');

      // ✅ Limpiar caché para forzar recarga
      sessionStorage.removeItem('dashboardData');

      const params = {};
      if (!mostrarTodasEncuestas) {
        params.fecha_actual = new Date().toISOString().split('T')[0];
      }

      const response = await axiosClient.get('/dashboard-data', { params });

      if (response.data.success) {
        const data = response.data.data;
        setEncuestas(data.encuestas || []);
        setCarreras(data.carreras || []);
        setGrados(data.grados || []);
        setMaterias(data.materias || []);

        // Actualizar caché
        sessionStorage.setItem(
          'dashboardData',
          JSON.stringify({
            data: data,
            timestamp: Date.now()
          })
        );

        setSuccess('Datos actualizados correctamente');
      }

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error reloading data:', err);
      setError('Error al recargar datos');
      // Limpiar mensaje de error después de 5 segundos
      setTimeout(() => setError(''), 5000);
    }
  };

  // Validar si se puede asignar según el modo
  const puedeAsignar =
    selectedEncuesta &&
    alumnos.length > 0 &&
    (usarGrupos ? selectedGrupos.length > 0 : selectedCarrera);

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
        <h3>Gestionar Asignaciones de Encuestas</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={recargarEncuestas}
            style={{
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            title="Recargar lista de encuestas"
          >
            🔄 Recargar
          </button>
          <button
            onClick={() => setMostrarTodasEncuestas(!mostrarTodasEncuestas)}
            style={{
              backgroundColor: mostrarTodasEncuestas ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {mostrarTodasEncuestas ? 'Mostrar Solo Activas' : 'Mostrar Todas'}
          </button>
        </div>
      </div>
      <div
        style={{
          backgroundColor: mostrarTodasEncuestas ? '#fff3cd' : '#d4edda',
          color: mostrarTodasEncuestas ? '#856404' : '#155724',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '14px'
        }}
      >
        {mostrarTodasEncuestas
          ? '⚠️ Mostrando todas las encuestas (incluyendo vencidas)'
          : '✅ Mostrando solo encuestas activas en el período actual'}
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
      <div style={{ marginBottom: 20 }}>
        <label>
          <strong>Seleccionar Encuesta:</strong>
          <br />
          {loadingDatos ? (
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
              value={selectedEncuesta}
              onChange={(e) => setSelectedEncuesta(e.target.value)}
              style={{ width: '100%', marginTop: 5 }}
            >
              <option value="">Selecciona una encuesta</option>
              {encuestas.map((encuesta) => {
                const fechaActual = new Date();
                const fechaInicio = encuesta.fecha_inicio ? new Date(encuesta.fecha_inicio) : null;
                const fechaFin = encuesta.fecha_fin ? new Date(encuesta.fecha_fin) : null;

                let estado = '';
                if (fechaInicio && fechaFin) {
                  if (fechaActual < fechaInicio) {
                    estado = ' (Próximamente)';
                  } else if (fechaActual > fechaFin) {
                    estado = ' (Vencida)';
                  } else {
                    estado = ' (Activa)';
                  }
                } else if (fechaInicio && !fechaFin) {
                  if (fechaActual < fechaInicio) {
                    estado = ' (Próximamente)';
                  } else {
                    estado = ' (Activa)';
                  }
                } else if (!fechaInicio && fechaFin) {
                  if (fechaActual > fechaFin) {
                    estado = ' (Vencida)';
                  } else {
                    estado = ' (Activa)';
                  }
                } else {
                  estado = ' (Sin fechas)';
                }

                return (
                  <option
                    key={encuesta.id_encuesta}
                    value={encuesta.id_encuesta}
                    style={{
                      color: estado.includes('Vencida')
                        ? '#dc3545'
                        : estado.includes('Próximamente')
                          ? '#ffc107'
                          : estado.includes('Activa')
                            ? '#28a745'
                            : '#6c757d'
                    }}
                  >
                    {encuesta.titulo} - {encuesta.carrera?.carrera || 'Sin carrera'} {estado}
                  </option>
                );
              })}
            </select>
          )}
        </label>
      </div>

      {/* Selector de Modo de Asignación */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            backgroundColor: '#e3f2fd',
            border: '1px solid #bbdefb',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '15px'
          }}
        >
          <strong>🎯 Modo de Asignación:</strong>
          <div style={{ marginTop: '8px' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', marginRight: '20px' }}>
              <input
                type="radio"
                checked={!usarGrupos}
                onChange={toggleModoAsignacion}
                style={{ marginRight: '6px' }}
              />
              📊 <strong>Filtros por Carrera/Año/Materia</strong>
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center' }}>
              <input
                type="radio"
                checked={usarGrupos}
                onChange={toggleModoAsignacion}
                style={{ marginRight: '6px' }}
              />
              🎯 <strong>Grupos de Destinatarios</strong>
            </label>
          </div>
        </div>
      </div>

      {!usarGrupos ? (
        <>
          <div style={{ marginBottom: 20 }}>
            <label>
              <strong style={{ color: '#dc3545' }}>Carrera: *</strong>
              <br />
              <select
                value={selectedCarrera}
                onChange={(e) => setSelectedCarrera(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 5,
                  border: selectedCarrera
                    ? selectedCarrera === 'todas'
                      ? '1px solid #007bff'
                      : '1px solid #28a745'
                    : '1px solid #dc3545',
                  backgroundColor: selectedCarrera
                    ? selectedCarrera === 'todas'
                      ? '#e3f2fd'
                      : '#f8fff9'
                    : '#fff5f5'
                }}
                required
              >
                <option value="">Selecciona una carrera (Obligatorio)</option>
                <option value="todas" style={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>
                  🌟 Todas las carreras
                </option>
                {carreras.map((carrera) => (
                  <option key={carrera.id_carrera} value={carrera.id_carrera}>
                    {carrera.carrera}
                  </option>
                ))}
              </select>
            </label>
            <div
              style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '8px',
                borderRadius: '4px',
                marginTop: '5px',
                fontSize: '12px'
              }}
            >
              ⚠️ <strong>Importante:</strong> La carrera es obligatoria para asignar encuestas.
              Selecciona una carrera específica o &quot;Todas las carreras&quot; para asignar la
              encuesta.
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>
              <strong>Año (Grado):</strong>
              <br />
              <select
                value={selectedGrado}
                onChange={(e) => setSelectedGrado(e.target.value)}
                style={{ width: '100%', marginTop: 5 }}
              >
                <option value="">Todos los años</option>
                {grados.map((grado) => (
                  <option key={grado.id_grado} value={grado.id_grado}>
                    {grado.display_text || `${grado.grado}-${grado.division}°`}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>
              <strong>Materia (Unidad Curricular):</strong>
              <br />
              <select
                value={selectedMateria}
                onChange={(e) => setSelectedMateria(e.target.value)}
                style={{ width: '100%', marginTop: 5 }}
              >
                <option value="">Todas las materias</option>
                {materias.map((uc) => (
                  <option
                    key={uc.id_uc}
                    value={uc.id_uc}
                    style={{
                      backgroundColor: uc.esDelAnio ? '#d4edda' : '#f8f9fa',
                      color: uc.esDelAnio ? '#155724' : '#888'
                    }}
                    disabled={selectedGrado && !uc.esDelAnio}
                  >
                    {uc.unidad_curricular || uc.Unidad_Curricular}
                    {uc.esDelAnio ? ' (Año seleccionado)' : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            onClick={handleFiltrarAlumnos}
            disabled={!selectedCarrera || loading}
            style={{
              marginBottom: 20,
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Filtrar Alumnos
          </button>
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
            alumnos.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <strong>Alumnos filtrados:</strong>
                <div
                  style={{
                    maxHeight: 250,
                    overflowY: 'auto',
                    border: '1px solid #ddd',
                    padding: 10,
                    marginTop: 5
                  }}
                >
                  <label style={{ display: 'block', marginBottom: 8 }}>
                    <input
                      type="checkbox"
                      checked={selectedAlumnos.length === alumnos.length}
                      onChange={handleSelectAll}
                      style={{ marginRight: 8 }}
                    />
                    Seleccionar todos
                  </label>
                  {alumnos.map((alumno) => (
                    <label key={alumno.id_alumno} style={{ display: 'block', marginBottom: 5 }}>
                      <input
                        type="checkbox"
                        checked={selectedAlumnos.includes(alumno.id_alumno)}
                        onChange={() => handleAlumnoToggle(alumno.id_alumno)}
                        style={{ marginRight: 8 }}
                      />
                      {alumno.apellido}, {alumno.nombre} - {alumno.email}
                    </label>
                  ))}
                </div>
              </div>
            )
          )}
        </>
      ) : (
        <>
          {/* Modo Grupos de Destinatarios */}
          <div style={{ marginBottom: 20 }}>
            <label>
              <strong>🎯 Grupos de Destinatarios:</strong>
              <br />
              <div
                style={{
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '12px',
                  marginTop: 5,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
              >
                {cargandoGrupos ? (
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
                ) : grupos.length > 0 ? (
                  <>
                    <div style={{ marginBottom: '10px' }}>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedGrupos.length === grupos.length && grupos.length > 0}
                          onChange={handleSelectAllGrupos}
                          style={{ marginRight: 6 }}
                        />
                        🌟 Seleccionar todos los grupos
                      </label>
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      {grupos.map((grupo) => (
                        <label
                          key={grupo.id_grupo}
                          style={{ display: 'block', marginBottom: '6px' }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedGrupos.includes(grupo.id_grupo)}
                            onChange={() => handleGrupoToggle(grupo.id_grupo)}
                            style={{ marginRight: 6 }}
                          />
                          <strong>{grupo.nombre}</strong>
                          {grupo.descripcion && (
                            <span style={{ color: '#6c757d', marginLeft: '8px' }}>
                              - {grupo.descripcion}
                            </span>
                          )}
                          <span style={{ color: '#28a745', marginLeft: '8px' }}>
                            ({grupo.cantidad_alumnos || 0} alumnos)
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: '#6c757d', fontStyle: 'italic' }}>
                    No hay grupos de destinatarios creados.
                    <br />
                    <small>
                      Crea grupos en &quot;Grupos de Destinatarios&quot; para usarlos aquí.
                    </small>
                  </div>
                )}
              </div>
            </label>
          </div>
          <button
            onClick={handleFiltrarAlumnos}
            disabled={selectedGrupos.length === 0 || loading}
            style={{
              marginBottom: 20,
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Filtrar Alumnos por Grupos
          </button>
          {alumnos.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <strong>Alumnos de grupos seleccionados:</strong>
              <div
                style={{
                  maxHeight: 250,
                  overflowY: 'auto',
                  border: '1px solid #ddd',
                  padding: 10,
                  marginTop: 5
                }}
              >
                <label style={{ display: 'block', marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={selectedAlumnos.length === alumnos.length}
                    onChange={handleSelectAll}
                    style={{ marginRight: 8 }}
                  />
                  Seleccionar todos
                </label>
                {alumnos.map((alumno) => (
                  <label key={alumno.id_alumno} style={{ display: 'block', marginBottom: 5 }}>
                    <input
                      type="checkbox"
                      checked={selectedAlumnos.includes(alumno.id_alumno)}
                      onChange={() => handleAlumnoToggle(alumno.id_alumno)}
                      style={{ marginRight: 8 }}
                    />
                    {alumno.apellido}, {alumno.nombre} - {alumno.email}
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <button
        onClick={handleAsignar}
        disabled={!puedeAsignar || loading}
        style={{
          backgroundColor: '#28a745',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {selectedAlumnos.length > 0
          ? `Asignar a ${selectedAlumnos.length} alumno(s)`
          : 'Asignar a todos los filtrados'}
      </button>
      {!selectedCarrera && (
        <div style={{ color: 'orange', marginTop: 10 }}>
          Debes seleccionar una carrera para asignar esta encuesta.
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
    </div>
  );
};

export default GestionarAsignaciones;
