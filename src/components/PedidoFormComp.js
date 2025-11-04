import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import api from "../api/api";

const PedidoFormComp = ({ pedidoData, onSuccess, onCancel }) => {
  const [metodosPagamento, setMetodosPagamento] = useState([]);
  const [metodoPagamentoSelecionado, setMetodoPagamentoSelecionado] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchMetodosPagamento = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/pagamento/metodos`);
        setMetodosPagamento(response.data);
        setMetodoPagamentoSelecionado(pedidoData.pagamento?.metodo || "");
      } catch (err) {
        setError("Erro ao carregar métodos de pagamento.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (pedidoData?.cliente?.id) {
      fetchMetodosPagamento();
    }
  }, [pedidoData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!metodoPagamentoSelecionado) {
      setError("Selecione um método de pagamento.");
      return;
    }

    try {
      setLoading(true);
      await api.patch(`/pedido/${pedidoData.id}`, {
        metodoPagamento: metodoPagamentoSelecionado,
      });

      // 🔹 Apenas define sucesso local e chama o callback de sucesso
      setSuccessMessage("Método de pagamento alterado com sucesso!");
      
      if (onSuccess) {
        onSuccess("Método de pagamento alterado com sucesso!");
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erro ao atualizar pagamento.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && metodosPagamento.length === 0) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando métodos de pagamento...</p>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Método de Pagamento</Form.Label>
        <Form.Select
          value={metodoPagamentoSelecionado}
          onChange={(e) => setMetodoPagamentoSelecionado(e.target.value)}
          disabled={loading}
        >
          <option value="">Selecione o método de pagamento</option>
          {metodosPagamento.map((metodo) => (
            <option key={metodo} value={metodo}>
              {metodo}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <Spinner as="span" animation="border" size="sm" />
          ) : (
            "Salvar"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default PedidoFormComp;
