import React, { useState, useEffect } from 'react';
import styles from './welcomeTooltip.module.css';

const WelcomeTooltip = ({
  id,
  userId,
  title,
  message,
  position = 'bottom',
  onClose,
  onViewFaqs
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const key = userId ? `tooltip-${id}-${userId}-seen` : `tooltip-${id}-seen`;
    const hasSeen = localStorage.getItem(key);
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, [id, userId]);

  const handleClose = () => {
    const key = userId ? `tooltip-${id}-${userId}-seen` : `tooltip-${id}-seen`;
    setIsVisible(false);
    localStorage.setItem(key, 'true');
    if (onClose) onClose();
  };

  const handleViewFaqs = () => {
    handleClose();
    if (onViewFaqs) onViewFaqs();
  };

  if (!isVisible) return null;

  return (
    <div className={`${styles.tooltip} ${styles[position]}`}>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.title}>👋 {title}</span>
          <button className={styles.closeBtn} onClick={handleClose}>
            ×
          </button>
        </div>
        <div className={styles.message}>{message}</div>
        <div className={styles.actions}>
          <button className={styles.faqsBtn} onClick={handleViewFaqs}>
            Ver FAQs
          </button>
          <button className={styles.closeBtn} onClick={handleClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeTooltip;
