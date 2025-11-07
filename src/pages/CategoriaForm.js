import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Container, ListGroup, Modal, Spinner,InputGroup, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import CategoriaFormComp from '../components/CategoriaFormComp';
import { useAlert } from '../context/AlertContext';

const Categoria = () => {
  const { fetchCategorias, deleteCategoria } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [filteredCategoria, setFilteredCategoria] = useState([]);
  const { showAlert } = useAlert();


  const loadCategorias = useCallback(async () => {
    setLoading(true);
    setMessage('');
    setError(false);

    try {
      const result = await fetchCategorias();
      if (result.success && result.data) {
        setCategorias(result.data);
        setFilteredCategoria(result.data);
      } else {
        setCategorias([]);
        setFilteredCategoria([]);
        setError(true);
        setMessage(result.message || 'Erro ao carregar categorias.');
      }
    } catch (err) {
      setCategorias([]);
      setCategorias([]);
      setError(true);
      setMessage('Erro ao carregar categorias.');
    }

    setLoading(false);
  }, [fetchCategorias]);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = categorias.filter((c) =>
      c.descricao.toLowerCase().includes(lowerSearch)
    );
    setFilteredCategoria(filtered);
  }, [search,categorias]);

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  const handleAddClick = () => {
    setEditingCategoria(null);
    setShowModal(true);
  };
  const handleEditClick = (categoria) => {
    setEditingCategoria(categoria);
    setShowModal(true);
  };
  const handleModalClose = () => {
    setShowModal(false);
    setEditingCategoria(null);
  };

  const handleDeleteConfirmation = (categoria) => {
    setCategoriaToDelete(categoria);
    setShowDeleteModal(true);
  };
  const handleDeleteClose = () => {
    setShowDeleteModal(false);
    setCategoriaToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!categoriaToDelete) return;
    setShowDeleteModal(false);
    setLoading(true);
    setMessage('');
    setError(false);

    const result = await deleteCategoria(categoriaToDelete.id);
    if (result.success) {
      await loadCategorias();
      showAlert({
        title: "Aviso!",
        message: "Categoria excluída com sucesso.",
        type: "warning",
        duration: 5000,
        bg: "#0d6efd",
      });
    } else {
      setError(true);
      showAlert({
        title: "Aviso!",
        message: "Erro ao excluir categoria.",
        type: "warning",
        duration: 5000,
        bg: "#ff0000",
      });
      setLoading(false);
    }
    setCategoriaToDelete(null);
  };

  // Estado de carregamento
  if (loading)
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando categorias...</p>
      </Container>
    );

  return (
    <Container
      style={{ maxWidth: "900px" }}
      className="mt-5 mb-5 p-4 border rounded shadow-sm"
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">
          <i class="bi bi-list-ol me-2"></i>Categorias
        </h2>
        <Button variant="primary" className="w-50" onClick={handleAddClick}>
          <i className="bi bi-plus-circle me-2"></i> Incluir Categoria
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

      {categorias.length === 0 ? (
        <Alert variant="info" className="text-center">
          Nenhuma categoria cadastrada. Use o botão acima para adicionar uma!
        </Alert>
      ) : (
        <ListGroup variant="flush">
          {filteredCategoria.map((cat) => (
            <ListGroup.Item
              key={cat.id}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                {cat.descricao && <p className="mb-0">{cat.descricao}</p>}
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleEditClick(cat)}
                >
                  <i className="bi bi-pencil-square"></i> Alterar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteConfirmation(cat)}
                >
                  <i className="bi bi-trash"></i> Excluir
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* adicionar/editar */}
      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategoria ? "Editar Categoria" : "Adicionar Nova Categoria"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CategoriaFormComp
            categoriaData={editingCategoria}
            onSuccess={loadCategorias}
            onCancel={handleModalClose}
          />
        </Modal.Body>
      </Modal>

      {/* exclusão */}
      <Modal show={showDeleteModal} onHide={handleDeleteClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            Confirmação de Exclusão
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir a categoria:{" "}
          <b>{categoriaToDelete?.descricao}</b>? Esta ação não pode ser
          desfeita.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            <i className="bi bi-trash me-2"></i> Confirmar Exclusão
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Categoria;
