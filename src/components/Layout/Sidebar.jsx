import React, { useState, useEffect } from 'react';
import { Nav, Offcanvas, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../utils/roles';
import { 
  FaTachometerAlt,
  FaUsers, 
  FaUserPlus, 
  FaIdCard, 
  FaChartBar,
  FaCog,
  FaHome,
  FaUserShield,
  FaEye,
  FaEnvelope,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, userData } = useAuth();
  
  // Estado para sidebar colapsado (solo en desktop)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: <FaTachometerAlt />,
      label: 'Dashboard',
      description: 'Vista general del sistema',
      permission: PERMISOS.DASHBOARD_VIEW
    },
    {
      path: '/socios',
      icon: <FaUsers />,
      label: 'Socios',
      description: 'Gestión de socios',
      permission: PERMISOS.SOCIOS_VIEW
    },
    {
      path: '/socios/nuevo',
      icon: <FaUserPlus />,
      label: 'Nuevo Socio',
      description: 'Registrar nuevo socio',
      permission: PERMISOS.SOCIOS_CREATE
    },
    {
      path: '/validacion',
      icon: <FaIdCard />,
      label: 'Validación Rápida',
      description: 'Buscar por DNI',
      permission: PERMISOS.VALIDACION_VIEW
    },
    {
      path: '/reportes',
      icon: <FaChartBar />,
      label: 'Reportes',
      description: 'Estadísticas y exportación',
      permission: PERMISOS.REPORTES_VIEW
    },
    {
      path: '/usuarios',
      icon: <FaUserShield />,
      label: 'Usuarios',
      description: 'Gestión de usuarios y roles',
      permission: PERMISOS.USERS_VIEW
    },
    {
      path: '/auditoria',
      icon: <FaEye />,
      label: 'Auditoría',
      description: 'Control de actividad del sistema',
      permission: PERMISOS.USERS_VIEW
    },
    {
      path: '/comunicaciones',
      icon: <FaEnvelope />,
      label: 'Comunicaciones',
      description: 'Gestión de comunicaciones',
      permission: PERMISOS.SOCIOS_VIEW
    },
    {
      path: '/configuracion',
      icon: <FaCog />,
      label: 'Configuración',
      description: 'Ajustes del sistema',
      permission: PERMISOS.CONFIG_VIEW
    }
  ];

  // Filtrar elementos del menú según permisos del usuario
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const handleNavClick = (path) => {
    navigate(path);
    // Cerrar sidebar en móvil
    if (window.innerWidth < 992) {
      onClose();
    }
  };

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    if (path === '/socios') {
      return location.pathname.startsWith('/socios') && location.pathname !== '/socios/nuevo';
    }
    return location.pathname === path;
  };

  // Sidebar para móvil usando Bootstrap Offcanvas
  const MobileSidebar = () => (
    <Offcanvas 
      show={isOpen} 
      onHide={onClose}
      placement="start"
      className="sidebar-offcanvas"
    >
      <Offcanvas.Header closeButton className="sidebar-header">
        <Offcanvas.Title className="d-flex align-items-center">
          <FaHome className="logo-icon me-2" />
          <span className="logo-text">OPM</span>
        </Offcanvas.Title>
      </Offcanvas.Header>
      
      <Offcanvas.Body className="p-0">
        {userData && (
          <div className="sidebar-user-info p-3 border-bottom">
            <div className="user-name fw-bold">
              {userData.nombre} {userData.apellido}
            </div>
            <div className="user-role text-muted">
              {userData.rolLabel || userData.rol}
            </div>
          </div>
        )}
        
        <Nav className="flex-column sidebar-nav p-3">
          {filteredMenuItems.map((item, index) => (
            <Nav.Link
              key={index}
              className={`sidebar-nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
            >
              <div className="nav-icon">
                {item.icon}
              </div>
              <div className="nav-content">
                <div className="nav-label">{item.label}</div>
                <div className="nav-description">{item.description}</div>
              </div>
            </Nav.Link>
          ))}
        </Nav>
        
        <div className="sidebar-footer p-3 border-top mt-auto">
          <small className="text-muted">
            Sistema de Socios OPM v1.0.0
          </small>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );

  // Sidebar para desktop usando Bootstrap
  const DesktopSidebar = () => (
    <div className={`sidebar-desktop ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <FaHome className="logo-icon" />
          {!isCollapsed && <span className="logo-text">OPM</span>}
        </div>
        {userData && !isCollapsed && (
          <div className="sidebar-user-info">
            <div className="user-name">
              {userData.nombre} {userData.apellido}
            </div>
            <div className="user-role">
              {userData.rolLabel || userData.rol}
            </div>
          </div>
        )}
        
        <Button 
          variant="outline-light"
          size="sm"
          className="sidebar-toggle-btn"
          onClick={toggleCollapse}
          title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </Button>
      </div>

      <div className="sidebar-content">
        <Nav className="flex-column sidebar-nav">
          {filteredMenuItems.map((item, index) => (
            <Nav.Link
              key={index}
              className={`sidebar-nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="nav-icon">
                {item.icon}
              </div>
              {!isCollapsed && (
                <div className="nav-content">
                  <div className="nav-label">{item.label}</div>
                  <div className="nav-description">{item.description}</div>
                </div>
              )}
            </Nav.Link>
          ))}
        </Nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-version">
          {!isCollapsed && (
            <small className="text-muted">
              Sistema de Socios OPM v1.0.0
            </small>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar móvil */}
      <div className="d-lg-none">
        <MobileSidebar />
      </div>
      
      {/* Sidebar desktop */}
      <div className="d-none d-lg-block">
        <DesktopSidebar />
      </div>
    </>
  );
};

export default Sidebar; 