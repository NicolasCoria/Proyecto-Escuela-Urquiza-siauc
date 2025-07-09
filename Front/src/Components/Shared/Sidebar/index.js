import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './aside.module.css';
import { useStateContext } from '../../Contexts';
import axiosClient from '../Axios';
import { useModalContext } from '../../Contexts';
import Modal from '../Modal';
import Spinner from '../Spinner';
import sidebarThemes from './sidebarTheme';

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
      try {
        await axiosClient.post('/logout');
        setUser(null);
        setTokenAndRole(null, null);
        sessionStorage.removeItem('hasShownNotificationModal');
        navigate('/');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };
    openModal({
      title: 'Cerrar Sesión',
      description: '¿Está seguro que desea cerrar sesión?',
      confirmBtn: 'Aceptar',
      denyBtn: 'Cancelar',
      chooseModal: true,
      onClick: clickLogout
    });
    setIsLoading(false);
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
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className={activeButton === 'home' ? styles.activeBtn : styles.btn}
                style={{ color: theme.primary }}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/carreras"
                className={activeButton === 'carreras' ? styles.activeBtn : styles.btn}
                style={{ color: theme.primary }}
              >
                Carreras
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
                to={`/alumno/profile/${user.id}`}
                className={
                  activeButton === `alumno/profile/${user.id}` ? styles.activeBtn : styles.btn
                }
                style={
                  activeButton === `alumno/profile/${user.id}`
                    ? { backgroundColor: '#fff', color: theme.primary }
                    : { color: theme.primary }
                }
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.color = '#111';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor =
                    activeButton === `alumno/profile/${user.id}` ? '#fff' : 'transparent';
                  e.currentTarget.style.color =
                    activeButton === `alumno/profile/${user.id}` ? theme.primary : theme.primary;
                }}
              >
                Perfil
              </Link>
            </li>
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
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/alumno/materias"
                className={activeButton === 'alumno/materias' ? styles.activeBtn : styles.btn}
                style={
                  activeButton === 'alumno/materias'
                    ? { backgroundColor: theme.primary, color: '#fff' }
                    : { color: theme.primary }
                }
              >
                Materias
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
                Inscripción a UC
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
                Salir
              </a>
            </li>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
