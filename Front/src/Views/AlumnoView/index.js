import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStateContext } from '../../Components/Contexts';
import DashboardAlumno from './Dashboard';

const AlumnoView = () => {
  const { token } = useStateContext();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" />;
  }

  // Si está en /alumno exactamente, mostrar el dashboard principal
  if (location.pathname === '/alumno') {
    return <DashboardAlumno />;
  }

  // Si está en una subruta, renderizar el contenido correspondiente
  return <Outlet />;
};

export default AlumnoView;
