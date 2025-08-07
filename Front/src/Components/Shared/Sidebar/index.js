import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './aside.module.css';
import { useStateContext } from '../../Contexts';
import axiosClient from '../Axios';
import { useModalContext } from '../../Contexts';
import Modal from '../Modal';
import Spinner from '../Spinner';
import sidebarThemes from './sidebarTheme';
import {
  FaUser,
  FaEdit,
  FaGraduationCap,
  FaChartBar,
  FaClipboardList,
  FaQuestionCircle,
  FaSignOutAlt,
  FaSignInAlt,
  FaHome,
  FaGraduationCap as FaCarreras,
  FaEnvelope
} from 'react-icons/fa';

const getTheme = (user, carrera) => {
  if (!user) return sidebarThemes.guest;
  const carreraId = carrera?.id || carrera?.id_carrera;
  if (carreraId) return sidebarThemes[carreraId] || sidebarThemes.guest;
  return sidebarThemes.guest;
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser, setTokenAndRole, carrera } = useStateContext();
  const { openModal } = useModalContext();
  const theme = getTheme(user, carrera);

  // Logo por id de carrera
  let logoSrc = '/assets/images/logoTS.png';
  let logoAlt = 'logo-TS';
  const carreraId = carrera?.id || carrera?.id_carrera;
  if (user && carreraId) {
    if (carreraId === 2) {
      logoSrc = '/assets/images/logoDS.png';
      logoAlt = 'logo-DS';
    } else if (carreraId === 3) {
      logoSrc = '/assets/images/logoITI.png';
      logoAlt = 'logo-ITI';
    } else if (carreraId === 1) {
      logoSrc = '/assets/images/logoAF.png';
      logoAlt = 'logo-AF';
    }
  }

  // DEBUG LOGS
  console.log('Sidebar DEBUG -> user:', user);
  console.log('Sidebar DEBUG -> carrera:', carrera);
  console.log('Sidebar DEBUG -> theme:', theme);
  console.log('Sidebar DEBUG -> logoSrc:', logoSrc);
  console.log('Sidebar DEBUG -> logoAlt:', logoAlt);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const onLogout = (e) => {
    e.preventDefault();
    const clickLogout = async () => {
      setIsLoading(true);

      // Limpiar sesión inmediatamente para mejor UX
      setUser(null);
      setTokenAndRole(null, null);
      sessionStorage.removeItem('hasShownNotificationModal');

      // Navegar inmediatamente
      navigate('/');

      // Hacer logout en el backend en background (sin esperar)
      try {
        await axiosClient.post('/logout');
      } catch (error) {
        console.error('Logout backend failed:', error);
        // No importa si falla, ya limpiamos la sesión local
      }

      setIsLoading(false);
    };

    openModal({
      title: 'Cerrar Sesión',
      description: '¿Está seguro que desea cerrar sesión?',
      confirmBtn: 'Aceptar',
      denyBtn: 'Cancelar',
      chooseModal: true,
      onClick: clickLogout
    });
  };

  useEffect(() => {
    const currentPath = location.pathname === '/' ? 'home' : location.pathname.substring(1);
    setActiveButton(currentPath);
  }, [location]);

  // Opciones para invitado
  if (!user) {
    return (
      <aside className={styles.sidebarBase} style={{ background: theme.background }}>
        <img
          src={logoSrc}
          alt={logoAlt}
          className={styles.logo}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        <div className={styles.title}>Escuela Superior de Comercio N°49</div>
        <nav className={styles.menu}>
          <ul className={styles.rutes}>
            <li>
              <Link
                to="/login"
                className={activeButton === 'login' ? styles.activeBtn : styles.btn}
                style={{ color: theme.primary }}
              >
                <FaSignInAlt className={styles.icon} />
                <span>Login</span>
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className={activeButton === 'home' ? styles.activeBtn : styles.btn}
                style={{ color: theme.primary }}
              >
                <FaHome className={styles.icon} />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/carreras"
                className={activeButton === 'carreras' ? styles.activeBtn : styles.btn}
                style={{ color: theme.primary }}
              >
                <FaCarreras className={styles.icon} />
                <span>Carreras</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    );
  }

  // Opciones para alumno logueado
  return (
    <>
      {isLoading && <Spinner />}
      <Modal />
      <aside className={styles.sidebarBase} style={{ background: theme.background }}>
        <img
          src={logoSrc}
          alt={logoAlt}
          className={styles.logo}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        <div className={styles.title}>Escuela Superior de Comercio N°49</div>
        <div className={styles.menuButton} onClick={toggleMenu}>
          <div className={isOpen ? styles.x1 : styles.bar}></div>
          <div className={isOpen ? styles.x2 : styles.bar}></div>
          <div className={isOpen ? '' : styles.bar}></div>
        </div>
        <nav className={isOpen ? `${styles.activeMenu} ${styles.activeMenuStudents}` : styles.menu}>
          <ul className={styles.rutes}>
            <li>
              <Link
                to="/alumno"
                className={activeButton === 'alumno' ? styles.activeBtn : styles.btn}
                style={
                  activeButton === 'alumno'
                    ? { backgroundColor: theme.primary, color: '#fff' }
                    : { color: theme.primary }
                }
              >
                <FaUser className={styles.icon} />
                <span>Perfil</span>
              </Link>
            </li>
            <li>
              <Link
                to="/alumno/inscripciones"
                className={activeButton === 'alumno/inscripciones' ? styles.activeBtn : styles.btn}
                style={
                  activeButton === 'alumno/inscripciones'
                    ? { backgroundColor: theme.primary, color: '#fff' }
                    : { color: theme.primary }
                }
              >
                <FaEdit className={styles.icon} />
                <span>Inscripción a UC</span>
              </Link>
            </li>
            <li>
              <Link
                to="/alumno/plan-estudio"
                className={activeButton === 'alumno/plan-estudio' ? styles.activeBtn : styles.btn}
                style={
                  activeButton === 'alumno/plan-estudio'
                    ? { backgroundColor: theme.primary, color: '#fff' }
                    : { color: theme.primary }
                }
              >
                <FaGraduationCap className={styles.icon} />
                <span>Plan de Estudios</span>
              </Link>
            </li>
            <li>
              <Link
                to="/alumno/comunicaciones"
                className={activeButton === 'alumno/comunicaciones' ? styles.activeBtn : styles.btn}
                style={
                  activeButton === 'alumno/comunicaciones'
                    ? { backgroundColor: theme.primary, color: '#fff' }
                    : { color: theme.primary }
                }
              >
                <FaEnvelope className={styles.icon} />
                <span>Comunicaciones</span>
              </Link>
            </li>
            <li>
              <Link
                to="/alumno/encuestas"
                className={activeButton === 'alumno/encuestas' ? styles.activeBtn : styles.btn}
                style={
                  activeButton === 'alumno/encuestas'
                    ? { backgroundColor: theme.primary, color: '#fff' }
                    : { color: theme.primary }
                }
              >
                <FaChartBar className={styles.icon} />
                <span>Encuestas Académicas</span>
              </Link>
            </li>
            <li>
              <Link
                to="/alumno/solicitudes"
                className={activeButton === 'alumno/solicitudes' ? styles.activeBtn : styles.btn}
                style={
                  activeButton === 'alumno/solicitudes'
                    ? { backgroundColor: theme.primary, color: '#fff' }
                    : { color: theme.primary }
                }
              >
                <FaClipboardList className={styles.icon} />
                <span>Solicitudes</span>
              </Link>
            </li>
            <li>
              <Link
                to="/alumno/faqs"
                className={activeButton === 'alumno/faqs' ? styles.activeBtn : styles.btn}
                style={
                  activeButton === 'alumno/faqs'
                    ? { backgroundColor: theme.primary, color: '#fff' }
                    : { color: theme.primary }
                }
              >
                <FaQuestionCircle className={styles.icon} />
                <span>FAQs</span>
              </Link>
            </li>
          </ul>
          <div className={styles.logout}>
            <li>
              <a
                className={
                  activeButton === 'logout'
                    ? styles.activeBtn
                    : `${styles.btn} ${styles.btnLanding}`
                }
                onClick={onLogout}
                style={
                  activeButton === 'logout'
                    ? { backgroundColor: theme.primary, color: '#fff' }
                    : { color: theme.primary }
                }
              >
                <FaSignOutAlt className={styles.icon} />
                <span>Salir</span>
              </a>
            </li>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
