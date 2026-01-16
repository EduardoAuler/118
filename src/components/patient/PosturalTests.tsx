import {
  Box,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React from "react";

interface PosturalTestsProps {
  patientData: any;
  onChange: (field: string, value: any) => void;
}

const PosturalTests: React.FC<PosturalTestsProps> = ({
  patientData,
  onChange,
}) => {
  const handleRadioChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    onChange(name, e.target.value);
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: string
  ) => {
    const { name, checked } = e.target;

    // Verifica se o objeto para a categoria existe
    const currentCategory = patientData[category] || {};

    // Atualiza o valor no objeto da categoria
    const updatedCategory = {
      ...currentCategory,
      [name]: checked,
    };

    // Atualiza o estado com o novo objeto
    onChange(category, updatedCategory);
  };

  return (
    <Box className="form-section">
      <Typography variant="h6" className="form-section-title">
        TESTES POSTUROLÓGICOS
      </Typography>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Single Leg Test (SLT) | Esquerdo
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={(patientData.sltEsquerdo?.superior || false)}
                  onChange={(e) => handleCheckboxChange(e, "sltEsquerdo")}
                  name="superior"
                />
              }
              label="Superior"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={(patientData.sltEsquerdo?.medial || false)}
                  onChange={(e) => handleCheckboxChange(e, "sltEsquerdo")}
                  name="medial"
                />
              }
              label="Medial"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={(patientData.sltEsquerdo?.inferior || false)}
                  onChange={(e) => handleCheckboxChange(e, "sltEsquerdo")}
                  name="inferior"
                />
              }
              label="Inferior"
            />
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Single Leg Test (SLT) | Direito
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={(patientData.sltDireito?.superior || false)}
                  onChange={(e) => handleCheckboxChange(e, "sltDireito")}
                  name="superior"
                />
              }
              label="Superior"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={(patientData.sltDireito?.medial || false)}
                  onChange={(e) => handleCheckboxChange(e, "sltDireito")}
                  name="medial"
                />
              }
              label="Medial"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={(patientData.sltDireito?.inferior || false)}
                  onChange={(e) => handleCheckboxChange(e, "sltDireito")}
                  name="inferior"
                />
              }
              label="Inferior"
            />
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Arco Não Funcional (ANT) | Esquerdo
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="antEsquerdo"
              value={patientData.antEsquerdo}
              onChange={(e) => handleRadioChange(e, "antEsquerdo")}
            >
              <FormControlLabel
                value="positivo"
                control={<Radio />}
                label="Positivo"
              />
              <FormControlLabel
                value="negativo"
                control={<Radio />}
                label="Negativo"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Arco Não Funcional (ANT) | Direito
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="antDireito"
              value={patientData.antDireito}
              onChange={(e) => handleRadioChange(e, "antDireito")}
            >
              <FormControlLabel
                value="positivo"
                control={<Radio />}
                label="Positivo"
              />
              <FormControlLabel
                value="negativo"
                control={<Radio />}
                label="Negativo"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Teste Polegares Ascendente | Cervical (C3/C4)
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="polegaresC3C4"
              value={patientData.polegaresC3C4}
              onChange={(e) => handleRadioChange(e, "polegaresC3C4")}
            >
              <FormControlLabel
                value="esquerdo"
                control={<Radio />}
                label="Esquerdo"
              />
              <FormControlLabel
                value="direito"
                control={<Radio />}
                label="Direito"
              />
              <FormControlLabel
                value="simetrico"
                control={<Radio />}
                label="Simétrico"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Teste Polegares Ascendente | Lombar (L4/L5)
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="polegaresL4L5"
              value={patientData.polegaresL4L5}
              onChange={(e) => handleRadioChange(e, "polegaresL4L5")}
            >
              <FormControlLabel
                value="esquerdo"
                control={<Radio />}
                label="Esquerdo"
              />
              <FormControlLabel
                value="direito"
                control={<Radio />}
                label="Direito"
              />
              <FormControlLabel
                value="simetrico"
                control={<Radio />}
                label="Simétrico"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Teste R. de Cabeça | Esquerda
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="rCabecaEsquerda"
              value={patientData.rCabecaEsquerda}
              onChange={(e) => handleRadioChange(e, "rCabecaEsquerda")}
            >
              <FormControlLabel value="1" control={<Radio />} label="1" />
              <FormControlLabel value="2" control={<Radio />} label="2" />
              <FormControlLabel value="3" control={<Radio />} label="3" />
              <FormControlLabel value="4" control={<Radio />} label="4" />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Teste R. de Cabeça | Direita
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="rCabecaDireita"
              value={patientData.rCabecaDireita}
              onChange={(e) => handleRadioChange(e, "rCabecaDireita")}
            >
              <FormControlLabel value="1" control={<Radio />} label="1" />
              <FormControlLabel value="2" control={<Radio />} label="2" />
              <FormControlLabel value="3" control={<Radio />} label="3" />
              <FormControlLabel value="4" control={<Radio />} label="4" />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Teste Flexão Lateral (TFL) | Limitado
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="tflLimitado"
              value={patientData.tflLimitado}
              onChange={(e) => handleRadioChange(e, "tflLimitado")}
            >
              <FormControlLabel
                value="esquerdo"
                control={<Radio />}
                label="Esquerdo"
              />
              <FormControlLabel
                value="direito"
                control={<Radio />}
                label="Direito"
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
            Gibosidade | Teste Mod Adams
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="gibosidade"
              value={patientData.gibosidade}
              onChange={(e) => handleRadioChange(e, "gibosidade")}
            >
              <FormControlLabel
                value="esquerdo"
                control={<Radio />}
                label="Esquerdo"
              />
              <FormControlLabel
                value="direito"
                control={<Radio />}
                label="Direito"
              />
              <FormControlLabel
                value="simetrico"
                control={<Radio />}
                label="Simétrico"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Platô Sacral | Teste Mod Adams
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="platoSacral"
              value={patientData.platoSacral}
              onChange={(e) => handleRadioChange(e, "platoSacral")}
            >
              <FormControlLabel
                value="esquerdo"
                control={<Radio />}
                label="Esquerdo"
              />
              <FormControlLabel
                value="direito"
                control={<Radio />}
                label="Direito"
              />
              <FormControlLabel
                value="simetrico"
                control={<Radio />}
                label="Simétrico"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Teste Kinesiológico APL | Esquerdo
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="aplEsquerdo"
              value={patientData.aplEsquerdo}
              onChange={(e) => handleRadioChange(e, "aplEsquerdo")}
            >
              <FormControlLabel
                value="positivo"
                control={<Radio />}
                label="Positivo"
              />
              <FormControlLabel
                value="negativo"
                control={<Radio />}
                label="Negativo"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Teste Kinesiológico APL | Direito
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <RadioGroup
              row
              name="aplDireito"
              value={patientData.aplDireito}
              onChange={(e) => handleRadioChange(e, "aplDireito")}
            >
              <FormControlLabel
                value="positivo"
                control={<Radio />}
                label="Positivo"
              />
              <FormControlLabel
                value="negativo"
                control={<Radio />}
                label="Negativo"
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Teste dos Indicadores | Esquerdo
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={(patientData.indicadoresEsquerdo?.elevado || false)}
                  onChange={(e) =>
                    handleCheckboxChange(e, "indicadoresEsquerdo")
                  }
                  name="elevado"
                />
              }
              label="Elevado"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={(patientData.indicadoresEsquerdo?.abduzido || false)}
                  onChange={(e) =>
                    handleCheckboxChange(e, "indicadoresEsquerdo")
                  }
                  name="abduzido"
                />
              }
              label="Abduzido"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={(patientData.indicadoresEsquerdo?.aduzido || false)}
                  onChange={(e) =>
                    handleCheckboxChange(e, "indicadoresEsquerdo")
                  }
                  name="aduzido"
                />
              }
              label="Aduzido"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={(patientData.indicadoresEsquerdo?.baixo || false)}
                  onChange={(e) =>
                    handleCheckboxChange(e, "indicadoresEsquerdo")
                  }
                  name="baixo"
                />
              }
              label="Baixo"
            />
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            Teste dos Indicadores | Direito
          </Typography>
          <Box sx={{ display: "flex", gap: 3, marginTop: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={(patientData.indicadoresDireito?.elevado || false)}
                  onChange={(e) =>
                    handleCheckboxChange(e, "indicadoresDireito")
                  }
                  name="elevado"
                />
              }
              label="Elevado"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={(patientData.indicadoresDireito?.abduzido || false)}
                  onChange={(e) =>
                    handleCheckboxChange(e, "indicadoresDireito")
                  }
                  name="abduzido"
                />
              }
              label="Abduzido"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={(patientData.indicadoresDireito?.aduzido || false)}
                  onChange={(e) =>
                    handleCheckboxChange(e, "indicadoresDireito")
                  }
                  name="aduzido"
                />
              }
              label="Aduzido"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={(patientData.indicadoresDireito?.baixo || false)}
                  onChange={(e) =>
                    handleCheckboxChange(e, "indicadoresDireito")
                  }
                  name="baixo"
                />
              }
              label="Baixo"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PosturalTests;
