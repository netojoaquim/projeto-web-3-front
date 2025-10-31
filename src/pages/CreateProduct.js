import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../context/AlertContext";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    estoque: 0,
    categoriaId: "",
    ativo: true,
  });

  const [file, setFile] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const { showAlert } = useAlert();


  const PRODUCT_CREATE_ENDPOINT = "/produto";
  const IMAGE_UPLOAD_ENDPOINT = "/produto/upload";
  const CATEGORY_ENDPOINT = "/categoria";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get(CATEGORY_ENDPOINT);
        setCategories(response.data.data || response.data);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
        setError("Não foi possível carregar as categorias.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const formatCurrency = (value) => {
    let v = value.replace(/\D/g, "");
    v = (v / 100).toFixed(2);
    v = v.replace(".", ",");
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    return v;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    let newValue = value;

    if (name === "preco") {
      newValue = formatCurrency(value);
    } else if (name === "estoque") {
      newValue = parseInt(value, 10);
      if (isNaN(newValue) || newValue < 0) {
        newValue = 0;
      }
    }
    if (name === "ativo") {
      newValue = value === "true";
    }

    setFormData({ ...formData, [name]: newValue });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadedFilename("");
  };

  const parsePrice = (priceString) => {
    if (!priceString) return 0;
    let cleanedPrice = priceString.replace(/\./g, "");
    cleanedPrice = cleanedPrice.replace(",", ".");
    return parseFloat(cleanedPrice);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let finalFilename = uploadedFilename;
      if (file) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        const uploadResponse = await api.post(
          IMAGE_UPLOAD_ENDPOINT,
          uploadFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        finalFilename = uploadResponse.data.filename;
        setUploadedFilename(finalFilename);
      }

      const productData = {
        ...formData,
        imagem: finalFilename || null,
        preco: parsePrice(formData.preco),
        estoque: parseInt(formData.estoque, 10),
        categoriaId: parseInt(formData.categoriaId, 10),
      };
      if (!productData.categoriaId) {
        setError("Por favor, selecione uma categoria.");
        setLoading(false);
        return;
      }

      await api.post(PRODUCT_CREATE_ENDPOINT, productData);
      showAlert({
        title: "Sucesso",
        message: "Produto criado com sucesso!",
        type: "success",
        duration: 5000,
        bg: "#0d6efd",
      });

      setSuccess("Produto criado com sucesso!");
      setLoading(false);

      setTimeout(() => navigate("/produto"), 2000);
    } catch (err) {
      console.error("Erro ao criar produto:", err);
      setError(
        err.response?.data?.message || "Erro desconhecido ao criar produto."
      );
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Cadastrar Novo Produto</h2>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleCreateProduct}>
        <Form.Group className="mb-3">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descrição</Form.Label>
          <Form.Control
            as="textarea"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Preço (R$)</Form.Label>
          <Form.Control
            type="text"
            name="preco"
            value={formData.preco}
            onChange={handleChange}
            placeholder="0,00"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Estoque</Form.Label>
          <Form.Control
            type="number"
            name="estoque"
            value={formData.estoque}
            onChange={handleChange}
            min="0"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Categoria</Form.Label>
          <Form.Select
            name="categoriaId"
            value={formData.categoriaId}
            onChange={handleChange}
            required
            disabled={loadingCategories}
          >
            <option value="">
              {loadingCategories
                ? "Carregando categorias..."
                : "Selecione uma categoria"}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.descricao}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Produto Ativo?</Form.Label>
          <Form.Select
            name="ativo"
            value={formData.ativo.toString()}
            onChange={handleChange}
            required
          >
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Imagem do Produto</Form.Label>
          <Form.Control
            type="file"
            accept=".jpg,.jpeg,.png,.gif"
            onChange={handleFileChange}
          />
          {uploadedFilename && (
            <Form.Text className="text-success">
              Imagem salva: {uploadedFilename}
            </Form.Text>
          )}
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
            className="w-100 mt-3"
          disabled={loading || loadingCategories || !formData.categoriaId}
        >
          {loading ? "Salvando..." : "Cadastrar Produto"}
        </Button>
      </Form>
    </Container>
  );
};

export default CreateProduct;
