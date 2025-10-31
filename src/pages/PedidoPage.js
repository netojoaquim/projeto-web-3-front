import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Card,
  ListGroup,
  Spinner,
  Alert,
  Row,
  Col,
  Badge,
  Button,
  Modal,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import PedidoFormComp from "../components/PedidoFormComp";
import "bootstrap-icons/font/bootstrap-icons.css";

const PedidosPage = () => {
  const { user, fetchClientData } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);

  const loadPedidos = useCallback(async () => {
    setLoading(true);
    setMessage("");
    setError(false);

    try {
      let currentUser = user;
      if (!currentUser?.id) {
        const result = await fetchClientData();
        if (result.success && result.data) currentUser = result.data;
      }

      if (!currentUser?.id) {
        setMessage("Usuário não logado.");
        setError(true);
        return;
      }

      const response = await api.get(`/pedido/cliente/${currentUser.id}`);
      setPedidos(response.data || []);

      if (!response.data || response.data.length === 0) {
        setMessage("Você ainda não realizou nenhum pedido.");
      }
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err.response || err);
      setMessage("Não foi possível carregar seus pedidos.");
      setError(true);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, [user, fetchClientData]);

  useEffect(() => {
    loadPedidos();
  }, [loadPedidos]);

  const handleEditClick = (pedido) => {
    setEditingPedido(pedido);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPedido(null);
  };

  const handlePedidoUpdateSuccess = (updateMessage) => {
    handleModalClose();
    loadPedidos();
    setMessage(updateMessage);
    setError(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading)
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-primary">Carregando pedidos...</p>
      </Container>
    );

  return (
    <Container
      style={{ maxWidth: "900px" }}
      className="mt-5 mb-5 p-4 border rounded shadow-sm bg-white"
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">
          <i className="bi bi-receipt-cutoff me-2 text-primary"></i> Meus Pedidos
        </h2>
      </div>

      {message && (
        <Alert
          variant={error ? "danger" : "info"}
          onClose={() => setMessage("")}
          dismissible
          className="shadow-sm"
        >
          <i
            className={`bi ${
              error ? "bi-exclamation-triangle-fill" : "bi-info-circle-fill"
            } me-2 text-primary`}
          ></i>
          <span className="text-primary">{message}</span>
        </Alert>
      )}

      {pedidos.length === 0 && !error ? (
        <Alert variant="secondary" className="text-center shadow-sm">
          <i className="bi bi-clipboard-x me-2 text-primary"></i>
          <span className="text-primary">Você ainda não realizou nenhum pedido.</span>
        </Alert>
      ) : (
        pedidos.map((pedido) => (
          <Card className="mb-4 shadow-sm border-0" key={pedido.id}>
            <Card.Header className="bg-primary bg-opacity-10 border-0">
              <Row className="align-items-center">
                <Col xs={12} md={6}>
                  <span className="fw-bold text-primary">
                    <i className="bi bi-bag-check me-2 text-primary"></i>
                    Pedido #{pedido.id}
                  </span>
                  <p className="mb-0" style={{ fontSize: "0.85rem" }}>
                    <i className="bi bi-calendar-event me-1 text-primary"></i>
                    {new Date(pedido.dataCriacao).toLocaleString()}
                  </p>
                </Col>
                <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0">
                  <Badge
                    bg={
                      pedido.status === "PAGO"
                        ? "success"
                        : pedido.status === "CANCELADO"
                        ? "primary"
                        : "warning"
                    }
                    className="p-2"
                  >
                    <i
                      className={`bi ${
                        pedido.status === "PAGO"
                          ? "bi-check-circle"
                          : pedido.status === "CANCELADO"
                          ? "bi-x-circle"
                          : "bi-hourglass-split"
                      } me-1 text-primary`}
                    ></i>
                    <span className="text-black">{pedido.status}</span>
                  </Badge>
                </Col>
              </Row>
            </Card.Header>

            <ListGroup variant="flush">
              {(pedido.itens || []).map((item, index) => (
                <ListGroup.Item
                  key={index}
                  className="d-flex justify-content-between align-items-center py-2"
                >
                  <div>
                    <i className="bi bi-box-seam me-2 text-primary"></i>
                    <span className="fw-normal">{item.produto.nome}</span>
                    <span className="ms-2">x {item.quantidade}</span>
                  </div>
                  <div>{formatCurrency(item.valor * item.quantidade)}</div>
                </ListGroup.Item>
              ))}
              <ListGroup.Item className="d-flex justify-content-between bg-light fw-bold">
                <span className="text-primary">Total do Pedido</span>
                <span className="">{formatCurrency(pedido.valor)}</span>
              </ListGroup.Item>
              {/* Pagamento */}
              {pedido.pagamento && (
                <ListGroup.Item className="d-flex align-items-center">
                  <i className="bi bi-credit-card me-2 text-primary"></i>
                    <strong className="text-primary p-2">Pagamento:</strong> 
                  {pedido.pagamento.metodo}
                </ListGroup.Item>
              )}
              {/* Endereço */}
              {pedido.enderecoEntrega && (
                <ListGroup.Item className="d-flex flex-column align-items-start">
                  <div className="mb-1">
                    <i className="bi bi-geo-alt me-2 text-primary"></i>
                    <span className=" fw-medium">{pedido.enderecoEntrega.apelido}</span>
                  </div>
                  <div className="" style={{ fontSize: "0.85rem" }}>
                    {pedido.enderecoEntrega.rua}, {pedido.enderecoEntrega.numero} - {pedido.enderecoEntrega.bairro}, {pedido.enderecoEntrega.cidade}/{pedido.enderecoEntrega.estado} - CEP: {pedido.enderecoEntrega.cep}
                  </div>
                </ListGroup.Item>
              )}
            </ListGroup>

            {pedido.enderecoEntrega && (
              <Card.Body className="pt-2 pb-3 d-flex justify-content-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleEditClick(pedido)}
                >
                  <i className="bi bi-pencil-square me-1"></i> Alterar
                </Button>
              </Card.Body>
            )}
          </Card>
        ))
      )}

      {/* Modal de Edição */}
      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton className="bg-primary bg-opacity-10">
          <Modal.Title>
            <i className="bi bi-pencil-square me-2 text-primary"></i>
            Alterar Pedido #{editingPedido?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PedidoFormComp
            pedidoData={editingPedido}
            onSuccess={handlePedidoUpdateSuccess}
            onCancel={handleModalClose}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PedidosPage;
