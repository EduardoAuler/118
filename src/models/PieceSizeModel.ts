/**
 * Modelo de Dados para Mapeamento de Tamanhos de Peças
 * Sistema Podostore - Especificações Técnicas
 */

export interface PieceDimensions {
  thickness: number; // Espessura em mm
  width: number;     // Largura em cm
  depth: number;     // Profundidade em cm
}

export interface PieceSize {
  id: string;
  name: string;
  category: PieceCategory;
  side?: 'direito' | 'esquerdo' | 'ambos';
  size?: 'P' | 'M' | 'G';
  dimensions: PieceDimensions;
  material?: string;
  notes?: string;
  isComplete: boolean; // Se todas as dimensões estão preenchidas
}

export enum PieceCategory {
  // Suportes de Arco Transverso
  SAT = 'SAT', // Suporte de Arco Transverso
  SPA = 'SPA', // Suporte Plantar Anterior
  
  // Suplementos
  SUPLEMENTO_ANTEPE = 'SUPLEMENTO_ANTEPE',
  SUPLEMENTO_INTEIRO = 'SUPLEMENTO_INTEIRO',
  
  // Talonetes
  TL = 'TL', // Talonete
  
  // Palmilhas
  PALMILHA_HITECH = 'PALMILHA_HITECH',
  
  // Suportes de Arco
  SAC = 'SAC', // Suporte de Arco Cavo
  SAE = 'SAE', // Suporte de Arco Equino
  ARCP = 'ARCP', // Arco Plantar
  
  // Suportes de Calcanhar
  RC = 'RC', // Retrocalcâneo
  HCP = 'HCP', // Suporte de Calcanhar
  
  // Barretas
  BTIC = 'BTIC', // Barreta Transversal Interna do Calcanhar
  BTP = 'BTP', // Barreta Transversal Plantar
  BIC = 'BIC', // Barreta Interna do Calcanhar
  BRC = 'BRC', // Barreta Retrocalcânea
  BRCP = 'BRCP', // Barreta Retrocalcânea Plantar
  BC = 'BC', // Barreta de Calcanhar
  
  // Cuneiformes
  CB = 'CB', // Cuneiforme Bilateral
  CC = 'CC', // Cuneiforme Central
  
  // Elevadores
  EAE = 'EAE', // Elevador de Antepé Equino
  EC = 'EC', // Elevador de Calcanhar
  
  // Amortecedores
  AMORTECEDOR_ABS = 'AMORTECEDOR_ABS'
}

export class PieceSizeModel {
  private pieces: Map<string, PieceSize> = new Map();

  constructor() {
    this.initializePieces();
  }

  private initializePieces(): void {
    // Suportes de Arco Transverso (SAT)
    this.addPiece({
      id: 'SAT_G_ZI_ESQUERDO',
      name: 'SAT G ZI esquerdo',
      category: PieceCategory.SAT,
      side: 'esquerdo',
      size: 'G',
      dimensions: { thickness: 3, width: 5, depth: 8 },
      isComplete: true
    });

    this.addPiece({
      id: 'SAT_P_DIREITO',
      name: 'SAT P direito',
      category: PieceCategory.SAT,
      side: 'direito',
      size: 'P',
      dimensions: { thickness: 1, width: 4.5, depth: 6.5 },
      isComplete: true
    });

    this.addPiece({
      id: 'SAT_P_ESQUERDO',
      name: 'SAT P esquerdo',
      category: PieceCategory.SAT,
      side: 'esquerdo',
      size: 'P',
      dimensions: { thickness: 1, width: 4.5, depth: 6.5 },
      isComplete: true
    });

    this.addPiece({
      id: 'SAT_P_ZI_DIREITO',
      name: 'SAT P ZI Direito',
      category: PieceCategory.SAT,
      side: 'direito',
      size: 'P',
      dimensions: { thickness: 3, width: 4.5, depth: 6.6 },
      isComplete: true
    });

    this.addPiece({
      id: 'SAT_P_ZI_ESQUERDO',
      name: 'SAT P ZI esquerdo',
      category: PieceCategory.SAT,
      side: 'esquerdo',
      size: 'P',
      dimensions: { thickness: 3, width: 4.5, depth: 6.6 },
      isComplete: true
    });

    this.addPiece({
      id: 'SAT_G_DIREITO',
      name: 'SAT G direito',
      category: PieceCategory.SAT,
      side: 'direito',
      size: 'G',
      dimensions: { thickness: 1, width: 5, depth: 8 },
      isComplete: true
    });

    this.addPiece({
      id: 'SAT_G_ESQUERDO',
      name: 'SAT G esquerdo',
      category: PieceCategory.SAT,
      side: 'esquerdo',
      size: 'G',
      dimensions: { thickness: 1, width: 5, depth: 8 },
      isComplete: true
    });

    this.addPiece({
      id: 'SAT_G_ZI_DIREITO',
      name: 'SAT G ZI direito',
      category: PieceCategory.SAT,
      side: 'direito',
      size: 'G',
      dimensions: { thickness: 3, width: 5, depth: 8 },
      isComplete: true
    });

    // Suportes Plantares Anteriores (SPA)
    this.addPiece({
      id: 'SPA_G',
      name: 'SPA G',
      category: PieceCategory.SPA,
      size: 'G',
      dimensions: { thickness: 15, width: 7, depth: 15 },
      isComplete: true
    });

    this.addPiece({
      id: 'SPA_P',
      name: 'SPA P',
      category: PieceCategory.SPA,
      size: 'P',
      dimensions: { thickness: 10, width: 5, depth: 11.5 },
      isComplete: true
    });

    // Suplementos
    this.addPiece({
      id: 'SUPLEMENTO_ANTEPE_DIREITO',
      name: 'Suplemento de antepé Direito',
      category: PieceCategory.SUPLEMENTO_ANTEPE,
      side: 'direito',
      dimensions: { thickness: 5, width: 10.5, depth: 20 },
      isComplete: true
    });

    this.addPiece({
      id: 'SUPLEMENTO_ANTEPE_ESQUERDO',
      name: 'Suplemento de antepé Esquerdo',
      category: PieceCategory.SUPLEMENTO_ANTEPE,
      side: 'esquerdo',
      dimensions: { thickness: 5, width: 10.5, depth: 20 },
      isComplete: true
    });

    this.addPiece({
      id: 'SUPLEMENTO_INTEIRO_DIREITO',
      name: 'Suplemento inteiro Direito',
      category: PieceCategory.SUPLEMENTO_INTEIRO,
      side: 'direito',
      dimensions: { thickness: 5, width: 9.5, depth: 28 },
      isComplete: true
    });

    this.addPiece({
      id: 'SUPLEMENTO_INTEIRO_ESQUERDO',
      name: 'Suplemento inteiro Esquerdo',
      category: PieceCategory.SUPLEMENTO_INTEIRO,
      side: 'esquerdo',
      dimensions: { thickness: 5, width: 9.5, depth: 28 },
      isComplete: true
    });

    // Talonetes (TL)
    this.addPiece({
      id: 'TL_ACUNHADA',
      name: 'TL Acunhada',
      category: PieceCategory.TL,
      dimensions: { thickness: 10, width: 8, depth: 12 },
      isComplete: true
    });

    this.addPiece({
      id: 'TL_RETA',
      name: 'TL Reta',
      category: PieceCategory.TL,
      dimensions: { thickness: 3, width: 9, depth: 12 },
      isComplete: true
    });

    // Palmilhas Hi-tech (dados incompletos)
    this.addPiece({
      id: 'PALMILHA_HITECH_G_ESQUERDO',
      name: 'Palmilha Hi-tech G, Pé Esquerdo',
      category: PieceCategory.PALMILHA_HITECH,
      side: 'esquerdo',
      size: 'G',
      dimensions: { thickness: 0, width: 0, depth: 0 },
      isComplete: false,
      notes: 'Dimensões não especificadas'
    });

    this.addPiece({
      id: 'PALMILHA_HITECH_P_DIREITO',
      name: 'Palmilha Hi-tech P, Pé Direito',
      category: PieceCategory.PALMILHA_HITECH,
      side: 'direito',
      size: 'P',
      dimensions: { thickness: 0, width: 0, depth: 0 },
      isComplete: false,
      notes: 'Dimensões não especificadas'
    });

    this.addPiece({
      id: 'PALMILHA_HITECH_P_ESQUERDO',
      name: 'Palmilha Hi-tech P, Pé Esquerdo',
      category: PieceCategory.PALMILHA_HITECH,
      side: 'esquerdo',
      size: 'P',
      dimensions: { thickness: 0, width: 0, depth: 0 },
      isComplete: false,
      notes: 'Dimensões não especificadas'
    });

    this.addPiece({
      id: 'PALMILHA_HITECH_P_ESQUERDO_DUPLICADO',
      name: 'Palmilha Hi-tech P, Pé Esquerdo (Duplicado?)',
      category: PieceCategory.PALMILHA_HITECH,
      side: 'esquerdo',
      size: 'P',
      dimensions: { thickness: 3, width: 9.4, depth: 6.8 },
      isComplete: true,
      notes: 'Possível duplicação - verificar'
    });

    // Retrocalcâneo (RC)
    this.addPiece({
      id: 'RC',
      name: 'RC',
      category: PieceCategory.RC,
      dimensions: { thickness: 2, width: 9, depth: 5.5 },
      isComplete: true
    });

    // Suportes de Arco Cavo (SAC)
    this.addPiece({
      id: 'SAC_DIREITO_P',
      name: 'SAC Direito P',
      category: PieceCategory.SAC,
      side: 'direito',
      size: 'P',
      dimensions: { thickness: 0, width: 6, depth: 15 },
      isComplete: false,
      notes: 'Espessura não especificada'
    });

    this.addPiece({
      id: 'SAC_ESQUERDO_P',
      name: 'SAC Esquerdo P',
      category: PieceCategory.SAC,
      side: 'esquerdo',
      size: 'P',
      dimensions: { thickness: 0, width: 6, depth: 15 },
      isComplete: false,
      notes: 'Espessura não especificada'
    });

    this.addPiece({
      id: 'SAC_G_DIREITO',
      name: 'SAC G direito',
      category: PieceCategory.SAC,
      side: 'direito',
      size: 'G',
      dimensions: { thickness: 25, width: 6.5, depth: 19.5 },
      isComplete: true
    });

    this.addPiece({
      id: 'SAC_G_ESQUERDO',
      name: 'SAC G esquerdo',
      category: PieceCategory.SAC,
      side: 'esquerdo',
      size: 'G',
      dimensions: { thickness: 25, width: 6.5, depth: 19.5 },
      isComplete: true
    });

    this.addPiece({
      id: 'SAC_M_DIREITO',
      name: 'SAC M direito',
      category: PieceCategory.SAC,
      side: 'direito',
      size: 'M',
      dimensions: { thickness: 25, width: 6.5, depth: 18 },
      isComplete: true
    });

    this.addPiece({
      id: 'SAC_M_ESQUERDO',
      name: 'SAC M esquerdo',
      category: PieceCategory.SAC,
      side: 'esquerdo',
      size: 'M',
      dimensions: { thickness: 25, width: 6.5, depth: 18 },
      isComplete: true
    });

    // Suportes de Arco Equino (SAE)
    this.addPiece({
      id: 'SAE_G',
      name: 'SAE G',
      category: PieceCategory.SAE,
      size: 'G',
      dimensions: { thickness: 30, width: 7.5, depth: 13 },
      isComplete: true
    });

    this.addPiece({
      id: 'SAE_P_DIREITO',
      name: 'SAE P direito',
      category: PieceCategory.SAE,
      side: 'direito',
      size: 'P',
      dimensions: { thickness: 30, width: 6.5, depth: 11 },
      isComplete: true
    });

    this.addPiece({
      id: 'SAE_P_ESQUERDO',
      name: 'SAE P esquerdo',
      category: PieceCategory.SAE,
      side: 'esquerdo',
      size: 'P',
      dimensions: { thickness: 30, width: 6.5, depth: 11 },
      isComplete: true
    });

    // Barretas Transversais Internas do Calcanhar (BTIC)
    this.addPiece({
      id: 'BTIC',
      name: 'BTIC',
      category: PieceCategory.BTIC,
      dimensions: { thickness: 5, width: 2.5, depth: 5.5 },
      isComplete: true
    });

    // Barretas Transversais Plantares (BTP)
    this.addPiece({
      id: 'BTP_G',
      name: 'BTP G',
      category: PieceCategory.BTP,
      size: 'G',
      dimensions: { thickness: 2, width: 3.5, depth: 3.5 },
      isComplete: true
    });

    this.addPiece({
      id: 'BTP_P',
      name: 'BTP P',
      category: PieceCategory.BTP,
      size: 'P',
      dimensions: { thickness: 2, width: 3, depth: 3 },
      isComplete: true
    });

    // Cuneiformes Bilaterais (CB)
    this.addPiece({
      id: 'CB_DIREITA_EXTERNA_ESQUERDA_INTERNA',
      name: 'CB Direita Externa e Esquerda Interna',
      category: PieceCategory.CB,
      dimensions: { thickness: 12, width: 7.5, depth: 11.5 },
      isComplete: true
    });

    this.addPiece({
      id: 'CB_ESQUERDA_EXTERNA_DIREITA_INTERNA',
      name: 'CB Esquerda Externa e Direita Interna',
      category: PieceCategory.CB,
      dimensions: { thickness: 12, width: 7.5, depth: 11.5 },
      isComplete: true
    });

    // Cuneiformes Centrais (CC)
    this.addPiece({
      id: 'CC_PU_9MM',
      name: 'CC PU 9mm',
      category: PieceCategory.CC,
      material: 'PU',
      dimensions: { thickness: 9, width: 7, depth: 12 },
      isComplete: true
    });

    this.addPiece({
      id: 'CC_TR_1_5MM',
      name: 'CC TR 1,5mm',
      category: PieceCategory.CC,
      material: 'TR',
      dimensions: { thickness: 1.5, width: 7, depth: 12 },
      isComplete: true
    });

    // Elevadores de Antepé Equino (EAE)
    this.addPiece({
      id: 'EAE_G_DIREITO',
      name: 'EAE G direito',
      category: PieceCategory.EAE,
      side: 'direito',
      size: 'G',
      dimensions: { thickness: 25, width: 8.5, depth: 19 },
      isComplete: true
    });

    this.addPiece({
      id: 'EAE_G_ESQUERDO',
      name: 'EAE G esquerdo',
      category: PieceCategory.EAE,
      side: 'esquerdo',
      size: 'G',
      dimensions: { thickness: 25, width: 8.5, depth: 19 },
      isComplete: true
    });

    this.addPiece({
      id: 'EAE_P_DIREITO',
      name: 'EAE P direito',
      category: PieceCategory.EAE,
      side: 'direito',
      size: 'P',
      dimensions: { thickness: 20, width: 7.5, depth: 17 },
      isComplete: true
    });

    this.addPiece({
      id: 'EAE_P_ESQUERDO',
      name: 'EAE P esquerdo',
      category: PieceCategory.EAE,
      side: 'esquerdo',
      size: 'P',
      dimensions: { thickness: 20, width: 7.5, depth: 17 },
      isComplete: true
    });

    // Elevadores de Calcanhar (EC)
    this.addPiece({
      id: 'EC_DIREITO',
      name: 'EC Direito',
      category: PieceCategory.EC,
      side: 'direito',
      dimensions: { thickness: 10, width: 8, depth: 11 },
      isComplete: true
    });

    this.addPiece({
      id: 'EC_ESQUERDO',
      name: 'EC Esquerdo',
      category: PieceCategory.EC,
      side: 'esquerdo',
      dimensions: { thickness: 10, width: 8, depth: 11 },
      isComplete: true
    });

    this.addPiece({
      id: 'EC_ZI_DIREITO',
      name: 'EC ZI Direito',
      category: PieceCategory.EC,
      side: 'direito',
      dimensions: { thickness: 3, width: 7.5, depth: 11 },
      isComplete: true
    });

    this.addPiece({
      id: 'EC_ZI_ESQUERDO',
      name: 'EC ZI Esquerdo',
      category: PieceCategory.EC,
      side: 'esquerdo',
      dimensions: { thickness: 3, width: 7.5, depth: 11 },
      isComplete: true
    });

    // Suporte de Calcanhar (HCP)
    this.addPiece({
      id: 'HCP',
      name: 'HCP',
      category: PieceCategory.HCP,
      dimensions: { thickness: 3, width: 8.5, depth: 5.5 },
      isComplete: true
    });

    // Amortecedores ABS
    this.addPiece({
      id: 'AMORTECEDOR_ABS_GEL',
      name: 'Amortecedor ABS Gel',
      category: PieceCategory.AMORTECEDOR_ABS,
      material: 'Gel',
      dimensions: { thickness: 3, width: 4.5, depth: 4.5 },
      isComplete: true
    });

    this.addPiece({
      id: 'AMORTECEDOR_ABS_PU',
      name: 'Amortecedor ABS Pu',
      category: PieceCategory.AMORTECEDOR_ABS,
      material: 'PU',
      dimensions: { thickness: 10, width: 6, depth: 6 },
      isComplete: true
    });

    // Arcos Plantares (ARCP)
    this.addPiece({
      id: 'ARCP_D',
      name: 'ARCP D',
      category: PieceCategory.ARCP,
      side: 'direito',
      dimensions: { thickness: 10, width: 6.5, depth: 18.5 },
      isComplete: true
    });

    this.addPiece({
      id: 'ARCP_E',
      name: 'ARCP E',
      category: PieceCategory.ARCP,
      side: 'esquerdo',
      dimensions: { thickness: 10, width: 6.5, depth: 18.5 },
      isComplete: true
    });

    // Barretas de Calcanhar (BC)
    this.addPiece({
      id: 'BC_2MM',
      name: 'BC 2mm',
      category: PieceCategory.BC,
      dimensions: { thickness: 2, width: 3.5, depth: 10.5 },
      isComplete: true
    });

    this.addPiece({
      id: 'BC_2MM_DUPLICADO',
      name: 'BC 2mm Espessura (Duplicado?)',
      category: PieceCategory.BC,
      dimensions: { thickness: 2, width: 3.5, depth: 10.5 },
      isComplete: true,
      notes: 'Possível duplicação - verificar'
    });

    // Barretas Internas do Calcanhar (BIC)
    this.addPiece({
      id: 'BIC_2MM_DIREITO',
      name: 'BIC 2mm Direito',
      category: PieceCategory.BIC,
      side: 'direito',
      dimensions: { thickness: 2, width: 4.5, depth: 12 },
      isComplete: true
    });

    this.addPiece({
      id: 'BIC_2MM_ESQUERDO',
      name: 'BIC 2mm Esquerdo',
      category: PieceCategory.BIC,
      side: 'esquerdo',
      dimensions: { thickness: 2, width: 4.5, depth: 12 },
      isComplete: true
    });

    this.addPiece({
      id: 'BIC_ZI_DIREITA',
      name: 'BIC ZI Direita',
      category: PieceCategory.BIC,
      side: 'direito',
      dimensions: { thickness: 3, width: 6, depth: 11.5 },
      isComplete: true
    });

    this.addPiece({
      id: 'BIC_ZI_ESQUERDA',
      name: 'BIC ZI Esquerda',
      category: PieceCategory.BIC,
      side: 'esquerdo',
      dimensions: { thickness: 3, width: 6, depth: 11.5 },
      isComplete: true
    });

    // Barretas Retrocalcâneas (BRC)
    this.addPiece({
      id: 'BRC_1_5MM_DIREITO',
      name: 'BRC 1,5mm Direito',
      category: PieceCategory.BRC,
      side: 'direito',
      dimensions: { thickness: 2.5, width: 5, depth: 11 },
      isComplete: true
    });

    this.addPiece({
      id: 'BRC_1_5MM_ESQUERDO',
      name: 'BRC 1,5mm Esquerdo',
      category: PieceCategory.BRC,
      side: 'esquerdo',
      dimensions: { thickness: 2.5, width: 5, depth: 11 },
      isComplete: true
    });

    this.addPiece({
      id: 'BRC_2_5MM_DIREITO',
      name: 'BRC 2,5mm Direito',
      category: PieceCategory.BRC,
      side: 'direito',
      dimensions: { thickness: 2.5, width: 5, depth: 11 },
      isComplete: true
    });

    this.addPiece({
      id: 'BRC_2_5MM_ESQUERDO',
      name: 'BRC 2,5mm Esquerdo',
      category: PieceCategory.BRC,
      side: 'esquerdo',
      dimensions: { thickness: 2.5, width: 5, depth: 11 },
      isComplete: true
    });

    this.addPiece({
      id: 'BRC_ZI_DIREITA',
      name: 'BRC ZI direita',
      category: PieceCategory.BRC,
      side: 'direito',
      dimensions: { thickness: 3, width: 6, depth: 10 },
      isComplete: true
    });

    this.addPiece({
      id: 'BRC_ZI_ESQUERDA',
      name: 'BRC ZI esquerda',
      category: PieceCategory.BRC,
      side: 'esquerdo',
      dimensions: { thickness: 3, width: 6, depth: 10 },
      isComplete: true
    });

    // Barretas Retrocalcâneas Plantares (BRCP)
    this.addPiece({
      id: 'BRCP_D',
      name: 'BRCP D',
      category: PieceCategory.BRCP,
      side: 'direito',
      dimensions: { thickness: 5, width: 11, depth: 15.5 },
      isComplete: true
    });

    this.addPiece({
      id: 'BRCP_E',
      name: 'BRCP E',
      category: PieceCategory.BRCP,
      side: 'esquerdo',
      dimensions: { thickness: 5, width: 11, depth: 15.5 },
      isComplete: true
    });
  }

  private addPiece(piece: PieceSize): void {
    this.pieces.set(piece.id, piece);
  }

  // Métodos de consulta
  public getPiece(id: string): PieceSize | undefined {
    return this.pieces.get(id);
  }

  public getAllPieces(): PieceSize[] {
    return Array.from(this.pieces.values());
  }

  public getPiecesByCategory(category: PieceCategory): PieceSize[] {
    return this.getAllPieces().filter(piece => piece.category === category);
  }

  public getPiecesBySide(side: 'direito' | 'esquerdo' | 'ambos'): PieceSize[] {
    return this.getAllPieces().filter(piece => piece.side === side);
  }

  public getPiecesBySize(size: 'P' | 'M' | 'G'): PieceSize[] {
    return this.getAllPieces().filter(piece => piece.size === size);
  }

  public getIncompletePieces(): PieceSize[] {
    return this.getAllPieces().filter(piece => !piece.isComplete);
  }

  public getCompletePieces(): PieceSize[] {
    return this.getAllPieces().filter(piece => piece.isComplete);
  }

  public searchPieces(query: string): PieceSize[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllPieces().filter(piece => 
      piece.name.toLowerCase().includes(lowerQuery) ||
      piece.id.toLowerCase().includes(lowerQuery) ||
      piece.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Métodos de estatísticas
  public getStatistics() {
    const allPieces = this.getAllPieces();
    const completePieces = this.getCompletePieces();
    const incompletePieces = this.getIncompletePieces();

    const categoryStats = new Map<PieceCategory, number>();
    const sideStats = new Map<string, number>();
    const sizeStats = new Map<string, number>();

    allPieces.forEach(piece => {
      // Estatísticas por categoria
      const categoryCount = categoryStats.get(piece.category) || 0;
      categoryStats.set(piece.category, categoryCount + 1);

      // Estatísticas por lado
      if (piece.side) {
        const sideCount = sideStats.get(piece.side) || 0;
        sideStats.set(piece.side, sideCount + 1);
      }

      // Estatísticas por tamanho
      if (piece.size) {
        const sizeCount = sizeStats.get(piece.size) || 0;
        sizeStats.set(piece.size, sizeCount + 1);
      }
    });

    return {
      total: allPieces.length,
      complete: completePieces.length,
      incomplete: incompletePieces.length,
      completionRate: (completePieces.length / allPieces.length) * 100,
      categoryStats: Object.fromEntries(categoryStats),
      sideStats: Object.fromEntries(sideStats),
      sizeStats: Object.fromEntries(sizeStats)
    };
  }

  // Método para exportar dados
  public exportToCSV(): string {
    const headers = ['ID', 'Nome', 'Categoria', 'Lado', 'Tamanho', 'Espessura (mm)', 'Largura (cm)', 'Profundidade (cm)', 'Material', 'Notas', 'Completo'];
    const rows = this.getAllPieces().map(piece => [
      piece.id,
      piece.name,
      piece.category,
      piece.side || '',
      piece.size || '',
      piece.dimensions.thickness,
      piece.dimensions.width,
      piece.dimensions.depth,
      piece.material || '',
      piece.notes || '',
      piece.isComplete ? 'Sim' : 'Não'
    ]);

    return [headers, ...rows].map(row => row.join(';')).join('\n');
  }

  // Método para validar dimensões
  public validateDimensions(piece: PieceSize): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (piece.dimensions.thickness <= 0) {
      errors.push('Espessura deve ser maior que zero');
    }

    if (piece.dimensions.width <= 0) {
      errors.push('Largura deve ser maior que zero');
    }

    if (piece.dimensions.depth <= 0) {
      errors.push('Profundidade deve ser maior que zero');
    }

    // Validações específicas por categoria
    switch (piece.category) {
      case PieceCategory.SAT:
        if (piece.dimensions.thickness > 10) {
          errors.push('SAT: Espessura muito alta para suporte de arco transverso');
        }
        break;
      case PieceCategory.TL:
        if (piece.dimensions.thickness > 15) {
          errors.push('TL: Espessura muito alta para talonete');
        }
        break;
      // Adicionar mais validações conforme necessário
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Instância singleton para uso global
export const pieceSizeModel = new PieceSizeModel();
