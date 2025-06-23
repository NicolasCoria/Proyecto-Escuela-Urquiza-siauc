import React from 'react';
import Aside from '../../Components/Shared/Aside';
import styles from '../../Components/Home/home.module.css';
import { useNavigate } from 'react-router-dom';

const AlumnoMenu = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('alumno');
    navigate('/login');
  };

  return (
    <>
      <Aside page={'home'} />
      <main>
        <section className={styles.container}>
          <div className={styles.title}>Menú Principal Alumno</div>
          <div
            className={styles.subContainer}
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24
            }}
          >
            <button className={styles.menuBtn} onClick={() => navigate('inscripciones')}>
              Inscripción a Unidades Curriculares
            </button>
            <button className={styles.menuBtn} onClick={() => navigate('profile')}>
              Perfil
            </button>
            <button
              className={styles.menuBtn}
              style={{ background: '#e53935', marginTop: 32 }}
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </section>
      </main>
    </>
  );
};

export default AlumnoMenu;
