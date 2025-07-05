import React, { useState, useRef } from 'react';
import styles from './login.module.css';
import { Link, useNavigate } from 'react-router-dom';
import TextInput from '../../../Components/Shared/TextInput';
import Button from '../../../Components/Shared/Button';
import Modal from '../../../Components/Shared/Modal';
import Spinner from '../../../Components/Shared/Spinner';
import axiosClient from '../../../Components/Shared/Axios';
import { FaEyeSlash, FaEye } from 'react-icons/fa';
import { useStateContext, useModalContext } from '../../../Components/Contexts';

const AdminLogin = () => {
  const { openModal, modalState } = useModalContext();
  const { setUser, setTokenAndRole } = useStateContext();
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
    const payload = {
      email: emailRef.current.value,
      password: passwordRef.current.value
    };
    setIsLoading(true);
    setErrors({});
    try {
      const { data } = await axiosClient.post('/admin/login', payload);
      setUser(data.admin);
      setTokenAndRole(data.token, 'admin');
      openModal({
        description: 'Sesión de administrador iniciada correctamente',
        chooseModal: false
      });
      navigate('/admin/dashboard');
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const apiErrors = err.response;

        if (apiErrors.data.errors) {
          setErrors({
            email: apiErrors.data.errors.email?.[0],
            password: apiErrors.data.errors.password?.[0]
          });
        } else if (apiErrors.data.messageEmail) {
          setErrors({
            email: [apiErrors.data.messageEmail]
          });
        } else {
          setErrors({
            password: [apiErrors.data.messagePassword]
          });
        }
      } else if (err.response && err.response.status === 401) {
        setErrors({
          password: ['Credenciales incorrectas']
        });
      }
    }
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <Spinner />}
      {modalState.isOpen && modalState.chooseModal === false ? (
        <Modal />
      ) : modalState.isOpen && modalState.confirmModal === true ? (
        <Modal />
      ) : null}
      <main>
        <section className={styles.container}>
          <div className={styles.subContainer}>
            <div className={styles.headerContainer}>
              <h1 className={styles.title}>Panel de Administración</h1>
              <p className={styles.subtitle}>Inicia sesión como administrador</p>
            </div>
            <form className={styles.loginContainer}>
              <TextInput
                input={'input'}
                labelName={'E-mail'}
                placeholderText={'Escribe tu dirección de correo electrónico'}
                refrerence={emailRef}
                error={errors.email}
              />
              <div className={styles.passwordContainer}>
                <TextInput
                  labelName={'Contraseña'}
                  placeholderText={'Escribe tu contraseña'}
                  input={'input'}
                  refrerence={passwordRef}
                  error={errors.password}
                  inputType={showPassword ? 'text' : 'password'}
                />
                {showPassword ? (
                  <FaEye
                    className={styles.showPasswordIcon}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                ) : (
                  <FaEyeSlash
                    className={styles.showPasswordIcon}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                )}
              </div>
              <Link to="/login" className={styles.backToLogin}>
                <p>← Volver al login de alumnos</p>
              </Link>
              <div className={styles.btnContainer}>
                <Button type="submit" text="Iniciar Sesión" onClick={onSubmit} />
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
};

export default AdminLogin;