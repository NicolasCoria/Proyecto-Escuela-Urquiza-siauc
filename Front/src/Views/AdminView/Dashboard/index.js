import React from 'react';
import styles from './dashboard.module.css';
import { Link } from 'react-router-dom';
import { useStateContext } from '../../../Components/Contexts';
import EncuestaForm from './EncuestaForm';

const AdminDashboard = () => {
  const { user } = useStateContext();

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Panel de Administración</h1>
          <div className={styles.userInfo}>
            <span>
              Bienvenido, {user?.nombre} {user?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <EncuestaForm />
          <h2>Bienvenido al Panel de Administración</h2>
          <p>Desde aquí puedes gestionar el sistema y generar informes personalizados.</p>

          <div className={styles.quickActions}>
            <div className={styles.actionCard}>
              <h3>Generar Informes</h3>
              <p>Accede a la herramienta de generación de informes personalizados</p>
              <Link to="/admin/informes" className={styles.actionBtn}>
                Ir a Informes
              </Link>
            </div>

            <div className={styles.actionCard}>
              <h3>Estadísticas</h3>
              <p>Visualiza estadísticas y métricas del sistema</p>
              <button className={styles.actionBtn} disabled>
                Próximamente
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
