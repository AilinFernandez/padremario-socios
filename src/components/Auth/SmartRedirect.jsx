import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../utils/roles';

const SmartRedirect = () => {
  const { userPermissions } = useAuth();

  // Orden de prioridad de páginas (de más importante a menos)
  const pagePriority = [
    { path: '/dashboard', permission: PERMISOS.DASHBOARD_VIEW },
    { path: '/socios', permission: PERMISOS.SOCIOS_VIEW },
    { path: '/validacion', permission: PERMISOS.VALIDACION_VIEW },
    { path: '/reportes', permission: PERMISOS.REPORTES_VIEW },
    { path: '/usuarios', permission: PERMISOS.USERS_VIEW }
  ];

  // Encontrar la primera página a la que el usuario tiene acceso
  const firstAccessiblePage = pagePriority.find(page => 
    userPermissions.includes(page.permission)
  );

  // Si no tiene acceso a ninguna página, mostrar mensaje de error
  if (!firstAccessiblePage) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <h1>Sin acceso</h1>
          <p>No tienes permisos para acceder a ninguna sección del sistema.</p>
          <p>Contacta al administrador para solicitar permisos.</p>
        </div>
      </div>
    );
  }

  // Redirigir a la primera página accesible
  return <Navigate to={firstAccessiblePage.path} replace />;
};

export default SmartRedirect; 