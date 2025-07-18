import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SmartRedirect from './components/Auth/SmartRedirect';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import AuditNavigation from './components/AuditNavigation';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SociosList from './pages/Socios/SociosList';
import NuevoSocio from './pages/Socios/NuevoSocio';
import SocioDetail from './pages/Socios/SocioDetail';
import EditarSocio from './pages/Socios/EditarSocio';
import Validacion from './pages/Validacion';
import Reportes from './pages/Reportes';
import UsuariosList from './pages/Usuarios/UsuariosList';
import UserProfile from './pages/Usuarios/UserProfile';
import Auditoria from './pages/Auditoria/Auditoria';
import Comunicaciones from './pages/Comunicaciones/Comunicaciones';
import Register from './pages/Register';

// Importar estilos
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/variables.css';
import './styles/components.css';
import './App.css';

// Importar permisos
import { PERMISOS } from './utils/roles';

// Componente de layout principal
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Escuchar cambios en localStorage para el estado colapsado
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sidebarCollapsed');
      setSidebarCollapsed(saved ? JSON.parse(saved) : false);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <AuditNavigation />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

// Componente para inicializar el super admin
const SuperAdminInitializer = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    const initializeSuperAdmin = async () => {
      try {
        // Solo inicializar si no hay usuario logueado (para evitar loops)
        if (!currentUser) {
          const { checkSuperAdminExists } = await import('./utils/initSuperAdmin');
          const exists = await checkSuperAdminExists();
          
          if (!exists) {
            const { initializeSuperAdmin } = await import('./utils/initSuperAdmin');
            await initializeSuperAdmin();
          }
        }
      } catch (error) {
        // Error silencioso para no interrumpir la aplicación
      }
    };

    initializeSuperAdmin();
  }, [currentUser]);

  return null;
};

// Componente principal de la aplicación
const AppContent = () => {
  return (
    <Router>
      <SuperAdminInitializer />
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas protegidas con permisos específicos */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredPermission={PERMISOS.DASHBOARD_VIEW}>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/socios" element={
          <ProtectedRoute requiredPermission={PERMISOS.SOCIOS_VIEW}>
            <MainLayout>
              <SociosList />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/socios/nuevo" element={
          <ProtectedRoute requiredPermission={PERMISOS.SOCIOS_CREATE}>
            <MainLayout>
              <NuevoSocio />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/socios/:id" element={
          <ProtectedRoute requiredPermission={PERMISOS.SOCIOS_VIEW}>
            <MainLayout>
              <SocioDetail />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/socios/:id/editar" element={
          <ProtectedRoute requiredPermission={PERMISOS.SOCIOS_EDIT}>
            <MainLayout>
              <EditarSocio />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/validacion" element={
          <ProtectedRoute requiredPermission={PERMISOS.VALIDACION_VIEW}>
            <MainLayout>
              <Validacion />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/reportes" element={
          <ProtectedRoute requiredPermission={PERMISOS.REPORTES_VIEW}>
            <MainLayout>
              <Reportes />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/usuarios" element={
          <ProtectedRoute requiredPermission={PERMISOS.USERS_VIEW}>
            <MainLayout>
              <UsuariosList />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/usuarios/:userId" element={
          <ProtectedRoute requiredPermission={PERMISOS.USERS_VIEW}>
            <MainLayout>
              <UserProfile />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/auditoria" element={
          <ProtectedRoute requiredPermission={PERMISOS.USERS_VIEW}>
            <MainLayout>
              <Auditoria />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/comunicaciones" element={
          <ProtectedRoute requiredPermission={PERMISOS.SOCIOS_VIEW}>
            <MainLayout>
              <Comunicaciones />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Ruta por defecto - redirección inteligente */}
        <Route path="/" element={
          <ProtectedRoute>
            <SmartRedirect />
          </ProtectedRoute>
        } />
        
        {/* Ruta 404 */}
        <Route path="*" element={
          <ProtectedRoute>
            <MainLayout>
              <div className="container mt-5">
                <div className="text-center">
                  <h1>404 - Página no encontrada</h1>
                  <p>La página que buscas no existe.</p>
                </div>
              </div>
            </MainLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

// Componente principal
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App; 