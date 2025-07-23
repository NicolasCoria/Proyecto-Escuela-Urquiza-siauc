import React from 'react';
import styles from './dashboard.module.css';
import { useStateContext } from '../../../Components/Contexts';

const DashboardAlumno = () => {
  const { user, carrera, unidadesCarrera, unidadesAprobadas, unidadesInscriptas } =
    useStateContext();

  // Progreso académico
  const total = unidadesCarrera.length;
  const aprobadas = unidadesAprobadas.length;
  const progreso = total ? Math.round((aprobadas / total) * 100) : 0;

  return (
    <div className={styles.dashboardContainer}>
      <h2 className={styles.dashboardTitle}>Dashboard Alumno</h2>
      <div className={styles.dashboardGrid}>
        {/* Inscripciones activas */}
        <section className={styles.dashboardCard}>
          <h3>Inscripciones activas</h3>
          {unidadesInscriptas.length === 0 ? (
            <div>No hay inscripciones activas.</div>
          ) : (
            <ul>
              {unidadesInscriptas.map((uc) => (
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
