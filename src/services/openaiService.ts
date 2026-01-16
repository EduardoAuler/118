import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.REACT_APP_OPENAI_API_KEY || "",
	dangerouslyAllowBrowser: true,
});

export async function getChatCompletion(prompt: string) {
	if (!process.env.REACT_APP_OPENAI_API_KEY) {
		throw new Error("Chave OpenAI não configurada. Configure REACT_APP_OPENAI_API_KEY no arquivo .env");
	}

	const response = await openai.chat.completions.create({
		model: "gpt-4o",
		messages: [{ role: "user", content: prompt }],
		max_tokens: 1500,
		temperature: 0.3
	});
	return response.choices[0].message.content;
}

export async function analyzePosture(points: any[]) {
	const prompt = `Você é um especialista em posturologia e análise postural. Analise os seguintes pontos do corpo humano (keypoints) extraídos de uma foto de avaliação postural.

Cada ponto tem nome, x, y e score (confiança da detecção).

INSTRUÇÕES:
1. Identifique possíveis desvios posturais baseado nos pontos detectados
2. Avalie alinhamentos, simetrias e assimetrias
3. Identifique riscos à saúde relacionados à postura
4. Forneça recomendações específicas
5. Responda em português brasileiro, de forma clara e técnica

Pontos detectados:
${JSON.stringify(points, null, 2)}

Forneça uma análise detalhada e estruturada.`;

	try {
		return await getChatCompletion(prompt);
	} catch (error) {
		console.error("❌ Erro na análise postural:", error);
		if (error instanceof Error) {
			throw new Error("Falha na análise postural: " + error.message);
		}
		throw new Error("Falha na análise postural: Erro desconhecido");
	}
}
