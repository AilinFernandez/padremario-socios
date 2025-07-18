import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { createAuditLog, AUDIT_ACTIONS } from '../services/auditService';

export const useAudit = () => {
  const { currentUser, userData } = useAuth();

  // Función para obtener información del usuario actual
  const getUserInfo = useCallback(() => {
    if (!currentUser || !userData) {
      return {
        userId: null,
        userEmail: null,
        userName: null,
        userRole: 'unknown'
      };
    }

    return {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: userData.name || userData.email || currentUser.email,
      userRole: userData.role || userData.rol || 'unknown'
    };
  }, [currentUser, userData]);

  // Función para obtener información del navegador
  const getBrowserInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`
    };
  }, []);

  // Función principal para crear logs de auditoría
  const logAction = useCallback(async (action, details = {}, additionalData = {}) => {
    try {
      if (!currentUser) {
        return;
      }

      const userInfo = getUserInfo();
      const browserInfo = getBrowserInfo();

      const auditData = {
        // Información del usuario
        userId: userInfo.userId,
        userEmail: userInfo.userEmail,
        userName: userInfo.userName,
        userRole: userInfo.userRole,
        
        // Información de la acción
        action,
        actionLabel: AUDIT_ACTIONS[action] || action,
        
        // Detalles específicos
        details,
        
        // Información del contexto
        page: window.location.pathname,
        url: window.location.href,
        
        // Información del navegador
        ...browserInfo,
        
        // Información adicional
        ...additionalData,
        
        // Resultado (por defecto exitoso)
        success: true,
        errorMessage: null
      };

      await createAuditLog(auditData);
    } catch (error) {
      console.error('Error al crear log de auditoría:', error);
      // No lanzar el error para no interrumpir la funcionalidad principal
    }
  }, [currentUser, getUserInfo, getBrowserInfo]);

  // Funciones específicas para acciones comunes
  const logLogin = useCallback(async (success = true, errorMessage = null) => {
    const action = success ? AUDIT_ACTIONS.LOGIN_SUCCESS : AUDIT_ACTIONS.LOGIN_FAILED;
    await logAction(action, {}, { success, errorMessage });
  }, [logAction]);

  const logLogout = useCallback(async () => {
    await logAction(AUDIT_ACTIONS.LOGOUT);
  }, [logAction]);

  const logNavigation = useCallback(async (page, pageName) => {
    await logAction(AUDIT_ACTIONS.NAVIGATE_TO_PAGE, {
      page,
      pageName
    });
  }, [logAction]);

  const logSearch = useCallback(async (searchType, searchTerm, filters = {}, resultsCount = 0) => {
    const action = searchType === 'socios' ? AUDIT_ACTIONS.SEARCH_SOCIOS : AUDIT_ACTIONS.SEARCH_VALIDACION;
    await logAction(action, {
      searchTerm,
      filters,
      resultsCount
    });
  }, [logAction]);

  const logSocioAction = useCallback(async (action, socioId, socioName, details = {}) => {
    await logAction(action, {
      socioId,
      socioName,
      ...details
    });
  }, [logAction]);

  const logUserAction = useCallback(async (action, targetUserId, targetUserEmail, details = {}) => {
    await logAction(action, {
      targetUserId,
      targetUserEmail,
      ...details
    });
  }, [logAction]);

  const logReportAction = useCallback(async (action, reportType, details = {}) => {
    await logAction(action, {
      reportType,
      ...details
    });
  }, [logAction]);

  // Función para medir tiempo de una acción
  const logTimedAction = useCallback(async (action, actionFunction, details = {}) => {
    const startTime = performance.now();
    
    try {
      const result = await actionFunction();
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      await logAction(action, {
        ...details,
        processingTime: `${processingTime.toFixed(2)}ms`,
        success: true
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      await logAction(action, {
        ...details,
        processingTime: `${processingTime.toFixed(2)}ms`,
        success: false,
        errorMessage: error.message
      });
      
      throw error;
    }
  }, [logAction]);

  return {
    logAction,
    logLogin,
    logLogout,
    logNavigation,
    logSearch,
    logSocioAction,
    logUserAction,
    logReportAction,
    logTimedAction,
    getUserInfo
  };
}; 