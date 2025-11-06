import React, { useState } from "react";
import { Container, Form, Button, Spinner, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const { showAlert } = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setShowErrors(true);
      showAlert({
        title: "Erro",
        message: "Informe o email",
        type: "error",
        duration: 5000,
        bg: "#ff0000",
      });
      return;
    }

    setIsLoading(true);
    setShowErrors(false);

    const result = await forgotPassword(email);

    showAlert({
      title: result.success ? "Sucesso" : "Erro",
      message: result.message,
      type: result.success ? "success" : "error",
      duration: 5000,
      bg: result.success ? "#0d6efd" : "#ff0000",
    });

    // Só redireciona se for sucesso
    if (result.success) {
      navigate("/reset", { state: { email } });
    }

    setIsLoading(false);
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <Card className="shadow p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center mb-4">Recuperar Senha</h3>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="email">
            <h6>Digite o email que deseja recuperar a conta:</h6>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              required
              placeholder="Digite o email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
              isInvalid={showErrors && !email}
              autoComplete="email"
            />
          </Form.Group>

          <div className="d-grid">
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Enviando...
                </>
              ) : (
                "Enviar"
              )}
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}
