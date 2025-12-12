import React from 'react';
import { Form } from 'react-bootstrap';

const PagamentoPixForm = ({ details, setDetails }) => {
  const handleChange = (e) => {
    setDetails({
      ...details,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="mt-3 p-3 border rounded bg-light">
      <h5 className='text-primary'>Pagamento via Pix</h5>
      <p className="p-2 text-primary">
        A chave Pix e o QR Code serão gerados após a finalização do pedido. Você
        será redirecionado para a página de detalhes.
      </p>
      <Form.Group className="mb-3">
        <Form.Label className='text-primary'>Chave Pix de Referência (Opcional)</Form.Label>
        <Form.Control
          type="text"
          name="chavePix"
          value={details.chavePix}
          onChange={handleChange}
          placeholder="Seu CPF, Email ou Telefone (para referência)"
        />
      </Form.Group>
    </div>
  );
};

export default PagamentoPixForm;