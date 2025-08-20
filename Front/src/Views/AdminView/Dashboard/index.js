import React, { Suspense, useState } from 'react';
import styles from './dashboard.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useStateContext } from '../../../Components/Contexts';
import Spinner from '../../../Components/Shared/Spinner';
import WelcomeTooltip from '../../../Components/Shared/WelcomeTooltip';

// Lazy loading de componentes pesados
const EncuestaForm = React.lazy(() => import('./EncuestaForm'));
const GestionarAsignaciones = React.lazy(() => import('./GestionarAsignaciones'));
const EditarEncuestas = React.lazy(() => import('./EditarEncuestas'));
const GruposDestinatarios = React.lazy(() => import('./GruposDestinatarios'));
const Estadisticas = React.lazy(() => import('./Estadisticas'));

const AdminDashboard = () => {
  const { user } = useStateContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

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
        {/* Navegación por tabs */}
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Resumen
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'create' ? styles.active : ''}`}
            onClick={() => setActiveTab('create')}
          >
            ➕ Crear Encuesta
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'assign' ? styles.active : ''}`}
            onClick={() => setActiveTab('assign')}
          >
            👥 Asignar Encuestas
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'edit' ? styles.active : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            ✏️ Editar Encuestas
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'groups' ? styles.active : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            👥 Grupos
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'stats' ? styles.active : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Estadísticas
          </button>
        </div>

        {/* Contenido de los tabs */}
        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <section className={styles.section}>
              <h2>Panel de Administración</h2>
              <p>
                Bienvenido al panel de administración. Selecciona una pestaña para comenzar a
                trabajar.
              </p>

              <h3>Acciones Rápidas</h3>
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
                  <button className={styles.actionBtn} onClick={() => setActiveTab('stats')}>
                    Ver Estadísticas
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'create' && (
            <Suspense fallback={<Spinner />}>
              <EncuestaForm />
            </Suspense>
          )}

          {activeTab === 'assign' && (
            <Suspense fallback={<Spinner />}>
              <GestionarAsignaciones />
            </Suspense>
          )}

          {activeTab === 'edit' && (
            <Suspense fallback={<Spinner />}>
              <EditarEncuestas />
            </Suspense>
          )}

          {activeTab === 'groups' && (
            <Suspense fallback={<Spinner />}>
              <GruposDestinatarios />
            </Suspense>
          )}

          {activeTab === 'stats' && (
            <Suspense fallback={<Spinner />}>
              <Estadisticas />
            </Suspense>
          )}
        </div>
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
