import React, { useEffect, useState } from 'react';
import axios from '../../../Components/Shared/Axios';
import Skeleton from '../../../Components/Shared/Skeleton';

const InscripcionesAlumno = () => {
  const [unidades, setUnidades] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Obtener token del localStorage (ajusta según tu auth)
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUnidades = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/alumno/unidades-disponibles', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnidades(res.data);
      } catch (err) {
        setError('Error al cargar las unidades curriculares');
      } finally {
        setLoading(false);
      }
    };
    fetchUnidades();
  }, [token]);

  const handleSelect = (id) => {
    setSeleccionadas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleInscribir = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        '/alumno/inscribir-unidades',
        { unidades: seleccionadas },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInscripciones(res.data.inscripciones);
      setSuccess(true);
    } catch (err) {
      setError('Error al inscribirse.');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarComprobante = async () => {
    setLoading(true);
    setError('');
    try {
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

  return (
    <main
      style={{
        maxWidth: 500,
        margin: '60px auto 40px auto',
        fontFamily: 'Inter, Arial, sans-serif'
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: 36 }}>Inscripción a Unidades Curriculares</h2>
      {loading && (
        <div style={{ marginBottom: 24 }}>
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} height={28} style={{ marginBottom: 14, borderRadius: 8 }} />
          ))}
        </div>
      )}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {!success && !loading ? (
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
              {unidades.map((uc) => (
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
      ) : !loading ? (
        <div style={{ textAlign: 'center' }}>
          <h3>¡Inscripción exitosa!</h3>
          <p>Te has inscripto en las siguientes unidades curriculares:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {inscripciones.map((insc, i) => (
              <li key={insc.id_inscripcion} style={{ marginBottom: 8 }}>
                {i + 1}. ID Inscripción: {insc.id_inscripcion}
              </li>
            ))}
          </ul>
          <button
            onClick={handleDescargarComprobante}
            style={{
              marginTop: 20,
              padding: '10px 24px',
              background: '#43a047',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            Descargar comprobante PDF
          </button>
        </div>
      ) : null}
    </main>
  );
};

export default InscripcionesAlumno;
