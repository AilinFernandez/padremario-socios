import React from 'react';
import { FaTools } from 'react-icons/fa';

export default function Configuracion() {
  return (
    <div style={{
      marginTop: '60px',
      padding: 'var(--spacing-md) var(--spacing-xl) var(--spacing-xl) var(--spacing-md)',
      minHeight: 'calc(100vh - 70px)',
      backgroundColor: 'var(--light-gray)'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        textAlign: 'center'
      }}>
        <FaTools size={64} color="#6c757d" style={{ marginBottom: 16 }} />
        <h2 style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>Sección en construcción</h2>
        <p style={{ color: '#6c757d', fontSize: 18 }}>Próximamente podrás gestionar la configuración y ajustes del sistema aquí.</p>
      </div>
    </div>
  );
} 