import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAudit } from '../hooks/useAudit';

const AuditNavigation = () => {
  const location = useLocation();
  const { logNavigation } = useAudit();

  useEffect(() => {
    // Obtener el nombre de la página basado en la ruta
    const getPageName = (pathname) => {
      const pageMap = {
        '/': 'Dashboard',
        '/dashboard': 'Dashboard',
        '/socios': 'Lista de Socios',
        '/socios/nuevo': 'Nuevo Socio',
        '/socios/': 'Detalle de Socio',
        '/validacion': 'Validación',
        '/reportes': 'Reportes',
        '/usuarios': 'Gestión de Usuarios',
        '/usuarios/': 'Perfil de Usuario',
        '/auditoria': 'Auditoría',
        '/configuracion': 'Configuración'
      };

      // Buscar la ruta más específica que coincida
      for (const [route, name] of Object.entries(pageMap)) {
        if (pathname.startsWith(route)) {
          return name;
        }
      }

      return 'Página Desconocida';
    };

    const pageName = getPageName(location.pathname);
    
    // Solo registrar si no es la página inicial
    if (location.pathname !== '/') {
      logNavigation(location.pathname, pageName);
    }
  }, [location.pathname, logNavigation]);

  return null; // Este componente no renderiza nada
};

export default AuditNavigation; 