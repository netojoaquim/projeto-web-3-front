import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import ProdutoFormComp from '../components/ProdutoFomComp';
import { useNavigate } from 'react-router-dom';

const ProdutoForm = () => {
  const navigate = useNavigate();
  const { fetchAllProducts, deleteProduct } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const loadProdutos = async () => {
    setLoading(true);
    const result = await fetchAllProducts();
    if (result.success) setProdutos(result.data);
    else { setError(true); setMessage(result.message); }
    setLoading(false);
  };

  useEffect(() => { loadProdutos(); }, []);

  // Alteração mínima: redireciona para /produto/novo
  const handleAddClick = () => {
    navigate('/produto/novo');
  };

  const handleEditClick = (produto) => { setEditingProduct(produto); setShowModal(true); };
  const handleDeleteConfirmation = (produto) => { setProductToDelete(produto); setShowDeleteModal(true); };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setShowDeleteModal(false);
    setLoading(true);
    const result = await deleteProduct(productToDelete.id);
    if (result.success) await loadProdutos();
    else { setError(true); setMessage(result.message); setLoading(false); }
    setProductToDelete(null);
  };

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Produtos</h2>
        <Button variant="primary" onClick={handleAddClick}>Novo Produto</Button>
      </div>

      {message && <Alert variant={error ? 'danger' : 'success'} onClose={() => setMessage('')} dismissible>{message}</Alert>}

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <ListGroup>
          {produtos.map(prod => (
            <ListGroup.Item key={prod.id} className="d-flex justify-content-between align-items-center">

              <div className="d-flex align-items-center gap-3">
                <img
                  src={`${process.env.REACT_APP_BASE_URL}/uploads/${prod.imagem}`}
                  alt={prod.nome}
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 5 }}
                />
                <strong>{prod.nome}</strong> — {prod.categoria?.descricao} — R$ {parseFloat(prod.preco).toFixed(2)}
              </div>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm" onClick={() => handleEditClick(prod)}>Editar</Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteConfirmation(prod)}>Excluir</Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Editar Produto' : 'Adicionar Produto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProdutoFormComp produtoData={editingProduct} onSuccess={loadProdutos} onCancel={() => setShowModal(false)} />
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Confirmação de Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja remover o produto: <b>{productToDelete?.nome}</b>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Excluir</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProdutoForm;
