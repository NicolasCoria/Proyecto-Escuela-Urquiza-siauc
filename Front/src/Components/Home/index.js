import React from 'react';
import styles from './home.module.css';
import Modal from '../Shared/Modal';
import { useModalContext } from '../Contexts';

const Home = () => {
  const { modalState, closeModal } = useModalContext();
  return (
    <>
      {modalState.isOpen && modalState.chooseModal === false ? (
        <Modal description={modalState.description} isOpen={modalState.isOpen} close={closeModal} />
      ) : null}
      <main>
        <section className={styles.container}>
          <div className={styles.title}>Bienvenidos</div>
          <div className={styles.subContainer}>
            <img
              src={`${process.env.PUBLIC_URL}/assets/images/urquizaSchool.jpg`}
              alt="urquiza-school"
              className={styles.img}
            />
            <div className={styles.historyContainer}>
              <h3>Historia de la escuela</h3>
              <p>
                En el año 1986 la Escuela de Comercio Nº 2 «Cap. Gral J.J.de Urquiza» eleva su
                categoría de Escuela Superior a partir de la creación de la carrera de “Analista de
                Sistemas de Computación”, la que contó con dos divisiones de primer año en su
                inicio, dependiendo de la Dirección Nacional de Educación Superior, del Ministerio
                de Educación y Justicia de la Nación.
                <br />
                Los contenidos de la Carrera estaban determinados por el plan RM Nº 1823/83, el cual
                establecía una duración de tres años para obtener el título de Analista de Sistemas
                de Computación, con un título intermedio de Analista Programador, al aprobar segundo
                año.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
