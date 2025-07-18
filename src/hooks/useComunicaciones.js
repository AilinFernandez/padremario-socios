import { useState, useEffect } from 'react';
import comunicacionesService from '../services/comunicacionesService';
import { useSocios } from './useSocios';
import { useAuth } from '../context/AuthContext';

export const useComunicaciones = () => {
  const [comunicaciones, setComunicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const { socios } = useSocios();
  const { currentUser } = useAuth();

  // Cargar comunicaciones
  const cargarComunicaciones = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await comunicacionesService.obtenerComunicaciones();
      if (result.success) {
        setComunicaciones(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error cargando comunicaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      const result = await comunicacionesService.obtenerEstadisticasGenerales();
      if (result.success) {
        setEstadisticas(result.data);
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  // Crear nueva comunicación
  const crearComunicacion = async (datos) => {
    setLoading(true);
    setError(null);
    
    try {
      const comunicacionData = {
        ...datos,
        creadoPor: currentUser?.uid || 'sistema',
        creadoPorEmail: currentUser?.email || 'sistema@opm.com',
        creadoPorNombre: currentUser?.displayName || 'Sistema'
      };

      const result = await comunicacionesService.crearComunicacion(comunicacionData);
      
      if (result.success) {
        await cargarComunicaciones();
        await cargarEstadisticas();
        return { success: true, id: result.id };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError('Error creando comunicación');
      console.error(err);
      return { success: false, error: 'Error creando comunicación' };
    } finally {
      setLoading(false);
    }
  };

  // Filtrar destinatarios según criterios
  const filtrarDestinatarios = (filtros) => {
    let destinatarios = [...socios];

    // Filtrar por sectores
    if (filtros.sectores && filtros.sectores.length > 0) {
      destinatarios = destinatarios.filter(socio => 
        socio.sectores && socio.sectores.some(sector => filtros.sectores.includes(sector))
      );
    }

    // Filtrar por estado
    if (filtros.estado && filtros.estado !== '') {
      destinatarios = destinatarios.filter(socio => socio.estado === filtros.estado);
    }

    // Filtrar por barrio
    if (filtros.barrio && filtros.barrio !== '') {
      destinatarios = destinatarios.filter(socio => socio.barrio === filtros.barrio);
    }

    // Filtrar solo socios con email
    destinatarios = destinatarios.filter(socio => socio.email && socio.email.trim() !== '');

    return destinatarios;
  };

  // Eliminar comunicación
  const eliminarComunicacion = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await comunicacionesService.eliminarComunicacion(id);
      
      if (result.success) {
        await cargarComunicaciones();
        await cargarEstadisticas();
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError('Error eliminando comunicación');
      console.error(err);
      return { success: false, error: 'Error eliminando comunicación' };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar comunicación
  const actualizarComunicacion = async (id, datos) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await comunicacionesService.actualizarComunicacion(id, datos);
      
      if (result.success) {
        await cargarComunicaciones();
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError('Error actualizando comunicación');
      console.error(err);
      return { success: false, error: 'Error actualizando comunicación' };
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el hook
  useEffect(() => {
    cargarComunicaciones();
    cargarEstadisticas();
  }, []);

  return {
    comunicaciones,
    loading,
    error,
    estadisticas,
    cargarComunicaciones,
    crearComunicacion,
    eliminarComunicacion,
    actualizarComunicacion,
    filtrarDestinatarios,
    cargarEstadisticas
  };
}; 