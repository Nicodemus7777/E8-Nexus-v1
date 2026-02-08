
import { Vector8D, Node2D } from '../types';

class SymmetryAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private oscillators: Map<number, { osc: OscillatorNode; gain: GainNode }> = new Map();
  private isStarted = false;

  private init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.filter = this.ctx.createBiquadFilter();

    this.filter.type = 'lowpass';
    this.filter.frequency.value = 1200;
    this.filter.Q.value = 5;

    this.masterGain.connect(this.filter);
    this.filter.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.15;
    this.isStarted = true;
  }

  public toggle(on: boolean) {
    if (on) {
      this.init();
      if (this.ctx?.state === 'suspended') this.ctx.resume();
    } else {
      this.ctx?.suspend();
    }
  }

  /**
   * Plays a unique harmonic chord based on the 8D root vector.
   * Each coordinate c_i influences the amplitude/frequency of the i-th partial.
   */
  public sonifyNode(node: Node2D) {
    if (!this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;
    const coords = node.original.coords;
    const baseFreq = 110; // Low A

    // Create a temporary synth voice
    const voiceGain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner();
    
    // Map X position to Pan [-1, 1]
    panner.pan.value = Math.max(-1, Math.min(1, node.x / 2));
    voiceGain.connect(panner);
    panner.connect(this.filter!);

    voiceGain.gain.setValueAtTime(0, now);
    voiceGain.gain.linearRampToValueAtTime(0.1, now + 0.05);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

    coords.forEach((c, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const harmonic = i + 1;
      
      // Frequency is influenced by the coordinate value
      // c is usually 0, 0.5, 1, -0.5, -1
      const freq = baseFreq * harmonic * (1 + (c * 0.05));
      
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      
      const partialGain = this.ctx.createGain();
      // Only active partials if coordinate is non-zero
      partialGain.gain.value = Math.abs(c) * 0.5;

      osc.connect(partialGain);
      partialGain.connect(voiceGain);
      
      osc.start(now);
      osc.stop(now + 1.6);
    });
  }

  /**
   * Updates background resonance based on lattice rotation
   */
  public updateAmbientDrone(angle: number) {
    if (!this.filter) return;
    // Map rotation angle to filter cutoff
    const cutoff = 800 + (Math.sin(angle) * 400);
    this.filter.frequency.setTargetAtTime(cutoff, this.ctx!.currentTime, 0.1);
  }
}

export const audioEngine = new SymmetryAudioEngine();
