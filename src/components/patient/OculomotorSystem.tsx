import {
  Box,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React from "react";

// Importando as imagens do cover test
import arrowBottom from "../../assets/images/eyecover/cover-test-arrow-bottom.png";
import arrowLeft from "../../assets/images/eyecover/cover-test-arrow-left.png";
import arrowRight from "../../assets/images/eyecover/cover-test-arrow-right.png";
import arrowTop from "../../assets/images/eyecover/cover-test-arrow-top.png";
import coverTestLeft from "../../assets/images/eyecover/cover-test-left.png";
import coverTestRight from "../../assets/images/eyecover/cover-test-right.png";

interface OculomotorSystemProps {
  patientData: any;
  onChange: (field: string, value: any) => void;
}

const OculomotorSystem: React.FC<OculomotorSystemProps> = ({
  patientData,
  onChange,
}) => {
  const handleRadioChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    onChange(name, e.target.value);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    onChange(name, checked);
  };

  return (
    <Box className="form-section">
      <Typography variant="h6" className="form-section-title">
        SISTEMA OCULOMOTOR
      </Typography>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Cover Test | Esquerdo
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", marginTop: 1 }}>
            <img src={coverTestLeft} alt="Cover Test Esquerdo" width={150} />
            <Box
              sx={{ display: "flex", gap: 3, marginLeft: 3, flexWrap: "wrap" }}
            >
              <Box
                className="eye-movement-option"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <img src={coverTestLeft} alt="Cicloforia" width={30} />
                <RadioGroup
                  name="leftCoverTest"
                  value={patientData.leftCoverTest}
                  onChange={(e) => handleRadioChange(e, "leftCoverTest")}
                >
                  <FormControlLabel
                    value="cicloforia"
                    control={<Radio />}
                    label="Cicloforia"
                  />
                </RadioGroup>
              </Box>
              <Box
                className="eye-movement-option"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <Box sx={{ width: 30, height: 30 }}></Box>
                <RadioGroup
                  name="leftCoverTest"
                  value={patientData.leftCoverTest}
                  onChange={(e) => handleRadioChange(e, "leftCoverTest")}
                >
                  <FormControlLabel
                    value="normal"
                    control={<Radio />}
                    label="Normal"
                  />
                </RadioGroup>
              </Box>
              <Box
                className="eye-movement-option"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <img src={arrowTop} alt="Hiperforia" width={30} />
                <RadioGroup
                  name="leftCoverTest"
                  value={patientData.leftCoverTest}
                  onChange={(e) => handleRadioChange(e, "leftCoverTest")}
                >
                  <FormControlLabel
                    value="hiperforia"
                    control={<Radio />}
                    label="Hiperforia"
                  />
                </RadioGroup>
              </Box>
              <Box
                className="eye-movement-option"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <img src={arrowRight} alt="Endoforia" width={30} />
                <RadioGroup
                  name="leftCoverTest"
                  value={patientData.leftCoverTest}
                  onChange={(e) => handleRadioChange(e, "leftCoverTest")}
                >
                  <FormControlLabel
                    value="endoforia"
                    control={<Radio />}
                    label="Endoforia"
                  />
                </RadioGroup>
              </Box>
              <Box
                className="eye-movement-option"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <img src={arrowBottom} alt="Hipoforia" width={30} />
                <RadioGroup
                  name="leftCoverTest"
                  value={patientData.leftCoverTest}
                  onChange={(e) => handleRadioChange(e, "leftCoverTest")}
                >
                  <FormControlLabel
                    value="hipoforia"
                    control={<Radio />}
                    label="Hipoforia"
                  />
                </RadioGroup>
              </Box>
              <Box
                className="eye-movement-option"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <img src={arrowLeft} alt="Exoforia" width={30} />
                <RadioGroup
                  name="leftCoverTest"
                  value={patientData.leftCoverTest}
                  onChange={(e) => handleRadioChange(e, "leftCoverTest")}
                >
                  <FormControlLabel
                    value="exoforia"
                    control={<Radio />}
                    label="Exoforia"
                  />
                </RadioGroup>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Cover Test | Direito
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", marginTop: 1 }}>
            <img src={coverTestRight} alt="Cover Test Direito" width={150} />
            <Box
              sx={{ display: "flex", gap: 3, marginLeft: 3, flexWrap: "wrap" }}
            >
              <Box
                className="eye-movement-option"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <img src={coverTestRight} alt="Cicloforia" width={30} />
                <RadioGroup
                  name="rightCoverTest"
                  value={patientData.rightCoverTest}
                  onChange={(e) => handleRadioChange(e, "rightCoverTest")}
                >
                  <FormControlLabel
                    value="cicloforia"
                    control={<Radio />}
                    label="Cicloforia"
                  />
                </RadioGroup>
              </Box>
              <Box
                className="eye-movement-option"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <Box sx={{ width: 30, height: 30 }}></Box>
                <RadioGroup
                  name="rightCoverTest"
                  value={patientData.rightCoverTest}
                  onChange={(e) => handleRadioChange(e, "rightCoverTest")}
                >
                  <FormControlLabel
                    value="normal"
                    control={<Radio />}
                    label="Normal"
                  />
                </RadioGroup>
              </Box>
              <Box
                className="eye-movement-option"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <img src={arrowTop} alt="Hiperforia" width={30} />
                <RadioGroup
                  name="rightCoverTest"
                  value={patientData.rightCoverTest}
                  onChange={(e) => handleRadioChange(e, "rightCoverTest")}
                >
                  <FormControlLabel
                    value="hiperforia"
                    control={<Radio />}
                    label="Hiperforia"
                  />
                </RadioGroup>
              </Box>
              <Box
                className="eye-movement-option"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <img src={arrowRight} alt="Endoforia" width={30} />
                <RadioGroup
                  name="rightCoverTest"
                  value={patientData.rightCoverTest}
                  onChange={(e) => handleRadioChange(e, "rightCoverTest")}
                >
                  <FormControlLabel
                    value="endoforia"
                    control={<Radio />}
                    label="Endoforia"
                  />
                </RadioGroup>
              </Box>
              <Box
                className="eye-movement-option"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <img src={arrowBottom} alt="Hipoforia" width={30} />
                <RadioGroup
                  name="rightCoverTest"
                  value={patientData.rightCoverTest}
                  onChange={(e) => handleRadioChange(e, "rightCoverTest")}
                >
                  <FormControlLabel
                    value="hipoforia"
                    control={<Radio />}
                    label="Hipoforia"
                  />
                </RadioGroup>
              </Box>
              <Box
                className="eye-movement-option"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <img src={arrowLeft} alt="Exoforia" width={30} />
                <RadioGroup
                  name="rightCoverTest"
                  value={patientData.rightCoverTest}
                  onChange={(e) => handleRadioChange(e, "rightCoverTest")}
                >
                  <FormControlLabel
                    value="exoforia"
                    control={<Radio />}
                    label="Exoforia"
                  />
                </RadioGroup>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Segmento Lento
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={patientData.segmentoLentoNormal}
                  onChange={handleCheckboxChange}
                  name="segmentoLentoNormal"
                />
              }
              label="Normal"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={patientData.segmentoLentoSacadicos}
                  onChange={handleCheckboxChange}
                  name="segmentoLentoSacadicos"
                />
              }
              label="Sacádicos"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={patientData.segmentoLentoCompensaCabeca}
                  onChange={handleCheckboxChange}
                  name="segmentoLentoCompensaCabeca"
                />
              }
              label="Compensa com a cabeça"
            />
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Movimentos Sacádicos (Apresenta Ajustes)
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="movimentosSacadicos"
              value={patientData.movimentosSacadicos}
              onChange={(e) => handleRadioChange(e, "movimentosSacadicos")}
            >
              <FormControlLabel
                value="olhoEsquerdo"
                control={<Radio />}
                label="Olho esquerdo"
              />
              <FormControlLabel
                value="olhoDireito"
                control={<Radio />}
                label="Olho direito"
              />
              <FormControlLabel
                value="ambosOlhos"
                control={<Radio />}
                label="Ambos os Olhos"
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
            Convergência
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="convergencia"
              value={patientData.convergencia}
              onChange={(e) => handleRadioChange(e, "convergencia")}
            >
              <FormControlLabel
                value="hipoconvergenteEsquerdo"
                control={<Radio />}
                label="Hipoconvergente Esquerdo"
              />
              <FormControlLabel
                value="hipoconvergenteDireito"
                control={<Radio />}
                label="Hipoconvergente Direito"
              />
              <FormControlLabel
                value="ambosOlhos"
                control={<Radio />}
                label="Ambos os Olhos"
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
            Teste de Hirschberg | Esquerdo
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="hirschbergEsquerdo"
              value={patientData.hirschbergEsquerdo}
              onChange={(e) => handleRadioChange(e, "hirschbergEsquerdo")}
            >
              <FormControlLabel
                value="normal"
                control={<Radio />}
                label="Normal"
              />
              <FormControlLabel
                value="desviado"
                control={<Radio />}
                label="Desviado"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Teste de Hirschberg | Direito
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="hirschbergDireito"
              value={patientData.hirschbergDireito}
              onChange={(e) => handleRadioChange(e, "hirschbergDireito")}
            >
              <FormControlLabel
                value="normal"
                control={<Radio />}
                label="Normal"
              />
              <FormControlLabel
                value="desviado"
                control={<Radio />}
                label="Desviado"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OculomotorSystem;
