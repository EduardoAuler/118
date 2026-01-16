import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  SxProps,
  Theme,
} from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  Warning,
  Assessment,
  Download,
} from '@mui/icons-material';
import { pieceMeasurementsService } from '../services/pieceMeasurementsService';

interface MeasurementsStatsProps {
  className?: string;
  sx?: SxProps<Theme>;
}

const MeasurementsStats: React.FC<MeasurementsStatsProps> = ({ className, sx }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statistics = await pieceMeasurementsService.getStatistics();
      setStats(statistics);
    } catch (err) {
      setError('Erro ao carregar estatísticas');
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const allMeasurements = await pieceMeasurementsService.getAllMeasurements();
      const csvData = convertToCSV(allMeasurements);
      downloadCSV(csvData, 'medicoes_pecas.csv');
    } catch (err) {
      console.error('Erro ao exportar dados:', err);
    }
  };

  const convertToCSV = (data: any[]) => {
    const headers = ['ID', 'Nome da Peça', 'Espessura (mm)', 'Largura (cm)', 'Profundidade (cm)', 'Material', 'Notas', 'Completo', 'Data de Atualização'];
    const rows = data.map(item => [
      item.id,
      item.pieceName,
      item.thickness,
      item.width,
      item.depth,
      item.material || '',
      item.notes || '',
      item.isComplete ? 'Sim' : 'Não',
      item.updatedAt?.toDate?.()?.toLocaleDateString('pt-BR') || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(';')).join('\n');
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Box className={className} sx={sx}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment color="primary" />
          Estatísticas das Medições
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Download />}
          onClick={handleExportData}
        >
          Exportar Dados
        </Button>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 3 
      }}>
        {/* Estatísticas Gerais */}
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <TrendingUp color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de Medições
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
              {stats.complete}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Medições Completas
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Warning color="warning" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
              {stats.incomplete}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Medições Incompletas
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Assessment color="info" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
              {stats.completionRate.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Taxa de Completude
            </Typography>
          </CardContent>
        </Card>

        {/* Dimensões Médias */}
        <Card sx={{ gridColumn: { xs: '1', md: '1 / 3' } }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Dimensões Médias
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1', minWidth: '120px', textAlign: 'center' }}>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                  {stats.averageDimensions.thickness.toFixed(1)}mm
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Espessura
                </Typography>
              </Box>
              <Box sx={{ flex: '1', minWidth: '120px', textAlign: 'center' }}>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                  {stats.averageDimensions.width.toFixed(1)}cm
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Largura
                </Typography>
              </Box>
              <Box sx={{ flex: '1', minWidth: '120px', textAlign: 'center' }}>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                  {stats.averageDimensions.depth.toFixed(1)}cm
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Profundidade
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Materiais */}
        <Card sx={{ gridColumn: { xs: '1', md: '3 / 5' } }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribuição por Material
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(stats.materials).map(([material, count]) => (
                <Chip
                  key={material}
                  label={`${material}: ${count}`}
                  variant="outlined"
                  size="small"
                />
              ))}
              {Object.keys(stats.materials).length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Nenhum material cadastrado
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default MeasurementsStats;
