import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Button,
  ListGroup,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import AddressForm from "../components/EnderecoFormComp";
import { useAlert } from "../context/AlertContext";

const EnderecosCliente = () => {
  const { user, fetchClientData, deleteAddress } = useAuth();

  const [addresses, setAddresses] = useState(user?.enderecos || []);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const { showAlert } = useAlert();

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    setMessage("");
    setError(false);

    const result = await fetchClientData();
    if (result.success && result.data?.enderecos)
      setAddresses(result.data.enderecos);

    else {
      setAddresses([]);
      if (!result.success) {
        setError(true);
        setMessage(result.message || "Erro ao carregar endereços.");
      }
    }

    setLoading(false);
  }, [fetchClientData]);
  //eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user?.id) return;

    const loadAddressesOnce = async () => {
      setLoading(true);
      setMessage("");
      setError(false);

      try {
        // Busca apenas os endereços do usuário
        const result = await fetchClientData(user.id);
        if (result.success && result.data?.enderecos) {
          setAddresses(result.data.enderecos);
          
        } else {
          setAddresses([]);
          if (!result.success) {
            setError(true);
            setMessage(result.message || "Erro ao carregar endereços.");
          }
        }
      } catch (err) {
        setError(true);
        setMessage("Erro ao carregar endereços.");
      }

      setLoading(false);
    };

    loadAddressesOnce();
  }, [user?.id]);
  const handleAddClick = () => {
    setEditingAddress(null);
    setShowModal(true);
  };
  const handleEditClick = (address) => {
    setEditingAddress(address);
    setShowModal(true);
  };
  const handleModalClose = () => {
    setShowModal(false);
    setEditingAddress(null);
  };

  const handleDeleteConfirmation = (address) => {
    setAddressToDelete(address);
    setShowDeleteModal(true);
  };

  const handleDeleteClose = () => {
    setShowDeleteModal(false);
    setAddressToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    setShowDeleteModal(false);
    setLoading(true);
    setError(false);

    const result = await deleteAddress(addressToDelete.id);
    if (result.success) {
      await loadAddresses();
      showAlert({
        title: "Aviso!",
        message: "Endereço removido com sucesso.",
        type: "warning",
        duration: 5000,
        bg: "#0d6efd",
      });
    } else {
      setError(true);
      showAlert({
        title: "Erro!",
        message: "Erro ao remover o endereço.",
        type: "warning",
        duration: 5000,
        bg: "#ff0000",
      });
      setLoading(false);
    }

    setAddressToDelete(null);
  };

  if (loading)
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando seus endereços...</p>
      </Container>
    );

  return (
    <Container
      style={{ maxWidth: "800px" }}
      className="mt-5 mb-5 p-4 border rounded shadow-sm"
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Meus Endereços</h2>
        <Button variant="primary" onClick={handleAddClick}>
          <i className="bi bi-plus-circle me-2"></i> Incluir Endereço
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Alert variant="primary" className="text-center">
          Você ainda não tem nenhum endereço cadastrado. Use o botão acima para
          incluir o primeiro!
        </Alert>
      ) : (
        <ListGroup variant="flush">
          {addresses.map((addr) => (
            <ListGroup.Item
              key={addr.id}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <h5 className="mb-1 text-dark">
                  {addr.apelido || "Endereço"}{" "}
                  {addr.padrao && (
                    <span
                      className="text-success"
                      style={{ fontSize: "1.0rem" }}
                    >
                      — Endereço Padrão
                    </span>
                  )}
                </h5>
                <p className="mb-0">
                  {addr.rua}, {addr.numero} - {addr.bairro}
                </p>
                <p className="mb-0 text-muted" style={{ fontSize: "0.9rem" }}>
                  {addr.cidade} - {addr.estado}, CEP: {addr.cep}
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleEditClick(addr)}
                >
                  <i className="bi bi-pencil-square"></i> Alterar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteConfirmation(addr)}
                >
                  <i className="bi bi-trash"></i> Excluir
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAddress ? "Editar Endereço" : "Adicionar Novo Endereço"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddressForm
            addressData={editingAddress}
            onSuccess={loadAddresses}
            onCancel={handleModalClose}
          />
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleDeleteClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            Confirmação de Exclusão
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja remover o endereço:{" "}
          <b>{addressToDelete?.apelido || ""}</b>? Esta ação não pode ser
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

export default EnderecosCliente;
