import React, { useRef, useState, useEffect } from 'react';
import styles from './signUp.module.css';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../Components/Shared/Axios';
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
  const nombreRef = useRef();
  const apellidoRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const careerRef = useRef();
  const dniRef = useRef();
  const photoRef = useRef();
  const [errors, setErrors] = useState({
    nombre: null,
    apellido: null,
    dni: null,
    email: null,
    password: null,
    career: null
  });
  const [carreras, setCarreras] = useState([]);

  // Obtener las carreras desde la base de datos
  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        const res = await axiosClient.get('/carreras');
        if (res.data.success) {
          setCarreras(res.data.carreras);
        }
      } catch (err) {
        console.error('Error al obtener las carreras:', err);
      }
    };
    fetchCarreras();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    // Validar que el email termine con el dominio educativo
    const email = emailRef.current.value.trim();
    if (!email.endsWith('@terciariourquiza.edu.ar')) {
      setErrors({
        nombre: null,
        apellido: null,
        dni: null,
        email: 'El email debe ser de dominio educativo (@terciariourquiza.edu.ar)',
        password: null,
        career: null
      });
      return;
    }

    const payload = new FormData();
    payload.append('nombre', nombreRef.current.value);
    payload.append('apellido', apellidoRef.current.value);
    payload.append('dni', dniRef.current.value);
    payload.append('email', emailRef.current.value);
    payload.append('password', passwordRef.current.value);
    payload.append('career', careerRef.current.value);
    payload.append('profile_photo', file);

    const handleRegistration = async () => {
      setIsLoading(true);
      setErrors({});
      try {
        const { data } = await axiosClient.post('/alumnos/register', payload, {
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
          // Manejar errores de validación específicos del backend
          if (err.response.data.error && err.response.data.field === 'email') {
            setErrors({
              nombre: null,
              apellido: null,
              dni: null,
              email: err.response.data.error,
              password: null,
              career: null
            });
          } else {
            const { errors: apiErrors } = err.response.data;

            setErrors({
              nombre: apiErrors.nombre?.[0] || null,
              apellido: apiErrors.apellido?.[0] || null,
              dni: apiErrors.dni?.[0] || null,
              email: apiErrors.email?.[0] || null,
              password: apiErrors.password?.[0] || null,
              career:
                payload.career === ''
                  ? 'Seleccione una carrera válida'
                  : apiErrors.career?.[0] || null
            });
          }
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
                  refrerence={nombreRef}
                  labelName={'Nombre'}
                  placeholderText={'Escribe tu nombre'}
                  error={errors.nombre}
                />
                <TextInput
                  input={'input'}
                  refrerence={apellidoRef}
                  labelName={'Apellido'}
                  placeholderText={'Escribe tu apellido'}
                  error={errors.apellido}
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
                  {carreras.map((carrera) => (
                    <option key={carrera.id_carrera} value={carrera.id_carrera}>
                      {carrera.carrera}
                    </option>
                  ))}
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
