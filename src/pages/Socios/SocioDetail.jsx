import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocios } from '../../hooks/useSocios';
import { SECTORES_LABELS, ESTADOS_SOCIO_LABELS, SECTOR_COLORS } from '../../utils/constants';
import { 
  FaUser, 
  FaEdit, 
  FaTrash, 
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaIdCard
} from 'react-icons/fa';
import EtiquetaBadge from '../../components/EtiquetaBadge';
import './SocioDetail.css';

const SocioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSocioById, eliminarSocio, loading } = useSocios();
  const [socio, setSocio] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarSocio = async () => {
      try {
        const socioData = await getSocioById(id);
        if (socioData) {
          setSocio(socioData);
        } else {
          setError('Socio no encontrado');
        }
      } catch (err) {
        setError('Error al cargar el socio: ' + err.message);
      }
    };

    if (id) {
      cargarSocio();
    }
  }, [id]);

  const handleEliminar = async () => {
    if (window.confirm('¿Está seguro de que desea eliminar este socio? Esta acción no se puede deshacer.')) {
      try {
        await eliminarSocio(id);
        navigate('/socios');
      } catch (err) {
        setError('Error al eliminar el socio: ' + err.message);
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getEstadoBadge = (estado) => {
    let colorClass = 'text-secondary border-secondary';
    if (estado === 'activo') colorClass = 'text-success border-success';
    if (estado === 'baja_temporal') colorClass = 'text-warning border-warning';
    return (
      <span className={`badge bg-white ${colorClass} border px-3 py-2 fw-semibold`} style={{ fontSize: '1rem' }}>
        {ESTADOS_SOCIO_LABELS[estado] || estado}
      </span>
    );
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  if (loading) {
    return (
      <Container fluid className="socio-detail-container">
        <div className="text-center py-5">
          <Spinner animation="border" role="status" className="opm-spinner">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="socio-detail-container">
        <Alert variant="danger">
          {error}
        </Alert>
        <Button
          variant="primary"
          onClick={() => navigate('/socios')}
          className="btn-opm-primary"
        >
          <FaArrowLeft className="me-2" />
          Volver a Socios
        </Button>
      </Container>
    );
  }

  if (!socio) {
    return null;
  }

  return (
    <div className="socio-detail-container">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/socios')}
                className="btn-opm-secondary mb-2"
              >
                <FaArrowLeft className="me-2" />
                Volver a Socios
              </Button>
              <h1 className="socio-detail-title">
                <FaUser className="me-2" />
                {socio.nombre} {socio.apellido}
              </h1>
              <p className="socio-detail-subtitle">
                Detalles completos del socio
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={() => navigate(`/socios/${id}/editar`)}
                className="btn-opm-primary"
              >
                <FaEdit className="me-2" />
                Editar
              </Button>
              <Button
                variant="danger"
                onClick={handleEliminar}
                className="btn-opm-primary"
              >
                <FaTrash className="me-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Información Personal */}
        <Col lg={6} className="mb-4">
          <Card className="opm-card">
            <Card.Header>
              <h5 className="mb-0">
                <FaUser className="me-2" />
                Información Personal
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="socio-info-item">
                <strong>Nombre completo:</strong>
                <span>{socio.nombre} {socio.apellido}</span>
              </div>
              
              <div className="socio-info-item">
                <strong>DNI:</strong>
                <span>{socio.dni}</span>
              </div>
              
              {socio.fechaNacimiento && (
                <div className="socio-info-item">
                  <strong>Fecha de nacimiento:</strong>
                  <span>
                    {formatDate(socio.fechaNacimiento)}
                    {calcularEdad(socio.fechaNacimiento) && (
                      <span className="text-muted ms-2">
                        ({calcularEdad(socio.fechaNacimiento)} años)
                      </span>
                    )}
                  </span>
                </div>
              )}
              
              {socio.email && (
                <div className="socio-info-item">
                  <strong>Email:</strong>
                  <span>
                    <FaEnvelope className="me-1" />
                    {socio.email}
                  </span>
                </div>
              )}
              
              {socio.telefono && (
                <div className="socio-info-item">
                  <strong>Teléfono:</strong>
                  <span>
                    <FaPhone className="me-1" />
                    {socio.telefono}
                  </span>
                </div>
              )}
              
              {socio.barrio && (
                <div className="socio-info-item">
                  <strong>Barrio:</strong>
                  <span>
                    <FaMapMarkerAlt className="me-1" />
                    {socio.barrio}
                  </span>
                </div>
              )}
              
              {socio.direccion && (
                <div className="socio-info-item">
                  <strong>Dirección:</strong>
                  <span>{socio.direccion}</span>
                </div>
              )}
              
              {socio.origen && (
                <div className="socio-info-item">
                  <strong>Origen del contacto:</strong>
                  <span>{socio.origen}</span>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Estado y Actividades */}
        <Col lg={6} className="mb-4">
          <Card className="opm-card">
            <Card.Header>
              <h5 className="mb-0">
                <FaIdCard className="me-2" />
                Estado y Actividades
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="socio-info-item">
                <strong>Estado:</strong>
                <span>{getEstadoBadge(socio.estado)}</span>
              </div>
              
              <div className="socio-info-item">
                <strong>Fecha de alta:</strong>
                <span>
                  <FaCalendarAlt className="me-1" />
                  {formatDate(socio.fechaAlta)}
                </span>
              </div>
              
              <div className="socio-info-item">
                <strong>Última actividad:</strong>
                <span>
                  <FaCalendarAlt className="me-1" />
                  {formatDate(socio.ultimaActividad)}
                </span>
              </div>
              
              {socio.sectores && socio.sectores.length > 0 && (
                <div className="socio-info-item">
                  <strong>Sectores:</strong>
                  <div className="sectores-list">
                    {Array.isArray(socio.sectores) && socio.sectores.map((sector, index) => (
                      <Badge 
                        key={index} 
                        className={`me-1 mb-1 ${SECTOR_COLORS[sector] || 'bg-secondary'}`}
                        style={{ color: '#fff' }}
                      >
                        {SECTORES_LABELS[sector] || sector}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {socio.etiquetas && socio.etiquetas.length > 0 && (
                <div className="socio-info-item">
                  <strong>Etiquetas:</strong>
                  <div className="etiquetas-list">
                    {Array.isArray(socio.etiquetas) && socio.etiquetas.map((etiqueta, idx) => (
                      <EtiquetaBadge key={idx} etiqueta={etiqueta} />
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Observaciones */}
      {socio.observaciones && (
        <Row className="mb-4">
          <Col>
            <Card className="opm-card">
              <Card.Header>
                <h5 className="mb-0">
                  Observaciones
                </h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">{socio.observaciones}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Grupo Familiar */}
      {socio.grupoFamiliar && Object.keys(socio.grupoFamiliar).length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="opm-card">
              <Card.Header>
                <h5 className="mb-0">
                  Grupo Familiar
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="grupo-familiar-list">
                  {Object.entries(socio.grupoFamiliar).map(([vinculo, datos], index) => (
                    <div key={index} className="familiar-item">
                      <strong>{vinculo}:</strong> {datos.nombre} {datos.apellido}
                      {datos.dni && <span className="text-muted ms-2">(DNI: {datos.dni})</span>}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default SocioDetail; 