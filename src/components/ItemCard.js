import React, { useState } from 'react';
import { Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import DefaultImage from '../assets/semImagem.jpg';
import { useAuth } from '../context/AuthContext'; 
import {useCart} from '../context/CarrinhoContext';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const DEFAULT_IMAGE_URL = DefaultImage;

const ItemCard = ({ item }) => {
    const [showModal, setShowModal] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [feedback, setFeedback] = useState(null);
    const { user } = useAuth();
    const { dispatch } = useCart();     

    const handleClose = () => {
        setShowModal(false);
        setQuantity(1);
        setFeedback(null);
    };

    const handleShow = () => setShowModal(true);
    const handleAddToCart = async () => {
        if (!user?.id && !user?.clienteId) {
            setFeedback({ type: 'danger', message: 'Usuário não identificado. Faça login novamente.' });
            return;
        }

        const clienteId = user.clienteId || user.id;

        try {
            const response = await axios.post(
                `${BASE_URL}/carrinho/${clienteId}/item`,
                {
                    produtoId: item.id,
                    quantidade: quantity
                }
            );
            const updatedCartData = response.data;
            dispatch({
              type: 'SET_CART',
              payload: {
                cartId: updatedCartData.id,
                items: updatedCartData.itens || [],
                total: updatedCartData.total || 0,
              },
            });

            setFeedback({
                type: 'success',
                message: `✅ ${item.nome} (${quantity}x) adicionado ao carrinho!`
            });

            // Fecha o modal após 1 segundo
            setTimeout(() => handleClose(), 1000);
        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            setFeedback({
                type: 'danger',
                message: 'Erro ao adicionar o produto ao carrinho. Tente novamente.'
            });
        }
    };

    const imageUrl = item.imagem 
        ? `${BASE_URL}/uploads/${item.imagem}` 
        : DEFAULT_IMAGE_URL;

    return (
        <>
            <Card style={{ width: '18rem', marginBottom: '20px' }} className="shadow-sm">
                <Card.Img 
                    variant="top" 
                    src={imageUrl} 
                    alt={item.nome}
                    style={{ height: '180px', objectFit: 'cover' }} 
                />
                <Card.Body>
                    <Card.Title className="text-truncate" title={item.nome}>
                        {item.nome}
                    </Card.Title>
                    <Card.Text className="fw-bold fs-5 text-primary my-3">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)}
                    </Card.Text>
                    <Button variant="primary" className="w-100" onClick={handleShow}>
                        Ver Detalhes
                    </Button>
                </Card.Body>
            </Card>

            {/* Modal */}
            <Modal show={showModal} onHide={handleClose} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{item.nome}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {feedback && (
                        <Alert variant={feedback.type}>{feedback.message}</Alert>
                    )}
                    <div className="d-flex flex-column flex-md-row">
                        <div className="flex-shrink-0 mb-3 mb-md-0 me-md-4">
                            <img 
                                src={imageUrl}
                                alt={item.nome}
                                style={{ width: '250px', height: '250px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                        </div>
                        <div>
                            <p className="fw-bold fs-4 text-primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)}
                            </p>
                            <h3 className="h5 mt-3">Descrição Completa</h3>
                            <p>{item.descricao || 'Sem descrição detalhada.'}</p>
                            <Form.Group controlId="formQuantity" className="mt-4" style={{ maxWidth: '150px' }}>
                                <Form.Label className="fw-bold">Quantidade</Form.Label>
                                <div className="d-flex align-items-center">
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                                        disabled={quantity <= 1}
                                    >-</Button>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="text-center mx-2"
                                    />
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={() => setQuantity(q => q + 1)}
                                    >+</Button>
                                </div>
                            </Form.Group>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        <i className="bi bi-arrow-left me-2"></i> Voltar
                    </Button>
                    <Button variant="success" onClick={handleAddToCart}>
                        <i className="bi bi-cart-plus-fill me-2"></i> Adicionar {quantity > 1 ? `(${quantity})` : ''}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ItemCard;
