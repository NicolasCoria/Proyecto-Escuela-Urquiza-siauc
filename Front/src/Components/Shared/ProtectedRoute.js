import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStateContext } from '../Contexts';
import Spinner from './Spinner';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, token, role } = useStateContext();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación inmediatamente
    const checkAuth = () => {
      console.log('ProtectedRoute - Token:', token);
      console.log('ProtectedRoute - Role:', role);
      console.log('ProtectedRoute - User:', user);
      console.log('ProtectedRoute - Required Role:', requiredRole);
      console.log('ProtectedRoute - Current Path:', location.pathname);

      setIsLoading(false);
    };

    checkAuth();
  }, [token, role, user, requiredRole, location.pathname]);

  if (isLoading) {
    return <Spinner />;
  }

  // Si no hay token, redirigir al login correspondiente
  if (!token) {
    console.log('No token found, redirecting to login');
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" replace />;
    } else if (location.pathname.startsWith('/alumno')) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Si hay token pero no hay usuario, permitir que el componente hijo maneje la carga
  if (!user && role) {
    console.log('Token exists but no user, allowing child component to handle');
    return children;
  }

  // Si se requiere un rol específico y no coincide
  if (requiredRole && role !== requiredRole) {
    console.log('Role mismatch, redirecting');
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (role === 'alumno') {
      return <Navigate to="/alumno" replace />;
    }
    return <Navigate to="/" replace />;
  }

  console.log('Authentication passed, rendering children');
  return children;
};

export default ProtectedRoute;
