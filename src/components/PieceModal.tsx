import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import {
  Close,
  Save,
  Edit,
  Straighten,
  Category,
  Info,
} from '@mui/icons-material';
import { pieceSizeModel, PieceSize } from '../models';
import { pieceMeasurementsService, PieceMeasurementInput } from '../services/pieceMeasurementsService';
import { useAuth } from '../contexts/AuthContext';

interface PieceModalProps {
  open: boolean;
  onClose: () => void;
  pieceId: string;
  pieceName: string;
  pieceImage: string;
}

interface PieceMeasurements {
  thickness: number;
  width: number;
  depth: number;
  material?: string;
  notes?: string;
  isComplete: boolean;
}

const PieceModal: React.FC<PieceModalProps> = ({
  open,
  onClose,
  pieceId,
  pieceName,
  pieceImage,
}) => {
  const { userData, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Estados para as medições
  const [measurements, setMeasurements] = useState<PieceMeasurements>({
    thickness: 0,
    width: 0,
    depth: 0,
    material: '',
    notes: '',
    isComplete: false,
  });

  // Estados para presets
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [availablePresets, setAvailablePresets] = useState<PieceSize[]>([]);

  const loadPieceData = useCallback(async () => {
    setLoading(true);
    try {
      // Primeiro, tentar carregar do Firebase
      const firebaseData = await pieceMeasurementsService.getMeasurements(pieceId);
      
      if (firebaseData) {
        setMeasurements({
          thickness: firebaseData.thickness,
          width: firebaseData.width,
          depth: firebaseData.depth,
          material: firebaseData.material || '',
          notes: firebaseData.notes || '',
          isComplete: firebaseData.isComplete,
        });
      } else {
        // Se não existir no Firebase, tentar carregar do modelo local
        const localPiece = pieceSizeModel.getPiece(pieceId);
        if (localPiece) {
          setMeasurements({
            thickness: localPiece.dimensions.thickness,
            width: localPiece.dimensions.width,
            depth: localPiece.dimensions.depth,
            material: localPiece.material || '',
            notes: localPiece.notes || '',
            isComplete: localPiece.isComplete,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados da peça:', error);
      setAlert({ type: 'error', message: 'Erro ao carregar dados da peça' });
    } finally {
      setLoading(false);
    }
  }, [pieceId]);

  const loadPresets = useCallback(() => {
    // Carregar presets baseados no nome da peça (categoria)
    const allPieces = pieceSizeModel.getAllPieces();
    const presets = allPieces.filter(piece => 
      piece.name.toLowerCase().includes(pieceName.toLowerCase().split(' ')[0]) ||
      piece.category.toLowerCase().includes(pieceName.toLowerCase().split(' ')[0])
    );
    setAvailablePresets(presets);
  }, [pieceName]);

  // Carregar dados da peça quando o modal abrir
  useEffect(() => {
    if (open) {
      loadPieceData();
      loadPresets();
    }
  }, [open, loadPieceData, loadPresets]);

  const handlePresetSelect = (presetId: string) => {
    const preset = availablePresets.find(p => p.id === presetId);
    if (preset) {
      setMeasurements({
        thickness: preset.dimensions.thickness,
        width: preset.dimensions.width,
        depth: preset.dimensions.depth,
        material: preset.material || '',
        notes: preset.notes || '',
        isComplete: preset.isComplete,
      });
      setSelectedPreset(presetId);
    }
  };

  const handleMeasurementChange = (field: keyof PieceMeasurements, value: any) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value,
      isComplete: field === 'thickness' || field === 'width' || field === 'depth' 
        ? (field === 'thickness' ? value > 0 : prev.thickness > 0) &&
          (field === 'width' ? value > 0 : prev.width > 0) &&
          (field === 'depth' ? value > 0 : prev.depth > 0)
        : prev.isComplete
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validar medições
      if (measurements.thickness <= 0 || measurements.width <= 0 || measurements.depth <= 0) {
        setAlert({ type: 'error', message: 'Todas as dimensões devem ser maiores que zero' });
        return;
      }

      // Preparar dados para salvar
      const measurementData: PieceMeasurementInput = {
        pieceName,
        pieceId,
        thickness: measurements.thickness,
        width: measurements.width,
        depth: measurements.depth,
        material: measurements.material,
        notes: measurements.notes,
        isComplete: measurements.isComplete,
        updatedBy: userData?.id || user?.uid || 'system',
      };

      // Salvar no Firebase usando o serviço
      await pieceMeasurementsService.saveMeasurements(pieceId, measurementData);

      setAlert({ type: 'success', message: 'Medições salvas com sucesso!' });
      setIsEditing(false);
      
      // Fechar alerta após 3 segundos
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Erro ao salvar medições:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar';
      setAlert({ type: 'error', message: `Erro ao salvar medições: ${errorMessage}` });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    setAlert(null);
    setSelectedPreset('');
    onClose();
  };

  const formatDimensions = () => {
    if (!measurements.isComplete) return 'Dados incompletos';
    return `${measurements.thickness}mm × ${measurements.width}cm × ${measurements.depth}cm`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, minHeight: '600px' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Straighten color="primary" />
          <Box>
            <Typography variant="h6" component="div">
              {pieceName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Medições e Especificações
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {alert && (
              <Alert 
                severity={alert.type} 
                sx={{ mb: 2 }}
                onClose={() => setAlert(null)}
              >
                {alert.message}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
              {/* Imagem da Peça */}
              <Box sx={{ flex: { xs: '1', md: '0 0 300px' } }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <img
                      src={pieceImage}
                      alt={pieceName}
                      style={{
                        width: '100%',
                        maxWidth: '200px',
                        height: 'auto',
                        objectFit: 'contain',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px',
                        padding: '16px'
                      }}
                    />
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      {pieceName}
                    </Typography>
                    <Chip
                      label={measurements.isComplete ? 'Completo' : 'Incompleto'}
                      color={measurements.isComplete ? 'success' : 'warning'}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Box>

              {/* Formulário de Medições */}
              <Box sx={{ flex: 1 }}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Edit color="primary" />
                    <Typography variant="h6">
                      Medições Atuais
                    </Typography>
                    <Button
                      variant={isEditing ? "contained" : "outlined"}
                      size="small"
                      onClick={() => setIsEditing(!isEditing)}
                      startIcon={isEditing ? <Save /> : <Edit />}
                    >
                      {isEditing ? 'Salvando...' : 'Editar'}
                    </Button>
                  </Box>

                  {/* Presets */}
                  {availablePresets.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        <Category fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Medições Pré-definidas
                      </Typography>
                      <FormControl fullWidth size="small">
                        <InputLabel>Selecionar Preset</InputLabel>
                        <Select
                          value={selectedPreset}
                          label="Selecionar Preset"
                          onChange={(e) => handlePresetSelect(e.target.value)}
                          disabled={!isEditing}
                        >
                          {availablePresets.map((preset) => (
                            <MenuItem key={preset.id} value={preset.id}>
                              {preset.name} - {preset.dimensions.thickness}mm × {preset.dimensions.width}cm × {preset.dimensions.depth}cm
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Campos de Medição */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1', minWidth: '200px' }}>
                      <TextField
                        fullWidth
                        label="Espessura (mm)"
                        type="number"
                        value={measurements.thickness}
                        onChange={(e) => handleMeasurementChange('thickness', parseFloat(e.target.value) || 0)}
                        disabled={!isEditing}
                        InputProps={{
                          inputProps: { min: 0, step: 0.1 }
                        }}
                        helperText="Altura da peça"
                      />
                    </Box>
                    <Box sx={{ flex: '1', minWidth: '200px' }}>
                      <TextField
                        fullWidth
                        label="Largura (cm)"
                        type="number"
                        value={measurements.width}
                        onChange={(e) => handleMeasurementChange('width', parseFloat(e.target.value) || 0)}
                        disabled={!isEditing}
                        InputProps={{
                          inputProps: { min: 0, step: 0.1 }
                        }}
                        helperText="Largura da peça"
                      />
                    </Box>
                    <Box sx={{ flex: '1', minWidth: '200px' }}>
                      <TextField
                        fullWidth
                        label="Profundidade (cm)"
                        type="number"
                        value={measurements.depth}
                        onChange={(e) => handleMeasurementChange('depth', parseFloat(e.target.value) || 0)}
                        disabled={!isEditing}
                        InputProps={{
                          inputProps: { min: 0, step: 0.1 }
                        }}
                        helperText="Comprimento da peça"
                      />
                    </Box>
                  </Box>

                  {/* Material e Notas */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                    <Box sx={{ flex: '1', minWidth: '200px' }}>
                      <TextField
                        fullWidth
                        label="Material"
                        value={measurements.material}
                        onChange={(e) => handleMeasurementChange('material', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Ex: PU, Gel, EVA..."
                      />
                    </Box>
                    <Box sx={{ flex: '1', minWidth: '200px' }}>
                      <TextField
                        fullWidth
                        label="Notas"
                        value={measurements.notes}
                        onChange={(e) => handleMeasurementChange('notes', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Observações adicionais..."
                      />
                    </Box>
                  </Box>

                  {/* Resumo das Dimensões */}
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Info fontSize="small" />
                      Resumo das Dimensões
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {formatDimensions()}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} disabled={saving}>
          Fechar
        </Button>
        {isEditing && (
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !measurements.isComplete}
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
          >
            {saving ? 'Salvando...' : 'Salvar Medições'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PieceModal;
