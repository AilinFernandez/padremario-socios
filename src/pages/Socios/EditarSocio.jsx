import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocios } from '../../hooks/useSocios';
import { 
  SECTORES_LABELS, 
  ESTADOS_SOCIO_LABELS, 
  SECTORES, 
  BARRIOS, 
  ORIGENES_CONTACTO,
  ETIQUETAS_POR_SECTOR,
  SECTOR_COLORS
} from '../../utils/constants';
import { 
  FaUserEdit, 
  FaSave, 
  FaTimes,
  FaCheck,
  FaArrowLeft
} from 'react-icons/fa';
import './EditarSocio.css';
import EtiquetaBadge from '../../components/EtiquetaBadge';

const EditarSocio = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getSocioById, actualizarSocio, buscarPorDNI, loading, error } = useSocios();
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    barrio: '',
    direccion: '',
    sectores: [],
    etiquetas: [],
    origen: '',
    observaciones: '',
    estado: 'activo'
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Cargar datos del socio al montar el componente
  useEffect(() => {
    const cargarSocio = async () => {
      if (id) {
        setInitialLoading(true);
        const socio = await getSocioById(id);
        if (socio) {
          setFormData({
            nombre: socio.nombre || '',
            apellido: socio.apellido || '',
            dni: socio.dni || '',
            email: socio.email || '',
            telefono: socio.telefono || '',
            fechaNacimiento: socio.fechaNacimiento || '',
            barrio: socio.barrio || '',
            direccion: socio.direccion || '',
            sectores: socio.sectores || [],
            etiquetas: socio.etiquetas || [],
            origen: socio.origen || '',
            observaciones: socio.observaciones || '',
            estado: socio.estado || 'activo'
          });
        } else {
          setErrors({ general: 'Socio no encontrado' });
        }
        setInitialLoading(false);
      }
    };

    cargarSocio();
  }, [id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSectorChange = (sector) => {
    setFormData(prev => {
      const sectores = prev.sectores.includes(sector)
        ? prev.sectores.filter(s => s !== sector)
        : [...prev.sectores, sector];
      
      // Actualizar etiquetas basadas en sectores seleccionados
      const etiquetas = [];
      sectores.forEach(s => {
        const etiquetasSector = ETIQUETAS_POR_SECTOR[s] || [];
        etiquetas.push(...etiquetasSector);
      });
      
      return {
        ...prev,
        sectores,
        etiquetas: [...new Set(etiquetas)] // Eliminar duplicados
      };
    });
  };

  const handleEtiquetaChange = (etiqueta) => {
    setFormData(prev => {
      const etiquetas = prev.etiquetas.includes(etiqueta)
        ? prev.etiquetas.filter(e => e !== etiqueta)
        : [...prev.etiquetas, etiqueta];
      
      // Encontrar el sector al que pertenece esta etiqueta
      let sectores = [...prev.sectores];
      
      // Si se está agregando la etiqueta
      if (!prev.etiquetas.includes(etiqueta)) {
        // Buscar el sector que contiene esta etiqueta
        for (const [sectorKey, etiquetasSector] of Object.entries(ETIQUETAS_POR_SECTOR)) {
          if (etiquetasSector.includes(etiqueta)) {
            if (!sectores.includes(sectorKey)) {
              sectores.push(sectorKey);
            }
            break;
          }
        }
      }
      // Si se está removiendo la etiqueta
      else {
        // Verificar si hay otras etiquetas del mismo sector
        for (const [sectorKey, etiquetasSector] of Object.entries(ETIQUETAS_POR_SECTOR)) {
          if (etiquetasSector.includes(etiqueta)) {
            // Verificar si hay otras etiquetas de este sector seleccionadas
            const otrasEtiquetasDelSector = etiquetasSector.filter(e => e !== etiqueta && etiquetas.includes(e));
            if (otrasEtiquetasDelSector.length === 0) {
              // Si no hay otras etiquetas del sector, remover el sector
              sectores = sectores.filter(s => s !== sectorKey);
            }
            break;
          }
        }
      }
      
      return {
        ...prev,
        etiquetas,
        sectores
      };
    });
  };

  const validateForm = async () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    }

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (formData.dni.length < 7) {
      newErrors.dni = 'El DNI debe tener al menos 7 dígitos';
    } else {
      // Verificar si el DNI ya existe en otro socio
      const socioExistente = await buscarPorDNI(formData.dni);
      if (socioExistente && socioExistente.id !== id) {
        newErrors.dni = 'Ya existe otro socio con este DNI';
      }
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (formData.sectores.length === 0) {
      newErrors.sectores = 'Debe seleccionar al menos un sector';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!(await validateForm())) {
      return;
    }

    setSaving(true);

    try {
      await actualizarSocio(id, formData);
      navigate(`/socios/${id}`);
    } catch (error) {
      console.error('Error al actualizar socio:', error);
      setErrors({ general: 'Error al actualizar el socio. Por favor intente nuevamente.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/socios/${id}`);
  };

  if (initialLoading) {
    return (
      <Container fluid className="editar-socio-container">
        <div className="text-center mt-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-3">Cargando datos del socio...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="editar-socio-container">
        <Alert variant="danger" className="mt-4">
          <h4>Error</h4>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate('/socios')}>
            <FaArrowLeft className="me-2" />
            Volver a la lista
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="editar-socio-container">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="editar-socio-title">
                <FaUserEdit className="me-2" />
                Editar Socio
              </h1>
              <p className="editar-socio-subtitle">
                Modifique la información del socio
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                onClick={handleCancel}
                className="btn-opm-secondary"
              >
                <FaTimes className="me-2" />
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={saving || loading}
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
                  <>
                    <FaSave className="me-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit}>
        {errors.general && (
          <Alert variant="danger" className="mb-4">
            {errors.general}
          </Alert>
        )}

        <Row>
          {/* Información Personal */}
          <Col lg={6}>
            <Card className="opm-card mb-4">
              <Card.Header>
                <h5 className="mb-0">Información Personal</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        isInvalid={!!errors.nombre}
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
                        onChange={(e) => handleInputChange('apellido', e.target.value)}
                        isInvalid={!!errors.apellido}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.apellido}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>DNI *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.dni}
                        onChange={(e) => handleInputChange('dni', e.target.value)}
                        isInvalid={!!errors.dni}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.dni}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Nacimiento</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.fechaNacimiento}
                        onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        isInvalid={!!errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Barrio</Form.Label>
                      <Form.Select
                        value={formData.barrio}
                        onChange={(e) => handleInputChange('barrio', e.target.value)}
                      >
                        <option value="">Seleccionar barrio</option>
                        {BARRIOS.map(barrio => (
                          <option key={barrio} value={barrio}>{barrio}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Estado</Form.Label>
                      <Form.Select
                        value={formData.estado}
                        onChange={(e) => handleInputChange('estado', e.target.value)}
                      >
                        {Object.entries(ESTADOS_SOCIO_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Información de Contacto y Sectores */}
          <Col lg={6}>
            <Card className="opm-card mb-4">
              <Card.Header>
                <h5 className="mb-0">Sectores y Contacto</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Sectores de Interés *</Form.Label>
                  <div className="sectores-grid">
                    {Object.values(SECTORES).map(sector => (
                      <Form.Check
                        key={sector}
                        type="checkbox"
                        id={`sector-${sector}`}
                        label={SECTORES_LABELS[sector]}
                        checked={formData.sectores.includes(sector)}
                        onChange={() => handleSectorChange(sector)}
                        className="sector-checkbox"
                      />
                    ))}
                  </div>
                  {errors.sectores && (
                    <div className="text-danger mt-2">{errors.sectores}</div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Etiquetas</Form.Label>
                  <div className="etiquetas-grid">
                    {Object.values(ETIQUETAS_POR_SECTOR).flat().filter((etiqueta, index, arr) => 
                      arr.indexOf(etiqueta) === index
                    ).map(etiqueta => (
                      <Form.Check
                        key={etiqueta}
                        type="checkbox"
                        id={`etiqueta-${etiqueta}`}
                        label={<EtiquetaBadge etiqueta={etiqueta} />}
                        checked={formData.etiquetas.includes(etiqueta)}
                        onChange={() => handleEtiquetaChange(etiqueta)}
                        className="etiqueta-checkbox"
                      />
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Origen del Contacto</Form.Label>
                  <Form.Select
                    value={formData.origen}
                    onChange={(e) => handleInputChange('origen', e.target.value)}
                  >
                    <option value="">Seleccionar origen</option>
                    {ORIGENES_CONTACTO.map(origen => (
                      <option key={origen} value={origen}>{origen}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Observaciones */}
        <Row>
          <Col>
            <Card className="opm-card mb-4">
              <Card.Header>
                <h5 className="mb-0">Observaciones</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    placeholder="Agregue observaciones adicionales sobre el socio..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default EditarSocio; 