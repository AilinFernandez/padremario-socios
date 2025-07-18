import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

const AUDIT_COLLECTION = 'audit_logs';

// Tipos de acciones que se pueden auditar
export const AUDIT_ACTIONS = {
  // Autenticación
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  
  // Socios
  SEARCH_SOCIOS: 'SEARCH_SOCIOS',
  CREATE_SOCIO: 'CREATE_SOCIO',
  EDIT_SOCIO: 'EDIT_SOCIO',
  DELETE_SOCIO: 'DELETE_SOCIO',
  VIEW_SOCIO: 'VIEW_SOCIO',
  
  // Validación
  SEARCH_VALIDACION: 'SEARCH_VALIDACION',
  VIEW_SOCIO_DETAILS: 'VIEW_SOCIO_DETAILS',
  
  // Reportes
  GENERATE_REPORT: 'GENERATE_REPORT',
  EXPORT_DATA: 'EXPORT_DATA',
  
  // Usuarios
  CREATE_USER: 'CREATE_USER',
  EDIT_USER: 'EDIT_USER',
  CHANGE_USER_ROLE: 'CHANGE_USER_ROLE',
  TOGGLE_USER_STATUS: 'TOGGLE_USER_STATUS',
  
  // Navegación
  NAVIGATE_TO_PAGE: 'NAVIGATE_TO_PAGE'
};

// Etiquetas legibles para las acciones
export const ACTION_LABELS = {
  [AUDIT_ACTIONS.LOGIN_SUCCESS]: 'Inicio de sesión exitoso',
  [AUDIT_ACTIONS.LOGIN_FAILED]: 'Intento de inicio de sesión fallido',
  [AUDIT_ACTIONS.LOGOUT]: 'Cierre de sesión',
  [AUDIT_ACTIONS.REGISTER]: 'Registro de usuario',
  [AUDIT_ACTIONS.SEARCH_SOCIOS]: 'Búsqueda de socios',
  [AUDIT_ACTIONS.CREATE_SOCIO]: 'Crear socio',
  [AUDIT_ACTIONS.EDIT_SOCIO]: 'Editar socio',
  [AUDIT_ACTIONS.DELETE_SOCIO]: 'Eliminar socio',
  [AUDIT_ACTIONS.VIEW_SOCIO]: 'Ver socio',
  [AUDIT_ACTIONS.SEARCH_VALIDACION]: 'Búsqueda en validación',
  [AUDIT_ACTIONS.VIEW_SOCIO_DETAILS]: 'Ver detalles de socio',
  [AUDIT_ACTIONS.GENERATE_REPORT]: 'Generar reporte',
  [AUDIT_ACTIONS.EXPORT_DATA]: 'Exportar datos',
  [AUDIT_ACTIONS.CREATE_USER]: 'Crear usuario',
  [AUDIT_ACTIONS.EDIT_USER]: 'Editar usuario',
  [AUDIT_ACTIONS.CHANGE_USER_ROLE]: 'Cambiar rol de usuario',
  [AUDIT_ACTIONS.TOGGLE_USER_STATUS]: 'Activar/desactivar usuario',
  [AUDIT_ACTIONS.NAVIGATE_TO_PAGE]: 'Navegar a página'
};

// Crear un log de auditoría
export const createAuditLog = async (auditData) => {
  try {
    const logData = {
      ...auditData,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, AUDIT_COLLECTION), logData);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Obtener logs de auditoría con filtros
export const getAuditLogs = async (filters = {}) => {
  try {
    let q = collection(db, AUDIT_COLLECTION);
    
    // Aplicar filtros que no requieren índices compuestos
    if (filters.action) {
      q = query(q, where('action', '==', filters.action));
    }
    
    // Ordenar por timestamp descendente
    q = query(q, orderBy('timestamp', 'desc'));
    
    // Limitar resultados si se especifica
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const querySnapshot = await getDocs(q);
    
    let logs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
    }));
    
    // Aplicar filtros adicionales en el cliente para evitar índices compuestos
    if (filters.userEmail) {
      logs = logs.filter(log => log.userEmail === filters.userEmail);
    }
    
    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }
    
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Incluir todo el día final
      
      logs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate <= endDate;
      });
    }
    
    return logs;
  } catch (error) {
    throw error;
  }
};

// Obtener logs de un usuario específico por userId
export const getUserAuditLogs = async (userId, limitCount = 50) => {
  return getAuditLogs({ userId, limit: limitCount });
};

// Obtener logs de un usuario específico por email
export const getUserAuditLogsByEmail = async (userEmail, limitCount = 50) => {
  return getAuditLogs({ userEmail, limit: limitCount });
};

// Obtener logs recientes (últimas 24 horas)
export const getRecentAuditLogs = async (limitCount = 100) => {
  try {
    // Simplemente obtener los logs más recientes sin filtro de fecha
    // para evitar problemas con índices compuestos
    let q = query(
      collection(db, AUDIT_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
    }));
  } catch (error) {
    throw error;
  }
};

// Obtener estadísticas de actividad de un usuario por userId
export const getUserActivityStats = async (userId, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logs = await getAuditLogs({
      userId,
      startDate,
      endDate: new Date()
    });
    
    return calculateUserStats(logs);
  } catch (error) {
    throw error;
  }
};

// Obtener estadísticas de actividad de un usuario por email
export const getUserActivityStatsByEmail = async (userEmail, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logs = await getAuditLogs({
      userEmail,
      startDate,
      endDate: new Date()
    });
    
    return calculateUserStats(logs);
  } catch (error) {
    throw error;
  }
};

// Función helper para calcular estadísticas
const calculateUserStats = (logs) => {
  const stats = {
    totalActions: logs.length,
    totalSessionTime: 0,
    sessions: 0,
    lastActivity: null,
    actionsByType: {}
  };
  
  let sessionStart = null;
  let totalSessionTime = 0;
  
  logs.forEach(log => {
    // Contar acciones por tipo
    if (!stats.actionsByType[log.action]) {
      stats.actionsByType[log.action] = 0;
    }
    stats.actionsByType[log.action]++;
    
    // Calcular tiempo de sesión
    if (log.action === AUDIT_ACTIONS.LOGIN_SUCCESS) {
      sessionStart = log.timestamp;
      stats.sessions++;
    } else if (log.action === AUDIT_ACTIONS.LOGOUT && sessionStart) {
      const sessionDuration = log.timestamp - sessionStart;
      totalSessionTime += sessionDuration;
      sessionStart = null;
    }
    
    // Última actividad
    if (!stats.lastActivity || log.timestamp > stats.lastActivity) {
      stats.lastActivity = log.timestamp;
    }
  });
  
  stats.totalSessionTime = totalSessionTime;
  
  return stats;
};

// Verificar si un usuario está inactivo
export const checkUserInactivity = async (userId, inactivityMinutes = 30) => {
  try {
    const logs = await getUserAuditLogs(userId, 1);
    
    if (logs.length === 0) {
      return { isInactive: true, lastActivity: null };
    }
    
    const lastActivity = logs[0].timestamp;
    const now = new Date();
    const timeDiff = now - lastActivity;
    const minutesDiff = timeDiff / (1000 * 60);
    
    return {
      isInactive: minutesDiff > inactivityMinutes,
      lastActivity,
      minutesSinceLastActivity: Math.floor(minutesDiff)
    };
  } catch (error) {
    throw error;
  }
};

// Obtener todos los logs del sistema (para super admin)
export const getAllAuditLogs = async (limitCount = 1000) => {
  try {
    let q = query(
      collection(db, AUDIT_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
    }));
  } catch (error) {
    throw error;
  }
};

// Obtener usuarios inactivos
export const getInactiveUsers = async (inactivityMinutes = 30) => {
  try {
    const recentLogs = await getRecentAuditLogs(1000);
    
    // Agrupar por usuario y encontrar la última actividad
    const userLastActivity = {};
    
    recentLogs.forEach(log => {
      if (!userLastActivity[log.userId] || log.timestamp > userLastActivity[log.userId]) {
        userLastActivity[log.userId] = log.timestamp;
      }
    });
    
    const now = new Date();
    const inactiveUsers = [];
    
    Object.entries(userLastActivity).forEach(([userId, lastActivity]) => {
      const timeDiff = now - lastActivity;
      const minutesDiff = timeDiff / (1000 * 60);
      
      if (minutesDiff > inactivityMinutes) {
        inactiveUsers.push({
          userId,
          lastActivity,
          minutesSinceLastActivity: Math.floor(minutesDiff)
        });
      }
    });
    
    return inactiveUsers;
  } catch (error) {
    throw error;
  }
}; 