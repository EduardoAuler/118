import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  Search,
  FilterList,
  PersonAdd,
  Block,
  CheckCircle,
} from "@mui/icons-material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDocs, collection, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseconfig";
import "../styles/Users.scss";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  subscriptionPlan: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Estados para modal de criação/edição
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    subscriptionPlan: "Básico",
  });

  // Estados para alertas
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const subscriptionPlans = ["Básico", "Profissional", "Clínica"];

  // Carregar usuários
  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as User[];
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      showAlert("Erro ao carregar usuários", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtrar usuários
  useEffect(() => {
    let filtered = users;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Filtro por plano
    if (planFilter !== "all") {
      filtered = filtered.filter((user) => user.subscriptionPlan === planFilter);
    }

    // Filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => 
        statusFilter === "active" ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, planFilter, statusFilter]);

  const showAlert = (message: string, severity: "success" | "error") => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        role: "user",
        subscriptionPlan: "Básico",
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "user",
      subscriptionPlan: "Básico",
    });
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email) {
      showAlert("Nome e email são obrigatórios", "error");
      return;
    }

    setLoading(true);
    try {
      if (editingUser) {
        // Atualizar usuário existente
        await updateDoc(doc(db, "users", editingUser.id), {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          subscriptionPlan: formData.subscriptionPlan,
          updatedAt: new Date(),
        });
        showAlert("Usuário atualizado com sucesso!", "success");
      } else {
        // Criar novo usuário
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          "123456"
        );

        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          subscriptionPlan: formData.subscriptionPlan,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        showAlert("Usuário criado com sucesso! Senha padrão: 123456", "success");
      }

      handleCloseModal();
      loadUsers();
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error);
      let errorMessage = "Erro ao salvar usuário";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email já está em uso";
      }
      showAlert(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isActive: !currentStatus,
        updatedAt: new Date(),
      });
      showAlert(
        `Usuário ${!currentStatus ? "ativado" : "desativado"} com sucesso!`,
        "success"
      );
      loadUsers();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      showAlert("Erro ao alterar status do usuário", "error");
    }
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Ativo" : "Desativado";
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "success" : "error";
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Tem certeza que deseja deletar este usuário?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        showAlert("Usuário deletado com sucesso!", "success");
        loadUsers();
      } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        showAlert("Erro ao deletar usuário", "error");
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <Box className="users-container">
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

      {/* Header */}
      <Box className="users-header">
        <Typography variant="h4" className="users-title">
          Gerenciar Usuários
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => handleOpenModal()}
          className="add-user-button"
        >
          Novo Usuário
        </Button>
      </Box>

      {/* Filtros */}
      <Card className="filters-card">
        <CardContent>
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              alignItems: 'center',
              '& > *': {
                flex: '1 1 200px',
                minWidth: '200px'
              }
            }}
          >
            <TextField
              fullWidth
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search />,
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Função</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Função"
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">Usuário</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Plano</InputLabel>
              <Select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                label="Plano"
              >
                <MenuItem value="all">Todos</MenuItem>
                {subscriptionPlans.map((plan) => (
                  <MenuItem key={plan} value={plan}>
                    {plan}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="inactive">Inativo</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '200px' }}>
              <Typography variant="body2" color="textSecondary">
                {filteredUsers.length} usuário(s) encontrado(s)
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabela de usuários */}
      <Card className="users-table-card">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Função</TableCell>
                <TableCell>Plano</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data de Criação</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {user.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role === "admin" ? "Admin" : "Usuário"}
                      color={user.role === "admin" ? "primary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.subscriptionPlan}
                      color={
                        user.subscriptionPlan === "Clínica"
                          ? "primary"
                          : user.subscriptionPlan === "Profissional"
                          ? "secondary"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(user.isActive)}
                      color={getStatusColor(user.isActive) as "success" | "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleOpenModal(user)}
                      color="primary"
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                      color={user.isActive ? "warning" : "success"}
                      size="small"
                      title={user.isActive ? "Desativar usuário" : "Ativar usuário"}
                    >
                      {user.isActive ? <Block /> : <CheckCircle />}
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteUser(user.id)}
                      color="error"
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal de criação/edição */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? "Editar Usuário" : "Novo Usuário"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
              disabled={!!editingUser}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Função</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                label="Função"
              >
                <MenuItem value="user">Usuário</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Plano de Assinatura</InputLabel>
              <Select
                value={formData.subscriptionPlan}
                onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                label="Plano de Assinatura"
              >
                {subscriptionPlans.map((plan) => (
                  <MenuItem key={plan} value={plan}>
                    {plan}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {!editingUser && (
              <Alert severity="info" sx={{ mt: 2 }}>
                A senha padrão será: 123456
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSaveUser} variant="contained" disabled={loading}>
            {loading ? "Salvando..." : editingUser ? "Atualizar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
