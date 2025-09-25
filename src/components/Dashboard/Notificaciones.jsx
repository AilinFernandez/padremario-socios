import React, { useState, useEffect } from 'react';
import { Card, Badge, ListGroup, ListGroupItem } from 'react-bootstrap';
import { useSocios } from '../../hooks/useSocios';
import { 
  FaBell, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaCheckCircle,
  FaUserClock,
  FaUserTimes,
  FaCalendarAlt
} from 'react-icons/fa';
import { formatDateTime } from '../../utils/dateUtils';
import './Notificaciones.css';

const Notificaciones = () => {
  const { socios } = useSocios();
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    if (socios.length > 0) {
      generarNotificaciones();
    }
  }, [socios]);

  const generarNotificaciones = () => {
    const ahora = new Date();
    const notifs = [];

    // Socios inactivos por más de 30 días
    const sociosInactivos = socios.filter(socio => {
      if (socio.estado === 'activo') {
        const ultimaActividad = new Date(socio.ultimaActividad);
        const diffDays = Math.ceil((ahora - ultimaActividad) / (1000 * 60 * 60 * 24));
        return diffDays > 30;
      }
      return false;
    });

    if (sociosInactivos.length > 0) {
      notifs.push({
        id: 'inactivos',
        tipo: 'warning',
        titulo: 'Socios inactivos',
        mensaje: `${sociosInactivos.length} socios no han tenido actividad en más de 30 días`,
        icono: FaUserClock,
        fecha: ahora
      });
    }

    // Socios con estado "baja_temporal"
    const sociosBajaTemporal = socios.filter(socio => socio.estado === 'baja_temporal');
    if (sociosBajaTemporal.length > 0) {
      notifs.push({
        id: 'baja_temporal',
        tipo: 'info',
        titulo: 'Bajas temporales',
        mensaje: `${sociosBajaTemporal.length} socios están en baja temporal`,
        icono: FaUserTimes,
        fecha: ahora
      });
    }

    // Nuevos socios este mes
    const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const nuevosMes = socios.filter(socio => {
      const fechaAlta = new Date(socio.fechaAlta);
      return fechaAlta >= primerDiaMes;
    });

    if (nuevosMes.length > 0) {
      notifs.push({
        id: 'nuevos',
        tipo: 'success',
        titulo: 'Nuevos socios',
        mensaje: `${nuevosMes.length} nuevos socios registrados este mes`,
        icono: FaCheckCircle,
        fecha: ahora
      });
    }

    // Sectores con pocos socios
    const sectorStats = {};
    socios.forEach(socio => {
      socio.sectores?.forEach(sector => {
        sectorStats[sector] = (sectorStats[sector] || 0) + 1;
      });
    });

    const sectoresPocosSocios = Object.entries(sectorStats)
      .filter(([sector, count]) => count < 3)
      .map(([sector]) => sector);

    if (sectoresPocosSocios.length > 0) {
      notifs.push({
        id: 'sectores_pocos',
        tipo: 'info',
        titulo: 'Sectores con pocos socios',
        mensaje: `${sectoresPocosSocios.length} sectores tienen menos de 3 socios`,
        icono: FaInfoCircle,
        fecha: ahora
      });
    }

    setNotificaciones(notifs);
  };

  const getIconoNotificacion = (tipo) => {
    const iconos = {
      warning: FaExclamationTriangle,
      info: FaInfoCircle,
      success: FaCheckCircle
    };
    return iconos[tipo] || FaBell;
  };

  const getColorNotificacion = (tipo) => {
    const colores = {
      warning: 'warning',
      info: 'info',
      success: 'success'
    };
    return colores[tipo] || 'secondary';
  };


  if (notificaciones.length === 0) {
    return (
      <Card className="opm-card">
        <Card.Header>
          <h5 className="mb-0">
            <FaBell className="me-2" />
            Notificaciones
          </h5>
        </Card.Header>
        <Card.Body className="text-center py-4">
          <div className="no-notifications">
            <FaCheckCircle className="no-notifications-icon" />
            <p className="no-notifications-text">
              No hay notificaciones pendientes
            </p>
            <small className="text-muted">
              El sistema está funcionando correctamente
            </small>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="opm-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FaBell className="me-2" />
          Notificaciones
        </h5>
        <Badge bg="primary" className="notification-count">
          {notificaciones.length}
        </Badge>
      </Card.Header>
      <Card.Body className="p-0">
        <ListGroup variant="flush">
          {notificaciones.map((notif, index) => {
            const IconoComponent = getIconoNotificacion(notif.tipo);
            return (
              <ListGroupItem 
                key={notif.id} 
                className={`notification-item notification-${notif.tipo}`}
              >
                <div className="notification-content">
                  <div className="notification-icon">
                    <IconoComponent className={`text-${getColorNotificacion(notif.tipo)}`} />
                  </div>
                  <div className="notification-details">
                    <div className="notification-title">
                      {notif.titulo}
                    </div>
                    <div className="notification-message">
                      {notif.mensaje}
                    </div>
                    <div className="notification-time">
                      <small className="text-muted">
                        {formatDateTime(notif.fecha)}
                      </small>
                    </div>
                  </div>
                </div>
              </ListGroupItem>
            );
          })}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default Notificaciones; 