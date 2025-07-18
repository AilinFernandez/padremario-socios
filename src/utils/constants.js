// Constantes del sistema de gestión de socios OPM

export const SECTORES = {
  EDUCACION: 'educacion',
  SALUD: 'salud',
  TERCERA_EDAD: 'tercera_edad',
  DEPORTES: 'deportes',
  DISCAPACIDAD: 'discapacidad',
  CULTURAL: 'cultural',
  COMUNIDAD: 'comunidad'
};

export const SECTORES_LABELS = {
  [SECTORES.EDUCACION]: 'Educación',
  [SECTORES.SALUD]: 'Salud',
  [SECTORES.TERCERA_EDAD]: 'Tercera Edad',
  [SECTORES.DEPORTES]: 'Deportes',
  [SECTORES.DISCAPACIDAD]: 'Discapacidad',
  [SECTORES.CULTURAL]: 'Cultural',
  [SECTORES.COMUNIDAD]: 'Comunidad'
};

export const ESTADOS_SOCIO = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  BAJA_TEMPORAL: 'baja_temporal'
};

export const ESTADOS_SOCIO_LABELS = {
  [ESTADOS_SOCIO.ACTIVO]: 'Activo',
  [ESTADOS_SOCIO.INACTIVO]: 'Inactivo',
  [ESTADOS_SOCIO.BAJA_TEMPORAL]: 'Baja Temporal'
};

export const ETIQUETAS_EDUCACION = [
  'Jardín de Infantes',
  'Escuela Primaria',
  'Escuela Secundaria',
  'Instituto Superior',
  'Universidad',
  'Talleres'
];

export const ETIQUETAS_SALUD = [
  'Consultas Médicas',
  'Tratamientos',
  'Plasma Rico en Plaquetas',
  'Rehabilitación',
  'Prevención'
];

export const ETIQUETAS_TERCERA_EDAD = [
  'Grandes Conexiones',
  'Aquagym',
  'Taller de Memoria',
  'Actividades Sociales'
];

export const ETIQUETAS_DEPORTES = [
  'Fútbol',
  'Natación',
  'Polideportivo',
  'ESD Alfredo Di Stefano'
];

export const ETIQUETAS_DISCAPACIDAD = [
  'Centro Santa Inés',
  'Centro de Día CABA',
  'Centro de Día Santa Fe',
  'Programa Ágora'
];

export const ETIQUETAS_CULTURAL = [
  'Plaza de Artes y Oficios',
  'Actividades Culturales',
  'Eventos'
];

export const ETIQUETAS_COMUNIDAD = [
  'Centro La Huella',
  'Padrinazgo',
  'Programa unoXuno',
  'Voluntariado'
];

export const ETIQUETAS_POR_SECTOR = {
  [SECTORES.EDUCACION]: ETIQUETAS_EDUCACION,
  [SECTORES.SALUD]: ETIQUETAS_SALUD,
  [SECTORES.TERCERA_EDAD]: ETIQUETAS_TERCERA_EDAD,
  [SECTORES.DEPORTES]: ETIQUETAS_DEPORTES,
  [SECTORES.DISCAPACIDAD]: ETIQUETAS_DISCAPACIDAD,
  [SECTORES.CULTURAL]: ETIQUETAS_CULTURAL,
  [SECTORES.COMUNIDAD]: ETIQUETAS_COMUNIDAD
};

export const ORIGENES_CONTACTO = [
  'Recomendación',
  'Redes Sociales',
  'Página Web',
  'Volante',
  'Evento',
  'Otro'
];

export const VINCULOS_FAMILIARES = [
  'Padre',
  'Madre',
  'Hijo/a',
  'Hermano/a',
  'Abuelo/a',
  'Nieto/a',
  'Tío/a',
  'Sobrino/a',
  'Cónyuge',
  'Otro'
];

export const BARRIOS = [
  'González Catán',
  'Laferrere',
  'San Justo',
  'Ramos Mejía',
  'Morón',
  'Ituzaingó',
  'Castelar',
  'Haedo',
  'Villa Luzuriaga',
  'Ciudad Evita',
  'La Tablada',
  'Gregorio de Laferrere',
  'Isidro Casanova',
  'Rafael Castillo',
  'Lomas del Mirador',
  'Villa Madero',
  'Aldo Bonzi',
  'Ciudad Jardín',
  'Villa Fiorito',
  'Otro'
];

export const SECTOR_COLORS = {
  [SECTORES.EDUCACION]: 'bg-primary',
  [SECTORES.SALUD]: 'bg-success',
  [SECTORES.TERCERA_EDAD]: 'bg-tercera-edad', // custom
  [SECTORES.DEPORTES]: 'bg-warning',
  [SECTORES.DISCAPACIDAD]: 'bg-info',
  [SECTORES.CULTURAL]: 'bg-cultural', // custom
  [SECTORES.COMUNIDAD]: 'bg-secondary'
};

// Configuración de la aplicación
export const APP_CONFIG = {
  name: 'Sistema de Gestión de Socios OPM',
  version: '1.0.0',
  description: 'Sistema integral para la gestión de socios de la Obra del Padre Mario'
};

// Rutas de la aplicación
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SOCIOS: '/socios',
  NUEVO_SOCIO: '/socios/nuevo',
  SOCIO_DETALLE: '/socios/:id',
  VALIDACION: '/validacion',
  REPORTES: '/reportes'
}; 