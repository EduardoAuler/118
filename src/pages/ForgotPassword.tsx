import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../services/firebaseconfig";
import "../styles/ForgotPassword.scss";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success"
  );

  const validateEmail = () => {
    if (!email) {
      setError("E-mail é obrigatório");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("E-mail inválido");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setAlertSeverity("success");
      setAlertMessage(
        "E-mail de redefinição enviado! Verifique sua caixa de entrada."
      );
      setAlertOpen(true);
    } catch (error: any) {
      console.error("Erro ao enviar email de redefinição:", error);
      setSuccess(false);

      let errorMessage =
        "Falha ao enviar e-mail de redefinição. Por favor, tente novamente.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "Não existe conta com este e-mail.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "E-mail inválido.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Muitas tentativas. Por favor, tente mais tarde.";
      }

      setAlertSeverity("error");
      setAlertMessage(errorMessage);
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  return (
    <Container className="forgot-password-container" maxWidth={false}>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseAlert} severity={alertSeverity}>
          {alertMessage}
        </Alert>
      </Snackbar>

      <Paper elevation={0} className="forgot-password-paper">
        <Box className="forgot-password-header">
          <Typography variant="h5">Posturo Science</Typography>
          <Typography variant="subtitle1">Esqueci minha senha</Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          className="forgot-password-form"
        >
          {success ? (
            <Box className="success-message">
              <Typography variant="h6" gutterBottom>
                E-mail enviado!
              </Typography>
              <Typography variant="body1" paragraph>
                Enviamos um link para redefinição de senha para o seu e-mail.
                Por favor, verifique sua caixa de entrada e siga as instruções.
              </Typography>
              <Typography variant="body2" paragraph>
                Não recebeu o e-mail? Verifique sua pasta de spam ou tente
                novamente.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => setSuccess(false)}
                className="try-again-button"
              >
                Tentar novamente
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="body1" className="form-description">
                Digite seu e-mail para receber um link de redefinição de senha
              </Typography>

              <Box className="form-row">
                <Typography className="form-label">E-Mail</Typography>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!error}
                  helperText={error}
                  placeholder="exemplo@email.com.br"
                  variant="outlined"
                  className="forgot-password-input"
                  disabled={loading}
                />
              </Box>

              <Box className="form-actions">
                <Button
                  type="submit"
                  variant="contained"
                  className="submit-button"
                  fullWidth
                  disableElevation
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar link de redefinição"}
                </Button>
              </Box>
            </>
          )}

          <Box className="login-link">
            <Typography variant="body2">
              Lembrou da senha? <Link to="/login">Voltar para login</Link>
            </Typography>
          </Box>
        </Box>

        <Box className="forgot-password-footer">
          <Typography variant="body2">Desenvolvido por Borderless</Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
