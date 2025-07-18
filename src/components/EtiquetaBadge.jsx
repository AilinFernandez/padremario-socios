import React from 'react';
import { ETIQUETAS_POR_SECTOR, SECTOR_COLORS } from '../utils/constants';

// Busca el sector padre de una etiqueta
function getSectorDeEtiqueta(etiqueta) {
  for (const [sector, etiquetas] of Object.entries(ETIQUETAS_POR_SECTOR)) {
    if (etiquetas.includes(etiqueta)) {
      return sector;
    }
  }
  return null;
}

const EtiquetaBadge = ({ etiqueta }) => {
  const sector = getSectorDeEtiqueta(etiqueta);
  const colorClass = SECTOR_COLORS[sector] || 'bg-secondary';
  return (
    <span className={`badge ${colorClass} me-1 mb-1`} style={{ color: '#fff' }}>
      {etiqueta}
    </span>
  );
};

export default EtiquetaBadge; 