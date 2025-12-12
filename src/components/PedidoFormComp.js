import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import api from "../api/api";
import PagamentoCartaoForm from './PagamentoCartaoComp';
import PagamentoPixForm from './PagamentoPixComp';
import PagamentoBoletoForm from './PagamentoBoletoComp';

const initializePaymentDetails = (pagamento) => {
    const detalhes = pagamento || {};
    const metodo = detalhes.metodo || "";

    return {
        metodo: metodo,
        cardDetails: {
            numeroCartao: detalhes.numeroCartao || "",
            nomeTitular: detalhes.nomeTitular || "",
            codigoVerificador: detalhes.codigoVerificador || "",
            validade: detalhes.validade || "",
        },
        pixDetails: {
            chavePix: detalhes.chavePix || "",
            qrCode: detalhes.qrCode || "",
        },
        boletoDetails: {
            codigoBarras: detalhes.codigoBarras || "",
            dataVencimento: detalhes.dataVencimento || "",
        },
    };
};

const validateCardDetails = (details) => {
    const { numeroCartao, nomeTitular, codigoVerificador, validade } = details;
    
    // 16 numeros
    const cleanNumber = numeroCartao.replace(/\s/g, '');
    if (cleanNumber.length !== 16 || !/^\d{16}$/.test(cleanNumber)) {
        return "Número do cartão deve ter 16 dígitos e ser numérico.";
    }

    //não vazio e apenas letras/espaços
    if (nomeTitular.trim() === "" || !/^[a-zA-Z\s]+$/.test(nomeTitular)) {
        return "Nome do titular inválido (apenas letras e espaços).";
    }
    
    // 3 numéricos
    if (!/^\d{3}$/.test(codigoVerificador)) {
        return "CVV inválido. Deve ter 3 dígitos numéricos.";
    }

    // validade MM/AA e nao expirado
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(validade)) {
        return "Formato de validade inválido. Use MM/AA.";
    } else {
        const [month, yearStr] = validade.split('/');
        const year = 2000+parseInt(yearStr, 10);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        if (year < currentYear || (year === currentYear && parseInt(month, 10) < currentMonth)) {
            return 'Cartão expirado.';
        }
    }

    return null;
};


const validatePixDetails = (details) => {
    return null;
};

const validateBoletoDetails = (details) => {
    return null;
};


const PedidoFormComp = ({ pedidoData, onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [metodosPagamento, setMetodosPagamento] = useState([]);

    const [paymentState, setPaymentState] = useState(
        initializePaymentDetails(pedidoData?.pagamento)
    );
    const { metodo, cardDetails, pixDetails, boletoDetails } = paymentState;

    useEffect(() => {
        const fetchMetodosPagamento = async () => {
            try {

                setLoading(true);
                const response = await api.get(`/pagamento/metodos`);
                setMetodosPagamento(response.data);
                if (pedidoData?.pagamento?.metodo) {
                    setPaymentState(initializePaymentDetails(pedidoData.pagamento));
                }
            } catch (err) {
                setError("Erro ao carregar métodos de pagamento. Tente novamente.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMetodosPagamento();

        if (pedidoData?.pagamento) {
            setPaymentState(initializePaymentDetails(pedidoData.pagamento));
        }
    }, [pedidoData]);

    const handleDetailsChange = (type, details) => {
        setPaymentState(prev => ({
            ...prev,
            [type]: details
        }));
    };

    const handleMethodChange = (newMethod) => {
        setPaymentState(prev => ({
            ...prev,
            metodo: newMethod
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!metodo) {
            setError("Selecione um método de pagamento.");
            return;
        }

        let detalhesPagamento = {};
        let validationError = null;

        if (metodo === "CARTAO") {
            detalhesPagamento = cardDetails;

            validationError = validateCardDetails(cardDetails);

            if (validationError) {
                setError(validationError);
                return;
            }

        } else if (metodo === "PIX") {
            detalhesPagamento = pixDetails;
            validationError = validatePixDetails(pixDetails);

            if (validationError) {
                setError(validationError);
                return;
            }

        } else if (metodo === "BOLETO") {
            detalhesPagamento = boletoDetails;
            validationError = validateBoletoDetails(boletoDetails);
            if (validationError) {
                setError(validationError);
                return;
            }
        }

        const payload = {
            pagamentoId: pedidoData.pagamento.id,
            metodo: metodo,
            detalhes: detalhesPagamento,
        };

        try {
            setLoading(true);

            await api.patch(`/pedido/${pedidoData.id}/pagamento`, payload);

            setSuccessMessage(`Método e detalhes de pagamento atualizados para ${metodo}!`);
            if (onSuccess) {
                onSuccess(`Método e detalhes de pagamento atualizados para ${metodo}!`);
            }

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Erro ao atualizar pagamento.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && metodosPagamento.length === 0) {
        return <Spinner animation="border" role="status" className="m-3" />;
    }

    return (
        <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-primary">Método de Pagamento</Form.Label>
                <Form.Select
                    value={metodo}
                    onChange={(e) => handleMethodChange(e.target.value)}
                    disabled={loading || metodosPagamento.length === 0}
                >
                    <option value="">Selecione o método de pagamento</option>
                    {metodosPagamento.map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            {metodo === "CARTAO" && (
                <PagamentoCartaoForm
                    details={cardDetails}
                    setDetails={(d) => handleDetailsChange('cardDetails', d)}
                />
            )}

            {metodo === "PIX" && (
                <PagamentoPixForm
                    details={pixDetails}
                    setDetails={(d) => handleDetailsChange('pixDetails', d)}
                />
            )}

            {metodo === "BOLETO" && (
                <PagamentoBoletoForm />
            )}

            <div className="d-flex justify-content-end gap-2 mt-3">
                <Button variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    type="submit"
                    disabled={loading || !metodo || metodosPagamento.length === 0}
                >
                    {loading ? (
                        <Spinner as="span" animation="border" size="sm" />
                    ) : (
                        "Salvar Alterações"
                    )}
                </Button>
            </div>
        </Form>
    );
};

export default PedidoFormComp;