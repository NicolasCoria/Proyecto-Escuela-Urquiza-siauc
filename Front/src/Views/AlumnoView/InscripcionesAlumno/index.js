import React, { useState, useEffect } from 'react';
import Skeleton from '../../../Components/Shared/Skeleton';
import { useStateContext } from '../../../Components/Contexts';
import axiosClient from '../../../Components/Shared/Axios';
import styles from './inscripciones.module.css';

const InscripcionesAlumno = () => {
  const { carrera, unidadesDisponibles } = useStateContext();
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unidadesInscriptas, setUnidadesInscriptas] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(true);
  const [periodoInfo, setPeriodoInfo] = useState(null);

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
    return unidadesInscriptas.includes(id_uc);
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
                <ul className={styles.unidadesList}>
                  {unidadesDisponibles.map((uc) => (
                    <li key={uc.id_uc} className={styles.unidadItem}>
                      <label
                        className={`${styles.unidadLabel} ${isUnidadInscripta(uc.id_uc) ? styles.disabled : ''}`}
                      >
                        <input
                          type="checkbox"
                          className={styles.unidadCheckbox}
                          checked={seleccionadas.includes(uc.id_uc)}
                          onChange={() => handleSelect(uc.id_uc)}
                          disabled={isUnidadInscripta(uc.id_uc)}
                        />
                        <span
                          className={`${styles.unidadName} ${isUnidadInscripta(uc.id_uc) ? styles.disabled : ''}`}
                        >
                          {uc.unidad_curricular || uc.Unidad_Curricular}
                        </span>
                        {isUnidadInscripta(uc.id_uc) && (
                          <span className={styles.inscriptoBadge}>✅ Inscripto</span>
                        )}
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            )}
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
