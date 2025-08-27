import React from 'react';
import styles from './button.module.css';

const Button = ({ text, type, onClick, classBtn, colorPrimario }) => {
  const style = colorPrimario ? { backgroundColor: colorPrimario, color: '#fff' } : {};
  return type === 'submit' ? (
    <button
      onClick={onClick}
      className={
        classBtn ? `${styles.submitBtn} ${classBtn}` : `${styles.submitBtn} ${styles.button}`
      }
      style={style}
    >
      {text}
    </button>
  ) : (
    <button
      onClick={onClick}
      className={
        type === 'cancel'
          ? classBtn
            ? `${styles.cancelBtn} ${classBtn}`
            : `${styles.cancelBtn} ${styles.button}`
          : type === 'x'
            ? classBtn
              ? `${classBtn}`
              : `${styles.xBtn}`
            : classBtn
              ? `${styles.editBtn} ${classBtn}`
              : `${styles.editBtn} ${styles.button}`
      }
      type="button"
      style={style}
    >
      {text}
    </button>
  );
};

export default Button;
