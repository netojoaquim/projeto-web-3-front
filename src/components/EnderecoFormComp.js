import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

const AddressForm = ({ addressData, onSuccess, onCancel }) => {
    const { addAddress, updateAddress } = useAuth();
    const [formData, setFormData] = useState({
        apelido: '',
        cep: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        padrao: false,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const { showAlert } = useAlert();

    useEffect(() => {
        if (addressData) setFormData({ ...addressData });
        else setFormData({
            apelido: '',
            cep: '',
            rua: '',
            numero: '',
            bairro: '',
            cidade: '',
            estado: '',
            padrao: false
        });

        setMessage('');
        setError(false);
    }, [addressData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
             ...prev,
              [name]: type=== 'checkbox'? checked:value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError(false);

        const dataToSend = { ...formData, cep: formData.cep.replace(/\D/g, '') };
        let result;

        if (addressData?.id) {
            result = await updateAddress(addressData.id, dataToSend);
        } else {
            result = await addAddress(dataToSend);
        }

        if (result.success) {
          setMessage(result.message);
          setTimeout(() => {
            onSuccess();
            onCancel();
            showAlert({
              title: "Aviso!",
              message: "Endereço salvo com sucesso.",
              type: "warning",
              duration: 5000,
              bg: "#0d6efd",
            });
          }, 500);
        } else {
          setError(true);
          setMessage(
            result.message || "Erro ao salvar o endereço. Verifique os campos."
          );
        }

        setLoading(false);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Apelido (Ex: Casa, Trabalho)</Form.Label>
                <Form.Control name="apelido" value={formData.apelido} onChange={handleChange} required disabled={loading} maxLength={100} />
            </Form.Group>

            <Row>
                <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label>CEP</Form.Label>
                    <Form.Control name="cep" value={formData.cep} onChange={handleChange} required disabled={loading} maxLength={8} placeholder="00000-000" />
                </Form.Group>
                <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label>Número</Form.Label>
                    <Form.Control name="numero" value={formData.numero} onChange={handleChange} required disabled={loading} maxLength={10} />
                </Form.Group>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Logradouro/Rua</Form.Label>
                <Form.Control name="rua" value={formData.rua} onChange={handleChange} required disabled={loading} maxLength={255} />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Bairro</Form.Label>
                <Form.Control name="bairro" value={formData.bairro} onChange={handleChange} required disabled={loading} maxLength={100} />
            </Form.Group>

            <Row>
                <Form.Group as={Col} md="8" className="mb-3">
                    <Form.Label>Cidade</Form.Label>
                    <Form.Control name="cidade" value={formData.cidade} onChange={handleChange} required disabled={loading} maxLength={100} />
                </Form.Group>
                <Form.Group as={Col} md="4" className="mb-3">
                    <Form.Label>Estado (UF)</Form.Label>
                    <Form.Control name="estado" value={formData.estado} onChange={handleChange} required disabled={loading} maxLength={2} placeholder="EX: SP" />
                </Form.Group>
                <Form.Group className="mb-3">
                <Form.Check
                    type="checkbox"
                    label="Endereço Padrão"
                    name="padrao"
                    checked={formData.padrao}
                    onChange={handleChange}
                    disabled={loading}
                />
            </Form.Group>
            </Row>
            <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancelar</Button>
                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" className="me-2" /> : <i className="bi bi-save me-2"></i>}
                    {addressData ? 'Salvar Alterações' : 'Adicionar Endereço'}
                </Button>
            </div>
        </Form>
    );
};

export default AddressForm;
