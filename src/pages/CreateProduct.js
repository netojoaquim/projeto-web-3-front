import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import api from '../api/api'; 
import { useNavigate } from 'react-router-dom';

const CreateProduct = () => {
    const navigate = useNavigate();
    
    // 1. Estados principais do formulário
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        preco: '', // Preço vazio no início
        estoque: 0,
        categoriaId: '', 
        ativo: true, // Novo: Booleano padrão
    });
    
    // 2. Estados de Imagem, UI e Dados Dinâmicos
    const [file, setFile] = useState(null);
    const [uploadedFilename, setUploadedFilename] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // NOVO: Estados para a busca de categorias
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const PRODUCT_CREATE_ENDPOINT = '/produto'; 
    const IMAGE_UPLOAD_ENDPOINT = '/produto/upload'; 
    const CATEGORY_ENDPOINT = '/categoria'; // Rota de busca

    // ====================================================================
    // LÓGICA DE BUSCA DE CATEGORIAS (useEffect)
    // ====================================================================
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get(CATEGORY_ENDPOINT);
                // Ajuste esta linha: assumindo que as categorias estão em response.data.data
                setCategories(response.data.data || response.data); 
            } catch (err) {
                console.error('Erro ao buscar categorias:', err);
                setError('Não foi possível carregar as categorias.');
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // ====================================================================
    // MÁSCARA E VALIDAÇÃO
    // ====================================================================
    
    // Função auxiliar para formatar a string de preço para BRL (ex: 12345 -> 123,45)
    const formatCurrency = (value) => {
        // Remove todos os caracteres não-dígitos
        let v = value.replace(/\D/g, ''); 
        
        // Converte para centavos/float e formata como string BRL
        v = (v / 100).toFixed(2); 
        v = v.replace('.', ','); // Troca ponto por vírgula decimal
        v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'); // Adiciona separador de milhar
        return v;
    };
    
    const handleChange = (e) => {
        let { name, value } = e.target;
        let newValue = value;

        if (name === 'preco') {
            // Aplica a máscara de preço no input
            newValue = formatCurrency(value);
            
        } else if (name === 'estoque') {
            // Validação de Estoque: Garante que não é negativo
            newValue = parseInt(value, 10);
            if (isNaN(newValue) || newValue < 0) {
                newValue = 0;
            }
        }
        
        // Conversão do Select 'ativo' para boolean
        if (name === 'ativo') {
            newValue = value === 'true';
        }

        setFormData({ ...formData, [name]: newValue });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setUploadedFilename(''); 
    };
    
    // ====================================================================
    // LÓGICA DE SUBMISSÃO (DUAS ETAPAS)
    // ====================================================================
    
    // Função auxiliar para converter a string formatada ("1.234,56") para float (1234.56)
    const parsePrice = (priceString) => {
        if (!priceString) return 0;
        let cleanedPrice = priceString.replace(/\./g, ''); // Remove separador de milhar
        cleanedPrice = cleanedPrice.replace(',', '.');    // Troca vírgula por ponto decimal
        return parseFloat(cleanedPrice);
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            let finalFilename = uploadedFilename;

            // 1. FAZER UPLOAD DA IMAGEM, SE EXISTIR
            if (file) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', file); 

                const uploadResponse = await api.post(IMAGE_UPLOAD_ENDPOINT, uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                
                finalFilename = uploadResponse.data.filename;
                setUploadedFilename(finalFilename); 
            }

            // 2. ENVIAR DADOS DO PRODUTO + NOME DO ARQUIVO
            const productData = {
                ...formData,
                imagem: finalFilename || null, 
                // Conversão de tipos para o DTO do NestJS:
                preco: parsePrice(formData.preco), // Converte a máscara de volta para float
                estoque: parseInt(formData.estoque, 10),
                categoriaId: parseInt(formData.categoriaId, 10) // Garante que é um número
                // ativo já é booleano
            };
            
            // Validação final de Categoria
            if (!productData.categoriaId) {
                setError("Por favor, selecione uma categoria.");
                setLoading(false);
                return;
            }

            await api.post(PRODUCT_CREATE_ENDPOINT, productData);
            
            setSuccess('Produto criado com sucesso!');
            setLoading(false);
            
            setTimeout(() => navigate('/'), 2000); 

        } catch (err) {
            console.error('Erro ao criar produto:', err);
            setError(err.response?.data?.message || 'Erro desconhecido ao criar produto.');
            setLoading(false);
        }
    };

    // ====================================================================
    // RENDERIZAÇÃO
    // ====================================================================
    
    return (
        <Container className="mt-5">
            <h2 className="mb-4">Cadastrar Novo Produto</h2>

            {loading && <div className="text-center"><Spinner animation="border" /></div>}
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleCreateProduct}>
                
                {/* 1. Nome e Descrição (Sem alteração) */}
                <Form.Group className="mb-3">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control type="text" name="nome" value={formData.nome} onChange={handleChange} required />
                </Form.Group>
                
                <Form.Group className="mb-3">
                    <Form.Label>Descrição</Form.Label>
                    <Form.Control as="textarea" name="descricao" value={formData.descricao} onChange={handleChange} />
                </Form.Group>

                {/* 2. Preço (Com Máscara) */}
                <Form.Group className="mb-3">
                    <Form.Label>Preço (R$)</Form.Label>
                    <Form.Control 
                        type="text" // Mantém como text para a máscara funcionar
                        name="preco" 
                        value={formData.preco} 
                        onChange={handleChange} 
                        placeholder="0,00"
                        required 
                    />
                </Form.Group>

                {/* 3. Estoque (Com validação mínima) */}
                <Form.Group className="mb-3">
                    <Form.Label>Estoque</Form.Label>
                    <Form.Control 
                        type="number" 
                        name="estoque" 
                        value={formData.estoque} 
                        onChange={handleChange} 
                        min="0" // Hint HTML
                        required 
                    />
                </Form.Group>
                
                {/* 4. Categoria (Lista Suspensa) */}
                <Form.Group className="mb-3">
                    <Form.Label>Categoria</Form.Label>
                    <Form.Select 
                        name="categoriaId" 
                        value={formData.categoriaId} 
                        onChange={handleChange} 
                        required
                        disabled={loadingCategories}
                    >
                        <option value="">{loadingCategories ? 'Carregando categorias...' : 'Selecione uma categoria'}</option>
                        {categories.map((cat) => (
                            // Use cat.id e cat.nome (ajuste conforme sua entidade Categoria)
                            <option key={cat.id} value={cat.id}>
                                {cat.descricao}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                
                {/* 5. Ativo (Seleção Sim/Não) */}
                <Form.Group className="mb-3">
                    <Form.Label>Produto Ativo?</Form.Label>
                    <Form.Select 
                        name="ativo" 
                        // Converte o boolean do estado para string ('true' ou 'false') para o <select>
                        value={formData.ativo.toString()} 
                        onChange={handleChange} 
                        required
                    >
                        <option value="true">Sim</option>
                        <option value="false">Não</option>
                    </Form.Select>
                </Form.Group>


                {/* 6. Imagem (Sem alteração) */}
                <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Imagem do Produto</Form.Label>
                    <Form.Control 
                        type="file" 
                        accept=".jpg,.jpeg,.png,.gif" 
                        onChange={handleFileChange} 
                    />
                    {uploadedFilename && <Form.Text className="text-success">Imagem salva: {uploadedFilename}</Form.Text>}
                </Form.Group>

                <Button variant="success" type="submit" disabled={loading || loadingCategories || !formData.categoriaId}>
                    {loading ? 'Salvando...' : 'Cadastrar Produto'}
                </Button>
            </Form>
        </Container>
    );
};

export default CreateProduct;