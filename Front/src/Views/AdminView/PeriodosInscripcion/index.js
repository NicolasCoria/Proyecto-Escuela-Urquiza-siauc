import React, { useState, useEffect } from 'react';
import axiosClient from '../../../Components/Shared/Axios';
import Spinner from '../../../Components/Shared/Spinner';
import styles from './periodosInscripcion.module.css';
import { FaPlus, FaEdit, FaCalendarAlt, FaGraduationCap, FaUniversity } from 'react-icons/fa';

const PeriodosInscripcion = () => {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPeriodo, setEditingPeriodo] = useState(null);
  const [formData, setFormData] = useState({
    nombre_periodo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    activo: false,
    id_carrera: '',
    id_grado: ''
  });
  const [carreras, setCarreras] = useState([]);
  const [grados, setGrados] = useState([]);

  useEffect(() => {
    cargarPeriodos();
    cargarDatosCreacion();
  }, []);

  const cargarPeriodos = async () => {
    try {
      const response = await axiosClient.get('/admin/periodos-inscripcion');
      setPeriodos(response.data.periodos);
    } catch (err) {
      setError('Error al cargar los períodos de inscripción');
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosCreacion = async () => {
    try {
      const response = await axiosClient.get('/admin/periodos-inscripcion/datos-creacion');
      setCarreras(response.data.carreras);
      setGrados(response.data.grados);
    } catch (err) {
      console.error('Error cargando datos de creación:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingPeriodo) {
        await axiosClient.put(`/admin/periodos-inscripcion/${editingPeriodo.id}`, formData);
      } else {
        await axiosClient.post('/admin/periodos-inscripcion', formData);
      }

      setShowForm(false);
      setEditingPeriodo(null);
      resetForm();
      cargarPeriodos();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el período');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (periodo) => {
    setEditingPeriodo(periodo);
    setFormData({
      nombre_periodo: periodo.nombre_periodo,
      descripcion: periodo.descripcion || '',
      fecha_inicio: periodo.fecha_inicio.slice(0, 16), // Para datetime-local
      fecha_fin: periodo.fecha_fin.slice(0, 16),
      activo: periodo.activo,
      id_carrera: periodo.id_carrera || '',
      id_grado: periodo.id_grado || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este período?')) {
      return;
    }

    try {
      await axiosClient.delete(`/admin/periodos-inscripcion/${id}`);
      cargarPeriodos();
    } catch (err) {
      setError('Error al eliminar el período');
    }
  };

  const handleToggleActivo = async (id) => {
    try {
      await axiosClient.put(`/admin/periodos-inscripcion/${id}/toggle`);
      cargarPeriodos();
    } catch (err) {
      setError('Error al cambiar el estado del período');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_periodo: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      activo: false,
      id_carrera: '',
      id_grado: ''
    });
  };

  const getEstadoPeriodo = (periodo) => {
    const ahora = new Date();
    const inicio = new Date(periodo.fecha_inicio);
    const fin = new Date(periodo.fecha_fin);

    if (!periodo.activo) return 'Inactivo';
    if (ahora < inicio) return 'Pendiente';
    if (ahora > fin) return 'Finalizado';
    return 'Activo';
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Activo':
        return styles.estadoActivo;
      case 'Pendiente':
        return styles.estadoPendiente;
      case 'Finalizado':
        return styles.estadoFinalizado;
      default:
        return styles.estadoInactivo;
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-AR');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>📅 Gestión de Períodos de Inscripción</h1>
          <div className={styles.headerStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{periodos.length}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{periodos.filter((p) => p.activo).length}</span>
              <span className={styles.statLabel}>Activos</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {periodos.filter((p) => getEstadoPeriodo(p) === 'Activo').length}
              </span>
              <span className={styles.statLabel}>En Curso</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingPeriodo(null);
            resetForm();
          }}
          className={styles.addButton}
        >
          <FaPlus />
          Nuevo Período
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Formulario */}
      {showForm && (
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h3>{editingPeriodo ? '✏️ Editar' : '➕ Crear'} Período de Inscripción</h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingPeriodo(null);
                resetForm();
              }}
              className={styles.closeFormBtn}
              title="Cerrar formulario"
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FaCalendarAlt className={styles.formIcon} />
                  Nombre del Período *
                </label>
                <input
                  type="text"
                  value={formData.nombre_periodo}
                  onChange={(e) => setFormData({ ...formData, nombre_periodo: e.target.value })}
                  required
                  className={styles.formInput}
                  placeholder="Ej: Inscripción 2024 - Primer Cuatrimestre"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FaEdit className={styles.formIcon} />
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows="3"
                  className={styles.formTextarea}
                  placeholder="Descripción opcional del período..."
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FaCalendarAlt className={styles.formIcon} />
                  Fecha y Hora de Inicio *
                </label>
                <input
                  type="datetime-local"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  required
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FaCalendarAlt className={styles.formIcon} />
                  Fecha y Hora de Fin *
                </label>
                <input
                  type="datetime-local"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  required
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FaUniversity className={styles.formIcon} />
                  Carrera (opcional)
                </label>
                <select
                  value={formData.id_carrera}
                  onChange={(e) => setFormData({ ...formData, id_carrera: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="">Todas las carreras</option>
                  {carreras.map((carrera) => (
                    <option key={carrera.id_carrera} value={carrera.id_carrera}>
                      {carrera.carrera}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <FaGraduationCap className={styles.formIcon} />
                  Grado (opcional)
                </label>
                <select
                  value={formData.id_grado}
                  onChange={(e) => setFormData({ ...formData, id_grado: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="">Todos los grados</option>
                  {grados.map((grado) => (
                    <option key={grado.id_grado} value={grado.id_grado}>
                      {grado.grado}° {grado.division || ''} {grado.detalle || ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Período Activo</span>
              </label>
            </div>

            <div className={styles.formActions}>
              <button type="submit" disabled={loading} className={styles.saveButton}>
                {loading ? (
                  <>
                    <Spinner />
                    Guardando...
                  </>
                ) : editingPeriodo ? (
                  'Actualizar'
                ) : (
                  'Crear'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPeriodo(null);
                  resetForm();
                }}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Períodos */}
      <div className={styles.periodosList}>
        {periodos.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay períodos de inscripción configurados</p>
          </div>
        ) : (
          periodos.map((periodo) => (
            <div key={periodo.id} className={styles.periodoCard}>
              <div className={styles.periodoHeader}>
                <div className={styles.periodoTitle}>
                  <FaCalendarAlt className={styles.periodoIcon} />
                  <h3>{periodo.nombre_periodo}</h3>
                </div>
                <span className={`${styles.estado} ${getEstadoClass(getEstadoPeriodo(periodo))}`}>
                  {getEstadoPeriodo(periodo)}
                </span>
              </div>

              {periodo.descripcion && (
                <p className={styles.descripcion}>
                  <FaEdit className={styles.descripcionIcon} />
                  {periodo.descripcion}
                </p>
              )}

              <div className={styles.periodoDetails}>
                <div className={styles.detailItem}>
                  <FaCalendarAlt className={styles.detailIcon} />
                  <span className={styles.detailLabel}>Inicio:</span>
                  <span className={styles.detailValue}>{formatDateTime(periodo.fecha_inicio)}</span>
                </div>
                <div className={styles.detailItem}>
                  <FaCalendarAlt className={styles.detailIcon} />
                  <span className={styles.detailLabel}>Fin:</span>
                  <span className={styles.detailValue}>{formatDateTime(periodo.fecha_fin)}</span>
                </div>
                <div className={styles.detailItem}>
                  <FaUniversity className={styles.detailIcon} />
                  <span className={styles.detailLabel}>Aplicable a:</span>
                  <span className={styles.detailValue}>
                    {periodo.carrera
                      ? `Carrera: ${periodo.carrera.carrera}`
                      : periodo.grado
                        ? `Grado: ${periodo.grado.grado}°`
                        : 'Todas las carreras y grados'}
                  </span>
                </div>
              </div>

              <div className={styles.periodoActions}>
                <button
                  onClick={() => handleToggleActivo(periodo.id)}
                  className={`${styles.toggleButton} ${periodo.activo ? styles.deactivate : styles.activate}`}
                  title={periodo.activo ? 'Desactivar período' : 'Activar período'}
                >
                  {periodo.activo ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => handleEdit(periodo)}
                  className={styles.editButton}
                  title="Editar período"
                >
                  <FaEdit />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(periodo.id)}
                  className={styles.deleteButton}
                  title="Eliminar período"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PeriodosInscripcion;
