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
import { useStateContext } from '../../Components/Contexts';
import DashboardAlumno from './Dashboard';

const AlumnoView = () => {
<<<<<<< Updated upstream
  const { token } = useStateContext();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" />;
  }

=======
  const { user } = useStateContext();
  const location = useLocation();

>>>>>>> Stashed changes
  // Si está en /alumno exactamente, mostrar el dashboard principal
  if (location.pathname === '/alumno') {
    return <DashboardAlumno />;
  }

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
};

export default AlumnoView;
