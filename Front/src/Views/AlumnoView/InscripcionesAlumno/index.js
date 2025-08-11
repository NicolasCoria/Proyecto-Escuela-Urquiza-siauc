import React, { useState, useEffect } from 'react';
import Skeleton from '../../../Components/Shared/Skeleton';
import { useStateContext } from '../../../Components/Contexts';
import axiosClient from '../../../Components/Shared/Axios';
import styles from './inscripciones.module.css';
import Button from '../../../Components/Shared/Button';

const InscripcionesAlumno = () => {
  const {
    carrera,
    unidadesDisponibles,
    unidadesDisponiblesPorAno,
    unidadesAprobadas,
    unidadesInscriptasPorAno
  } = useStateContext();
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unidadesInscriptas, setUnidadesInscriptas] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(true);
  const [periodoInfo, setPeriodoInfo] = useState(null);

  // Función para generar estilos dinámicos basados en la carrera
  // Los colores se basan en sidebarTheme.js para mantener consistencia visual
  const getCarreraStyles = () => {
    if (!carrera) return {};

    const carreraId = carrera.id || carrera.id_carrera;

    // Colores específicos para cada carrera (basados en sidebarTheme.js)
    const carreraColors = {
      1: {
        // AF - Azul (Análisis Funcional)
        background: 'linear-gradient(135deg, #e3f2fd 0%, #1976d2 100%)',
        primary: '#1976d2',
        secondary: '#1565c0',
        accent: '#0d47a1'
      },
      2: {
        // DS - Verde (Desarrollo de Software)
        background: 'linear-gradient(135deg, #e8f5e9 0%, #43a047 100%)',
        primary: '#43a047',
        secondary: '#388e3c',
        accent: '#1b5e20'
      },
      3: {
        // ITI - Rojo (Infraestructura de TI)
        background: 'linear-gradient(135deg, #ffebee 0%, #e53935 100%)',
        primary: '#e53935',
        secondary: '#b71c1c',
        accent: '#ff7043'
      }
    };

    return carreraColors[carreraId] || {};
  };

  // Cargar unidades en las que ya está inscripto y verificar período
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar unidades inscriptas
        const responseInscriptas = await axiosClient.get('/alumno/unidades-inscriptas');
        if (responseInscriptas.data.success) {
          setUnidadesInscriptas(responseInscriptas.data.unidades);
        }

        // Verificar período de inscripción
        const responsePeriodo = await axiosClient.get('/alumno/verificar-periodo-inscripcion');
        setPeriodoInfo(responsePeriodo.data);
      } catch (err) {
        console.error('Error cargando datos:', err);
        if (err.response?.status === 403) {
          setPeriodoInfo(err.response.data);
        }
      }
    };

    cargarDatos();
  }, []);

  // Verificar cuando las unidades disponibles están cargadas
  useEffect(() => {
    if (unidadesDisponibles && unidadesDisponibles.length >= 0) {
      setLoadingUnidades(false);
    }
  }, [unidadesDisponibles]);

  const handleSelect = (id) => {
    setSeleccionadas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleInscribir = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.post('/alumno/inscribir-unidades', {
        unidades: seleccionadas
      });

      setInscripciones(res.data.inscripciones);
      setSuccess(true);

      // Actualizar la lista de unidades inscriptas
      setUnidadesInscriptas((prev) => [...prev, ...seleccionadas]);

      // Limpiar selección
      setSeleccionadas([]);
    } catch (err) {
      if (err.response?.data?.unidades_duplicadas) {
        // Error de duplicados
        const duplicadas = err.response.data.unidades_nombres;
        setError(`❌ Ya estás inscripto en: ${duplicadas.join(', ')}`);

        // Remover duplicados de la selección
        const duplicadasIds = err.response.data.unidades_duplicadas;
        setSeleccionadas((prev) => prev.filter((id) => !duplicadasIds.includes(id)));
      } else {
        setError(err.response?.data?.error || 'Error al inscribirse');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarComprobante = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.post(
        '/alumno/comprobante-inscripcion',
        { inscripciones: inscripciones.map((i) => i.id_inscripcion) },
        {
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

  // Función para obtener el nombre de la UC por ID
  const getUnidadName = (id_uc) => {
    const unidad = unidadesDisponibles.find((uc) => uc.id_uc === id_uc);
    return unidad ? unidad.unidad_curricular || unidad.Unidad_Curricular : 'UC no encontrada';
  };

  // Función para formatear fecha y hora
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      fecha: date.toLocaleDateString('es-AR'),
      hora: date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // Función para obtener el nombre de la carrera desde el contexto
  const getCarreraName = () => {
    return carrera ? carrera.carrera : 'Carrera no especificada';
  };

  // Verificar si una unidad ya está inscripta
  const isUnidadInscripta = (id_uc) => {
    // Verificar en el array de unidadesInscriptas (objetos) si esta UC está incluida
    return unidadesInscriptas.some((uc) => (uc.id_uc || uc.id) === id_uc);
  };

  // Verificar si una unidad ya está aprobada
  const isUnidadAprobada = (id_uc) => {
    // Verificar en el array de unidades aprobadas si esta UC está incluida
    return unidadesAprobadas && unidadesAprobadas.some((uc) => (uc.id_uc || uc.id) === id_uc);
  };

  // Función para determinar si una UC es reinscribible
  const isUnidadReinscribible = (id_uc) => {
    // Si está aprobada, no es reinscribible
    if (isUnidadAprobada(id_uc)) {
      return false;
    }

    // Buscar la fecha de inscripción en todas las UCs inscriptas
    let fechaInscripcion = null;

    // Buscar en unidadesInscriptasPorAno
    if (unidadesInscriptasPorAno) {
      Object.values(unidadesInscriptasPorAno).forEach((ucsAno) => {
        const uc = ucsAno.find((u) => (u.id_uc || u.id) === id_uc);
        if (uc && uc.fecha_inscripcion) {
          fechaInscripcion = uc.fecha_inscripcion;
        }
      });
    }

    // Si no se encontró en unidadesInscriptasPorAno, buscar en unidadesInscriptas
    if (!fechaInscripcion && unidadesInscriptas) {
      const uc = unidadesInscriptas.find((u) => (u.id_uc || u.id) === id_uc);
      if (uc && uc.fecha_inscripcion) {
        fechaInscripcion = uc.fecha_inscripcion;
      }
    }

    // Si no hay fecha de inscripción, no es reinscribible
    if (!fechaInscripcion) {
      return false;
    }

    // Verificar si pasó más de 12 meses usando la misma lógica que el Dashboard
    const fechaInsc = new Date(fechaInscripcion);
    const fechaActual = new Date();
    const diferenciaMeses =
      (fechaActual.getTime() - fechaInsc.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

    return diferenciaMeses > 12;
  };

  // IDs seleccionables (excluye las ya inscriptas/disabled)
  const selectableIds = (unidadesDisponibles || [])
    .filter((uc) => !isUnidadInscripta(uc.id_uc))
    .map((uc) => uc.id_uc);

  const selectedSelectableCount = seleccionadas.filter((id) => selectableIds.includes(id)).length;
  const isAllSelected =
    selectableIds.length > 0 && selectedSelectableCount === selectableIds.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Desmarcar todas las seleccionables
      setSeleccionadas((prev) => prev.filter((id) => !selectableIds.includes(id)));
    } else {
      // Marcar todas las seleccionables, preservando otras selecciones no relacionadas
      setSeleccionadas((prev) =>
        Array.from(new Set([...prev.filter((id) => !selectableIds.includes(id)), ...selectableIds]))
      );
    }
  };

  // Función para renderizar UCs agrupadas por año
  const renderUCsPorAno = () => {
    if (!unidadesDisponiblesPorAno || Object.keys(unidadesDisponiblesPorAno).length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>No hay unidades curriculares disponibles para inscripción en este momento.</p>
        </div>
      );
    }

    const carreraStyles = getCarreraStyles();

    return (
      <div>
        {Object.keys(unidadesDisponiblesPorAno)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((ano) => (
            <div key={ano} className={styles.anoGroup}>
              <h4
                className={styles.anoTitle}
                style={{
                  background:
                    carreraStyles.background || 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  color: carreraStyles.primary ? '#1a1a1a' : '#2c3e50'
                }}
              >
                {ano === '1'
                  ? 'Primer Año'
                  : ano === '2'
                    ? 'Segundo Año'
                    : ano === '3'
                      ? 'Tercer Año'
                      : ano === '4'
                        ? 'Cuarto Año'
                        : `${ano}° Año`}
              </h4>
              <ul className={styles.unidadesList}>
                {unidadesDisponiblesPorAno[ano].map((uc) => {
                  const isInscripta = isUnidadInscripta(uc.id_uc);
                  const isAprobada = isUnidadAprobada(uc.id_uc);
                  const isReinscribible = isUnidadReinscribible(uc.id_uc);

                  return (
                    <li key={uc.id_uc} className={styles.unidadItem}>
                      <label
                        className={`${styles.unidadLabel} ${isInscripta && isAprobada ? styles.disabled : ''}`}
                      >
                        <div className={styles.modernCheckbox}>
                          <input
                            type="checkbox"
                            checked={seleccionadas.includes(uc.id_uc)}
                            onChange={() => handleSelect(uc.id_uc)}
                            disabled={isInscripta && isAprobada}
                          />
                          <span className={styles.checkmark}></span>
                        </div>
                        <span
                          className={`${styles.unidadName} ${isInscripta && isAprobada ? styles.disabled : ''}`}
                        >
                          {uc.unidad_curricular || uc.Unidad_Curricular}
                        </span>

                        {/* Solo mostrar etiqueta si es reinscribible */}
                        {isReinscribible && (
                          <span className={styles.reinscribibleBadge}>🔄 Reinscripción</span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
      </div>
    );
  };

  return (
    <main className={styles.container}>
      <h2 className={styles.title}>Inscripción a Unidades Curriculares</h2>

      {/* Mostrar skeleton solo cuando está cargando las UC inicialmente */}
      {loading && !success && (
        <div className={styles.skeletonContainer}>
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} height={28} style={{ marginBottom: 14, borderRadius: 8 }} />
          ))}
        </div>
      )}

      {/* Mensaje de error */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Información del período de inscripción */}
      {periodoInfo && !periodoInfo.inscripcion_habilitada && (
        <div className={styles.periodoInfo}>
          <h3>📅 Período de Inscripción</h3>
          <p>{periodoInfo.message}</p>
          {periodoInfo.periodo_info?.proximo_periodo && (
            <div className={styles.proximoPeriodo}>
              <h4>Próximo período:</h4>
              <p>
                <strong>{periodoInfo.periodo_info.proximo_periodo.nombre}</strong>
              </p>
              <p>
                Inicio:{' '}
                {new Date(periodoInfo.periodo_info.proximo_periodo.fecha_inicio).toLocaleString(
                  'es-AR'
                )}
              </p>
              <p>
                Fin:{' '}
                {new Date(periodoInfo.periodo_info.proximo_periodo.fecha_fin).toLocaleString(
                  'es-AR'
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Formulario de inscripción */}
      {!success && !loading && periodoInfo?.inscripcion_habilitada && (
        <>
          <div className={styles.formContainer}>
            {loadingUnidades ? (
              <div className={styles.loadingUnidades}>
                <p>Cargando unidades curriculares...</p>
              </div>
            ) : unidadesDisponibles.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No hay unidades curriculares disponibles para inscripción en este momento.</p>
              </div>
            ) : (
              <>
                <h3 className={styles.formTitle}>Unidades Disponibles:</h3>
                {renderUCsPorAno()}
              </>
            )}
          </div>

          <div className={styles.actionsRow}>
            <Button
              text={isAllSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
              onClick={handleSelectAll}
              type="edit"
            />
          </div>

          {seleccionadas.length > 0 && (
            <button onClick={handleInscribir} disabled={loading} className={styles.submitButton}>
              {loading ? 'Inscribiendo...' : `Inscribirse en ${seleccionadas.length} unidad(es)`}
            </button>
          )}
        </>
      )}

      {/* Comprobante de inscripción exitosa */}
      {success && (
        <div className={styles.comprobanteContainer}>
          <div className={styles.comprobanteHeader}>
            <h3 className={styles.comprobanteTitle}>¡Inscripción exitosa!</h3>
            <p className={styles.comprobanteDescription}>
              Te has inscripto en las siguientes unidades curriculares:
            </p>
          </div>
          <div style={{ marginBottom: 24 }}>
            {inscripciones.map((insc, i) => {
              const { fecha, hora } = formatDateTime(
                insc.FechaHora || insc.fecha_inscripcion || insc.created_at || new Date()
              );
              return (
                <div key={insc.id_inscripcion} className={styles.inscripcionItem}>
                  <div className={styles.inscripcionTitle}>
                    {i + 1}. {getUnidadName(insc.id_uc)}
                  </div>
                  <div className={styles.inscripcionDetails}>
                    <div>Fecha: {fecha}</div>
                    <div>Hora: {hora}</div>
                    <div>Carrera: {getCarreraName()}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleDescargarComprobante}
              disabled={loading}
              className={styles.downloadButton}
            >
              {loading ? 'Descargando...' : 'Descargar comprobante PDF'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default InscripcionesAlumno;
