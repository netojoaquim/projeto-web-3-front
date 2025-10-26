import React from 'react';
import { Navbar, Container, Nav, Button, Badge, Dropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useCart } from '../context/CarrinhoContext';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { cartState } = useCart();
  const { handleShowCart } = useLayout();

  const totalItems = cartState.items.reduce((acc, item) => acc + item.quantity, 0);

  // Função para garantir que o cliente é redirecionado após o logout
  const handleLogout = () => {
    logout();
    // Nota: Como não usamos useNavigate neste componente, o logout pode ser tratado puramente pelo contexto.
    // Se precisar de redirecionamento imediato, é recomendado usar 'useNavigate' aqui.
  };

  return (
    <Navbar bg="light" expand="lg" sticky="top" className="shadow-sm py-2">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand className="fw-bold fs-4 text-primary">
            <i className="bi bi-shop me-2"></i>GuaraShopp
          </Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            {/* Links adicionais podem ser adicionados aqui */}
          </Nav>

          <Nav className="d-flex flex-column flex-lg-row align-items-end align-lg-items-center gap-3 gap-lg-0 mt-3 mt-lg-0">
            {/* Botão do Carrinho */}
            <Button
              variant="primary"
              onClick={handleShowCart}
              className="position-relative w-25 w-lg-auto d-flex align-items-center justify-content-center"
            >
              <i className="bi bi-cart-fill me-1"></i> Carrinho
              {totalItems > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="position-absolute top-0 start-100 translate-middle"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* Área do Usuário */}
            {isAuthenticated ? (
              <Dropdown align="end" className="w-25 w-lg-auto ">
                <Dropdown.Toggle
                
                  variant="outline-secondary"
                  id="dropdown-user"
                  className="d-flex align-items-center justify-content-center text-truncate w-100"
                >
                  <i className="bi bi-person-circle me-1 text-truncate text-truncate "></i> 
                  Meu perfil
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {/* NOVO: Link para Atualizar Dados */}
                  <LinkContainer to="/cliente/dados">
                    <Dropdown.Item>
                      <i className="bi bi-person-gear me-2"></i> Meus Dados
                    </Dropdown.Item>
                  </LinkContainer>

                  {/* NOVO: Link para Endereços */}
                  <LinkContainer to="/cliente/enderecos">
                    <Dropdown.Item>
                      <i className="bi bi-geo-alt me-2"></i> Meus Endereços
                    </Dropdown.Item>
                  </LinkContainer>

                  <Dropdown.Divider />
                  
                  {/* Ação de Sair */}
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <i className="bi bi-box-arrow-right me-2"></i> Sair
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              // Se não logado: Botão de Login
              // Adicionamos um botão de Cadastro também, já que o modal foi removido
              <Nav className="flex-row gap-2">
                  <LinkContainer to="/login">
                      <Button variant="outline-primary" className="d-flex align-items-center justify-content-center">
                          <i className="bi bi-box-arrow-in-right me-1"></i> Login
                      </Button>
                  </LinkContainer>
                  <LinkContainer to="/registro">
                      <Button variant="primary" className="d-flex align-items-center justify-content-center">
                          <i className="bi bi-person-plus-fill me-1"></i> Cadastrar
                      </Button>
                  </LinkContainer>
              </Nav>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
