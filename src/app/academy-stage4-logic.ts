// Pure logic & deterministic datasets for Stage 4:
// - Synthesis (Oscillators, ADSR Envelope, Resonant Low-Pass Filter) & MIDI Sequencing
// - Visual EQ, Compression, & Mastering Metrics (LUFS, Crest Factor, True Peak)
// - Complex Work Guided Analysis ("Horizonte de Cristal")
// - Integrator Master Project Architect & Register/Collision Auditor

export type SynthWaveform = 'sawtooth' | 'square' | 'triangle' | 'sine';

export interface SynthAdsrConfig {
  attackMs: number;
  decayMs: number;
  sustain: number; // 0..1
  releaseMs: number;
}

export interface SynthPatchPreset {
  id: string;
  label: string;
  waveform: SynthWaveform;
  subOscLevel: number; // 0..0.6
  cutoffHz: number;
  resonanceQ: number;
  adsr: SynthAdsrConfig;
  description: string;
  musicalRole: string;
}

export const SYNTH_PATCH_PRESETS: SynthPatchPreset[] = [
  {
    id: 'sub-bass',
    label: 'Bajo Analógico Sustractivo',
    waveform: 'sawtooth',
    subOscLevel: 0.45,
    cutoffHz: 620,
    resonanceQ: 3.8,
    adsr: { attackMs: 12, decayMs: 240, sustain: 0.55, releaseMs: 180 },
    description: 'Diente de sierra rica en armónicos filtrada a 620 Hz con caída rápida para cuerpo firme en graves.',
    musicalRole: 'Base de Synth-Pop, Funk electrónico y subgraves definidos sin invadir la voz.',
  },
  {
    id: 'pad-warm',
    label: 'Colchón Polifónico (Pad)',
    waveform: 'triangle',
    subOscLevel: 0.25,
    cutoffHz: 1450,
    resonanceQ: 1.4,
    adsr: { attackMs: 320, decayMs: 420, sustain: 0.78, releaseMs: 650 },
    description: 'Ataque lento (320 ms) y liberación amplia (650 ms) que abraza la armonía sin tapar transitorios.',
    musicalRole: 'Colchón armónico cinematográfico en estribillos y puentes.',
  },
  {
    id: 'lead-bright',
    label: 'Lead Solista Cuadrado',
    waveform: 'square',
    subOscLevel: 0.15,
    cutoffHz: 3600,
    resonanceQ: 4.5,
    adsr: { attackMs: 18, decayMs: 180, sustain: 0.82, releaseMs: 220 },
    description: 'Onda cuadrada (armónicos impares tipo clarinete) con resonancia media para cortar en la mezcla.',
    musicalRole: 'Melodías principales, ganchos (hooks) y doblajes agudos.',
  },
  {
    id: 'pluck-arp',
    label: 'Pluck Secuenciado (Arpegio)',
    waveform: 'sawtooth',
    subOscLevel: 0.1,
    cutoffHz: 2100,
    resonanceQ: 5.2,
    adsr: { attackMs: 5, decayMs: 190, sustain: 0.14, releaseMs: 160 },
    description: 'Sustain bajo (14%) y decaimiento veloz que imita una cuerda pulsada percusiva.',
    musicalRole: 'Arpegios MIDI en semicorcheas y ostinatos rítmicos claros.',
  },
];

export interface AdsrSvgPoint {
  x: number;
  y: number;
  label: string;
}

export function computeAdsrEnvelopePoints(
  adsr: SynthAdsrConfig,
  width = 320,
  height = 110
): { pointsAttr: string; nodes: AdsrSvgPoint[]; totalMs: number } {
  const atk = Math.max(5, Math.min(800, adsr.attackMs));
  const dec = Math.max(20, Math.min(900, adsr.decayMs));
  const sus = Math.max(0.05, Math.min(1, adsr.sustain));
  const rel = Math.max(30, Math.min(1000, adsr.releaseMs));
  const holdMs = 260;
  const totalMs = atk + dec + holdMs + rel;

  const padX = 12;
  const padY = 14;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;

  const toX = (ms: number) => +(padX + (ms / totalMs) * plotW).toFixed(1);
  const toY = (lvl: number) => +(padY + (1 - lvl) * plotH).toFixed(1);

  const nodes: AdsrSvgPoint[] = [
    { x: toX(0), y: toY(0), label: '0' },
    { x: toX(atk), y: toY(1), label: 'A' },
    { x: toX(atk + dec), y: toY(sus), label: 'D' },
    { x: toX(atk + dec + holdMs), y: toY(sus), label: 'S' },
    { x: toX(totalMs), y: toY(0), label: 'R' },
  ];

  const pointsAttr = nodes.map((n) => `${n.x},${n.y}`).join(' ');
  return { pointsAttr, nodes, totalMs };
}

export function computeLowPassResponseCurve(
  cutoffHz: number,
  resonanceQ: number,
  freqs: number[] = [40, 80, 150, 300, 600, 1200, 2400, 4800, 9600, 16000]
): { freqHz: number; db: number }[] {
  const fc = Math.max(80, Math.min(14000, cutoffHz));
  const q = Math.max(0.5, Math.min(12, resonanceQ));
  return freqs.map((f) => {
    const ratio = f / fc;
    const r2 = ratio * ratio;
    const denomSq = Math.pow(1 - r2, 2) + Math.pow(ratio / q, 2);
    const mag = 1 / Math.sqrt(Math.max(1e-6, denomSq));
    const db = Math.max(-30, Math.min(14, +(20 * Math.log10(mag)).toFixed(2)));
    return { freqHz: f, db };
  });
}

// MIDI Sequencer & Humanization
export interface MidiGroovePreset {
  id: string;
  label: string;
  bpm: number;
  scaleHint: string;
  steps: { step: number; noteOffset: number; velocity: number; gateRatio: number }[];
}

export const MIDI_GROOVE_PRESETS: MidiGroovePreset[] = [
  {
    id: 'neo-soul-7ths',
    label: 'Neo-Soul / Rhodes 7ªs',
    bpm: 88,
    scaleHint: 'Cm9 → Fm9 (acordes rotos con acento en tiempos débiles)',
    steps: [
      { step: 0, noteOffset: 0, velocity: 108, gateRatio: 0.85 },
      { step: 1, noteOffset: 7, velocity: 78, gateRatio: 0.65 },
      { step: 2, noteOffset: 10, velocity: 96, gateRatio: 0.75 },
      { step: 3, noteOffset: 14, velocity: 112, gateRatio: 0.9 },
      { step: 4, noteOffset: 5, velocity: 102, gateRatio: 0.8 },
      { step: 5, noteOffset: 8, velocity: 72, gateRatio: 0.6 },
      { step: 6, noteOffset: 12, velocity: 94, gateRatio: 0.75 },
      { step: 7, noteOffset: 15, velocity: 110, gateRatio: 0.85 },
    ],
  },
  {
    id: 'synth-arp-minor',
    label: 'Synthwave Arpegio Menor',
    bpm: 112,
    scaleHint: 'Motor en corcheas constante (1–5–♭7–8–5–♭3)',
    steps: [
      { step: 0, noteOffset: 0, velocity: 116, gateRatio: 0.72 },
      { step: 1, noteOffset: 7, velocity: 88, gateRatio: 0.68 },
      { step: 2, noteOffset: 10, velocity: 102, gateRatio: 0.72 },
      { step: 3, noteOffset: 12, velocity: 92, gateRatio: 0.68 },
      { step: 4, noteOffset: 0, velocity: 114, gateRatio: 0.72 },
      { step: 5, noteOffset: 7, velocity: 84, gateRatio: 0.68 },
      { step: 6, noteOffset: 3, velocity: 104, gateRatio: 0.72 },
      { step: 7, noteOffset: 7, velocity: 90, gateRatio: 0.68 },
    ],
  },
  {
    id: 'funk-bass-pocket',
    label: 'Bajo Funk Sincopado',
    bpm: 98,
    scaleHint: 'Golpe fuerte en "The One" + ghost notes suaves (vel < 65)',
    steps: [
      { step: 0, noteOffset: 0, velocity: 122, gateRatio: 0.85 },
      { step: 2, noteOffset: 0, velocity: 58, gateRatio: 0.35 },
      { step: 3, noteOffset: 10, velocity: 104, gateRatio: 0.65 },
      { step: 4, noteOffset: 12, velocity: 96, gateRatio: 0.6 },
      { step: 6, noteOffset: 5, velocity: 108, gateRatio: 0.7 },
      { step: 7, noteOffset: 7, velocity: 64, gateRatio: 0.45 },
    ],
  },
];

export interface MidiRollEvent {
  step: number;
  midi: number;
  noteName: string;
  velocity: number;
  timingOffsetMs: number;
  durationMs: number;
  hexNoteOn: string;
}

const MIDI_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function formatMidiNoteName(midi: number): string {
  const clamped = Math.max(0, Math.min(127, Math.round(midi)));
  return `${MIDI_NOTE_NAMES[clamped % 12]}${Math.floor(clamped / 12) - 1}`;
}

export function buildMidiRollEvents(
  presetId: string,
  humanizePct: number,
  rootMidi = 48,
  activeStepsOverride?: Set<number>
): MidiRollEvent[] {
  const preset = MIDI_GROOVE_PRESETS.find((p) => p.id === presetId) || MIDI_GROOVE_PRESETS[0];
  const hFactor = Math.max(0, Math.min(100, humanizePct)) / 100;
  const eighthMs = Math.round(60000 / preset.bpm / 2);

  // Deterministic micro-offsets so tests and UI stay predictable yet organic
  const microTimePattern = [0, 11, -7, 14, -4, 9, -9, 6];
  const microVelPattern = [0, -10, 6, -12, 4, -8, 8, -6];

  const stepSource =
    activeStepsOverride && activeStepsOverride.size > 0
      ? Array.from({ length: 8 }, (_, idx) => {
          const base = preset.steps.find((s) => s.step === idx);
          return base || { step: idx, noteOffset: [0, 3, 5, 7, 10, 12, 7, 5][idx], velocity: 92, gateRatio: 0.72 };
        }).filter((s) => activeStepsOverride.has(s.step))
      : preset.steps;

  return stepSource.map((s) => {
    const midi = Math.max(24, Math.min(108, rootMidi + s.noteOffset));
    const velJitter = Math.round(microVelPattern[s.step % microVelPattern.length] * hFactor);
    const velocity = Math.max(1, Math.min(127, s.velocity + velJitter));
    const timingOffsetMs = Math.round(microTimePattern[s.step % microTimePattern.length] * hFactor);
    const durationMs = Math.max(60, Math.round(eighthMs * s.gateRatio));
    const hexPitch = midi.toString(16).toUpperCase().padStart(2, '0');
    const hexVel = velocity.toString(16).toUpperCase().padStart(2, '0');
    return {
      step: s.step,
      midi,
      noteName: formatMidiNoteName(midi),
      velocity,
      timingOffsetMs,
      durationMs,
      hexNoteOn: `0x90 0x${hexPitch} 0x${hexVel}`,
    };
  });
}

// ============================================================================
// 2. VISUAL EQ, COMPRESSION & MASTERING ENGINE (Stage 6)
// ============================================================================

export type MixStemId = 'full-band' | 'lead-vocal' | 'electric-bass' | 'rhythm-guitar';

export interface MixEqSettings {
  stemId: MixStemId;
  hpfHz: number;      // 20 .. 260 Hz
  lowMidDb: number;   // 250 Hz bell: -10 .. +8 dB
  presenceDb: number; // 3000 Hz bell: -8 .. +8 dB
  airDb: number;      // 10000 Hz shelf: -6 .. +8 dB
  compRatio: number;  // 1 .. 10
  compThreshDb: number; // -32 .. -4 dB
  limiterCeilingDb: number; // -3.0 .. 0.0 dBTP
  targetLufs: number; // -16 .. -7 LUFS
}

export interface EqPresetProfile {
  id: string;
  label: string;
  settings: Omit<MixEqSettings, 'stemId' | 'targetLufs'>;
  summary: string;
}

export const EQ_PRESETS: EqPresetProfile[] = [
  {
    id: 'clean-pro',
    label: 'Limpieza Profesional (3D)',
    settings: {
      hpfHz: 95,
      lowMidDb: -3.5,
      presenceDb: 2.5,
      airDb: 2.0,
      compRatio: 3.5,
      compThreshDb: -18,
      limiterCeilingDb: -1.0,
    },
    summary: 'Corta subgraves innecesarios, limpia barro en 250 Hz y protege -1.0 dBTP para streaming.',
  },
  {
    id: 'muddy-boxy',
    label: '⚠️ Trampa: Barro en 250 Hz y Sin HPF',
    settings: {
      hpfHz: 24,
      lowMidDb: 6.5,
      presenceDb: -3.0,
      airDb: -2.0,
      compRatio: 1.5,
      compThreshDb: -8,
      limiterCeilingDb: -1.0,
    },
    summary: 'Acumulación grave-media que opaca la voz y provoca choque directo con bajo y caja.',
  },
  {
    id: 'over-squashed',
    label: '⚠️ Trampa: Sobrelimitado (Guerra de Volumen)',
    settings: {
      hpfHz: 85,
      lowMidDb: 0.5,
      presenceDb: 4.5,
      airDb: 3.5,
      compRatio: 9.0,
      compThreshDb: -30,
      limiterCeilingDb: -0.1,
    },
    summary: 'Compresión extrema + techo casi a 0 dBTP: aplasta los transitorios y genera fatiga auditiva.',
  },
];

export const MIX_STEM_LABELS: Record<MixStemId, { title: string; recommendedHpfHz: number; focusNote: string }> = {
  'full-band': {
    title: 'Mezcla Completa (4 Pistas)',
    recommendedHpfHz: 32,
    focusNote: 'En bus máster el HPF debe quedar suave (25–35 Hz) para conservar el peso del bombo y bajo.',
  },
  'lead-vocal': {
    title: 'Voz Principal',
    recommendedHpfHz: 95,
    focusNote: 'HPF entre 85–110 Hz, limpieza sutil en 250 Hz y presencia controlada en 3 kHz.',
  },
  'electric-bass': {
    title: 'Bajo Eléctrico',
    recommendedHpfHz: 35,
    focusNote: 'Sostiene 45–120 Hz; cuida el rango 700–1200 Hz para definir los dedos sin chocar con la guitarra.',
  },
  'rhythm-guitar': {
    title: 'Guitarra Rítmica',
    recommendedHpfHz: 110,
    focusNote: 'HPF obligatorio en 100–130 Hz para ceder el suelo al bajo y evitar efecto bola.',
  },
};

export function computeEqCurveDb(
  settings: Pick<MixEqSettings, 'hpfHz' | 'lowMidDb' | 'presenceDb' | 'airDb'>,
  freqs: number[] = [30, 60, 120, 250, 500, 1000, 2000, 3000, 5000, 8000, 10000, 16000]
): { freqHz: number; db: number }[] {
  return freqs.map((f) => {
    // 12 dB/oct HPF rolloff below hpfHz
    const hpfLoss = f < settings.hpfHz ? -12 * Math.log2(settings.hpfHz / Math.max(15, f)) : 0;
    // Gaussian bells in log2 frequency space
    const d250 = Math.log2(f / 250);
    const bell250 = settings.lowMidDb * Math.exp(-(d250 * d250) / 0.45);
    const d3k = Math.log2(f / 3000);
    const bell3k = settings.presenceDb * Math.exp(-(d3k * d3k) / 0.55);
    // High-shelf around 10 kHz
    const airFactor = 1 / (1 + Math.pow(6500 / Math.max(20, f), 2));
    const airGain = settings.airDb * airFactor;

    const total = Math.max(-24, Math.min(14, +(hpfLoss + bell250 + bell3k + airGain).toFixed(2)));
    return { freqHz: f, db: total };
  });
}

export interface MixMasterEvaluation {
  estimatedLufs: number;
  crestFactorDb: number;
  truePeakDbtp: number;
  gainReductionDb: number;
  mudRisk: 'nominal' | 'warning' | 'critical';
  statusLabel: string;
  diagnosticNote: string;
}

export function evaluateMixAndMasterMetrics(settings: MixEqSettings): MixMasterEvaluation {
  const drive = Math.max(0, (-12 - settings.compThreshDb) * 0.35);
  const ratioPenalty = (settings.compRatio - 1) * 0.65;
  const gainReductionDb = +Math.min(18, drive + ratioPenalty).toFixed(1);

  const crestFactorDb = +Math.max(3.2, 14.5 - gainReductionDb * 0.68).toFixed(1);
  const estimatedLufs = +Math.max(-20, Math.min(-5.5, settings.targetLufs + gainReductionDb * 0.25 - 1.2)).toFixed(1);
  const truePeakDbtp = +settings.limiterCeilingDb.toFixed(1);

  const isMuddy = settings.lowMidDb >= 3.5 || (settings.stemId !== 'electric-bass' && settings.stemId !== 'full-band' && settings.hpfHz < 65);
  const isOverCompressed = crestFactorDb < 6.0 || truePeakDbtp > -0.5;

  if (isOverCompressed) {
    return {
      estimatedLufs,
      crestFactorDb,
      truePeakDbtp,
      gainReductionDb,
      mudRisk: 'critical',
      statusLabel: '▲ Sobrelimitado / Riesgo Inter-Sample Clip',
      diagnosticNote:
        truePeakDbtp > -0.5
          ? 'Baja el techo del limitador a -1.0 dBTP para evitar distorsión al convertir a MP3/AAC en Spotify o YouTube.'
          : 'El Crest Factor cayó bajo 6 dB: relaja el Threshold o baja el Ratio para devolver golpe y respiración a la caja.',
    };
  }

  if (isMuddy) {
    return {
      estimatedLufs,
      crestFactorDb,
      truePeakDbtp,
      gainReductionDb,
      mudRisk: 'warning',
      statusLabel: '▲ Enmascaramiento en 250 Hz / Graves Sueltos',
      diagnosticNote:
        'Atenúa entre 2 y 4 dB alrededor de 250 Hz y sube el filtro pasa-altos (HPF) acorde al instrumento para despejar la zona media-grave.',
    };
  }

  return {
    estimatedLufs,
    crestFactorDb,
    truePeakDbtp,
    gainReductionDb,
    mudRisk: 'nominal',
    statusLabel: '● Mezcla Balanceada y Dinámica Saludable',
    diagnosticNote:
      'Headroom seguro (-1.0 dBTP), graves limpios y rango dinámico ideal entre 7 y 13 dB para conservar pegada y emoción.',
  };
}

// ============================================================================
// 3. COMPLEX WORK ANALYSIS ("Horizonte de Cristal" - Etapa 7)
// ============================================================================

export interface ComplexWorkSection {
  id: string;
  label: string;
  barsLabel: string;
  keyCenter: string;
  chordSymbols: string[];
  chordMidis: number[][];
  bassMidis: number[];
  melodyMidis: number[];
  harmonicDevices: string[];
  textureRole: string;
  listeningCue: string;
}

export const COMPLEX_WORK_SECTIONS: ComplexWorkSection[] = [
  {
    id: 'intro',
    label: '1. Intro',
    barsLabel: 'cc. 1–4',
    keyCenter: 'La menor (A eólico / armónico)',
    chordSymbols: ['Am9', 'Fmaj7(#11)', 'Dm9', 'E7(b9)'],
    chordMidis: [
      [57, 60, 64, 67, 71],
      [53, 57, 60, 64, 71],
      [50, 53, 57, 60, 64],
      [52, 56, 59, 62, 65],
    ],
    bassMidis: [45, 41, 38, 40],
    melodyMidis: [76, 71, 72, 68],
    harmonicDevices: ['Lidio #11 (B sobre F)', 'Dominante V7(b9) con Fa natural'],
    textureRole: 'Ostinato arpegiado en guitarra/piano + bajo sostenido en redondas.',
    listeningCue: 'Escucha cómo el Fmaj7(#11) conserva el B natural del ostinato creando flotación antes de tensar en E7(b9).',
  },
  {
    id: 'estrofa',
    label: '2. Estrofa',
    barsLabel: 'cc. 5–12',
    keyCenter: 'La menor (Escalera descendente)',
    chordSymbols: ['Am7', 'Am/G', 'Fmaj7', 'C/E'],
    chordMidis: [
      [57, 60, 64, 67],
      [55, 60, 64, 69],
      [53, 57, 60, 64],
      [52, 60, 64, 67],
    ],
    bassMidis: [45, 43, 41, 40],
    melodyMidis: [64, 67, 69, 67],
    harmonicDevices: ['Inversiones en el bajo (Am/G, C/E)', 'Contramelodía de chelo en los silencios'],
    textureRole: 'Voz en registro medio (A3–E4) + bajo descendente por grados conjuntos A → G → F → E.',
    listeningCue: 'Presta atención a la línea cromática/diatónica del bajo: no da saltos de quinta, camina suavemente paso a paso.',
  },
  {
    id: 'precoro',
    label: '3. Precoro',
    barsLabel: 'cc. 13–16',
    keyCenter: 'Pivote Am → C Mayor',
    chordSymbols: ['Dm7', 'D#°7', 'C/E', 'G7(b9)'],
    chordMidis: [
      [50, 53, 57, 60],
      [51, 54, 57, 60],
      [52, 55, 60, 64],
      [55, 59, 62, 65, 68],
    ],
    bassMidis: [38, 39, 40, 43],
    melodyMidis: [65, 66, 67, 74],
    harmonicDevices: ['Acorde puente disminuido D#°7', 'Ritmo armónico acelerado (2 acordes/compás)'],
    textureRole: 'Ascenso cromático del bajo D → D# → E → G con corte seco (break) antes del estribillo.',
    listeningCue: 'Siente cómo D#°7 empuja el bajo medio tono arriba hacia C/E generando expectación inevitable.',
  },
  {
    id: 'estribillo',
    label: '4. Estribillo',
    barsLabel: 'cc. 17–24',
    keyCenter: 'Do Mayor (con SubV7)',
    chordSymbols: ['Em7', 'Eb7(#11)', 'Dm9', 'Db7(#11)', 'Cmaj9'],
    chordMidis: [
      [52, 55, 59, 62],
      [51, 55, 58, 61, 69],
      [50, 53, 57, 60, 64],
      [49, 53, 56, 59, 67],
      [48, 52, 55, 59, 62],
    ],
    bassMidis: [40, 39, 38, 37, 36],
    melodyMidis: [71, 69, 67, 65, 64],
    harmonicDevices: ['Doble sustitución tritonal (Eb7 y Db7)', 'Bajo cromático E → Eb → D → Db → C'],
    textureRole: 'Melodía diatónica descendente (B4→A4→G4→F4→E4) sobre armonía jazz cromática.',
    listeningCue: 'Máxima sencillez cantable arriba mientras los acordes alternan colores alterados debajo.',
  },
  {
    id: 'puente',
    label: '5. Puente Modulado',
    barsLabel: 'cc. 25–32',
    keyCenter: 'Viaje PL (Abmaj7) → Modulación D Mayor',
    chordSymbols: ['Abmaj7(#11)', 'Fm9', 'Em7', 'A7(b9)', 'Dmaj9'],
    chordMidis: [
      [56, 60, 63, 67, 74],
      [53, 56, 60, 63, 67],
      [52, 55, 59, 62],
      [57, 61, 64, 67, 70],
      [50, 54, 57, 61, 64],
    ],
    bassMidis: [44, 41, 40, 45, 38],
    melodyMidis: [72, 72, 71, 73, 74],
    harmonicDevices: ['Transformación Neorriemanniana PL (C → Ab)', 'Acorde pivote Em7 (iii de C = ii de D)'],
    textureRole: 'Apertura cinematográfica seguida de elevación +1 tono hacia D Mayor para el clímax final.',
    listeningCue: 'Escucha el giro sorpresa hacia Abmaj7 manteniendo la nota común C5 y el despegue final a Re Mayor.',
  },
];

// ============================================================================
// 4. INTEGRATOR MASTER PROJECT ARCHITECT (Etapa 7)
// ============================================================================

export interface IntegratorBlueprintSelection {
  projectStyleId: 'andino' | 'funk' | 'ballad';
  keyLabel: string;
  rootMidi: number;
  bpm: number;
  bassOctave: 1 | 2 | 3;
  harmonyRegister: 'low' | 'mid' | 'high';
  harmonicDevice: 'tritone-sub' | 'modal-interchange' | 'dim-bridge';
}

export interface IntegratorBlueprintAudit {
  styleTitle: string;
  quarterMs: number;
  dottedEighthDelayMs: number;
  vocalPreDelayMs: number;
  hasCollision: boolean;
  collisionSummary: string;
  scoreLabel: string;
  chordProgression: string[];
  chordMidis: number[][];
  bassMidis: number[];
  leadMidis: number[];
}

export function auditIntegratorBlueprint(sel: IntegratorBlueprintSelection): IntegratorBlueprintAudit {
  const bpm = Math.max(56, Math.min(150, sel.bpm));
  const quarterMs = +(60000 / bpm).toFixed(1);
  const dottedEighthDelayMs = +(quarterMs * 0.75).toFixed(1);
  const vocalPreDelayMs = +(quarterMs / 16).toFixed(1);

  const hasCollision = sel.bassOctave >= 3 || (sel.bassOctave === 2 && sel.harmonyRegister === 'low');

  const collisionSummary = hasCollision
    ? '⚠ Colisión detectada: el bajo y el instrumento armónico invaden la misma octava grave (C2–C3). Sube los voicings a registro medio o baja el bajo a octava 1.'
    : '● Reparto limpio de octavas: Bajo sólido abajo, armonía en zona media abierta y solista con aire arriba.';

  const scoreLabel = hasCollision ? 'Requiere Ajuste de Registro' : 'Listo para Grabación y Mezcla';

  const r = sel.rootMidi % 12;
  const bassBase = 24 + r + (sel.bassOctave - 1) * 12; // oct 1 ~ C1(24)..B1(35), oct 2 ~ 36..47
  const harmBase = (sel.harmonyRegister === 'low' ? 36 : sel.harmonyRegister === 'mid' ? 48 : 60) + r;

  if (sel.projectStyleId === 'andino') {
    const prog =
      sel.harmonicDevice === 'dim-bridge'
        ? [`${sel.keyLabel}m9`, 'G/B', 'C#°7', 'D9sus4']
        : [`${sel.keyLabel}m9`, 'D6', 'Cmaj7', 'B7(b9)'];
    return {
      styleTitle: 'Fusión Andina en 6/8 (Bombo + Charango + Quenas)',
      quarterMs,
      dottedEighthDelayMs,
      vocalPreDelayMs,
      hasCollision,
      collisionSummary,
      scoreLabel,
      chordProgression: prog,
      chordMidis: [
        [harmBase, harmBase + 3, harmBase + 7, harmBase + 14],
        [harmBase - 2, harmBase + 2, harmBase + 7, harmBase + 11],
        [harmBase - 4, harmBase, harmBase + 4, harmBase + 11],
        [harmBase - 5, harmBase - 1, harmBase + 2, harmBase + 6],
      ],
      bassMidis: [bassBase, bassBase - 2, bassBase - 4, bassBase - 5],
      leadMidis: [72 + r, 75 + r, 79 + r, 78 + r],
    };
  }

  if (sel.projectStyleId === 'funk') {
    const prog =
      sel.harmonicDevice === 'tritone-sub'
        ? [`${sel.keyLabel}m11`, 'Fm9', 'E9(#11)', 'Ebmaj9']
        : [`${sel.keyLabel}m11`, 'Fm9', 'Abmaj7', 'G7(#9)'];
    return {
      styleTitle: 'Funk / Neo-Soul con Vientos en Cortes Secos',
      quarterMs,
      dottedEighthDelayMs,
      vocalPreDelayMs,
      hasCollision,
      collisionSummary,
      scoreLabel,
      chordProgression: prog,
      chordMidis: [
        [harmBase, harmBase + 3, harmBase + 7, harmBase + 10, harmBase + 17],
        [harmBase + 5, harmBase + 8, harmBase + 12, harmBase + 15],
        [harmBase + 4, harmBase + 8, harmBase + 10, harmBase + 18],
        [harmBase + 3, harmBase + 7, harmBase + 10, harmBase + 14],
      ],
      bassMidis: [bassBase, bassBase + 5, bassBase + 4, bassBase + 3],
      leadMidis: [72 + r, 75 + r, 74 + r, 79 + r],
    };
  }

  // ballad
  const prog =
    sel.harmonicDevice === 'modal-interchange'
      ? [`${sel.keyLabel}maj9`, 'G/B', 'Fm6 (ivm6)', 'G7(b9)']
      : [`${sel.keyLabel}maj9`, 'D#°7', 'C/E', 'G9sus4'];
  return {
    styleTitle: 'Balada Cinematográfica con Modulación y Chelo',
    quarterMs,
    dottedEighthDelayMs,
    vocalPreDelayMs,
    hasCollision,
    collisionSummary,
    scoreLabel,
    chordProgression: prog,
    chordMidis: [
      [harmBase, harmBase + 4, harmBase + 7, harmBase + 11, harmBase + 14],
      [harmBase + 3, harmBase + 6, harmBase + 9, harmBase + 12],
      [harmBase + 5, harmBase + 8, harmBase + 12, harmBase + 14],
      [harmBase + 7, harmBase + 12, harmBase + 14, harmBase + 17],
    ],
    bassMidis: [bassBase, bassBase + 3, bassBase + 4, bassBase + 7],
    leadMidis: [76 + r, 74 + r, 72 + r, 71 + r],
  };
}
