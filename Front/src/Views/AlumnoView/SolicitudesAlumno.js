import React, { useEffect, useState } from 'react';
import SolicitudNueva from './SolicitudNueva';
import styles from '../../Components/Home/home.module.css';
import axios from '../../Components/Shared/Axios';

const SolicitudesAlumno = ({ idAlumno }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificacion, setNotificacion] = useState(null);
  const [pagina, setPagina] = useState(1);
  const solicitudesPorPagina = 10;

  useEffect(() => {
    if (!idAlumno) return;
    setLoading(true);
    axios
      .get('/solicitudes')
      .then((res) => {
        const propias = res.data.filter((s) => s.id_alumno === idAlumno);
        setSolicitudes(propias);
        // Buscar la primera solicitud con cambio de estado no visto
        const noti = propias.find((s) => s.estado !== s.estado_visto);
        if (noti) {
          setNotificacion({ id: noti.id, estado: noti.estado });
        } else {
          setNotificacion(null);
        }
      })
      .catch(() => setSolicitudes([]))
      .finally(() => setLoading(false));
  }, [idAlumno]);

  const handleCerrarNotificacion = async () => {
    if (notificacion) {
      try {
        await axios.post(`/solicitudes/${notificacion.id}/marcar-visto`);
      } catch {
        // Ignorar error, solo ocultar la notificación
      }
      setNotificacion(null);
      // Refrescar solicitudes para actualizar el estado_visto
      setLoading(true);
      axios
        .get('/solicitudes')
        .then((res) => {
          const propias = res.data.filter((s) => s.id_alumno === idAlumno);
          setSolicitudes(propias);
        })
        .finally(() => setLoading(false));
    }
  };

  // Paginación
  const totalPaginas = Math.ceil(solicitudes.length / solicitudesPorPagina);
  const solicitudesPagina = solicitudes.slice(
    (pagina - 1) * solicitudesPorPagina,
    pagina * solicitudesPorPagina
  );

  return (
    <section className={styles.container} style={{ marginLeft: 40 }}>
      <div className={styles.title}>Solicitudes</div>
      <div
        className={styles.subContainer}
        style={{ flexDirection: 'column', alignItems: 'center', gap: 24 }}
      >
        <SolicitudNueva idAlumno={idAlumno} />
        <hr style={{ width: '100%', margin: '32px 0' }} />
        <h3>Solicitudes enviadas</h3>
        {notificacion && (
          <div
            style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: 16,
              borderRadius: 8,
              marginBottom: 24,
              border: '1px solid #fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: 600
            }}
          >
            <span>
              <b>¡Atención!</b> Tu solicitud #{notificacion.id} cambió de estado a:{' '}
              <b>{notificacion.estado}</b>{' '}
            </span>
            <button
              style={{
                marginLeft: 16,
                background: '#fbbf24',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '6px 12px',
                cursor: 'pointer'
              }}
              onClick={handleCerrarNotificacion}
            >
              Marcar como visto
            </button>
          </div>
        )}
        {loading ? (
          <div>Cargando...</div>
        ) : solicitudesPagina.length === 0 ? (
          <div>No tienes solicitudes enviadas.</div>
        ) : (
          <>
            <ul style={{ width: '100%', maxWidth: 600 }}>
              {solicitudesPagina.map((s) => (
                <li
                  key={s.id}
                  style={{
                    marginBottom: 24,
                    padding: 16,
                    border: '1px solid #ccc',
                    borderRadius: 8
                  }}
                >
                  <div>
                    <b>Categoría:</b> {s.categoria}
                  </div>
                  <div>
                    <b>Asunto:</b> {s.asunto}
                  </div>
                  <div>
                    <b>Mensaje:</b> {s.mensaje}
                  </div>
                  <div>
                    <b>Estado:</b> {s.estado}
                  </div>
                  <div>
                    <b>Respuesta:</b> {s.respuesta || 'Sin respuesta'}
                  </div>
                  <div>
                    <b>Fecha de creación:</b> {s.fecha_creacion}
                  </div>
                  {s.fecha_respuesta && (
                    <div>
                      <b>Fecha de respuesta:</b> {s.fecha_respuesta}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {/* Controles de paginación */}
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 8 }}>
                <button onClick={() => setPagina(1)} disabled={pagina === 1}>
                  « Primera
                </button>
                <button onClick={() => setPagina(pagina - 1)} disabled={pagina === 1}>
                  ‹ Anterior
                </button>
                <span style={{ alignSelf: 'center' }}>
                  Página {pagina} de {totalPaginas}
                </span>
                <button onClick={() => setPagina(pagina + 1)} disabled={pagina === totalPaginas}>
                  Siguiente ›
                </button>
                <button onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas}>
                  Última »
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default SolicitudesAlumno;
