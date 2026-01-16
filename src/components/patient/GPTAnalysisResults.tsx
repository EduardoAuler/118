import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { GPTAnalysisResult } from '../../services/gptAnalysisService';

interface GPTAnalysisResultsProps {
  analysisResult: GPTAnalysisResult | null;
  isLoading: boolean;
  onRefresh?: () => void;
  patientName?: string;
}

const GPTAnalysisResults: React.FC<GPTAnalysisResultsProps> = ({
  analysisResult,
  isLoading,
  onRefresh,
  patientName
}) => {
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('overall');

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const getSeverityColor = (severity: 'low' | 'moderate' | 'high') => {
    switch (severity) {
      case 'low': return 'success';
      case 'moderate': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: 'low' | 'moderate' | 'high') => {
    switch (severity) {
      case 'low': return <CheckCircleIcon color="success" />;
      case 'moderate': return <WarningIcon color="warning" />;
      case 'high': return <WarningIcon color="error" />;
      default: return <InfoIcon />;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 4 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="primary">
          Analisando imagens com GPT Vision...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Isso pode levar alguns segundos
        </Typography>
      </Box>
    );
  }

  if (!analysisResult) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        <Typography variant="h6" gutterBottom>
          Análise GPT não disponível
        </Typography>
        <Typography variant="body2">
          Execute a análise postural para obter resultados detalhados com IA.
        </Typography>
        {onRefresh && (
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            sx={{ mt: 2 }}
          >
            Executar Análise
          </Button>
        )}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          🤖 Análise Postural com GPT Vision
        </Typography>
        {onRefresh && (
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            size="small"
          >
            Atualizar
          </Button>
        )}
      </Box>

      {patientName && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Paciente: {patientName}
          </Typography>
        </Alert>
      )}

      {/* Avaliação Geral */}
      <Accordion 
        expanded={expandedAccordion === 'overall'} 
        onChange={handleAccordionChange('overall')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Avaliação Geral
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
            <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {analysisResult.overallAssessment}
            </Typography>
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* Achados Específicos por Plano */}
      {Object.keys(analysisResult.specificFindings).length > 0 && (
        <Accordion 
          expanded={expandedAccordion === 'specific'} 
          onChange={handleAccordionChange('specific')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="info" />
              <Typography variant="h6" fontWeight="bold">
                Achados Específicos por Plano
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(analysisResult.specificFindings).map(([planeId, findings]) => (
                <Card key={planeId} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" textTransform="capitalize">
                        {planeId}
                      </Typography>
                      <Chip 
                        label={findings.severity} 
                        color={getSeverityColor(findings.severity)}
                        size="small"
                        icon={getSeverityIcon(findings.severity)}
                      />
                    </Box>
                    
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Achados:
                    </Typography>
                    <List dense>
                      {findings.findings.map((finding, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <InfoIcon color="info" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={finding} />
                        </ListItem>
                      ))}
                    </List>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Recomendações:
                    </Typography>
                    <List dense>
                      {findings.recommendations.map((recommendation, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={recommendation} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Recomendações Gerais */}
      {analysisResult.generalRecommendations.length > 0 && (
        <Accordion 
          expanded={expandedAccordion === 'recommendations'} 
          onChange={handleAccordionChange('recommendations')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="success" />
              <Typography variant="h6" fontWeight="bold">
                Recomendações Gerais
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {analysisResult.generalRecommendations.map((recommendation, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={recommendation} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Fatores de Risco */}
      {analysisResult.riskFactors.length > 0 && (
        <Accordion 
          expanded={expandedAccordion === 'risks'} 
          onChange={handleAccordionChange('risks')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="warning" />
              <Typography variant="h6" fontWeight="bold">
                Fatores de Risco
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {analysisResult.riskFactors.map((risk, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={risk} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Ações de Acompanhamento */}
      {analysisResult.followUpActions.length > 0 && (
        <Accordion 
          expanded={expandedAccordion === 'followup'} 
          onChange={handleAccordionChange('followup')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Ações de Acompanhamento
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {analysisResult.followUpActions.map((action, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <AssessmentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={action} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Footer com informações técnicas */}
      <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Análise realizada com:</strong> GPT-4 Vision API | 
          <strong> Timestamp:</strong> {new Date().toLocaleString('pt-BR')} |
          <strong> Método:</strong> Análise de esqueleto detectado por IA
        </Typography>
      </Box>
    </Box>
  );
};

export default GPTAnalysisResults;
