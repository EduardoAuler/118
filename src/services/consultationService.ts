import { doc, setDoc, updateDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebaseconfig";
import { saveConsultationImages } from "./imageStorageService";

/**
 * Interface para dados da consulta
 */
export interface ConsultationData {
  pacienteId: string;
  pacienteNome: string;
  observacoes?: string;
  diagnostico?: string;
  tratamento?: string;
  
  // Avaliação posturológica
  planFrontal?: boolean;
  planPosterior?: boolean;
  planSagital?: boolean;
  photoUrl?: string;
  
  // URLs das imagens com pontos
  frontalPhotoUrl?: string;
  posteriorPhotoUrl?: string;
  sagittalPhotoUrl?: string;
  inferiorPhotoUrl?: string;
  topPhotoUrl?: string;
  
  // Avaliação postural
  scapula?: string;
  pelve?: string;
  
  // Dados do arco plantar
  footSize?: string;
  insoleType?: string;
  footwearType?: {
    sneakers?: boolean;
    shoes?: boolean;
  };
  insoleCharacteristics?: {
    hiTechComfort?: boolean;
    standard?: boolean;
    flexiGel?: boolean;
    podoTop?: boolean;
    podoPlus?: boolean;
    hiTechPosturology?: boolean;
    sports?: boolean;
    ecoSystem?: boolean;
  };
  leftArchType?: string;
  rightArchType?: string;
  leftArchSimple?: string;
  rightArchSimple?: string;
  
  // Status de produção
  hasLeftInsole?: boolean;
  hasRightInsole?: boolean;
  productionStatus?: string;
  
  // Testes posturológicos
  sltEsquerdo?: {
    superior?: boolean;
    medial?: boolean;
    inferior?: boolean;
  };
  sltDireito?: {
    superior?: boolean;
    medial?: boolean;
    inferior?: boolean;
  };
  indicadoresEsquerdo?: {
    elevado?: boolean;
    abduzido?: boolean;
    aduzido?: boolean;
    baixo?: boolean;
  };
  indicadoresDireito?: {
    elevado?: boolean;
    abduzido?: boolean;
    aduzido?: boolean;
    baixo?: boolean;
  };
  
  // Metadados
  createdAt?: any;
  updatedAt?: any;
  lastStepCompleted?: number;
  isDraft?: boolean;
  [key: string]: any;
}

/**
 * Filtra imagens grandes para evitar erro do Firestore
 */
const filterLargeImages = (data: Partial<ConsultationData>): Partial<ConsultationData> => {
  const filteredData = { ...data };
  const imageFields = ['frontalPhoto', 'posteriorPhoto', 'sagittalPhoto', 'inferiorPhoto', 'topPhoto'];
  
  imageFields.forEach(field => {
    const imageData = filteredData[field];
    if (imageData && typeof imageData === 'string' && imageData.includes('data:image')) {
      // Se a imagem for muito grande (>500KB), remover do objeto
      if (imageData.length > 500000) {
        console.log(`⚠️ Removendo ${field} do Firestore (muito grande: ${Math.round(imageData.length / 1000)}KB)`);
        delete filteredData[field];
      }
    }
  });
  
  return filteredData;
};

/**
 * Salva dados incrementalmente na consulta
 */
export const saveConsultationIncrementally = async (
  consultationId: string,
  data: Partial<ConsultationData>,
  step?: number
): Promise<void> => {
  try {
    console.log(`💾 Salvando dados incrementalmente para consulta ${consultationId}...`);
    
    // Filtrar imagens grandes para evitar erro do Firestore
    const filteredData = filterLargeImages(data);
    
    const updateData = {
      ...filteredData,
      updatedAt: Timestamp.now(),
      lastStepCompleted: step,
      isDraft: true
    };
    
    // Verificar se a consulta já existe
    const consultationRef = doc(db, "consultas", consultationId);
    const consultationDoc = await getDoc(consultationRef);
    
    if (consultationDoc.exists()) {
      // Atualizar consulta existente
      await updateDoc(consultationRef, updateData);
      console.log(`✅ Consulta ${consultationId} atualizada incrementalmente`);
    } else {
      // Criar nova consulta
      await setDoc(consultationRef, {
        ...updateData,
        createdAt: Timestamp.now(),
        id: consultationId
      });
      console.log(`✅ Nova consulta ${consultationId} criada`);
    }
    
  } catch (error) {
    console.error("❌ Erro ao salvar consulta incrementalmente:", error);
    throw error;
  }
};

/**
 * Salva imagens da consulta e atualiza URLs
 */
export const saveConsultationImagesAndUpdate = async (
  consultationId: string,
  patientId: string,
  images: { [key: string]: string }
): Promise<void> => {
  try {
    console.log(`📸 Salvando imagens da consulta ${consultationId}...`);
    
    // Salvar imagens no Storage
    const savedImageUrls = await saveConsultationImages(images, patientId, consultationId);
    
    // Atualizar consulta com URLs das imagens
    const imageUrlUpdates: { [key: string]: string } = {};
    Object.entries(savedImageUrls).forEach(([planeId, url]) => {
      imageUrlUpdates[`${planeId}PhotoUrl`] = url;
    });
    
    await saveConsultationIncrementally(consultationId, imageUrlUpdates);
    
    console.log(`✅ Imagens salvas e URLs atualizadas para consulta ${consultationId}`);
    
  } catch (error) {
    console.error("❌ Erro ao salvar imagens da consulta:", error);
    throw error;
  }
};

/**
 * Finaliza a consulta (remove draft status)
 */
export const finalizeConsultation = async (
  consultationId: string,
  finalData?: Partial<ConsultationData>
): Promise<void> => {
  try {
    console.log(`🏁 Finalizando consulta ${consultationId}...`);
    
    const finalUpdateData = {
      ...finalData,
      updatedAt: Timestamp.now(),
      isDraft: false,
      finalizedAt: Timestamp.now()
    };
    
    const consultationRef = doc(db, "consultas", consultationId);
    await updateDoc(consultationRef, finalUpdateData);
    
    console.log(`✅ Consulta ${consultationId} finalizada com sucesso`);
    
  } catch (error) {
    console.error("❌ Erro ao finalizar consulta:", error);
    throw error;
  }
};

/**
 * Busca dados da consulta
 */
export const getConsultationData = async (consultationId: string): Promise<ConsultationData | null> => {
  try {
    const consultationRef = doc(db, "consultas", consultationId);
    const consultationDoc = await getDoc(consultationRef);
    
    if (consultationDoc.exists()) {
      return consultationDoc.data() as ConsultationData;
    }
    
    return null;
    
  } catch (error) {
    console.error("❌ Erro ao buscar dados da consulta:", error);
    throw error;
  }
};

/**
 * Gera ID único para consulta
 */
export const generateConsultationId = (): string => {
  return `consulta_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};
