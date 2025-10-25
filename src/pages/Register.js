import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    // Estado para os campos: Nome completo, Email, Senha, Confirmação e Telefone
    const [formData, setFormData] = useState({
        nome_completo: '', 
        email: '',
        senha: '', 
        confirmacaoSenha: '', 
        numero_telefone: '', 
        data_nascimento : ''
    });
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError(false);

        // ----------------------------------------------------
        // VALIDAÇÃO E LIMPEZA DE DADOS
        // ----------------------------------------------------

        // 1. Validação de Confirmação de Senha
        if (formData.senha !== formData.confirmacaoSenha) {
            setError(true);
            setMessage('A senha e a confirmação de senha não são iguais.');
            setLoading(false);
            return;
        }

        // 2. Validação Mínima de Senha
        if (formData.senha.trim().length < 6) {
            setError(true);
            setMessage('A senha deve ter pelo menos 6 caracteres.');
            setLoading(false);
            return;
        }

        // 3. Limpeza de Dados (TRIM e LOWERCASE)
        const userDataToSend = {
            nome_completo: formData.nome_completo.trim(),
            email: formData.email.trim().toLowerCase(), // Trim e Lowercase
            senha: formData.senha.trim(),                 // Trim na senha
            numero_telefone: formData.numero_telefone,
            data_nascimento: formData.data_nascimento
            
            // A 'confirmacaoSenha' não é enviada para o backend
        };
        
        // ----------------------------------------------------

        // Chama a função de registro do Contexto
        const result = await register(userDataToSend);

        if (result.success) {
            setMessage(result.message);
            setError(false);
            
            // Redireciona para o login
            setTimeout(() => {
                navigate('/login'); 
            }, 2000); 

        } else {
            setError(true);
            setMessage(result.message);
        }

        setLoading(false);
    };

    return (
        <Container style={{ maxWidth: '500px' }} className="mt-5">
            <h2 className="mb-4 text-center">Criar sua Conta</h2>

            {loading && <div className="text-center"><Spinner animation="border" /></div>}
            {message && <Alert variant={error ? 'danger' : 'success'}>{message}</Alert>}

            <Form onSubmit={handleSubmit}>
                
                {/* Nome Completo */}
                <Form.Group className="mb-3" controlId="formNomeCompleto">
                    <Form.Label>Nome Completo</Form.Label>
                    <Form.Control type="text" name="nome_completo" value={formData.nome_completo} onChange={handleChange} required />
                </Form.Group>
                
                {/* Email */}
                <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDataNascimento">
                    <Form.Label>Data de Nascimento</Form.Label>
                    <Form.Control 
                        type="date" // Isso garante o formato YYYY-MM-DD
                        name="data_nascimento" 
                        value={formData.data_nascimento} 
                        onChange={handleChange} 
                        required 
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formTelefone">
                    <Form.Label>Número de Telefone</Form.Label>
                    <Form.Control type="tel" name="numero_telefone" value={formData.numero_telefone} onChange={handleChange} placeholder="(XX) XXXXX-XXXX" required />
                </Form.Group>

                {/* Senha */}
                <Form.Group className="mb-3" controlId="formSenha">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control type="password" name="senha" value={formData.senha} onChange={handleChange} required minLength={6} />
                    <Form.Text className="text-muted">A senha deve ter pelo menos 6 caracteres.</Form.Text>
                </Form.Group>
                
                {/* NOVO CAMPO: Confirmação de Senha */}
                <Form.Group className="mb-3" controlId="formConfirmacaoSenha">
                    <Form.Label>Confirme a Senha</Form.Label>
                    <Form.Control type="password" name="confirmacaoSenha" value={formData.confirmacaoSenha} onChange={handleChange} required minLength={6} />
                </Form.Group>
                
                {/* Telefone */}
                

                <Button variant="primary" type="submit" className="w-100 mt-3" disabled={loading}>
                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
                
                <p className="text-center mt-3">
                    Já tem uma conta? <span onClick={() => navigate('/login')} className="text-primary" style={{ cursor: 'pointer' }}>Faça Login</span>
                </p>
            </Form>
        </Container>
    );
};

export default Register;