import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

const AddressForm = ({ addressData, onSuccess, onCancel }) => {
    const { addAddress, updateAddress } = useAuth();
    const { showAlert } = useAlert();

    const [formData, setFormData] = useState({
        apelido: '',
        cep: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        padrao: true,
    });

    const [loading, setLoading] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);

    const [estados, setEstados] = useState([]);
    const [cidades, setCidades] = useState([]);

    //estados
    useEffect(() => {
        const fetchEstados = async () => {
            try {
                const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
                const data = await res.json();
                data.sort((a, b) => a.sigla.localeCompare(b.sigla));
                setEstados(data);
            } catch (err) {
                console.error('Erro ao carregar estados', err);
            }
        };
        fetchEstados();
    }, []);

    //cidades do estado
    useEffect(() => {
        const fetchCidades = async () => {
            if (!formData.estado) return;
            try {
                const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.estado}/municipios`);
                const data = await res.json();
                const nomes = data.map(c => c.nome).sort();
                setCidades(nomes);
            } catch (err) {
                console.error('Erro ao carregar cidades', err);
            }
        };
        fetchCidades();
    }, [formData.estado]);

    //
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
            padrao: true
        });
        setMessage('');
        setError(false);
    }, [addressData]);

    const fetchAddressFromCEP = async (cep) => {
        try {
            const cleanedCEP = cep.replace(/\D/g, '');
            if (cleanedCEP.length !== 8) return null;

            setCepLoading(true);
            const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`);
            const data = await response.json();
            setCepLoading(false);

            if (data.erro) return null;

            return {
                rua: data.logradouro || '',
                bairro: data.bairro || '',
                cidade: data.localidade || '',
                estado: data.uf || ''
            };
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            setCepLoading(false);
            return null;
        }
    };

    const handleChange = async (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // busca endereco
        if (name === 'cep' && value.replace(/\D/g, '').length === 8) {
            const address = await fetchAddressFromCEP(value);
            if (address) {
                setFormData(prev => ({
                    ...prev,
                    ...address
                }));
            }
        }
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
            setMessage(result.message || "Erro ao salvar o endereço. Verifique os campos.");
        }

        setLoading(false);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Apelido (Ex: Casa, Trabalho)</Form.Label>
                <Form.Control
                    name="apelido"
                    value={formData.apelido}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    maxLength={100}
                />
            </Form.Group>

            <Row>
                <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label>CEP</Form.Label>
                    <Form.Control
                        name="cep"
                        value={formData.cep}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        maxLength={9}
                        placeholder="00000-000"
                    />
                    {cepLoading && <small>Buscando endereço...</small>}
                </Form.Group>
                <Form.Group as={Col} md="6" className="mb-3">
                    <Form.Label>Número</Form.Label>
                    <Form.Control
                        name="numero"
                        value={formData.numero}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        maxLength={10}
                    />
                </Form.Group>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Logradouro/Rua</Form.Label>
                <Form.Control
                    name="rua"
                    value={formData.rua}
                    onChange={handleChange}
                    required
                    disabled={loading || cepLoading}
                    maxLength={255}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Bairro</Form.Label>
                <Form.Control
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    required
                    disabled={loading || cepLoading}
                    maxLength={100}
                />
            </Form.Group>

            <Row>
                <Form.Group as={Col} md="4" className="mb-3">
                    <Form.Label>Estado (UF)</Form.Label>
                    <Form.Select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        required
                        disabled={loading || estados.length === 0 || cepLoading}
                    >
                        <option value="">Selecione</option>
                        {estados.map(e => (
                            <option key={e.id} value={e.sigla}>{e.nome}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group as={Col} md="8" className="mb-3">
                    <Form.Label>Cidade</Form.Label>
                    <Form.Select
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        required
                        disabled={loading || !formData.estado || cidades.length === 0 || cepLoading}
                    >
                        <option value="">Selecione</option>
                        {cidades.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </Row>

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
