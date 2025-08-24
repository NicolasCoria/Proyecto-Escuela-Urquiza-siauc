import React, { useState, useEffect } from 'react';
import styles from './comunicaciones.module.css';
import Button from '../../../Components/Shared/Button';
import Modal from '../../../Components/Shared/Modal';
import Spinner from '../../../Components/Shared/Spinner';
import axiosClient from '../../../Components/Shared/Axios';
import { useModalContext } from '../../../Components/Contexts';
import {
  FaEnvelope,
  FaEdit,
  FaTrash,
  FaEye,
  FaUsers,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle
} from 'react-icons/fa';

const Comunicaciones = () => {
  const { openModal, closeModal } = useModalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [selectedGrupos, setSelectedGrupos] = useState([]);
  const [selectedAlumnos, setSelectedAlumnos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    prioridad: 'media',
    tipoDestinatario: 'grupos' // 'grupos' o 'personalizada'
  });
  const [filtros, setFiltros] = useState({
    id_carreras: [],
    id_grados: [],
    id_ucs: []
  });
  const [datosCreacion, setDatosCreacion] = useState({
    carreras: [],
    grados: [],
    materias: []
  });

  // Debug: Log cuando cambian los datos de creación
  useEffect(() => {
    console.log('datosCreacion actualizado:', datosCreacion);
  }, [datosCreacion]);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      // Cargar mensajes existentes
      const responseMensajes = await axiosClient.get('/admin/mensajes');
      if (responseMensajes.data.success) {
        setMensajes(responseMensajes.data.mensajes);
      }

      // Cargar grupos de destinatarios
      const responseGrupos = await axiosClient.get('/grupos-destinatarios');
      if (responseGrupos.data.success) {
        setGrupos(responseGrupos.data.grupos);
      }

      // Cargar datos para filtros
      const responseDatos = await axiosClient.get('/admin/mensajes/datos/creacion');
      if (responseDatos.data.success) {
        console.log('Datos de creación cargados:', responseDatos.data.datos);
        setDatosCreacion(responseDatos.data.datos);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNuevoMensaje = () => {
    setFormData({
      titulo: '',
      contenido: '',
      prioridad: 'media',
      tipoDestinatario: 'grupos'
    });
    setSelectedGrupos([]);
    setSelectedAlumnos([]);
    setShowForm(true);
  };

  const handleEnviarMensaje = async () => {
    if (!formData.titulo.trim() || !formData.contenido.trim()) {
      setError('El título y contenido son obligatorios');
      return;
    }

    if (formData.tipoDestinatario === 'grupos' && selectedGrupos.length === 0) {
      setError('Debe seleccionar al menos un grupo');
      return;
    }

    if (formData.tipoDestinatario === 'personalizada' && selectedAlumnos.length === 0) {
      setError('Debe seleccionar al menos un alumno');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (formData.tipoDestinatario === 'grupos') {
        response = await axiosClient.post('/admin/mensajes/enviar-grupos', {
          titulo: formData.titulo,
          contenido: formData.contenido,
          prioridad: formData.prioridad,
          grupos: selectedGrupos
        });
      } else {
        response = await axiosClient.post('/admin/mensajes', {
          titulo: formData.titulo,
          contenido: formData.contenido,
          prioridad: formData.prioridad,
          destinatarios: selectedAlumnos
        });
      }

      if (response.data.success) {
        openModal({
          title: 'Éxito',
          description: response.data.message,
          confirmBtn: 'Aceptar',
          onClick: () => {
            closeModal();
            setShowForm(false);
            cargarDatos();
          }
        });
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setError(error.response?.data?.error || 'Error al enviar el mensaje');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltrarAlumnos = async () => {
    const filtrosAplicados = Object.values(filtros).some((arr) => arr.length > 0);
    if (!filtrosAplicados) {
      setError('Debe aplicar al menos un filtro');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosClient.post('/admin/mensajes/filtrar-alumnos', filtros);
      if (response.data.success) {
        setAlumnos(response.data.alumnos);
        setSelectedAlumnos([]);
      }
    } catch (error) {
      console.error('Error filtrando alumnos:', error);
      setError('Error al filtrar alumnos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleObtenerAlumnosGrupos = async () => {
    if (selectedGrupos.length === 0) {
      setError('Debe seleccionar al menos un grupo');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosClient.post('/admin/mensajes/obtener-alumnos-grupos', {
        grupos: selectedGrupos
      });
      if (response.data.success) {
        setAlumnos(response.data.alumnos);
        setSelectedAlumnos(response.data.alumnos.map((a) => a.id_alumno));
      }
    } catch (error) {
      console.error('Error obteniendo alumnos de grupos:', error);
      setError('Error al obtener alumnos de grupos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarMensaje = async (idMensaje) => {
    openModal({
      title: 'Confirmar eliminación',
      description:
        '¿Está seguro que desea eliminar este mensaje? Esta acción no se puede deshacer.',
      confirmBtn: 'Eliminar',
      denyBtn: 'Cancelar',
      confirmModal: true,
      onClick: async () => {
        setIsLoading(true);
        try {
          const response = await axiosClient.delete(`/admin/mensajes/${idMensaje}`);
          if (response.data.success) {
            openModal({
              title: 'Éxito',
              description: 'Mensaje eliminado correctamente',
              confirmBtn: 'Aceptar',
              onClick: () => {
                closeModal();
                cargarDatos();
              }
            });
          }
        } catch (error) {
          console.error('Error eliminando mensaje:', error);
          setError('Error al eliminar el mensaje');
        } finally {
          setIsLoading(false);
        }
      }
    });
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

  return (
    <>
      {isLoading && <Spinner />}
      <Modal />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <FaEnvelope className={styles.titleIcon} />
            Comunicaciones Internas
          </h1>
          <Button text="Nuevo Mensaje" onClick={handleNuevoMensaje} classBtn={styles.newButton} />
        </div>

        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={() => setError('')} className={styles.errorClose}>
              ×
            </button>
          </div>
        )}

        {showForm && (
          <div className={styles.formContainer}>
            <h2>Enviar Nuevo Mensaje</h2>

            <div className={styles.formGroup}>
              <label>Título del mensaje *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ingrese el título del mensaje"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Contenido *</label>
              <textarea
                value={formData.contenido}
                onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                placeholder="Escriba el contenido del mensaje..."
                className={styles.textarea}
                rows={6}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Prioridad</label>
              <select
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                className={styles.select}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Tipo de destinatarios</label>
              <div className={styles.radioGroup}>
                <label>
                  <input
                    type="radio"
                    value="grupos"
                    checked={formData.tipoDestinatario === 'grupos'}
                    onChange={(e) => setFormData({ ...formData, tipoDestinatario: e.target.value })}
                  />
                  Grupos predefinidos
                </label>
                <label>
                  <input
                    type="radio"
                    value="personalizada"
                    checked={formData.tipoDestinatario === 'personalizada'}
                    onChange={(e) => setFormData({ ...formData, tipoDestinatario: e.target.value })}
                  />
                  Búsqueda personalizada
                </label>
              </div>
            </div>

            {formData.tipoDestinatario === 'grupos' && (
              <div className={styles.formGroup}>
                <label>Seleccionar grupos</label>
                <div className={styles.gruposContainer}>
                  {grupos.map((grupo) => (
                    <label key={grupo.id_grupo} className={styles.grupoItem}>
                      <input
                        type="checkbox"
                        checked={selectedGrupos.includes(grupo.id_grupo)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGrupos([...selectedGrupos, grupo.id_grupo]);
                          } else {
                            setSelectedGrupos(selectedGrupos.filter((id) => id !== grupo.id_grupo));
                          }
                        }}
                      />
                      {grupo.nombre} ({grupo.cantidad_alumnos} alumnos)
                    </label>
                  ))}
                </div>
                <Button
                  text="Obtener alumnos de grupos seleccionados"
                  onClick={handleObtenerAlumnosGrupos}
                  classBtn={styles.secondaryButton}
                />
              </div>
            )}

            {formData.tipoDestinatario === 'personalizada' && (
              <div className={styles.formGroup}>
                <label>Filtros de búsqueda</label>
                <div className={styles.filtrosContainer}>
                  <div className={styles.filtro}>
                    <label>Carreras</label>
                    <select
                      multiple
                      value={filtros.id_carreras}
                      onChange={(e) =>
                        setFiltros({
                          ...filtros,
                          id_carreras: Array.from(e.target.selectedOptions, (option) =>
                            parseInt(option.value)
                          )
                        })
                      }
                      className={styles.select}
                    >
                      {datosCreacion.carreras.map((carrera) => (
                        <option key={carrera.id_carrera} value={carrera.id_carrera}>
                          {carrera.carrera}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.filtro}>
                    <label>Grados</label>
                    <select
                      multiple
                      value={filtros.id_grados}
                      onChange={(e) =>
                        setFiltros({
                          ...filtros,
                          id_grados: Array.from(e.target.selectedOptions, (option) =>
                            parseInt(option.value)
                          )
                        })
                      }
                      className={styles.select}
                    >
                      {datosCreacion.grados.map((grado) => (
                        <option key={grado.id_grado} value={grado.id_grado}>
                          {grado.display_text}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.filtro}>
                    <label>Materias</label>
                    <select
                      multiple
                      value={filtros.id_ucs}
                      onChange={(e) =>
                        setFiltros({
                          ...filtros,
                          id_ucs: Array.from(e.target.selectedOptions, (option) =>
                            parseInt(option.value)
                          )
                        })
                      }
                      className={styles.select}
                    >
                      {datosCreacion.materias && datosCreacion.materias.length > 0 ? (
                        datosCreacion.materias.map((materia) => (
                          <option key={materia.id_uc} value={materia.id_uc}>
                            {materia.unidad_curricular}
                          </option>
                        ))
                      ) : (
                        <option value="">Cargando materias...</option>
                      )}
                    </select>
                  </div>
                </div>
                <Button
                  text="Filtrar alumnos"
                  onClick={handleFiltrarAlumnos}
                  classBtn={styles.secondaryButton}
                />
              </div>
            )}

            {alumnos.length > 0 && (
              <div className={styles.formGroup}>
                <label>
                  Alumnos seleccionados ({selectedAlumnos.length} de {alumnos.length})
                </label>
                <div className={styles.alumnosContainer}>
                  {alumnos.map((alumno) => (
                    <label key={alumno.id_alumno} className={styles.alumnoItem}>
                      <input
                        type="checkbox"
                        checked={selectedAlumnos.includes(alumno.id_alumno)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAlumnos([...selectedAlumnos, alumno.id_alumno]);
                          } else {
                            setSelectedAlumnos(
                              selectedAlumnos.filter((id) => id !== alumno.id_alumno)
                            );
                          }
                        }}
                      />
                      {alumno.apellido}, {alumno.nombre} - {alumno.email}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.formActions}>
              <Button
                text="Enviar Mensaje"
                onClick={handleEnviarMensaje}
                classBtn={styles.primaryButton}
              />
              <Button
                text="Cancelar"
                onClick={() => setShowForm(false)}
                classBtn={styles.cancelButton}
              />
            </div>
          </div>
        )}

        <div className={styles.mensajesContainer}>
          <h2>Mensajes Enviados</h2>
          {mensajes.length === 0 ? (
            <div className={styles.emptyState}>
              <FaEnvelope className={styles.emptyIcon} />
              <p>No hay mensajes enviados</p>
            </div>
          ) : (
            <div className={styles.mensajesGrid}>
              {mensajes.map((mensaje) => (
                <div key={mensaje.id_mensaje} className={styles.mensajeCard}>
                  <div className={styles.mensajeHeader}>
                    <div className={styles.mensajeInfo}>
                      <h3 className={styles.mensajeTitulo}>{mensaje.titulo}</h3>
                      <div
                        className={styles.prioridad}
                        style={{ color: getPrioridadColor(mensaje.prioridad) }}
                      >
                        {getPrioridadIcon(mensaje.prioridad)}
                        {mensaje.prioridad.toUpperCase()}
                      </div>
                    </div>
                    <div className={styles.mensajeActions}>
                      <button className={styles.actionButton}>
                        <FaEye />
                      </button>
                      <button className={styles.actionButton}>
                        <FaEdit />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleEliminarMensaje(mensaje.id_mensaje)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className={styles.mensajeContent}>
                    <p>{mensaje.contenido}</p>
                  </div>

                  <div className={styles.mensajeFooter}>
                    <div className={styles.mensajeStats}>
                      <span>
                        <FaUsers /> {mensaje.cantidad_destinatarios} destinatarios
                      </span>
                      <span>
                        <FaCheckCircle /> {mensaje.leido_por} leídos
                      </span>
                    </div>
                    <div className={styles.mensajeMeta}>
                      <span>Por: {mensaje.admin_creador}</span>
                      <span>{mensaje.fecha_envio}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Comunicaciones;
