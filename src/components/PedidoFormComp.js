import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Spinner, ListGroup } from 'react-bootstrap';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useCarrinho, useCart } from '../context/CarrinhoContext'; 
const PedidoFormComp = ({ onSuccess, onCancel }) => {
    const { user } = useAuth();
    const { carrinho, totalCarrinho, limparCarrinho } = useCart(); 
    const [enderecos, setEnderecos] = useState([]);
    const [metodosPagamento, setMetodosPagamento] = useState([]);

    const [enderecoIdSelecionado, setEnderecoIdSelecionado] = useState('');
    const [metodoPagamentoSelecionado, setMetodoPagamentoSelecionado] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);

                
                const [endResponse, pagResponse] = await Promise.all([
                    api.get(`/cliente/${user.id}/enderecos`), 
                    api.get(`/cliente/${user.id}/pagamentos`), 
                ]);

                setEnderecos(endResponse.data);
                setMetodosPagamento(pagResponse.data);

                const padraoEndereco = endResponse.data.find(e => e.padrao)?.id;
                if (padraoEndereco) setEnderecoIdSelecionado(padraoEndereco.toString());

            } catch (err) {
                setError('Erro ao carregar dados do cliente: Endereços ou Pagamentos.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!carrinho || carrinho.length === 0) {
            setError('O carrinho está vazio.');
            return;
        }

        if (!enderecoIdSelecionado) {
            setError('Selecione um endereço de entrega.');
            return;
        }

        if (!metodoPagamentoSelecionado) {
            setError('Selecione um método de pagamento.');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                clienteId: user.id,
                enderecoEntregaId: parseInt(enderecoIdSelecionado),
                metodoPagamento: metodoPagamentoSelecionado, 
                
            };

            await api.post('/pedido', payload);

            limparCarrinho();
            onSuccess('Pedido realizado com sucesso!');

        } catch (err) {
            console.error("Erro ao finalizar pedido:", err.response || err);
            setError(err.response?.data?.message || 'Erro ao processar o pedido. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && enderecos.length === 0) {
        return (
            <div className="text-center p-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Carregando opções de checkout...</p>
            </div>
        );
    }

    return (
        <Form onSubmit={handleSubmit}>
            <h5 className="text-primary mb-3">Resumo do Pedido</h5>
            <ListGroup className='mb-4'>
                {carrinho.map(item => (
                    <ListGroup.Item key={item.id} className="d-flex justify-content-between">
                        <span>{item.nome} x {item.quantidade}</span>
                        <span>R$ {(parseFloat(item.preco) * item.quantidade).toFixed(2)}</span>
                    </ListGroup.Item>
                ))}
                <ListGroup.Item className="fw-bold d-flex justify-content-between bg-light">
                    Total: <span>R$ {totalCarrinho.toFixed(2)}</span>
                </ListGroup.Item>
            </ListGroup>

            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

            <Row>
                {/* endereço */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Endereço de Entrega</Form.Label>
                        <Form.Select
                            value={enderecoIdSelecionado}
                            onChange={(e) => setEnderecoIdSelecionado(e.target.value)}
                            required
                        >
                            <option value="">Selecione um endereço</option>
                            {enderecos.map((end) => (
                                <option key={end.id} value={end.id}>
                                    {end.apelido} - {end.rua}, {end.numero}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>

                {/*pagamento */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Método de Pagamento</Form.Label>
                        {/* NOTA: Aqui, o valor deve ser o que o seu backend espera (ex: 'CARTAO', 'PIX') */}
                        <Form.Select
                            value={metodoPagamentoSelecionado}
                            onChange={(e) => setMetodoPagamentoSelecionado(e.target.value)}
                            required
                        >
                            <option value="">Selecione o pagamento</option>
                            {metodosPagamento.map((pag) => (
                                <option key={pag.id} value={pag.metodo || pag.id}>
                                    {pag.metodo ? pag.metodo.toUpperCase() : `ID: ${pag.id}`}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant="success" type="submit" disabled={loading || carrinho.length === 0}>
                    {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Finalizar Pedido'}
                </Button>
            </div>
        </Form>
    );
};

export default PedidoFormComp;