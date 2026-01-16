import {
  Box,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";

interface PatientInfoProps {
  patientData: any;
  onChange: (field: string, value: any) => void;
}

const PatientInfo: React.FC<PatientInfoProps> = ({ patientData, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <Box className="form-section">
      <Typography variant="h6" className="form-section-title">
        PACIENTE
      </Typography>

      <Box className="form-row">
        <Box className="form-field half-width">
          <Typography className="field-label">Nome *</Typography>
          <TextField
            fullWidth
            name="name"
            value={patientData.name}
            onChange={handleChange}
            placeholder="Nome completo"
            variant="outlined"
            required
            size="small"
          />
        </Box>

        <Box className="form-field third-width">
          <Typography className="field-label">CPF *</Typography>
          <TextField
            fullWidth
            name="cpf"
            value={patientData.cpf}
            onChange={handleChange}
            placeholder="000.000.000-00"
            variant="outlined"
            required
            size="small"
          />
        </Box>

        <Box className="form-field third-width">
          <Typography className="field-label">RG</Typography>
          <TextField
            fullWidth
            name="rg"
            value={patientData.rg}
            onChange={handleChange}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box className="form-field third-width">
          <Typography className="field-label">Sexo *</Typography>
          <FormControl fullWidth size="small" variant="outlined">
            <Select
              name="gender"
              value={patientData.gender}
              onChange={handleSelectChange}
              displayEmpty
            >
              <MenuItem value="" disabled>
                <em>Selecione</em>
              </MenuItem>
              <MenuItem value="M">Masculino</MenuItem>
              <MenuItem value="F">Feminino</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box className="form-field third-width">
          <Typography className="field-label">Nascimento *</Typography>
          <TextField
            fullWidth
            name="birthdate"
            value={patientData.birthdate}
            onChange={handleChange}
            placeholder="dd-mm-aaaa"
            variant="outlined"
            required
            size="small"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field half-width">
          <Typography className="field-label">Endereço</Typography>
          <TextField
            fullWidth
            name="address"
            value={patientData.address}
            onChange={handleChange}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box className="form-field third-width">
          <Typography className="field-label">Nº</Typography>
          <TextField
            fullWidth
            name="number"
            value={patientData.number}
            onChange={handleChange}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box className="form-field third-width">
          <Typography className="field-label">Complemento</Typography>
          <TextField
            fullWidth
            name="complement"
            value={patientData.complement}
            onChange={handleChange}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box className="form-field third-width">
          <Typography className="field-label">CEP</Typography>
          <TextField
            fullWidth
            name="cep"
            value={patientData.cep}
            onChange={handleChange}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box className="form-field third-width">
          <Typography className="field-label">Cidade</Typography>
          <TextField
            fullWidth
            name="city"
            value={patientData.city}
            onChange={handleChange}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box className="form-field third-width">
          <Typography className="field-label">UF</Typography>
          <FormControl fullWidth size="small" variant="outlined">
            <Select
              name="state"
              value={patientData.state}
              onChange={handleSelectChange}
              displayEmpty
            >
              <MenuItem value="" disabled>
                <em>Selecione</em>
              </MenuItem>
              <MenuItem value="AC">AC</MenuItem>
              <MenuItem value="AL">AL</MenuItem>
              <MenuItem value="AM">AM</MenuItem>
              <MenuItem value="AP">AP</MenuItem>
              <MenuItem value="BA">BA</MenuItem>
              <MenuItem value="CE">CE</MenuItem>
              <MenuItem value="DF">DF</MenuItem>
              <MenuItem value="ES">ES</MenuItem>
              <MenuItem value="GO">GO</MenuItem>
              <MenuItem value="MA">MA</MenuItem>
              <MenuItem value="MG">MG</MenuItem>
              <MenuItem value="MS">MS</MenuItem>
              <MenuItem value="MT">MT</MenuItem>
              <MenuItem value="PA">PA</MenuItem>
              <MenuItem value="PB">PB</MenuItem>
              <MenuItem value="PE">PE</MenuItem>
              <MenuItem value="PI">PI</MenuItem>
              <MenuItem value="PR">PR</MenuItem>
              <MenuItem value="RJ">RJ</MenuItem>
              <MenuItem value="RN">RN</MenuItem>
              <MenuItem value="RO">RO</MenuItem>
              <MenuItem value="RR">RR</MenuItem>
              <MenuItem value="RS">RS</MenuItem>
              <MenuItem value="SC">SC</MenuItem>
              <MenuItem value="SE">SE</MenuItem>
              <MenuItem value="SP">SP</MenuItem>
              <MenuItem value="TO">TO</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field half-width">
          <Typography className="field-label">E-mail</Typography>
          <TextField
            fullWidth
            name="email"
            value={patientData.email}
            onChange={handleChange}
            variant="outlined"
            size="small"
            type="email"
          />
        </Box>

        <Box className="form-field third-width">
          <Typography className="field-label">Telefone 1</Typography>
          <TextField
            fullWidth
            name="phone1"
            value={patientData.phone1}
            onChange={handleChange}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box className="form-field third-width">
          <Typography className="field-label">Telefone 2</Typography>
          <TextField
            fullWidth
            name="phone2"
            value={patientData.phone2}
            onChange={handleChange}
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field half-width">
          <Typography className="field-label">
            Data/hora da consulta *
          </Typography>
          <TextField
            fullWidth
            name="appointmentDate"
            value={patientData.appointmentDate}
            onChange={handleChange}
            variant="outlined"
            size="small"
            type="datetime-local"
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PatientInfo;
