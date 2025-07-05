import React from 'react';
import styles from './header.module.css';
import { useStateContext } from '../Contexts';

const Header = () => {
  const { user } = useStateContext();

  return sessionStorage.getItem('role') === 'DS' ? (
    <>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.containerDs}`}>
          <h1 className={styles.title}>Escuela Superior de Comercio N°49</h1>
        </div>
        <div className={`${styles.container2} ${styles.containerDs}`}>
          <div className={styles.photoContainer}>
            <img
              src={
                user.profile_photo || `${process.env.PUBLIC_URL}/assets/images/defaultProfile.png`
              }
              className={styles.profilePhoto}
            />
          </div>
          <div className={styles.namesTitle}>{user.name}</div>
        </div>
        <div className={styles.wallpaper}></div>
      </header>
    </>
  ) : sessionStorage.getItem('role') === 'AF' ? (
    <>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.containerAf}`}>
          <h1 className={styles.title}>Escuela Superior de Comercio N°49</h1>
        </div>
        <div className={`${styles.container2} ${styles.containerAf}`}>
          <div className={styles.photoContainer}>
            <img
              src={
                user.profile_photo || `${process.env.PUBLIC_URL}/assets/images/defaultProfile.png`
              }
              className={styles.profilePhoto}
            />
          </div>
          <div className={styles.namesTitle}>{user.name}</div>
        </div>
        <div className={styles.wallpaper}></div>
      </header>
    </>
  ) : sessionStorage.getItem('role') === 'ITI' ? (
    <>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.containerIti}`}>
          <h1 className={styles.title}>Escuela Superior de Comercio N°49</h1>
        </div>
        <div className={`${styles.container2} ${styles.containerIti}`}>
          <div className={styles.photoContainer}>
            <img
              src={
                user.profile_photo || `${process.env.PUBLIC_URL}/assets/images/defaultProfile.png`
              }
              className={styles.profilePhoto}
            />
          </div>
          <div className={styles.namesTitle}>{user.name}</div>
        </div>
        <div className={styles.wallpaper}></div>
      </header>
    </>
  ) : null;
};

export default Header;
