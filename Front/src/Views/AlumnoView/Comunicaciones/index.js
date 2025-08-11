import React, { useState, useEffect } from 'react';
import styles from './comunicaciones.module.css';
import Button from '../../../Components/Shared/Button';
import Modal from '../../../Components/Shared/Modal';
import Spinner from '../../../Components/Shared/Spinner';
import axiosClient from '../../../Components/Shared/Axios';
import { useModalContext } from '../../../Components/Contexts';
import {
  FaEnvelope,
  FaEnvelopeOpen,
  FaEnvelopeOpenText,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaEye,
  FaArrowLeft,
  FaCheckDouble
} from 'react-icons/fa';

const Comunicaciones = () => {
  const { openModal, closeModal } = useModalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    total_mensajes: 0,
    mensajes_leidos: 0,
    mensajes_no_leidos: 0,
    por_prioridad: {
      urgente: 0,
      alta: 0,
      media: 0,
      baja: 0
    }
  });
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      // Cargar mensajes
      const responseMensajes = await axiosClient.get('/alumno/mensajes');
      if (responseMensajes.data.success) {
        setMensajes(responseMensajes.data.mensajes);
      } else {
        setError(responseMensajes.data.error || 'Error al cargar mensajes');
      }

      // Cargar estadísticas
      const responseStats = await axiosClient.get('/alumno/mensajes/estadisticas');
      if (responseStats.data.success) {
        setEstadisticas(responseStats.data.estadisticas);
      } else {
        console.error('Error en estadísticas:', responseStats.data.error);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      // Mostrar error más específico
      if (error.response) {
        const errorData = error.response.data;
        if (errorData.debug === 'Tabla no encontrada') {
          setError('Las tablas de mensajes no están creadas. Contacte al administrador.');
        } else if (errorData.error) {
          setError(errorData.error);
        } else {
          setError(`Error ${error.response.status}: ${error.response.statusText}`);
        }
      } else if (error.request) {
        setError('No se pudo conectar con el servidor. Verifique su conexión.');
      } else {
        setError('Error al cargar los mensajes: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerMensaje = async (idMensaje) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get(`/alumno/mensajes/${idMensaje}`);
      if (response.data.success) {
        setMensajeSeleccionado(response.data.mensaje);
        // Actualizar la lista de mensajes para reflejar el estado de leído
        setMensajes(
          mensajes.map((mensaje) =>
            mensaje.id_mensaje === idMensaje ? { ...mensaje, leido: true } : mensaje
          )
        );
        // Actualizar estadísticas
        cargarDatos();
      }
    } catch (error) {
      console.error('Error obteniendo mensaje:', error);
      setError('Error al cargar el mensaje');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarcarTodosComoLeidos = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.put('/alumno/mensajes/marcar-todos-leidos');
      if (response.data.success) {
        openModal({
          title: 'Éxito',
          description: response.data.message,
          confirmBtn: 'Aceptar',
          onClick: () => {
            closeModal();
            cargarDatos();
          }
        });
      }
    } catch (error) {
      console.error('Error marcando mensajes:', error);
      setError('Error al marcar mensajes como leídos');
    } finally {
      setIsLoading(false);
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'urgente':
        return '#dc3545';
      case 'alta':
        return '#fd7e14';
      case 'media':
        return '#0d6efd';
      case 'baja':
        return '#198754';
      default:
        return '#6c757d';
    }
  };

  const getPrioridadIcon = (prioridad) => {
    switch (prioridad) {
      case 'urgente':
        return <FaExclamationTriangle />;
      case 'alta':
        return <FaExclamationTriangle />;
      case 'media':
        return <FaInfoCircle />;
      case 'baja':
        return <FaCheckCircle />;
      default:
        return <FaInfoCircle />;
    }
  };

  const getMensajeIcon = (leido) => {
    return leido ? <FaEnvelopeOpen /> : <FaEnvelope />;
  };

  return (
    <>
      {isLoading && <Spinner />}
      <Modal />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <FaEnvelopeOpenText className={styles.titleIcon} />
            Comunicaciones Recibidas
          </h1>
          {estadisticas.mensajes_no_leidos > 0 && (
            <Button
              text={`Marcar todos como leídos (${estadisticas.mensajes_no_leidos})`}
              onClick={handleMarcarTodosComoLeidos}
              classBtn={styles.markAllButton}
            />
          )}
        </div>

        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={() => setError('')} className={styles.errorClose}>
              ×
            </button>
          </div>
        )}

        {/* Estadísticas */}
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{estadisticas.total_mensajes}</div>
            <div className={styles.statLabel}>Total</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{estadisticas.mensajes_no_leidos}</div>
            <div className={styles.statLabel}>No leídos</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{estadisticas.mensajes_leidos}</div>
            <div className={styles.statLabel}>Leídos</div>
          </div>
        </div>

        {/* Prioridades */}
        <div className={styles.prioridadesContainer}>
          <div className={styles.prioridadItem} style={{ color: getPrioridadColor('urgente') }}>
            {getPrioridadIcon('urgente')} Urgente ({estadisticas.por_prioridad.urgente})
          </div>
          <div className={styles.prioridadItem} style={{ color: getPrioridadColor('alta') }}>
            {getPrioridadIcon('alta')} Alta ({estadisticas.por_prioridad.alta})
          </div>
          <div className={styles.prioridadItem} style={{ color: getPrioridadColor('media') }}>
            {getPrioridadIcon('media')} Media ({estadisticas.por_prioridad.media})
          </div>
          <div className={styles.prioridadItem} style={{ color: getPrioridadColor('baja') }}>
            {getPrioridadIcon('baja')} Baja ({estadisticas.por_prioridad.baja})
          </div>
        </div>

        {/* Vista de mensaje seleccionado */}
        {mensajeSeleccionado ? (
          <div className={styles.mensajeDetalle}>
            <div className={styles.mensajeHeader}>
              <button onClick={() => setMensajeSeleccionado(null)} className={styles.backButton}>
                <FaArrowLeft /> Volver
              </button>
              <div
                className={styles.prioridad}
                style={{ color: getPrioridadColor(mensajeSeleccionado.prioridad) }}
              >
                {getPrioridadIcon(mensajeSeleccionado.prioridad)}
                {mensajeSeleccionado.prioridad.toUpperCase()}
              </div>
            </div>

            <div className={styles.mensajeContent}>
              <h2 className={styles.mensajeTitulo}>{mensajeSeleccionado.titulo}</h2>
              <div className={styles.mensajeMeta}>
                <span>De: {mensajeSeleccionado.admin_creador}</span>
                <span>Enviado: {mensajeSeleccionado.fecha_envio}</span>
                {mensajeSeleccionado.leido && (
                  <span className={styles.leidoStatus}>
                    <FaCheckDouble /> Leído {mensajeSeleccionado.tiempo_desde_lectura}
                  </span>
                )}
              </div>
              <div className={styles.mensajeTexto}>{mensajeSeleccionado.contenido}</div>
            </div>
          </div>
        ) : (
          /* Lista de mensajes */
          <div className={styles.mensajesContainer}>
            {mensajes.length === 0 ? (
              <div className={styles.emptyState}>
                <FaEnvelope className={styles.emptyIcon} />
                <p>No tienes mensajes recibidos</p>
                <p className={styles.emptySubtext}>
                  Los mensajes de la administración aparecerán aquí
                </p>
              </div>
            ) : (
              <div className={styles.mensajesList}>
                {mensajes.map((mensaje) => (
                  <div
                    key={mensaje.id_mensaje}
                    className={`${styles.mensajeItem} ${!mensaje.leido ? styles.noLeido : ''}`}
                    onClick={() => handleVerMensaje(mensaje.id_mensaje)}
                  >
                    <div className={styles.mensajeIcon}>{getMensajeIcon(mensaje.leido)}</div>
                    <div className={styles.mensajeInfo}>
                      <div className={styles.mensajeHeader}>
                        <h3 className={styles.mensajeTitulo}>{mensaje.titulo}</h3>
                        <div
                          className={styles.prioridad}
                          style={{ color: getPrioridadColor(mensaje.prioridad) }}
                        >
                          {getPrioridadIcon(mensaje.prioridad)}
                          {mensaje.prioridad.toUpperCase()}
                        </div>
                      </div>
                      <div className={styles.mensajePreview}>
                        {mensaje.contenido.length > 100
                          ? mensaje.contenido.substring(0, 100) + '...'
                          : mensaje.contenido}
                      </div>
                      <div className={styles.mensajeFooter}>
                        <span className={styles.adminCreador}>De: {mensaje.admin_creador}</span>
                        <span className={styles.fechaEnvio}>{mensaje.fecha_envio}</span>
                        {mensaje.leido && (
                          <span className={styles.leidoStatus}>
                            <FaCheckDouble /> Leído
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.mensajeAction}>
                      <FaEye />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Comunicaciones;
