import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Badge, 
  Form, 
  Button, 
  Alert,
  Spinner,
  InputGroup,
  Dropdown,
  DropdownButton
} from 'react-bootstrap';
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaClock, 
  FaUser, 
  FaEye,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { 
  getRecentAuditLogs, 
  getAuditLogs, 
  getAllAuditLogs,
  getInactiveUsers, 
  ACTION_LABELS 
} from '../../services/auditService';
import { useAuth } from '../../context/AuthContext';
import './Auditoria.css';

const Auditoria = () => {
  const { userPermissions, userData } = useAuth();
  const [logs, setLogs] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
  const [filters, setFilters] = useState({
    userEmail: '',
    action: '',
    startDate: '',
    endDate: '',
    limit: 200
  });
  
  // Estadísticas
  const [stats, setStats] = useState({
    totalActions: 0,
    todayActions: 0,
    activeUsers: 0,
    inactiveUsers: 0
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadAuditData();
    loadInactiveUsers();
  }, []);

  // Función para calcular estadísticas
  const calculateStats = (logsData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = logsData.filter(log => 
      log.timestamp >= today
    );
    
    const uniqueUsers = new Set(logsData.map(log => log.userEmail));
    
    const newStats = {
      totalActions: logsData.length,
      todayActions: todayLogs.length,
      activeUsers: uniqueUsers.size,
      inactiveUsers: inactiveUsers.length
    };
    
    setStats(newStats);
  };

  const loadAuditData = async () => {
    try {
      setLoading(true);
      
      // Si es super admin, obtener todos los logs del sistema
      // Si no, obtener solo los logs recientes
      let recentLogs;
      if (userData?.role === 'super_admin' || userData?.rol === 'super_admin') {
        recentLogs = await getAllAuditLogs(filters.limit);
      } else {
        recentLogs = await getRecentAuditLogs(filters.limit);
      }
      
      setLogs(recentLogs);
      
      // Calcular estadísticas
      calculateStats(recentLogs);
    } catch (error) {
      setError('Error al cargar los datos de auditoría');
    } finally {
      setLoading(false);
    }
  };

  const loadInactiveUsers = async () => {
    try {
      const inactive = await getInactiveUsers(30); // 30 minutos de inactividad
      setInactiveUsers(inactive);
    } catch (error) {
      // Error silencioso para no interrumpir la funcionalidad
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const filteredLogs = await getAuditLogs(filters);
      setLogs(filteredLogs);
      calculateStats(filteredLogs); // Calcular estadísticas después de aplicar filtros
    } catch (error) {
      setError('Error al aplicar los filtros');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      userEmail: '',
      action: '',
      startDate: '',
      endDate: '',
      limit: 200
    });
    loadAuditData(); // Esto ya recalcula las estadísticas
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'LOGIN_SUCCESS':
        return <FaCheckCircle className="text-success" />;
      case 'LOGIN_FAILED':
        return <FaTimesCircle className="text-danger" />;
      case 'LOGOUT':
        return <FaClock className="text-info" />;
      case 'SEARCH_SOCIOS':
      case 'SEARCH_VALIDACION':
        return <FaSearch className="text-primary" />;
      case 'CREATE_SOCIO':
      case 'EDIT_SOCIO':
      case 'DELETE_SOCIO':
        return <FaUser className="text-warning" />;
      default:
        return <FaEye className="text-secondary" />;
    }
  };

  const getActionBadge = (action) => {
    const colorMap = {
      'LOGIN_SUCCESS': 'success',
      'LOGIN_FAILED': 'danger',
      'LOGOUT': 'info',
      'SEARCH_SOCIOS': 'primary',
      'SEARCH_VALIDACION': 'primary',
      'CREATE_SOCIO': 'success',
      'EDIT_SOCIO': 'warning',
      'DELETE_SOCIO': 'danger',
      'VIEW_SOCIO': 'secondary'
    };
    
    return (
      <Badge bg={colorMap[action] || 'secondary'}>
        {ACTION_LABELS[action] || action}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES');
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatActionDetails = (log) => {
    if (!log.details || Object.keys(log.details).length === 0) {
      return <span className="text-muted">-</span>;
    }

    const details = log.details;
    
    // Casos específicos para diferentes acciones
    switch (log.action) {
      case 'SEARCH_SOCIOS':
      case 'SEARCH_VALIDACION':
        return (
          <div>
            <div><strong>Búsqueda:</strong> {details.searchTerm || 'N/A'}</div>
            {details.resultsCount !== undefined && (
              <div><strong>Resultados:</strong> {details.resultsCount}</div>
            )}
            {details.filters && Object.keys(details.filters).length > 0 && (
              <div><strong>Filtros:</strong> {Object.entries(details.filters).map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
            )}
          </div>
        );
      
      case 'CREATE_SOCIO':
        return (
          <div>
            <div><strong>Nuevo socio:</strong> {details.socioName || details.nombre || 'N/A'}</div>
            {details.socioId && <div><strong>ID:</strong> {details.socioId}</div>}
            {details.dni && <div><strong>DNI:</strong> {details.dni}</div>}
          </div>
        );
      
      case 'EDIT_SOCIO':
        return (
          <div>
            <div><strong>Socio editado:</strong> {details.socioName || details.nombre || 'N/A'}</div>
            {details.socioId && <div><strong>ID:</strong> {details.socioId}</div>}
            {details.changes && <div><strong>Cambios:</strong> {Object.keys(details.changes).join(', ')}</div>}
          </div>
        );
      
      case 'VIEW_SOCIO':
        return (
          <div>
            <div><strong>Socio visto:</strong> {details.socioName || details.nombre || 'N/A'}</div>
            {details.socioId && <div><strong>ID:</strong> {details.socioId}</div>}
          </div>
        );
      
      case 'DELETE_SOCIO':
        return (
          <div>
            <div><strong>Socio eliminado:</strong> {details.socioName || details.nombre || 'N/A'}</div>
            {details.socioId && <div><strong>ID:</strong> {details.socioId}</div>}
          </div>
        );
      
      case 'NAVIGATE_TO_PAGE':
        return (
          <div>
            <div><strong>Página:</strong> {details.pageName || details.page || 'N/A'}</div>
            {details.url && <div><strong>URL:</strong> <small>{details.url}</small></div>}
          </div>
        );
      
      case 'LOGIN_SUCCESS':
        return <div><strong>Inicio de sesión exitoso</strong></div>;
      
      case 'LOGIN_FAILED':
        return (
          <div>
            <div><strong>Error de inicio de sesión</strong></div>
            {details.errorMessage && <div><strong>Error:</strong> {details.errorMessage}</div>}
          </div>
        );
      
      case 'LOGOUT':
        return <div><strong>Cierre de sesión</strong></div>;
      
      case 'GENERATE_REPORT':
        return (
          <div>
            <div><strong>Reporte:</strong> {details.reportType || 'N/A'}</div>
            {details.format && <div><strong>Formato:</strong> {details.format}</div>}
          </div>
        );
      
      default:
        // Para acciones no específicas, mostrar todos los detalles
        return (
          <div>
            {Object.entries(details).map(([key, value]) => (
              <div key={key}>
                <small>
                  <strong>{key}:</strong> {String(value)}
                </small>
              </div>
            ))}
          </div>
        );
    }
  };

  if (loading && logs.length === 0) {
    return (
      <Container className="mt-4">
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              <FaEye className="me-2" />
              Auditoría del Sistema
            </h2>
            {(userData?.role === 'super_admin' || userData?.rol === 'super_admin') && (
              <Badge bg="success" className="fs-6">
                <FaEye className="me-1" />
                Vista Completa del Sistema
              </Badge>
            )}
          </div>
        </Col>
      </Row>

      {/* Estadísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stats-card text-center">
            <Card.Body>
              <h3 className="text-primary">{stats.totalActions}</h3>
              <p className="mb-0">Total de Acciones</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card text-center">
            <Card.Body>
              <h3 className="text-success">{stats.todayActions}</h3>
              <p className="mb-0">Acciones Hoy</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card text-center">
            <Card.Body>
              <h3 className="text-info">{stats.activeUsers}</h3>
              <p className="mb-0">Usuarios Activos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card text-center">
            <Card.Body>
              <h3 className="text-warning">{stats.inactiveUsers}</h3>
              <p className="mb-0">Usuarios Inactivos</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alertas de usuarios inactivos */}
      {inactiveUsers.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Alert variant="warning">
              <FaExclamationTriangle className="me-2" />
              <strong>Usuarios inactivos:</strong> {inactiveUsers.length} usuarios no han tenido actividad en más de 30 minutos.
            </Alert>
          </Col>
        </Row>
      )}

      {/* Filtros */}
      <Row className="mb-4">
        <Col>
          <Card className="opm-card">
            <Card.Header>
              <FaFilter className="me-2" />
              Filtros de Búsqueda
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Usuario</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Email del usuario"
                      value={filters.userEmail}
                      onChange={(e) => handleFilterChange('userEmail', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Acción</Form.Label>
                    <Form.Select
                      value={filters.action}
                      onChange={(e) => handleFilterChange('action', e.target.value)}
                    >
                      <option value="">Todas las acciones</option>
                      {Object.entries(ACTION_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Desde</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Hasta</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Límite</Form.Label>
                    <Form.Select
                      value={filters.limit}
                      onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col>
                  <Button variant="primary" onClick={applyFilters} className="me-2">
                    <FaSearch className="me-1" />
                    Aplicar Filtros
                  </Button>
                  <Button variant="outline-secondary" onClick={clearFilters}>
                    Limpiar Filtros
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de logs */}
      <Row>
        <Col>
          <Card className="opm-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>
                <FaEye className="me-2" />
                Registro de Actividad
              </span>
              <Button variant="outline-primary" size="sm">
                <FaDownload className="me-1" />
                Exportar
              </Button>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}
              
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Fecha/Hora</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Acción</th>
                    <th>Detalles</th>
                    <th>Página</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{formatTimestamp(log.timestamp)}</td>
                      <td>
                        <div>
                          <strong>{log.userName}</strong>
                          <br />
                          <small className="text-muted">{log.userEmail}</small>
                        </div>
                      </td>
                      <td>
                        <Badge bg="secondary">{log.userRole}</Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {getActionIcon(log.action)}
                          <span className="ms-2">{getActionBadge(log.action)}</span>
                        </div>
                      </td>
                      <td>
                        {formatActionDetails(log)}
                      </td>
                      <td>
                        <small>{log.page}</small>
                      </td>
                      <td>
                        {log.success ? (
                          <Badge bg="success">Exitoso</Badge>
                        ) : (
                          <Badge bg="danger">Error</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {logs.length === 0 && !loading && (
                <div className="text-center py-4">
                  <p className="text-muted">No se encontraron registros de actividad</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Auditoria; 