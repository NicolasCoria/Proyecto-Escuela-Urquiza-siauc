import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './dashboard.module.css';
import { useStateContext } from '../../../Components/Contexts';

const DashboardAlumno = () => {
  const {
    user,
    carrera,
    unidadesCarreraPorAno,
    unidadesAprobadasPorAno,
    unidadesInscriptasPorAno
  } = useStateContext();
  const navigate = useNavigate();

  // Función para determinar el estado de una UC inscripta
  const determinarEstadoUC = (fechaInscripcion, estaAprobada) => {
    if (estaAprobada) {
      return { estado: 'aprobada', esReinscribible: false };
    }

    if (!fechaInscripcion) {
      return { estado: 'cursando', esReinscribible: false };
    }

    const fechaInsc = new Date(fechaInscripcion);
    const fechaActual = new Date();
    const diferenciaMeses =
      (fechaActual.getTime() - fechaInsc.getTime()) / (1000 * 60 * 60 * 24 * 30.44); // Aproximadamente un mes

    // Si pasó más de 12 meses (1 año) y no está aprobada, es reinscribible
    if (diferenciaMeses > 12) {
      return { estado: 'reinscribible', esReinscribible: true };
    } else {
      return { estado: 'cursando', esReinscribible: false };
    }
  };

  // Progreso académico
  const total = Object.values(unidadesCarreraPorAno || {}).reduce(
    (sum, ucs) => sum + ucs.length,
    0
  );
  const aprobadas = Object.values(unidadesAprobadasPorAno || {}).reduce(
    (sum, ucs) => sum + ucs.length,
    0
  );
  const progreso = total ? Math.round((aprobadas / total) * 100) : 0;

  // Función para renderizar UCs agrupadas por año
  const renderUCsPorAno = (ucsPorAno, titulo) => {
    if (!ucsPorAno || Object.keys(ucsPorAno).length === 0) {
      return <div>No hay {titulo.toLowerCase()} aún.</div>;
    }

    return (
      <div>
        {Object.keys(ucsPorAno)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((ano) => (
            <div key={ano} style={{ marginBottom: '20px' }}>
              <h4
                style={{
                  margin: '0 0 12px 0',
                  color: '#1976d2',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderBottom: '2px solid #1976d2',
                  paddingBottom: '6px'
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

              {/* Tabla de UCs para UCs inscriptas */}
              {titulo.includes('Inscriptas') ? (
                <div className={styles.ucTable}>
                  <div className={styles.ucTableHeader}>
                    <div className={styles.ucTableCol}>Unidad Curricular</div>
                    <div className={styles.ucTableCol}>Fecha</div>
                    <div className={styles.ucTableCol}>Estado</div>
                  </div>
                  {ucsPorAno[ano].map((uc) => {
                    const fechaInscripcion = uc.fecha_inscripcion;
                    const estaAprobada = uc.esta_aprobada;
                    const estadoUC = determinarEstadoUC(fechaInscripcion, estaAprobada);

                    return (
                      <div key={uc.id_uc || uc.id} className={styles.ucTableRow}>
                        <div className={styles.ucTableCol}>
                          {uc.Unidad_Curricular ||
                            uc.unidad_curricular ||
                            uc.nombre ||
                            'Unidad Curricular'}
                        </div>
                        <div className={styles.ucTableCol}>
                          {fechaInscripcion ? (
                            <span className={styles.fechaInscripcion}>
                              {new Date(fechaInscripcion).toLocaleDateString('es-ES')}
                            </span>
                          ) : (
                            <span style={{ color: '#999', fontStyle: 'italic' }}>
                              No disponible
                            </span>
                          )}
                        </div>
                        <div className={styles.ucTableCol}>
                          <div className={styles.estadoContainer}>
                            {estadoUC.estado === 'aprobada' && (
                              <span className={styles.estadoAprobada}>✅ Aprobada</span>
                            )}
                            {estadoUC.estado === 'cursando' && (
                              <span className={styles.estadoCursando}>📚 Cursando</span>
                            )}
                            {estadoUC.estado === 'reinscribible' && (
                              <span className={styles.estadoReinscribible}>🔄 Reinscribible</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Lista simple para UCs aprobadas */
                <ul style={{ margin: '0 0 0 16px', padding: '0' }}>
                  {ucsPorAno[ano].map((uc) => (
                    <li
                      key={uc.id_uc || uc.id}
                      style={{
                        marginBottom: '8px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ flex: 1 }}>
                        {uc.Unidad_Curricular ||
                          uc.unidad_curricular ||
                          uc.nombre ||
                          'Unidad Curricular'}
                      </span>
                      <span
                        style={{
                          backgroundColor: '#4caf50',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}
                      >
                        ✅ Aprobada
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h2 className={styles.dashboardTitle}>Dashboard Alumno</h2>
        <button onClick={() => navigate('/alumno/faqs')} className={styles.faqButton}>
          Preguntas Frecuentes
        </button>
      </div>
      <div className={styles.dashboardGrid}>
        {/* Datos del alumno */}
        <section className={styles.dashboardCard}>
          <h3>Datos del alumno</h3>
          <div>
            <b>Nombre:</b> {user?.nombre} {user?.apellido}
          </div>
          <div>
            <b>Carrera:</b> {carrera?.carrera || carrera?.nombre}
          </div>
          <div>
            <b>Legajo:</b> {user?.legajo || user?.id_alumno}
          </div>
          <div>
            <b>Email:</b> {user?.email}
          </div>
        </section>

        {/* Progreso académico */}
        <section className={styles.dashboardCard}>
          <h3>Progreso académico</h3>
          {total === 0 ? (
            <div>No hay unidades curriculares en el plan de estudio.</div>
          ) : (
            <>
              <div>
                Aprobadas: {aprobadas} / {total}
              </div>
              <div style={{ background: '#eee', borderRadius: 8, margin: '8px 0' }}>
                <div
                  style={{
                    width: `${progreso}%`,
                    background: '#1976d2',
                    height: 12,
                    borderRadius: 8
                  }}
                />
              </div>
              <div>{progreso}%</div>
            </>
          )}
        </section>
      </div>

      <div className={styles.dashboardGrid}>
        {/* UCs inscriptas */}
        <section className={styles.dashboardCard}>
          <h3>UCs inscriptas</h3>
          {renderUCsPorAno(unidadesInscriptasPorAno, 'Unidades Curriculares Inscriptas')}
        </section>

        {/* UCs aprobadas */}
        <section className={styles.dashboardCard}>
          <h3>UCs aprobadas</h3>
          {renderUCsPorAno(unidadesAprobadasPorAno, 'Unidades Curriculares Aprobadas')}
        </section>
      </div>
    </div>
  );
};

export default DashboardAlumno;
