const GEMINI_API_KEY = "AIzaSyCsv7OIC2uJUGP1BB-EVfgfScxY2mOyZ4k";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export interface GeminiMessage {
  role?: "user" | "model";
  parts: { text: string }[];
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
      role: string;
    };
    finishReason: string;
    index: number;
  }[];
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GeminiService {
  private apiKey: string;

  constructor() {
    this.apiKey = GEMINI_API_KEY;
  }

  async sendMessage(messages: GeminiMessage[]): Promise<string> {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || "Desculpe, não consegui gerar uma resposta.";
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw new Error("Falha ao conectar com o serviço de IA. Tente novamente.");
    }
  }

  async generateImage(prompt: string): Promise<string> {
    // Nota: A API do Gemini 2.0 Flash não suporta geração de imagens diretamente
    // Esta função é um placeholder para uma implementação futura ou integração com outro serviço
    throw new Error("Geração de imagens não está disponível no momento. Use o Mistral para solicitar descrições detalhadas de imagens.");
  }
}

export const geminiService = new GeminiService();