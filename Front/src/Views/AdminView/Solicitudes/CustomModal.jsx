import React from 'react';
import styles from './customModal.module.css';

const CustomModal = ({ onClose, children }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modalBox}>
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default CustomModal;
