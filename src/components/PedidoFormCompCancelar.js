import React, { useState } from "react";
import { Form, Button, Modal, Spinner } from "react-bootstrap";

const PedidoFormCompCancelar = ({ pedidoId, onCancel, onConfirm }) => {
  const [justificativa, setJustificativa] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity() || justificativa.trim().length < 5) {
      setValidated(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(justificativa.trim());
    } catch (error) {
      console.error("Erro na confirmação do cancelamento:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Modal.Body>
        <p className="fw-medium">
          Confirma o cancelamento do Pedido #{pedidoId}?
          <br />É necessário fornecer uma justificativa para esta ação.
        </p>
        <Form.Group controlId="justificativaCancelamento">
          <Form.Label>Motivo do Cancelamento:</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Ex: Cliente desistiu da compra / Produto esgotado / Pagamento não processado."
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            required
            minLength={10}
          />
          <Form.Control.Feedback type="invalid">
            A justificativa é obrigatória e deve ter pelo menos 10 caracteres.
          </Form.Control.Feedback>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Fechar
        </Button>
        <Button
          variant="danger"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              <span className="ms-2">Cancelando...</span>
            </>
          ) : (
            <>
              <i className="bi bi-x-circle me-1"></i> Confirmar Cancelamento
            </>
          )}
        </Button>
      </Modal.Footer>
    </Form>
  );
};

export default PedidoFormCompCancelar;