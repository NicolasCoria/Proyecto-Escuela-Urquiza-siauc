import React, { useEffect, useState } from 'react';
import styles from './profile.module.css';
import Aside from '../../../Components/Shared/Aside';
import Modal from '../../../Components/Shared/Modal';
import Spinner from '../../../Components/Shared/Spinner';
import axiosClient from '../../../Components/Shared/Axios';
import { useParams } from 'react-router';
import { FiEdit } from 'react-icons/fi';
import { useModalContext, useStateContext } from '../../../Components/Contexts';

const Profile = () => {
  const { openModal, modalState, closeModal } = useModalContext();
  const { setUserHeader, token } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { id } = useParams();

  const getStudents = async (id) => {
    setIsLoading(true);
    try {
      const { data } = await axiosClient.get(`/students/${id}`);
      setStudents(data.data);
    } catch (err) {
      console.error('Error en la solicitud:', err);
    }
    setIsLoading(false);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadButtonClick = () => {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
  };

  const handleFileUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('profile_photo', selectedFile);
      const response = await axiosClient.post(`/students/profile-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        openModal({
          description: response.data.success,
          chooseModal: false
        });
        const newProfilePhoto = response.data.user.profile_photo;
        if (newProfilePhoto) {
          setUserHeader({ ...students, profile_photo: newProfilePhoto }, token);
        }
        getStudents(id);
      }
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const apiErrors = err.response;
        openModal({
          title: 'Advertencia',
          description: apiErrors.data.errors.profile_photo,
          confirmBtn: 'Aceptar',
          onClick: () => {
            closeModal;
            window.location.reload();
          },
          noButton: false,
          confirmModal: true
        });
      }
    } finally {
      setSelectedFile(null);
    }
  };

  if (selectedFile) {
    handleFileUpload();
  }

  useEffect(() => {
    getStudents(id);
  }, [id]);

  return (
    <>
      <Aside page={'home'} />
      {modalState.isOpen && (
        <Modal description={modalState.description} isOpen={modalState.isOpen} close={closeModal} />
      )}
      <section className={styles.container}>
        {isLoading && <Spinner />}
        <div className={styles.content}>
          <div className={styles.photoContainer}>
            <div className={styles.photoContainer}>
              <input
                id="fileInput"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <span className={styles.profileHover} onClick={handleUploadButtonClick}>
                <FiEdit />
              </span>
              <img
                src={
                  students?.profile_photo ||
                  `${process.env.PUBLIC_URL}/assets/images/defaultProfile.png`
                }
                className={styles.profilePhoto}
              />
            </div>
          </div>
          <div className={styles.subContainer}>
            <div className={styles.inputContainer}>
              <label className={styles.label}>Nombre</label>
              <p className={styles.p}>{students?.name}</p>
            </div>
            <div className={styles.inputContainer}>
              <label className={styles.label}>DNI</label>
              <p className={styles.p}>{students?.dni}</p>
            </div>
            <div className={styles.inputContainer}>
              <label className={styles.label}>Email</label>
              <p className={styles.p}>{students?.email}</p>
            </div>
            <div className={styles.inputContainer}>
              <label className={styles.label}>Carrera</label>
              <p className={styles.p}>
                {students?.career === 'AF'
                  ? 'Analista Funcional'
                  : students?.career === 'DS'
                  ? 'Desarrollo de Software'
                  : students?.career === 'ITI'
                  ? 'Tecnologías de la Información'
                  : null}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
