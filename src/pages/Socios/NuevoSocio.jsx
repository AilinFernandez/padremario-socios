import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSocios } from '../../hooks/useSocios';
import { useAudit } from '../../hooks/useAudit';
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
  FaUserPlus, 
  FaSave, 
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import './NuevoSocio.css';
import EtiquetaBadge from '../../components/EtiquetaBadge';

const NuevoSocio = () => {
  const navigate = useNavigate();
  const { crearSocio, buscarPorDNI, loading } = useSocios();
  const { logSocioAction } = useAudit();
  
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
    observaciones: ''
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

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
      // Verificar si el DNI ya existe
      const socioExistente = await buscarPorDNI(formData.dni);
      if (socioExistente) {
        newErrors.dni = 'Ya existe un socio con este DNI';
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
      const nuevoSocio = await crearSocio(formData);
      
      // Log de auditoría
      await logSocioAction('CREATE_SOCIO', nuevoSocio.id, `${formData.nombre} ${formData.apellido}`, {
        dni: formData.dni,
        sectores: formData.sectores,
        origen: formData.origen
      });
      
      navigate('/socios');
    } catch (error) {
      console.error('Error al crear socio:', error);
      setErrors({ general: 'Error al crear el socio. Por favor intente nuevamente.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/socios');
  };

  return (
    <div className="nuevo-socio-container">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="nuevo-socio-title">
                <FaUserPlus className="me-2" />
                Nuevo Socio
              </h1>
              <p className="nuevo-socio-subtitle">
                Complete la información para registrar un nuevo socio
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
                    Guardar Socio
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
          <Col lg={6} className="mb-4">
            <Card className="opm-card">
              <Card.Header>
                <h5 className="mb-0">
                  <FaUserPlus className="me-2" />
                  Información Personal
                </h5>
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
                        className={`opm-form-control ${errors.nombre ? 'is-invalid' : ''}`}
                        placeholder="Ingrese el nombre"
                      />
                      {errors.nombre && (
                        <Form.Control.Feedback type="invalid">
                          {errors.nombre}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Apellido *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.apellido}
                        onChange={(e) => handleInputChange('apellido', e.target.value)}
                        className={`opm-form-control ${errors.apellido ? 'is-invalid' : ''}`}
                        placeholder="Ingrese el apellido"
                      />
                      {errors.apellido && (
                        <Form.Control.Feedback type="invalid">
                          {errors.apellido}
                        </Form.Control.Feedback>
                      )}
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
                        onChange={(e) => handleInputChange('dni', e.target.value.replace(/\D/g, ''))}
                        className={`opm-form-control ${errors.dni ? 'is-invalid' : ''}`}
                        placeholder="Ingrese el DNI"
                        maxLength="8"
                      />
                      {errors.dni && (
                        <Form.Control.Feedback type="invalid">
                          {errors.dni}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Nacimiento</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.fechaNacimiento}
                        onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                        className="opm-form-control"
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
                        className={`opm-form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="Ingrese el email"
                      />
                      {errors.email && (
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                        className="opm-form-control"
                        placeholder="Ingrese el teléfono"
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
                        className="opm-form-control"
                      >
                        <option value="">Seleccione un barrio</option>
                        {BARRIOS.map(barrio => (
                          <option key={barrio} value={barrio}>{barrio}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Dirección</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.direccion}
                        onChange={(e) => handleInputChange('direccion', e.target.value)}
                        className="opm-form-control"
                        placeholder="Ingrese la dirección"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Origen del Contacto</Form.Label>
                  <Form.Select
                    value={formData.origen}
                    onChange={(e) => handleInputChange('origen', e.target.value)}
                    className="opm-form-control"
                  >
                    <option value="">Seleccione el origen</option>
                    {ORIGENES_CONTACTO.map(origen => (
                      <option key={origen} value={origen}>{origen}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Sectores y Actividades */}
          <Col lg={6} className="mb-4">
            <Card className="opm-card">
              <Card.Header>
                <h5 className="mb-0">
                  <FaCheck className="me-2" />
                  Sectores y Actividades
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Sectores *</Form.Label>
                  <div className={`sectores-grid ${errors.sectores ? 'is-invalid' : ''}`}>
                    {Object.entries(SECTORES_LABELS).map(([key, label]) => (
                      <Form.Check
                        key={key}
                        type="checkbox"
                        id={`sector-${key}`}
                        label={label}
                        checked={formData.sectores.includes(key)}
                        onChange={() => handleSectorChange(key)}
                        className="sector-checkbox"
                      />
                    ))}
                  </div>
                  {errors.sectores && (
                    <div className="invalid-feedback d-block">
                      {errors.sectores}
                    </div>
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
                  <Form.Label>Observaciones</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    className="opm-form-control"
                    placeholder="Información adicional sobre el socio"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default NuevoSocio; 