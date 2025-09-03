import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import api from '../services/api';
import { setAccessToken, setRefreshToken, setRole } from '../services/tokenUtils';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!username || !password) {
      setErrorMsg('Please fill in all fields');
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/login/', { username, password });
      const { access, refresh, role } = res.data;

      setAccessToken(access);
      setRefreshToken(refresh);
      setRole(role);

      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setErrorMsg('Invalid login credentials');
      } else {
        setErrorMsg('Error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5" centered>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="text-center mb-4">Login</h2>
          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group controlId="formUsername" className="mb-4">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
