// Utilidades para manejo de fechas en el sistema OPM

/**
 * Convierte una fecha de Firestore (Timestamp o Date) a una fecha nativa de JavaScript
 * @param {any} date - Fecha de Firestore (Timestamp) o Date nativo
 * @returns {Date|null} - Fecha nativa de JavaScript o null si no es válida
 */
export const convertFirestoreDate = (date) => {
  if (!date) return null;
  
  // Si ya es una fecha nativa
  if (date instanceof Date) {
    return date;
  }
  
  // Si es un Timestamp de Firestore
  if (date.toDate && typeof date.toDate === 'function') {
    return date.toDate();
  }
  
  // Si es un objeto con propiedades de timestamp
  if (date.seconds && date.nanoseconds) {
    return new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
  }
  
  // Intentar crear una fecha desde string o número
  try {
    const newDate = new Date(date);
    return isNaN(newDate.getTime()) ? null : newDate;
  } catch (error) {
    console.warn('Error al convertir fecha:', date, error);
    return null;
  }
};

/**
 * Formatea una fecha para mostrar en la interfaz
 * @param {any} date - Fecha de Firestore (Timestamp) o Date nativo
 * @param {Object} options - Opciones de formato
 * @returns {string} - Fecha formateada o 'N/A' si no es válida
 */
export const formatDate = (date, options = {}) => {
  const convertedDate = convertFirestoreDate(date);
  
  if (!convertedDate) {
    return options.fallback || 'N/A';
  }
  
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  return convertedDate.toLocaleDateString('es-AR', formatOptions);
};

/**
 * Formatea una fecha con hora para mostrar en la interfaz
 * @param {any} date - Fecha de Firestore (Timestamp) o Date nativo
 * @param {Object} options - Opciones de formato
 * @returns {string} - Fecha y hora formateada o 'N/A' si no es válida
 */
export const formatDateTime = (date, options = {}) => {
  const convertedDate = convertFirestoreDate(date);
  
  if (!convertedDate) {
    return options.fallback || 'N/A';
  }
  
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  return convertedDate.toLocaleDateString('es-AR', formatOptions);
};

/**
 * Calcula la edad basada en una fecha de nacimiento
 * @param {any} fechaNacimiento - Fecha de nacimiento
 * @returns {number|null} - Edad en años o null si no es válida
 */
export const calcularEdad = (fechaNacimiento) => {
  const fechaNac = convertFirestoreDate(fechaNacimiento);
  
  if (!fechaNac) return null;
  
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mes = hoy.getMonth() - fechaNac.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }
  
  return edad;
};
