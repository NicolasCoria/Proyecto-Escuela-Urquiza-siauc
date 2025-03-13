import React, { useRef, useState } from 'react';
import styles from './signUp.module.css';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../Components/Shared/Axios';
import Aside from '../../../Components/Shared/Aside';
import TextInput from '../../../Components/Shared/TextInput';
import Button from '../../../Components/Shared/Button';
import { FaEyeSlash, FaEye } from 'react-icons/fa';
import Modal from '../../../Components/Shared/Modal';
import Spinner from '../../../Components/Shared/Spinner';
import { FiEdit } from 'react-icons/fi';
import { useStateContext, useModalContext } from '../../../Components/Contexts';

const SignUp = () => {
  const { openModal } = useModalContext();
  const { setUser } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const careerRef = useRef();
  const dniRef = useRef();
  const photoRef = useRef();
  const [errors, setErrors] = useState({
    name: null,
    dni: null,
    email: null,
    password: null,
    career: null
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    const payload = new FormData();
    payload.append('name', nameRef.current.value);
    payload.append('dni', dniRef.current.value);
    payload.append('email', emailRef.current.value);
    payload.append('password', passwordRef.current.value);
    payload.append('career', careerRef.current.value);
    payload.append('profile_photo', file);

    const handleRegistration = async () => {
      setIsLoading(true);
      setErrors({});
      try {
        const { data } = await axiosClient.post('/signup', payload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setUser(data.user);
        openModal({
          description: 'Usuario registrado correctamente',
          chooseModal: false
        });
        navigate('/');
      } catch (err) {
        if (err.response && err.response.status === 422) {
          const { errors: apiErrors } = err.response.data;

          setErrors({
            name: apiErrors.name?.[0] || null,
            dni: apiErrors.dni?.[0] || null,
            email: apiErrors.email?.[0] || null,
            password: apiErrors.password?.[0] || null,
            career:
              payload.career === ''
                ? 'Seleccione una carrera válida'
                : apiErrors.career?.[0] || null
          });
        }
        openModal({
          description: 'Se produjo un error en el registro',
          chooseModal: false
        });
      }
      setIsLoading(false);
    };

    if (!file) {
      openModal({
        title: 'Advertencia',
        description: '¿Está seguro que no quiere agregar una foto de perfil?',
        confirmBtn: 'Aceptar',
        denyBtn: 'Cancelar',
        chooseModal: true,
        onClick: handleRegistration
      });
    } else {
      handleRegistration();
    }
  };

  const handleUploadButtonClick = () => {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const imgElement = document.getElementById('profilePhoto');

    if (file && imgElement) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imgElement.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      openModal({
        title: 'advertencia',
        description: '¿Está seguro que No quiero agregar una foto de perfil?',
        confirmBtn: 'Aceptar',
        denyBtn: 'Cancelar',
        chooseModal: true,
        onClick: () => {
          onSubmit(e);
        }
      });
      if (imgElement) {
        imgElement.src = `${process.env.PUBLIC_URL}/assets/images/defaultProfile.png`;
      }
    }
  };

  return (
    <>
      {isLoading && <Spinner />}
      <Aside page={'home'} />
      <Modal />
      <main>
        <section className={styles.container}>
          <div className={styles.subContainer}>
            <form className={styles.loginContainer} onSubmit={onSubmit}>
              <div className={styles.loginSubContainer}>
                <div className={styles.photoContainer}>
                  <div className={styles.photoContainer}>
                    <input
                      id="fileInput"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                      ref={photoRef}
                    />
                    <span className={styles.profileHover} onClick={handleUploadButtonClick}>
                      <FiEdit />
                    </span>
                    <img
                      id="profilePhoto"
                      src={
                        photoRef?.profile_photo ||
                        `${process.env.PUBLIC_URL}/assets/images/defaultProfile.png`
                      }
                      className={styles.profilePhoto}
                    />
                  </div>
                </div>
                <TextInput
                  input={'input'}
                  refrerence={nameRef}
                  labelName={'Nombre/Apellido'}
                  placeholderText={'Escribe tu nombre y apellido'}
                  error={errors.name}
                />
                <TextInput
                  input={'input'}
                  refrerence={dniRef}
                  labelName={'DNI'}
                  placeholderText={'Escribe tu DNI'}
                  error={errors.dni}
                />
              </div>
              <div className={styles.loginSubContainer2}>
                <TextInput
                  nameSelect={'career'}
                  labelName={'Carreras'}
                  refrerence={careerRef}
                  error={errors.career}
                >
                  <option hidden value={''}>
                    Seleccione una carrera
                  </option>
                  <option value={'AF'}>Analista Funcional</option>
                  <option value={'DS'}>Desarrollo de Software</option>
                  <option value={'ITI'}>Tecnologías de la Información</option>
                </TextInput>
                <TextInput
                  input={'input'}
                  labelName={'E-mail'}
                  refrerence={emailRef}
                  placeholderText={'Escribe tu dirección de correo electrónico'}
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
                <div className={styles.btnContainer}>
                  <Button type="submit" text="Enviar" />
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
};

export default SignUp;
