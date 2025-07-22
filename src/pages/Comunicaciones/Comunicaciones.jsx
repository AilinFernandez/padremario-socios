import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Table, 
  Badge, 
  Modal, 
  Form, 
  Alert,
  Spinner,
  Tabs,
  Tab
} from 'react-bootstrap';
import { 
  FaEnvelope, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaUsers,
  FaChartBar,
  FaFilter
} from 'react-icons/fa';
import { useComunicaciones } from '../../hooks/useComunicaciones';
import { SECTORES_LABELS, ESTADOS_SOCIO_LABELS, BARRIOS } from '../../utils/constants';
import './Comunicaciones.css';

const Comunicaciones = () => {
  const {
    comunicaciones,
    loading,
    error,
    estadisticas,
    crearComunicacion,
    eliminarComunicacion,
    filtrarDestinatarios
  } = useComunicaciones();

  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedComunicacion, setSelectedComunicacion] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('lista');

  // Formulario de nueva comunicación
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'anuncio',
    contenido: '',
    sectores: [],
    estado: '',
    barrio: ''
  });

  // Filtros para destinatarios
  const [filtrosDestinatarios, setFiltrosDestinatarios] = useState({
    sectores: [],
    estado: '',
    barrio: ''
  });

  const [destinatariosFiltrados, setDestinatariosFiltrados] = useState([]);

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar cambios en filtros de destinatarios
  const handleFiltroChange = (field, value) => {
    setFiltrosDestinatarios(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Aplicar filtros y obtener destinatarios
  const aplicarFiltros = () => {
    const destinatarios = filtrarDestinatarios(filtrosDestinatarios);
    setDestinatariosFiltrados(destinatarios);
  };

  // Crear nueva comunicación
  const handleCrearComunicacion = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || !formData.contenido.trim()) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const result = await crearComunicacion(formData);
    
    if (result.success) {
      setShowModal(false);
      setFormData({
        titulo: '',
        tipo: 'anuncio',
        contenido: '',
        sectores: [],
        estado: '',
        barrio: ''
      });
      alert('Comunicación creada correctamente');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  // Eliminar comunicación
  const handleEliminarComunicacion = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta comunicación?')) {
      const result = await eliminarComunicacion(id);
      
      if (result.success) {
        alert('Comunicación eliminada correctamente');
      } else {
        alert(`Error: ${result.error}`);
      }
    }
  };

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener badge de tipo
  const getTipoBadge = (tipo) => {
    const colores = {
      anuncio: 'primary',
      promocion: 'success',
      newsletter: 'info',
      recordatorio: 'warning'
    };
    
    return (
      <Badge bg={colores[tipo] || 'secondary'}>
        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </Badge>
    );
  };

  // Obtener badge de estado
  const getEstadoBadge = (estado) => {
    const colores = {
      borrador: 'secondary',
      enviado: 'success',
      programado: 'warning'
    };
    
    return (
      <Badge bg={colores[estado] || 'secondary'}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="comunicaciones-container">
      <Row className="mb-4">
        <Col>
          <h1 className="comunicaciones-title">
            <FaEnvelope className="me-2" />
            Comunicaciones
          </h1>
          <p className="comunicaciones-subtitle">
            Gestionar y enviar comunicaciones a los socios
          </p>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            className="btn-opm-primary"
            onClick={() => setShowModal(true)}
          >
            <FaPlus className="me-2" />
            Nueva Comunicación
          </Button>
        </Col>
      </Row>

      <Alert variant="info" className="mb-4">
        <FaEnvelope className="me-2" />
        <strong>Funcionalidad de envío de emails en desarrollo</strong><br />
        Por el momento, puedes crear y gestionar comunicaciones. La funcionalidad de envío de emails estará disponible próximamente.
      </Alert>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Tabs
        activeKey={vistaActiva}
        onSelect={(k) => setVistaActiva(k)}
        className="mb-4"
      >
        <Tab eventKey="lista" title={
          <span>
            <FaEnvelope className="me-2" />
            Lista de Comunicaciones
          </span>
        }>
          <Row>
            <Col>
              <Card className="opm-card">
                <Card.Header>
                  <h5 className="mb-0">
                    <FaEnvelope className="me-2" />
                    Comunicaciones ({comunicaciones.length})
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
                    <Table responsive className="opm-table">
                      <thead>
                        <tr>
                          <th>Título</th>
                          <th>Tipo</th>
                          <th>Estado</th>
                          <th>Fecha Creación</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comunicaciones.map((comunicacion) => (
                          <tr key={comunicacion.id}>
                            <td>
                              <strong>{comunicacion.titulo}</strong>
                              <br />
                              <small className="text-muted">
                                Creado por: {comunicacion.creadoPorNombre}
                              </small>
                            </td>
                            <td>{getTipoBadge(comunicacion.tipo)}</td>
                            <td>{getEstadoBadge(comunicacion.estado)}</td>
                            <td>
                              <small className="text-muted">
                                {formatDate(comunicacion.fechaCreacion)}
                              </small>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedComunicacion(comunicacion);
                                    setShowPreviewModal(true);
                                  }}
                                  title="Vista previa"
                                >
                                  <FaEye />
                                </Button>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  title="Editar"
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleEliminarComunicacion(comunicacion.id)}
                                  title="Eliminar"
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="estadisticas" title={
          <span>
            <FaChartBar className="me-2" />
            Estadísticas
          </span>
        }>
          <Row>
            <Col md={3} className="mb-3">
              <Card className="stats-card text-center">
                <Card.Body>
                  <h3 className="text-primary">{estadisticas?.total || 0}</h3>
                  <p className="mb-0">Total Comunicaciones</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="stats-card text-center">
                <Card.Body>
                  <h3 className="text-success">{estadisticas?.enviadas || 0}</h3>
                  <p className="mb-0">Enviadas</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="stats-card text-center">
                <Card.Body>
                  <h3 className="text-secondary">{estadisticas?.borradores || 0}</h3>
                  <p className="mb-0">Borradores</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="stats-card text-center">
                <Card.Body>
                  <h3 className="text-info">{Object.keys(estadisticas?.porTipo || {}).length}</h3>
                  <p className="mb-0">Tipos de Comunicación</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {estadisticas?.porTipo && Object.keys(estadisticas.porTipo).length > 0 && (
            <Row>
              <Col>
                <Card className="opm-card">
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaChartBar className="me-2" />
                      Comunicaciones por Tipo
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      {Object.entries(estadisticas.porTipo).map(([tipo, cantidad]) => (
                        <Col md={3} key={tipo} className="mb-3">
                          <div className="text-center">
                            <h4 className="text-primary">{cantidad}</h4>
                            <p className="mb-0">{getTipoBadge(tipo)}</p>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Tab>
      </Tabs>

      {/* Modal Nueva Comunicación */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlus className="me-2" />
            Nueva Comunicación
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCrearComunicacion}>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Título *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    placeholder="Título de la comunicación"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo</Form.Label>
                  <Form.Select
                    value={formData.tipo}
                    onChange={(e) => handleInputChange('tipo', e.target.value)}
                  >
                    <option value="anuncio">Anuncio</option>
                    <option value="promocion">Promoción</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="recordatorio">Recordatorio</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Contenido *</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={formData.contenido}
                onChange={(e) => handleInputChange('contenido', e.target.value)}
                placeholder="Escribe el contenido de la comunicación..."
                required
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Sectores</Form.Label>
                  <Form.Select
                    value={formData.sectores[0] || ''}
                    onChange={(e) => handleInputChange('sectores', e.target.value ? [e.target.value] : [])}
                  >
                    <option value="">Todos los sectores</option>
                    {Object.entries(SECTORES_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={formData.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    {Object.entries(ESTADOS_SOCIO_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Barrio</Form.Label>
                  <Form.Select
                    value={formData.barrio}
                    onChange={(e) => handleInputChange('barrio', e.target.value)}
                  >
                    <option value="">Todos los barrios</option>
                    {BARRIOS.map(barrio => (
                      <option key={barrio} value={barrio}>{barrio}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Creando...
                </>
              ) : (
                'Crear Comunicación'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Vista Previa */}
      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEye className="me-2" />
            Vista Previa
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComunicacion && (
            <div>
              <h4>{selectedComunicacion.titulo}</h4>
              <div className="mb-3">
                {getTipoBadge(selectedComunicacion.tipo)} {getEstadoBadge(selectedComunicacion.estado)}
              </div>
              <div className="border p-3 rounded bg-light">
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {selectedComunicacion.contenido}
                </pre>
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  <strong>Filtros aplicados:</strong><br />
                  Sectores: {selectedComunicacion.sectores?.length > 0 ? selectedComunicacion.sectores.join(', ') : 'Todos'}<br />
                  Estado: {selectedComunicacion.estado || 'Todos'}<br />
                  Barrio: {selectedComunicacion.barrio || 'Todos'}
                </small>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Comunicaciones; 