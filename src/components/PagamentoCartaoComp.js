import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').substring(0, 16).match(/.{1,4}/g)?.join(' ') || value.replace(/\D/g, '');
};

const PagamentoCartaoForm = ({ details, setDetails }) => {

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'numeroCartao') {
            newValue = formatCardNumber(value);
        }

        if (name === 'validade') {
            let cleaned = value.replace(/\D/g, '').substring(0, 6);
            if (cleaned.length > 2) {
                newValue = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 6)}`;
            } else {
                newValue = cleaned;
            }
        }

        if (name === 'codigoVerificador') {
            newValue = value.replace(/\D/g, '').substring(0, 4);
        }

        setDetails({
            ...details,
            [name]: newValue,
        });
    };

    return (
        <div className="mt-3 p-3 border rounded bg-light">
            <h5 className='text-primary'>Detalhes do Cartão de Crédito</h5>
            <Row>
                <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label className='text-primary'>Número do cartão</Form.Label>
                        <Form.Control
                            type="text"
                            name="numeroCartao"
                            value={details.numeroCartao}
                            onChange={handleChange}
                            placeholder="0000 0000 0000 0000"
                        />
                    </Form.Group>
                </Col>
                <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label className='text-primary'>Nome no cartão</Form.Label>
                        <Form.Control
                            type="text"
                            name="nomeTitular"
                            value={details.nomeTitular}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className='text-primary'>Validade (MM/AAAA)</Form.Label>
                        <Form.Control
                            type="text"
                            name="validade"
                            value={details.validade}
                            onChange={handleChange}
                            placeholder="MM/AA"
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className='text-primary'>CVV</Form.Label>
                        <Form.Control
                            type="text"
                            name="codigoVerificador"
                            value={details.codigoVerificador}
                            onChange={handleChange}
                            placeholder="123"
                            maxLength={3}
                        />
                    </Form.Group>
                </Col>
            </Row>
        </div>
    );
};

export default PagamentoCartaoForm;