import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert, Image, Row, Col } from 'react-bootstrap';
import api from '../api/api';

const ProdutoFormComp = ({ produtoData, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: produtoData?.nome || '',
    descricao: produtoData?.descricao || '',
    preco: produtoData?.preco ? produtoData.preco.toString().replace('.', ',') : '',
    estoque: produtoData?.estoque || 0,
    categoriaId: produtoData?.categoria?.id || '',
    ativo: produtoData?.ativo ?? true,
  });

  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState(produtoData?.imagem || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categoria');
        setCategories(res.data.data || res.data);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
        setError('Não foi possível carregar as categorias.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const parsePrice = (priceString) => {
    if (!priceString) return 0;
    let cleaned = priceString.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned);
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'preco') {
      value = value.replace(/\D/g, '');
      value = (value / 100).toFixed(2).replace('.', ',');
    } else if (name === 'estoque') {
      value = parseInt(value, 10);
      if (isNaN(value) || value < 0) value = 0;
    } else if (name === 'ativo') {
      value = value === 'true';
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalFilename = uploadedFilename;

      if (file) {
        const uploadForm = new FormData();
        uploadForm.append('file', file);

        const uploadRes = await api.post('/produto/upload', uploadForm, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        finalFilename = uploadRes.data.filename;
        setUploadedFilename(finalFilename);
      }

      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco: parsePrice(formData.preco),
        estoque: parseInt(formData.estoque, 10),
        categoria: { id: parseInt(formData.categoriaId, 10) }, // ← objeto, não só o id
        ativo: formData.ativo,
        imagem: finalFilename,
      };

      if (produtoData?.id) {
        await api.patch(`/produto/${produtoData.id}`, payload);
      } else {
        await api.post('/produto', payload);
      }

      // Fecha o modal e recarrega a página somente após salvar
      if (onCancel) {
        onCancel();
        window.location.reload();
      }
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      setError(err.response?.data?.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Nome</Form.Label>
        <Form.Control name="nome" value={formData.nome} onChange={handleChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Descrição</Form.Label>
        <Form.Control as="textarea" rows={2} name="descricao" value={formData.descricao} onChange={handleChange} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Preço (R$)</Form.Label>
        <Form.Control type="text" name="preco" value={formData.preco} onChange={handleChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Estoque</Form.Label>
        <Form.Control type="number" name="estoque" value={formData.estoque} onChange={handleChange} min="0" required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Categoria</Form.Label>
        <Form.Select name="categoriaId" value={formData.categoriaId} onChange={handleChange} disabled={loadingCategories} required>
          <option value="">{loadingCategories ? 'Carregando...' : 'Selecione uma categoria'}</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.descricao}</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Produto Ativo?</Form.Label>
        <Form.Select name="ativo" value={formData.ativo.toString()} onChange={handleChange} required>
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Imagem do Produto</Form.Label>
        <Form.Control type="file" accept=".jpg,.jpeg,.png,.gif" onChange={handleFileChange} />
      </Form.Group>

      {/* Exibição de imagens */}
      <Row className="mb-3">
        <Col>
          <Form.Label>Imagem Atual:</Form.Label>
          <Image
            src={`${process.env.REACT_APP_BASE_URL}/uploads/${produtoData.imagem}`}
            fluid
            rounded
          />
        </Col>

        {previewImage && (
          <Col>
            <Form.Label>Nova Imagem:</Form.Label>
            <Image src={previewImage} fluid rounded />
          </Col>
        )}
      </Row>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Salvar'}
        </Button>
      </div>
    </Form>
  );
};

export default ProdutoFormComp;
