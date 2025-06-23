import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStateContext } from '../../Components/Contexts';
import AlumnoMenu from './AlumnoMenu';

const AlumnoView = () => {
  const { token } = useStateContext();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" />;
  }

  // Si está en /alumno exactamente, mostrar el menú principal
  if (location.pathname === '/alumno') {
    return <AlumnoMenu />;
  }

  // Si está en una subruta, renderizar el contenido correspondiente
  return <Outlet />;
};

export default AlumnoView;
