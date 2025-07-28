import React, { useState, useRef } from 'react';
import styles from './login.module.css';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../../../Components/Shared/Modal';
import Spinner from '../../../Components/Shared/Spinner';
import axiosClient from '../../../Components/Shared/Axios';
import { FaEyeSlash, FaEye } from 'react-icons/fa';
import { useStateContext, useModalContext } from '../../../Components/Contexts';

const Login = () => {
  const { openModal, modalState } = useModalContext();
  const {
    setUser,
    setTokenAndRole,
    setCarrera,
    setUnidadesDisponibles,
    setUnidadesCarrera,
    setUnidadesAprobadas,
    setUnidadesInscriptas
  } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();
  const [errors, setErrors] = useState({
    email: null,
    password: null
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validación rápida del lado del cliente
    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value;

    if (!email || !password) {
      setErrors({
        email: !email ? 'El email es requerido' : null,
        password: !password ? 'La contraseña es requerida' : null
      });
      return;
    }

    // Validar que el email termine con el dominio educativo
    if (!email.endsWith('@terciariourquiza.edu.ar')) {
      setErrors({
        email: 'El email debe ser de dominio educativo (@terciariourquiza.edu.ar)',
        password: null
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { data } = await axiosClient.post('/alumnos/login', {
        email,
        password
      });

      // Configurar sesión inmediatamente
      setUser(data.alumno);
      setTokenAndRole(data.token, 'alumno');
      setCarrera(data.carrera);
      setUnidadesDisponibles(data.unidades_disponibles);

      // Ocultar spinner inmediatamente
      setIsLoading(false);

      // Navegar inmediatamente
      navigate('/alumno');

      // Precargar UC de carrera, aprobadas e inscriptas en background
      Promise.all([
        axiosClient.get('/alumno/unidades-carrera'),
        axiosClient.get('/alumno/unidades-aprobadas'),
        axiosClient.get('/alumno/unidades-inscriptas'),
        axiosClient.get('/alumno/unidades-disponibles-optimized')
      ])
        .then(([ucCarrera, ucAprobadas, ucInscriptas, ucDisponibles]) => {
          setUnidadesCarrera(ucCarrera.data);
          setUnidadesAprobadas(ucAprobadas.data);
          setUnidadesInscriptas(ucInscriptas.data);
          setUnidadesDisponibles(ucDisponibles.data.unidades_disponibles || []);
        })
        .catch((err) => {
          console.error('Error cargando datos adicionales:', err);
        });

      // Mostrar modal de éxito después de un breve delay
      setTimeout(() => {
        openModal({
          description: 'Sesión iniciada correctamente',
          chooseModal: false
        });
      }, 500);
    } catch (err) {
      console.error('Login error:', err);

      if (err.response?.status === 401) {
        setErrors({
          password: 'Credenciales incorrectas'
        });
      } else if (err.response?.status === 422) {
        // Manejar errores de validación específicos del backend
        if (err.response.data.error && err.response.data.field === 'email') {
          setErrors({
            email: err.response.data.error,
            password: null
          });
        } else {
          const apiErrors = err.response.data.errors || {};
          setErrors({
            email: apiErrors.email?.[0] || null,
            password: apiErrors.password?.[0] || null
          });
        }
      } else {
        setErrors({
          password: 'Error de conexión. Intente nuevamente.'
        });
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Spinner />}
      {modalState.isOpen && modalState.chooseModal === false ? (
        <Modal />
      ) : modalState.isOpen && modalState.confirmModal === true ? (
        <Modal />
      ) : null}

      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1 className={styles.loginTitle}>Iniciar Sesión</h1>
            <p className={styles.loginSubtitle}>Accede a tu cuenta para continuar</p>
          </div>

          <form onSubmit={onSubmit} className={styles.formSection}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Correo Electrónico</label>
              <input
                type="email"
                className={`${styles.inputField} ${errors.email ? styles.error : ''}`}
                placeholder="Escribe tu dirección de correo electrónico"
                ref={emailRef}
                required
              />
              {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Contraseña</label>
              <div className={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.passwordInput} ${errors.password ? styles.error : ''}`}
                  placeholder="Escribe tu contraseña"
                  ref={passwordRef}
                  required
                />
                <button
                  type="button"
                  className={styles.showPasswordIcon}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}
            </div>

            <div className={styles.linksSection}>
              <Link to="/signup" className={styles.link}>
                ¿No tenés una cuenta? Registrate
              </Link>
              <Link to="/recover-password" className={styles.link}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading && <span className={styles.loadingSpinner}></span>}
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
