/**
 * Demonstração Prática do Modelo de Mapeamento de Tamanhos de Peças
 * Sistema Podostore - Componente React
 */

import React, { useState, useEffect } from 'react';
import { 
  pieceSizeModel, 
  PieceCategory, 
  PieceSize,
  pieceSizeModelConfig 
} from './index';

interface PieceSizeModelDemoProps {
  className?: string;
}

export const PieceSizeModelDemo: React.FC<PieceSizeModelDemoProps> = ({ className }) => {
  const [selectedCategory, setSelectedCategory] = useState<PieceCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);
  const [pieces, setPieces] = useState<PieceSize[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Carregar estatísticas iniciais
    setStats(pieceSizeModel.getStatistics());
    updatePieces();
  }, []);

  useEffect(() => {
    updatePieces();
  }, [selectedCategory, searchQuery, showIncompleteOnly]);

  const updatePieces = () => {
    let filteredPieces: PieceSize[] = [];

    if (selectedCategory === 'ALL') {
      filteredPieces = pieceSizeModel.getAllPieces();
    } else {
      filteredPieces = pieceSizeModel.getPiecesByCategory(selectedCategory);
    }

    if (searchQuery) {
      filteredPieces = filteredPieces.filter(piece =>
        piece.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        piece.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (showIncompleteOnly) {
      filteredPieces = filteredPieces.filter(piece => !piece.isComplete);
    }

    setPieces(filteredPieces);
  };

  const handleExportCSV = () => {
    const csvData = pieceSizeModel.exportToCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'pecas_podostore.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryDisplayName = (category: PieceCategory): string => {
    const config = pieceSizeModelConfig.getCategoryConfig(category);
    return config.name;
  };

  const formatDimensions = (piece: PieceSize): string => {
    if (!piece.isComplete) {
      return 'Dados incompletos';
    }
    return `${piece.dimensions.thickness}mm × ${piece.dimensions.width}cm × ${piece.dimensions.depth}cm`;
  };

  const getPieceStatusColor = (piece: PieceSize): string => {
    if (!piece.isComplete) return '#ff6b6b';
    if (piece.notes?.includes('Duplicado')) return '#ffa726';
    return '#4caf50';
  };

  const getPieceStatusText = (piece: PieceSize): string => {
    if (!piece.isComplete) return 'Incompleto';
    if (piece.notes?.includes('Duplicado')) return 'Duplicado';
    return 'Completo';
  };

  return (
    <div className={`piece-size-model-demo ${className || ''}`}>
      <div className="demo-header">
        <h2>Modelo de Mapeamento de Peças - Podostore</h2>
        <p>Demonstração das funcionalidades do sistema de mapeamento de tamanhos</p>
      </div>

      {/* Estatísticas Gerais */}
      {stats && (
        <div className="stats-section">
          <h3>Estatísticas Gerais</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total de Peças</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.complete}</div>
              <div className="stat-label">Completas</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.incomplete}</div>
              <div className="stat-label">Incompletas</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.completionRate.toFixed(1)}%</div>
              <div className="stat-label">Taxa de Completude</div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros e Controles */}
      <div className="controls-section">
        <h3>Filtros e Controles</h3>
        <div className="controls-grid">
          <div className="control-group">
            <label htmlFor="category-select">Categoria:</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as PieceCategory | 'ALL')}
            >
              <option value="ALL">Todas as Categorias</option>
              {Object.values(PieceCategory).map(category => (
                <option key={category} value={category}>
                  {getCategoryDisplayName(category)}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="search-input">Buscar:</label>
            <input
              id="search-input"
              type="text"
              placeholder="Digite o nome da peça..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={showIncompleteOnly}
                onChange={(e) => setShowIncompleteOnly(e.target.checked)}
              />
              Mostrar apenas incompletas
            </label>
          </div>

          <div className="control-group">
            <button onClick={handleExportCSV} className="export-button">
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Peças */}
      <div className="pieces-section">
        <h3>Peças Encontradas ({pieces.length})</h3>
        <div className="pieces-list">
          {pieces.map(piece => (
            <div key={piece.id} className="piece-card">
              <div className="piece-header">
                <div className="piece-name">{piece.name}</div>
                <div 
                  className="piece-status"
                  style={{ backgroundColor: getPieceStatusColor(piece) }}
                >
                  {getPieceStatusText(piece)}
                </div>
              </div>
              
              <div className="piece-details">
                <div className="piece-info">
                  <span className="piece-category">{getCategoryDisplayName(piece.category)}</span>
                  {piece.side && <span className="piece-side">({piece.side})</span>}
                  {piece.size && <span className="piece-size">[{piece.size}]</span>}
                </div>
                
                <div className="piece-dimensions">
                  <strong>Dimensões:</strong> {formatDimensions(piece)}
                </div>
                
                {piece.material && (
                  <div className="piece-material">
                    <strong>Material:</strong> {piece.material}
                  </div>
                )}
                
                {piece.notes && (
                  <div className="piece-notes">
                    <strong>Notas:</strong> {piece.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estilos CSS */}
      <style>{`
        .piece-size-model-demo {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .demo-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .demo-header h2 {
          color: #333;
          margin-bottom: 10px;
        }

        .demo-header p {
          color: #666;
          font-size: 16px;
        }

        .stats-section {
          margin-bottom: 30px;
        }

        .stats-section h3 {
          color: #333;
          margin-bottom: 15px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .stat-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 5px;
        }

        .stat-label {
          color: #666;
          font-size: 14px;
        }

        .controls-section {
          margin-bottom: 30px;
        }

        .controls-section h3 {
          color: #333;
          margin-bottom: 15px;
        }

        .controls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          align-items: end;
        }

        .control-group {
          display: flex;
          flex-direction: column;
        }

        .control-group label {
          margin-bottom: 5px;
          font-weight: 500;
          color: #333;
        }

        .control-group input,
        .control-group select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .control-group input[type="checkbox"] {
          margin-right: 8px;
        }

        .export-button {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .export-button:hover {
          background: #218838;
        }

        .pieces-section h3 {
          color: #333;
          margin-bottom: 15px;
        }

        .pieces-list {
          display: grid;
          gap: 15px;
        }

        .piece-card {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .piece-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .piece-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .piece-status {
          padding: 4px 12px;
          border-radius: 20px;
          color: white;
          font-size: 12px;
          font-weight: 500;
        }

        .piece-details {
          display: grid;
          gap: 8px;
        }

        .piece-info {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .piece-category {
          background: #e3f2fd;
          color: #1976d2;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .piece-side {
          color: #666;
          font-size: 14px;
        }

        .piece-size {
          background: #f3e5f5;
          color: #7b1fa2;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .piece-dimensions,
        .piece-material,
        .piece-notes {
          font-size: 14px;
          color: #555;
        }

        .piece-notes {
          font-style: italic;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .controls-grid {
            grid-template-columns: 1fr;
          }
          
          .piece-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default PieceSizeModelDemo;
