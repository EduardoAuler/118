import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Typography,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print,
  Download,
  Fullscreen,
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { createInsoleService, type InsoleData } from '../services/insoleService';
import { printInsole, type PrintConfig } from '../services/insolePrintService';

const InsoleViewer: React.FC = () => {
  const { patientId, footSide } = useParams<{ patientId: string; footSide: string }>();
  const navigate = useNavigate();
  const { tenantId } = useAuth();
  const [insoleData, setInsoleData] = useState<InsoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const loadInsoleData = async () => {
      if (!tenantId || !patientId || !footSide) {
        setError('Dados necessários não encontrados');
        setLoading(false);
        return;
      }

      try {
        const insoleService = createInsoleService(tenantId);
        const data = await insoleService.loadInsoleByPatient(
          patientId,
          footSide as 'left' | 'right'
        );

        if (data) {
          setInsoleData(data);
        } else {
          setError('Palmilha não encontrada');
        }
      } catch (err) {
        console.error('Erro ao carregar palmilha:', err);
        setError('Erro ao carregar dados da palmilha');
      } finally {
        setLoading(false);
      }
    };

    loadInsoleData();
  }, [tenantId, patientId, footSide]);

  const handlePrint = async () => {
    if (!insoleData) return;

    try {
      const printConfig: PrintConfig = {
        shoeSize: insoleData.shoeSize,
        piecePositions: insoleData.piecePositions.map(pos => ({
          id: pos.id,
          x: pos.x,
          y: pos.y,
          width: pos.width,
          height: pos.height,
          rotation: pos.rotation,
        })),
        pieceImages: {}, // Será preenchido pelo serviço
        currentModel: {
          footId: insoleData.footSide,
          shoeSize: insoleData.shoeSize,
        },
        guidePositions: insoleData.guidePositions,
      };

      await printInsole(printConfig);
    } catch (error) {
      console.error('Erro ao imprimir:', error);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleRotateLeft = () => setRotation(prev => prev - 90);
  const handleRotateRight = () => setRotation(prev => prev + 90);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Carregando palmilha...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !insoleData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h5" color="error" gutterBottom>
              {error || 'Palmilha não encontrada'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/patient-list')}
              sx={{ mt: 2 }}
            >
              Voltar para Lista de Pacientes
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header */}
      <Card sx={{ mb: 2 }}>
        <CardHeader
          title={`Visualização da Palmilha - ${insoleData.patientName}`}
          subheader={`Pé ${insoleData.footSide === 'left' ? 'Esquerdo' : 'Direito'} | Tamanho ${insoleData.shoeSize}`}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Voltar">
                <IconButton onClick={() => navigate('/patient-list')}>
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Imprimir">
                <IconButton onClick={handlePrint} color="primary">
                  <Print />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
      </Card>

      {/* Controles */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Controles de Visualização
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Diminuir Zoom">
                <IconButton onClick={handleZoomOut}>
                  <ZoomOut />
                </IconButton>
              </Tooltip>
              <Typography variant="body2" sx={{ alignSelf: 'center', px: 1 }}>
                {Math.round(zoom * 100)}%
              </Typography>
              <Tooltip title="Aumentar Zoom">
                <IconButton onClick={handleZoomIn}>
                  <ZoomIn />
                </IconButton>
              </Tooltip>
              <Tooltip title="Rotacionar Esquerda">
                <IconButton onClick={handleRotateLeft}>
                  <RotateLeft />
                </IconButton>
              </Tooltip>
              <Tooltip title="Rotacionar Direita">
                <IconButton onClick={handleRotateRight}>
                  <RotateRight />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Visualização da Palmilha */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          overflow: 'auto'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '600px',
          backgroundColor: 'white',
          borderRadius: 1,
          border: '2px dashed #e0e0e0'
        }}>
          {insoleData.backgroundImageUrl ? (
            <Box
              sx={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease',
                position: 'relative',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              {/* SVG da Palmilha Final */}
              <svg
                viewBox="0 0 300 700"
                width="400"
                height="600"
                style={{ 
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }}
              >
                {/* Imagem de fundo */}
                {insoleData.backgroundImageUrl && (
                  <image
                    href={insoleData.backgroundImageUrl}
                    x={insoleData.backgroundPosition.x}
                    y={insoleData.backgroundPosition.y}
                    width={300 * insoleData.backgroundPosition.scale}
                    height={600 * insoleData.backgroundPosition.scale}
                    preserveAspectRatio="xMidYMid meet"
                    opacity={0.3}
                  />
                )}

                {/* Contorno da palmilha */}
                <path
                  d={insoleData.footSide === 'left' 
                    ? "M144.16,660.68C58.72,659.74,50,607.26,50,607.26S39.72,574.69,33,519.8,14.8,358.35,6.88,313.34-.72,217,6.36,163.54C10.08,135.42,41.64,3.94,119.24,1.08c86-3.17,108.13,88.61,113.93,171.43,5.07,72.3-2,107.23-4.35,198.72s4.75,185.16-.79,208.95S210.23,661.42,144.16,660.68Z"
                    : "M91.8,660.68c85.45-.94,94.16-53.42,94.16-53.42s10.28-32.57,17-87.46,18.19-161.45,26.11-206.46,7.6-96.38.52-149.8C225.88,135.42,194.33,3.94,116.73,1.08,30.75-2.09,8.59,89.69,2.79,172.51c-5.06,72.3,2,107.23,4.35,198.72S2.4,556.39,7.93,580.18,25.74,661.42,91.8,660.68Z"
                  }
                  fill="none"
                  stroke="#211915"
                  strokeWidth="3"
                  strokeMiterlimit="10"
                  transform="translate(150,280) scale(0.92,0.85) translate(-150,-320)"
                />

                {/* Guias de referência */}
                {insoleData.guidePositions.map((guide) => (
                  <line
                    key={guide.id}
                    x1={guide.x1}
                    y1={guide.y1}
                    x2={guide.x2}
                    y2={guide.y2}
                    stroke={guide.id === "vertical" ? "#2196F3" : "#F44336"}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity={0.6}
                  />
                ))}

                {/* Círculo de referência */}
                <circle
                  cx={insoleData.measureCircle.cx}
                  cy={insoleData.measureCircle.cy}
                  r="25"
                  stroke="#4CAF50"
                  strokeWidth="2"
                  fill="rgba(76, 175, 80, 0.1)"
                />
                <text
                  x={insoleData.measureCircle.cx - 15}
                  y={insoleData.measureCircle.cy + 5}
                  fill="#4CAF50"
                  fontSize="12"
                  fontWeight="bold"
                >
                  2,5 cm
                </text>

                {/* Peças posicionadas */}
                {insoleData.piecePositions.map((piece) => (
                  <g
                    key={piece.id}
                    transform={`translate(${piece.x}, ${piece.y}) rotate(${piece.rotation})`}
                  >
                    <rect
                      x={-piece.width / 2}
                      y={-piece.height / 2}
                      width={piece.width}
                      height={piece.height}
                      fill="rgba(255, 152, 0, 0.3)"
                      stroke="#FF9800"
                      strokeWidth="2"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={0}
                      y={0}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#FF9800"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {piece.id.replace('p-', '').replace('-L', '')}
                    </text>
                  </g>
                ))}
              </svg>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Nenhuma imagem de fundo disponível
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A palmilha foi criada sem imagem de referência
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Informações da Palmilha */}
      <Card sx={{ mt: 2 }}>
        <CardHeader title="Informações da Palmilha" />
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Paciente
              </Typography>
              <Typography variant="body1">
                {insoleData.patientName}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Lado do Pé
              </Typography>
              <Typography variant="body1">
                {insoleData.footSide === 'left' ? 'Esquerdo' : 'Direito'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Tamanho do Calçado
              </Typography>
              <Typography variant="body1">
                {insoleData.shoeSize}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Peças Selecionadas
              </Typography>
              <Typography variant="body1">
                {insoleData.selectedPieces.length} peças
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Data de Criação
              </Typography>
              <Typography variant="body1">
                {insoleData.createdAt.toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Última Atualização
              </Typography>
              <Typography variant="body1">
                {insoleData.updatedAt.toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
          </Box>
          
          {insoleData.notes && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Observações
              </Typography>
              <Typography variant="body1">
                {insoleData.notes}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default InsoleViewer;
