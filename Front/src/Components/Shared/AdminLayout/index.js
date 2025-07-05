import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import styles from './adminLayout.module.css';
import { useStateContext } from '../../Contexts';
import { useModalContext } from '../../Contexts';
import Modal from '../Modal';
import Spinner from '../Spinner';
import axiosClient from '../Axios';
import { FaChartBar, FaSignOutAlt, FaHome, FaUser } from 'react-icons/fa';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser, setTokenAndRole } = useStateContext();
  const { openModal } = useModalContext();

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
        navigate('/admin/login');
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

  React.useEffect(() => {
    const currentPath = location.pathname;
    setActiveButton(currentPath);
  }, [location]);

  return (
    <>
      {isLoading && <Spinner />}
      <Modal />
      <div className={styles.adminLayout}>
        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <img src="/assets/images/logoTS.png" alt="logo-admin" className={styles.logo} />
            <div className={styles.title}>Panel Administrativo</div>
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
                  <FaHome className={styles.navIcon} />
                  <span>Dashboard</span>
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