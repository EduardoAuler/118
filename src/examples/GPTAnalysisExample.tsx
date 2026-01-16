import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import { performCompletePostureAnalysis, GPTAnalysisResult } from '../services/gptAnalysisService';
import GPTAnalysisResults from '../components/patient/GPTAnalysisResults';

/**
 * Exemplo de uso da análise GPT Vision
 * Este componente demonstra como usar o sistema de análise postural com GPT
 */
const GPTAnalysisExample: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<GPTAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dados de exemplo do paciente (simulando dados reais)
  const examplePatientData = {
    name: "João Silva",
    footSize: "42",
    leftArchType: "normal",
    rightArchType: "1|plano",
    scapula: "alinhado",
    pelve: "esquerdo",
    insoleCharacteristics: {
      hiTechComfort: true,
      standard: false,
      flexiGel: false
    },
    // Simular imagens com esqueleto (em produção, estas viriam do sistema)
    frontalPhoto: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    posteriorPhoto: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    sagittalPhoto: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  };

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log("🤖 Iniciando análise de exemplo...");
      const result = await performCompletePostureAnalysis(examplePatientData);
      setAnalysisResult(result);
      console.log("✅ Análise concluída:", result);
    } catch (err) {
      console.error("❌ Erro na análise:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🤖 Exemplo de Análise GPT Vision
      </Typography>
      
      <Typography variant="body1" paragraph>
        Este exemplo demonstra como o sistema de análise postural com GPT Vision funciona.
        O sistema analisa imagens com esqueleto detectado por IA e fornece insights detalhados.
      </Typography>

      <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          📋 Dados do Paciente (Exemplo)
        </Typography>
        <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
          {JSON.stringify(examplePatientData, null, 2)}
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Erro na Análise</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleAnalysis}
          disabled={isAnalyzing}
          sx={{ fontWeight: 'bold' }}
        >
          {isAnalyzing ? 'Analisando...' : '🚀 Executar Análise GPT Vision'}
        </Button>
      </Box>

      <GPTAnalysisResults
        analysisResult={analysisResult}
        isLoading={isAnalyzing}
        onRefresh={handleAnalysis}
        patientName={examplePatientData.name}
      />

      <Paper sx={{ p: 2, mt: 3, bgcolor: '#e3f2fd' }}>
        <Typography variant="h6" gutterBottom>
          💡 Como Funciona
        </Typography>
        <Typography variant="body2" component="div">
          <ol>
            <li><strong>Coleta de Imagens:</strong> O sistema coleta todas as imagens com esqueleto salvas no patientData</li>
            <li><strong>Envio para GPT:</strong> As imagens são enviadas para o GPT-4 Vision API com contexto do paciente</li>
            <li><strong>Análise Especializada:</strong> O GPT analisa desvios posturais, simetrias e assimetrias</li>
            <li><strong>Relatório Estruturado:</strong> Retorna análise detalhada com recomendações específicas</li>
          </ol>
        </Typography>
      </Paper>
    </Box>
  );
};

export default GPTAnalysisExample;
