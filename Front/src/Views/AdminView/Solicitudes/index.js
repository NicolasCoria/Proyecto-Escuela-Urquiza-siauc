import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../Components/Shared/Axios';
import CustomModal from './CustomModal';
import ModalRespuesta from './ModalRespuesta';
import WelcomeTooltip from '../../../Components/Shared/WelcomeTooltip';
import Spinner from '../../../Components/Shared/Spinner';
import styles from './solicitudes.module.css';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaTimes } from 'react-icons/fa';
import { useStateContext } from '../../../Components/Contexts';

const estados = ['', 'pendiente', 'en_proceso', 'respondida', 'rechazada'];
const categorias = ['', 'general', 'certificado', 'homologacion_interna', 'homologacion_externa'];

const SolicitudesAdmin = () => {
  const navigate = useNavigate();
  const { user } = useStateContext();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const pendientes = solicitudes.filter((s) => s.estado === 'pendiente');
  const [showPendientes, setShowPendientes] = useState(true);
  const [filters, setFilters] = useState({
    id: '',
    nombre: '',
    estado: '',
    categoria: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const solicitudesPorPagina = 20;

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

  // Filtro combinable
  const getFilteredSolicitudes = () => {
    let filtered = getSortedSolicitudes();
    // Filtro por ID exacto
    if (filters.id) {
      filtered = filtered.filter((s) => String(s.id) === filters.id.trim());
    }
    // Filtro por nombre/apellido parcial (case-insensitive)
    if (filters.nombre) {
      const search = filters.nombre.trim().toLowerCase();
      filtered = filtered.filter((s) => {
        if (!s.alumno) return false;
        const nombreCompleto = `${s.alumno.nombre} ${s.alumno.apellido}`.toLowerCase();
        return (
          nombreCompleto.includes(search) ||
          s.alumno.nombre.toLowerCase().includes(search) ||
          s.alumno.apellido.toLowerCase().includes(search)
        );
      });
    }
    // Filtro por estado
    if (filters.estado) {
      filtered = filtered.filter((s) => s.estado === filters.estado);
    }
    // Filtro por categoría
    if (filters.categoria) {
      filtered = filtered.filter((s) => s.categoria === filters.categoria);
    }
    // Filtro por fecha exacta o rango
    if (filters.fechaDesde) {
      filtered = filtered.filter((s) => {
        const fecha = new Date(s.fecha_creacion).setHours(0, 0, 0, 0);
        const desde = new Date(filters.fechaDesde).setHours(0, 0, 0, 0);
        return fecha >= desde;
      });
    }
    if (filters.fechaHasta) {
      filtered = filtered.filter((s) => {
        const fecha = new Date(s.fecha_creacion).setHours(0, 0, 0, 0);
        const hasta = new Date(filters.fechaHasta).setHours(0, 0, 0, 0);
        return fecha <= hasta;
      });
    }
    return filtered;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ id: '', nombre: '', estado: '', categoria: '', fechaDesde: '', fechaHasta: '' });
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

  // Paginación sobre el resultado filtrado
  const filteredSolicitudes = getFilteredSolicitudes();
  const totalPaginas = Math.ceil(filteredSolicitudes.length / solicitudesPorPagina);
  const solicitudesPagina = filteredSolicitudes.slice(
    (currentPage - 1) * solicitudesPorPagina,
    currentPage * solicitudesPorPagina
  );

  const handlePageChange = (nuevaPagina) => {
    setCurrentPage(nuevaPagina);
  };

  // Resetear a la página 1 si cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  if (loading) {
    return (
      <div className={styles.container}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>📋 Gestión de Solicitudes</h1>
        <div className={styles.headerStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{filteredSolicitudes.length}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{pendientes.length}</span>
            <span className={styles.statLabel}>Pendientes</span>
          </div>
        </div>
      </div>

      {/* Filtros mejorados */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersHeader}>
          <div className={styles.filtersTitle}>
            <FaSearch className={styles.searchIcon} />
            <span>Filtros de Búsqueda</span>
          </div>
          <button
            onClick={handleClearFilters}
            className={styles.clearFiltersBtn}
            title="Limpiar todos los filtros"
          >
            <FaTimes />
            Limpiar
          </button>
        </div>

        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>ID Solicitud</label>
            <input
              type="text"
              name="id"
              value={filters.id}
              onChange={handleFilterChange}
              className={styles.filterInput}
              placeholder="Ej: 123"
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Nombre/Apellido</label>
            <input
              type="text"
              name="nombre"
              value={filters.nombre}
              onChange={handleFilterChange}
              className={styles.filterInput}
              placeholder="Buscar por nombre..."
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Estado</label>
            <select
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              {estados.map((e) => (
                <option key={e} value={e}>
                  {e
                    ? e.charAt(0).toUpperCase() + e.slice(1).replace('_', ' ')
                    : 'Todos los estados'}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Categoría</label>
            <select
              name="categoria"
              value={filters.categoria}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c
                    ? c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')
                    : 'Todas las categorías'}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Fecha desde</label>
            <input
              type="date"
              name="fechaDesde"
              value={filters.fechaDesde}
              onChange={handleFilterChange}
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Fecha hasta</label>
            <input
              type="date"
              name="fechaHasta"
              value={filters.fechaHasta}
              onChange={handleFilterChange}
              className={styles.filterInput}
            />
          </div>
        </div>
      </div>
      {pendientes.length > 0 && showPendientes && (
        <div className={styles.alertCard}>
          <div className={styles.alertContent}>
            <div className={styles.alertIcon}>⚠️</div>
            <div className={styles.alertText}>
              <strong>¡Atención!</strong> Tienes {pendientes.length} solicitud
              {pendientes.length > 1 ? 'es' : ''} pendiente
              {pendientes.length > 1 ? 's' : ''} de revisión.
            </div>
          </div>
          <button
            className={styles.alertCloseBtn}
            onClick={() => setShowPendientes(false)}
            title="Cerrar alerta"
          >
            <FaTimes />
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
          {solicitudesPagina.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>
                No hay solicitudes que cumplan con los criterios de búsqueda.
              </td>
            </tr>
          ) : (
            solicitudesPagina.map((solicitud) => (
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
                  <button onClick={() => handleOpenModal(solicitud)} className={styles.actionBtn}>
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Controles de paginación mejorados */}
      {totalPaginas > 1 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Mostrando {(currentPage - 1) * solicitudesPorPagina + 1} -{' '}
            {Math.min(currentPage * solicitudesPorPagina, filteredSolicitudes.length)} de{' '}
            {filteredSolicitudes.length} solicitudes
          </div>
          <div className={styles.paginationControls}>
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={styles.paginationBtn}
            >
              « Primera
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={styles.paginationBtn}
            >
              ‹ Anterior
            </button>
            <span className={styles.paginationCurrent}>
              Página {currentPage} de {totalPaginas}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPaginas}
              className={styles.paginationBtn}
            >
              Siguiente ›
            </button>
            <button
              onClick={() => handlePageChange(totalPaginas)}
              disabled={currentPage === totalPaginas}
              className={styles.paginationBtn}
            >
              Última »
            </button>
          </div>
        </div>
      )}
      {isModalOpen && selectedSolicitud && (
        <CustomModal onClose={handleCloseModal}>
          <ModalRespuesta
            solicitud={selectedSolicitud}
            onClose={handleCloseModal}
            onSuccess={handleSuccess}
          />
        </CustomModal>
      )}

      <WelcomeTooltip
        id="admin-solicitudes"
        userId={user?.id}
        title="Gestión de Solicitudes"
        message="Aquí puedes ver todas las solicitudes de los alumnos, filtrarlas por estado o categoría, y responder a cada una. Haz clic en 'Ver Detalles' para ver el contenido completo."
        onViewFaqs={() => navigate('/admin/faqs')}
      />
    </div>
  );
};

export default SolicitudesAdmin;
