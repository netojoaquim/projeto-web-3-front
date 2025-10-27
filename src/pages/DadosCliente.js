import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ClientData = () => {
    const { user, fetchClientData, updateClientData, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nome_completo: '',
        email: '',
        numero_telefone: '',
        data_nascimento: '',
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false); // flag para evitar loop

    const formatDate = (isoString) => isoString ? isoString.split('T')[0] : '';

    useEffect(() => {
        console.log('ClientData useEffect disparou -> authLoading:', authLoading, 'user.id:', user?.id);

        if (authLoading || !user?.id || hasLoaded) return;

        const loadData = async () => {
            setLoading(true);
            console.log('ClientData -> chamando fetchClientData com user.id:', user.id);

            const result = await fetchClientData(user.id);

            if (result.success) {
                const data = result.data;
                console.log('ClientData -> dados carregados:', data);
                setFormData({
                    nome_completo: data.nome_completo || '',
                    email: data.email || '',
                    numero_telefone: data.numero_telefone || '',
                    data_nascimento: formatDate(data.data_nascimento),
                });
                setTimeout(() => {
                    navigate('/'); // ou qualquer rota desejada
                }, 1500);
                setError(false);
                setMessage('');
            } else {
                console.error('ClientData -> erro ao carregar dados:', result.message);
                setError(true);
                setMessage(result.message);
            }

            setLoading(false);
            setHasLoaded(true); // marca que já carregou os dados
        };

        loadData();
    }, [authLoading, user?.id, fetchClientData, hasLoaded]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        setError(false);

        const dataToSend = {
            ...formData,
            nome_completo: formData.nome_completo.trim(),
            email: formData.email.trim().toLowerCase(),
        };

        const result = await updateClientData(dataToSend);

        if (result.success) {
            setMessage(result.message);
            await fetchClientData(user.id); // garante dados atualizados
        } else {
            setError(true);
            setMessage(result.message);
        }
        setIsSubmitting(false);
    };

    if (loading || authLoading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Carregando seus dados...</p>
            </Container>
        );
    }

    if (!user) {
        return (
            <Container className="mt-5 text-center">
                <Alert variant="danger">
                    Usuário não encontrado ou email ausente.
                </Alert>
            </Container>
        );
    }

    return (
        <Container style={{ maxWidth: '600px' }} className="mt-5 mb-5 p-4 border rounded shadow-sm">
            <h2 className="mb-4 text-center text-primary">Meus Dados de Perfil</h2>

            {message && <Alert variant={error ? 'danger' : 'success'}>{message}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formNomeCompleto">
                    <Form.Label>Nome Completo</Form.Label>
                    <Form.Control
                        type="text"
                        name="nome_completo"
                        value={formData.nome_completo}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                    />
                    <Form.Text className="text-muted">
                        Alteração de email pode exigir revalidação.
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDataNascimento">
                    <Form.Label>Data de Nascimento</Form.Label>
                    <Form.Control
                        type="date"
                        name="data_nascimento"
                        value={formData.data_nascimento}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                    />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formTelefone">
                    <Form.Label>Número de Telefone</Form.Label>
                    <Form.Control
                        type="tel"
                        name="numero_telefone"
                        value={formData.numero_telefone}
                        onChange={handleChange}
                        placeholder="(XX) XXXXX-XXXX"
                        required
                        disabled={isSubmitting}
                    />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                        'Salvar Alterações'
                    )}
                </Button>
            </Form>
        </Container>
    );
};

export default ClientData;
