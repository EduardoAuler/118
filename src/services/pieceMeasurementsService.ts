/**
 * Serviço para gerenciar medições de peças no Firebase
 * Sistema Podostore
 */

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebaseconfig';

export interface PieceMeasurement {
  id: string;
  pieceName: string;
  pieceId: string;
  thickness: number;
  width: number;
  depth: number;
  material?: string;
  notes?: string;
  isComplete: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  updatedBy: string;
}

export interface PieceMeasurementInput {
  pieceName: string;
  pieceId: string;
  thickness: number;
  width: number;
  depth: number;
  material?: string;
  notes?: string;
  isComplete: boolean;
  updatedBy: string;
}

class PieceMeasurementsService {
  private collectionName = 'pieceMeasurements';

  /**
   * Salvar ou atualizar medições de uma peça
   */
  async saveMeasurements(pieceId: string, data: PieceMeasurementInput): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, pieceId);
      const now = Timestamp.now();
      
      // Verificar se o documento já existe
      const existingDoc = await getDoc(docRef);
      
      const measurementData: PieceMeasurement = {
        id: pieceId,
        ...data,
        createdAt: existingDoc.exists() ? existingDoc.data().createdAt : now,
        updatedAt: now,
      };

      await setDoc(docRef, measurementData);
    } catch (error) {
      console.error('Erro ao salvar medições:', error);
      throw new Error('Falha ao salvar medições da peça');
    }
  }

  /**
   * Buscar medições de uma peça específica
   */
  async getMeasurements(pieceId: string): Promise<PieceMeasurement | null> {
    try {
      const docRef = doc(db, this.collectionName, pieceId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as PieceMeasurement;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar medições:', error);
      throw new Error('Falha ao buscar medições da peça');
    }
  }

  /**
   * Buscar todas as medições
   */
  async getAllMeasurements(): Promise<PieceMeasurement[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const measurements: PieceMeasurement[] = [];
      
      querySnapshot.forEach((doc) => {
        measurements.push(doc.data() as PieceMeasurement);
      });
      
      return measurements;
    } catch (error) {
      console.error('Erro ao buscar todas as medições:', error);
      throw new Error('Falha ao buscar medições');
    }
  }

  /**
   * Buscar medições por usuário
   */
  async getMeasurementsByUser(userId: string): Promise<PieceMeasurement[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('updatedBy', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const measurements: PieceMeasurement[] = [];
      
      querySnapshot.forEach((doc) => {
        measurements.push(doc.data() as PieceMeasurement);
      });
      
      return measurements;
    } catch (error) {
      console.error('Erro ao buscar medições do usuário:', error);
      throw new Error('Falha ao buscar medições do usuário');
    }
  }

  /**
   * Buscar medições completas
   */
  async getCompleteMeasurements(): Promise<PieceMeasurement[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isComplete', '==', true),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const measurements: PieceMeasurement[] = [];
      
      querySnapshot.forEach((doc) => {
        measurements.push(doc.data() as PieceMeasurement);
      });
      
      return measurements;
    } catch (error) {
      console.error('Erro ao buscar medições completas:', error);
      throw new Error('Falha ao buscar medições completas');
    }
  }

  /**
   * Buscar medições incompletas
   */
  async getIncompleteMeasurements(): Promise<PieceMeasurement[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isComplete', '==', false),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const measurements: PieceMeasurement[] = [];
      
      querySnapshot.forEach((doc) => {
        measurements.push(doc.data() as PieceMeasurement);
      });
      
      return measurements;
    } catch (error) {
      console.error('Erro ao buscar medições incompletas:', error);
      throw new Error('Falha ao buscar medições incompletas');
    }
  }

  /**
   * Atualizar apenas campos específicos
   */
  async updateMeasurements(pieceId: string, updates: Partial<PieceMeasurementInput>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, pieceId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Erro ao atualizar medições:', error);
      throw new Error('Falha ao atualizar medições da peça');
    }
  }

  /**
   * Deletar medições de uma peça
   */
  async deleteMeasurements(pieceId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, pieceId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erro ao deletar medições:', error);
      throw new Error('Falha ao deletar medições da peça');
    }
  }

  /**
   * Buscar medições por material
   */
  async getMeasurementsByMaterial(material: string): Promise<PieceMeasurement[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('material', '==', material),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const measurements: PieceMeasurement[] = [];
      
      querySnapshot.forEach((doc) => {
        measurements.push(doc.data() as PieceMeasurement);
      });
      
      return measurements;
    } catch (error) {
      console.error('Erro ao buscar medições por material:', error);
      throw new Error('Falha ao buscar medições por material');
    }
  }

  /**
   * Buscar medições por faixa de dimensões
   */
  async getMeasurementsByDimensions(
    minThickness?: number,
    maxThickness?: number,
    minWidth?: number,
    maxWidth?: number,
    minDepth?: number,
    maxDepth?: number
  ): Promise<PieceMeasurement[]> {
    try {
      // Como o Firestore não suporta queries complexas com múltiplos campos,
      // vamos buscar todos e filtrar no cliente
      const allMeasurements = await this.getAllMeasurements();
      
      return allMeasurements.filter(measurement => {
        if (minThickness && measurement.thickness < minThickness) return false;
        if (maxThickness && measurement.thickness > maxThickness) return false;
        if (minWidth && measurement.width < minWidth) return false;
        if (maxWidth && measurement.width > maxWidth) return false;
        if (minDepth && measurement.depth < minDepth) return false;
        if (maxDepth && measurement.depth > maxDepth) return false;
        return true;
      });
    } catch (error) {
      console.error('Erro ao buscar medições por dimensões:', error);
      throw new Error('Falha ao buscar medições por dimensões');
    }
  }

  /**
   * Obter estatísticas das medições
   */
  async getStatistics(): Promise<{
    total: number;
    complete: number;
    incomplete: number;
    completionRate: number;
    materials: Record<string, number>;
    averageDimensions: {
      thickness: number;
      width: number;
      depth: number;
    };
  }> {
    try {
      const allMeasurements = await this.getAllMeasurements();
      const complete = allMeasurements.filter(m => m.isComplete);
      const incomplete = allMeasurements.filter(m => !m.isComplete);
      
      // Estatísticas de materiais
      const materials: Record<string, number> = {};
      allMeasurements.forEach(m => {
        if (m.material) {
          materials[m.material] = (materials[m.material] || 0) + 1;
        }
      });
      
      // Dimensões médias
      const validMeasurements = allMeasurements.filter(m => m.isComplete);
      const averageDimensions = {
        thickness: validMeasurements.length > 0 
          ? validMeasurements.reduce((sum, m) => sum + m.thickness, 0) / validMeasurements.length 
          : 0,
        width: validMeasurements.length > 0 
          ? validMeasurements.reduce((sum, m) => sum + m.width, 0) / validMeasurements.length 
          : 0,
        depth: validMeasurements.length > 0 
          ? validMeasurements.reduce((sum, m) => sum + m.depth, 0) / validMeasurements.length 
          : 0,
      };
      
      return {
        total: allMeasurements.length,
        complete: complete.length,
        incomplete: incomplete.length,
        completionRate: allMeasurements.length > 0 ? (complete.length / allMeasurements.length) * 100 : 0,
        materials,
        averageDimensions,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw new Error('Falha ao obter estatísticas das medições');
    }
  }
}

// Instância singleton
export const pieceMeasurementsService = new PieceMeasurementsService();
