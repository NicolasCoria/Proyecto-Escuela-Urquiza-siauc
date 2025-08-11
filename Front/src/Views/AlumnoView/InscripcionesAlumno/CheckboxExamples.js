import React from 'react';
import styles from './inscripciones.module.css';

const CheckboxExamples = () => {
  return (
    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', margin: '20px 0' }}>
      <h4 style={{ marginBottom: '16px', color: '#333' }}>Ejemplos de Checkboxes Modernos:</h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Checkbox Moderno Personalizado */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className={styles.modernCheckbox}>
            <input type="checkbox" id="example1" />
            <span className={styles.checkmark}></span>
          </div>
          <label htmlFor="example1" style={{ cursor: 'pointer' }}>
            Checkbox Moderno Personalizado (Recomendado)
          </label>
        </div>

        {/* Checkbox Toggle Switch */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className={styles.toggleCheckbox}>
            <input type="checkbox" id="example2" />
            <span className={styles.slider}></span>
          </div>
          <label htmlFor="example2" style={{ cursor: 'pointer' }}>
            Toggle Switch
          </label>
        </div>

        {/* Checkbox Estándar */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input type="checkbox" id="example3" style={{ marginRight: '12px' }} />
          <label htmlFor="example3" style={{ cursor: 'pointer' }}>
            Checkbox Estándar (Original)
          </label>
        </div>

        {/* Estados del Checkbox Moderno */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className={styles.modernCheckbox}>
            <input type="checkbox" id="checked" defaultChecked />
            <span className={styles.checkmark}></span>
          </div>
          <label htmlFor="checked">Marcado</label>

          <div className={styles.modernCheckbox}>
            <input type="checkbox" id="unchecked" />
            <span className={styles.checkmark}></span>
          </div>
          <label htmlFor="unchecked">Desmarcado</label>

          <div className={styles.modernCheckbox}>
            <input type="checkbox" id="disabled" disabled />
            <span className={styles.checkmark}></span>
          </div>
          <label htmlFor="disabled" style={{ opacity: 0.6 }}>Deshabilitado</label>
        </div>
      </div>
    </div>
  );
};

export default CheckboxExamples;
