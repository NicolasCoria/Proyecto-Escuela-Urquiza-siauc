import React, { useState } from 'react';
import styles from './profile.module.css';
import Modal from '../../../Components/Shared/Modal';
import Spinner from '../../../Components/Shared/Spinner';
import { useModalContext, useStateContext } from '../../../Components/Contexts';
//import DashboardAlumno from '../Dashboard';

const Profile = () => {
  const { modalState, closeModal } = useModalContext();
  const { user, carrera, unidadesCarrera, unidadesAprobadas, unidadesInscriptas } =
    useStateContext();
  const [isLoading] = useState(false);

  // Si no hay usuario logueado, puedes redirigir o mostrar un mensaje
  if (!user) {
    return <div>No hay datos de usuario.</div>;
  }

  // Progreso académico
  const total = unidadesCarrera?.length || 0;
  const aprobadas = unidadesAprobadas?.length || 0;
  const progreso = total ? Math.round((aprobadas / total) * 100) : 0;

  // Verificar que unidadesInscriptas sea un array
  const unidadesInscriptasArray = Array.isArray(unidadesInscriptas) ? unidadesInscriptas : [];

  return (
    <>
      {modalState.isOpen && (
        <Modal description={modalState.description} isOpen={modalState.isOpen} close={closeModal} />
      )}
      <section className={styles.container}>
        {isLoading && <Spinner />}
        <div className={styles.content}>
          <div className={styles.photoContainer}>
            <div className={styles.photoContainer}>
              <img
                src={
                  user?.profile_photo ||
                  `${process.env.PUBLIC_URL}/assets/images/defaultProfile.png`
                }
                className={styles.profilePhoto}
                alt="Foto de perfil"
              />
            </div>
          </div>
          <div className={styles.inputContainer}>
            <label className={styles.label}>Nombre</label>
            <p className={styles.p}>{user?.nombre || user?.name}</p>
          </div>
          <div className={styles.inputContainer}>
            <label className={styles.label}>Apellido</label>
            <p className={styles.p}>{user?.apellido}</p>
          </div>
          <div className={styles.inputContainer}>
            <label className={styles.label}>Email</label>
            <p className={styles.p}>{user?.email}</p>
          </div>
          {carrera && (
            <div className={styles.inputContainer}>
              <label className={styles.label}>Carrera</label>
              <p className={styles.p}>{carrera.carrera}</p>
            </div>
          )}
        </div>

        {/* Dashboard Section */}
        <div className={styles.dashboardSection}>
          <h2 className={styles.dashboardTitle}>Dashboard Académico</h2>
          <div className={styles.dashboardGrid}>
            {/* Progreso académico */}
            <div className={styles.dashboardCard}>
              <h3>Progreso académico</h3>
              <div className={styles.progressInfo}>
                <p>
                  Unidades aprobadas: {aprobadas} de {total}
                </p>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progreso}%` }}></div>
                </div>
                <p className={styles.progressPercentage}>{progreso}% completado</p>
              </div>
            </div>

            {/* Inscripciones activas */}
            <div className={styles.dashboardCard}>
              <h3>Inscripciones activas</h3>
              {unidadesInscriptasArray.length === 0 ? (
                <div>No hay inscripciones activas.</div>
              ) : (
                <ul className={styles.inscripcionesList}>
                  {unidadesInscriptasArray.map((uc) => (
                    <li key={uc.id_uc || uc.id}>
                      {uc.Unidad_Curricular ||
                        uc.unidad_curricular ||
                        uc.nombre ||
                        'Unidad Curricular'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
