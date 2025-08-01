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

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h2 className={styles.dashboardTitle}>Dashboard Alumno</h2>
        <button onClick={() => navigate('/alumno/faqs')} className={styles.faqButton}>
          Preguntas Frecuentes
        </button>
      </div>
      <div className={styles.dashboardGrid}>
        {/* Inscripciones activas */}
        <section className={styles.dashboardCard}>
          <h3>Inscripciones activas</h3>
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
        {/* Próximos exámenes */}
        <section className={styles.dashboardCard}>
          <h3>Próximos exámenes</h3>
          <div>Próximamente: listado de exámenes próximos.</div>
        </section>
      </div>
      <div className={styles.dashboardGrid}>
        {/* Notificaciones */}
        <section className={styles.dashboardCard}>
          <h3>Notificaciones</h3>
          <div>Próximamente: notificaciones importantes.</div>
        </section>
        {/* Datos rápidos de perfil */}
        <section className={styles.dashboardCard}>
          <h3>Datos rápidos de perfil</h3>
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
      </div>
    </div>
  );
};

export default DashboardAlumno;
