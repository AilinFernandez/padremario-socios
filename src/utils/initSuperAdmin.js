import { createUser, getUserByEmail } from '../services/userService';
import { ROLES } from './roles';

// Script para crear el super admin inicial
export const initializeSuperAdmin = async () => {
  try {
    const superAdminData = {
      nombre: 'Super',
      apellido: 'Administrador',
      email: 'admin@opm.org',
      rol: ROLES.SUPER_ADMIN,
      telefono: '',
      isActive: true
    };

    // Verificar si ya existe el super admin
    const existingUser = await getUserByEmail(superAdminData.email);
    
    if (!existingUser) {
      await createUser(superAdminData);
    }
  } catch (error) {
    // Error silencioso para no interrumpir la aplicación
  }
};

// Función para verificar si existe el super admin
export const checkSuperAdminExists = async () => {
  try {
    const existingUser = await getUserByEmail('admin@opm.org');
    return !!existingUser;
  } catch (error) {
    return false;
  }
}; 