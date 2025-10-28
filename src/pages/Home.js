// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import api from '../api/api';
import ItemCard from '../components/ItemCard';

const Home = () => {
    const [produtos, setProdutos] = useState([]);
    const [filteredProdutos, setFilteredProdutos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const PRODUCTS_ENDPOINT = '/produto';
    const CATEGORIES_ENDPOINT = '/categoria';

    // Busca produtos
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(PRODUCTS_ENDPOINT);
                const produtosData = response.data.data || response.data;
                setProdutos(produtosData);
                setFilteredProdutos(produtosData);
            } catch (err) {
                console.error("Erro ao buscar produtos:", err);
                setError('Não foi possível carregar os produtos.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Busca categorias
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get(CATEGORIES_ENDPOINT);
                //console.log("categorias retornadas pela api:", response.data);
                setCategorias(response.data || response.data);
            } catch (err) {
                console.error("Erro ao buscar categorias:", err);
            }
        };
        fetchCategories();
    }, []);

    // Filtra produtos conforme busca e categoria
    useEffect(() => {
        let filtered = produtos;

        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(prod =>
                prod.nome.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(prod =>
                prod.categoria?.id === parseInt(selectedCategory)
            );
        }

        setFilteredProdutos(filtered);
    }, [searchTerm, selectedCategory, produtos]);

    // ------------------------------------
    // Renderização condicional
    // ------------------------------------

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
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

    return (
        <Container className="mt-4">
            <h1 className="mb-4">Nossos Produtos</h1>

            {/* 🔍 Barra de pesquisa e seletor de categoria */}
            <Row className="mb-4">
                <Col md={8} sm={12} className="mb-2">
                    <InputGroup>
                        <InputGroup.Text>
                            <i className="bi bi-search"></i>
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Pesquisar produtos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={4} sm={12}>
                    <Form.Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Todas as Categorias</option>
                        {categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.descricao}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            {/* 🧱 Lista de produtos */}
            {filteredProdutos.length === 0 ? (
                <Alert variant="info">Nenhum produto encontrado.</Alert>
            ) : (
                <Row>
                    {filteredProdutos.map((produto) => (
                        <Col key={produto.id} xs={12} sm={6} md={4} lg={3} className="d-flex justify-content-center">
                            <ItemCard item={produto} />
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default Home;
