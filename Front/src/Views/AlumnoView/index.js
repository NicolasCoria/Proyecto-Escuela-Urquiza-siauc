import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import EncuestasAlumno from './EncuestasAlumno';
import Profile from './Profile';
import InscripcionesAlumno from './InscripcionesAlumno';
import SolicitudesAlumno from './SolicitudesAlumno';
import AlumnoFAQs from './FAQs';
import { useStateContext } from '../../Components/Contexts';
import DashboardAlumno from './Dashboard';

const AlumnoView = () => {
  const { user } = useStateContext();
  const location = useLocation();

  // Si está en /alumno exactamente, mostrar el dashboard principal
  if (location.pathname === '/alumno') {
    return <DashboardAlumno />;
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardAlumno />} />
      <Route path="/encuestas" element={<EncuestasAlumno />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/inscripciones" element={<InscripcionesAlumno />} />
      <Route path="/solicitudes" element={<SolicitudesAlumno idAlumno={user?.id_alumno} />} />
      <Route path="/faqs" element={<AlumnoFAQs />} />
    </Routes>
  );
};

export default AlumnoView;
