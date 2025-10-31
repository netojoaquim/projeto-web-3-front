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
import { Navigate } from "react-router-dom";
import { useCart } from "../context/CarrinhoContext";

const CheckoutPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cartao");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const { cartUpdateSignal, fetchCart } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const enderecoPadrao = user?.enderecos?.find((addr) => addr.padrao === true);

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

      // Chamada à função centralizada do Context
      const data = await fetchCart();

      if (data) {
        // Agora setCartItems está definido e pode ser usado
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
    
    // O useEffect agora reage à mudança no carrinho e executa o fetch
  }, [user, fetchCart, cartUpdateSignal]);

  const handleFinalizarCompra = async () => {
    setLoading(true);
    const userId = user?.id || user?.clienteId;

    const pedidoData = {
      userId: userId,
      itens: cartItems,
      total: total,
      // Usando a constante local 'enderecoPadrao'
      enderecoEntrega: enderecoPadrao,
      metodoPagamento: paymentMethod,
    };

    // Validação que agora usa a constante local
    if (!enderecoPadrao) {
      setError("Não é possível finalizar a compra sem um endereço padrão.");
      setLoading(false);
      return;
    }

    try {
      // Cria o pedido (simulação)
      await api.post("/pedidos", pedidoData);

      // Limpa o carrinho
      await api.delete(`/carrinho/${userId}/limpar`);

      alert("Compra finalizada com sucesso!");
      setCartItems([]);
      setTotal(0);
      setShouldRedirect(true);
    } catch (err) {
      console.error("Erro ao finalizar compra:", err);
      setError("Erro ao finalizar compra. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // RENDERIZAÇÃO
  // ----------------------------------------------------------------

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
    // CORREÇÃO: Retorna o componente <Navigate /> para redirecionar
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
    <Container  className="mb-4">
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

          {/* Card de Endereço de Entrega */}
          <Card className="mb-3">
            <Card.Header as="h5">
              <i className="bi bi-geo-alt-fill mx-auto text-primary"></i>
              <strong className="p-2 text-primary">Endereço de Entrega</strong>
            </Card.Header>
            <Card.Body>
              {/* Agora usa a constante 'enderecoPadrao' encontrada no início do componente */}
              {enderecoPadrao ? (
                <ListGroup>
                  <ListGroup.Item>
                    <strong className="text-primary">{enderecoPadrao.apelido}</strong>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong className="text-primary">Longradouro: </strong>
                    {enderecoPadrao.rua},{enderecoPadrao.numero}{" "}-{" "}
                    {enderecoPadrao.bairro} - {enderecoPadrao.cidade} / {enderecoPadrao.estado}
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

          {/* Card de Forma de Pagamento */}
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
                      <i className="bi bi-credit-card-2-back text-primary"></i> Cartão de Crédito
                    </span>
                  }
                  name="paymentMethod"
                  value="cartao"
                  checked={paymentMethod === "cartao"}
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
                  value="pix"
                  checked={paymentMethod === "pix"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  id="pagamento-boleto"
                  label={
                    <span>
                      <i className="bi bi-bank text-primary"></i> Boleto Bancário
                    </span>
                  }
                  name="paymentMethod"
                  value="boleto"
                  checked={paymentMethod === "boleto"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* COLUNA DA DIREITA: RESUMO DO PEDIDO */}
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
                      {item.quantidade}x{" "} R$ {parseFloat(item.produto.preco).toFixed(2)}
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
                  R$ {total.toFixed(2)}
                </h5>
              </ListGroup.Item>
            </ListGroup>

            <Card.Body className="text-center">
              <Button
                variant="primary"
                size="md"
                className="w-100"
                onClick={handleFinalizarCompra}
                // Desabilita se não houver 'enderecoPadrao' encontrado
                disabled={loading || !enderecoPadrao}
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
                  <i class="bi bi-credit-card-2-back"></i>
                )}
                {loading ? " Finalizando..." : "Finalizar Compra"}
              </Button>
              {/* Mostra aviso se não houver 'enderecoPadrao' */}
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
