import React, { useEffect, useState } from 'react';
import Aside from '../../../Components/Shared/Aside';
import styles from './superAdmin.module.css';
import Modal from '../../../Components/Shared/Modal';
import { BiCheck, BiX } from 'react-icons/bi';
import { useModalContext, useStateContext } from '../../../Components/Contexts';
import axiosClient from '../../../Components/Shared/Axios';
import Spinner from '../../../Components/Shared/Spinner';

const SuperAdmin = () => {
  const { openModal, modalState } = useModalContext();
  const { notification, updateNotification } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [scrollBar, setScrollBar] = useState(false);
  const [redimension, setRedimension] = useState(false);
  const [students, setStudents] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);

  const getStudents = async () => {
    setIsLoading(true);
    try {
      const { data } = await axiosClient.get('/super-admin/administration');
      setStudents(data.data);
    } catch (err) {
      console.error('Error en la solicitud:', err);
    }
    setIsLoading(false);
  };

  const applyFilter = (studentsToFilter) => {
    const careerMapping = {
      AF: 'Analista Funcional',
      DS: 'Desarrollo de Software',
      ITI: 'Tecnologias de la Información'
    };

    const filtered = studentsToFilter.filter((student) => {
      const normalizedCareer = student.career.toUpperCase();
      return (
        student.dni.includes(filterQuery) ||
        normalizedCareer.includes(filterQuery.toUpperCase()) ||
        (careerMapping[normalizedCareer] &&
          careerMapping[normalizedCareer].toLowerCase().includes(filterQuery.toLowerCase()))
      );
    });
    setFilteredStudents(filtered);
  };

  const onUpdateApprovalStatus = async (id, name, approved) => {
    try {
      if (approved) {
        openModal({
          title: 'Aceptar',
          description: `¿Está seguro que desea aceptar a ${name}?`,
          confirmBtn: 'Aceptar',
          denyBtn: 'Cancelar',
          chooseModal: true,
          onClick: async () => {
            setIsLoading(true);
            await axiosClient.patch(`/students/${id}`, { approved });
            const newNotifications = notification
              ? notification.filter((notification) => notification.id !== id)
              : [];
            updateNotification(newNotifications);
            setStudents(students.filter((student) => student.id !== id));
            setIsLoading(false);
            openModal({
              description: `Estudiante aceptado con éxito`
            });
          }
        });
      } else {
        openModal({
          title: 'Eliminación',
          description: `¿Está seguro que desea rechazar a ${name}?`,
          confirmBtn: 'Aceptar',
          denyBtn: 'Cancelar',
          chooseModal: true,
          onClick: async () => {
            setIsLoading(true);
            await axiosClient.delete(`/students/delete/${id}`);
            const newNotifications = notification
              ? notification.filter((notification) => notification.id !== id)
              : [];
            updateNotification(newNotifications);
            setStudents(students.filter((student) => student.id !== id));
            setIsLoading(false);
            openModal({
              description: `Estudiante rechazado con éxito`
            });
          }
        });
      }
    } catch (err) {
      if (err.response && err.response.status === 500) {
        openModal({
          description: 'Ocurrió un error. Por favor, inténtelo de nuevo'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getStudents();
    setScrollBar(true);
    setRedimension(window.innerWidth < 1024);
    const handleResize = () => {
      setRedimension(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    applyFilter(students);
  }, [filterQuery, students]);

  return students.length > 0 ? (
    <>
      {isLoading && <Spinner />}
      <Aside page={'super-admin'} />
      {modalState.isOpen && <Modal />}
      <section className={styles.container}>
        <div className={styles.tableContainer}>
          <table className={styles.contTable}>
            <thead className={styles.theadTable}>
              <tr>
                {redimension ? (
                  <>
                    <th className={styles.thTable}>Nombre</th>
                    <th className={styles.thTable}>DNI</th>
                    <th className={styles.thTable}>Carrera</th>
                  </>
                ) : (
                  <>
                    <th className={styles.thTable}></th>
                    <th className={styles.thTable}>Nombre</th>
                    <th className={styles.thTable}>DNI</th>
                    <th className={styles.thTable}>Email</th>
                    <th className={styles.thTable}>Carrera</th>
                    <th className={styles.thTable}>Fecha de creación</th>
                  </>
                )}
                <th
                  className={
                    !scrollBar
                      ? `${styles.thTable} ${styles.headers} ${styles.borderRight}`
                      : `${styles.thTable} ${styles.headers} `
                  }
                >
                  <input
                    className={styles.filter}
                    placeholder="Ingrese DNI o Carrera"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                  />
                </th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, index) => (
                  <tr key={index} className={styles.rows}>
                    {redimension ? (
                      <>
                        <td className={styles.thTable}>{s.name}</td>
                        <td className={styles.thTable}>{s.dni}</td>
                        <td className={styles.thTable}>{s.career}</td>
                      </>
                    ) : (
                      <>
                        <td className={styles.thTable}>
                          <div className={styles.photoContainer}>
                            <div className={styles.photoContainer}>
                              <img
                                src={
                                  s?.profile_photo ||
                                  `${process.env.PUBLIC_URL}/assets/images/defaultProfile.png`
                                }
                                className={styles.profilePhoto}
                              />
                            </div>
                          </div>
                        </td>
                        <td className={styles.thTable}>{s.name}</td>
                        <td className={styles.thTable}>{s.dni}</td>
                        <td className={styles.thTable}>{s.email}</td>
                        <td className={styles.thTable}>
                          {s.career === 'AF'
                            ? 'Analista Funcional'
                            : s.career === 'DS'
                            ? 'Desarrollo de Software'
                            : s.career === 'ITI'
                            ? 'Tecnologías de la Información'
                            : null}
                        </td>
                        <td className={styles.thTable}>{s.created_at}</td>
                      </>
                    )}
                    <td className={styles.thTable}>
                      <BiCheck
                        className={styles.check}
                        onClick={() => onUpdateApprovalStatus(s.id, s.name, true)}
                      />
                      <BiX
                        onClick={() => {
                          onUpdateApprovalStatus(s.id, s.name, false);
                        }}
                        className={styles.delete}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className={styles.info}>
                      <p>No se encontraron resultados.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  ) : (
    <>
      <Aside page={'super-admin'} />
      {isLoading && <Spinner />}
      {modalState.isOpen && <Modal />}
      <section className={styles.container}>
        <div className={styles.tableContainer}>
          <table className={styles.contTable}>
            <thead className={styles.theadTable}>
              <tr>
                {redimension ? (
                  <>
                    <th className={styles.thTable}>Nombre</th>
                    <th className={styles.thTable}>DNI</th>
                    <th className={styles.thTable}>Carrera</th>
                  </>
                ) : (
                  <>
                    <th className={styles.thTable}>Nombre</th>
                    <th className={styles.thTable}>DNI</th>
                    <th className={styles.thTable}>Email</th>
                    <th className={styles.thTable}>Carrera</th>
                    <th className={styles.thTable}>Fecha de creación</th>
                  </>
                )}
                <th
                  className={
                    !scrollBar
                      ? `${styles.thTable} ${styles.headers} ${styles.borderRight}`
                      : `${styles.thTable} ${styles.headers} `
                  }
                >
                  <input
                    className={styles.filter}
                    placeholder="Ingrese DNI o Carrera"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                  />
                </th>
              </tr>
            </thead>
          </table>
          <div className={styles.info}>
            <p>No hay solicitudes entrantes.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default SuperAdmin;
