import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './aside.module.css';
import { useStateContext } from '../../Contexts';
import axiosClient from '../Axios';
import { useModalContext } from '../../Contexts';
import Modal from '../Modal';
import Spinner from '../Spinner';

const Aside = ({ page }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { token, user, setUser, setTokenAndRole } = useStateContext();
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
        setUser({});
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

  return page === 'home' ? (
    sessionStorage.getItem('role') === 'DS' && token && user ? (
      <>
        {isLoading && <Spinner />}
        <Modal />
        <aside className={`${styles.aside} ${styles.asideDs}`}>
          <div className={styles.asideSubContainer}>
            <img src="/assets/images/logoDS.png" alt="logo-DS" className={styles.logo} />
            <div className={styles.title}>Escuela Superior de Comercio N°49</div>
            <div className={styles.menuButton} onClick={toggleMenu}>
              <div className={`${isOpen ? styles.x1 : styles.bar}`}></div>
              <div className={`${isOpen ? styles.x2 : styles.bar} `}></div>
              <div className={`${isOpen ? '' : styles.bar} `}></div>
            </div>
            <nav
              className={`${
                isOpen ? `${styles.activeMenu} ${styles.activeMenuStudents}` : styles.menu
              }`}
            >
              <ul className={styles.rutes}>
                <li>
                  <Link
                    to={`/alumno/profile/${user.id}`}
                    className={`${
                      activeButton === `alumno/profile/${user.id}` ? styles.activeBtn : styles.btn
                    }`}
                  >
                    Perfil
                  </Link>
                </li>
                <li>
                  <Link
                    to="/alumno"
                    className={`${activeButton === 'alumno' ? styles.activeBtn : styles.btn}`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/alumno/materias"
                    className={`${
                      activeButton === 'alumno/materias' ? styles.activeBtn : styles.btn
                    }`}
                  >
                    Materias
                  </Link>
                </li>
                <li>
                  <Link
                    to="/alumno/inscripciones"
                    className={`${
                      activeButton === 'alumno/inscripciones' ? styles.activeBtn : styles.btn
                    }`}
                  >
                    Inscripciones
                  </Link>
                </li>
              </ul>
              <div className={styles.logout}>
                <li>
                  <a
                    className={`${
                      activeButton === 'logout'
                        ? styles.activeBtn
                        : `${styles.btn} ${styles.btnLanding}`
                    }`}
                    onClick={onLogout}
                  >
                    Salir
                  </a>
                </li>
              </div>
            </nav>
          </div>
        </aside>
      </>
    ) : sessionStorage.getItem('role') === 'AF' && token ? (
      <>
        {isLoading && <Spinner />}
        <Modal />
        <aside className={`${styles.aside} ${styles.asideAf}`}>
          <div className={styles.asideSubContainer}>
            <img src="/assets/images/logoAF.png" alt="logo-AF" className={styles.logo} />
            <div className={styles.title}>Escuela Superior de Comercio N°49</div>
            <div className={styles.menuButton} onClick={toggleMenu}>
              <div className={`${isOpen ? styles.x1 : styles.bar}`}></div>
              <div className={`${isOpen ? styles.x2 : styles.bar} `}></div>
              <div className={`${isOpen ? '' : styles.bar} `}></div>
            </div>
            <nav
              className={`${
                isOpen ? `${styles.activeMenu} ${styles.activeMenuStudents}` : styles.menu
              }`}
            >
              <ul className={styles.rutes}>
                <li>
                  <Link
                    to={`/alumno/profile/${user.id}`}
                    className={`${
                      activeButton === `alumno/profile/${user.id}` ? styles.activeBtn : styles.btn
                    }`}
                  >
                    Perfil
                  </Link>
                </li>
                <li>
                  <Link
                    to="/alumno"
                    className={`${activeButton === 'alumno' ? styles.activeBtn : styles.btn}`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/alumno/materias"
                    className={`${
                      activeButton === 'alumno/materias' ? styles.activeBtn : styles.btn
                    }`}
                  >
                    Materias
                  </Link>
                </li>
                <li>
                  <Link
                    to="/alumno/inscripciones"
                    className={`${
                      activeButton === 'alumno/inscripciones' ? styles.activeBtn : styles.btn
                    }`}
                  >
                    Inscripciones
                  </Link>
                </li>
              </ul>
              <div className={styles.logout}>
                <li>
                  <a
                    className={`${
                      activeButton === 'logout'
                        ? styles.activeBtn
                        : `${styles.btn} ${styles.btnLanding}`
                    }`}
                    onClick={onLogout}
                  >
                    Salir
                  </a>
                </li>
              </div>
            </nav>
          </div>
        </aside>
      </>
    ) : sessionStorage.getItem('role') === 'ITI' && token ? (
      <>
        {isLoading && <Spinner />}
        <Modal />
        <aside className={`${styles.aside} ${styles.asideIti}`}>
          <div className={styles.asideSubContainer}>
            <img src="/assets/images/logoITI.png" alt="logo-ITI" className={styles.logo} />
            <div className={styles.title}>Escuela Superior de Comercio N°49</div>
            <div className={styles.menuButton} onClick={toggleMenu}>
              <div className={`${isOpen ? styles.x1 : styles.bar}`}></div>
              <div className={`${isOpen ? styles.x2 : styles.bar} `}></div>
              <div className={`${isOpen ? '' : styles.bar} `}></div>
            </div>
            <nav
              className={`${
                isOpen ? `${styles.activeMenu} ${styles.activeMenuStudents}` : styles.menu
              }`}
            >
              <ul className={styles.rutes}>
                <li>
                  <Link
                    to={`/alumno/profile/${user.id}`}
                    className={`${
                      activeButton === `alumno/profile/${user.id}` ? styles.activeBtn : styles.btn
                    }`}
                  >
                    Perfil
                  </Link>
                </li>
                <li>
                  <Link
                    to="/alumno"
                    className={`${activeButton === 'alumno' ? styles.activeBtn : styles.btn}`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/alumno/materias"
                    className={`${
                      activeButton === 'alumno/materias' ? styles.activeBtn : styles.btn
                    }`}
                  >
                    Materias
                  </Link>
                </li>
                <li>
                  <Link
                    to="/alumno/inscripciones"
                    className={`${
                      activeButton === 'alumno/inscripciones' ? styles.activeBtn : styles.btn
                    }`}
                  >
                    Inscripciones
                  </Link>
                </li>
              </ul>
              <div className={styles.logout}>
                <li>
                  <a
                    className={`${
                      activeButton === 'logout'
                        ? styles.activeBtn
                        : `${styles.btn} ${styles.btnLanding}`
                    }`}
                    onClick={onLogout}
                  >
                    Salir
                  </a>
                </li>
              </div>
            </nav>
          </div>
        </aside>
      </>
    ) : (
      <>
        <aside className={styles.aside}>
          <div className={styles.asideSubContainer}>
            <img
              src={`${process.env.PUBLIC_URL}/assets/images/logoLanding.png`}
              alt="logo-Landing"
              className={styles.logo}
            />
            <div className={`${styles.title} ${styles.titleLanding}`}>
              Escuela Superior de Comercio N°49
            </div>
            <div className={styles.menuButton} onClick={toggleMenu}>
              <div
                className={`${
                  isOpen ? `${styles.x1} ${styles.x1Landing}` : `${styles.bar} ${styles.barLanding}`
                }`}
              ></div>
              <div
                className={`${
                  isOpen ? `${styles.x2} ${styles.x2Landing}` : `${styles.bar} ${styles.barLanding}`
                } `}
              ></div>
              <div className={`${isOpen ? '' : `${styles.bar} ${styles.barLanding}`} `}></div>
            </div>
            {sessionStorage.getItem('role') === 'SA' && token ? (
              <>
                {isLoading && <Spinner />}
                <Modal />
                <nav
                  className={`${
                    isOpen ? `${styles.activeMenu} ${styles.activeMenuSAHome}` : styles.menu
                  }`}
                >
                  <ul className={styles.rutes}>
                    <li>
                      <Link
                        to="/super-admin/administracion"
                        className={`${
                          activeButton === 'super-admin/administracion'
                            ? styles.activeBtn
                            : `${styles.btn} ${styles.btnLanding}`
                        }`}
                      >
                        Administración
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/super-admin"
                        className={`${
                          activeButton === 'super-admin'
                            ? styles.activeBtn
                            : `${styles.btn} ${styles.btnLanding}`
                        }`}
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/super-admin/carreras"
                        className={`${
                          activeButton === 'super-admin/carreras'
                            ? styles.activeBtn
                            : `${styles.btn} ${styles.btnLanding}`
                        }`}
                      >
                        Carreras
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/super-admin/inscripciones"
                        className={`${
                          activeButton === 'super-admin/inscripciones'
                            ? styles.activeBtn
                            : `${styles.btn} ${styles.btnLanding}`
                        }`}
                      >
                        Inscripciones
                      </Link>
                    </li>
                  </ul>
                  <div className={styles.logout}>
                    <li>
                      <a
                        className={`${
                          activeButton === 'logout'
                            ? styles.activeBtn
                            : `${styles.btn} ${styles.btnLanding}`
                        }`}
                        onClick={onLogout}
                      >
                        Salir
                      </a>
                    </li>
                  </div>
                </nav>
              </>
            ) : (
              <>
                <nav className={`${isOpen ? styles.activeMenu : styles.menu}`}>
                  <ul className={styles.rutes}>
                    <li>
                      <Link
                        to="/login"
                        className={`${
                          activeButton === 'login' || activeButton === 'recover-password'
                            ? styles.activeBtn
                            : `${styles.btn} ${styles.btnLanding}`
                        }`}
                      >
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/"
                        className={`${
                          activeButton === 'home'
                            ? styles.activeBtn
                            : `${styles.btn} ${styles.btnLanding}`
                        }`}
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/carreras"
                        className={`${
                          activeButton === 'carreras'
                            ? styles.activeBtn
                            : `${styles.btn} ${styles.btnLanding}`
                        }`}
                      >
                        Carreras
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/inscripciones"
                        className={`${
                          activeButton === 'inscripciones'
                            ? styles.activeBtn
                            : `${styles.btn} ${styles.btnLanding}`
                        }`}
                      >
                        Inscripciones
                      </Link>
                    </li>
                  </ul>
                </nav>
              </>
            )}
          </div>
        </aside>
      </>
    )
  ) : page === 'super-admin' && token ? (
    <>
      {isLoading && <Spinner />}
      <Modal />
      <aside className={styles.aside}>
        <div className={styles.asideSubContainer}>
          <img
            src={`${process.env.PUBLIC_URL}/assets/images/logoLanding.png`}
            alt="logo-Landing"
            className={styles.logo}
          />
          <div className={`${styles.title} ${styles.titleLanding}`}>
            Escuela Superior de Comercio N°49
          </div>
          <div className={styles.menuButton} onClick={toggleMenu}>
            <div
              className={`${
                isOpen ? `${styles.x1} ${styles.x1Landing}` : `${styles.bar} ${styles.barLanding}`
              }`}
            ></div>
            <div
              className={`${
                isOpen ? `${styles.x2} ${styles.x2Landing}` : `${styles.bar} ${styles.barLanding}`
              } `}
            ></div>
            <div className={`${isOpen ? '' : `${styles.bar} ${styles.barLanding}`} `}></div>
          </div>
          <nav
            className={`${isOpen ? `${styles.activeMenu} ${styles.activeMenuSA}` : styles.menu}`}
          >
            <ul className={styles.ruteSAdmin}>
              <li>
                <Link to="/super-admin" className={`${styles.btn} ${styles.btnLanding}`}>
                  Home
                </Link>
              </li>
              <li>
                <a className={`${styles.btn} ${styles.btnLanding}`} onClick={onLogout}>
                  Salir
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  ) : null;
};

export default Aside;
