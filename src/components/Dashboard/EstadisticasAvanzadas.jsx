import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import { useSocios } from '../../hooks/useSocios';
import { SECTORES_LABELS, ESTADOS_SOCIO_LABELS } from '../../utils/constants';
import EstadisticasChart from '../Charts/EstadisticasChart';
import { 
  FaUsers, 
  FaUserPlus, 
  FaUserCheck, 
  FaUserTimes,
  FaChartLine,
  FaCalendarAlt,
  FaMapMarkerAlt
} from 'react-icons/fa';
import './EstadisticasAvanzadas.css';

const EstadisticasAvanzadas = () => {
  const { socios } = useSocios();
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    nuevosMes: 0,
    crecimiento: 0
  });

  useEffect(() => {
    if (socios.length > 0) {
      calcularEstadisticas();
    }
  }, [socios]);

  const calcularEstadisticas = () => {
    const ahora = new Date();
    const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const primerDiaMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    
    const sociosMes = socios.filter(socio => {
      const fechaAlta = new Date(socio.fechaAlta);
      return fechaAlta >= primerDiaMes;
    });
    
    const sociosMesAnterior = socios.filter(socio => {
      const fechaAlta = new Date(socio.fechaAlta);
      return fechaAlta >= primerDiaMesAnterior && fechaAlta < primerDiaMes;
    });

    const crecimiento = sociosMesAnterior.length > 0 
      ? ((sociosMes.length - sociosMesAnterior.length) / sociosMesAnterior.length) * 100 
      : 0;

    setEstadisticas({
      total: socios.length,
      activos: socios.filter(s => s.estado === 'activo').length,
      inactivos: socios.filter(s => s.estado === 'inactivo').length,
      nuevosMes: sociosMes.length,
      crecimiento: Math.round(crecimiento * 100) / 100
    });
  };

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
      .slice(0, 5); // Top 5 sectores
  };

  const getEstadisticasPorEstado = () => {
    const estadoStats = {};
    
    socios.forEach(socio => {
      estadoStats[socio.estado] = (estadoStats[socio.estado] || 0) + 1;
    });
    
    return Object.entries(estadoStats)
      .map(([estado, count]) => ({
        estado: ESTADOS_SOCIO_LABELS[estado] || estado,
        count
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getEstadisticasPorBarrio = () => {
    const barrioStats = {};
    
    socios.forEach(socio => {
      if (socio.barrio) {
        barrioStats[socio.barrio] = (barrioStats[socio.barrio] || 0) + 1;
      }
    });
    
    return Object.entries(barrioStats)
      .map(([barrio, count]) => ({
        barrio,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 barrios
  };

  const datosGraficoSectores = {
    labels: getEstadisticasPorSector().map(item => item.sector),
    datasets: [{
      label: 'Socios por Sector',
      data: getEstadisticasPorSector().map(item => item.count),
      backgroundColor: [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'
      ],
      borderWidth: 1
    }]
  };

  const datosGraficoEstados = {
    labels: getEstadisticasPorEstado().map(item => item.estado),
    datasets: [{
      label: 'Socios por Estado',
      data: getEstadisticasPorEstado().map(item => item.count),
      backgroundColor: [
        '#2ecc71', '#95a5a6', '#f39c12'
      ],
      borderWidth: 1
    }]
  };

  const datosGraficoBarrios = {
    labels: getEstadisticasPorBarrio().map(item => item.barrio),
    datasets: [{
      label: 'Socios por Barrio',
      data: getEstadisticasPorBarrio().map(item => item.count),
      backgroundColor: '#3498db',
      borderColor: '#2980b9',
      borderWidth: 1
    }]
  };

  return (
    <div className="estadisticas-avanzadas">
      {/* Métricas principales */}
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
                <FaUserPlus />
              </div>
              <div className="stats-number">{estadisticas.nuevosMes}</div>
              <div className="stats-label">Nuevos este mes</div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card">
            <Card.Body className="text-center">
              <div className="stats-icon">
                <FaChartLine />
              </div>
              <div className="stats-number">
                {estadisticas.crecimiento > 0 ? '+' : ''}{estadisticas.crecimiento}%
              </div>
              <div className="stats-label">Crecimiento mensual</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row>
        <Col lg={6} className="mb-4">
          <EstadisticasChart
            tipo="doughnut"
            datos={datosGraficoSectores}
            titulo="Top 5 Sectores"
            altura={300}
          />
        </Col>
        
        <Col lg={6} className="mb-4">
          <EstadisticasChart
            tipo="doughnut"
            datos={datosGraficoEstados}
            titulo="Distribución por Estado"
            altura={300}
          />
        </Col>
      </Row>

      <Row>
        <Col lg={12} className="mb-4">
          <EstadisticasChart
            tipo="bar"
            datos={datosGraficoBarrios}
            titulo="Top 5 Barrios"
            altura={300}
          />
        </Col>
      </Row>

      {/* Estadísticas adicionales */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="opm-card">
            <Card.Header>
              <h5 className="mb-0">
                <FaCalendarAlt className="me-2" />
                Actividad Reciente
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="activity-stats">
                <div className="activity-item">
                  <span className="activity-label">Socios activos este mes:</span>
                  <Badge bg="success">{estadisticas.activos}</Badge>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Nuevos registros:</span>
                  <Badge bg="primary">{estadisticas.nuevosMes}</Badge>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Tasa de crecimiento:</span>
                  <Badge bg={estadisticas.crecimiento >= 0 ? "success" : "danger"}>
                    {estadisticas.crecimiento > 0 ? '+' : ''}{estadisticas.crecimiento}%
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="opm-card">
            <Card.Header>
              <h5 className="mb-0">
                <FaMapMarkerAlt className="me-2" />
                Distribución Geográfica
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="geography-stats">
                {getEstadisticasPorBarrio().map((item, index) => (
                  <div key={index} className="geography-item">
                    <span className="geography-name">{item.barrio}</span>
                    <span className="geography-count">{item.count} socios</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EstadisticasAvanzadas; 