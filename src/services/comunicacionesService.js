import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from '../context/AuthContext';

class ComunicacionesService {
  constructor() {
    this.collectionName = 'comunicaciones';
  }

  // Crear nueva comunicación
  async crearComunicacion(comunicacionData) {
    try {
      const comunicacion = {
        ...comunicacionData,
        fechaCreacion: serverTimestamp(),
        estado: 'borrador',
        estadisticas: {
          totalEnviados: 0,
          exitosos: 0,
          fallidos: 0,
          pendientes: 0
        }
      };

      const docRef = await addDoc(collection(db, this.collectionName), comunicacion);
      return {
        success: true,
        id: docRef.id,
        data: comunicacion
      };
    } catch (error) {
      console.error('Error creando comunicación:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener todas las comunicaciones
  async obtenerComunicaciones(limitCount = 50) {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('fechaCreacion', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const comunicaciones = [];
      
      querySnapshot.forEach((doc) => {
        comunicaciones.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: comunicaciones
      };
    } catch (error) {
      console.error('Error obteniendo comunicaciones:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener comunicación por ID
  async obtenerComunicacion(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: {
            id: docSnap.id,
            ...docSnap.data()
          }
        };
      } else {
        return {
          success: false,
          error: 'Comunicación no encontrada'
        };
      }
    } catch (error) {
      console.error('Error obteniendo comunicación:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Actualizar comunicación
  async actualizarComunicacion(id, datosActualizados) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...datosActualizados,
        fechaActualizacion: serverTimestamp()
      });
      
      return {
        success: true,
        message: 'Comunicación actualizada correctamente'
      };
    } catch (error) {
      console.error('Error actualizando comunicación:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Eliminar comunicación
  async eliminarComunicacion(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      
      return {
        success: true,
        message: 'Comunicación eliminada correctamente'
      };
    } catch (error) {
      console.error('Error eliminando comunicación:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Actualizar estadísticas de envío
  async actualizarEstadisticas(id, estadisticas) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        estadisticas: estadisticas,
        fechaEnvio: serverTimestamp(),
        estado: 'enviado'
      });
      
      return {
        success: true,
        message: 'Estadísticas actualizadas'
      };
    } catch (error) {
      console.error('Error actualizando estadísticas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener comunicaciones por tipo
  async obtenerComunicacionesPorTipo(tipo) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('tipo', '==', tipo),
        orderBy('fechaCreacion', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const comunicaciones = [];
      
      querySnapshot.forEach((doc) => {
        comunicaciones.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: comunicaciones
      };
    } catch (error) {
      console.error('Error obteniendo comunicaciones por tipo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener estadísticas generales
  async obtenerEstadisticasGenerales() {
    try {
      const comunicaciones = await this.obtenerComunicaciones(1000);
      
      if (!comunicaciones.success) {
        return comunicaciones;
      }
      
      const stats = {
        total: comunicaciones.data.length,
        enviadas: comunicaciones.data.filter(c => c.estado === 'enviado').length,
        borradores: comunicaciones.data.filter(c => c.estado === 'borrador').length,
        porTipo: {}
      };
      
      // Contar por tipo
      comunicaciones.data.forEach(com => {
        if (!stats.porTipo[com.tipo]) {
          stats.porTipo[com.tipo] = 0;
        }
        stats.porTipo[com.tipo]++;
      });
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new ComunicacionesService(); 