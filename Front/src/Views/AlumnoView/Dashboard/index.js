import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './dashboard.module.css';
import { useStateContext } from '../../../Components/Contexts';

const DashboardAlumno = () => {
  const { user, carrera, unidadesCarrera, unidadesAprobadas, unidadesInscriptas } =
    useStateContext();
  const navigate = useNavigate();

  // Progreso académico
  const total = unidadesCarrera?.length || 0;
  const aprobadas = unidadesAprobadas?.length || 0;
  const progreso = total ? Math.round((aprobadas / total) * 100) : 0;

  // Verificar que unidadesInscriptas sea un array
  const unidadesInscriptasArray = Array.isArray(unidadesInscriptas) ? unidadesInscriptas : [];
  const unidadesAprobadasArray = Array.isArray(unidadesAprobadas) ? unidadesAprobadas : [];

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
          {unidadesInscriptasArray.length === 0 ? (
            <div>No hay inscripciones activas.</div>
          ) : (
            <ul>
              {unidadesInscriptasArray.map((uc) => (
                <li key={uc.id_uc || uc.id}>
                  {uc.Unidad_Curricular || uc.unidad_curricular || uc.nombre || 'Unidad Curricular'}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* UCs aprobadas */}
        <section className={styles.dashboardCard}>
          <h3>UCs aprobadas</h3>
          {unidadesAprobadasArray.length === 0 ? (
            <div>No hay unidades curriculares aprobadas aún.</div>
          ) : (
            <ul>
              {unidadesAprobadasArray.map((uc) => (
                <li key={uc.id_uc || uc.id}>
                  {uc.Unidad_Curricular || uc.unidad_curricular || uc.nombre || 'Unidad Curricular'}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardAlumno;
