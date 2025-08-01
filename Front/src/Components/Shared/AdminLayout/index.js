import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import styles from './adminLayout.module.css';
import { useStateContext } from '../../Contexts';
import { useModalContext } from '../../Contexts';
import Modal from '../Modal';
import Spinner from '../Spinner';
import axiosClient from '../Axios';
import { FaChartBar, FaSignOutAlt, FaUser, FaEnvelopeOpenText, FaPoll } from 'react-icons/fa';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { user, setUser, setTokenAndRole, token, role } = useStateContext();
  const { openModal } = useModalContext();

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

  // Verificar autenticación al cargar
  React.useEffect(() => {
    const checkAuth = async () => {
      console.log('AdminLayout - Checking auth:', { token, role, user });

      if (!token || role !== 'admin') {
        console.log('AdminLayout - No token or wrong role, redirecting to login');
        navigate('/admin/login');
        return;
      }

      // Si hay token pero no hay usuario, intentar obtener la información del usuario
      if (token && !user) {
        console.log('AdminLayout - Token exists but no user, fetching admin info');
        try {
          const response = await axiosClient.get('/admin/info');
          if (response.data.success) {
            console.log('AdminLayout - Admin info fetched successfully');
            setUser(response.data.admin);
          } else {
            console.log('AdminLayout - Failed to get admin info, clearing session');
            setUser(null);
            setTokenAndRole(null, null);
            navigate('/admin/login');
          }
        } catch (error) {
          console.error('AdminLayout - Error getting admin info:', error);
          setUser(null);
          setTokenAndRole(null, null);
          navigate('/admin/login');
        }
      } else {
        console.log('AdminLayout - User already exists, proceeding');
      }

      setIsInitializing(false);
    };

    checkAuth();
  }, [token, role, user, navigate, setUser, setTokenAndRole]);

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
