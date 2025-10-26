import React, { useEffect } from 'react';
import { Offcanvas, Button, ListGroup, Form } from 'react-bootstrap';
import { useLayout } from '../context/LayoutContext';
import { useCart } from '../context/CarrinhoContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CartOffcanvas = () => {
  const { showCart, handleCloseCart } = useLayout();
  const { cartState, dispatch, removeFromCart, updateItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log('CartOffcanvas -> user:', user);
  console.log('CartOffcanvas -> cartState:', cartState);

  useEffect(() => {
    if (!user?.id) {
      console.log('CartOffcanvas -> usuário ainda não definido, abortando fetchCart');
      return;
    }

    const fetchCart = async () => {
      try {
        console.log('Buscando carrinho do cliente:', user.id);
        const res = await fetch(`http://localhost:5000/carrinho/${user.id}`);
        const data = await res.json();
        console.log('Carrinho retornado:', data);

        dispatch({
          type: 'SET_CART',
          payload: {
            cartId: data.id,
            items: data.itens || [],
            total: data.total || 0,
          },
        });
      } catch (err) {
        console.error('Erro ao carregar carrinho:', err);
      }
    };

    fetchCart();
  }, [user, dispatch]);

  const handleCheckout = () => {
    handleCloseCart();
    navigate('/checkout');
  };

  const handleQuantityChange = (item, value) => {
    const newQty = Math.max(1, value);
    updateItem(item.id, newQty);
  };

  const total = cartState.items.reduce(
    (acc, item) => acc + parseFloat(item.produto.preco) * item.quantidade,
    0
  );

  return (
    <Offcanvas show={showCart} onHide={handleCloseCart} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Seu Carrinho</Offcanvas.Title>
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
                    <strong>{item.produto.nome}</strong>
                    <p className="mb-0 text-muted">
                      Qtd: {item.quantidade} | R$ {parseFloat(item.produto.preco).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remover
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <h5 className="mt-3">Total: R$ {total.toFixed(2)}</h5>
            <Button variant="success" className="w-100 mt-2" onClick={handleCheckout}>
              Finalizar Compra
            </Button>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default CartOffcanvas;
