import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Badge, 
  Button, 
  Modal, 
  Form, 
  Alert,
  Spinner,
  Dropdown
} from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus,
  changeUserRole,
  checkEmailExists,
  formatUserForDisplay 
} from '../../services/userService';
import { ROLES, ROLES_LABELS, PERMISOS } from '../../utils/roles';
import { 
  FaUsers, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaUserShield,
  FaEllipsisV,
  FaUser
} from 'react-icons/fa';
import './UsuariosList.css';

const UsuariosList = () => {
  const { userData, hasPermission, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    rol: ROLES.VISUALIZADOR,
    telefono: ''
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const users = await getUsers();
      const formattedUsers = users.map(formatUserForDisplay);
      setUsuarios(formattedUsers);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        rol: user.rol || ROLES.VISUALIZADOR,
        telefono: user.telefono || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        rol: ROLES.VISUALIZADOR,
        telefono: ''
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      rol: ROLES.VISUALIZADOR,
      telefono: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.rol) {
      newErrors.rol = 'El rol es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);

      if (editingUser) {
        // Actualizar usuario existente
        await updateUser(editingUser.id, formData);
      } else {
        // Verificar si el email ya existe
        const emailExists = await checkEmailExists(formData.email);
        if (emailExists) {
          setErrors({ email: 'Este email ya está registrado' });
          return;
        }

        // Crear nuevo usuario
        await createUser(formData);
      }

      handleCloseModal();
      cargarUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setErrors({ general: 'Error al guardar el usuario' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await deleteUser(userId);
        cargarUsuarios();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId, !currentStatus);
      cargarUsuarios();
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await changeUserRole(userId, newRole);
      cargarUsuarios();
    } catch (error) {
      console.error('Error al cambiar rol del usuario:', error);
    }
  };

  const getRolBadge = (rol) => {
    const variants = {
      [ROLES.SUPER_ADMIN]: 'danger',
      [ROLES.ADMIN]: 'primary',
      [ROLES.VALIDADOR]: 'warning',
      [ROLES.GESTOR]: 'info',
      [ROLES.VISUALIZADOR]: 'secondary'
    };

    return (
      <Badge bg={variants[rol] || 'secondary'}>
        {ROLES_LABELS[rol] || rol}
      </Badge>
    );
  };

  const canEditUser = (user) => {
    // Super admin puede editar a cualquiera
    if (isSuperAdmin()) return true;
    
    // No se puede editar a sí mismo
    if (user.id === userData?.id) return false;
    
    // Solo se puede editar usuarios con roles menores
    const roleHierarchy = {
      [ROLES.SUPER_ADMIN]: 5,
      [ROLES.ADMIN]: 4,
      [ROLES.VALIDADOR]: 3,
      [ROLES.GESTOR]: 2,
      [ROLES.VISUALIZADOR]: 1
    };

    return roleHierarchy[userData?.rol] > roleHierarchy[user.rol];
  };

  const canDeleteUser = (user) => {
    // Super admin puede eliminar a cualquiera excepto a sí mismo
    if (isSuperAdmin() && user.id !== userData?.id) return true;
    
    // No se puede eliminar a sí mismo
    if (user.id === userData?.id) return false;
    
    return false;
  };

  return (
    <Container fluid className="usuarios-list-container">
      <Row className="mb-4">
        <Col>
          <h1 className="usuarios-title">
            <FaUsers className="me-2" />
            Gestión de Usuarios
          </h1>
          <p className="usuarios-subtitle">
            Administrar usuarios y permisos del sistema
          </p>
        </Col>
      </Row>

      {/* Botón de crear usuario */}
      {hasPermission(PERMISOS.USERS_CREATE) && (
        <Row className="mb-4">
          <Col>
            <Button 
              variant="primary" 
              className="btn-opm-primary"
              onClick={() => handleShowModal()}
            >
              <FaPlus className="me-2" />
              Nuevo Usuario
            </Button>
          </Col>
        </Row>
      )}

      {/* Tabla de usuarios */}
      <Row>
        <Col>
          <Card className="opm-card">
            <Card.Header>
              <h5 className="mb-0">
                <FaUsers className="me-2" />
                Usuarios del Sistema ({usuarios.length})
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
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Fecha Creación</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                          <td>
                            <strong>{usuario.nombre} {usuario.apellido}</strong>
                            {usuario.id === userData?.id && (
                              <Badge bg="info" className="ms-2">Tú</Badge>
                            )}
                          </td>
                          <td>{usuario.email}</td>
                          <td>{getRolBadge(usuario.rol)}</td>
                          <td>
                            <Badge bg={usuario.isActive ? 'success' : 'secondary'}>
                              {usuario.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                          <td>
                            <small className="text-muted">
                              {usuario.createdAt?.toLocaleDateString('es-AR')}
                            </small>
                          </td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle 
                                variant="outline-secondary" 
                                size="sm"
                                className="btn-opm-secondary"
                              >
                                <FaEllipsisV />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => navigate(`/usuarios/${usuario.id}`)}>
                                  <FaUser className="me-2" />
                                  Ver Perfil
                                </Dropdown.Item>
                                {canEditUser(usuario) && (
                                  <>
                                    <Dropdown.Item onClick={() => handleShowModal(usuario)}>
                                      <FaEdit className="me-2" />
                                      Editar
                                    </Dropdown.Item>
                                    <Dropdown.Item 
                                      onClick={() => handleToggleStatus(usuario.id, usuario.isActive)}
                                    >
                                      {usuario.isActive ? (
                                        <>
                                          <FaEyeSlash className="me-2" />
                                          Desactivar
                                        </>
                                      ) : (
                                        <>
                                          <FaEye className="me-2" />
                                          Activar
                                        </>
                                      )}
                                    </Dropdown.Item>
                                  </>
                                )}
                                {canDeleteUser(usuario) && (
                                  <Dropdown.Item 
                                    onClick={() => handleDeleteUser(usuario.id)}
                                    className="text-danger"
                                  >
                                    <FaTrash className="me-2" />
                                    Eliminar
                                  </Dropdown.Item>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para crear/editar usuario */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {errors.general && (
              <Alert variant="danger">{errors.general}</Alert>
            )}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    isInvalid={!!errors.nombre}
                    className="opm-form-control"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nombre}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                    isInvalid={!!errors.apellido}
                    className="opm-form-control"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.apellido}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                isInvalid={!!errors.email}
                className="opm-form-control"
                disabled={!!editingUser} // No permitir cambiar email al editar
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="opm-form-control"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rol *</Form.Label>
              <Form.Select
                value={formData.rol}
                onChange={(e) => setFormData({...formData, rol: e.target.value})}
                isInvalid={!!errors.rol}
                className="opm-form-control"
              >
                {Object.entries(ROLES_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.rol}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={saving}
              className="btn-opm-primary"
            >
              {saving ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default UsuariosList; 