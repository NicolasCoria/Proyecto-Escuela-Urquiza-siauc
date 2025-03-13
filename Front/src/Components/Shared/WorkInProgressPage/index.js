import React from 'react';
import styles from './workInProgressPage.module.css';

const WorkInProgressPage = () => {
  return (
    <>
      <main>
        <section className={styles.container}>
          <div className={styles.subContainer}>
            <img
              src={`${process.env.PUBLIC_URL}/assets/images/error404.png`}
              alt="error404"
              className={styles.img}
            />
            <div className={styles.historyContainer}>
              <h3>Pagina en construcción</h3>
              <p className={styles.p}>Disculpe las molestias</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default WorkInProgressPage;
