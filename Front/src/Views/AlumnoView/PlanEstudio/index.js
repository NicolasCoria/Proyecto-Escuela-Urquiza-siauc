import React, { useState, useEffect } from 'react';
import axiosClient from '../../../Components/Shared/Axios';
import Spinner from '../../../Components/Shared/Spinner';
import styles from './planEstudio.module.css';

const PlanEstudio = () => {
  const [planEstudio, setPlanEstudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchPlanEstudio = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/alumno/plan-estudio');

        if (response.data.success) {
          setPlanEstudio(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Error al cargar el plan de estudios');
        console.error('Error fetching plan de estudios:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanEstudio();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!planEstudio) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>No se encontró información</h2>
          <p>No se pudo cargar el plan de estudios.</p>
        </div>
      </div>
    );
  }

  const { carrera, plan_estudio } = planEstudio;

  const handleVerContenido = (materia) => {
    setSelectedMateria(materia);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMateria(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Plan de Estudios</h1>
        <h2>{carrera.nombre}</h2>
      </div>

      <div className={styles.planContainer}>
        {Object.keys(plan_estudio).map((anio) => (
          <div key={anio} className={styles.anioSection}>
            <h3 className={styles.anioTitle}>
              {anio === '1' ? '1er Año' : anio === '2' ? '2do Año' : '3er Año'}
            </h3>

            <div className={styles.materiasGrid}>
              {plan_estudio[anio].map((materia) => (
                <div key={materia.id_uc} className={styles.materiaCard}>
                  <div className={styles.materiaHeader}>
                    <h4 className={styles.materiaNombre}>{materia.unidad_curricular}</h4>
                    <span className={styles.materiaTipo}>{materia.tipo}</span>
                  </div>

                  <div className={styles.materiaDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Horas Semanales:</span>
                      <span className={styles.detailValue}>{materia.horas_sem}h</span>
                    </div>

                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Horas Anuales:</span>
                      <span className={styles.detailValue}>{materia.horas_anual}h</span>
                    </div>

                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Formato:</span>
                      <span className={styles.detailValue}>{materia.formato}</span>
                    </div>
                  </div>

                  <button
                    className={styles.contenidoBtn}
                    onClick={() => handleVerContenido(materia)}
                  >
                    📚 Ver Contenido
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <h3>Resumen del Plan de Estudios</h3>
        <div className={styles.summaryStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {Object.values(plan_estudio).reduce((total, materias) => total + materias.length, 0)}
            </span>
            <span className={styles.statLabel}>Total de Materias</span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statNumber}>{Object.keys(plan_estudio).length}</span>
            <span className={styles.statLabel}>Años de Cursado</span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {Object.values(plan_estudio).reduce(
                (total, materias) =>
                  total + materias.reduce((sum, materia) => sum + materia.horas_anual, 0),
                0
              )}
            </span>
            <span className={styles.statLabel}>Horas Totales</span>
          </div>
        </div>
      </div>

      {/* Modal de Contenido */}
      {showModal && selectedMateria && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{selectedMateria.unidad_curricular}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.contenidoSection}>
                <h4>🎯 Objetivos</h4>
                <p>{selectedMateria.contenido?.objetivos || 'Objetivos no disponibles'}</p>
              </div>

              <div className={styles.contenidoSection}>
                <h4>📖 Unidades Temáticas</h4>
                <ul>
                  {selectedMateria.contenido?.unidades?.map((unidad, index) => (
                    <li key={index}>{unidad}</li>
                  )) || <li>Unidades no disponibles</li>}
                </ul>
              </div>

              <div className={styles.contenidoSection}>
                <h4>🔧 Metodología</h4>
                <p>{selectedMateria.contenido?.metodologia || 'Metodología no disponible'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanEstudio;
