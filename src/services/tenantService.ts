import { collection, query, where, getDocs, doc, addDoc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebaseconfig';

export class TenantService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // Método para obter o tenantId atual
  getTenantId(): string {
    return this.tenantId;
  }

  // Método para atualizar o tenantId
  setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }

  // Método genérico para buscar documentos de uma coleção filtrados por tenant
  async getCollectionDocuments(collectionName: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, collectionName),
        where('tenantId', '==', this.tenantId)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Erro ao buscar documentos da coleção ${collectionName}:`, error);
      throw error;
    }
  }

  // Método genérico para buscar um documento específico por ID
  async getDocument(collectionName: string, docId: string): Promise<any | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Verificar se o documento pertence ao tenant atual
        if (data.tenantId === this.tenantId) {
          return {
            id: docSnap.id,
            ...data
          };
        } else {
          throw new Error('Acesso negado: documento não pertence ao tenant atual');
        }
      }
      return null;
    } catch (error) {
      console.error(`Erro ao buscar documento ${docId} da coleção ${collectionName}:`, error);
      throw error;
    }
  }

  // Método genérico para adicionar um documento
  async addDocument(collectionName: string, data: any): Promise<string> {
    try {
      const docData = {
        ...data,
        tenantId: this.tenantId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, collectionName), docData);
      return docRef.id;
    } catch (error) {
      console.error(`Erro ao adicionar documento na coleção ${collectionName}:`, error);
      throw error;
    }
  }

  // Método genérico para atualizar um documento
  async updateDocument(collectionName: string, docId: string, data: any): Promise<void> {
    try {
      // Primeiro verificar se o documento existe e pertence ao tenant
      const existingDoc = await this.getDocument(collectionName, docId);
      if (!existingDoc) {
        throw new Error('Documento não encontrado ou não pertence ao tenant atual');
      }

      const docRef = doc(db, collectionName, docId);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error(`Erro ao atualizar documento ${docId} da coleção ${collectionName}:`, error);
      throw error;
    }
  }

  // Método genérico para deletar um documento
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      // Primeiro verificar se o documento existe e pertence ao tenant
      const existingDoc = await this.getDocument(collectionName, docId);
      if (!existingDoc) {
        throw new Error('Documento não encontrado ou não pertence ao tenant atual');
      }

      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Erro ao deletar documento ${docId} da coleção ${collectionName}:`, error);
      throw error;
    }
  }

  // Métodos específicos para pacientes
  async getPatients(): Promise<any[]> {
    return this.getCollectionDocuments('pacientes');
  }

  async getPatient(patientId: string): Promise<any | null> {
    return this.getDocument('pacientes', patientId);
  }

  async addPatient(patientData: any): Promise<string> {
    return this.addDocument('pacientes', patientData);
  }

  async updatePatient(patientId: string, patientData: any): Promise<void> {
    return this.updateDocument('pacientes', patientId, patientData);
  }

  async deletePatient(patientId: string): Promise<void> {
    return this.deleteDocument('pacientes', patientId);
  }

  // Métodos específicos para consultas
  async getConsultations(): Promise<any[]> {
    return this.getCollectionDocuments('consultas');
  }

  async getConsultation(consultationId: string): Promise<any | null> {
    return this.getDocument('consultas', consultationId);
  }

  async addConsultation(consultationData: any): Promise<string> {
    return this.addDocument('consultas', consultationData);
  }

  async updateConsultation(consultationId: string, consultationData: any): Promise<void> {
    return this.updateDocument('consultas', consultationId, consultationData);
  }

  async deleteConsultation(consultationId: string): Promise<void> {
    return this.deleteDocument('consultas', consultationId);
  }

  // Métodos específicos para usuários (apenas admin pode gerenciar usuários do tenant)
  async getUsers(): Promise<any[]> {
    return this.getCollectionDocuments('users');
  }

  async getUser(userId: string): Promise<any | null> {
    return this.getDocument('users', userId);
  }

  async addUser(userData: any): Promise<string> {
    return this.addDocument('users', userData);
  }

  async updateUser(userId: string, userData: any): Promise<void> {
    return this.updateDocument('users', userId, userData);
  }

  async deleteUser(userId: string): Promise<void> {
    return this.deleteDocument('users', userId);
  }

  // Métodos específicos para palmilhas
  async getInsoles(): Promise<any[]> {
    return this.getCollectionDocuments('insoles');
  }

  async getInsole(insoleId: string): Promise<any | null> {
    return this.getDocument('insoles', insoleId);
  }

  async addInsole(insoleData: any): Promise<string> {
    return this.addDocument('insoles', insoleData);
  }

  async updateInsole(insoleId: string, insoleData: any): Promise<void> {
    return this.updateDocument('insoles', insoleId, insoleData);
  }

  async deleteInsole(insoleId: string): Promise<void> {
    return this.deleteDocument('insoles', insoleId);
  }
}

// Função helper para criar uma instância do TenantService
export const createTenantService = (tenantId: string): TenantService => {
  return new TenantService(tenantId);
};

// Função helper para obter o tenantId do localStorage
export const getCurrentTenantId = (): string | null => {
  return localStorage.getItem('tenantId');
};
