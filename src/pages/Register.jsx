import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { isEmailAuthorized } from '../services/userService';
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import './Login.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !confirmPassword) {
      setError('Por favor complete todos los campos');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      // Verificar si el email está autorizado (existe en users)
      const authCheck = await isEmailAuthorized(email);
      
      if (!authCheck.authorized) {
        setError('No está autorizado para registrarse. Consulte con el administrador.');
        setLoading(false);
        return;
      }
      
      if (authCheck.hasAuthAccount) {
        setError('Este email ya tiene una cuenta registrada. Inicie sesión.');
        setLoading(false);
        return;
      }
      
      // Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar el documento en Firestore con el UID de Firebase Auth
      // Esto se puede hacer aquí o en el AuthContext cuando se detecte el login
      
      setSuccess('Registro exitoso. Ahora puede iniciar sesión.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('El email ya está registrado. Inicie sesión.');
      } else {
        setError('Error al registrar usuario. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
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
              <div className="text-center mb-4">
                <div className="login-logo">
                  <img
                    src="https://padremario.org/wp-content/uploads/2022/08/OPM-logo-positivo-menu.png"
                    alt="OPM"
                    height="80"
                    className="mb-3"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <h2 className="login-title">Registro de Usuario</h2>
                <p className="login-subtitle">Solo para usuarios autorizados</p>
              </div>
              <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                {success && <Alert variant="success" className="mb-3">{success}</Alert>}
                <Form.Group className="mb-3">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingrese su correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="opm-form-control"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="opm-form-control"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Confirmar contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Repita su contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="opm-form-control"
                    required
                  />
                </Form.Group>
                <Button type="submit" className="btn-opm-primary w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Registrando...
                    </>
                  ) : (
                    'Registrarse'
                  )}
                </Button>
              </Form>
              {/* Enlace a login */}
              <div className="text-center mt-3">
                <span>¿Ya tienes cuenta? </span>
                <a href="/login" className="link-primary">Iniciar sesión</a>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default Register; 