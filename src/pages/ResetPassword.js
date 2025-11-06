import React, { useState, useRef } from "react";
import {Container,Form,Button,Spinner,Card,InputGroup,Row,Col,} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

const TOKEN_LENGTH = 6;

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();

  const email = location.state?.email || "";

  const [tokenDigits, setTokenDigits] = useState(Array(TOKEN_LENGTH).fill(""));

  const inputRefs = useRef([]);

  const [userNewPassword, setUserNewPassword] = useState("");
  const [userNewConfirmPassword, setUserNewConfirmPassword] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showAlert } = useAlert();
  const [showPassword, setShowPassword] = useState(false);

  const userCode = tokenDigits.join("");


  const handleTokenChange = (e, index) => {
    const { value } = e.target;

    //limita a 1 caracter
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 1);

    const newDigits = [...tokenDigits];
    newDigits[index] = numericValue;
    setTokenDigits(newDigits);

    //  mover o foco automaticamente
    if (numericValue && index < TOKEN_LENGTH - 1) {
      // move para o próximo campo ao digitar
      inputRefs.current[index + 1].focus();
    } else if (!numericValue && index > 0) {
      // move para o campo anterior ao apagar
      if (e.nativeEvent.inputType === "deleteContentBackward") {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      userCode.length !== TOKEN_LENGTH ||
      !userNewPassword ||
      !userNewConfirmPassword
    ) {
      setShowErrors(true);
      showAlert({
        title: "Erro",
        message: "Preencha corretamente os dados. O token deve ter 6 dígitos.",
        type: "error",
        duration: 5000,
        bg: "#ff0000",
      });
      return;
    }

    if (userNewPassword !== userNewConfirmPassword) {
      showAlert({
        title: "Erro",
        message: "As senhas não coincidem",
        type: "error",
        duration: 5000,
        bg: "#ff0000",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await resetPassword(email, userCode, userNewPassword);

      if (result.success) {
        setTimeout(() => navigate("/login"), 1500);
      }
      showAlert({
        title: result.success ? "Sucesso" : "Erro",
        message: result.message,
        type: "success",
        duration: 5000,
        bg: result.success ? "#0d6efd" : "#ff0000"
      });

    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      showAlert({
        title: "Erro",
        message: "Erro inesperado. Tente novamente.",
        type: "error",
        duration: 5000,
        bg: "#ff0000",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow p-4" style={{ maxWidth: "30em", width: "100%" }}>
        <h3 className="text-center mb-4">Redefinir Senha</h3>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="tokenGroup">
            <Form.Label>Código de Recuperação (6 dígitos)</Form.Label>
            <Row xs={6} className="g-2">
              {tokenDigits.map((digit, index) => (
                <Col key={index}>
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleTokenChange(e, index)}
                    onKeyDown={(e) => {
                      if (
                        !/[0-9]/.test(e.key) &&
                        e.key !== "Backspace" &&
                        e.key !== "Delete"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => e.preventDefault()}
                    required
                    isInvalid={showErrors && userCode.length !== TOKEN_LENGTH}
                    className="text-center fw-bold"
                    ref={(el) => (inputRefs.current[index] = el)}
                  />
                </Col>
              ))}
            </Row>
            {showErrors && userCode.length !== TOKEN_LENGTH && (
              <Form.Control.Feedback type="invalid" className="d-block">
                Por favor, insira o código completo de 6 dígitos.
              </Form.Control.Feedback>
            )}
          </Form.Group>


          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Nova senha</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                required
                placeholder="Digite a nova senha"
                value={userNewPassword}
                onChange={(e) => setUserNewPassword(e.target.value)}
                isInvalid={showErrors && !userNewPassword}
              />
              <Button
                variant="outline-primary"
                onClick={toggleShowPassword}
                type="button"
              >
                <i
                  className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}
                ></i>
              </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="confirmPassword">
            <Form.Label>Confirme a nova senha</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Repita sua senha"
                required
                value={userNewConfirmPassword}
                onChange={(e) => setUserNewConfirmPassword(e.target.value)}
                isInvalid={showErrors && !userNewConfirmPassword}
              />
              <Button
                variant="outline-primary"
                onClick={toggleShowPassword}
                type="button"
              >
                <i
                  className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}
                ></i>
              </Button>
            </InputGroup>
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
