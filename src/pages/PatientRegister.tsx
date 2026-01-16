import { ArrowBack } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PatientInfo from "../components/patient/PatientInfo";
import { db } from "../services/firebaseconfig";
import { useAuth } from "../contexts/AuthContext";
import { createTenantService } from "../services/tenantService";
import "../styles/PatientRegister.scss";

const PatientRegister: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Estado do formulário do paciente
  const [patientData, setPatientData] = useState({
    // Dados pessoais
    name: "",
    cpf: "",
    rg: "",
    gender: "",
    birthDate: "",
    address: "",
    number: "",
    complement: "",
    cep: "",
    city: "",
    state: "",
    email: "",
    phone1: "",
    phone2: "",
    appointmentDate: "",

    // Valores padrão para listagem
    hasLeftInsole: false,
    hasRightInsole: false,
    planFrontal: false,
    planPosterior: false,
    planSagital: false,
    productionStatus: "Pendente",

    // URL da foto (usando a URL padrão fornecida)
    photoUrl:
      "https://redthread.uoregon.edu/files/large/affd16fd5264cab9197da4cd1a996f820e601ee4.jpg",
  });

  // Verificar se estamos editando um paciente existente
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchPatientData(id);
    }
  }, [id]);

  // Buscar dados do paciente se estiver editando
  const fetchPatientData = async (patientId: string) => {
    setLoading(true);
    try {
      if (!tenantId) {
        setAlert({
          open: true,
          message: "Tenant ID não encontrado. Faça login novamente.",
          severity: "error",
        });
        navigate("/patient-list");
        return;
      }

      const tenantService = createTenantService(tenantId);
      const patientData = await tenantService.getPatient(patientId);
      
      if (patientData) {
        // Converter Timestamp para string de data (se existir)
        let birthDateStr = "";
        if (patientData.birthDate) {
          const birthDate =
            patientData.birthDate instanceof Timestamp
              ? patientData.birthDate.toDate()
              : new Date(patientData.birthDate);

          birthDateStr = birthDate.toISOString().split("T")[0]; // Formato YYYY-MM-DD
        }

        // Preencher o formulário com os dados existentes
        setPatientData({
          ...patientData,
          birthDate: birthDateStr,
        });
      } else {
        setAlert({
          open: true,
          message: "Paciente não encontrado!",
          severity: "error",
        });
        navigate("/patient-list");
      }
    } catch (error) {
      console.error("Erro ao buscar dados do paciente:", error);
      setAlert({
        open: true,
        message: "Erro ao carregar dados do paciente",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler para atualizar o estado do formulário
  const handleInputChange = (field: string, value: any) => {
    setPatientData({
      ...patientData,
      [field]: value,
    });
  };

  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false,
    });
  };

  // Finalização do cadastro
  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!tenantId) {
        setAlert({
          open: true,
          message: "Tenant ID não encontrado. Faça login novamente.",
          severity: "error",
        });
        return;
      }

      const tenantService = createTenantService(tenantId);

      // Preparar dados para salvar
      const dataToSave: any = {
        ...patientData,
        // Converter string de data para Timestamp se existir
        birthDate: patientData.birthDate
          ? Timestamp.fromDate(new Date(patientData.birthDate))
          : null,
      };

      if (isEditing) {
        // Atualizar paciente existente
        await tenantService.updatePatient(id!, dataToSave);
        setAlert({
          open: true,
          message: "Paciente atualizado com sucesso!",
          severity: "success",
        });
      } else {
        // Adicionar novo paciente
        await tenantService.addPatient(dataToSave);
        setAlert({
          open: true,
          message: "Paciente cadastrado com sucesso!",
          severity: "success",
        });
      }

      // Aguardar um pouco para mostrar a mensagem antes de redirecionar
      setTimeout(() => {
        navigate("/patient-list");
      }, 1500);
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
      setAlert({
        open: true,
        message: `Erro ao ${
          isEditing ? "atualizar" : "cadastrar"
        } paciente. Tente novamente.`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-register-page">
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

      <Container maxWidth={false} className="patient-register-container">
        <Paper elevation={3} className="patient-register-paper">
          <Box sx={{ mb: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBack />} 
              onClick={() => navigate("/patient-list")}
            >
              Voltar para Lista
            </Button>
            <Typography variant="h5" sx={{ mt: 2 }}>
              {isEditing ? "Editar Paciente" : "Novo Paciente"}
            </Typography>
          </Box>

          <Box className="patient-register-content">
            <PatientInfo patientData={patientData} onChange={handleInputChange} />
          </Box>

          <Box className="patient-register-buttons">
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              className="submit-button"
              disabled={loading}
            >
              {loading
                ? isEditing
                  ? "Atualizando..."
                  : "Salvando..."
                : isEditing
                ? "Atualizar Cadastro"
                : "Salvar Cadastro"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default PatientRegister;
