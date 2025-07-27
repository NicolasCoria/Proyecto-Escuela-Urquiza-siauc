import React, { useState } from 'react';
import styles from './modalRespuesta.module.css';
import axios from '../../../Components/Shared/Axios';

const ModalRespuesta = ({ solicitud, onClose, onSuccess }) => {
  const [respuesta, setRespuesta] = useState(solicitud.respuesta || '');
  const [estado, setEstado] = useState(solicitud.estado);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!respuesta.trim()) {
      setError('La respuesta no puede estar vacía.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await axios.put(`/admin/solicitudes/${solicitud.id}`, {
        respuesta,
        estado
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError('Error al enviar la respuesta. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className={styles.modalContent}>
      <h2>Detalles de la Solicitud #{solicitud.id}</h2>

      <div className={styles.infoGrid}>
        <div className={styles.infoBlock}>
          <h4>Información del Alumno</h4>
          <p>
            <strong>Nombre:</strong> {solicitud.alumno?.nombre || 'N/A'}
            {solicitud.alumno?.apellido || ''}
          </p>
          <p>
            <strong>DNI:</strong> {solicitud.alumno?.DNI || 'N/A'}
          </p>
          <p>
            <strong>Email:</strong> {solicitud.alumno?.email || 'N/A'}
          </p>
        </div>

        <div className={styles.infoBlock}>
          <h4>Información de la Solicitud</h4>
          <p>
            <strong>Categoría:</strong> {solicitud.categoria}
          </p>
          <p>
            <strong>Fecha de Creación:</strong> {formatDate(solicitud.fecha_creacion)}
          </p>
          <p>
            <strong>Estado Actual:</strong>{' '}
            <span className={`${styles.status} ${styles[solicitud.estado]}`}>
              {solicitud.estado}
            </span>
          </p>
        </div>
      </div>

      <div className={styles.messageSection}>
        <h4>Mensaje del Alumno</h4>
        <p className={styles.messageContent}>{solicitud.mensaje}</p>
      </div>

      {solicitud.respuesta && (
        <div className={styles.messageSection}>
          <h4>Respuesta Anterior</h4>
          <p className={styles.messageContent}>{solicitud.respuesta}</p>
          <p className={styles.date}>Respondido el: {formatDate(solicitud.fecha_respuesta)}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="respuesta">
            {solicitud.respuesta ? 'Editar Respuesta' : 'Escribir Respuesta'}
          </label>
          <textarea
            id="respuesta"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            required
            rows="5"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="estado">Cambiar Estado</label>
          <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En Proceso</option>
            <option value="respondida">Respondida</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.buttons}>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModalRespuesta;
