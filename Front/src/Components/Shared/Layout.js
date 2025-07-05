import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useStateContext } from '../Contexts';
import sidebarThemes from './Sidebar/sidebarTheme';

const Layout = ({ children }) => {
  const { user, carrera } = useStateContext();
  const carreraId = carrera && carrera.id_carrera ? String(carrera.id_carrera) : null;
  let theme = sidebarThemes.guest;
  if (user && carreraId && sidebarThemes[carreraId]) {
    theme = sidebarThemes[carreraId];
  }
  console.log('user:', user);
  console.log('carrera:', carrera);
  console.log('carreraId:', carreraId);
  console.log('sidebarThemes:', sidebarThemes);
  console.log('theme usado:', theme);

  useEffect(() => {
    document.body.style.background = theme.primary;
    return () => {
      document.body.style.background = '';
    };
  }, [theme.primary]);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        position: 'relative',
        background: theme.primary,
        flexWrap: 'wrap'
      }}
    >
      <Sidebar theme={theme} />
      <main
        style={{
          flex: 1,
          padding: '48px 0',
          minHeight: '100vh',
          background: theme.primary,
          zIndex: 1,
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            width: '95%',
            maxWidth: 1300,
            minHeight: '70vh',
            margin: '0 auto',
            padding: '32px 40px',
            boxSizing: 'border-box',
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 6px 24px #ccc'
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
