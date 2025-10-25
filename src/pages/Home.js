// /src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import api from '../api/api'; // Sua instância do Axios
import ItemCard from '../components/ItemCard'; // O card que acabamos de criar

const Home = () => {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Endpoint de produtos no seu backend (AJUSTE SE NECESSÁRIO)
    const PRODUCTS_ENDPOINT = '/produto'; 

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Sua API pode ter /produtos ou /items, ajuste conforme seu NestJS
                const response = await api.get(PRODUCTS_ENDPOINT); 
                
                // Supondo que sua API retorna um array de produtos
                setProdutos(response.data.data); 
            } catch (err) {
                console.error("Erro ao buscar produtos:", err);
                setError('Não foi possível carregar os produtos. Tente novamente mais tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []); // Array de dependências vazio para rodar apenas uma vez na montagem

    // ------------------------------------
    // Lógica de Renderização Condicional
    // ------------------------------------
    
    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </Spinner>
                <p className="mt-2">Carregando produtos...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }
    
    if (produtos.length === 0) {
        return (
            <Container className="mt-5">
                <Alert variant="info">Nenhum produto encontrado.</Alert>
            </Container>
        );
    }

    // ------------------------------------
    // Renderização da Lista de Produtos
    // ------------------------------------
    
    return (
        <Container className="mt-4">
            <h1 className="mb-4">Nossos Produtos</h1>
            <Row>
                {/* Mapeia a lista de produtos e renderiza um ItemCard para cada */}
                {produtos.map((produto) => (
                    <Col key={produto.id} xs={12} sm={6} md={4} lg={3} className="d-flex justify-content-center">
                        <ItemCard item={produto} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Home;