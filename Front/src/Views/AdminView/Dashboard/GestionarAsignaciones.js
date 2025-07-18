import React, { useState, useEffect } from 'react';
import axiosClient from '../../../Components/Shared/Axios';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar encuestas, carreras, grados y materias al inicio
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [encuestasRes, carrerasRes, gradosRes, materiasRes] = await Promise.all([
          axiosClient.get('/encuestas'),
          axiosClient.get('/carreras'),
          axiosClient.get('/grados'),
          axiosClient.get('/unidades-curriculares')
        ]);
        setEncuestas(encuestasRes.data.encuestas || []);
        setCarreras(carrerasRes.data.carreras || []);
        setGrados(gradosRes.data || []);
        setMaterias(materiasRes.data || []);
      } catch (err) {
        setError('Error al cargar datos iniciales');
      }
    };
    fetchData();
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
    setLoading(true);
    setError('');
    setSuccess('');
    setAlumnos([]);
    setSelectedAlumnos([]);
    try {
      const params = {
        id_carrera: selectedCarrera
      };
      if (selectedGrado) params.id_grado = selectedGrado;
      if (selectedMateria) params.id_uc = selectedMateria;
      const res = await axiosClient.get('/alumnos/filtrados', { params });
      setAlumnos(res.data.alumnos || []);
    } catch (err) {
      setError('Error al filtrar alumnos');
    } finally {
      setLoading(false);
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

  // Asignar encuesta a los seleccionados o a todos los filtrados
  const handleAsignar = async () => {
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
        await axiosClient.post('/encuestas/asignar-filtrado', {
          id_encuesta: selectedEncuesta,
          id_carrera: selectedCarrera,
          id_grado: selectedGrado || undefined,
          id_uc: selectedMateria || undefined
        });
        setSuccess('Encuesta asignada a todos los alumnos filtrados');
      }
      setSelectedAlumnos([]);
    } catch (err) {
      setError('Error al asignar la encuesta');
    } finally {
      setLoading(false);
    }
  };

  // Validar si se puede asignar (carrera obligatoria siempre)
  const puedeAsignar = selectedEncuesta && alumnos.length > 0 && selectedCarrera;

  return (
    <div style={{ background: '#f9f9f9', padding: 24, borderRadius: 8, marginBottom: 32 }}>
      <h3>Gestionar Asignaciones de Encuestas</h3>
      <div style={{ marginBottom: 20 }}>
        <label>
          <strong>Seleccionar Encuesta:</strong>
          <br />
          <select
            value={selectedEncuesta}
            onChange={(e) => setSelectedEncuesta(e.target.value)}
            style={{ width: '100%', marginTop: 5 }}
          >
            <option value="">Selecciona una encuesta</option>
            {encuestas.map((encuesta) => (
              <option key={encuesta.id_encuesta} value={encuesta.id_encuesta}>
                {encuesta.titulo} - {encuesta.carrera?.carrera || 'Sin carrera'}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label>
          <strong>Carrera:</strong>
          <br />
          <select
            value={selectedCarrera}
            onChange={(e) => setSelectedCarrera(e.target.value)}
            style={{ width: '100%', marginTop: 5 }}
          >
            <option value="">Selecciona una carrera</option>
            {carreras.map((carrera) => (
              <option key={carrera.id_carrera} value={carrera.id_carrera}>
                {carrera.carrera}
              </option>
            ))}
          </select>
        </label>
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
                {grado.grado}
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
      {alumnos.length > 0 && (
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
