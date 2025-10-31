import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';


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
    const [hasLoaded, setHasLoaded] = useState(false);
    const { showAlert } = useAlert();
    const formatDate = (isoString) => isoString ? isoString.split('T')[0] : '';

    useEffect(() => {
        //console.log('ClientData useEffect disparou -> authLoading:', authLoading, 'user.id:', user?.id);

        if (authLoading || !user?.id || hasLoaded) return;

        const loadData = async () => {
            setLoading(true);
            //console.log('ClientData -> chamando fetchClientData com user.id:', user.id);

            const result = await fetchClientData(user.id);

            if (result.success) {
                const data = result.data;
                //console.log('ClientData -> dados carregados:', data);
                setFormData({
                    nome_completo: data.nome_completo || '',
                    email: data.email || '',
                    numero_telefone: data.numero_telefone || '',
                    data_nascimento: formatDate(data.data_nascimento),
                });
                setTimeout(() => {
                     // ou qualquer rota desejada
                }, 1500);
                setError(false);
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
    let newValue = value;
    if (name === "numero_telefone") {
      // Remove tudo que não for número
      newValue = value.replace(/\D/g, "");

      // Limita a 11 dígitos
      newValue = newValue.slice(0, 11);

      // Aplica a formatação
      if (newValue.length <= 10) {
        newValue = newValue.replace(
          /^(\d{0,2})(\d{0,4})(\d{0,4})$/,
          (_, d1, d2, d3) => {
            let formatted = "";
            if (d1) formatted += `(${d1}`;
            if (d1.length === 2) formatted += ") ";
            if (d2) formatted += d2;
            if (d3) formatted += `-${d3}`;
            return formatted;
          }
        );
      } else {
        newValue = newValue.replace(
          /^(\d{0,2})(\d{0,5})(\d{0,4})$/,
          (_, d1, d2, d3) => {
            let formatted = "";
            if (d1) formatted += `(${d1}`;
            if (d1.length === 2) formatted += ") ";
            if (d2) formatted += d2;
            if (d3) formatted += `-${d3}`;
            return formatted;
          }
        );
      }
    }

    setFormData({ ...formData, [name]: newValue });
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
            await fetchClientData(user.id);
            navigate('/');
            showAlert({
          title: "Aviso!",
          message: "Dados atualizados com sucesso.",
          type: "warning",
          duration: 5000,
          bg: "#0d6efd",
        });
        } else {
            setError(true);
            showAlert({
          title: "Aviso!",
          message: "Erro ao atualizar dados: " + result.message,
          type: "warning",
          duration: 5000,
          bg: "#0d6efd",
        });
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

    return (
        <Container style={{ maxWidth: '600px' }} className="mt-5 mb-5 p-4 border rounded shadow-sm">
            <h2 className="mb-4 text-center text-primary">Meus Dados de Perfil</h2>

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

                <Button variant="primary" type="submit" className="w-100" disabled={isSubmitting}>
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
