
import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserRole } from './types';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import AdminLayout from './components/AdminLayout';
import StudentLayout from './components/StudentLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={user.role === UserRole.ADMIN ? "/admin" : "/student"} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/logindata" element={<OAuthCallback />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRole={UserRole.ADMIN}>
          <AdminLayout />
        </ProtectedRoute>
      } />

      <Route path="/student/*" element={
        <ProtectedRoute allowedRole={UserRole.STUDENT}>
          <StudentLayout />
        </ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};
