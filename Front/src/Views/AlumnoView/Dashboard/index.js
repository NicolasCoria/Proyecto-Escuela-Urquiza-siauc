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
            <div key={ano} style={{ marginBottom: '16px' }}>
              <h4
                style={{
                  margin: '0 0 8px 0',
                  color: '#1976d2',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderBottom: '1px solid #e0e0e0',
                  paddingBottom: '4px'
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
              <ul style={{ margin: '0 0 0 16px', padding: '0' }}>
                {ucsPorAno[ano].map((uc) => {
                  const fechaInscripcion = uc.fecha_inscripcion;
                  const estaAprobada = uc.esta_aprobada;
                  const puedeReinscribirse = uc.puede_reinscribirse;

                  return (
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

                      {/* Estado de aprobación */}
                      {estaAprobada ? (
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
                      ) : (
                        <span
                          style={{
                            backgroundColor: '#ff9800',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '500'
                          }}
                        >
                          📚 Cursando
                        </span>
                      )}

                      {/* Fecha de inscripción */}
                      {fechaInscripcion && (
                        <span
                          style={{
                            color: '#666',
                            fontSize: '11px',
                            fontStyle: 'italic'
                          }}
                        >
                          Inscripto: {new Date(fechaInscripcion).toLocaleDateString('es-ES')}
                        </span>
                      )}

                      {/* Indicador de reinscripción */}
                      {puedeReinscribirse && (
                        <span
                          style={{
                            backgroundColor: '#2196f3',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '500'
                          }}
                        >
                          🔄 Reinscribible
                        </span>
                      )}
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
