
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, Node2D } from "../types";

/**
 * Communicates with the Gemini 3 Pro model to provide expert physics analysis.
 */
export const askE8Expert = async (messages: ChatMessage[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const history = messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));
    
    const latestMessage = messages[messages.length - 1].content;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: latestMessage }] }
      ],
      config: {
        systemInstruction: `You are an expert theoretical physicist specializing in Lie algebras, E8 symmetry breaking, and modern quantum gravity theories like the AdS/CFT correspondence and MERA (Multi-scale Entanglement Renormalization Ansatz). 
        You are part of the 'Symmetry Hunter' community cloud. 
        1. When MERA mode is discussed, explain how spacetime geometry emerges from the entanglement entropy of the E8 lattice.
        2. Discuss the holographic principle: how 8D root interactions on a 2D boundary construct a 3D bulk interior.
        3. Explain the significance of renormalization scales in the context of tensor networks.
        4. Discuss Quantum Entanglement as the primary 'glue' of geometry.
        Provide rigorous but inspiring analysis. Use LaTeX for math.`,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    return response.text || "I am reflecting on the symmetries of the lattice... please try again.";
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    return "The symmetry seems to be temporarily broken. Ensure the lattice connectivity is stable.";
  }
};

/**
 * Simulates interactions between particle representations of E8 roots.
 */
export const simulateInteraction = async (particles: Node2D[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const particleData = particles.map((p, i) => 
    `Particle ${i + 1} (${p.original.category}): Root Vector [${p.original.coords.join(', ')}]`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Perform a quantum interaction simulation between these E8 root states:\n${particleData}`,
      config: {
        systemInstruction: `You are a Particle Physics Interaction Simulator. 
        Given E8 roots:
        1. Calculate the vector sum/difference (root addition).
        2. Determine if the result maps to an E8 root, a Cartan generator (0-vector), or a non-root state.
        3. Provide a physical interpretation (e.g., gluon emission, annihilation, or gauge boson interaction).
        4. If MERA mode is active, interpret the result as a change in the local entanglement bond strength.
        Format with sections: [MATHEMATICAL RESULT], [PHYSICAL INTERPRETATION], [FIELD DYNAMICS].`,
        temperature: 0.3,
        thinkingConfig: { thinkingBudget: 2000 }
      },
    });
    return response.text;
  } catch (error) {
    console.error("Simulation Error:", error);
    return "Interaction failed: The energy density exceeded stability limits.";
  }
};
