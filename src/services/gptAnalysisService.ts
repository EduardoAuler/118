import OpenAI from "openai";

// Configurar OpenAI com a chave da variável de ambiente
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

export interface PostureImage {
  planeId: string;
  imageData: string;
  description: string;
}

export interface GPTAnalysisResult {
  overallAssessment: string;
  specificFindings: {
    [planeId: string]: {
      findings: string[];
      recommendations: string[];
      severity: 'low' | 'moderate' | 'high';
    };
  };
  generalRecommendations: string[];
  riskFactors: string[];
  followUpActions: string[];
}

/**
 * Analisa imagens posturais com GPT Vision
 */
export const analyzePostureWithGPT = async (
  images: PostureImage[],
  patientData?: any
): Promise<GPTAnalysisResult> => {
  // Verificar se a chave da API está configurada
  if (!process.env.REACT_APP_OPENAI_API_KEY) {
    throw new Error("Chave OpenAI não configurada. Configure REACT_APP_OPENAI_API_KEY no arquivo .env");
  }

  try {
    console.log("🤖 Iniciando análise com GPT Vision...");
    console.log(`📸 Analisando ${images.length} imagens`);

    // Preparar mensagens para o GPT
    const messages: any[] = [
      {
        role: "system",
        content: `Você é um especialista em posturologia e análise postural. Analise as imagens fornecidas que mostram o esqueleto humano detectado por IA em diferentes planos (frontal, posterior, sagital, etc.).

INSTRUÇÕES:
1. Analise cada imagem individualmente, identificando desvios posturais
2. Avalie alinhamentos, simetrias e assimetrias
3. Identifique possíveis causas e riscos à saúde
4. Forneça recomendações específicas para cada plano
5. Dê uma avaliação geral da postura
6. Responda em português brasileiro, de forma clara e técnica

CRITÉRIOS DE ANÁLISE:
- Alinhamento da cabeça, ombros, coluna e pélvis
- Simetria bilateral
- Curvaturas da coluna vertebral
- Posicionamento dos pés e tornozelos
- Equilíbrio postural geral
- Sinais de compensações musculares

FORMATO DA RESPOSTA:
Forneça uma análise estruturada com:
1. Avaliação geral
2. Achados específicos por plano
3. Recomendações gerais
4. Fatores de risco
5. Ações de acompanhamento`
      }
    ];

    // Adicionar cada imagem como mensagem
    images.forEach((image, index) => {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `Imagem ${index + 1}: ${image.description} (${image.planeId})`
          },
          {
            type: "image_url",
            image_url: {
              url: image.imageData,
              detail: "high"
            }
          }
        ]
      });
    });

    // Adicionar dados do paciente se disponíveis
    if (patientData) {
      messages.push({
        role: "user",
        content: `Dados adicionais do paciente:
- Tamanho do pé: ${patientData.footSize || 'Não informado'}
- Tipo de arco plantar esquerdo: ${patientData.leftArchType || 'Não avaliado'}
- Tipo de arco plantar direito: ${patientData.rightArchType || 'Não avaliado'}
- Escápula: ${patientData.scapula || 'Não avaliado'}
- Pélvis: ${patientData.pelve || 'Não avaliado'}
- Características da palmilha: ${JSON.stringify(patientData.insoleCharacteristics || {})}

Use essas informações para contextualizar sua análise.`
      });
    }

    // Chamar GPT Vision API - usando o modelo atual gpt-4o
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 2000,
      temperature: 0.3
    });

    const analysisText = response.choices[0].message.content;
    console.log("✅ Análise GPT concluída");

    // Processar resposta e estruturar dados
    return processGPTResponse(analysisText!, images);

  } catch (error) {
    console.error("❌ Erro na análise GPT:", error);
    
    // Tratamento específico para diferentes tipos de erro
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        throw new Error("Modelo GPT não encontrado. Verifique se o modelo está disponível.");
      } else if (error.message.includes('401')) {
        throw new Error("Chave API inválida. Verifique sua chave OpenAI.");
      } else if (error.message.includes('429')) {
        throw new Error("Limite de taxa excedido. Tente novamente em alguns minutos.");
      } else if (error.message.includes('insufficient_quota')) {
        throw new Error("Cota insuficiente. Verifique seu plano OpenAI.");
      } else {
        throw new Error("Falha na análise com GPT: " + error.message);
      }
    } else {
      throw new Error("Falha na análise com GPT: Erro desconhecido");
    }
  }
};

/**
 * Processa a resposta do GPT e estrutura os dados
 */
const processGPTResponse = (response: string, images: PostureImage[]): GPTAnalysisResult => {
  try {
    // Parse básico da resposta (pode ser melhorado com regex mais específico)
    const lines = response.split('\n').filter(line => line.trim());
    
    // Estrutura padrão para casos onde o parsing falha
    const defaultResult: GPTAnalysisResult = {
      overallAssessment: response,
      specificFindings: {},
      generalRecommendations: [],
      riskFactors: [],
      followUpActions: []
    };

    // Tentar extrair seções específicas
    let currentSection = 'overall';
    const sections: { [key: string]: string[] } = {
      overall: [],
      recommendations: [],
      risks: [],
      followUp: []
    };

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('avaliação geral') || lowerLine.includes('análise geral')) {
        currentSection = 'overall';
      } else if (lowerLine.includes('recomendação') || lowerLine.includes('sugestão')) {
        currentSection = 'recommendations';
      } else if (lowerLine.includes('risco') || lowerLine.includes('fator')) {
        currentSection = 'risks';
      } else if (lowerLine.includes('acompanhamento') || lowerLine.includes('seguimento')) {
        currentSection = 'followUp';
      } else if (line.trim()) {
        sections[currentSection].push(line.trim());
      }
    }

    // Processar achados específicos por plano
    const specificFindings: { [planeId: string]: any } = {};
    images.forEach(image => {
      specificFindings[image.planeId] = {
        findings: [`Análise específica para ${image.description}`],
        recommendations: [`Recomendações específicas para ${image.planeId}`],
        severity: 'moderate' as const
      };
    });

    return {
      overallAssessment: sections.overall.join('\n') || response,
      specificFindings,
      generalRecommendations: sections.recommendations,
      riskFactors: sections.risks,
      followUpActions: sections.followUp
    };

  } catch (error) {
    console.error("❌ Erro ao processar resposta GPT:", error);
    return {
      overallAssessment: response,
      specificFindings: {},
      generalRecommendations: [],
      riskFactors: [],
      followUpActions: []
    };
  }
};

/**
 * Coleta imagens com esqueleto do patientData
 */
export const collectPostureImages = (patientData: any): PostureImage[] => {
  const images: PostureImage[] = [];
  
  const imageFields = [
    { key: 'frontalPhoto', planeId: 'frontal', description: 'Vista Frontal - Anterior' },
    { key: 'posteriorPhoto', planeId: 'posterior', description: 'Vista Posterior - Posterior' },
    { key: 'sagittalPhoto', planeId: 'sagittal', description: 'Vista Sagital - Lateral' },
    { key: 'inferiorPhoto', planeId: 'inferior', description: 'Vista Inferior - Plantar' },
    { key: 'topPhoto', planeId: 'top', description: 'Vista Superior - Transversal' }
  ];

  imageFields.forEach(field => {
    const imageData = patientData[field.key];
    
    if (imageData && imageData.includes('data:image')) {
      images.push({
        planeId: field.planeId,
        imageData: imageData,
        description: field.description
      });
    }
  });
  return images;
};

/**
 * Analisa postura completa com GPT
 */
export const performCompletePostureAnalysis = async (patientData: any): Promise<GPTAnalysisResult> => {
  try {
    console.log("🔍 Iniciando análise postural completa com GPT...");
    
    // Coletar imagens disponíveis
    const images = collectPostureImages(patientData);
    
    if (images.length === 0) {
      throw new Error("Nenhuma imagem com esqueleto encontrada para análise");
    }

    // Realizar análise
    const result = await analyzePostureWithGPT(images, patientData);
    
    console.log("✅ Análise postural completa finalizada");
    return result;

  } catch (error) {
    console.error("❌ Erro na análise postural completa:", error);
    throw error;
  }
};
