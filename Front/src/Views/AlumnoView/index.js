<<<<<<< HEAD
<<<<<<< Updated upstream
import { Navigate, Outlet, useLocation } from 'react-router-dom';
=======
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import EncuestasAlumno from './EncuestasAlumno';
import Profile from './Profile';
import InscripcionesAlumno from './InscripcionesAlumno';
import SolicitudesAlumno from './SolicitudesAlumno';
>>>>>>> Stashed changes
=======
import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AlumnoMenu from './AlumnoMenu';
import EncuestasAlumno from './EncuestasAlumno';
import Profile from './Profile';
import InscripcionesAlumno from './InscripcionesAlumno';
import Materias from './Materias';
import SolicitudesAlumno from './SolicitudesAlumno';
import AlumnoFAQs from './FAQs';
>>>>>>> main
import { useStateContext } from '../../Components/Contexts';
import DashboardAlumno from './Dashboard';
import styles from './alumnoView.module.css';

const AlumnoView = () => {
<<<<<<< HEAD
<<<<<<< Updated upstream
  const { token } = useStateContext();
=======
  const { user } = useStateContext();
  const [menuOpen, setMenuOpen] = useState(false);
>>>>>>> main
  const location = useLocation();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

=======
  const { user } = useStateContext();
  const location = useLocation();

>>>>>>> Stashed changes
  // Si está en /alumno exactamente, mostrar el dashboard principal
  if (location.pathname === '/alumno') {
    return <DashboardAlumno />;
  }

<<<<<<< HEAD
<<<<<<< Updated upstream
  // Si está en una subruta, renderizar el contenido correspondiente
  return <Outlet />;
=======
  return (
    <Routes>
      <Route path="/" element={<DashboardAlumno />} />
      <Route path="/encuestas" element={<EncuestasAlumno />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/inscripciones" element={<InscripcionesAlumno />} />
      <Route path="/solicitudes" element={<SolicitudesAlumno idAlumno={user?.id_alumno} />} />
    </Routes>
  );
>>>>>>> Stashed changes
=======
  return (
    <div className={styles.container}>
      {/* Mobile Menu Toggle Button */}
      <div className={styles.mobileMenuToggle}>
        <button onClick={toggleMenu}>☰</button>
      </div>

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${menuOpen ? styles.open : ''}`}>
        <AlumnoMenu onClose={() => setMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<EncuestasAlumno />} />
          <Route path="/encuestas" element={<EncuestasAlumno />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/inscripciones" element={<InscripcionesAlumno />} />
          <Route path="/materias" element={<Materias />} />
          <Route path="/solicitudes" element={<SolicitudesAlumno idAlumno={user?.id_alumno} />} />
          <Route path="/faqs" element={<AlumnoFAQs />} />
        </Routes>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`${styles.mobileOverlay} ${menuOpen ? styles.show : ''}`}
        onClick={() => setMenuOpen(false)}
      />
    </div>
  );
>>>>>>> main
};

export default AlumnoView;
