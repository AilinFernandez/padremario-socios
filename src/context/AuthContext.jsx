import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserByEmail, updateUser } from '../services/userService';
import { obtenerPermisosUsuario, esSuperAdmin, esAdmin } from '../utils/roles';
import { createAuditLog, AUDIT_ACTIONS } from '../services/auditService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para crear logs de auditoría directamente
  const createAuditLogDirectly = async (action, details = {}, additionalData = {}) => {
    try {
      if (!currentUser) {
        console.warn('No se puede crear log de auditoría: usuario no autenticado');
        return;
      }

      const userInfo = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: userData?.name || userData?.email || currentUser.email,
        userRole: userData?.role || 'unknown'
      };

      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`
      };

      const auditData = {
        userId: userInfo.userId,
        userEmail: userInfo.userEmail,
        userName: userInfo.userName,
        userRole: userInfo.userRole,
        action,
        actionLabel: AUDIT_ACTIONS[action] || action,
        details,
        page: window.location.pathname,
        url: window.location.href,
        ...browserInfo,
        ...additionalData,
        success: true,
        errorMessage: null
      };

      await createAuditLog(auditData);
    } catch (error) {
      console.error('Error al crear log de auditoría:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Obtener datos adicionales del usuario desde Firestore
      const userDoc = await getUserByEmail(email);
      if (userDoc) {
        setUserData(userDoc);
        const permissions = obtenerPermisosUsuario(userDoc);
        setUserPermissions(permissions);
        
        // Registrar login exitoso
        const auditData = {
          userId: userCredential.user.uid,
          userEmail: userCredential.user.email,
          userName: userDoc.name || userDoc.email || userCredential.user.email,
          userRole: userDoc.rol || userDoc.role || 'unknown',
          action: AUDIT_ACTIONS.LOGIN_SUCCESS,
          actionLabel: AUDIT_ACTIONS.LOGIN_SUCCESS,
          details: {},
          page: window.location.pathname,
          url: window.location.href,
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          success: true,
          errorMessage: null
        };
        
        await createAuditLog(auditData);
      } else {
        // Si el usuario no está en Firestore, permitir login pero sin datos extra
        setUserData(null);
        setUserPermissions([]);
        
        // Log de login exitoso (sin datos adicionales)
        const auditData = {
          userId: userCredential.user.uid,
          userEmail: userCredential.user.email,
          userName: userCredential.user.email,
          userRole: 'unknown',
          action: AUDIT_ACTIONS.LOGIN_SUCCESS,
          actionLabel: AUDIT_ACTIONS.LOGIN_SUCCESS,
          details: {},
          page: window.location.pathname,
          url: window.location.href,
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          success: true,
          errorMessage: null
        };
        
        await createAuditLog(auditData);
      }
      return userCredential;
    } catch (error) {
      console.error('Error en login:', error);
      
      // Log de login fallido
      try {
        const auditData = {
          userId: null,
          userEmail: email,
          userName: email,
          userRole: 'unknown',
          action: AUDIT_ACTIONS.LOGIN_FAILED,
          actionLabel: AUDIT_ACTIONS.LOGIN_FAILED,
          details: {},
          page: window.location.pathname,
          url: window.location.href,
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          success: false,
          errorMessage: error.message
        };
        await createAuditLog(auditData);
      } catch (auditError) {
        console.error('Error al registrar login fallido:', auditError);
      }
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Log de logout
      await createAuditLogDirectly(AUDIT_ACTIONS.LOGOUT);
      
      await signOut(auth);
      setUserData(null);
      setUserPermissions([]);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  };

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = (permission) => {
    return userPermissions.includes(permission);
  };

  // Función para verificar si el usuario es super admin
  const isSuperAdmin = () => {
    return esSuperAdmin(userData);
  };

  // Función para verificar si el usuario es admin
  const isAdmin = () => {
    return esAdmin(userData);
  };

  // Función para actualizar datos del usuario
  const updateUserData = (newUserData) => {
    setUserData(newUserData);
    const permissions = obtenerPermisosUsuario(newUserData);
    setUserPermissions(permissions);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Obtener datos adicionales del usuario desde Firestore
          const userDoc = await getUserByEmail(user.email);
          if (userDoc) {
            // Si el usuario no tiene authUid, actualizarlo
            if (!userDoc.authUid) {
              try {
                await updateUser(userDoc.id, { authUid: user.uid });
                userDoc.authUid = user.uid;
              } catch (error) {
                console.error('Error al actualizar authUid:', error);
              }
            }
            
            setUserData(userDoc);
            const permissions = obtenerPermisosUsuario(userDoc);
            setUserPermissions(permissions);
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
        }
      } else {
        setUserData(null);
        setUserPermissions([]);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    userPermissions,
    login,
    logout,
    signup,
    hasPermission,
    isSuperAdmin,
    isAdmin,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 