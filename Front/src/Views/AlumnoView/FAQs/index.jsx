import React, { useState, useEffect } from 'react';
import axios from '../../../Components/Shared/Axios';
import styles from './faqs.module.css';

const AlumnoFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get('/faqs/alumno');
        setFaqs(response.data.faqs);
      } catch (error) {
        console.error('Error al cargar FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  if (loading) {
    return <div className={styles.loading}>Cargando FAQs...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Preguntas Frecuentes - Alumno</h1>
        <p>Encuentra respuestas a las preguntas más comunes sobre el sistema</p>
      </div>

      <div className={styles.faqsList}>
        {faqs.map((faq) => (
          <div key={faq.id} className={styles.faqItem}>
            <button
              className={`${styles.faqQuestion} ${expandedFaq === faq.id ? styles.expanded : ''}`}
              onClick={() => toggleFaq(faq.id)}
            >
              <span>{faq.pregunta}</span>
              <span className={styles.arrow}>{expandedFaq === faq.id ? '−' : '+'}</span>
            </button>
            {expandedFaq === faq.id && (
              <div className={styles.faqAnswer}>
                <p>{faq.respuesta}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.contact}>
        <h3>¿No encuentras lo que buscas?</h3>
        <p>Si tienes alguna pregunta específica que no está cubierta aquí, contacta a bedelía.</p>
      </div>
    </div>
  );
};

export default AlumnoFAQs;
