import React, { useState, useEffect } from 'react';
import axios from '../../../Components/Shared/Axios';
import CustomModal from './CustomModal';
import ModalRespuesta from './ModalRespuesta';
import styles from './solicitudes.module.css';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const SolicitudesAdmin = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const pendientes = solicitudes.filter((s) => s.estado === 'pendiente');
  const [showPendientes, setShowPendientes] = useState(true);

  const handleOpenModal = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSolicitud(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    fetchSolicitudes(); // Refrescar la lista de solicitudes
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortedSolicitudes = () => {
    const sorted = [...solicitudes];
    sorted.sort((a, b) => {
      let aValue, bValue;
      switch (sortConfig.key) {
        case 'alumno':
          aValue = a.alumno ? `${a.alumno.nombre} ${a.alumno.apellido}`.toLowerCase() : '';
          bValue = b.alumno ? `${b.alumno.nombre} ${b.alumno.apellido}`.toLowerCase() : '';
          break;
        case 'estado':
          aValue = a.estado;
          bValue = b.estado;
          break;
        case 'fecha_creacion':
          aValue = a.fecha_creacion;
          bValue = b.fecha_creacion;
          break;
        default:
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/solicitudes');
      setSolicitudes(response.data);
    } catch (err) {
      setError('Error al cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  if (loading) {
    return <p>Cargando solicitudes...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <h1>Gestión de Solicitudes</h1>
      {pendientes.length > 0 && showPendientes && (
        <div
          style={{
            background: '#dbeafe',
            color: '#1e40af',
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
            border: '1px solid #60a5fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: 700
          }}
        >
          <span>
            <b>¡Atención!</b> Tienes {pendientes.length} solicitud
            {pendientes.length > 1 ? 'es' : ''} pendiente
            {pendientes.length > 1 ? 's' : ''} de revisión.
          </span>
          <button
            style={{
              marginLeft: 16,
              background: '#60a5fa',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '6px 12px',
              cursor: 'pointer'
            }}
            onClick={() => setShowPendientes(false)}
          >
            Cerrar
          </button>
        </div>
      )}
      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
              ID{' '}
              {sortConfig.key === 'id' ? (
                sortConfig.direction === 'asc' ? (
                  <FaSortUp />
                ) : (
                  <FaSortDown />
                )
              ) : (
                <FaSort />
              )}
            </th>
            <th onClick={() => handleSort('alumno')} style={{ cursor: 'pointer' }}>
              Alumno{' '}
              {sortConfig.key === 'alumno' ? (
                sortConfig.direction === 'asc' ? (
                  <FaSortUp />
                ) : (
                  <FaSortDown />
                )
              ) : (
                <FaSort />
              )}
            </th>
            <th>Asunto</th>
            <th onClick={() => handleSort('estado')} style={{ cursor: 'pointer' }}>
              Estado{' '}
              {sortConfig.key === 'estado' ? (
                sortConfig.direction === 'asc' ? (
                  <FaSortUp />
                ) : (
                  <FaSortDown />
                )
              ) : (
                <FaSort />
              )}
            </th>
            <th onClick={() => handleSort('fecha_creacion')} style={{ cursor: 'pointer' }}>
              Fecha de Creación{' '}
              {sortConfig.key === 'fecha_creacion' ? (
                sortConfig.direction === 'asc' ? (
                  <FaSortUp />
                ) : (
                  <FaSortDown />
                )
              ) : (
                <FaSort />
              )}
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {getSortedSolicitudes().map((solicitud) => (
            <tr key={solicitud.id}>
              <td>{solicitud.id}</td>
              <td>
                {solicitud.alumno
                  ? `${solicitud.alumno.nombre} ${solicitud.alumno.apellido}`
                  : 'N/A'}
              </td>
              <td>{solicitud.asunto}</td>
              <td>{solicitud.estado}</td>
              <td>{new Date(solicitud.fecha_creacion).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleOpenModal(solicitud)}>Ver Detalles</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && selectedSolicitud && (
        <CustomModal onClose={handleCloseModal}>
          <ModalRespuesta
            solicitud={selectedSolicitud}
            onClose={handleCloseModal}
            onSuccess={handleSuccess}
          />
        </CustomModal>
      )}
    </div>
  );
};

export default SolicitudesAdmin;
