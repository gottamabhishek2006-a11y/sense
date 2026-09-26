import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LandingPage from '../pages/LandingPage';
import AuthPage from '../pages/AuthPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import AdminPage from '../pages/AdminPage';
import AdminLoginPage from '../pages/AdminLoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public landing page */}
        <Route index element={<LandingPage />} />

        {/* Citizen authentication routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="get-started" element={<SignupPage />} />
        <Route path="auth" element={<AuthPage />} />

        {/* Protected citizen dashboard */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* ────────────────────────────────────────
            ADMIN ROUTES
            - /admin/login → hidden admin auth page (not in citizen UI)
            - /admin → admin dashboard (requireAdmin guards on backend)
            - /admin/dashboard → same as /admin
            Frontend ProtectedRoute is a secondary guard (UX only).
            PRIMARY security is enforced by backend requireAuth + requireAdmin.
            ──────────────────────────────────────── */}

        {/* Hidden admin login — not linked in any citizen UI */}
        <Route path="admin/login" element={<AdminLoginPage />} />

        {/* Admin dashboard — role-protected by ProtectedRoute (UX) AND backend middleware */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Legacy route redirect — keep for backward compat */}
        <Route
          path="authorized"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
