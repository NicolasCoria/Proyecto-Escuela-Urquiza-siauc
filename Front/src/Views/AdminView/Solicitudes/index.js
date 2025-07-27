import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../Components/Shared/Axios';
import CustomModal from './CustomModal';
import ModalRespuesta from './ModalRespuesta';
import WelcomeTooltip from '../../../Components/Shared/WelcomeTooltip';
import styles from './solicitudes.module.css';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
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
    return <p>Cargando solicitudes...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <h1>Gestión de Solicitudes</h1>
      {/* Filtros */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
          alignItems: 'flex-end',
          maxWidth: 900
        }}
      >
        <div>
          <label>
            ID Solicitud
            <br />
            <input
              type="text"
              name="id"
              value={filters.id}
              onChange={handleFilterChange}
              style={{ width: 80 }}
            />
          </label>
        </div>
        <div>
          <label>
            Nombre/Apellido Alumno
            <br />
            <input
              type="text"
              name="nombre"
              value={filters.nombre}
              onChange={handleFilterChange}
              style={{ width: 160 }}
              placeholder="Nombre o Apellido"
            />
          </label>
        </div>
        <div>
          <label>
            Estado
            <br />
            <select name="estado" value={filters.estado} onChange={handleFilterChange}>
              {estados.map((e) => (
                <option key={e} value={e}>
                  {e ? e.charAt(0).toUpperCase() + e.slice(1) : 'Todos'}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Categoría
            <br />
            <select name="categoria" value={filters.categoria} onChange={handleFilterChange}>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c ? c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ') : 'Todas'}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Fecha desde
            <br />
            <input
              type="date"
              name="fechaDesde"
              value={filters.fechaDesde}
              onChange={handleFilterChange}
            />
          </label>
        </div>
        <div>
          <label>
            Fecha hasta
            <br />
            <input
              type="date"
              name="fechaHasta"
              value={filters.fechaHasta}
              onChange={handleFilterChange}
            />
          </label>
        </div>
        <button onClick={handleClearFilters} style={{ height: 36, marginTop: 18 }}>
          Limpiar filtros
        </button>
      </div>
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
                  <button onClick={() => handleOpenModal(solicitud)}>Ver Detalles</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Controles de paginación */}
      {totalPaginas > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 8 }}>
          <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
            « Primera
          </button>
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            ‹ Anterior
          </button>
          <span style={{ alignSelf: 'center' }}>
            Página {currentPage} de {totalPaginas}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPaginas}
          >
            Siguiente ›
          </button>
          <button
            onClick={() => handlePageChange(totalPaginas)}
            disabled={currentPage === totalPaginas}
          >
            Última »
          </button>
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
