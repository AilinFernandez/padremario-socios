import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Dropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useAudit } from '../../hooks/useAudit';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaBars, 
  FaBell,
  FaSearch,
  FaUserShield,
  FaCrown
} from 'react-icons/fa';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const { currentUser, userData, logout, isSuperAdmin, isAdmin } = useAuth();
  const { logLogout } = useAudit();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      // Log de auditoría antes del logout
      await logLogout();
      
      await logout();
      navigate('/login');
    } catch (error) {
      // Error silencioso para no interrumpir la funcionalidad
    }
  };

  const handleProfile = () => {
    // Navegar al perfil del usuario
    navigate(`/usuarios/${currentUser?.uid}`);
  };

  const getRoleIcon = () => {
    if (isSuperAdmin()) return <FaCrown className="text-warning" />;
    if (isAdmin()) return <FaUserShield className="text-primary" />;
    return <FaUser className="text-secondary" />;
  };

  const getRoleBadge = () => {
    if (!userData?.rol) return null;
    
    const variants = {
      'super_admin': 'danger',
      'admin': 'primary',
      'validador': 'warning',
      'gestor': 'info',
      'visualizador': 'secondary'
    };

    return (
      <Badge bg={variants[userData.rol] || 'secondary'} className="ms-2">
        {userData.rolLabel || userData.rol}
      </Badge>
    );
  };

  return (
    <Navbar 
      bg="primary" 
      variant="dark" 
      expand="lg" 
      className="opm-header"
      fixed="top"
    >
      <Container fluid>
        {/* Botón para mostrar/ocultar sidebar en móvil */}
        <Button
          variant="link"
          className="d-lg-none text-white border-0"
          onClick={toggleSidebar}
        >
          <FaBars />
        </Button>

        {/* Logo y título */}
        <Navbar.Brand href="/dashboard" className="opm-brand">
          <img
            src="https://padremario.org/wp-content/uploads/2022/08/OPM-logo-positivo-menu.png"
            alt="OPM"
            height="40"
            className="d-inline-block align-top me-2"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          Sistema de Socios OPM
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {/* Notificaciones */}
            <Nav.Link 
              className="text-white position-relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </Nav.Link>

            {/* Dropdown del usuario */}
            <Dropdown align="end">
              <Dropdown.Toggle 
                variant="link" 
                className="text-white text-decoration-none d-flex align-items-center"
              >
                <div className="user-avatar me-2">
                  {getRoleIcon()}
                </div>
                <div className="user-info d-none d-md-block">
                  <div className="user-name">
                    {userData ? `${userData.nombre} ${userData.apellido}` : currentUser?.email}
                  </div>
                  {getRoleBadge()}
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Header>
                  <div className="d-flex align-items-center">
                    {getRoleIcon()}
                    <div className="ms-2">
                      <div className="fw-bold">
                        {userData ? `${userData.nombre} ${userData.apellido}` : 'Usuario'}
                      </div>
                      <small className="text-muted">
                        {userData?.email || currentUser?.email}
                      </small>
                    </div>
                  </div>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleProfile}>
                  <FaUser className="me-2" />
                  Mi Perfil
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <FaSignOutAlt className="me-2" />
                  Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>

      {/* Panel de notificaciones */}
      {showNotifications && (
        <div className="notifications-panel">
          <div className="notification-item">
            <strong>Nuevo socio registrado</strong>
            <small>María González se registró en Educación</small>
          </div>
          <div className="notification-item">
            <strong>Actividad actualizada</strong>
            <small>Taller de memoria reprogramado</small>
          </div>
          <div className="notification-item">
            <strong>Reporte disponible</strong>
            <small>Estadísticas mensuales listas</small>
          </div>
        </div>
      )}
    </Navbar>
  );
};

export default Header; 