import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useStateContext } from '../../Components/Contexts';

const SuperAdminView = () => {
  const { token } = useStateContext();

  if (!token) {
    return <Navigate to={'/login'} />;
  } else if (
    sessionStorage.getItem('role') === 'AF' ||
    sessionStorage.getItem('role') === 'DS' ||
    sessionStorage.getItem('role') === 'ITI'
  ) {
    return <Navigate to={'/alumno'} />;
  }
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default SuperAdminView;
