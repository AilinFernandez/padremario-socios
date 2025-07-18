import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSocios } from '../../hooks/useSocios';
import { useAudit } from '../../hooks/useAudit';
import { SECTORES_LABELS, ESTADOS_SOCIO_LABELS, SECTORES, BARRIOS } from '../../utils/constants';
import { 
  FaUsers, 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaEye,
  FaFilter,
  FaSort,
  FaTimes
} from 'react-icons/fa';
import './SociosList.css';
import EstadoBadge from '../../components/EstadoBadge';

const SociosList = () => {
  const navigate = useNavigate();
  const { socios, loading, getSocios } = useSocios();
  const { logSearch, logSocioAction } = useAudit();
  const [sociosFiltrados, setSociosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState({
    estado: '',
    sector: '',
    barrio: ''
  });
  const [ordenamiento, setOrdenamiento] = useState({
    campo: 'fechaAlta',
    direccion: 'desc'
  });

  useEffect(() => {
    getSocios();
  }, []);

  useEffect(() => {
    aplicarFiltrosYBusqueda();
  }, [socios, busqueda, filtros, ordenamiento]);

  // Registrar búsquedas con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (busqueda.trim()) {
        logSearch('socios', busqueda, filtros, sociosFiltrados.length);
      }
    }, 1000); // Esperar 1 segundo después de que el usuario deje de escribir

    return () => clearTimeout(timeoutId);
  }, [busqueda, filtros, sociosFiltrados.length, logSearch]);

  const aplicarFiltrosYBusqueda = () => {
    let filtrados = [...socios];

    // Aplicar búsqueda
    if (busqueda.trim()) {
      const terminoBusqueda = busqueda.toLowerCase().trim();
      filtrados = filtrados.filter(socio => 
        socio.nombre?.toLowerCase().includes(terminoBusqueda) ||
        socio.apellido?.toLowerCase().includes(terminoBusqueda) ||
        socio.dni?.includes(terminoBusqueda) ||
        socio.email?.toLowerCase().includes(terminoBusqueda)
      );
    }

    // Aplicar filtros
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

    // Aplicar ordenamiento
    if (ordenamiento.campo) {
      filtrados.sort((a, b) => {
        let valorA = a[ordenamiento.campo];
        let valorB = b[ordenamiento.campo];

        // Manejar valores nulos/undefined
        if (!valorA && !valorB) return 0;
        if (!valorA) return 1;
        if (!valorB) return -1;

        // Convertir a string para comparación
        valorA = String(valorA).toLowerCase();
        valorB = String(valorB).toLowerCase();

        if (ordenamiento.direccion === 'asc') {
          return valorA.localeCompare(valorB);
        } else {
          return valorB.localeCompare(valorA);
        }
      });
    }

    setSociosFiltrados(filtrados);
  };

  const handleOrdenamiento = (campo) => {
    setOrdenamiento(prev => ({
      campo,
      direccion: prev.campo === campo && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltros({
      estado: '',
      sector: '',
      barrio: ''
    });
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

  const getIconoOrdenamiento = (campo) => {
    if (ordenamiento.campo !== campo) {
      return <FaSort className="text-muted" />;
    }
    return ordenamiento.direccion === 'asc' ? 
      <FaSort className="text-primary" /> : 
      <FaSort className="text-primary" style={{ transform: 'scaleY(-1)' }} />;
  };

  return (
    <Container fluid className="socios-list-container">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="socios-list-title">
                <FaUsers className="me-2" />
                Gestión de Socios
              </h1>
              <p className="socios-list-subtitle">
                Administre y consulte la información de todos los socios
              </p>
            </div>
            <Button
              variant="primary"
              className="btn-opm-primary"
              onClick={() => navigate('/socios/nuevo')}
            >
              <FaPlus className="me-2" />
              Nuevo Socio
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filtros y búsqueda */}
      <Row className="mb-4">
        <Col>
          <Card className="opm-card">
            <Card.Header>
              <h5 className="mb-0">
                <FaFilter className="me-2" />
                Búsqueda y Filtros
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Buscar</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaSearch />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Nombre, apellido, DNI o email"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="opm-form-control"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={2} className="mb-3">
                  <Form.Group>
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      value={filtros.estado}
                      onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                      className="opm-form-control"
                    >
                      <option value="">Todos</option>
                      {Object.entries(ESTADOS_SOCIO_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Sector</Form.Label>
                    <Form.Select
                      value={filtros.sector}
                      onChange={(e) => setFiltros(prev => ({ ...prev, sector: e.target.value }))}
                      className="opm-form-control"
                    >
                      <option value="">Todos</option>
                      {Object.entries(SECTORES_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2} className="mb-3">
                  <Form.Group>
                    <Form.Label>Barrio</Form.Label>
                    <Form.Select
                      value={filtros.barrio}
                      onChange={(e) => setFiltros(prev => ({ ...prev, barrio: e.target.value }))}
                      className="opm-form-control"
                    >
                      <option value="">Todos</option>
                      {BARRIOS.map(barrio => (
                        <option key={barrio} value={barrio}>{barrio}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={1} className="mb-3 d-flex align-items-end">
                  <Button
                    variant="outline-secondary"
                    onClick={limpiarFiltros}
                    className="btn-opm-secondary btn-clear-filters w-100"
                    title="Limpiar filtros"
                  >
                    <FaTimes />
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de socios */}
      <Row>
        <Col>
          <Card className="opm-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaUsers className="me-2" />
                Socios ({sociosFiltrados.length} de {socios.length})
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
                        <th 
                          className="cursor-pointer"
                          onClick={() => handleOrdenamiento('nombre')}
                        >
                          <div className="d-flex align-items-center">
                            Nombre
                            {getIconoOrdenamiento('nombre')}
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer"
                          onClick={() => handleOrdenamiento('dni')}
                        >
                          <div className="d-flex align-items-center">
                            DNI
                            {getIconoOrdenamiento('dni')}
                          </div>
                        </th>
                        <th>Sectores</th>
                        <th 
                          className="cursor-pointer"
                          onClick={() => handleOrdenamiento('estado')}
                        >
                          <div className="d-flex align-items-center">
                            Estado
                            {getIconoOrdenamiento('estado')}
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer"
                          onClick={() => handleOrdenamiento('fechaAlta')}
                        >
                          <div className="d-flex align-items-center">
                            Fecha Alta
                            {getIconoOrdenamiento('fechaAlta')}
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer"
                          onClick={() => handleOrdenamiento('ultimaActividad')}
                        >
                          <div className="d-flex align-items-center">
                            Última Actividad
                            {getIconoOrdenamiento('ultimaActividad')}
                          </div>
                        </th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sociosFiltrados.map((socio) => (
                        <tr key={socio.id}>
                          <td>
                            <strong>{socio.nombre} {socio.apellido}</strong>
                            {socio.email && (
                              <div className="text-muted small">{socio.email}</div>
                            )}
                          </td>
                          <td>{socio.dni}</td>
                          <td>
                            {socio.sectores?.slice(0, 2).map((sector, index) => (
                              <Badge 
                                key={index} 
                                bg="info" 
                                className="me-1 mb-1"
                              >
                                {SECTORES_LABELS[sector] || sector}
                              </Badge>
                            ))}
                            {socio.sectores?.length > 2 && (
                              <Badge bg="secondary">+{socio.sectores.length - 2}</Badge>
                            )}
                          </td>
                          <td><EstadoBadge estado={socio.estado} /></td>
                          <td>
                            <small className="text-muted">
                              {formatDate(socio.fechaAlta)}
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(socio.ultimaActividad)}
                            </small>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  logSocioAction('VIEW_SOCIO', socio.id, `${socio.nombre} ${socio.apellido}`, { dni: socio.dni });
                                  navigate(`/socios/${socio.id}`);
                                }}
                                title="Ver detalles"
                              >
                                <FaEye />
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => {
                                  logSocioAction('EDIT_SOCIO', socio.id, `${socio.nombre} ${socio.apellido}`, { dni: socio.dni });
                                  navigate(`/socios/${socio.id}/editar`);
                                }}
                                title="Editar"
                              >
                                <FaEdit />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  
                  {sociosFiltrados.length === 0 && !loading && (
                    <div className="text-center py-4">
                      <FaUsers className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                      <h5>No se encontraron socios</h5>
                      <p className="text-muted">
                        {busqueda || Object.values(filtros).some(f => f) 
                          ? 'Intente ajustar los filtros de búsqueda'
                          : 'No hay socios registrados en el sistema'
                        }
                      </p>
                      {!busqueda && !Object.values(filtros).some(f => f) && (
                        <Button
                          variant="primary"
                          className="btn-opm-primary"
                          onClick={() => navigate('/socios/nuevo')}
                        >
                          <FaPlus className="me-2" />
                          Registrar Primer Socio
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SociosList; 