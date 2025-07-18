import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { ROLES, ROLES_LABELS } from '../utils/roles';

const USERS_COLLECTION = 'users';

// Obtener todos los usuarios
export const getUsers = async () => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

// Obtener un usuario por ID
export const getUserById = async (userId) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

// Obtener usuario por email
export const getUserByEmail = async (email) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', email)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error al obtener usuario por email:', error);
    throw error;
  }
};

// Crear un nuevo usuario
export const createUser = async (userData) => {
  try {
    const userDataWithTimestamp = {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };
    
    const docRef = await addDoc(collection(db, USERS_COLLECTION), userDataWithTimestamp);
    
    return {
      id: docRef.id,
      ...userDataWithTimestamp
    };
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

// Actualizar un usuario
export const updateUser = async (userId, userData) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const updateData = {
      ...userData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, updateData);
    
    return {
      id: userId,
      ...updateData
    };
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

// Eliminar un usuario (soft delete)
export const deleteUser = async (userId) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      isActive: false,
      deletedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

// Activar/desactivar usuario
export const toggleUserStatus = async (userId, isActive) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      isActive,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    throw error;
  }
};

// Cambiar rol de usuario
export const changeUserRole = async (userId, newRole) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      rol: newRole,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al cambiar rol del usuario:', error);
    throw error;
  }
};

// Obtener usuarios por rol
export const getUsersByRole = async (role) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('rol', '==', role),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    throw error;
  }
};

// Obtener usuarios activos
export const getActiveUsers = async () => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener usuarios activos:', error);
    throw error;
  }
};

// Verificar si un email ya existe
export const checkEmailExists = async (email) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', email)
    );
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error al verificar email:', error);
    throw error;
  }
};

// Verificar si un email está autorizado para registrarse (existe en users)
export const isEmailAuthorized = async (email) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', email)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      // Verificar que el usuario no tenga ya una cuenta de Firebase Auth
      return {
        authorized: true,
        role: userData.role,
        userId: userDoc.id,
        hasAuthAccount: userData.authUid ? true : false
      };
    }
    
    return {
      authorized: false,
      role: null,
      userId: null,
      hasAuthAccount: false
    };
  } catch (error) {
    console.error('Error al verificar autorización de email:', error);
    throw error;
  }
};

// Formatear datos de usuario para mostrar
export const formatUserForDisplay = (user) => {
  if (!user) return null;
  
  return {
    ...user,
    rolLabel: ROLES_LABELS[user.rol] || 'Sin rol',
    createdAt: user.createdAt?.toDate?.() || user.createdAt,
    updatedAt: user.updatedAt?.toDate?.() || user.updatedAt,
    deletedAt: user.deletedAt?.toDate?.() || user.deletedAt
  };
}; 