import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import styles from './adminLayout.module.css';
import { useStateContext } from '../../Contexts';
import { useModalContext } from '../../Contexts';
import Modal from '../Modal';
import Spinner from '../Spinner';
import axiosClient from '../Axios';
import {
  FaChartBar,
  FaSignOutAlt,
  FaUser,
  FaEnvelopeOpenText,
  FaPoll,
  FaCalendarAlt,
  FaEnvelope
} from 'react-icons/fa';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { user, setUser, setTokenAndRole, token, role, clearAllSession } = useStateContext();
  const { openModal } = useModalContext();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const onLogout = (e) => {
    e.preventDefault();
    const clickLogout = async () => {
      setIsLoading(true);
      // Limpiar sesión completamente
      clearAllSession();
      // Navegar inmediatamente
      navigate('/admin/login');
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

  React.useEffect(() => {
    const currentPath = location.pathname;
    setActiveButton(currentPath);
  }, [location]);

  // Verificar autenticación al cargar (optimizado)
  React.useEffect(() => {
    const checkAuth = async () => {
      // Si no hay token o rol incorrecto, redirigir
      if (!token || role !== 'admin') {
        navigate('/admin/login');
        return;
      }

      // Si ya tenemos usuario, no hacer nada más
      if (user) {
        setIsInitializing(false);
        return;
      }

      // Solo hacer llamada API si no hay usuario
      try {
        const response = await axiosClient.get('/admin/info');
        if (response.data.success) {
          setUser(response.data.admin);
        } else {
          setUser(null);
          setTokenAndRole(null, null);
          localStorage.clear();
          navigate('/admin/login');
        }
      } catch (error) {
        console.error('Error getting admin info:', error.response?.data || error.message);
        setUser(null);
        setTokenAndRole(null, null);
        localStorage.clear();
        navigate('/admin/login');
      }

      setIsInitializing(false);
    };

    // Solo ejecutar si realmente es necesario
    if (isInitializing) {
      checkAuth();
    }
  }, [token, role, user, navigate, setUser, setTokenAndRole, isInitializing]);

  // Mostrar spinner mientras se inicializa
  if (isInitializing) {
    return <Spinner />;
  }

  return (
    <>
      {isLoading && <Spinner />}
      <Modal />
      <div className={styles.adminLayout}>
        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <img src="/assets/images/logoTS.png" alt="logo-admin" className={styles.logo} />
            <div className={styles.titleContainer}>
              <div className={styles.title}>Admin Dashboard</div>
              <div className={styles.subtitle}>Escuela Urquiza</div>
            </div>
          </div>

          {/* Botón hamburguesa para móvil */}
          <div className={styles.menuButton} onClick={toggleMenu}>
            <div className={isOpen ? styles.x1 : styles.bar}></div>
            <div className={isOpen ? styles.x2 : styles.bar}></div>
            <div className={isOpen ? '' : styles.bar}></div>
          </div>

          {/* Navegación */}
          <nav className={styles.navigation}>
            <ul className={styles.navList}>
              <li>
                <Link
                  to="/admin/dashboard"
                  className={`${styles.navItem} ${
                    activeButton === '/admin/dashboard' ? styles.active : ''
                  }`}
                >
                  <FaPoll className={styles.navIcon} />
                  <span>Encuestas</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/informes"
                  className={`${styles.navItem} ${
                    activeButton === '/admin/informes' ? styles.active : ''
                  }`}
                >
                  <FaChartBar className={styles.navIcon} />
                  <span>Generar Informes</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/solicitudes"
                  className={`${styles.navItem} ${
                    activeButton === '/admin/solicitudes' ? styles.active : ''
                  }`}
                >
                  <FaEnvelopeOpenText className={styles.navIcon} />
                  <span>Solicitudes</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/comunicaciones"
                  className={`${styles.navItem} ${
                    activeButton === '/admin/comunicaciones' ? styles.active : ''
                  }`}
                >
                  <FaEnvelope className={styles.navIcon} />
                  <span>Comunicaciones</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/periodos-inscripcion"
                  className={`${styles.navItem} ${
                    activeButton === '/admin/periodos-inscripcion' ? styles.active : ''
                  }`}
                >
                  <FaCalendarAlt className={styles.navIcon} />
                  <span>Períodos de Inscripción</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/faqs"
                  className={`${styles.navItem} ${
                    activeButton === '/admin/faqs' ? styles.active : ''
                  }`}
                >
                  <FaPoll className={styles.navIcon} />
                  <span>Preguntas frecuentes</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/profile"
                  className={`${styles.navItem} ${
                    activeButton === '/admin/profile' ? styles.active : ''
                  }`}
                >
                  <FaUser className={styles.navIcon} />
                  <span>Mi Perfil</span>
                </Link>
              </li>
            </ul>

            {/* Información del usuario */}
            <div className={styles.userInfo}>
              <div className={styles.userName}>
                {user?.nombre} {user?.apellido}
              </div>
              <div className={styles.userRole}>Administrador</div>
            </div>

            {/* Botón de logout */}
            <div className={styles.logoutSection}>
              <button className={styles.logoutBtn} onClick={onLogout}>
                <FaSignOutAlt className={styles.logoutIcon} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default AdminLayout;
