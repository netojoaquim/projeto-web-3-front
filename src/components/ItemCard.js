import React, { useState } from 'react';
import { Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import DefaultImage from '../assets/semImagem.jpg';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CarrinhoContext';
import { useAlert } from '../context/AlertContext';
import api from '../api/api';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const DEFAULT_IMAGE_URL = DefaultImage;

const ItemCard = ({ item }) => {
  const { cartState, addToCartWithStock } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { showAlert } = useAlert();

  if (!item) return null;

  const handleClose = () => {
    setShowModal(false);
    setQuantity(1);
    setFeedback(null);
    setIsLoading(false);
  };

  const handleShow = () => setShowModal(true);

  const handleAddToCart = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await api.get(`${BASE_URL}/carrinho/${user.id}`, {
      });
      const itemInCart = res.data?.itens?.find(
        (ci) => ci?.produto?.id === item?.id
      );
      const currentQty = itemInCart?.quantidade || 0;

      if (currentQty + quantity > item.estoque) {
        showAlert({
          title: "Aviso!",
          message: "Quantidade solicitada excede o estoque disponível.",
          type: "warning",
          duration: 5000,
          bg: "#ff0000",
        });
        setIsLoading(false);
        return;
      }

      const result = await addToCartWithStock(item, quantity);
      showAlert({
        title: "Aviso!",
        message: "Produto adicionado ao carrinho com sucesso.",
        type: "warning",
        duration: 5000,
        bg: "#0d6efd",
      });

      if (result.success) setTimeout(() => handleClose(), 1000);
    } catch (err) {
      console.error(err);
      showAlert({
        title: "Erro!",
        message:
          "Não foi possível adicionar o produto ao carrinho. Faça login primeiro",
        type: "warning",
        duration: 5000,
        bg: "#ff0000",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const imageUrl = item.imagem ? `${BASE_URL}/uploads/${item.imagem}` : DEFAULT_IMAGE_URL;

  const cartItem = cartState?.items?.find(ci => ci?.produto?.id === item?.id);
  const currentQtyInCart = cartItem?.quantidade || 0;

  return (
    <>
      <Card style={{ width: '18rem', marginBottom: '20px' }} className="shadow-sm">
        <Card.Img
          variant="top"
          src={imageUrl}
          alt={item.nome || 'Produto'}
          style={{ height: '180px', objectFit: 'cover' }}
        />
        <Card.Body>
          <Card.Title className="text-truncate" title={item.nome || ''}>
            {item.nome || 'Produto sem nome'}
          </Card.Title>
          <Card.Text className="fw-bold fs-5 text-primary my-3">
            {item.preco !== undefined
              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)
              : 'Preço indisponível'}
          </Card.Text>
          <Button variant="primary" className="w-100" onClick={handleShow}>
            Ver Detalhes
          </Button>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{item.nome || 'Produto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {feedback && <Alert variant={feedback.type}>{feedback.message}</Alert>}

          <div className="d-flex flex-column flex-md-row">
            <div className="flex-shrink-0 mb-3 mb-md-0 me-md-4">
              <img
                src={imageUrl}
                alt={item.nome || 'Produto'}
                style={{
                  width: '250px',
                  height: '250px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
            </div>

            <div>
              <p className="fw-bold fs-4 text-primary">
                {item.preco !== undefined
                  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)
                  : 'Valor indisponível'}
              </p>

              <h3 className="h5 mt-3">Descrição Completa</h3>
              <p>{item.descricao || 'Sem descrição detalhada.'}</p>

              <Form.Group controlId="formQuantity" className="mt-4">
                <Form.Label className="fw-bold">Quantidade</Form.Label>
                <div className="d-flex wrap justify-content-between">
                  <div className="d-flex align-items-start w-40 mx-1">
                    <Button
                      variant="outline-secondary"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isLoading}
                    >
                      -
                    </Button>

                    <Form.Control
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => {
                        const value = Math.max(1, parseInt(e.target.value) || 1);
                        setQuantity(Math.min(value, item.estoque || 1));
                      }}
                      className="text-center mx-2"
                      style={{ width: '5em' }}
                      disabled={isLoading}
                    />

                    <Button
                      variant="outline-secondary"
                      onClick={() => setQuantity(q => Math.min(q + 1, item.estoque || 1))}
                      disabled={quantity >= (item.estoque || 1) || isLoading}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </Form.Group>

              <p className="mt-2 mb-0">
                <b>Estoque disponível:</b>{' '}
                {item.estoque !== undefined ? item.estoque : 'Indisponível'}
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            <i className="bi bi-arrow-left me-2"></i> Voltar
          </Button>
          <Button
            variant="primary"
            onClick={handleAddToCart}
            disabled={isLoading || (currentQtyInCart + quantity > item.estoque)||user?.role==="admin"}
          >
            {isLoading ? 'Adicionando...' : (
              <>
                <i className="bi bi-cart-plus-fill me-2"></i>
                Adicionar {quantity > 1 ? `(${quantity})` : ''}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ItemCard;
