
import { useState } from 'react';
import { Badge, Button, Container, Modal, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CarrinhoContext';
import { useLayout } from '../context/LayoutContext';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  //console.log('Usuário autenticado:', user);
  const { cartState } = useCart();
  const { handleShowCart } = useLayout();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const handleCloseProfileModal = () => setShowProfileModal(false);
  const handleShowProfileModal = () => setShowProfileModal(true);


  const totalItems = cartState.items.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
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
                className="d-flex align-items-center justify-content-center text-truncate w-100"
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
              <Button
                variant="primary"
                className="d-flex align-items-center justify-content-center text-truncate w-100"
                onClick={handleShowProfileModal}
              >
                <i className="bi bi-person-circle me-1"></i>
                Meu perfil
              </Button>

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
      <Modal
  show={showProfileModal}
  onHide={handleCloseProfileModal}
  centered
  className="rounded-3"
>
  <Modal.Header closeButton>
    <Modal.Title>
      Olá,{" "}
      <strong>
        {(() => {
          const nomeCompleto =
            user?.nomeCliente ||
            user?.nome ||
            user?.username ||
            user?.email?.split("@")[0] ||
            "usuário";
          return nomeCompleto.split(" ")[0];
        })()}
      </strong>
      !
    </Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <div className="d-grid gap-2">
      <LinkContainer to="/cliente/dados" onClick={handleCloseProfileModal}>
        <Button variant="primary" className="text-start">
          <i className="bi bi-person-gear me-2"></i> Meus Dados
        </Button>
      </LinkContainer>

      <LinkContainer to="/cliente/enderecos" onClick={handleCloseProfileModal}>
        <Button variant="primary" className="text-start">
          <i className="bi bi-geo-alt me-2"></i> Meus Endereços
        </Button>
      </LinkContainer>

      <Button
        variant="danger"
        className="text-start"
        onClick={() => {
          handleLogout();
          handleCloseProfileModal();
        }}
      >
        <i className="bi bi-box-arrow-right me-2"></i> Sair
      </Button>
    </div>
  </Modal.Body>
</Modal>

    </Navbar>
  );
};

export default Header;
