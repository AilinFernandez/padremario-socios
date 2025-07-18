import React from 'react';
import { ESTADOS_SOCIO_LABELS } from '../utils/constants';

const EstadoBadge = ({ estado }) => {
  let colorClass = 'text-secondary border-secondary';
  if (estado === 'activo') colorClass = 'text-success border-success';
  if (estado === 'baja_temporal') colorClass = 'text-warning border-warning';
  return (
    <span className={`badge bg-white ${colorClass} border px-3 py-2 fw-semibold`} style={{ fontSize: '1rem' }}>
      {ESTADOS_SOCIO_LABELS[estado] || estado}
    </span>
  );
};

export default EstadoBadge; 