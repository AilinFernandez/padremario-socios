import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { useSocios } from '../hooks/useSocios';
import { useAudit } from '../hooks/useAudit';
import { SECTORES_LABELS, ESTADOS_SOCIO_LABELS } from '../utils/constants';
import { formatDate } from '../utils/dateUtils';
import { FaSearch, FaUser, FaIdCard, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './Validacion.css';

const Validacion = () => {
  const [dni, setDni] = useState('');
  const [socio, setSocio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const { buscarPorDNI, actualizarUltimaActividad } = useSocios();
  const { logSearch, logSocioAction } = useAudit();

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!dni || dni.length < 7) {
      setError('Por favor ingrese un DNI válido (mínimo 7 dígitos)');
      return;
    }

    setLoading(true);
    setError('');
    setSocio(null);
    setSearched(true);

    try {
      const resultado = await buscarPorDNI(dni);
      setSocio(resultado);
      
      // Log de auditoría
      if (resultado) {
        await logSearch('validacion', dni, {}, 1);
        await logSocioAction('VIEW_SOCIO_DETAILS', resultado.id, `${resultado.nombre} ${resultado.apellido}`, { dni });
        // Actualizar última actividad
        await actualizarUltimaActividad(resultado.id);
      } else {
        await logSearch('validacion', dni, {}, 0);
        setError('No se encontró ningún socio con ese DNI');
      }
    } catch (err) {
      await logSearch('validacion', dni, {}, 0);
      setError('Error al buscar el socio: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setDni('');
    setSocio(null);
    setError('');
    setSearched(false);
  };

  const getEstadoBadge = (estado) => {
    const variant = {
      'activo': 'success',
      'inactivo': 'secondary',
      'baja_temporal': 'warning'
    }[estado] || 'secondary';
    
    return (
      <Badge bg={variant} className="fs-6">
        {ESTADOS_SOCIO_LABELS[estado] || estado}
      </Badge>
    );
  };


  return (
    <div className="validacion-container">
      <Row className="mb-4">
        <Col>
          <h1 className="validacion-title">
            <FaIdCard className="me-2" />
            Validación Rápida
          </h1>
          <p className="validacion-subtitle">
            Buscar y validar socios por DNI
          </p>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col lg={8} md={10}>
          {/* Formulario de búsqueda */}
          <Card className="opm-card mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaSearch className="me-2" />
                Búsqueda por DNI
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row>
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>Número de DNI</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ingrese el DNI del socio"
                        value={dni}
                        onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                        className="opm-form-control"
                        maxLength="8"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <div className="d-grid gap-2 w-100">
                      <Button
                        type="submit"
                        className="btn-opm-primary"
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
                            Buscando...
                          </>
                        ) : (
                          <>
                            <FaSearch className="me-2" />
                            Buscar
                          </>
                        )}
                      </Button>
                      {searched && (
                        <Button
                          variant="outline-secondary"
                          onClick={handleClear}
                          className="btn-opm-secondary"
                        >
                          Limpiar
                        </Button>
                      )}
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Resultados */}
          {error && (
            <Alert variant="danger" className="mb-4">
              <FaTimesCircle className="me-2" />
              {error}
            </Alert>
          )}

          {socio && (
            <Card className="opm-card resultado-card">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">
                  <FaCheckCircle className="me-2" />
                  Socio Encontrado
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="socio-info">
                      <h4 className="socio-nombre">
                        {socio.nombre} {socio.apellido}
                      </h4>
                      <p className="socio-dni">
                        <strong>DNI:</strong> {socio.dni}
                      </p>
                      <p className="socio-estado">
                        <strong>Estado:</strong> {getEstadoBadge(socio.estado)}
                      </p>
                      <p className="socio-fecha">
                        <strong>Fecha de Alta:</strong> {formatDate(socio.fechaAlta)}
                      </p>
                      <p className="socio-ultima-actividad">
                        <strong>Última Actividad:</strong> {formatDate(socio.ultimaActividad)}
                      </p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="socio-detalles">
                      <h6>Sectores y Actividades:</h6>
                      <div className="sectores-list">
                        {socio.sectores?.map((sector, index) => (
                          <Badge 
                            key={index} 
                            bg="info" 
                            className="me-2 mb-2"
                          >
                            {SECTORES_LABELS[sector] || sector}
                          </Badge>
                        ))}
                      </div>

                      <h6 className="mt-3">Etiquetas:</h6>
                      <div className="etiquetas-list">
                        {socio.etiquetas?.map((etiqueta, index) => (
                          <Badge 
                            key={index} 
                            bg="secondary" 
                            className="me-2 mb-2"
                          >
                            {etiqueta}
                          </Badge>
                        ))}
                      </div>

                      {socio.barrio && (
                        <div className="mt-3">
                          <h6>Barrio:</h6>
                          <p className="socio-barrio">{socio.barrio}</p>
                        </div>
                      )}

                      {socio.origen && (
                        <div className="mt-3">
                          <h6>Origen:</h6>
                          <p className="socio-origen">{socio.origen}</p>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>

                {/* Beneficios activos */}
                <Row className="mt-4">
                  <Col>
                    <div className="beneficios-section">
                      <h6>Beneficios Activos:</h6>
                      <div className="beneficios-list">
                        {socio.estado === 'activo' ? (
                          <Alert variant="success" className="mb-0">
                            <FaCheckCircle className="me-2" />
                            El socio tiene acceso a todos los beneficios y servicios de la OPM
                          </Alert>
                        ) : (
                          <Alert variant="warning" className="mb-0">
                            <FaTimesCircle className="me-2" />
                            El socio no tiene beneficios activos debido a su estado
                          </Alert>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Botón Limpiar debajo de la info del socio */}
                <Row className="mt-4">
                  <Col className="d-flex justify-content-end">
                    <Button
                      variant="outline-secondary"
                      onClick={handleClear}
                      className="btn-opm-secondary"
                    >
                      Limpiar
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Información adicional */}
          {!socio && !error && searched && (
            <Card className="opm-card">
              <Card.Body className="text-center">
                <FaUser className="socio-no-encontrado-icon" />
                <h5>No se encontró ningún socio</h5>
                <p className="text-muted">
                  Verifique que el DNI ingresado sea correcto o registre un nuevo socio.
                </p>
                <Button 
                  variant="primary" 
                  className="btn-opm-primary"
                  href="/socios/nuevo"
                >
                  Registrar Nuevo Socio
                </Button>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Validacion; 