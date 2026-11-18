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
    character: 'Misterioso, cine noir ("acorde de James Bond" / Hitchcock).',
    frets: [-1, 0, 2, 1, 1, 0],
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

export class MusicAudioEngine {
  private ctx: AudioContext | null = null;
  private activeVoices: ActiveVoiceHandle[] = [];
  private activeTimers: ReturnType<typeof setTimeout>[] = [];
  private droneHandle: ActiveVoiceHandle | null = null;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Immediately stops all previously playing or scheduled sounds so nothing overlaps!
   */
  stopAll(keepDrone = false): void {
    // Cancel all scheduled JS timers
    this.activeTimers.forEach((t) => clearTimeout(t));
    this.activeTimers = [];

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
    gain.connect(ctx.destination);

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
    stopPrevious = true
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
    masterGain.connect(ctx.destination);
    this.registerVoice(masterGain, sources);
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
    stopPrevious = true
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
    masterGain.connect(ctx.destination);

    subOsc.start(now);
    growlOsc.start(now);
    harmOsc.start(now);
    subOsc.stop(now + duration + 0.03);
    growlOsc.stop(now + duration + 0.03);
    harmOsc.stop(now + duration + 0.03);

    this.registerVoice(masterGain, sources);
  }

  /**
   * Warm Acoustic Grand Piano synthesis
   */
  playAcousticPiano(
    midi: number,
    duration = 1.25,
    delay = 0,
    volume = 0.26,
    stopPrevious = true
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

    masterGain.connect(ctx.destination);
    this.registerVoice(masterGain, sources);
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
    masterGain.connect(ctx.destination);

    glottal.start(now);
    subWarmth.start(now);
    lfo.start(now);
    glottal.stop(now + duration + 0.03);
    subWarmth.stop(now + duration + 0.03);
    lfo.stop(now + duration + 0.03);

    this.registerVoice(masterGain, [glottal, subWarmth, lfo]);
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
    masterGain.connect(ctx.destination);

    osc.start(now);
    osc2.start(now);
    lfo.start(now);
    osc.stop(now + duration + 0.03);
    osc2.stop(now + duration + 0.03);
    lfo.stop(now + duration + 0.03);

    this.registerVoice(masterGain, [osc, osc2, lfo]);
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
      master.connect(ctx.destination);

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
      master.connect(ctx.destination);

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
      master.connect(ctx.destination);
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
      master.connect(ctx.destination);
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
      master.connect(ctx.destination);
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
    if (stopPrevious && delayOffset === 0) {
      this.stopAll(true);
    }
    midiNotes.forEach((m, idx) => {
      const strumDelay = delayOffset + idx * (instrument === 'guitar' ? 0.042 : 0.015);
      if (instrument === 'bass') {
        this.playElectricBass(m, 1.4, strumDelay, 0.34, 'finger', false);
      } else if (instrument === 'guitar') {
        this.playPluckedGuitar(m, 1.7, strumDelay, 0.24, false);
      } else {
        this.playAcousticPiano(m, 1.45, strumDelay, 0.22, false);
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
  onStatus: (msg: string) => void
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

    const maxFret = Math.max(12, ...parsedNotes.map((n) => n.fret));
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

    block.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
        <div>
          <span class="tab-label" style="margin-bottom:2px;">${title}</span>
          <span style="font-size:0.78rem; color:var(--accent-cyan); font-weight:600;">
            ${isInBassSection ? '🎸 Mástil Interactivo de Bajo Eléctrico (4 Cuerdas: G–D–A–E)' : '🎸 Mástil Interactivo de Guitarra (6 Cuerdas: e–B–G–D–A–E)'}
            — Haz clic en cualquier traste para tocarlo
          </span>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" class="btn btn-primary js-tab-play-seq" style="padding:5px 12px; font-size:0.78rem;">
            ▶ Escuchar Mapa / Tablatura (${parsedNotes.length} notas)
          </button>
          <button type="button" class="btn js-tab-stop" style="padding:5px 10px; font-size:0.78rem; background:rgba(244,63,94,0.18); color:#fb7185; border:1px solid rgba(244,63,94,0.4);">
            ⏹ Detener
          </button>
          <button type="button" class="btn js-tab-toggle-raw" style="padding:5px 10px; font-size:0.75rem; background:rgba(255,255,255,0.06); color:#cbd5e1; border:1px solid rgba(255,255,255,0.15);">
            📄 Ver/Ocultar Tablatura en Texto
          </button>
        </div>
      </div>
      <div class="fretboard-wrapper js-tab-fretboard" style="margin-top:6px;">
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
      const fret = cell.getAttribute('data-fret');
      if (isInBassSection) {
        audio.playElectricBass(midi, 1.25, 0, 0.38, 'finger', true);
      } else {
        audio.playPluckedGuitar(midi, 1.4, 0, 0.3, true);
      }
      onStatus(
        `${isInBassSection ? 'Bajo 4 Cuerdas' : 'Guitarra 6 Cuerdas'}: Traste ${fret} — Nota ${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1} (${audio.midiToFreq(midi).toFixed(1)} Hz)`
      );
    });

    playSeqBtn.addEventListener('click', () => {
      audio.stopAll(true);
      // Sort notes nicely or play in tab order (up to 24 notes)
      const seq = parsedNotes.slice(0, 24);
      seq.forEach((n, idx) => {
        audio.schedule(() => {
          // Highlight current fret visually
          fb.querySelectorAll('.fret-note').forEach((el) => el.classList.remove('ring-2', 'ring-white'));
          const targetCell = fb.querySelector(`.js-tab-fret[data-sidx="${n.stringIdx}"][data-fret="${n.fret}"] .fret-note`);
          if (targetCell) {
            targetCell.classList.add('ring-2', 'ring-white');
          }
          if (isInBassSection) {
            audio.playElectricBass(n.midi, 0.55, 0, 0.36, 'finger', false);
          } else {
            audio.playPluckedGuitar(n.midi, 0.65, 0, 0.28, false);
          }
          onStatus(`Reproduciendo paso ${idx + 1}/${seq.length}: ${n.noteName} (Traste ${n.fret})`);
        }, idx * 290);
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
  let currentInstrument: 'guitar' | 'piano' | 'bass' = isBassOnly ? 'bass' : 'guitar';
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
        `
        }

        <button type="button" class="btn btn-primary js-play-main">
          ${isBassOnly ? '▶ Tocar Línea / Arpegio en Bajo' : isChordMode ? '🎸 Rasguear Acorde' : '▶ Escuchar Escala'}
        </button>
        <button type="button" class="btn js-drone-btn" style="background:rgba(16,185,129,0.16); color:#34d399; border:1px solid rgba(16,185,129,0.4);">
          🔊 Pedal Tónica
        </button>
        <button type="button" class="btn js-stop-btn" style="background:rgba(244,63,94,0.18); color:#fb7185; border:1px solid rgba(244,63,94,0.4);">
          ⏹ Detener
        </button>
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
  const instSelect = container.querySelector<HTMLSelectElement>('.js-inst-select');
  const bassStyleSelect = container.querySelector<HTMLSelectElement>('.js-bass-style');
  const playMainBtn = container.querySelector<HTMLButtonElement>('.js-play-main')!;
  const droneBtn = container.querySelector<HTMLButtonElement>('.js-drone-btn')!;
  const stopBtn = container.querySelector<HTMLButtonElement>('.js-stop-btn')!;
  const formulaInfo = container.querySelector<HTMLElement>('.js-formula-info')!;
  const pianoContainer = container.querySelector<HTMLElement>('.js-piano-container');
  const fretboardContainer = container.querySelector<HTMLElement>('.js-fretboard-container')!;
  const neckTitle = container.querySelector<HTMLElement>('.js-neck-title')!;

  const getActiveIntervals = (): number[] => {
    if (isChordMode) {
      const chord = CHORDS_DB.find((c) => c.id === currentChordId) || CHORDS_DB[0];
      return chord.intervals.map((i) => i % 12);
    }
    const scale = SCALES_DB.find((s) => s.id === currentScaleId) || SCALES_DB[0];
    return scale.intervals;
  };

  const renderVisuals = (): void => {
    const intervals = getActiveIntervals();
    const activePitchClasses = new Set(intervals.map((i) => (currentRoot + i) % 12));
    const rootName = NOTE_NAMES[currentRoot];

    if (isChordMode) {
      const chord = CHORDS_DB.find((c) => c.id === currentChordId) || CHORDS_DB[0];
      const noteNames = chord.intervals.map((i) => NOTE_NAMES[(currentRoot + i) % 12]).join(' – ');
      formulaInfo.innerHTML = `
        <strong>Notas de ${rootName}${chord.symbol} (${chord.name}):</strong>
        <span style="color:var(--accent-gold); font-weight:700;"> ${noteNames}</span><br>
        <span style="color:var(--text-muted);">Fórmula interválica: ${chord.formula} — ${chord.character}</span>
      `;
    } else {
      const scale = SCALES_DB.find((s) => s.id === currentScaleId) || SCALES_DB[0];
      const noteNames = scale.intervals.map((i) => NOTE_NAMES[(currentRoot + i) % 12]).join(' – ');
      formulaInfo.innerHTML = `
        <strong>Notas de ${rootName} ${scale.name}:</strong>
        <span style="color:var(--accent-gold); font-weight:700;"> ${noteNames}</span><br>
        <span style="color:var(--text-muted);">Fórmula: ${scale.formula} | Grados: ${scale.degrees} — ${scale.character}</span>
      `;
    }

    if (pianoContainer) {
      let pianoHtml = '';
      for (let oct = 0; oct < 2; oct++) {
        for (let pc = 0; pc < 12; pc++) {
          const midi = 60 + oct * 12 + pc;
          const isBlack = [1, 3, 6, 8, 10].includes(pc);
          const isRoot = pc === currentRoot;
          const inScale = activePitchClasses.has(pc);
          const keyClass = isBlack ? 'key-black' : 'key-white';
          const stateClass = isRoot ? 'is-root' : inScale ? 'in-scale' : '';
          pianoHtml += `<div class="${keyClass} ${stateClass}" data-midi="${midi}" title="Reproducir ${NOTE_NAMES[pc]}${4 + oct} (MIDI ${midi})"><span>${NOTE_NAMES[pc]}</span></div>`;
        }
      }
      pianoContainer.innerHTML = pianoHtml;
    }

    const useBassNeck = isBassOnly || currentInstrument === 'bass';
    const stringsToRender = useBassNeck ? BASS_STRINGS : GUITAR_STRINGS;
    neckTitle.textContent = useBassNeck
      ? 'Mástil Exclusivo de Bajo Eléctrico (4 cuerdas: G–D–A–E · Afinación E1–A1–D2–G2)'
      : 'Mástil de Guitarra (6 cuerdas: e-B-G-D-A-E) y Bajo Eléctrico (4 inferiores: G-D-A-E)';

    let fretHeaderHtml = `<div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.15); margin-bottom:4px;"><div class="string-label" style="color:var(--text-muted); font-size:0.7rem;">Traste</div>`;
    for (let f = 0; f <= 12; f++) {
      const marker = [3, 5, 7, 9, 12].includes(f) ? '•' : '';
      fretHeaderHtml += `<div class="fret-cell" style="height:20px; border:none; color:var(--text-muted); font-size:0.72rem; font-weight:700;">${f}${marker}</div>`;
    }
    fretHeaderHtml += `</div>`;

    let fretRowsHtml = fretHeaderHtml;
    stringsToRender.forEach((str) => {
      fretRowsHtml += `<div class="fretboard-row"><div class="string-label" style="color:${useBassNeck ? '#38bdf8' : '#f59e0b'};">${str.label}</div>`;
      for (let fret = 0; fret <= 12; fret++) {
        const midi = str.openMidi + fret;
        const pc = midi % 12;
        const isRoot = pc === currentRoot;
        const inScale = activePitchClasses.has(pc);
        const noteClass = isRoot ? 'root' : inScale ? 'active' : '';
        fretRowsHtml += `
          <div class="fret-cell" data-midi="${midi}" title="Cuerda ${str.label}, Traste ${fret}: ${NOTE_NAMES[pc]} (${audio.midiToFreq(midi).toFixed(1)} Hz)">
            <div class="fret-note ${noteClass}">${NOTE_NAMES[pc]}</div>
          </div>
        `;
      }
      fretRowsHtml += `</div>`;
    });
    fretboardContainer.innerHTML = fretRowsHtml;
  };

  renderVisuals();

  rootSelect.addEventListener('change', () => {
    currentRoot = parseInt(rootSelect.value, 10);
    renderVisuals();
  });

  modeSelect.addEventListener('change', () => {
    if (isChordMode) {
      currentChordId = modeSelect.value;
    } else {
      currentScaleId = modeSelect.value;
    }
    renderVisuals();
  });

  instSelect?.addEventListener('change', () => {
    currentInstrument = instSelect.value as 'guitar' | 'piano' | 'bass';
    renderVisuals();
  });

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
      const seq = [...intervals, 12];
      const baseMidi = currentInstrument === 'bass' ? 28 + ((currentRoot + 8) % 12) : 60 + currentRoot;
      seq.forEach((semi, idx) => {
        const midi = baseMidi + semi;
        if (currentInstrument === 'bass') {
          audio.playElectricBass(midi, 0.55, idx * 0.25, 0.36, bassStyle, false);
        } else if (currentInstrument === 'guitar') {
          audio.playPluckedGuitar(midi, 0.65, idx * 0.24, 0.26, false);
        } else {
          audio.playAcousticPiano(midi, 0.65, idx * 0.24, 0.25, false);
        }
      });
      onStatus(`Reproduciendo en ${currentInstrument === 'bass' ? 'Bajo Eléctrico (4 Cuerdas)' : currentInstrument === 'guitar' ? 'Guitarra' : 'Piano'}`);
    }
  });

  droneBtn.addEventListener('click', () => {
    const active = audio.toggleDrone(36 + currentRoot);
    droneBtn.textContent = active ? `🔊 Pedal ${NOTE_NAMES[currentRoot]} (ACTIVO)` : '🔊 Pedal Tónica';
    onStatus(active ? `Pedal de tónica ${NOTE_NAMES[currentRoot]} activado` : 'Pedal de tónica desactivado');
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
    onStatus(`Teclado: ${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1} (${audio.midiToFreq(midi).toFixed(1)} Hz)`);
  });

  fretboardContainer.addEventListener('click', (e) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('[data-midi]');
    if (!cell) return;
    const midi = parseInt(cell.getAttribute('data-midi')!, 10);
    if (isBassOnly || currentInstrument === 'bass') {
      audio.playElectricBass(midi, 1.35, 0, 0.38, bassStyle, true);
      onStatus(`Bajo 4 Cuerdas: ${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1} (${audio.midiToFreq(midi).toFixed(1)} Hz)`);
    } else {
      audio.playPluckedGuitar(midi, 1.5, 0, 0.32, true);
      onStatus(`Guitarra 6 Cuerdas: ${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1} (${audio.midiToFreq(midi).toFixed(1)} Hz)`);
    }
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
    audio.playElectricBass(midi, 1.3, 0, 0.4, style, true);
    renderNeck(s, f);
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
        renderNeck(n.s, n.f);
        audio.playElectricBass(midi, n.dur * 1.15, 0, 0.4, p.style, false);
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
    <div class="js-poly-grid" style="display:flex; flex-direction:column; gap:8px;"></div>
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
 * SPECIALIZED LAB 5: Interactive Drum Rudiment & Sticking Trainer (drum-rudiment-lab, bateria-pads)
 */
function buildDrumRudimentAndPadsLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const rudiments = [
    {
      name: '1. Single Paradiddle (R L R R - L R L L)',
      sticking: ['>R', 'L', 'R', 'R', '>L', 'R', 'L', 'L'],
      drums: ['snare', 'ghost', 'hihat', 'hihat', 'snare', 'ghost', 'kick', 'kick'] as const,
      desc: 'El golpe doble final invierte automáticamente la mano líder. Al orquestar R en Hi-Hat y >L en Caja nace el groove funk lineal.',
    },
    {
      name: '2. Double Stroke Roll / Mamacita-Papacito (R R L L - R R L L)',
      sticking: ['>R', 'R', '>L', 'L', '>R', 'R', '>L', 'L'],
      drums: ['snare', 'ghost', 'snare', 'ghost', 'tom', 'tom', 'kick', 'kick'] as const,
      desc: 'Aprovecha el rebote natural de la baqueta para tocar el segundo golpe con los dedos.',
    },
    {
      name: '3. Six-Stroke Roll (R l l r r L - R l l r r L)',
      sticking: ['>R', 'l', 'l', 'r', 'r', '>L', '>R', '>L'],
      drums: ['kick', 'ghost', 'ghost', 'hihat', 'hihat', 'snare', 'tom', 'crash'] as const,
      desc: 'Dos golpes simples acentuados enmarcando dos dobles fantasma: el fill favorito del rock, gospel y jazz fusión.',
    },
  ];

  let rIdx = 0;

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
      <select class="js-rud-sel">
        ${rudiments.map((r, i) => `<option value="${i}">${r.name}</option>`).join('')}
      </select>
      <div style="display:flex; gap:8px;">
        <button type="button" class="btn btn-primary js-rud-play">▶ Practicar Baquetación en Vivo</button>
        <button type="button" class="btn js-rud-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
      </div>
    </div>

    <div class="js-rud-desc" style="font-size:0.84rem; color:var(--text-muted); margin-bottom:10px;"></div>
    <div class="js-rud-steps" style="display:grid; grid-template-columns:repeat(8, 1fr); gap:6px; margin-bottom:16px;"></div>

    <div style="font-size:0.82rem; font-weight:700; color:var(--accent-cyan); margin-bottom:8px;">🥁 Pads de Estudio Interactivos (Haz clic para tocar en directo):</div>
    <div class="drum-pads">
      <div class="drum-pad" data-drum="kick">🥁 Bombo (Kick)<br><small style="color:var(--text-muted);">Sub 50–90 Hz</small></div>
      <div class="drum-pad" data-drum="snare">🥁 Caja (Snare)<br><small style="color:var(--text-muted);">Backbeat Fuerte</small></div>
      <div class="drum-pad" data-drum="ghost">🥁 Nota Fantasma (g)<br><small style="color:var(--text-muted);">Caja Suave</small></div>
      <div class="drum-pad" data-drum="hihat">📀 Hi-Hat Cerrado<br><small style="color:var(--text-muted);">Chick Metálico</small></div>
      <div class="drum-pad" data-drum="openhat">📀 Hi-Hat Abierto<br><small style="color:var(--text-muted);">Sustain Abierto</small></div>
      <div class="drum-pad" data-drum="tom">🥁 Tom de Piso<br><small style="color:var(--text-muted);">Fills y Cortes</small></div>
      <div class="drum-pad" data-drum="crash">💥 Plato Crash<br><small style="color:var(--text-muted);">Acento Climático</small></div>
      <div class="drum-pad" data-drum="clap">🥢 Rimshot / Clave<br><small style="color:var(--text-muted);">Ataque de Aro</small></div>
    </div>
  `;

  const sel = stage.querySelector<HTMLSelectElement>('.js-rud-sel')!;
  const descEl = stage.querySelector<HTMLElement>('.js-rud-desc')!;
  const stepsEl = stage.querySelector<HTMLElement>('.js-rud-steps')!;

  const renderSticking = (activeStep = -1): void => {
    const r = rudiments[rIdx];
    descEl.textContent = r.desc;
    stepsEl.innerHTML = r.sticking
      .map((st, idx) => {
        const isRight = st.toUpperCase().includes('R');
        const isAccent = st.startsWith('>');
        const isCurrent = idx === activeStep;
        return `
          <div style="padding:10px 4px; text-align:center; border-radius:8px; border:1px solid ${isRight ? 'rgba(245,158,11,0.5)' : 'rgba(56,189,248,0.5)'}; background:${isCurrent ? '#f59e0b' : isAccent ? 'rgba(245,158,11,0.18)' : 'rgba(15,23,42,0.85)'}; color:${isCurrent ? '#090d16' : '#f8fafc'};">
            <div style="font-size:1.05rem; font-weight:900;">${st}</div>
            <div style="font-size:0.68rem; color:${isCurrent ? '#090d16' : 'var(--text-muted)'};">${r.drums[idx].toUpperCase()}</div>
          </div>
        `;
      })
      .join('');
  };

  renderSticking();

  sel.addEventListener('change', () => {
    rIdx = parseInt(sel.value, 10);
    audio.stopAll();
    renderSticking();
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const pad = target.closest<HTMLElement>('.drum-pad');
    if (pad) {
      const type = pad.getAttribute('data-drum') as 'kick' | 'snare' | 'ghost' | 'hihat' | 'openhat' | 'crash' | 'tom' | 'clap';
      audio.playDrumHit(type);
      onStatus(`Percusión en directo: ${type.toUpperCase()}`);
      return;
    }

    if (target.closest('.js-rud-stop')) {
      audio.stopAll();
      renderSticking();
      return;
    }

    if (target.closest('.js-rud-play')) {
      audio.stopAll();
      const r = rudiments[rIdx];
      for (let bar = 0; bar < 2; bar++) {
        r.drums.forEach((d, idx) => {
          const total = bar * 8 + idx;
          audio.schedule(() => {
            renderSticking(idx);
            audio.playDrumHit(d);
            onStatus(`Rudimento: ${r.sticking[idx]} (${d})`);
          }, total * 190);
        });
      }
    }
  });
}

/**
 * SPECIALIZED LAB 6: Ear Training & Sight-Reading Quiz (ear-lab, reading-lab)
 */
function buildEarAndReadingTrainerLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void,
  isReadingMode: boolean
): void {
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

  const renderStaff = (feedback = 'Pulsa cualquier botón para escuchar y entrenar tu reconocimiento.'): void => {
    const it = items[targetIdx];
    stage.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
        <div>
          <strong style="color:var(--accent-gold);">${isReadingMode ? '🎼 Entrenador de Lectura en Pentagrama (Clave de Sol) y Mástil' : '👂 Gimnasio de Entrenamiento Auditivo Activo (Grados e Intervalos)'}</strong>
          <div style="font-size:0.8rem; color:var(--accent-cyan);">Aciertos acumulados: <strong>${score}</strong></div>
        </div>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn btn-primary js-quiz-new">🎲 Nuevo Reto</button>
          <button type="button" class="btn js-quiz-replay" style="background:rgba(56,189,248,0.18); color:#38bdf8;">🔊 Escuchar Referencia (C4 → Nota)</button>
        </div>
      </div>

      <div style="background:#070a12; border:1px solid rgba(56,189,248,0.3); border-radius:8px; padding:10px; margin-bottom:12px; display:flex; align-items:center; justify-content:center;">
        <svg viewBox="0 0 420 135" width="420" height="135">
          <!-- 5 Staff lines (y = 30, 46, 62, 78, 94) -->
          ${[30, 46, 62, 78, 94].map((y) => `<line x1="30" y1="${y}" x2="390" y2="${y}" stroke="#475569" stroke-width="1.5"/>`).join('')}
          <text x="42" y="84" fill="#f59e0b" font-size="52" font-family="serif">𝄞</text>
          ${
            isReadingMode
              ? `
            ${it.ledger ? `<line x1="192" y1="110" x2="228" y2="110" stroke="#94a3b8" stroke-width="2"/>` : ''}
            <ellipse cx="210" cy="${it.staffY}" rx="10" ry="7.5" fill="#38bdf8" transform="rotate(-15 210 ${it.staffY})"/>
            <line x1="219" y1="${it.staffY}" x2="219" y2="${it.staffY - 38}" stroke="#38bdf8" stroke-width="2"/>
          `
              : `<text x="210" y="70" text-anchor="middle" fill="#38bdf8" font-size="16" font-weight="800">🔊 Escucha e identifica el grado / intervalo</text>`
          }
        </svg>
      </div>

      <div style="font-size:0.85rem; color:#f8fafc; margin-bottom:10px; padding:8px 12px; background:rgba(56,189,248,0.12); border-radius:6px;">
        ${feedback}
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:8px;">
        ${items
          .map(
            (opt, idx) => `
          <button type="button" class="btn js-quiz-ans" data-idx="${idx}" style="background:rgba(30,41,59,0.9); border:1px solid rgba(56,189,248,0.35); color:#f8fafc; padding:10px; text-align:left; font-size:0.8rem;">
            ${opt.name}
          </button>
        `
          )
          .join('')}
      </div>
    `;
  };

  renderStaff();

  const playCurrentPrompt = (): void => {
    audio.stopAll();
    audio.playAcousticPiano(60, 0.65, 0, 0.25, false);
    audio.playPluckedGuitar(items[targetIdx].midi, 1.1, 0.55, 0.3, false);
  };

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('.js-quiz-new')) {
      targetIdx = Math.floor(Math.random() * items.length);
      renderStaff('🎯 ¡Nuevo reto generado! Escucha e identifica la nota.');
      playCurrentPrompt();
      return;
    }
    if (target.closest('.js-quiz-replay')) {
      playCurrentPrompt();
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
        renderStaff(`❌ Seleccionaste ${items[chosen].name}. Escucha de nuevo la referencia para encontrar la respuesta.`);
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
    { maj: 'C', min: 'Am', root: 0, sharps: '0 alteraciones', iv: 'F', v: 'G7', ii: 'Dm7', iii: 'Em7', vi: 'Am7', vii: 'Bm7b5' },
    { maj: 'G', min: 'Em', root: 7, sharps: '1 sostenido (F#)', iv: 'C', v: 'D7', ii: 'Am7', iii: 'Bm7', vi: 'Em7', vii: 'F#m7b5' },
    { maj: 'D', min: 'Bm', root: 2, sharps: '2 sostenidos (F#, C#)', iv: 'G', v: 'A7', ii: 'Em7', iii: 'F#m7', vi: 'Bm7', vii: 'C#m7b5' },
    { maj: 'A', min: 'F#m', root: 9, sharps: '3 sostenidos (F#, C#, G#)', iv: 'D', v: 'E7', ii: 'Bm7', iii: 'C#m7', vi: 'F#m7', vii: 'G#m7b5' },
    { maj: 'E', min: 'C#m', root: 4, sharps: '4 sostenidos (F#, C#, G#, D#)', iv: 'A', v: 'B7', ii: 'F#m7', iii: 'G#m7', vi: 'C#m7', vii: 'D#m7b5' },
    { maj: 'B', min: 'G#m', root: 11, sharps: '5 sostenidos', iv: 'E', v: 'F#7', ii: 'C#m7', iii: 'D#m7', vi: 'G#m7', vii: 'A#m7b5' },
    { maj: 'F# / Gb', min: 'D#m / Ebm', root: 6, sharps: '6 sostenidos / 6 bemoles', iv: 'B', v: 'C#7', ii: 'G#m7', iii: 'A#m7', vi: 'D#m7', vii: 'E#m7b5' },
    { maj: 'Db', min: 'Bbm', root: 1, sharps: '5 bemoles', iv: 'Gb', v: 'Ab7', ii: 'Ebm7', iii: 'Fm7', vi: 'Bbm7', vii: 'Cm7b5' },
    { maj: 'Ab', min: 'Fm', root: 8, sharps: '4 bemoles (Bb, Eb, Ab, Db)', iv: 'Db', v: 'Eb7', ii: 'Bbm7', iii: 'Cm7', vi: 'Fm7', vii: 'Gm7b5' },
    { maj: 'Eb', min: 'Cm', root: 3, sharps: '3 bemoles (Bb, Eb, Ab)', iv: 'Ab', v: 'Bb7', ii: 'Fm7', iii: 'Gm7', vi: 'Cm7', vii: 'Dm7b5' },
    { maj: 'Bb', min: 'Gm', root: 10, sharps: '2 bemoles (Bb, Eb)', iv: 'Eb', v: 'F7', ii: 'Cm7', iii: 'Dm7', vi: 'Gm7', vii: 'Am7b5' },
    { maj: 'F', min: 'Dm', root: 5, sharps: '1 bemol (Bb)', iv: 'Bb', v: 'C7', ii: 'Gm7', iii: 'Am7', vi: 'Dm7', vii: 'Em7b5' },
  ];

  let activeIdx = 0;

  container.innerHTML = `
    <div class="widget-header">
      <div>
        <strong style="color:var(--accent-gold); font-size:1.1rem;">Círculo de Quintas Interactivo y Mapa de Familias Armónicas</strong>
        <p style="font-size:0.82rem; color:var(--text-muted); margin:0;">Haz clic en cualquier tonalidad del círculo para escuchar su acorde tónica y su cadencia I – IV – V7 – I.</p>
      </div>
      <div class="widget-controls">
        <button type="button" class="btn btn-primary js-cof-cadence">🎸 Escuchar Cadencia I – IV – V7 – I</button>
        <button type="button" class="btn js-cof-rel" style="background:rgba(167,139,250,0.18); color:#c4b5fd; border:1px solid rgba(167,139,250,0.4);">🎹 Comparar Mayor vs Relativa Menor</button>
        <button type="button" class="btn js-cof-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
      </div>
    </div>
    <div class="circle-fifths-layout">
      <div class="circle-svg-box js-cof-svg-box"></div>
      <div class="cof-info-panel js-cof-info"></div>
    </div>
  `;

  const svgBox = container.querySelector<HTMLElement>('.js-cof-svg-box')!;
  const infoBox = container.querySelector<HTMLElement>('.js-cof-info')!;
  const cadenceBtn = container.querySelector<HTMLButtonElement>('.js-cof-cadence')!;
  const relBtn = container.querySelector<HTMLButtonElement>('.js-cof-rel')!;
  const stopBtn = container.querySelector<HTMLButtonElement>('.js-cof-stop')!;

  const renderCircle = (): void => {
    const cx = 180;
    const cy = 180;
    const rOuter = 152;
    const rMid = 104;
    const rInner = 58;

    let svg = `<svg viewBox="0 0 360 360" width="340" height="340" style="user-select:none;">`;
    keys.forEach((k, i) => {
      const angleDeg = i * 30 - 90;
      const a1 = ((angleDeg - 15) * Math.PI) / 180;
      const a2 = ((angleDeg + 15) * Math.PI) / 180;
      const aMid = (angleDeg * Math.PI) / 180;

      const isCurrent = i === activeIdx;
      const isNeighbor = i === (activeIdx + 1) % 12 || i === (activeIdx + 11) % 12;

      const fillOuter = isCurrent
        ? 'rgba(245, 158, 11, 0.88)'
        : isNeighbor
          ? 'rgba(56, 189, 248, 0.35)'
          : 'rgba(30, 41, 59, 0.9)';
      const fillInner = isCurrent
        ? 'rgba(167, 139, 250, 0.78)'
        : isNeighbor
          ? 'rgba(56, 189, 248, 0.22)'
          : 'rgba(15, 23, 42, 0.95)';

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

      const pathOuter = `M ${x1m} ${y1m} L ${x1o} ${y1o} A ${rOuter} ${rOuter} 0 0 1 ${x2o} ${y2o} L ${x2m} ${y2m} A ${rMid} ${rMid} 0 0 0 ${x1m} ${y1m} Z`;
      const pathInner = `M ${x1i} ${y1i} L ${x1m} ${y1m} A ${rMid} ${rMid} 0 0 1 ${x2m} ${y2m} L ${x2i} ${y2i} A ${rInner} ${rInner} 0 0 0 ${x1i} ${y1i} Z`;

      const txOuter = cx + ((rOuter + rMid) / 2) * Math.cos(aMid);
      const tyOuter = cy + ((rOuter + rMid) / 2) * Math.sin(aMid);
      const txInner = cx + ((rMid + rInner) / 2) * Math.cos(aMid);
      const tyInner = cy + ((rMid + rInner) / 2) * Math.sin(aMid);

      svg += `
        <g class="cof-sector" data-idx="${i}" style="cursor:pointer;">
          <path d="${pathOuter}" fill="${fillOuter}" stroke="#334155" stroke-width="1.5"/>
          <path d="${pathInner}" fill="${fillInner}" stroke="#334155" stroke-width="1.5"/>
          <text x="${txOuter}" y="${tyOuter + 4}" text-anchor="middle" fill="${isCurrent ? '#090d16' : '#f8fafc'}" font-size="12" font-weight="800">${k.maj}</text>
          <text x="${txInner}" y="${tyInner + 4}" text-anchor="middle" fill="${isCurrent ? '#090d16' : '#cbd5e1'}" font-size="10" font-weight="700">${k.min}</text>
        </g>
      `;
    });
    svg += `<circle cx="${cx}" cy="${cy}" r="${rInner - 2}" fill="#090d16" stroke="#475569" stroke-width="1.5"/>`;
    svg += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#f59e0b" font-size="12" font-weight="800">${keys[activeIdx].maj}</text>`;
    svg += `<text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="#38bdf8" font-size="10">Quintas</text>`;
    svg += `</svg>`;
    svgBox.innerHTML = svg;

    const k = keys[activeIdx];
    infoBox.innerHTML = `
      <h4 style="margin:0 0 8px 0; color:var(--accent-gold); font-size:1.15rem;">
        Tonalidad de ${k.maj} Mayor / Relativa: ${k.min}
      </h4>
      <p style="margin:0 0 12px 0; font-size:0.86rem; color:var(--text-muted);">
        Armadura de clave: <strong style="color:#f8fafc;">${k.sharps}</strong>
      </p>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(125px, 1fr)); gap:8px; margin-bottom:12px;">
        <div style="background:rgba(245,158,11,0.14); border:1px solid rgba(245,158,11,0.4); padding:8px 10px; border-radius:6px;">
          <div style="font-size:0.72rem; color:var(--accent-gold);">I (Tónica)</div>
          <div style="font-size:1rem; font-weight:800;">${k.maj}Maj7</div>
        </div>
        <div style="background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.35); padding:8px 10px; border-radius:6px;">
          <div style="font-size:0.72rem; color:var(--accent-cyan);">IV (Subdominante)</div>
          <div style="font-size:1rem; font-weight:800;">${k.iv}Maj7</div>
        </div>
        <div style="background:rgba(244,63,94,0.14); border:1px solid rgba(244,63,94,0.4); padding:8px 10px; border-radius:6px;">
          <div style="font-size:0.72rem; color:#fb7185;">V7 (Dominante)</div>
          <div style="font-size:1rem; font-weight:800;">${k.v}</div>
        </div>
        <div style="background:rgba(167,139,250,0.14); border:1px solid rgba(167,139,250,0.4); padding:8px 10px; border-radius:6px;">
          <div style="font-size:0.72rem; color:#c4b5fd;">vi (Relativo Menor)</div>
          <div style="font-size:1rem; font-weight:800;">${k.vi}</div>
        </div>
      </div>
      <div style="font-size:0.84rem; color:#cbd5e1; background:rgba(0,0,0,0.3); padding:10px; border-radius:6px;">
        <strong>Familia Diatónica Completa:</strong>
        I: ${k.maj}Maj7 · ii: ${k.ii} · iii: ${k.iii} · IV: ${k.iv}Maj7 · V7: ${k.v} · vi: ${k.vi} · vii°: ${k.vii}
      </div>
    `;
  };

  renderCircle();

  svgBox.addEventListener('click', (e) => {
    const sector = (e.target as HTMLElement).closest<HTMLElement>('.cof-sector');
    if (!sector) return;
    activeIdx = parseInt(sector.getAttribute('data-idx')!, 10);
    renderCircle();
    const r = keys[activeIdx].root;
    audio.strumChord([48 + r, 52 + r, 55 + r, 60 + r], 'guitar', 0, true);
    onStatus(`Círculo de Quintas: Tonalidad ${keys[activeIdx].maj} Mayor (${keys[activeIdx].sharps})`);
  });

  cadenceBtn.addEventListener('click', () => {
    audio.stopAll();
    const r = keys[activeIdx].root;
    const chords = [
      [48 + r, 52 + r, 55 + r, 60 + r],
      [48 + ((r + 5) % 12), 52 + ((r + 5) % 12), 55 + ((r + 5) % 12), 60 + ((r + 5) % 12)],
      [48 + ((r + 7) % 12), 52 + ((r + 7) % 12), 55 + ((r + 7) % 12), 58 + ((r + 7) % 12)],
      [48 + r, 52 + r, 55 + r, 60 + r],
    ];
    chords.forEach((c, idx) => audio.strumChord(c, 'guitar', idx * 0.85, false));
    onStatus(`Reproduciendo Cadencia I – IV – V7 – I en ${keys[activeIdx].maj}`);
  });

  relBtn.addEventListener('click', () => {
    audio.stopAll();
    const r = keys[activeIdx].root;
    const relMin = (r + 9) % 12;
    audio.strumChord([48 + r, 52 + r, 55 + r, 60 + r], 'piano', 0, false);
    audio.strumChord([48 + relMin, 51 + relMin, 55 + relMin, 60 + relMin], 'piano', 0.95, false);
    onStatus(`Comparando ${keys[activeIdx].maj} Mayor con su relativa menor ${keys[activeIdx].min}`);
  });

  stopBtn.addEventListener('click', () => {
    audio.stopAll();
    onStatus('Audio detenido');
  });
}

/**
 * Interactive 16-Step Drum & Groove Sequencer (with Upgraded 5-Track Studio Drum Synth)
 */
function buildSequencerWidget(
  container: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void,
  title = 'Secuenciador Interactivo de Batería y Groove de 16 Pasos (Semicorcheas)'
): void {
  const presets: Record<string, { name: string; bpm: number; grid: number[][] }> = {
    rock: {
      name: 'Rock Clásico / Pop (Backbeat 2 y 4)',
      bpm: 110,
      grid: [
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], // Hi-Hat
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Snare
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0], // Ghost Snare
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0], // Kick
      ],
    },
    funk: {
      name: 'Funk Linear & Ghost Notes (16th Groove)',
      bpm: 102,
      grid: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1],
        [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      ],
    },
    reggaeton: {
      name: 'Dembow / Urbano Latino (Tresillo + Backbeat)',
      bpm: 96,
      grid: [
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      ],
    },
    bossa: {
      name: 'Bossa Nova / Samba Cruzado',
      bpm: 124,
      grid: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
      ],
    },
  };

  let currentPreset = 'funk';
  let grid = presets[currentPreset].grid.map((r) => [...r]);
  const rowLabels = ['Hi-Hat (Charles)', 'Caja Fuerte (2 y 4)', 'Caja Fantasma (Ghost)', 'Bombo (Kick)'];
  const rowTypes: ('hihat' | 'snare' | 'ghost' | 'kick')[] = ['hihat', 'snare', 'ghost', 'kick'];

  container.innerHTML = `
    <div class="widget-header">
      <div>
        <strong style="color:var(--accent-gold); font-size:1.1rem;">${title}</strong>
        <p style="font-size:0.82rem; color:var(--text-muted); margin:0;">Activa o desactiva celdas en la rejilla de 16 semicorcheas (1 e & a 2 e & a 3 e & a 4 e & a) y escucha el groove con síntesis de estudio.</p>
      </div>
      <div class="widget-controls">
        <label style="font-size:0.82rem;">Patrón:</label>
        <select class="js-seq-preset">
          <option value="funk">Funk 16th + Ghost Notes</option>
          <option value="rock">Rock Clásico (Backbeat)</option>
          <option value="reggaeton">Dembow / Tresillo</option>
          <option value="bossa">Bossa Nova / Clave</option>
        </select>
        <button type="button" class="btn btn-primary js-seq-play">▶ Reproducir 2 Compases</button>
        <button type="button" class="btn js-seq-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
      </div>
    </div>
    <div class="seq-grid js-seq-grid"></div>
  `;

  const gridEl = container.querySelector<HTMLElement>('.js-seq-grid')!;
  const presetSel = container.querySelector<HTMLSelectElement>('.js-seq-preset')!;
  const playBtn = container.querySelector<HTMLButtonElement>('.js-seq-play')!;
  const stopBtn = container.querySelector<HTMLButtonElement>('.js-seq-stop')!;

  const renderGrid = (): void => {
    let html = `<div class="seq-label" style="color:var(--text-muted);">Paso</div>`;
    const subLabels = ['1', 'e', '&', 'a', '2', 'e', '&', 'a', '3', 'e', '&', 'a', '4', 'e', '&', 'a'];
    for (let s = 0; s < 16; s++) {
      const isDownbeat = s % 4 === 0;
      html += `<div style="text-align:center; font-size:0.72rem; font-weight:${isDownbeat ? '800' : '500'}; color:${isDownbeat ? 'var(--accent-gold)' : 'var(--text-muted)'};">${subLabels[s]}</div>`;
    }

    rowLabels.forEach((label, rIdx) => {
      html += `<div class="seq-label">${label}</div>`;
      for (let cIdx = 0; cIdx < 16; cIdx++) {
        const active = grid[rIdx][cIdx] === 1;
        const beatGroup = cIdx % 4 === 0 ? 'border-color:rgba(245,158,11,0.45);' : '';
        html += `<div class="seq-cell ${active ? 'active' : ''}" data-row="${rIdx}" data-col="${cIdx}" style="${beatGroup}"></div>`;
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
    }
  });

  presetSel.addEventListener('change', () => {
    currentPreset = presetSel.value;
    audio.stopAll();
    grid = presets[currentPreset].grid.map((r) => [...r]);
    renderGrid();
    onStatus(`Patrón cargado: ${presets[currentPreset].name}`);
  });

  playBtn.addEventListener('click', () => {
    audio.stopAll();
    const bpm = presets[currentPreset].bpm;
    const stepSec = 60 / bpm / 4;
    for (let bar = 0; bar < 2; bar++) {
      for (let step = 0; step < 16; step++) {
        const delay = (bar * 16 + step) * stepSec;
        rowTypes.forEach((drumType, rIdx) => {
          if (grid[rIdx][step] === 1) {
            audio.playDrumHit(drumType, delay);
          }
        });
      }
    }
    onStatus(`Reproduciendo secuencia: ${presets[currentPreset].name} (${bpm} BPM)`);
  });

  stopBtn.addEventListener('click', () => {
    audio.stopAll();
    onStatus('Secuenciador detenido');
  });
}

/**
 * Progression & Archetype Laboratory with Piano & Guitar Strum + Stop Button
 */
function buildProgressionWidget(
  container: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void,
  title = 'Laboratorio Interactivo de Progresiones Armónicas y Conducción de Voces'
): void {
  const progressions = [
    {
      id: 'pop_axis',
      name: 'I – V – vi – IV (Axis of Pop / Rock)',
      roman: ['I (CMaj7)', 'V (G7)', 'vi (Am7)', 'IV (FMaj7)'],
      chords: [
        [48, 52, 55, 59],
        [43, 50, 55, 59],
        [45, 52, 55, 60],
        [41, 48, 52, 57],
      ],
      desc: 'El ciclo más célebre del pop/rock contemporáneo: luminosidad inicial, suspenso dominante, giro lírico menor y expansión subdominante.',
    },
    {
      id: 'jazz_251',
      name: 'ii7 – V7 – IMaj7 – VI7alt (Jazz Turnaround)',
      roman: ['ii7 (Dm7)', 'V7 (G7)', 'IMaj7 (CMaj7)', 'VI7b9 (A7b9)'],
      chords: [
        [50, 53, 57, 60],
        [43, 53, 55, 59],
        [48, 52, 55, 59],
        [45, 52, 55, 58],
      ],
      desc: 'Las notas guía (3ª y 7ª) descienden por semitono con economía absoluta de movimiento.',
    },
    {
      id: 'andalusian',
      name: 'i – bVII – bVI – V7 (Cadencia Andaluza / Flamenco)',
      roman: ['i (Am)', 'bVII (G)', 'bVI (F)', 'V7 (E7b9)'],
      chords: [
        [45, 52, 57, 60],
        [43, 50, 55, 59],
        [41, 48, 53, 57],
        [40, 47, 52, 56],
      ],
      desc: 'Descenso por grados conjuntos en el bajo hacia el dominante frigio con tercera mayor.',
    },
    {
      id: 'modal_interchange',
      name: 'I – iii7 – IV – iv6 (Préstamo Modal / Subdominante Menor)',
      roman: ['I (C)', 'iii7 (Em7)', 'IV (FMaj7)', 'ivm6 (Fm6)'],
      chords: [
        [48, 52, 55, 60],
        [40, 52, 55, 59],
        [41, 48, 52, 57],
        [41, 48, 53, 56],
      ],
      desc: 'El acorde iv menor prestado del modo eólico aporta nostalgia cinematográfica instantánea (descenso A -> Ab -> G).',
    },
    {
      id: 'neoriemann',
      name: 'Transformaciones Neo-Riemannianas (P, L, R Cinematográfico)',
      roman: ['C Mayor (Base)', 'Cm (P: Paralelo)', 'Ab Mayor (L desde Cm)', 'Fm (R / Plagal Oscuro)'],
      chords: [
        [48, 52, 55, 60],
        [48, 51, 55, 60],
        [44, 51, 56, 60],
        [41, 48, 53, 56],
      ],
      desc: 'Cada acorde comparte 2 notas comunes con el anterior y mueve la tercera restante solo 1 semitono (sonido Hans Zimmer / John Williams).',
    },
  ];

  let currentIdx = title.includes('Riemann') ? 4 : 0;
  let currentInst: 'guitar' | 'piano' = 'guitar';

  container.innerHTML = `
    <div class="widget-header">
      <div>
        <strong style="color:var(--accent-gold); font-size:1.1rem;">${title}</strong>
        <p style="font-size:0.82rem; color:var(--text-muted); margin:0;">Haz clic en cada acorde individualmente para rasguearlo o reproduce el bucle armónico completo.</p>
      </div>
      <div class="widget-controls">
        <select class="js-prog-select">
          ${progressions.map((p, idx) => `<option value="${idx}" ${idx === currentIdx ? 'selected' : ''}>${p.name}</option>`).join('')}
        </select>
        <select class="js-prog-inst">
          <option value="guitar">🎸 Guitarra Acústica/Eléctrica</option>
          <option value="piano">🎹 Piano de Cola</option>
        </select>
        <button type="button" class="btn btn-primary js-prog-play">▶ Escuchar Progresión</button>
        <button type="button" class="btn js-prog-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
      </div>
    </div>
    <div class="js-prog-desc" style="margin-bottom:12px; font-size:0.86rem; color:var(--text-muted);"></div>
    <div class="js-prog-cards" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:10px;"></div>
  `;

  const sel = container.querySelector<HTMLSelectElement>('.js-prog-select')!;
  const instSel = container.querySelector<HTMLSelectElement>('.js-prog-inst')!;
  const playBtn = container.querySelector<HTMLButtonElement>('.js-prog-play')!;
  const stopBtn = container.querySelector<HTMLButtonElement>('.js-prog-stop')!;
  const descEl = container.querySelector<HTMLElement>('.js-prog-desc')!;
  const cardsEl = container.querySelector<HTMLElement>('.js-prog-cards')!;

  const renderCards = (): void => {
    const p = progressions[currentIdx];
    descEl.textContent = p.desc;
    cardsEl.innerHTML = p.roman
      .map(
        (label, cIdx) => `
      <button type="button" class="js-chord-card" data-cidx="${cIdx}" style="background:rgba(30,41,59,0.85); border:1px solid rgba(56,189,248,0.4); border-radius:8px; padding:14px 12px; color:#f8fafc; cursor:pointer; text-align:center; transition:0.15s;">
        <div style="font-size:0.75rem; color:var(--accent-cyan); margin-bottom:4px;">Compás ${cIdx + 1}</div>
        <div style="font-size:1.05rem; font-weight:800; color:var(--accent-gold);">${label}</div>
        <div style="font-size:0.72rem; color:#94a3b8; margin-top:4px;">🔊 Clic para escuchar</div>
      </button>
    `
      )
      .join('');
  };

  renderCards();

  sel.addEventListener('change', () => {
    currentIdx = parseInt(sel.value, 10);
    audio.stopAll();
    renderCards();
  });

  instSel.addEventListener('change', () => {
    currentInst = instSel.value as 'guitar' | 'piano';
  });

  cardsEl.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('.js-chord-card');
    if (!card) return;
    const cIdx = parseInt(card.getAttribute('data-cidx')!, 10);
    const p = progressions[currentIdx];
    audio.strumChord(p.chords[cIdx], currentInst, 0, true);
    onStatus(`Acorde ${p.roman[cIdx]} reproducido en ${currentInst === 'guitar' ? 'Guitarra' : 'Piano'}`);
  });

  playBtn.addEventListener('click', () => {
    audio.stopAll();
    const p = progressions[currentIdx];
    p.chords.forEach((notes, idx) => {
      audio.strumChord(notes, currentInst, idx * 0.9, false);
    });
    onStatus(`Reproduciendo progresión: ${p.name}`);
  });

  stopBtn.addEventListener('click', () => {
    audio.stopAll();
    onStatus('Progresión detenida');
  });
}

/**
 * SPECIALIZED LAB 7: Melody Reharmonizer (1 Fixed Melody Note over 6 Different Chords)
 */
function buildHarmonizerWidget(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const options = [
    { name: '1) C Mayor (Nota E4 = 3ª Mayor)', chord: [48, 55, 60], mel: 64, role: 'Luminoso, estable y hogareño.' },
    { name: '2) Am9 (Nota E4 = 5ª Justa)', chord: [45, 52, 55, 59], mel: 64, role: 'Melancólico, reflexivo y profundo.' },
    { name: '3) Fmaj7 (Nota E4 = 7ª Mayor)', chord: [41, 48, 52, 57], mel: 64, role: 'Nostálgico, flotante y cinematográfico.' },
    { name: '4) Dm9 (Nota E4 = 9ª Mayor)', chord: [50, 53, 57, 60], mel: 64, role: 'Sofisticado, urbano, neo-soul / jazz.' },
    { name: '5) Bbmaj7(#11) (Nota E4 = #11 Lidia)', chord: [46, 53, 57, 62], mel: 64, role: 'Maravilla espacial, sorpresa luminosa.' },
    { name: '6) C#m7 / Ab7(#5) (Nota E4 = b3 / b13)', chord: [44, 52, 54, 60], mel: 64, role: 'Giro dramático e inesperado.' },
  ];

  stage.innerHTML = `
    <p style="font-size:0.84rem; color:var(--text-muted); margin-bottom:10px;">
      La nota melódica superior es siempre <strong>E4 (Mi4, 329.6 Hz)</strong>, pero al cambiar el acorde que la sostiene debajo, cambia radicalmente su función interválica y su emoción:
    </p>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:10px;">
      ${options
        .map(
          (o, idx) => `
        <button type="button" class="js-reharm-card" data-idx="${idx}" style="background:rgba(15,23,42,0.9); border:1px solid rgba(56,189,248,0.4); border-radius:8px; padding:12px; text-align:left; cursor:pointer; color:#f8fafc;">
          <div style="font-weight:800; color:var(--accent-gold); font-size:0.88rem; margin-bottom:4px;">${o.name}</div>
          <div style="font-size:0.76rem; color:var(--text-muted);">${o.role}</div>
        </button>
      `
        )
        .join('')}
    </div>
  `;

  stage.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('.js-reharm-card');
    if (!card) return;
    const idx = parseInt(card.getAttribute('data-idx')!, 10);
    const o = options[idx];
    audio.stopAll();
    audio.strumChord(o.chord, 'piano', 0, false);
    audio.playPluckedGuitar(o.mel, 1.6, 0.12, 0.34, false);
    onStatus(`Rearmonización: ${o.name} — ${o.role}`);
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
    const titles: Record<string, string> = {
      'prog-arquetipos': 'Explorador de Arquetipos Armónicos y Ciclos Diatónicos',
      'prog-legacy': 'Constructor de Progresiones y Cadencias Funcionales',
      'prog-intercambio': 'Comparador de Intercambio Modal y Dominantes Secundarios',
      'mod-botones': 'Simulador de Modulaciones (Pivote, Directa, Cromática y Enarmónica)',
    };
    buildProgressionWidget(host, audio, onStatus, titles[usarType]);
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

  if (labType === 'harmonics-lab') {
    buildHarmonicsOscilloscopeLab(stage, audio, onStatus);
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
    buildHarmonizerWidget(stage, audio, onStatus);
  } else if (
    labType === 'progression-lab' ||
    labType === 'neo-riemann' ||
    labType === 'voice-leading' ||
    labType === 'form-lab' ||
    labType === 'arrangement-lab'
  ) {
    buildProgressionWidget(
      stage,
      audio,
      onStatus,
      labType === 'neo-riemann'
        ? 'Laboratorio de Transformaciones Neo-Riemannianas (P, L, R)'
        : 'Laboratorio de Progresiones y Conducción de Voces'
    );
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
 * NEW LAB 8: Personal Vocal Range Detector ("Descubre tu Tesitura") with Real Microphone + Manual Piano Selector
 */
function buildVocalPitchDetectorLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  let micStream: MediaStream | null = null;
  let micCtx: AudioContext | null = null;
  let rafId = 0;
  let currentDetectedMidi = 60;
  let lowestMidi: number | null = 45; // A2 default
  let highestMidi: number | null = 69; // A4 default

  const midiToName = (m: number): string => `${NOTE_NAMES[m % 12]}${Math.floor(m / 12) - 1}`;

  stage.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:14px; margin-bottom:14px;">
      <!-- Live Mic Panel -->
      <div style="background:rgba(15,23,42,0.92); border:1px solid rgba(56,189,248,0.4); border-radius:10px; padding:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <strong style="color:var(--accent-cyan); font-size:0.92rem;">1. Captura por Micrófono en Vivo</strong>
          <button type="button" class="btn btn-primary js-mic-toggle" style="font-size:0.78rem; padding:5px 12px;">🎙️ Activar Micrófono</button>
        </div>
        <div class="js-mic-readout" style="text-align:center; padding:14px 10px; background:#070a12; border-radius:8px; border:1px solid rgba(255,255,255,0.1); margin-bottom:10px;">
          <div style="font-size:1.75rem; font-weight:900; color:var(--accent-gold);" class="js-pitch-note">C4 (Do4)</div>
          <div style="font-size:0.84rem; color:#38bdf8;" class="js-pitch-hz">261.6 Hz · Listo para medir</div>
        </div>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn js-save-low" style="flex:1; font-size:0.76rem; background:rgba(56,189,248,0.18); color:#38bdf8; border:1px solid rgba(56,189,248,0.4);">⬇ Guardar como Mi Nota Grave</button>
          <button type="button" class="btn js-save-high" style="flex:1; font-size:0.76rem; background:rgba(245,158,11,0.2); color:#fbbf24; border:1px solid rgba(245,158,11,0.4);">⬆ Guardar como Mi Nota Aguda</button>
        </div>
      </div>

      <!-- Manual / Ear Test Fallback & Diagnosis Panel -->
      <div style="background:rgba(15,23,42,0.92); border:1px solid rgba(245,158,11,0.4); border-radius:10px; padding:14px;">
        <strong style="color:var(--accent-gold); font-size:0.92rem;">2. Diagnóstico Automático de Tesitura y Passaggio</strong>
        <div style="display:flex; gap:10px; margin:10px 0; align-items:center; flex-wrap:wrap;">
          <div style="font-size:0.8rem;">
            Grave:
            <select class="js-manual-low" style="background:#070a12; color:#38bdf8; border:1px solid #334155; border-radius:4px; padding:3px 6px;">
              ${Array.from({ length: 28 }, (_, i) => 38 + i)
                .map((m) => `<option value="${m}" ${m === lowestMidi ? 'selected' : ''}>${midiToName(m)} (${audio.midiToFreq(m).toFixed(0)} Hz)</option>`)
                .join('')}
            </select>
          </div>
          <div style="font-size:0.8rem;">
            Aguda:
            <select class="js-manual-high" style="background:#070a12; color:#fbbf24; border:1px solid #334155; border-radius:4px; padding:3px 6px;">
              ${Array.from({ length: 34 }, (_, i) => 55 + i)
                .map((m) => `<option value="${m}" ${m === highestMidi ? 'selected' : ''}>${midiToName(m)} (${audio.midiToFreq(m).toFixed(0)} Hz)</option>`)
                .join('')}
            </select>
          </div>
        </div>
        <div class="js-range-diagnosis" style="font-size:0.82rem; background:rgba(0,0,0,0.35); padding:10px; border-radius:6px; line-height:1.5;"></div>
      </div>
    </div>
  `;

  const micToggleBtn = stage.querySelector<HTMLButtonElement>('.js-mic-toggle')!;
  const noteEl = stage.querySelector<HTMLElement>('.js-pitch-note')!;
  const hzEl = stage.querySelector<HTMLElement>('.js-pitch-hz')!;
  const lowSel = stage.querySelector<HTMLSelectElement>('.js-manual-low')!;
  const highSel = stage.querySelector<HTMLSelectElement>('.js-manual-high')!;
  const diagEl = stage.querySelector<HTMLElement>('.js-range-diagnosis')!;

  const updateDiagnosis = (): void => {
    const low = lowestMidi ?? 45;
    const high = Math.max(low + 5, highestMidi ?? 69);
    const spanSemis = high - low;
    const octaves = (spanSemis / 12).toFixed(1);
    const center = Math.round((low + high) / 2);

    let voiceType = 'Barítono / Voz Media';
    let passInfo = 'B3 – E4';
    if (low <= 42 && high <= 65) {
      voiceType = 'Bajo (Voz Grave Masculina)';
      passInfo = 'A3 – D4';
    } else if (low <= 46 && high <= 70) {
      voiceType = 'Barítono (Voz Media Masculina)';
      passInfo = 'B3 – E4';
    } else if (low <= 51 && high <= 75) {
      voiceType = 'Tenor (Voz Aguda Masculina)';
      passInfo = 'D4 – G4';
    } else if (low <= 55 && high <= 78) {
      voiceType = 'Contralto (Voz Grave Femenina)';
      passInfo = 'C4 (1º) → C5–D5 (2º)';
    } else if (low <= 58 && high <= 82) {
      voiceType = 'Mezzosoprano (Voz Media Femenina)';
      passInfo = 'D4 (1º) → D5–E5 (2º)';
    } else {
      voiceType = 'Soprano (Voz Aguda Femenina)';
      passInfo = 'Eb4 (1º) → E5–F#5 (2º)';
    }

    diagEl.innerHTML = `
      <div><strong>Rango Medido:</strong> <span style="color:var(--accent-gold); font-weight:800;">${midiToName(low)} a ${midiToName(high)}</span> (${spanSemis} semitonos · ${octaves} octavas)</div>
      <div><strong>Clasificación Orientativa:</strong> <span style="color:var(--accent-cyan); font-weight:800;">${voiceType}</span></div>
      <div><strong>Tu Centro Cómodo para Calentar:</strong> <strong>${midiToName(center - 3)} – ${midiToName(center)}</strong> | <strong>Tu Zona de Passaggio:</strong> ${passInfo}</div>
    `;
  };

  updateDiagnosis();

  // Simple time-domain autocorrelation pitch detector
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
      hzEl.textContent = 'Sin acceso al micrófono — Usa los selectores manuales con referencia de piano a la derecha.';
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
    { name: 'Hendrix Chord E7#9 (0-8-7-6-7-0)', frets: [0, 8, 7, 6, 7, 0] },
    { name: 'Acorde "So What" Dm11 Cuartal', frets: [5, 6, 5, 5, 5, -1] },
    { name: 'Gmaj9 Acústico (x-10-9-11-10-x)', frets: [-1, 10, 11, 9, 10, -1] },
    { name: 'James Bond Em(Maj9) (0-3-4-4-2-0)', frets: [2, 4, 4, 1, 2, 0] },
  ];

  const identifyChord = (): { title: string; notesText: string; formulaText: string; midis: number[] } => {
    const active: { sIdx: number; fret: number; midi: number; pc: number }[] = [];
    for (let s = 5; s >= 0; s--) {
      if (stringFrets[s] >= 0) {
        const midi = GUITAR_STRINGS[s].openMidi + stringFrets[s];
        active.push({ sIdx: s, fret: stringFrets[s], midi, pc: midi % 12 });
      }
    }
    if (active.length === 0) {
      return {
        title: 'Ninguna cuerda activa (Haz clic en los trastes para pisar notas)',
        notesText: '—',
        formulaText: '—',
        midis: [],
      };
    }

    const bass = active[0];
    const uniquePcs = [...new Set(active.map((a) => a.pc))];
    const noteNames = active.map((a) => `${NOTE_NAMES[a.pc]}${Math.floor(a.midi / 12) - 1}`).join(' – ');

    // Try matching each unique pitch class as potential root
    let bestName = `${NOTE_NAMES[bass.pc]} (Intervalo / Cluster)`;
    let bestFormula = '';

    for (const candidateRoot of uniquePcs) {
      const relSet = new Set(uniquePcs.map((pc) => (pc - candidateRoot + 12) % 12));
      const has3M = relSet.has(4);
      const has3m = relSet.has(3);
      const has5 = relSet.has(7);
      const hasb5 = relSet.has(6);
      const has7M = relSet.has(11);
      const hasb7 = relSet.has(10);
      const has6 = relSet.has(9);
      const has9 = relSet.has(2);
      const has4 = relSet.has(5);

      let suffix = '';
      if (has3M && has7M && has9) suffix = 'Maj9';
      else if (has3M && has7M) suffix = 'Maj7';
      else if (has3m && has7M) suffix = 'm(Maj7)';
      else if (has3M && hasb7 && relSet.has(3)) suffix = '7(#9)';
      else if (has3M && hasb7 && has9) suffix = '9';
      else if (has3M && hasb7) suffix = '7';
      else if (has3m && hasb7 && has4 && has9) suffix = 'm11';
      else if (has3m && hasb7 && has9) suffix = 'm9';
      else if (has3m && hasb7 && hasb5) suffix = 'm7b5';
      else if (has3m && hasb7) suffix = 'm7';
      else if (has3M && has6 && has9) suffix = '6/9';
      else if (has3M && has9 && !has7M && !hasb7) suffix = 'add9';
      else if (has3M && (has5 || uniquePcs.length >= 2)) suffix = ' Mayor';
      else if (has3m && (has5 || uniquePcs.length >= 2)) suffix = 'm';
      else if (!has3M && !has3m && has4 && has5) suffix = 'sus4';
      else if (!has3M && !has3m && has9 && has5) suffix = 'sus2';

      if (suffix) {
        const rootName = NOTE_NAMES[candidateRoot];
        const slash = candidateRoot !== bass.pc ? ` / ${NOTE_NAMES[bass.pc]} (Inversión con ${NOTE_NAMES[bass.pc]} en el bajo)` : '';
        bestName = `${rootName}${suffix}${slash}`;
        bestFormula = [...relSet]
          .sort((a, b) => a - b)
          .map((st) => ['1', 'b2/b9', '2/9', 'b3/#9', '3M', '4/11', 'b5/#11', '5J', 'b6/b13', '6/13', 'b7', '7M'][st])
          .join(' – ');
        if (candidateRoot === bass.pc) break;
      }
    }

    return {
      title: bestName,
      notesText: noteNames,
      formulaText: bestFormula || 'Conjunto libre de notas',
      midis: active.map((a) => a.midi),
    };
  };

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

  const render = (): void => {
    const info = identifyChord();
    readout.innerHTML = `
      <div style="font-size:1.25rem; font-weight:900; color:var(--accent-gold); margin-bottom:4px;">Acorde Detectado: ${info.title}</div>
      <div style="font-size:0.84rem; color:#cbd5e1;"><strong>Notas (de grave a agudo):</strong> <span style="color:#38bdf8;">${info.notesText}</span> | <strong>Estructura Interválica:</strong> ${info.formulaText}</div>
    `;

    let html = `<div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.15); margin-bottom:4px;"><div class="string-label" style="font-size:0.7rem; color:var(--text-muted);">Cuerda</div>`;
    for (let f = 0; f <= 12; f++) {
      html += `<div class="fret-cell" style="height:20px; border:none; font-size:0.72rem; color:var(--text-muted); font-weight:700;">${f}</div>`;
    }
    html += `</div>`;

    GUITAR_STRINGS.forEach((str, sIdx) => {
      const selectedFret = stringFrets[sIdx];
      html += `<div class="fretboard-row"><div class="string-label">${str.label} ${selectedFret === -1 ? '(X)' : ''}</div>`;
      for (let f = 0; f <= 12; f++) {
        const midi = str.openMidi + f;
        const pc = midi % 12;
        const isSelected = selectedFret === f;
        html += `
          <div class="fret-cell js-rcf-cell" data-s="${sIdx}" data-f="${f}" data-midi="${midi}">
            <div class="fret-note ${isSelected ? 'root' : ''}">${NOTE_NAMES[pc]}</div>
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
    if (cell) {
      const s = parseInt(cell.getAttribute('data-s')!, 10);
      const f = parseInt(cell.getAttribute('data-f')!, 10);
      const midi = parseInt(cell.getAttribute('data-midi')!, 10);
      if (stringFrets[s] === f) {
        stringFrets[s] = -1; // toggle mute
      } else {
        stringFrets[s] = f;
        audio.playPluckedGuitar(midi, 1.3, 0, 0.3, true);
      }
      render();
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
      audio.strumChord(info.midis, 'guitar', 0, true);
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
        audio.strumChord(info.midis, 'guitar', 0, true);
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

      <div style="display:flex; flex-wrap:wrap; gap:16px; align-items:center; background:rgba(15,23,42,0.9); border:1px solid rgba(245,158,11,0.4); border-radius:10px; padding:16px;">
        <!-- Visual Bamboo Flute Tube -->
        <div style="flex:1; min-width:280px; background:linear-gradient(180deg, #92400e, #b45309, #78350f); border:2px solid #f59e0b; border-radius:24px; padding:14px 22px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
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
    <div class="js-folk-grid"></div>
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

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        <select class="js-di-feet">${feetPatterns.map((f, i) => `<option value="${i}">${f.name}</option>`).join('')}</select>
        <select class="js-di-hands">${handPatterns.map((h, i) => `<option value="${i}">${h.name}</option>`).join('')}</select>
      </div>
      <div style="display:flex; gap:8px;">
        <button type="button" class="btn btn-primary js-di-play">▶ Escuchar Combinación de 4 Extremidades</button>
        <button type="button" class="btn js-di-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
      </div>
    </div>
    <div class="js-di-grid"></div>
  `;

  const fSel = stage.querySelector<HTMLSelectElement>('.js-di-feet')!;
  const hSel = stage.querySelector<HTMLSelectElement>('.js-di-hands')!;
  const grid = stage.querySelector<HTMLElement>('.js-di-grid')!;

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
  };

  render();
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
    if (target.closest('.js-di-stop')) {
      audio.stopAll();
      render();
      return;
    }
    if (target.closest('.js-di-play')) {
      audio.stopAll();
      const f = feetPatterns[fIdx];
      const h = handPatterns[hIdx];
      for (let bar = 0; bar < 3; bar++) {
        for (let s = 0; s < 8; s++) {
          const total = bar * 8 + s;
          audio.schedule(() => {
            render(s);
            if (h.rh[s]) audio.playDrumHit('hihat');
            if (h.lh[s] === 2) audio.playDrumHit('snare');
            else if (h.lh[s] === 1) audio.playDrumHit('ghost');
            if (f.kick[s]) audio.playDrumHit('kick');
            if (f.hhFoot[s]) audio.playDrumHit('clap');
          }, total * 165);
        }
      }
      onStatus(`Independencia 4 Extremidades: ${f.name} + ${h.name}`);
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

