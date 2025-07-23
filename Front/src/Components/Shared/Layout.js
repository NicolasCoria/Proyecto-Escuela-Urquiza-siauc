import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useStateContext } from '../Contexts';
import sidebarThemes from './Sidebar/sidebarTheme';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user, carrera } = useStateContext();
  const carreraId = carrera && carrera.id_carrera ? String(carrera.id_carrera) : null;
  let theme = sidebarThemes.guest;
  if (user && carreraId && sidebarThemes[carreraId]) {
    theme = sidebarThemes[carreraId];
  }

  // No mostrar Sidebar en rutas de admin
  const isAdminRoute = location.pathname.startsWith('/admin');

  console.log('user:', user);
  console.log('carrera:', carrera);
  console.log('carreraId:', carreraId);
  console.log('sidebarThemes:', sidebarThemes);
  console.log('theme usado:', theme);
  console.log('isAdminRoute:', isAdminRoute);

  useEffect(() => {
    document.body.style.background = theme.soft;
    return () => {
      document.body.style.background = '';
    };
  }, [theme.soft]);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        position: 'relative',
        background: theme.soft,
        flexWrap: 'wrap'
      }}
    >
      {!isAdminRoute && <Sidebar theme={theme} />}
      <main
        style={{
          flex: 1,
          padding: isAdminRoute ? '0' : '48px 0',
          minHeight: '100vh',
          background: isAdminRoute ? '#f7fafc' : theme.soft,
          zIndex: 1,
          width: '100%',
          boxSizing: 'border-box',
          display: isAdminRoute ? 'block' : 'flex',
          flexDirection: isAdminRoute ? 'unset' : 'column',
          alignItems: isAdminRoute ? 'unset' : 'center',
          justifyContent: isAdminRoute ? 'unset' : 'center'
        }}
      >
        <div
          style={{
            width: isAdminRoute ? '100%' : '95%',
            maxWidth: isAdminRoute ? 'none' : 1300,
            minHeight: isAdminRoute ? '100vh' : '70vh',
            margin: '0 auto',
            padding: isAdminRoute ? '0' : '32px 40px',
            boxSizing: 'border-box',
            background: isAdminRoute ? 'transparent' : '#fff',
            borderRadius: isAdminRoute ? 0 : 18,
            boxShadow: isAdminRoute ? 'none' : '0 6px 24px #ccc'
          }}
        >
          {/* Proveer el color primario a los hijos mediante contexto o prop si es necesario */}
          {children}
        </div>
      </main>
      <style>{`
        @media (max-width: 900px) {
          main {
            padding: 16px 4px !important;
          }
        }
        @media (max-width: 600px) {
          .${'sidebarBase'} {
            min-width: 60px !important;
            width: 60px !important;
            padding-top: 8px !important;
          }
          main {
            padding: 8px 2px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
