import {
  DRUM_LIMB_META,
  SCALE_GUIDE_CATALOG,
  analyzePedalInterval,
  assignGuitarChordFingers,
  buildScaleFretboardPath,
  classifyVocalRangeDetailed,
  computeChordNeckState,
  computeEffectiveExplorerInstrument,
  createPitchAcuityRound,
  getVisualInstrumentFocus,
  identifyGuitarChordFromFrets,
  midiToNoteName,
  renderTopViewDrumKitSvg,
  resolvePlayableChordVoicing,
  setVisualInstrumentFocus,
  type DrumLimbHit,
} from './music-games-logic';
import {
  type NoteGlowHint,
  type NotePlayEvent,
  attachStudioEnhancements,
  buildStudioDataLabStage,
} from './studio-labs';
import type { DiagramModalManager } from './diagram-modal';

export interface ScaleDefinition {
  id: string;
  name: string;
  intervals: number[];
  formula: string;
  degrees: string;
  character: string;
}

export interface ChordDefinition {
  id: string;
  name: string;
  symbol: string;
  intervals: number[];
  formula: string;
  character: string;
  frets: number[]; // 6 strings: E2 A2 D3 G3 B3 E4 (-1 = muted)
}

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_LABELS = [
  'C (Do)',
  'C# / Db',
  'D (Re)',
  'D# / Eb',
  'E (Mi)',
  'F (Fa)',
  'F# / Gb',
  'G (Sol)',
  'G# / Ab',
  'A (La)',
  'A# / Bb',
  'B (Si)',
];

// Standard 6-string guitar tuning from 1st string (high e4) to 6th string (low E2)
export const GUITAR_STRINGS = [
  { label: 'e (1ª)', openMidi: 64 }, // E4
  { label: 'B (2ª)', openMidi: 59 }, // B3
  { label: 'G (3ª)', openMidi: 55 }, // G3
  { label: 'D (4ª)', openMidi: 50 }, // D3
  { label: 'A (5ª)', openMidi: 45 }, // A2
  { label: 'E (6ª)', openMidi: 40 }, // E2
];

// Dedicated 4-string electric bass tuning from 1st string (G2) to 4th string (low E1)
export const BASS_STRINGS = [
  { label: 'G (1ª)', openMidi: 43, thickness: '2px' },   // G2 (98.0 Hz)
  { label: 'D (2ª)', openMidi: 38, thickness: '2.5px' }, // D2 (73.4 Hz)
  { label: 'A (3ª)', openMidi: 33, thickness: '3px' },   // A1 (55.0 Hz)
  { label: 'E (4ª)', openMidi: 28, thickness: '3.6px' }, // E1 (41.2 Hz)
];

export const SCALES_DB: ScaleDefinition[] = [
  {
    id: 'major',
    name: 'Mayor Natural (Jónica) [2-2-1-2-2-2-1]',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    formula: 'T - T - S - T - T - T - S',
    degrees: '1 - 2 - 3 - 4 - 5 - 6 - 7',
    character: 'Sonoridad brillante, optimista, estable y resolutiva.',
  },
  {
    id: 'minor',
    name: 'Menor Natural (Eólica) [2-1-2-2-1-2-2]',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    formula: 'T - S - T - T - S - T - T',
    degrees: '1 - 2 - b3 - 4 - 5 - b6 - b7',
    character: 'Sonoridad melancólica, introspectiva, épica y emotiva.',
  },
  {
    id: 'pent_minor',
    name: 'Pentatónica Menor / Andina (Quena) [3-2-2-3-2]',
    intervals: [0, 3, 5, 7, 10],
    formula: '1.5T - T - T - 1.5T - T',
    degrees: '1 - b3 - 4 - 5 - b7',
    character: 'Directa, sin semitonos conflictivos; base del rock, blues y música andina.',
  },
  {
    id: 'pent_major',
    name: 'Pentatónica Mayor [2-2-3-2-3]',
    intervals: [0, 2, 4, 7, 9],
    formula: 'T - T - 1.5T - T - 1.5T',
    degrees: '1 - 2 - 3 - 5 - 6',
    character: 'Luminosa, pastoral, folk, country y melodías pop universales.',
  },
  {
    id: 'blues',
    name: 'Escala de Blues (Hexatónica) [3-2-1-1-3-2]',
    intervals: [0, 3, 5, 6, 7, 10],
    formula: '1.5T - T - S - S - 1.5T - T',
    degrees: '1 - b3 - 4 - b5 (Blue Note) - 5 - b7',
    character: 'Rugosa y expresiva gracias a la Blue Note (b5) cromática.',
  },
  {
    id: 'dorian',
    name: 'Modo Dórico (Funk / Santana / Jazz) [2-1-2-2-2-1-2]',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    formula: 'T - S - T - T - T - S - T',
    degrees: '1 - 2 - b3 - 4 - 5 - 6 - b7',
    character: 'Menor sofisticado y urbano con sexta mayor luminosa (nota característica: 6).',
  },
  {
    id: 'phrygian',
    name: 'Modo Frigio (Flamenco / Metal) [1-2-2-2-1-2-2]',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    formula: 'S - T - T - T - S - T - T',
    degrees: '1 - b2 - b3 - 4 - 5 - b6 - b7',
    character: 'Oscuro, tenso e hipnótico por el semitono inmediato entre 1 y b2.',
  },
  {
    id: 'lydian',
    name: 'Modo Lidio (Cine / Sueño Espacial) [2-2-2-1-2-2-1]',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    formula: 'T - T - T - S - T - T - S',
    degrees: '1 - 2 - 3 - #4 - 5 - 6 - 7',
    character: 'Mágico, flotante, sobrecogedor y cinematográfico (#4 elimina la gravedad).',
  },
  {
    id: 'mixolydian',
    name: 'Modo Mixolidio (Rock / Groove / Funk) [2-2-1-2-2-1-2]',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    formula: 'T - T - S - T - T - S - T',
    degrees: '1 - 2 - 3 - 4 - 5 - 6 - b7',
    character: 'Mayor con actitud blues/rock gracias a la séptima menor (b7).',
  },
  {
    id: 'harmonic_minor',
    name: 'Menor Armónica (Clásico / Tango / Salsa) [2-1-2-2-1-3-1]',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    formula: 'T - S - T - T - S - 1.5T - S',
    degrees: '1 - 2 - b3 - 4 - 5 - b6 - 7',
    character: 'Dramática y pasional; crea el acorde V7 dominante y la segunda aumentada (b6-7).',
  },
  {
    id: 'melodic_minor',
    name: 'Menor Melódica (Jazz Moderno / Cine) [2-1-2-2-2-2-1]',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    formula: 'T - S - T - T - T - T - S',
    degrees: '1 - 2 - b3 - 4 - 5 - 6 - 7',
    character: 'Híbrida: tercera menor abajo y tetracordio mayor arriba.',
  },
  {
    id: 'phrygian_dom',
    name: 'Frigia Dominante (Flamenco / Árabe) [1-3-1-2-1-2-2]',
    intervals: [0, 1, 4, 5, 7, 8, 10],
    formula: 'S - 1.5T - S - T - S - T - T',
    degrees: '1 - b2 - 3 - 4 - 5 - b6 - b7',
    character: 'Exótica, solemne y ardiente; quinto modo de la menor armónica.',
  },
  {
    id: 'double_harmonic',
    name: 'Doble Armónica / Bizantina [1-3-1-2-1-3-1]',
    intervals: [0, 1, 4, 5, 7, 8, 11],
    formula: 'S - 1.5T - S - T - S - 1.5T - S',
    degrees: '1 - b2 - 3 - 4 - 5 - b6 - 7',
    character: 'Dos segundas aumentadas; sonoridad oriental intensa.',
  },
  {
    id: 'hirajoshi',
    name: 'Pentatónica Japonesa (Hirajoshi) [2-1-4-1-4]',
    intervals: [0, 2, 3, 7, 8],
    formula: 'T - S - 2T - S - 2T',
    degrees: '1 - 2 - b3 - 5 - b6',
    character: 'Contemplativa, cristalina y misteriosa, inspirada en el koto japonés.',
  },
  {
    id: 'whole_tone',
    name: 'Tonos Enteros (Impresionista / Flotante) [2-2-2-2-2-2]',
    intervals: [0, 2, 4, 6, 8, 10],
    formula: 'T - T - T - T - T - T',
    degrees: '1 - 2 - 3 - #4 - #5 - b7',
    character: 'Simétrica y sin centro gravitacional; atmósfera onírica (Debussy).',
  },
];

export const CHORDS_DB: ChordDefinition[] = [
  {
    id: 'maj',
    name: 'Tríada Mayor',
    symbol: '',
    intervals: [0, 4, 7],
    formula: '1 - 3 - 5',
    character: 'Estable, luminoso, afirmativo.',
    frets: [-1, 3, 2, 0, 1, 0],
  },
  {
    id: 'min',
    name: 'Tríada Menor',
    symbol: 'm',
    intervals: [0, 3, 7],
    formula: '1 - b3 - 5',
    character: 'Melancólico, serio, íntimo.',
    frets: [-1, 0, 2, 2, 1, 0],
  },
  {
    id: 'dim',
    name: 'Tríada Disminuida',
    symbol: 'dim',
    intervals: [0, 3, 6],
    formula: '1 - b3 - b5',
    character: 'Inestable, tenso, contiene un tritono.',
    frets: [-1, 2, 3, 4, 3, -1],
  },
  {
    id: 'aug',
    name: 'Tríada Aumentada',
    symbol: 'aug',
    intervals: [0, 4, 8],
    formula: '1 - 3 - #5',
    character: 'Flotante, simétrico, suspense cinematográfico.',
    frets: [-1, 3, 2, 1, 1, 0],
  },
  {
    id: 'sus2',
    name: 'Suspendido 2 (sus2)',
    symbol: 'sus2',
    intervals: [0, 2, 7],
    formula: '1 - 2 - 5',
    character: 'Abierto, moderno, cristalino sin tercera.',
    frets: [-1, 3, 0, 0, 1, 3],
  },
  {
    id: 'sus4',
    name: 'Suspendido 4 (sus4)',
    symbol: 'sus4',
    intervals: [0, 5, 7],
    formula: '1 - 4 - 5',
    character: 'Expectante; pide resolver hacia la tercera mayor o menor.',
    frets: [-1, 3, 3, 0, 1, 1],
  },
  {
    id: 'maj7',
    name: 'Séptima Mayor (Maj7)',
    symbol: 'Maj7',
    intervals: [0, 4, 7, 11],
    formula: '1 - 3 - 5 - 7',
    character: 'Nostálgico, sofisticado, bossa nova, jazz y dreampop.',
    frets: [-1, 3, 2, 0, 0, 0],
  },
  {
    id: '7',
    name: 'Dominante (7)',
    symbol: '7',
    intervals: [0, 4, 7, 10],
    formula: '1 - 3 - 5 - b7',
    character: 'Motor de tracción armónica (contiene el tritono entre 3 y b7).',
    frets: [-1, 3, 2, 3, 1, 0],
  },
  {
    id: 'm7',
    name: 'Menor Séptima (m7)',
    symbol: 'm7',
    intervals: [0, 3, 7, 10],
    formula: '1 - b3 - 5 - b7',
    character: 'Suave, cálido, urbano; pilar del soul, funk y ii-V-I.',
    frets: [-1, 0, 2, 0, 1, 0],
  },
  {
    id: 'm7b5',
    name: 'Semidisminuido (m7b5)',
    symbol: 'm7b5',
    intervals: [0, 3, 6, 10],
    formula: '1 - b3 - b5 - b7',
    character: 'Sombrío y romántico; grado ii del modo menor.',
    frets: [-1, 2, 3, 2, 3, -1],
  },
  {
    id: 'dim7',
    name: 'Disminuido Completo (dim7)',
    symbol: 'dim7',
    intervals: [0, 3, 6, 9],
    formula: '1 - b3 - b5 - bb7',
    character: 'Simétrico por terceras menores; puente modulante universal.',
    frets: [-1, 2, 3, 1, 3, -1],
  },
  {
    id: 'mMaj7',
    name: 'Menor Mayor 7 (mMaj7)',
    symbol: 'm(Maj7)',
    intervals: [0, 3, 7, 11],
    formula: '1 - b3 - 5 - 7',
    character: 'Misterioso, cine noir ("acorde Hitchcock").',
    frets: [0, 2, 1, 0, 0, 0],
  },
  {
    id: 'mMaj9',
    name: 'Menor Mayor 9 — "James Bond"',
    symbol: 'm(Maj9)',
    intervals: [0, 3, 7, 11, 14],
    formula: '1 - b3 - 5 - 7 - 9',
    character: 'Cinemático, acorde icónico de espionaje (007) en menor melódica.',
    frets: [0, 2, 1, 0, 0, 2],
  },
  {
    id: 'add9',
    name: 'Mayor add9',
    symbol: 'add9',
    intervals: [0, 4, 7, 14],
    formula: '1 - 3 - 5 - 9',
    character: 'Acústico, expansivo y emotivo sin la densidad de la 7ª.',
    frets: [-1, 3, 2, 0, 3, 0],
  },
  {
    id: '9',
    name: 'Dominante Novena (9)',
    symbol: '9',
    intervals: [0, 4, 7, 10, 14],
    formula: '1 - 3 - 5 - b7 - 9',
    character: 'Funk, soul y blues con color extendido.',
    frets: [-1, 3, 2, 3, 3, 3],
  },
  {
    id: '7#9',
    name: 'Dominante 7(#9) — "Hendrix"',
    symbol: '7(#9)',
    intervals: [0, 4, 7, 10, 15],
    formula: '1 - 3 - 5 - b7 - #9',
    character: 'Disonancia eléctrica agresiva (#9 sobre 3M), sello del blues-rock.',
    frets: [0, 7, 6, 7, 8, 0],
  },
  {
    id: '7b9',
    name: 'Dominante Alterado (7b9)',
    symbol: '7b9',
    intervals: [0, 4, 7, 10, 13],
    formula: '1 - 3 - 5 - b7 - b9',
    character: 'Máxima gravedad hacia acordes menores (bolero, tango, jazz).',
    frets: [-1, 2, 1, 2, 1, -1],
  },
];

interface ActiveVoiceHandle {
  gain: GainNode;
  sources: (OscillatorNode | AudioBufferSourceNode)[];
}

export type DrumKitPieceCode = 'BD' | 'SD' | 'HH' | 'HHP' | 'T1' | 'T2' | 'FT' | 'RD' | 'CR';

export class MusicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterAnalyser: AnalyserNode | null = null;
  private activeVoices: ActiveVoiceHandle[] = [];
  private activeTimers: ReturnType<typeof setTimeout>[] = [];
  private droneHandle: ActiveVoiceHandle | null = null;
  private noteListeners = new Set<(ev: NotePlayEvent | null) => void>();
  private stopListeners = new Set<() => void>();
  private isRunningStopListeners = false;
  private nextChordGroup = 1;

  onNoteEvent(cb: (ev: NotePlayEvent | null) => void): () => void {
    this.noteListeners.add(cb);
    return () => {
      this.noteListeners.delete(cb);
    };
  }

  onStop(cb: () => void): () => void {
    this.stopListeners.add(cb);
    return () => {
      this.stopListeners.delete(cb);
    };
  }

  private emitNoteEvent(ev: NotePlayEvent | null): void {
    this.noteListeners.forEach((cb) => {
      try {
        cb(ev);
      } catch {
        // ignore listener errors
      }
    });
  }

  emitNoteHighlight(midi: number, glowHint?: NoteGlowHint): void {
    this.emitNoteEvent({
      midi,
      durationSec: 1.2,
      instrument: 'guitar',
      ...(glowHint || {}),
    });
  }

  emitChordHighlight(midiNotes: number[], scopeEl?: HTMLElement | null): void {
    if (midiNotes.length === 0) return;
    const chordGroup = this.nextChordGroup++;
    this.emitNoteEvent({
      midi: midiNotes[0],
      durationSec: 1.4,
      instrument: 'guitar',
      isChord: true,
      chordGroup,
      chordBatch: [...midiNotes],
      scopeEl: scopeEl ?? null,
    });
  }

  private scheduleNoteGlow(
    midi: number,
    durationSec: number,
    delaySec: number,
    instrument: string,
    glowHint?: NoteGlowHint
  ): void {
    if (glowHint?.skipGlow) return;
    const payload: NotePlayEvent = { midi, durationSec, instrument, ...(glowHint || {}) };
    if (delaySec <= 0.005) {
      this.emitNoteEvent(payload);
    } else {
      this.schedule(() => {
        this.emitNoteEvent(payload);
      }, delaySec * 1000);
    }
  }

  ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterAnalyser = this.ctx.createAnalyser();
      this.masterAnalyser.fftSize = 2048;
      this.masterAnalyser.smoothingTimeConstant = 0.82;
      this.masterAnalyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  getMasterAnalyser(): AnalyserNode {
    this.ensureContext();
    return this.masterAnalyser!;
  }

  private getDestination(): AudioNode {
    const ctx = this.ensureContext();
    return this.masterAnalyser || ctx.destination;
  }

  midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  isDroneActive(): boolean {
    return this.droneHandle !== null;
  }

  /**
   * Plays an exact frequency in Hz (used for Pitch Acuity Test & Microtonal Cents Comparison)
   */
  playFreqTone(
    freqHz: number,
    duration = 0.95,
    delay = 0,
    volume = 0.26,
    stopPrevious = false
  ): void {
    if (stopPrevious && delay === 0) {
      this.stopAll(true);
    }
    const ctx = this.ensureContext();
    const now = ctx.currentTime + delay;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(volume, now + 0.012);
    masterGain.gain.exponentialRampToValueAtTime(volume * 0.65, now + 0.18);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freqHz, now);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freqHz * 2, now);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.22, now);

    osc1.connect(masterGain);
    osc2.connect(g2);
    g2.connect(masterGain);
    masterGain.connect(this.getDestination());

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.03);
    osc2.stop(now + duration + 0.03);
    this.registerVoice(masterGain, [osc1, osc2]);
  }

  /**
   * Immediately stops all previously playing or scheduled sounds so nothing overlaps!
   */
  stopAll(keepDrone = false): void {
    // Cancel all scheduled JS timers
    this.activeTimers.forEach((t) => clearTimeout(t));
    this.activeTimers = [];
    this.emitNoteEvent(null);

    if (!this.isRunningStopListeners) {
      this.isRunningStopListeners = true;
      try {
        [...this.stopListeners].forEach((cb) => {
          try {
            cb();
          } catch {
            // ignore broken listener
          }
        });
      } finally {
        this.isRunningStopListeners = false;
      }
    }

    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const voicesToStop = this.activeVoices;
    this.activeVoices = [];

    voicesToStop.forEach((v) => {
      try {
        v.gain.gain.cancelScheduledValues(now);
        v.gain.gain.setValueAtTime(Math.max(v.gain.gain.value, 0.0001), now);
        v.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
        setTimeout(() => {
          v.sources.forEach((s) => {
            try {
              s.stop();
              s.disconnect();
            } catch {
              // already stopped
            }
          });
          try {
            v.gain.disconnect();
          } catch {
            // ignore
          }
        }, 25);
      } catch {
        // ignore
      }
    });

    if (!keepDrone && this.droneHandle) {
      this.stopDrone();
    }
  }

  /**
   * Schedule a callback that is automatically cancelled when stopAll() is called
   */
  schedule(fn: () => void, delayMs: number): void {
    if (delayMs <= 0) {
      fn();
      return;
    }
    const id = setTimeout(fn, delayMs);
    this.activeTimers.push(id);
  }

  private registerVoice(gain: GainNode, sources: (OscillatorNode | AudioBufferSourceNode)[]): void {
    this.activeVoices.push({ gain, sources });
    if (this.activeVoices.length > 64) {
      this.activeVoices.shift();
    }
  }

  /**
   * Toggle sustained Tonic Drone for modal & ear training
   */
  toggleDrone(midi: number): boolean {
    if (this.droneHandle) {
      this.stopDrone();
      return false;
    }
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const freq = this.midiToFreq(midi);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.25);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 4, now);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.5, now); // 5th harmonic warmth
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.3, now);

    osc1.connect(filter);
    osc2.connect(g2);
    g2.connect(filter);
    filter.connect(gain);
    gain.connect(this.getDestination());

    osc1.start(now);
    osc2.start(now);
    this.droneHandle = { gain, sources: [osc1, osc2] };
    return true;
  }

  stopDrone(): void {
    if (!this.droneHandle || !this.ctx) return;
    const h = this.droneHandle;
    this.droneHandle = null;
    const now = this.ctx.currentTime;
    try {
      h.gain.gain.cancelScheduledValues(now);
      h.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      setTimeout(() => {
        h.sources.forEach((s) => {
          try {
            s.stop();
          } catch {
            // ignore
          }
        });
      }, 95);
    } catch {
      // ignore
    }
  }

  /**
   * Realistic plucked string synthesis (Guitar)
   */
  playPluckedGuitar(
    midi: number,
    duration = 1.5,
    delay = 0,
    volume = 0.28,
    stopPrevious = true,
    glowHint?: NoteGlowHint
  ): void {
    if (stopPrevious && delay === 0) {
      this.stopAll(true);
    }
    const ctx = this.ensureContext();
    const now = ctx.currentTime + delay;
    const freq = this.midiToFreq(midi);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(volume, now + 0.006);
    masterGain.gain.exponentialRampToValueAtTime(volume * 0.35, now + 0.18);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 9, 6500), now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 2.2, 420), now + duration * 0.65);
    filter.Q.setValueAtTime(1.8, now);

    const bufferSize = Math.floor(ctx.sampleRate * 0.018);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.65, now);
    noise.connect(noiseGain);
    noiseGain.connect(filter);
    noise.start(now);

    const harmonics = [
      { mult: 1, type: 'sawtooth' as OscillatorType, amp: 0.65, detune: 0 },
      { mult: 1, type: 'triangle' as OscillatorType, amp: 0.45, detune: 3.5 },
      { mult: 2, type: 'triangle' as OscillatorType, amp: 0.25, detune: -2 },
      { mult: 3, type: 'sine' as OscillatorType, amp: 0.12, detune: 1.5 },
    ];

    const sources: (OscillatorNode | AudioBufferSourceNode)[] = [noise];

    harmonics.forEach((h) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = h.type;
      osc.frequency.setValueAtTime(freq * h.mult, now);
      osc.detune.setValueAtTime(h.detune, now);
      oscGain.gain.setValueAtTime(h.amp, now);
      if (h.mult > 1) {
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.55);
      }
      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start(now);
      osc.stop(now + duration + 0.03);
      sources.push(osc);
    });

    filter.connect(masterGain);
    masterGain.connect(this.getDestination());
    this.registerVoice(masterGain, sources);
    this.scheduleNoteGlow(midi, duration, delay, 'guitar', glowHint);
  }

  /**
   * Dedicated 4-String Electric Bass Synthesis (Deep Sub + Low-Mid Growl + Finger/Slap Envelope)
   */
  playElectricBass(
    midi: number,
    duration = 1.1,
    delay = 0,
    volume = 0.38,
    style: 'finger' | 'slap' = 'finger',
    stopPrevious = true,
    glowHint?: NoteGlowHint
  ): void {
    if (stopPrevious && delay === 0) {
      this.stopAll(true);
    }
    const ctx = this.ensureContext();
    const now = ctx.currentTime + delay;
    // Ensure bass MIDI stays in authentic electric bass range (E1=28 to G3=55)
    const bassMidi = midi > 60 ? midi - 12 : midi;
    const freq = this.midiToFreq(bassMidi);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(volume, now + (style === 'slap' ? 0.004 : 0.01));
    masterGain.gain.exponentialRampToValueAtTime(volume * 0.58, now + 0.14);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    if (style === 'slap') {
      filter.frequency.setValueAtTime(3400, now);
      filter.frequency.exponentialRampToValueAtTime(freq * 3.2, now + 0.16);
      filter.Q.setValueAtTime(3.2, now);
    } else {
      filter.frequency.setValueAtTime(freq * 6.5, now);
      filter.frequency.exponentialRampToValueAtTime(freq * 2.1, now + 0.28);
      filter.Q.setValueAtTime(2.0, now);
    }

    // Fundamental Sub Sine (solid low-end weight)
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(freq, now);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.85, now);
    subOsc.connect(subGain);
    subGain.connect(masterGain); // Bypass filter for pure fundamental weight

    // Growl Sawtooth (bridge pickup harmonics)
    const growlOsc = ctx.createOscillator();
    growlOsc.type = 'sawtooth';
    growlOsc.frequency.setValueAtTime(freq, now);
    const growlGain = ctx.createGain();
    growlGain.gain.setValueAtTime(0.55, now);
    growlOsc.connect(growlGain);
    growlGain.connect(filter);

    // 2nd Harmonic Punch
    const harmOsc = ctx.createOscillator();
    harmOsc.type = 'triangle';
    harmOsc.frequency.setValueAtTime(freq * 2, now);
    const harmGain = ctx.createGain();
    harmGain.gain.setValueAtTime(style === 'slap' ? 0.48 : 0.26, now);
    harmOsc.connect(harmGain);
    harmGain.connect(filter);

    const sources: (OscillatorNode | AudioBufferSourceNode)[] = [subOsc, growlOsc, harmOsc];

    // Fret clank / finger thump transient
    const bufSize = Math.floor(ctx.sampleRate * (style === 'slap' ? 0.022 : 0.012));
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    const nFilter = ctx.createBiquadFilter();
    nFilter.type = 'bandpass';
    nFilter.frequency.setValueAtTime(style === 'slap' ? 2200 : 450, now);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(style === 'slap' ? 0.5 : 0.25, now);
    noise.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(masterGain);
    noise.start(now);
    sources.push(noise);

    filter.connect(masterGain);
    masterGain.connect(this.getDestination());

    subOsc.start(now);
    growlOsc.start(now);
    harmOsc.start(now);
    subOsc.stop(now + duration + 0.03);
    growlOsc.stop(now + duration + 0.03);
    harmOsc.stop(now + duration + 0.03);

    this.registerVoice(masterGain, sources);
    this.scheduleNoteGlow(bassMidi, duration, delay, 'bass', glowHint);
  }

  /**
   * Warm Acoustic Grand Piano synthesis
   */
  playAcousticPiano(
    midi: number,
    duration = 1.25,
    delay = 0,
    volume = 0.26,
    stopPrevious = true,
    glowHint?: NoteGlowHint
  ): void {
    if (stopPrevious && delay === 0) {
      this.stopAll(true);
    }
    const ctx = this.ensureContext();
    const now = ctx.currentTime + delay;
    const freq = this.midiToFreq(midi);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(volume, now + 0.008);
    masterGain.gain.exponentialRampToValueAtTime(volume * 0.42, now + 0.15);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const partials = [
      { ratio: 1, amp: 0.7, type: 'triangle' as OscillatorType, detune: -1.5 },
      { ratio: 1, amp: 0.45, type: 'sine' as OscillatorType, detune: 1.8 },
      { ratio: 2, amp: 0.22, type: 'sine' as OscillatorType, detune: 0 },
      { ratio: 3, amp: 0.09, type: 'sine' as OscillatorType, detune: 2 },
      { ratio: 4, amp: 0.04, type: 'sine' as OscillatorType, detune: -2 },
    ];

    const sources: OscillatorNode[] = [];
    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const pGain = ctx.createGain();
      osc.type = p.type;
      osc.frequency.setValueAtTime(freq * p.ratio, now);
      osc.detune.setValueAtTime(p.detune, now);
      pGain.gain.setValueAtTime(p.amp, now);
      osc.connect(pGain);
      pGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + duration + 0.03);
      sources.push(osc);
    });

    masterGain.connect(this.getDestination());
    this.registerVoice(masterGain, sources);
    this.scheduleNoteGlow(midi, duration, delay, 'piano', glowHint);
  }

  /**
   * Human Vocal Formant Synthesis (A, E, I, O, U, Lip Trill) for Canto & Warm-Up Exercises
   */
  playVocalFormant(
    midi: number,
    duration = 1.1,
    delay = 0,
    volume = 0.26,
    vowel: 'a' | 'e' | 'i' | 'o' | 'u' | 'lip' = 'a',
    stopPrevious = false
  ): void {
    if (stopPrevious && delay === 0) {
      this.stopAll(true);
    }
    const ctx = this.ensureContext();
    const now = ctx.currentTime + delay;
    const freq = this.midiToFreq(midi);

    const formants: Record<string, [number, number, number]> = {
      a: [730, 1090, 2440],
      e: [530, 1840, 2480],
      i: [270, 2290, 3010],
      o: [570, 840, 2410],
      u: [300, 870, 2240],
      lip: [380, 950, 2100],
    };
    const [f1, f2, f3] = formants[vowel] || formants['a'];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(volume, now + 0.06);
    masterGain.gain.setValueAtTime(volume * 0.88, now + duration * 0.78);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Glottal pulse source
    const glottal = ctx.createOscillator();
    glottal.type = 'sawtooth';
    glottal.frequency.setValueAtTime(freq * 0.992, now);
    glottal.frequency.exponentialRampToValueAtTime(freq, now + 0.045);

    const subWarmth = ctx.createOscillator();
    subWarmth.type = 'sine';
    subWarmth.frequency.setValueAtTime(freq, now);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.45, now);

    // Natural human vibrato (5.5 Hz,or 22 Hz flutter for Lip Trill)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(vowel === 'lip' ? 22 : 5.5, now);
    lfoGain.gain.setValueAtTime(vowel === 'lip' ? 9.5 : 3.8, now);
    lfo.connect(lfoGain);
    lfoGain.connect(glottal.frequency);
    lfoGain.connect(subWarmth.frequency);

    // 3 Parallel Formant Filters
    const freqs = [f1, f2, f3];
    const gains = [1.0, 0.55, 0.25];
    freqs.forEach((ff, idx) => {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(ff, now);
      bp.Q.setValueAtTime(5.5, now);
      const fg = ctx.createGain();
      fg.gain.setValueAtTime(gains[idx], now);
      glottal.connect(bp);
      bp.connect(fg);
      fg.connect(masterGain);
    });

    subWarmth.connect(subGain);
    subGain.connect(masterGain);
    masterGain.connect(this.getDestination());

    glottal.start(now);
    subWarmth.start(now);
    lfo.start(now);
    glottal.stop(now + duration + 0.03);
    subWarmth.stop(now + duration + 0.03);
    lfo.stop(now + duration + 0.03);

    this.registerVoice(masterGain, [glottal, subWarmth, lfo]);
    this.scheduleNoteGlow(midi, duration, delay, 'vocal');
  }

  /**
   * Andean Quena / Wind synthesis
   */
  playQuenaFlute(midi: number, duration = 1.1, delay = 0, volume = 0.26, stopPrevious = true): void {
    if (stopPrevious && delay === 0) {
      this.stopAll(true);
    }
    const ctx = this.ensureContext();
    const now = ctx.currentTime + delay;
    const freq = this.midiToFreq(midi);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(volume, now + 0.055);
    masterGain.gain.setValueAtTime(volume * 0.85, now + duration * 0.75);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);
    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.18, now);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(5.5, now);
    lfoGain.gain.setValueAtTime(4.2, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.connect(masterGain);
    osc2.connect(osc2Gain);
    osc2Gain.connect(masterGain);
    masterGain.connect(this.getDestination());

    osc.start(now);
    osc2.start(now);
    lfo.start(now);
    osc.stop(now + duration + 0.03);
    osc2.stop(now + duration + 0.03);
    lfo.stop(now + duration + 0.03);

    this.registerVoice(masterGain, [osc, osc2, lfo]);
    this.scheduleNoteGlow(midi, duration, delay, 'quena');
  }

  /**
   * Dedicated Top-View Drum Kit Piece Synthesizer (BD, SD, HH, HHP, T1, T2, FT, RD, CR)
   */
  playDrumPiece(piece: DrumKitPieceCode, delay = 0): void {
    if (piece === 'BD') {
      this.playDrumHit('kick', delay);
    } else if (piece === 'SD') {
      this.playDrumHit('snare', delay);
    } else if (piece === 'HH') {
      this.playDrumHit('hihat', delay);
    } else if (piece === 'CR') {
      this.playDrumHit('crash', delay);
    } else {
      const ctx = this.ensureContext();
      const now = ctx.currentTime + delay;
      const dest = this.getDestination();

      if (piece === 'HHP') {
        // Tight foot-pedal hi-hat chick
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.32, now);
        master.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(8600, now);
        bp.Q.setValueAtTime(2.5, now);

        const bufSize = Math.floor(ctx.sampleRate * 0.045);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.28));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        noise.connect(bp);
        bp.connect(master);
        master.connect(dest);
        noise.start(now);
        this.registerVoice(master, [noise]);
      } else if (piece === 'T1' || piece === 'T2' || piece === 'FT') {
        // Distinct pitched acoustic Toms: T1 (High 220->112Hz), T2 (Mid 168->84Hz), FT (Floor 115->56Hz)
        const startF = piece === 'T1' ? 225 : piece === 'T2' ? 168 : 115;
        const endF = piece === 'T1' ? 112 : piece === 'T2' ? 84 : 56;
        const dur = piece === 'FT' ? 0.44 : 0.34;

        const master = ctx.createGain();
        master.gain.setValueAtTime(0.72, now);
        master.gain.exponentialRampToValueAtTime(0.001, now + dur);

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(startF, now);
        osc.frequency.exponentialRampToValueAtTime(endF, now + dur * 0.78);

        const punch = ctx.createOscillator();
        punch.type = 'triangle';
        punch.frequency.setValueAtTime(startF * 1.48, now);
        punch.frequency.exponentialRampToValueAtTime(endF * 1.2, now + 0.07);
        const pg = ctx.createGain();
        pg.gain.setValueAtTime(0.28, now);
        pg.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

        osc.connect(master);
        punch.connect(pg);
        pg.connect(master);
        master.connect(dest);
        osc.start(now);
        punch.start(now);
        osc.stop(now + dur + 0.01);
        punch.stop(now + 0.08);
        this.registerVoice(master, [osc, punch]);
      } else if (piece === 'RD') {
        // Ride Cymbal with crystalline ping + warm metallic shimmer
        const dur = 0.62;
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.32, now);
        master.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(5200, now);

        const ratios = [465, 688, 912, 1260, 1790, 2420];
        const sources: (OscillatorNode | AudioBufferSourceNode)[] = [];
        ratios.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          osc.type = idx < 2 ? 'triangle' : 'square';
          osc.frequency.setValueAtTime(f, now);
          const og = ctx.createGain();
          og.gain.setValueAtTime(idx === 0 ? 0.22 : 0.1, now);
          osc.connect(og);
          og.connect(hp);
          osc.start(now);
          osc.stop(now + dur + 0.01);
          sources.push(osc);
        });

        hp.connect(master);
        master.connect(dest);
        this.registerVoice(master, sources);
      }
    }
  }

  /**
   * Upgraded Studio Acoustic Drum Synthesizer
   * Supports: kick, snare, ghost, hihat, openhat, crash, tom, clap
   */
  playDrumHit(
    type: 'kick' | 'snare' | 'ghost' | 'hihat' | 'openhat' | 'crash' | 'tom' | 'clap',
    delay = 0
  ): void {
    const ctx = this.ensureContext();
    const now = ctx.currentTime + delay;
    const dest = this.getDestination();

    if (type === 'kick') {
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.9, now);
      master.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      // Sub punch body
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(52, now + 0.065);
      osc.frequency.exponentialRampToValueAtTime(36, now + 0.35);

      // Beater click transient
      const clickOsc = ctx.createOscillator();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(950, now);
      clickOsc.frequency.exponentialRampToValueAtTime(120, now + 0.022);
      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.45, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);

      osc.connect(master);
      clickOsc.connect(clickGain);
      clickGain.connect(master);
      master.connect(dest);

      osc.start(now);
      clickOsc.start(now);
      osc.stop(now + 0.39);
      clickOsc.stop(now + 0.03);
      this.registerVoice(master, [osc, clickOsc]);
    } else if (type === 'snare' || type === 'ghost') {
      const isGhost = type === 'ghost';
      const vol = isGhost ? 0.22 : 0.72;
      const dur = isGhost ? 0.12 : 0.24;

      const master = ctx.createGain();
      master.gain.setValueAtTime(vol, now);
      master.gain.exponentialRampToValueAtTime(0.001, now + dur);

      // Dual-membrane drum shell modes (185 Hz & 330 Hz)
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(240, now);
      osc1.frequency.exponentialRampToValueAtTime(178, now + 0.08);
      const g1 = ctx.createGain();
      g1.gain.setValueAtTime(0.55, now);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(335, now);
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.3, now);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      // Snare wires burst (bandpass + crisp highpass)
      const bufSize = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.32));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(1100, now);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(isGhost ? 0.45 : 0.75, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc1.connect(g1);
      g1.connect(master);
      osc2.connect(g2);
      g2.connect(master);
      noise.connect(hp);
      hp.connect(nGain);
      nGain.connect(master);
      master.connect(dest);

      osc1.start(now);
      osc2.start(now);
      noise.start(now);
      osc1.stop(now + 0.12);
      osc2.stop(now + 0.08);
      this.registerVoice(master, [osc1, osc2, noise]);
    } else if (type === 'hihat' || type === 'openhat' || type === 'crash') {
      const dur = type === 'hihat' ? 0.065 : type === 'openhat' ? 0.38 : 0.85;
      const vol = type === 'crash' ? 0.38 : 0.32;

      const master = ctx.createGain();
      master.gain.setValueAtTime(vol, now);
      master.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(type === 'crash' ? 4200 : 7200, now);

      // Metallic non-harmonic cymbal oscillator cluster + high-frequency sizzle
      const ratios = [318, 464, 622, 795, 1015, 1380];
      const sources: (OscillatorNode | AudioBufferSourceNode)[] = [];

      ratios.forEach((f) => {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f * (type === 'crash' ? 0.88 : 1), now);
        const og = ctx.createGain();
        og.gain.setValueAtTime(0.12, now);
        osc.connect(og);
        og.connect(hp);
        osc.start(now);
        osc.stop(now + dur + 0.01);
        sources.push(osc);
      });

      const bufSize = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.35));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.55, now);
      noise.connect(ng);
      ng.connect(hp);
      noise.start(now);
      sources.push(noise);

      hp.connect(master);
      master.connect(dest);
      this.registerVoice(master, sources);
    } else if (type === 'tom') {
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.65, now);
      master.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(185, now);
      osc.frequency.exponentialRampToValueAtTime(86, now + 0.26);
      osc.connect(master);
      master.connect(dest);
      osc.start(now);
      osc.stop(now + 0.33);
      this.registerVoice(master, [osc]);
    } else {
      // Rimshot / Clave
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.45, now);
      master.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1480, now);
      const osc2 = ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(840, now);
      osc.connect(master);
      osc2.connect(master);
      master.connect(dest);
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.07);
      osc2.stop(now + 0.07);
      this.registerVoice(master, [osc, osc2]);
    }
  }

  strumChord(
    midiNotes: number[],
    instrument: 'guitar' | 'piano' | 'bass' = 'guitar',
    delayOffset = 0,
    stopPrevious = true
  ): void {
    if (midiNotes.length === 0) return;
    if (stopPrevious && delayOffset === 0) {
      this.stopAll(true);
    }
    const chordGroup = this.nextChordGroup++;
    const batchPayload: NotePlayEvent = {
      midi: midiNotes[0],
      durationSec: instrument === 'guitar' ? 1.35 : instrument === 'bass' ? 1.15 : 1.25,
      instrument,
      isChord: true,
      chordGroup,
      chordBatch: [...midiNotes],
    };
    if (delayOffset <= 0.005) {
      this.emitNoteEvent(batchPayload);
    } else {
      this.schedule(() => {
        this.emitNoteEvent(batchPayload);
      }, delayOffset * 1000);
    }
    midiNotes.forEach((m, idx) => {
      const strumDelay = delayOffset + idx * (instrument === 'guitar' ? 0.036 : 0.014);
      const hint: NoteGlowHint = { isChord: true, chordGroup, skipGlow: true };
      if (instrument === 'bass') {
        this.playElectricBass(m, 1.15, strumDelay, 0.34, 'finger', false, hint);
      } else if (instrument === 'guitar') {
        this.playPluckedGuitar(m, 1.35, strumDelay, 0.24, false, hint);
      } else {
        this.playAcousticPiano(m, 1.25, strumDelay, 0.22, false, hint);
      }
    });
  }
}

/**
 * Replaces all <!--USAR:nombre--> HTML comments with rich interactive laboratory containers
 */
export function replaceLegacyMarkers(html: string): string {
  return html.replace(/<!--USAR:([a-zA-Z0-9_-]+)-->/g, (_match, markerId: string) => {
    return `<div class="interactive-widget legacy-lab-host" data-usar="${markerId}"></div>`;
  });
}

/**
 * Hydrates all <article class="interactive-widget" data-lab="...">,
 * <div class="interactive-widget" data-usar="...">, AND
 * <div class="tab-block"> (Fretboard Maps & Tablatures) inside the given container element!
 */
export function hydrateAllLabs(
  root: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void,
  modalManager?: DiagramModalManager
): void {
  // 1. Transform all <div class="tab-block"> ASCII maps/tablatures into Interactive Visual Fretboards / Grids
  hydrateTabBlocks(root, audio, onStatus);

  // 2. Hydrate all legacy <!--USAR:...--> containers
  const usarHosts = root.querySelectorAll<HTMLElement>('.interactive-widget[data-usar]');
  usarHosts.forEach((host) => {
    const usarType = host.getAttribute('data-usar') || '';
    if (host.getAttribute('data-hydrated') === 'true') return;
    host.setAttribute('data-hydrated', 'true');
    buildUsarWidget(host, usarType, audio, onStatus);
  });

  // 3. Hydrate all <article class="interactive-widget" data-lab="..."> stages
  const labArticles = root.querySelectorAll<HTMLElement>('article.interactive-widget[data-lab]');
  labArticles.forEach((article) => {
    if (article.getAttribute('data-hydrated') === 'true') return;
    article.setAttribute('data-hydrated', 'true');
    const labType = article.getAttribute('data-lab') || '';
    let stage = article.querySelector<HTMLElement>('.lab-stage');
    if (!stage) {
      stage = document.createElement('div');
      stage.className = 'lab-stage';
      article.appendChild(stage);
    }
    buildDataLabStage(stage, labType, article, audio, onStatus);
  });

  // 4. Attach live fretboard note illumination & expandable diagram modal buttons
  attachStudioEnhancements(root, audio, modalManager);
}

/**
 * Automatically converts <div class="tab-block"> ASCII maps/tablatures into Interactive
 * 6-String Guitar (e-B-G-D-A-E) or 4-String Electric Bass (G-D-A-E) Visual Fretboards!
 */
function hydrateTabBlocks(
  root: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const tabBlocks = root.querySelectorAll<HTMLElement>('.tab-block');
  tabBlocks.forEach((block) => {
    if (block.getAttribute('data-tab-hydrated') === 'true') return;
    block.setAttribute('data-tab-hydrated', 'true');

    const labelEl = block.querySelector<HTMLElement>('.tab-label');
    const title = labelEl ? labelEl.textContent?.trim() || 'Mapa / Tablatura Interactiva' : 'Mapa / Tablatura Interactiva';
    const rawText = block.innerText || block.textContent || '';

    // Determine whether this tab-block belongs to Bass (4 strings: G-D-A-E), Guitar (6 strings: e-B-G-D-A-E), or Drums/Vocal
    const isInBassSection = !!block.closest('section[data-cat="bajo"]') || /BAJO|4 CUERDAS/i.test(title);
    const isDrumGrid = /Charles|Caja \(Snare\)|RUDIMENTOS|GROOVES INMORTALES|FILLS PROFESIONALES|GROOVE LINEAL/i.test(rawText);
    const isVocalScore = /Soprano \(S\):|Melodía \(Lead\):/i.test(rawText);

    if (isDrumGrid && !isInBassSection) {
      enhanceDrumTabBlock(block, title, rawText, audio, onStatus);
      return;
    }

    if (isVocalScore) {
      enhanceVocalTabBlock(block, title, audio, onStatus);
      return;
    }

    // Parse fret positions from the ASCII tab lines
    const stringsConfig = isInBassSection ? BASS_STRINGS : GUITAR_STRINGS;
    const parsedNotes: { stringIdx: number; fret: number; midi: number; noteName: string }[] = [];
    const activeFretMap = new Map<string, { isRoot: boolean; label: string }>();

    const lines = rawText.split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();
      let sIdx = -1;
      if (isInBassSection) {
        if (/^G\s*\|/.test(trimmed)) sIdx = 0;
        else if (/^D\s*\|/.test(trimmed)) sIdx = 1;
        else if (/^A\s*\|/.test(trimmed)) sIdx = 2;
        else if (/^E\s*\|/.test(trimmed)) sIdx = 3;
      } else {
        if (/^e\s*(\([^)]*\))?\s*\|/.test(trimmed)) sIdx = 0;
        else if (/^B\s*(\([^)]*\))?\s*\|/.test(trimmed)) sIdx = 1;
        else if (/^G\s*(\([^)]*\))?\s*\|/.test(trimmed)) sIdx = 2;
        else if (/^D\s*(\([^)]*\))?\s*\|/.test(trimmed)) sIdx = 3;
        else if (/^A\s*(\([^)]*\))?\s*\|/.test(trimmed)) sIdx = 4;
        else if (/^E\s*(\([^)]*\))?\s*\|/.test(trimmed)) sIdx = 5;
      }

      if (sIdx !== -1) {
        const pipeIdx = trimmed.indexOf('|');
        const body = trimmed.slice(pipeIdx + 1);
        // Find all fret numbers (0 to 15) not inside parentheses
        const cleanBody = body.replace(/\([^)]*\)/g, '   ');
        const fretMatches = [...cleanBody.matchAll(/\b(1[0-5]|[0-9])\b/g)];
        fretMatches.forEach((m) => {
          const fret = parseInt(m[1], 10);
          if (fret >= 0 && fret <= 15) {
            const midi = stringsConfig[sIdx].openMidi + fret;
            const noteName = NOTE_NAMES[midi % 12];
            const key = `${sIdx}-${fret}`;
            const isRoot =
              (isInBassSection && (noteName === 'C' || noteName === 'E' || noteName === 'G')) ||
              (!isInBassSection && (noteName === 'C' || noteName === 'A' || noteName === 'G' || noteName === 'E'));
            if (!activeFretMap.has(key)) {
              activeFretMap.set(key, { isRoot, label: `${noteName}` });
            }
            parsedNotes.push({ stringIdx: sIdx, fret, midi, noteName });
          }
        });
      }
    });

    // If no fret numbers matched, default to natural notes in 1st position (0..5)
    if (activeFretMap.size === 0) {
      const naturalPcs = new Set([0, 2, 4, 5, 7, 9, 11]);
      stringsConfig.forEach((str, sIdx) => {
        for (let f = 0; f <= 5; f++) {
          const midi = str.openMidi + f;
          const pc = midi % 12;
          if (naturalPcs.has(pc)) {
            activeFretMap.set(`${sIdx}-${f}`, {
              isRoot: pc === 0 || pc === 4,
              label: NOTE_NAMES[pc],
            });
            parsedNotes.push({ stringIdx: sIdx, fret: f, midi, noteName: NOTE_NAMES[pc] });
          }
        }
      });
    }

    const isFirstPosMap = /PRIMERA POSICI|MAPA DE NOTAS NATURALES/i.test(title);
    const highestParsedFret = parsedNotes.reduce((mx, n) => Math.max(mx, n.fret), 0);
    const maxFret = isFirstPosMap
      ? Math.max(5, highestParsedFret)
      : Math.max(12, highestParsedFret);
    const seq = isFirstPosMap || /MAPA/i.test(title)
      ? [...parsedNotes].sort((a, b) => b.stringIdx - a.stringIdx || a.fret - b.fret).slice(0, 48)
      : parsedNotes.slice(0, 32);
    const originalAscii = block.innerHTML;

    // Build visual interactive fretboard UI replacing the raw ASCII wall
    let fretHeaderHtml = `<div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.15); margin-bottom:4px;"><div class="string-label" style="color:var(--text-muted); font-size:0.7rem;">Traste</div>`;
    for (let f = 0; f <= maxFret; f++) {
      const marker = [3, 5, 7, 9, 12, 15].includes(f) ? '•' : '';
      fretHeaderHtml += `<div class="fret-cell" style="height:20px; border:none; color:var(--text-muted); font-size:0.72rem; font-weight:700;">${f}${marker}</div>`;
    }
    fretHeaderHtml += `</div>`;

    let fretRowsHtml = fretHeaderHtml;
    stringsConfig.forEach((str, sIdx) => {
      const lineStyle = isInBassSection
        ? `background: linear-gradient(90deg, rgba(56,189,248,0.08), transparent);`
        : '';
      fretRowsHtml += `<div class="fretboard-row" style="${lineStyle}"><div class="string-label" style="color:${isInBassSection ? '#38bdf8' : '#f59e0b'};">${str.label}</div>`;
      for (let f = 0; f <= maxFret; f++) {
        const midi = str.openMidi + f;
        const pc = midi % 12;
        const key = `${sIdx}-${f}`;
        const hit = activeFretMap.get(key);
        const stateClass = hit ? (hit.isRoot ? 'root' : 'active') : '';
        fretRowsHtml += `
          <div class="fret-cell js-tab-fret" data-sidx="${sIdx}" data-fret="${f}" data-midi="${midi}" title="Cuerda ${str.label}, Traste ${f}: ${NOTE_NAMES[pc]} (${audio.midiToFreq(midi).toFixed(1)} Hz)">
            <div class="fret-note ${stateClass}">${NOTE_NAMES[pc]}</div>
          </div>
        `;
      }
      fretRowsHtml += `</div>`;
    });

    block.classList.add('is-hydrated');
    block.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
        <div>
          <span class="tab-label" style="margin-bottom:2px;">${title}</span>
          <span style="font-size:0.78rem; color:var(--accent-cyan); font-weight:600;">
            ${isInBassSection ? '🎸 Mástil Interactivo de Bajo Eléctrico (4 Cuerdas: G–D–A–E)' : '🎸 Mástil Interactivo de Guitarra (6 Cuerdas: e–B–G–D–A–E)'}
            — Haz clic en cualquier traste para iluminar y tocar solo esa nota
          </span>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" class="btn btn-primary js-tab-play-seq" style="padding:5px 12px; font-size:0.78rem;">
            ▶ Escuchar Mapa / Tablatura (${seq.length} notas)
          </button>
          <button type="button" class="btn js-tab-stop" style="padding:5px 10px; font-size:0.78rem; background:rgba(244,63,94,0.18); color:#fb7185; border:1px solid rgba(244,63,94,0.4);">
            ⏹ Detener
          </button>
          <button type="button" class="btn js-tab-toggle-raw" style="padding:5px 10px; font-size:0.75rem; background:rgba(255,255,255,0.06); color:#cbd5e1; border:1px solid rgba(255,255,255,0.15);">
            📄 Ver/Ocultar Tablatura en Texto
          </button>
        </div>
      </div>
      <div class="fretboard-wrapper ${maxFret <= 7 ? 'compact-neck' : ''} js-tab-fretboard" style="margin-top:6px;">
        ${fretRowsHtml}
      </div>
      <div class="js-tab-raw-box" style="display:none; margin-top:12px; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.15); font-size:0.78rem;">
        ${originalAscii}
      </div>
    `;

    const fb = block.querySelector<HTMLElement>('.js-tab-fretboard')!;
    const playSeqBtn = block.querySelector<HTMLButtonElement>('.js-tab-play-seq')!;
    const stopBtn = block.querySelector<HTMLButtonElement>('.js-tab-stop')!;
    const toggleBtn = block.querySelector<HTMLButtonElement>('.js-tab-toggle-raw')!;
    const rawBox = block.querySelector<HTMLElement>('.js-tab-raw-box')!;

    fb.addEventListener('click', (e) => {
      const cell = (e.target as HTMLElement).closest<HTMLElement>('.js-tab-fret');
      if (!cell) return;
      const midi = parseInt(cell.getAttribute('data-midi')!, 10);
      const sIdx = parseInt(cell.getAttribute('data-sidx')!, 10);
      const fret = cell.getAttribute('data-fret');
      const fretNum = parseInt(fret || '0', 10);
      const hint: NoteGlowHint = { sIdx, fret: fretNum, scopeEl: fb };
      if (isInBassSection) {
        audio.playElectricBass(midi, 1.25, 0, 0.38, 'finger', true, hint);
      } else {
        audio.playPluckedGuitar(midi, 1.4, 0, 0.3, true, hint);
      }
      onStatus(
        `${isInBassSection ? 'Bajo 4 Cuerdas' : 'Guitarra 6 Cuerdas'}: Traste ${fret} — Nota ${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1} (${audio.midiToFreq(midi).toFixed(1)} Hz)`
      );
    });

    playSeqBtn.addEventListener('click', () => {
      audio.stopAll(true);
      seq.forEach((n, idx) => {
        audio.schedule(() => {
          const hint: NoteGlowHint = { sIdx: n.stringIdx, fret: n.fret, scopeEl: fb };
          if (isInBassSection) {
            audio.playElectricBass(n.midi, 0.4, 0, 0.36, 'finger', false, hint);
          } else {
            audio.playPluckedGuitar(n.midi, 0.42, 0, 0.28, false, hint);
          }
          onStatus(`Reproduciendo paso ${idx + 1}/${seq.length}: ${midiToNoteName(n.midi)} (Cuerda ${stringsConfig[n.stringIdx].label}, Traste ${n.fret})`);
        }, idx * 205);
      });
    });

    stopBtn.addEventListener('click', () => {
      audio.stopAll();
      onStatus('Reproducción detenida');
    });

    toggleBtn.addEventListener('click', () => {
      rawBox.style.display = rawBox.style.display === 'none' ? 'block' : 'none';
    });
  });
}

function enhanceDrumTabBlock(
  block: HTMLElement,
  title: string,
  _rawText: string,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const bar = document.createElement('div');
  bar.style.cssText = 'display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.12);';
  bar.innerHTML = `
    <span style="font-size:0.8rem; color:var(--accent-cyan); font-weight:700;">🥁 Reproductor Interactivo de Partitura de Batería:</span>
    <div style="display:flex; gap:6px; flex-wrap:wrap;">
      <button type="button" class="btn btn-primary js-dtab-funk" style="padding:4px 10px; font-size:0.75rem;">▶ Escuchar Groove Funk + Ghost Notes</button>
      <button type="button" class="btn js-dtab-fill" style="padding:4px 10px; font-size:0.75rem; background:rgba(56,189,248,0.18); color:#38bdf8; border:1px solid rgba(56,189,248,0.4);">▶ Escuchar Fill de Toms + Crash</button>
      <button type="button" class="btn js-dtab-stop" style="padding:4px 10px; font-size:0.75rem; background:rgba(244,63,94,0.18); color:#fb7185; border:1px solid rgba(244,63,94,0.4);">⏹ Detener</button>
    </div>
  `;
  block.prepend(bar);

  bar.querySelector('.js-dtab-funk')?.addEventListener('click', () => {
    audio.stopAll();
    const step = 0.14;
    const pattern: ('kick' | 'snare' | 'ghost' | 'hihat' | 'openhat')[][] = [
      ['kick', 'hihat'],
      ['hihat'],
      ['hihat'],
      ['kick', 'hihat'],
      ['snare', 'hihat'],
      ['hihat'],
      ['kick', 'hihat'],
      ['ghost', 'hihat'],
      ['hihat'],
      ['kick', 'hihat'],
      ['kick', 'hihat'],
      ['hihat'],
      ['snare', 'hihat'],
      ['hihat'],
      ['kick', 'hihat'],
      ['openhat'],
    ];
    pattern.forEach((hits, idx) => {
      hits.forEach((h) => audio.playDrumHit(h, idx * step));
    });
    onStatus(`Batería: Reproduciendo ${title}`);
  });

  bar.querySelector('.js-dtab-fill')?.addEventListener('click', () => {
    audio.stopAll();
    const step = 0.12;
    const seq: ('snare' | 'tom' | 'kick' | 'crash')[] = [
      'snare', 'snare', 'tom', 'tom',
      'snare', 'tom', 'kick', 'kick',
      'snare', 'snare', 'tom', 'tom',
      'kick', 'kick', 'snare', 'crash',
    ];
    seq.forEach((h, idx) => audio.playDrumHit(h, idx * step));
    onStatus('Batería: Reproduciendo Fill de 16 semicorcheas con resolución en Crash');
  });

  bar.querySelector('.js-dtab-stop')?.addEventListener('click', () => {
    audio.stopAll();
    onStatus('Reproducción detenida');
  });
}

function enhanceVocalTabBlock(
  block: HTMLElement,
  title: string,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const bar = document.createElement('div');
  bar.style.cssText = 'display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.12);';
  bar.innerHTML = `
    <span style="font-size:0.8rem; color:var(--accent-gold); font-weight:700;">🎤 Escuchar Armonización Vocal (E4 – F4 – G4 – E4):</span>
    <div style="display:flex; gap:6px; flex-wrap:wrap;">
      <button type="button" class="btn js-vtab-1" style="padding:4px 10px; font-size:0.75rem; background:rgba(56,189,248,0.16); color:#38bdf8;">▶ Melodía Sola</button>
      <button type="button" class="btn js-vtab-2" style="padding:4px 10px; font-size:0.75rem; background:rgba(16,185,129,0.16); color:#34d399;">▶ Dúo (1ª + 3ª Superior)</button>
      <button type="button" class="btn btn-primary js-vtab-4" style="padding:4px 10px; font-size:0.75rem;">▶ Coro SATB a 4 Voces</button>
      <button type="button" class="btn js-vtab-stop" style="padding:4px 10px; font-size:0.75rem; background:rgba(244,63,94,0.18); color:#fb7185;">⏹ Detener</button>
    </div>
  `;
  block.prepend(bar);

  const lead = [64, 65, 67, 64];
  const upper3 = [67, 69, 71, 67];
  const alto = [60, 60, 59, 60];
  const tenor = [55, 57, 53, 55];
  const bass = [48, 53, 55, 48];

  bar.querySelector('.js-vtab-1')?.addEventListener('click', () => {
    audio.stopAll();
    lead.forEach((m, i) => audio.playVocalFormant(m, 0.85, i * 0.9, 0.3, 'a'));
    onStatus(`Canto: Melodía principal (${title})`);
  });

  bar.querySelector('.js-vtab-2')?.addEventListener('click', () => {
    audio.stopAll();
    lead.forEach((m, i) => {
      audio.playVocalFormant(m, 0.85, i * 0.9, 0.25, 'a');
      audio.playVocalFormant(upper3[i], 0.85, i * 0.9, 0.2, 'o');
    });
    onStatus('Canto: Dúo en terceras y cuartas diatónicas');
  });

  bar.querySelector('.js-vtab-4')?.addEventListener('click', () => {
    audio.stopAll();
    for (let i = 0; i < 4; i++) {
      const d = i * 0.95;
      audio.playVocalFormant(lead[i], 0.9, d, 0.22, 'a');
      audio.playVocalFormant(alto[i], 0.9, d, 0.18, 'o');
      audio.playVocalFormant(tenor[i], 0.9, d, 0.18, 'o');
      audio.playVocalFormant(bass[i], 0.9, d, 0.22, 'u');
    }
    onStatus('Canto: Coral SATB a 4 voces (Soprano, Contralto, Tenor, Bajo)');
  });

  bar.querySelector('.js-vtab-stop')?.addEventListener('click', () => {
    audio.stopAll();
    onStatus('Reproducción detenida');
  });
}

/**
 * Multi-Instrument Explorer (Piano + 6-String Guitar OR 4-String Electric Bass)
 * With Stop button & Tonic Drone button!
 */
function buildMultiInstrumentExplorer(
  container: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void,
  config: {
    title?: string;
    subtitle?: string;
    defaultRoot?: number;
    defaultScale?: string;
    mode?: 'scale' | 'chord';
    bassOnly?: boolean;
  } = {}
): void {
  let currentRoot = config.defaultRoot ?? 0;
  let currentScaleId = config.defaultScale ?? 'major';
  let currentChordId = 'maj';
  const isChordMode = config.mode === 'chord';
  const isBassOnly = !!config.bassOnly;
  let visualFocus = getVisualInstrumentFocus();
  let hidePiano = isBassOnly || visualFocus !== 'all';
  let currentInstrument: 'guitar' | 'piano' | 'bass' = isBassOnly
    ? 'bass'
    : computeEffectiveExplorerInstrument(visualFocus, 'guitar');
  let bassStyle: 'finger' | 'slap' = 'finger';

  const title =
    config.title ||
    (isBassOnly
      ? 'Explorador del Mástil de Bajo Eléctrico de 4 Cuerdas (G–D–A–E)'
      : isChordMode
        ? 'Constructor y Visualizador Interactivo de Acordes (Piano y Diapasón)'
        : 'Visualizador y Sintetizador Multinstrumento (Piano y Diapasón)');
  const subtitle =
    config.subtitle ||
    (isBassOnly
      ? 'Mástil simétrico por cuartas justas (E1–A1–D2–G2). Haz clic en cualquier traste para escuchar el sonido de bajo eléctrico.'
      : 'Haz clic en cualquier tecla del piano o traste del diapasón para escuchar su sonido real.');

  const rootOptionsHtml = NOTE_LABELS.map(
    (label, idx) => `<option value="${idx}" ${idx === currentRoot ? 'selected' : ''}>${label}</option>`
  ).join('');

  const scaleOptionsHtml = SCALES_DB.map(
    (s) => `<option value="${s.id}" ${s.id === currentScaleId ? 'selected' : ''}>${s.name}</option>`
  ).join('');

  const chordOptionsHtml = CHORDS_DB.map(
    (c) => `<option value="${c.id}" ${c.id === currentChordId ? 'selected' : ''}>${c.name} (${c.formula})</option>`
  ).join('');

  const scaleGuideOptionsHtml = SCALE_GUIDE_CATALOG.map(
    (s) => `<option value="${s.id}" ${s.id === currentScaleId ? 'selected' : ''}>${s.name}</option>`
  ).join('');

  container.innerHTML = `
    <div class="widget-header">
      <div>
        <strong style="color:var(--accent-gold); font-size:1.1rem;">${title}</strong>
        <p style="font-size:0.82rem; color:var(--text-muted); margin:0;">${subtitle}</p>
      </div>
      <div class="widget-controls">
        <label style="font-size:0.82rem;">Tónica:</label>
        <select class="js-root-select">${rootOptionsHtml}</select>

        <label style="font-size:0.82rem;">${isChordMode ? 'Acorde / Arpegio:' : 'Escala / Modo:'}</label>
        <select class="js-mode-select">
          ${isChordMode ? chordOptionsHtml : scaleOptionsHtml}
        </select>

        ${
          isChordMode
            ? `
          <label style="font-size:0.82rem;">Guía de Escala:</label>
          <select class="js-scale-guide-select">${scaleGuideOptionsHtml}</select>
        `
            : ''
        }

        ${
          isBassOnly
            ? `
          <label style="font-size:0.82rem;">Técnica Bajo:</label>
          <select class="js-bass-style">
            <option value="finger">🎸 Fingerstyle (Pizzicato i-m)</option>
            <option value="slap">⚡ Slap & Pop (Funk)</option>
          </select>
        `
            : `
          <label style="font-size:0.82rem;">Timbre:</label>
          <select class="js-inst-select">
            <option value="guitar">🎸 Guitarra (6 Cuerdas)</option>
            <option value="piano">🎹 Piano Acústico</option>
            <option value="bass">🎸 Bajo Eléctrico (4 Cuerdas)</option>
          </select>
          <button type="button" class="btn js-toggle-piano-btn" style="font-size:0.78rem; padding:4px 10px;">
            ${hidePiano ? '🎹 Mostrar Piano' : '🙈 Ocultar Piano'}
          </button>
        `
        }

        <button type="button" class="btn btn-primary js-play-main">
          ${isBassOnly ? '▶ Tocar Línea / Arpegio en Bajo' : isChordMode ? '🎸 Rasguear Acorde' : '▶ Escuchar Escala'}
        </button>
        <button type="button" class="btn js-drone-btn" style="background:rgba(16,185,129,0.16); color:#34d399; border:1px solid rgba(16,185,129,0.4);">
          🔊 Pedal Tónica
        </button>
        <button type="button" class="btn js-pedal-explain-btn" style="background:rgba(56,189,248,0.16); color:#38bdf8; border:1px solid rgba(56,189,248,0.35);">
          💡 ¿Para qué sirve el Pedal C?
        </button>
        <button type="button" class="btn js-stop-btn" style="background:rgba(244,63,94,0.18); color:#fb7185; border:1px solid rgba(244,63,94,0.4);">
          ⏹ Detener
        </button>
      </div>
    </div>

    <div class="js-pedal-coach-box" style="display:none; margin-bottom:14px; padding:12px 15px; background:rgba(14,116,144,0.16); border:1px solid rgba(56,189,248,0.45); border-radius:8px; font-size:0.84rem; line-height:1.55;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
        <strong style="color:#38bdf8; font-size:0.92rem;">💡 ¿Para qué sirve el Pedal de Tónica (Pedal C / Drone)?</strong>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="btn btn-primary js-pedal-demo-modes" style="padding:3px 10px; font-size:0.75rem;">▶ Demo 1: Sentir Grados sobre Pedal C (3ªM vs b3 vs #4 Lidio)</button>
          <button type="button" class="btn js-pedal-demo-chords" style="padding:3px 10px; font-size:0.75rem; background:rgba(245,158,11,0.2); color:#fbbf24; border:1px solid rgba(245,158,11,0.4);">▶ Demo 2: Acordes sobre Bajo Pedal C (C → Dm/C → Fm/C → G7/C → C)</button>
        </div>
      </div>
      <p style="margin:0 0 6px 0; color:#e2e8f0;">
        Un <strong>Pedal (Drone)</strong> es una nota grave continua que sostiene la tónica (por defecto <strong>Do / C2 = 65.4 Hz</strong>). Sirve para <strong>4 funciones esenciales</strong>:
        <strong>1) Entrenar el Oído:</strong> Una nota aislada no tiene emoción por sí sola, pero al sonar contra el Pedal C sientes al instante su <em>gravedad</em> (reposo en 1-3-5, nostalgia en b6, flotación espacial en #4 Lidio).
        <strong>2) Comparar Modos Paralelos:</strong> Mantén el Pedal C activo y cambia entre Jónico, Dórico, Frigio y Lidio.
        <strong>3) Afinar Voz, Bendings y Vientos:</strong> Escucha cómo desaparecen las oscilaciones (batimentos) al clavar la afinación justa.
        <strong>4) Tensión Cinematográfica:</strong> Cambiar acordes arriba mientras el bajo se niega a moverse de Do acumula una energía magnética enorme.
      </p>
      <div class="js-pedal-live-degree" style="padding:6px 10px; background:rgba(0,0,0,0.35); border-radius:6px; color:#fde047; font-size:0.8rem;">
        Activa <strong>🔊 Pedal Tónica</strong> y toca cualquier tecla o traste para ver aquí qué grado e impacto emocional produce contra el pedal.
      </div>
    </div>

    <div class="js-formula-info" style="margin-bottom:15px; padding:12px 15px; background:rgba(0,0,0,0.35); border-radius:6px; font-size:0.88rem;"></div>

    ${
      isBassOnly
        ? ''
        : `
      <div class="piano-wrapper">
        <div class="piano-keys js-piano-container"></div>
      </div>
    `
    }

    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; margin-top:15px; gap:8px;">
      <span class="js-neck-title" style="font-size:0.85rem; font-weight:bold; color:var(--accent-cyan);">
        ${
          isBassOnly
            ? 'Mástil Exclusivo de Bajo Eléctrico (4 cuerdas afinadas por cuartas: G–D–A–E)'
            : 'Mástil de Guitarra (6 cuerdas: e-B-G-D-A-E) y Bajo Eléctrico (4 inferiores: G-D-A-E)'
        }
      </span>
      <span style="font-size:0.75rem; color:var(--text-muted);">
        Dorado = Tónica (Raíz) | Azul = Notas Activas (Haz clic en cualquier traste 0–12 para pulsar la cuerda)
      </span>
    </div>
    <div class="fretboard-wrapper js-fretboard-container"></div>
  `;

  const rootSelect = container.querySelector<HTMLSelectElement>('.js-root-select')!;
  const modeSelect = container.querySelector<HTMLSelectElement>('.js-mode-select')!;
  const scaleGuideSelect = container.querySelector<HTMLSelectElement>('.js-scale-guide-select');
  const instSelect = container.querySelector<HTMLSelectElement>('.js-inst-select');
  const togglePianoBtn = container.querySelector<HTMLButtonElement>('.js-toggle-piano-btn');
  const bassStyleSelect = container.querySelector<HTMLSelectElement>('.js-bass-style');
  const playMainBtn = container.querySelector<HTMLButtonElement>('.js-play-main')!;
  const droneBtn = container.querySelector<HTMLButtonElement>('.js-drone-btn')!;
  const pedalExplainBtn = container.querySelector<HTMLButtonElement>('.js-pedal-explain-btn')!;
  const pedalCoachBox = container.querySelector<HTMLElement>('.js-pedal-coach-box')!;
  const pedalLiveDegree = container.querySelector<HTMLElement>('.js-pedal-live-degree')!;
  const stopBtn = container.querySelector<HTMLButtonElement>('.js-stop-btn')!;
  const formulaInfo = container.querySelector<HTMLElement>('.js-formula-info')!;
  const pianoWrapper = container.querySelector<HTMLElement>('.piano-wrapper');
  const pianoContainer = container.querySelector<HTMLElement>('.js-piano-container');
  const fretboardContainer = container.querySelector<HTMLElement>('.js-fretboard-container')!;
  const neckTitle = container.querySelector<HTMLElement>('.js-neck-title')!;

  const updatePedalDegreeReadout = (playedMidi: number): void => {
    const pedalMidi = 36 + currentRoot;
    const analysis = analyzePedalInterval(playedMidi, pedalMidi);
    pedalLiveDegree.innerHTML = `
      <strong>Sobre Pedal ${NOTE_NAMES[currentRoot]}:</strong> Nota tocada = <strong>${midiToNoteName(playedMidi)}</strong> →
      Grado <strong>${analysis.degreeLabel}</strong> (${analysis.intervalName}) ·
      <em>${analysis.consonanceLevel}</em> — ${analysis.modalFlavor}. ${analysis.coachingTip}
    `;
  };

  const getActiveIntervals = (): number[] => {
    if (isChordMode) {
      const chord = CHORDS_DB.find((c) => c.id === currentChordId) || CHORDS_DB[0];
      return chord.intervals.map((i) => i % 12);
    }
    const scale = SCALES_DB.find((s) => s.id === currentScaleId) || SCALES_DB[0];
    return scale.intervals;
  };

  const renderVisuals = (syncChordGlow = false): void => {
    const useBassNeck = isBassOnly || currentInstrument === 'bass';
    if (pianoWrapper) {
      pianoWrapper.style.display = isBassOnly || hidePiano ? 'none' : '';
    }
    if (instSelect) {
      const pianoOpt = instSelect.querySelector<HTMLOptionElement>('option[value="piano"]');
      if (pianoOpt) {
        pianoOpt.hidden = hidePiano;
        pianoOpt.disabled = hidePiano;
      }
      if (hidePiano && currentInstrument === 'piano') {
        currentInstrument = 'guitar';
      }
      instSelect.value = currentInstrument;
    }
    if (togglePianoBtn) {
      togglePianoBtn.textContent = hidePiano ? '🎹 Mostrar Piano' : '🙈 Ocultar Piano';
      togglePianoBtn.style.background = hidePiano ? 'rgba(245,158,11,0.2)' : 'rgba(30,41,59,0.9)';
      togglePianoBtn.style.color = hidePiano ? '#fbbf24' : '#cbd5e1';
      togglePianoBtn.style.border = hidePiano ? '1px solid rgba(245,158,11,0.45)' : '1px solid #334155';
    }
    const stringsToRender = useBassNeck ? BASS_STRINGS : GUITAR_STRINGS;
    const rootName = NOTE_NAMES[currentRoot];

    let activePitchClasses: Set<number>;
    let charPitchClasses = new Set<number>();
    let computedChordState: ReturnType<typeof computeChordNeckState> | null = null;

    if (isChordMode) {
      computedChordState = computeChordNeckState({
        rootPc: currentRoot,
        chordId: currentChordId,
        scaleId: currentScaleId,
        openMidisHighToLow: stringsToRender.map((s) => s.openMidi),
        maxFret: 12,
      });
      activePitchClasses = new Set(computedChordState.scalePitchClasses);
      charPitchClasses = new Set(computedChordState.charPitchClasses);

      const chord = CHORDS_DB.find((c) => c.id === currentChordId) || CHORDS_DB[0];
      const noteNames = chord.intervals.map((i) => NOTE_NAMES[(currentRoot + i) % 12]).join(' – ');
      const fingerLabelHtml =
        !useBassNeck && computedChordState.fingerSummary
          ? `<span style="margin-left:8px; font-family:monospace; color:#fde047; font-weight:700;">[Dedos Izq: ${computedChordState.fingerSummary}]</span>`
          : '';
      formulaInfo.innerHTML = `
        <strong>Notas de ${rootName}${chord.symbol} (${chord.name}):</strong>
        <span style="color:var(--accent-gold); font-weight:700;"> ${noteNames}</span>
        <span style="margin-left:8px; font-family:monospace; color:#38bdf8; font-weight:700;">[Posición: ${computedChordState.tabSummary}]</span>
        ${fingerLabelHtml}<br>
        <span style="color:var(--text-muted);">Fórmula: ${chord.formula} — ${chord.character} · Guía de Escala: <strong>${computedChordState.scaleGuide.name}</strong>${!useBassNeck ? ' · Dedos: 1=Índice, 2=Medio, 3=Anular, 4=Meñique' : ''}</span>
      `;
    } else {
      const intervals = getActiveIntervals();
      activePitchClasses = new Set(intervals.map((i) => (currentRoot + i) % 12));
      const scale = SCALES_DB.find((s) => s.id === currentScaleId) || SCALES_DB[0];
      const noteNames = scale.intervals.map((i) => NOTE_NAMES[(currentRoot + i) % 12]).join(' – ');
      formulaInfo.innerHTML = `
        <strong>Notas de ${rootName} ${scale.name}:</strong>
        <span style="color:var(--accent-gold); font-weight:700;"> ${noteNames}</span><br>
        <span style="color:var(--text-muted);">Fórmula: ${scale.formula} | Grados: ${scale.degrees} — ${scale.character}</span>
      `;
    }

    if (pianoContainer) {
      pianoContainer.classList.add('piano-3oct');
      let pianoHtml = '';
      for (let oct = 0; oct < 3; oct++) {
        for (let pc = 0; pc < 12; pc++) {
          const midi = 48 + oct * 12 + pc;
          const isBlack = [1, 3, 6, 8, 10].includes(pc);
          const isRoot = pc === currentRoot;
          const isChar = charPitchClasses.has(pc);
          const inScale = activePitchClasses.has(pc);
          const keyClass = isBlack ? 'key-black' : 'key-white';
          const stateClass = isRoot ? 'is-root' : isChar ? 'is-char' : inScale ? 'in-scale' : '';
          pianoHtml += `<div class="${keyClass} ${stateClass}" data-midi="${midi}" title="Reproducir ${NOTE_NAMES[pc]}${3 + oct} (MIDI ${midi})"><span>${NOTE_NAMES[pc]}</span></div>`;
        }
      }
      pianoContainer.innerHTML = pianoHtml;
    }

    neckTitle.textContent = useBassNeck
      ? 'Mástil Exclusivo de Bajo Eléctrico (4 cuerdas: G–D–A–E · Afinación E1–A1–D2–G2)'
      : 'Mástil de Guitarra (6 cuerdas: e-B-G-D-A-E) y Bajo Eléctrico (4 inferiores: G-D-A-E)';

    const chordPosKeys = new Set(
      (computedChordState?.chordPositions || []).map((p) => `${p.sIdx}:${p.fret}`)
    );
    const guitarFingerMap = new Map<string, number>();
    if (!useBassNeck && computedChordState?.chordFingers) {
      computedChordState.chordFingers.forEach((f) => {
        if (f.finger > 0 && f.fret > 0) {
          guitarFingerMap.set(`${f.sIdx}:${f.fret}`, f.finger);
        }
      });
    }

    let fretHeaderHtml = `<div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.15); margin-bottom:4px;"><div class="string-label" style="color:var(--text-muted); font-size:0.7rem;">Traste</div>`;
    for (let f = 0; f <= 12; f++) {
      const marker = [3, 5, 7, 9, 12].includes(f) ? '•' : '';
      fretHeaderHtml += `<div class="fret-cell" style="height:20px; border:none; color:var(--text-muted); font-size:0.72rem; font-weight:700;">${f}${marker}</div>`;
    }
    fretHeaderHtml += `</div>`;

    let fretRowsHtml = fretHeaderHtml;
    stringsToRender.forEach((str, sIdx) => {
      fretRowsHtml += `<div class="fretboard-row"><div class="string-label" style="color:${useBassNeck ? '#38bdf8' : '#f59e0b'};">${str.label}</div>`;
      for (let fret = 0; fret <= 12; fret++) {
        const midi = str.openMidi + fret;
        const pc = midi % 12;
        const isRoot = pc === currentRoot;
        const isChar = charPitchClasses.has(pc);
        const inScale = activePitchClasses.has(pc);
        const noteClass = isRoot ? 'root' : isChar ? 'char' : inScale ? 'active' : '';
        const isChordFret = isChordMode && chordPosKeys.has(`${sIdx}:${fret}`);
        const glowClasses = isChordFret ? 'playing-glow glow-mode-chord' : '';
        const fingerNum = isChordMode && !useBassNeck ? guitarFingerMap.get(`${sIdx}:${fret}`) || 0 : 0;
        const fingerBadge = fingerNum > 0 ? `<span class="finger-badge" title="Dedo ${fingerNum}">${fingerNum}</span>` : '';
        fretRowsHtml += `
          <div class="fret-cell" data-sidx="${sIdx}" data-fret="${fret}" data-midi="${midi}" title="Cuerda ${str.label}, Traste ${fret}: ${NOTE_NAMES[pc]}${fingerNum > 0 ? ` · Dedo ${fingerNum}` : ''} (${audio.midiToFreq(midi).toFixed(1)} Hz)">
            <div class="fret-note ${noteClass} ${glowClasses}">${NOTE_NAMES[pc]}${fingerBadge}</div>
          </div>
        `;
      }
      fretRowsHtml += `</div>`;
    });
    fretboardContainer.innerHTML = fretRowsHtml;

    if (syncChordGlow && computedChordState) {
      audio.emitChordHighlight(computedChordState.chordMidis, fretboardContainer);
    }
  };

  renderVisuals(false);

  rootSelect.addEventListener('change', () => {
    currentRoot = parseInt(rootSelect.value, 10);
    renderVisuals(isChordMode);
  });

  modeSelect.addEventListener('change', () => {
    if (isChordMode) {
      currentChordId = modeSelect.value;
    } else {
      currentScaleId = modeSelect.value;
    }
    renderVisuals(isChordMode);
  });

  scaleGuideSelect?.addEventListener('change', () => {
    currentScaleId = scaleGuideSelect.value;
    renderVisuals(isChordMode);
  });

  instSelect?.addEventListener('change', () => {
    currentInstrument = instSelect.value as 'guitar' | 'piano' | 'bass';
    if (!isBassOnly && hidePiano) {
      setVisualInstrumentFocus(currentInstrument === 'bass' ? 'bass-only' : 'guitar-only');
    }
    renderVisuals(isChordMode);
  });

  togglePianoBtn?.addEventListener('click', () => {
    if (isBassOnly) return;
    if (hidePiano) {
      setVisualInstrumentFocus('all');
    } else {
      const nextFocus = currentInstrument === 'bass' ? 'bass-only' : 'guitar-only';
      setVisualInstrumentFocus(nextFocus);
    }
  });

  const onGlobalVisualChange = () => {
    if (!container.isConnected) {
      window.removeEventListener('enciclopedia:visual-instrument-change', onGlobalVisualChange);
      return;
    }
    if (isBassOnly) return;
    visualFocus = getVisualInstrumentFocus();
    hidePiano = visualFocus !== 'all';
    currentInstrument = computeEffectiveExplorerInstrument(visualFocus, currentInstrument === 'piano' && hidePiano ? 'guitar' : currentInstrument);
    renderVisuals(false);
  };
  window.addEventListener('enciclopedia:visual-instrument-change', onGlobalVisualChange);

  bassStyleSelect?.addEventListener('change', () => {
    bassStyle = bassStyleSelect.value as 'finger' | 'slap';
  });

  playMainBtn.addEventListener('click', () => {
    audio.stopAll(true);
    if (isChordMode && currentInstrument !== 'bass') {
      const chord = CHORDS_DB.find((c) => c.id === currentChordId) || CHORDS_DB[0];
      const notes = chord.intervals.map((i) => 48 + currentRoot + i);
      audio.strumChord(notes, currentInstrument, 0, false);
      onStatus(`Acorde ${NOTE_NAMES[currentRoot]}${chord.symbol}`);
    } else {
      const intervals = getActiveIntervals();
      const useBassNeck = isBassOnly || currentInstrument === 'bass';
      const neckStrings = useBassNeck ? BASS_STRINGS : GUITAR_STRINGS;
      const scalePath = buildScaleFretboardPath(
        neckStrings.map((s) => s.openMidi),
        currentRoot,
        intervals,
        12
      );
      scalePath.forEach((step, idx) => {
        const hint: NoteGlowHint = {
          sIdx: step.sIdx,
          fret: step.fret,
          scopeEl: fretboardContainer,
        };
        const delaySec = idx * 0.2;
        if (currentInstrument === 'bass' || isBassOnly) {
          audio.playElectricBass(step.midi, 0.42, delaySec, 0.36, bassStyle, false, hint);
        } else if (currentInstrument === 'guitar') {
          audio.playPluckedGuitar(step.midi, 0.48, delaySec, 0.28, false, hint);
        } else {
          const pianoMidi = step.midi < 48 ? step.midi + 12 : step.midi;
          audio.playAcousticPiano(pianoMidi, 0.48, delaySec, 0.25, false, {
            ...hint,
            scopeEl: fretboardContainer,
          });
        }
      });
      onStatus(`Reproduciendo escala paso a paso en ${currentInstrument === 'bass' || isBassOnly ? 'Bajo Eléctrico (4 Cuerdas)' : currentInstrument === 'guitar' ? 'Guitarra' : 'Piano'}`);
    }
  });

  droneBtn.addEventListener('click', () => {
    const active = audio.toggleDrone(36 + currentRoot);
    droneBtn.textContent = active ? `🔊 Pedal ${NOTE_NAMES[currentRoot]} (ACTIVO)` : '🔊 Pedal Tónica';
    if (active) {
      pedalCoachBox.style.display = 'block';
    }
    onStatus(active ? `Pedal de tónica ${NOTE_NAMES[currentRoot]} activado (escucha cómo cada nota cobra gravedad sobre la raíz)` : 'Pedal de tónica desactivado');
  });

  pedalExplainBtn.addEventListener('click', () => {
    pedalCoachBox.style.display = pedalCoachBox.style.display === 'none' ? 'block' : 'none';
  });

  container.querySelector('.js-pedal-demo-modes')?.addEventListener('click', () => {
    audio.stopAll(false);
    if (!audio.isDroneActive()) {
      audio.toggleDrone(36 + currentRoot);
      droneBtn.textContent = `🔊 Pedal ${NOTE_NAMES[currentRoot]} (ACTIVO)`;
    }
    const base = 60 + currentRoot;
    const demoSteps = [
      { semi: 4, msg: '3ª Mayor (Modo Jónico: Luminoso y estable)' },
      { semi: 3, msg: 'b3 Menor (Modo Eólico/Dórico: Melancólico e íntimo)' },
      { semi: 6, msg: '#4 Aumentada (Modo Lidio: Asombro espacial e ingravidez)' },
      { semi: 1, msg: 'b2 Menor (Modo Frigio: Tensión flamenca oscura)' },
      { semi: 7, msg: '5ª Justa (Estabilidad y resolución sobre el Pedal)' },
    ];
    demoSteps.forEach((st, idx) => {
      audio.schedule(() => {
        const m = base + st.semi;
        audio.playPluckedGuitar(m, 1.15, 0, 0.3, false);
        updatePedalDegreeReadout(m);
        onStatus(`Pedal ${NOTE_NAMES[currentRoot]} + ${st.msg}`);
      }, idx * 1250);
    });
  });

  container.querySelector('.js-pedal-demo-chords')?.addEventListener('click', () => {
    audio.stopAll(false);
    const pedal = 36 + currentRoot;
    const r = 60 + currentRoot;
    const chords = [
      { notes: [pedal, r, r + 4, r + 7], name: `${NOTE_NAMES[currentRoot]} Mayor (Reposo)` },
      { notes: [pedal, r + 2, r + 5, r + 9], name: `ii / ${NOTE_NAMES[currentRoot]} (Tensión Suave)` },
      { notes: [pedal, r + 5, r + 8, r + 12], name: `ivm / ${NOTE_NAMES[currentRoot]} (Plagal Menor Cinematográfico)` },
      { notes: [pedal, r + 5, r + 7, r + 11], name: `V7 / ${NOTE_NAMES[currentRoot]} (Máxima Tensión sobre Pedal)` },
      { notes: [pedal, r, r + 4, r + 7, r + 12], name: `${NOTE_NAMES[currentRoot]} Mayor (Resolución Final)` },
    ];
    chords.forEach((ch, idx) => {
      audio.schedule(() => {
        if (isBassOnly || currentInstrument === 'bass') {
          audio.playElectricBass(ch.notes[0], 0.85, 0, 0.36, bassStyle, false);
        } else {
          const strumTimb = hidePiano || currentInstrument === 'guitar' ? 'guitar' : 'piano';
          audio.strumChord(ch.notes, strumTimb, 0, false);
        }
        pedalLiveDegree.innerHTML = `<strong>Progresión sobre Bajo Pedal ${NOTE_NAMES[currentRoot]}:</strong> Sonando <strong>${ch.name}</strong> mientras el bajo permanece anclado en ${NOTE_NAMES[currentRoot]}2.`;
        onStatus(`Bajo Pedal: ${ch.name}`);
      }, idx * 1150);
    });
  });

  stopBtn.addEventListener('click', () => {
    audio.stopAll(false);
    droneBtn.textContent = '🔊 Pedal Tónica';
    onStatus('Audio detenido');
  });

  pianoContainer?.addEventListener('click', (e) => {
    const key = (e.target as HTMLElement).closest<HTMLElement>('[data-midi]');
    if (!key) return;
    const midi = parseInt(key.getAttribute('data-midi')!, 10);
    if (currentInstrument === 'piano') {
      audio.playAcousticPiano(midi, 1.1, 0, 0.3, true);
    } else if (currentInstrument === 'bass') {
      audio.playElectricBass(midi - 24, 1.2, 0, 0.36, bassStyle, true);
    } else {
      audio.playPluckedGuitar(midi, 1.3, 0, 0.3, true);
    }
    updatePedalDegreeReadout(midi);
    onStatus(`Teclado: ${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1} (${audio.midiToFreq(midi).toFixed(1)} Hz)`);
  });

  fretboardContainer.addEventListener('click', (e) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('[data-midi]');
    if (!cell) return;
    const midi = parseInt(cell.getAttribute('data-midi')!, 10);
    const sIdx = parseInt(cell.getAttribute('data-sidx') || '-1', 10);
    const fret = parseInt(cell.getAttribute('data-fret') || '-1', 10);
    const hint: NoteGlowHint = sIdx >= 0 && fret >= 0 ? { sIdx, fret, scopeEl: fretboardContainer } : {};
    if (isBassOnly || currentInstrument === 'bass') {
      audio.playElectricBass(midi, 1.35, 0, 0.38, bassStyle, true, hint);
      onStatus(`Bajo 4 Cuerdas: ${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1} (${audio.midiToFreq(midi).toFixed(1)} Hz)`);
    } else {
      audio.playPluckedGuitar(midi, 1.5, 0, 0.32, true, hint);
      onStatus(`Guitarra 6 Cuerdas: ${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1} (${audio.midiToFreq(midi).toFixed(1)} Hz)`);
    }
    updatePedalDegreeReadout(midi);
  });
}

/**
 * SPECIALIZED LAB 1: Additive Harmonic Series & Live Waveform Oscilloscope (harmonics-lab)
 */
function buildHarmonicsOscilloscopeLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  let amplitudes = [1.0, 0.5, 0.33, 0.25, 0.2, 0.16, 0.12, 0.1];
  const harmonicInfo = [
    { n: 1, label: '1º f1 (E2)', midi: 40, ratio: '1:1 Fundamental' },
    { n: 2, label: '2º f2 (E3)', midi: 52, ratio: '2:1 Octava' },
    { n: 3, label: '3º f3 (B3)', midi: 59, ratio: '3:2 Quinta Justa' },
    { n: 4, label: '4º f4 (E4)', midi: 64, ratio: '4:3 2ª Octava' },
    { n: 5, label: '5º f5 (G#4)', midi: 68, ratio: '5:4 Tercera Mayor' },
    { n: 6, label: '6º f6 (B4)', midi: 71, ratio: '6:5 Quinta de 2ª Oct' },
    { n: 7, label: '7º f7 (D5)', midi: 74, ratio: '7:4 7ª Natural' },
    { n: 8, label: '8º f8 (E5)', midi: 76, ratio: '8:1 3ª Octava' },
  ];

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <button type="button" class="btn js-h-preset" data-p="guitar" style="font-size:0.76rem; background:rgba(245,158,11,0.18); color:#fbbf24; border:1px solid rgba(245,158,11,0.4);">🎸 Receta Cuerda Pulsada</button>
        <button type="button" class="btn js-h-preset" data-p="clarinet" style="font-size:0.76rem; background:rgba(56,189,248,0.16); color:#38bdf8; border:1px solid rgba(56,189,248,0.4);">🎷 Clarinete (Solo Impares)</button>
        <button type="button" class="btn js-h-preset" data-p="pure" style="font-size:0.76rem; background:rgba(16,185,129,0.16); color:#34d399; border:1px solid rgba(16,185,129,0.4);">〰️ Onda Senoidal Pura</button>
      </div>
      <div style="display:flex; gap:6px;">
        <button type="button" class="btn btn-primary js-h-play-all" style="font-size:0.78rem;">▶ Escuchar Timbre Resultante</button>
        <button type="button" class="btn js-h-arp" style="font-size:0.78rem; background:rgba(167,139,250,0.2); color:#c4b5fd;">▶ Desplegar Serie 1→8</button>
        <button type="button" class="btn js-h-stop" style="font-size:0.78rem; background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
      </div>
    </div>

    <canvas class="js-h-canvas" width="680" height="120" style="width:100%; height:120px; background:#070a12; border:1px solid rgba(56,189,248,0.3); border-radius:8px; margin-bottom:12px;"></canvas>

    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(135px, 1fr)); gap:8px;">
      ${harmonicInfo
        .map(
          (h, idx) => `
        <div style="background:rgba(15,23,42,0.9); border:1px solid rgba(56,189,248,0.3); padding:10px; border-radius:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="color:var(--accent-gold); font-size:0.82rem;">${h.label}</strong>
            <button type="button" class="btn-audio js-h-single" data-midi="${h.midi}" style="margin:0; padding:1px 6px;">🔊</button>
          </div>
          <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:6px;">${h.ratio}</div>
          <input type="range" class="js-h-slider" data-idx="${idx}" min="0" max="100" value="${Math.round(amplitudes[idx] * 100)}" style="width:100%; accent-color:#38bdf8;">
        </div>
      `
        )
        .join('')}
    </div>
  `;

  const canvas = stage.querySelector<HTMLCanvasElement>('.js-h-canvas')!;
  const sliders = stage.querySelectorAll<HTMLInputElement>('.js-h-slider');

  const drawWave = (): void => {
    const c = canvas.getContext('2d');
    if (!c) return;
    const w = canvas.width;
    const h = canvas.height;
    c.clearRect(0, 0, w, h);

    // Center axis
    c.strokeStyle = 'rgba(148,163,184,0.2)';
    c.beginPath();
    c.moveTo(0, h / 2);
    c.lineTo(w, h / 2);
    c.stroke();

    // Composite waveform
    c.strokeStyle = '#38bdf8';
    c.lineWidth = 2.5;
    c.beginPath();
    const maxAmp = Math.max(0.5, amplitudes.reduce((a, b) => a + b, 0));
    for (let x = 0; x < w; x++) {
      const t = (x / w) * Math.PI * 4;
      let yVal = 0;
      amplitudes.forEach((amp, idx) => {
        yVal += amp * Math.sin(t * (idx + 1));
      });
      const py = h / 2 - (yVal / maxAmp) * (h * 0.42);
      if (x === 0) c.moveTo(x, py);
      else c.lineTo(x, py);
    }
    c.stroke();
  };

  drawWave();

  sliders.forEach((sl) => {
    sl.addEventListener('input', () => {
      const idx = parseInt(sl.getAttribute('data-idx')!, 10);
      amplitudes[idx] = parseInt(sl.value, 10) / 100;
      drawWave();
    });
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const single = target.closest<HTMLElement>('.js-h-single');
    if (single) {
      const midi = parseInt(single.getAttribute('data-midi')!, 10);
      audio.playPluckedGuitar(midi, 1.4, 0, 0.3, true);
      onStatus(`Parcial armónico reproducido: MIDI ${midi} (${audio.midiToFreq(midi).toFixed(1)} Hz)`);
      return;
    }

    const preset = target.closest<HTMLElement>('.js-h-preset');
    if (preset) {
      const p = preset.getAttribute('data-p');
      if (p === 'guitar') amplitudes = [1.0, 0.65, 0.42, 0.28, 0.22, 0.16, 0.1, 0.08];
      else if (p === 'clarinet') amplitudes = [1.0, 0.0, 0.75, 0.0, 0.45, 0.0, 0.25, 0.0];
      else amplitudes = [1.0, 0, 0, 0, 0, 0, 0, 0];
      sliders.forEach((sl, i) => (sl.value = String(Math.round(amplitudes[i] * 100))));
      drawWave();
      stage.querySelector<HTMLButtonElement>('.js-h-play-all')?.click();
      return;
    }

    if (target.closest('.js-h-play-all')) {
      audio.stopAll();
      harmonicInfo.forEach((h, i) => {
        if (amplitudes[i] > 0.01) {
          audio.playAcousticPiano(h.midi, 1.6, 0, amplitudes[i] * 0.22, false);
        }
      });
      onStatus('Reproduciendo síntesis aditiva con la mezcla de armónicos seleccionada');
    } else if (target.closest('.js-h-arp')) {
      audio.stopAll();
      harmonicInfo.forEach((h, i) => {
        audio.playPluckedGuitar(h.midi, 0.7, i * 0.28, 0.28, false);
      });
      onStatus('Desplegando serie armónica del 1º al 8º parcial sobre E2');
    } else if (target.closest('.js-h-stop')) {
      audio.stopAll();
      onStatus('Audio detenido');
    }
  });
}

/**
 * SPECIALIZED LAB 2: Exclusively 4-String Electric Bass Laboratory (bass-line-lab, bass-gym-lab, bajo-lab-legacy, bajo-compositor-legacy)
 */
function buildDedicatedBassLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void,
  variant: 'geometry' | 'reharmonize' | 'lines' | 'gym'
): void {
  const presets = [
    {
      id: 'box_158',
      name: '1) Cajón Invariante Raíz – 5ª Aguda – Octava – b7 (C7 Funk/Rock)',
      style: 'finger' as const,
      notes: [
        { s: 2, f: 3, dur: 0.45, label: 'C2 (Raíz)' },
        { s: 1, f: 5, dur: 0.45, label: 'G2 (5ª Justa)' },
        { s: 0, f: 3, dur: 0.45, label: 'Bb2 (b7 Dominante)' },
        { s: 0, f: 5, dur: 0.55, label: 'C3 (Octava)' },
        { s: 3, f: 3, dur: 0.45, label: 'G1 (5ª Grave)' },
        { s: 2, f: 3, dur: 0.7, label: 'C2 (Raíz)' },
      ],
    },
    {
      id: 'walking_251',
      name: '2) Walking Bass Jazz sobre | Dm7 | G7 | Cmaj7 | A7b9 | (Aproximaciones en Pulso 4)',
      style: 'finger' as const,
      notes: [
        { s: 2, f: 5, dur: 0.38, label: 'D2 (Dm7 Raíz)' },
        { s: 1, f: 3, dur: 0.38, label: 'F2 (b3)' },
        { s: 1, f: 7, dur: 0.38, label: 'A2 (5ª)' },
        { s: 1, f: 6, dur: 0.38, label: 'Ab2 (Aprox. Cromática → G)' },
        { s: 3, f: 3, dur: 0.38, label: 'G1 (G7 Raíz)' },
        { s: 2, f: 2, dur: 0.38, label: 'B1 (3ªM)' },
        { s: 2, f: 5, dur: 0.38, label: 'D2 (5ª)' },
        { s: 2, f: 4, dur: 0.38, label: 'Db2 (Aprox. Cromática → C)' },
        { s: 2, f: 3, dur: 0.65, label: 'C2 (Cmaj7 Destino)' },
      ],
    },
    {
      id: 'slap_octaves',
      name: '3) Slap & Pop en Octavas (Mi Menor Funk: Thumb en 4ª cuerda + Pop en 2ª cuerda)',
      style: 'slap' as const,
      notes: [
        { s: 3, f: 0, dur: 0.25, label: 'E1 (Thumb Slap)' },
        { s: 1, f: 2, dur: 0.25, label: 'E2 (Pop Octava)' },
        { s: 3, f: 3, dur: 0.25, label: 'G1 (Thumb)' },
        { s: 1, f: 5, dur: 0.25, label: 'G2 (Pop Octava)' },
        { s: 3, f: 5, dur: 0.25, label: 'A1 (Thumb)' },
        { s: 1, f: 7, dur: 0.25, label: 'A2 (Pop Octava)' },
        { s: 2, f: 7, dur: 0.6, label: 'E2 (Reposo)' },
      ],
    },
    {
      id: 'tenths_chords',
      name: '4) Décimas Armónicas en el Bajo (Cuerdas 4ª [E] y 1ª [G] estilo Pastorius)',
      style: 'finger' as const,
      notes: [
        { s: 3, f: 3, dur: 0.5, label: 'G1 (Raíz Sol)' },
        { s: 0, f: 4, dur: 0.5, label: 'B2 (10ª Mayor)' },
        { s: 3, f: 5, dur: 0.5, label: 'A1 (Raíz La)' },
        { s: 0, f: 5, dur: 0.5, label: 'C3 (10ª Menor)' },
        { s: 3, f: 8, dur: 0.5, label: 'C2 (Raíz Do)' },
        { s: 0, f: 9, dur: 0.65, label: 'E3 (10ª Mayor)' },
      ],
    },
    {
      id: 'tumbao_salsa',
      name: '5) Tumbao Afrocubano Anticipado (Raíz – 5ª – 8ª cambiando en el Pulso 4)',
      style: 'finger' as const,
      notes: [
        { s: 2, f: 5, dur: 0.42, label: 'D2 (1)' },
        { s: 2, f: 0, dur: 0.28, label: 'A1 (2&)' },
        { s: 3, f: 3, dur: 0.5, label: 'G1 (¡Anticipa G7 en pulso 4!)' },
        { s: 2, f: 2, dur: 0.28, label: 'B1 (2&)' },
        { s: 2, f: 5, dur: 0.28, label: 'D2 (3)' },
        { s: 2, f: 3, dur: 0.65, label: 'C2 (¡Anticipa C en pulso 4!)' },
      ],
    },
  ];

  let currentIdx = variant === 'lines' ? 1 : variant === 'reharmonize' ? 3 : variant === 'gym' ? 2 : 0;
  let withDrums = true;

  let fretHeaderHtml = `<div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.15); margin-bottom:4px;"><div class="string-label" style="color:var(--text-muted); font-size:0.7rem;">Traste</div>`;
  for (let f = 0; f <= 12; f++) {
    const marker = [3, 5, 7, 9, 12].includes(f) ? '•' : '';
    fretHeaderHtml += `<div class="fret-cell" style="height:20px; border:none; color:var(--text-muted); font-size:0.72rem; font-weight:700;">${f}${marker}</div>`;
  }
  fretHeaderHtml += `</div>`;

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
        <label style="font-size:0.82rem; color:var(--accent-cyan); font-weight:700;">Ejercicio en 4 Cuerdas:</label>
        <select class="js-bass-preset">
          ${presets.map((p, i) => `<option value="${i}" ${i === currentIdx ? 'selected' : ''}>${p.name}</option>`).join('')}
        </select>
        <label style="font-size:0.8rem; display:flex; align-items:center; gap:4px; cursor:pointer;">
          <input type="checkbox" class="js-bass-drums" checked> 🥁 Con Batería (Bombo + Caja)
        </label>
      </div>
      <div style="display:flex; gap:8px;">
        <button type="button" class="btn btn-primary js-bass-play">▶ Reproducir Línea de Bajo</button>
        <button type="button" class="btn js-bass-stop" style="background:rgba(244,63,94,0.2); color:#fb7185; border:1px solid rgba(244,63,94,0.4);">⏹ Detener</button>
      </div>
    </div>

    <div class="js-bass-step-banner" style="padding:10px 14px; background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.3); border-radius:6px; font-size:0.84rem; margin-bottom:10px;">
      <strong>🎸 Mástil Exclusivo de Bajo Eléctrico (4 Cuerdas: 1ª=G2, 2ª=D2, 3ª=A1, 4ª=E1):</strong> Haz clic en cualquier traste o pulsa Reproducir para ver cada paso iluminado.
    </div>

    <div class="fretboard-wrapper js-bass-neck"></div>
  `;

  const sel = stage.querySelector<HTMLSelectElement>('.js-bass-preset')!;
  const drumChk = stage.querySelector<HTMLInputElement>('.js-bass-drums')!;
  const playBtn = stage.querySelector<HTMLButtonElement>('.js-bass-play')!;
  const stopBtn = stage.querySelector<HTMLButtonElement>('.js-bass-stop')!;
  const banner = stage.querySelector<HTMLElement>('.js-bass-step-banner')!;
  const neck = stage.querySelector<HTMLElement>('.js-bass-neck')!;

  const renderNeck = (activeS = -1, activeF = -1): void => {
    const p = presets[currentIdx];
    const presetMap = new Map<string, string>();
    p.notes.forEach((n, idx) => {
      presetMap.set(`${n.s}-${n.f}`, idx === 0 ? 'root' : 'active');
    });

    let rowsHtml = fretHeaderHtml;
    BASS_STRINGS.forEach((str, sIdx) => {
      rowsHtml += `<div class="fretboard-row"><div class="string-label" style="color:#38bdf8; font-weight:800;">${str.label}</div>`;
      for (let f = 0; f <= 12; f++) {
        const midi = str.openMidi + f;
        const pc = midi % 12;
        const isCurrentStep = sIdx === activeS && f === activeF;
        const stateClass = isCurrentStep ? 'root' : presetMap.get(`${sIdx}-${f}`) || '';
        const ringStyle = isCurrentStep ? 'transform:scale(1.22); box-shadow:0 0 14px #f59e0b;' : '';
        rowsHtml += `
          <div class="fret-cell js-bneck-cell" data-s="${sIdx}" data-f="${f}" data-midi="${midi}" title="Bajo ${str.label}, Traste ${f}: ${NOTE_NAMES[pc]}${Math.floor(midi / 12) - 1} (${audio.midiToFreq(midi).toFixed(1)} Hz)">
            <div class="fret-note ${stateClass}" style="${ringStyle}">${NOTE_NAMES[pc]}</div>
          </div>
        `;
      }
      rowsHtml += `</div>`;
    });
    neck.innerHTML = rowsHtml;
  };

  renderNeck();

  sel.addEventListener('change', () => {
    currentIdx = parseInt(sel.value, 10);
    audio.stopAll();
    renderNeck();
  });

  drumChk.addEventListener('change', () => {
    withDrums = drumChk.checked;
  });

  neck.addEventListener('click', (e) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('.js-bneck-cell');
    if (!cell) return;
    const midi = parseInt(cell.getAttribute('data-midi')!, 10);
    const s = parseInt(cell.getAttribute('data-s')!, 10);
    const f = parseInt(cell.getAttribute('data-f')!, 10);
    const style = presets[currentIdx].style;
    audio.playElectricBass(midi, 1.3, 0, 0.4, style, true, { sIdx: s, fret: f, scopeEl: neck });
    banner.innerHTML = `<strong>Sonando en Bajo (${style === 'slap' ? 'Slap/Pop' : 'Fingerstyle'}):</strong> Cuerda ${BASS_STRINGS[s].label}, Traste ${f} → Nota <strong>${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}</strong> (${audio.midiToFreq(midi).toFixed(1)} Hz)`;
    onStatus(`Bajo 4 Cuerdas: ${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1} (Traste ${f})`);
  });

  playBtn.addEventListener('click', () => {
    audio.stopAll();
    const p = presets[currentIdx];
    let elapsedMs = 0;
    p.notes.forEach((n, idx) => {
      const midi = BASS_STRINGS[n.s].openMidi + n.f;
      const stepMs = elapsedMs;
      audio.schedule(() => {
        audio.playElectricBass(midi, n.dur * 1.15, 0, 0.4, p.style, false, {
          sIdx: n.s,
          fret: n.f,
          scopeEl: neck,
        });
        if (withDrums) {
          audio.playDrumHit(idx % 2 === 0 ? 'kick' : 'snare', 0);
          audio.playDrumHit('hihat', 0);
        }
        banner.innerHTML = `<strong>Paso ${idx + 1}/${p.notes.length}:</strong> ${n.label} — Cuerda ${BASS_STRINGS[n.s].label}, Traste ${n.f} (${audio.midiToFreq(midi).toFixed(1)} Hz)`;
        onStatus(`Bajo Eléctrico: ${n.label}`);
      }, stepMs);
      elapsedMs += n.dur * 1000;
    });
  });

  const unsubBassStop = audio.onStop(() => {
    if (!document.body.contains(stage)) {
      unsubBassStop();
      return;
    }
    renderNeck();
  });

  stopBtn.addEventListener('click', () => {
    audio.stopAll();
    renderNeck();
    onStatus('Bajo detenido');
  });
}

/**
 * SPECIALIZED LAB 3: Vocal Warm-Up, Tesitura SATB & 4-Part Choir Laboratory (voice-lab, vocal-warmup-lab, canto-legacy)
 */
function buildVocalAndWarmupLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void,
  initialMode: 'warmup' | 'range' | 'harmony' = 'warmup'
): void {
  let currentTab: 'warmup' | 'range' | 'harmony' = initialMode;
  let rootMidi = 60; // C4 default, user can transpose up/down by semitone!
  let selectedVowel: 'a' | 'e' | 'i' | 'o' | 'u' | 'lip' = 'lip';

  const voiceRanges = [
    { name: 'Bajo (E2 – E4)', min: 40, max: 64, pass: 'A3–D4', desc: 'Voz grave masculina: cimiento armónico profundo.' },
    { name: 'Barítono (A2 – A4)', min: 45, max: 69, pass: 'B3–E4', desc: 'Voz media masculina: calidez lírica y potencia en registro medio.' },
    { name: 'Tenor (C3 – C5)', min: 48, max: 72, pass: 'D4–G4', desc: 'Voz aguda masculina: brillo heroico en la octava 4.' },
    { name: 'Contralto (F3 – F5)', min: 53, max: 77, pass: 'C4 / D5', desc: 'Voz grave femenina: timbre oscuro, aterciopelado y profundo.' },
    { name: 'Mezzosoprano (A3 – A5)', min: 57, max: 81, pass: 'E4 / E5', desc: 'Voz media femenina: gran riqueza en zona media-alta.' },
    { name: 'Soprano (C4 – C6)', min: 60, max: 84, pass: 'F4 / F#5', desc: 'Voz aguda femenina: proyección cristalina en la octava 5.' },
  ];

  const render = (): void => {
    const rootLabel = `${NOTE_NAMES[rootMidi % 12]}${Math.floor(rootMidi / 12) - 1}`;
    stage.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:10px;">
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="btn js-vmode-btn" data-m="warmup" style="background:${currentTab === 'warmup' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)'}; color:${currentTab === 'warmup' ? '#090d16' : '#f8fafc'};">🔥 1. Rutina de Calentamiento Vocal y SOVT</button>
          <button type="button" class="btn js-vmode-btn" data-m="range" style="background:${currentTab === 'range' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)'}; color:${currentTab === 'range' ? '#090d16' : '#f8fafc'};">📏 2. Detector de Tesitura SATB y Passaggio</button>
          <button type="button" class="btn js-vmode-btn" data-m="harmony" style="background:${currentTab === 'harmony' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)'}; color:${currentTab === 'harmony' ? '#090d16' : '#f8fafc'};">🎶 3. Armonizador Coral (2, 3 y 4 Voces)</button>
        </div>
        <button type="button" class="btn js-v-stop" style="background:rgba(244,63,94,0.2); color:#fb7185; border:1px solid rgba(244,63,94,0.4);">⏹ Detener Audio</button>
      </div>
      <div class="js-v-body"></div>
    `;

    const body = stage.querySelector<HTMLElement>('.js-v-body')!;

    if (currentTab === 'warmup') {
      body.innerHTML = `
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:space-between; margin-bottom:12px; background:rgba(0,0,0,0.3); padding:10px 14px; border-radius:8px;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="font-size:0.84rem; color:var(--accent-cyan); font-weight:700;">Tónica Actual del Ejercicio: <strong style="color:var(--accent-gold); font-size:1rem;">${rootLabel}</strong></span>
            <button type="button" class="btn js-v-semi-down" style="padding:4px 10px; font-size:0.78rem; background:rgba(56,189,248,0.15); color:#38bdf8;">⬇ Bajar 1 Semitono</button>
            <button type="button" class="btn js-v-semi-up" style="padding:4px 10px; font-size:0.78rem; background:rgba(56,189,248,0.15); color:#38bdf8;">⬆ Subir 1 Semitono</button>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <label style="font-size:0.8rem;">Vocal / Tracto:</label>
            <select class="js-v-vowel">
              <option value="lip" ${selectedVowel === 'lip' ? 'selected' : ''}>Brrrr (Lip Trill SOVT)</option>
              <option value="u" ${selectedVowel === 'u' ? 'selected' : ''}>Uuuu (Cerrada Redonda)</option>
              <option value="o" ${selectedVowel === 'o' ? 'selected' : ''}>Oooo (Bostezo Noble)</option>
              <option value="a" ${selectedVowel === 'a' ? 'selected' : ''}>Aaaa (Abierta Clara)</option>
              <option value="e" ${selectedVowel === 'e' ? 'selected' : ''}>Eeee (Resonancia Máscara)</option>
              <option value="i" ${selectedVowel === 'i' ? 'selected' : ''}>Iiii (Brillo Frontal)</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px;">
          <div style="background:rgba(15,23,42,0.88); border:1px solid rgba(56,189,248,0.35); padding:12px; border-radius:8px;">
            <strong style="color:var(--accent-gold);">1. Lip Trill 5 Notas (1-2-3-4-5-4-3-2-1)</strong>
            <p style="font-size:0.78rem; color:var(--text-muted); margin:6px 0 10px 0;">Despierta el apoyo costal y lubrica la mucosa sin esfuerzo.</p>
            <button type="button" class="btn btn-primary js-vw-ex" data-ex="five" style="width:100%; font-size:0.8rem;">▶ Cantar Escala 1–5–1</button>
          </div>

          <div style="background:rgba(15,23,42,0.88); border:1px solid rgba(56,189,248,0.35); padding:12px; border-radius:8px;">
            <strong style="color:var(--accent-gold);">2. Sirena de Passaggio (1 → 5 → 8 → 5 → 1)</strong>
            <p style="font-size:0.78rem; color:var(--text-muted); margin:6px 0 10px 0;">Conecta voz de pecho (TA) y voz de cabeza (CT) en Voz Mixta.</p>
            <button type="button" class="btn btn-primary js-vw-ex" data-ex="siren" style="width:100%; font-size:0.8rem;">▶ Cantar Sirena de Octava</button>
          </div>

          <div style="background:rgba(15,23,42,0.88); border:1px solid rgba(56,189,248,0.35); padding:12px; border-radius:8px;">
            <strong style="color:var(--accent-gold);">3. Arpegio Bel Canto (1-3-5-8-5-3-1)</strong>
            <p style="font-size:0.78rem; color:var(--text-muted); margin:6px 0 10px 0;">Mantén las costillas abiertas al bajar de la octava aguda (8) a la raíz (1).</p>
            <button type="button" class="btn btn-primary js-vw-ex" data-ex="arp" style="width:100%; font-size:0.8rem;">▶ Cantar Arpegio + Subir Tono</button>
          </div>

          <div style="background:rgba(15,23,42,0.88); border:1px solid rgba(16,185,129,0.4); padding:12px; border-radius:8px;">
            <strong style="color:#34d399;">4. Igualación I–E–A–O–U en 1 Nota</strong>
            <p style="font-size:0.78rem; color:var(--text-muted); margin:6px 0 10px 0;">Cambia por las 5 vocales sin mover la mandíbula ni cambiar el brillo.</p>
            <button type="button" class="btn js-vw-ex" data-ex="vowels" style="width:100%; font-size:0.8rem; background:rgba(16,185,129,0.2); color:#34d399;">▶ Escuchar I → E → A → O → U</button>
          </div>
        </div>
      `;
    } else if (currentTab === 'range') {
      body.innerHTML = `
        <p style="font-size:0.84rem; color:var(--text-muted); margin-bottom:10px;">Haz clic en cada clasificación vocal para escuchar su nota grave extrema, su zona de *passaggio* y su nota aguda:</p>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:10px;">
          ${voiceRanges
            .map(
              (vr, idx) => `
            <div style="background:rgba(15,23,42,0.9); border:1px solid rgba(245,158,11,0.35); padding:12px; border-radius:8px;">
              <strong style="color:var(--accent-gold); font-size:0.92rem;">${vr.name}</strong>
              <div style="font-size:0.75rem; color:var(--accent-cyan); margin:4px 0;">Puente (Passaggio): ${vr.pass}</div>
              <p style="font-size:0.76rem; color:var(--text-muted); margin-bottom:8px;">${vr.desc}</p>
              <button type="button" class="btn btn-primary js-vr-play" data-idx="${idx}" style="width:100%; font-size:0.76rem;">🔊 Escuchar Extremos y Centro</button>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    } else {
      body.innerHTML = `
        <p style="font-size:0.84rem; color:var(--text-muted); margin-bottom:10px;">Escucha una frase melódica en Do Mayor (E4 – F4 – G4 – A4 – G4) armonizada en diferentes configuraciones vocales:</p>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <button type="button" class="btn btn-primary js-vh-play" data-h="lead">🎤 Solo Voz Principal (Lead)</button>
          <button type="button" class="btn js-vh-play" data-h="up3" style="background:rgba(56,189,248,0.18); color:#38bdf8; border:1px solid rgba(56,189,248,0.4);">🎤+🎤 Dúo: 1ª + 2ª Voz Superior (+3ª)</button>
          <button type="button" class="btn js-vh-play" data-h="low6" style="background:rgba(16,185,129,0.18); color:#34d399; border:1px solid rgba(16,185,129,0.4);">🎤+🎤 Dúo: 1ª + 2ª Voz Inferior (-6ª)</button>
          <button type="button" class="btn js-vh-play" data-h="trio" style="background:rgba(167,139,250,0.2); color:#c4b5fd; border:1px solid rgba(167,139,250,0.4);">🎶 Trío en Bloque Cerrado (Pop/Gospel)</button>
          <button type="button" class="btn js-vh-play" data-h="karaoke" style="background:rgba(245,158,11,0.2); color:#fbbf24; border:1px solid rgba(245,158,11,0.4);">🎯 Modo Práctica: Suenan las Armonías (¡Canta tú la Principal!)</button>
        </div>
      `;
    }
  };

  render();

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const modeBtn = target.closest<HTMLElement>('.js-vmode-btn');
    if (modeBtn) {
      currentTab = modeBtn.getAttribute('data-m') as 'warmup' | 'range' | 'harmony';
      audio.stopAll();
      render();
      return;
    }

    if (target.closest('.js-v-stop')) {
      audio.stopAll();
      onStatus('Audio vocal detenido');
      return;
    }

    if (target.closest('.js-v-semi-down')) {
      rootMidi = Math.max(43, rootMidi - 1);
      render();
      audio.playAcousticPiano(rootMidi, 0.8, 0, 0.25, true);
      return;
    }

    if (target.closest('.js-v-semi-up')) {
      rootMidi = Math.min(76, rootMidi + 1);
      render();
      audio.playAcousticPiano(rootMidi, 0.8, 0, 0.25, true);
      return;
    }

    const exBtn = target.closest<HTMLElement>('.js-vw-ex');
    if (exBtn) {
      audio.stopAll();
      const ex = exBtn.getAttribute('data-ex');
      const vSel = stage.querySelector<HTMLSelectElement>('.js-v-vowel');
      if (vSel) selectedVowel = vSel.value as 'a' | 'e' | 'i' | 'o' | 'u' | 'lip';

      // Guide chord on piano first
      audio.strumChord([rootMidi, rootMidi + 4, rootMidi + 7], 'piano', 0, false);

      if (ex === 'five') {
        const steps = [0, 2, 4, 5, 7, 5, 4, 2, 0];
        steps.forEach((s, i) => {
          audio.playVocalFormant(rootMidi + s, 0.36, 0.65 + i * 0.35, 0.28, selectedVowel, false);
          audio.playAcousticPiano(rootMidi + s, 0.36, 0.65 + i * 0.35, 0.14, false);
        });
        onStatus(`Calentamiento Vocal: Escala 1-2-3-4-5-4-3-2-1 desde ${NOTE_NAMES[rootMidi % 12]}`);
      } else if (ex === 'siren') {
        const steps = [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0];
        steps.forEach((s, i) => {
          audio.playVocalFormant(rootMidi + s, 0.22, 0.6 + i * 0.18, 0.26, selectedVowel, false);
        });
        onStatus('Calentamiento Vocal: Sirena de Octava para conectar el Passaggio');
      } else if (ex === 'arp') {
        const steps = [0, 4, 7, 12, 7, 4, 0];
        steps.forEach((s, i) => {
          audio.playVocalFormant(rootMidi + s, 0.42, 0.6 + i * 0.38, 0.28, selectedVowel, false);
          audio.playAcousticPiano(rootMidi + s, 0.42, 0.6 + i * 0.38, 0.15, false);
        });
        rootMidi = Math.min(74, rootMidi + 1);
        audio.schedule(() => render(), 3400);
        onStatus('Arpegio Vocal 1-3-5-8-5-3-1 (Subiendo automáticamente 1 semitono para la siguiente repetición)');
      } else if (ex === 'vowels') {
        const vs: ('i' | 'e' | 'a' | 'o' | 'u')[] = ['i', 'e', 'a', 'o', 'u'];
        vs.forEach((v, i) => {
          audio.playVocalFormant(rootMidi + 7, 0.65, 0.5 + i * 0.65, 0.3, v, false);
        });
        onStatus('Igualación de Formantes: I → E → A → O → U sobre la misma nota');
      }
      return;
    }

    const vrBtn = target.closest<HTMLElement>('.js-vr-play');
    if (vrBtn) {
      audio.stopAll();
      const idx = parseInt(vrBtn.getAttribute('data-idx')!, 10);
      const vr = voiceRanges[idx];
      const mid = Math.round((vr.min + vr.max) / 2);
      [vr.min, mid, vr.max].forEach((m, i) => {
        audio.playAcousticPiano(m, 0.85, i * 0.65, 0.24, false);
        audio.playVocalFormant(m, 0.85, i * 0.65, 0.24, 'a', false);
      });
      onStatus(`Tesitura ${vr.name}: Grave → Centro → Agudo`);
      return;
    }

    const vhBtn = target.closest<HTMLElement>('.js-vh-play');
    if (vhBtn) {
      audio.stopAll();
      const h = vhBtn.getAttribute('data-h');
      const lead = [64, 65, 67, 69, 67];
      const up3 = [67, 69, 71, 72, 71];
      const low6 = [55, 57, 60, 60, 60];

      lead.forEach((m, i) => {
        const d = i * 0.7;
        if (h !== 'karaoke') {
          audio.playVocalFormant(m, 0.65, d, 0.28, 'a', false);
        } else {
          // Subtle piano guide for the muted lead
          audio.playAcousticPiano(m, 0.3, d, 0.08, false);
        }
        if (h === 'up3' || h === 'trio' || h === 'karaoke') {
          audio.playVocalFormant(up3[i], 0.65, d, 0.22, 'o', false);
        }
        if (h === 'low6' || h === 'trio' || h === 'karaoke') {
          audio.playVocalFormant(low6[i], 0.65, d, 0.22, 'u', false);
        }
      });
      onStatus(`Armonía Vocal: Modo ${h?.toUpperCase()}`);
    }
  });
}

/**
 * SPECIALIZED LAB 4: Polyrhythm & Odd Meter Visualizer (polyrhythm-lab)
 */
function buildPolyrhythmLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const ratios = [
    { id: '3:2', a: 3, b: 2, desc: '3 contra 2 (Hemiola Andina / Afro-Cubana): MCM = 6 subdivisiones. Golpes en [1, 3, 5] vs [1, 4].' },
    { id: '4:3', a: 4, b: 3, desc: '4 contra 3 (Semicorcheas vs Tresillo): MCM = 12 subdivisiones. Golpes en [1, 4, 7, 10] vs [1, 5, 9].' },
    { id: '5:4', a: 5, b: 4, desc: '5 contra 4 (Quintillo sobre 4 pulsos): MCM = 20 subdivisiones.' },
    { id: '7/8', a: 7, b: 3, desc: 'Compás Irregular 7/8 (Agrupación 2 + 2 + 3): Acentos en corcheas 1, 3 y 5.' },
  ];
  let currentRatio = ratios[0];

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        ${ratios
          .map(
            (r, idx) =>
              `<button type="button" class="btn js-poly-sel" data-idx="${idx}" style="font-size:0.8rem; background:rgba(56,189,248,0.16); color:#38bdf8; border:1px solid rgba(56,189,248,0.4);">⚡ ${r.id}</button>`
          )
          .join('')}
      </div>
      <div style="display:flex; gap:8px;">
        <button type="button" class="btn btn-primary js-poly-play">▶ Escuchar 2 Ciclos</button>
        <button type="button" class="btn js-poly-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
      </div>
    </div>
    <div class="js-poly-desc" style="font-size:0.85rem; color:var(--text-muted); margin-bottom:10px;">${currentRatio.desc}</div>
    <div style="overflow-x:auto; max-width:100%;">
      <div class="js-poly-grid" style="display:flex; flex-direction:column; gap:8px; min-width:340px;"></div>
    </div>
  `;

  const descEl = stage.querySelector<HTMLElement>('.js-poly-desc')!;
  const gridEl = stage.querySelector<HTMLElement>('.js-poly-grid')!;

  const renderGrid = (activeStep = -1): void => {
    descEl.textContent = currentRatio.desc;
    if (currentRatio.id === '7/8') {
      const accents = new Set([0, 2, 4]);
      gridEl.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:6px;">
          ${[0, 1, 2, 3, 4, 5, 6]
            .map(
              (s) => `
            <div style="padding:12px 6px; text-align:center; border-radius:6px; background:${s === activeStep ? '#f59e0b' : accents.has(s) ? 'rgba(56,189,248,0.25)' : 'rgba(15,23,42,0.85)'}; color:${s === activeStep ? '#090d16' : '#f8fafc'}; border:1px solid rgba(56,189,248,0.4); font-weight:800;">
              ${s + 1} ${accents.has(s) ? 'Accent' : ''}
            </div>
          `
            )
            .join('')}
        </div>
      `;
      return;
    }

    const lcm = currentRatio.a * currentRatio.b;
    const stepA = lcm / currentRatio.a;
    const stepB = lcm / currentRatio.b;

    let rowA = `<div style="display:grid; grid-template-columns:110px repeat(${lcm}, 1fr); gap:4px; align-items:center;"><span style="font-size:0.76rem; color:var(--accent-gold); font-weight:700;">Voz A (${currentRatio.a}):</span>`;
    let rowB = `<div style="display:grid; grid-template-columns:110px repeat(${lcm}, 1fr); gap:4px; align-items:center;"><span style="font-size:0.76rem; color:var(--accent-cyan); font-weight:700;">Voz B (${currentRatio.b}):</span>`;

    for (let i = 0; i < lcm; i++) {
      const hitA = i % stepA === 0;
      const hitB = i % stepB === 0;
      const highlight = i === activeStep ? 'outline:2px solid #fff;' : '';
      rowA += `<div style="height:28px; border-radius:4px; ${highlight} background:${hitA ? 'var(--accent-gold)' : 'rgba(30,41,59,0.7)'}; display:flex; align-items:center; justify-content:center; font-size:0.7rem; color:#090d16; font-weight:800;">${hitA ? '●' : ''}</div>`;
      rowB += `<div style="height:28px; border-radius:4px; ${highlight} background:${hitB ? 'var(--accent-cyan)' : 'rgba(30,41,59,0.7)'}; display:flex; align-items:center; justify-content:center; font-size:0.7rem; color:#090d16; font-weight:800;">${hitB ? '▲' : ''}</div>`;
    }
    rowA += `</div>`;
    rowB += `</div>`;
    gridEl.innerHTML = rowA + rowB;
  };

  renderGrid();

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const sel = target.closest<HTMLElement>('.js-poly-sel');
    if (sel) {
      currentRatio = ratios[parseInt(sel.getAttribute('data-idx')!, 10)];
      audio.stopAll();
      renderGrid();
      return;
    }

    if (target.closest('.js-poly-stop')) {
      audio.stopAll();
      renderGrid();
      return;
    }

    if (target.closest('.js-poly-play')) {
      audio.stopAll();
      if (currentRatio.id === '7/8') {
        for (let cycle = 0; cycle < 2; cycle++) {
          for (let s = 0; s < 7; s++) {
            const idx = cycle * 7 + s;
            audio.schedule(() => {
              renderGrid(s);
              if (s === 0) audio.playDrumHit('kick');
              else if (s === 2) audio.playDrumHit('tom');
              else if (s === 4) audio.playDrumHit('snare');
              audio.playDrumHit('hihat');
            }, idx * 210);
          }
        }
        onStatus('Reproduciendo 7/8 (2 + 2 + 3)');
        return;
      }

      const lcm = currentRatio.a * currentRatio.b;
      const stepA = lcm / currentRatio.a;
      const stepB = lcm / currentRatio.b;
      const subMs = Math.max(95, Math.round(1800 / lcm));

      for (let c = 0; c < 2; c++) {
        for (let i = 0; i < lcm; i++) {
          const totalIdx = c * lcm + i;
          audio.schedule(() => {
            renderGrid(i);
            if (i % stepA === 0) audio.playDrumHit('clap');
            if (i % stepB === 0) audio.playDrumHit('kick');
          }, totalIdx * subMs);
        }
      }
      onStatus(`Reproduciendo polirritmia ${currentRatio.id} (MCM = ${lcm})`);
    }
  });
}

/**
 * Renders the compact, playable Top-View Ergonomic SVG Drum Kit (matching svg_drum_kit_topview)
 */
export function renderPlayableTopViewDrumSvg(
  title: string,
  activePieces: DrumKitPieceCode[] = ['BD', 'SD', 'HH', 'HHP', 'T1', 'T2', 'FT', 'RD', 'CR'],
  highlightedPiece: DrumKitPieceCode | null = null,
  note = 'Haz clic o toca cualquier pieza (o usa las teclas B, S, H, W, T, Y, U, C, R) para tocar en tiempo real',
  limbHits: DrumLimbHit[] = []
): string {
  return renderTopViewDrumKitSvg({
    title,
    activePieces,
    highlightedPiece,
    limbHits,
    note,
  });
}

/**
 * SPECIALIZED LAB 5: Interactive Top-View SVG Drum Kit + Rudiment & Sticking Trainer (drum-rudiment-lab, bateria-pads)
 */
export function buildDrumRudimentAndPadsLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const rudiments = [
    {
      name: '1. Single Paradiddle (R L R R - L R L L)',
      sticking: ['>R', 'L', 'R', 'R', '>L', 'R', 'L', 'L'],
      pieces: ['SD', 'HH', 'HH', 'HH', 'SD', 'HH', 'BD', 'BD'] as DrumKitPieceCode[],
      limbs: [
        [{ piece: 'SD', limb: 'R', accent: true }, { piece: 'BD', limb: 'RF' }],
        [{ piece: 'SD', limb: 'L' }],
        [{ piece: 'HH', limb: 'R' }],
        [{ piece: 'HH', limb: 'R' }],
        [{ piece: 'SD', limb: 'L', accent: true }],
        [{ piece: 'HH', limb: 'R' }],
        [{ piece: 'BD', limb: 'RF' }, { piece: 'SD', limb: 'L' }],
        [{ piece: 'BD', limb: 'RF' }, { piece: 'SD', limb: 'L' }],
      ] as DrumLimbHit[][],
      desc: 'El golpe doble final invierte automáticamente la mano líder. Al orquestar R en Hi-Hat y >L en Caja nace el groove funk lineal.',
    },
    {
      name: '2. Fill Descendente por Toms (SD → T1 → T2 → FT → CR+BD)',
      sticking: ['>R', 'L', '>R', 'L', '>R', 'L', '>R', '💥'],
      pieces: ['SD', 'SD', 'T1', 'T1', 'T2', 'T2', 'FT', 'CR'] as DrumKitPieceCode[],
      limbs: [
        [{ piece: 'SD', limb: 'R', accent: true }],
        [{ piece: 'SD', limb: 'L' }],
        [{ piece: 'T1', limb: 'R', accent: true }],
        [{ piece: 'T1', limb: 'L' }],
        [{ piece: 'T2', limb: 'R', accent: true }],
        [{ piece: 'T2', limb: 'L' }],
        [{ piece: 'FT', limb: 'R', accent: true }],
        [{ piece: 'CR', limb: 'R', accent: true }, { piece: 'BD', limb: 'RF', accent: true }],
      ] as DrumLimbHit[][],
      desc: 'Recorrido ergonómico en sentido horario alrededor de la batería cenital, cerrando en el pulso 1 con Crash + Bombo.',
    },
    {
      name: '3. Groove Jazz Swing en Ride + Pedal HH en 2 y 4',
      sticking: ['RD', 'RD+HHP', 'RD', 'RD', 'RD+HHP', 'RD', 'BD', 'SD'],
      pieces: ['RD', 'HHP', 'RD', 'RD', 'HHP', 'RD', 'BD', 'SD'] as DrumKitPieceCode[],
      limbs: [
        [{ piece: 'RD', limb: 'R' }],
        [{ piece: 'RD', limb: 'R' }, { piece: 'HHP', limb: 'LF', accent: true }],
        [{ piece: 'RD', limb: 'R' }],
        [{ piece: 'RD', limb: 'R' }],
        [{ piece: 'RD', limb: 'R' }, { piece: 'HHP', limb: 'LF', accent: true }],
        [{ piece: 'RD', limb: 'R' }],
        [{ piece: 'BD', limb: 'RF' }, { piece: 'RD', limb: 'R' }],
        [{ piece: 'SD', limb: 'L' }, { piece: 'RD', limb: 'R' }],
      ] as DrumLimbHit[][],
      desc: 'El plato Ride (Mano Der) lleva el patrón de swing mientras el Pie Izquierdo cierra el Pedal HH con precisión en los tiempos 2 y 4.',
    },
    {
      name: '4. Six-Stroke Roll (R l l r r L - R l l r r L)',
      sticking: ['>R', 'l', 'l', 'r', 'r', '>L', 'T1', 'CR'],
      pieces: ['BD', 'SD', 'SD', 'HH', 'HH', 'SD', 'T1', 'CR'] as DrumKitPieceCode[],
      limbs: [
        [{ piece: 'BD', limb: 'RF' }, { piece: 'CR', limb: 'R', accent: true }],
        [{ piece: 'SD', limb: 'L' }],
        [{ piece: 'SD', limb: 'L' }],
        [{ piece: 'HH', limb: 'R' }],
        [{ piece: 'HH', limb: 'R' }],
        [{ piece: 'SD', limb: 'L', accent: true }],
        [{ piece: 'T1', limb: 'R' }],
        [{ piece: 'CR', limb: 'R', accent: true }, { piece: 'BD', limb: 'RF' }],
      ] as DrumLimbHit[][],
      desc: 'Dos golpes simples acentuados enmarcando dos dobles fantasma: el fill favorito del rock, gospel y jazz fusión.',
    },
  ];

  const pieceMeta: Record<DrumKitPieceCode, { label: string; key: string; freqInfo: string }> = {
    BD: { label: 'Bombo (BD)', key: 'B', freqInfo: 'Pie Derecho · Subgrave 50–90 Hz' },
    SD: { label: 'Caja / Snare (SD)', key: 'S', freqInfo: 'Mano Izquierda · Cuerpo 180 Hz + Bordona' },
    HH: { label: 'Hi-Hat (HH)', key: 'H', freqInfo: 'Mano Derecha · Subdivisión Metálica' },
    HHP: { label: 'Pedal Hi-Hat (HHP)', key: 'W', freqInfo: 'Pie Izquierdo · Chick en 2 y 4' },
    T1: { label: 'Tom 1 Agudo (T1)', key: 'T', freqInfo: 'Manos R/L · Tom Aéreo 10"/12"' },
    T2: { label: 'Tom 2 Medio (T2)', key: 'Y', freqInfo: 'Manos R/L · Tom Aéreo 12"/13"' },
    FT: { label: 'Floor Tom (FT)', key: 'U', freqInfo: 'Mano Derecha · Tom de Piso 16"' },
    CR: { label: 'Plato Crash (CR)', key: 'C', freqInfo: 'Mano Der/Izq · Acento Climático' },
    RD: { label: 'Plato Ride (RD)', key: 'R', freqInfo: 'Mano Derecha · Pulso y Campana' },
  };

  let rIdx = 0;
  let drumBpm = 88;
  let activeHighlight: DrumKitPieceCode | null = null;
  let activeLimbHits: DrumLimbHit[] = [];

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
        <select class="js-rud-sel" aria-label="Seleccionar patrón o rudimento de batería" style="max-width:100%;">
          ${rudiments.map((r, i) => `<option value="${i}">${r.name}</option>`).join('')}
        </select>
        <label style="font-size:0.78rem; color:#cbd5e1; display:flex; align-items:center; gap:6px;">
          Metrónomo: <strong class="js-rud-bpm-val" style="color:#fbbf24;">${drumBpm}</strong> BPM
          <input type="range" class="js-rud-bpm" min="50" max="150" value="${drumBpm}" style="width:100px;" />
        </label>
      </div>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <button type="button" class="btn btn-primary js-rud-play">▶ Reproducir Patrón</button>
        <button type="button" class="btn js-rud-challenge" style="background:rgba(16,185,129,0.18); color:#34d399; border:1px solid rgba(16,185,129,0.4);">🎯 Reto: Repite el Ritmo</button>
        <button type="button" class="btn js-rud-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
      </div>
    </div>

    <div class="js-rud-desc" style="font-size:0.84rem; color:var(--text-muted); margin-bottom:10px;"></div>

    <!-- Interactive Top-View SVG Drum Kit -->
    <div class="js-topview-drum-host" style="margin-bottom:12px;"></div>

    <!-- Quick Interactive Piece Buttons for Mobile & Accessibility -->
    <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin-bottom:12px;">
      ${(Object.keys(pieceMeta) as DrumKitPieceCode[])
        .map(
          (code) => `
        <button type="button" class="btn js-drum-piece-btn" data-piece="${code}" style="font-size:0.74rem; padding:5px 9px; background:rgba(30,41,59,0.9); border:1px solid rgba(56,189,248,0.4); color:#f8fafc;">
          🥁 ${pieceMeta[code].label} <span style="color:#fbbf24; font-family:monospace;">[${pieceMeta[code].key}]</span>
        </button>
      `
        )
        .join('')}
    </div>

    <div style="overflow-x:auto; max-width:100%;">
      <div class="js-rud-steps" style="display:grid; grid-template-columns:repeat(8, minmax(34px, 1fr)); gap:6px; min-width:300px;"></div>
    </div>
  `;

  const sel = stage.querySelector<HTMLSelectElement>('.js-rud-sel')!;
  const descEl = stage.querySelector<HTMLElement>('.js-rud-desc')!;
  const svgHost = stage.querySelector<HTMLElement>('.js-topview-drum-host')!;
  const stepsEl = stage.querySelector<HTMLElement>('.js-rud-steps')!;
  const bpmInput = stage.querySelector<HTMLInputElement>('.js-rud-bpm')!;
  const bpmValEl = stage.querySelector<HTMLElement>('.js-rud-bpm-val')!;

  let challengeSeq: DrumKitPieceCode[] = [];
  let userStep = 0;
  let challengeActive = false;

  const renderKitAndSticking = (activeStep = -1, noteMsg?: string): void => {
    const r = rudiments[rIdx];
    if (!challengeActive) {
      descEl.textContent = r.desc;
    }
    svgHost.innerHTML = renderPlayableTopViewDrumSvg(
      'Batería Acústica Interactiva — Vista Cenital (Colores por Mano / Pie · Clic para tocar)',
      ['BD', 'SD', 'HH', 'HHP', 'T1', 'T2', 'FT', 'RD', 'CR'],
      activeHighlight,
      noteMsg || 'Toca directamente sobre Bombo, Caja, Toms, Platos o Pedales en el diagrama SVG',
      activeLimbHits
    );

    stepsEl.innerHTML = r.sticking
      .map((st, idx) => {
        const isCurrent = idx === activeStep;
        const piece = r.pieces[idx];
        const limbBadge = (r.limbs[idx] || []).map((h) => DRUM_LIMB_META[h.limb].short).join('+');
        return `
          <div style="padding:8px 4px; text-align:center; border-radius:8px; border:1px solid ${isCurrent ? '#fef08a' : 'rgba(56,189,248,0.4)'}; background:${isCurrent ? '#f59e0b' : 'rgba(15,23,42,0.85)'}; color:${isCurrent ? '#090d16' : '#f8fafc'};">
            <div style="font-size:0.9rem; font-weight:900;">${st}</div>
            <div style="font-size:0.65rem; color:${isCurrent ? '#090d16' : 'var(--accent-cyan)'}; font-weight:700;">${piece} (${limbBadge})</div>
          </div>
        `;
      })
      .join('');
  };

  const triggerPiece = (code: DrumKitPieceCode, isUser = true): void => {
    audio.playDrumPiece(code);
    activeHighlight = code;
    activeLimbHits = [];
    const meta = pieceMeta[code];

    if (isUser && challengeActive && challengeSeq.length > 0) {
      const expected = challengeSeq[userStep];
      if (code === expected) {
        userStep++;
        if (userStep >= challengeSeq.length) {
          challengeActive = false;
          descEl.textContent = `✅ ¡Excelente ritmo! Completaste la secuencia (${challengeSeq.join(' → ')}). Pulsa "🎯 Reto" para otro.`;
        } else {
          descEl.textContent = `👍 Bien (${userStep}/${challengeSeq.length})... sigue con la pieza #${userStep + 1}`;
        }
      } else {
        challengeActive = false;
        descEl.textContent = `❌ Tocaste ${code}, pero seguía ${expected}. Pulsa "🎯 Reto: Repite el Ritmo" para reintentar.`;
      }
    }

    renderKitAndSticking(-1, `Sonando: ${meta.label} — ${meta.freqInfo}`);
    onStatus(`Batería Cenital: ${meta.label} (${meta.freqInfo})`);
  };

  renderKitAndSticking();

  const keyMap: Record<string, DrumKitPieceCode> = {
    b: 'BD',
    s: 'SD',
    h: 'HH',
    w: 'HHP',
    t: 'T1',
    y: 'T2',
    u: 'FT',
    c: 'CR',
    r: 'RD',
  };

  if (typeof window !== 'undefined' && stage.dataset['keyBound'] !== '1') {
    stage.dataset['keyBound'] = '1';
    window.addEventListener('keydown', (ev: KeyboardEvent) => {
      const tag = (ev.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      const mapped = keyMap[ev.key.toLowerCase()];
      if (mapped && document.body.contains(stage)) {
        triggerPiece(mapped, true);
      }
    });
  }

  const unsubRudStop = audio.onStop(() => {
    if (!document.body.contains(stage)) {
      unsubRudStop();
      return;
    }
    activeHighlight = null;
    activeLimbHits = [];
    if (!challengeActive) {
      renderKitAndSticking();
    }
  });

  bpmInput.addEventListener('input', () => {
    drumBpm = parseInt(bpmInput.value, 10);
    bpmValEl.textContent = String(drumBpm);
  });

  sel.addEventListener('change', () => {
    rIdx = parseInt(sel.value, 10);
    audio.stopAll();
    challengeActive = false;
    activeHighlight = null;
    activeLimbHits = [];
    renderKitAndSticking();
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const svgPiece = target.closest<HTMLElement>('.js-svg-drum-piece');
    if (svgPiece) {
      const code = svgPiece.getAttribute('data-piece') as DrumKitPieceCode;
      if (code) triggerPiece(code, true);
      return;
    }

    const btnPiece = target.closest<HTMLElement>('.js-drum-piece-btn');
    if (btnPiece) {
      const code = btnPiece.getAttribute('data-piece') as DrumKitPieceCode;
      if (code) triggerPiece(code, true);
      return;
    }

    if (target.closest('.js-rud-stop')) {
      audio.stopAll();
      challengeActive = false;
      activeHighlight = null;
      activeLimbHits = [];
      renderKitAndSticking();
      return;
    }

    if (target.closest('.js-rud-challenge')) {
      audio.stopAll();
      const pool: DrumKitPieceCode[] = ['BD', 'SD', 'HH', 'T1', 'T2', 'FT', 'CR'];
      challengeSeq = Array.from({ length: 4 }, () => pool[Math.floor(Math.random() * pool.length)]);
      userStep = 0;
      challengeActive = true;
      descEl.textContent = '👂 Escucha y observa las 4 piezas que se iluminan en la batería...';
      challengeSeq.forEach((piece, idx) => {
        audio.schedule(() => {
          activeHighlight = piece;
          activeLimbHits = [];
          audio.playDrumPiece(piece);
          renderKitAndSticking(-1, `Reto Paso ${idx + 1}/4: ${pieceMeta[piece].label}`);
          if (idx === challengeSeq.length - 1) {
            audio.schedule(() => {
              activeHighlight = null;
              activeLimbHits = [];
              renderKitAndSticking(-1, '🥁 ¡Tu turno! Haz clic en las 4 piezas del SVG en el mismo orden.');
              descEl.textContent = '🥁 ¡Tu turno! Toca las 4 piezas en el mismo orden.';
            }, 340);
          }
        }, idx * 520);
      });
      return;
    }

    if (target.closest('.js-rud-play')) {
      audio.stopAll();
      challengeActive = false;
      const r = rudiments[rIdx];
      const stepMs = Math.max(130, Math.round(60000 / drumBpm / 2));
      for (let bar = 0; bar < 2; bar++) {
        r.pieces.forEach((piece, idx) => {
          const total = bar * 8 + idx;
          audio.schedule(() => {
            activeHighlight = null;
            activeLimbHits = r.limbs[idx] || [{ piece, limb: 'R' }];
            activeLimbHits.forEach((h) => audio.playDrumPiece(h.piece));
            const limbText = activeLimbHits.map((h) => DRUM_LIMB_META[h.limb].label).join(' + ');
            renderKitAndSticking(idx, `Paso ${idx + 1}/8: ${limbText} → ${pieceMeta[piece].label}`);
            onStatus(`Batería (${drumBpm} BPM): ${limbText}`);
          }, total * stepMs);
        });
      }
    }
  });
}

/**
 * SPECIALIZED LAB 6: Upgraded Ear Training, Pitch Acuity (Semitone/Tone/Microtone) & Sight-Reading Quiz (ear-lab, reading-lab)
 */
function buildEarAndReadingTrainerLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void,
  isReadingMode: boolean
): void {
  let subMode: 'degrees' | 'acuity' | 'micro' = 'degrees';
  const items = [
    { name: 'Do4 (C4) - Tónica (1)', midi: 60, staffY: 110, ledger: true },
    { name: 'Re4 (D4) - Segunda Mayor (2)', midi: 62, staffY: 102, ledger: false },
    { name: 'Mi4 (E4) - Tercera Mayor (3 · 1ª Línea)', midi: 64, staffY: 94, ledger: false },
    { name: 'Fa4 (F4) - Cuarta Justa (4 · 1º Espacio)', midi: 65, staffY: 86, ledger: false },
    { name: 'Sol4 (G4) - Quinta Justa (5 · 2ª Línea Clave Sol)', midi: 67, staffY: 78, ledger: false },
    { name: 'La4 (A4) - Sexta Mayor (6 · 2º Espacio)', midi: 69, staffY: 70, ledger: false },
    { name: 'Si4 (B4) - Sensible (7 · 3ª Línea)', midi: 71, staffY: 62, ledger: false },
    { name: 'Do5 (C5) - Octava Justa (8 · 3º Espacio)', midi: 72, staffY: 54, ledger: false },
  ];

  let targetIdx = 4; // G4 default
  let score = 0;
  let acuitySeed = 1;
  let currentAcuity = createPitchAcuityRound('basic', acuitySeed);

  const acuityChoices: { id: typeof currentAcuity.correctCategory; label: string }[] = [
    { id: 'same', label: '🎯 Misma Altura Exacta (Unísono · 0 ST)' },
    { id: 'semitone_up', label: '⬆ Semitono Más Agudo (+1 ST)' },
    { id: 'semitone_down', label: '⬇ Semitono Más Grave (-1 ST)' },
    { id: 'tone_up', label: '⏫ Tono Completo Más Agudo (+2 ST)' },
    { id: 'tone_down', label: '⏬ Tono Completo Más Grave (-2 ST)' },
  ];

  const microChoices: { id: typeof currentAcuity.correctCategory; label: string }[] = [
    { id: 'same', label: '🎯 Afinación Exacta (0 cents · Unísono)' },
    { id: 'micro_sharp', label: '📈 Microtono Alto (+25 cents · 1/4 de tono arriba)' },
    { id: 'micro_flat', label: '📉 Microtono Bajo (-25 cents · 1/4 de tono abajo)' },
    { id: 'semitone_up', label: '⬆ Semitono Completo Arriba (+100 cents)' },
    { id: 'semitone_down', label: '⬇ Semitono Completo Abajo (-100 cents)' },
  ];

  const renderStaff = (feedback = 'Selecciona un modo de entrenamiento y pulsa Escuchar.'): void => {
    const it = items[targetIdx];
    stage.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
        <div>
          <strong style="color:var(--accent-gold);">${isReadingMode ? '🎼 Entrenador de Lectura en Pentagrama (Clave de Sol) y Mástil' : '👂 Gimnasio de Entrenamiento Auditivo y Agudeza Interválica'}</strong>
          <div style="font-size:0.8rem; color:var(--accent-cyan);">Aciertos acumulados: <strong>${score}</strong></div>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="btn js-ear-mode" data-m="degrees" style="font-size:0.75rem; background:${subMode === 'degrees' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)'}; color:${subMode === 'degrees' ? '#090d16' : '#f8fafc'};">1. Grados y Lectura</button>
          <button type="button" class="btn js-ear-mode" data-m="acuity" style="font-size:0.75rem; background:${subMode === 'acuity' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)'}; color:${subMode === 'acuity' ? '#090d16' : '#f8fafc'};">2. Agudeza: Unísono vs Semitono vs Tono</button>
          <button type="button" class="btn js-ear-mode" data-m="micro" style="font-size:0.75rem; background:${subMode === 'micro' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)'}; color:${subMode === 'micro' ? '#090d16' : '#f8fafc'};">3. Micro-Afinación (±25 Cents)</button>
        </div>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;">
        <button type="button" class="btn btn-primary js-quiz-new">🎲 Nuevo Reto Auditivo</button>
        <button type="button" class="btn js-quiz-replay" style="background:rgba(56,189,248,0.18); color:#38bdf8;">🔊 Escuchar Secuencia (Nota A → Nota B)</button>
        ${
          subMode !== 'degrees'
            ? `<button type="button" class="btn js-quiz-together" style="background:rgba(167,139,250,0.2); color:#c4b5fd;">🔊 Escuchar Juntas (Oír Batimentos)</button>`
            : ''
        }
      </div>

      ${
        subMode === 'degrees'
          ? `
        <div style="background:#070a12; border:1px solid rgba(56,189,248,0.3); border-radius:8px; padding:10px; margin-bottom:12px; display:flex; align-items:center; justify-content:center;">
          <svg viewBox="0 0 420 135" width="420" height="135" style="max-width:100%; height:auto;">
            ${[30, 46, 62, 78, 94].map((y) => `<line x1="30" y1="${y}" x2="390" y2="${y}" stroke="#475569" stroke-width="1.5"/>`).join('')}
            <text x="42" y="84" fill="#f59e0b" font-size="52" font-family="serif">𝄞</text>
            ${
              isReadingMode
                ? `
              ${it.ledger ? `<line x1="192" y1="110" x2="228" y2="110" stroke="#94a3b8" stroke-width="2"/>` : ''}
              <ellipse cx="210" cy="${it.staffY}" rx="10" ry="7.5" fill="#38bdf8" transform="rotate(-15 210 ${it.staffY})"/>
              <line x1="219" y1="${it.staffY}" x2="219" y2="${it.staffY - 38}" stroke="#38bdf8" stroke-width="2"/>
            `
                : `<text x="210" y="70" text-anchor="middle" fill="#38bdf8" font-size="15" font-weight="800">🔊 Escucha C4 (Referencia) → Identifica el Grado</text>`
            }
          </svg>
        </div>
      `
          : `
        <div style="background:#070a12; border:1px solid rgba(245,158,11,0.35); border-radius:8px; padding:12px; margin-bottom:12px; font-size:0.84rem; color:#cbd5e1;">
          <strong>Test de Agudeza Auditiva (${subMode === 'micro' ? 'Nivel Afinador Microtonal ±25 cents' : 'Unísono vs Semitono vs Tono'}):</strong>
          Escucha la <strong>Nota A (${midiToNoteName(currentAcuity.baseMidi)} = ${currentAcuity.baseHz.toFixed(1)} Hz)</strong> seguida de la <strong>Nota B</strong>. ¿Tienen la misma altura o cómo varía la segunda nota?
        </div>
      `
      }

      <div style="font-size:0.85rem; color:#f8fafc; margin-bottom:10px; padding:8px 12px; background:rgba(56,189,248,0.12); border-radius:6px;">
        ${feedback}
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(175px, 1fr)); gap:8px;">
        ${
          subMode === 'degrees'
            ? items
                .map(
                  (opt, idx) => `
              <button type="button" class="btn js-quiz-ans" data-idx="${idx}" style="background:rgba(30,41,59,0.9); border:1px solid rgba(56,189,248,0.35); color:#f8fafc; padding:10px; text-align:left; font-size:0.8rem;">
                ${opt.name}
              </button>
            `
                )
                .join('')
            : (subMode === 'micro' ? microChoices : acuityChoices)
                .map(
                  (ch) => `
              <button type="button" class="btn js-acuity-ans" data-cat="${ch.id}" style="background:rgba(30,41,59,0.9); border:1px solid rgba(245,158,11,0.4); color:#f8fafc; padding:10px; text-align:left; font-size:0.8rem;">
                ${ch.label}
              </button>
            `
                )
                .join('')
        }
      </div>
    `;
  };

  const playCurrentPrompt = (): void => {
    audio.stopAll();
    if (subMode === 'degrees') {
      const focus = getVisualInstrumentFocus();
      if (focus === 'bass-only') {
        audio.playElectricBass(48, 0.65, 0, 0.36, 'finger', false);
        audio.playElectricBass(items[targetIdx].midi - 12, 1.1, 0.55, 0.38, 'finger', false);
      } else if (focus === 'guitar-only') {
        audio.playPluckedGuitar(60, 0.65, 0, 0.28, false);
        audio.playPluckedGuitar(items[targetIdx].midi, 1.1, 0.55, 0.3, false);
      } else {
        audio.playAcousticPiano(60, 0.65, 0, 0.25, false);
        audio.playPluckedGuitar(items[targetIdx].midi, 1.1, 0.55, 0.3, false);
      }
    } else {
      audio.playFreqTone(currentAcuity.baseHz, 0.85, 0, 0.28, false);
      audio.playFreqTone(currentAcuity.secondHz, 0.95, 0.72, 0.28, false);
    }
  };

  renderStaff();

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const modeBtn = target.closest<HTMLElement>('.js-ear-mode');
    if (modeBtn) {
      subMode = modeBtn.getAttribute('data-m') as 'degrees' | 'acuity' | 'micro';
      acuitySeed++;
      currentAcuity = createPitchAcuityRound(subMode === 'micro' ? 'microtonal' : 'basic', acuitySeed);
      renderStaff('Modo cambiado. Pulsa Escuchar Secuencia para comparar las dos notas.');
      playCurrentPrompt();
      return;
    }

    if (target.closest('.js-quiz-new')) {
      if (subMode === 'degrees') {
        targetIdx = (targetIdx + Math.floor(Math.random() * (items.length - 1)) + 1) % items.length;
      } else {
        acuitySeed += Math.floor(Math.random() * 4) + 1;
        currentAcuity = createPitchAcuityRound(subMode === 'micro' ? 'microtonal' : 'basic', acuitySeed);
      }
      renderStaff('🎯 ¡Nuevo reto generado! Escucha con atención.');
      playCurrentPrompt();
      return;
    }

    if (target.closest('.js-quiz-replay')) {
      playCurrentPrompt();
      return;
    }

    if (target.closest('.js-quiz-together')) {
      audio.stopAll();
      audio.playFreqTone(currentAcuity.baseHz, 1.5, 0, 0.24, false);
      audio.playFreqTone(currentAcuity.secondHz, 1.5, 0, 0.24, false);
      onStatus('Escuchando Nota A y Nota B simultáneamente (observa si hay batimentos)');
      return;
    }

    const ans = target.closest<HTMLElement>('.js-quiz-ans');
    if (ans) {
      const chosen = parseInt(ans.getAttribute('data-idx')!, 10);
      audio.playPluckedGuitar(items[chosen].midi, 1.0, 0, 0.3, true);
      if (chosen === targetIdx) {
        score++;
        renderStaff(`✅ ¡Correcto! Era ${items[targetIdx].name} (${audio.midiToFreq(items[targetIdx].midi).toFixed(1)} Hz).`);
        onStatus(`¡Acierto! ${items[targetIdx].name}`);
      } else {
        renderStaff(`❌ Seleccionaste ${items[chosen].name}. Escucha de nuevo la referencia para comparar.`);
      }
      return;
    }

    const acAns = target.closest<HTMLElement>('.js-acuity-ans');
    if (acAns) {
      const cat = acAns.getAttribute('data-cat');
      if (cat === currentAcuity.correctCategory) {
        score++;
        renderStaff(
          `✅ ¡Oído de precisión! Nota A = ${currentAcuity.baseHz.toFixed(1)} Hz → Nota B = ${currentAcuity.secondHz.toFixed(1)} Hz (${currentAcuity.label}).`
        );
        onStatus(`¡Acierto de Agudeza Auditiva! ${currentAcuity.label}`);
      } else {
        renderStaff(
          `❌ No exactamente. La relación real era: ${currentAcuity.label} (${currentAcuity.baseHz.toFixed(1)} Hz → ${currentAcuity.secondHz.toFixed(1)} Hz). Pulsa Escuchar de nuevo.`
        );
      }
    }
  });
}

/**
 * Interactive SVG Circle of Fifths Laboratory
 */
function buildCircleOfFifthsWidget(
  container: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const keys = [
    { maj: 'C', min: 'Am', root: 0, sharps: '0 alteraciones', iv: 'F', v: 'G7', ii: 'Dm7', iii: 'Em7', vi: 'Am7', vii: 'Bm7b5', secDom: 'E7' },
    { maj: 'G', min: 'Em', root: 7, sharps: '1 sostenido (F#)', iv: 'C', v: 'D7', ii: 'Am7', iii: 'Bm7', vi: 'Em7', vii: 'F#m7b5', secDom: 'B7' },
    { maj: 'D', min: 'Bm', root: 2, sharps: '2 sostenidos (F#, C#)', iv: 'G', v: 'A7', ii: 'Em7', iii: 'F#m7', vi: 'Bm7', vii: 'C#m7b5', secDom: 'F#7' },
    { maj: 'A', min: 'F#m', root: 9, sharps: '3 sostenidos (F#, C#, G#)', iv: 'D', v: 'E7', ii: 'Bm7', iii: 'C#m7', vi: 'F#m7', vii: 'G#m7b5', secDom: 'C#7' },
    { maj: 'E', min: 'C#m', root: 4, sharps: '4 sostenidos (F#, C#, G#, D#)', iv: 'A', v: 'B7', ii: 'F#m7', iii: 'G#m7', vi: 'C#m7', vii: 'D#m7b5', secDom: 'G#7' },
    { maj: 'B', min: 'G#m', root: 11, sharps: '5 sostenidos (F#, C#, G#, D#, A#)', iv: 'E', v: 'F#7', ii: 'C#m7', iii: 'D#m7', vi: 'G#m7', vii: 'A#m7b5', secDom: 'D#7' },
    { maj: 'F#/Gb', min: 'Ebm', root: 6, sharps: '6 sostenidos / 6 bemoles', iv: 'B', v: 'Db7', ii: 'Abm7', iii: 'Bbm7', vi: 'Ebm7', vii: 'Fm7b5', secDom: 'Bb7' },
    { maj: 'Db', min: 'Bbm', root: 1, sharps: '5 bemoles (Bb, Eb, Ab, Db, Gb)', iv: 'Gb', v: 'Ab7', ii: 'Ebm7', iii: 'Fm7', vi: 'Bbm7', vii: 'Cm7b5', secDom: 'F7' },
    { maj: 'Ab', min: 'Fm', root: 8, sharps: '4 bemoles (Bb, Eb, Ab, Db)', iv: 'Db', v: 'Eb7', ii: 'Bbm7', iii: 'Cm7', vi: 'Fm7', vii: 'Gm7b5', secDom: 'C7' },
    { maj: 'Eb', min: 'Cm', root: 3, sharps: '3 bemoles (Bb, Eb, Ab)', iv: 'Ab', v: 'Bb7', ii: 'Fm7', iii: 'Gm7', vi: 'Cm7', vii: 'Dm7b5', secDom: 'G7' },
    { maj: 'Bb', min: 'Gm', root: 10, sharps: '2 bemoles (Bb, Eb)', iv: 'Eb', v: 'F7', ii: 'Cm7', iii: 'Dm7', vi: 'Gm7', vii: 'Am7b5', secDom: 'D7' },
    { maj: 'F', min: 'Dm', root: 5, sharps: '1 bemol (Bb)', iv: 'Bb', v: 'C7', ii: 'Gm7', iii: 'Am7', vi: 'Dm7', vii: 'Em7b5', secDom: 'A7' },
  ];

  let activeIdx = 0;
  let viewMode: 'classic' | 'branches' | 'bifurcation' | 'star' = 'classic';
  let neckMode: 'guitar' | 'bass' = 'guitar';

  container.innerHTML = `
    <div class="widget-header">
      <div>
        <strong style="color:var(--accent-gold); font-size:1.12rem;">🎡 Círculo de Quintas Interactivo Extendido (Relativos, Eje de Tritono, Ramas 6–2–5–1 y Estrella Tonal)</strong>
        <p style="font-size:0.82rem; color:var(--text-muted); margin:0;">Cambia entre las 4 vistas gráficas y pulsa cualquier nodo circular para escuchar el acorde, la cadena <code>V7 → I → V7/vi → vi</code> o comparar el Sustituto Tritonal opuesto a 180°.</p>
      </div>
      <div class="widget-controls" style="display:flex; flex-wrap:wrap; gap:6px;">
        <button type="button" class="btn btn-primary js-cof-cadence">🎸 Escuchar vi–ii–V7–I</button>
        <button type="button" class="btn js-cof-rel" style="background:rgba(167,139,250,0.18); color:#c4b5fd; border:1px solid rgba(167,139,250,0.4);">🎹 Mayor vs Relativa</button>
        <button type="button" class="btn js-cof-tritone" style="background:rgba(244,63,94,0.18); color:#fda4af; border:1px solid rgba(244,63,94,0.45);">⚡ Escuchar Tritono (180°)</button>
        <button type="button" class="btn js-cof-stop" style="background:rgba(30,41,59,0.9); color:#fb7185; border:1px solid #475569;">⏹ Stop</button>
      </div>
    </div>

    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; margin-bottom:12px;">
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        <button type="button" class="btn js-cof-view" data-view="classic" style="font-size:0.76rem; padding:5px 10px;">1. Reloj + Tritono 180°</button>
        <button type="button" class="btn js-cof-view" data-view="branches" style="font-size:0.76rem; padding:5px 10px;">2. Ramas V7 → I → V7/vi → vi</button>
        <button type="button" class="btn js-cof-view" data-view="bifurcation" style="font-size:0.76rem; padding:5px 10px;">3. Bifurcación Mayor / Menor</button>
        <button type="button" class="btn js-cof-view" data-view="star" style="font-size:0.76rem; padding:5px 10px;">4. Estrella Geométrica Tonal</button>
      </div>
      <div style="display:flex; gap:6px;">
        <button type="button" class="btn js-cof-neck-mode" data-mode="guitar" style="font-size:0.74rem; padding:4px 9px;">🎸 Guitarra (6c)</button>
        <button type="button" class="btn js-cof-neck-mode" data-mode="bass" style="font-size:0.74rem; padding:4px 9px;">🎸 Bajo (4c)</button>
      </div>
    </div>

    <div class="circle-fifths-layout circle-fifths-wide">
      <div class="circle-svg-box js-cof-svg-box" style="width:100%; display:flex; justify-content:center; background:rgba(9,13,22,0.85); border:1px solid rgba(56,189,248,0.28); border-radius:12px; padding:10px;"></div>
      <div class="cof-info-panel js-cof-info"></div>
    </div>
  `;

  const svgBox = container.querySelector<HTMLElement>('.js-cof-svg-box')!;
  const infoBox = container.querySelector<HTMLElement>('.js-cof-info')!;
  const cadenceBtn = container.querySelector<HTMLButtonElement>('.js-cof-cadence')!;
  const relBtn = container.querySelector<HTMLButtonElement>('.js-cof-rel')!;
  const tritoneBtn = container.querySelector<HTMLButtonElement>('.js-cof-tritone')!;
  const stopBtn = container.querySelector<HTMLButtonElement>('.js-cof-stop')!;
  const viewBtns = container.querySelectorAll<HTMLButtonElement>('.js-cof-view');
  const neckModeBtns = container.querySelectorAll<HTMLButtonElement>('.js-cof-neck-mode');

  const chordMidisForNode = (root: number, kind: 'maj' | 'min' | 'dom7'): number[] => {
    const b = 48 + root;
    if (kind === 'min') return [b, b + 3, b + 7, b + 10];
    if (kind === 'dom7') return [b, b + 4, b + 7, b + 10];
    return [b, b + 4, b + 7, b + 11];
  };

  const renderCircle = (): void => {
    viewBtns.forEach((b) => {
      const act = b.getAttribute('data-view') === viewMode;
      b.style.background = act ? 'rgba(245,158,11,0.25)' : 'rgba(30,41,59,0.9)';
      b.style.color = act ? '#fbbf24' : '#cbd5e1';
      b.style.border = `1px solid ${act ? '#f59e0b' : '#334155'}`;
      b.style.fontWeight = act ? '800' : '600';
    });
    neckModeBtns.forEach((b) => {
      const act = b.getAttribute('data-mode') === neckMode;
      b.style.background = act ? 'rgba(56,189,248,0.22)' : 'rgba(30,41,59,0.9)';
      b.style.color = act ? '#38bdf8' : '#94a3b8';
      b.style.border = `1px solid ${act ? '#38bdf8' : '#334155'}`;
    });

    const oppIdx = (activeIdx + 6) % 12;
    const ivIdx = (activeIdx + 11) % 12;
    const vIdx = (activeIdx + 1) % 12;
    const iiIdx = (activeIdx + 2) % 12; // ii minor sits in inner ring at +2 clockwise (Dm in C)
    const iiiIdx = (activeIdx + 4) % 12; // iii minor sits in inner ring at +4 clockwise (Em in C)
    const k = keys[activeIdx];
    const opp = keys[oppIdx];

    if (viewMode === 'classic') {
      const cx = 250;
      const cy = 250;
      const rOuter = 212;
      const rMid = 148;
      const rInner = 88;
      const rCore = 48;

      let svg = `<svg viewBox="0 0 500 500" style="width:100%; max-width:500px; height:auto; user-select:none;">`;
      keys.forEach((item, i) => {
        const angleDeg = i * 30 - 90;
        const a1 = ((angleDeg - 15) * Math.PI) / 180;
        const a2 = ((angleDeg + 15) * Math.PI) / 180;
        const aMid = (angleDeg * Math.PI) / 180;

        const isCurrent = i === activeIdx;
        const isOpp = i === oppIdx;
        const isDiatonicNeighbour = i === ivIdx || i === vIdx || i === iiIdx || i === iiiIdx;

        const fillOuter = isCurrent
          ? 'rgba(245, 158, 11, 0.92)'
          : isOpp
            ? 'rgba(244, 63, 94, 0.42)'
            : i === ivIdx || i === vIdx
              ? 'rgba(56, 189, 248, 0.35)'
              : 'rgba(30, 41, 59, 0.92)';
        const fillInner = isCurrent
          ? 'rgba(167, 139, 250, 0.85)'
          : isDiatonicNeighbour
            ? 'rgba(16, 185, 129, 0.25)'
            : 'rgba(15, 23, 42, 0.96)';

        const x1o = cx + rOuter * Math.cos(a1);
        const y1o = cy + rOuter * Math.sin(a1);
        const x2o = cx + rOuter * Math.cos(a2);
        const y2o = cy + rOuter * Math.sin(a2);
        const x1m = cx + rMid * Math.cos(a1);
        const y1m = cy + rMid * Math.sin(a1);
        const x2m = cx + rMid * Math.cos(a2);
        const y2m = cy + rMid * Math.sin(a2);
        const x1i = cx + rInner * Math.cos(a1);
        const y1i = cy + rInner * Math.sin(a1);
        const x2i = cx + rInner * Math.cos(a2);
        const y2i = cy + rInner * Math.sin(a2);
        const x1c = cx + rCore * Math.cos(a1);
        const y1c = cy + rCore * Math.sin(a1);
        const x2c = cx + rCore * Math.cos(a2);
        const y2c = cy + rCore * Math.sin(a2);

        const pathOuter = `M ${x1m} ${y1m} L ${x1o} ${y1o} A ${rOuter} ${rOuter} 0 0 1 ${x2o} ${y2o} L ${x2m} ${y2m} A ${rMid} ${rMid} 0 0 0 ${x1m} ${y1m} Z`;
        const pathInner = `M ${x1i} ${y1i} L ${x1m} ${y1m} A ${rMid} ${rMid} 0 0 1 ${x2m} ${y2m} L ${x2i} ${y2i} A ${rInner} ${rInner} 0 0 0 ${x1i} ${y1i} Z`;
        const pathCore = `M ${x1c} ${y1c} L ${x1i} ${y1i} A ${rInner} ${rInner} 0 0 1 ${x2i} ${y2i} L ${x2c} ${y2c} A ${rCore} ${rCore} 0 0 0 ${x1c} ${y1c} Z`;

        const txOuter = cx + ((rOuter + rMid) / 2) * Math.cos(aMid);
        const tyOuter = cy + ((rOuter + rMid) / 2) * Math.sin(aMid);
        const txInner = cx + ((rMid + rInner) / 2) * Math.cos(aMid);
        const tyInner = cy + ((rMid + rInner) / 2) * Math.sin(aMid);
        const txCore = cx + ((rInner + rCore) / 2) * Math.cos(aMid);
        const tyCore = cy + ((rInner + rCore) / 2) * Math.sin(aMid);

        const degTag = isCurrent ? 'I' : i === ivIdx ? 'IV' : i === vIdx ? 'V' : isOpp ? '♭II/TT' : '';
        const minDegTag = isCurrent ? 'vi' : i === ivIdx ? 'ii' : i === vIdx ? 'iii' : '';

        svg += `
          <g class="cof-sector" data-idx="${i}" data-kind="maj" style="cursor:pointer;">
            <path d="${pathOuter}" fill="${fillOuter}" stroke="#334155" stroke-width="1.5"/>
            <text x="${txOuter}" y="${tyOuter + (degTag ? 0 : 4)}" text-anchor="middle" fill="${isCurrent ? '#090d16' : '#f8fafc'}" font-size="14" font-weight="900">${item.maj}</text>
            ${degTag ? `<text x="${txOuter}" y="${tyOuter + 13}" text-anchor="middle" fill="${isCurrent ? '#451a03' : isOpp ? '#fda4af' : '#7dd3fc'}" font-size="9.5" font-weight="800">${degTag}</text>` : ''}
          </g>
          <g class="cof-sector" data-idx="${i}" data-kind="min" style="cursor:pointer;">
            <path d="${pathInner}" fill="${fillInner}" stroke="#334155" stroke-width="1.3"/>
            <text x="${txInner}" y="${tyInner + (minDegTag ? 1 : 4)}" text-anchor="middle" fill="${isCurrent ? '#090d16' : '#cbd5e1'}" font-size="12" font-weight="800">${item.min}</text>
            ${minDegTag ? `<text x="${txInner}" y="${tyInner + 12}" text-anchor="middle" fill="${isCurrent ? '#1e1b4b' : '#34d399'}" font-size="8.5" font-weight="800">${minDegTag}</text>` : ''}
          </g>
          <g class="cof-sector" data-idx="${i}" data-kind="dom7" style="cursor:pointer;">
            <path d="${pathCore}" fill="${isCurrent ? 'rgba(251,191,36,0.28)' : 'rgba(9,13,22,0.96)'}" stroke="#1e293b" stroke-width="1"/>
            <text x="${txCore}" y="${tyCore + 3.5}" text-anchor="middle" fill="#fbbf24" font-size="9" font-weight="700">${item.v}</text>
          </g>
        `;
      });

      // Draw 180-degree Tritone Axis Line across the center
      const aAct = ((activeIdx * 30 - 90) * Math.PI) / 180;
      const aOpp = ((oppIdx * 30 - 90) * Math.PI) / 180;
      const lx1 = cx + (rOuter - 12) * Math.cos(aAct);
      const ly1 = cy + (rOuter - 12) * Math.sin(aAct);
      const lx2 = cx + (rOuter - 12) * Math.cos(aOpp);
      const ly2 = cy + (rOuter - 12) * Math.sin(aOpp);
      svg += `<line x1="${lx1}" y1="${ly1}" x2="${lx2}" y2="${ly2}" stroke="#fb7185" stroke-width="2.2" stroke-dasharray="6,4" opacity="0.85" pointer-events="none"/>`;

      svg += `<circle cx="${cx}" cy="${cy}" r="${rCore - 2}" fill="#090d16" stroke="#f59e0b" stroke-width="2"/>`;
      svg += `<text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="#f59e0b" font-size="14" font-weight="900">${k.maj} / ${k.min}</text>`;
      svg += `<text x="${cx}" y="${cy + 7}" text-anchor="middle" fill="#fda4af" font-size="9" font-weight="700">Tritono ↔ ${opp.maj}</text>`;
      svg += `<text x="${cx}" y="${cy + 20}" text-anchor="middle" fill="#38bdf8" font-size="8.5">+5ªJ ↻ · +4ªJ ↺</text>`;
      svg += `</svg>`;
      svgBox.innerHTML = svg;
    } else if (viewMode === 'branches' || viewMode === 'bifurcation') {
      // Images 4 & 5: Radial Branches showing V7 -> I -> V7/vi -> vi (or Bifurcated Major/Minor)
      const cx = 290;
      const cy = 290;
      const isBif = viewMode === 'bifurcation';
      let svg = `<svg viewBox="0 0 580 580" style="width:100%; max-width:560px; height:auto; user-select:none;">`;
      svg += `<text x="${cx}" y="22" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="700">${isBif ? 'Cada Dominante V7 puede resolver tanto a Mayor (rosa) como a Menor (cian)' : 'Ramas Radiales: V7 → I → V7/vi → vi (Pulsa cualquier círculo para escucharlo)'}</text>`;

      keys.forEach((item, i) => {
        const angleRad = ((i * 30 - 90) * Math.PI) / 180;
        const perpRad = angleRad + Math.PI / 2;
        const isCurrent = i === activeIdx;

        // 4 radial levels from outside to inside:
        // Level 0 (outermost): V7 of I (e.g. G7)
        // Level 1: I (C) [and Cm in bifurcation]
        // Level 2: V7/vi (E7)
        // Level 3 (innermost): vi (Am / A)
        const r0 = 242;
        const r1 = 190;
        const r2 = 138;
        const r3 = 86;

        const p0 = { x: cx + r0 * Math.cos(angleRad), y: cy + r0 * Math.sin(angleRad) };
        const p2 = { x: cx + r2 * Math.cos(angleRad), y: cy + r2 * Math.sin(angleRad) };
        const off = isBif ? 12 : 0;

        const p1Maj = { x: cx + r1 * Math.cos(angleRad) - off * Math.cos(perpRad), y: cy + r1 * Math.sin(angleRad) - off * Math.sin(perpRad) };
        const p1Min = { x: cx + r1 * Math.cos(angleRad) + off * Math.cos(perpRad), y: cy + r1 * Math.sin(angleRad) + off * Math.sin(perpRad) };
        const p3Maj = { x: cx + r3 * Math.cos(angleRad) - off * Math.cos(perpRad), y: cy + r3 * Math.sin(angleRad) - off * Math.sin(perpRad) };
        const p3Min = { x: cx + r3 * Math.cos(angleRad) + off * Math.cos(perpRad), y: cy + r3 * Math.sin(angleRad) + off * Math.sin(perpRad) };

        if (isCurrent) {
          svg += `<line x1="${p0.x}" y1="${p0.y}" x2="${p3Min.x}" y2="${p3Min.y}" stroke="#22c55e" stroke-width="34" stroke-linecap="round" opacity="0.16"/>`;
        }

        // Connector lines
        if (isBif) {
          svg += `<line x1="${p0.x}" y1="${p0.y}" x2="${p1Maj.x}" y2="${p1Maj.y}" stroke="#ec4899" stroke-width="1.3" opacity="0.75"/>`;
          svg += `<line x1="${p0.x}" y1="${p0.y}" x2="${p1Min.x}" y2="${p1Min.y}" stroke="#38bdf8" stroke-width="1.3" opacity="0.75"/>`;
          svg += `<line x1="${p1Maj.x}" y1="${p1Maj.y}" x2="${p2.x}" y2="${p2.y}" stroke="#f59e0b" stroke-width="1.2" opacity="0.65"/>`;
          svg += `<line x1="${p1Min.x}" y1="${p1Min.y}" x2="${p2.x}" y2="${p2.y}" stroke="#f59e0b" stroke-width="1.2" opacity="0.65"/>`;
          svg += `<line x1="${p2.x}" y1="${p2.y}" x2="${p3Maj.x}" y2="${p3Maj.y}" stroke="#ec4899" stroke-width="1.3" opacity="0.75"/>`;
          svg += `<line x1="${p2.x}" y1="${p2.y}" x2="${p3Min.x}" y2="${p3Min.y}" stroke="#38bdf8" stroke-width="1.3" opacity="0.75"/>`;
        } else {
          svg += `<line x1="${p0.x}" y1="${p0.y}" x2="${p1Maj.x}" y2="${p1Maj.y}" stroke="#fbbf24" stroke-width="1.4" opacity="0.8"/>`;
          svg += `<line x1="${p1Maj.x}" y1="${p1Maj.y}" x2="${p2.x}" y2="${p2.y}" stroke="#ec4899" stroke-width="1.4" opacity="0.8"/>`;
          svg += `<line x1="${p2.x}" y1="${p2.y}" x2="${p3Min.x}" y2="${p3Min.y}" stroke="#38bdf8" stroke-width="1.4" opacity="0.8"/>`;
        }

        const relRoot = (item.root + 9) % 12;
        const relMajName = NOTE_NAMES[relRoot];
        const drawNode = (x: number, y: number, label: string, color: string, root: number, kind: 'maj' | 'min' | 'dom7', rCircle: number) => `
          <g class="cof-node" data-idx="${i}" data-root="${root}" data-kind="${kind}" data-label="${label}" style="cursor:pointer;">
            <circle cx="${x}" cy="${y}" r="${rCircle}" fill="#0b1120" stroke="${color}" stroke-width="${isCurrent ? 2.2 : 1.5}"/>
            <text x="${x}" y="${y + 3.2}" text-anchor="middle" fill="${color}" font-size="${label.length > 3 ? 7.8 : 9.2}" font-weight="800">${label}</text>
          </g>
        `;

        // V7 of I
        svg += drawNode(p0.x, p0.y, item.v, '#f59e0b', (item.root + 7) % 12, 'dom7', 14);
        // I Major (and i Minor in bifurcation)
        svg += drawNode(p1Maj.x, p1Maj.y, item.maj, '#f472b6', item.root, 'maj', isBif ? 11.5 : 14);
        if (isBif) svg += drawNode(p1Min.x, p1Min.y, `${item.maj.split('/')[0]}m`, '#38bdf8', item.root, 'min', 11.5);
        // V7/vi
        svg += drawNode(p2.x, p2.y, item.secDom, '#f59e0b', (item.root + 4) % 12, 'dom7', 13.5);
        // vi Minor (and VI Major in bifurcation)
        if (isBif) {
          svg += drawNode(p3Maj.x, p3Maj.y, relMajName, '#f472b6', relRoot, 'maj', 11);
          svg += drawNode(p3Min.x, p3Min.y, item.min, '#38bdf8', relRoot, 'min', 11);
        } else {
          svg += drawNode(p3Min.x, p3Min.y, item.min, '#38bdf8', relRoot, 'min', 14);
        }
      });

      svg += `<circle cx="${cx}" cy="${cy}" r="40" fill="#090d16" stroke="#475569" stroke-width="1.5"/>`;
      svg += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#fbbf24" font-size="12" font-weight="900">${k.maj}</text>`;
      svg += `<text x="${cx}" y="${cy + 11}" text-anchor="middle" fill="#38bdf8" font-size="8.5">${k.v}→${k.maj}→${k.secDom}→${k.min}</text>`;
      svg += `</svg>`;
      svgBox.innerHTML = svg;
    } else {
      // Image 6: Geometric Star Harmonic Network (Ref. 04-10)
      const cx = 290;
      const cy = 290;
      const rMaj = 242;
      const rDom = 192;
      const rSus = 148;
      const rMin = 104;

      let svg = `<svg viewBox="0 0 580 580" style="width:100%; max-width:560px; height:auto; user-select:none;">`;
      // Dashed triangle links across keys (chromatic/relative web)
      keys.forEach((_, i) => {
        const aNow = ((i * 30 - 90) * Math.PI) / 180;
        const aNext = (((i + 1) % 12 * 30 - 90) * Math.PI) / 180;
        const aThird = (((i + 4) % 12 * 30 - 90) * Math.PI) / 180;
        const xM = cx + rMaj * Math.cos(aNow);
        const yM = cy + rMaj * Math.sin(aNow);
        const xmNext = cx + rMin * Math.cos(aNext);
        const ymNext = cy + rMin * Math.sin(aNext);
        const xmPrev = cx + rMin * Math.cos(aThird);
        const ymPrev = cy + rMin * Math.sin(aThird);
        svg += `<line x1="${xM}" y1="${yM}" x2="${xmNext}" y2="${ymNext}" stroke="#64748b" stroke-width="1" stroke-dasharray="4,3" opacity="0.5"/>`;
        svg += `<line x1="${xM}" y1="${yM}" x2="${xmPrev}" y2="${ymPrev}" stroke="#64748b" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>`;
      });

      keys.forEach((item, i) => {
        const a = ((i * 30 - 90) * Math.PI) / 180;
        const isCurrent = i === activeIdx;
        const pMaj = { x: cx + rMaj * Math.cos(a), y: cy + rMaj * Math.sin(a) };
        const pDom = { x: cx + rDom * Math.cos(a), y: cy + rDom * Math.sin(a) };
        const pSus = { x: cx + rSus * Math.cos(a), y: cy + rSus * Math.sin(a) };
        const pMin = { x: cx + rMin * Math.cos(a), y: cy + rMin * Math.sin(a) };

        svg += `<line x1="${pMin.x}" y1="${pMin.y}" x2="${pMaj.x}" y2="${pMaj.y}" stroke="${isCurrent ? '#fbbf24' : '#475569'}" stroke-width="${isCurrent ? 2 : 1.1}"/>`;
        const relRoot = (item.root + 9) % 12;
        const drawStarNode = (x: number, y: number, label: string, color: string, root: number, kind: 'maj' | 'min' | 'dom7', rC: number) => `
          <g class="cof-node" data-idx="${i}" data-root="${root}" data-kind="${kind}" data-label="${label}" style="cursor:pointer;">
            <circle cx="${x}" cy="${y}" r="${rC}" fill="#090d16" stroke="${color}" stroke-width="${isCurrent ? 2.4 : 1.4}"/>
            <text x="${x}" y="${y + 3.2}" text-anchor="middle" fill="${color}" font-size="${label.length > 3 ? 7.6 : 9}" font-weight="800">${label}</text>
          </g>
        `;
        svg += drawStarNode(pMaj.x, pMaj.y, item.maj, '#f472b6', item.root, 'maj', 14.5);
        svg += drawStarNode(pDom.x, pDom.y, item.v, '#f59e0b', (item.root + 7) % 12, 'dom7', 12.5);
        svg += drawStarNode(pSus.x, pSus.y, `${NOTE_NAMES[(item.root + 7) % 12]}4`, '#94a3b8', (item.root + 7) % 12, 'dom7', 11);
        svg += drawStarNode(pMin.x, pMin.y, item.min, '#38bdf8', relRoot, 'min', 13.5);
      });

      svg += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="900">✦</text>`;
      svg += `<text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="#fbbf24" font-size="9" font-weight="700">${k.maj} · ${k.min}</text>`;
      svg += `</svg>`;
      svgBox.innerHTML = svg;
    }

    const activeMidis = chordMidisForNode(k.root, 'maj');
    infoBox.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-bottom:10px;">
        <div>
          <h4 style="margin:0 0 4px 0; color:var(--accent-gold); font-size:1.15rem;">
            Tonalidad: ${k.maj} Mayor ↔ Relativa Menor: ${k.min}
          </h4>
          <div style="font-size:0.84rem; color:var(--text-muted);">
            Armadura: <strong style="color:#f8fafc;">${k.sharps}</strong> · <strong>Regla Relativa:</strong> baja <code>3 semitonos</code> (6º grado) desde ${k.maj} → ${k.min} (mismas 7 notas).
          </div>
        </div>
        ${renderMiniChordNeckSvg(activeMidis, 36 + k.root, neckMode)}
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:8px; margin-bottom:10px;">
        <button type="button" class="js-cof-quick" data-root="${(k.root + 9) % 12}" data-kind="min" data-label="vi: ${k.vi}" style="background:rgba(167,139,250,0.16); border:1px solid rgba(167,139,250,0.45); padding:8px; border-radius:6px; text-align:left; cursor:pointer; color:#f8fafc;">
          <div style="font-size:0.7rem; color:#c4b5fd;">6 · vi (Relativa)</div>
          <div style="font-size:0.98rem; font-weight:800;">${k.vi}</div>
        </button>
        <button type="button" class="js-cof-quick" data-root="${(k.root + 2) % 12}" data-kind="min" data-label="ii: ${k.ii}" style="background:rgba(16,185,129,0.14); border:1px solid rgba(16,185,129,0.4); padding:8px; border-radius:6px; text-align:left; cursor:pointer; color:#f8fafc;">
          <div style="font-size:0.7rem; color:#34d399;">2 · ii (Subdom.)</div>
          <div style="font-size:0.98rem; font-weight:800;">${k.ii}</div>
        </button>
        <button type="button" class="js-cof-quick" data-root="${(k.root + 7) % 12}" data-kind="dom7" data-label="V7: ${k.v}" style="background:rgba(244,63,94,0.14); border:1px solid rgba(244,63,94,0.45); padding:8px; border-radius:6px; text-align:left; cursor:pointer; color:#f8fafc;">
          <div style="font-size:0.7rem; color:#fda4af;">5 · V7 (Dominante)</div>
          <div style="font-size:0.98rem; font-weight:800;">${k.v}</div>
        </button>
        <button type="button" class="js-cof-quick" data-root="${k.root}" data-kind="maj" data-label="I: ${k.maj}Maj7" style="background:rgba(245,158,11,0.16); border:1px solid rgba(245,158,11,0.45); padding:8px; border-radius:6px; text-align:left; cursor:pointer; color:#f8fafc;">
          <div style="font-size:0.7rem; color:var(--accent-gold);">1 · I (Tónica)</div>
          <div style="font-size:0.98rem; font-weight:800;">${k.maj}Maj7</div>
        </button>
      </div>

      <div style="font-size:0.82rem; color:#e2e8f0; background:rgba(15,23,42,0.85); border:1px solid rgba(56,189,248,0.28); padding:10px; border-radius:8px; margin-bottom:8px;">
        <strong>🔗 Relación 6 – 2 – 5 – 1 en el Círculo ("La Escalera que Baja"):</strong><br>
        En sentido antihorario (cayendo por 5ª Justas = <code>-7 semitonos</code>): <strong style="color:#c4b5fd;">${k.vi} (6)</strong> → <strong style="color:#34d399;">${k.ii} (2)</strong> → <strong style="color:#fda4af;">${k.v} (5)</strong> → <strong style="color:#fbbf24;">${k.maj} (1)</strong>.<br>
        <strong>⚡ Eje Diametral (180°):</strong> El opuesto exacto a <strong>${k.maj}</strong> es <strong style="color:#fb7185;">${opp.maj}</strong> (<code>6 × 7 = 42 ≡ 6 semitonos</code> = <strong>Tritono exacto</strong>; por eso <code>${opp.maj}7</code> es el sustituto tritonal de <code>${k.v}</code>).
      </div>

      <div style="font-size:0.8rem; color:#cbd5e1; background:rgba(0,0,0,0.3); padding:8px 10px; border-radius:6px;">
        <strong>Familia Diatónica Completa:</strong>
        I: ${k.maj}Maj7 · ii: ${k.ii} · iii: ${k.iii} · IV: ${k.iv}Maj7 · V7: ${k.v} · vi: ${k.vi} · vii°: ${k.vii}
      </div>
    `;
  };

  renderCircle();

  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const viewBtn = target.closest<HTMLElement>('.js-cof-view');
    if (viewBtn) {
      viewMode = (viewBtn.getAttribute('data-view') as typeof viewMode) || 'classic';
      renderCircle();
      return;
    }
    const modeBtn = target.closest<HTMLElement>('.js-cof-neck-mode');
    if (modeBtn) {
      neckMode = (modeBtn.getAttribute('data-mode') as 'guitar' | 'bass') || 'guitar';
      renderCircle();
      return;
    }
    const quickBtn = target.closest<HTMLElement>('.js-cof-quick');
    if (quickBtn) {
      const r = parseInt(quickBtn.getAttribute('data-root')!, 10);
      const kind = (quickBtn.getAttribute('data-kind') as 'maj' | 'min' | 'dom7') || 'maj';
      const label = quickBtn.getAttribute('data-label') || '';
      audio.stopAll();
      audio.playElectricBass(36 + r, 1.2, 0, 0.36, 'finger', false);
      audio.strumChord(chordMidisForNode(r, kind), 'guitar', 0, false);
      onStatus(`Grado pulsado: ${label}`);
      return;
    }
    const node = target.closest<HTMLElement>('.cof-node');
    if (node) {
      activeIdx = parseInt(node.getAttribute('data-idx')!, 10);
      const r = parseInt(node.getAttribute('data-root')!, 10);
      const kind = (node.getAttribute('data-kind') as 'maj' | 'min' | 'dom7') || 'maj';
      const label = node.getAttribute('data-label') || '';
      renderCircle();
      audio.stopAll();
      audio.playElectricBass(36 + r, 1.2, 0, 0.36, 'finger', false);
      audio.strumChord(chordMidisForNode(r, kind), 'guitar', 0, false);
      onStatus(`Nodo del Círculo: ${label}`);
      return;
    }
    const sector = target.closest<HTMLElement>('.cof-sector');
    if (sector) {
      activeIdx = parseInt(sector.getAttribute('data-idx')!, 10);
      const kind = (sector.getAttribute('data-kind') as 'maj' | 'min' | 'dom7') || 'maj';
      renderCircle();
      const k = keys[activeIdx];
      const r = kind === 'min' ? (k.root + 9) % 12 : kind === 'dom7' ? (k.root + 7) % 12 : k.root;
      audio.stopAll();
      audio.playElectricBass(36 + r, 1.2, 0, 0.36, 'finger', false);
      audio.strumChord(chordMidisForNode(r, kind), 'guitar', 0, false);
      onStatus(`Círculo de Quintas: ${k.maj} Mayor / ${k.min} (${k.sharps})`);
    }
  });

  cadenceBtn.addEventListener('click', () => {
    audio.stopAll();
    const r = keys[activeIdx].root;
    const chords = [
      chordMidisForNode((r + 9) % 12, 'min'), // vi
      chordMidisForNode((r + 2) % 12, 'min'), // ii
      chordMidisForNode((r + 7) % 12, 'dom7'), // V7
      chordMidisForNode(r, 'maj'), // I
    ];
    chords.forEach((c, idx) => audio.strumChord(c, 'guitar', idx * 0.82, false));
    onStatus(`Reproduciendo Ciclo vi – ii – V7 – I en ${keys[activeIdx].maj}`);
  });

  relBtn.addEventListener('click', () => {
    audio.stopAll();
    const r = keys[activeIdx].root;
    const relMin = (r + 9) % 12;
    audio.strumChord(chordMidisForNode(r, 'maj'), 'piano', 0, false);
    audio.strumChord(chordMidisForNode(relMin, 'min'), 'piano', 0.95, false);
    onStatus(`Comparando ${keys[activeIdx].maj} Mayor con su relativa menor ${keys[activeIdx].min}`);
  });

  tritoneBtn.addEventListener('click', () => {
    audio.stopAll();
    const r = keys[activeIdx].root;
    const domRoot = (r + 7) % 12;
    const ttRoot = (domRoot + 6) % 12;
    audio.strumChord(chordMidisForNode(domRoot, 'dom7'), 'piano', 0, false);
    audio.strumChord(chordMidisForNode(ttRoot, 'dom7'), 'piano', 0.9, false);
    audio.strumChord(chordMidisForNode(r, 'maj'), 'piano', 1.8, false);
    onStatus(`Eje Diametral 180°: V7 (${keys[activeIdx].v}) ↔ Sustituto Tritonal (${NOTE_NAMES[ttRoot]}7) → ${keys[activeIdx].maj}`);
  });

  stopBtn.addEventListener('click', () => {
    audio.stopAll();
    onStatus('Audio detenido');
  });
}

/**
 * Interactive 16-Step Drum & Groove Sequencer (with Meter / Subdivision / Syncopation & Bass Accompaniment)
 */
function buildSequencerWidget(
  container: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void,
  title = 'Secuenciador Interactivo de Compases, Agrupaciones y Síncopa (16 Pasos)'
): void {
  const presets: Record<string, { name: string; bpm: number; meter: string; grid: number[][] }> = {
    rock: {
      name: '4/4 Rock Clásico / Pop (Backbeat en 2 y 4)',
      bpm: 108,
      meter: '4/4 (4 pulsos de 4 semicorcheas)',
      grid: [
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], // Hi-Hat
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Snare
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0], // Ghost Snare
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0], // Kick
      ],
    },
    funk: {
      name: '4/4 Funk Lineal + Síncopa de Semicorchea y Ghost Notes',
      bpm: 100,
      meter: '4/4 (Síncopa en 1a, 2e, 3& y 4e)',
      grid: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1],
        [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      ],
    },
    tresillo: {
      name: 'Síncopa Afro-Latina: Tresillo (3+3+2) + Clave de Son 3-2',
      bpm: 98,
      meter: '4/4 Agrupación Aditiva 3+3+2 | 2+2+2+2',
      grid: [
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0],
        [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
      ],
    },
    konnakol_7_8: {
      name: 'Amalgama 7/8 + 9/8 (Ta-ka Ta-ka Ta-ki-ta | 2+2+3)',
      bpm: 116,
      meter: 'Agrupación Konnakol: 3+3+3+3+2+2 = 16 pulsos',
      grid: [
        [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
        [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      ],
    },
    bossa: {
      name: 'Bossa Nova / Samba Cruzado (Bajo en 1 y 3 + Aro Sincopado)',
      bpm: 122,
      meter: '2/4 o 4/4 Brasileño Sincopado',
      grid: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
      ],
    },
  };

  let currentPreset = 'rock';
  let currentBpm = presets[currentPreset].bpm;
  let grid = presets[currentPreset].grid.map((r) => [...r]);
  let playingStep = -1;
  const rowLabels = ['🟡 Hi-Hat (Charles)', '🔵 Caja Fuerte (Acento)', '🟣 Nota Fantasma (Ghost)', '🔴 Bombo (Kick)'];
  const rowTypes: ('hihat' | 'snare' | 'ghost' | 'kick')[] = ['hihat', 'snare', 'ghost', 'kick'];

  container.innerHTML = `
    <div class="widget-header">
      <div>
        <strong style="color:var(--accent-gold); font-size:1.1rem;">${title}</strong>
        <p class="js-seq-meter-info" style="font-size:0.82rem; color:var(--accent-cyan); margin:2px 0 0 0; font-weight:600;">
          Compás y Agrupación: ${presets[currentPreset].meter} — Haz clic en cualquier celda para encender o apagar el golpe.
        </p>
      </div>
      <div class="widget-controls">
        <label style="font-size:0.8rem;">Patrón / Compás:</label>
        <select class="js-seq-preset">
          ${Object.entries(presets)
            .map(([k, v]) => `<option value="${k}" ${k === currentPreset ? 'selected' : ''}>${v.name}</option>`)
            .join('')}
        </select>
        <label style="font-size:0.8rem;">BPM: <strong class="js-seq-bpm-lbl" style="color:var(--accent-gold);">${currentBpm}</strong></label>
        <input type="range" class="js-seq-bpm" min="65" max="155" value="${currentBpm}" style="width:85px; accent-color:#f59e0b;">
        <button type="button" class="btn btn-primary js-seq-play">▶ Reproducir 2 Compases</button>
        <button type="button" class="btn js-seq-clear" style="background:rgba(148,163,184,0.16); color:#cbd5e1;">🧹 Limpiar</button>
        <button type="button" class="btn js-seq-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
      </div>
    </div>
    <div class="seq-grid js-seq-grid"></div>
  `;

  const gridEl = container.querySelector<HTMLElement>('.js-seq-grid')!;
  const meterInfoEl = container.querySelector<HTMLElement>('.js-seq-meter-info')!;
  const presetSel = container.querySelector<HTMLSelectElement>('.js-seq-preset')!;
  const bpmSlider = container.querySelector<HTMLInputElement>('.js-seq-bpm')!;
  const bpmLbl = container.querySelector<HTMLElement>('.js-seq-bpm-lbl')!;
  const playBtn = container.querySelector<HTMLButtonElement>('.js-seq-play')!;
  const clearBtn = container.querySelector<HTMLButtonElement>('.js-seq-clear')!;
  const stopBtn = container.querySelector<HTMLButtonElement>('.js-seq-stop')!;

  const renderGrid = (): void => {
    let html = `<div class="seq-label" style="color:var(--text-muted);">Subdivisión (16ª)</div>`;
    const subLabels = ['1', 'e', '&', 'a', '2', 'e', '&', 'a', '3', 'e', '&', 'a', '4', 'e', '&', 'a'];
    for (let s = 0; s < 16; s++) {
      const isDownbeat = s % 4 === 0;
      const isPlayhead = s === playingStep;
      html += `<div style="text-align:center; font-size:0.74rem; padding:2px 0; border-radius:4px; background:${isPlayhead ? '#f59e0b' : 'transparent'}; font-weight:${isDownbeat || isPlayhead ? '800' : '500'}; color:${isPlayhead ? '#090c12' : isDownbeat ? 'var(--accent-gold)' : 'var(--text-muted)'};">${subLabels[s]}</div>`;
    }

    rowLabels.forEach((label, rIdx) => {
      html += `<div class="seq-label">${label}</div>`;
      for (let cIdx = 0; cIdx < 16; cIdx++) {
        const active = grid[rIdx][cIdx] === 1;
        const isPlayhead = cIdx === playingStep;
        const isDownbeat = cIdx % 4 === 0;
        const activeClass = active ? (rIdx === 1 || rIdx === 3 ? 'active-gold' : 'active') : '';
        const playClass = isPlayhead ? 'playing-step' : '';
        const borderStyle = !active && isDownbeat ? 'border-color:rgba(245,158,11,0.55);' : '';
        html += `<button type="button" class="seq-cell ${activeClass} ${playClass}" data-row="${rIdx}" data-col="${cIdx}" style="${borderStyle}">${active ? '●' : isDownbeat ? '·' : ''}</button>`;
      }
    });
    gridEl.innerHTML = html;
  };

  renderGrid();

  gridEl.addEventListener('click', (e) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('.seq-cell');
    if (!cell) return;
    const r = parseInt(cell.getAttribute('data-row')!, 10);
    const c = parseInt(cell.getAttribute('data-col')!, 10);
    grid[r][c] = grid[r][c] === 1 ? 0 : 1;
    renderGrid();
    if (grid[r][c] === 1) {
      audio.playDrumHit(rowTypes[r]);
      onStatus(`${rowLabels[r]} activado en el paso ${c + 1}`);
    }
  });

  presetSel.addEventListener('change', () => {
    currentPreset = presetSel.value;
    audio.stopAll();
    playingStep = -1;
    currentBpm = presets[currentPreset].bpm;
    bpmSlider.value = String(currentBpm);
    bpmLbl.textContent = String(currentBpm);
    meterInfoEl.textContent = `Compás y Agrupación: ${presets[currentPreset].meter} — Haz clic en cualquier celda para encender o apagar el golpe.`;
    grid = presets[currentPreset].grid.map((r) => [...r]);
    renderGrid();
    onStatus(`Patrón cargado: ${presets[currentPreset].name}`);
  });

  bpmSlider.addEventListener('input', () => {
    currentBpm = parseInt(bpmSlider.value, 10) || 105;
    bpmLbl.textContent = String(currentBpm);
  });

  clearBtn.addEventListener('click', () => {
    audio.stopAll();
    playingStep = -1;
    grid = grid.map((r) => r.map(() => 0));
    renderGrid();
    onStatus('Rejilla limpiada: haz clic en las celdas para crear tu propio ritmo.');
  });

  playBtn.addEventListener('click', () => {
    audio.stopAll();
    const stepMs = (60 / currentBpm / 4) * 1000;
    const totalSteps = 32; // 2 bars
    for (let s = 0; s < totalSteps; s++) {
      const col = s % 16;
      audio.schedule(() => {
        playingStep = col;
        renderGrid();
        rowTypes.forEach((drumType, rIdx) => {
          if (grid[rIdx][col] === 1) {
            audio.playDrumHit(drumType, 0);
          }
        });
      }, s * stepMs);
    }
    audio.schedule(() => {
      playingStep = -1;
      renderGrid();
    }, totalSteps * stepMs + 60);
    onStatus(`Reproduciendo secuencia: ${presets[currentPreset].name} (${currentBpm} BPM)`);
  });

  const unsubSeqStop = audio.onStop(() => {
    if (!document.body.contains(container)) {
      unsubSeqStop();
      return;
    }
    if (playingStep !== -1) {
      playingStep = -1;
      renderGrid();
    }
  });

  stopBtn.addEventListener('click', () => {
    audio.stopAll();
    playingStep = -1;
    renderGrid();
    onStatus('Secuenciador detenido');
  });
}

/**
 * Context-Specific Progression, Cadence, Ladder-Down, Tritone Sub, Modal Interchange & Modulation Laboratory
 * Includes Dedicated 4-String Electric Bass (Bajo 4 Cuerdas), Acoustic Piano & Guitar playback!
 */
interface ProgressionItem {
  id: string;
  name: string;
  roman: string[];
  chords: number[][];
  bassLine: number[]; // Authentic 4-string bass walking/groove notes (E1=28 to G2=43)
  desc: string;
  voiceLeadingNote: string;
}

const PROGRESSION_SETS_BY_CONTEXT: Record<string, ProgressionItem[]> = {
  archetypes: [
    {
      id: 'pop_axis',
      name: '1) Arquetipo Pop/Rock: I – V – vi – IV (C – G – Am – F)',
      roman: ['I (C Mayor)', 'V (G Mayor)', 'vi (Am7)', 'IV (Fmaj7)'],
      chords: [
        [48, 55, 60, 64],
        [43, 55, 59, 62],
        [45, 52, 60, 64],
        [41, 53, 57, 60],
      ],
      bassLine: [36, 38, 31, 35, 33, 31, 29, 31],
      desc: 'El ciclo diatónico más universal: afirma la tónica (I), abre tensión (V), gira hacia la relativa menor (vi) y se expande en la subdominante (IV).',
      voiceLeadingNote: 'Bajo en 4 cuerdas: C2 (3ª tr.3) → G1 (4ª tr.3) → A1 (3ª tr.0) → F1 (4ª tr.1).',
    },
    {
      id: 'fifties_doo_wop',
      name: '2) Ciclo Clásico / Stand By Me: I – vi – IV – V7 (C – Am – F – G7)',
      roman: ['I (C)', 'vi (Am)', 'IV (F)', 'V7 (G7)'],
      chords: [
        [48, 55, 60, 64],
        [45, 52, 57, 60],
        [41, 53, 57, 60],
        [43, 53, 59, 62],
      ],
      bassLine: [36, 35, 33, 31, 29, 33, 31, 35],
      desc: 'Cae por terceras diatónicas (C → Am → F) manteniendo 2 notas en común en cada paso antes de tensar el arco en V7.',
      voiceLeadingNote: 'Enlace por descenso de bajo: C2 → B1 (paso) → A1 → G1 → F1 → G1.',
    },
    {
      id: 'pachelbel_canon',
      name: '3) Canon de Pachelbel: I – V – vi – iii – IV – I – IV – V',
      roman: ['I (C)', 'V (G)', 'vi (Am)', 'iii (Em)', 'IV (F)', 'I (C)', 'IV (F)', 'V7 (G7)'],
      chords: [
        [48, 55, 60, 64],
        [43, 55, 59, 62],
        [45, 52, 57, 60],
        [40, 52, 55, 59],
        [41, 53, 57, 60],
        [48, 52, 55, 60],
        [41, 53, 57, 60],
        [43, 53, 59, 62],
      ],
      bassLine: [36, 31, 33, 28, 29, 36, 29, 31],
      desc: 'Secuencia barroca inmortal que alterna caída de cuarta justa y subida de segunda en las raíces.',
      voiceLeadingNote: 'La voz aguda desciende paso a paso: E4 → D4 → C4 → B3 → A3 → G3 → A3 → B3.',
    },
    {
      id: 'royal_road_jpop',
      name: '4) Royal Road (Ōdō Shinkō / Anime & Neo-Soul): IVmaj7 – V7 – iii7 – vi7',
      roman: ['IVmaj7 (Fmaj7)', 'V7 (G7)', 'iii7 (Em7)', 'vi7 (Am7)'],
      chords: [
        [41, 53, 57, 60, 64],
        [43, 53, 59, 62],
        [40, 52, 55, 59, 62],
        [45, 52, 55, 60, 64],
      ],
      bassLine: [29, 36, 31, 38, 28, 35, 33, 40],
      desc: 'Arranca en la subdominante nostálgica y resuelve el V7 de forma rota hacia iii7–vi7 evitando cerrar en I para mantener un flujo infinito.',
      voiceLeadingNote: 'Bajo en octavas y quintas: F1 → G1 → E1 (4ª al aire) → A1.',
    },
  ],
  cadences: [
    {
      id: 'cad_authentic',
      name: '1) Cadencia Auténtica Perfecta: ii7 – V7 – I (Punto Final Absoluto)',
      roman: ['I (Cmaj7)', 'ii7 (Dm7)', 'V7 (G7)', 'I (C Mayor)'],
      chords: [
        [48, 55, 59, 64],
        [50, 57, 60, 65],
        [43, 53, 59, 62],
        [48, 52, 55, 60],
      ],
      bassLine: [36, 38, 31, 36],
      desc: 'El tritono de G7 (Si–Fa) se cierra por movimiento contrario hacia Do–Mi mientras el bajo salta de Sol a Do.',
      voiceLeadingNote: 'Sensible B3 → C4 (+1 semitono) y Séptima F4 → E4 (-1 semitono).',
    },
    {
      id: 'cad_plagal_minor',
      name: '2) Cadencia Plagal y Plagal Menor Cinematográfica: IV → ivm6 → I',
      roman: ['I (C)', 'IVmaj7 (Fmaj7)', 'ivm6 (Fm6)', 'I (Cmaj9)'],
      chords: [
        [48, 55, 60, 64],
        [41, 53, 57, 60, 64],
        [41, 53, 56, 60, 62],
        [48, 55, 59, 62, 64],
      ],
      bassLine: [36, 29, 29, 36],
      desc: 'La 3ª de Fa baja de La natural a La bemol antes de reposar en Sol (quinta de Do). Es el suspiro nostálgico por excelencia.',
      voiceLeadingNote: 'Línea guía interna: A3 → Ab3 → G3 sobre pedal subdominante F1.',
    },
    {
      id: 'cad_deceptive',
      name: '3) Cadencia Rota (Engañosa): IV – V7 → vi (Sorpresa Lírica) y → ♭VImaj7 (Épica)',
      roman: ['IV (F)', 'V7 (G7)', 'vi (Am7 - Rota Diatónica)', '♭VImaj7 (Abmaj7 - Rota Épica)'],
      chords: [
        [41, 53, 57, 60],
        [43, 53, 59, 62],
        [45, 52, 55, 60],
        [44, 51, 55, 60],
      ],
      bassLine: [29, 31, 33, 32],
      desc: 'La sensible Si resuelve correctamente a Do, pero el bajo sube por paso a La (Am7) o La bemol (Abmaj7) cambiando por completo el paisaje.',
      voiceLeadingNote: 'Bajo ascendente G1 → A1 (o G1 → Ab1) mientras la soprano canta B3 → C4.',
    },
    {
      id: 'cad_half_phrygian',
      name: '4) Semicadencia Frigia (en Menor): Am – G – Fmaj7 → E7(♭9) [Signo ¿?]',
      roman: ['i (Am)', '♭VII (G)', '♭VI (Fmaj7)', 'V7 (E7♭9 - Suspenso)'],
      chords: [
        [45, 52, 57, 60],
        [43, 50, 55, 59],
        [41, 48, 52, 57],
        [40, 47, 52, 56, 59],
      ],
      bassLine: [33, 31, 29, 28],
      desc: 'El bajo desciende por grados conjuntos hasta el 5º grado (Mi) dejando la frase suspendida en máxima expectativa.',
      voiceLeadingNote: 'En el bajo de 4 cuerdas: A1 (tr.0) → G1 (4ª tr.3) → F1 (4ª tr.1) → E1 (4ª al aire).',
    },
  ],
  'ii-v-i-major': [
    {
      id: '251_major_guide',
      name: '1) Motor ii–V–I Mayor con Notas Guía (3ª y 7ª): Dm9 → G13 → Cmaj9',
      roman: ['ii9 (Dm9)', 'V13 (G13)', 'Imaj9 (Cmaj9)', 'VI7alt (A7♭13)'],
      chords: [
        [50, 53, 60, 64],
        [43, 53, 59, 64],
        [48, 52, 59, 62],
        [45, 52, 55, 61, 65],
      ],
      bassLine: [38, 37, 31, 35, 36, 35, 33, 37],
      desc: 'Observa el relevo perfecto: la 7ª de Dm7 (Do) baja un semitono a la 3ª de G7 (Si), y la 7ª de G7 (Fa) baja un semitono a la 3ª de Cmaj7 (Mi).',
      voiceLeadingNote: 'Walking Bass con aproximaciones cromáticas en pulso 4: D2 → Db2 → G1 → B1 → C2.',
    },
    {
      id: '251_minor_altered',
      name: '2) Motor iiø7–V7(♭9)–im Menor: Dm7♭5 → G7(♭9,♭13) → Cm(maj9)',
      roman: ['iiø7 (Dm7♭5)', 'V7alt (G7♭9♭13)', 'im (CmMaj9)', 'im6 (Cm6)'],
      chords: [
        [50, 53, 56, 60],
        [43, 53, 56, 59, 63],
        [48, 51, 55, 59, 62],
        [48, 51, 55, 57, 62],
      ],
      bassLine: [38, 32, 31, 35, 36, 39, 36, 31],
      desc: 'El acorde semidisminuido aporta la ♭6 (Lab) que se mantiene como ♭9 de G7 antes de caer por semitono a Sol.',
      voiceLeadingNote: 'Doble atracción de semitono hacia Cm: B3 → C4 y Ab4 → G4.',
    },
    {
      id: 'ladder_down_diatonic',
      name: '3) "La Escalera que Baja" Diatónica Completa: Fmaj7 → Bm7♭5 → Em7 → Am7 → Dm7 → G7 → Cmaj7',
      roman: ['IV (Fmaj7)', 'viiø (Bm7♭5)', 'iii7 (Em7)', 'vi7 (Am7)', 'ii7 (Dm7)', 'V7 (G7)', 'I (Cmaj7)'],
      chords: [
        [41, 53, 57, 60],
        [47, 53, 57, 62],
        [40, 52, 55, 59],
        [45, 52, 55, 60],
        [50, 53, 57, 60],
        [43, 53, 55, 59],
        [48, 52, 55, 59],
      ],
      bassLine: [29, 35, 28, 33, 38, 31, 36],
      desc: 'Ciclo completo de quintas descendentes por los 7 grados (Autumn Leaves / Fly Me to the Moon).',
      voiceLeadingNote: 'En el bajo (G-D-A-E) bajar por quintas equivale a cruzar a la cuerda vecina en el mismo traste.',
    },
    {
      id: 'ladder_down_chromatic_tritone',
      name: '4) "La Escalera que Baja" Cromática (Sustitutos Tritonales): Em7 → Eb7 → Dm7 → Db7 → Cmaj7',
      roman: ['iii7 (Em7)', '♭III7 (Eb9#11)', 'ii7 (Dm7)', '♭II7 (Db9#11)', 'Imaj7 (Cmaj9)'],
      chords: [
        [52, 55, 59, 62],
        [51, 55, 58, 61, 65],
        [50, 53, 57, 60],
        [49, 53, 56, 59, 63],
        [48, 52, 55, 59, 62],
      ],
      bassLine: [40, 39, 38, 37, 36],
      desc: 'Al sustituir A7 por Eb7 y G7 por Db7, el bajo desciende en línea recta por semitonos desde Mi hasta Do.',
      voiceLeadingNote: 'Bajo en 3ª cuerda (La): Traste 7 (E2) → Tr.6 (Eb2) → Tr.5 (D2) → Tr.4 (Db2) → Tr.3 (C2).',
    },
  ],
  'sec-dom': [
    {
      id: 'sec_dom_chain',
      name: '1) Cadena de Dominantes Secundarios (Ragtime / Rhythm Changes): E7 → A7 → D7 → G7 → C',
      roman: ['V7/vi (E7)', 'V7/ii (A7)', 'V7/V (D7)', 'V7 (G7)', 'I (C6/9)'],
      chords: [
        [40, 52, 56, 59],
        [45, 52, 55, 61],
        [50, 54, 57, 60],
        [43, 53, 55, 59],
        [48, 52, 57, 62],
      ],
      bassLine: [28, 35, 33, 37, 38, 33, 31, 35, 36],
      desc: 'Cada acorde menor del ciclo iii–vi–ii–V se convierte en un dominante mayor (V7) que empuja con tritono al siguiente peldaño.',
      voiceLeadingNote: 'Cromatismo interno continuo: G# → G♮, C# → C♮, F# → F♮, B → C.',
    },
    {
      id: 'tritone_sub_251',
      name: '2) Sustituto Tritonal en Acción: Dm9 → Db7(#11) [en vez de G7] → Cmaj9',
      roman: ['ii9 (Dm9)', 'SubV7 (Db9#11)', 'Imaj9 (Cmaj9)', 'SubV7/ii (Eb9#11)'],
      chords: [
        [50, 53, 57, 60, 64],
        [49, 53, 59, 63, 67],
        [48, 52, 55, 59, 62],
        [51, 55, 61, 65],
      ],
      bassLine: [38, 37, 36, 39],
      desc: 'G7 y Db7 comparten exactamente el mismo tritono (Si–Fa = Dob–Fa), por lo que Db7 resuelve a Do con un deslizamiento sedoso de semitono.',
      voiceLeadingNote: 'La nota Sol en la melodía sobre Db7 se convierte automáticamente en la mágica #11 Lidia Dominante.',
    },
    {
      id: 'ladder_up_dim_bridges',
      name: '3) "La Escalera que Sube" con Acordes Puente Disminuidos: C → C#°7 → Dm7 → D#°7 → Em7 → F → F#°7 → G7',
      roman: ['I (C)', '#I°7 (C#°7)', 'ii7 (Dm7)', '#II°7 (D#°7)', 'iii7 (Em7)', 'IV (F)', '#IV°7 (F#°7)', 'V7 (G7)'],
      chords: [
        [48, 55, 60, 64],
        [49, 55, 58, 64],
        [50, 57, 60, 65],
        [51, 57, 60, 66],
        [52, 55, 59, 64],
        [53, 57, 60, 65],
        [54, 57, 60, 66],
        [55, 59, 62, 65],
      ],
      bassLine: [36, 37, 38, 39, 40, 41, 42, 43],
      desc: 'Rampa cromática ascendente de 8 peldaños donde cada disminuido actúa como sensible motorizada hacia el siguiente grado diatónico.',
      voiceLeadingNote: 'Bajo subiendo traste a traste desde C2 (tr.3) hasta G2 (tr.10).',
    },
    {
      id: 'aug_bridges',
      name: '4) Puentes Aumentados (+5) y Line Cliché Ascendente: C → Caug → Fmaj7 → Fm6 → C',
      roman: ['I (C)', 'I+ (Caug / V+/IV)', 'IVmaj7 (Fmaj7)', 'ivm6 (Fm6)', 'I (C)'],
      chords: [
        [48, 52, 55, 60],
        [48, 52, 56, 60],
        [41, 53, 57, 60],
        [41, 53, 56, 60],
        [48, 52, 55, 60],
      ],
      bassLine: [36, 36, 29, 29, 36],
      desc: 'La 5ª de Do (Sol) sube a Sol# (Caug) empujando magnéticamente a La (3ª de Fa), y luego regresa por Lab (Fm6) de vuelta a Sol.',
      voiceLeadingNote: 'Arco cromático de ida y vuelta en la voz central: G3 → G#3 → A3 → Ab3 → G3.',
    },
  ],
  interchange: [
    {
      id: 'mi_eolico_doors',
      name: '1) Las 3 Puertas del Modo Eólico Paralelo: C → Abmaj7 (♭VI) → Bb9 (♭VII) → C',
      roman: ['I (C Mayor)', '♭VImaj7 (Abmaj7)', '♭VII9 (Bb9)', 'I (C Mayor)'],
      chords: [
        [48, 55, 60, 64],
        [44, 51, 55, 60],
        [46, 53, 56, 60, 62],
        [48, 55, 60, 64],
      ],
      bassLine: [36, 32, 34, 36],
      desc: 'La "Cadencia Mario Bros / Épica Cinematográfica": toma prestados Ab y Bb de Do Menor para aterrizar triunfalmente por tonos enteros en Do Mayor.',
      voiceLeadingNote: 'Bajo en subida heroica por tonos enteros: Ab1 (4ª tr.4) → Bb1 (4ª tr.6) → C2 (4ª tr.8).',
    },
    {
      id: 'mi_backdoor_251',
      name: '2) Cadencia Backdoor ("Por la Puerta Trasera"): Cmaj7 → Fm7 (iv7) → Bb9 (♭VII7) → Cmaj7',
      roman: ['Imaj7 (Cmaj7)', 'iv7 (Fm7)', '♭VII9 (Bb9#11)', 'Imaj9 (Cmaj9)'],
      chords: [
        [48, 52, 55, 59],
        [41, 48, 51, 56],
        [46, 50, 56, 60, 64],
        [48, 52, 55, 59, 62],
      ],
      bassLine: [36, 29, 34, 36],
      desc: 'En lugar de entrar por la puerta principal (Dm7–G7–C), entra desde el subdominante menor (Fm7–Bb7–C). Pilares del Jazz, Stevie Wonder y Neo-Soul.',
      voiceLeadingNote: 'Las notas Lab y Mib de Fm7/Bb7 descienden suavemente a Sol y Mi de Cmaj7.',
    },
    {
      id: 'mi_dorian_lydian',
      name: '3) Intercambio Dórico y Lidio Luminoso: Cm7 → F9 (IV7 Dórico) | Cmaj7 → D/C (II Lidio)',
      roman: ['im7 (Cm7)', 'IV9 (F9 Dórico)', 'Imaj7 (Cmaj7)', 'II/I (D/C Lidio)'],
      chords: [
        [48, 51, 55, 58],
        [41, 51, 57, 60, 62],
        [48, 52, 55, 59],
        [48, 54, 57, 62],
      ],
      bassLine: [36, 29, 36, 38],
      desc: 'Contrasta el calor funk del IV7 mayor en un contexto menor (Santana / Daft Punk) con el vuelo espacial del II mayor sobre bajo de tónica.',
      voiceLeadingNote: 'La nota La natural ilumina a Cm7; el Fa# ilumina a Cmaj7.',
    },
    {
      id: 'mi_neapolitan_phrygian',
      name: '4) Préstamo Frigio / Napolitano: Cmaj7 → Dbmaj7(#11) (♭IImaj7) → Cmaj9',
      roman: ['Imaj7 (Cmaj7)', '♭IImaj7 (Dbmaj7#11)', 'V7sus4 (G9sus4)', 'Imaj9 (Cmaj9)'],
      chords: [
        [48, 52, 55, 59],
        [49, 53, 56, 60, 67],
        [43, 53, 57, 60, 62],
        [48, 52, 55, 59, 62],
      ],
      bassLine: [36, 37, 31, 36],
      desc: 'El acorde ♭IImaj7 prestado del modo Frigio mantiene a Do y Sol como notas comunes (7M y #11 de Reb) mientras el bajo roza Reb.',
      voiceLeadingNote: 'Nota común hipnótica C4–G4 suspendida arriba mientras el bajo hace C2 → Db2 → G1 → C2.',
    },
  ],
  'mod-pivot': [
    {
      id: 'mod_pivot_fifth',
      name: '1) Modulación por Acorde Pivote (Do Mayor → Sol Mayor vía Am7 = vi de C / ii de G)',
      roman: ['C: I (Cmaj7)', 'C:vi = G:ii (Am7 Pivote)', 'G: V7 (D7)', 'G: I (Gmaj7 Nueva Tónica)'],
      chords: [
        [48, 52, 55, 59],
        [45, 52, 55, 60],
        [50, 54, 57, 60],
        [43, 50, 54, 59],
      ],
      bassLine: [36, 33, 38, 31],
      desc: 'Am7 pertenece a ambas tonalidades: entra como vi de Do Mayor y sale reasignado como ii de un ii–V–I hacia Sol Mayor.',
      voiceLeadingNote: 'El Fa natural se transforma en Fa# dentro de D7 para sellar la nueva tonalidad de Sol.',
    },
    {
      id: 'mod_lift_semitone',
      name: '2) Modulación Directa / "Subida de Camionero" (+1 Semitono: C → G7 → Ab7 → Db Mayor)',
      roman: ['C: I (C)', 'C: V7 (G7)', 'Prep. ♭VI7 (Ab7)', 'Db: I (Db Mayor +1 Semitono!)'],
      chords: [
        [48, 55, 60, 64],
        [43, 53, 59, 62],
        [44, 51, 56, 60],
        [49, 56, 61, 65],
      ],
      bassLine: [36, 31, 32, 37],
      desc: 'Inyección instantánea de adrenalina en el último estribillo subiendo toda la orquesta medio tono mediante su nuevo V7 (Ab7).',
      voiceLeadingNote: 'El bajo sube cromáticamente en el puente: G1 → Ab1 → Db2.',
    },
    {
      id: 'mod_enarmonic_dim7',
      name: '3) Modulación Enarmónica por °7 Simétrico (De Do Mayor a Mi♭ Mayor vía B°7 = D°7)',
      roman: ['C: I (Cmaj7)', 'Puente Simétrico (B°7 = D°7)', 'Eb: V7 (Bb7)', 'Eb: I (Ebmaj7)'],
      chords: [
        [48, 52, 55, 59],
        [47, 50, 53, 56],
        [46, 53, 56, 62],
        [51, 55, 58, 62],
      ],
      bassLine: [36, 35, 34, 39],
      desc: 'Como B°7 (Si–Re–Fa–Lab) divide la octava en 4 partes iguales, basta bajar cualquiera de sus 4 notas medio tono (Si → Sib) para caer en Bb7 → Eb.',
      voiceLeadingNote: 'Una sola voz baja un semitono (B3 → Bb3) y teletransporta la tonalidad a una 3ª menor de distancia.',
    },
    {
      id: 'mod_common_tone',
      name: '4) Modulación por Nota Común Cinematográfica (C Mayor → Abmaj7 → E Mayor manteniendo Mi4)',
      roman: ['C Mayor (Mi = 3ª)', 'Abmaj7#5 (Mi = #5)', 'C#m7 (Mi = ♭3)', 'E Mayor (Mi = Tónica)'],
      chords: [
        [48, 55, 60, 64],
        [44, 51, 55, 64],
        [49, 56, 59, 64],
        [40, 52, 56, 59, 64],
      ],
      bassLine: [36, 32, 37, 28],
      desc: 'La nota aguda Mi4 actúa como bisagra fija en el techo mientras las raíces viajan por terceras mayores (C → Ab → E).',
      voiceLeadingNote: 'Hilo conductor en soprano: E4 constante de principio a fin.',
    },
  ],
  'voice-leading': [
    {
      id: 'vl_smooth_vs_jump',
      name: '1) Conducción Óptima por Enlace Armónico: C (Fundamental) → F/C (2ª Inv) → G7/B (1ª Inv) → C',
      roman: ['C (C3–E3–G3–C4)', 'F/C (C3–F3–A3–C4)', 'G7/B (B2–F3–G3–D4)', 'C (C3–E3–G3–C4)'],
      chords: [
        [48, 52, 55, 60],
        [48, 53, 57, 60],
        [47, 53, 55, 62],
        [48, 52, 55, 60],
      ],
      bassLine: [36, 36, 35, 36],
      desc: 'Distancia total recorrida por las 4 voces: apenas 3 semitonos por cambio. Ninguna voz salta más de un tono.',
      voiceLeadingNote: 'El bajo permanece en Do (C2) y solo roza la sensible Si (B1) antes de volver a Do.',
    },
    {
      id: 'vl_guide_tones_shell',
      name: '2) Esqueleto de Notas Guía (3ª y 7ª en Movimiento Contrario al Bajo): Am7 → D7 → Gmaj7 → Cmaj7',
      roman: ['vi7 (Am7: G+C)', 'II7 (D7: F#+C)', 'Vmaj7 (Gmaj7: F#+B)', 'Imaj7 (Cmaj7: E+B)'],
      chords: [
        [45, 55, 60, 64],
        [50, 54, 60, 64],
        [43, 54, 59, 62],
        [48, 52, 59, 62],
      ],
      bassLine: [33, 38, 31, 36],
      desc: 'Mientras una nota guía se queda quieta como nota común, la otra baja un solo semitono (G → F# → F# → E y C → C → B → B).',
      voiceLeadingNote: 'Economía máxima: 1 semitono de movimiento en las voces internas por cada salto de 5ª en el bajo.',
    },
    {
      id: 'vl_line_cliche_minor',
      name: '3) Contrapunto Interno (Line Cliché en Voz Central): Cm → Cm(maj7) → Cm7 → Cm6 → Abmaj7 → G7',
      roman: ['Cm (Voz=Do4)', 'CmMaj7 (Voz=Si3)', 'Cm7 (Voz=Sib3)', 'Cm6 (Voz=La3)', 'Abmaj7 (Voz=Sol3)', 'G7♭9 (Voz=Fa3)'],
      chords: [
        [48, 55, 60, 63],
        [48, 55, 59, 63],
        [48, 55, 58, 63],
        [48, 55, 57, 63],
        [44, 51, 55, 60],
        [43, 50, 53, 59],
      ],
      bassLine: [36, 36, 36, 36, 32, 31],
      desc: 'Una sola voz interna desciende cromáticamente (Do → Si → Sib → La → Lab → Sol) creando una melodía oculta hipnótica.',
      voiceLeadingNote: 'Puedes tocar esta misma línea cromática en el bajo: Cm → Cm/B → Cm/Bb → Cm/A → Abmaj7 → G7.',
    },
  ],
};

function computePlayableGuitarVoicing(
  chordMidis: number[],
  bassMidi: number
): {
  frets: (number | null)[];
  fingers: (number | null)[];
  baseFret: number;
  tabText: string;
  fingerText: string;
} {
  const openHighToLow = GUITAR_STRINGS.map((s) => s.openMidi);
  const lowestNote = Math.min(...chordMidis);
  const bassPc = (((bassMidi ?? lowestNote) % 12) + 12) % 12;
  const lowestPc = ((lowestNote % 12) + 12) % 12;
  let orderedMidis = [...chordMidis];
  if (lowestPc !== bassPc) {
    const normalizedBass = lowestNote - (((lowestNote % 12) - bassPc + 12) % 12);
    const bassAnchor = normalizedBass < lowestNote ? normalizedBass : normalizedBass - 12;
    orderedMidis = [bassAnchor, ...chordMidis];
  }
  const positions = resolvePlayableChordVoicing(orderedMidis, openHighToLow, 12);
  const fingerInfo = assignGuitarChordFingers(positions, true);
  const frets: (number | null)[] = [null, null, null, null, null, null];
  const fingers: (number | null)[] = [null, null, null, null, null, null];
  positions.forEach((pos) => {
    const lowToHighIdx = 5 - pos.sIdx;
    if (lowToHighIdx >= 0 && lowToHighIdx < 6) {
      frets[lowToHighIdx] = pos.fret;
    }
  });
  fingerInfo.positions.forEach((fp) => {
    const lowToHighIdx = 5 - fp.sIdx;
    if (lowToHighIdx >= 0 && lowToHighIdx < 6) {
      fingers[lowToHighIdx] = fp.finger;
    }
  });
  const nonZero = frets.filter((f): f is number => f !== null && f > 0);
  const minFret = nonZero.length > 0 ? Math.min(...nonZero) : 1;
  const maxFret = nonZero.length > 0 ? Math.max(...nonZero) : 4;
  const baseFret = maxFret <= 4 ? 1 : minFret;
  const tabText = frets.map((f) => (f === null ? 'X' : String(f))).join('-');
  const fingerText = fingers.map((f) => (f === null ? 'X' : String(f))).join('-');
  return { frets, fingers, baseFret, tabText, fingerText };
}

function computePlayableBassVoicing(
  chordMidis: number[],
  bassMidi: number
): { frets: (number | null)[]; baseFret: number; tabText: string } {
  const openHighToLow = BASS_STRINGS.map((s) => s.openMidi);
  const lowestNote = Math.min(...chordMidis);
  const bassPc = (((bassMidi ?? lowestNote) % 12) + 12) % 12;
  const orderedMidis = [...chordMidis];
  if (orderedMidis.length > 0 && (((orderedMidis[0] % 12) + 12) % 12) !== bassPc) {
    orderedMidis.unshift(24 + bassPc);
  }
  const positions = resolvePlayableChordVoicing(orderedMidis, openHighToLow, 12);
  const frets: (number | null)[] = [null, null, null, null];
  positions.forEach((pos) => {
    const lowToHighIdx = 3 - pos.sIdx;
    if (lowToHighIdx >= 0 && lowToHighIdx < 4) {
      frets[lowToHighIdx] = pos.fret;
    }
  });
  const nonZero = frets.filter((f): f is number => f !== null && f > 0);
  const minFret = nonZero.length > 0 ? Math.min(...nonZero) : 1;
  const maxFret = nonZero.length > 0 ? Math.max(...nonZero) : 4;
  const baseFret = maxFret <= 4 ? 1 : minFret;
  const tabText = frets.map((f) => (f === null ? 'X' : String(f))).join('-');
  return { frets, baseFret, tabText };
}

function renderMiniChordNeckSvg(
  chordMidis: number[],
  bassMidi: number,
  mode: 'guitar' | 'bass' = 'guitar'
): string {
  const isBass = mode === 'bass';
  const openLowToHigh = isBass ? [28, 33, 38, 43] : [40, 45, 50, 55, 59, 64];
  const stringNames = isBass ? ['E', 'A', 'D', 'G'] : ['E', 'A', 'D', 'G', 'B', 'e'];
  const numStrings = openLowToHigh.length;
  const rootPc = (((bassMidi ?? chordMidis[0]) % 12) + 12) % 12;
  const guitarVoicing = !isBass ? computePlayableGuitarVoicing(chordMidis, bassMidi) : null;
  const bassVoicing = isBass ? computePlayableBassVoicing(chordMidis, bassMidi) : null;
  const frets = isBass ? bassVoicing!.frets : guitarVoicing!.frets;
  const baseFret = isBass ? bassVoicing!.baseFret : guitarVoicing!.baseFret;
  const tabText = isBass ? bassVoicing!.tabText : guitarVoicing!.tabText;

  const w = 136;
  const h = 114;
  const padL = isBass ? 28 : 22;
  const padT = 22;
  const gridW = isBass ? 82 : 95;
  const gridH = 68;
  const strGap = gridW / (numStrings - 1);
  const fretGap = gridH / 4;

  const lines: string[] = [];
  if (baseFret === 1) {
    lines.push(`<line x1="${padL}" y1="${padT}" x2="${padL + gridW}" y2="${padT}" stroke="${isBass ? '#38bdf8' : '#f8fafc'}" stroke-width="3.2" />`);
  } else {
    lines.push(`<line x1="${padL}" y1="${padT}" x2="${padL + gridW}" y2="${padT}" stroke="#64748b" stroke-width="1.5" />`);
    lines.push(
      `<text x="${padL - 5}" y="${padT + fretGap * 0.65}" text-anchor="end" fill="${isBass ? '#38bdf8' : '#fbbf24'}" font-size="9" font-weight="800">${baseFret}fr</text>`
    );
  }

  for (let f = 1; f <= 4; f++) {
    const y = padT + f * fretGap;
    lines.push(`<line x1="${padL}" y1="${y}" x2="${padL + gridW}" y2="${y}" stroke="#334155" stroke-width="1.1" />`);
  }

  for (let s = 0; s < numStrings; s++) {
    const x = padL + s * strGap;
    const sw = isBass ? 2.5 - s * 0.32 : 1.8 - s * 0.16;
    lines.push(`<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + gridH}" stroke="${isBass ? '#7dd3fc' : '#94a3b8'}" stroke-width="${sw.toFixed(2)}" />`);
    lines.push(
      `<text x="${x}" y="${padT + gridH + 12}" text-anchor="middle" fill="${isBass ? '#38bdf8' : '#94a3b8'}" font-size="8.5" font-weight="800">${stringNames[s]}</text>`
    );

    const fVal = frets[s];
    const fingerVal = !isBass && guitarVoicing ? guitarVoicing.fingers[s] || 0 : 0;
    if (fVal === null) {
      lines.push(
        `<text x="${x}" y="${padT - 6}" text-anchor="middle" fill="#fb7185" font-size="9.5" font-weight="800">×</text>`
      );
    } else if (fVal === 0) {
      const pc = openLowToHigh[s] % 12;
      const isRoot = pc === rootPc;
      lines.push(
        `<circle cx="${x}" cy="${padT - 8}" r="4.8" fill="${isRoot ? '#f59e0b' : 'none'}" stroke="${isRoot ? '#fef08a' : isBass ? '#34d399' : '#38bdf8'}" stroke-width="1.8" />`
      );
    } else {
      const relFret = Math.max(1, Math.min(4, fVal - baseFret + 1));
      const cy = padT + (relFret - 0.5) * fretGap;
      const pc = (openLowToHigh[s] + fVal) % 12;
      const isRoot = pc === rootPc;
      const noteName = NOTE_NAMES[pc];
      lines.push(
        `<circle cx="${x}" cy="${cy}" r="${isBass ? '7.0' : '6.4'}" fill="${isRoot ? '#f59e0b' : isBass ? '#059669' : '#0284c7'}" stroke="${isRoot ? '#fef08a' : isBass ? '#6ee7b7' : '#7dd3fc'}" stroke-width="1.5" />`
      );
      lines.push(
        `<text x="${x}" y="${cy + 2.8}" text-anchor="middle" fill="${isRoot ? '#0f172a' : '#f8fafc'}" font-size="6.9" font-weight="900">${noteName}</text>`
      );
      if (!isBass && fingerVal > 0) {
        lines.push(
          `<circle cx="${x + 6.4}" cy="${cy - 5.2}" r="4.3" fill="#fde047" stroke="#090c12" stroke-width="0.9" />` +
            `<text x="${x + 6.4}" y="${cy - 2.9}" text-anchor="middle" fill="#090c12" font-size="5.8" font-weight="900">${fingerVal}</text>`
        );
      }
    }
  }

  return `
    <div style="margin-top:6px; display:flex; flex-direction:column; align-items:center;">
      <svg viewBox="0 0 ${w} ${h}" style="width:128px; height:106px; background:${isBass ? 'rgba(6,24,38,0.88)' : 'rgba(7,10,18,0.75)'}; border:1px solid ${isBass ? 'rgba(56,189,248,0.45)' : 'rgba(148,163,184,0.2)'}; border-radius:6px;">
        ${lines.join('')}
      </svg>
      <div style="font-size:0.68rem; color:#94a3b8; font-family:monospace; margin-top:3px;">${isBass ? 'Bajo (4c)' : 'Guitarra (6c)'}: <strong style="color:${isBass ? '#38bdf8' : '#fde68a'};">${tabText}</strong></div>
      ${!isBass && guitarVoicing ? `<div style="font-size:0.64rem; color:#fde047; font-family:monospace;">Dedos: <strong>${guitarVoicing.fingerText}</strong></div>` : ''}
    </div>
  `;
}

function buildProgressionWidget(
  container: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void,
  title = 'Laboratorio Interactivo de Progresiones Armónicas y Conducción de Voces',
  contextKey = 'archetypes'
): void {
  const progressions = PROGRESSION_SETS_BY_CONTEXT[contextKey] || PROGRESSION_SETS_BY_CONTEXT['archetypes'];
  let currentIdx = 0;
  let activeChordIdx = 0;
  const initFocus = getVisualInstrumentFocus();
  let currentInst: 'guitar' | 'piano' | 'bass' = initFocus === 'bass-only' ? 'bass' : 'guitar';
  let neckViewMode: 'guitar' | 'bass' = initFocus === 'bass-only' ? 'bass' : 'guitar';
  let showOnlyVoicingOnNeck = false;
  let includeBassLine = true;

  container.innerHTML = `
    <div class="widget-header">
      <div>
        <strong style="color:var(--accent-gold); font-size:1.1rem;">${title}</strong>
        <p style="font-size:0.82rem; color:var(--text-muted); margin:0;">Haz clic en cada acorde para escucharlo y alterna entre Guitarra (6 cuerdas) y Bajo Eléctrico (4 cuerdas) para cambiar todos los diagramas del mástil.</p>
      </div>
      <div class="widget-controls">
        <select class="js-prog-select">
          ${progressions.map((p, idx) => `<option value="${idx}" ${idx === currentIdx ? 'selected' : ''}>${p.name}</option>`).join('')}
        </select>
        <select class="js-prog-inst">
          <option value="guitar" selected>🎸 Guitarra (6 Cuerdas) + Bajo</option>
          <option value="bass">🎸 Bajo Eléctrico (4 Cuerdas)</option>
          <option value="piano">🎹 Piano + Bajo 4 Cuerdas</option>
        </select>
        <button type="button" class="btn btn-primary js-prog-play">▶ Escuchar Progresión</button>
        <button type="button" class="btn js-prog-bass-only js-prog-bass" style="background:rgba(56,189,248,0.16); color:#38bdf8; border:1px solid rgba(56,189,248,0.4);">🎸 Escuchar Walking/Groove de Bajo</button>
        <button type="button" class="btn js-prog-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
      </div>
    </div>
    <div class="js-prog-desc" style="margin-bottom:8px; font-size:0.86rem; color:var(--text-secondary);"></div>
    <div class="js-prog-vl" style="margin-bottom:12px; padding:8px 12px; background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.3); border-radius:6px; font-size:0.8rem; color:#bae6fd;"></div>
    <div class="js-prog-cards" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(158px, 1fr)); gap:10px; margin-bottom:14px;"></div>

    <!-- Live Interactive 12-Fret Fretboard Diagram for Active Chord in Modulation/Progression -->
    <div style="background:rgba(15,23,42,0.92); border:1px solid rgba(245,158,11,0.35); border-radius:10px; padding:12px;">
      <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px;">
        <div>
          <strong style="color:var(--accent-gold); font-size:0.9rem;" class="js-prog-neck-title">🎸 Mapa en el Mástil (0–12 Trastes)</strong>
          <div style="font-size:0.74rem; color:#94a3b8;">Dorado = Fundamental/Bajo · Azul/Verde = Voces del Acorde · Aro Blanco ★ = Digitación Principal del Acorde</div>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          <button type="button" class="btn js-prog-neck-mode" data-mode="guitar" style="font-size:0.75rem; padding:4px 10px; background:rgba(245,158,11,0.22); color:#fbbf24; border:1px solid #f59e0b;">🎸 Mástil Guitarra (6 Cuerdas)</button>
          <button type="button" class="btn js-prog-neck-mode" data-mode="bass" style="font-size:0.75rem; padding:4px 10px; background:rgba(30,41,59,0.9); color:#94a3b8; border:1px solid #334155;">🎸 Mástil Bajo (4 Cuerdas)</button>
          <button type="button" class="btn js-prog-neck-filter" style="font-size:0.74rem; padding:4px 10px; background:rgba(56,189,248,0.14); color:#38bdf8; border:1px solid rgba(56,189,248,0.38);">🎯 Ver: Mapa Completo (0–12)</button>
        </div>
      </div>
      <div class="js-prog-neck-host"></div>
    </div>
  `;

  const sel = container.querySelector<HTMLSelectElement>('.js-prog-select')!;
  const instSel = container.querySelector<HTMLSelectElement>('.js-prog-inst')!;
  const playBtn = container.querySelector<HTMLButtonElement>('.js-prog-play')!;
  const bassOnlyBtn = container.querySelector<HTMLButtonElement>('.js-prog-bass-only')!;
  const stopBtn = container.querySelector<HTMLButtonElement>('.js-prog-stop')!;
  const descEl = container.querySelector<HTMLElement>('.js-prog-desc')!;
  const vlEl = container.querySelector<HTMLElement>('.js-prog-vl')!;
  const cardsEl = container.querySelector<HTMLElement>('.js-prog-cards')!;
  const neckTitleEl = container.querySelector<HTMLElement>('.js-prog-neck-title')!;
  const neckHostEl = container.querySelector<HTMLElement>('.js-prog-neck-host')!;
  const neckModeBtns = container.querySelectorAll<HTMLButtonElement>('.js-prog-neck-mode');
  const neckFilterBtn = container.querySelector<HTMLButtonElement>('.js-prog-neck-filter')!;

  const syncNeckModeButtons = (): void => {
    neckModeBtns.forEach((b) => {
      const active = b.getAttribute('data-mode') === neckViewMode;
      b.style.background = active ? 'rgba(245,158,11,0.24)' : 'rgba(30,41,59,0.9)';
      b.style.color = active ? '#fbbf24' : '#94a3b8';
      b.style.borderColor = active ? '#f59e0b' : '#334155';
    });
  };

  const getChordBassMidi = (p: ProgressionItem, cIdx: number): number =>
    p.bassLine.length === p.chords.length
      ? p.bassLine[cIdx]
      : p.chords[cIdx][0] - 12;

  const renderFullNeckForActiveChord = (): void => {
    const p = progressions[currentIdx];
    const cIdx = Math.min(activeChordIdx, p.chords.length - 1);
    const chordMidis = p.chords[cIdx];
    const bassMidi = getChordBassMidi(p, cIdx);
    const label = p.roman[cIdx];
    const rootPc = ((bassMidi % 12) + 12) % 12;
    const pcs = new Set(chordMidis.map((m) => ((m % 12) + 12) % 12));

    const isBass = neckViewMode === 'bass';
    const stringsConfig = isBass ? BASS_STRINGS : GUITAR_STRINGS;
    const guitarVoicing = !isBass ? computePlayableGuitarVoicing(chordMidis, bassMidi) : null;
    const bassVoicing = isBass ? computePlayableBassVoicing(chordMidis, bassMidi) : null;
    const voicingFrets = isBass ? bassVoicing!.frets : guitarVoicing!.frets;
    const tabText = isBass ? bassVoicing!.tabText : guitarVoicing!.tabText;

    neckTitleEl.textContent = isBass
      ? `🎸 Mapa en el Mástil de BAJO ELÉCTRICO (4 Cuerdas: G–D–A–E · 0–12 Trastes) — Paso ${cIdx + 1}: ${label} [Digitación Bajo: ${tabText}]`
      : `🎸 Mapa en el Mástil de GUITARRA (6 Cuerdas: e–B–G–D–A–E · 0–12 Trastes) — Paso ${cIdx + 1}: ${label} [Digitación: ${tabText} · Dedos Izq: ${guitarVoicing!.fingerText}]`;

    const numStrings = stringsConfig.length;
    let html = `<div class="fretboard-wrapper">`;
    html += `<div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.16); margin-bottom:4px;"><div class="string-label" style="color:var(--text-muted); font-size:0.7rem;">Traste</div>`;
    for (let f = 0; f <= 12; f++) {
      const marker = [3, 5, 7, 9, 12].includes(f) ? '•' : '';
      html += `<div class="fret-cell" style="height:20px; border:none; color:var(--text-muted); font-size:0.72rem; font-weight:700;">${f === 0 ? '0 (Aire)' : `${f}${marker}`}</div>`;
    }
    html += `</div>`;

    stringsConfig.forEach((st, sIdx) => {
      const lowToHighIdx = numStrings - 1 - sIdx;
      const voicedFret = voicingFrets[lowToHighIdx];
      const voicedFinger = !isBass && guitarVoicing ? guitarVoicing.fingers[lowToHighIdx] || 0 : 0;

      html += `<div class="fretboard-row"><div class="string-label" style="color:${isBass ? '#38bdf8' : '#fbbf24'};">${st.label}</div>`;
      for (let f = 0; f <= 12; f++) {
        const midi = st.openMidi + f;
        const pc = midi % 12;
        const noteName = NOTE_NAMES[pc];
        const isRoot = pc === rootPc;
        const isChordTone = pcs.has(pc);
        const isPrimaryVoicingFret = voicedFret === f;

        let stateClass = '';
        if (showOnlyVoicingOnNeck) {
          if (isPrimaryVoicingFret) {
            stateClass = isRoot ? 'root' : isBass ? 'char' : 'active';
          }
        } else {
          if (isRoot) {
            stateClass = 'root';
          } else if (isChordTone) {
            stateClass = isBass ? 'char' : 'active';
          }
        }

        const ringStyle = isPrimaryVoicingFret
          ? 'box-shadow:0 0 0 2.5px #ffffff, 0 0 14px #f59e0b; transform:scale(1.12); font-weight:900;'
          : '';
        const fingerBadge =
          !isBass && isPrimaryVoicingFret && voicedFinger > 0 && f > 0
            ? `<span class="finger-badge" title="Dedo ${voicedFinger}">${voicedFinger}</span>`
            : '';

        html += `
          <div class="fret-cell js-prog-neck-cell" data-sidx="${sIdx}" data-fret="${f}" data-midi="${midi}" data-note="${noteName}" title="Cuerda ${st.label}, Traste ${f}: ${noteName}${isPrimaryVoicingFret ? ` (★ Posición del Voicing${!isBass && voicedFinger > 0 ? ` · Dedo ${voicedFinger}` : ''})` : ''}">
            <div class="fret-note ${stateClass}" style="${ringStyle}">${isPrimaryVoicingFret ? `${noteName}★` : noteName}${fingerBadge}</div>
          </div>
        `;
      }
      html += `</div>`;
    });
    html += `</div>`;
    neckHostEl.innerHTML = html;
  };

  const renderCards = (): void => {
    const p = progressions[currentIdx];
    descEl.textContent = p.desc;
    vlEl.innerHTML = `<strong>🧭 Conducción de Voces y Bajo (4 Cuerdas G–D–A–E):</strong> ${p.voiceLeadingNote}`;
    cardsEl.innerHTML = p.roman
      .map((label, cIdx) => {
        const notesList = p.chords[cIdx].map((m) => NOTE_NAMES[m % 12]).join(' – ');
        const bassMidi = getChordBassMidi(p, cIdx);
        const bassName = `${NOTE_NAMES[bassMidi % 12]}${Math.floor(bassMidi / 12) - 1}`;
        const isSelected = cIdx === activeChordIdx;
        const svgNeck = renderMiniChordNeckSvg(p.chords[cIdx], bassMidi, neckViewMode);
        return `
          <button type="button" class="js-chord-card" data-cidx="${cIdx}" style="background:${isSelected ? 'rgba(30,58,138,0.55)' : 'rgba(30,41,59,0.88)'}; border:2px solid ${isSelected ? '#f59e0b' : 'rgba(56,189,248,0.35)'}; border-radius:10px; padding:10px 8px; color:#f8fafc; cursor:pointer; text-align:center; transition:0.15s; display:flex; flex-direction:column; align-items:center; justify-content:space-between;">
            <div>
              <div style="font-size:0.71rem; color:var(--accent-cyan); margin-bottom:2px;">Paso ${cIdx + 1} · Bajo: ${bassName}</div>
              <div style="font-size:0.95rem; font-weight:800; color:var(--accent-gold);">${label}</div>
              <div style="font-size:0.71rem; color:#cbd5e1; margin-top:2px; font-family:monospace;">[${notesList}]</div>
            </div>
            ${svgNeck}
            <div style="font-size:0.68rem; color:#38bdf8; margin-top:4px;">🔊 Clic para escuchar (${neckViewMode === 'bass' ? 'Bajo 4c' : 'Guitarra 6c'})</div>
          </button>
        `;
      })
      .join('');
    syncNeckModeButtons();
    renderFullNeckForActiveChord();
  };

  instSel.value = currentInst;
  renderCards();

  const onProgVisualFocus = () => {
    if (!container.isConnected) {
      window.removeEventListener('enciclopedia:visual-instrument-change', onProgVisualFocus);
      return;
    }
    const f = getVisualInstrumentFocus();
    if (f === 'bass-only') {
      currentInst = 'bass';
      neckViewMode = 'bass';
    } else if (f === 'guitar-only') {
      currentInst = 'guitar';
      neckViewMode = 'guitar';
    }
    instSel.value = currentInst;
    renderCards();
  };
  window.addEventListener('enciclopedia:visual-instrument-change', onProgVisualFocus);

  neckModeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      neckViewMode = (btn.getAttribute('data-mode') as 'guitar' | 'bass') || 'guitar';
      currentInst = neckViewMode;
      instSel.value = neckViewMode;
      renderCards();
      onStatus(
        `Diagramas del mástil cambiados a: ${neckViewMode === 'bass' ? 'Bajo Eléctrico (4 Cuerdas: E–A–D–G)' : 'Guitarra (6 Cuerdas: E–A–D–G–B–e)'}`
      );
    });
  });

  neckFilterBtn.addEventListener('click', () => {
    showOnlyVoicingOnNeck = !showOnlyVoicingOnNeck;
    neckFilterBtn.textContent = showOnlyVoicingOnNeck
      ? '🎯 Ver: Solo Digitación (★)'
      : '🎯 Ver: Mapa Completo (0–12)';
    renderFullNeckForActiveChord();
  });

  neckHostEl.addEventListener('click', (e) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('.js-prog-neck-cell');
    if (!cell) return;
    const midi = parseInt(cell.getAttribute('data-midi') || '60', 10);
    const sIdx = parseInt(cell.getAttribute('data-sidx') || '-1', 10);
    const fret = parseInt(cell.getAttribute('data-fret') || '-1', 10);
    const note = cell.getAttribute('data-note') || 'C';
    const hint: NoteGlowHint = sIdx >= 0 && fret >= 0 ? { sIdx, fret, scopeEl: neckHostEl } : {};
    if (neckViewMode === 'bass') {
      audio.playElectricBass(midi, 1.1, 0, 0.4, 'finger', true, hint);
    } else {
      audio.playPluckedGuitar(midi, 1.1, 0, 0.3, true, hint);
    }
    onStatus(`Traste pulsado en mástil (${neckViewMode === 'bass' ? 'Bajo 4c' : 'Guitarra 6c'}): ${note} (MIDI ${midi})`);
  });

  sel.addEventListener('change', () => {
    currentIdx = parseInt(sel.value, 10);
    activeChordIdx = 0;
    audio.stopAll();
    renderCards();
  });

  instSel.addEventListener('change', () => {
    currentInst = instSel.value as 'guitar' | 'piano' | 'bass';
    includeBassLine = true;
    if (currentInst === 'bass') {
      neckViewMode = 'bass';
    } else if (currentInst === 'guitar') {
      neckViewMode = 'guitar';
    }
    renderCards();
    onStatus(
      `Instrumento y diagramas cambiados a: ${currentInst === 'bass' ? 'Bajo Eléctrico (4 Cuerdas)' : currentInst === 'guitar' ? 'Guitarra (6 Cuerdas)' : 'Piano + Bajo'}`
    );
  });

  cardsEl.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('.js-chord-card');
    if (!card) return;
    const cIdx = parseInt(card.getAttribute('data-cidx')!, 10);
    activeChordIdx = cIdx;
    const p = progressions[currentIdx];
    audio.stopAll();
    renderCards();
    const bassMidi = getChordBassMidi(p, cIdx);
    if (currentInst === 'bass') {
      audio.playElectricBass(bassMidi, 1.3, 0, 0.42, 'finger', false);
      p.chords[cIdx].slice(1).forEach((m, i) => {
        audio.playElectricBass(m - 12, 0.45, (i + 1) * 0.28, 0.34, 'finger', false);
      });
    } else {
      if (includeBassLine) {
        audio.playElectricBass(bassMidi, 1.4, 0, 0.36, 'finger', false, { skipGlow: true });
      }
      audio.strumChord(p.chords[cIdx], currentInst, 0, false);
    }
    onStatus(`Acorde ${p.roman[cIdx]} + Bajo ${NOTE_NAMES[bassMidi % 12]} (Mástil actualizado)`);
  });

  playBtn.addEventListener('click', () => {
    audio.stopAll();
    const p = progressions[currentIdx];
    p.chords.forEach((notes, idx) => {
      audio.schedule(() => {
        activeChordIdx = idx;
        renderCards();
        const bassMidi = getChordBassMidi(p, idx);
        if (currentInst === 'bass') {
          audio.playElectricBass(bassMidi, 0.85, 0, 0.42, 'finger', false);
        } else {
          audio.playElectricBass(bassMidi, 0.88, 0, 0.35, 'finger', false, { skipGlow: true });
          audio.strumChord(notes, currentInst, 0, false);
        }
        onStatus(`▶ [${idx + 1}/${p.chords.length}] ${p.roman[idx]} — ${p.name}`);
      }, idx * 920);
    });
  });

  bassOnlyBtn.addEventListener('click', () => {
    audio.stopAll();
    const p = progressions[currentIdx];
    neckViewMode = 'bass';
    currentInst = 'bass';
    instSel.value = 'bass';
    renderCards();
    p.bassLine.forEach((bMidi, idx) => {
      audio.schedule(() => {
        activeChordIdx = idx % p.chords.length;
        renderCards();
        audio.playElectricBass(bMidi, 0.48, 0, 0.42, 'finger', false);
        audio.playDrumHit(idx % 2 === 0 ? 'kick' : 'snare', 0);
        audio.playDrumHit('hihat', 0);
      }, idx * 460);
    });
    onStatus(`Bajo Eléctrico 4 Cuerdas: Walking/Groove sobre ${p.name}`);
  });

  stopBtn.addEventListener('click', () => {
    audio.stopAll();
    onStatus('Progresión detenida');
  });
}

/**
 * Interactive Scale Harmonizer & Functional Progression Builder (`data-lab="harmonizer"`)
 * Harmonizes any scale in Triads (size=3), Sevenths (size=4) or Ninths (size=5) and lets the user chain their own progression!
 */
function buildDiatonicScaleHarmonizerLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const scalesToHarmonize: { id: string; name: string; intervals: number[] }[] = [
    { id: 'major', name: 'Mayor Natural (Jónica)', intervals: [0, 2, 4, 5, 7, 9, 11] },
    { id: 'minor', name: 'Menor Natural (Eólica)', intervals: [0, 2, 3, 5, 7, 8, 10] },
    { id: 'harmonic_minor', name: 'Menor Armónica (con 7ª Sensible)', intervals: [0, 2, 3, 5, 7, 8, 11] },
    { id: 'melodic_minor', name: 'Menor Melódica (6ª y 7ª Mayores)', intervals: [0, 2, 3, 5, 7, 9, 11] },
    { id: 'dorian', name: 'Modo Dórico (Menor con 6ª Mayor)', intervals: [0, 2, 3, 5, 7, 9, 10] },
    { id: 'phrygian', name: 'Modo Frigio (Menor con ♭2)', intervals: [0, 1, 3, 5, 7, 8, 10] },
    { id: 'lydian', name: 'Modo Lidio (Mayor con #4)', intervals: [0, 2, 4, 6, 7, 9, 11] },
    { id: 'mixolydian', name: 'Modo Mixolidio (Mayor con ♭7)', intervals: [0, 2, 4, 5, 7, 9, 10] },
  ];

  let rootPc = 0; // C
  let scaleId = 'major';
  let stackSize = 4; // 3=Triads, 4=Sevenths, 5=Ninths
  let neckMode: 'guitar' | 'bass' = 'guitar';
  let customChain: number[] = [0, 5, 1, 4]; // I - vi - ii - V default

  const getChordQuality = (thirdSemi: number, fifthSemi: number, seventhSemi: number, size: number): { suffix: string; romanCase: 'upper' | 'lower'; role: string } => {
    const isMinor3 = thirdSemi === 3;
    const isDim5 = fifthSemi === 6;
    const isAug5 = fifthSemi === 8;

    if (size === 3) {
      if (isDim5 && isMinor3) return { suffix: '° (Disminuido)', romanCase: 'lower', role: 'Dominante / Sensible' };
      if (isAug5 && !isMinor3) return { suffix: '+ (Aumentado)', romanCase: 'upper', role: 'Tónica / Dominante' };
      if (isMinor3) return { suffix: 'm (Menor)', romanCase: 'lower', role: 'Tónica / Subdominante' };
      return { suffix: ' Mayor', romanCase: 'upper', role: 'Tónica / Subdominante / Dominante' };
    }

    let suffix = '';
    if (isDim5 && isMinor3) {
      suffix = seventhSemi === 9 ? '°7' : 'm7♭5';
    } else if (isAug5 && !isMinor3) {
      suffix = seventhSemi === 11 ? 'maj7#5' : '7#5';
    } else if (isMinor3) {
      suffix = seventhSemi === 11 ? 'm(maj7)' : 'm7';
    } else {
      suffix = seventhSemi === 11 ? 'maj7' : '7';
    }
    if (size === 5) {
      suffix = suffix.replace('maj7', 'maj9').replace('m7', 'm9').replace(/^7$/, '9');
    }
    return {
      suffix,
      romanCase: isMinor3 ? 'lower' : 'upper',
      role: suffix.includes('7') && !suffix.includes('maj') && !isMinor3 ? 'Dominante (Tensión)' : 'Diatónico',
    };
  };

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:space-between; margin-bottom:14px;">
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
        <label style="font-size:0.8rem;">Tónica:</label>
        <select class="js-dh-root">
          ${NOTE_LABELS.map((l, i) => `<option value="${i}" ${i === rootPc ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        <label style="font-size:0.8rem;">Escala a Armonizar:</label>
        <select class="js-dh-scale">
          ${scalesToHarmonize.map((s) => `<option value="${s.id}" ${s.id === scaleId ? 'selected' : ''}>${s.name}</option>`).join('')}
        </select>
        <label style="font-size:0.8rem;">Apilamiento:</label>
        <select class="js-dh-size">
          <option value="3">Tríadas (1–3–5)</option>
          <option value="4" selected>Cuatríadas (1–3–5–7)</option>
          <option value="5">Novenas (1–3–5–7–9)</option>
        </select>
        <label style="font-size:0.8rem;">Diagrama Mástil:</label>
        <select class="js-dh-neck">
          <option value="guitar" selected>🎸 Guitarra (6 Cuerdas)</option>
          <option value="bass">🎸 Bajo Eléctrico (4 Cuerdas)</option>
        </select>
      </div>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <button type="button" class="btn btn-primary js-dh-play-all">▶ Escuchar los 7 Grados (I → vii)</button>
        <button type="button" class="btn js-dh-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
      </div>
    </div>

    <div class="js-dh-degrees-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:8px; margin-bottom:14px;"></div>

    <div style="background:rgba(15,23,42,0.92); border:1px solid rgba(245,158,11,0.4); border-radius:10px; padding:12px;">
      <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
        <strong style="color:var(--accent-gold); font-size:0.9rem;">🔗 Constructor de Tu Propia Progresión (Haz clic en "+ Añadir" en cualquier grado arriba):</strong>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="btn btn-primary js-dh-play-chain" style="font-size:0.78rem;">▶ Reproducir Mi Progresión (+ Bajo)</button>
          <button type="button" class="btn js-dh-clear-chain" style="font-size:0.78rem; background:rgba(148,163,184,0.18); color:#cbd5e1;">🧹 Reiniciar Cadena</button>
        </div>
      </div>
      <div class="js-dh-chain-view" style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;"></div>
    </div>
  `;

  const rootSel = stage.querySelector<HTMLSelectElement>('.js-dh-root')!;
  const scaleSel = stage.querySelector<HTMLSelectElement>('.js-dh-scale')!;
  const sizeSel = stage.querySelector<HTMLSelectElement>('.js-dh-size')!;
  const neckSel = stage.querySelector<HTMLSelectElement>('.js-dh-neck')!;
  const gridEl = stage.querySelector<HTMLElement>('.js-dh-degrees-grid')!;
  const chainEl = stage.querySelector<HTMLElement>('.js-dh-chain-view')!;

  const computeDegreeChords = () => {
    const sc = scalesToHarmonize.find((s) => s.id === scaleId) || scalesToHarmonize[0];
    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const funcRoles = ['Tónica (Reposo)', 'Subdominante', 'Tónica / Puente', 'Subdominante', 'Dominante (Motor)', 'Tónica Relativa', 'Sensible (Tritono)'];
    return sc.intervals.map((degSemi, degIdx) => {
      const notesMidi: number[] = [];
      for (let t = 0; t < stackSize; t++) {
        const scalePos = (degIdx + t * 2) % 7;
        const octAdd = Math.floor((degIdx + t * 2) / 7) * 12;
        notesMidi.push(48 + rootPc + sc.intervals[scalePos] + octAdd);
      }
      const rootMidi = notesMidi[0];
      const thirdSemi = notesMidi[1] - rootMidi;
      const fifthSemi = notesMidi[2] - rootMidi;
      const seventhSemi = notesMidi[3] ? notesMidi[3] - rootMidi : 10;
      const qual = getChordQuality(thirdSemi, fifthSemi, seventhSemi, stackSize);
      const romanBase = qual.romanCase === 'lower' ? romans[degIdx].toLowerCase() : romans[degIdx];
      const chordRootName = NOTE_NAMES[rootMidi % 12];
      const notesNames = notesMidi.map((m) => NOTE_NAMES[m % 12]).join('–');
      return {
        degIdx,
        roman: `${romanBase}${qual.suffix.split(' ')[0]}`,
        chordName: `${chordRootName}${qual.suffix.split(' ')[0]}`,
        notesMidi,
        notesNames,
        role: funcRoles[degIdx],
      };
    });
  };

  const renderHarmonizer = () => {
    const chords = computeDegreeChords();
    gridEl.innerHTML = chords
      .map(
        (c) => `
      <div style="background:rgba(30,41,59,0.9); border:1px solid rgba(56,189,248,0.4); border-radius:8px; padding:10px; display:flex; flex-direction:column; justify-content:space-between; align-items:center; text-align:center; gap:6px;">
        <button type="button" class="js-dh-deg-play js-dh-play-deg" data-idx="${c.degIdx}" style="background:transparent; border:none; color:#f8fafc; cursor:pointer; text-align:center; padding:0; width:100%;">
          <div style="font-size:0.72rem; color:var(--accent-cyan); font-weight:700;">Grado ${c.degIdx + 1} · ${c.roman}</div>
          <div style="font-size:1.05rem; font-weight:800; color:var(--accent-gold); margin:2px 0;">${c.chordName}</div>
          <div style="font-size:0.72rem; color:#cbd5e1; font-family:monospace;">[${c.notesNames}]</div>
          ${renderMiniChordNeckSvg(c.notesMidi, c.notesMidi[0] - 12, neckMode)}
          <div style="font-size:0.68rem; color:#94a3b8; margin-top:4px;">${c.role}</div>
        </button>
        <button type="button" class="btn js-dh-deg-add" data-idx="${c.degIdx}" style="font-size:0.7rem; padding:3px 6px; width:100%; background:rgba(16,185,129,0.18); color:#34d399; border:1px solid rgba(16,185,129,0.4);">+ Añadir a Progresión</button>
      </div>
    `
      )
      .join('');

    if (customChain.length === 0) {
      chainEl.innerHTML = `<span style="font-size:0.8rem; color:var(--text-muted);">Tu cadena está vacía. Pulsa "+ Añadir a Progresión" en cualquier grado arriba.</span>`;
    } else {
      chainEl.innerHTML = customChain
        .map((dIdx, pos) => {
          const c = chords[dIdx] || chords[0];
          return `
            <button type="button" class="btn js-dh-chain-step" data-idx="${dIdx}" style="background:rgba(245,158,11,0.18); color:#fbbf24; border:1px solid rgba(245,158,11,0.45); font-size:0.8rem;">
              ${pos + 1}. <strong>${c.chordName}</strong> (${c.roman})
            </button>
          `;
        })
        .join('<span style="color:#64748b;">→</span>');
    }
  };

  renderHarmonizer();

  rootSel.addEventListener('change', () => {
    rootPc = parseInt(rootSel.value, 10);
    renderHarmonizer();
  });
  scaleSel.addEventListener('change', () => {
    scaleId = scaleSel.value;
    renderHarmonizer();
  });
  sizeSel.addEventListener('change', () => {
    stackSize = parseInt(sizeSel.value, 10);
    renderHarmonizer();
  });
  neckSel.addEventListener('change', () => {
    neckMode = (neckSel.value as 'guitar' | 'bass') || 'guitar';
    renderHarmonizer();
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const chords = computeDegreeChords();

    const playDeg = target.closest<HTMLElement>('.js-dh-deg-play, .js-dh-chain-step');
    if (playDeg) {
      const idx = parseInt(playDeg.getAttribute('data-idx')!, 10);
      const c = chords[idx];
      audio.stopAll();
      audio.playElectricBass(c.notesMidi[0] - 12, 1.3, 0, 0.35, 'finger', false, { skipGlow: true });
      audio.strumChord(c.notesMidi, neckMode === 'bass' ? 'guitar' : 'piano', 0, false);
      onStatus(`Grado ${idx + 1}: ${c.chordName} (${c.notesNames}) — ${c.role}`);
      return;
    }

    const addDeg = target.closest<HTMLElement>('.js-dh-deg-add');
    if (addDeg) {
      const idx = parseInt(addDeg.getAttribute('data-idx')!, 10);
      if (customChain.length >= 8) customChain.shift();
      customChain.push(idx);
      renderHarmonizer();
      const c = chords[idx];
      audio.stopAll();
      audio.strumChord(c.notesMidi, 'piano', 0, false);
      onStatus(`Añadido ${c.chordName} a tu progresión`);
      return;
    }

    if (target.closest('.js-dh-play-all')) {
      audio.stopAll();
      chords.forEach((c, i) => {
        audio.playElectricBass(c.notesMidi[0] - 12, 0.75, i * 0.72, 0.32, 'finger', false, { skipGlow: true });
        audio.strumChord(c.notesMidi, 'piano', i * 0.72, false);
      });
      onStatus(`Reproduciendo los 7 grados armonizados de ${NOTE_NAMES[rootPc]} (${scaleId})`);
    } else if (target.closest('.js-dh-play-chain')) {
      audio.stopAll();
      customChain.forEach((dIdx, i) => {
        const c = chords[dIdx] || chords[0];
        audio.playElectricBass(c.notesMidi[0] - 12, 0.9, i * 0.88, 0.36, 'finger', false, { skipGlow: true });
        audio.strumChord(c.notesMidi, 'piano', i * 0.88, false);
      });
      onStatus('Reproduciendo tu progresión personalizada con piano y bajo');
    } else if (target.closest('.js-dh-clear-chain')) {
      customChain = [];
      renderHarmonizer();
    } else if (target.closest('.js-dh-stop')) {
      audio.stopAll();
    }
  });
}

/**
 * Interactive Neo-Riemannian Tonnetz & P/L/R/Slide Explorer (`data-lab="neo-riemann"`)
 */
function buildNeoRiemannTonnetzLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  let treeSeedRoot = 0; // Root of the Neo-Riemannian tree (changeable!)
  let treeSeedMinor = false;
  let rootPc = 0; // Currently selected/sounding chord
  let isMinor = false;
  let neckMode: 'guitar' | 'bass' = 'guitar';
  let treeView: 'genealogy' | 'radial' = 'genealogy';
  let history: string[] = ['C (C–E–G)'];

  const getTriadMidis = (r: number, minor: boolean): number[] => {
    const base = 48 + r;
    return [base, base + (minor ? 3 : 4), base + 7];
  };

  const stepTransform = (
    r: number,
    minor: boolean,
    op: 'P' | 'L' | 'R' | 'S' | 'N'
  ): { root: number; minor: boolean } => {
    if (op === 'P') return { root: r, minor: !minor };
    if (op === 'L') return { root: (r + (minor ? 8 : 4)) % 12, minor: !minor };
    if (op === 'R') return { root: (r + (minor ? 3 : 9)) % 12, minor: !minor };
    if (op === 'S') return { root: (r + (minor ? 11 : 1)) % 12, minor: !minor };
    return { root: (r + (minor ? 7 : 5)) % 12, minor: !minor };
  };

  const triadLabel = (r: number, minor: boolean): string =>
    `${NOTE_NAMES[r]}${minor ? 'm' : ''}`;

  const triadKey = (r: number, minor: boolean): string => `${r}-${minor ? 'm' : 'M'}`;

  const applyTransform = (op: 'P' | 'L' | 'R' | 'S' | 'N') => {
    const next = stepTransform(rootPc, isMinor, op);
    rootPc = next.root;
    isMinor = next.minor;
    const midis = getTriadMidis(rootPc, isMinor);
    const notesStr = midis.map((m) => NOTE_NAMES[m % 12]).join('–');
    const name = `${triadLabel(rootPc, isMinor)} (${notesStr})`;
    history.push(`[${op}] → ${name}`);
    if (history.length > 7) history.shift();

    audio.stopAll();
    audio.playElectricBass(36 + rootPc, 1.4, 0, 0.36, 'finger', false, { skipGlow: true });
    audio.strumChord([...midis, midis[0] + 12], 'piano', 0, false);
    render();
    onStatus(`Transformación ${op}: ${name}`);
  };

  const renderGenealogyTreeSvg = (): string => {
    const w = 780;
    const h = 370;
    const visited = new Set<string>();
    const seedKey = triadKey(treeSeedRoot, treeSeedMinor);
    visited.add(seedKey);

    interface TNode {
      root: number;
      minor: boolean;
      op: string;
      x: number;
      y: number;
      r: number;
      repeated: boolean;
      children: TNode[];
    }

    const rootNode: TNode = {
      root: treeSeedRoot,
      minor: treeSeedMinor,
      op: 'Raíz',
      x: w / 2,
      y: 34,
      r: 18,
      repeated: false,
      children: [],
    };

    const ops1: ('P' | 'R' | 'L')[] = ['P', 'R', 'L'];
    const gen1Xs = [w * 0.175, w * 0.5, w * 0.825];
    ops1.forEach((op1, i1) => {
      const c1 = stepTransform(rootNode.root, rootNode.minor, op1);
      const k1 = triadKey(c1.root, c1.minor);
      const rep1 = visited.has(k1);
      visited.add(k1);
      const n1: TNode = {
        root: c1.root,
        minor: c1.minor,
        op: op1,
        x: gen1Xs[i1],
        y: 112,
        r: 16,
        repeated: rep1,
        children: [],
      };
      rootNode.children.push(n1);

      // Gen 2: 3 children per Gen 1 node (P, R, L)
      const spread2 = 76;
      ops1.forEach((op2, i2) => {
        const c2 = stepTransform(n1.root, n1.minor, op2);
        const k2 = triadKey(c2.root, c2.minor);
        const rep2 = visited.has(k2);
        visited.add(k2);
        const n2: TNode = {
          root: c2.root,
          minor: c2.minor,
          op: op2,
          x: n1.x + (i2 - 1) * spread2,
          y: 202,
          r: 14.5,
          repeated: rep2,
          children: [],
        };
        n1.children.push(n2);

        // Gen 3: only expand if not already repeated (just like Image 7!)
        if (!rep2) {
          const spread3 = 26;
          ops1.forEach((op3, i3) => {
            const c3 = stepTransform(n2.root, n2.minor, op3);
            const k3 = triadKey(c3.root, c3.minor);
            const rep3 = visited.has(k3);
            visited.add(k3);
            n2.children.push({
              root: c3.root,
              minor: c3.minor,
              op: op3,
              x: n2.x + (i3 - 1) * spread3,
              y: 298,
              r: 11.5,
              repeated: rep3,
              children: [],
            });
          });
        }
      });
    });

    const edges: string[] = [];
    const nodes: string[] = [];
    const walk = (n: TNode) => {
      n.children.forEach((ch) => {
        edges.push(`<line x1="${n.x}" y1="${n.y}" x2="${ch.x}" y2="${ch.y}" stroke="${ch.repeated ? '#22c55e' : '#64748b'}" stroke-width="${ch.repeated ? 1.2 : 1.5}" opacity="0.8"/>`);
        if (n.y < 140) {
          const mx = (n.x + ch.x) / 2;
          const my = (n.y + ch.y) / 2 - 4;
          edges.push(`<text x="${mx}" y="${my}" text-anchor="middle" fill="#fbbf24" font-size="9" font-weight="800">${ch.op}</text>`);
        }
        walk(ch);
      });
      const isSelected = n.root === rootPc && n.minor === isMinor;
      const strokeCol = isSelected ? '#fbbf24' : n.repeated ? '#22c55e' : n.minor ? '#38bdf8' : '#f472b6';
      const fillCol = isSelected ? 'rgba(245,158,11,0.28)' : n.repeated ? 'rgba(34,197,94,0.12)' : '#090d16';
      const label = triadLabel(n.root, n.minor);
      nodes.push(`
        <g class="js-nr-tree-node" data-root="${n.root}" data-minor="${n.minor ? '1' : '0'}" data-op="${n.op}" style="cursor:pointer;">
          <circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${fillCol}" stroke="${strokeCol}" stroke-width="${isSelected ? 2.6 : 1.7}"/>
          <text x="${n.x}" y="${n.y + 3.5}" text-anchor="middle" fill="${isSelected ? '#fef08a' : strokeCol}" font-size="${n.r < 13 ? 8.2 : 10.5}" font-weight="900">${label}</text>
        </g>
      `);
    };
    walk(rootNode);

    return `
      <svg viewBox="0 0 ${w} ${h}" style="width:100%; max-width:800px; height:auto; background:rgba(7,10,18,0.86); border:1px solid rgba(56,189,248,0.28); border-radius:10px; user-select:none;">
        ${edges.join('')}
        ${nodes.join('')}
        <text x="${w / 2}" y="${h - 14}" text-anchor="middle" fill="#4ade80" font-size="11" font-weight="700">
          Los nodos verdes ya aparecieron arriba (por eso no necesitan descendencia) · Rosa = Mayor · Azul = Menor · Clic en cualquier nodo para sonar
        </text>
      </svg>
    `;
  };

  const renderRadialFractalTreeSvg = (): string => {
    const size = 660;
    const cx = size / 2;
    const cy = size / 2;
    const edges: string[] = [];
    const nodes: string[] = [];

    const ops: ('P' | 'R' | 'L')[] = ['P', 'R', 'L'];
    const pushNode = (x: number, y: number, r: number, root: number, minor: boolean, op: string, circleR: number) => {
      const isSel = root === rootPc && minor === isMinor;
      const col = isSel ? '#fbbf24' : minor ? '#38bdf8' : '#f472b6';
      const label = triadLabel(root, minor);
      nodes.push(`
        <g class="js-nr-tree-node" data-root="${root}" data-minor="${minor ? '1' : '0'}" data-op="${op}" style="cursor:pointer;">
          <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${circleR}" fill="${isSel ? 'rgba(245,158,11,0.3)' : '#090d16'}" stroke="${col}" stroke-width="${isSel ? 2.8 : 1.6}"/>
          <text x="${x.toFixed(1)}" y="${(y + 3.4).toFixed(1)}" text-anchor="middle" fill="${isSel ? '#fef08a' : col}" font-size="${circleR < 13 ? 8.2 : 10.2}" font-weight="900">${label}</text>
        </g>
      `);
    };

    // Center node
    pushNode(cx, cy, 0, treeSeedRoot, treeSeedMinor, 'Centro', 18);

    // 3 primary branches separated by 120 deg (-90 = P up, +150 = R down-left, +30 = L down-right)
    const baseAngles = [-90, 150, 30];
    baseAngles.forEach((deg1, bIdx) => {
      const op1 = ops[bIdx];
      const n1 = stepTransform(treeSeedRoot, treeSeedMinor, op1);
      const a1 = (deg1 * Math.PI) / 180;
      const x1 = cx + 74 * Math.cos(a1);
      const y1 = cy + 74 * Math.sin(a1);
      edges.push(`<line x1="${cx}" y1="${cy}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="#94a3b8" stroke-width="1.6"/>`);
      pushNode(x1, y1, 74, n1.root, n1.minor, op1, 15);

      // 3 branches out from Gen 1 (center backward-inner leaf + 2 outer branches at ±38 deg)
      const subAngles2 = [deg1 - 42, deg1 + 42, deg1 + 180];
      const subDists2 = [76, 76, 36];
      const subOps2 = ops.filter((_, idx) => idx !== 0);
      [subOps2[0], subOps2[1], op1].forEach((op2, i2) => {
        const n2 = stepTransform(n1.root, n1.minor, op2);
        const a2 = (subAngles2[i2] * Math.PI) / 180;
        const x2 = x1 + subDists2[i2] * Math.cos(a2);
        const y2 = y1 + subDists2[i2] * Math.sin(a2);
        edges.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#64748b" stroke-width="1.3"/>`);
        pushNode(x2, y2, 150, n2.root, n2.minor, op2, i2 === 2 ? 11.5 : 14);

        if (i2 < 2) {
          // 3 outward branches to Gen 3 (just like Image 8)
          const subAngles3 = [subAngles2[i2] - 26, subAngles2[i2] + 26, subAngles2[i2] + 150];
          const subDists3 = [72, 72, 34];
          ops.forEach((op3, i3) => {
            const n3 = stepTransform(n2.root, n2.minor, op3);
            const a3 = (subAngles3[i3] * Math.PI) / 180;
            const x3 = x2 + subDists3[i3] * Math.cos(a3);
            const y3 = y2 + subDists3[i3] * Math.sin(a3);
            edges.push(`<line x1="${x2.toFixed(1)}" y1="${y2.toFixed(1)}" x2="${x3.toFixed(1)}" y2="${y3.toFixed(1)}" stroke="#475569" stroke-width="1.1"/>`);
            pushNode(x3, y3, 220, n3.root, n3.minor, op3, i3 === 2 ? 10.5 : 12.5);

            if (i3 < 2) {
              // Gen 4 outer tips
              const tipOffsets = [-16, 0, 16];
              ops.forEach((op4, i4) => {
                const n4 = stepTransform(n3.root, n3.minor, op4);
                const a4 = ((subAngles3[i3] + tipOffsets[i4]) * Math.PI) / 180;
                const x4 = x3 + 56 * Math.cos(a4);
                const y4 = y3 + 56 * Math.sin(a4);
                edges.push(`<line x1="${x3.toFixed(1)}" y1="${y3.toFixed(1)}" x2="${x4.toFixed(1)}" y2="${y4.toFixed(1)}" stroke="#334155" stroke-width="1"/>`);
                pushNode(x4, y4, 290, n4.root, n4.minor, op4, 11);
              });
            }
          });
        }
      });
    });

    return `
      <svg viewBox="0 0 ${size} ${size}" style="width:100%; max-width:650px; height:auto; background:rgba(7,10,18,0.88); border:1px solid rgba(244,114,182,0.32); border-radius:12px; user-select:none;">
        ${edges.join('')}
        ${nodes.join('')}
      </svg>
    `;
  };

  const render = () => {
    const midis = getTriadMidis(rootPc, isMinor);
    const notesStr = midis.map((m) => NOTE_NAMES[m % 12]).join(' – ');
    const currentName = `${NOTE_NAMES[rootPc]}${isMinor ? ' Menor' : ' Mayor'}`;

    const pNext = stepTransform(rootPc, isMinor, 'P');
    const lNext = stepTransform(rootPc, isMinor, 'L');
    const rNext = stepTransform(rootPc, isMinor, 'R');
    const sNext = stepTransform(rootPc, isMinor, 'S');

    stage.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px;">
          <label style="font-size:0.8rem; font-weight:700; color:var(--accent-gold);">Raíz del Árbol:</label>
          <select class="js-nr-seed-root">
            ${NOTE_LABELS.map((l, i) => `<option value="${i}" ${i === treeSeedRoot ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
          <select class="js-nr-seed-qual">
            <option value="0" ${!treeSeedMinor ? 'selected' : ''}>Mayor (1–3–5)</option>
            <option value="1" ${treeSeedMinor ? 'selected' : ''}>Menor (1–♭3–5)</option>
          </select>
          <button type="button" class="btn js-nr-tree-view" data-view="genealogy" style="font-size:0.76rem; padding:4px 10px; background:${treeView === 'genealogy' ? 'rgba(56,189,248,0.24)' : 'rgba(30,41,59,0.9)'}; color:${treeView === 'genealogy' ? '#38bdf8' : '#cbd5e1'}; border:1px solid ${treeView === 'genealogy' ? '#38bdf8' : '#334155'};">🌳 Árbol Genealógico P/L/R</button>
          <button type="button" class="btn js-nr-tree-view" data-view="radial" style="font-size:0.76rem; padding:4px 10px; background:${treeView === 'radial' ? 'rgba(244,114,182,0.24)' : 'rgba(30,41,59,0.9)'}; color:${treeView === 'radial' ? '#f472b6' : '#cbd5e1'}; border:1px solid ${treeView === 'radial' ? '#ec4899' : '#334155'};">❄️ Árbol Radial Fractal</button>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="btn js-nr-neck" data-mode="guitar" style="font-size:0.75rem; background:${neckMode === 'guitar' ? 'rgba(245,158,11,0.22)' : 'rgba(30,41,59,0.9)'}; color:${neckMode === 'guitar' ? '#fbbf24' : '#94a3b8'}; border:1px solid ${neckMode === 'guitar' ? '#f59e0b' : '#334155'};">🎸 Guitarra (6c)</button>
          <button type="button" class="btn js-nr-neck" data-mode="bass" style="font-size:0.75rem; background:${neckMode === 'bass' ? 'rgba(56,189,248,0.22)' : 'rgba(30,41,59,0.9)'}; color:${neckMode === 'bass' ? '#38bdf8' : '#94a3b8'}; border:1px solid ${neckMode === 'bass' ? '#38bdf8' : '#334155'};">🎸 Bajo (4c)</button>
          <button type="button" class="btn js-nr-reset" style="background:rgba(56,189,248,0.16); color:#38bdf8;">🔄 Centro</button>
          <button type="button" class="btn btn-primary js-nr-cinema">🎬 Ciclo Imperial (C → Abm → Em → C)</button>
        </div>
      </div>

      <div style="display:flex; justify-content:center; margin-bottom:14px;">
        ${treeView === 'radial' ? renderRadialFractalTreeSvg() : renderGenealogyTreeSvg()}
      </div>

      <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px; background:rgba(15,23,42,0.85); border:1px solid rgba(245,158,11,0.3); border-radius:10px; padding:12px;">
        <div>
          <span style="font-size:0.78rem; color:var(--accent-cyan);">Acorde Sonando / Seleccionado:</span>
          <div style="font-size:1.35rem; font-weight:900; color:var(--accent-gold);">${currentName} <span style="font-size:0.95rem; color:#f8fafc; font-family:monospace;">[${notesStr}]</span></div>
          <div style="font-size:0.78rem; color:#cbd5e1; margin-top:4px;"><strong>🧭 Ruta:</strong> ${history.join(' ')}</div>
        </div>
        ${renderMiniChordNeckSvg(midis, 36 + rootPc, neckMode)}
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(175px, 1fr)); gap:10px;">
        <button type="button" class="js-nr-op" data-op="P" style="background:rgba(30,41,59,0.92); border:1px solid #f59e0b; border-radius:8px; padding:10px; text-align:left; color:#f8fafc; cursor:pointer;">
          <div style="font-weight:800; color:#fbbf24; font-size:0.92rem;">P · Paralelo → ${triadLabel(pNext.root, pNext.minor)}</div>
          <div style="font-size:0.74rem; color:#cbd5e1; margin-top:3px;">Conserva 1ª y 5ª; mueve la 3ª un semitono.</div>
        </button>
        <button type="button" class="js-nr-op" data-op="L" style="background:rgba(30,41,59,0.92); border:1px solid #38bdf8; border-radius:8px; padding:10px; text-align:left; color:#f8fafc; cursor:pointer;">
          <div style="font-weight:800; color:#38bdf8; font-size:0.92rem;">L · Leading-Tone → ${triadLabel(lNext.root, lNext.minor)}</div>
          <div style="font-size:0.74rem; color:#cbd5e1; margin-top:3px;">Conserva la 3ª menor; mueve la otra nota 1 semitono.</div>
        </button>
        <button type="button" class="js-nr-op" data-op="R" style="background:rgba(30,41,59,0.92); border:1px solid #10b981; border-radius:8px; padding:10px; text-align:left; color:#f8fafc; cursor:pointer;">
          <div style="font-weight:800; color:#34d399; font-size:0.92rem;">R · Relativo → ${triadLabel(rNext.root, rNext.minor)}</div>
          <div style="font-size:0.74rem; color:#cbd5e1; margin-top:3px;">Conserva la 3ª mayor; mueve la otra nota 1 tono.</div>
        </button>
        <button type="button" class="js-nr-op" data-op="S" style="background:rgba(30,41,59,0.92); border:1px solid #a855f7; border-radius:8px; padding:10px; text-align:left; color:#f8fafc; cursor:pointer;">
          <div style="font-weight:800; color:#c084fc; font-size:0.92rem;">Slide → ${triadLabel(sNext.root, sNext.minor)}</div>
          <div style="font-size:0.74rem; color:#cbd5e1; margin-top:3px;">Mantiene fija la 3ª y desliza 1ª y 5ª medio tono.</div>
        </button>
      </div>
    `;
  };

  render();

  stage.addEventListener('change', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('js-nr-seed-root') || target.classList.contains('js-nr-seed-qual')) {
      const rSel = stage.querySelector<HTMLSelectElement>('.js-nr-seed-root')!;
      const qSel = stage.querySelector<HTMLSelectElement>('.js-nr-seed-qual')!;
      treeSeedRoot = parseInt(rSel.value, 10);
      treeSeedMinor = qSel.value === '1';
      rootPc = treeSeedRoot;
      isMinor = treeSeedMinor;
      const midis = getTriadMidis(rootPc, isMinor);
      history = [`${triadLabel(rootPc, isMinor)} (${midis.map((m) => NOTE_NAMES[m % 12]).join('–')})`];
      audio.stopAll();
      audio.playElectricBass(36 + rootPc, 1.3, 0, 0.36, 'finger', false, { skipGlow: true });
      audio.strumChord([...midis, midis[0] + 12], 'piano', 0, false);
      render();
      onStatus(`Árbol Neo-Riemanniano centrado en ${triadLabel(rootPc, isMinor)}`);
    }
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const viewBtn = target.closest<HTMLElement>('.js-nr-tree-view');
    if (viewBtn) {
      treeView = (viewBtn.getAttribute('data-view') as 'genealogy' | 'radial') || 'genealogy';
      render();
      return;
    }
    const treeNode = target.closest<HTMLElement>('.js-nr-tree-node');
    if (treeNode) {
      rootPc = parseInt(treeNode.getAttribute('data-root')!, 10);
      isMinor = treeNode.getAttribute('data-minor') === '1';
      const op = treeNode.getAttribute('data-op') || '';
      const midis = getTriadMidis(rootPc, isMinor);
      const notesStr = midis.map((m) => NOTE_NAMES[m % 12]).join('–');
      history.push(`[${op}] → ${triadLabel(rootPc, isMinor)}`);
      if (history.length > 7) history.shift();
      audio.stopAll();
      audio.playElectricBass(36 + rootPc, 1.35, 0, 0.36, 'finger', false, { skipGlow: true });
      audio.strumChord([...midis, midis[0] + 12], 'piano', 0, false);
      render();
      onStatus(`Nodo del Árbol (${op}): ${triadLabel(rootPc, isMinor)} (${notesStr})`);
      return;
    }
    const neckBtn = target.closest<HTMLElement>('.js-nr-neck');
    if (neckBtn) {
      neckMode = (neckBtn.getAttribute('data-mode') as 'guitar' | 'bass') || 'guitar';
      render();
      onStatus(`Tonnetz: Diagrama cambiado a ${neckMode === 'bass' ? 'Bajo Eléctrico (4 Cuerdas)' : 'Guitarra (6 Cuerdas)'}`);
      return;
    }
    const opBtn = target.closest<HTMLElement>('.js-nr-op');
    if (opBtn) {
      const op = opBtn.getAttribute('data-op') as 'P' | 'L' | 'R' | 'S';
      applyTransform(op);
      return;
    }
    if (target.closest('.js-nr-reset')) {
      rootPc = treeSeedRoot;
      isMinor = treeSeedMinor;
      const midis = getTriadMidis(rootPc, isMinor);
      history = [`${triadLabel(rootPc, isMinor)} (${midis.map((m) => NOTE_NAMES[m % 12]).join('–')})`];
      audio.stopAll();
      audio.strumChord([...midis, midis[0] + 12], 'piano', 0, false);
      render();
      onStatus(`Árbol reiniciado en ${triadLabel(rootPc, isMinor)}`);
    } else if (target.closest('.js-nr-cinema')) {
      audio.stopAll();
      const base = 48 + treeSeedRoot;
      const seq = [
        [base, base + 4, base + 7, base + 12],
        [base - 4, base + 3, base + 8, base + 11],
        [base - 8, base + 4, base + 7, base + 11],
        [base, base + 4, base + 7, base + 12],
      ];
      seq.forEach((ch, idx) => audio.strumChord(ch, 'piano', idx * 0.9, false));
      onStatus(`Reproduciendo Ciclo Hexatónico Cinematográfico desde ${NOTE_NAMES[treeSeedRoot]}`);
    }
  });
}

/**
 * SPECIALIZED LAB 7: Melody Reharmonizer (1 Fixed Melody Note E4 = 329.6 Hz over 6 Different Chords)
 * Ensures the top melody note E4 (MIDI 64) is ALWAYS the crystal-clear top note of every chord voicing!
 */
function buildHarmonizerWidget(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const options = [
    {
      name: '1) C Mayor (Nota E4 = 3ª Mayor en el Tope)',
      chord: [48, 55, 60, 64], // C3 - G3 - C4 - E4 (E4 is the exact top note!)
      bass: 36, // C2
      mel: 64,
      role: 'Luminoso, estable y hogareño (E4 actúa como 3ª Mayor consonante).',
    },
    {
      name: '2) Am9 (Nota E4 = 5ª Justa en el Tope)',
      chord: [45, 55, 59, 60, 64], // A2 - G3 - B3 - C4 - E4
      bass: 33, // A1
      mel: 64,
      role: 'Melancólico, reflexivo y profundo (E4 actúa como 5ª Justa de La menor).',
    },
    {
      name: '3) Fmaj7 (Nota E4 = 7ª Mayor en el Tope)',
      chord: [41, 53, 57, 60, 64], // F2 - F3 - A3 - C4 - E4
      bass: 29, // F1
      mel: 64,
      role: 'Nostálgico, flotante y cinematográfico (E4 es la 7ª Mayor de Fa).',
    },
    {
      name: '4) Dm9 (Nota E4 = 9ª Mayor en el Tope)',
      chord: [50, 53, 57, 60, 64], // D3 - F3 - A3 - C4 - E4
      bass: 38, // D2
      mel: 64,
      role: 'Sofisticado, urbano, neo-soul / jazz (E4 es la 9ª de Re menor).',
    },
    {
      name: '5) Bbmaj7(#11) (Nota E4 = #11 Lidia en el Tope)',
      chord: [46, 53, 57, 62, 64], // Bb2 - F3 - A3 - D4 - E4
      bass: 34, // Bb1
      mel: 64,
      role: 'Maravilla espacial y sorpresa luminosa (E4 es la #11 Lidia sobre Sib).',
    },
    {
      name: '6) C#m7 (Nota E4 = ♭3 Menor Dramática en el Tope)',
      chord: [49, 56, 59, 64], // C#3 - G#3 - B3 - E4
      bass: 37, // C#2
      mel: 64,
      role: 'Giro dramático e inesperado (el mismo Mi4 se resignifica como ♭3 de Do# menor).',
    },
  ];

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px;">
      <p style="font-size:0.84rem; color:var(--text-muted); margin:0;">
        <strong>Efecto Kuleshov Armónico:</strong> La nota más aguda de los 6 botones es <strong>SIEMPRE E4 (Mi4 = 329.6 Hz, sin ninguna nota por encima)</strong>. Escucha primero la nota E4 sola y luego haz clic en cada acorde para oír cómo cambia de emoción según el bajo que la sostiene:
      </p>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <button type="button" class="btn js-reharm-e4-only" style="background:rgba(16,185,129,0.18); color:#34d399; border:1px solid rgba(16,185,129,0.4); font-size:0.78rem;">🔊 Escuchar Solo la Nota Fija E4 (329.6 Hz)</button>
        <button type="button" class="btn btn-primary js-reharm-play-all" style="font-size:0.78rem;">▶ Comparar los 6 Colores en Secuencia</button>
      </div>
    </div>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:10px;">
      ${options
        .map(
          (o, idx) => `
        <button type="button" class="js-reharm-card" data-idx="${idx}" style="background:rgba(15,23,42,0.9); border:1px solid rgba(56,189,248,0.4); border-radius:8px; padding:12px; text-align:left; cursor:pointer; color:#f8fafc;">
          <div style="font-weight:800; color:var(--accent-gold); font-size:0.88rem; margin-bottom:4px;">${o.name}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${o.role}</div>
        </button>
      `
        )
        .join('')}
    </div>
  `;

  const playOneReharm = (idx: number, delay = 0) => {
    const o = options[idx];
    audio.playElectricBass(o.bass, 1.5, delay, 0.36, 'finger', false, { skipGlow: true });
    if (delay <= 0.005) {
      audio.emitChordHighlight(o.chord);
    } else {
      audio.schedule(() => audio.emitChordHighlight(o.chord), delay * 1000);
    }
    // Play all chord voices synchronously in the same piano timbre so E4 shines cleanly on top
    o.chord.forEach((m) => {
      const isTopE4 = m === 64;
      audio.playAcousticPiano(m, isTopE4 ? 1.8 : 1.4, delay, isTopE4 ? 0.32 : 0.18, false, {
        isChord: true,
        skipGlow: true,
      });
    });
  };

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('.js-reharm-e4-only')) {
      audio.stopAll();
      audio.playAcousticPiano(64, 1.6, 0, 0.34, false);
      onStatus('Nota testigo pura: E4 (Mi4 = 329.6 Hz)');
      return;
    }
    if (target.closest('.js-reharm-play-all')) {
      audio.stopAll();
      options.forEach((_o, i) => playOneReharm(i, i * 1.15));
      onStatus('Comparando los 6 acordes bajo la misma nota melódica fija E4');
      return;
    }
    const card = target.closest<HTMLElement>('.js-reharm-card');
    if (!card) return;
    const idx = parseInt(card.getAttribute('data-idx')!, 10);
    const o = options[idx];
    audio.stopAll();
    playOneReharm(idx, 0);
    onStatus(`Rearmonización con E4 fija en el tope: ${o.name}`);
  });
}

/**
 * Hydrates each legacy <!--USAR:...--> marker according to its musical role
 */
function buildUsarWidget(
  host: HTMLElement,
  usarType: string,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  if (usarType === 'bajo-lab-legacy') {
    buildDedicatedBassLab(host, audio, onStatus, 'geometry');
  } else if (usarType === 'bajo-compositor-legacy') {
    buildDedicatedBassLab(host, audio, onStatus, 'reharmonize');
  } else if (usarType === 'canto-legacy') {
    buildVocalAndWarmupLab(host, audio, onStatus, 'harmony');
  } else if (usarType === 'bateria-pads') {
    buildDrumRudimentAndPadsLab(host, audio, onStatus);
  } else if (usarType === 'secuenciador-legacy' || usarType === 'bateria-avanzada-legacy') {
    buildSequencerWidget(
      host,
      audio,
      onStatus,
      usarType === 'bateria-avanzada-legacy'
        ? 'Secuenciador de Grooves Avanzados (Ghost Notes, Polirritmia y Desplazamiento)'
        : 'Secuenciador Rítmico de 16 Pasos (Bombo, Caja, Ghost Notes y Hi-Hat)'
    );
  } else if (usarType === 'cof-legacy') {
    buildCircleOfFifthsWidget(host, audio, onStatus);
  } else if (usarType === 'rearmonizacion-legacy') {
    buildHarmonizerWidget(host, audio, onStatus);
  } else if (
    usarType === 'prog-arquetipos' ||
    usarType === 'prog-legacy' ||
    usarType === 'prog-intercambio' ||
    usarType === 'mod-botones'
  ) {
    const configMap: Record<string, { title: string; context: string }> = {
      'prog-arquetipos': {
        title: 'Explorador de Arquetipos Armónicos y Ciclos Diatónicos (+ Bajo 4 Cuerdas)',
        context: 'archetypes',
      },
      'prog-legacy': {
        title: 'Constructor de Progresiones y Cadencias Funcionales (Auténtica, Plagal, Rota y Frigia)',
        context: 'cadences',
      },
      'prog-intercambio': {
        title: 'Comparador de Intercambio Modal, Backdoor 2-5-1 y Dominantes Secundarios',
        context: 'interchange',
      },
      'mod-botones': {
        title: 'Simulador de Modulaciones (Pivote, Directa +1 Semitono, Enarmónica °7 y Nota Común)',
        context: 'mod-pivot',
      },
    };
    const cfg = configMap[usarType] || configMap['prog-arquetipos'];
    buildProgressionWidget(host, audio, onStatus, cfg.title, cfg.context);
  } else if (usarType === 'quena-lab' || usarType === 'quena-demos') {
    host.innerHTML = `
      <div class="widget-header">
        <div>
          <strong style="color:var(--accent-gold); font-size:1.1rem;">Sintetizador de Quena Andina en Sol Mayor / Mi Menor (G4 – D6)</strong>
          <p style="font-size:0.82rem; color:var(--text-muted); margin:0;">Haz clic en las notas de la quena tradicional de 7 orificios para escuchar su timbre de viento con vibrato.</p>
        </div>
        <div class="widget-controls">
          <button type="button" class="btn btn-primary js-quena-melody">▶ Escuchar Melodía Andina Pentatónica (Em)</button>
          <button type="button" class="btn js-quena-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
        </div>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        ${[
          { n: 'G4 (Todo tapado)', m: 67 },
          { n: 'A4 (1 destapado)', m: 69 },
          { n: 'B4 (2 destapados)', m: 71 },
          { n: 'C5 (3 destapados)', m: 72 },
          { n: 'D5 (4 destapados)', m: 74 },
          { n: 'E5 (5 destapados - Tónica Em)', m: 76 },
          { n: 'F#5 (6 destapados)', m: 78 },
          { n: 'G5 (Octava abierta)', m: 79 },
          { n: 'A5 (2ª Octava)', m: 81 },
          { n: 'B5 (2ª Octava)', m: 83 },
        ]
          .map(
            (q) =>
              `<button type="button" class="btn js-quena-note" data-midi="${q.m}" style="background:rgba(16,185,129,0.16); color:#34d399; border:1px solid rgba(16,185,129,0.4);">🪈 ${q.n}</button>`
          )
          .join('')}
      </div>
    `;
    host.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest<HTMLElement>('.js-quena-note');
      if (btn) {
        const midi = parseInt(btn.getAttribute('data-midi')!, 10);
        audio.playQuenaFlute(midi, 1.15, 0, 0.28, true);
        onStatus(`Quena Andina: Nota MIDI ${midi}`);
      } else if (target.closest('.js-quena-melody')) {
        audio.stopAll();
        const phrase = [76, 79, 81, 79, 76, 74, 71, 74, 76];
        phrase.forEach((m, i) => audio.playQuenaFlute(m, 0.52, i * 0.42, 0.28, false));
        onStatus('Reproduciendo frase pentatónica andina en Quena (Mi menor)');
      } else if (target.closest('.js-quena-stop')) {
        audio.stopAll();
      }
    });
  } else if (usarType === 'constructor-acordes') {
    buildMultiInstrumentExplorer(host, audio, onStatus, {
      title: 'Constructor y Diccionario Interactivo de Acordes (Tríadas, Séptimas y Tensiones)',
      mode: 'chord',
    });
  } else {
    buildMultiInstrumentExplorer(host, audio, onStatus, {
      title: `Visualizador y Sintetizador Multinstrumento (${usarType.replace(/-/g, ' ').toUpperCase()})`,
      defaultRoot: usarType.includes('guitarra') ? 4 : 0,
      defaultScale: usarType.includes('guitarra') ? 'pent_minor' : 'major',
      mode: usarType.includes('voces') || usarType.includes('caged') || usarType.includes('cirugia') ? 'chord' : 'scale',
    });
  }
}

/**
 * Hydrates <article class="interactive-widget" data-lab="..."> stages with specialized laboratories
 */
function buildDataLabStage(
  stage: HTMLElement,
  labType: string,
  article: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const isBassInstrument =
    article.getAttribute('data-instrument') === 'bass' ||
    !!article.closest('section[data-cat="bajo"]');

  if (buildStudioDataLabStage(stage, labType, article, audio, onStatus)) {
    return;
  }

  if (labType === 'harmonics-lab') {
    buildHarmonicsOscilloscopeLab(stage, audio, onStatus);
  } else if (labType === 'interval-9th-visualizer') {
    buildInterval9thVisualizerLab(stage, audio, onStatus);
  } else if (labType === 'polychord-visualizer') {
    buildPolychordVisualizerLab(stage, audio, onStatus);
  } else if (labType === 'neighbor-chords-visualizer') {
    buildNeighborChordsVisualizerLab(stage, audio, onStatus);
  } else if (labType === 'fretboard-triads-visualizer') {
    buildFretboardTriadsVisualizerLab(stage, audio, onStatus);
  } else if (labType === 'modes-network-14') {
    buildModes14NetworkLab(stage, audio, onStatus);
  } else if (labType === 'tension-pyramid-visualizer') {
    buildTensionPyramidLab(stage, audio, onStatus);
  } else if (isBassInstrument || labType === 'bass-line-lab' || labType === 'bass-gym-lab') {
    buildDedicatedBassLab(
      stage,
      audio,
      onStatus,
      labType === 'bass-line-lab' ? 'lines' : labType === 'bass-gym-lab' ? 'gym' : 'geometry'
    );
  } else if (labType === 'vocal-pitch-detector') {
    buildVocalPitchDetectorLab(stage, audio, onStatus);
  } else if (labType === 'reverse-chord-finder') {
    buildReverseChordFinderLab(stage, audio, onStatus);
  } else if (labType === 'quena-visual-lab') {
    buildQuenaVisualLab(stage, audio, onStatus);
  } else if (labType === 'zampona-lab') {
    buildZamponaLab(stage, audio, onStatus);
  } else if (labType === 'charango-lab') {
    buildCharangoLab(stage, audio, onStatus);
  } else if (labType === 'folklore-rhythm-lab') {
    buildFolkloreRhythmLab(stage, audio, onStatus);
  } else if (labType === 'drum-independence-lab') {
    buildDrumIndependenceLab(stage, audio, onStatus);
  } else if (labType === 'bass-articulation-lab') {
    buildBassArticulationLab(stage, audio, onStatus);
  } else if (labType === 'guitar-bending-lab') {
    buildGuitarBendingLab(stage, audio, onStatus);
  } else if (labType === 'voice-lab' || labType === 'vocal-warmup-lab') {
    const modeAttr = article.getAttribute('data-mode');
    buildVocalAndWarmupLab(
      stage,
      audio,
      onStatus,
      labType === 'vocal-warmup-lab' ? 'warmup' : modeAttr === 'harmony' ? 'harmony' : 'range'
    );
  } else if (labType === 'drum-rudiment-lab') {
    buildDrumRudimentAndPadsLab(stage, audio, onStatus);
  } else if (labType === 'polyrhythm-lab') {
    buildPolyrhythmLab(stage, audio, onStatus);
  } else if (labType === 'rhythm-lab') {
    buildSequencerWidget(stage, audio, onStatus);
  } else if (labType === 'reading-lab' || labType === 'ear-lab') {
    buildEarAndReadingTrainerLab(stage, audio, onStatus, labType === 'reading-lab');
  } else if (labType === 'harmonizer') {
    buildDiatonicScaleHarmonizerLab(stage, audio, onStatus);
  } else if (labType === 'neo-riemann') {
    buildNeoRiemannTonnetzLab(stage, audio, onStatus);
  } else if (
    labType === 'progression-lab' ||
    labType === 'voice-leading' ||
    labType === 'form-lab' ||
    labType === 'arrangement-lab'
  ) {
    const presetAttr = article.getAttribute('data-preset') || '';
    let contextKey = 'archetypes';
    let labTitle = 'Laboratorio de Progresiones y Conducción de Voces';

    if (presetAttr === 'cadences') {
      contextKey = 'cadences';
      labTitle = 'Comparador Interactivo de Cadencias (Auténtica, Plagal Menor, Rota y Semicadencia Frigia)';
    } else if (presetAttr === 'ii-v-i-major') {
      contextKey = 'ii-v-i-major';
      labTitle = 'Analizador de ii–V–I Mayor/Menor y "La Escalera que Baja" (+ Walking Bass)';
    } else if (presetAttr === 'sec-dom') {
      contextKey = 'sec-dom';
      labTitle = 'Laboratorio: Dominantes Secundarios, Sustituto Tritonal, Escalera que Sube y Puentes °7/+';
    } else if (presetAttr === 'interchange') {
      contextKey = 'interchange';
      labTitle = 'Explorador de Intercambio Modal (Eólico, Backdoor 2-5-1, Dórico y Napolitano ♭II)';
    } else if (presetAttr === 'mod-pivot') {
      contextKey = 'mod-pivot';
      labTitle = 'Simulador de Modulaciones (Acorde Pivote, Subida +1 Semitono, Enarmónica °7 y Nota Común)';
    } else if (labType === 'voice-leading') {
      contextKey = 'voice-leading';
      labTitle = 'Medidor de Conducción de Voces, Notas Guía (3ª y 7ª) y Line Cliché';
    }
    buildProgressionWidget(stage, audio, onStatus, labTitle, contextKey);
  } else if (labType === 'production-calc') {
    stage.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:14px; align-items:center; margin-bottom:12px;">
        <label style="font-size:0.86rem; font-weight:700; color:var(--accent-gold);">Tempo del Proyecto (BPM):</label>
        <input type="number" class="js-bpm-input" value="120" min="40" max="240" style="background:#0f172a; color:#fff; border:1px solid #38bdf8; border-radius:6px; padding:6px 12px; width:90px; font-weight:700;">
        <button type="button" class="btn btn-primary js-bpm-test">▶ Escuchar Pulso de Metrónomo</button>
        <button type="button" class="btn js-bpm-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
      </div>
      <div class="js-bpm-results" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:8px;"></div>
    `;
    const input = stage.querySelector<HTMLInputElement>('.js-bpm-input')!;
    const res = stage.querySelector<HTMLElement>('.js-bpm-results')!;
    const testBtn = stage.querySelector<HTMLButtonElement>('.js-bpm-test')!;
    const stopBtn = stage.querySelector<HTMLButtonElement>('.js-bpm-stop')!;
    const updateCalc = (): void => {
      const bpm = Math.max(40, Math.min(240, parseFloat(input.value) || 120));
      const quarterMs = 60000 / bpm;
      const items = [
        { label: 'Negra (1/4)', ms: quarterMs },
        { label: 'Corchea (1/8)', ms: quarterMs / 2 },
        { label: 'Corchea con Puntillo (1/8.)', ms: quarterMs * 0.75 },
        { label: 'Corchea Tresillo (1/8T)', ms: quarterMs / 3 },
        { label: 'Semicorchea (1/16)', ms: quarterMs / 4 },
        { label: 'Pre-Delay Reverb (1/64)', ms: quarterMs / 16 },
      ];
      res.innerHTML = items
        .map(
          (it) => `
        <div style="background:rgba(15,23,42,0.85); border:1px solid rgba(255,255,255,0.1); padding:10px; border-radius:6px;">
          <div style="font-size:0.75rem; color:var(--text-muted);">${it.label}</div>
          <div style="font-size:1.1rem; font-weight:800; color:var(--accent-cyan);">${it.ms.toFixed(1)} ms</div>
        </div>
      `
        )
        .join('');
    };
    updateCalc();
    input.addEventListener('input', updateCalc);
    testBtn.addEventListener('click', () => {
      audio.stopAll();
      const bpm = Math.max(40, Math.min(240, parseFloat(input.value) || 120));
      const beatSec = 60 / bpm;
      for (let i = 0; i < 4; i++) {
        audio.playDrumHit(i === 0 ? 'clap' : 'hihat', i * beatSec);
      }
      onStatus(`Metrónomo a ${bpm} BPM (${(60000 / bpm).toFixed(1)} ms por negra)`);
    });
    stopBtn.addEventListener('click', () => audio.stopAll());
  } else if (
    labType === 'chord-explorer' ||
    labType === 'stack-lab' ||
    labType === 'poly-hybrid'
  ) {
    buildMultiInstrumentExplorer(stage, audio, onStatus, {
      mode: 'chord',
      defaultRoot: parseInt(article.getAttribute('data-root') || '0', 10),
    });
  } else {
    buildMultiInstrumentExplorer(stage, audio, onStatus, {
      defaultRoot: parseInt(article.getAttribute('data-root') || '0', 10),
      defaultScale: article.getAttribute('data-scale') || 'major',
      mode: 'scale',
      bassOnly: false,
    });
  }
}

/**
 * NEW LAB 8: Personal Vocal Range & Extended Tessitura Detector ("Descubre tu Tesitura: E2–D5 Baritenor y SATB")
 */
export function buildVocalPitchDetectorLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  let micStream: MediaStream | null = null;
  let micCtx: AudioContext | null = null;
  let rafId = 0;
  let currentDetectedMidi = 60;
  let lowestMidi = 40; // E2 default (per user's E2 to D5 question!)
  let highestMidi = 74; // D5 default
  let comfortZone: 'low' | 'mid' | 'high' = 'mid';

  const midiToName = (m: number): string => `${NOTE_NAMES[m % 12]}${Math.floor(m / 12) - 1}`;

  stage.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(270px, 1fr)); gap:14px; margin-bottom:14px;">
      <!-- Live Mic Panel -->
      <div style="background:rgba(15,23,42,0.92); border:1px solid rgba(56,189,248,0.4); border-radius:10px; padding:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
          <strong style="color:var(--accent-cyan); font-size:0.92rem;">1. Captura por Micrófono o Presets Reales</strong>
          <button type="button" class="btn btn-primary js-mic-toggle" style="font-size:0.78rem; padding:5px 12px;">🎙️ Activar Micrófono</button>
        </div>
        <div class="js-mic-readout" style="text-align:center; padding:12px 10px; background:#070a12; border-radius:8px; border:1px solid rgba(255,255,255,0.1); margin-bottom:10px;">
          <div style="font-size:1.65rem; font-weight:900; color:var(--accent-gold);" class="js-pitch-note">E2 → D5</div>
          <div style="font-size:0.82rem; color:#38bdf8;" class="js-pitch-hz">82.4 Hz a 587.3 Hz · 34 Semitonos (2.8 Octavas)</div>
        </div>
        <div style="display:flex; gap:8px; margin-bottom:10px;">
          <button type="button" class="btn js-save-low" style="flex:1; font-size:0.74rem; background:rgba(56,189,248,0.18); color:#38bdf8; border:1px solid rgba(56,189,248,0.4);">⬇ Guardar Nota Grave</button>
          <button type="button" class="btn js-save-high" style="flex:1; font-size:0.74rem; background:rgba(245,158,11,0.2); color:#fbbf24; border:1px solid rgba(245,158,11,0.4);">⬆ Guardar Nota Aguda</button>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          <button type="button" class="btn js-vpreset-e2d5" style="font-size:0.73rem; background:rgba(16,185,129,0.2); color:#34d399; border:1px solid rgba(16,185,129,0.4);">🎯 Caso E2 a D5 (Baritenor / 3 Octavas)</button>
          <button type="button" class="btn js-vpreset-play-span" style="font-size:0.73rem; background:rgba(167,139,250,0.2); color:#c4b5fd; border:1px solid rgba(167,139,250,0.4);">🔊 Escuchar E2 → C3 → G4 → D5</button>
        </div>
      </div>

      <!-- Manual / Ear Test Fallback & Extended Range Diagnosis Panel -->
      <div style="background:rgba(15,23,42,0.92); border:1px solid rgba(245,158,11,0.4); border-radius:10px; padding:14px;">
        <strong style="color:var(--accent-gold); font-size:0.92rem;">2. Diagnóstico Multirregistro (SATB + Rangos Amplios / Baritenor)</strong>
        <div style="display:flex; gap:10px; margin:10px 0; align-items:center; flex-wrap:wrap;">
          <label style="font-size:0.78rem;">
            Nota Más Grave:
            <select class="js-manual-low" style="background:#070a12; color:#38bdf8; border:1px solid #334155; border-radius:4px; padding:3px 6px;">
              ${Array.from({ length: 28 }, (_, i) => 36 + i)
                .map((m) => `<option value="${m}" ${m === lowestMidi ? 'selected' : ''}>${midiToName(m)} (${audio.midiToFreq(m).toFixed(0)} Hz)</option>`)
                .join('')}
            </select>
          </label>
          <label style="font-size:0.78rem;">
            Nota Más Aguda:
            <select class="js-manual-high" style="background:#070a12; color:#fbbf24; border:1px solid #334155; border-radius:4px; padding:3px 6px;">
              ${Array.from({ length: 34 }, (_, i) => 55 + i)
                .map((m) => `<option value="${m}" ${m === highestMidi ? 'selected' : ''}>${midiToName(m)} (${audio.midiToFreq(m).toFixed(0)} Hz)</option>`)
                .join('')}
            </select>
          </label>
          <label style="font-size:0.78rem;">
            Zona Más Cómoda (Voz Hablada):
            <select class="js-comfort-zone" style="background:#070a12; color:#34d399; border:1px solid #334155; border-radius:4px; padding:3px 6px;">
              <option value="mid" selected>Centro Medio (A2–G4 · Baritenor)</option>
              <option value="low">Centro Grave/Cálido (G2–E4 · Barítono con Mix)</option>
              <option value="high">Centro Agudo/Ligero (C3–A4 · Tenor con Graves)</option>
            </select>
          </label>
        </div>
        <div class="js-range-diagnosis" style="font-size:0.81rem; background:rgba(0,0,0,0.38); padding:10px 12px; border-radius:6px; line-height:1.55;"></div>
      </div>
    </div>
    <div class="js-register-zones" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:8px;"></div>
  `;

  const micToggleBtn = stage.querySelector<HTMLButtonElement>('.js-mic-toggle')!;
  const noteEl = stage.querySelector<HTMLElement>('.js-pitch-note')!;
  const hzEl = stage.querySelector<HTMLElement>('.js-pitch-hz')!;
  const lowSel = stage.querySelector<HTMLSelectElement>('.js-manual-low')!;
  const highSel = stage.querySelector<HTMLSelectElement>('.js-manual-high')!;
  const comfortSel = stage.querySelector<HTMLSelectElement>('.js-comfort-zone')!;
  const diagEl = stage.querySelector<HTMLElement>('.js-range-diagnosis')!;
  const zonesEl = stage.querySelector<HTMLElement>('.js-register-zones')!;

  const updateDiagnosis = (): void => {
    const diag = classifyVocalRangeDetailed(lowestMidi, highestMidi, comfortZone);
    diagEl.innerHTML = `
      <div style="margin-bottom:4px;"><strong>Rango Total Medido:</strong> <span style="color:var(--accent-gold); font-weight:800;">${diag.lowName} a ${diag.highName}</span> (${diag.semitones} semitonos · <strong>${diag.octaves} octavas</strong>)</div>
      <div style="margin-bottom:4px;"><strong>Clasificación Principal:</strong> <span style="color:#34d399; font-weight:800; font-size:0.9rem;">${diag.primaryClassification}</span></div>
      <div style="margin-bottom:4px;"><strong>Perfiles Compatibles:</strong> <span style="color:#38bdf8;">${diag.secondaryPossibilities.join(' · ')}</span></div>
      <div style="margin-bottom:6px; color:#cbd5e1;">${diag.whyExplanation}</div>
      <div style="color:#fde047;"><strong>Tesitura Cómoda Recomendada:</strong> ${diag.comfortableCenter} | <strong>Puentes:</strong> ${diag.passaggioInfo}</div>
    `;

    zonesEl.innerHTML = diag.zones
      .map(
        (z) => `
      <div style="background:rgba(15,23,42,0.9); border:1px solid ${z.color}66; border-radius:8px; padding:10px;">
        <div style="font-size:0.78rem; font-weight:800; color:${z.color};">${z.label}</div>
        <div style="font-size:0.9rem; font-weight:900; color:#fff; margin:2px 0;">${z.rangeText}</div>
        <div style="font-size:0.74rem; color:#94a3b8;">${z.mechanism}</div>
      </div>
    `
      )
      .join('');
  };

  updateDiagnosis();

  const autoCorrelate = (buf: Float32Array, sampleRate: number): number => {
    let rms = 0;
    for (const val of buf) rms += val * val;
    rms = Math.sqrt(rms / buf.length);
    if (rms < 0.015) return -1;

    let r1 = 0;
    let r2 = buf.length - 1;
    const thres = 0.2;
    for (let i = 0; i < buf.length / 2; i++) {
      if (Math.abs(buf[i]) < thres) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < buf.length / 2; i++) {
      if (Math.abs(buf[buf.length - i]) < thres) {
        r2 = buf.length - i;
        break;
      }
    }
    const sliced = buf.slice(r1, r2);
    const size = sliced.length;
    const c = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size - i; j++) {
        c[i] = c[i] + sliced[j] * sliced[j + i];
      }
    }
    let d = 0;
    while (d < size - 1 && c[d] > c[d + 1]) d++;
    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < size; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    if (maxpos <= 0) return -1;
    return sampleRate / maxpos;
  };

  const stopMic = (): void => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      micStream = null;
    }
    if (micCtx) {
      micCtx.close();
      micCtx = null;
    }
    micToggleBtn.textContent = '🎙️ Activar Micrófono';
  };

  micToggleBtn.addEventListener('click', async () => {
    if (micStream) {
      stopMic();
      onStatus('Micrófono desactivado');
      return;
    }
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micCtx = new AudioContext();
      const src = micCtx.createMediaStreamSource(micStream);
      const analyser = micCtx.createAnalyser();
      analyser.fftSize = 2048;
      src.connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      micToggleBtn.textContent = '⏹ Apagar Micrófono';
      onStatus('Micrófono activo: Canta una nota sostenida ("Aaaah" o "Mmmm")');

      const loop = (): void => {
        if (!micStream || !micCtx) return;
        analyser.getFloatTimeDomainData(buf);
        const freq = autoCorrelate(buf, micCtx.sampleRate);
        if (freq > 65 && freq < 1100) {
          const midiFloat = 69 + 12 * Math.log2(freq / 440);
          currentDetectedMidi = Math.round(midiFloat);
          const cents = Math.round((midiFloat - currentDetectedMidi) * 100);
          const sign = cents >= 0 ? `+${cents}` : `${cents}`;
          noteEl.textContent = `${midiToName(currentDetectedMidi)}`;
          hzEl.textContent = `${freq.toFixed(1)} Hz (${sign} cents)`;
        }
        rafId = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      hzEl.textContent = 'Sin acceso al micrófono — Usa los selectores manuales a la derecha.';
    }
  });

  stage.querySelector('.js-save-low')?.addEventListener('click', () => {
    lowestMidi = currentDetectedMidi;
    lowSel.value = String(lowestMidi);
    updateDiagnosis();
    onStatus(`Nota más grave registrada: ${midiToName(lowestMidi)}`);
  });

  stage.querySelector('.js-save-high')?.addEventListener('click', () => {
    highestMidi = currentDetectedMidi;
    highSel.value = String(highestMidi);
    updateDiagnosis();
    onStatus(`Nota más aguda registrada: ${midiToName(highestMidi)}`);
  });

  stage.querySelector('.js-vpreset-e2d5')?.addEventListener('click', () => {
    lowestMidi = 40; // E2
    highestMidi = 74; // D5
    lowSel.value = '40';
    highSel.value = '74';
    noteEl.textContent = 'E2 → D5';
    hzEl.textContent = '82.4 Hz a 587.3 Hz · 34 Semitonos (2.8 Octavas)';
    updateDiagnosis();
    onStatus('Cargado perfil E2 a D5: Rango Extendido Polirregistral (Baritenor / 3 Octavas)');
  });

  stage.querySelector('.js-vpreset-play-span')?.addEventListener('click', () => {
    audio.stopAll();
    const spanNotes = [lowestMidi, Math.round((lowestMidi + highestMidi) / 2) - 3, Math.round((lowestMidi + highestMidi) / 2) + 4, highestMidi];
    spanNotes.forEach((m, i) => {
      audio.playAcousticPiano(m, 0.85, i * 0.6, 0.2, false);
      audio.playVocalFormant(m, 0.85, i * 0.6, 0.26, i < 2 ? 'o' : 'a', false);
    });
    onStatus(`Escuchando recorrido de registros: ${midiToName(lowestMidi)} → ${midiToName(highestMidi)}`);
  });

  lowSel.addEventListener('change', () => {
    lowestMidi = parseInt(lowSel.value, 10);
    audio.playVocalFormant(lowestMidi, 1.0, 0, 0.28, 'a', true);
    updateDiagnosis();
  });

  highSel.addEventListener('change', () => {
    highestMidi = parseInt(highSel.value, 10);
    audio.playVocalFormant(highestMidi, 1.0, 0, 0.28, 'a', true);
    updateDiagnosis();
  });

  comfortSel.addEventListener('change', () => {
    comfortZone = comfortSel.value as 'low' | 'mid' | 'high';
    updateDiagnosis();
  });
}

/**
 * NEW LAB 9: Reverse Chord Finder ("Diccionario de Acordes Inverso: ¿Qué acorde estoy pisando?")
 */
function buildReverseChordFinderLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  // 6 strings from 0 (1st string e4) to 5 (6th string E2); -1 means muted string
  let stringFrets = [0, 1, 0, 2, 3, -1]; // Default C Major (x-3-2-0-1-0)

  const presets = [
    { name: 'C Mayor Abierto (x-3-2-0-1-0)', frets: [0, 1, 0, 2, 3, -1] },
    { name: 'Hendrix Chord E7#9 (0-7-6-7-8-0)', frets: [0, 8, 7, 6, 7, 0] },
    { name: 'Acorde "So What" Dm11 (x-5-5-5-6-5)', frets: [5, 6, 5, 5, 5, -1] },
    { name: 'Gmaj9 Acústico (x-10-9-11-10-x)', frets: [-1, 10, 11, 9, 10, -1] },
    { name: 'James Bond Em(Maj9) Abierto (0-2-1-0-0-2)', frets: [2, 0, 0, 1, 2, 0] },
    { name: 'James Bond Em(Maj9) Clásico (0-10-9-8-7-x)', frets: [-1, 7, 8, 9, 10, 0] },
  ];

  const openMidisHighToLow = GUITAR_STRINGS.map((s) => s.openMidi);

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; margin-bottom:12px;">
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        ${presets
          .map(
            (p, idx) =>
              `<button type="button" class="btn js-rcf-preset" data-idx="${idx}" style="font-size:0.75rem; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.35);">${p.name}</button>`
          )
          .join('')}
        <button type="button" class="btn js-rcf-clear" style="font-size:0.75rem; background:rgba(244,63,94,0.18); color:#fb7185;">🧹 Silenciar Todo</button>
      </div>
      <button type="button" class="btn btn-primary js-rcf-strum">🎸 Rasguear Mi Acorde</button>
    </div>

    <div class="js-rcf-readout" style="padding:12px 16px; background:rgba(0,0,0,0.45); border:1px solid rgba(245,158,11,0.45); border-radius:8px; margin-bottom:12px;"></div>
    <div class="fretboard-wrapper js-rcf-neck"></div>
  `;

  const readout = stage.querySelector<HTMLElement>('.js-rcf-readout')!;
  const neck = stage.querySelector<HTMLElement>('.js-rcf-neck')!;

  const identifyChord = () => identifyGuitarChordFromFrets(stringFrets, openMidisHighToLow);

  const render = (): void => {
    const info = identifyChord();
    const fingerMap = new Map<string, number>();
    info.activePositions.forEach((fp) => {
      fingerMap.set(`${fp.sIdx}:${fp.fret}`, fp.finger);
    });

    readout.innerHTML = `
      <div style="font-size:1.2rem; font-weight:900; color:var(--accent-gold); margin-bottom:4px;">Acorde Detectado: ${info.title}</div>
      <div style="font-size:0.84rem; color:#cbd5e1; margin-bottom:5px;">
        <strong>Notas (de grave a agudo):</strong> <span style="color:#38bdf8;">${info.notesText}</span>
        | <strong>Estructura Interválica:</strong> ${info.formulaText}
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; font-size:0.8rem; color:#e2e8f0; background:rgba(15,23,42,0.75); border:1px solid rgba(148,163,184,0.22); border-radius:6px; padding:6px 10px;">
        <span style="white-space:nowrap;"><strong>Trastes (6ª→1ª):</strong> <code style="color:#38bdf8; white-space:nowrap;">${info.tabLowToHigh}</code></span>
        <span style="white-space:nowrap;"><strong>✋ Dedos Mano Izq (6ª→1ª):</strong> <code style="color:#fde047; font-weight:800; white-space:nowrap;">${info.fingerLowToHigh}</code></span>
        ${info.barreFret ? `<span style="color:#34d399; font-weight:800; white-space:nowrap;">• Cejilla Dedo 1 en traste ${info.barreFret}</span>` : ''}
        <span style="color:#94a3b8; font-size:0.74rem;">(1 Índice · 2 Medio · 3 Anular · 4 Meñique · 0 Aire · X Mudo)</span>
      </div>
      ${
        !info.playable && info.warning
          ? `<div style="margin-top:8px; padding:8px 10px; border-radius:6px; background:rgba(244,63,94,0.18); border:1px solid rgba(251,113,133,0.55); color:#fecdd3; font-size:0.8rem; font-weight:700;">⚠️ ${info.warning}</div>`
          : ''
      }
    `;

    let html = `<div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.15); margin-bottom:4px;"><div class="string-label" style="font-size:0.7rem; color:var(--text-muted);">Cuerda</div>`;
    for (let f = 0; f <= 12; f++) {
      html += `<div class="fret-cell" style="height:20px; border:none; font-size:0.72rem; color:var(--text-muted); font-weight:700;">${f}</div>`;
    }
    html += `</div>`;

    GUITAR_STRINGS.forEach((str, sIdx) => {
      const selectedFret = stringFrets[sIdx];
      const statusTag = selectedFret === -1 ? ' ×' : selectedFret === 0 ? ' ○' : '';
      html += `<div class="fretboard-row"><div class="string-label" style="font-size:0.68rem; white-space:nowrap;">${str.label}${statusTag}</div>`;
      for (let f = 0; f <= 12; f++) {
        const midi = str.openMidi + f;
        const pc = midi % 12;
        const isSelected = selectedFret === f;
        const fingerNum = isSelected ? fingerMap.get(`${sIdx}:${f}`) || 0 : 0;
        const fingerBadge =
          isSelected && fingerNum > 0 && f > 0
            ? `<span class="finger-badge" title="Dedo ${fingerNum}">${fingerNum}</span>`
            : '';
        html += `
          <div class="fret-cell js-rcf-cell" data-s="${sIdx}" data-f="${f}" data-midi="${midi}" title="${str.label}, Traste ${f}: ${NOTE_NAMES[pc]}${fingerNum > 0 ? ` · Dedo ${fingerNum}` : ''}">
            <div class="fret-note ${isSelected ? 'root' : ''}">${NOTE_NAMES[pc]}${fingerBadge}</div>
          </div>
        `;
      }
      html += `</div>`;
    });
    neck.innerHTML = html;
  };

  render();

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const cell = target.closest<HTMLElement>('.js-rcf-cell');
    const strumCurrentChordVoicing = () => {
      audio.stopAll(true);
      let strumDelay = 0;
      // Strum from lowest string (5) up to highest string (0) lighting ONLY the fingered chord frets
      for (let sIdx = GUITAR_STRINGS.length - 1; sIdx >= 0; sIdx--) {
        const fret = stringFrets[sIdx];
        if (fret >= 0) {
          const midi = GUITAR_STRINGS[sIdx].openMidi + fret;
          audio.playPluckedGuitar(midi, 1.7, strumDelay, 0.24, false, {
            isChord: true,
            sIdx,
            fret,
            scopeEl: neck,
          });
          strumDelay += 0.042;
        }
      }
    };

    if (cell) {
      const s = parseInt(cell.getAttribute('data-s')!, 10);
      const f = parseInt(cell.getAttribute('data-f')!, 10);
      const midi = parseInt(cell.getAttribute('data-midi')!, 10);
      if (stringFrets[s] === f) {
        stringFrets[s] = -1; // toggle mute
        render();
      } else {
        stringFrets[s] = f;
        render();
        audio.playPluckedGuitar(midi, 1.3, 0, 0.3, true, { sIdx: s, fret: f, scopeEl: neck });
      }
      const info = identifyChord();
      onStatus(`Diccionario Inverso: ${info.title}`);
      return;
    }

    const presetBtn = target.closest<HTMLElement>('.js-rcf-preset');
    if (presetBtn) {
      const idx = parseInt(presetBtn.getAttribute('data-idx')!, 10);
      stringFrets = [...presets[idx].frets];
      render();
      const info = identifyChord();
      strumCurrentChordVoicing();
      onStatus(`Acorde cargado: ${info.title}`);
      return;
    }

    if (target.closest('.js-rcf-clear')) {
      stringFrets = [-1, -1, -1, -1, -1, -1];
      audio.stopAll();
      render();
      return;
    }

    if (target.closest('.js-rcf-strum')) {
      const info = identifyChord();
      if (info.midis.length > 0) {
        strumCurrentChordVoicing();
        onStatus(`Rasgueando: ${info.title}`);
      }
    }
  });
}

/**
 * NEW LAB 10: Visual Andean Quena 7-Hole Fingering Chart & Synthesizer (quena-visual-lab)
 */
function buildQuenaVisualLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  // Holes: [Thumb P, 1, 2, 3, 4, 5, 6] -> 1 = closed (●), 0.5 = half-hole (◐), 0 = open (○)
  const notes = [
    { name: 'G4 (Sol4 · 1ª Oct)', midi: 67, holes: [1, 1, 1, 1, 1, 1, 1], breath: 'Suave y cálido', tip: 'Todos los 7 orificios tapados sin fugas de aire.' },
    { name: 'A4 (La4)', midi: 69, holes: [1, 1, 1, 1, 1, 1, 0], breath: 'Suave y cálido', tip: 'Levanta el anular derecho (6º agujero).' },
    { name: 'B4 (Si4)', midi: 71, holes: [1, 1, 1, 1, 1, 0, 0], breath: 'Suave y cálido', tip: 'Levanta los 2 inferiores (5º y 6º).' },
    { name: 'C5 (Do5)', midi: 72, holes: [1, 1, 1, 1, 0, 0, 0], breath: 'Medio', tip: 'Mano derecha destapada; mano izquierda + pulgar tapados.' },
    { name: 'C#5 (Do#5 Cromático)', midi: 73, holes: [1, 1, 1, 0.5, 0, 0, 0], breath: 'Medio', tip: 'Destapa medio orificio del 3º agujero (anular izquierdo).' },
    { name: 'D5 (Re5)', midi: 74, holes: [1, 1, 1, 0, 0, 0, 0], breath: 'Medio', tip: '4 destapados inferiores.' },
    { name: 'E5 (Mi5 · Tónica Em)', midi: 76, holes: [1, 1, 0, 0, 0, 0, 0], breath: 'Medio-Firme', tip: 'Solo Pulgar trasero + Índice superior (1) tapados.' },
    { name: 'F♮5 (Fa5 Natural)', midi: 77, holes: [1, 0.5, 0, 0, 0, 0, 0], breath: 'Medio-Firme', tip: 'Medio orificio en el 1º agujero (o horquilla 1 abierto + 2 y 3 cerrados).' },
    { name: 'F#5 (Fa#5)', midi: 78, holes: [1, 0, 0, 0, 0, 0, 0], breath: 'Medio-Firme', tip: 'Solo el pulgar trasero tapado.' },
    { name: 'G5 (Sol5 · 2ª Oct)', midi: 79, holes: [0, 1, 1, 1, 1, 1, 1], breath: 'Firme y Fino (2ª Octava)', tip: 'Destapa el pulgar (o el 1º agujero) con chorro fino de aire.' },
    { name: 'A5 (La5 · 2ª Oct)', midi: 81, holes: [1, 1, 1, 1, 1, 1, 0], breath: 'Firme (2ª Octava)', tip: 'Igual que A4 pero duplicando la velocidad del aire.' },
    { name: 'B5 (Si5 · 2ª Oct)', midi: 83, holes: [1, 1, 1, 1, 1, 0, 0], breath: 'Firme (2ª Octava)', tip: 'Igual que B4 con labio estrecho.' },
  ];

  let activeIdx = 6; // E5 default

  const render = (): void => {
    const n = notes[activeIdx];
    stage.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px;">
        ${notes
          .map(
            (nt, idx) => `
          <button type="button" class="btn js-qv-btn" data-idx="${idx}" style="font-size:0.76rem; background:${idx === activeIdx ? 'var(--accent-gold)' : 'rgba(16,185,129,0.15)'}; color:${idx === activeIdx ? '#090d16' : '#34d399'}; border:1px solid rgba(16,185,129,0.4);">
            🪈 ${nt.name}
          </button>
        `
          )
          .join('')}
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:16px; align-items:center; background:rgba(15,23,42,0.9); border:1px solid rgba(245,158,11,0.4); border-radius:10px; padding:16px; max-width:100%;">
        <!-- Visual Bamboo Flute Tube -->
        <div style="flex:1 1 260px; min-width:0; max-width:100%; overflow-x:auto; background:linear-gradient(180deg, #92400e, #b45309, #78350f); border:2px solid #f59e0b; border-radius:24px; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; gap:8px;">
          <div style="color:#fef3c7; font-weight:900; font-size:0.8rem; border-right:3px solid #451a03; padding-right:10px;">BISEL 吹</div>
          ${['P (Pulgar)', '1 (Índ. Izq)', '2 (Med. Izq)', '3 (Anu. Izq)', '4 (Índ. Der)', '5 (Med. Der)', '6 (Anu. Der)']
            .map((label, hIdx) => {
              const st = n.holes[hIdx];
              const bg =
                st === 1
                  ? '#090d16'
                  : st === 0.5
                    ? 'linear-gradient(90deg, #090d16 50%, #fef3c7 50%)'
                    : '#fef3c7';
              return `
                <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                  <div style="width:24px; height:24px; border-radius:50%; border:2px solid #090d16; background:${bg};"></div>
                  <span style="font-size:0.65rem; color:#fef3c7; font-weight:700;">${label.split(' ')[0]}</span>
                </div>
              `;
            })
            .join('')}
        </div>

        <div style="flex:1; min-width:240px; font-size:0.84rem;">
          <div style="font-size:1.1rem; font-weight:800; color:var(--accent-gold); margin-bottom:4px;">Nota: ${n.name} (${audio.midiToFreq(n.midi).toFixed(1)} Hz)</div>
          <div style="color:var(--accent-cyan); margin-bottom:4px;"><strong>Soplo:</strong> ${n.breath}</div>
          <div style="color:var(--text-muted);">${n.tip}</div>
        </div>
      </div>
    `;
  };

  render();

  stage.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('.js-qv-btn');
    if (!btn) return;
    activeIdx = parseInt(btn.getAttribute('data-idx')!, 10);
    render();
    audio.playQuenaFlute(notes[activeIdx].midi, 1.25, 0, 0.3, true);
    onStatus(`Quena Andina: ${notes[activeIdx].name}`);
  });
}

/**
 * NEW LAB 11: Bipolar Zampoña / Siku (Arka 7 Tubes + Ira 6 Tubes) Interactive Lab (zampona-lab)
 */
function buildZamponaLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const iraTubes = [
    { name: 'G4', midi: 67, len: 135 },
    { name: 'B4', midi: 71, len: 118 },
    { name: 'D5', midi: 74, len: 102 },
    { name: 'F#5', midi: 78, len: 88 },
    { name: 'A5', midi: 81, len: 75 },
    { name: 'C6', midi: 84, len: 64 },
  ];
  const arkaTubes = [
    { name: 'F#4', midi: 66, len: 144 },
    { name: 'A4', midi: 69, len: 126 },
    { name: 'C5', midi: 72, len: 110 },
    { name: 'E5', midi: 76, len: 95 },
    { name: 'G5', midi: 79, len: 82 },
    { name: 'B5', midi: 83, len: 70 },
    { name: 'D6', midi: 86, len: 58 },
  ];

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; margin-bottom:14px;">
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button type="button" class="btn btn-primary js-zamp-zigzag">▶ Tocar Escala en Zigzag (Arka ↔ Ira)</button>
        <button type="button" class="btn js-zamp-sikuri" style="background:rgba(16,185,129,0.2); color:#34d399; border:1px solid rgba(16,185,129,0.4);">▶ Melodía Sikuri Trenzada (En Mi Menor)</button>
        <button type="button" class="btn js-zamp-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
      <!-- IRA ROW (6 Tubes) -->
      <div style="background:rgba(15,23,42,0.9); border:1px solid rgba(245,158,11,0.4); border-radius:10px; padding:14px;">
        <strong style="color:var(--accent-gold); display:block; margin-bottom:10px;">Fila Superior: IRA (6 Tubos · El que Guía)</strong>
        <div style="display:flex; align-items:flex-start; gap:8px; justify-content:center;">
          ${iraTubes
            .map(
              (t) => `
            <button type="button" class="js-zamp-tube" data-midi="${t.midi}" data-row="IRA" data-name="${t.name}" style="width:36px; height:${t.len}px; background:linear-gradient(90deg, #b45309, #f59e0b, #92400e); border:2px solid #fde68a; border-radius:4px 4px 10px 10px; color:#090d16; font-weight:900; font-size:0.75rem; cursor:pointer; display:flex; align-items:flex-start; justify-content:center; padding-top:6px;">
              ${t.name}
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- ARKA ROW (7 Tubes) -->
      <div style="background:rgba(15,23,42,0.9); border:1px solid rgba(56,189,248,0.4); border-radius:10px; padding:14px;">
        <strong style="color:var(--accent-cyan); display:block; margin-bottom:10px;">Fila Inferior: ARKA (7 Tubos · El que Sigue)</strong>
        <div style="display:flex; align-items:flex-start; gap:8px; justify-content:center;">
          ${arkaTubes
            .map(
              (t) => `
            <button type="button" class="js-zamp-tube" data-midi="${t.midi}" data-row="ARKA" data-name="${t.name}" style="width:36px; height:${t.len}px; background:linear-gradient(90deg, #0284c7, #38bdf8, #0369a1); border:2px solid #bae6fd; border-radius:4px 4px 10px 10px; color:#090d16; font-weight:900; font-size:0.75rem; cursor:pointer; display:flex; align-items:flex-start; justify-content:center; padding-top:6px;">
              ${t.name}
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const tube = target.closest<HTMLElement>('.js-zamp-tube');
    if (tube) {
      const midi = parseInt(tube.getAttribute('data-midi')!, 10);
      const row = tube.getAttribute('data-row');
      const name = tube.getAttribute('data-name');
      audio.playQuenaFlute(midi, 0.9, 0, 0.28, true);
      onStatus(`Zampoña (${row}): Tubo ${name} (${audio.midiToFreq(midi).toFixed(1)} Hz)`);
      return;
    }

    if (target.closest('.js-zamp-zigzag')) {
      audio.stopAll();
      const all = [...iraTubes, ...arkaTubes].sort((a, b) => a.midi - b.midi);
      all.forEach((t, idx) => {
        audio.playQuenaFlute(t.midi, 0.36, idx * 0.26, 0.26, false);
      });
      onStatus('Zampoña: Escala completa alternando Arka ↔ Ira en zigzag');
    } else if (target.closest('.js-zamp-sikuri')) {
      audio.stopAll();
      const melody = [76, 79, 83, 81, 79, 76, 74, 71, 74, 76];
      melody.forEach((m, idx) => {
        audio.playQuenaFlute(m, 0.42, idx * 0.32, 0.28, false);
        if (idx % 2 === 0) audio.playDrumHit('kick', idx * 0.32);
      });
      onStatus('Reproduciendo Sikuri Trenzado (Bombo + Diálogo Arka/Ira)');
    } else if (target.closest('.js-zamp-stop')) {
      audio.stopAll();
    }
  });
}

/**
 * NEW LAB 12: 5-Course Andean Charango Re-Entrant Fretboard (charango-lab)
 */
function buildCharangoLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const courses = [
    { label: '1º Orden (E5)', openMidi: 76, octavePair: false },
    { label: '2º Orden (A4)', openMidi: 69, octavePair: false },
    { label: '3º Orden (E4+E5)', openMidi: 64, octavePair: true },
    { label: '4º Orden (C5)', openMidi: 72, octavePair: false },
    { label: '5º Orden (G4)', openMidi: 67, octavePair: false },
  ];

  const chords = [
    { name: 'Am (La menor · Himno Andino)', frets: [0, 0, 0, 0, 2] },
    { name: 'C Mayor (Do Mayor)', frets: [0, 3, 0, 0, 0] },
    { name: 'G Mayor (Sol Mayor)', frets: [3, 2, 3, 2, 0] },
    { name: 'E7 (Dominante)', frets: [0, 2, 0, 1, 1] },
    { name: 'F Mayor (Fa Mayor)', frets: [1, 0, 1, 0, 2] },
  ];
  let currentChord = chords[0];

  const playCourse = (cIdx: number, fret: number, delay = 0, stopPrev = true): void => {
    const midi = courses[cIdx].openMidi + fret;
    audio.playPluckedGuitar(midi, 1.1, delay, 0.26, stopPrev);
    if (courses[cIdx].octavePair) {
      audio.playPluckedGuitar(midi + 12, 1.1, delay + 0.01, 0.2, false);
    }
  };

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; margin-bottom:12px;">
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        ${chords
          .map(
            (c, i) =>
              `<button type="button" class="btn js-char-chord" data-idx="${i}" style="font-size:0.76rem; background:rgba(245,158,11,0.16); color:#fbbf24; border:1px solid rgba(245,158,11,0.4);">${c.name}</button>`
          )
          .join('')}
      </div>
      <div style="display:flex; gap:8px;">
        <button type="button" class="btn btn-primary js-char-strum">🎸 Rasguear Charango</button>
        <button type="button" class="btn js-char-camp" style="background:rgba(56,189,248,0.18); color:#38bdf8;">🔔 Efecto Campanella</button>
      </div>
    </div>
    <div class="fretboard-wrapper js-char-neck"></div>
  `;

  const neck = stage.querySelector<HTMLElement>('.js-char-neck')!;

  const renderNeck = (): void => {
    let html = `<div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.15); margin-bottom:4px;"><div class="string-label" style="font-size:0.7rem; color:var(--text-muted);">Orden</div>`;
    for (let f = 0; f <= 10; f++) {
      html += `<div class="fret-cell" style="height:20px; border:none; font-size:0.72rem; color:var(--text-muted); font-weight:700;">${f}</div>`;
    }
    html += `</div>`;

    courses.forEach((c, cIdx) => {
      html += `<div class="fretboard-row"><div class="string-label" style="color:#fbbf24; font-size:0.74rem;">${c.label}</div>`;
      for (let f = 0; f <= 10; f++) {
        const midi = c.openMidi + f;
        const pc = midi % 12;
        const isCurrent = currentChord.frets[cIdx] === f;
        html += `
          <div class="fret-cell js-char-cell" data-c="${cIdx}" data-f="${f}">
            <div class="fret-note ${isCurrent ? 'root' : ''}">${NOTE_NAMES[pc]}</div>
          </div>
        `;
      }
      html += `</div>`;
    });
    neck.innerHTML = html;
  };

  renderNeck();

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const cell = target.closest<HTMLElement>('.js-char-cell');
    if (cell) {
      const c = parseInt(cell.getAttribute('data-c')!, 10);
      const f = parseInt(cell.getAttribute('data-f')!, 10);
      playCourse(c, f, 0, true);
      onStatus(`Charango: ${courses[c].label}, Traste ${f}`);
      return;
    }

    const chordBtn = target.closest<HTMLElement>('.js-char-chord');
    if (chordBtn) {
      currentChord = chords[parseInt(chordBtn.getAttribute('data-idx')!, 10)];
      renderNeck();
      audio.stopAll();
      [4, 3, 2, 1, 0].forEach((cIdx, i) => playCourse(cIdx, currentChord.frets[cIdx], i * 0.035, false));
      onStatus(`Charango: Acorde ${currentChord.name}`);
      return;
    }

    if (target.closest('.js-char-strum')) {
      audio.stopAll();
      [4, 3, 2, 1, 0].forEach((cIdx, i) => playCourse(cIdx, currentChord.frets[cIdx], i * 0.03, false));
      onStatus(`Rasgueo de Charango: ${currentChord.name}`);
    } else if (target.closest('.js-char-camp')) {
      audio.stopAll();
      // Open-string harp cascade across re-entrant courses
      const seq = [
        { c: 2, f: 0 }, // E4+E5
        { c: 4, f: 0 }, // G4
        { c: 1, f: 0 }, // A4
        { c: 4, f: 4 }, // B4
        { c: 3, f: 0 }, // C5
        { c: 1, f: 5 }, // D5
        { c: 0, f: 0 }, // E5
      ];
      seq.forEach((st, i) => playCourse(st.c, st.f, i * 0.22, false));
      onStatus('Charango: Escala en Campanella cruzando los 5 órdenes reentrantes');
    }
  });
}

/**
 * NEW LAB 13: Latin American Folklore Rhythm Matrix (folklore-rhythm-lab)
 */
function buildFolkloreRhythmLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const genres = [
    {
      name: '1) Chacarera / Cueca / Zamba (Sesquiáltera 6/8 en Aro contra 3/4 en Parche y Bajo)',
      steps: ['1', '2', '3', '4', '5', '6'],
      aro: [1, 0, 0, 1, 0, 0],
      parche: [0, 0, 1, 0, 1, 0],
      bajo: [45, 0, 52, 0, 45, 0],
      stepMs: 210,
    },
    {
      name: '2) Huayno / Carnavalito Andino (2/4 con Bombo y Charango)',
      steps: ['1', 'e', '&', 'a', '2', 'e', '&', 'a'],
      aro: [1, 0, 1, 1, 1, 0, 1, 1],
      parche: [1, 0, 1, 1, 1, 0, 0, 0],
      bajo: [40, 0, 47, 52, 40, 0, 47, 0],
      stepMs: 165,
    },
    {
      name: '3) Landó / Festejo Afroperuano (Cajón Grave + Galleta en 6/8)',
      steps: ['1', '2', '3', '4', '5', '6'],
      aro: [0, 1, 1, 0, 1, 0],
      parche: [1, 0, 0, 1, 0, 1],
      bajo: [45, 0, 0, 45, 52, 45],
      stepMs: 220,
    },
    {
      name: '4) Cumbia Tradicional (Maraca/Charles en Contratiempo + Bajo 1–3–5)',
      steps: ['1', 'e', '&', 'a', '2', 'e', '&', 'a'],
      aro: [0, 0, 1, 0, 0, 0, 1, 0],
      parche: [1, 0, 0, 1, 0, 0, 1, 0],
      bajo: [45, 0, 0, 0, 48, 0, 52, 0],
      stepMs: 160,
    },
  ];

  let gIdx = 0;

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; margin-bottom:12px;">
      <select class="js-folk-sel">
        ${genres.map((g, i) => `<option value="${i}">${g.name}</option>`).join('')}
      </select>
      <div style="display:flex; gap:8px;">
        <button type="button" class="btn btn-primary js-folk-play">▶ Reproducir 4 Compases</button>
        <button type="button" class="btn js-folk-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
      </div>
    </div>
    <div style="overflow-x:auto; max-width:100%;">
      <div class="js-folk-grid" style="min-width:520px;"></div>
    </div>
  `;

  const sel = stage.querySelector<HTMLSelectElement>('.js-folk-sel')!;
  const grid = stage.querySelector<HTMLElement>('.js-folk-grid')!;

  const render = (activeStep = -1): void => {
    const g = genres[gIdx];
    const cols = g.steps.length;
    grid.innerHTML = `
      <div style="display:grid; grid-template-columns:140px repeat(${cols}, 1fr); gap:6px; align-items:center;">
        <div style="font-size:0.75rem; color:var(--text-muted);">Subdivisión</div>
        ${g.steps.map((s, i) => `<div style="text-align:center; font-weight:800; color:${i === activeStep ? '#f59e0b' : '#cbd5e1'};">${s}</div>`).join('')}

        <div style="font-size:0.78rem; color:var(--accent-gold); font-weight:700;">🥢 Aro / Galleta</div>
        ${g.aro.map((v, i) => `<div style="height:28px; border-radius:6px; background:${v ? 'var(--accent-gold)' : 'rgba(30,41,59,0.7)'}; outline:${i === activeStep ? '2px solid #fff' : 'none'};"></div>`).join('')}

        <div style="font-size:0.78rem; color:var(--accent-cyan); font-weight:700;">🥁 Parche / Grave</div>
        ${g.parche.map((v, i) => `<div style="height:28px; border-radius:6px; background:${v ? 'var(--accent-cyan)' : 'rgba(30,41,59,0.7)'}; outline:${i === activeStep ? '2px solid #fff' : 'none'};"></div>`).join('')}

        <div style="font-size:0.78rem; color:#34d399; font-weight:700;">🎸 Bajo Folclórico</div>
        ${g.bajo.map((v, i) => `<div style="height:28px; border-radius:6px; background:${v ? '#10b981' : 'rgba(30,41,59,0.7)'}; outline:${i === activeStep ? '2px solid #fff' : 'none'}; display:flex; align-items:center; justify-content:center; color:#090d16; font-size:0.7rem; font-weight:800;">${v ? NOTE_NAMES[v % 12] : ''}</div>`).join('')}
      </div>
    `;
  };

  render();

  sel.addEventListener('change', () => {
    gIdx = parseInt(sel.value, 10);
    audio.stopAll();
    render();
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('.js-folk-stop')) {
      audio.stopAll();
      render();
      return;
    }
    if (target.closest('.js-folk-play')) {
      audio.stopAll();
      const g = genres[gIdx];
      const len = g.steps.length;
      for (let bar = 0; bar < 4; bar++) {
        for (let s = 0; s < len; s++) {
          const total = bar * len + s;
          audio.schedule(() => {
            render(s);
            if (g.aro[s]) audio.playDrumHit('clap');
            if (g.parche[s]) audio.playDrumHit('kick');
            if (g.bajo[s]) audio.playElectricBass(g.bajo[s] - 12, 0.35, 0, 0.36, 'finger', false);
          }, total * g.stepMs);
        }
      }
      onStatus(`Folclore Latinoamericano: ${g.name}`);
    }
  });
}

/**
 * NEW LAB 14: 4-Limb Drum Independence Combiner (drum-independence-lab)
 */
function buildDrumIndependenceLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const feetPatterns = [
    { name: 'Pies 1: Ostinato Samba / Bossa (Bombo en 1 y 1a + Hi-Hat Pie en &)', kick: [1, 0, 0, 1, 1, 0, 0, 1], hhFoot: [0, 0, 1, 0, 0, 0, 1, 0] },
    { name: 'Pies 2: Ostinato Baiao Brasileño (Bombo en 1 y 1& + Hi-Hat en 2)', kick: [1, 0, 1, 0, 1, 0, 1, 0], hhFoot: [0, 0, 0, 0, 1, 0, 0, 0] },
    { name: 'Pies 3: Permutación Sincopada (Bombo en 1e y 2&)', kick: [0, 1, 0, 0, 0, 0, 1, 0], hhFoot: [1, 0, 0, 0, 1, 0, 0, 0] },
  ];
  const handPatterns = [
    { name: 'Manos A: Clave de Son en Aro + Subdivisión constante', rh: [1, 1, 1, 1, 1, 1, 1, 1], lh: [1, 0, 0, 1, 0, 0, 1, 0] },
    { name: 'Manos B: Single Paradiddle (R L R R - L R L L)', rh: [1, 0, 1, 1, 0, 1, 0, 0], lh: [0, 1, 0, 0, 1, 0, 1, 1] },
    { name: 'Manos C: Backbeat en 2 + Notas Fantasma en 1e, 1a, 2a', rh: [1, 0, 1, 0, 1, 0, 1, 0], lh: [0, 1, 0, 1, 2, 0, 0, 1] },
  ];

  let fIdx = 0;
  let hIdx = 0;
  let indepBpm = 88;

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
        <select class="js-di-feet">${feetPatterns.map((f, i) => `<option value="${i}">${f.name}</option>`).join('')}</select>
        <select class="js-di-hands">${handPatterns.map((h, i) => `<option value="${i}">${h.name}</option>`).join('')}</select>
        <label style="font-size:0.78rem; color:#cbd5e1; display:flex; align-items:center; gap:6px;">
          BPM: <strong class="js-di-bpm-val" style="color:#fbbf24;">${indepBpm}</strong>
          <input type="range" class="js-di-bpm" min="50" max="145" value="${indepBpm}" style="width:95px;" />
        </label>
      </div>
      <div style="display:flex; gap:8px;">
        <button type="button" class="btn btn-primary js-di-play">▶ Escuchar Combinación de 4 Extremidades</button>
        <button type="button" class="btn js-di-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
      </div>
    </div>
    <div style="overflow-x:auto; max-width:100%; margin-bottom:12px;">
      <div class="js-di-grid" style="min-width:500px;"></div>
    </div>
    <div class="js-di-kit-svg"></div>
  `;

  const fSel = stage.querySelector<HTMLSelectElement>('.js-di-feet')!;
  const hSel = stage.querySelector<HTMLSelectElement>('.js-di-hands')!;
  const grid = stage.querySelector<HTMLElement>('.js-di-grid')!;
  const kitHost = stage.querySelector<HTMLElement>('.js-di-kit-svg')!;
  const bpmInput = stage.querySelector<HTMLInputElement>('.js-di-bpm')!;
  const bpmValEl = stage.querySelector<HTMLElement>('.js-di-bpm-val')!;

  const render = (step = -1): void => {
    const f = feetPatterns[fIdx];
    const h = handPatterns[hIdx];
    const labels = ['1', 'e', '&', 'a', '2', 'e', '&', 'a'];
    grid.innerHTML = `
      <div style="display:grid; grid-template-columns:150px repeat(8, 1fr); gap:5px; align-items:center;">
        <div style="font-size:0.74rem; color:var(--text-muted);">Extremidad</div>
        ${labels.map((l, i) => `<div style="text-align:center; font-weight:800; color:${i === step ? '#f59e0b' : '#94a3b8'};">${l}</div>`).join('')}

        <div style="font-size:0.76rem; color:var(--accent-gold);">🤚 Mano Derecha (Ride/HH)</div>
        ${h.rh.map((v, i) => `<div style="height:24px; border-radius:4px; background:${v ? 'var(--accent-gold)' : 'rgba(30,41,59,0.7)'}; outline:${i === step ? '2px solid #fff' : 'none'};"></div>`).join('')}

        <div style="font-size:0.76rem; color:#fb7185;">✋ Mano Izquierda (Caja/Aro)</div>
        ${h.lh.map((v, i) => `<div style="height:24px; border-radius:4px; background:${v === 2 ? '#f43f5e' : v === 1 ? 'rgba(244,63,94,0.5)' : 'rgba(30,41,59,0.7)'}; outline:${i === step ? '2px solid #fff' : 'none'};"></div>`).join('')}

        <div style="font-size:0.76rem; color:var(--accent-cyan);">🦶 Pie Derecho (Bombo)</div>
        ${f.kick.map((v, i) => `<div style="height:24px; border-radius:4px; background:${v ? 'var(--accent-cyan)' : 'rgba(30,41,59,0.7)'}; outline:${i === step ? '2px solid #fff' : 'none'};"></div>`).join('')}

        <div style="font-size:0.76rem; color:#34d399;">🦶 Pie Izquierdo (HH Pedal)</div>
        ${f.hhFoot.map((v, i) => `<div style="height:24px; border-radius:4px; background:${v ? '#10b981' : 'rgba(30,41,59,0.7)'}; outline:${i === step ? '2px solid #fff' : 'none'};"></div>`).join('')}
      </div>
    `;

    const hits: DrumLimbHit[] = [];
    if (step >= 0 && step < 8) {
      if (h.rh[step]) hits.push({ piece: 'HH', limb: 'R' });
      if (h.lh[step]) hits.push({ piece: 'SD', limb: 'L', accent: h.lh[step] === 2 });
      if (f.kick[step]) hits.push({ piece: 'BD', limb: 'RF', accent: true });
      if (f.hhFoot[step]) hits.push({ piece: 'HHP', limb: 'LF' });
    }
    kitHost.innerHTML = renderTopViewDrumKitSvg({
      title: `Coordinación de 4 Extremidades en el Kit (${indepBpm} BPM)`,
      limbHits: hits,
    });
  };

  render();
  const unsubDiStop = audio.onStop(() => {
    if (!document.body.contains(stage)) {
      unsubDiStop();
      return;
    }
    render();
  });
  bpmInput.addEventListener('input', () => {
    indepBpm = parseInt(bpmInput.value, 10);
    bpmValEl.textContent = String(indepBpm);
  });
  fSel.addEventListener('change', () => {
    fIdx = parseInt(fSel.value, 10);
    audio.stopAll();
    render();
  });
  hSel.addEventListener('change', () => {
    hIdx = parseInt(hSel.value, 10);
    audio.stopAll();
    render();
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const svgPiece = target.closest<HTMLElement>('.js-svg-drum-piece');
    if (svgPiece) {
      const code = svgPiece.getAttribute('data-piece') as DrumKitPieceCode | null;
      if (code) audio.playDrumPiece(code);
      return;
    }
    if (target.closest('.js-di-stop')) {
      audio.stopAll();
      render();
      return;
    }
    if (target.closest('.js-di-play')) {
      audio.stopAll();
      const f = feetPatterns[fIdx];
      const h = handPatterns[hIdx];
      const subMs = Math.max(105, Math.round(60000 / indepBpm / 4));
      for (let bar = 0; bar < 3; bar++) {
        for (let s = 0; s < 8; s++) {
          const total = bar * 8 + s;
          audio.schedule(() => {
            render(s);
            if (h.rh[s]) audio.playDrumHit('hihat');
            if (h.lh[s] === 2) audio.playDrumHit('snare');
            else if (h.lh[s] === 1) audio.playDrumHit('ghost');
            if (f.kick[s]) audio.playDrumHit('kick');
            if (f.hhFoot[s]) audio.playDrumPiece('HHP');
          }, total * subMs);
        }
      }
      onStatus(`Independencia 4 Extremidades (${indepBpm} BPM): ${f.name} + ${h.name}`);
    }
  });
}

/**
 * NEW LAB 15: 4-String Electric Bass Articulation, Ghost Notes & Fills Lab (bass-articulation-lab)
 */
function buildBassArticulationLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  buildDedicatedBassLab(stage, audio, onStatus, 'gym');
}

/**
 * NEW LAB 16: Electric Guitar Bending & String-Skipping Trainer (guitar-bending-lab)
 */
function buildGuitarBendingLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const drills = [
    {
      name: '1) Bending de Tono Completo (+2 trastes: 3ª cuerda traste 7 [D4] → estira hasta sonar como traste 9 [E4])',
      originMidi: 62,
      targetMidi: 64,
      sIdx: 2,
      fOrigin: 7,
      fTarget: 9,
      tip: 'Escucha primero la nota objetivo E4 en el traste 9; luego pisa el traste 7 con los dedos 1-2-3 juntos y gira la muñeca hasta igualar esa altura exacta.',
    },
    {
      name: '2) Bending de Semitono (+1 traste: Sensible B3 [traste 4] → Tónica C4 [traste 5])',
      originMidi: 59,
      targetMidi: 60,
      sIdx: 2,
      fOrigin: 4,
      fTarget: 5,
      tip: 'Requiere la mitad de recorrido que el bend de tono: ideal para expresar el modo Frigio o la sensible de la menor armónica.',
    },
    {
      name: '3) Unison Bend de Rock/Blues (2ª cuerda traste 5 fija [E4] + 3ª cuerda traste 7 estirada a E4)',
      originMidi: 62,
      targetMidi: 64,
      sIdx: 2,
      fOrigin: 7,
      fTarget: 9,
      tip: 'Cuando la nota estirada alcanza exactamente a la 2ª cuerda dejan de oírse batimentos (oscilaciones) y se funden en un rugido potente.',
    },
    {
      name: '4) String Skipping Arpeggio (Salto de Cuerdas 5ª → 3ª → 1ª en La Menor Novena)',
      originMidi: 45,
      targetMidi: 69,
      sIdx: 0,
      fOrigin: 5,
      fTarget: 12,
      tip: 'Evita tocar cuerdas adyacentes: salta de la 5ª a la 3ª y a la 1ª cuerda para abrir intervalos amplios.',
    },
  ];

  let dIdx = 0;

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px; margin-bottom:12px;">
      <select class="js-gbend-sel">${drills.map((d, i) => `<option value="${i}">${d.name}</option>`).join('')}</select>
      <div style="display:flex; gap:8px;">
        <button type="button" class="btn js-gbend-target" style="background:rgba(16,185,129,0.2); color:#34d399; border:1px solid rgba(16,185,129,0.4);">1º 🔊 Escuchar Nota Destino (Afinación Meta)</button>
        <button type="button" class="btn btn-primary js-gbend-run">2º 🎸 Ejecutar Ejercicio / Bending</button>
      </div>
    </div>
    <div class="js-gbend-tip" style="font-size:0.84rem; color:var(--text-muted); margin-bottom:10px;"></div>
    <div class="fretboard-wrapper js-gbend-neck"></div>
  `;

  const sel = stage.querySelector<HTMLSelectElement>('.js-gbend-sel')!;
  const tipEl = stage.querySelector<HTMLElement>('.js-gbend-tip')!;
  const neck = stage.querySelector<HTMLElement>('.js-gbend-neck')!;

  const render = (): void => {
    const d = drills[dIdx];
    tipEl.textContent = d.tip;
    let html = `<div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.15); margin-bottom:4px;"><div class="string-label" style="font-size:0.7rem; color:var(--text-muted);">Cuerda</div>`;
    for (let f = 0; f <= 12; f++) {
      html += `<div class="fret-cell" style="height:20px; border:none; font-size:0.72rem; color:var(--text-muted); font-weight:700;">${f}</div>`;
    }
    html += `</div>`;

    GUITAR_STRINGS.forEach((str, sIdx) => {
      html += `<div class="fretboard-row"><div class="string-label">${str.label}</div>`;
      for (let f = 0; f <= 12; f++) {
        const midi = str.openMidi + f;
        const pc = midi % 12;
        const isOrig = sIdx === d.sIdx && f === d.fOrigin;
        const isTarg = sIdx === d.sIdx && f === d.fTarget;
        const cls = isTarg ? 'root' : isOrig ? 'active' : '';
        html += `
          <div class="fret-cell js-gb-cell" data-midi="${midi}">
            <div class="fret-note ${cls}">${NOTE_NAMES[pc]}</div>
          </div>
        `;
      }
      html += `</div>`;
    });
    neck.innerHTML = html;
  };

  render();

  sel.addEventListener('change', () => {
    dIdx = parseInt(sel.value, 10);
    audio.stopAll();
    render();
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const cell = target.closest<HTMLElement>('.js-gb-cell');
    if (cell) {
      const midi = parseInt(cell.getAttribute('data-midi')!, 10);
      audio.playPluckedGuitar(midi, 1.4, 0, 0.3, true);
      return;
    }

    const d = drills[dIdx];
    if (target.closest('.js-gbend-target')) {
      audio.playPluckedGuitar(d.targetMidi, 1.5, 0, 0.32, true);
      onStatus(`Nota Destino de Referencia: ${NOTE_NAMES[d.targetMidi % 12]} (Traste ${d.fTarget})`);
    } else if (target.closest('.js-gbend-run')) {
      audio.stopAll();
      if (dIdx === 3) {
        // String skipping arpeggio
        const arp = [45, 52, 57, 60, 64, 69, 71, 64];
        arp.forEach((m, i) => audio.playPluckedGuitar(m, 0.45, i * 0.2, 0.28, false));
        onStatus('Ejecutando String Skipping Arpeggio (Cuerdas 5ª → 3ª → 1ª)');
      } else {
        // Origin note -> micro-step bend -> target note
        audio.playPluckedGuitar(d.originMidi, 0.45, 0, 0.3, false);
        audio.playPluckedGuitar((d.originMidi + d.targetMidi) / 2, 0.35, 0.32, 0.28, false);
        audio.playPluckedGuitar(d.targetMidi, 1.4, 0.55, 0.32, false);
        onStatus(`Bending ejecutado: ${NOTE_NAMES[d.originMidi % 12]} → ${NOTE_NAMES[d.targetMidi % 12]}`);
      }
    }
  });
}

/**
 * NEW LAB 17: Interactive Simple & Compound Intervals (1st to 9th, 11th & 13th) Visualizer
 * (`data-lab="interval-9th-visualizer"`)
 */
function buildInterval9thVisualizerLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  interface IntervalSpec {
    semi: number;
    short: string;
    name: string;
    group: 'simple' | 'compound';
    simpleEquiv: string;
    ratio: string;
    quality: string;
    neckShapeGuitar: string;
    neckShapeBass: string;
    emotion: string;
  }

  const intervalsDb: IntervalSpec[] = [
    { semi: 1, short: '2m (♭2)', name: 'Segunda Menor (1 st)', group: 'simple', simpleEquiv: '2m (1 st)', ratio: '16:15', quality: 'Disonancia Fuerte / Frigia', neckShapeGuitar: '+1 traste en la misma cuerda', neckShapeBass: '+1 traste en la misma cuerda', emotion: 'Tensión oscura flamenca / aproximación cromática' },
    { semi: 2, short: '2M (2)', name: 'Segunda Mayor (2 st)', group: 'simple', simpleEquiv: '2M (2 st)', ratio: '9:8', quality: 'Disonancia Suave (Sus2)', neckShapeGuitar: '+2 trastes en la misma cuerda', neckShapeBass: '+2 trastes en la misma cuerda', emotion: 'Movimiento melódico natural y apertura sus2' },
    { semi: 3, short: '3m (♭3)', name: 'Tercera Menor (3 st)', group: 'simple', simpleEquiv: '3m (3 st)', ratio: '6:5', quality: 'Consonancia Imperfecta (Base Menor)', neckShapeGuitar: '+3 trastes misma cuerda o -1 cuerda y -2 trastes', neckShapeBass: '+3 trastes misma cuerda o +1 cuerda aguda y -2 trastes', emotion: 'Melancolía, intimidad, color menor' },
    { semi: 4, short: '3M (3)', name: 'Tercera Mayor (4 st)', group: 'simple', simpleEquiv: '3M (4 st)', ratio: '5:4', quality: 'Consonancia Imperfecta (Base Mayor)', neckShapeGuitar: '+4 trastes misma cuerda o +1 cuerda aguda y -1 traste', neckShapeBass: '+1 cuerda aguda y -1 traste (diagonal luminosa)', emotion: 'Luminosidad, alegría, estabilidad mayor' },
    { semi: 5, short: '4J (4)', name: 'Cuarta Justa (5 st)', group: 'simple', simpleEquiv: '4J (5 st)', ratio: '4:3', quality: 'Consonancia Perfecta / Cuartal', neckShapeGuitar: 'Mismo traste en la cuerda inmediatamente más aguda (salvo G→B: +1 traste)', neckShapeBass: 'Mismo traste en la cuerda inmediatamente más aguda (simetría pura)', emotion: 'Fuerza arquitectónica, suspensión cuartal moderna' },
    { semi: 6, short: '#4 / ♭5', name: 'Tritono (4ª Aum / 5ª Dism · 6 st)', group: 'simple', simpleEquiv: 'Tritono (6 st)', ratio: '45:32', quality: 'Disonancia Dinámica (Motor Dominante)', neckShapeGuitar: '+1 cuerda aguda y +1 traste', neckShapeBass: '+1 cuerda aguda y +1 traste (diagonal simétrica)', emotion: 'Inestabilidad magnética (Diabolus in Musica / Lidio #4)' },
    { semi: 7, short: '5J (5)', name: 'Quinta Justa (7 st)', group: 'simple', simpleEquiv: '5J (7 st)', ratio: '3:2', quality: 'Consonancia Perfecta (Power Chord)', neckShapeGuitar: '+1 cuerda aguda y +2 trastes (figura de Power Chord)', neckShapeBass: '+1 cuerda aguda y +2 trastes (pilar grave absoluto)', emotion: 'Estabilidad férrea, potencia y centro gravitacional' },
    { semi: 8, short: '6m (♭6)', name: 'Sexta Menor (8 st)', group: 'simple', simpleEquiv: '6m (8 st = Inv. de 3M)', ratio: '8:5', quality: 'Consonancia Imperfecta / Eólica', neckShapeGuitar: '+1 cuerda aguda y +3 trastes (o +2 cuerdas y -2 trastes)', neckShapeBass: '+1 cuerda aguda y +3 trastes', emotion: 'Nostalgia cinematográfica, dramatismo menor' },
    { semi: 9, short: '6M (6)', name: 'Sexta Mayor (9 st)', group: 'simple', simpleEquiv: '6M (9 st = Inv. de 3m)', ratio: '5:3', quality: 'Consonancia Imperfecta / Dórica', neckShapeGuitar: '+2 cuerdas agudas y -1 traste (décima/sexta pastoral)', neckShapeBass: '+2 cuerdas agudas y -1 traste', emotion: 'Calidez pastoral, dulzura dórica y colchón maj6' },
    { semi: 10, short: '7m (♭7)', name: 'Séptima Menor (10 st)', group: 'simple', simpleEquiv: '7m (10 st)', ratio: '16:9', quality: 'Disonancia Suave (Dominante / Menor 7)', neckShapeGuitar: '+2 cuerdas agudas en el mismo traste', neckShapeBass: '+2 cuerdas agudas en el mismo traste', emotion: 'Groove blues/funk, impulso dominante sin aspereza' },
    { semi: 11, short: '7M (7)', name: 'Séptima Mayor (11 st)', group: 'simple', simpleEquiv: '7M (11 st)', ratio: '15:8', quality: 'Disonancia Luminosa (Maj7)', neckShapeGuitar: '+2 cuerdas agudas y +1 traste', neckShapeBass: '+2 cuerdas agudas y +1 traste', emotion: 'Sofisticación jazzística, ensoñación y anhelo' },
    { semi: 12, short: '8J (8)', name: 'Octava Justa (12 st)', group: 'simple', simpleEquiv: '8J (12 st)', ratio: '2:1', quality: 'Consonancia Absoluta (Duplicación)', neckShapeGuitar: '+2 cuerdas agudas y +2 trastes (cuerdas 6→4 o 5→3)', neckShapeBass: '+2 cuerdas agudas y +2 trastes (octava funk)', emotion: 'Refuerzo de identidad al doble exacto de frecuencia' },
    // Compound Intervals (9ths, 11ths, 13ths)
    { semi: 13, short: '♭9 (9m)', name: 'Novena Menor (13 st = 8ª + 2m)', group: 'compound', simpleEquiv: '2ª Menor (2m + 7 grados = ♭9)', ratio: '32:15', quality: 'Tensión Compuesta Oscura (Dominante V7♭9)', neckShapeGuitar: 'Octava (+2 cuerdas, +2 trastes) + 1 traste más arriba', neckShapeBass: 'Raíz en 4ª cuerda (E) + 1ª cuerda (G) dos trastes atrás', emotion: 'Dramatismo extremo en V7(♭9) resolviendo a menor' },
    { semi: 14, short: '9M (9)', name: 'Novena Mayor (14 st = 8ª + 2M)', group: 'compound', simpleEquiv: '2ª Mayor (2M + 7 grados = 9ª)', ratio: '9:4', quality: 'Tensión Compuesta Noble (Maj9, m9, 9)', neckShapeGuitar: 'Raíz en 5ª cuerda + 2ª cuerda mismo traste (o +2 cuerdas y +4 trastes)', neckShapeBass: 'Raíz en 4ª cuerda (traste T) + 1ª cuerda (G) en traste T-1 (décima/novena abierta)', emotion: 'Amplitud panorámica moderna; evita el choque cerrado de la 2ª' },
    { semi: 15, short: '#9 (9Aum)', name: 'Novena Aumentada (15 st = 8ª + #2/♭3)', group: 'compound', simpleEquiv: '2ª Aum / 3ª Menor (#2 + 7 = #9)', ratio: '12:5', quality: 'Tensión Alterada Blues/Rock (Acorde Hendrix 7#9)', neckShapeGuitar: 'Raíz en 5ª cuerda (traste T) + 2ª cuerda en traste T+1 (sobre 3ªM en 4ª cuerda)', neckShapeBass: 'Raíz en 4ª cuerda (traste T) + 1ª cuerda (G) en mismo traste T', emotion: 'Fricción eléctrica simultánea entre modo mayor (3M) y menor (#9)' },
    { semi: 17, short: '11J (11)', name: 'Oncena Justa (17 st = 8ª + 4J)', group: 'compound', simpleEquiv: '4ª Justa (4J + 7 grados = 11ª)', ratio: '8:3', quality: 'Tensión Compuesta Modal (m11 / 9sus4)', neckShapeGuitar: 'Raíz en 6ª/5ª cuerda + 4ª justa una octava arriba', neckShapeBass: 'Raíz en 4ª cuerda (traste T) + 1ª cuerda (G) en traste T+2', emotion: 'Suspensión urbana fresca (ideal en acordes menores m11)' },
    { semi: 18, short: '#11 (11Aum)', name: 'Oncena Aumentada Lidia (18 st = 8ª + #4)', group: 'compound', simpleEquiv: '4ª Aumentada (#4 + 7 grados = #11)', ratio: '45:16', quality: 'Tensión Compuesta Luminosa (Maj7#11 / 7#11)', neckShapeGuitar: 'Raíz en 6ª/5ª cuerda + #4 en cuerdas 2ª o 1ª sin chocar con la 3ª mayor', neckShapeBass: 'Raíz en 4ª cuerda (traste T) + 1ª cuerda (G) en traste T+3', emotion: 'Maravilla espacial y brillo cinematográfico sin choque de semitono' },
    { semi: 20, short: '♭13 (13m)', name: 'Trecena Menor (20 st = 8ª + ♭6)', group: 'compound', simpleEquiv: '6ª Menor (♭6 + 7 grados = ♭13)', ratio: '16:5', quality: 'Tensión Dominante Alterada (V7♭13)', neckShapeGuitar: 'Raíz en 6ª cuerda + ♭6 en 2ª cuerda (+1 traste respecto a la raíz)', neckShapeBass: 'Raíz en 4ª cuerda (traste T) + 1ª cuerda (G) en traste T+5', emotion: 'Tensión nostálgica que cae por semitono hacia la 5ª del acorde menor' },
    { semi: 21, short: '13M (13)', name: 'Trecena Mayor (21 st = 8ª + 6M)', group: 'compound', simpleEquiv: '6ª Mayor (6M + 7 grados = 13ª)', ratio: '10:3', quality: 'Tensión Compuesta Cálida (G13, Cmaj13, Dm13)', neckShapeGuitar: 'Raíz en 6ª cuerda (traste T) + 2ª cuerda en traste T+2', neckShapeBass: 'Raíz en 4ª cuerda (traste T) + 1ª cuerda (G) en traste T+6', emotion: 'La cumbre expresiva del Jazz, Bossa Nova y R&B' },
  ];

  interface ChordPolygonPreset {
    id: string;
    label: string;
    suffix: string;
    extTag: string;
    offsets: number[];
  }

  const chordPolygonPresets: ChordPolygonPreset[] = [
    { id: 'add9', label: 'add9 (Tríada + 9ª)', suffix: 'add9', extTag: '9', offsets: [0, 4, 7, 14] },
    { id: 'maj9', label: 'maj9 (7ªM + 9ª)', suffix: 'maj9', extTag: 'maj9', offsets: [0, 4, 7, 11, 14] },
    { id: 'm9', label: 'm9 (Menor + ♭7 + 9)', suffix: 'm9', extTag: 'm9', offsets: [0, 3, 7, 10, 14] },
    { id: 'dom9', label: '9 (Dominante + 9)', suffix: '9', extTag: '9', offsets: [0, 4, 7, 10, 14] },
    { id: 'hendrix', label: '7(#9) (Hendrix)', suffix: '7(#9)', extTag: '7#9', offsets: [0, 4, 7, 10, 15] },
    { id: 'maj7s11', label: 'maj7(#11) (Lidio)', suffix: 'maj7#11', extTag: '#11', offsets: [0, 4, 7, 11, 18] },
    { id: 'dom13', label: '13 (9 + 13)', suffix: '13', extTag: '13', offsets: [0, 4, 7, 10, 14, 21] },
    { id: 'maj', label: 'Tríada Mayor', suffix: '', extTag: 'Maj', offsets: [0, 4, 7] },
    { id: 'min', label: 'Tríada Menor', suffix: 'm', extTag: 'm', offsets: [0, 3, 7] },
  ];

  const intervalNameMap: Record<number, string> = {
    1: '2m',
    2: '2M / 9',
    3: '♭3',
    4: '3',
    5: '4J',
    6: '♯4 / ♭5',
    7: '5',
    8: '♭6',
    9: '6',
    10: '♭7',
    11: '7M',
  };

  let rootPc = 0; // C
  let selectedSemi = 14; // Default: 9M (Novena Mayor)
  let visualFocus = getVisualInstrumentFocus();
  let hidePiano = visualFocus !== 'all';
  let neckMode: 'guitar' | 'bass' = visualFocus === 'bass-only' ? 'bass' : 'guitar';
  let polyPresetIdx = 0; // Default: add9 (C E G D)

  stage.innerHTML = `
    <div style="background:rgba(10,14,24,0.92); border:1px solid rgba(236,72,153,0.38); border-radius:12px; padding:14px; margin-bottom:14px;">
      <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
        <div>
          <strong style="color:#f472b6; font-size:1.05rem;">🕸️ Visualizador Geométrico de Intervalos Internos del Acorde</strong>
          <div style="font-size:0.78rem; color:#cbd5e1;">Conecta todas las notas del acorde entre sí para ver todos los intervalos que se generan. Pulsa cualquier nodo para oír la nota o cualquier intervalo entre dos notas para oír el par.</div>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
          <label style="font-size:0.78rem; font-weight:700; color:var(--accent-gold);">Acorde:</label>
          <select class="js-iv9-poly-preset">
            ${chordPolygonPresets.map((p, i) => `<option value="${i}">${p.label}</option>`).join('')}
          </select>
          <button type="button" class="btn btn-primary js-iv9-poly-play" style="font-size:0.78rem;">🔊 Escuchar Acorde Completo</button>
        </div>
      </div>
      <div class="js-iv9-polygon-host" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px; align-items:center;"></div>
    </div>

    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
        <label style="font-size:0.8rem; font-weight:700; color:var(--accent-gold);">Nota Raíz:</label>
        <select class="js-iv9-root">
          ${NOTE_LABELS.map((l, i) => `<option value="${i}" ${i === rootPc ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        <button type="button" class="btn js-iv9-neck-mode" data-mode="guitar" style="font-size:0.76rem; padding:4px 10px; background:rgba(245,158,11,0.22); color:#fbbf24; border:1px solid #f59e0b;">🎸 Mástil Guitarra (6 Cuerdas)</button>
        <button type="button" class="btn js-iv9-neck-mode" data-mode="bass" style="font-size:0.76rem; padding:4px 10px; background:rgba(30,41,59,0.9); color:#94a3b8; border:1px solid #334155;">🎸 Mástil Bajo (4 Cuerdas)</button>
        <button type="button" class="btn js-iv9-toggle-piano" style="font-size:0.76rem; padding:4px 10px;">
          ${hidePiano ? '🎹 Mostrar Piano' : '🙈 Ocultar Piano'}
        </button>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        <button type="button" class="btn btn-primary js-iv9-play-asc">▶ Melódico Ascendente</button>
        <button type="button" class="btn js-iv9-play-harm" style="background:rgba(56,189,248,0.18); color:#38bdf8; border:1px solid rgba(56,189,248,0.4);">🔊 Armónico (Juntos)</button>
        <button type="button" class="btn js-iv9-play-cmp" style="background:rgba(16,185,129,0.18); color:#34d399; border:1px solid rgba(16,185,129,0.4);">🔄 Comparar Simple vs. 9ª/Compuesto</button>
      </div>
    </div>

    <div style="margin-bottom:10px;">
      <div style="font-size:0.75rem; color:var(--accent-cyan); font-weight:700; margin-bottom:5px;">1) Intervalos Simples (Dentro de la 1ª Octava: 1 a 12 semitonos):</div>
      <div class="js-iv9-simple-btns" style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px;"></div>
      <div style="font-size:0.75rem; color:#34d399; font-weight:700; margin-bottom:5px;">2) Novenas (♭9, 9, #9), Oncenas (11, #11) y Trecenas (♭13, 13) — Intervalos Compuestos (2ª Octava):</div>
      <div class="js-iv9-comp-btns" style="display:flex; flex-wrap:wrap; gap:5px;"></div>
    </div>

    <div class="js-iv9-summary" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:14px; align-items:center; background:rgba(15,23,42,0.92); border:1px solid rgba(245,158,11,0.38); border-radius:10px; padding:12px; margin-bottom:12px;"></div>

    <div class="piano-wrapper js-iv9-piano-wrap" style="margin-bottom:12px; ${hidePiano ? 'display:none;' : ''}">
      <div class="piano-keys js-iv9-piano"></div>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:4px;">
      <strong class="js-iv9-neck-title" style="font-size:0.86rem; color:var(--accent-gold);">🎸 Geometría del Intervalo en el Mástil (0–12 Trastes)</strong>
      <span style="font-size:0.74rem; color:#94a3b8;">Dorado = Raíz (1ª) · Azul = Equivalente Simple · Verde Esmeralda = 9ª / Intervalo Objetivo (Clic en cualquier traste para sonar)</span>
    </div>
    <div class="js-iv9-neck-host"></div>
  `;

  const rootSel = stage.querySelector<HTMLSelectElement>('.js-iv9-root')!;
  const polySel = stage.querySelector<HTMLSelectElement>('.js-iv9-poly-preset')!;
  const polyHost = stage.querySelector<HTMLElement>('.js-iv9-polygon-host')!;
  const simpleBtnsEl = stage.querySelector<HTMLElement>('.js-iv9-simple-btns')!;
  const compBtnsEl = stage.querySelector<HTMLElement>('.js-iv9-comp-btns')!;
  const summaryEl = stage.querySelector<HTMLElement>('.js-iv9-summary')!;
  const pianoWrapEl = stage.querySelector<HTMLElement>('.js-iv9-piano-wrap')!;
  const pianoEl = stage.querySelector<HTMLElement>('.js-iv9-piano')!;
  const neckTitleEl = stage.querySelector<HTMLElement>('.js-iv9-neck-title')!;
  const neckHostEl = stage.querySelector<HTMLElement>('.js-iv9-neck-host')!;
  const neckModeBtns = stage.querySelectorAll<HTMLButtonElement>('.js-iv9-neck-mode');
  const togglePianoBtn = stage.querySelector<HTMLButtonElement>('.js-iv9-toggle-piano')!;

  const getSpec = (): IntervalSpec =>
    intervalsDb.find((it) => it.semi === selectedSemi) || intervalsDb[13];

  const renderPolygonGraph = (): void => {
    const preset = chordPolygonPresets[polyPresetIdx];
    const rootName = NOTE_NAMES[rootPc];
    const notes = preset.offsets.map((off) => ({
      off,
      pc: (rootPc + off) % 12,
      midi: 60 + rootPc + off,
      name: NOTE_NAMES[(rootPc + off) % 12],
    }));

    const svgW = 440;
    const svgH = 385;
    const topX = svgW / 2;
    const topY = 46;
    const polyCx = svgW / 2;
    const polyCy = 264;
    const polyR = notes.length <= 4 ? 86 : 96;

    // Vertex positions starting at top (-90 deg) clockwise
    const pts = notes.map((n, idx) => {
      const ang = ((-90 + (idx * 360) / notes.length) * Math.PI) / 180;
      return { ...n, x: polyCx + polyR * Math.cos(ang), y: polyCy + polyR * Math.sin(ang) };
    });

    // Connector lines from header note row down to polygon vertices (matching Image 2!)
    const headerNoteY = 104;
    const spacing = 26;
    const startX = topX - ((notes.length - 1) * spacing) / 2;
    const topLines: string[] = [];
    pts.forEach((pt, idx) => {
      const hx = startX + idx * spacing;
      const laneOffset = (idx - (notes.length - 1) / 2) * 14;
      const elbowY = headerNoteY + 18 + Math.abs(idx - (notes.length - 1) / 2) * 6;
      if (idx === 0) {
        topLines.push(`<polyline points="${hx},${headerNoteY + 6} ${hx},${elbowY} ${pt.x},${pt.y - 22}" fill="none" stroke="#f472b6" stroke-width="1.5" opacity="0.85"/>`);
      } else {
        const sideX = idx === notes.length - 1 ? polyCx - polyR - 26 : pt.x + laneOffset;
        topLines.push(`<polyline points="${hx},${headerNoteY + 6} ${hx},${elbowY} ${sideX},${elbowY + 12} ${sideX},${pt.y} ${pt.x},${pt.y}" fill="none" stroke="#f472b6" stroke-width="1.35" opacity="0.72"/>`);
      }
    });

    // All pairwise edges inside polygon
    const pairEdges: string[] = [];
    const pairItems: { aName: string; bName: string; aMidi: number; bMidi: number; semi: number; label: string; isClash: boolean }[] = [];

    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i];
        const b = pts[j];
        const rawDiff = b.off - a.off;
        const modDiff = ((b.pc - a.pc) % 12 + 12) % 12;
        const badgeLabel =
          i === 0 && rawDiff === 14
            ? '9'
            : i === 0 && rawDiff === 15
              ? '#9'
              : i === 0 && rawDiff === 18
                ? '#11'
                : i === 0 && rawDiff === 21
                  ? '13'
                  : intervalNameMap[modDiff] || `${modDiff}st`;
        const isClash = modDiff === 1 || modDiff === 6;

        // Place badge slightly shifted along edge so overlapping diagonals don't collide
        const t = (i + j) % 2 === 0 ? 0.44 : 0.56;
        const mx = a.x + (b.x - a.x) * t;
        const my = a.y + (b.y - a.y) * t;
        const edgeCol = isClash ? '#fb7185' : modDiff === 7 ? '#34d399' : '#94a3b8';

        pairEdges.push(`
          <g class="js-iv9-pair-edge" data-ma="${a.midi}" data-mb="${b.midi}" data-semi="${rawDiff}" data-desc="${a.name} → ${b.name} (${badgeLabel})" style="cursor:pointer;">
            <line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${edgeCol}" stroke-width="${isClash ? 1.8 : 1.3}" opacity="0.78"/>
            <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="10.5" fill="#1e293b" stroke="${edgeCol}" stroke-width="1.3"/>
            <text x="${mx.toFixed(1)}" y="${(my + 3.4).toFixed(1)}" text-anchor="middle" fill="${isClash ? '#fda4af' : '#f8fafc'}" font-size="8.2" font-weight="800">${badgeLabel}</text>
          </g>
        `);
        pairItems.push({
          aName: a.name,
          bName: b.name,
          aMidi: a.midi,
          bMidi: b.midi,
          semi: rawDiff,
          label: badgeLabel,
          isClash,
        });
      }
    }

    const vertexNodes = pts
      .map(
        (pt, idx) => `
      <g class="js-iv9-poly-note" data-midi="${pt.midi}" data-name="${pt.name}" style="cursor:pointer;">
        <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="20" fill="${idx === 0 ? 'rgba(245,158,11,0.22)' : '#090d16'}" stroke="${idx === 0 ? '#fbbf24' : '#f8fafc'}" stroke-width="${idx === 0 ? 2.4 : 1.7}"/>
        <text x="${pt.x.toFixed(1)}" y="${(pt.y + 5.5).toFixed(1)}" text-anchor="middle" fill="${idx === 0 ? '#fef08a' : '#f8fafc'}" font-size="14" font-weight="900">${pt.name}</text>
      </g>
    `
      )
      .join('');

    const headerNoteTexts = notes
      .map((n, idx) => `<text x="${startX + idx * spacing}" y="${headerNoteY}" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="800">${n.name}</text>`)
      .join('');

    const svgHtml = `
      <svg viewBox="0 0 ${svgW} ${svgH}" style="width:100%; max-width:450px; height:auto; background:rgba(7,10,18,0.85); border:1px solid rgba(236,72,153,0.28); border-radius:10px; user-select:none;">
        <g class="js-iv9-poly-play" style="cursor:pointer;">
          <circle cx="${topX}" cy="${topY}" r="28" fill="none" stroke="#ec4899" stroke-width="2.5" stroke-dasharray="140,28"/>
          <text x="${topX}" y="${topY + 8}" text-anchor="middle" fill="#f472b6" font-size="22" font-weight="900">${rootName}</text>
          <text x="${topX}" y="${topY + 41}" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="700">${preset.extTag}</text>
        </g>
        ${headerNoteTexts}
        ${topLines.join('')}
        ${pairEdges.join('')}
        ${vertexNodes}
      </svg>
    `;

    const pairListHtml = `
      <div>
        <h4 style="margin:0 0 8px 0; color:var(--accent-gold); font-size:1rem;">
          Analizando <code>${rootName}${preset.suffix}</code> (${notes.map((n) => n.name).join(' – ')})
        </h4>
        <p style="font-size:0.81rem; color:#cbd5e1; margin:0 0 8px 0;">
          Un acorde no solo tiene intervalos respecto a la tónica: <strong>cada par de notas internas genera su propio intervalo</strong>. Haz clic en cualquier par de abajo o en los círculos del diagrama para escucharlo y proyectarlo en el mástil:
        </p>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(195px, 1fr)); gap:6px; max-height:260px; overflow-y:auto;">
          ${pairItems
            .map(
              (p) => `
            <button type="button" class="js-iv9-pair-edge" data-ma="${p.aMidi}" data-mb="${p.bMidi}" data-semi="${p.semi}" data-desc="${p.aName} → ${p.bName} (${p.label})" style="text-align:left; padding:6px 9px; border-radius:6px; background:${p.isClash ? 'rgba(244,63,94,0.14)' : 'rgba(30,41,59,0.85)'}; border:1px solid ${p.isClash ? 'rgba(244,63,94,0.45)' : 'rgba(56,189,248,0.25)'}; color:#e2e8f0; font-size:0.77rem; cursor:pointer;">
              • Entre <strong style="color:#fbbf24;">${p.aName}</strong> y <strong style="color:#38bdf8;">${p.bName}</strong> hay <strong style="color:${p.isClash ? '#fda4af' : '#4ade80'};">${p.label}</strong> ${p.isClash ? '⚠️' : '🔊'}
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    polyHost.innerHTML = pairListHtml + `<div style="display:flex; justify-content:center;">${svgHtml}</div>`;
  };

  const render = (): void => {
    renderPolygonGraph();
    const spec = getSpec();
    const isBass = neckMode === 'bass';
    const baseMidi = isBass ? 36 + rootPc : 48 + rootPc;
    const targetMidi = baseMidi + spec.semi;
    const simpleSemi = spec.semi > 12 ? spec.semi - 12 : spec.semi;
    const rootName = NOTE_NAMES[rootPc];
    const targetPc = (rootPc + spec.semi) % 12;
    const targetName = NOTE_NAMES[targetPc];

    pianoWrapEl.style.display = hidePiano ? 'none' : '';
    togglePianoBtn.textContent = hidePiano ? '🎹 Mostrar Piano' : '🙈 Ocultar Piano';
    togglePianoBtn.style.background = hidePiano ? 'rgba(245,158,11,0.2)' : 'rgba(30,41,59,0.9)';
    togglePianoBtn.style.color = hidePiano ? '#fbbf24' : '#cbd5e1';
    togglePianoBtn.style.border = hidePiano ? '1px solid rgba(245,158,11,0.45)' : '1px solid #334155';

    neckModeBtns.forEach((b) => {
      const active = b.getAttribute('data-mode') === neckMode;
      b.style.background = active ? 'rgba(245,158,11,0.24)' : 'rgba(30,41,59,0.9)';
      b.style.color = active ? '#fbbf24' : '#94a3b8';
      b.style.borderColor = active ? '#f59e0b' : '#334155';
    });

    const renderBtnGroup = (group: 'simple' | 'compound') =>
      intervalsDb
        .filter((it) => it.group === group)
        .map((it) => {
          const active = it.semi === selectedSemi;
          const borderCol = group === 'compound' ? '#10b981' : '#38bdf8';
          return `<button type="button" class="btn js-iv9-pick" data-semi="${it.semi}" style="font-size:0.75rem; padding:5px 9px; background:${active ? (group === 'compound' ? 'rgba(16,185,129,0.28)' : 'rgba(56,189,248,0.28)') : 'rgba(30,41,59,0.88)'}; color:${active ? '#ffffff' : '#cbd5e1'}; border:1.5px solid ${active ? borderCol : '#334155'}; font-weight:${active ? '800' : '600'};">${it.short}</button>`;
        })
        .join('');

    simpleBtnsEl.innerHTML = renderBtnGroup('simple');
    compBtnsEl.innerHTML = renderBtnGroup('compound');

    const dyadMidis = [baseMidi, targetMidi];
    summaryEl.innerHTML = `
      <div>
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-bottom:4px;">
          <span style="font-size:1.15rem; font-weight:900; color:var(--accent-gold);">${rootName} → ${targetName} (${spec.name})</span>
          <span style="font-size:0.75rem; padding:2px 8px; border-radius:4px; background:rgba(16,185,129,0.2); color:#34d399; font-weight:700;">${spec.quality}</span>
          <span style="font-size:0.74rem; color:#94a3b8; font-family:monospace;">Proporción Acústica: ${spec.ratio}</span>
        </div>
        <div style="font-size:0.82rem; color:#e2e8f0; margin-bottom:4px;">
          <strong>Regla Simple ↔ Compuesto:</strong> ${spec.simpleEquiv} · <strong>Sensación:</strong> ${spec.emotion}
        </div>
        <div style="font-size:0.8rem; color:var(--accent-cyan);">
          <strong>📐 Geometría en ${isBass ? 'Bajo Eléctrico (4 Cuerdas)' : 'Guitarra (6 Cuerdas)'}:</strong> ${isBass ? spec.neckShapeBass : spec.neckShapeGuitar}
        </div>
      </div>
      <div>
        ${renderMiniChordNeckSvg(dyadMidis, baseMidi, neckMode)}
      </div>
    `;

    // 2-Octave Piano (C4 = 60 to B5 = 83)
    const pianoRootMidi = 60 + rootPc;
    const pianoTargetMidi = pianoRootMidi + spec.semi;
    const pianoSimpleMidi = pianoRootMidi + simpleSemi;
    let pianoHtml = '';
    for (let oct = 0; oct < 2; oct++) {
      for (let pc = 0; pc < 12; pc++) {
        const midi = 60 + oct * 12 + pc;
        const isBlack = [1, 3, 6, 8, 10].includes(pc);
        const isRootKey = midi === pianoRootMidi;
        const isTargetKey = midi === pianoTargetMidi;
        const isSimpleKey = spec.semi > 12 && midi === pianoSimpleMidi;
        const keyClass = isBlack ? 'key-black' : 'key-white';
        const stateClass = isRootKey ? 'is-root' : isTargetKey || isSimpleKey ? 'in-scale' : '';
        const extraStyle = isTargetKey && spec.semi > 12 ? 'background:#10b981 !important; color:#052e16 !important;' : '';
        pianoHtml += `<div class="${keyClass} ${stateClass} js-iv9-key" data-midi="${midi}" style="${extraStyle}" title="${NOTE_NAMES[pc]}${4 + oct}"><span>${NOTE_NAMES[pc]}${isRootKey ? ' (1)' : isTargetKey ? ` (${spec.short.split(' ')[0]})` : isSimpleKey ? ' (Simple)' : ''}</span></div>`;
      }
    }
    pianoEl.innerHTML = pianoHtml;

    // 12-Fret Interactive Neck
    const stringsConfig = isBass ? BASS_STRINGS : GUITAR_STRINGS;
    neckTitleEl.textContent = isBass
      ? `🎸 Mapa del Intervalo ${spec.short} (${rootName} → ${targetName}) en BAJO ELÉCTRICO (4 Cuerdas: G–D–A–E)`
      : `🎸 Mapa del Intervalo ${spec.short} (${rootName} → ${targetName}) en GUITARRA (6 Cuerdas: e–B–G–D–A–E)`;

    let neckHtml = `<div class="fretboard-wrapper">`;
    neckHtml += `<div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.16); margin-bottom:4px;"><div class="string-label" style="color:var(--text-muted); font-size:0.7rem;">Traste</div>`;
    for (let f = 0; f <= 12; f++) {
      const marker = [3, 5, 7, 9, 12].includes(f) ? '•' : '';
      neckHtml += `<div class="fret-cell" style="height:20px; border:none; color:var(--text-muted); font-size:0.72rem; font-weight:700;">${f === 0 ? '0' : `${f}${marker}`}</div>`;
    }
    neckHtml += `</div>`;

    stringsConfig.forEach((st) => {
      neckHtml += `<div class="fretboard-row"><div class="string-label" style="color:${isBass ? '#38bdf8' : '#fbbf24'};">${st.label}</div>`;
      for (let f = 0; f <= 12; f++) {
        const midi = st.openMidi + f;
        const pc = midi % 12;
        const noteName = NOTE_NAMES[pc];
        const isRoot = pc === rootPc;
        const isTarget = pc === targetPc;
        const stateClass = isRoot ? 'root' : isTarget ? (spec.group === 'compound' ? 'char' : 'active') : '';
        neckHtml += `
          <div class="fret-cell js-iv9-cell" data-midi="${midi}" title="Cuerda ${st.label}, Traste ${f}: ${noteName}">
            <div class="fret-note ${stateClass}">${noteName}</div>
          </div>
        `;
      }
      neckHtml += `</div>`;
    });
    neckHtml += `</div>`;
    neckHostEl.innerHTML = neckHtml;
  };

  const playInterval = (mode: 'asc' | 'harm' | 'cmp'): void => {
    const spec = getSpec();
    const isBass = neckMode === 'bass';
    const baseMidi = isBass ? 36 + rootPc : 52 + rootPc;
    const targetMidi = baseMidi + spec.semi;
    const simpleMidi = baseMidi + (spec.semi > 12 ? spec.semi - 12 : spec.semi);
    audio.stopAll();

    const playNote = (m: number, dur: number, delay: number) => {
      if (isBass) {
        audio.playElectricBass(m, dur, delay, 0.38, 'finger', false);
      } else {
        audio.playPluckedGuitar(m, dur, delay, 0.3, false);
        if (!hidePiano) {
          audio.playAcousticPiano(m, dur, delay, 0.22, false);
        }
      }
    };

    if (mode === 'asc') {
      playNote(baseMidi, 0.9, 0);
      playNote(targetMidi, 1.3, 0.55);
      onStatus(`Intervalo Melódico: ${NOTE_NAMES[rootPc]} → ${NOTE_NAMES[(rootPc + spec.semi) % 12]} (${spec.name})`);
    } else if (mode === 'harm') {
      playNote(baseMidi, 1.5, 0);
      playNote(targetMidi, 1.5, 0.03);
      onStatus(`Intervalo Armónico: ${NOTE_NAMES[rootPc]} + ${NOTE_NAMES[(rootPc + spec.semi) % 12]} (${spec.name})`);
    } else {
      const compMidi = spec.semi <= 12 ? baseMidi + spec.semi + 12 : targetMidi;
      playNote(baseMidi, 1.0, 0);
      playNote(simpleMidi, 1.0, 0.04);
      playNote(baseMidi, 1.3, 0.95);
      playNote(compMidi, 1.3, 0.99);
      onStatus(`Comparando Intervalo Simple Cerrado vs. Compuesto Abierto (Octava Superior / 9ª-11ª-13ª)`);
    }
  };

  render();

  const onIv9VisualChange = () => {
    if (!stage.isConnected) {
      window.removeEventListener('enciclopedia:visual-instrument-change', onIv9VisualChange);
      return;
    }
    visualFocus = getVisualInstrumentFocus();
    hidePiano = visualFocus !== 'all';
    if (visualFocus === 'bass-only') neckMode = 'bass';
    else if (visualFocus === 'guitar-only') neckMode = 'guitar';
    render();
  };
  window.addEventListener('enciclopedia:visual-instrument-change', onIv9VisualChange);

  rootSel.addEventListener('change', () => {
    rootPc = parseInt(rootSel.value, 10);
    render();
    playInterval('asc');
  });

  polySel.addEventListener('change', () => {
    polyPresetIdx = parseInt(polySel.value, 10);
    renderPolygonGraph();
    const preset = chordPolygonPresets[polyPresetIdx];
    audio.stopAll();
    const midis = preset.offsets.map((o) => 48 + rootPc + o);
    if (neckMode === 'bass') {
      midis.forEach((m, i) => audio.playElectricBass(m - 12, 0.7, i * 0.14, 0.34, 'finger', false));
    } else {
      audio.strumChord(midis, hidePiano ? 'guitar' : 'piano', 0, false);
    }
    onStatus(`Analizando acorde ${NOTE_NAMES[rootPc]}${preset.suffix}`);
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const polyPlay = target.closest('.js-iv9-poly-play');
    if (polyPlay) {
      const preset = chordPolygonPresets[polyPresetIdx];
      audio.stopAll();
      const midis = preset.offsets.map((o) => 48 + rootPc + o);
      if (neckMode === 'bass') {
        midis.forEach((m, i) => audio.playElectricBass(m - 12, 0.72, i * 0.14, 0.36, 'finger', false));
      } else {
        audio.playElectricBass(36 + rootPc, 1.4, 0, 0.36, 'finger', false, { skipGlow: true });
        audio.strumChord(midis, hidePiano ? 'guitar' : 'piano', 0, false);
      }
      onStatus(`Acorde completo: ${NOTE_NAMES[rootPc]}${preset.suffix}`);
      return;
    }
    const polyNote = target.closest<HTMLElement>('.js-iv9-poly-note');
    if (polyNote) {
      const midi = parseInt(polyNote.getAttribute('data-midi')!, 10);
      if (neckMode === 'bass') {
        audio.playElectricBass(midi - 12, 1.1, 0, 0.36, 'finger', true);
      } else if (hidePiano) {
        audio.playPluckedGuitar(midi, 1.1, 0, 0.32, true);
      } else {
        audio.playAcousticPiano(midi, 1.1, 0, 0.35, true);
      }
      onStatus(`Nota del polígono: ${polyNote.getAttribute('data-name')}`);
      return;
    }
    const pairEdge = target.closest<HTMLElement>('.js-iv9-pair-edge');
    if (pairEdge) {
      const ma = parseInt(pairEdge.getAttribute('data-ma')!, 10);
      const mb = parseInt(pairEdge.getAttribute('data-mb')!, 10);
      const rawSemi = parseInt(pairEdge.getAttribute('data-semi')!, 10);
      const desc = pairEdge.getAttribute('data-desc') || '';
      audio.stopAll();
      const playEdgeNote = (m: number, dur: number, del: number) => {
        if (neckMode === 'bass') {
          audio.playElectricBass(m - 12, dur, del, 0.35, 'finger', false);
        } else if (hidePiano) {
          audio.playPluckedGuitar(m, dur, del, 0.3, false);
        } else {
          audio.playAcousticPiano(m, dur, del, 0.3, false);
        }
      };
      playEdgeNote(ma, 0.9, 0);
      playEdgeNote(mb, 1.1, 0.35);
      playEdgeNote(ma, 1.2, 0.8);
      playEdgeNote(mb, 1.2, 0.82);
      if (intervalsDb.some((it) => it.semi === rawSemi)) {
        selectedSemi = rawSemi;
        render();
      }
      onStatus(`Intervalo interno del acorde: ${desc}`);
      return;
    }
    if (target.closest('.js-iv9-toggle-piano')) {
      if (hidePiano) {
        setVisualInstrumentFocus('all');
      } else {
        setVisualInstrumentFocus(neckMode === 'bass' ? 'bass-only' : 'guitar-only');
      }
      return;
    }
    const pickBtn = target.closest<HTMLElement>('.js-iv9-pick');
    if (pickBtn) {
      selectedSemi = parseInt(pickBtn.getAttribute('data-semi')!, 10);
      render();
      playInterval('asc');
      return;
    }
    const modeBtn = target.closest<HTMLElement>('.js-iv9-neck-mode');
    if (modeBtn) {
      neckMode = (modeBtn.getAttribute('data-mode') as 'guitar' | 'bass') || 'guitar';
      if (hidePiano) {
        setVisualInstrumentFocus(neckMode === 'bass' ? 'bass-only' : 'guitar-only');
      }
      render();
      onStatus(`Visualizador de Intervalos: Mástil cambiado a ${neckMode === 'bass' ? 'Bajo (4 Cuerdas)' : 'Guitarra (6 Cuerdas)'}`);
      return;
    }
    const cell = target.closest<HTMLElement>('.js-iv9-cell, .js-iv9-key');
    if (cell) {
      const midi = parseInt(cell.getAttribute('data-midi')!, 10);
      if (neckMode === 'bass') {
        audio.playElectricBass(midi, 1.1, 0, 0.38, 'finger', true);
      } else {
        audio.playPluckedGuitar(midi, 1.1, 0, 0.3, true);
      }
      return;
    }
    if (target.closest('.js-iv9-play-asc')) playInterval('asc');
    else if (target.closest('.js-iv9-play-harm')) playInterval('harm');
    else if (target.closest('.js-iv9-play-cmp')) playInterval('cmp');
  });
}

/**
 * NEW LAB 18: Interactive Polychords & Upper Structure Triads Visualizer (`X | Y`)
 * (`data-lab="polychord-visualizer"`)
 */
function buildPolychordVisualizerLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  interface PolychordPreset {
    name: string;
    upperOffset: number;
    upperMinor: boolean;
    baseType: 'maj' | 'min' | 'dom7' | 'maj7';
    resultingSymbol: string;
    tensions: string;
    usage: string;
  }

  const presets: PolychordPreset[] = [
    {
      name: '1) II | I  (Ej: D | C → Cmaj9(#11) Lidio Cinematográfico)',
      upperOffset: 2,
      upperMinor: false,
      baseType: 'maj7',
      resultingSymbol: 'maj9(#11)',
      tensions: '9ª Mayor (D) + #11 Lidia (F#) + 13ª Mayor (A)',
      usage: 'Sonoridad de asombro espacial (John Williams / Pat Metheny / Joe Satriani): la tríada mayor del II grado sobre la base del I.',
    },
    {
      name: '2) V | I  (Ej: G | C → Cmaj9 Luminoso y Estable)',
      upperOffset: 7,
      upperMinor: false,
      baseType: 'maj',
      resultingSymbol: 'maj9',
      tensions: '5ª (G) + 7ª Mayor (B) + 9ª Mayor (D)',
      usage: 'La forma más rápida de tocar un acorde Maj9 amplio sin saturar el registro grave.',
    },
    {
      name: '3) vii | I  (Ej: Bm | C → Cmaj9(#11) sin duplicar fundamental)',
      upperOffset: 11,
      upperMinor: true,
      baseType: 'maj',
      resultingSymbol: 'maj9(#11)',
      tensions: '7ª Mayor (B) + 9ª Mayor (D) + #11 Lidia (F#)',
      usage: 'Poliacorde favorito de Bill Evans y Ravel: la tríada menor del 7º grado flota encima de la tríada tónica.',
    },
    {
      name: '4) ii | I  (Ej: Dm | C → C11 / C9sus4 Modal Urbano)',
      upperOffset: 2,
      upperMinor: true,
      baseType: 'maj',
      resultingSymbol: '9sus4 (11)',
      tensions: '9ª Mayor (D) + 11ª Justa (F) + 13ª Mayor (A)',
      usage: 'Clásico del Soul, Gospel y Pop sofisticado (Herbie Hancock / Stevie Wonder).',
    },
    {
      name: '5) #IV | I7  (Ej: F# | C7 → C7(♭9,#11) Dominante Simétrico Disminuido)',
      upperOffset: 6,
      upperMinor: false,
      baseType: 'dom7',
      resultingSymbol: '7(♭9,#11)',
      tensions: '#11 (F#) + 13ª Mayor (A#) + ♭9 (C#/Db)',
      usage: 'Upper Structure Triad estrella del Jazz moderno: superpone dos tritonos a distancia de 6 semitonos (escala octatónica).',
    },
    {
      name: '6) VI | I7  (Ej: A | C7 → C13(♭9) Dominante Dramático)',
      upperOffset: 9,
      upperMinor: false,
      baseType: 'dom7',
      resultingSymbol: '13(♭9)',
      tensions: '13ª Mayor (A) + ♭9 (C#/Db) + 3ª Mayor (E)',
      usage: 'Brillo de metales de Big Band antes de caer al I Mayor o i Menor.',
    },
    {
      name: '7) ♭VI | I7  (Ej: Ab | C7 → C7(#9,♭13) Dominante Alterado Superlocrio)',
      upperOffset: 8,
      upperMinor: false,
      baseType: 'dom7',
      resultingSymbol: '7(#9,♭13)',
      tensions: '♭13 (Ab) + Fundamental (C) + #9 (Eb)',
      usage: 'Máxima tensión alterada para resolver a un acorde menor (Cm9 o Fm9).',
    },
    {
      name: '8) III | I7  (Ej: E | C7 → C7(♭9,#5) Dominante Aumentado Alterado)',
      upperOffset: 4,
      upperMinor: false,
      baseType: 'dom7',
      resultingSymbol: '7(♭9,#5)',
      tensions: '3ª Mayor (E) + #5/♭13 (G#) + 7ªM/♭9 cromática',
      usage: 'Color impresionista que empuja por semitono todas las voces superiores.',
    },
  ];

  let rootPc = 0; // C
  let pIdx = 0;
  let neckMode: 'guitar' | 'bass' = 'guitar';

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
        <label style="font-size:0.8rem; font-weight:700; color:var(--accent-gold);">Tónica Base:</label>
        <select class="js-poly-root">
          ${NOTE_LABELS.map((l, i) => `<option value="${i}" ${i === rootPc ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        <label style="font-size:0.8rem; font-weight:700; color:var(--accent-cyan);">Fórmula Poliacorde (Superior | Base):</label>
        <select class="js-poly-preset" style="max-width:100%;">
          ${presets.map((p, i) => `<option value="${i}">${p.name}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        <button type="button" class="btn js-poly-neck-mode" data-mode="guitar" style="font-size:0.75rem; padding:4px 10px; background:rgba(245,158,11,0.22); color:#fbbf24; border:1px solid #f59e0b;">🎸 Mástil Guitarra (6c)</button>
        <button type="button" class="btn js-poly-neck-mode" data-mode="bass" style="font-size:0.75rem; padding:4px 10px; background:rgba(30,41,59,0.9); color:#94a3b8; border:1px solid #334155;">🎸 Mástil Bajo (4c)</button>
      </div>
    </div>

    <div class="js-poly-cards" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:14px;"></div>

    <div style="background:rgba(15,23,42,0.92); border:1px solid rgba(56,189,248,0.35); border-radius:10px; padding:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
        <strong class="js-poly-neck-title" style="color:var(--accent-gold); font-size:0.88rem;">🎸 Mapa Bicolor del Poliacorde en el Mástil (0–12 Trastes)</strong>
        <span style="font-size:0.74rem; color:#94a3b8;">Dorado = Fundamental Base · Azul = Notas del Acorde Base · Verde Esmeralda = Tríada Superior (Upper Structure)</span>
      </div>
      <div class="js-poly-neck-host"></div>
    </div>
  `;

  const rootSel = stage.querySelector<HTMLSelectElement>('.js-poly-root')!;
  const presetSel = stage.querySelector<HTMLSelectElement>('.js-poly-preset')!;
  const cardsEl = stage.querySelector<HTMLElement>('.js-poly-cards')!;
  const neckTitleEl = stage.querySelector<HTMLElement>('.js-poly-neck-title')!;
  const neckHostEl = stage.querySelector<HTMLElement>('.js-poly-neck-host')!;
  const neckModeBtns = stage.querySelectorAll<HTMLButtonElement>('.js-poly-neck-mode');

  const computeStructures = () => {
    const pr = presets[pIdx];
    const baseRootMidi = 48 + rootPc;
    const baseMidis =
      pr.baseType === 'dom7'
        ? [baseRootMidi, baseRootMidi + 4, baseRootMidi + 10] // Shell 1-3-b7
        : pr.baseType === 'maj7'
          ? [baseRootMidi, baseRootMidi + 4, baseRootMidi + 11]
          : pr.baseType === 'min'
            ? [baseRootMidi, baseRootMidi + 3, baseRootMidi + 7]
            : [baseRootMidi, baseRootMidi + 4, baseRootMidi + 7];

    const upperRootPc = (rootPc + pr.upperOffset) % 12;
    const upperRootMidi = 60 + upperRootPc;
    const upperMidis = [
      upperRootMidi,
      upperRootMidi + (pr.upperMinor ? 3 : 4),
      upperRootMidi + 7,
    ];

    const baseName = `${NOTE_NAMES[rootPc]}${pr.baseType === 'dom7' ? '7' : pr.baseType === 'maj7' ? 'maj7' : pr.baseType === 'min' ? 'm' : ''}`;
    const upperName = `${NOTE_NAMES[upperRootPc]}${pr.upperMinor ? 'm' : ''}`;
    const combinedMidis = [...baseMidis, ...upperMidis];

    return { pr, baseName, upperName, baseMidis, upperMidis, combinedMidis, baseRootMidi, upperRootMidi };
  };

  const render = (): void => {
    const { pr, baseName, upperName, baseMidis, upperMidis, combinedMidis, baseRootMidi, upperRootMidi } =
      computeStructures();
    const isBass = neckMode === 'bass';

    neckModeBtns.forEach((b) => {
      const active = b.getAttribute('data-mode') === neckMode;
      b.style.background = active ? 'rgba(245,158,11,0.24)' : 'rgba(30,41,59,0.9)';
      b.style.color = active ? '#fbbf24' : '#94a3b8';
      b.style.borderColor = active ? '#f59e0b' : '#334155';
    });

    const baseNotes = baseMidis.map((m) => NOTE_NAMES[m % 12]).join('–');
    const upperNotes = upperMidis.map((m) => NOTE_NAMES[m % 12]).join('–');
    const allNotes = Array.from(new Set(combinedMidis.map((m) => NOTE_NAMES[m % 12]))).join('–');

    cardsEl.innerHTML = `
      <div style="background:rgba(30,41,59,0.9); border:1px solid #f59e0b; border-radius:10px; padding:12px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; text-align:center;">
        <div>
          <div style="font-size:0.72rem; color:#fbbf24; font-weight:700;">1. ESTRUCTURA BASE INFERIOR</div>
          <div style="font-size:1.15rem; font-weight:900; color:#f8fafc; margin:2px 0;">${baseName} <span style="font-size:0.8rem; color:#fde68a; font-family:monospace;">[${baseNotes}]</span></div>
          <div style="font-size:0.72rem; color:#94a3b8;">Cimiento grave y tritono/tercera guía</div>
        </div>
        ${renderMiniChordNeckSvg(baseMidis, baseRootMidi - 12, neckMode)}
        <button type="button" class="btn js-poly-play-base" style="margin-top:6px; width:100%; font-size:0.75rem; background:rgba(245,158,11,0.2); color:#fbbf24; border:1px solid #f59e0b;">🔊 1. Escuchar Solo Base (${baseName})</button>
      </div>

      <div style="background:rgba(30,41,59,0.9); border:1px solid #10b981; border-radius:10px; padding:12px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; text-align:center;">
        <div>
          <div style="font-size:0.72rem; color:#34d399; font-weight:700;">2. TRÍADA SUPERIOR (UPPER STRUCTURE)</div>
          <div style="font-size:1.15rem; font-weight:900; color:#f8fafc; margin:2px 0;">${upperName} <span style="font-size:0.8rem; color:#a7f3d0; font-family:monospace;">[${upperNotes}]</span></div>
          <div style="font-size:0.72rem; color:#94a3b8;">Aporta: ${pr.tensions}</div>
        </div>
        ${renderMiniChordNeckSvg(upperMidis, upperRootMidi - 12, neckMode)}
        <button type="button" class="btn js-poly-play-upper" style="margin-top:6px; width:100%; font-size:0.75rem; background:rgba(16,185,129,0.2); color:#34d399; border:1px solid #10b981;">🔊 2. Escuchar Solo Tríada Superior (${upperName})</button>
      </div>

      <div style="background:rgba(15,23,42,0.96); border:2px solid #38bdf8; border-radius:10px; padding:12px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; text-align:center;">
        <div>
          <div style="font-size:0.72rem; color:#38bdf8; font-weight:800;">3. POLIACORDE COMPLETO (SUPERIOR | BASE)</div>
          <div style="font-size:1.2rem; font-weight:900; color:var(--accent-gold); margin:2px 0;">${upperName} | ${baseName} = ${NOTE_NAMES[rootPc]}${pr.resultingSymbol}</div>
          <div style="font-size:0.72rem; color:#cbd5e1; font-family:monospace;">[${allNotes}]</div>
          <div style="font-size:0.71rem; color:#bae6fd; margin-top:3px;">${pr.usage}</div>
        </div>
        ${renderMiniChordNeckSvg(combinedMidis, baseRootMidi - 12, neckMode)}
        <button type="button" class="btn btn-primary js-poly-play-both" style="margin-top:6px; width:100%; font-size:0.78rem;">▶ 3. Escuchar Poliacorde Completo (${upperName} | ${baseName})</button>
      </div>
    `;

    // 12-Fret Dual-Color Neck
    const basePcs = new Set(baseMidis.map((m) => m % 12));
    const upperPcs = new Set(upperMidis.map((m) => m % 12));
    const stringsConfig = isBass ? BASS_STRINGS : GUITAR_STRINGS;
    neckTitleEl.textContent = isBass
      ? `🎸 Poliacorde ${upperName} | ${baseName} (${NOTE_NAMES[rootPc]}${pr.resultingSymbol}) en BAJO ELÉCTRICO (4 Cuerdas: G–D–A–E)`
      : `🎸 Poliacorde ${upperName} | ${baseName} (${NOTE_NAMES[rootPc]}${pr.resultingSymbol}) en GUITARRA (6 Cuerdas: e–B–G–D–A–E)`;

    let neckHtml = `<div class="fretboard-wrapper">`;
    neckHtml += `<div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.16); margin-bottom:4px;"><div class="string-label" style="color:var(--text-muted); font-size:0.7rem;">Traste</div>`;
    for (let f = 0; f <= 12; f++) {
      const marker = [3, 5, 7, 9, 12].includes(f) ? '•' : '';
      neckHtml += `<div class="fret-cell" style="height:20px; border:none; color:var(--text-muted); font-size:0.72rem; font-weight:700;">${f === 0 ? '0' : `${f}${marker}`}</div>`;
    }
    neckHtml += `</div>`;

    stringsConfig.forEach((st) => {
      neckHtml += `<div class="fretboard-row"><div class="string-label" style="color:${isBass ? '#38bdf8' : '#fbbf24'};">${st.label}</div>`;
      for (let f = 0; f <= 12; f++) {
        const midi = st.openMidi + f;
        const pc = midi % 12;
        const noteName = NOTE_NAMES[pc];
        const isRoot = pc === rootPc;
        const isUpper = upperPcs.has(pc);
        const isBase = basePcs.has(pc);
        const stateClass = isRoot ? 'root' : isUpper ? 'char' : isBase ? 'active' : '';
        neckHtml += `
          <div class="fret-cell js-poly-cell" data-midi="${midi}" title="Cuerda ${st.label}, Traste ${f}: ${noteName}${isUpper ? ` (Tríada Superior ${upperName})` : isBase ? ` (Base ${baseName})` : ''}">
            <div class="fret-note ${stateClass}">${noteName}</div>
          </div>
        `;
      }
      neckHtml += `</div>`;
    });
    neckHtml += `</div>`;
    neckHostEl.innerHTML = neckHtml;
  };

  render();

  rootSel.addEventListener('change', () => {
    rootPc = parseInt(rootSel.value, 10);
    render();
  });

  presetSel.addEventListener('change', () => {
    pIdx = parseInt(presetSel.value, 10);
    render();
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const modeBtn = target.closest<HTMLElement>('.js-poly-neck-mode');
    if (modeBtn) {
      neckMode = (modeBtn.getAttribute('data-mode') as 'guitar' | 'bass') || 'guitar';
      render();
      onStatus(`Visualizador de Poliacordes: Mástil cambiado a ${neckMode === 'bass' ? 'Bajo (4 Cuerdas)' : 'Guitarra (6 Cuerdas)'}`);
      return;
    }

    const cell = target.closest<HTMLElement>('.js-poly-cell');
    if (cell) {
      const midi = parseInt(cell.getAttribute('data-midi')!, 10);
      if (neckMode === 'bass') {
        audio.playElectricBass(midi, 1.1, 0, 0.38, 'finger', true);
      } else {
        audio.playPluckedGuitar(midi, 1.1, 0, 0.3, true);
      }
      return;
    }

    const { pr, baseName, upperName, baseMidis, upperMidis, baseRootMidi } = computeStructures();
    if (target.closest('.js-poly-play-base')) {
      audio.stopAll();
      audio.playElectricBass(baseRootMidi - 12, 1.3, 0, 0.38, 'finger', false, { isChord: true, chordGroup: 901 });
      audio.strumChord(baseMidis, neckMode === 'bass' ? 'guitar' : 'piano', 0, false);
      onStatus(`Estructura Base Inferior: ${baseName}`);
    } else if (target.closest('.js-poly-play-upper')) {
      audio.stopAll();
      audio.strumChord(upperMidis, neckMode === 'bass' ? 'guitar' : 'piano', 0, false);
      onStatus(`Tríada Superior (Upper Structure): ${upperName} (${pr.tensions})`);
    } else if (target.closest('.js-poly-play-both')) {
      audio.stopAll();
      audio.strumChord([...baseMidis, ...upperMidis], neckMode === 'bass' ? 'guitar' : 'piano', 0, false);
      onStatus(`Poliacorde Completo: ${upperName} | ${baseName} = ${NOTE_NAMES[rootPc]}${pr.resultingSymbol}`);
    }
  });
}

/**
 * NEW LAB 19: Interactive Neighbor Chords Visualizer (`data-lab="neighbor-chords-visualizer"`)
 */
function buildNeighborChordsVisualizerLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  interface NeighborFamily {
    name: string;
    desc: string;
    voiceRule: string;
    buildSteps: (rootPc: number) => {
      title: string;
      role: string;
      midis: number[];
      bassMidi: number;
      fretDelta: string;
    }[];
  }

  const nName = (pc: number) => NOTE_NAMES[((pc % 12) + 12) % 12];

  const families: NeighborFamily[] = [
    {
      name: '1) Vecino Cromático Superior (+1 Semitono / Planing Superior: Imaj7 → ♭IImaj7 → Imaj7)',
      desc: 'Todo el acorde se desliza 1 traste hacia arriba (+1 semitono paralelo) y regresa inmediatamente al acorde objetivo como una bordadura completa.',
      voiceRule: 'Las 4 voces suben +1 traste y bajan -1 traste en bloque (Sideslip de Jazz/Neo-Soul).',
      buildSteps: (r) => {
        const b = 48 + r;
        return [
          { title: `${nName(r)}maj7 (Objetivo)`, role: '1. Acorde Central Estable', midis: [b, b + 4, b + 7, b + 11], bassMidi: 36 + r, fretDelta: 'Posición Base (0)' },
          { title: `${nName(r + 1)}maj7 (Vecino Superior)`, role: '2. Bordadura Superior (+1 Traste)', midis: [b + 1, b + 5, b + 8, b + 12], bassMidi: 36 + ((r + 1) % 12), fretDelta: 'Todas las cuerdas +1 traste ↑' },
          { title: `${nName(r)}maj7 (Resolución)`, role: '3. Retorno al Objetivo', midis: [b, b + 4, b + 7, b + 11], bassMidi: 36 + r, fretDelta: 'Todas las cuerdas -1 traste ↓' },
        ];
      },
    },
    {
      name: '2) Vecino Cromático Inferior (-1 Semitono / Planing Inferior: Imaj7 → VIImaj7 → Imaj7)',
      desc: 'El acorde entero baja medio tono (-1 traste) creando un efecto de "resorte" luminoso antes de volver a su sitio.',
      voiceRule: 'Cada dedo de la mano izquierda retrocede 1 traste y vuelve a avanzar 1 traste.',
      buildSteps: (r) => {
        const b = 48 + r;
        return [
          { title: `${nName(r)}maj7 (Objetivo)`, role: '1. Acorde Central Estable', midis: [b, b + 4, b + 7, b + 11], bassMidi: 36 + r, fretDelta: 'Posición Base (0)' },
          { title: `${nName(r + 11)}maj7 (Vecino Inferior)`, role: '2. Bordadura Inferior (-1 Traste)', midis: [b - 1, b + 3, b + 6, b + 10], bassMidi: 36 + ((r + 11) % 12), fretDelta: 'Todas las cuerdas -1 traste ↓' },
          { title: `${nName(r)}maj7 (Resolución)`, role: '3. Retorno al Objetivo', midis: [b, b + 4, b + 7, b + 11], bassMidi: 36 + r, fretDelta: 'Todas las cuerdas +1 traste ↑' },
        ];
      },
    },
    {
      name: '3) Doble Bordadura Cromática Envolvente (+1 Traste → -1 Traste → Objetivo)',
      desc: 'Rodea al acorde objetivo por arriba (+1 semitono) y por debajo (-1 semitono) antes de aterrizar en el centro tonal.',
      voiceRule: 'Enclosure armónico de 4 pasos: Centro → Vecino Superior → Vecino Inferior → Centro.',
      buildSteps: (r) => {
        const b = 48 + r;
        return [
          { title: `${nName(r)}m9 (Objetivo)`, role: '1. Centro Menor', midis: [b, b + 3, b + 7, b + 10, b + 14], bassMidi: 36 + r, fretDelta: 'Posición Base' },
          { title: `${nName(r + 1)}m9 (Vecino Sup)`, role: '2. +1 Semitono Arriba', midis: [b + 1, b + 4, b + 8, b + 11, b + 15], bassMidi: 36 + ((r + 1) % 12), fretDelta: '+1 traste ↑' },
          { title: `${nName(r + 11)}m9 (Vecino Inf)`, role: '3. -1 Semitono Abajo', midis: [b - 1, b + 2, b + 6, b + 9, b + 13], bassMidi: 36 + ((r + 11) % 12), fretDelta: '-2 trastes ↓' },
          { title: `${nName(r)}m9 (Resolución)`, role: '4. Aterrizaje en Casa', midis: [b, b + 3, b + 7, b + 10, b + 14], bassMidi: 36 + r, fretDelta: '+1 traste → Centro' },
        ];
      },
    },
    {
      name: '4) Vecinos Diatónicos de Bordadura sobre Bajo Pedal (I → ii/I → IV/I → I)',
      desc: 'El bajo se queda clavado en la tónica mientras las 3 voces superiores suben por grados vecinos de la escala (ii y IV) y regresan.',
      voiceRule: 'Bajo inmóvil (0 movimiento); las voces agudas hacen bordadura diatónica 1→2→4→3.',
      buildSteps: (r) => {
        const b = 48 + r;
        return [
          { title: `${nName(r)} Mayor (I)`, role: '1. Tónica Estable', midis: [b, b + 4, b + 7, b + 12], bassMidi: 36 + r, fretDelta: 'Bajo fijo en Tónica' },
          { title: `${nName(r + 2)}m/${nName(r)} (ii/I Vecino)`, role: '2. Vecino Diatónico Grado ii', midis: [b, b + 5, b + 9, b + 14], bassMidi: 36 + r, fretDelta: 'Voces agudas suben +1 grado' },
          { title: `${nName(r + 5)}maj7/${nName(r)} (IV/I Vecino)`, role: '3. Vecino Plagal Grado IV', midis: [b, b + 5, b + 9, b + 16], bassMidi: 36 + r, fretDelta: 'Cima abre a la 3ª aguda' },
          { title: `${nName(r)} Mayor (I)`, role: '4. Reposo sobre el Pedal', midis: [b, b + 4, b + 7, b + 12], bassMidi: 36 + r, fretDelta: 'Cierre por grado conjunto' },
        ];
      },
    },
    {
      name: '5) Vecinos Disminuidos de Aproximación y Auxiliar (vii°7 → Imaj7 → I°7 → Imaj7)',
      desc: 'Usa el acorde disminuido sensible (1 semitono abajo) y el disminuido auxiliar (misma raíz) donde 3 voces son vecinas a 1 traste.',
      voiceRule: 'En I°7 → Imaj7 la fundamental se queda quieta y las otras 3 voces suben exactamente 1 semitono.',
      buildSteps: (r) => {
        const b = 48 + r;
        return [
          { title: `${nName(r + 11)}°7 (Vecino Sensible)`, role: '1. Aproximación por Semitono', midis: [b - 1, b + 2, b + 5, b + 8], bassMidi: 36 + ((r + 11) % 12), fretDelta: 'Sensible a -1 traste de la raíz' },
          { title: `${nName(r)}maj7 (Objetivo)`, role: '2. Resolución Luminosa', midis: [b, b + 4, b + 7, b + 11], bassMidi: 36 + r, fretDelta: 'Abre al acorde Mayor 7' },
          { title: `${nName(r)}°7 (Vecino Auxiliar)`, role: '3. Bordadura Disminuida Misma Raíz', midis: [b, b + 3, b + 6, b + 9], bassMidi: 36 + r, fretDelta: '3ª, 5ª y 7ª bajan -1 o -2 trastes' },
          { title: `${nName(r)}6/9 (Resolución)`, role: '4. Retorno Cálido', midis: [b, b + 4, b + 7, b + 9, b + 14], bassMidi: 36 + r, fretDelta: '3ª y 5ª suben +1 traste' },
        ];
      },
    },
  ];

  let rootPc = 0; // C
  let famIdx = 0;
  let activeStep = 0;
  let neckMode: 'guitar' | 'bass' = 'guitar';

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
        <label style="font-size:0.8rem; font-weight:700; color:var(--accent-gold);">Acorde Objetivo:</label>
        <select class="js-nb-root">
          ${NOTE_LABELS.map((l, i) => `<option value="${i}" ${i === rootPc ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        <label style="font-size:0.8rem; font-weight:700; color:var(--accent-cyan);">Tipo de Acorde Vecino:</label>
        <select class="js-nb-fam" style="max-width:100%;">
          ${families.map((f, i) => `<option value="${i}">${f.name}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        <button type="button" class="btn js-nb-neck-mode" data-mode="guitar" style="font-size:0.75rem; padding:4px 10px; background:rgba(245,158,11,0.22); color:#fbbf24; border:1px solid #f59e0b;">🎸 Guitarra (6c)</button>
        <button type="button" class="btn js-nb-neck-mode" data-mode="bass" style="font-size:0.75rem; padding:4px 10px; background:rgba(30,41,59,0.9); color:#94a3b8; border:1px solid #334155;">🎸 Bajo (4c)</button>
        <button type="button" class="btn btn-primary js-nb-play">▶ Escuchar Bordadura de Acordes Vecinos</button>
      </div>
    </div>

    <div class="js-nb-info" style="margin-bottom:12px; padding:10px 12px; background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.3); border-radius:8px; font-size:0.82rem; color:#e2e8f0;"></div>
    <div class="js-nb-cards" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(185px, 1fr)); gap:10px; margin-bottom:14px;"></div>

    <div style="background:rgba(15,23,42,0.92); border:1px solid rgba(245,158,11,0.35); border-radius:10px; padding:12px;">
      <strong class="js-nb-neck-title" style="color:var(--accent-gold); font-size:0.88rem; display:block; margin-bottom:6px;">🎸 Mapa del Acorde Vecino Activo en el Mástil (0–12 Trastes)</strong>
      <div class="js-nb-neck-host"></div>
    </div>
  `;

  const rootSel = stage.querySelector<HTMLSelectElement>('.js-nb-root')!;
  const famSel = stage.querySelector<HTMLSelectElement>('.js-nb-fam')!;
  const infoEl = stage.querySelector<HTMLElement>('.js-nb-info')!;
  const cardsEl = stage.querySelector<HTMLElement>('.js-nb-cards')!;
  const neckTitleEl = stage.querySelector<HTMLElement>('.js-nb-neck-title')!;
  const neckHostEl = stage.querySelector<HTMLElement>('.js-nb-neck-host')!;
  const neckModeBtns = stage.querySelectorAll<HTMLButtonElement>('.js-nb-neck-mode');

  const render = (): void => {
    const fam = families[famIdx];
    const steps = fam.buildSteps(rootPc);
    if (activeStep >= steps.length) activeStep = 0;
    const isBass = neckMode === 'bass';

    neckModeBtns.forEach((b) => {
      const active = b.getAttribute('data-mode') === neckMode;
      b.style.background = active ? 'rgba(245,158,11,0.24)' : 'rgba(30,41,59,0.9)';
      b.style.color = active ? '#fbbf24' : '#94a3b8';
      b.style.borderColor = active ? '#f59e0b' : '#334155';
    });

    infoEl.innerHTML = `<strong>🧭 Cómo funciona este Acorde Vecino:</strong> ${fam.desc}<br><span style="color:#fde047;"><strong>Conducción en el Mástil:</strong> ${fam.voiceRule}</span>`;

    cardsEl.innerHTML = steps
      .map((st, idx) => {
        const isSel = idx === activeStep;
        const notesStr = st.midis.map((m) => NOTE_NAMES[((m % 12) + 12) % 12]).join('–');
        return `
          <button type="button" class="js-nb-card" data-idx="${idx}" style="background:${isSel ? 'rgba(30,58,138,0.58)' : 'rgba(30,41,59,0.9)'}; border:2px solid ${isSel ? '#f59e0b' : 'rgba(56,189,248,0.35)'}; border-radius:10px; padding:10px; color:#f8fafc; cursor:pointer; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:space-between;">
            <div>
              <div style="font-size:0.71rem; color:var(--accent-cyan); font-weight:700;">${st.role}</div>
              <div style="font-size:1.0rem; font-weight:900; color:var(--accent-gold); margin:2px 0;">${st.title}</div>
              <div style="font-size:0.72rem; color:#cbd5e1; font-family:monospace;">[${notesStr}]</div>
              <div style="font-size:0.7rem; color:#34d399; margin-top:2px;">${st.fretDelta}</div>
            </div>
            ${renderMiniChordNeckSvg(st.midis, st.bassMidi, neckMode)}
            <div style="font-size:0.68rem; color:#38bdf8; margin-top:4px;">🔊 Escuchar Paso ${idx + 1}</div>
          </button>
        `;
      })
      .join('');

    const cur = steps[activeStep];
    const curRootPc = ((cur.bassMidi % 12) + 12) % 12;
    const pcs = new Set(cur.midis.map((m) => ((m % 12) + 12) % 12));
    const stringsConfig = isBass ? BASS_STRINGS : GUITAR_STRINGS;
    const guitarVoicing = !isBass ? computePlayableGuitarVoicing(cur.midis, cur.bassMidi) : null;
    const bassVoicing = isBass ? computePlayableBassVoicing(cur.midis, cur.bassMidi) : null;
    const voicingFrets = isBass ? bassVoicing!.frets : guitarVoicing!.frets;
    const tabText = isBass ? bassVoicing!.tabText : guitarVoicing!.tabText;

    neckTitleEl.textContent = isBass
      ? `🎸 ${cur.title} (${cur.fretDelta}) en BAJO ELÉCTRICO (4 Cuerdas · Digitación: ${tabText})`
      : `🎸 ${cur.title} (${cur.fretDelta}) en GUITARRA (6 Cuerdas · Digitación: ${tabText} · Dedos Izq: ${guitarVoicing!.fingerText})`;

    const numStrings = stringsConfig.length;
    let neckHtml = `<div class="fretboard-wrapper">`;
    neckHtml += `<div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.16); margin-bottom:4px;"><div class="string-label" style="color:var(--text-muted); font-size:0.7rem;">Traste</div>`;
    for (let f = 0; f <= 12; f++) {
      const marker = [3, 5, 7, 9, 12].includes(f) ? '•' : '';
      neckHtml += `<div class="fret-cell" style="height:20px; border:none; color:var(--text-muted); font-size:0.72rem; font-weight:700;">${f === 0 ? '0' : `${f}${marker}`}</div>`;
    }
    neckHtml += `</div>`;

    stringsConfig.forEach((st, sIdx) => {
      const lowToHighIdx = numStrings - 1 - sIdx;
      const voicedFret = voicingFrets[lowToHighIdx];
      const voicedFinger = !isBass && guitarVoicing ? guitarVoicing.fingers[lowToHighIdx] || 0 : 0;
      neckHtml += `<div class="fretboard-row"><div class="string-label" style="color:${isBass ? '#38bdf8' : '#fbbf24'};">${st.label}</div>`;
      for (let f = 0; f <= 12; f++) {
        const midi = st.openMidi + f;
        const pc = midi % 12;
        const noteName = NOTE_NAMES[pc];
        const isRoot = pc === curRootPc;
        const isTone = pcs.has(pc);
        const isPrimary = voicedFret === f;
        const stateClass = isRoot ? 'root' : isTone ? (isBass ? 'char' : 'active') : '';
        const ringStyle = isPrimary ? 'box-shadow:0 0 0 2.5px #fff, 0 0 12px #f59e0b; transform:scale(1.12);' : '';
        const fingerBadge =
          !isBass && isPrimary && voicedFinger > 0 && f > 0
            ? `<span class="finger-badge" title="Dedo ${voicedFinger}">${voicedFinger}</span>`
            : '';
        neckHtml += `
          <div class="fret-cell js-nb-cell" data-sidx="${sIdx}" data-fret="${f}" data-midi="${midi}">
            <div class="fret-note ${stateClass}" style="${ringStyle}">${isPrimary ? `${noteName}★` : noteName}${fingerBadge}</div>
          </div>
        `;
      }
      neckHtml += `</div>`;
    });
    neckHtml += `</div>`;
    neckHostEl.innerHTML = neckHtml;
  };

  const playStep = (idx: number): void => {
    const steps = families[famIdx].buildSteps(rootPc);
    const st = steps[idx];
    activeStep = idx;
    render();
    audio.strumChord(st.midis, 'guitar', 0, false);
    onStatus(`${st.title} — ${st.fretDelta}`);
  };

  render();

  rootSel.addEventListener('change', () => {
    rootPc = parseInt(rootSel.value, 10);
    activeStep = 0;
    render();
  });

  famSel.addEventListener('change', () => {
    famIdx = parseInt(famSel.value, 10);
    activeStep = 0;
    render();
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const modeBtn = target.closest<HTMLElement>('.js-nb-neck-mode');
    if (modeBtn) {
      neckMode = (modeBtn.getAttribute('data-mode') as 'guitar' | 'bass') || 'guitar';
      render();
      onStatus(`Acordes Vecinos: Diagramas cambiados a ${neckMode === 'bass' ? 'Bajo (4 Cuerdas)' : 'Guitarra (6 Cuerdas)'}`);
      return;
    }
    const card = target.closest<HTMLElement>('.js-nb-card');
    if (card) {
      audio.stopAll();
      playStep(parseInt(card.getAttribute('data-idx')!, 10));
      return;
    }
    const cell = target.closest<HTMLElement>('.js-nb-cell');
    if (cell) {
      const midi = parseInt(cell.getAttribute('data-midi')!, 10);
      const sIdx = parseInt(cell.getAttribute('data-sidx') || '-1', 10);
      const fret = parseInt(cell.getAttribute('data-fret') || '-1', 10);
      const hint: NoteGlowHint = sIdx >= 0 && fret >= 0 ? { sIdx, fret, scopeEl: neckHostEl } : {};
      if (neckMode === 'bass') audio.playElectricBass(midi, 1.1, 0, 0.38, 'finger', true, hint);
      else audio.playPluckedGuitar(midi, 1.1, 0, 0.3, true, hint);
      return;
    }
    if (target.closest('.js-nb-play')) {
      audio.stopAll();
      const steps = families[famIdx].buildSteps(rootPc);
      steps.forEach((_, idx) => {
        audio.schedule(() => playStep(idx), idx * 920);
      });
    }
  });
}

/**
 * NEW LAB 20: Interactive Fretboard Triads Visualizer (3 Inversions Across String Sets in Guitar 6c & Bass 4c)
 * (`data-lab="fretboard-triads-visualizer"`)
 */
function buildFretboardTriadsVisualizerLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  interface TriadQuality {
    id: string;
    name: string;
    suffix: string;
    intervals: [number, number, number];
    formula: string;
  }

  const qualities: TriadQuality[] = [
    { id: 'maj', name: 'Mayor (1 – 3 – 5)', suffix: '', intervals: [0, 4, 7], formula: '1 – 3M – 5J' },
    { id: 'min', name: 'Menor (1 – ♭3 – 5)', suffix: 'm', intervals: [0, 3, 7], formula: '1 – 3m – 5J' },
    { id: 'dim', name: 'Disminuida (1 – ♭3 – ♭5)', suffix: '°', intervals: [0, 3, 6], formula: '1 – 3m – 5d' },
    { id: 'aug', name: 'Aumentada (1 – 3 – #5)', suffix: '+', intervals: [0, 4, 8], formula: '1 – 3M – 5Aum' },
    { id: 'sus2', name: 'Suspendida 2 (1 – 2 – 5)', suffix: 'sus2', intervals: [0, 2, 7], formula: '1 – 2M – 5J' },
    { id: 'sus4', name: 'Suspendida 4 (1 – 4 – 5)', suffix: 'sus4', intervals: [0, 5, 7], formula: '1 – 4J – 5J' },
  ];

  interface StringSetSpec {
    id: string;
    label: string;
    mode: 'guitar' | 'bass';
    // Indices in low-to-high openMidis array ([40,45,50,55,59,64] for guitar, [28,33,38,43] for bass)
    lowToHighStringIndices: [number, number, number];
  }

  const stringSets: StringSetSpec[] = [
    { id: 'g-123', label: '🎸 Guitarra · Set 1: Cuerdas 1ª–2ª–3ª (G–B–e · Agudas: Triángulo / Gancho / Ala)', mode: 'guitar', lowToHighStringIndices: [3, 4, 5] },
    { id: 'g-234', label: '🎸 Guitarra · Set 2: Cuerdas 2ª–3ª–4ª (D–G–B · Registro Medio Vocal)', mode: 'guitar', lowToHighStringIndices: [2, 3, 4] },
    { id: 'g-345', label: '🎸 Guitarra · Set 3: Cuerdas 3ª–4ª–5ª (A–D–G · Registro Medio-Grave)', mode: 'guitar', lowToHighStringIndices: [1, 2, 3] },
    { id: 'g-456', label: '🎸 Guitarra · Set 4: Cuerdas 4ª–5ª–6ª (E–A–D · Registro Grave)', mode: 'guitar', lowToHighStringIndices: [0, 1, 2] },
    { id: 'g-spread', label: '🎸 Guitarra · Spread Triads (Tríadas Abiertas en Cuerdas 5ª–3ª–2ª: A–G–B)', mode: 'guitar', lowToHighStringIndices: [1, 3, 4] },
    { id: 'b-123', label: '🎸 Bajo (4 Cuerdas) · Set Agudo: Cuerdas 3ª–2ª–1ª (A–D–G)', mode: 'bass', lowToHighStringIndices: [1, 2, 3] },
    { id: 'b-234', label: '🎸 Bajo (4 Cuerdas) · Set Grave: Cuerdas 4ª–3ª–2ª (E–A–D)', mode: 'bass', lowToHighStringIndices: [0, 1, 2] },
  ];

  let rootPc = 0; // C
  let qIdx = 0;
  let setIdx = 0;
  let selectedInvIdx = -1; // -1 = show all 3 inversions on 12-fret board

  const renderCustomFixedFretsSvg = (
    fretsLowToHigh: (number | null)[],
    rootPitchClass: number,
    mode: 'guitar' | 'bass'
  ): string => {
    const isBass = mode === 'bass';
    const openLowToHigh = isBass ? [28, 33, 38, 43] : [40, 45, 50, 55, 59, 64];
    const stringNames = isBass ? ['E', 'A', 'D', 'G'] : ['E', 'A', 'D', 'G', 'B', 'e'];
    const numStrings = openLowToHigh.length;
    const nonZero = fretsLowToHigh.filter((f): f is number => f !== null && f > 0);
    const minFret = nonZero.length > 0 ? Math.min(...nonZero) : 1;
    const maxFret = nonZero.length > 0 ? Math.max(...nonZero) : 4;
    const baseFret = maxFret <= 4 ? 1 : minFret;
    const tabText = fretsLowToHigh.map((f) => (f === null ? 'X' : String(f))).join('-');

    const w = 136;
    const h = 114;
    const padL = isBass ? 28 : 22;
    const padT = 22;
    const gridW = isBass ? 82 : 95;
    const gridH = 68;
    const strGap = gridW / (numStrings - 1);
    const fretGap = gridH / 4;
    const lines: string[] = [];

    let fingerSummaryText = '';
    const fingerByStringLowToHigh = new Map<number, number>();
    if (!isBass) {
      const chordPos: { sIdx: number; fret: number; midi: number }[] = [];
      fretsLowToHigh.forEach((fv, lowIdx) => {
        if (fv !== null) {
          chordPos.push({
            sIdx: numStrings - 1 - lowIdx,
            fret: fv,
            midi: openLowToHigh[lowIdx] + fv,
          });
        }
      });
      const assigned = assignGuitarChordFingers(chordPos, true);
      assigned.positions.forEach((p) => {
        fingerByStringLowToHigh.set(numStrings - 1 - p.sIdx, p.finger);
      });
      fingerSummaryText = fretsLowToHigh
        .map((fv, lowIdx) => (fv === null ? 'X' : String(fingerByStringLowToHigh.get(lowIdx) ?? 0)))
        .join('-');
    }

    if (baseFret === 1) {
      lines.push(`<line x1="${padL}" y1="${padT}" x2="${padL + gridW}" y2="${padT}" stroke="${isBass ? '#38bdf8' : '#f8fafc'}" stroke-width="3.2" />`);
    } else {
      lines.push(`<line x1="${padL}" y1="${padT}" x2="${padL + gridW}" y2="${padT}" stroke="#64748b" stroke-width="1.5" />`);
      lines.push(`<text x="${padL - 5}" y="${padT + fretGap * 0.65}" text-anchor="end" fill="#fbbf24" font-size="9" font-weight="800">${baseFret}fr</text>`);
    }
    for (let f = 1; f <= 4; f++) {
      const y = padT + f * fretGap;
      lines.push(`<line x1="${padL}" y1="${y}" x2="${padL + gridW}" y2="${y}" stroke="#334155" stroke-width="1.1" />`);
    }
    for (let s = 0; s < numStrings; s++) {
      const x = padL + s * strGap;
      const sw = isBass ? 2.5 - s * 0.32 : 1.8 - s * 0.16;
      lines.push(`<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + gridH}" stroke="${isBass ? '#7dd3fc' : '#94a3b8'}" stroke-width="${sw.toFixed(2)}" />`);
      lines.push(`<text x="${x}" y="${padT + gridH + 12}" text-anchor="middle" fill="${isBass ? '#38bdf8' : '#94a3b8'}" font-size="8.5" font-weight="800">${stringNames[s]}</text>`);
      const fVal = fretsLowToHigh[s];
      const fingerVal = !isBass ? fingerByStringLowToHigh.get(s) || 0 : 0;
      if (fVal === null) {
        lines.push(`<text x="${x}" y="${padT - 6}" text-anchor="middle" fill="#fb7185" font-size="9.5" font-weight="800">×</text>`);
      } else if (fVal === 0) {
        const pc = openLowToHigh[s] % 12;
        const isR = pc === rootPitchClass;
        lines.push(`<circle cx="${x}" cy="${padT - 8}" r="4.8" fill="${isR ? '#f59e0b' : 'none'}" stroke="${isR ? '#fef08a' : '#38bdf8'}" stroke-width="1.8" />`);
      } else {
        const relFret = Math.max(1, Math.min(4, fVal - baseFret + 1));
        const cy = padT + (relFret - 0.5) * fretGap;
        const pc = (openLowToHigh[s] + fVal) % 12;
        const isR = pc === rootPitchClass;
        const noteName = NOTE_NAMES[pc];
        lines.push(`<circle cx="${x}" cy="${cy}" r="${isBass ? '7.0' : '6.4'}" fill="${isR ? '#f59e0b' : isBass ? '#059669' : '#0284c7'}" stroke="${isR ? '#fef08a' : '#7dd3fc'}" stroke-width="1.5" />`);
        lines.push(`<text x="${x}" y="${cy + 2.8}" text-anchor="middle" fill="${isR ? '#0f172a' : '#f8fafc'}" font-size="6.9" font-weight="900">${noteName}</text>`);
        if (!isBass && fingerVal > 0) {
          lines.push(
            `<circle cx="${x + 6.4}" cy="${cy - 5.2}" r="4.3" fill="#fde047" stroke="#090c12" stroke-width="0.9" />` +
              `<text x="${x + 6.4}" y="${cy - 2.9}" text-anchor="middle" fill="#090c12" font-size="5.8" font-weight="900">${fingerVal}</text>`
          );
        }
      }
    }
    return `
      <div style="margin-top:6px; display:flex; flex-direction:column; align-items:center;">
        <svg viewBox="0 0 ${w} ${h}" style="width:128px; height:106px; background:${isBass ? 'rgba(6,24,38,0.88)' : 'rgba(7,10,18,0.75)'}; border:1px solid ${isBass ? 'rgba(56,189,248,0.45)' : 'rgba(148,163,184,0.2)'}; border-radius:6px;">
          ${lines.join('')}
        </svg>
        <div style="font-size:0.68rem; color:#94a3b8; font-family:monospace; margin-top:3px;">${isBass ? 'Bajo (4c)' : 'Guitarra (6c)'}: <strong style="color:${isBass ? '#38bdf8' : '#fde68a'};">${tabText}</strong></div>
        ${!isBass && fingerSummaryText ? `<div style="font-size:0.64rem; color:#fde047; font-family:monospace;">Dedos: <strong>${fingerSummaryText}</strong></div>` : ''}
      </div>
    `;
  };

  const computeThreeInversions = () => {
    const q = qualities[qIdx];
    const sSet = stringSets[setIdx];
    const isBass = sSet.mode === 'bass';
    const openLowToHigh = isBass ? [28, 33, 38, 43] : [40, 45, 50, 55, 59, 64];
    const numStrings = openLowToHigh.length;
    const [sLow, sMid, sHigh] = sSet.lowToHighStringIndices;

    const pcs = q.intervals.map((iv) => (rootPc + iv) % 12) as [number, number, number];
    // 3 inversions ordered by which chord member is on the lowest string of the 3-string set:
    // Inv 0 (Fundamental): [1, 3, 5] -> [pcs[0], pcs[1], pcs[2]]
    // Inv 1 (1ª Inversión): [3, 5, 1] -> [pcs[1], pcs[2], pcs[0]]
    // Inv 2 (2ª Inversión): [5, 1, 3] -> [pcs[2], pcs[0], pcs[1]]
    const invOrders: { title: string; orderLabel: string; shapeName: string; targetPcs: [number, number, number] }[] = [
      { title: '1. Estado Fundamental (Raíz en grave)', orderLabel: 'Voces: 1ª – 3ª – 5ª', shapeName: 'Figura "Ala / Escalera"', targetPcs: [pcs[0], pcs[1], pcs[2]] },
      { title: '2. Primera Inversión (3ª en grave)', orderLabel: 'Voces: 3ª – 5ª – 1ª', shapeName: 'Figura "Gancho (Raíz en aguda)"', targetPcs: [pcs[1], pcs[2], pcs[0]] },
      { title: '3. Segunda Inversión (5ª en grave)', orderLabel: 'Voces: 5ª – 1ª – 3ª', shapeName: 'Figura "Triángulo (Raíz al centro)"', targetPcs: [pcs[2], pcs[0], pcs[1]] },
    ];

    return invOrders.map((inv, invIdx) => {
      const fLow = (inv.targetPcs[0] - (openLowToHigh[sLow] % 12) + 12) % 12;
      let fMid = (inv.targetPcs[1] - (openLowToHigh[sMid] % 12) + 12) % 12;
      let fHigh = (inv.targetPcs[2] - (openLowToHigh[sHigh] % 12) + 12) % 12;

      // Ensure fMid and fHigh are within an ergonomic hand span of fLow (adjust by +12 if too far below)
      if (fMid - fLow < -3) fMid += 12;
      if (fHigh - fMid < -3) fHigh += 12;
      if (fLow - fMid > 4 && fLow >= 8) {
        // Keep compact
      }

      const fretsLowToHigh: (number | null)[] = Array(numStrings).fill(null);
      fretsLowToHigh[sLow] = fLow;
      fretsLowToHigh[sMid] = fMid;
      fretsLowToHigh[sHigh] = fHigh;

      const midis = [
        openLowToHigh[sLow] + fLow,
        openLowToHigh[sMid] + fMid,
        openLowToHigh[sHigh] + fHigh,
      ];

      return {
        invIdx,
        ...inv,
        fretsLowToHigh,
        midis,
        notesStr: midis.map((m) => NOTE_NAMES[m % 12]).join(' – '),
        avgFret: ((fLow + fMid + fHigh) / 3).toFixed(1),
      };
    });
  };

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
        <label style="font-size:0.8rem; font-weight:700; color:var(--accent-gold);">Tónica:</label>
        <select class="js-ft-root">
          ${NOTE_LABELS.map((l, i) => `<option value="${i}" ${i === rootPc ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        <label style="font-size:0.8rem; font-weight:700; color:var(--accent-cyan);">Tríada:</label>
        <select class="js-ft-qual">
          ${qualities.map((q, i) => `<option value="${i}">${q.name}</option>`).join('')}
        </select>
        <label style="font-size:0.8rem; font-weight:700; color:#34d399;">Instrumento y Set de 3 Cuerdas:</label>
        <select class="js-ft-set" style="max-width:100%;">
          ${stringSets.map((s, i) => `<option value="${i}">${s.label}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        <button type="button" class="btn btn-primary js-ft-play-all">▶ Tocar las 3 Inversiones por el Mástil</button>
        <button type="button" class="btn js-ft-show-all" style="background:rgba(56,189,248,0.16); color:#38bdf8; border:1px solid rgba(56,189,248,0.4);">🗺️ Ver las 3 Inversiones Juntas</button>
      </div>
    </div>

    <div class="js-ft-cards" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:12px; margin-bottom:14px;"></div>

    <div style="background:rgba(15,23,42,0.92); border:1px solid rgba(245,158,11,0.35); border-radius:10px; padding:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
        <strong class="js-ft-neck-title" style="color:var(--accent-gold); font-size:0.88rem;">🎸 Mapa Horizontal de las 3 Inversiones en el Set de Cuerdas (0–15 Trastes)</strong>
        <span style="font-size:0.74rem; color:#94a3b8;">Dorado = Tónica (1ª) · Azul/Verde = 3ª y 5ª de la Tríada en el Set de 3 Cuerdas Elegido</span>
      </div>
      <div class="js-ft-neck-host"></div>
    </div>
  `;

  const rootSel = stage.querySelector<HTMLSelectElement>('.js-ft-root')!;
  const qualSel = stage.querySelector<HTMLSelectElement>('.js-ft-qual')!;
  const setSel = stage.querySelector<HTMLSelectElement>('.js-ft-set')!;
  const cardsEl = stage.querySelector<HTMLElement>('.js-ft-cards')!;
  const neckTitleEl = stage.querySelector<HTMLElement>('.js-ft-neck-title')!;
  const neckHostEl = stage.querySelector<HTMLElement>('.js-ft-neck-host')!;

  const render = (): void => {
    const q = qualities[qIdx];
    const sSet = stringSets[setIdx];
    const isBass = sSet.mode === 'bass';
    const invs = computeThreeInversions();
    const chordTitle = `${NOTE_NAMES[rootPc]}${q.suffix}`;

    cardsEl.innerHTML = invs
      .map((inv) => {
        const isSel = selectedInvIdx === inv.invIdx;
        return `
          <button type="button" class="js-ft-card" data-idx="${inv.invIdx}" style="background:${isSel ? 'rgba(30,58,138,0.58)' : 'rgba(30,41,59,0.9)'}; border:2px solid ${isSel ? '#f59e0b' : 'rgba(56,189,248,0.35)'}; border-radius:10px; padding:11px; color:#f8fafc; cursor:pointer; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:space-between;">
            <div>
              <div style="font-size:0.72rem; color:var(--accent-cyan); font-weight:700;">${inv.title}</div>
              <div style="font-size:1.05rem; font-weight:900; color:var(--accent-gold); margin:2px 0;">${chordTitle} · ${inv.orderLabel}</div>
              <div style="font-size:0.73rem; color:#cbd5e1; font-family:monospace;">[${inv.notesStr}]</div>
              <div style="font-size:0.7rem; color:#34d399; margin-top:2px;">${inv.shapeName}</div>
            </div>
            ${renderCustomFixedFretsSvg(inv.fretsLowToHigh, rootPc, sSet.mode)}
            <div style="font-size:0.68rem; color:#38bdf8; margin-top:4px;">🔊 Escuchar y Resaltar en Mástil</div>
          </button>
        `;
      })
      .join('');

    // Render 0–15 Fret Neck highlighting the 3 strings of the active string set
    const stringsConfig = isBass ? BASS_STRINGS : GUITAR_STRINGS;
    const numStrings = stringsConfig.length;
    const activeSetLowToHigh = new Set<number>(sSet.lowToHighStringIndices);

    const focusedFingerMap = new Map<string, number>();
    if (!isBass && selectedInvIdx !== -1 && invs[selectedInvIdx]) {
      const selInv = invs[selectedInvIdx];
      const posList: { sIdx: number; fret: number; midi: number }[] = [];
      selInv.fretsLowToHigh.forEach((fv, lowIdx) => {
        if (fv !== null) {
          posList.push({
            sIdx: numStrings - 1 - lowIdx,
            fret: fv,
            midi: stringsConfig[numStrings - 1 - lowIdx].openMidi + fv,
          });
        }
      });
      assignGuitarChordFingers(posList, true).positions.forEach((p) => {
        if (p.finger > 0 && p.fret > 0) focusedFingerMap.set(`${p.sIdx}:${p.fret}`, p.finger);
      });
    }

    neckTitleEl.textContent =
      selectedInvIdx === -1
        ? `🎸 Las 3 Inversiones de ${chordTitle} (${q.formula}) a lo largo del Mástil — ${sSet.label}`
        : `🎸 ${chordTitle} — ${invs[selectedInvIdx].title} (${invs[selectedInvIdx].notesStr}) — ${sSet.label}`;

    let neckHtml = `<div class="fretboard-wrapper">`;
    neckHtml += `<div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.16); margin-bottom:4px;"><div class="string-label" style="color:var(--text-muted); font-size:0.7rem;">Traste</div>`;
    for (let f = 0; f <= 15; f++) {
      const marker = [3, 5, 7, 9, 12, 15].includes(f) ? '•' : '';
      neckHtml += `<div class="fret-cell" style="height:20px; border:none; color:var(--text-muted); font-size:0.71rem; font-weight:700;">${f === 0 ? '0' : `${f}${marker}`}</div>`;
    }
    neckHtml += `</div>`;

    const triadPcs = new Set(q.intervals.map((iv) => (rootPc + iv) % 12));

    stringsConfig.forEach((st, sIdx) => {
      const lowToHighIdx = numStrings - 1 - sIdx;
      const isStringInSet = activeSetLowToHigh.has(lowToHighIdx);
      const matchingInvs =
        selectedInvIdx === -1 ? invs : [invs[selectedInvIdx]];

      neckHtml += `<div class="fretboard-row" style="opacity:${isStringInSet ? '1' : '0.35'};"><div class="string-label" style="color:${isStringInSet ? (isBass ? '#38bdf8' : '#fbbf24') : '#64748b'};">${st.label}${isStringInSet ? ' ●' : ''}</div>`;
      for (let f = 0; f <= 15; f++) {
        const midi = st.openMidi + f;
        const pc = midi % 12;
        const noteName = NOTE_NAMES[pc];
        const isRoot = pc === rootPc;
        const isTriadNote = triadPcs.has(pc);
        const isVoicedHere = matchingInvs.some((inv) => inv.fretsLowToHigh[lowToHighIdx] === f);

        let stateClass = '';
        if (isStringInSet && (isVoicedHere || (selectedInvIdx === -1 && isTriadNote))) {
          stateClass = isRoot ? 'root' : isBass ? 'char' : 'active';
        }
        const ringStyle = isVoicedHere
          ? 'box-shadow:0 0 0 2px #ffffff, 0 0 12px #f59e0b; font-weight:900;'
          : '';
        const fingerNum = isVoicedHere ? focusedFingerMap.get(`${sIdx}:${f}`) || 0 : 0;
        const fingerBadge =
          fingerNum > 0 ? `<span class="finger-badge" title="Dedo ${fingerNum}">${fingerNum}</span>` : '';

        neckHtml += `
          <div class="fret-cell js-ft-cell" data-sidx="${sIdx}" data-fret="${f}" data-midi="${midi}">
            <div class="fret-note ${stateClass}" style="${ringStyle}">${noteName}${fingerBadge}</div>
          </div>
        `;
      }
      neckHtml += `</div>`;
    });
    neckHtml += `</div>`;
    neckHostEl.innerHTML = neckHtml;
  };

  const playInversion = (inv: ReturnType<typeof computeThreeInversions>[0]): void => {
    const sSet = stringSets[setIdx];
    const isBass = sSet.mode === 'bass';
    const stringsConfig = isBass ? BASS_STRINGS : GUITAR_STRINGS;
    const numStrings = stringsConfig.length;
    const chordGroup = Math.floor(Math.random() * 1e6) + 10000;
    const voicedNotes: { sIdx: number; fret: number; midi: number }[] = [];
    inv.fretsLowToHigh.forEach((f, lowToHighIdx) => {
      if (f === null) return;
      const sIdx = numStrings - 1 - lowToHighIdx;
      const midi = stringsConfig[sIdx].openMidi + f;
      voicedNotes.push({ sIdx, fret: f, midi });
    });
    voicedNotes.forEach((v, i) => {
      const hint: NoteGlowHint = {
        sIdx: v.sIdx,
        fret: v.fret,
        scopeEl: neckHostEl,
        isChord: true,
        chordGroup,
      };
      if (isBass) {
        audio.playElectricBass(v.midi, 0.9, i * 0.12, 0.36, 'finger', false, hint);
      } else {
        audio.playPluckedGuitar(v.midi, 1.25, i * 0.036, 0.25, false, hint);
      }
    });
  };

  render();

  rootSel.addEventListener('change', () => {
    rootPc = parseInt(rootSel.value, 10);
    render();
  });
  qualSel.addEventListener('change', () => {
    qIdx = parseInt(qualSel.value, 10);
    render();
  });
  setSel.addEventListener('change', () => {
    setIdx = parseInt(setSel.value, 10);
    selectedInvIdx = -1;
    render();
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const card = target.closest<HTMLElement>('.js-ft-card');
    if (card) {
      const idx = parseInt(card.getAttribute('data-idx')!, 10);
      selectedInvIdx = idx;
      audio.stopAll();
      render();
      const invs = computeThreeInversions();
      playInversion(invs[idx]);
      onStatus(`${NOTE_NAMES[rootPc]}${qualities[qIdx].suffix} — ${invs[idx].title} [${invs[idx].notesStr}]`);
      return;
    }
    const cell = target.closest<HTMLElement>('.js-ft-cell');
    if (cell) {
      const midi = parseInt(cell.getAttribute('data-midi')!, 10);
      const sIdx = parseInt(cell.getAttribute('data-sidx') || '0', 10);
      const fret = parseInt(cell.getAttribute('data-fret') || '0', 10);
      const hint: NoteGlowHint = { sIdx, fret, scopeEl: neckHostEl };
      if (stringSets[setIdx].mode === 'bass') audio.playElectricBass(midi, 1.1, 0, 0.38, 'finger', true, hint);
      else audio.playPluckedGuitar(midi, 1.1, 0, 0.3, true, hint);
      return;
    }
    if (target.closest('.js-ft-show-all')) {
      selectedInvIdx = -1;
      render();
      onStatus('Mostrando simultáneamente las 3 inversiones a lo largo del mástil');
    } else if (target.closest('.js-ft-play-all')) {
      audio.stopAll();
      const invs = computeThreeInversions().sort((a, b) => parseFloat(a.avgFret) - parseFloat(b.avgFret));
      invs.forEach((inv, i) => {
        audio.schedule(() => {
          selectedInvIdx = inv.invIdx;
          render();
          playInversion(inv);
          onStatus(`▶ [${i + 1}/3] ${inv.title} (${inv.notesStr})`);
        }, i * 880);
      });
    }
  });
}

/**
 * NEW LAB 21: Interactive 14-Mode Semitone-Bridge Network (`data-lab="modes-network-14"`)
 */
function buildModes14NetworkLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  interface Mode14Node {
    id: string;
    name: string;
    family: 'Maj' | 'Me' | 'Ar';
    toneBand: 'majColor' | 'minColor';
    extTag: string;
    col: number; // 0..3
    row: number; // 0..5
    offsets: number[]; // 7 pitch-class offsets
    alteredMask: boolean[]; // highlight altered degrees relative to Ionian
    triads: { offset: number; suffix: string }[];
    ingredient: string;
    emotion: string;
    neighbors: string[];
  }

  const majorOffsets = [0, 2, 4, 5, 7, 9, 11];
  const makeMask = (offs: number[]) => offs.map((v, i) => v !== majorOffsets[i]);

  const modes14: Mode14Node[] = [
    {
      id: 'melodica',
      name: 'Melódica',
      family: 'Me',
      toneBand: 'minColor',
      extTag: '6maj7',
      col: 0,
      row: 0,
      offsets: [0, 2, 3, 5, 7, 9, 11],
      alteredMask: makeMask([0, 2, 3, 5, 7, 9, 11]),
      triads: [{ offset: 5, suffix: '' }, { offset: 7, suffix: '' }],
      ingredient: '♭3 + 6♮ + 7M',
      emotion: 'Jazz/Noir moderno: mezcla base menor con brillo mayor arriba.',
      neighbors: ['jonica', 'armonica', 'dorica'],
    },
    {
      id: 'jonica',
      name: 'Jónica',
      family: 'Maj',
      toneBand: 'majColor',
      extTag: 'maj7',
      col: 1,
      row: 0,
      offsets: [0, 2, 4, 5, 7, 9, 11],
      alteredMask: makeMask([0, 2, 4, 5, 7, 9, 11]),
      triads: [{ offset: 5, suffix: '' }, { offset: 7, suffix: '' }, { offset: 11, suffix: '°' }],
      ingredient: '4J + 7M (Centro de referencia)',
      emotion: 'Luminoso, estable, claro y hogareño.',
      neighbors: ['melodica', 'lidia', 'mixo'],
    },
    {
      id: 'lidia',
      name: 'Lidia',
      family: 'Maj',
      toneBand: 'majColor',
      extTag: 'add#11',
      col: 2,
      row: 0,
      offsets: [0, 2, 4, 6, 7, 9, 11],
      alteredMask: makeMask([0, 2, 4, 6, 7, 9, 11]),
      triads: [{ offset: 11, suffix: 'm' }, { offset: 2, suffix: '' }],
      ingredient: '#4 (#11) mágica',
      emotion: 'Flotación espacial, asombro cinematográfico y ensueño.',
      neighbors: ['jonica', 'lidia2', 'lidiab7'],
    },
    {
      id: 'lidia2',
      name: 'Lidia #2',
      family: 'Ar',
      toneBand: 'majColor',
      extTag: '#9 #11',
      col: 3,
      row: 0,
      offsets: [0, 3, 4, 6, 7, 9, 11],
      alteredMask: makeMask([0, 3, 4, 6, 7, 9, 11]),
      triads: [{ offset: 11, suffix: '' }, { offset: 7, suffix: '+' }],
      ingredient: '#2 (#9) + #4 (#11)',
      emotion: 'Exotismo hipnótico y místico (6º grado Menor Armónica).',
      neighbors: ['lidia'],
    },
    {
      id: 'mixo',
      name: 'Mixo',
      family: 'Maj',
      toneBand: 'majColor',
      extTag: '7',
      col: 1,
      row: 1,
      offsets: [0, 2, 4, 5, 7, 9, 10],
      alteredMask: makeMask([0, 2, 4, 5, 7, 9, 10]),
      triads: [{ offset: 7, suffix: 'm' }, { offset: 10, suffix: '' }],
      ingredient: '3M + ♭7',
      emotion: 'Épico, aventurero, rock/folk y dominante relajado.',
      neighbors: ['jonica', 'lidiab7', 'mixob13', 'dorica'],
    },
    {
      id: 'lidiab7',
      name: 'Lidia ♭7',
      family: 'Me',
      toneBand: 'majColor',
      extTag: '♭7 #11',
      col: 2,
      row: 1,
      offsets: [0, 2, 4, 6, 7, 9, 10],
      alteredMask: makeMask([0, 2, 4, 6, 7, 9, 10]),
      triads: [{ offset: 2, suffix: '' }, { offset: 7, suffix: 'm' }, { offset: 7, suffix: '+' }],
      ingredient: '#4 (#11) + ♭7 (Serie Armónica)',
      emotion: 'Travieso, elegante, travieso de dibujos/cine (Los Simpson).',
      neighbors: ['lidia', 'mixo', 'dorica4'],
    },
    {
      id: 'mixob13',
      name: 'Mixo ♭13',
      family: 'Me',
      toneBand: 'majColor',
      extTag: '7♭13',
      col: 1,
      row: 2,
      offsets: [0, 2, 4, 5, 7, 8, 10],
      alteredMask: makeMask([0, 2, 4, 5, 7, 8, 10]),
      triads: [{ offset: 5, suffix: 'm' }, { offset: 7, suffix: 'm' }, { offset: 10, suffix: '' }],
      ingredient: '3M + ♭6 (♭13) + ♭7',
      emotion: 'Nostalgia hindú/cinematográfica agridulce (5º Melódica).',
      neighbors: ['mixo', 'mixob9b13', 'eolica'],
    },
    {
      id: 'mixob9b13',
      name: 'Mixo ♭9 ♭13',
      family: 'Ar',
      toneBand: 'majColor',
      extTag: '♭7♭9♭13',
      col: 2,
      row: 2,
      offsets: [0, 1, 4, 5, 7, 8, 10],
      alteredMask: makeMask([0, 1, 4, 5, 7, 8, 10]),
      triads: [{ offset: 1, suffix: '' }, { offset: 10, suffix: 'm' }],
      ingredient: '♭2 + 3M + ♭6 (Frigio Mayor)',
      emotion: 'Flamenco, desierto, rito andaluz y metal neoclásico.',
      neighbors: ['mixob13', 'frigia'],
    },
    {
      id: 'armonica',
      name: 'Armónica',
      family: 'Ar',
      toneBand: 'minColor',
      extTag: 'maj7',
      col: 0,
      row: 3,
      offsets: [0, 2, 3, 5, 7, 8, 11],
      alteredMask: makeMask([0, 2, 3, 5, 7, 8, 11]),
      triads: [{ offset: 7, suffix: '7' }],
      ingredient: '♭3 + ♭6 + 7M (Salto de 2ª Aum)',
      emotion: 'Dramatismo clásico, tango y tensión barroca.',
      neighbors: ['melodica', 'eolica'],
    },
    {
      id: 'eolica',
      name: 'Eólica',
      family: 'Maj',
      toneBand: 'minColor',
      extTag: '♭6',
      col: 1,
      row: 3,
      offsets: [0, 2, 3, 5, 7, 8, 10],
      alteredMask: makeMask([0, 2, 3, 5, 7, 8, 10]),
      triads: [{ offset: 5, suffix: 'm' }, { offset: 7, suffix: 'm' }],
      ingredient: '♭3 + ♭6 + ♭7 (Menor Natural)',
      emotion: 'Melancolía profunda, épica triste y balada.',
      neighbors: ['mixob13', 'armonica', 'frigia', 'dorica'],
    },
    {
      id: 'frigia',
      name: 'Frigia',
      family: 'Maj',
      toneBand: 'minColor',
      extTag: '♭9',
      col: 2,
      row: 3,
      offsets: [0, 1, 3, 5, 7, 8, 10],
      alteredMask: makeMask([0, 1, 3, 5, 7, 8, 10]),
      triads: [{ offset: 1, suffix: '' }, { offset: 10, suffix: 'm' }],
      ingredient: '♭2 (Semitono sobre la raíz)',
      emotion: 'Oscuridad antigua, suspenso visceral y raíz española.',
      neighbors: ['mixob9b13', 'eolica', 'doricab2'],
    },
    {
      id: 'dorica',
      name: 'Dórica',
      family: 'Maj',
      toneBand: 'minColor',
      extTag: '6',
      col: 1,
      row: 4,
      offsets: [0, 2, 3, 5, 7, 9, 10],
      alteredMask: makeMask([0, 2, 3, 5, 7, 9, 10]),
      triads: [{ offset: 2, suffix: 'm' }, { offset: 5, suffix: '' }],
      ingredient: '♭3 + 6♮ (Sexta natural)',
      emotion: 'Menor luminoso, jazz/funk sofisticado y aventura medieval.',
      neighbors: ['melodica', 'mixo', 'eolica', 'doricab2', 'dorica4'],
    },
    {
      id: 'doricab2',
      name: 'Dórica ♭2',
      family: 'Me',
      toneBand: 'minColor',
      extTag: '6 ♭9',
      col: 2,
      row: 4,
      offsets: [0, 1, 3, 5, 7, 9, 10],
      alteredMask: makeMask([0, 1, 3, 5, 7, 9, 10]),
      triads: [{ offset: 10, suffix: 'm' }, { offset: 5, suffix: '' }, { offset: 1, suffix: '+' }],
      ingredient: '♭2 + 6♮ (2º Menor Melódica)',
      emotion: 'Misterio húmedo con luz superior de Jazz moderno.',
      neighbors: ['frigia', 'dorica'],
    },
    {
      id: 'dorica4',
      name: 'Dórica #4',
      family: 'Ar',
      toneBand: 'minColor',
      extTag: '6#11',
      col: 1,
      row: 5,
      offsets: [0, 2, 3, 6, 7, 9, 10],
      alteredMask: makeMask([0, 2, 3, 6, 7, 9, 10]),
      triads: [{ offset: 2, suffix: '' }, { offset: 10, suffix: '+' }],
      ingredient: '♭3 + #4 + 6♮ (4º Menor Armónica)',
      emotion: 'Caravana gitana / Klezmer lleno de fuego dramático.',
      neighbors: ['dorica', 'lidiab7'],
    },
  ];

  let rootPc = 0; // C
  let activeId = 'jonica';
  let neckMode: 'guitar' | 'bass' = 'guitar';

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
        <label style="font-size:0.8rem; font-weight:700; color:var(--accent-gold);">Tónica Modal:</label>
        <select class="js-m14-root">
          ${NOTE_LABELS.map((l, i) => `<option value="${i}" ${i === rootPc ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        <button type="button" class="btn js-m14-neck-mode" data-mode="guitar" style="font-size:0.75rem; padding:4px 10px; background:rgba(245,158,11,0.22); color:#fbbf24; border:1px solid #f59e0b;">🎸 Guitarra (6c)</button>
        <button type="button" class="btn js-m14-neck-mode" data-mode="bass" style="font-size:0.75rem; padding:4px 10px; background:rgba(30,41,59,0.9); color:#94a3b8; border:1px solid #334155;">🎸 Bajo (4c)</button>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        <button type="button" class="btn btn-primary js-m14-play">▶ Escuchar Acorde + Escala del Modo</button>
      </div>
    </div>

    <div style="overflow-x:auto; background:rgba(7,10,18,0.9); border:1px solid rgba(56,189,248,0.28); border-radius:12px; padding:10px; margin-bottom:12px;">
      <div class="js-m14-svg-host" style="min-width:680px;"></div>
    </div>

    <div class="js-m14-info" style="background:rgba(15,23,42,0.92); border:1px solid rgba(245,158,11,0.38); border-radius:10px; padding:12px; margin-bottom:12px;"></div>

    <div style="background:rgba(15,23,42,0.92); border:1px solid rgba(56,189,248,0.3); border-radius:10px; padding:10px;">
      <strong class="js-m14-neck-title" style="display:block; font-size:0.84rem; color:var(--accent-gold); margin-bottom:4px;">🎸 Escala Modal en el Mástil</strong>
      <div class="js-m14-neck-host"></div>
    </div>
  `;

  const rootSel = stage.querySelector<HTMLSelectElement>('.js-m14-root')!;
  const svgHost = stage.querySelector<HTMLElement>('.js-m14-svg-host')!;
  const infoEl = stage.querySelector<HTMLElement>('.js-m14-info')!;
  const neckTitleEl = stage.querySelector<HTMLElement>('.js-m14-neck-title')!;
  const neckHost = stage.querySelector<HTMLElement>('.js-m14-neck-host')!;
  const neckModeBtns = stage.querySelectorAll<HTMLButtonElement>('.js-m14-neck-mode');

  const getModeById = (id: string) => modes14.find((m) => m.id === id) || modes14[1];

  const getDiffDesc = (a: Mode14Node, b: Mode14Node): string => {
    for (let i = 0; i < 7; i++) {
      if (a.offsets[i] !== b.offsets[i]) {
        const na = NOTE_NAMES[(rootPc + a.offsets[i]) % 12];
        const nb = NOTE_NAMES[(rootPc + b.offsets[i]) % 12];
        return `${na} ↔ ${nb}`;
      }
    }
    return '1 semitono';
  };

  const render = (): void => {
    const activeMode = getModeById(activeId);
    const isBass = neckMode === 'bass';

    neckModeBtns.forEach((b) => {
      const act = b.getAttribute('data-mode') === neckMode;
      b.style.background = act ? 'rgba(245,158,11,0.24)' : 'rgba(30,41,59,0.9)';
      b.style.color = act ? '#fbbf24' : '#94a3b8';
      b.style.borderColor = act ? '#f59e0b' : '#334155';
    });

    // Layout geometry for SVG (viewBox 980 x 650)
    const boxW = 196;
    const boxH = 78;
    const colX = [30, 268, 506, 744];
    const rowY = [24, 128, 232, 336, 440, 544];

    const centerOf = (m: Mode14Node) => ({
      cx: colX[m.col] + boxW / 2,
      cy: rowY[m.row] + boxH / 2,
      x: colX[m.col],
      y: rowY[m.row],
    });

    // Draw orthogonal & curved 1-semitone bridge edges (matching Image 1)
    const drawnPairs = new Set<string>();
    const edgeSvg: string[] = [];

    modes14.forEach((m) => {
      m.neighbors.forEach((nbId) => {
        const pairKey = [m.id, nbId].sort().join('--');
        if (drawnPairs.has(pairKey)) return;
        drawnPairs.add(pairKey);

        const nb = getModeById(nbId);
        const p1 = centerOf(m);
        const p2 = centerOf(nb);
        const isHighlighted = m.id === activeId || nb.id === activeId;
        const strokeCol = isHighlighted ? '#fbbf24' : '#cbd5e1';
        const strokeW = isHighlighted ? 2.8 : 1.5;
        const opacity = isHighlighted ? '1' : '0.52';

        // Special long outer loop bridges matching Image 1
        if ((m.id === 'melodica' && nb.id === 'dorica') || (m.id === 'dorica' && nb.id === 'melodica')) {
          const leftRail = 12;
          edgeSvg.push(`<polyline points="${p1.x},${p1.cy} ${leftRail},${p1.cy} ${leftRail},${p2.cy} ${p2.x},${p2.cy}" fill="none" stroke="${strokeCol}" stroke-width="${strokeW}" opacity="${opacity}" stroke-linejoin="round"/>`);
        } else if ((m.id === 'mixo' && nb.id === 'dorica') || (m.id === 'dorica' && nb.id === 'mixo')) {
          const railX = p1.x - 16;
          edgeSvg.push(`<path d="M ${p1.x} ${p1.cy} Q ${railX - 18} ${(p1.cy + p2.cy) / 2} ${p2.x} ${p2.cy}" fill="none" stroke="${strokeCol}" stroke-width="${strokeW}" opacity="${opacity}"/>`);
        } else if ((m.id === 'lidiab7' && nb.id === 'dorica4') || (m.id === 'dorica4' && nb.id === 'lidiab7')) {
          const rightRail = 724;
          edgeSvg.push(`<polyline points="${p1.x + boxW},${p1.cy} ${rightRail},${p1.cy} ${rightRail},${p2.cy} ${p2.x + boxW},${p2.cy}" fill="none" stroke="${strokeCol}" stroke-width="${strokeW}" opacity="${opacity}" stroke-linejoin="round"/>`);
        } else {
          edgeSvg.push(`<line x1="${p1.cx}" y1="${p1.cy}" x2="${p2.cx}" y2="${p2.cy}" stroke="${strokeCol}" stroke-width="${strokeW}" opacity="${opacity}"/>`);
        }
      });
    });

    // Draw all 14 mode boxes
    const nodesSvg = modes14
      .map((m) => {
        const pos = centerOf(m);
        const isSel = m.id === activeId;
        const isNeighbor = activeMode.neighbors.includes(m.id);
        const headerFill = m.toneBand === 'majColor' ? '#f3b7d2' : '#93d5f0';
        const cellFill = m.toneBand === 'majColor' ? '#fce7f3' : '#dbeafe';
        const altCellFill = m.toneBand === 'majColor' ? '#9d7488' : '#5e889b';
        const borderCol = isSel ? '#fbbf24' : isNeighbor ? '#38bdf8' : '#0f172a';
        const borderW = isSel ? 3.5 : isNeighbor ? 2.5 : 1.5;
        const cellW = boxW / 7;

        const triadLabels = m.triads
          .map((t, idx) => {
            const tName = `${NOTE_NAMES[(rootPc + t.offset) % 12]}${t.suffix}`;
            return `<text x="${pos.x + boxW - 6}" y="${pos.y + 13 + idx * 12}" text-anchor="end" fill="#090c12" font-size="10.5" font-weight="800">${tName}</text>`;
          })
          .join('');

        const noteCells = m.offsets
          .map((off, idx) => {
            const noteStr = NOTE_NAMES[(rootPc + off) % 12];
            const isAlt = m.alteredMask[idx];
            const nx = pos.x + idx * cellW;
            const ny = pos.y + 49;
            return `
              <rect x="${nx}" y="${ny}" width="${cellW}" height="${boxH - 49}" fill="${isAlt ? altCellFill : cellFill}" stroke="#0f172a" stroke-width="1"/>
              <text x="${nx + cellW / 2}" y="${ny + 19}" text-anchor="middle" fill="${isAlt ? '#f8fafc' : '#090c12'}" font-size="11.5" font-weight="800">${noteStr}</text>
            `;
          })
          .join('');

        return `
          <g class="js-m14-node" data-id="${m.id}" style="cursor:pointer;">
            <rect x="${pos.x}" y="${pos.y}" width="${boxW}" height="${boxH}" rx="4" fill="${headerFill}" stroke="${borderCol}" stroke-width="${borderW}"/>
            <text x="${pos.x + 6}" y="${pos.y + 14}" fill="#090c12" font-size="10.5" font-weight="700">${m.family}</text>
            <text x="${pos.x + 6}" y="${pos.y + 43}" fill="#1e293b" font-size="9.5" font-weight="700">${m.extTag}</text>
            <text x="${pos.x + boxW * 0.48}" y="${pos.y + 31}" text-anchor="middle" fill="#090c12" font-size="${m.name.length > 9 ? '15' : '18.5'}" font-weight="900">${m.name}</text>
            ${triadLabels}
            ${noteCells}
          </g>
        `;
      })
      .join('');

    svgHost.innerHTML = `
      <svg viewBox="0 0 970 672" style="width:100%; height:auto; display:block; user-select:none;">
        <rect x="0" y="0" width="970" height="672" fill="#121417" rx="8"/>
        <text x="18" y="652" fill="#94a3b8" font-size="11.5" font-weight="700">Líneas conectan modos separados por exactamente 1 SEMITONO (Rosa = Modo con 3ª Mayor · Celeste = Modo con 3ª Menor · Cuadro oscuro = Nota alterada)</text>
        ${edgeSvg.join('')}
        ${nodesSvg}
      </svg>
    `;

    // Update active mode inspector
    const rootName = NOTE_NAMES[rootPc];
    const scaleNames = activeMode.offsets.map((o) => NOTE_NAMES[(rootPc + o) % 12]).join(' – ');
    const triadNames = activeMode.triads.map((t) => `${NOTE_NAMES[(rootPc + t.offset) % 12]}${t.suffix}`).join(' · ');
    const neighborButtons = activeMode.neighbors
      .map((nbId) => {
        const nb = getModeById(nbId);
        return `<button type="button" class="btn js-m14-jump" data-id="${nb.id}" style="font-size:0.74rem; padding:4px 9px; background:rgba(56,189,248,0.16); color:#7dd3fc; border:1px solid rgba(56,189,248,0.45);">🔀 ${rootName} ${nb.name} (cambia solo <strong>${getDiffDesc(activeMode, nb)}</strong>)</button>`;
      })
      .join('');

    infoEl.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:flex-start; gap:10px;">
        <div>
          <span style="font-size:0.72rem; text-transform:uppercase; color:var(--accent-cyan); font-weight:800;">Familia ${activeMode.family} · Extensión ${activeMode.extTag}</span>
          <h4 style="margin:2px 0 4px 0; font-size:1.15rem; color:var(--accent-gold);">${rootName} ${activeMode.name} <span style="font-size:0.86rem; color:#e2e8f0; font-family:monospace;">[${scaleNames}]</span></h4>
          <p style="margin:0 0 6px 0; font-size:0.82rem; color:#cbd5e1;">
            <strong>Ingrediente Característico:</strong> ${activeMode.ingredient} · <strong>Tríadas Cadenciales ("Por Descarte"):</strong> <code style="color:#fde047;">${triadNames}</code><br>
            <strong>Emoción:</strong> ${activeMode.emotion}
          </p>
        </div>
      </div>
      <div style="margin-top:6px;">
        <div style="font-size:0.76rem; color:#fbbf24; font-weight:700; margin-bottom:5px;">🔗 Puentes a 1 Semitono desde ${rootName} ${activeMode.name} (Haz clic para modular moviendo 1 sola nota):</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">${neighborButtons}</div>
      </div>
    `;

    // Update 12-fret Guitar/Bass Neck
    const pcs = new Set(activeMode.offsets.map((o) => (rootPc + o) % 12));
    const charPcs = new Set(activeMode.offsets.filter((_, i) => activeMode.alteredMask[i]).map((o) => (rootPc + o) % 12));
    const stringsConfig = isBass ? BASS_STRINGS : GUITAR_STRINGS;
    neckTitleEl.textContent = `🎸 ${rootName} ${activeMode.name} en ${isBass ? 'BAJO ELÉCTRICO (4 Cuerdas)' : 'GUITARRA (6 Cuerdas)'} — Dorado = Tónica · Verde = Notas Alteradas Características`;

    let neckHtml = `<div class="fretboard-wrapper">`;
    neckHtml += `<div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.16); margin-bottom:4px;"><div class="string-label" style="color:var(--text-muted); font-size:0.7rem;">Traste</div>`;
    for (let f = 0; f <= 12; f++) {
      neckHtml += `<div class="fret-cell" style="height:20px; border:none; color:var(--text-muted); font-size:0.72rem; font-weight:700;">${f}</div>`;
    }
    neckHtml += `</div>`;
    stringsConfig.forEach((st, sIdx) => {
      neckHtml += `<div class="fretboard-row"><div class="string-label" style="color:${isBass ? '#38bdf8' : '#fbbf24'};">${st.label}</div>`;
      for (let f = 0; f <= 12; f++) {
        const midi = st.openMidi + f;
        const pc = midi % 12;
        const stateClass = pc === rootPc ? 'root' : charPcs.has(pc) ? 'char' : pcs.has(pc) ? 'active' : '';
        neckHtml += `<div class="fret-cell js-m14-cell" data-sidx="${sIdx}" data-fret="${f}" data-midi="${midi}"><div class="fret-note ${stateClass}">${NOTE_NAMES[pc]}</div></div>`;
      }
      neckHtml += `</div>`;
    });
    neckHtml += `</div>`;
    neckHost.innerHTML = neckHtml;
  };

  const playActiveMode = (): void => {
    const m = getModeById(activeId);
    const rootMidi = neckMode === 'bass' ? 36 + rootPc : 48 + rootPc;
    const isMin = m.offsets[2] === 3;
    const tonicChord =
      m.id === 'jonica' || m.id === 'eolica'
        ? [rootMidi, rootMidi + (isMin ? 3 : 4), rootMidi + 7]
        : [rootMidi, rootMidi + (isMin ? 3 : 4), rootMidi + 7, rootMidi + m.offsets[6]];
    audio.stopAll();
    audio.strumChord(tonicChord, neckMode === 'bass' ? 'bass' : 'guitar', 0, false);

    const stringsConfig = neckMode === 'bass' ? BASS_STRINGS : GUITAR_STRINGS;
    const scalePath = buildScaleFretboardPath(
      stringsConfig.map((s) => s.openMidi),
      rootPc,
      m.offsets,
      12
    );
    scalePath.forEach((step, idx) => {
      const hint: NoteGlowHint = { sIdx: step.sIdx, fret: step.fret, scopeEl: neckHost };
      const delaySec = 0.54 + idx * 0.19;
      if (neckMode === 'bass') {
        audio.playElectricBass(step.midi, 0.42, delaySec, 0.35, 'finger', false, hint);
      } else {
        audio.playPluckedGuitar(step.midi, 0.46, delaySec, 0.26, false, hint);
      }
    });
    onStatus(`Modo ${NOTE_NAMES[rootPc]} ${m.name} (${m.ingredient})`);
  };

  render();

  rootSel.addEventListener('change', () => {
    rootPc = parseInt(rootSel.value, 10);
    render();
    playActiveMode();
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const modeNode = target.closest<HTMLElement>('.js-m14-node, .js-m14-jump');
    if (modeNode) {
      activeId = modeNode.getAttribute('data-id')!;
      render();
      playActiveMode();
      return;
    }
    const neckBtn = target.closest<HTMLElement>('.js-m14-neck-mode');
    if (neckBtn) {
      neckMode = (neckBtn.getAttribute('data-mode') as 'guitar' | 'bass') || 'guitar';
      render();
      return;
    }
    const cell = target.closest<HTMLElement>('.js-m14-cell');
    if (cell) {
      const midi = parseInt(cell.getAttribute('data-midi')!, 10);
      const sIdx = parseInt(cell.getAttribute('data-sidx') || '0', 10);
      const fret = parseInt(cell.getAttribute('data-fret') || '0', 10);
      const hint: NoteGlowHint = { sIdx, fret, scopeEl: neckHost };
      if (neckMode === 'bass') audio.playElectricBass(midi, 1.0, 0, 0.36, 'finger', true, hint);
      else audio.playPluckedGuitar(midi, 1.0, 0, 0.28, true, hint);
      return;
    }
    if (target.closest('.js-m14-play')) {
      playActiveMode();
    }
  });
}

/**
 * NEW LAB 22: Interactive Pyramid of Available Tensions 9+11+13 (`data-lab="tension-pyramid-visualizer"`)
 */
function buildTensionPyramidLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  interface PyrNode {
    id: string;
    tier: 1 | 2 | 3 | 4;
    colIdx: number;
    rootOffset: number; // relative to selected rootPc
    minor: boolean;
    extText: string;
    voicingOffsets: number[]; // chord pitch classes relative to node's own root
  }

  // Matches Image 3 exact hierarchy & common-tone links (relative to Root = C = 0)
  const pyrNodes: PyrNode[] = [
    // Tier 1 (Apex)
    { id: 't1-I', tier: 1, colIdx: 0, rootOffset: 0, minor: false, extText: 'Tríada', voicingOffsets: [0, 4, 7] },

    // Tier 2 (3 nodes)
    { id: 't2-I913', tier: 2, colIdx: 0, rootOffset: 0, minor: false, extText: '9 13', voicingOffsets: [0, 4, 7, 14, 21] },
    { id: 't2-I9s1113', tier: 2, colIdx: 1, rootOffset: 0, minor: false, extText: '9 #11 13', voicingOffsets: [0, 4, 7, 14, 18, 21] },
    { id: 't2-bVII', tier: 2, colIdx: 2, rootOffset: 10, minor: false, extText: '9 #11 13', voicingOffsets: [0, 4, 7, 14, 18, 21] },

    // Tier 3 (15 readable chords from Image 3)
    { id: 't3-vi11', tier: 3, colIdx: 0, rootOffset: 9, minor: true, extText: '11', voicingOffsets: [0, 3, 7, 17] },
    { id: 't3-vi911', tier: 3, colIdx: 1, rootOffset: 9, minor: true, extText: '9 11', voicingOffsets: [0, 3, 7, 14, 17] },
    { id: 't3-i11', tier: 3, colIdx: 2, rootOffset: 0, minor: true, extText: '11', voicingOffsets: [0, 3, 7, 17] },
    { id: 't3-IVs11', tier: 3, colIdx: 3, rootOffset: 5, minor: false, extText: '9 #11 13', voicingOffsets: [0, 4, 7, 14, 18, 21] },
    { id: 't3-bIII913', tier: 3, colIdx: 4, rootOffset: 3, minor: false, extText: '9 13', voicingOffsets: [0, 4, 7, 14, 21] },
    { id: 't3-bIIIs11', tier: 3, colIdx: 5, rootOffset: 3, minor: false, extText: '9 #11 13', voicingOffsets: [0, 4, 7, 14, 18, 21] },
    { id: 't3-v911', tier: 3, colIdx: 6, rootOffset: 7, minor: true, extText: '9 11', voicingOffsets: [0, 3, 7, 14, 17] },
    { id: 't3-IV913', tier: 3, colIdx: 7, rootOffset: 5, minor: false, extText: '9 13', voicingOffsets: [0, 4, 7, 14, 21] },
    { id: 't3-iv911', tier: 3, colIdx: 8, rootOffset: 5, minor: true, extText: '9 11', voicingOffsets: [0, 3, 7, 14, 17] },
    { id: 't3-bVII913', tier: 3, colIdx: 9, rootOffset: 10, minor: false, extText: '9 13', voicingOffsets: [0, 4, 7, 14, 21] },
    { id: 't3-i911', tier: 3, colIdx: 10, rootOffset: 0, minor: true, extText: '9 11', voicingOffsets: [0, 3, 7, 14, 17] },
    { id: 't3-iii11', tier: 3, colIdx: 11, rootOffset: 4, minor: true, extText: '11', voicingOffsets: [0, 3, 7, 17] },
    { id: 't3-iii911', tier: 3, colIdx: 12, rootOffset: 4, minor: true, extText: '9 11', voicingOffsets: [0, 3, 7, 14, 17] },
    { id: 't3-ii11', tier: 3, colIdx: 13, rootOffset: 2, minor: true, extText: '11', voicingOffsets: [0, 3, 7, 17] },
    { id: 't3-Vs11', tier: 3, colIdx: 14, rootOffset: 7, minor: false, extText: '9 #11 13', voicingOffsets: [0, 4, 7, 14, 18, 21] },
    { id: 't3-V913', tier: 3, colIdx: 15, rootOffset: 7, minor: false, extText: '9 13', voicingOffsets: [0, 4, 7, 14, 21] },

    // Tier 4 (15 base chords from Image 3)
    { id: 't4-bVIs11', tier: 4, colIdx: 0, rootOffset: 8, minor: false, extText: '9 #11 13', voicingOffsets: [0, 4, 7, 14, 18, 21] },
    { id: 't4-bvii911', tier: 4, colIdx: 1, rootOffset: 10, minor: true, extText: '9 11', voicingOffsets: [0, 3, 7, 14, 17] },
    { id: 't4-bVI913', tier: 4, colIdx: 2, rootOffset: 8, minor: false, extText: '9 13', voicingOffsets: [0, 4, 7, 14, 21] },
    { id: 't4-iv11', tier: 4, colIdx: 3, rootOffset: 5, minor: true, extText: '11', voicingOffsets: [0, 3, 7, 17] },
    { id: 't4-bVs11', tier: 4, colIdx: 4, rootOffset: 6, minor: false, extText: '9 #11 13', voicingOffsets: [0, 4, 7, 14, 18, 21] },
    { id: 't4-vii11', tier: 4, colIdx: 5, rootOffset: 11, minor: true, extText: '11', voicingOffsets: [0, 3, 7, 17] },
    { id: 't4-II913', tier: 4, colIdx: 6, rootOffset: 2, minor: false, extText: '9 13', voicingOffsets: [0, 4, 7, 14, 21] },
    { id: 't4-III913', tier: 4, colIdx: 7, rootOffset: 4, minor: false, extText: '9 13', voicingOffsets: [0, 4, 7, 14, 21] },
    { id: 't4-VIs11', tier: 4, colIdx: 8, rootOffset: 9, minor: false, extText: '9 #11 13', voicingOffsets: [0, 4, 7, 14, 18, 21] },
    { id: 't4-bi911', tier: 4, colIdx: 9, rootOffset: 1, minor: true, extText: '11', voicingOffsets: [0, 3, 7, 17] },
    { id: 't4-IIs11', tier: 4, colIdx: 10, rootOffset: 2, minor: false, extText: '9 #11 13', voicingOffsets: [0, 4, 7, 14, 18, 21] },
    { id: 't4-VI913', tier: 4, colIdx: 11, rootOffset: 9, minor: false, extText: '9 13', voicingOffsets: [0, 4, 7, 14, 21] },
    { id: 't4-bi911b', tier: 4, colIdx: 12, rootOffset: 1, minor: true, extText: '9 11', voicingOffsets: [0, 3, 7, 14, 17] },
    { id: 't4-IIIs11', tier: 4, colIdx: 13, rootOffset: 4, minor: false, extText: '9 #11 13', voicingOffsets: [0, 4, 7, 14, 18, 21] },
    { id: 't4-bIIs11', tier: 4, colIdx: 14, rootOffset: 1, minor: false, extText: '9 #11 13', voicingOffsets: [0, 4, 7, 14, 18, 21] },
  ];

  let rootPc = 0; // C
  let activeId = 't2-I9s1113';
  let colorFilter: 'all' | 'root' | 'fifth' | 'third' = 'all';
  let neckMode: 'guitar' | 'bass' = 'guitar';

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
        <label style="font-size:0.8rem; font-weight:700; color:var(--accent-gold);">Melodía / Tónica Base:</label>
        <select class="js-pyr-root">
          ${NOTE_LABELS.map((l, i) => `<option value="${i}" ${i === rootPc ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        <button type="button" class="btn js-pyr-filter" data-f="all" style="font-size:0.74rem; padding:4px 9px; background:rgba(248,250,252,0.18); color:#f8fafc; border:1px solid #94a3b8;">Todas las Líneas</button>
        <button type="button" class="btn js-pyr-filter" data-f="root" style="font-size:0.74rem; padding:4px 9px; background:rgba(244,114,182,0.15); color:#f472b6; border:1px solid #f472b6;">Línea Rosa (1ª)</button>
        <button type="button" class="btn js-pyr-filter" data-f="fifth" style="font-size:0.74rem; padding:4px 9px; background:rgba(251,191,36,0.15); color:#fbbf24; border:1px solid #fbbf24;">Línea Dorada (5ª)</button>
        <button type="button" class="btn js-pyr-filter" data-f="third" style="font-size:0.74rem; padding:4px 9px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid #38bdf8;">Línea Cian (3ª)</button>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        <button type="button" class="btn js-pyr-neck-mode" data-mode="guitar" style="font-size:0.75rem; padding:4px 10px; background:rgba(245,158,11,0.22); color:#fbbf24; border:1px solid #f59e0b;">🎸 Guitarra (6c)</button>
        <button type="button" class="btn js-pyr-neck-mode" data-mode="bass" style="font-size:0.75rem; padding:4px 10px; background:rgba(30,41,59,0.9); color:#94a3b8; border:1px solid #334155;">🎸 Bajo (4c)</button>
      </div>
    </div>

    <div style="overflow-x:auto; background:#090c12; border:1px solid rgba(244,114,182,0.35); border-radius:12px; padding:10px; margin-bottom:12px;">
      <div class="js-pyr-svg-host" style="min-width:760px;"></div>
    </div>

    <div class="js-pyr-info" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:14px; align-items:center; background:rgba(15,23,42,0.92); border:1px solid rgba(56,189,248,0.38); border-radius:10px; padding:12px;"></div>
  `;

  const rootSel = stage.querySelector<HTMLSelectElement>('.js-pyr-root')!;
  const svgHost = stage.querySelector<HTMLElement>('.js-pyr-svg-host')!;
  const infoEl = stage.querySelector<HTMLElement>('.js-pyr-info')!;
  const filterBtns = stage.querySelectorAll<HTMLButtonElement>('.js-pyr-filter');
  const neckModeBtns = stage.querySelectorAll<HTMLButtonElement>('.js-pyr-neck-mode');

  const getChordInfo = (n: PyrNode) => {
    const cRootPc = (rootPc + n.rootOffset) % 12;
    const cRootName = NOTE_NAMES[cRootPc];
    const pcs = n.voicingOffsets.map((o) => (cRootPc + o) % 12);
    const noteNames = pcs.map((p) => NOTE_NAMES[p]);
    const symbol = `${cRootName}${n.minor ? 'm' : ''}${n.tier === 1 ? '' : `(${n.extText})`}`;
    const shortName = `${cRootName}${n.minor ? 'm' : ''}`;
    const hasRoot = pcs.includes(rootPc);
    const hasThird = pcs.includes((rootPc + 4) % 12);
    const hasFifth = pcs.includes((rootPc + 7) % 12);
    return { cRootPc, pcs, noteNames, symbol, shortName, hasRoot, hasThird, hasFifth };
  };

  const render = (): void => {
    filterBtns.forEach((b) => {
      const act = b.getAttribute('data-f') === colorFilter;
      b.style.outline = act ? '2px solid #fff' : 'none';
    });
    neckModeBtns.forEach((b) => {
      const act = b.getAttribute('data-mode') === neckMode;
      b.style.background = act ? 'rgba(245,158,11,0.24)' : 'rgba(30,41,59,0.9)';
      b.style.color = act ? '#fbbf24' : '#94a3b8';
      b.style.borderColor = act ? '#f59e0b' : '#334155';
    });

    const svgW = 1140;
    const svgH = 612;
    const tierY: Record<number, number> = { 1: 56, 2: 184, 3: 358, 4: 538 };
    const tierCounts: Record<number, number> = { 1: 1, 2: 3, 3: 16, 4: 15 };

    const getPos = (n: PyrNode) => {
      const count = tierCounts[n.tier];
      const span = n.tier === 2 ? 220 : svgW - 84;
      const startX = (svgW - span) / 2;
      const x = count === 1 ? svgW / 2 : startX + (n.colIdx * span) / (count - 1);
      return { x, y: tierY[n.tier] };
    };

    const byTier = (t: number) => pyrNodes.filter((n) => n.tier === t);
    const t1 = byTier(1);
    const t2 = byTier(2);
    const t3 = byTier(3);
    const t4 = byTier(4);

    // Connect adjacent tiers whenever both share the root (pink), fifth (gold), or third (cyan) of Tier 1 triad!
    const edgesSvg: string[] = [];
    const linkTiers = (parents: PyrNode[], children: PyrNode[]) => {
      parents.forEach((p) => {
        const pInfo = getChordInfo(p);
        const pp = getPos(p);
        children.forEach((c) => {
          const cInfo = getChordInfo(c);
          const cp = getPos(c);
          const isLinkedToActive = activeId === p.id || activeId === c.id;
          const dimOpacity = isLinkedToActive ? '0.88' : '0.24';

          const bridges: { ok: boolean; kind: 'root' | 'fifth' | 'third'; col: string; dx: number }[] = [
            { ok: pInfo.hasRoot && cInfo.hasRoot, kind: 'root', col: '#f472b6', dx: -4 },
            { ok: pInfo.hasFifth && cInfo.hasFifth, kind: 'fifth', col: '#fbbf24', dx: 0 },
            { ok: pInfo.hasThird && cInfo.hasThird, kind: 'third', col: '#38bdf8', dx: 4 },
          ];

          bridges.forEach((br) => {
            if (!br.ok) return;
            if (colorFilter !== 'all' && colorFilter !== br.kind) return;
            edgesSvg.push(
              `<line x1="${(pp.x + br.dx).toFixed(1)}" y1="${pp.y + 24}" x2="${(cp.x + br.dx).toFixed(1)}" y2="${cp.y - 26}" stroke="${br.col}" stroke-width="${isLinkedToActive ? 1.8 : 0.95}" opacity="${dimOpacity}"/>`
            );
          });
        });
      });
    };

    linkTiers(t1, t2);
    linkTiers(t2, t3);
    linkTiers(t3, t4);

    const nodesSvg = pyrNodes
      .map((n) => {
        const pos = getPos(n);
        const info = getChordInfo(n);
        const isSel = n.id === activeId;
        const r = n.tier <= 2 ? 23 : 19;
        const notesLine = info.noteNames.join(' ');
        const strokeCol = isSel ? '#fbbf24' : info.hasRoot && info.hasFifth ? '#f472b6' : info.hasThird ? '#38bdf8' : '#e2e8f0';

        return `
          <g class="js-pyr-node" data-id="${n.id}" style="cursor:pointer;">
            <circle cx="${pos.x.toFixed(1)}" cy="${pos.y}" r="${r}" fill="${isSel ? 'rgba(245,158,11,0.28)' : '#0f172a'}" stroke="${strokeCol}" stroke-width="${isSel ? 3 : 1.7}"/>
            <text x="${pos.x.toFixed(1)}" y="${pos.y + 5}" text-anchor="middle" fill="${isSel ? '#fef08a' : '#f8fafc'}" font-size="${n.tier <= 2 ? 15 : 12.5}" font-weight="900">${info.shortName}</text>
            <text x="${pos.x.toFixed(1)}" y="${pos.y + r + 11}" text-anchor="middle" fill="#cbd5e1" font-size="8.2" font-weight="700">${n.extText}</text>
            <text x="${pos.x.toFixed(1)}" y="${pos.y - r - 5}" text-anchor="middle" fill="#94a3b8" font-size="7.4" font-family="monospace">${notesLine}</text>
          </g>
        `;
      })
      .join('');

    const rName = NOTE_NAMES[rootPc];
    const thirdName = NOTE_NAMES[(rootPc + 4) % 12];
    const fifthName = NOTE_NAMES[(rootPc + 7) % 12];

    svgHost.innerHTML = `
      <svg viewBox="0 0 ${svgW} ${svgH}" style="width:100%; height:auto; display:block; user-select:none;">
        <text x="18" y="28" fill="#f472b6" font-size="14" font-weight="900">La Pirámide de Tensiones Disponibles (${rName}: ${rName}–${thirdName}–${fifthName})</text>
        <text x="18" y="46" fill="#94a3b8" font-size="11">Rosa = Mantiene 1ª (${rName}) · Dorada = Mantiene 5ª (${fifthName})</text>
        <text x="18" y="61" fill="#94a3b8" font-size="11">Cian = Mantiene 3ª (${thirdName}) · Haz clic en cualquier círculo</text>
        ${edgesSvg.join('')}
        ${nodesSvg}
      </svg>
    `;

    // Inspector panel
    const selNode = pyrNodes.find((n) => n.id === activeId) || pyrNodes[2];
    const selInfo = getChordInfo(selNode);
    const midiBase = 48 + selInfo.cRootPc;
    const voicingMidis = selNode.voicingOffsets.map((o) => midiBase + o);
    const sharedLabels: string[] = [];
    if (selInfo.hasRoot) sharedLabels.push(`🌸 Comparte <strong>${rName}</strong> (Línea Rosa)`);
    if (selInfo.hasFifth) sharedLabels.push(`🌟 Comparte <strong>${fifthName}</strong> (Línea Dorada)`);
    if (selInfo.hasThird) sharedLabels.push(`💎 Comparte <strong>${thirdName}</strong> (Línea Cian)`);

    infoEl.innerHTML = `
      <div>
        <span style="font-size:0.72rem; text-transform:uppercase; color:var(--accent-cyan); font-weight:800;">Nivel ${selNode.tier} de la Pirámide · Acorde Activo</span>
        <h4 style="margin:2px 0 6px 0; font-size:1.25rem; color:var(--accent-gold);">${selInfo.symbol} <span style="font-size:0.9rem; color:#e2e8f0; font-family:monospace;">[${selInfo.noteNames.join(' – ')}]</span></h4>
        <p style="font-size:0.82rem; color:#cbd5e1; margin:0 0 8px 0;">
          <strong>Puentes Melódicos Activos desde ${rName}:</strong> ${sharedLabels.length ? sharedLabels.join(' · ') : 'Acorde puente cromático avanzado'}<br>
          Cada acorde inferior comparte su tríada base con múltiples tonalidades y modos, permitiendo modular suavemente bajo la misma nota melódica.
        </p>
        <button type="button" class="btn btn-primary js-pyr-play">🔊 Escuchar ${selInfo.symbol}</button>
      </div>
      <div style="display:flex; justify-content:center;">
        ${renderMiniChordNeckSvg(voicingMidis, 36 + selInfo.cRootPc, neckMode)}
      </div>
    `;
  };

  const playNode = (n: PyrNode): void => {
    const cRootPc = (rootPc + n.rootOffset) % 12;
    const baseMidi = 48 + cRootPc;
    const midis = n.voicingOffsets.map((o) => baseMidi + o);
    audio.stopAll();
    audio.playElectricBass(36 + cRootPc, 1.5, 0, 0.36, 'finger', false, { skipGlow: true });
    audio.strumChord(midis, 'piano', 0, false);
    const info = getChordInfo(n);
    onStatus(`Pirámide 9+11+13: ${info.symbol} [${info.noteNames.join(' – ')}]`);
  };

  render();

  rootSel.addEventListener('change', () => {
    rootPc = parseInt(rootSel.value, 10);
    render();
    const sel = pyrNodes.find((n) => n.id === activeId);
    if (sel) playNode(sel);
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const node = target.closest<HTMLElement>('.js-pyr-node');
    if (node) {
      activeId = node.getAttribute('data-id')!;
      render();
      const found = pyrNodes.find((n) => n.id === activeId);
      if (found) playNode(found);
      return;
    }
    const fBtn = target.closest<HTMLElement>('.js-pyr-filter');
    if (fBtn) {
      colorFilter = (fBtn.getAttribute('data-f') as 'all' | 'root' | 'fifth' | 'third') || 'all';
      render();
      return;
    }
    const mBtn = target.closest<HTMLElement>('.js-pyr-neck-mode');
    if (mBtn) {
      neckMode = (mBtn.getAttribute('data-mode') as 'guitar' | 'bass') || 'guitar';
      render();
      return;
    }
    if (target.closest('.js-pyr-play')) {
      const found = pyrNodes.find((n) => n.id === activeId);
      if (found) playNode(found);
    }
  });
}



