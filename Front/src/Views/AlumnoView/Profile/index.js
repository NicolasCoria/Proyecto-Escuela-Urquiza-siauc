import React, { useState } from 'react';
import styles from './profile.module.css';
import Modal from '../../../Components/Shared/Modal';
import Spinner from '../../../Components/Shared/Spinner';
import { useModalContext, useStateContext } from '../../../Components/Contexts';
//import DashboardAlumno from '../Dashboard';

const Profile = () => {
  const { modalState, closeModal } = useModalContext();
  const { user, carrera, unidadesCarrera, unidadesAprobadas, unidadesInscriptasPorAno } =
    useStateContext();
  const [isLoading] = useState(false);

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

  // Si no hay usuario logueado, puedes redirigir o mostrar un mensaje
  if (!user) {
    return <div>No hay datos de usuario.</div>;
  }

  // Progreso académico
  const total = unidadesCarrera?.length || 0;
  const aprobadas = unidadesAprobadas?.length || 0;
  const progreso = total ? Math.round((aprobadas / total) * 100) : 0;

  // Debug: ver qué datos tenemos
  console.log('Debug UC Aprobadas:', {
    unidadesAprobadas,
    length: unidadesAprobadas?.length,
    type: typeof unidadesAprobadas,
    isArray: Array.isArray(unidadesAprobadas)
  });

  // Convertir unidadesInscriptasPorAno a array plano para el perfil
  const unidadesInscriptasArray = Object.values(unidadesInscriptasPorAno || {}).flat();

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
                {/* Lista de UC aprobadas - Versión mejorada */}
                <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid #eee' }}>
                  <strong style={{ color: '#333', fontSize: '16px' }}>
                    Unidades Curriculares Aprobadas:
                  </strong>
                  {!unidadesAprobadas ? (
                    <p style={{ fontStyle: 'italic', color: '#666', margin: '8px 0' }}>
                      Cargando unidades aprobadas...
                    </p>
                  ) : unidadesAprobadas.length === 0 ? (
                    <p style={{ fontStyle: 'italic', color: '#666', margin: '8px 0' }}>
                      No hay unidades curriculares aprobadas aún.
                    </p>
                  ) : (
                    <div>
                      <p style={{ fontSize: '14px', color: '#666', margin: '8px 0' }}>
                        Total aprobadas: {unidadesAprobadas.length}
                      </p>
                      <ul
                        style={{
                          margin: '8px 0',
                          padding: '0 0 0 20px',
                          listStyle: 'disc',
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}
                      >
                        {unidadesAprobadas.map((uc, index) => {
                          const nombre =
                            uc?.unidad_curricular ||
                            uc?.Unidad_Curricular ||
                            uc?.nombre ||
                            `UC ${index + 1}`;
                          return (
                            <li
                              key={uc?.id_uc || uc?.id || index}
                              style={{
                                fontSize: '14px',
                                margin: '4px 0',
                                color: '#333',
                                lineHeight: '1.4'
                              }}
                            >
                              {nombre}
                              {uc?.codigo && <span style={{ color: '#666' }}> ({uc.codigo})</span>}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Inscripciones activas */}
            <div className={styles.dashboardCard}>
              <h3>Inscripciones activas</h3>
              {unidadesInscriptasArray.length === 0 ? (
                <div
                  style={{
                    color: '#666',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '20px'
                  }}
                >
                  No hay inscripciones activas.
                </div>
              ) : (
                <div className={styles.inscripcionesContainer}>
                  <p style={{ fontSize: '14px', color: '#666', margin: '8px 0' }}>
                    Total inscripciones: {unidadesInscriptasArray.length}
                  </p>
                  <div className={styles.inscripcionesGrid}>
                    {unidadesInscriptasArray.map((uc) => {
                      const fechaInscripcion = uc.fecha_inscripcion;
                      const estaAprobada = uc.esta_aprobada;
                      const estadoUC = determinarEstadoUC(fechaInscripcion, estaAprobada);

                      return (
                        <div key={uc.id_uc || uc.id} className={styles.inscripcionCard}>
                          <div className={styles.inscripcionHeader}>
                            <h4 className={styles.inscripcionNombre}>
                              {uc.Unidad_Curricular ||
                                uc.unidad_curricular ||
                                uc.nombre ||
                                'Unidad Curricular'}
                            </h4>
                            <div className={styles.inscripcionEstados}>
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
                          {fechaInscripcion && (
                            <div className={styles.inscripcionFecha}>
                              <span>📅 Fecha:</span>
                              <strong>
                                {new Date(fechaInscripcion).toLocaleDateString('es-ES')}
                              </strong>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
