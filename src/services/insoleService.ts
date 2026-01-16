import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { storage, db } from './firebaseconfig';

export interface InsoleData {
  id: string;
  patientId: string;
  patientName: string;
  footSide: 'left' | 'right';
  shoeSize: number;
  notes: string;
  
  // Dados da imagem
  backgroundImageUrl?: string;
  backgroundPosition: {
    x: number;
    y: number;
    scale: number;
  };
  
  // Dados das guias
  guidePositions: Array<{
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }>;
  
  // Dados do círculo de referência
  measureCircle: {
    cx: number;
    cy: number;
  };
  
  // Dados das peças
  selectedPieces: string[];
  piecePositions: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }>;
  
  // Metadados
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export class InsoleService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // Salvar imagem no Storage
  private async saveImageToStorage(imageData: string, insoleId: string): Promise<string> {
    try {
      // Converter base64 para blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Criar referência no Storage
      const imageRef = ref(storage, `insoles/${this.tenantId}/${insoleId}/background.jpg`);
      
      // Upload da imagem
      await uploadBytes(imageRef, blob);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(imageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Erro ao salvar imagem no Storage:', error);
      throw error;
    }
  }

  // Salvar dados da palmilha no Firestore
  async saveInsole(insoleData: Omit<InsoleData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const insoleId = `insole-${insoleData.patientId}-${insoleData.footSide}`;
      
      // Preparar dados para salvar
      const dataToSave: InsoleData = {
        ...insoleData,
        id: insoleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Se há imagem, salvar no Storage primeiro
      if (insoleData.backgroundImageUrl && insoleData.backgroundImageUrl.startsWith('data:')) {
        try {
          const storageUrl = await this.saveImageToStorage(insoleData.backgroundImageUrl, insoleId);
          dataToSave.backgroundImageUrl = storageUrl;
        } catch (error) {
          console.warn('Erro ao salvar imagem no Storage, mantendo base64:', error);
          // Mantém a URL base64 se falhar
        }
      }

      // Salvar no Firestore
      const insoleRef = doc(db, 'insoles', insoleId);
      await setDoc(insoleRef, {
        ...dataToSave,
        createdAt: Timestamp.fromDate(dataToSave.createdAt),
        updatedAt: Timestamp.fromDate(dataToSave.updatedAt),
      });

      console.log('Palmilha salva com sucesso:', insoleId);
      return insoleId;
    } catch (error) {
      console.error('Erro ao salvar palmilha:', error);
      throw error;
    }
  }

  // Atualizar palmilha existente
  async updateInsole(insoleId: string, updateData: Partial<InsoleData>): Promise<void> {
    try {
      const insoleRef = doc(db, 'insoles', insoleId);
      
      // Se há nova imagem, salvar no Storage
      if (updateData.backgroundImageUrl && updateData.backgroundImageUrl.startsWith('data:')) {
        try {
          const storageUrl = await this.saveImageToStorage(updateData.backgroundImageUrl, insoleId);
          updateData.backgroundImageUrl = storageUrl;
        } catch (error) {
          console.warn('Erro ao salvar nova imagem no Storage:', error);
        }
      }

      await updateDoc(insoleRef, {
        ...updateData,
        updatedAt: Timestamp.now(),
      });

      console.log('Palmilha atualizada com sucesso:', insoleId);
    } catch (error) {
      console.error('Erro ao atualizar palmilha:', error);
      throw error;
    }
  }

  // Carregar palmilha
  async loadInsole(insoleId: string): Promise<InsoleData | null> {
    try {
      const insoleRef = doc(db, 'insoles', insoleId);
      const insoleSnap = await getDoc(insoleRef);
      
      if (insoleSnap.exists()) {
        const data = insoleSnap.data();
        
        // Verificar se pertence ao tenant atual
        if (data.tenantId !== this.tenantId) {
          throw new Error('Acesso negado: palmilha não pertence ao tenant atual');
        }

        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as InsoleData;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao carregar palmilha:', error);
      throw error;
    }
  }

  // Carregar palmilha por paciente e lado do pé
  async loadInsoleByPatient(patientId: string, footSide: 'left' | 'right'): Promise<InsoleData | null> {
    const insoleId = `insole-${patientId}-${footSide}`;
    return this.loadInsole(insoleId);
  }

  // Listar todas as palmilhas do tenant
  async listInsoles(): Promise<InsoleData[]> {
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      const q = query(
        collection(db, 'insoles'),
        where('tenantId', '==', this.tenantId)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as InsoleData;
      });
    } catch (error) {
      console.error('Erro ao listar palmilhas:', error);
      throw error;
    }
  }

  // Deletar palmilha
  async deleteInsole(insoleId: string): Promise<void> {
    try {
      // Primeiro, carregar a palmilha para verificar se pertence ao tenant
      const insoleData = await this.loadInsole(insoleId);
      if (!insoleData) {
        throw new Error('Palmilha não encontrada');
      }

      // Deletar imagem do Storage se existir
      if (insoleData.backgroundImageUrl && insoleData.backgroundImageUrl.includes('firebasestorage')) {
        try {
          const imageRef = ref(storage, `insoles/${this.tenantId}/${insoleId}/background.jpg`);
          await deleteObject(imageRef);
        } catch (error) {
          console.warn('Erro ao deletar imagem do Storage:', error);
        }
      }

      // Deletar documento do Firestore
      const insoleRef = doc(db, 'insoles', insoleId);
      await updateDoc(insoleRef, {
        deletedAt: Timestamp.now(),
        isDeleted: true,
      });

      console.log('Palmilha deletada com sucesso:', insoleId);
    } catch (error) {
      console.error('Erro ao deletar palmilha:', error);
      throw error;
    }
  }
}

// Função helper para criar uma instância do InsoleService
export const createInsoleService = (tenantId: string): InsoleService => {
  return new InsoleService(tenantId);
};





