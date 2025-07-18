import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../utils/roles';
import SmartRedirect from './SmartRedirect';

const ProtectedRoute = ({ 
  children, 
  requiredPermission = null, 
  requireSuperAdmin = false,
  requireAdmin = false,
  fallbackPath = '/login'
}) => {
  const { currentUser, userData, hasPermission, isSuperAdmin, isAdmin } = useAuth();

  // Si no hay usuario autenticado, redirigir al login
  if (!currentUser) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Si no hay datos del usuario cargados, mostrar loading
  if (!userData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Verificar si requiere ser super admin
  if (requireSuperAdmin && !isSuperAdmin()) {
    return <SmartRedirect />;
  }

  // Verificar si requiere ser admin
  if (requireAdmin && !isAdmin()) {
    return <SmartRedirect />;
  }

  // Verificar permiso específico
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <SmartRedirect />;
  }

  return children;
};

export default ProtectedRoute; 