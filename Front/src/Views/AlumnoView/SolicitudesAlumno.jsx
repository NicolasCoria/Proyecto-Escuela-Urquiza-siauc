import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SolicitudNueva from './SolicitudNueva';
import WelcomeTooltip from '../../Components/Shared/WelcomeTooltip';
import styles from './solicitudes.module.css';
import axios from '../../Components/Shared/Axios';

const SolicitudesAlumno = ({ idAlumno }) => {
  const navigate = useNavigate();
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
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error al marcar notificación como vista', error);
        }
      }
      setNotificacion(null);
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

  const totalPaginas = Math.ceil(solicitudes.length / solicitudesPorPagina);
  const solicitudesPagina = solicitudes.slice(
    (pagina - 1) * solicitudesPorPagina,
    pagina * solicitudesPorPagina
  );

  const getBadgeClass = (estado) => {
    const e = (estado || '').toLowerCase();
    if (e.includes('aprob')) return `${styles.badge} ${styles.badgeAprobado}`;
    if (e.includes('rechaz')) return `${styles.badge} ${styles.badgeRechazado}`;
    return `${styles.badge} ${styles.badgePendiente}`;
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Solicitudes</h1>
        <p className={styles.subtitle}>
          Envía nuevas solicitudes y consulta el estado de las ya enviadas.
        </p>
      </div>

      <div className={styles.content}>
        <SolicitudNueva idAlumno={idAlumno} />

        <div className={`${styles.card} ${styles.cardPadding}`}>
          <h3 style={{ marginTop: 0 }}>Solicitudes enviadas</h3>
          {notificacion && (
            <div className={styles.alert}>
              <span>
                <b>¡Atención!</b> Tu solicitud #{notificacion.id} cambió de estado a:{' '}
                <b>{notificacion.estado}</b>{' '}
              </span>
              <button className={styles.alertButton} onClick={handleCerrarNotificacion}>
                Marcar como visto
              </button>
            </div>
          )}
          {loading ? (
            <div className={styles.loadingCard}>Cargando...</div>
          ) : solicitudesPagina.length === 0 ? (
            <div className={styles.emptyCard}>No tienes solicitudes enviadas.</div>
          ) : (
            <>
              <ul className={styles.list}>
                {solicitudesPagina.map((s) => (
                  <li key={s.id} className={styles.item}>
                    <div className={styles.itemInner}>
                      <div className={styles.itemHeader}>
                        <div className={styles.itemTitle}>Solicitud #{s.id}</div>
                        <span className={getBadgeClass(s.estado)}>{s.estado}</span>
                      </div>
                      <div className={styles.itemBody}>
                        <div className={styles.itemField}>
                          <b>Categoría:</b> {s.categoria}
                        </div>
                        <div className={styles.itemField}>
                          <b>Asunto:</b> {s.asunto}
                        </div>
                        <div className={styles.itemField} style={{ gridColumn: '1 / -1' }}>
                          <b>Mensaje:</b> {s.mensaje}
                        </div>
                        <div className={styles.itemField}>
                          <b>Fecha de creación:</b> {s.fecha_creacion}
                        </div>
                        {s.fecha_respuesta && (
                          <div className={styles.itemField}>
                            <b>Fecha de respuesta:</b> {s.fecha_respuesta}
                          </div>
                        )}
                        <div className={styles.itemField} style={{ gridColumn: '1 / -1' }}>
                          <b>Respuesta:</b> {s.respuesta || 'Sin respuesta'}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {totalPaginas > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageButton}
                    onClick={() => setPagina(1)}
                    disabled={pagina === 1}
                  >
                    « Primera
                  </button>
                  <button
                    className={styles.pageButton}
                    onClick={() => setPagina(pagina - 1)}
                    disabled={pagina === 1}
                  >
                    ‹ Anterior
                  </button>
                  <span className={styles.pageInfo}>
                    Página {pagina} de {totalPaginas}
                  </span>
                  <button
                    className={styles.pageButton}
                    onClick={() => setPagina(pagina + 1)}
                    disabled={pagina === totalPaginas}
                  >
                    Siguiente ›
                  </button>
                  <button
                    className={styles.pageButton}
                    onClick={() => setPagina(totalPaginas)}
                    disabled={pagina === totalPaginas}
                  >
                    Última »
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <WelcomeTooltip
        id="alumno-solicitudes"
        userId={idAlumno}
        title="¡Bienvenido a Solicitudes!"
        message="Aquí puedes enviar nuevas solicitudes y ver el estado de las que ya enviaste. Completa el formulario con la categoría, asunto y mensaje para enviar una nueva solicitud."
        onViewFaqs={() => navigate('/alumno/faqs')}
      />
    </section>
  );
};

export default SolicitudesAlumno;
