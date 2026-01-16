import { ArrowBack, ArrowForward } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebaseconfig";
import "../styles/Register.scss";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  const steps = ["Informações Pessoais", "Credenciais"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateStep = (step: number) => {
    const newErrors = { ...errors };
    let isValid = true;

    if (step === 0) {
      // Validação do primeiro passo (nome)
      if (!formData.name.trim()) {
        newErrors.name = "Nome é obrigatório";
        isValid = false;
      } else if (formData.name.length < 3) {
        newErrors.name = "Nome deve ter pelo menos 3 caracteres";
        isValid = false;
      } else {
        newErrors.name = "";
      }
    } else if (step === 1) {
      // Validação do segundo passo (email e senhas)
      if (!formData.email) {
        newErrors.email = "E-mail é obrigatório";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "E-mail inválido";
        isValid = false;
      } else {
        newErrors.email = "";
      }

      if (!formData.password) {
        newErrors.password = "Senha é obrigatória";
        isValid = false;
      } else if (formData.password.length < 6) {
        newErrors.password = "A senha deve ter no mínimo 6 caracteres";
        isValid = false;
      } else {
        newErrors.password = "";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "As senhas não coincidem";
        isValid = false;
      } else {
        newErrors.confirmPassword = "";
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateStep(activeStep)) {
      setLoading(true);
      try {
        // Criar usuário no Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Adicionar o nome de exibição ao usuário
        await updateProfile(userCredential.user, {
          displayName: formData.name,
        });

        // Adicionar o usuário à coleção 'users' no Firestore com o mesmo ID
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: formData.name,
          email: formData.email,
          createdAt: new Date(),
          updatedAt: new Date(),
          role: "user",
        });

        console.log("Usuário registrado com sucesso:", userCredential.user);

        // Redirecionar para o login após o registro
        setAlert({
          open: true,
          message: "Conta criada com sucesso! Faça login para continuar.",
          severity: "success",
        });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error: any) {
        console.error("Erro ao registrar:", error);

        let errorMessage =
          "Falha ao criar sua conta. Por favor, tente novamente.";
        if (error.code === "auth/email-already-in-use") {
          errorMessage =
            "Este email já está em uso. Por favor, utilize outro email.";
        } else if (error.code === "auth/weak-password") {
          errorMessage =
            "Senha muito fraca. Por favor, crie uma senha mais forte.";
        }

        setAlert({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Container component="main" className="register-container" maxWidth={false}>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity === "success" ? "success" : "error"}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      <Paper elevation={0} className="register-paper">
        <Box className="register-header">
          <Typography variant="h5">Posturo Science</Typography>
        </Box>

        <Box className="register-form-container">
          <Stepper activeStep={activeStep} className="register-stepper">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box
            component="form"
            className="register-form"
            onSubmit={
              activeStep === steps.length - 1 ? handleSubmit : undefined
            }
          >
            {activeStep === 0 ? (
              <Box className="form-step">
                <Box className="form-row">
                  <Typography className="form-label">Nome completo</Typography>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    autoComplete="name"
                    autoFocus
                    value={formData.name}
                    onChange={handleInputChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    placeholder="Seu nome completo"
                    variant="outlined"
                    className="register-input"
                    disabled={loading}
                  />
                </Box>
              </Box>
            ) : (
              <Box className="form-step">
                <Box className="form-row">
                  <Typography className="form-label">E-Mail</Typography>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    placeholder="exemplo@email.com.br"
                    variant="outlined"
                    className="register-input"
                    disabled={loading}
                  />
                </Box>

                <Box className="form-row">
                  <Typography className="form-label">Senha</Typography>
                  <TextField
                    fullWidth
                    name="password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    placeholder="Digite sua senha"
                    variant="outlined"
                    className="register-input"
                    disabled={loading}
                  />
                </Box>

                <Box className="form-row">
                  <Typography className="form-label">
                    Confirme a senha
                  </Typography>
                  <TextField
                    fullWidth
                    name="confirmPassword"
                    type="password"
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    placeholder="Digite sua senha novamente"
                    variant="outlined"
                    className="register-input"
                    disabled={loading}
                  />
                </Box>
              </Box>
            )}

            <Box className="register-button-group">
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  className="register-submit-button"
                  disableElevation
                  disabled={loading}
                >
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                  variant="contained"
                  className="register-next-button"
                  disableElevation
                  disabled={loading}
                >
                  Próximo
                </Button>
              )}

              {activeStep > 0 && (
                <Button
                  onClick={handleBack}
                  startIcon={<ArrowBack />}
                  className="register-back-button"
                  disabled={loading}
                >
                  Voltar
                </Button>
              )}
            </Box>

            <Box className="register-login-link">
              <Typography variant="body2">
                Já possui uma conta? <Link to="/login">Faça login</Link>
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box className="register-footer">
          <Typography variant="body2">Desenvolvido por Borderless</Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
