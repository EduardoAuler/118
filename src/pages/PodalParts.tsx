import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
} from '@mui/material';
import { Search, Category, Edit } from '@mui/icons-material';
import PieceModal from '../components/PieceModal';
import { pieceDimensionsService, type PieceDimensions } from '../services/pieceDimensionsService';
import '../styles/PodalParts.scss';

// Importar todas as imagens das peças
import pARCPA from '../assets/images/pecas/p-ARCP-A.png';
import pARCPB from '../assets/images/pecas/p-ARCP-B.png';
import pBRCPL from '../assets/images/pecas/p-BRCP-L.png';
import pBTICL from '../assets/images/pecas/p-BTIC-L.png';
import pCBSDefault from '../assets/images/pecas/p-CB-S-default.png';
import pCBSInverse from '../assets/images/pecas/p-CB-S-inverse.png';
import pHCPL from '../assets/images/pecas/p-HCP-L.png';
import pSupplementL from '../assets/images/pecas/p-SUPPLEMENT-L.png';
import p1g from '../assets/images/pecas/p1g.png';
import p1p from '../assets/images/pecas/p1p.png';
import p3g from '../assets/images/pecas/p3g.png';
import p3p from '../assets/images/pecas/p3p.png';
import p5g from '../assets/images/pecas/p5g.png';
import p5p from '../assets/images/pecas/p5p.png';
import p7 from '../assets/images/pecas/p7.png';
import p8 from '../assets/images/pecas/p8.png';
import p9 from '../assets/images/pecas/p9.png';
import p11 from '../assets/images/pecas/p11.png';
import p13 from '../assets/images/pecas/p13.png';
import p14g from '../assets/images/pecas/p14g.png';
import p14p from '../assets/images/pecas/p14p.png';
import p17 from '../assets/images/pecas/p17.png';
import p18 from '../assets/images/pecas/p18.png';
import p19 from '../assets/images/pecas/p19.png';
import p20 from '../assets/images/pecas/p20.png';
import p21 from '../assets/images/pecas/p21.png';

interface PodalPart {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  type: 'arco' | 'suporte' | 'correção' | 'prevenção' | 'outros';
}

const PodalParts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<{
    id: string;
    name: string;
    image: string;
  } | null>(null);
  const [pieceDimensions, setPieceDimensions] = useState<Map<string, PieceDimensions>>(new Map());

  // Carregar dimensões das peças
  useEffect(() => {
    const loadDimensions = async () => {
      try {
        const allDimensions = await pieceDimensionsService.getAllDimensions();
        const dimensionsMap = new Map<string, PieceDimensions>();
        
        allDimensions.forEach(dim => {
          dimensionsMap.set(dim.id, dim);
        });
        
        setPieceDimensions(dimensionsMap);
      } catch (error) {
        console.error('Erro ao carregar dimensões das peças:', error);
      }
    };

    loadDimensions();
  }, []);

  const podalParts: PodalPart[] = [
    {
      id: 'p-ARCP-A',
      name: 'ARCP A',
      description: 'Arco Plantar - Tipo A',
      category: 'Arco Plantar',
      image: pARCPA,
      type: 'arco'
    },
    {
      id: 'p-ARCP-B',
      name: 'ARCP B',
      description: 'Arco Plantar - Tipo B',
      category: 'Arco Plantar',
      image: pARCPB,
      type: 'arco'
    },
    {
      id: 'p-BRCP-L',
      name: 'BRCP L',
      description: 'Barra de Retropé - Lateral',
      category: 'Suporte',
      image: pBRCPL,
      type: 'suporte'
    },
    {
      id: 'p-BTIC-L',
      name: 'BTIC L',
      description: 'Barra de Transição - Lateral',
      category: 'Suporte',
      image: pBTICL,
      type: 'suporte'
    },
    {
      id: 'p-CB-S-default',
      name: 'CB S Default',
      description: 'Cabo de Bico - Standard',
      category: 'Correção',
      image: pCBSDefault,
      type: 'correção'
    },
    {
      id: 'p-CB-S-inverse',
      name: 'CB S Inverse',
      description: 'Cabo de Bico - Inverso',
      category: 'Correção',
      image: pCBSInverse,
      type: 'correção'
    },
    {
      id: 'p-HCP-L',
      name: 'HCP L',
      description: 'Heel Cup - Lateral',
      category: 'Suporte',
      image: pHCPL,
      type: 'suporte'
    },
    {
      id: 'p-SUPPLEMENT-L',
      name: 'SUPPLEMENT L',
      description: 'Suplemento - Lateral',
      category: 'Suporte',
      image: pSupplementL,
      type: 'suporte'
    },
    {
      id: 'p1g',
      name: 'P1G',
      description: 'Peça 1 - Verde',
      category: 'Prevenção',
      image: p1g,
      type: 'prevenção'
    },
    {
      id: 'p1p',
      name: 'P1P',
      description: 'Peça 1 - Roxo',
      category: 'Prevenção',
      image: p1p,
      type: 'prevenção'
    },
    {
      id: 'p3g',
      name: 'P3G',
      description: 'Peça 3 - Verde',
      category: 'Prevenção',
      image: p3g,
      type: 'prevenção'
    },
    {
      id: 'p3p',
      name: 'P3P',
      description: 'Peça 3 - Roxo',
      category: 'Prevenção',
      image: p3p,
      type: 'prevenção'
    },
    {
      id: 'p5g',
      name: 'P5G',
      description: 'Peça 5 - Verde',
      category: 'Prevenção',
      image: p5g,
      type: 'prevenção'
    },
    {
      id: 'p5p',
      name: 'P5P',
      description: 'Peça 5 - Roxo',
      category: 'Prevenção',
      image: p5p,
      type: 'prevenção'
    },
    {
      id: 'p7',
      name: 'P7',
      description: 'Peça 7',
      category: 'Outros',
      image: p7,
      type: 'outros'
    },
    {
      id: 'p8',
      name: 'P8',
      description: 'Peça 8',
      category: 'Outros',
      image: p8,
      type: 'outros'
    },
    {
      id: 'p9',
      name: 'P9',
      description: 'Peça 9',
      category: 'Outros',
      image: p9,
      type: 'outros'
    },
    {
      id: 'p11',
      name: 'P11',
      description: 'Peça 11',
      category: 'Outros',
      image: p11,
      type: 'outros'
    },
    {
      id: 'p13',
      name: 'P13',
      description: 'Peça 13',
      category: 'Outros',
      image: p13,
      type: 'outros'
    },
    {
      id: 'p14g',
      name: 'P14G',
      description: 'Peça 14 - Verde',
      category: 'Prevenção',
      image: p14g,
      type: 'prevenção'
    },
    {
      id: 'p14p',
      name: 'P14P',
      description: 'Peça 14 - Roxo',
      category: 'Prevenção',
      image: p14p,
      type: 'prevenção'
    },
    {
      id: 'p17',
      name: 'P17',
      description: 'Peça 17',
      category: 'Outros',
      image: p17,
      type: 'outros'
    },
    {
      id: 'p18',
      name: 'P18',
      description: 'Peça 18',
      category: 'Outros',
      image: p18,
      type: 'outros'
    },
    {
      id: 'p19',
      name: 'P19',
      description: 'Peça 19',
      category: 'Outros',
      image: p19,
      type: 'outros'
    },
    {
      id: 'p20',
      name: 'P20',
      description: 'Peça 20',
      category: 'Outros',
      image: p20,
      type: 'outros'
    },
    {
      id: 'p21',
      name: 'P21',
      description: 'Peça 21',
      category: 'Outros',
      image: p21,
      type: 'outros'
    }
  ];

  const categories = ['Todas', 'Arco Plantar', 'Suporte', 'Correção', 'Prevenção', 'Outros'];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'arco': return '#4CAF50';
      case 'suporte': return '#2196F3';
      case 'correção': return '#FF9800';
      case 'prevenção': return '#9C27B0';
      case 'outros': return '#607D8B';
      default: return '#757575';
    }
  };

  const filteredParts = podalParts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || selectedCategory === 'Todas' || part.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePieceClick = (part: PodalPart) => {
    setSelectedPiece({
      id: part.id,
      name: part.name,
      image: part.image,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPiece(null);
  };

  return (
    <div className="podal-parts-container">
      <Container maxWidth="xl">
        <Box className="podal-parts-header">
          <Typography variant="h4" component="h1" gutterBottom>
            <Category />
            Peças Podais
          </Typography>
          <Typography variant="subtitle1" className="subtitle">
            Catálogo completo de peças podais disponíveis para palmilhas ortopédicas
          </Typography>
        </Box>

          {/* Filtros */}
          <Paper className="filters-section">
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ flex: 1, minWidth: '300px' }}>
                <TextField
                  fullWidth
                  placeholder="Buscar peças..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: '300px' }}>
                <FormControl fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Categoria"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Paper>

          {/* Estatísticas */}
          <Box className="stats-chips">
            <Chip 
              label={`Total: ${podalParts.length} peças`} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label={`Mostrando: ${filteredParts.length} peças`} 
              color="secondary" 
              variant="outlined" 
            />
          </Box>


          {/* Grid de Peças */}
          <Box className="parts-grid" sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: 3 
          }}>
            {filteredParts.map((part) => (
              <Card 
                key={part.id}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
                onClick={() => handlePieceClick(part)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={part.image}
                  alt={part.name}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
                      {part.name}
                    </Typography>
                    <IconButton 
                      size="small" 
                      sx={{ 
                        opacity: 0.7,
                        '&:hover': { opacity: 1 }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePieceClick(part);
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" className="description" sx={{ mb: 2 }}>
                    {part.description}
                  </Typography>
                  
                  {/* Dimensões da peça */}
                  {pieceDimensions.has(part.id) && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Dimensões:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {pieceDimensions.get(part.id)?.thickness}mm × {pieceDimensions.get(part.id)?.width}cm × {pieceDimensions.get(part.id)?.depth}cm
                      </Typography>
                      {pieceDimensions.get(part.id)?.material && (
                        <Typography variant="caption" color="text.secondary">
                          Material: {pieceDimensions.get(part.id)?.material}
                        </Typography>
                      )}
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={part.category} 
                      size="small" 
                      className={`category-chip type-${part.type}`}
                    />
                    {pieceDimensions.has(part.id) && (
                      <Chip 
                        label="Dimensões OK" 
                        size="small" 
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {filteredParts.length === 0 && (
            <Box className="empty-state">
              <Typography variant="h6" color="text.secondary">
                Nenhuma peça encontrada com os filtros aplicados
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tente ajustar os termos de busca ou categoria
              </Typography>
            </Box>
          )}
      </Container>

      {/* Modal para editar peças */}
      {selectedPiece && (
        <PieceModal
          open={modalOpen}
          onClose={handleCloseModal}
          pieceId={selectedPiece.id}
          pieceName={selectedPiece.name}
          pieceImage={selectedPiece.image}
        />
      )}
    </div>
  );
};

export default PodalParts;
