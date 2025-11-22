
import { GoogleGenAI } from "@google/genai";

// Déclaration pour TypeScript de la variable injectée par Vite
declare const __APP_API_KEY__: string;

// Récupération robuste de la clé API
const getApiKey = (): string => {
  if (typeof __APP_API_KEY__ !== 'undefined' && __APP_API_KEY__) {
    return __APP_API_KEY__;
  }
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return '';
};

const API_KEY = getApiKey();

// LOG DE DÉBOGAGE
console.log(
  "%c🔑 CONFIGURATION API", 
  "background: #000; color: #e6dac3; padding: 4px; font-weight: bold;",
  API_KEY ? `Clé détectée (longueur: ${API_KEY.length})` : "❌ CLÉ MANQUANTE"
);

const ai = new GoogleGenAI({ apiKey: API_KEY });

// PROMPT COMMUN
const createPrompt = (gemData: any) => `
  TU ES UN EXPERT GEMMOLOGUE POUR LA MAISON IDRIS.
  TON BUT EST DE GÉNÉRER UNE FICHE TECHNIQUE POUR UN CLIENT PUBLIC.

  DONNÉES D'ENTRÉE :
  ${JSON.stringify(gemData, null, 2)}

  RÈGLES DE FORMATAGE STRICTES (ESPAGNOL) :
  1. PREMIÈRE LIGNE (TITRE) : [NOM DE LA GEMME] [NATURAL ou DE CULTIVO] (Majuscules).
     - Si Qty >= 2, pluriel (RUBIS, ZAFIROS).
     - Creation='Natural' -> "NATURAL(ES)".
     - Creation='Lab/Synth' -> "DE CULTIVO".

  2. LISTE TECHNIQUE (Format exact, espagnol, pas de markdown superflu) :
  🔬 Claridad: [Valeur]
  🎨 Color: [Valeur] (Si pertinent)
  📐 Corte: [Valeur]
  📏 Dimensiones: [Valeur]
  🌍 Origen: [Valeur]
  ⚖️ Peso: [Valeur] ct
  🧴 Tratamientos: [Valeur] (Si 'None'/'O', 'Ninguno')
  📄 Certificado: [Valeur]
  🔖 Ref: [Valeur]

  SOIS ULTRA RAPIDE ET CONCIS. PAS D'INTRO, PAS DE CONCLUSION.
`;

export const generateGemstoneDescription = async (gemData: any): Promise<string> => {
  if (!API_KEY) {
    console.error("❌ ERREUR CRITIQUE : Clé API manquante.");
    throw new Error("Clé API manquante.");
  }

  try {
    const prompt = createPrompt(gemData);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.1,
        topK: 1,
        topP: 0.1,
      }
    });

    return response.text || "Fiche non disponible.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(`Erreur de génération : ${error.message}`);
  }
};

export const sendMessageToGemini = async (message: string, history: any[]): Promise<string> => {
  if (!API_KEY) return "Erreur: Clé API manquante.";
  
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
    });

    const response = await chat.sendMessage({ message });
    return response.text || "";
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    throw new Error(`Erreur dans le chat : ${error.message}`);
  }
};
