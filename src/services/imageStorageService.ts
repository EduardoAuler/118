import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseconfig";

/**
 * Converte uma imagem base64 para Blob
 */
const base64ToBlob = (base64: string): Blob => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Salva uma imagem com pontos no Firebase Storage
 */
export const saveImageWithPoints = async (
  imageData: string,
  patientId: string,
  planeId: string,
  consultationId?: string
): Promise<string> => {
  try {
    console.log(`💾 Salvando imagem ${planeId} para paciente ${patientId}...`);
    
    // Converter base64 para Blob
    const blob = base64ToBlob(imageData);
    
    // Gerar nome único para o arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `posture-analysis/${patientId}/${planeId}-${timestamp}.png`;
    
    // Referência no Storage
    const imageRef = ref(storage, fileName);
    
    // Upload da imagem
    const snapshot = await uploadBytes(imageRef, blob, {
      contentType: 'image/png',
      customMetadata: {
        patientId,
        planeId,
        consultationId: consultationId || 'draft',
        timestamp: new Date().toISOString(),
        hasPoints: 'true'
      }
    });
    
    // Obter URL de download
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`✅ Imagem salva com sucesso: ${downloadURL}`);
    return downloadURL;
    
  } catch (error) {
    console.error("❌ Erro ao salvar imagem no Storage:", error);
    throw new Error("Falha ao salvar imagem no Storage");
  }
};

/**
 * Salva múltiplas imagens de uma consulta
 */
export const saveConsultationImages = async (
  images: { [key: string]: string },
  patientId: string,
  consultationId?: string
): Promise<{ [key: string]: string }> => {
  const savedImages: { [key: string]: string } = {};
  
  try {
    console.log(`📸 Salvando ${Object.keys(images).length} imagens da consulta...`);
    
    // Salvar cada imagem em paralelo
    const savePromises = Object.entries(images).map(async ([planeId, imageData]) => {
      if (imageData && imageData.includes('data:image')) {
        const url = await saveImageWithPoints(imageData, patientId, planeId, consultationId);
        return { planeId, url };
      }
      return null;
    });
    
    const results = await Promise.all(savePromises);
    
    // Organizar resultados
    results.forEach(result => {
      if (result) {
        savedImages[result.planeId] = result.url;
      }
    });
    
    console.log(`✅ ${Object.keys(savedImages).length} imagens salvas com sucesso`);
    return savedImages;
    
  } catch (error) {
    console.error("❌ Erro ao salvar imagens da consulta:", error);
    throw error;
  }
};

/**
 * Gera uma imagem com pontos desenhados a partir de uma imagem base
 */
export const generateImageWithPoints = async (
  baseImageData: string,
  bodyPoints: any[],
  connections: [string, string][]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Configurar canvas com dimensões da imagem
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          // Desenhar imagem base
          ctx.drawImage(img, 0, 0);
          
          // Desenhar conexões (esqueleto)
          connections.forEach(([point1Name, point2Name]) => {
            const point1 = bodyPoints.find(p => p.name === point1Name);
            const point2 = bodyPoints.find(p => p.name === point2Name);

            if (point1 && point2) {
              ctx.beginPath();
              ctx.moveTo(point1.x, point1.y);
              ctx.lineTo(point2.x, point2.y);
              ctx.strokeStyle = "#00ff00";
              ctx.lineWidth = 3;
              ctx.stroke();
            }
          });

          // Desenhar pontos
          bodyPoints.forEach((point) => {
            // Círculo do ponto
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = "#00ff00";
            ctx.fill();
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Label do ponto
            if (point.name) {
              ctx.fillStyle = "#ffffff";
              ctx.font = "bold 12px Arial";
              
              // Fundo do texto
              const textWidth = ctx.measureText(point.name).width;
              ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
              ctx.fillRect(point.x + 10, point.y - 25, textWidth + 6, 16);
              
              // Texto
              ctx.fillStyle = "#ffffff";
              ctx.fillText(point.name, point.x + 13, point.y - 13);
            }
          });
          
          // Converter para base64
          resolve(canvas.toDataURL('image/png', 0.9));
        } else {
          reject(new Error("Não foi possível obter contexto do canvas"));
        }
      };
      
      img.onerror = () => reject(new Error("Erro ao carregar imagem"));
      img.src = baseImageData;
      
    } catch (error) {
      reject(error);
    }
  });
};

