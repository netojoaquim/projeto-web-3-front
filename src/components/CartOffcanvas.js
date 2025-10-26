import React, { useEffect } from 'react';
import { Offcanvas, Button, ListGroup, Form } from 'react-bootstrap';
import { useLayout } from '../context/LayoutContext';
import { useCart } from '../context/CarrinhoContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DefaultImage from '../assets/semImagem.jpg';

const CartOffcanvas = () => {
  const { showCart, handleCloseCart } = useLayout();
  const { cartState, dispatch, removeFromCart, updateItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  console.log('CartOffcanvas -> user:', user);
  console.log('CartOffcanvas -> cartState:', cartState);

  useEffect(() => {
    const userIdToFetch = user?.id || user?.clienteId;


    if (!userIdToFetch || !showCart) {
      console.log('CartOffcanvas -> usuário não definido ou Offcanvas fechado, abortando fetchCart');
      return;
    }

    const fetchCart = async () => {
      try {
        console.log('Buscando carrinho do cliente:', userIdToFetch);
        const res = await fetch(`${BASE_URL}/carrinho/${userIdToFetch}`);
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
  }, [user, dispatch, showCart, BASE_URL]);

  const handleCheckout = () => {
    handleCloseCart();
    navigate('/checkout');
  };

  const handleQuantityChange = (item, value) => {
    const newQty = Math.max(1,Number( value));
    dispatch({
      type: 'UPDATE_ITEM',
      payload: { ...item, quantidade: newQty },
    });
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
              {cartState.items.map((item) => {
                const imageUrl = item.produto.imagem
                  ? `${BASE_URL}/uploads/${item.produto.imagem}`
                  : DefaultImage;

                return (
                  <ListGroup.Item
                    key={item.id}
                    className="d-flex flex-column p-3 mb-2 border rounded"
                  >
                    <div className="d-flex align-items-center mb-1">
                      <div className="flex-shrink-0 me-3">
                        <img
                          src={imageUrl}
                          alt={item.produto.nome}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                      <div className=' flex-grow-1 d-inline-block text-truncate'>
                        <h6 className="mb-0">
                          <strong>{item.produto.nome}</strong>
                        </h6>

                        <p
                          className="mb-2 small text-muted"
                          style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'normal',
                            width: '100%',
                          }}
                        >
                          {item.produto.descricao || 'Sem descrição.'}
                        </p>

                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2 flex-row">
                      <div className="d-flex align-items-center" style={{ width: '130px' }}>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(item, item.quantidade - 1)}
                          disabled={item.quantidade <= 1}
                        >
                          -
                        </Button>
                        <Form.Control
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                              // permite o input vazio temporariamente
                              dispatch({
                                type: 'UPDATE_ITEM',
                                payload: { ...item, quantidade: '' },
                              });
                            } else {
                              handleQuantityChange(item, parseInt(val));
                            }
                          }}
                          onBlur={() => {
                            if (!item.quantidade || item.quantidade < 1) {
                              handleQuantityChange(item, 1);
                            }
                          }}
                          className="align-items-center w-100 mx-2 text-center"
                          style={{ height: '31px', width: '3em' }}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(item, item.quantidade + 1)}
                        >
                          +
                        </Button>
                      </div>

                      <div className="text-center mx-1 ">
                        Subtotal: R$ <b>{(parseFloat(item.produto.preco) * item.quantidade).toFixed(2)}</b>
                      </div>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <i class="bi bi-trash-fill"></i>
                      </Button>
                    </div>
                  </ListGroup.Item>

                );
              })}
            </ListGroup>
            <h5 className="mt-1 text-end"><b>Total do Carrinho: </b><span className="text-3">R$ {cartState.items.reduce(
  (acc, i) => acc + parseFloat(i.produto.preco) * i.quantidade,
  0
).toFixed(2)}</span></h5>

            <div className='d-flex justify-content-center'>
              <Button className="w-50 primary mt-3" onClick={handleCheckout}>
                Finalizar Compra
              </Button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default CartOffcanvas;