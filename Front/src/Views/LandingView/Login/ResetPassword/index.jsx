import React, { useEffect, useRef, useState } from 'react';
import styles from './resetPassword.module.css';
import TextInput from '../../../../Components/Shared/TextInput';
import Button from '../../../../Components/Shared/Button';
import Modal from '../../../../Components/Shared/Modal';
import Spinner from '../../../../Components/Shared/Spinner';
import { FaEyeSlash, FaEye } from 'react-icons/fa';
import axiosClient from '../../../../Components/Shared/Axios';
import { useModalContext, useStateContext } from '../../../../Components/Contexts';
import { useNavigate, useParams } from 'react-router';

function ResetPassword() {
  const { token } = useParams();
  const { modalState, openModal, closeModal } = useModalContext();
  const { setUser } = useStateContext();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [errors, setErrors] = useState({});

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const payload = {
      token,
      password: passwordRef.current.value,
      confirm_password: confirmPasswordRef.current.value
    };
    try {
      const { data } = await axiosClient.post(`/password/reset`, payload);
      setUser(data.user);
      openModal({
        description: 'Contraseña restablecida correctamente',
        chooseModal: false
      });
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const apiErrors = err.response;
        if (apiErrors.data.errors) {
          setErrors({
            password: apiErrors.data.errors.password?.[0],
            confirm_password: apiErrors.data.errors.confirm_password?.[0]
          });
        }
      }
      openModal({
        description: 'Se produjo un error',
        chooseModal: false
      });
    }
    setIsLoading(false);
  };

  const verifyToken = async () => {
    try {
      const response = await axiosClient.get(`/verify-token/${token}`);
      if (response.status === 200) {
        setIsValidToken(true);
      }
    } catch (err) {
      setIsValidToken(false);
      if (err.response.status === 404) {
        openModal({
          title: 'Advertencia',
          description:
            'Email de restablecimiento ya utilizado. Por favor, vuelva a enviar la solicitud. \nRedirigiendo...',
          confirmModal: true,
          noButton: true
        }) ||
          (setTimeout(() => {
            setIsLoading(true);
          }, 3500) &&
            setTimeout(() => {
              closeModal();
              navigate('/recover-password');
            }, 7000));
      } else {
        openModal({
          title: 'Error',
          description: 'Hubo un error al verificar el token.',
          confirmBtn: 'Aceptar',
          onClick: () => {
            closeModal();
            navigate('/recover-password');
          },
          confirmModal: true
        });
      }
    }
  };

  useEffect(() => {
    verifyToken();
  }, [token]);

  return (
    <>
      {isValidToken}
      {isLoading && <Spinner />}
      {modalState.isOpen && modalState.chooseModal === false ? (
        <Modal />
      ) : modalState.isOpen && modalState.confirmModal === true ? (
        <Modal />
      ) : null}
      <main>
        <section className={styles.container}>
          <div className={styles.subContainer}>
            <form className={styles.recoverContainer} onSubmit={onSubmit}>
              <div className={styles.passwordContainer}>
                <TextInput
                  labelName={'Restablecer contraseña'}
                  placeholderText={'Escribe la nueva contraseña'}
                  description={'Por favor, escribe debajo la nueva contraseña'}
                  password={'password'}
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

              <div className={styles.passwordContainer}>
                <TextInput
                  placeholderText={'Repite la nueva contraseña'}
                  description={'Repite la nueva contraseña'}
                  password={'password'}
                  refrerence={confirmPasswordRef}
                  error={errors.confirm_password}
                  inputType={showPassword2 ? 'text' : 'password'}
                />
                {showPassword2 ? (
                  <FaEye
                    className={styles.showPasswordIcon2}
                    onClick={() => setShowPassword2(!showPassword2)}
                  />
                ) : (
                  <FaEyeSlash
                    className={styles.showPasswordIcon2}
                    onClick={() => setShowPassword2(!showPassword2)}
                  />
                )}
              </div>
              <div className={styles.btnContainer}>
                <Button type="submit" text="Enviar" />
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}

export default ResetPassword;
