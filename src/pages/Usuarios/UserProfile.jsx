import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Badge, 
  Button, 
  Alert,
  Spinner,
  ProgressBar,
  ListGroup
} from 'react-bootstrap';
import { 
  FaUser, 
  FaEnvelope, 
  FaShieldAlt, 
  FaClock, 
  FaChartLine,
  FaHistory,
  FaDownload,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaEye
} from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById } from '../../services/userService';
import { getUserAuditLogsByEmail, getUserActivityStatsByEmail, getAllAuditLogs, ACTION_LABELS } from '../../services/auditService';
import { useAuth } from '../../context/AuthContext';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { userPermissions } = useAuth();
  
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del usuario
      const userData = await getUserById(userId);
      
      if (!userData) {
        setError('Usuario no encontrado');
        return;
      }
      
      // Debug temporal para ver los datos del usuario
      // console.log('Datos del usuario cargados:', userData);
      
      setUser(userData);
      
      // Obtener logs del sistema
      const allLogs = await getAllAuditLogs(100);
      
      // Buscar logs que coincidan con el email del usuario
      const matchingLogs = allLogs.filter(log => 
        log.userEmail === userData.email || 
        log.userEmail === userData.email?.toLowerCase() ||
        log.userEmail === userData.email?.toUpperCase()
      );
      
      // Si no encontramos logs por email, intentar por userId
      let userLogs = matchingLogs;
      if (matchingLogs.length === 0 && userData.authUid) {
        const authUidLogs = allLogs.filter(log => log.userId === userData.authUid);
        userLogs = authUidLogs;
      }
      
      setLogs(userLogs);
      
      // Filtrar logs de los últimos 7 días para las métricas
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentLogs = userLogs.filter(log => 
        log.timestamp && log.timestamp >= sevenDaysAgo
      );
      
      // Calcular estadísticas manualmente con logs recientes
      const userStats = calculateUserStats(recentLogs);
      setStats(userStats);
      
    } catch (error) {
      setError('Error al cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  // Función helper para calcular estadísticas
  const calculateUserStats = (logs) => {
    const stats = {
      totalActions: logs.length,
      totalSessionTime: 0,
      sessions: 0,
      lastActivity: null,
      actionsByType: {}
    };
    
    // Ordenar logs por timestamp
    const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
    
    let sessionStart = null;
    let totalSessionTime = 0;
    let currentSessionStart = null;
    
    sortedLogs.forEach((log, index) => {
      // Contar acciones por tipo
      if (!stats.actionsByType[log.action]) {
        stats.actionsByType[log.action] = 0;
      }
      stats.actionsByType[log.action]++;
      
      // Calcular sesiones y tiempo
      if (log.action === 'LOGIN_SUCCESS' || log.action === 'NAVIGATE_TO_PAGE') {
        // Si es la primera acción o han pasado más de 30 minutos, es una nueva sesión
        if (!currentSessionStart || 
            (log.timestamp - currentSessionStart) > (30 * 60 * 1000)) {
          currentSessionStart = log.timestamp;
          stats.sessions++;
        }
      }
      
      // Calcular tiempo de sesión si hay LOGOUT
      if (log.action === 'LOGOUT' && currentSessionStart) {
        const sessionDuration = log.timestamp - currentSessionStart;
        totalSessionTime += sessionDuration;
        currentSessionStart = null;
      }
      
      // Última actividad
      if (!stats.lastActivity || log.timestamp > stats.lastActivity) {
        stats.lastActivity = log.timestamp;
      }
    });
    
    // Si no hay LOGOUT pero hay actividad, calcular tiempo hasta la última actividad
    if (currentSessionStart && stats.lastActivity) {
      const sessionDuration = stats.lastActivity - currentSessionStart;
      totalSessionTime += sessionDuration;
    }
    
    stats.totalSessionTime = totalSessionTime;
    
    return stats;
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
      case 'VIEW_SOCIO':
        return <FaEye className="text-secondary" />;
      default:
        return <FaUser className="text-warning" />;
    }
  };

  const getActionBadge = (action) => {
    const colorMap = {
      'LOGIN_SUCCESS': 'success',
      'LOGIN_FAILED': 'danger',
      'LOGOUT': 'info',
      'SEARCH_SOCIOS': 'primary',
      'SEARCH_VALIDACION': 'primary',
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

  const formatDuration = (milliseconds) => {
    if (!milliseconds) return '0 min';
    
    const minutes = Math.floor(milliseconds / (1000 * 60));
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES');
  };

  const getRoleBadge = (role) => {
    const colorMap = {
      'super_admin': 'danger',
      'admin': 'warning',
      'validador': 'info',
      'gestor': 'primary',
      'visualizador': 'secondary'
    };
    
    return (
      <Badge bg={colorMap[role] || 'secondary'}>
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge bg="success">Activo</Badge>
    ) : (
      <Badge bg="danger">Inactivo</Badge>
    );
  };

  if (loading) {
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

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          {error}
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate('/usuarios')}>
          <FaArrowLeft className="me-2" />
          Volver a Usuarios
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/usuarios')}
              className="me-3"
            >
              <FaArrowLeft />
            </Button>
            <div>
              <h2 className="user-profile-title mb-0">
                <FaUser className="me-2" />
                Perfil de Empleado
              </h2>
              <p className="text-muted mb-0">Información detallada y actividad del usuario</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Información del usuario */}
      <Row className="mb-4">
        <Col md={4}>
          <Card>
            <Card.Header>
              <FaUser className="me-2" />
              Información Personal
            </Card.Header>
            <Card.Body>
              <div className="user-info">
                <div className="mb-3">
                  <strong>Nombre:</strong>
                  <p className="mb-1">
                    {user.nombre && user.apellido ? 
                      `${user.nombre} ${user.apellido}` : 
                      user.nombre || user.apellido || 'No especificado'
                    }
                  </p>
                </div>
                
                <div className="mb-3">
                  <strong>Email:</strong>
                  <p className="mb-1">
                    <FaEnvelope className="me-1" />
                    {user.email}
                  </p>
                </div>
                
                <div className="mb-3">
                  <strong>Rol:</strong>
                  <div className="mt-1">
                    {getRoleBadge(user.rol || user.role)}
                  </div>
                </div>
                
                <div className="mb-3">
                  <strong>Estado:</strong>
                  <div className="mt-1">
                    {getStatusBadge(user.isActive !== false)}
                  </div>
                </div>
                
                <div className="mb-3">
                  <strong>Fecha de registro:</strong>
                  <p className="mb-1">
                    {user.createdAt ? 
                      (user.createdAt.toDate ? 
                        user.createdAt.toDate().toLocaleDateString('es-ES') : 
                        new Date(user.createdAt).toLocaleDateString('es-ES')
                      ) : 
                      'No disponible'
                    }
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card>
            <Card.Header>
              <FaChartLine className="me-2" />
              Métricas de Actividad (Últimos 7 días)
            </Card.Header>
            <Card.Body>
              {stats ? (
                <Row>
                  <Col md={3}>
                    <div className="metric-card text-center">
                      <h3 className="text-primary">{stats.totalActions}</h3>
                      <p className="mb-0">Total de Acciones</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="metric-card text-center">
                      <h3 className="text-success">{stats.sessions}</h3>
                      <p className="mb-0">Sesiones</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="metric-card text-center">
                      <h3 className="text-info">{formatDuration(stats.totalSessionTime)}</h3>
                      <p className="mb-0">Tiempo Total</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="metric-card text-center">
                      <h3 className="text-warning">
                        {stats.lastActivity ? 
                          formatRelativeTime(stats.lastActivity) : 
                          'N/A'
                        }
                      </h3>
                      <p className="mb-0">Última Actividad</p>
                    </div>
                  </Col>
                </Row>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No hay datos de actividad disponibles</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Acciones por tipo */}
      {stats && stats.actionsByType && Object.keys(stats.actionsByType).length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <FaHistory className="me-2" />
                Distribución de Acciones
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {Object.entries(stats.actionsByType).map(([action, count]) => (
                    <ListGroup.Item key={action} className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        {getActionIcon(action)}
                        <span className="ms-2">{ACTION_LABELS[action] || action}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <ProgressBar 
                          now={(count / stats.totalActions) * 100} 
                          className="me-2" 
                          style={{ width: '100px' }}
                        />
                        <Badge bg="primary">{count}</Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Historial de actividad */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>
                <FaHistory className="me-2" />
                Historial de Actividad
              </span>
              <Button variant="outline-primary" size="sm">
                <FaDownload className="me-1" />
                Exportar
              </Button>
            </Card.Header>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Fecha/Hora</th>
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
                        <div className="d-flex align-items-center">
                          {getActionIcon(log.action)}
                          <span className="ms-2">{getActionBadge(log.action)}</span>
                        </div>
                      </td>
                      <td>
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <div>
                            {Object.entries(log.details).map(([key, value]) => (
                              <div key={key}>
                                <small>
                                  <strong>{key}:</strong> {String(value)}
                                </small>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
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
              
              {logs.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted">No hay registros de actividad</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile; 