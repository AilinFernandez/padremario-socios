import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { useSocios } from '../hooks/useSocios';
import Notificaciones from '../components/Dashboard/Notificaciones';
import { 
  FaUsers, 
  FaUserCheck, 
  FaUserTimes, 
  FaPlus,
  FaChartLine,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserPlus,
  FaIdCard,
  FaChartBar
} from 'react-icons/fa';
import { SECTORES_LABELS, ESTADOS_SOCIO_LABELS } from '../utils/constants';
import { formatDate } from '../utils/dateUtils';
import './Dashboard.css';

const Dashboard = () => {
  const { socios, loading, getSocios, getEstadisticas } = useSocios();
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    activos: 0,
    inactivos: 0
  });
  const [sociosRecientes, setSociosRecientes] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      await getSocios();
      const stats = await getEstadisticas();
      setEstadisticas(stats);
    };
    
    cargarDatos();
  }, []);

  useEffect(() => {
    // Obtener los 5 socios más recientes
    const recientes = socios
      .sort((a, b) => new Date(b.fechaAlta) - new Date(a.fechaAlta))
      .slice(0, 5);
    setSociosRecientes(recientes);
  }, [socios]);

  const getEstadisticasPorSector = () => {
    const sectorStats = {};
    
    socios.forEach(socio => {
      socio.sectores?.forEach(sector => {
        sectorStats[sector] = (sectorStats[sector] || 0) + 1;
      });
    });
    
    return Object.entries(sectorStats)
      .map(([sector, count]) => ({
        sector: SECTORES_LABELS[sector] || sector,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };


  const getEstadoBadge = (estado) => {
    const variant = {
      'activo': 'success',
      'inactivo': 'secondary',
      'baja_temporal': 'warning'
    }[estado] || 'secondary';
    
    return (
      <Badge bg={variant}>
        {ESTADOS_SOCIO_LABELS[estado] || estado}
      </Badge>
    );
  };

  return (
    <div className="dashboard-container">
      <Row className="mb-4">
        <Col>
          <h1 className="dashboard-title">
            <FaChartLine className="me-2" />
            Resumen
          </h1>
          <p className="dashboard-subtitle">
            Resumen general del sistema de gestión de socios
          </p>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <div className="alert alert-info d-flex align-items-center" style={{ borderRadius: '12px', background: 'linear-gradient(90deg, #e3f0ff 0%, #b3d8fd 100%)', color: '#1b4b7a', fontWeight: 500, fontSize: 17 }}>
            <span style={{ fontSize: 22, marginRight: 12 }}>⚠️</span>
            Este sistema se encuentra en desarrollo. Algunas funcionalidades pueden no estar disponibles, estar en construcción o presentar errores.
          </div>
        </Col>
      </Row>

      {/* Tarjetas de estadísticas */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card">
            <Card.Body className="text-center">
              <div className="stats-icon">
                <FaUsers />
              </div>
              <div className="stats-number">{estadisticas.total}</div>
              <div className="stats-label">Total de Socios</div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card">
            <Card.Body className="text-center">
              <div className="stats-icon">
                <FaUserCheck />
              </div>
              <div className="stats-number">{estadisticas.activos}</div>
              <div className="stats-label">Socios Activos</div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card">
            <Card.Body className="text-center">
              <div className="stats-icon">
                <FaUserTimes />
              </div>
              <div className="stats-number">{estadisticas.inactivos}</div>
              <div className="stats-label">Socios Inactivos</div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card">
            <Card.Body className="text-center">
              <div className="stats-icon">
                <FaPlus />
              </div>
              <div className="stats-number">
                {socios.filter(s => {
                  const fecha = new Date(s.fechaAlta);
                  const hoy = new Date();
                  const diffTime = Math.abs(hoy - fecha);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 30;
                }).length}
              </div>
              <div className="stats-label">Nuevos este mes</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Socios recientes */}
        <Col lg={8} className="mb-4">
          <Card className="opm-card">
            <Card.Header>
              <h5 className="mb-0">
                <FaUsers className="me-2" />
                Socios Recientes
              </h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border opm-spinner" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : (
                <Table responsive className="opm-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>DNI</th>
                      <th>Sectores</th>
                      <th>Estado</th>
                      <th>Fecha Alta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sociosRecientes.map((socio) => (
                      <tr key={socio.id}>
                        <td>
                          <strong>{socio.nombre} {socio.apellido}</strong>
                        </td>
                        <td>{socio.dni}</td>
                        <td>
                          {socio.sectores?.slice(0, 2).map((sector, index) => (
                            <Badge 
                              key={index} 
                              bg="info" 
                              className="me-1"
                            >
                              {SECTORES_LABELS[sector] || sector}
                            </Badge>
                          ))}
                          {socio.sectores?.length > 2 && (
                            <Badge bg="secondary">+{socio.sectores.length - 2}</Badge>
                          )}
                        </td>
                        <td>{getEstadoBadge(socio.estado)}</td>
                        <td>
                          <small className="text-muted">
                            {formatDate(socio.fechaAlta)}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Notificaciones y estadísticas por sector */}
        <Col lg={4} className="mb-4">
          {/* Notificaciones */}
          <Notificaciones />
          
          {/* Estadísticas por sector */}
          <Card className="opm-card mt-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaChartLine className="me-2" />
                Por Sector
              </h5>
            </Card.Header>
            <Card.Body>
              {getEstadisticasPorSector().map((item, index) => (
                <div key={index} className="sector-stat">
                  <div className="sector-info">
                    <span className="sector-name">{item.sector}</span>
                    <span className="sector-count">{item.count}</span>
                  </div>
                  <div className="sector-bar">
                    <div 
                      className="sector-progress"
                      style={{ 
                        width: `${(item.count / Math.max(...getEstadisticasPorSector().map(s => s.count))) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Acciones rápidas */}
          <Card className="opm-card mt-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaPlus className="me-2" />
                Acciones Rápidas
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  className="btn-opm-primary"
                  href="/socios/nuevo"
                >
                  <FaUserPlus className="me-2" />
                  Nuevo Socio
                </Button>
                <Button 
                  variant="outline-primary" 
                  className="btn-opm-secondary"
                  href="/validacion"
                >
                  <FaIdCard className="me-2" />
                  Validación Rápida
                </Button>
                <Button 
                  variant="outline-primary" 
                  className="btn-opm-secondary"
                  href="/reportes"
                >
                  <FaChartBar className="me-2" />
                  Ver Reportes
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 