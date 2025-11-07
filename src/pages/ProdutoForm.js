import React, { useState, useEffect, useCallback } from 'react';
import { Container, ListGroup, Button, Spinner, Alert, Modal, InputGroup, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import ProdutoFormComp from '../components/ProdutoFomComp';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';

const ProdutoForm = () => {
  const navigate = useNavigate();
  const { fetchAllProducts, deleteProduct } = useAuth();

  const [produtos, setProdutos] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const { showAlert } = useAlert();

  // 🔹 Carrega produtos do backend
  const loadProdutos = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      const result = await fetchAllProducts();
      if (result.success && result.data) {
        setProdutos(result.data);
        setFilteredProdutos(result.data);
      } else {
        setProdutos([]);
        setFilteredProdutos([]);
        setError(true);
        setMessage(result.message || 'Erro ao carregar produtos.');
      }
    } catch (err) {
      console.error(err);
      setError(true);
      setMessage('Erro ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  }, [fetchAllProducts]);

  // 🔹 Executa uma vez no carregamento
  useEffect(() => {
    loadProdutos();
  }, [loadProdutos]);

  // 🔹 Filtro de busca
  useEffect(() => {
    if (!search.trim()) {
      setFilteredProdutos(produtos);
      return;
    }

    const lowerSearch = search.toLowerCase();
    const filtered = produtos.filter((p) =>
      p.nome?.toLowerCase().includes(lowerSearch)
    );
    setFilteredProdutos(filtered);
  }, [search, produtos]);

  // 🔹 Funções auxiliares
  const handleAddClick = () => navigate('/produto/novo');
  const handleEditClick = (produto) => {
    setEditingProduct(produto);
    setShowModal(true);
  };
  const handleDeleteConfirmation = (produto) => {
    setProductToDelete(produto);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setShowDeleteModal(false);
    setLoading(true);

    const result = await deleteProduct(productToDelete.id);
    if (result.success) {
      await loadProdutos();
      showAlert({
          title: "Aviso!",
          message: "Produto excluído com sucesso.",
          type: "warning",
          duration: 5000,
          bg: "#0d6efd",
        });
    }

    else {
      setError(true);
      showAlert({
          title: "Erro!",
          message: "Erro ao excluir o produto. Pode está em carrinhos ou pedidos.",
          type: "warning",
          duration: 5000,
          bg: "#ff0000",
        });
    }

    setProductToDelete(null);
    setLoading(false);
  };

  return (
    <Container
      style={{ maxWidth: "900px" }}
      className="mt-5 mb-5 p-4 border rounded shadow-sm"
    >
      <div className="d-flex justify-content-between align-items-center mb-4 ">
        <h2 className="text-primary">
          <i className="bi bi-bag-fill me-2"></i>Itens
        </h2>
        <Button variant="primary" onClick={handleAddClick}>
          <i className="bi bi-plus-circle me-2"></i> Incluir produto
        </Button>
      </div>
      <InputGroup className="w-md-50 mb-4 ms-auto">
        <Form.Control
          type="text"
          placeholder="Pesquisar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="primary" onClick={() => setSearch("")}>
          <i className="bi bi-x-circle"></i>
        </Button>
      </InputGroup>

      {message && (
        <Alert
          variant={error ? "danger" : "success"}
          onClose={() => setMessage("")}
          dismissible
        >
          {message}
        </Alert>
      )}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : filteredProdutos.length === 0 ? (
        <Alert variant="info" className="text-center">
          Nenhum produto encontrado.
        </Alert>
      ) : (
        <ListGroup>
          {filteredProdutos.map((prod) => (
            <ListGroup.Item
              key={prod.id}
              className="d-flex justify-content-between align-items-start align-items-md-center gap-3 p-3"
            >
              <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 w-100">
                <img
                  src={`${process.env.REACT_APP_BASE_URL}/uploads/${prod.imagem}`}
                  alt={prod.nome}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 5,
                  }}
                />
                <div>
                  <strong>{prod.nome}</strong>
                  <div className="text-muted small">
                    {prod.categoria?.descricao} — R${" "}
                    {parseFloat(prod.preco).toFixed(2)} — Estoque:{" "}
                    {prod.estoque}
                  </div>
                  <span className={prod.ativo ? "text-success" : "text-danger"}>
                    {prod.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
              <div className="d-flex gap-2 mt-2 mt-md-0 flex-shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleEditClick(prod)}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteConfirmation(prod)}
                >
                  Excluir
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Modal editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? "Editar Produto" : "Adicionar Produto"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProdutoFormComp
            produtoData={editingProduct}
            onSuccess={loadProdutos}
            onCancel={() => setShowModal(false)}
          />
        </Modal.Body>
      </Modal>

      {/* Modal exclusão */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            Confirmação de Exclusão
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja remover o produto:{" "}
          <b>{productToDelete?.nome}</b>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProdutoForm;
