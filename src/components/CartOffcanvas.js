import React from 'react';
import { Offcanvas, Button, ListGroup } from 'react-bootstrap';
import { useLayout } from '../context/LayoutContext';
import { useCart } from '../context/CarrinhoContext'; // Implementado no guia anterior
import { useNavigate } from 'react-router-dom';

const CartOffcanvas = () => {
  const { showCart, handleCloseCart } = useLayout();
  const { cartState, removeFromCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    handleCloseCart();
    navigate('/checkout');
  };

  const total = cartState.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <Offcanvas show={showCart} onHide={handleCloseCart} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Seu Carrinho de Compras</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {cartState.items.length === 0 ? (
          <p>Seu carrinho está vazio.</p>
        ) : (
          <>
            <ListGroup variant="flush">
              {cartState.items.map((item) => (
                <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{item.name}</strong>
                    <p className="mb-0 text-muted">Qtd: {item.quantity} | R$ {item.price.toFixed(2)}</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => removeFromCart(item.id)}>
                    Remover
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <h4 className="mt-4">Total: R$ {total.toFixed(2)}</h4>

            <Button variant="success" className="w-100 mt-3" onClick={handleCheckout}>
              Finalizar Compra
            </Button>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default CartOffcanvas;