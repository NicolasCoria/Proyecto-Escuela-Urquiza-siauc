import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../Components/Home/home.module.css';
import Button from '../../Components/Shared/Button';
import { useStateContext } from '../../Components/Contexts';
import sidebarThemes from '../../Components/Shared/Sidebar/sidebarTheme';

const AlumnoMenu = () => {
  const navigate = useNavigate();
  const { user, carrera } = useStateContext();
  const carreraId = carrera && carrera.id_carrera ? String(carrera.id_carrera) : null;
  let colorPrimario = '#1976d2';
  if (user && carreraId && sidebarThemes[carreraId] && sidebarThemes[carreraId].primary) {
    colorPrimario = sidebarThemes[carreraId].primary;
  }
  console.log('user:', user);
  console.log('carrera:', carrera);
  console.log('carreraId:', carreraId);
  console.log('sidebarThemes:', sidebarThemes);
  console.log('sidebarThemes[carreraId]:', sidebarThemes[carreraId]);
  console.log('colorPrimario:', colorPrimario);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('alumno');
    navigate('/login');
  };

  return (
    <>
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
            <Button
              text="Inscripción a Unidades Curriculares"
              colorPrimario={colorPrimario}
              onClick={() => navigate('inscripciones')}
            />
            <Button
              text="Perfil"
              colorPrimario={colorPrimario}
              onClick={() => navigate('profile')}
            />
            <Button
              text="Cerrar sesión"
              colorPrimario={sidebarThemes['2']?.primary || '#e53935'}
              onClick={handleLogout}
              classBtn={styles.menuBtn}
              style={{ marginTop: 32 }}
            />
          </div>
        </section>
      </main>
    </>
  );
};

export default AlumnoMenu;
