import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React from "react";

interface GaitProps {
  patientData: any;
  onChange: (field: string, value: any) => void;
}

const Gait: React.FC<GaitProps> = ({ patientData, onChange }) => {
  const handleRadioChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    onChange(name, e.target.value);
  };

  return (
    <Box className="form-section">
      <Typography variant="h6" className="form-section-title">
        MARCHA | Avaliação Dinâmica
      </Typography>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            PÉ DIREITO
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="marchaPeDireito"
              value={patientData.marchaPeDireito}
              onChange={(e) => handleRadioChange(e, "marchaPeDireito")}
            >
              <FormControlLabel
                value="normal"
                control={<Radio />}
                label="Normal"
              />
              <FormControlLabel
                value="rotacaoINT"
                control={<Radio />}
                label="Rotação INT"
              />
              <FormControlLabel
                value="rotacaoEXT"
                control={<Radio />}
                label="Rotação EXT"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            PÉ ESQUERDO
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="marchaPeEsquerdo"
              value={patientData.marchaPeEsquerdo}
              onChange={(e) => handleRadioChange(e, "marchaPeEsquerdo")}
            >
              <FormControlLabel
                value="normal"
                control={<Radio />}
                label="Normal"
              />
              <FormControlLabel
                value="rotacaoINT"
                control={<Radio />}
                label="Rotação INT"
              />
              <FormControlLabel
                value="rotacaoEXT"
                control={<Radio />}
                label="Rotação EXT"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Gait;
