
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, Node2D } from "../types";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Robust wrapper for generating content with exponential backoff for 429 errors.
 */
async function generateWithRetry(params: any, retries = 3, initialDelay = 2000): Promise<GenerateContentResponse> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent(params);
      return response;
    } catch (error: any) {
      lastError = error;
      // Check if it's a rate limit error (429)
      if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
        const waitTime = initialDelay * Math.pow(2, i);
        console.warn(`Rate limit hit. Retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }
      throw error; // If it's another error, throw immediately
    }
  }
  throw lastError;
}

/**
 * Communicates with the Gemini 3 Flash model to provide responsive physics analysis.
 * Uses gemini-3-flash-preview for high speed and better quota management for common tasks.
 */
export const askE8Expert = async (messages: ChatMessage[]) => {
  try {
    const history = messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));
    
    const latestMessage = messages[messages.length - 1].content;

    const response = await generateWithRetry({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: latestMessage }] }
      ],
      config: {
        systemInstruction: `You are an expert theoretical physicist specializing in E8 Lie groups and quantum gravity. 
        Focus on:
        - Spacetime emergence from entanglement (MERA).
        - Holographic principle and renormalization.
        - Gosset Polytope (4_21) and E8 root systems.
        Use LaTeX for equations. Be brief and highly technical.`,
        temperature: 0.7,
        // Using a minimal thinking budget to reduce token pressure and potential 429s.
        thinkingConfig: { thinkingBudget: 0 } 
      },
    });

    return response.text || "Connection lost to the E8 manifold. Please recalibrate.";
  } catch (error: any) {
    console.error("Gemini Assistant Error:", error);
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      return "The Nexus manifold is currently saturated (Rate Limit Exceeded). Please wait a few moments for the fields to stabilize.";
    }
    return "Lattice symmetry breach detected. Error communicating with the AI observer.";
  }
};

/**
 * Simulates interactions between particle representations of E8 roots.
 */
export const simulateInteraction = async (particles: Node2D[]) => {
  const particleData = particles.map((p, i) => 
    `Particle ${i + 1} (${p.original.category}): Root Vector [${p.original.coords.join(', ')}]`
  ).join('\n');

  try {
    const response = await generateWithRetry({
      model: "gemini-3-flash-preview",
      contents: `Perform a quantum interaction simulation between these E8 root states:\n${particleData}`,
      config: {
        systemInstruction: `Calculate vector sums for E8 roots. Provide physical interpretations like gluon emission or gauge transformation based on root properties. Format: [RESULT], [INTERPRETATION].`,
        temperature: 0.1,
      },
    });
    return response.text;
  } catch (error: any) {
    console.error("Simulation Error:", error);
    if (error.message?.includes("429")) {
       return "Collision quota exhausted. High-energy calculations are suspended temporarily.";
    }
    return "Simulation failed: Quantum coherence lost.";
  }
};
