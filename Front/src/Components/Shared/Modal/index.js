import React, { useEffect, useState } from 'react';
import styles from './modal.module.css';
import Button from '../Button';
import { BiErrorAlt } from 'react-icons/bi';
import { useModalContext } from '../../Contexts';

const Modal = () => {
  const { modalState, closeModal } = useModalContext();
  const {
    isOpen,
    description,
    title,
    confirmBtn,
    denyBtn,
    noButton,
    chooseModal,
    confirmModal,
    onClick
  } = modalState;
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let timer;
    if (!chooseModal && !confirmModal && isOpen) {
      timer = setTimeout(() => {
        setIsFadingOut(false);
        setTimeout(() => {
          closeModal();
        }, 500);
      }, 4000);
    }
    setIsFadingOut(true);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, chooseModal, confirmModal, closeModal]);

  return isOpen ? (
    chooseModal ? (
      <div className={styles.container}>
        <div className={styles.subContainer}>
          <div className={styles.logoContainer}>
            <BiErrorAlt className={styles.icon} />
          </div>
          <div className={styles.title}>{title.toUpperCase()}</div>
          <div className={styles.subTitle}>{description}</div>
          <div className={styles.btnsContainer}>
            <Button type="cancel" text={denyBtn} onClick={closeModal} />
            <Button type="submit" text={confirmBtn} onClick={onClick} />
          </div>
        </div>
      </div>
    ) : confirmModal ? (
      <div className={styles.container}>
        <div className={styles.subContainer}>
          <div className={styles.logoContainer}>
            <BiErrorAlt className={styles.icon} />
          </div>
          <div className={styles.title}>{title.toUpperCase()}</div>
          <div className={styles.subTitle}>{description}</div>
          <div className={styles.btnsContainerConfirm}>
            {!noButton ? <Button type="submit" text={confirmBtn} onClick={onClick} /> : ''}
          </div>
        </div>
      </div>
    ) : (
      <>
        <div className={styles.containerSelfClose}>
          {sessionStorage.getItem('role') === 'DS' ? (
            <div
              className={`${
                !isFadingOut
                  ? `${styles.subContainerSelfClose} ${styles.subContainerSelfCloseDs}`
                  : `${styles.subContainerOpen} ${styles.subContainerOpenDs}`
              }`}
            >
              <div className={styles.descriptionSelfClose}>{description}</div>
              <Button type="x" text={'X'} onClick={closeModal} />
            </div>
          ) : sessionStorage.getItem('role') === 'AF' ? (
            <div
              className={
                !isFadingOut
                  ? `${styles.subContainerSelfClose} ${styles.subContainerSelfCloseAf}`
                  : `${styles.subContainerOpen} ${styles.subContainerOpenAf}`
              }
            >
              <div className={styles.descriptionSelfClose}>{description}</div>
              <Button type="x" text={'X'} onClick={closeModal} />
            </div>
          ) : sessionStorage.getItem('role') === 'ITI' ? (
            <div
              className={
                !isFadingOut
                  ? `${styles.subContainerSelfClose} ${styles.subContainerSelfCloseIti}`
                  : `${styles.subContainerOpen} ${styles.subContainerOpenIti}`
              }
            >
              <div className={styles.descriptionSelfClose}>{description}</div>
              <Button type="x" text={'X'} onClick={closeModal} />
            </div>
          ) : (
            <div className={!isFadingOut ? styles.subContainerSelfClose : styles.subContainerOpen}>
              <div className={styles.descriptionSelfClose}>{description}</div>
              <Button type="x" text={'X'} onClick={closeModal} />
            </div>
          )}
        </div>
      </>
    )
  ) : null;
};

export default Modal;
