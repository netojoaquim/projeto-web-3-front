import React, { useEffect } from "react";
import { Offcanvas, Button, ListGroup, Form } from "react-bootstrap";
import { useLayout } from "../context/LayoutContext";
import { useCart } from "../context/CarrinhoContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DefaultImage from "../assets/semImagem.jpg";

const CartOffcanvas = () => {
  const { showCart, handleCloseCart } = useLayout();
  const { cartState, dispatch, removeFromCart, updateItem, fetchCart } =useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const userIdToFetch = user?.id || user?.clienteId;
    if (!userIdToFetch || !showCart) return;

    fetchCart();
  }, [user, fetchCart, showCart]);

  const handleCheckout = () => {
    handleCloseCart();
    navigate("/checkout");
  };

  const handleQuantityChange = (item, value) => {
    let newQty = Number(value);
    if (isNaN(newQty) || newQty < 1) newQty = 1;
    if (newQty > (item.produto?.estoque || 0)) newQty = item.produto.estoque;

    dispatch({
      type: "UPDATE_ITEM",
      payload: { ...item, quantidade: newQty },
    });

    updateItem(item.id, newQty);
  };

  const total = cartState.items.reduce(
    (sum, item) => sum + (item?.produto?.preco ?? 0) * (item.quantidade || 0),
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
                const produto = item.produto || {};
                const imageUrl = produto.imagem
                  ? `${BASE_URL}/uploads/${produto.imagem}`
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
                          alt={produto.nome || "Produto"}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                      <div className="flex-grow-1 d-inline-block text-truncate">
                        <h6 className="mb-0">
                          <strong>{produto.nome || "Produto"}</strong>
                        </h6>
                        <p
                          className="mb-2 small text-muted"
                          style={{
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "normal",
                            width: "100%",
                          }}
                        >
                          {produto.descricao || "Sem descrição."}
                        </p>
                        <p className="mb-0">
                          Estoque disponível:{" "}
                          {produto.estoque ?? "Indisponível"}
                        </p>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-2 flex-row">
                      <div
                        className="d-flex align-items-center"
                        style={{ width: "130px" }}
                      >
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              item,
                              (item.quantidade || 1) - 1
                            )
                          }
                          disabled={(item.quantidade || 1) <= 1}
                        >
                          -
                        </Button>

                        <Form.Control
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) => {
                            const val = e.target.value;
                            dispatch({
                              type: "UPDATE_ITEM",
                              payload: {
                                ...item,
                                quantidade: val === "" ? "" : Number(val),
                              },
                            });
                          }}
                          onBlur={() => {
                            let newQty = Number(item.quantidade);
                            if (!newQty || newQty < 1) newQty = 1;
                            if (newQty > (produto.estoque || 0))
                              newQty = produto.estoque;
                            handleQuantityChange(item, newQty);
                          }}
                          className="align-items-center w-100 mx-2 text-center"
                          style={{ height: "31px", width: "3em" }}
                        />

                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              item,
                              (item.quantidade || 1) + 1
                            )
                          }
                          disabled={
                            (item.quantidade || 1) >= (produto.estoque || 1)
                          }
                        >
                          +
                        </Button>
                      </div>

                      <div className="text-center mx-1">
                        Subtotal: R${" "}
                        <b>
                          {(
                            (produto.preco || 0) * (item.quantidade || 0)
                          ).toFixed(2)}
                        </b>
                      </div>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </Button>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>

            <h5 className="mt-1 text-end">
              <b>Total do Carrinho: </b>
              <span className="text-3">R$ {total.toFixed(2)}</span>
            </h5>

            <div className="d-flex justify-content-center">
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
