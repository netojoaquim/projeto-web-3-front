import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
// Certifique-se de que os caminhos de importação para api e ItemCard estão corretos
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
    const [precoMinimo,setPrecoMinimo]=useState('')
    const [precoMaximo,setPrecoMaximo]=useState('')

    const PRODUCTS_ENDPOINT = '/produto';
    const CATEGORIES_ENDPOINT = '/categoria';

    // Busca produtos
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(PRODUCTS_ENDPOINT);
                // Assumindo que a API retorna os dados corretamente
                const produtosData = response.data.data || response.data; 
                const produtosAtivos = produtosData.filter(prod => prod.ativo === true);

                setProdutos(produtosAtivos);
                setFilteredProdutos(produtosAtivos);
            } catch (err) {
                console.error("Erro ao buscar produtos:", err);
                setError('Não foi possível carregar os produtos.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get(CATEGORIES_ENDPOINT);
                setCategorias(response.data || []); // Garante que categorias seja um array
            } catch (err) {
                console.error("Erro ao buscar categorias:", err);
            }
        };
        fetchCategories();
    }, []);

    // Efeito para filtrar os produtos
    useEffect(() => {
        let filtered = produtos;

        // Filtro por termo de busca
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(prod =>
                prod.nome.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro por categoria
        if (selectedCategory) {
            filtered = filtered.filter(prod =>
                prod.categoria?.id === parseInt(selectedCategory)
            );
        }

        // Filtro por preço
        const min = parseFloat(precoMinimo) || 0;
        const max = parseFloat(precoMaximo) || Infinity;

        filtered = filtered.filter(prod =>
            prod.preco >= min && prod.preco <= max
        );

        setFilteredProdutos(filtered);
    }, [searchTerm, selectedCategory,precoMinimo,precoMaximo,produtos]);


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
        <Container className="mt-0">
            <h1 className="mb-4">Nossos Produtos</h1>

            {/* 🔍 Contêiner de Filtros com Grid Bootstrap (className) */}
            {/* g-2 adiciona espaçamento (gutter) entre as colunas/linhas */}
            <div className="row g-2 mb-4">
                
                {/* 1. Campo de pesquisa: 
                    col-12 (100% em mobile)
                    col-lg-9 (75% em desktop)
                */}
                <div className="col-12 col-lg-9">
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
                </div>

                {/* 2. Seletor de categoria: 
                    col-12 (100% em mobile)
                    col-lg-3 (25% em desktop)
                    Total da Linha 1 em LG: 9 + 3 = 12 (Completo)
                */}
                <div className="col-12 col-lg-3">
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
                </div>

                {/* 3. Preço Mínimo: 
                    col-12 (100% em mobile)
                    offset-lg-6 (Empurra 50% para a direita em desktop)
                    col-lg-3 (25% em desktop)
                */}
                <div className="col-12 col-lg-3 offset-lg-6"> 
                    <Form.Control
                        type="number"
                        placeholder="Preço mínimo"
                        value={precoMinimo}
                        onChange={(e) => setPrecoMinimo(e.target.value)}
                    />
                </div>

                {/* 4. Preço Máximo: 
                    col-12 (100% em mobile)
                    col-lg-3 (25% em desktop)
                    Total da Linha 2 em LG: (offset 6) + 3 + 3 = 12 (Completo, alinhado à direita)
                */}
                <div className="col-12 col-lg-3">
                    <Form.Control
                        type="number"
                        placeholder="Preço máximo"
                        value={precoMaximo}
                        onChange={(e) => setPrecoMaximo(e.target.value)}
                    />
                </div>
            </div>


            {/* 🧱 Lista de produtos (Mantido como estava, usando grid) */}
            {filteredProdutos.length === 0 ? (
                <Alert variant="info">Nenhum produto encontrado.</Alert>
            ) : (
                <div className="row">
                    {filteredProdutos.map((produto) => (
                        <div key={produto.id} className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center mb-4">
                            <ItemCard item={produto} />
                        </div>
                    ))}
                </div>
            )}
        </Container>
    );
};

export default Home;