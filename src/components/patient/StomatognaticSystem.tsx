import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React from "react";

interface StomatognaticSystemProps {
  patientData: any;
  onChange: (field: string, value: any) => void;
}

const StomatognaticSystem: React.FC<StomatognaticSystemProps> = ({
  patientData,
  onChange,
}) => {
  const handleRadioChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    onChange(name, e.target.value);
  };

  return (
    <Box className="form-section">
      <Typography variant="h6" className="form-section-title">
        SISTEMA ESTOMATOGNÁTICO
      </Typography>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Classificação de Angle
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="clasificacaoAngle"
              value={patientData.clasificacaoAngle}
              onChange={(e) => handleRadioChange(e, "clasificacaoAngle")}
            >
              <FormControlLabel
                value="classeI"
                control={<Radio />}
                label="Classe I"
              />
              <FormControlLabel
                value="classeII"
                control={<Radio />}
                label="Classe II"
              />
              <FormControlLabel
                value="classeIII"
                control={<Radio />}
                label="Classe III"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Abertura Oclusal
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="aberturaOclusal"
              value={patientData.aberturaOclusal}
              onChange={(e) => handleRadioChange(e, "aberturaOclusal")}
            >
              <FormControlLabel
                value="desvioE"
                control={<Radio />}
                label="Desvio E"
              />
              <FormControlLabel
                value="desvioD"
                control={<Radio />}
                label="Desvio D"
              />
              <FormControlLabel
                value="normal"
                control={<Radio />}
                label="Normal"
              />
              <FormControlLabel
                value="reduzida"
                control={<Radio />}
                label="Reduzida"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Oclusão
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="oclusao"
              value={patientData.oclusao}
              onChange={(e) => handleRadioChange(e, "oclusao")}
            >
              <FormControlLabel
                value="cruzadaE"
                control={<Radio />}
                label="Cruzada E"
              />
              <FormControlLabel
                value="cruzadaD"
                control={<Radio />}
                label="Cruzada D"
              />
              <FormControlLabel
                value="normal"
                control={<Radio />}
                label="Normal"
              />
              <FormControlLabel
                value="emTopo"
                control={<Radio />}
                label="Em Topo"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Língua | Mobilidade Reduzida
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="linguaMobilidade"
              value={patientData.linguaMobilidade}
              onChange={(e) => handleRadioChange(e, "linguaMobilidade")}
            >
              <FormControlLabel
                value="esquerda"
                control={<Radio />}
                label="Esquerda"
              />
              <FormControlLabel
                value="direita"
                control={<Radio />}
                label="Direita"
              />
              <FormControlLabel
                value="normal"
                control={<Radio />}
                label="Normal"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Língua | Freio Curto
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="linguaFreio"
              value={patientData.linguaFreio}
              onChange={(e) => handleRadioChange(e, "linguaFreio")}
            >
              <FormControlLabel value="sim" control={<Radio />} label="SIM" />
              <FormControlLabel value="nao" control={<Radio />} label="NÃO" />
            </RadioGroup>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StomatognaticSystem;
