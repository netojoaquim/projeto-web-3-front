import { useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

const CategoriaFormComp = ({ categoriaData, onSuccess, onCancel }) => {
  const { saveCategoria } = useAuth();
  const [form, setForm] = useState({
    descricao: categoriaData?.descricao || '',
  });
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await saveCategoria(form, categoriaData?.id);
    setLoading(false);

    if (result.success) {
      onSuccess();
      onCancel();
      showAlert({
        title: "Aviso!",
        message: "Categoria salva com sucesso.",
        type: "warning",
        duration: 5000,
        bg: "#0d6efd",
      });
    } else {
      alert(result.message || 'Erro ao salvar categoria');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Descrição</Form.Label>
        <Form.Control
          as="textarea"
          rows={1}
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
        />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Salvar'}
        </Button>
      </div>
    </Form>
  );
};

export default CategoriaFormComp;
