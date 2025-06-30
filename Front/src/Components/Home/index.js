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
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officia commodi quaerat
                mollitia nisi aperiam veniam sapiente fuga magni, nostrum modi tenetur. Qui nisi
                sunt iure cum ducimus totam mollitia ullam. Repellendus numquam ad officiis! Iure,
                accusamus.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
