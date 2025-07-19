import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAudit } from '../hooks/useAudit';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const { logLogin } = useAudit();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error de login:', error);
      setError('Credenciales inválidas. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay"></div>
      </div>
      
      <Container className="login-content">
        <div className="login-card-wrapper">
          <Card className="login-card">
            <Card.Body className="p-5">
              {/* Logo y título */}
              <div className="text-center mb-4">
                <div className="login-logo">
                  <img
                    src="https://padremario.org/wp-content/uploads/2022/08/OPM-logo-positivo-menu.png"
                    alt="OPM"
                    height="80"
                    className="mb-3"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <h2 className="login-title">Sistema de Socios OPM</h2>
              </div>

              {/* Formulario de login */}
              <Form onSubmit={handleSubmit}>
                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Correo electrónico</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaUser />
                    </span>
                    <Form.Control
                      type="email"
                      placeholder="Ingrese su correo electrónico"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="opm-form-control"
                      required
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Contraseña</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaLock />
                    </span>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ingrese su contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="opm-form-control"
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="password-toggle"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  className="btn-opm-primary w-100"
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
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </Form>

              {/* Enlace a registro */}
              <div className="text-center mt-3">
                <span>¿No tienes cuenta? </span>
                <a href="/register" className="link-primary">Registrarse</a>
              </div>

              {/* Enlace a login desde registro (solo visible en la página de registro) */}
              {window.location.pathname === '/register' && (
                <div className="text-center mt-2">
                  <span>¿Ya tienes cuenta? </span>
                  <a href="/login" className="link-primary">Iniciar sesión</a>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default Login; 