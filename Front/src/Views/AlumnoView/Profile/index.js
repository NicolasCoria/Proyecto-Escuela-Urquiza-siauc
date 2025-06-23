import React, { useState } from 'react';
import styles from './profile.module.css';
import Aside from '../../../Components/Shared/Aside';
import Modal from '../../../Components/Shared/Modal';
import Spinner from '../../../Components/Shared/Spinner';
import { useModalContext, useStateContext } from '../../../Components/Contexts';

const Profile = () => {
  const { modalState, closeModal } = useModalContext();
  const { user } = useStateContext();
  const [isLoading] = useState(false);

  // Si no hay usuario logueado, puedes redirigir o mostrar un mensaje
  if (!user) {
    return <div>No hay datos de usuario.</div>;
  }

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
              <img
                src={
                  user?.profile_photo ||
                  `${process.env.PUBLIC_URL}/assets/images/defaultProfile.png`
                }
                className={styles.profilePhoto}
                alt="Foto de perfil"
              />
            </div>
          </div>
          <div className={styles.inputContainer}>
            <label className={styles.label}>Nombre</label>
            <p className={styles.p}>{user?.nombre || user?.name}</p>
          </div>
          <div className={styles.inputContainer}>
            <label className={styles.label}>Apellido</label>
            <p className={styles.p}>{user?.apellido}</p>
          </div>
          <div className={styles.inputContainer}>
            <label className={styles.label}>Email</label>
            <p className={styles.p}>{user?.email}</p>
          </div>
          {/* Puedes agregar más campos si los tienes en el objeto user */}
        </div>
      </section>
    </>
  );
};

export default Profile;
