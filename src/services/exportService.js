import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ESTADOS_SOCIO_LABELS, SECTORES_LABELS } from '../utils/constants';

export const exportarPDF = (socios, filtros = {}) => {
  const doc = new jsPDF();
  
  // Título del documento
  doc.setFontSize(20);
  doc.text('Reporte de Socios - Obra del Padre Mario', 20, 20);
  
  // Información del reporte
  doc.setFontSize(12);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-AR')}`, 20, 35);
  doc.text(`Total de socios: ${socios.length}`, 20, 45);
  
  // Filtros aplicados
  if (Object.values(filtros).some(f => f)) {
    doc.text('Filtros aplicados:', 20, 60);
    let yPos = 70;
    
    if (filtros.estado) {
      doc.text(`Estado: ${ESTADOS_SOCIO_LABELS[filtros.estado] || filtros.estado}`, 30, yPos);
      yPos += 8;
    }
    if (filtros.sector) {
      doc.text(`Sector: ${SECTORES_LABELS[filtros.sector] || filtros.sector}`, 30, yPos);
      yPos += 8;
    }
    if (filtros.barrio) {
      doc.text(`Barrio: ${filtros.barrio}`, 30, yPos);
      yPos += 8;
    }
    if (filtros.fechaDesde || filtros.fechaHasta) {
      const fechaDesde = filtros.fechaDesde ? new Date(filtros.fechaDesde).toLocaleDateString('es-AR') : '';
      const fechaHasta = filtros.fechaHasta ? new Date(filtros.fechaHasta).toLocaleDateString('es-AR') : '';
      doc.text(`Período: ${fechaDesde} - ${fechaHasta}`, 30, yPos);
      yPos += 8;
    }
  }
  
  // Tabla de socios
  const tableY = Object.values(filtros).some(f => f) ? 100 : 70;
  
  const headers = [
    'Nombre',
    'DNI', 
    'Email',
    'Teléfono',
    'Estado',
    'Sectores',
    'Barrio',
    'Fecha Alta'
  ];
  
  const data = socios.map(socio => [
    `${socio.nombre} ${socio.apellido}`,
    socio.dni,
    socio.email || '',
    socio.telefono || '',
    ESTADOS_SOCIO_LABELS[socio.estado] || socio.estado,
    socio.sectores?.map(s => SECTORES_LABELS[s] || s).join(', ') || '',
    socio.barrio || '',
    new Date(socio.fechaAlta).toLocaleDateString('es-AR')
  ]);
  
  doc.autoTable({
    head: [headers],
    body: data,
    startY: tableY,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 10 }
  });
  
  // Estadísticas por sector
  const sectorStats = {};
  socios.forEach(socio => {
    socio.sectores?.forEach(sector => {
      sectorStats[sector] = (sectorStats[sector] || 0) + 1;
    });
  });
  
  if (Object.keys(sectorStats).length > 0) {
    const statsY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.text('Estadísticas por Sector', 20, statsY);
    
    const statsData = Object.entries(sectorStats).map(([sector, count]) => [
      SECTORES_LABELS[sector] || sector,
      count.toString()
    ]);
    
    doc.autoTable({
      head: [['Sector', 'Cantidad']],
      body: statsData,
      startY: statsY + 10,
      styles: {
        fontSize: 10
      },
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255
      }
    });
  }
  
  // Guardar archivo
  const nombreArchivo = `socios_opm_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nombreArchivo);
};

export const exportarExcel = (socios, filtros = {}) => {
  // Datos principales
  const datos = socios.map(socio => ({
    'Nombre': `${socio.nombre} ${socio.apellido}`,
    'DNI': socio.dni,
    'Email': socio.email || '',
    'Teléfono': socio.telefono || '',
    'Estado': ESTADOS_SOCIO_LABELS[socio.estado] || socio.estado,
    'Sectores': socio.sectores?.map(s => SECTORES_LABELS[s] || s).join(', ') || '',
    'Barrio': socio.barrio || '',
    'Fecha Alta': new Date(socio.fechaAlta).toLocaleDateString('es-AR'),
    'Última Actividad': new Date(socio.ultimaActividad).toLocaleDateString('es-AR'),
    'Origen': socio.origen || ''
  }));

  // Crear workbook
  const wb = XLSX.utils.book_new();
  
  // Hoja principal
  const ws = XLSX.utils.json_to_sheet(datos);
  XLSX.utils.book_append_sheet(wb, ws, 'Socios');
  
  // Estadísticas por sector
  const sectorStats = {};
  socios.forEach(socio => {
    socio.sectores?.forEach(sector => {
      sectorStats[sector] = (sectorStats[sector] || 0) + 1;
    });
  });
  
  if (Object.keys(sectorStats).length > 0) {
    const statsData = Object.entries(sectorStats).map(([sector, count]) => ({
      'Sector': SECTORES_LABELS[sector] || sector,
      'Cantidad': count
    }));
    
    const wsStats = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, wsStats, 'Estadísticas');
  }
  
  // Estadísticas por estado
  const estadoStats = {};
  socios.forEach(socio => {
    estadoStats[socio.estado] = (estadoStats[socio.estado] || 0) + 1;
  });
  
  const estadoData = Object.entries(estadoStats).map(([estado, count]) => ({
    'Estado': ESTADOS_SOCIO_LABELS[estado] || estado,
    'Cantidad': count
  }));
  
  const wsEstado = XLSX.utils.json_to_sheet(estadoData);
  XLSX.utils.book_append_sheet(wb, wsEstado, 'Por Estado');
  
  // Información del reporte
  const infoData = [
    { 'Campo': 'Fecha de generación', 'Valor': new Date().toLocaleDateString('es-AR') },
    { 'Campo': 'Total de socios', 'Valor': socios.length },
    { 'Campo': 'Socios activos', 'Valor': socios.filter(s => s.estado === 'activo').length },
    { 'Campo': 'Socios inactivos', 'Valor': socios.filter(s => s.estado === 'inactivo').length },
  ];
  
  if (Object.values(filtros).some(f => f)) {
    infoData.push({ 'Campo': 'Filtros aplicados', 'Valor': 'Sí' });
    if (filtros.estado) infoData.push({ 'Campo': 'Estado filtrado', 'Valor': ESTADOS_SOCIO_LABELS[filtros.estado] || filtros.estado });
    if (filtros.sector) infoData.push({ 'Campo': 'Sector filtrado', 'Valor': SECTORES_LABELS[filtros.sector] || filtros.sector });
    if (filtros.barrio) infoData.push({ 'Campo': 'Barrio filtrado', 'Valor': filtros.barrio });
  }
  
  const wsInfo = XLSX.utils.json_to_sheet(infoData);
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Información');
  
  // Guardar archivo
  const nombreArchivo = `socios_opm_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, nombreArchivo);
};

export const generarReporteMensual = (socios) => {
  const ahora = new Date();
  const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const ultimoDiaMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
  
  const sociosMes = socios.filter(socio => {
    const fechaAlta = new Date(socio.fechaAlta);
    return fechaAlta >= primerDiaMes && fechaAlta <= ultimoDiaMes;
  });
  
  return {
    totalNuevos: sociosMes.length,
    porSector: sociosMes.reduce((acc, socio) => {
      socio.sectores?.forEach(sector => {
        acc[sector] = (acc[sector] || 0) + 1;
      });
      return acc;
    }, {}),
    porBarrio: sociosMes.reduce((acc, socio) => {
      acc[socio.barrio] = (acc[socio.barrio] || 0) + 1;
      return acc;
    }, {}),
    fechaInicio: primerDiaMes,
    fechaFin: ultimoDiaMes
  };
}; 