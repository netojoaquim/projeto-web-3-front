import React, { useState } from 'react';
import { Card, Button, Modal, Form } from 'react-bootstrap'; // Importei 'Form' para o seletor
// ----------------------------------------------------
// PASSO 1: Importar a imagem default
// AJUSTE O CAMINHO CONFORME ONDE VOCÊ SALVOU SEU ARQUIVO
import DefaultImage from '../assets/semImagem.jpg'; 
// ----------------------------------------------------

// URL base do seu backend NestJS
const BASE_URL = 'http://localhost:5000'; 
// Agora, a variável aponta para o caminho gerado pelo import
const DEFAULT_IMAGE_URL = DefaultImage; 

// Função auxiliar para formatar preço (Implementação Adicionada)
const formatPrice = (price) => {
    if (price === null || price === undefined) return 'Preço indisponível';
    // Garante que o preço seja tratado como número antes de formatar
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) return 'Preço inválido';
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(numericPrice);
};

const ItemCard = ({ item }) => {
    // 🛑 CORREÇÃO: Mover o useState para antes do return condicional.
    // Isso garante que o Hook seja chamado na mesma ordem em toda renderização.
    
    // Estado para controlar a visibilidade do modal
    const [showModal, setShowModal] = useState(false);
    // 🆕 NOVO ESTADO: Quantidade selecionada, começa em 1
    const [quantity, setQuantity] = useState(1);
    
    // Handlers do Modal
    const handleClose = () => {
        setShowModal(false);
        setQuantity(1); // Resetar quantidade ao fechar
    };
    const handleShow = () => setShowModal(true);

    // Placeholder para a lógica de adicionar ao carrinho
    const handleAddToCart = () => {
        console.log(`Produto ${item.nome} (${item.id}) adicionado ao carrinho. Quantidade: ${quantity}`);
        // TODO: Substituir por chamada ao contexto do carrinho (e.g., addToCart(item, quantity))
        handleClose(); // Fecha o modal após adicionar
    };
    
    // Handler para alterar a quantidade
    const handleQuantityChange = (event) => {
        const value = Math.max(1, parseInt(event.target.value, 10) || 1); // Garante que seja pelo menos 1
        setQuantity(value);
    };
    
    if (!item) return null; // <--- Agora o return condicional está abaixo dos Hooks

    // LÓGICA DE URL DA IMAGEM:
    const imageUrl = item.imagem 
        ? `${BASE_URL}/uploads/${item.imagem}` 
        : DEFAULT_IMAGE_URL; // Usa a imagem default

    // LÓGICA DE TRUNCAMENTO DE DESCRIÇÃO:
    const MAX_DESCRIPTION_LENGTH = 70; // Aumentei ligeiramente para caber mais informação
    const descriptionText = item.descricao 
        ? (item.descricao.length > MAX_DESCRIPTION_LENGTH 
            ? item.descricao.substring(0, MAX_DESCRIPTION_LENGTH) + '...' 
            : item.descricao) 
        : 'Sem descrição.'; // Exibição obrigatória

    return (
        <> {/* Fragmento necessário para incluir o Modal após o Card */}
            <Card style={{ width: '18rem', marginBottom: '20px' }} className="shadow-sm">
                {/* Imagem é obrigatória e usa o fallback */}
                <Card.Img 
                    variant="top" 
                    src={imageUrl} 
                    alt={item.nome || 'Item sem nome'}
                    // Altura fixa para alinhar todos os cards
                    style={{ height: '180px', objectFit: 'cover' }} 
                />
                <Card.Body>
                    {/* Título */}
                    <Card.Title className="text-truncate" title={item.nome}>
                        {item.nome}
                    </Card.Title>
                    
                    {/* Descrição Truncada (obrigatória) */}
                    <Card.Text style={{ fontSize: '0.9rem', height: '40px', overflow: 'hidden' }}>
                        {descriptionText}
                    </Card.Text>
                    
                    {/* Preço em Destaque (obrigatório) */}
                    <Card.Text className="fw-bold fs-5 text-primary my-3">
                        {formatPrice(item.preco)} 
                    </Card.Text>
                    
                    <Button variant="primary" className="w-100" onClick={handleShow}>
                        Ver Detalhes
                    </Button>
                </Card.Body>
            </Card>

            {/* Modal de Detalhes do Produto - verticalmente centralizado */}
            <Modal show={showModal} onHide={handleClose} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{item.nome}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex flex-column flex-md-row">
                        {/* Imagem no Modal */}
                        <div className="flex-shrink-0 mb-3 mb-md-0 me-md-4">
                            <img 
                                src={imageUrl} 
                                alt={item.nome || 'Item sem nome'}
                                style={{ width: '250px', height: '250px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                        </div>
                        
                        {/* Detalhes do Produto */}
                        <div>
                            <p className="fw-bold fs-4 text-primary">{formatPrice(item.preco)}</p>
                            <h3 className="h5 mt-3">Descrição Completa</h3>
                            {/* Mostra a descrição completa sem truncamento */}
                            <p>{item.descricao || 'Sem descrição detalhada fornecida.'}</p>
                            
                            {/* 🆕 Seletor de Quantidade Adicionado */}
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
                                        onChange={handleQuantityChange}
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
                    {/* Botão Voltar (fecha o modal) */}
                    <Button variant="secondary" onClick={handleClose}>
                        <i className="bi bi-arrow-left me-2"></i> Voltar
                    </Button>
                    
                    {/* Botão Adicionar ao Carrinho, que usa a nova 'quantity' */}
                    <Button variant="success" onClick={handleAddToCart}>
                        <i className="bi bi-cart-plus-fill me-2"></i> Adicionar {quantity > 1 ? `(${quantity})` : ''}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ItemCard;
