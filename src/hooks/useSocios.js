import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../services/firebase';

export const useSocios = () => {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todos los socios
  const getSocios = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let q = collection(db, 'socios');
      
      // Aplicar filtros
      if (filters.estado) {
        q = query(q, where('estado', '==', filters.estado));
      }
      if (filters.sector) {
        q = query(q, where('sectores', 'array-contains', filters.sector));
      }
      if (filters.barrio) {
        q = query(q, where('barrio', '==', filters.barrio));
      }
      
      // Ordenar por fecha de alta
      q = query(q, orderBy('fechaAlta', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const sociosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSocios(sociosData);
    } catch (err) {
      setError('Error al cargar los socios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener un socio por ID
  const getSocioById = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, 'socios', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Socio no encontrado');
      }
    } catch (err) {
      setError('Error al obtener el socio: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Buscar socio por DNI
  const buscarPorDNI = async (dni) => {
    setLoading(true);
    setError(null);
    
    try {
      const q = query(
        collection(db, 'socios'),
        where('dni', '==', dni),
        limit(1)
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
    } catch (err) {
      setError('Error al buscar el socio: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo socio
  const crearSocio = async (socioData) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = await addDoc(collection(db, 'socios'), {
        ...socioData,
        fechaAlta: new Date(),
        ultimaActividad: new Date(),
        estado: 'activo'
      });
      
      // Agregar el nuevo socio a la lista
      const nuevoSocio = {
        id: docRef.id,
        ...socioData,
        fechaAlta: new Date(),
        ultimaActividad: new Date(),
        estado: 'activo'
      };
      
      setSocios(prev => [nuevoSocio, ...prev]);
      
      return docRef.id;
    } catch (err) {
      setError('Error al crear el socio: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar socio
  const actualizarSocio = async (id, socioData) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, 'socios', id);
      await updateDoc(docRef, {
        ...socioData,
        ultimaActividad: new Date()
      });
      
      // Actualizar en la lista local
      setSocios(prev => 
        prev.map(socio => 
          socio.id === id 
            ? { ...socio, ...socioData, ultimaActividad: new Date() }
            : socio
        )
      );
    } catch (err) {
      setError('Error al actualizar el socio: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar solo la última actividad
  const actualizarUltimaActividad = async (id) => {
    try {
      const docRef = doc(db, 'socios', id);
      await updateDoc(docRef, {
        ultimaActividad: new Date()
      });
      
      // Actualizar en la lista local
      setSocios(prev => 
        prev.map(socio => 
          socio.id === id 
            ? { ...socio, ultimaActividad: new Date() }
            : socio
        )
      );
    } catch (err) {
      console.error('Error al actualizar última actividad:', err);
      // No lanzamos el error para que no interrumpa la operación principal
    }
  };

  // Eliminar socio
  const eliminarSocio = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteDoc(doc(db, 'socios', id));
      
      // Remover de la lista local
      setSocios(prev => prev.filter(socio => socio.id !== id));
    } catch (err) {
      setError('Error al eliminar el socio: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas
  const getEstadisticas = async () => {
    try {
      const totalSocios = await getDocs(collection(db, 'socios'));
      const activos = await getDocs(query(collection(db, 'socios'), where('estado', '==', 'activo')));
      const inactivos = await getDocs(query(collection(db, 'socios'), where('estado', '==', 'inactivo')));
      
      return {
        total: totalSocios.size,
        activos: activos.size,
        inactivos: inactivos.size
      };
    } catch (err) {
      setError('Error al obtener estadísticas: ' + err.message);
      return { total: 0, activos: 0, inactivos: 0 };
    }
  };

  return {
    socios,
    loading,
    error,
    getSocios,
    getSocioById,
    buscarPorDNI,
    crearSocio,
    actualizarSocio,
    actualizarUltimaActividad,
    eliminarSocio,
    getEstadisticas
  };
}; 