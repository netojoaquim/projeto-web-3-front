import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Certifique-se de importar


const Login = () => {
  // Estados para os inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // estado para mostrar senha
  // Estados para feedback do usuário
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hooks do React Router e do Contexto
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpa erros anteriores
    setIsLoading(true); // Ativa o estado de loading

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    try {
      // A função login é chamada e retorna 'true' em caso de sucesso
      const success = await login(trimmedEmail, trimmedPassword);

      if (success.success) {
        setError(null);
        // Login bem-sucedido
        navigate('/'); // Redireciona para a home
      } else {
        // Falha no login (ex: 401 Unauthorized do backend)
        setError('Email ou senha inválidos. Tente novamente.',success.message);
      }
    } catch (e) {
      // Para erros que não são 4xx (ex: erro de rede, servidor indisponível)
      console.error("Erro de conexão durante o login:", e);
      setError('Ocorreu um erro ao conectar-se ao servidor. Tente novamente mais tarde.');
    } finally {
      // Garante que o loading seja desativado, independente do resultado
      setIsLoading(false);
    }
  };
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <div className="p-4 shadow rounded bg-light">
            <h2 className="text-center mb-4">Login</h2>
            <Form onSubmit={handleSubmit}>

              {/* ALERTA DE ERRO */}
              {error && <Alert variant="danger">{error}</Alert>}

              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading} // Desabilita durante o loading
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Senha</Form.Label>
                {/* InputGroup para botão mostrar/ocultar senha */}
                <InputGroup>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    variant="outline-primary"
                    onClick={toggleShowPassword}
                    type="button"

                  >

                    <i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                  </Button>
                </InputGroup>
              </Form.Group>
              <Button type="submit" variant="primary" className="w-100 mb-3">
                Entrar
              </Button>
              <div className="text-center d-flex flex-column gap-3 ">
                <Link to="/registro" className="text-decoration-none me-3 col-12">
                  Cadastre-se
                </Link>
                <Link to="/forgot-password" className="text-decoration-none w-100">
                  Esqueceu a senha?
                </Link>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;