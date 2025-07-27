import React from 'react';
import styles from './dashboard.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useStateContext } from '../../../Components/Contexts';
import EncuestaForm from './EncuestaForm';
import GestionarAsignaciones from './GestionarAsignaciones';
import EditarEncuestas from './EditarEncuestas';
import GruposDestinatarios from './GruposDestinatarios';
import WelcomeTooltip from '../../../Components/Shared/WelcomeTooltip';

const AdminDashboard = () => {
  const { user } = useStateContext();
  const navigate = useNavigate();

  const handleViewFaqs = () => {
    navigate('/admin/faqs');
  };

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
          <h2>Gestión de Encuestas Académicas</h2>
          <p>
            Desde aquí puedes crear, editar y gestionar la asignación de encuestas a los alumnos.
          </p>

          <EncuestaForm />

          <GestionarAsignaciones />

          <EditarEncuestas />

          <GruposDestinatarios />

          <h2>Otras Funciones</h2>
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

      <WelcomeTooltip
        id="admin-dashboard"
        userId={user?.id}
        title="¡Bienvenido al Panel de Administración!"
        message="Aquí puedes gestionar encuestas, generar informes, y administrar todas las funcionalidades del sistema. Usa los enlaces de la izquierda para navegar entre las diferentes secciones."
        onViewFaqs={handleViewFaqs}
      />
    </div>
  );
};

export default AdminDashboard;
