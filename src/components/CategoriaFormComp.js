import { useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const CategoriaFormComp = ({ categoriaData, onSuccess, onCancel }) => {
  const { saveCategoria } = useAuth(); // função que chama o backend
  const [form, setForm] = useState({
    descricao: categoriaData?.descricao || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await saveCategoria(form, categoriaData?.id);
    setLoading(false);

    if (result.success) {
      onSuccess();
      onCancel();
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
          rows={3}
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
