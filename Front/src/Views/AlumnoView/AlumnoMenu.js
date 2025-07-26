import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStateContext } from '../../Components/Contexts';
import sidebarThemes from '../../Components/Shared/Sidebar/sidebarTheme';
import NotificacionesEncuestas from './NotificacionesEncuestas';
import styles from './alumnoMenu.module.css';

const AlumnoMenu = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, carrera } = useStateContext();
  const carreraId = carrera && carrera.id_carrera ? String(carrera.id_carrera) : null;

  let colorPrimario = '#1976d2';
  if (user && carreraId && sidebarThemes[carreraId] && sidebarThemes[carreraId].primary) {
    colorPrimario = sidebarThemes[carreraId].primary;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('alumno');
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Close menu on mobile after navigation
    if (onClose) {
      onClose();
    }
  };

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <>
      <NotificacionesEncuestas />
      <div className={styles.menuContainer}>
        <div className={styles.menuHeader}>
          <h1 className={styles.menuTitle}>Menú Principal Alumno</h1>
        </div>

        <div className={styles.menuContent}>
          <button
            className={`${styles.menuButton} ${isActive('inscripciones') ? styles.active : ''}`}
            onClick={() => handleNavigation('inscripciones')}
            style={{ backgroundColor: isActive('inscripciones') ? colorPrimario : undefined }}
          >
            📚 Inscripción a Unidades Curriculares
          </button>

          <button
            className={`${styles.menuButton} ${isActive('profile') ? styles.active : ''}`}
            onClick={() => handleNavigation('profile')}
            style={{ backgroundColor: isActive('profile') ? colorPrimario : undefined }}
          >
            👤 Perfil
          </button>

          <button
            className={`${styles.menuButton} ${isActive('encuestas') ? styles.active : ''}`}
            onClick={() => handleNavigation('encuestas')}
            style={{ backgroundColor: isActive('encuestas') ? colorPrimario : undefined }}
          >
            📊 Encuestas Académicas
          </button>

          <button
            className={`${styles.menuButton} ${isActive('solicitudes') ? styles.active : ''}`}
            onClick={() => handleNavigation('solicitudes')}
            style={{ backgroundColor: isActive('solicitudes') ? colorPrimario : undefined }}
          >
            📝 Solicitudes
          </button>

          <button
            className={`${styles.menuButton} ${isActive('faqs') ? styles.active : ''}`}
            onClick={() => handleNavigation('faqs')}
            style={{ backgroundColor: isActive('faqs') ? colorPrimario : undefined }}
          >
            ❓ Preguntas frecuentes
          </button>

          <button className={styles.logoutButton} onClick={handleLogout}>
            🚪 Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
};

export default AlumnoMenu;
