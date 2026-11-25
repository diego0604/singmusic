export type CounterpointMotionKind = 'contrario' | 'oblicuo' | 'paralelo' | 'directo' | 'inicio';

export interface CounterpointStepAnalysis {
  stepIndex: number;
  cantusMidi: number;
  counterMidi: number;
  semitoneDiff: number;
  intervalShort: string;
  intervalQuality: 'consonancia-perfecta' | 'consonancia-imperfecta' | 'disonancia-controlada';
  motion: CounterpointMotionKind;
  isForbiddenParallel: boolean;
  warningText: string | null;
}

export interface CounterpointPreset {
  id: string;
  label: string;
  speciesLabel: string;
  summary: string;
  cantusMidis: number[];
  counterMidis: number[];
  extraVoicesMidis?: number[][]; // Optional 3rd & 4th voice for choral / fugal polyphony
  roleHint: string;
}

export interface CounterpointAnalysisSummary {
  steps: CounterpointStepAnalysis[];
  contraryCount: number;
  obliqueCount: number;
  parallelCount: number;
  forbiddenParallelsCount: number;
  verdict: string;
}

const INTERVAL_NAMES_SHORT = [
  '1J / 8J',
  '2m',
  '2M',
  '3m',
  '3M',
  '4J',
  '4A/5d',
  '5J',
  '6m',
  '6M',
  '7m',
  '7M',
];

export const COUNTERPOINT_PRESETS: CounterpointPreset[] = [
  {
    id: 'especie-1-contrario',
    label: '1ª Especie · Contrario (1:1)',
    speciesLabel: 'Nota contra nota en Do Mayor',
    summary:
      'Cuando el bajo/cantus sube, la melodía superior baja (y viceversa). Predominan 3as y 6as imperfectas y se abren y cierran las frases en consonancias perfectas (1J, 5J, 8J).',
    cantusMidis: [60, 62, 64, 65, 67, 64, 62, 60], // C4 D4 E4 F4 G4 E4 D4 C4
    counterMidis: [72, 71, 69, 69, 67, 72, 71, 72], // C5 B4 A4 A4 G4 C5 B4 C5 (Wait: 67->67 is 1J; let's make step 5 clean 3M: G4->B4! [72,71,69,69,71,72,71,72])
    roleHint: 'Movimiento contrario casi en cada compás, con cero quintas u octavas paralelas.',
  },
  {
    id: 'especie-2-dos-a-uno',
    label: '2ª Especie · Ritmo 2:1',
    speciesLabel: 'Dos notas por cada nota del cantus',
    summary:
      'La voz superior duplica la actividad rítmica (2 notas contra 1), permitiendo notas de paso disonantes en parte débil siempre que resuelvan por grado conjunto.',
    cantusMidis: [60, 60, 62, 62, 64, 64, 62, 62, 60],
    counterMidis: [67, 69, 71, 69, 67, 69, 71, 71, 72],
    roleHint: 'El contrapunto camina al doble de velocidad creando flujo melódico continuo.',
  },
  {
    id: 'especie-4-retardo',
    label: '4ª Especie · Síncopa y Retardo (7–6 / 4–3)',
    speciesLabel: 'Tensión ligada que resuelve bajando',
    summary:
      'Una nota consonante se prolonga (movimiento oblicuo) sobre el cambio de la otra voz convirtiéndose en disonancia (7ª o 4ª), y resuelve descendiendo 1 grado hacia una 6ª o 3ª.',
    cantusMidis: [60, 62, 62, 64, 64, 65, 65, 60],
    counterMidis: [67, 67, 65, 67, 67, 69, 69, 72],
    roleHint: 'Escucha cómo la nota retenida choca brevemente en parte fuerte y luego descansa.',
  },
  {
    id: 'canon-imitacion',
    label: 'Imitación y Canon (2 Voces)',
    speciesLabel: 'La 2ª voz entra 2 pulsos después imitando el sujeto',
    summary:
      'En el canon, una misma melodía funciona como contrapunto de sí misma desplazada en el tiempo: la voz líder avanza mientras la voz seguidora entra 2 pasos atrás a la octava o unísono.',
    cantusMidis: [60, 62, 64, 67, 65, 64, 62, 60],
    counterMidis: [60, 60, 64, 67, 72, 74, 76, 72],
    roleHint: 'Sujeto cantabile que deja huecos rítmicos para que la respuesta brille.',
  },
  {
    id: 'fuga-sujeto-contrasujeto',
    label: 'Fuga · Sujeto + Contrasujeto',
    speciesLabel: 'Sujeto en tónica + Contrasujeto complementario',
    summary:
      'En una fuga barroca, cuando la segunda voz toma la Respuesta (en la 5ª), la primera voz teje un Contrasujeto con perfil rítmico opuesto para que ambas líneas nunca compitan.',
    cantusMidis: [55, 62, 60, 59, 57, 55, 59, 60], // Respuesta/Bajo: G3 D4 C4 B3 A3 G3 B3 C4
    counterMidis: [71, 69, 67, 65, 64, 67, 62, 64], // Contrasujeto descendente
    roleHint: 'Complementariedad rítmica y registro claro sin cruces de voces.',
  },
  {
    id: 'moderno-guias-ii-v-i',
    label: 'Armonía Moderna · Guías 3ª–7ª (ii–V–I)',
    speciesLabel: 'Conducción de voces en Dm7 → G7 → Cmaj7',
    summary:
      'En jazz, pop y arreglos modernos, las 3as y 7as de cada acorde forman dos líneas contrapuntísticas mínimas: la 7ª de Dm7 (C) baja medio tono a la 3ª de G7 (B) y sigue a la 7ª de Cmaj7 (B).',
    cantusMidis: [50, 50, 55, 55, 48, 48, 48, 48], // Bajo Dm7 -> G7 -> Cmaj7
    counterMidis: [65, 69, 65, 62, 64, 67, 71, 72], // F4 (3a Dm) -> F4 (7a G7) -> E4 (3a Cmaj7)...
    extraVoicesMidis: [[60, 60, 59, 59, 59, 59, 64, 64]], // 7a Dm7 (C4) -> 3a G7 (B3) -> 7a Cmaj7 (B3)
    roleHint: 'Ahorro máximo de movimiento: ninguna voz guía salta más de 1 tono.',
  },
  {
    id: 'coral-cuatro-voces',
    label: 'Coral a 4 Voces (S-A-T-B)',
    speciesLabel: 'Bajo, Tenor, Alto y Soprano equilibrados',
    summary:
      'Contrapunto polifónico clásico a 4 voces sobre I – IV – V – I donde Soprano y Bajo forman el marco externo por movimiento contrario mientras Alto y Tenor enlazan notas comunes.',
    cantusMidis: [48, 53, 55, 48, 57, 53, 55, 48], // Bajo C3 F3 G3 C3 A3 F3 G3 C3
    counterMidis: [72, 69, 67, 72, 72, 74, 71, 72], // Soprano C5 A4 G4 C5 C5 D5 B4 C5
    extraVoicesMidis: [
      [64, 65, 62, 64, 64, 65, 62, 64], // Alto
      [60, 60, 59, 60, 60, 57, 59, 60], // Tenor
    ],
    roleHint: 'Las voces extremas (Bajo y Soprano) se mueven en direcciones opuestas.',
  },
  {
    id: 'trampa-paralelas',
    label: '⚠️ Trampa · 5ªs y 8ªs Paralelas',
    speciesLabel: 'Error clásico que borra la independencia de voces',
    summary:
      'Si dos voces suben o bajan juntas manteniendo quintas justas (5J→5J) u octavas (8J→8J) consecutivas, el cerebro deja de oír dos melodías y escucha un solo bloque hueco.',
    cantusMidis: [60, 62, 64, 65, 67, 65, 64, 60],
    counterMidis: [67, 69, 71, 72, 74, 72, 71, 67], // Exact parallel 5ths every step!
    roleHint: 'Observa las alertas rojas de 5ª paralela y corrígelas moviendo las notas en el editor.',
  },
];

// Clean up preset 1 counterMidis so step 4 (G4->B4) avoids unison G4->G4 and keeps clean 3M
COUNTERPOINT_PRESETS[0].counterMidis = [72, 71, 69, 69, 71, 72, 71, 72];

export function analyzeCounterpointMotion(
  cantusMidis: number[],
  counterMidis: number[]
): CounterpointAnalysisSummary {
  const len = Math.min(cantusMidis.length, counterMidis.length);
  const steps: CounterpointStepAnalysis[] = [];
  let contraryCount = 0;
  let obliqueCount = 0;
  let parallelCount = 0;
  let forbiddenParallelsCount = 0;

  for (let i = 0; i < len; i++) {
    const c = cantusMidis[i];
    const m = counterMidis[i];
    const rawDiff = Math.abs(m - c);
    const mod12 = rawDiff % 12;
    const intervalShort = rawDiff === 12 || rawDiff === 24 ? '8J' : rawDiff === 0 ? '1J' : INTERVAL_NAMES_SHORT[mod12] || '1J';

    const intervalQuality: CounterpointStepAnalysis['intervalQuality'] =
      mod12 === 0 || mod12 === 7
        ? 'consonancia-perfecta'
        : mod12 === 3 || mod12 === 4 || mod12 === 8 || mod12 === 9
          ? 'consonancia-imperfecta'
          : 'disonancia-controlada';

    let motion: CounterpointMotionKind = 'inicio';
    let isForbiddenParallel = false;
    let warningText: string | null = null;

    if (i > 0) {
      const dc = c - cantusMidis[i - 1];
      const dm = m - counterMidis[i - 1];
      const prevMod = Math.abs(counterMidis[i - 1] - cantusMidis[i - 1]) % 12;

      if (dc === 0 && dm === 0) {
        motion = 'oblicuo';
        obliqueCount++;
      } else if (dc === 0 || dm === 0) {
        motion = 'oblicuo';
        obliqueCount++;
      } else if ((dc > 0 && dm < 0) || (dc < 0 && dm > 0)) {
        motion = 'contrario';
        contraryCount++;
      } else {
        // Same direction
        motion = mod12 === prevMod ? 'paralelo' : 'directo';
        parallelCount++;
        if ((mod12 === 7 && prevMod === 7) || (mod12 === 0 && prevMod === 0)) {
          isForbiddenParallel = true;
          forbiddenParallelsCount++;
          warningText =
            mod12 === 7
              ? '5ª paralela consecutiva: las voces se fusionan y pierden independencia.'
              : '8ª/unísono paralelo consecutivo: mueve una voz en dirección contraria u oblicua.';
        }
      }
    }

    steps.push({
      stepIndex: i,
      cantusMidi: c,
      counterMidi: m,
      semitoneDiff: rawDiff,
      intervalShort,
      intervalQuality,
      motion,
      isForbiddenParallel,
      warningText,
    });
  }

  const verdict =
    forbiddenParallelsCount > 0
      ? `Atención: ${forbiddenParallelsCount} paralelismo(s) prohibido(s) (5ª/8ª). Prioriza movimiento contrario (${contraryCount}) u oblicuo (${obliqueCount}).`
      : `Excelente independencia: 0 quintas/octavas paralelas · ${contraryCount} movimientos contrarios y ${obliqueCount} oblicuos.`;

  return {
    steps,
    contraryCount,
    obliqueCount,
    parallelCount,
    forbiddenParallelsCount,
    verdict,
  };
}

// ============================================================================
// 2. IMPROVISATION & PHRASING GYM ENGINE (6 Idiomatic Tracks)
// ============================================================================

export type ImprovTrackId =
  | 'frases-motivos'
  | 'blues'
  | 'jazz'
  | 'rock-pop'
  | 'latino'
  | 'modal';

export interface ImprovTrackConfig {
  id: ImprovTrackId;
  label: string;
  genreTag: string;
  bpm: number;
  progressionLabels: [string, string, string, string];
  chordSemitoneGroups: [number[], number[], number[], number[]]; // relative to root C=60
  scaleOffsets: number[]; // relative semitones
  guideOffsetsByBar: [number[], number[], number[], number[]]; // target chord tones per bar (relative)
  conceptRule: string;
  phraseTip: string;
}

export interface ImprovPhraseNote {
  step: number;
  bar: number;
  midi: number;
  noteLabel: string;
  role: 'Pregunta (Motivo)' | 'Respuesta (Resolución)';
  toneBadge: 'Tónica / Pilar' | 'Nota Guía (3ª/7ª)' | 'Color / Blue Note' | 'Nota de Paso';
  fretHint: string;
}

export interface GeneratedImprovSession {
  track: ImprovTrackConfig;
  rootMidi: number;
  rootName: string;
  chords: { label: string; midis: number[] }[];
  notes: ImprovPhraseNote[];
}

const IMPROVISATION_ROOTS: { id: string; name: string; midi: number }[] = [
  { id: 'C', name: 'C (Do)', midi: 60 },
  { id: 'G', name: 'G (Sol)', midi: 55 },
  { id: 'A', name: 'A (La)', midi: 57 },
  { id: 'D', name: 'D (Re)', midi: 62 },
  { id: 'E', name: 'E (Mi)', midi: 64 },
  { id: 'F', name: 'F (Fa)', midi: 53 },
];

export const IMPROVISATION_ROOT_OPTIONS = IMPROVISATION_ROOTS;

export const IMPROVISATION_TRACKS: ImprovTrackConfig[] = [
  {
    id: 'frases-motivos',
    label: '1. Construcción de Frases y Motivos',
    genreTag: 'Pregunta–Respuesta (A → A’)',
    bpm: 92,
    progressionLabels: ['I', 'vi', 'IV', 'V'],
    chordSemitoneGroups: [
      [0, 4, 7],
      [9, 12, 16],
      [5, 9, 12],
      [7, 11, 14],
    ],
    scaleOffsets: [0, 2, 4, 7, 9, 12],
    guideOffsetsByBar: [
      [0, 4, 7],
      [9, 12, 4],
      [5, 9, 0],
      [7, 11, 2],
    ],
    conceptRule:
      'Regla de Oro del Fraseo: toca un motivo corto de 3–4 notas en los compases 1–2 (Pregunta abierta en 3ª o 5ª), respira 1 tiempo y repítelo transformado en los compases 3–4 para cerrar en la tónica o 3ª (Respuesta).',
    phraseTip: 'Deja aire entre pregunta y respuesta; un solo con pausas respira como una voz humana.',
  },
  {
    id: 'blues',
    label: '2. Blues (I7–IV7–V7 y Blue Note)',
    genreTag: 'Llamada y Respuesta · Escala Blues',
    bpm: 88,
    progressionLabels: ['I7', 'IV7', 'I7', 'V7'],
    chordSemitoneGroups: [
      [0, 4, 7, 10],
      [5, 9, 12, 15],
      [0, 4, 7, 10],
      [7, 11, 14, 17],
    ],
    scaleOffsets: [0, 3, 5, 6, 7, 10, 12],
    guideOffsetsByBar: [
      [0, 4, 10],
      [5, 3, 9],
      [0, 6, 7],
      [7, 11, 5],
    ],
    conceptRule:
      'Sobre acordes dominantes I7–IV7–V7, combina la pentatónica menor con la Blue Note (♭5 = 6 st) deslizándola hacia la 5ª justa o hacia la 3ª mayor del acorde.',
    phraseTip: 'Bends cortos de 1/4 de tono en la ♭3ª y aterrizaje firme en la 7ª menor o raíz.',
  },
  {
    id: 'jazz',
    label: '3. Jazz y Estándares (ii–V–I)',
    genreTag: 'Notas Guía (3ª y 7ª) + Enclosures',
    bpm: 110,
    progressionLabels: ['ii7', 'V7', 'Imaj7', 'Imaj7'],
    chordSemitoneGroups: [
      [2, 5, 9, 12],
      [7, 11, 14, 17],
      [0, 4, 7, 11],
      [0, 4, 7, 11],
    ],
    scaleOffsets: [0, 2, 4, 5, 7, 9, 11, 12],
    guideOffsetsByBar: [
      [5, 12, 9],
      [11, 5, 14],
      [4, 11, 7],
      [4, 0, 7],
    ],
    conceptRule:
      'En ii7–V7–Imaj7, la magia está en conectar la 7ª del ii7 con la 3ª del V7 (baja solo 1 semitono) y resolver la 7ª del V7 hacia la 3ª del Imaj7. Rodea cada nota guía con bordaduras diatónicas o cromáticas.',
    phraseTip: 'Conecta el cambio de acorde usando solo 1 semitono de movimiento en los tiempos 1 y 3.',
  },
  {
    id: 'rock-pop',
    label: '4. Rock y Pop (Sobre Cambios)',
    genreTag: 'Pentatónica + Tonos del Acorde',
    bpm: 108,
    progressionLabels: ['I', 'V', 'vi', 'IV'],
    chordSemitoneGroups: [
      [0, 4, 7],
      [7, 11, 14],
      [9, 12, 16],
      [5, 9, 12],
    ],
    scaleOffsets: [0, 2, 4, 7, 9, 12],
    guideOffsetsByBar: [
      [4, 7, 0],
      [11, 14, 7],
      [9, 12, 4],
      [5, 9, 0],
    ],
    conceptRule:
      'Aunque la pentatónica funciona en toda la rueda I–V–vi–IV, el secreto profesional es cambiar la nota donde descansas en cada compás (la 3ª del acorde activo) para que el solo suene "dentro de los cambios".',
    phraseTip: 'Acentúa el B/7ª sobre el V y el F/4ª sobre el IV para dibujar la armonía sin perder gancho.',
  },
  {
    id: 'latino',
    label: '5. Música Latinoamericana (Clave y Tumbao)',
    genreTag: 'Cadencia Andaluza / Son / Cumbia',
    bpm: 102,
    progressionLabels: ['i', '♭VII', '♭VI', 'V7'],
    chordSemitoneGroups: [
      [0, 3, 7],
      [10, 14, 17],
      [8, 12, 15],
      [7, 11, 14, 17],
    ],
    scaleOffsets: [0, 2, 3, 5, 7, 8, 11, 12],
    guideOffsetsByBar: [
      [0, 3, 7],
      [10, 14, 5],
      [8, 12, 3],
      [11, 7, 14],
    ],
    conceptRule:
      'Sobre i–♭VII–♭VI–V7 (salsa, bolero rítmico, rock latino y folclore), anticipa la nota guía del acorde siguiente en la última corchea del compás ("síncopa de tumbao") y usa la 7ª mayor sensible sobre el V7.',
    phraseTip: 'Anticipa el cambio de acorde medio tiempo antes del pulso 1 para lograr empuje latino.',
  },
  {
    id: 'modal',
    label: '6. Improvisación Modal (Color Dórico / Lidio)',
    genreTag: 'Vamp Estático · Nota Característica',
    bpm: 96,
    progressionLabels: ['i7 (Dórico)', 'IV7 (Dórico)', 'i7 (Dórico)', 'IV7 (Dórico)'],
    chordSemitoneGroups: [
      [0, 3, 7, 10],
      [5, 9, 12, 15],
      [0, 3, 7, 10],
      [5, 9, 12, 15],
    ],
    scaleOffsets: [0, 2, 3, 5, 7, 9, 10, 12],
    guideOffsetsByBar: [
      [9, 3, 10],
      [9, 5, 0],
      [9, 7, 3],
      [9, 10, 0],
    ],
    conceptRule:
      'En improvisación modal (Santana, Miles Davis, Funk), la armonía no resuelve rápido: se queda en un vamp. Tu misión es subrayar la nota característica del modo (la 6ª Mayor = 9 st en Dórico) para pintar el color exacto.',
    phraseTip: 'Resalta la 6ª mayor natural (ej. La sobre Re menor Dórico) en el tiempo fuerte.',
  },
];

const CHROMATIC_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

function formatMidiName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  return `${CHROMATIC_FLAT[((midi % 12) + 12) % 12]}${octave}`;
}

function approximateGuitarFretHint(midi: number): string {
  // Prefer playable 3rd/2nd/1st strings in middle neck for soloing
  if (midi >= 64) return `1ª e traste ${midi - 64}`;
  if (midi >= 59) return `2ª B traste ${midi - 59}`;
  return `3ª G traste ${Math.max(0, midi - 55)}`;
}

export function generateImprovisationPhrase(
  trackId: ImprovTrackId,
  rootMidi = 60,
  seed = 1
): GeneratedImprovSession {
  const track = IMPROVISATION_TRACKS.find((t) => t.id === trackId) || IMPROVISATION_TRACKS[0];
  const rootMeta = IMPROVISATION_ROOTS.find((r) => r.midi === rootMidi) || {
    name: CHROMATIC_FLAT[rootMidi % 12],
    midi: rootMidi,
  };

  const chords = track.progressionLabels.map((lbl, idx) => ({
    label: lbl,
    midis: track.chordSemitoneGroups[idx].map((semi) => rootMidi - 12 + semi),
  }));

  const notes: ImprovPhraseNote[] = [];
  let stepCounter = 0;

  for (let bar = 0; bar < 4; bar++) {
    const guideOffsets = track.guideOffsetsByBar[bar];
    const isQuestion = bar < 2;
    const role: ImprovPhraseNote['role'] = isQuestion ? 'Pregunta (Motivo)' : 'Respuesta (Resolución)';

    // Each bar gets 3 clear melodic hits: Guide tone on beat 1, scale/color movement, target resolution
    const shift = (seed + bar) % track.scaleOffsets.length;
    const startOffset = guideOffsets[(seed + bar) % guideOffsets.length];
    const midOffset = track.scaleOffsets[(shift + 2) % track.scaleOffsets.length];
    const endOffset = bar === 3 ? guideOffsets[0] : guideOffsets[(seed + bar + 1) % guideOffsets.length];

    const barOffsets = [startOffset, midOffset, endOffset];
    for (const semi of barOffsets) {
      const midi = rootMidi + semi;
      const mod = ((semi % 12) + 12) % 12;
      let toneBadge: ImprovPhraseNote['toneBadge'] = 'Nota de Paso';
      if (mod === 0 || mod === 7) {
        toneBadge = 'Tónica / Pilar';
      } else if (guideOffsets.some((g) => ((g % 12) + 12) % 12 === mod)) {
        toneBadge = 'Nota Guía (3ª/7ª)';
      } else if ((track.id === 'blues' && mod === 6) || (track.id === 'modal' && mod === 9)) {
        toneBadge = 'Color / Blue Note';
      }

      notes.push({
        step: stepCounter++,
        bar: bar + 1,
        midi,
        noteLabel: formatMidiName(midi),
        role,
        toneBadge,
        fretHint: approximateGuitarFretHint(midi),
      });
    }
  }

  return {
    track,
    rootMidi,
    rootName: rootMeta.name,
    chords,
    notes,
  };
}

// ============================================================================
// 3. INSTRUMENT ANATOMY INTERACTIVE BLUEPRINTS (Guitar, Bass, Drum, Voice)
// ============================================================================

export type AnatomyInstrumentId = 'guitar' | 'bass' | 'drum' | 'voice';

export interface AnatomyHotspot {
  id: string;
  label: string;
  zoneTag: string;
  functionText: string;
  techniqueTip: string;
  commonMistake: string;
  demoType: 'note' | 'chord' | 'drum' | 'vocal' | 'contrast';
  demoMidis: number[];
  svgX: number;
  svgY: number;
}

export interface InstrumentAnatomyKit {
  id: AnatomyInstrumentId;
  title: string;
  subtitle: string;
  svgViewBox: string;
  hotspots: AnatomyHotspot[];
}

export const INSTRUMENT_ANATOMY_DATA: Record<AnatomyInstrumentId, InstrumentAnatomyKit> = {
  guitar: {
    id: 'guitar',
    title: 'Anatomía Interactiva de la Guitarra Acústica',
    subtitle: 'Haz clic en cada zona del instrumento para ver su función acústica, postura ergonómica y escuchar su timbre.',
    svgViewBox: '0 0 680 230',
    hotspots: [
      {
        id: 'clavijero',
        label: '1. Clavijero y Clavijas',
        zoneTag: 'Afinación y Tensión',
        functionText: 'Aloja las 6 clavijas que regulan la tensión exacta de cada cuerda (E2–A2–D3–G3–B3–E4).',
        techniqueTip: 'Al afinar, si te pasas de agudo baja primero la clavija y vuelve a subir hasta la nota para evitar holguras.',
        commonMistake: 'Girar sin comprobar qué cuerda corresponde a cada clavija o enrollar demasiadas vueltas en el poste.',
        demoType: 'note',
        demoMidis: [40, 45, 50, 55, 59, 64],
        svgX: 68,
        svgY: 112,
      },
      {
        id: 'cejuela',
        label: '2. Cejuela (Nut) y Traste 0',
        zoneTag: 'Altura de Cuerdas',
        functionText: 'Ranura que guía las cuerdas al aire hacia el mástil y fija su punto de partida acústico.',
        techniqueTip: 'Para acordes en trastes 1–3, coloca el dedo justo detrás de la barrita metálica (traste), no en medio del espacio.',
        commonMistake: 'Pisar demasiado lejos del traste metálico, provocando trasteos y exceso de fuerza.',
        demoType: 'chord',
        demoMidis: [40, 47, 52, 56, 59, 64],
        svgX: 132,
        svgY: 112,
      },
      {
        id: 'diapason',
        label: '3. Diapasón y Trastes 1–12',
        zoneTag: 'Mano Izquierda (1–2–3–4)',
        functionText: 'Cada traste acorta la cuerda exactamente 1 semitono; el traste 12 (doble punto) divide la cuerda a la mitad (1 octava).',
        techniqueTip: 'Pulgar izquierdo atrás (opuesto al dedo 2), muñeca relajada y dedos curvados atacando con la yema.',
        commonMistake: 'Sacar el pulgar por arriba apretando el mástil como un bate o acostar dedos tocando cuerdas vecinas.',
        demoType: 'note',
        demoMidis: [48, 52, 55, 60],
        svgX: 255,
        svgY: 112,
      },
      {
        id: 'boca',
        label: '4. Boca y Zona Sul Tasto',
        zoneTag: 'Mano Derecha (Cálida)',
        functionText: 'La abertura de resonancia proyecta los graves del cuerpo; pulsar sobre la boca o hacia el mástil da sonido dulce y redondo.',
        techniqueTip: 'Apoya el antebrazo derecho en el borde superior del aro sin presionar la tapa armónica.',
        commonMistake: 'Tocar con los dedos tensos enganchando las cuerdas hacia afuera en lugar de deslizar hacia la palma.',
        demoType: 'chord',
        demoMidis: [48, 52, 55, 60, 64],
        svgX: 432,
        svgY: 115,
      },
      {
        id: 'puente',
        label: '5. Puente y Sul Ponticello',
        zoneTag: 'Proyección y Brillo',
        functionText: 'Transmite la vibración de las cuerdas a la tapa de madera; pulsar cerca del puente produce un timbre brillante y percusivo.',
        techniqueTip: 'Combina ataque cerca del puente (brillo en estribillos) y cerca de la boca (calidez en versos).',
        commonMistake: 'Olvidar que el lugar donde tocas con la mano derecha cambia tanto el sonido como un ecualizador.',
        demoType: 'note',
        demoMidis: [55, 59, 62, 67],
        svgX: 552,
        svgY: 115,
      },
    ],
  },
  bass: {
    id: 'bass',
    title: 'Anatomía Interactiva del Bajo Eléctrico (4 Cuerdas)',
    subtitle: 'Explora clavijero, simetría de trastes, pastillas P/J y técnica de mano derecha (i–m y Floating Thumb).',
    svgViewBox: '0 0 680 230',
    hotspots: [
      {
        id: 'clavijero-bajo',
        label: '1. Cuerdas Gruesas E1–A1–D2–G2',
        zoneTag: 'Registro Grave (1 Octava Bajo Guitarra)',
        functionText: 'Cuatro cuerdas afinadas por cuartas justas idénticas a las 4 graves de la guitarra pero una octava más grave.',
        techniqueTip: 'Escucha siempre la fundamental grave: el bajo conecta el ritmo de la batería con la armonía.',
        commonMistake: 'Dejar vibrar cuerdas al aire por simpatía creando una nube grave borrosa.',
        demoType: 'note',
        demoMidis: [28, 33, 38, 43],
        svgX: 66,
        svgY: 112,
      },
      {
        id: 'mastil-simetrico',
        label: '2. Mástil Simétrico (1 Dedo x Traste)',
        zoneTag: 'Digitación 1–2–3–4',
        functionText: 'Al ser todas cuartas exactas (sin excepción en la 2ª cuerda), cualquier dibujo de escala o arpegio es 100% simétrico en todo el mástil.',
        techniqueTip: 'En los primeros 4 trastes (anchos), usa la posición 1–2–4 (contrabajo) si tu mano se estira demasiado.',
        commonMistake: 'Estirar el dedo 3 hasta tensar el antebrazo en los trastes 1 al 4.',
        demoType: 'note',
        demoMidis: [36, 40, 43, 48],
        svgX: 248,
        svgY: 112,
      },
      {
        id: 'pastilla-p',
        label: '3. Pastilla Mástil (Estilo Precision)',
        zoneTag: 'Sonido Redondo y Profundo',
        functionText: 'Recoge mayor amplitud de graves y medios-graves cálidos; ideal para soul, rock clásico, pop y baladas.',
        techniqueTip: 'Descansa el pulgar derecho (Floating Thumb) sobre el borde de la pastilla o sobre la cuerda superior apagándola.',
        commonMistake: 'Anclar el pulgar fijo siempre en la pastilla y olvidar mutear la cuerda E cuando tocas en D o G.',
        demoType: 'note',
        demoMidis: [31, 31, 35, 38],
        svgX: 432,
        svgY: 115,
      },
      {
        id: 'pastilla-j',
        label: '4. Pastilla Puente (Estilo Jazz) y Puente',
        zoneTag: 'Definición y Ataque Funk',
        functionText: 'Capta armónicos medios-agudos con mucha definición de púa o dedos (i–m); perfecta para funk, líneas rápidas y ghost notes.',
        techniqueTip: 'Alterna estrictamente índice y medio (i–m–i–m) incluso al cambiar de cuerda mediante rastrilleo (raking) descendente.',
        commonMistake: 'Tocar todas las notas con el mismo dedo índice limitando la velocidad y regularidad del groove.',
        demoType: 'note',
        demoMidis: [28, 40, 28, 40],
        svgX: 540,
        svgY: 115,
      },
    ],
  },
  drum: {
    id: 'drum',
    title: 'Anatomía Interactiva del Kit de Batería',
    subtitle: 'Pulsa cada pieza del kit en vista superior para escuchar su timbre real, rol rítmico y extremidad asignada.',
    svgViewBox: '0 0 680 245',
    hotspots: [
      {
        id: 'hihat',
        label: '1. Hi-Hat (Charles)',
        zoneTag: 'Subdivisión (Mano Der. + Pie Izq.)',
        functionText: 'Dos platos enfrentados accionados con el pie izquierdo que marcan corcheas o semicorcheas continuas.',
        techniqueTip: 'Golpea el borde con el cuello de la baqueta para groove abierto y la punta arriba para definición limpia.',
        commonMistake: 'Abrir el pie izquierdo sin sincronizar la muñeca derecha o apretar los platos hasta ahogarlos.',
        demoType: 'drum',
        demoMidis: [42], // hihat
        svgX: 165,
        svgY: 122,
      },
      {
        id: 'tarola',
        label: '2. Tarola / Caja (Snare)',
        zoneTag: 'Backbeat 2 y 4 (Mano Izq.)',
        functionText: 'Tambor con bordón metálico inferior que define el pulso 2 y 4 (backbeat) y las notas fantasma.',
        techniqueTip: 'Mantén la punta de la baqueta apuntando al centro del parche; usa agarre Fulcrum (pulgar + índice como bisagra).',
        commonMistake: 'Apretar la baqueta con todos los dedos matando el rebote natural y fatigando la muñeca.',
        demoType: 'drum',
        demoMidis: [38], // snare
        svgX: 255,
        svgY: 158,
      },
      {
        id: 'bombo',
        label: '3. Bombo (Kick Drum)',
        zoneTag: 'Cimiento Grave (Pie Derecho)',
        functionText: 'El cuerpo más grave del kit; se acopla exactamente con el bajo eléctrico en los tiempos fuertes y síncopas.',
        techniqueTip: 'Relaja el tobillo y deja que el mazo rebote (o controla el apoyo) sin tensar la cadera.',
        commonMistake: 'Enterrar el mazo contra el parche con fuerza excesiva provocando dobles rebotes involuntarios.',
        demoType: 'drum',
        demoMidis: [36], // kick
        svgX: 340,
        svgY: 125,
      },
      {
        id: 'toms',
        label: '4. Toms Aéreos y Tom de Piso',
        zoneTag: 'Redobles y Fills',
        functionText: 'Tambores afinados de agudo a grave para construir frases de transición entre verso y coro.',
        techniqueTip: 'Inclina suavemente los toms hacia ti para que la baqueta golpee plano sin abollar el parche.',
        commonMistake: 'Acelerar el tempo cuando bajas por los toms al hacer un fill en los tiempos 3 y 4.',
        demoType: 'drum',
        demoMidis: [45], // tom
        svgX: 430,
        svgY: 112,
      },
      {
        id: 'platos',
        label: '5. Platos Crash y Ride',
        zoneTag: 'Acentos de Sección y Estribillos',
        functionText: 'El Crash marca el tiempo 1 de secciones nuevas; el Ride lleva el patrón agudo abierto en coros o jazz.',
        techniqueTip: 'Golpea el Crash con un movimiento lateral de barrido ("glancing blow"), nunca perpendicular de frente.',
        commonMistake: 'Tocar el Crash solo sin pisar el Bombo debajo: un Crash sin Bombo suena débil y desconectado.',
        demoType: 'drum',
        demoMidis: [49], // crash
        svgX: 522,
        svgY: 126,
      },
    ],
  },
  voice: {
    id: 'voice',
    title: 'Anatomía Interactiva del Instrumento Vocal',
    subtitle: 'Comprende los 3 subsistemas de tu voz (Motor Respiratorio, Vibrador Laríngeo y Resonadores) antes de cantar.',
    svgViewBox: '0 0 680 245',
    hotspots: [
      {
        id: 'diafragma',
        label: '1. Motor: Diafragma y Costillas',
        zoneTag: 'Presión Subglótica / Appoggio',
        functionText: 'Al inhalar, el diafragma desciende y las costillas inferiores se expanden 360°; el apoyo regula la salida estable del aire.',
        techniqueTip: 'Al soltar la nota, mantén la sensación de costillas abiertas para evitar que el aire escape de golpe.',
        commonMistake: 'Levantar los hombros y llenar solo la parte alta del pecho causando tensión inmediata en el cuello.',
        demoType: 'vocal',
        demoMidis: [60],
        svgX: 250,
        svgY: 185,
      },
      {
        id: 'laringe',
        label: '2. Vibrador: Laringe y Pliegues Vocales',
        zoneTag: 'Fuente de Altura (Cuerdas Vocales)',
        functionText: 'Dos pequeños pliegues musculares dentro de la laringe vibran al paso del aire; su estiramiento define la nota exacta.',
        techniqueTip: 'Empieza siempre con ejercicios SOVT (Lip Trill "Brrrr" o popote) para vibrar con mínima fricción.',
        commonMistake: 'Empujar volumen con la garganta ("apretar") al subir a notas agudas en lugar de modificar la vocal.',
        demoType: 'vocal',
        demoMidis: [64, 67, 64, 60],
        svgX: 340,
        svgY: 122,
      },
      {
        id: 'faringe',
        label: '3. Resonador Faríngeo y Paladar Blando',
        zoneTag: 'Espacio y Calidez Timbrica',
        functionText: 'El espacio detrás de la lengua y el velo del paladar amplifica los armónicos cálidos de la voz (espacio de medio bostezo).',
        techniqueTip: 'Imagina una sonrisa interna detrás de los molares superiores para liberar espacio sin hundir la laringe.',
        commonMistake: 'Bajar la raíz de la lengua hacia atrás intentando sonar "grande", lo que oscurece y bloquea el paso.',
        demoType: 'vocal',
        demoMidis: [62, 65, 69],
        svgX: 432,
        svgY: 82,
      },
      {
        id: 'mascara',
        label: '4. Resonadores Frontales ("Máscara")',
        zoneTag: 'Proyección y Claridad sin Esfuerzo',
        functionText: 'La cavidad bucal y facial dirige la energía acústica de formantes brillantes (2.5–3.5 kHz) para proyectar sin gritar.',
        techniqueTip: 'Prueba vibrar con "Mmm" o "Ng" sintiendo un suave cosquilleo en labios y puente nasal antes de abrir a "Maa".',
        commonMistake: 'Abrir la boca en exceso horizontalmente en agudos en vez de redondear suavemente hacia vocales estables.',
        demoType: 'vocal',
        demoMidis: [67, 71, 72],
        svgX: 525,
        svgY: 56,
      },
    ],
  },
};
