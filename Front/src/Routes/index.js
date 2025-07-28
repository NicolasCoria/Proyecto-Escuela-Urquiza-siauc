import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from '../Components/Home';
import Carreras from '../Views/LandingView/Carreras';
import Inscripciones from '../Views/LandingView/Inscripciones';
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
import AdminProfile from '../Views/AdminView/Profile';
import AdminLayout from '../Components/Shared/AdminLayout';
import Layout from '../Components/Shared/Layout';
import SolicitudesAdmin from '../Views/AdminView/Solicitudes';
import AdminFAQs from '../Views/AdminView/FAQs';
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
          path="/alumno/*"
          element={
            <ProtectedRoute requiredRole="alumno">
              <AlumnoView />
            </ProtectedRoute>
          }
        />

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
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="informes" element={<AdminInformes />} />
          <Route path="solicitudes" element={<SolicitudesAdmin />} />
          <Route path="faqs" element={<AdminFAQs />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="*" element={<Error404 />} />
      </Routes>
    </Layout>
  );
};

export default RoutesLanding;
