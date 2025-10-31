import { useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

const ClienteFormComp = ({ clienteData, onSuccess, onCancel }) => {
  const { updateClienteRoleAtivo  } = useAuth(); // Função que atualiza o cliente no backend
  const [form, setForm] = useState({
    role: clienteData?.role || 'cliente',
    ativo: clienteData?.ativo ?? true,
  });
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const result = await updateClienteRoleAtivo(clienteData.id, form.role, form.ativo);
    if (result.success) {
      onSuccess();
      onCancel();
      showAlert({
          title: "Aviso!",
          message: "Cliente atualizado com sucesso.",
          type: "warning",
          duration: 5000,
          bg: "#0d6efd",
        });
    } else {
      showAlert({
          title: "Erro!",
          message: "Erro ao atualizar cliente.",
          type: "warning",
          duration: 5000,
          bg: "#ff0000",
        });
    }
  };
  return (
    <Form onSubmit={handleSubmit}>

      <Form.Group className="mb-3">
        <Form.Label>Função</Form.Label>
        <Form.Select name="role" value={form.role} onChange={handleChange}>
          <option value="admin">admin</option>
          <option value="cliente">cliente</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formAtivo">
        <Form.Check
          type="checkbox"
          label="Ativo"
          name="ativo"
          checked={form.ativo}
          onChange={handleChange}
        />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Salvar'}
        </Button>
      </div>
    </Form>
  );
};

export default ClienteFormComp;
