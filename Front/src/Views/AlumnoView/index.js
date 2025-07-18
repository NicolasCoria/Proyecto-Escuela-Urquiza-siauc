import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AlumnoMenu from './AlumnoMenu';
import EncuestasAlumno from './EncuestasAlumno';
import Profile from './Profile';
import InscripcionesAlumno from './InscripcionesAlumno';
import Materias from './Materias';

const AlumnoView = () => {
  return (
    <div style={{ display: 'flex' }}>
      <AlumnoMenu />
      <div style={{ flex: 1, padding: '20px' }}>
        <Routes>
          <Route path="/" element={<EncuestasAlumno />} />
          <Route path="/encuestas" element={<EncuestasAlumno />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/inscripciones" element={<InscripcionesAlumno />} />
          <Route path="/materias" element={<Materias />} />
        </Routes>
      </div>
    </div>
  );
};

export default AlumnoView;
