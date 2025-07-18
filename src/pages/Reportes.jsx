import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Spinner, Tabs, Tab } from 'react-bootstrap';
import { useSocios } from '../hooks/useSocios';
import { SECTORES_LABELS, ESTADOS_SOCIO_LABELS, SECTORES, BARRIOS } from '../utils/constants';
import { exportarPDF, exportarExcel, generarReporteMensual } from '../services/exportService';
import EstadisticasChart from '../components/Charts/EstadisticasChart';
import { 
  FaChartBar, 
  FaDownload, 
  FaFilter, 
  FaFileExcel, 
  FaFilePdf,
  FaUsers,
  FaCalendarAlt,
  FaChartPie,
  FaChartLine,
  FaPrint,
  FaEye
} from 'react-icons/fa';
import './Reportes.css';

const Reportes = () => {
  const { socios, loading, getSocios, getEstadisticas } = useSocios();
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    activos: 0,
    inactivos: 0
  });
  const [filtros, setFiltros] = useState({
    estado: '',
    sector: '',
    barrio: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [sociosFiltrados, setSociosFiltrados] = useState([]);
  const [exportando, setExportando] = useState(false);
  const [reporteMensual, setReporteMensual] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('general');

  useEffect(() => {
    const cargarDatos = async () => {
      await getSocios();
      const stats = await getEstadisticas();
      setEstadisticas(stats);
    };
    
    cargarDatos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [socios, filtros]);

  useEffect(() => {
    if (socios.length > 0) {
      setReporteMensual(generarReporteMensual(socios));
    }
  }, [socios]);

  const aplicarFiltros = () => {
    let filtrados = [...socios];

    if (filtros.estado) {
      filtrados = filtrados.filter(socio => socio.estado === filtros.estado);
    }

    if (filtros.sector) {
      filtrados = filtrados.filter(socio => 
        socio.sectores?.includes(filtros.sector)
      );
    }

    if (filtros.barrio) {
      filtrados = filtrados.filter(socio => socio.barrio === filtros.barrio);
    }

    if (filtros.fechaDesde) {
      filtrados = filtrados.filter(socio => 
        new Date(socio.fechaAlta) >= new Date(filtros.fechaDesde)
      );
    }

    if (filtros.fechaHasta) {
      filtrados = filtrados.filter(socio => 
        new Date(socio.fechaAlta) <= new Date(filtros.fechaHasta)
      );
    }

    setSociosFiltrados(filtrados);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      sector: '',
      barrio: '',
      fechaDesde: '',
      fechaHasta: ''
    });
  };

  const handleExportarExcel = async () => {
    setExportando(true);
    try {
      await exportarExcel(sociosFiltrados, filtros);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert('Error al exportar el archivo Excel');
    } finally {
      setExportando(false);
    }
  };

  const handleExportarPDF = async () => {
    setExportando(true);
    try {
      await exportarPDF(sociosFiltrados, filtros);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al exportar el archivo PDF');
    } finally {
      setExportando(false);
    }
  };

  const getEstadisticasPorSector = () => {
    const sectorStats = {};
    
    sociosFiltrados.forEach(socio => {
      socio.sectores?.forEach(sector => {
        sectorStats[sector] = (sectorStats[sector] || 0) + 1;
      });
    });
    
    return Object.entries(sectorStats)
      .map(([sector, count]) => ({
        sector: SECTORES_LABELS[sector] || sector,
        count
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getEstadisticasPorEstado = () => {
    const estadoStats = {};
    
    sociosFiltrados.forEach(socio => {
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
    
    sociosFiltrados.forEach(socio => {
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
      .slice(0, 10); // Top 10 barrios
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  // Datos para gráficos
  const datosGraficoSectores = {
    labels: getEstadisticasPorSector().map(item => item.sector),
    datasets: [{
      label: 'Socios por Sector',
      data: getEstadisticasPorSector().map(item => item.count),
      backgroundColor: [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
        '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#16a085'
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

  const datosGraficoMensual = reporteMensual ? {
    labels: Object.keys(reporteMensual.porSector).map(sector => SECTORES_LABELS[sector] || sector),
    datasets: [{
      label: 'Nuevos socios este mes',
      data: Object.values(reporteMensual.porSector),
      backgroundColor: '#e74c3c',
      borderColor: '#c0392b',
      borderWidth: 1
    }]
  } : null;

  return (
    <Container fluid className="reportes-container">
      <Row className="mb-4">
        <Col>
          <h1 className="reportes-title">
            <FaChartBar className="me-2" />
            Reportes y Estadísticas
          </h1>
          <p className="reportes-subtitle">
            Generar reportes y exportar datos de socios
          </p>
        </Col>
      </Row>

      {/* Estadísticas generales */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card">
            <Card.Body className="text-center">
              <div className="stats-icon">
                <FaUsers />
              </div>
              <div className="stats-number">{sociosFiltrados.length}</div>
              <div className="stats-label">Socios Filtrados</div>
            </Card.Body>
          </Card>
        </Col>
        
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
                <FaCalendarAlt />
              </div>
              <div className="stats-number">
                {reporteMensual?.totalNuevos || 0}
              </div>
              <div className="stats-label">Nuevos este mes</div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card">
            <Card.Body className="text-center">
              <div className="stats-icon">
                <FaChartBar />
              </div>
              <div className="stats-number">{getEstadisticasPorSector().length}</div>
              <div className="stats-label">Sectores Activos</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Filtros */}
        <Col lg={3} className="mb-4">
          <Card className="opm-card">
            <Card.Header>
              <h5 className="mb-0">
                <FaFilter className="me-2" />
                Filtros
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={filtros.estado}
                    onChange={(e) => handleFiltroChange('estado', e.target.value)}
                    className="opm-form-control"
                  >
                    <option value="">Todos los estados</option>
                    {Object.entries(ESTADOS_SOCIO_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Sector</Form.Label>
                  <Form.Select
                    value={filtros.sector}
                    onChange={(e) => handleFiltroChange('sector', e.target.value)}
                    className="opm-form-control"
                  >
                    <option value="">Todos los sectores</option>
                    {Object.entries(SECTORES_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Barrio</Form.Label>
                  <Form.Select
                    value={filtros.barrio}
                    onChange={(e) => handleFiltroChange('barrio', e.target.value)}
                    className="opm-form-control"
                  >
                    <option value="">Todos los barrios</option>
                    {BARRIOS.map(barrio => (
                      <option key={barrio} value={barrio}>{barrio}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fecha desde</Form.Label>
                  <Form.Control
                    type="date"
                    value={filtros.fechaDesde}
                    onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                    className="opm-form-control"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fecha hasta</Form.Label>
                  <Form.Control
                    type="date"
                    value={filtros.fechaHasta}
                    onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                    className="opm-form-control"
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={limpiarFiltros}
                    className="btn-opm-secondary"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Botones de exportación */}
          <Card className="opm-card">
            <Card.Header>
              <h5 className="mb-0">
                <FaDownload className="me-2" />
                Exportar
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button
                  variant="success"
                  onClick={handleExportarExcel}
                  disabled={exportando || sociosFiltrados.length === 0}
                  className="btn-opm-primary"
                >
                  {exportando ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <FaFileExcel className="me-2" />
                      Excel
                    </>
                  )}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleExportarPDF}
                  disabled={exportando || sociosFiltrados.length === 0}
                  className="btn-opm-primary"
                >
                  <FaFilePdf className="me-2" />
                  PDF
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Contenido principal */}
        <Col lg={9} className="mb-4">
          <Tabs
            activeKey={vistaActiva}
            onSelect={(k) => setVistaActiva(k)}
            className="mb-3"
          >
            <Tab eventKey="general" title={
              <span>
                <FaChartBar className="me-1" />
                General
              </span>
            }>
              <Row>
                <Col lg={6} className="mb-4">
                  <EstadisticasChart
                    tipo="doughnut"
                    datos={datosGraficoSectores}
                    titulo="Socios por Sector"
                    altura={300}
                  />
                </Col>
                <Col lg={6} className="mb-4">
                  <EstadisticasChart
                    tipo="doughnut"
                    datos={datosGraficoEstados}
                    titulo="Socios por Estado"
                    altura={300}
                  />
                </Col>
              </Row>
              
              <Row>
                <Col lg={12} className="mb-4">
                  <EstadisticasChart
                    tipo="bar"
                    datos={datosGraficoBarrios}
                    titulo="Top 10 Barrios"
                    altura={300}
                  />
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="mensual" title={
              <span>
                <FaCalendarAlt className="me-1" />
                Mensual
              </span>
            }>
              {reporteMensual && (
                <Row>
                  <Col lg={12} className="mb-4">
                    <Card className="opm-card">
                      <Card.Header>
                        <h5 className="mb-0">
                          <FaChartLine className="me-2" />
                          Nuevos Socios - {reporteMensual.fechaInicio.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={4} className="text-center mb-3">
                            <div className="stats-number text-primary">
                              {reporteMensual.totalNuevos}
                            </div>
                            <div className="stats-label">Total nuevos</div>
                          </Col>
                          <Col md={8}>
                            {datosGraficoMensual && (
                              <EstadisticasChart
                                tipo="bar"
                                datos={datosGraficoMensual}
                                titulo="Nuevos por Sector"
                                altura={250}
                                mostrarLeyenda={false}
                              />
                            )}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
            </Tab>

            <Tab eventKey="lista" title={
              <span>
                <FaEye className="me-1" />
                Lista
              </span>
            }>
              <Card className="opm-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FaUsers className="me-2" />
                    Socios ({sociosFiltrados.length})
                  </h5>
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status" className="opm-spinner">
                        <span className="visually-hidden">Cargando...</span>
                      </Spinner>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table className="opm-table">
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
                          {sociosFiltrados.slice(0, 50).map((socio) => (
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
                      {sociosFiltrados.length > 50 && (
                        <div className="text-center mt-3">
                          <small className="text-muted">
                            Mostrando 50 de {sociosFiltrados.length} socios. 
                            Use los filtros para reducir los resultados o exporte para ver todos.
                          </small>
                        </div>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default Reportes; 