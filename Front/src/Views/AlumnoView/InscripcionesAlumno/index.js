import React, { useState } from 'react';
import Skeleton from '../../../Components/Shared/Skeleton';
import { useStateContext } from '../../../Components/Contexts';

const InscripcionesAlumno = () => {
  const { carrera, unidadesDisponibles } = useStateContext();
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Obtener token del localStorage (ajusta según tu auth)
  const token = localStorage.getItem('token');

  const handleSelect = (id) => {
    setSeleccionadas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleInscribir = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await import('../../../Components/Shared/Axios').then((m) =>
        m.default.post(
          '/alumno/inscribir-unidades',
          { unidades: seleccionadas },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      setInscripciones(res.data.inscripciones);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al inscribirse');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarComprobante = async () => {
    setLoading(true);
    try {
      const axios = (await import('../../../Components/Shared/Axios')).default;
      const res = await axios.post(
        '/alumno/comprobante-inscripcion',
        { inscripciones: inscripciones.map((i) => i.id_inscripcion) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/pdf'
          },
          responseType: 'blob'
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'comprobante_inscripcion.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error al descargar el comprobante.');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el nombre de la UC por ID
  const getUnidadName = (id_uc) => {
    const unidad = unidadesDisponibles.find((uc) => uc.id_uc === id_uc);
    return unidad ? unidad.unidad_curricular || unidad.Unidad_Curricular : 'UC no encontrada';
  };

  // Función para formatear fecha y hora
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      fecha: date.toLocaleDateString('es-AR'),
      hora: date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // Función para obtener el nombre de la carrera desde el contexto
  const getCarreraName = () => {
    return carrera ? carrera.carrera : 'Carrera no especificada';
  };

  return (
    <main
      style={{
        maxWidth: 500,
        margin: '60px auto 40px auto',
        fontFamily: 'Inter, Arial, sans-serif'
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: 36 }}>Inscripción a Unidades Curriculares</h2>
      {/* Mostrar skeleton solo cuando está cargando las UC inicialmente */}
      {loading && !success && (
        <div style={{ marginBottom: 24 }}>
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} height={28} style={{ marginBottom: 14, borderRadius: 8 }} />
          ))}
        </div>
      )}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {/* Formulario de inscripción */}
      {!success && !loading && (
        <>
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 2px 12px #0002',
              padding: 24,
              marginBottom: 24
            }}
          >
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {unidadesDisponibles.map((uc) => (
                <li
                  key={uc.id_uc}
                  style={{
                    marginBottom: 12,
                    borderBottom: '1px solid #eee',
                    paddingBottom: 8
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={seleccionadas.includes(uc.id_uc)}
                      onChange={() => handleSelect(uc.id_uc)}
                    />
                    <span>{uc.unidad_curricular || uc.Unidad_Curricular}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={handleInscribir}
            disabled={seleccionadas.length === 0 || loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 16,
              cursor: seleccionadas.length === 0 || loading ? 'not-allowed' : 'pointer',
              marginTop: 16
            }}
          >
            Inscribirse
          </button>
        </>
      )}
      {/* Comprobante de inscripción exitosa */}
      {success && (
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 12px #0002',
            padding: 24,
            marginBottom: 24
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h3 style={{ color: '#43a047', marginBottom: 16 }}>¡Inscripción exitosa!</h3>
            <p style={{ color: '#666', marginBottom: 20 }}>
              Te has inscripto en las siguientes unidades curriculares:
            </p>
          </div>
          <div style={{ marginBottom: 24 }}>
            {inscripciones.map((insc, i) => {
              const { fecha, hora } = formatDateTime(
                insc.FechaHora || insc.fecha_inscripcion || insc.created_at || new Date()
              );
              return (
                <div
                  key={insc.id_inscripcion}
                  style={{
                    padding: 16,
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    marginBottom: 12,
                    backgroundColor: '#fafafa'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                    {i + 1}. {getUnidadName(insc.id_uc)}
                  </div>
                  <div style={{ fontSize: 14, color: '#666' }}>
                    <div>Fecha: {fecha}</div>
                    <div>Hora: {hora}</div>
                    <div>Carrera: {getCarreraName()}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleDescargarComprobante}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: '#43a047',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 16,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Descargando...' : 'Descargar comprobante PDF'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default InscripcionesAlumno;
