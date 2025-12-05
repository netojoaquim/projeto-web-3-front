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
import PedidoFormCompCancelar from "../components/PedidoFormCompCancelar";
import { useAlert } from "../context/AlertContext";

const PedidosPage = () => {
  const { user, fetchClientData } = useAuth();
  const { showAlert } = useAlert();

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelingPedido, setCancelingPedido] = useState(null);

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

      const endpoint =
        currentUser.role === "admin"
          ? `/pedido/cliente`
          : `/pedido/cliente/${currentUser.id}`;

      const { data } = await api.get(endpoint);

      setPedidos(data || []);
      if (!data?.length) setMessage("Você ainda não realizou nenhum pedido.");
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
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

  const handleEditClick = useCallback((pedido) => {
    setEditingPedido(pedido);
    setShowModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditingPedido(null);
  }, []);


  const handlePedidoUpdateSuccess = useCallback(
    (updateMessage) => {
      handleModalClose();
      showAlert({
        title: "Sucesso!",
        message: updateMessage || "Pedido atualizado com sucesso.",
        bg: "#0d6efd",
        duration: 4000,
      });
      loadPedidos();
    },
    [handleModalClose, showAlert, loadPedidos]
  );


  const handleCancelClick = useCallback((pedido) => {
    setCancelingPedido(pedido);
    setShowCancelModal(true);
  }, []);

  const handleCancelModalClose = useCallback(() => {
    setShowCancelModal(false);
    setCancelingPedido(null);
  }, []);


  const handleStatusUpdate = useCallback(
    async (pedidoId, newStatus, successMessage, motivoCancelamento = null) => {
      try {
        const payload = { status: newStatus };
        if (newStatus === "CANCELADO" && motivoCancelamento) {
          payload.motivo_cancelamento = motivoCancelamento;
        }

        await api.patch(`/pedido/${pedidoId}/status`, payload);

        showAlert({
          title: "Sucesso!",
          message: successMessage,
          bg: "#0d6efd",
          duration: 4000,
        });
        setTimeout(() => loadPedidos(), 50);
        return true;

      } catch (err) {
        console.error(`Erro ao atualizar pedido ${pedidoId}:`, err);
        showAlert({
          title: "Erro",
          message: "Não foi possível completar a ação. Tente novamente.",
          bg: "#dc3545",
          duration: 5000,
        });
        return false;
      }
    },
    [showAlert, loadPedidos]
  );

  const handleConfirmCancel = useCallback(async (justificativa) => {
    if (!cancelingPedido) return;

    const success = await handleStatusUpdate(
      cancelingPedido.id,
      "CANCELADO",
      "Pedido cancelado com sucesso.",
      justificativa
    );

    if (success) {
        handleCancelModalClose();
    }
    return success;
  }, [cancelingPedido, handleStatusUpdate, handleCancelModalClose]);


  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

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
          <i className="bi bi-receipt-cutoff me-2 text-primary"></i>
          {user?.role === "admin" ? "Todos os Pedidos" : "Meus Pedidos"}
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
          <span className="text-primary">
            Você ainda não realizou nenhum pedido.
          </span>
        </Alert>
      ) : (
        pedidos.map((pedido) => {
          const isEditable = pedido.status === "AGUARDANDO_PAGAMENTO";

          return (
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
                          ? "danger"
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
                        } me-1`}
                      ></i>
                      <span className="text-black">{pedido.status}</span>

                    </Badge>
                    {pedido.status === "CANCELADO" && pedido.motivo_cancelamento && (
                    <ListGroup.Item className="d-flex mt-2 flex-column align-items-start bg-danger bg-opacity-25 border-danger ">
                        <div className="mb-1">
                            <i className="bi bi-info-circle me-2 text-danger"></i>
                            <span className="fw-medium text-danger">Motivo do Cancelamento:</span>
                        </div>
                        <div>
                            {pedido.motivo_cancelamento}
                        </div>
                    </ListGroup.Item>
                )}
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
                  <span>{formatCurrency(pedido.valor)}</span>
                </ListGroup.Item>

                {pedido.pagamento && (
                  <ListGroup.Item className="d-flex align-items-center">
                    <i className="bi bi-credit-card me-2 text-primary"></i>
                    <strong className="text-primary p-2">Pagamento:</strong>
                    {pedido.pagamento.metodo} — {pedido.pagamento.status}
                  </ListGroup.Item>
                )}

                {pedido.enderecoEntrega && (
                  <ListGroup.Item className="d-flex flex-column align-items-start">
                    <div className="mb-1">
                      <i className="bi bi-geo-alt me-2 text-primary"></i>
                      <span className="fw-medium">
                        {pedido.enderecoEntrega.apelido}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.85rem" }}>
                      {pedido.enderecoEntrega.rua},{" "}
                      {pedido.enderecoEntrega.numero} -{" "}
                      {pedido.enderecoEntrega.bairro},{" "}
                      {pedido.enderecoEntrega.cidade}/
                      {pedido.enderecoEntrega.estado} - CEP:{" "}
                      {pedido.enderecoEntrega.cep}
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>

              {isEditable && (
                <Card.Body className="pt-2 pb-3 d-flex justify-content-end gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleEditClick(pedido)}
                  >
                    <i className="bi bi-pencil-square me-1"></i> Alterar pagamento
                  </Button>

                  {(user.role === "admin" || user.role === "cliente") && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelClick(pedido)}
                    >
                      <i className="bi bi-x-circle me-1"></i> Cancelar
                    </Button>
                  )}
                  {user.role === "admin" && (
                     <Button
                        variant="success"
                        size="sm"
                        onClick={() =>
                          handleStatusUpdate(
                            pedido.id,
                            "PAGO",
                            "Pedido marcado como pago"
                          )
                        }
                      >
                        <i className="bi bi-check-circle me-1"></i> Pedido pago
                      </Button>
                  )}
                </Card.Body>
              )}
            </Card>
          );
        })
      )}

      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton className="bg-primary bg-opacity-10">
          <Modal.Title>
            <i className="bi bi-pencil-square me-2 text-primary"></i>
            Alterar método de pagamento — Pedido #{editingPedido?.id}
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

      <Modal show={showCancelModal} onHide={handleCancelModalClose} centered>
        <Modal.Header closeButton className="bg-danger bg-opacity-10">
          <Modal.Title className="text-danger">
            <i className="bi bi-exclamation-triangle-fill me-2 text-danger"></i>
            Cancelamento de Pedido
          </Modal.Title>
        </Modal.Header>
        <PedidoFormCompCancelar
            pedidoId={cancelingPedido?.id}
            onCancel={handleCancelModalClose}
            onConfirm={handleConfirmCancel}
        />
      </Modal>
    </Container>
  );
};

export default PedidosPage;