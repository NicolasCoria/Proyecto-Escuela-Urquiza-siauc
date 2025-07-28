import React from 'react';
import styles from './carreras.module.css';

const Carreras = () => {
  const carreras = [
    {
      id: 1,
      nombre: 'TÉCNICO SUPERIOR EN ANÁLISIS FUNCIONAL DE SISTEMAS INFORMÁTICOS',
      descripcion:
        'Formación especializada en análisis de sistemas informáticos y gestión de proyectos tecnológicos.'
    },
    {
      id: 2,
      nombre: 'TÉCNICO SUPERIOR EN DESARROLLO DE SOFTWARE',
      descripcion:
        'Desarrollo de aplicaciones y sistemas informáticos con las últimas tecnologías del mercado.'
    },
    {
      id: 3,
      nombre: 'TÉCNICO SUPERIOR EN INFRAESTRUCTURA DE TECNOLOGÍA DE LA INFORMACIÓN',
      descripcion: 'Gestión y administración de infraestructura tecnológica empresarial.'
    }
  ];

  return (
    <div className={styles.carrerasContainer}>
      <div className={styles.carrerasHeader}>
        <h1 className={styles.carrerasTitle}>Nuestras Carreras</h1>
        <p className={styles.carrerasSubtitle}>
          Formación de calidad en tecnología de la información
        </p>
      </div>

      <div className={styles.generalidadesSection}>
        <h2 className={styles.generalidadesTitle}>GENERALIDADES</h2>
        <div className={styles.generalidadesContent}>
          <p>En nuestra institución contamos con tres carreras de nivel superior, a saber:</p>
          <ul style={{ marginTop: '1rem', paddingLeft: '2rem' }}>
            <li>TÉCNICO SUPERIOR EN ANÁLISIS FUNCIONAL DE SISTEMAS INFORMÁTICOS</li>
            <li>TÉCNICO SUPERIOR EN DESARROLLO DE SOFTWARE</li>
            <li>TÉCNICO SUPERIOR EN INFRAESTRUCTURA DE TECNOLOGÍA DE LA INFORMACIÓN</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>
            Las tres carreras se dictan en horario vespertino/nocturno.
          </p>
        </div>
      </div>

      <div className={styles.carrerasGrid}>
        {carreras.map((carrera) => (
          <div key={carrera.id} className={styles.carreraCard}>
            <h3 className={styles.carreraTitle}>{carrera.nombre}</h3>
            <p className={styles.carreraDescription}>{carrera.descripcion}</p>
          </div>
        ))}
      </div>

      <div className={styles.horarioSection}>
        <h2 className={styles.horarioTitle}>Horario de Cursado</h2>
        <div className={styles.horarioContent}>
          <p>
            El horario de cursado es de <strong>19:20 a 23:30</strong>
          </p>
          <p>
            La duración de las mismas es de <strong>tres años</strong>.
          </p>
        </div>
      </div>

      <div className={styles.modalidadSection}>
        <h2 className={styles.modalidadTitle}>Modalidad de Estudio</h2>
        <div className={styles.modalidadContent}>
          <p>
            Si bien son de régimen presencial, contamos con la aprobación del Ministerio de
            Educación de la Provincia de Santa Fe para la implementación de un sistema híbrido,
            donde el 50% de las clases son en modalidad presencial y el otro 50% son en modalidad
            virtual a través de la plataforma institucional.
          </p>
        </div>
      </div>

      <div className={styles.beneficiosSection}>
        <h2 className={styles.beneficiosTitle}>Beneficios y Características</h2>
        <div className={styles.beneficiosContent}>
          <p>
            Son carreras <strong>públicas y gratuitas</strong>, aunque se pide la colaboración
            voluntaria de los alumnos para el pago de Cooperadora que nos ayuda a mantener la
            infraestructura de la institución.
          </p>
          <p>
            Son títulos oficiales emitidos por el Ministerio de Educación de la Provincia de
            <strong> Santa Fe</strong> pero con <strong>validez nacional</strong>.
          </p>
        </div>
      </div>

      <div className={styles.mercadoSection}>
        <h2 className={styles.mercadoTitle}>Reconocimiento del Mercado Laboral</h2>
        <div className={styles.mercadoContent}>
          <p>
            Contamos con un alto reconocimiento del mercado laboral tanto local como regional.
            <br />
            Es por eso que tenemos muchas pasantías de nuestros alumnos en empresas de alto, mediano
            y pequeño tamaño.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Carreras;
