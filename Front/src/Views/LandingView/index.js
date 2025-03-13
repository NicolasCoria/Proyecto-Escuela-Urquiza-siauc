import React from 'react';
import { Outlet } from 'react-router';
import { Navigate } from 'react-router';

const LandingView = () => {
  if (sessionStorage.getItem('role') === 'SA') {
    return <Navigate to={'/super-admin'} />;
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

export default LandingView;
