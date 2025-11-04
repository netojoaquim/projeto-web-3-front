import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Card,
  ListGroup,
  Form,
} from "react-bootstrap";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import { useCart } from "../context/CarrinhoContext";
import { useAlert } from "../context/AlertContext";

const CheckoutPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const {cartUpdateSignal, fetchCart } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const enderecoPadrao = user?.enderecos?.find((addr) => addr.padrao === true);
  const { showAlert } = useAlert();
  const {limparCarrinho} = useCart();
  const navigate = useNavigate();


  useEffect(() => {
    const userId = user?.id || user?.clienteId;
    if (!userId) {
      setError("Cliente não encontrado. Faça login novamente.");
      setLoading(false);
      return;
    }

    const loadCartData = async () => {
      setLoading(true);
      setError(null);

      const data = await fetchCart();

      if (data) {
        const items = data.itens || [];
        setCartItems(items);
        setTotal(parseFloat(data.total) || 0);

        if (items.length === 0) {
          setShouldRedirect(true);
        }
      } else {
        setError("Não foi possível carregar seu carrinho.");
      }
      setLoading(false);
    };

    loadCartData();

  }, [user, fetchCart, cartUpdateSignal]);

  const handleFinalizarCompra = async () => {
    setLoading(true);
    const userId = user?.id || user?.clienteId;

    const itensFormatados = cartItems.map((item) => ({
      produto: { id: item.produto.id },
      quantidade: item.quantidade,
      valor: parseFloat(item.produto.preco),
    }));

    const totalCalculado = cartItems
      .map((item) => parseFloat(item.produto.preco) * item.quantidade)
      .reduce((acc, val) => acc + val, 0);

    const pedidoData = {
      userId: userId,
      itens: itensFormatados,
      total: totalCalculado,
      enderecoEntrega: { id: enderecoPadrao.id },
      metodoPagamento: paymentMethod.toUpperCase(),
    };

    try {
      await api.post("/pedido", pedidoData);
      await limparCarrinho();
      fetchCart();
      setTotal(0);

      showAlert({
        title: "Aviso!",
        message: "Compra finalizada com sucesso!",
        type: "warning",
        duration: 5000,
        bg: "#0d6efd",
      });
      setShouldRedirect(true);
      navigate("/cliente/pedidos");
    } catch (err) {
      console.error("Erro ao finalizar compra:", err.response?.data || err);
      showAlert({
        title: "Erro!",
        message: "Erro ao finalizar compra. Tente novamente.",
        type: "warning",
        duration: 5000,
        bg: "#ff0000",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !cartItems.length) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" /> <p>Carregando dados...</p>
      </div>
    );
  }

  if (error)
    return (
      <Alert variant="danger" className="m-4">
        {error}
      </Alert>
    );

  if (!cartItems.length && shouldRedirect) {
    return <Navigate to="/" replace />;
  }

  if (!cartItems.length) {
    return (
      <Container className="mt-5 text-center">
        <i className="bi bi-cart-fill text-primary"></i>
        <h4 className="text-primary">Seu carrinho está vazio.</h4>
        <p>Você será redirecionado em breve.</p>
      </Container>
    );
  }
  return (
    <Container className="mb-4">
      <h2 className="mb-4 ">
        <i className="bi bi-cart-fill text-primary"></i>
        <strong className="p-2 text-primary">Finalizar Compra</strong>
      </h2>

      <Row>
        <Col md={7}>
          <Card className="mb-3">
            <Card.Header as="h5">
              <i className="bi bi-person-lines-fill mx-auto text-primary "></i>
              <strong className="p-2 text-primary">Seus Dados</strong>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <i className="bi bi-person-circle mx-auto text-primary"></i>
                <strong className="p-2 text-primary">Nome:</strong>{" "}
                {user.nome_completo}
              </ListGroup.Item>
              <ListGroup.Item>
                <i className="bi bi-envelope-fill mx-auto text-primary"></i>
                <strong className="p-2 text-primary">Email:</strong>{" "}
                {user.email}
              </ListGroup.Item>
            </ListGroup>
          </Card>

          {/* entrega */}
          <Card className="mb-3">
            <Card.Header as="h5">
              <i className="bi bi-geo-alt-fill mx-auto text-primary"></i>
              <strong className="p-2 text-primary">Endereço de Entrega</strong>
            </Card.Header>
            <Card.Body>
              {enderecoPadrao ? (
                <ListGroup>
                  <ListGroup.Item>
                    <strong className="text-primary">
                      {enderecoPadrao.apelido}
                    </strong>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong className="text-primary">Longradouro: </strong>
                    {enderecoPadrao.rua},{enderecoPadrao.numero} -{" "}
                    {enderecoPadrao.bairro} - {enderecoPadrao.cidade} /{" "}
                    {enderecoPadrao.estado}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong className="text-primary">CEP:</strong>{" "}
                    {enderecoPadrao.cep}
                  </ListGroup.Item>
                </ListGroup>
              ) : (
                <Alert variant="warning">
                  Nenhum endereço padrão encontrado. Por favor, cadastre um
                  endereço e marque-o como padrão.
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* pagamento */}
          <Card className="mb-3">
            <Card.Header as="h5">
              <i className="bi bi-credit-card-2-back text-primary"></i>
              <strong className="p-2 text-primary">Forma de Pagamento</strong>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Check
                  type="radio"
                  id="pagamento-cartao"
                  label={
                    <span>
                      <i className="bi bi-credit-card-2-back text-primary"></i>{" "}
                      Cartão de Crédito
                    </span>
                  }
                  name="paymentMethod"
                  value="Cartao"
                  checked={paymentMethod === "Cartao"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  id="pagamento-pix"
                  label={
                    <span>
                      <i className="bi bi-qr-code text-primary"></i> Pix
                    </span>
                  }
                  name="paymentMethod"
                  value="Pix"
                  checked={paymentMethod === "Pix"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  id="pagamento-boleto"
                  label={
                    <span>
                      <i className="bi bi-bank text-primary"></i> Boleto
                      Bancário
                    </span>
                  }
                  name="paymentMethod"
                  value="Boleto"
                  checked={paymentMethod === "Boleto"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* resumo */}
        <Col md={5}>
          <Card className="sticky-top" style={{ top: "20px" }}>
            <Card.Header as="h5">
              <strong className="text-primary">Resumo do Pedido</strong>
            </Card.Header>
            <ListGroup variant="flush">
              {cartItems.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">{item.produto.nome}</div>
                    <p className="text-muted">
                      {item.quantidade}x R${" "}
                      {parseFloat(item.produto.preco).toFixed(2)}
                    </p>
                  </div>
                  <span className="bg-primary text-white p-1 rounded">
                    R${" "}
                    {(parseFloat(item.produto.preco) * item.quantidade).toFixed(
                      2
                    )}
                  </span>
                </ListGroup.Item>
              ))}

              <ListGroup.Item className="d-flex justify-content-between align-items-center bg-light">
                <h5 className="mb-0">Total</h5>
                <h5 className="mb-0 fw-bold text-primary">
                  R${" "}
                  {cartItems
                    .map(
                      (item) => parseFloat(item.produto.preco) * item.quantidade
                    )
                    .reduce((acc, val) => acc + val, 0)
                    .toFixed(2)}
                </h5>
              </ListGroup.Item>
            </ListGroup>

            <Card.Body className="text-center">
              <Button
                variant="primary"
                size="md"
                className="w-100"
                onClick={handleFinalizarCompra}
                disabled={loading || !enderecoPadrao ||!paymentMethod}
              >
                {loading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <i className="bi bi-credit-card-2-back"></i>
                )}
                {loading ? " Finalizando..." : " Finalizar Compra"}
              </Button>
              {/*  aviso sem enderecoPadrao */}
              {!enderecoPadrao && (
                <small className="text-danger d-block mt-2">
                  É necessário um endereço padrão para finalizar a compra.
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;
