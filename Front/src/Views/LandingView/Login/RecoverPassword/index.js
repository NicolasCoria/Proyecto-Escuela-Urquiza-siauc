import React, { useRef, useState } from 'react';
import styles from './recoverPassword.module.css';
import Aside from '../../../../Components/Shared/Aside';
import TextInput from '../../../../Components/Shared/TextInput';
import Button from '../../../../Components/Shared/Button';
import Modal from '../../../../Components/Shared/Modal';
import Spinner from '../../../../Components/Shared/Spinner';
import axiosClient from '../../../../Components/Shared/Axios';
import { useModalContext, useStateContext } from '../../../../Components/Contexts';
import { useNavigate } from 'react-router';

function RecoverPassword() {
  const { modalState, openModal, closeModal } = useModalContext();
  const { setUser } = useStateContext();
  const navigate = useNavigate();
  const emailRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const payload = {
      email: emailRef.current.value
    };

    try {
      const { data } = await axiosClient.post('/password/forgot', payload);

      setUser(data.user);
      openModal({
        description: 'Email enviado correctamente',
        chooseModal: false
      });
      navigate('/');
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const apiErrors = err.response;
        if (apiErrors.data.errors) {
          setErrors({
            email: apiErrors.data.errors.email?.[0]
          });
        }
        if (apiErrors.data.messageVerification) {
          openModal({
            title: 'Advertencia',
            description: [apiErrors.data.messageVerification],
            confirmBtn: 'Aceptar',
            onClick: closeModal,
            noButton: false,
            confirmModal: true
          });
        }
      } else if (err.response && err.response.status === 404) {
        setErrors({
          email: [err.response.data.message]
        });
      } else {
        openModal({
          description: 'Se produjo un error al enviar el email ',
          chooseModal: false
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <Spinner />}
      <Aside page={'home'} />
      {modalState.isOpen && modalState.chooseModal === false ? (
        <Modal />
      ) : modalState.isOpen && modalState.confirmModal === true ? (
        <Modal />
      ) : null}
      <main>
        <section className={styles.container}>
          <div className={styles.subContainer}>
            <form className={styles.recoverContainer} onSubmit={onSubmit}>
              <TextInput
                password={'password'}
                labelName={'Recupera tu contraseña'}
                description={
                  'Por favor, escribe tu correo electrónico debajo para que puedas recuperar tu contraseña'
                }
                placeholderText={'Escribe tu dirección de correo electrónico'}
                refrerence={emailRef}
                error={errors.email}
              />
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

export default RecoverPassword;
