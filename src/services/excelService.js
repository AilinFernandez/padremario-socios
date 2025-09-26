import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { BARRIOS, SECTORES_LABELS, ORIGENES_CONTACTO, ETIQUETAS_POR_SECTOR } from '../utils/constants';

/**
 * Genera y descarga la plantilla Excel para importar socios
 */
export const generarPlantillaExcel = () => {
  // Datos de ejemplo para la plantilla
  const datosEjemplo = [
    {
      'Nombre': 'Juan',
      'Apellido': 'Pérez',
      'DNI': '12345678',
      'Email': 'juan.perez@email.com',
      'Telefono': '1234567890',
      'Fecha_Nacimiento': '1990-01-15',
      'Barrio': 'San Justo',
      'Direccion': 'Av. Principal 123',
      'Sectores': 'Deportes,Educación',
      'Etiquetas': 'Fútbol,Natación',
      'Origen_Contacto': 'Comunidad',
      'Observaciones': 'Socio activo'
    },
    {
      'Nombre': 'María',
      'Apellido': 'García',
      'DNI': '87654321',
      'Email': 'maria.garcia@email.com',
      'Telefono': '0987654321',
      'Fecha_Nacimiento': '1985-05-20',
      'Barrio': 'Ramos Mejía',
      'Direccion': 'Calle Secundaria 456',
      'Sectores': 'Salud',
      'Etiquetas': 'Consultas Médicas',
      'Origen_Contacto': 'Santeria',
      'Observaciones': ''
    }
  ];

  // Crear hoja de trabajo
  const ws = XLSX.utils.json_to_sheet(datosEjemplo);

  // Crear libro de trabajo con una sola hoja
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Socios');

  // Generar archivo
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Descargar archivo
  saveAs(data, 'Plantilla_Importar_Socios.xlsx');
};

/**
 * Procesa un archivo Excel y extrae los datos de socios
 * @param {File} archivo - Archivo Excel subido
 * @returns {Object} - { datos: [], errores: [] }
 */
export const procesarArchivoExcel = async (archivo) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Buscar la hoja de datos (prioridad: 'Socios', luego la primera hoja)
        let sheetName = workbook.SheetNames.find(name => 
          name.toLowerCase() === 'socios'
        ) || workbook.SheetNames[0];
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Procesar y validar datos
        const { datos, errores } = procesarDatosSocios(jsonData);
        
        resolve({ datos, errores });
      } catch (error) {
        reject(new Error('Error al leer el archivo Excel: ' + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsArrayBuffer(archivo);
  });
};

/**
 * Procesa y valida los datos extraídos del Excel
 * @param {Array} jsonData - Datos en formato JSON del Excel
 * @returns {Object} - { datos: [], errores: [] }
 */
const procesarDatosSocios = (jsonData) => {
  const datos = [];
  const errores = [];
  
  jsonData.forEach((fila, index) => {
    const numeroFila = index + 2; // +2 porque empezamos desde la fila 2 (fila 1 es encabezado)
    const erroresFila = [];
    
    // Validar campos obligatorios
    if (!fila.Nombre || !fila.Nombre.trim()) {
      erroresFila.push('Nombre es obligatorio');
    }
    if (!fila.Apellido || !fila.Apellido.trim()) {
      erroresFila.push('Apellido es obligatorio');
    }
    if (!fila.DNI || !fila.DNI.toString().trim()) {
      erroresFila.push('DNI es obligatorio');
    }
    if (!fila.Email || !fila.Email.trim()) {
      erroresFila.push('Email es obligatorio');
    }
    if (!fila.Telefono || !fila.Telefono.toString().trim()) {
      erroresFila.push('Teléfono es obligatorio');
    }
    
    // Validar formato de DNI
    if (fila.DNI) {
      const dniStr = fila.DNI.toString().replace(/\D/g, '');
      if (dniStr.length < 7 || dniStr.length > 8) {
        erroresFila.push('DNI debe tener entre 7 y 8 dígitos');
      }
    }
    
    // Validar formato de email
    if (fila.Email && !/\S+@\S+\.\S+/.test(fila.Email)) {
      erroresFila.push('Email no tiene formato válido');
    }
    
    // Validar barrio
    if (fila.Barrio && !BARRIOS.includes(fila.Barrio)) {
      erroresFila.push(`Barrio "${fila.Barrio}" no es válido`);
    }
    
    // Validar sectores
    if (fila.Sectores) {
      const sectores = fila.Sectores.split(',').map(s => s.trim());
      const sectoresInvalidos = sectores.filter(s => 
        !Object.values(SECTORES_LABELS).includes(s)
      );
      if (sectoresInvalidos.length > 0) {
        erroresFila.push(`Sectores inválidos: ${sectoresInvalidos.join(', ')}`);
      }
    }
    
    // Validar origen de contacto
    if (fila.Origen_Contacto && !ORIGENES_CONTACTO.includes(fila.Origen_Contacto)) {
      erroresFila.push(`Origen de contacto "${fila.Origen_Contacto}" no es válido`);
    }
    
    // Si hay errores, agregar a la lista de errores
    if (erroresFila.length > 0) {
      errores.push({
        fila: numeroFila,
        mensaje: erroresFila.join('; ')
      });
    } else {
      // Procesar datos válidos
      const datosFila = {
        numeroFila,
        nombre: fila.Nombre?.trim() || '',
        apellido: fila.Apellido?.trim() || '',
        dni: fila.DNI?.toString().replace(/\D/g, '') || '',
        email: fila.Email?.trim() || '',
        telefono: fila.Telefono?.toString().replace(/\D/g, '') || '',
        fechaNacimiento: fila.Fecha_Nacimiento || '',
        barrio: fila.Barrio || '',
        direccion: fila.Direccion || '',
        sectores: fila.Sectores ? 
          fila.Sectores.split(',').map(s => s.trim()).filter(s => 
            Object.values(SECTORES_LABELS).includes(s)
          ) : [],
        etiquetas: fila.Etiquetas ? 
          fila.Etiquetas.split(',').map(e => e.trim()).filter(e => 
            Object.values(ETIQUETAS_POR_SECTOR).flat().includes(e)
          ) : [],
        origen: fila.Origen_Contacto || '',
        observaciones: fila.Observaciones || '',
        estado: 'activo'
      };
      
      datos.push(datosFila);
    }
  });
  
  return { datos, errores };
};
