import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from "@mui/material";
import React from "react";

// Importando imagens de arco plantar
// Pé esquerdo - plantigrafia
import esquerdoCavo1 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-esquerdo-cavo-1.png";
import esquerdoCavo2 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-esquerdo-cavo-2.png";
import esquerdoCavo3 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-esquerdo-cavo-3.png";
import esquerdoNeutro from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-esquerdo-n.png";
import esquerdoPlano1 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-esquerdo-plano-1.png";
import esquerdoPlano2 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-esquerdo-plano-2.png";
import esquerdoPlano3 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-esquerdo-plano-3.png";

// Pé direito - plantigrafia
import direitoCavo1 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-direito-cavo-1.png";
import direitoCavo2 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-direito-cavo-2.png";
import direitoCavo3 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-direito-cavo-3.png";
import direitoNeutro from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-direito-n.png";
import direitoPlano1 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-direito-plano-1.png";
import direitoPlano2 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-direito-plano-2.png";
import direitoPlano3 from "../../assets/images/arco/7-tipo-de-arco-plantar-pe-direito-plano-3.png";

// Arcos laterais
import lateralCavo from "../../assets/images/arco/arco-plantar-lateral-cavo.png";
import lateralNeutro from "../../assets/images/arco/arco-plantar-lateral-neutro.png";
import lateralPlano from "../../assets/images/arco/arco-plantar-lateral-plano.png";

interface FootArchProps {
  patientData: any;
  onChange: (field: string, value: any) => void;
}

const FootArch: React.FC<FootArchProps> = ({ patientData, onChange }) => {
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: string
  ) => {
    const { name, checked } = e.target;
    onChange(category, {
      ...patientData[category],
      [name]: checked,
    });
  };

  const handleRadioChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    onChange(name, e.target.value);
  };

  return (
    <Box className="form-section">
      <Typography variant="h6" className="form-section-title">
        ARCO PLANTAR
      </Typography>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography className="field-label">Tamanho do pé</Typography>
          <FormControl fullWidth variant="outlined" size="small">
            <Select
              name="footSize"
              value={patientData.footSize}
              onChange={handleSelectChange}
              displayEmpty
            >
              <MenuItem value="" disabled>
                <em>Selecione</em>
              </MenuItem>
              <MenuItem value="34">34</MenuItem>
              <MenuItem value="35">35</MenuItem>
              <MenuItem value="36">36</MenuItem>
              <MenuItem value="37">37</MenuItem>
              <MenuItem value="38">38</MenuItem>
              <MenuItem value="39">39</MenuItem>
              <MenuItem value="40">40</MenuItem>
              <MenuItem value="41">41</MenuItem>
              <MenuItem value="42">42</MenuItem>
              <MenuItem value="43">43</MenuItem>
              <MenuItem value="44">44</MenuItem>
              <MenuItem value="45">45</MenuItem>
              <MenuItem value="46">46</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold">
            TIPO DE PALMILHA
          </Typography>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography className="field-label">Tipo de Calçado</Typography>
          <Box className="options-group">
            <FormControlLabel
              control={
                <Checkbox
                  checked={patientData.footwearType?.sneakers || false}
                  onChange={(e) => handleCheckboxChange(e, "footwearType")}
                  name="sneakers"
                />
              }
              label="Tênis/Sapatênis"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={patientData.footwearType?.shoes || false}
                  onChange={(e) => handleCheckboxChange(e, "footwearType")}
                  name="shoes"
                />
              }
              label="Sapato/Sapatilha"
            />
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography className="field-label">
            Características da Palmilha
          </Typography>
          <Box className="options-group">
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    patientData.insoleCharacteristics?.hiTechComfort || false
                  }
                  onChange={(e) =>
                    handleCheckboxChange(e, "insoleCharacteristics")
                  }
                  name="hiTechComfort"
                />
              }
              label="Hi-Tech Conforto"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={patientData.insoleCharacteristics?.standard || false}
                  onChange={(e) =>
                    handleCheckboxChange(e, "insoleCharacteristics")
                  }
                  name="standard"
                />
              }
              label="Standard"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={patientData.insoleCharacteristics?.flexiGel || false}
                  onChange={(e) =>
                    handleCheckboxChange(e, "insoleCharacteristics")
                  }
                  name="flexiGel"
                />
              }
              label="FlexiGel"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={patientData.insoleCharacteristics?.podoTop || false}
                  onChange={(e) =>
                    handleCheckboxChange(e, "insoleCharacteristics")
                  }
                  name="podoTop"
                />
              }
              label="PodoTOP"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={patientData.insoleCharacteristics?.podoPlus || false}
                  onChange={(e) =>
                    handleCheckboxChange(e, "insoleCharacteristics")
                  }
                  name="podoPlus"
                />
              }
              label="PodoPlus SoftDry"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    patientData.insoleCharacteristics?.hiTechPosturology ||
                    false
                  }
                  onChange={(e) =>
                    handleCheckboxChange(e, "insoleCharacteristics")
                  }
                  name="hiTechPosturology"
                />
              }
              label="Hi-Tech Posturologia"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={patientData.insoleCharacteristics?.sports || false}
                  onChange={(e) =>
                    handleCheckboxChange(e, "insoleCharacteristics")
                  }
                  name="sports"
                />
              }
              label="Esportiva"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    patientData.insoleCharacteristics?.ecoSystem || false
                  }
                  onChange={(e) =>
                    handleCheckboxChange(e, "insoleCharacteristics")
                  }
                  name="ecoSystem"
                />
              }
              label="EcoSystem"
            />
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold" marginTop={2}>
            Arco Plantar Esquerdo | Plantigrafia
          </Typography>
          <Box display="flex" gap={2} marginTop={1} flexWrap="wrap">
            <Box className="foot-arch-option">
              <img src={esquerdoPlano3} alt="3 | Plano" width={70} />
              <RadioGroup
                name="leftArchType"
                value={patientData.leftArchType}
                onChange={(e) => handleRadioChange(e, "leftArchType")}
              >
                <FormControlLabel
                  value="3|plano"
                  control={<Radio />}
                  label="3 | Plano"
                />
              </RadioGroup>
            </Box>
            <Box className="foot-arch-option">
              <img src={esquerdoPlano2} alt="2 | Plano" width={70} />
              <RadioGroup
                name="leftArchType"
                value={patientData.leftArchType}
                onChange={(e) => handleRadioChange(e, "leftArchType")}
              >
                <FormControlLabel
                  value="2|plano"
                  control={<Radio />}
                  label="2 | Plano"
                />
              </RadioGroup>
            </Box>
            <Box className="foot-arch-option">
              <img src={esquerdoPlano1} alt="1 | Plano" width={70} />
              <RadioGroup
                name="leftArchType"
                value={patientData.leftArchType}
                onChange={(e) => handleRadioChange(e, "leftArchType")}
              >
                <FormControlLabel
                  value="1|plano"
                  control={<Radio />}
                  label="1 | Plano"
                />
              </RadioGroup>
            </Box>
            <Box className="foot-arch-option">
              <img src={esquerdoNeutro} alt="N" width={70} />
              <RadioGroup
                name="leftArchType"
                value={patientData.leftArchType}
                onChange={(e) => handleRadioChange(e, "leftArchType")}
              >
                <FormControlLabel
                  value="normal"
                  control={<Radio />}
                  label="N"
                />
              </RadioGroup>
            </Box>
            <Box className="foot-arch-option">
              <img src={esquerdoCavo1} alt="1 | Cavo" width={70} />
              <RadioGroup
                name="leftArchType"
                value={patientData.leftArchType}
                onChange={(e) => handleRadioChange(e, "leftArchType")}
              >
                <FormControlLabel
                  value="1|cavo"
                  control={<Radio />}
                  label="1 | Cavo"
                />
              </RadioGroup>
            </Box>
            <Box className="foot-arch-option">
              <img src={esquerdoCavo2} alt="2 | Cavo" width={70} />
              <RadioGroup
                name="leftArchType"
                value={patientData.leftArchType}
                onChange={(e) => handleRadioChange(e, "leftArchType")}
              >
                <FormControlLabel
                  value="2|cavo"
                  control={<Radio />}
                  label="2 | Cavo"
                />
              </RadioGroup>
            </Box>
            <Box className="foot-arch-option">
              <img src={esquerdoCavo3} alt="3 | Cavo" width={70} />
              <RadioGroup
                name="leftArchType"
                value={patientData.leftArchType}
                onChange={(e) => handleRadioChange(e, "leftArchType")}
              >
                <FormControlLabel
                  value="3|cavo"
                  control={<Radio />}
                  label="3 | Cavo"
                />
              </RadioGroup>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold" marginTop={2}>
            Arco Plantar Direito | Plantigrafia
          </Typography>
          <Box display="flex" gap={2} marginTop={1} flexWrap="wrap">
            <Box className="foot-arch-option">
              <img src={direitoCavo3} alt="3 | Cavo" width={70} />
              <RadioGroup
                name="rightArchType"
                value={patientData.rightArchType}
                onChange={(e) => handleRadioChange(e, "rightArchType")}
              >
                <FormControlLabel
                  value="3|cavo"
                  control={<Radio />}
                  label="3 | Cavo"
                />
              </RadioGroup>
            </Box>
            <Box className="foot-arch-option">
              <img src={direitoCavo2} alt="2 | Cavo" width={70} />
              <RadioGroup
                name="rightArchType"
                value={patientData.rightArchType}
                onChange={(e) => handleRadioChange(e, "rightArchType")}
              >
                <FormControlLabel
                  value="2|cavo"
                  control={<Radio />}
                  label="2 | Cavo"
                />
              </RadioGroup>
            </Box>
            <Box className="foot-arch-option">
              <img src={direitoCavo1} alt="1 | Cavo" width={70} />
              <RadioGroup
                name="rightArchType"
                value={patientData.rightArchType}
                onChange={(e) => handleRadioChange(e, "rightArchType")}
              >
                <FormControlLabel
                  value="1|cavo"
                  control={<Radio />}
                  label="1 | Cavo"
                />
              </RadioGroup>
            </Box>
            <Box className="foot-arch-option">
              <img src={direitoNeutro} alt="N" width={70} />
              <RadioGroup
                name="rightArchType"
                value={patientData.rightArchType}
                onChange={(e) => handleRadioChange(e, "rightArchType")}
              >
                <FormControlLabel
                  value="normal"
                  control={<Radio />}
                  label="N"
                />
              </RadioGroup>
            </Box>
            <Box className="foot-arch-option">
              <img src={direitoPlano1} alt="1 | Plano" width={70} />
              <RadioGroup
                name="rightArchType"
                value={patientData.rightArchType}
                onChange={(e) => handleRadioChange(e, "rightArchType")}
              >
                <FormControlLabel
                  value="1|plano"
                  control={<Radio />}
                  label="1 | Plano"
                />
              </RadioGroup>
            </Box>
            <Box className="foot-arch-option">
              <img src={direitoPlano2} alt="2 | Plano" width={70} />
              <RadioGroup
                name="rightArchType"
                value={patientData.rightArchType}
                onChange={(e) => handleRadioChange(e, "rightArchType")}
              >
                <FormControlLabel
                  value="2|plano"
                  control={<Radio />}
                  label="2 | Plano"
                />
              </RadioGroup>
            </Box>
            <Box className="foot-arch-option">
              <img src={direitoPlano3} alt="3 | Plano" width={70} />
              <RadioGroup
                name="rightArchType"
                value={patientData.rightArchType}
                onChange={(e) => handleRadioChange(e, "rightArchType")}
              >
                <FormControlLabel
                  value="3|plano"
                  control={<Radio />}
                  label="3 | Plano"
                />
              </RadioGroup>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold" marginTop={2}>
            Arco Plantar Esquerdo
          </Typography>
          <Box display="flex" gap={2} marginTop={1}>
            <Box className="foot-arch-type">
              <img src={lateralCavo} alt="Cavo" width={70} />
              <RadioGroup
                name="leftArchSimple"
                value={patientData.leftArchSimple}
                onChange={(e) => handleRadioChange(e, "leftArchSimple")}
              >
                <FormControlLabel
                  value="cavo"
                  control={<Radio />}
                  label="Cavo"
                />
              </RadioGroup>
            </Box>
            <Box className="foot-arch-type">
              <img src={lateralNeutro} alt="Neutro" width={70} />
              <RadioGroup
                name="leftArchSimple"
                value={patientData.leftArchSimple}
                onChange={(e) => handleRadioChange(e, "leftArchSimple")}
              >
                <FormControlLabel
                  value="neutro"
                  control={<Radio />}
                  label="Neutro"
                />
              </RadioGroup>
            </Box>
            <Box className="foot-arch-type">
              <img src={lateralPlano} alt="Plano" width={70} />
              <RadioGroup
                name="leftArchSimple"
                value={patientData.leftArchSimple}
                onChange={(e) => handleRadioChange(e, "leftArchSimple")}
              >
                <FormControlLabel
                  value="plano"
                  control={<Radio />}
                  label="Plano"
                />
              </RadioGroup>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className="form-row">
        <Box className="form-field full-width">
          <Typography variant="subtitle1" fontWeight="bold" marginTop={2}>
            Arco Plantar Direito
          </Typography>
          <Box display="flex" gap={2} marginTop={1}>
            <Box className="foot-arch-type">
              <img src={lateralCavo} alt="Cavo" width={70} />
              <RadioGroup
                name="rightArchSimple"
                value={patientData.rightArchSimple}
                onChange={(e) => handleRadioChange(e, "rightArchSimple")}
              >
                <FormControlLabel
                  value="cavo"
                  control={<Radio />}
                  label="Cavo"
                />
              </RadioGroup>
            </Box>
            <Box className="foot-arch-type">
              <img src={lateralNeutro} alt="Neutro" width={70} />
              <RadioGroup
                name="rightArchSimple"
                value={patientData.rightArchSimple}
                onChange={(e) => handleRadioChange(e, "rightArchSimple")}
              >
                <FormControlLabel
                  value="neutro"
                  control={<Radio />}
                  label="Neutro"
                />
              </RadioGroup>
            </Box>
            <Box className="foot-arch-type">
              <img src={lateralPlano} alt="Plano" width={70} />
              <RadioGroup
                name="rightArchSimple"
                value={patientData.rightArchSimple}
                onChange={(e) => handleRadioChange(e, "rightArchSimple")}
              >
                <FormControlLabel
                  value="plano"
                  control={<Radio />}
                  label="Plano"
                />
              </RadioGroup>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FootArch;
