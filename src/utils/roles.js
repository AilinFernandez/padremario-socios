// Roles del sistema
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  VALIDADOR: 'validador',
  GESTOR: 'gestor'
};

// Etiquetas de roles para mostrar en la UI
export const ROLES_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Administrador',
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.VALIDADOR]: 'Validador',
  [ROLES.GESTOR]: 'Gestor de Socios'
};

// Permisos del sistema
export const PERMISOS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard_view',
  
  // Gestión de socios
  SOCIOS_VIEW: 'socios_view',
  SOCIOS_CREATE: 'socios_create',
  SOCIOS_EDIT: 'socios_edit',
  SOCIOS_DELETE: 'socios_delete',
  
  // Validación rápida
  VALIDACION_VIEW: 'validacion_view',
  VALIDACION_EDIT: 'validacion_edit',
  
  // Reportes
  REPORTES_VIEW: 'reportes_view',
  REPORTES_EXPORT: 'reportes_export',
  
  // Configuración
  CONFIG_VIEW: 'config_view',
  CONFIG_EDIT: 'config_edit',
  
  // Gestión de usuarios
  USERS_VIEW: 'users_view',
  USERS_CREATE: 'users_create',
  USERS_EDIT: 'users_edit',
  USERS_DELETE: 'users_delete'
};

// Mapeo de roles a permisos
export const ROLES_PERMISOS = {
  [ROLES.SUPER_ADMIN]: [
    PERMISOS.DASHBOARD_VIEW,
    PERMISOS.SOCIOS_VIEW,
    PERMISOS.SOCIOS_CREATE,
    PERMISOS.SOCIOS_EDIT,
    PERMISOS.SOCIOS_DELETE,
    PERMISOS.VALIDACION_VIEW,
    PERMISOS.VALIDACION_EDIT,
    PERMISOS.REPORTES_VIEW,
    PERMISOS.REPORTES_EXPORT,
    PERMISOS.CONFIG_VIEW,
    PERMISOS.CONFIG_EDIT,
    PERMISOS.USERS_VIEW,
    PERMISOS.USERS_CREATE,
    PERMISOS.USERS_EDIT,
    PERMISOS.USERS_DELETE
  ],
  [ROLES.ADMIN]: [
    PERMISOS.DASHBOARD_VIEW,
    PERMISOS.SOCIOS_VIEW,
    PERMISOS.SOCIOS_CREATE,
    PERMISOS.SOCIOS_EDIT,
    PERMISOS.SOCIOS_DELETE,
    PERMISOS.VALIDACION_VIEW,
    PERMISOS.VALIDACION_EDIT,
    PERMISOS.REPORTES_VIEW,
    PERMISOS.REPORTES_EXPORT,
    PERMISOS.CONFIG_VIEW,
    PERMISOS.USERS_VIEW
  ],
  [ROLES.GESTOR]: [
    PERMISOS.DASHBOARD_VIEW,
    PERMISOS.SOCIOS_VIEW,
    PERMISOS.SOCIOS_CREATE,
    PERMISOS.SOCIOS_EDIT,
    PERMISOS.VALIDACION_VIEW
  ],
  [ROLES.VALIDADOR]: [
    PERMISOS.VALIDACION_VIEW,
    PERMISOS.VALIDACION_EDIT
  ]
};

// Función para verificar si un usuario tiene un permiso específico
export const tienePermiso = (usuario, permiso) => {
  if (!usuario || !usuario.rol) return false;
  const permisosDelRol = ROLES_PERMISOS[usuario.rol] || [];
  return permisosDelRol.includes(permiso);
};

// Función para obtener todos los permisos de un usuario
export const obtenerPermisosUsuario = (usuario) => {
  if (!usuario || !usuario.rol) return [];
  return ROLES_PERMISOS[usuario.rol] || [];
};

// Función para verificar si un usuario es super admin
export const esSuperAdmin = (usuario) => {
  return usuario?.rol === ROLES.SUPER_ADMIN;
};

// Función para verificar si un usuario es admin o super admin
export const esAdmin = (usuario) => {
  return usuario?.rol === ROLES.ADMIN || usuario?.rol === ROLES.SUPER_ADMIN;
}; 