import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from '../Components/Home';
import Carreras from '../Views/LandingView/Carreras';
import Inscripciones from '../Views/LandingView/Inscripciones';
import AlumnoProfile from '../Views/AlumnoView/Profile';
import InscripcionesAlumno from '../Views/AlumnoView/InscripcionesAlumno';
import Materias from '../Views/AlumnoView/Materias';
import Error404 from '../Views/Error404';
import LandingView from '../Views/LandingView';
import AlumnoView from '../Views/AlumnoView';
import SignUp from '../Views/LandingView/SignUp';
import RecoverPassword from '../Views/LandingView/Login/RecoverPassword';
import ResetPassword from '../Views/LandingView/Login/ResetPassword';
import Login from '../Views/LandingView/Login';
import AdminLogin from '../Views/AdminView/Login';
import AdminDashboard from '../Views/AdminView/Dashboard';
import AdminInformes from '../Views/AdminView/Informes';
import AdminLayout from '../Components/Shared/AdminLayout';
import Layout from '../Components/Shared/Layout';
import EncuestasAlumno from '../Views/AlumnoView/EncuestasAlumno';
import SolicitudesAlumno from '../Views/AlumnoView/SolicitudesAlumno';
import SolicitudesAdmin from '../Views/AdminView/Solicitudes';
import AdminFAQs from '../Views/AdminView/FAQs';
import AlumnoFAQs from '../Views/AlumnoView/FAQs';
import ProtectedRoute from '../Components/Shared/ProtectedRoute';

const RoutesLanding = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingView />}>
          <Route index element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recover-password" element={<RecoverPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/carreras" element={<Carreras />} />
          <Route path="/inscripciones" element={<Inscripciones />} />
        </Route>

        <Route
          path="/alumno"
          element={
            <ProtectedRoute requiredRole="alumno">
              <AlumnoView />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="profile/:id" element={<AlumnoProfile />} />
          <Route path="materias" element={<Materias />} />
          <Route path="inscripciones" element={<InscripcionesAlumno />} />
          <Route path="encuestas" element={<EncuestasAlumno />} />
          <Route path="solicitudes" element={<SolicitudesAlumno idAlumno={1} />} />
          <Route path="faqs" element={<AlumnoFAQs />} />
        </Route>

        {/* Rutas de Administrador */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="informes" element={<AdminInformes />} />
          <Route path="solicitudes" element={<SolicitudesAdmin />} />
          <Route path="faqs" element={<AdminFAQs />} />
        </Route>

        <Route path="*" element={<Error404 />} />
      </Routes>
    </Layout>
  );
};

export default RoutesLanding;
