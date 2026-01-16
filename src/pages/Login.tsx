import { FavoriteBorder, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebaseconfig";
import "../styles/Login.scss";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "success";
  }>({
    open: false,
    message: "",
    severity: "error",
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "E-mail é obrigatório";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "E-mail inválido";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "A senha deve ter no mínimo 6 caracteres";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setLoading(true);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Login com sucesso:", email);
        
        // Buscar dados do usuário no Firestore para obter o role e tenantId
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const tenantId = userData.tenantId || userCredential.user.uid;
          localStorage.setItem('userRole', userData.role || 'user');
          localStorage.setItem('userId', userCredential.user.uid);
          localStorage.setItem('tenantId', tenantId);
        } else {
          // Se não encontrar dados no Firestore, usar UID como tenantId
          localStorage.setItem('userRole', 'user');
          localStorage.setItem('userId', userCredential.user.uid);
          localStorage.setItem('tenantId', userCredential.user.uid);
        }
        
        navigate("/patient-list");
      } catch (error: any) {
        console.error("Erro ao fazer login:", error);

        let errorMessage = "Falha ao fazer login. Por favor, tente novamente.";
        if (
          error.code === "auth/user-not-found" ||
          error.code === "auth/wrong-password"
        ) {
          errorMessage = "E-mail ou senha incorretos.";
        } else if (error.code === "auth/too-many-requests") {
          errorMessage =
            "Muitas tentativas de login. Tente novamente mais tarde.";
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

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      // Criar usuário admin no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        "admin@admin.com",
        "123456"
      );

      // Adicionar o usuário à coleção 'users' no Firestore com role admin
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: "Admin",
        email: "admin@admin.com",
        createdAt: new Date(),
        updatedAt: new Date(),
        role: "admin",
        tenantId: userCredential.user.uid, // Admin tem seu próprio tenant
      });

      console.log("Conta admin criada com sucesso");

      setAlert({
        open: true,
        message: "Conta admin criada com sucesso!",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Erro ao criar conta admin:", error);

      let errorMessage = "Falha ao criar conta admin.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "A conta admin já existe.";
      }

      setAlert({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" className="login-container" maxWidth={false}>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>

      <Paper elevation={0} className="login-paper">
        <Box className="login-header">
          <Typography variant="h5">Posturo Science</Typography>
        </Box>

        <Box className="login-form-container">
          <Box component="form" onSubmit={handleLogin} className="login-form">
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
                error={!!errors.email}
                helperText={errors.email}
                placeholder="exemplo@email.com.br"
                variant="outlined"
                className="login-input"
                disabled={loading}
              />
            </Box>

            <Box className="form-row">
              <Typography className="form-label">Senha</Typography>
              <TextField
                fullWidth
                name="password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                placeholder="Digite sua senha"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        className="visibility-icon"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                className="login-input"
                disabled={loading}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  name="rememberMe"
                  color="primary"
                  icon={<FavoriteBorder className="heart-icon" />}
                />
              }
              label="Lembrar-me"
              className="remember-me"
              disabled={loading}
            />

            <Box className="login-actions">
              <Button
                type="submit"
                variant="contained"
                className="login-button"
                disableElevation
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <Typography variant="body2" className="forgot-password">
                <Link to="/forgot-password">Esqueceu sua senha?</Link>
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box className="login-footer">
          <Typography variant="body2">Desenvolvido por Borderless</Typography>
          <Button
            onClick={handleCreateAdmin}
            variant="outlined"
            size="small"
            disabled={loading}
            sx={{ marginTop: 1 }}
          >
            Criar Conta Admin
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
