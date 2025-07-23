import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AlumnoMenu from './AlumnoMenu';
import EncuestasAlumno from './EncuestasAlumno';
import Profile from './Profile';
import InscripcionesAlumno from './InscripcionesAlumno';
import Materias from './Materias';
import SolicitudesAlumno from './SolicitudesAlumno';
import { useStateContext } from '../../Components/Contexts';
import DashboardAlumno from './Dashboard';
import styles from './alumnoView.module.css';

const AlumnoView = () => {
  const { user } = useStateContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Si está en /alumno exactamente, mostrar el dashboard principal
  if (location.pathname === '/alumno') {
    return <DashboardAlumno />;
  }

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
        </Routes>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`${styles.mobileOverlay} ${menuOpen ? styles.show : ''}`}
        onClick={() => setMenuOpen(false)}
      />
    </div>
  );
};

export default AlumnoView;
