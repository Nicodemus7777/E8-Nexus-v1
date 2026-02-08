
import { ChatMessage, Node2D } from "../types";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Mock responses for development - no API costs!
 */
const mockE8Responses = [
  "The E8 root system exhibits 240 simple roots organized within an 8-dimensional lattice. Your interaction pattern suggests a gauge transformation consistent with $SU(2) \\subset E8$ reduction.",
  "The Gosset 4₂₁ polytope represents the even coordinate system of E8. This projection breaks the original 248-dimensional symmetry into observable subgroups. The selected vertices correspond to positive roots in the $D_8$ sublattice.",
  "Through the holographic principle, boundary entanglement entropy scales with surface area. MERA (Multiscale Entanglement Renormalization Ansatz) describes how entanglement patterns encode bulk geometry. Your current configuration exhibits $S = \\frac{kA}{4\\ell_p^2}$ scaling.",
  "The topological defect you've injected breaks discrete symmetry within the E8 lattice. Depending on its winding number, this could produce either a gauge boson or a cosmological monopole. The strength parameter modulates the defect's coupling to the vacuum expectation value.",
  "Interesting choice. The projection matrix you're using corresponds to the maximal torus of E8, reducing the structure to $U(1)^8$. This is equivalent to a Cartan decomposition where roots become U(1) charges.",
  "MERA provides a hierarchical encoding of quantum entanglement. Each lattice layer represents a renormalization group flow. Decreasing the bulk curvature parameter increases the AdS-like geometry, enhancing scale separation.",
  "The Petrie projection of E8 reveals the quasicrystalline structure underlying spacetime emergence. The 240 roots form projection patterns that exhibit long-range order without translational symmetry—analogous to Penrose tilings in higher dimensions."
];

const mockSimulationResponses = [
  "[RESULT] Resonant decay cascade: Primary vertex emits 3 secondary gluons at 120° angles. [INTERPRETATION] The root vectors form a closed triad under E8 addition, indicating a stable confinement channel. Expect minimal energy loss.",
  "[RESULT] Topological annihilation detected. Particles coalesce at the origin of the root lattice. [INTERPRETATION] This represents a vacuum fluctuation; the interaction conserves helicity and breaks no gauge symmetries. Cross-section scales as $\\sigma \\propto s^{-1}$.",
  "[RESULT] Scattering angle θ = 45.6°, momentum transfer q = 0.73. [INTERPRETATION] Non-resonant elastic collision in the E8 root space. Both particles remain on the mass shell, indicating a gauge-preserving interaction.",
  "[RESULT] Pair production event: 2 new particles emerge from the collision. [INTERPRETATION] The interaction energy exceeded the mass threshold for the next E8 sublattice tier. Decay products align with $SU(3)$ subroots.",
  "[RESULT] Inverse kinematics solution yields 8 possible final states. [INTERPRETATION] The 8-fold multiplicity reflects E8's rank. Each state corresponds to distinct values of the Cartan subalgebra charges \\{h₁...h₈\\}."
];

/**
 * Mock E8 expert responses - zero API costs!
 */
export const askE8Expert = async (messages: ChatMessage[]) => {
  // Simulate network delay for realism
  await delay(Math.random() * 800 + 200);
  
  const response = mockE8Responses[Math.floor(Math.random() * mockE8Responses.length)];
  console.log("[MOCK MODE] E8 Expert response generated locally - no API costs!");
  return response;
};

/**
 * Mock particle interaction simulation - zero API costs!
 */
export const simulateInteraction = async (particles: Node2D[]) => {
  // Simulate computation delay
  await delay(Math.random() * 1200 + 400);
  
  const response = mockSimulationResponses[Math.floor(Math.random() * mockSimulationResponses.length)];
  console.log(`[MOCK MODE] Simulated interaction for ${particles.length} particles - no API costs!`);
  return response;
};
