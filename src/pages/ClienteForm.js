import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Container,
  ListGroup,
  Modal,
  Spinner,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import ClienteFormComp from '../components/ClienteFormComp';

const ClienteForm = () => {
  const { fetchClientes } = useAuth(); // precisa existir no seu contexto
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [search, setSearch] = useState('');

  // 🔹 Carregar clientes
  const loadClientes = useCallback(async () => {
    setLoading(true);
    setMessage('');
    setError(false);

    try {
      const result = await fetchClientes();
      if (result.success && result.data) {
        setClientes(result.data);
        setError(true);
        setFilteredClientes(result.data);
      } else {
        setClientes([]);
        setFilteredClientes([]);
        setMessage(result.message || 'Erro ao carregar clientes.');
      }
    } catch (err) {
      setClientes([]);
      setFilteredClientes([]);
      setError(true);
      setMessage('Erro ao carregar clientes.');
    }

    setLoading(false);
  }, [fetchClientes]);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  // 🔹 Filtro de pesquisa
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = clientes.filter((c) =>
      c.nome_completo.toLowerCase().includes(lowerSearch)
    );
    setFilteredClientes(filtered);
  }, [search, clientes]);

  // 🔹 Modal de editar cliente
  const handleEditClick = (cliente) => {
    setEditingCliente(cliente);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCliente(null);
  };

  // 🔹 Estado de carregamento
  if (loading)
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando clientes...</p>
      </Container>
    );

  return (
    <Container
      style={{ maxWidth: '900px' }}
      className="mt-5 mb-5 p-4 border rounded shadow-sm"
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary me-3"><i className="bi bi-people-fill me-2"></i>Usuários</h2>
      </div>
      <InputGroup className='w-md-50 mb-4 ms-auto'>
          <Form.Control
            type="text"
            placeholder="Pesquisar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="primary" onClick={() => setSearch('')}>
            <i className="bi bi-x-circle"></i>
          </Button>
        </InputGroup>

      {message && (
        <Alert
          variant={error ? 'danger' : 'success'}
          onClose={() => setMessage('')}
          dismissible
        >
          {message}
        </Alert>
      )}

      {filteredClientes.length === 0 ? (
        <Alert variant="info" className="text-center">
          Nenhum cliente encontrado.
        </Alert>
      ) : (
        <ListGroup variant="flush">
          {filteredClientes.map((cliente) => (
            <ListGroup.Item
              key={cliente.id}
              className="d-flex justify-content-between align-items-center"
            >
              <div className='w-75'>
                <p className="mb-0 fw-bold">{cliente.nome_completo}</p>
                <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                  {cliente.email}
                </p>
                <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                  Nível do usuário: <b>{cliente.role}</b> |{' '}
                  <span
                    className={cliente.ativo ? 'text-success' : 'text-danger'}
                  >
                    {cliente.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleEditClick(cliente)}
                >
                  <i className="bi bi-pencil-square"></i> Alterar
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* 🔹 Modal de edição */}
      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ClienteFormComp
            clienteData={editingCliente}
            onSuccess={loadClientes}
            onCancel={handleModalClose}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ClienteForm;
