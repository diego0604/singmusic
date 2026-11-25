/**
 * Pure Logic, Datasets & Evaluators for the Musical Encyclopedia Expansion Pack:
 * 1. Real Song Dissections ("Cómo suenan canciones reales")
 * 2. Acoustic Guitar Fingerstyle / PIMA / Travis Picking patterns
 * 3. Electric Guitar Signal Chain, Pickup & Expressive Technique Simulator
 * 4. Bass Motor Skills, String Crossing, Muting & Transition Fills
 * 5. Arrangement Layer Mixer (Mute/Solo by Genre) & Orchestral Timbres/Transposition
 * 6. Guided Interactive Harmony Challenges ("Cambia 1 Nota", "Repara el Acorde", "Completa la Cadencia")
 * 7. Deliberate Practice (Chunking), Musician Health & Band Jam Codes
 */

export type ExpansionInstrumentSurface = 'piano' | 'guitar' | 'bass';

// ============================================================================
// 1. REAL SONG DISSECTIONS ("ANATOMÍA DE CANCIONES REALES")
// ============================================================================

export type SongLayerId = 'drums' | 'bass' | 'harmony' | 'melody';

export interface SongDissectionBar {
  bar: number;
  roman: string;
  chordSymbol: string;
  chordMidis: number[];
  bassMidis: number[]; // 4 quarter-note or 8 eighth-note slots per bar (0 = rest)
  melodyMidis: number[]; // 8 eighth-note slots per bar (0 = rest)
  lyricOrCue: string;
}

export interface RealSongDissection {
  id: string;
  title: string;
  artistRef: string;
  level: 1 | 2 | 3;
  keyLabel: string;
  bpm: number;
  meter: '4/4' | '6/8';
  genre: string;
  whyItWorks: string;
  layerNotes: Record<SongLayerId, string>;
  drumPattern: {
    kick: number[];
    snare: number[];
    hihat: number[];
  };
  bars: SongDissectionBar[];
}

export const REAL_SONG_DISSECTIONS: RealSongDissection[] = [
  {
    id: 'pop-axis-let-it-be',
    title: 'Balada Pop en 4 Acordes (Estilo "Let It Be" / "No Woman No Cry")',
    artistRef: 'Progresión I – V – vi – IV en Do Mayor',
    level: 1,
    keyLabel: 'C Mayor (Do)',
    bpm: 78,
    meter: '4/4',
    genre: 'Pop / Rock Clásico',
    whyItWorks:
      'Alterna estabilidad luminosa (I), empuje abierto (V), giro emotivo menor (vi) y calidez que abraza el regreso a casa (IV → I).',
    layerNotes: {
      harmony: 'Piano o guitarra marca acordes abiertos en negras con notas comunes (G y C) que evitan saltos bruscos.',
      bass: 'Toca fundamentales claras en los tiempos 1 y 3 con una nota de paso suave hacia el siguiente acorde.',
      drums: 'Bombo en 1 y 3, caja firme en 2 y 4 (backbeat) y hi-hat constante en corcheas.',
      melody: 'Usa notas de la pentatónica mayor de Do (C-D-E-G-A), descansando sobre la 3ª o 5ª de cada acorde.',
    },
    drumPattern: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1],
    },
    bars: [
      {
        bar: 1,
        roman: 'I',
        chordSymbol: 'C',
        chordMidis: [60, 64, 67],
        bassMidis: [36, 0, 36, 0, 36, 0, 43, 0],
        melodyMidis: [67, 0, 67, 67, 69, 0, 64, 0],
        lyricOrCue: 'Tónica estable (hogar)',
      },
      {
        bar: 2,
        roman: 'V',
        chordSymbol: 'G',
        chordMidis: [59, 62, 67],
        bassMidis: [43, 0, 43, 0, 43, 0, 47, 0],
        melodyMidis: [67, 0, 67, 72, 74, 0, 71, 0],
        lyricOrCue: 'Dominante eleva la frase',
      },
      {
        bar: 3,
        roman: 'vi',
        chordSymbol: 'Am',
        chordMidis: [60, 64, 69],
        bassMidis: [45, 0, 45, 0, 45, 0, 43, 0],
        melodyMidis: [72, 0, 72, 71, 69, 0, 64, 0],
        lyricOrCue: 'Giro nostálgico relativo menor',
      },
      {
        bar: 4,
        roman: 'IV',
        chordSymbol: 'F',
        chordMidis: [60, 65, 69],
        bassMidis: [41, 0, 41, 0, 41, 0, 43, 0],
        melodyMidis: [69, 0, 67, 65, 64, 0, 60, 0],
        lyricOrCue: 'Subdominante plagal regresa a C',
      },
    ],
  },
  {
    id: 'soul-stand-by-me',
    title: 'Clásico Soul 50s (Estilo "Stand By Me")',
    artistRef: 'Círculo I – vi – IV – V con bajo sincopado',
    level: 1,
    keyLabel: 'A Mayor (La)',
    bpm: 116,
    meter: '4/4',
    genre: 'Soul / R&B Clásico',
    whyItWorks:
      'El hook real NO está solo en los acordes sino en la línea de bajo con ritmo de tresillo/síncopa (3-3-2) que amarra toda la canción.',
    layerNotes: {
      harmony: 'Guitarra limpia o cuerdas suaves sostienen los acordes sin recargar el registro grave para dejar brillar el bajo.',
      bass: 'Dibuja un motivo memorable de 2 compases con aproximaciones diatónicas (A → G# → F# → E → D → E → A).',
      drums: 'Patrón suave de shaker/hi-hat y aro (cross-stick) en 2 y 4 con bombo sincopado.',
      melody: 'Frases cortas con silencios amplios (pregunta y respuesta contra el bajo).',
    },
    drumPattern: {
      kick: [1, 0, 0, 1, 0, 0, 1, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1],
    },
    bars: [
      {
        bar: 1,
        roman: 'I',
        chordSymbol: 'A',
        chordMidis: [57, 61, 64],
        bassMidis: [45, 0, 0, 45, 0, 0, 44, 0],
        melodyMidis: [64, 0, 66, 69, 0, 64, 0, 0],
        lyricOrCue: 'Arranque luminoso en La',
      },
      {
        bar: 2,
        roman: 'vi',
        chordSymbol: 'F#m',
        chordMidis: [57, 61, 66],
        bassMidis: [42, 0, 0, 42, 0, 0, 40, 0],
        melodyMidis: [66, 0, 64, 61, 0, 61, 0, 0],
        lyricOrCue: 'Bajada suave por nota de paso G#',
      },
      {
        bar: 3,
        roman: 'IV',
        chordSymbol: 'D',
        chordMidis: [57, 62, 66],
        bassMidis: [38, 0, 0, 38, 0, 0, 40, 0],
        melodyMidis: [62, 0, 64, 66, 0, 64, 0, 0],
        lyricOrCue: 'Subdominante cálido en Re',
      },
      {
        bar: 4,
        roman: 'V',
        chordSymbol: 'E',
        chordMidis: [59, 64, 68],
        bassMidis: [40, 0, 0, 40, 0, 42, 44, 0],
        melodyMidis: [64, 0, 61, 59, 0, 61, 0, 0],
        lyricOrCue: 'Dominante empuja de vuelta a A',
      },
    ],
  },
  {
    id: 'funk-dorian-billie',
    title: 'Groove Pop-Funk Menor (Estilo "Billie Jean" / Dórico)',
    artistRef: 'Ostinato hipnótico i – ii – i en Fa# Menor',
    level: 2,
    keyLabel: 'F# Menor / Dórico',
    bpm: 117,
    meter: '4/4',
    genre: 'Pop-Funk / Groove',
    whyItWorks:
      'En lugar de cambiar muchos acordes, hipnotiza con un bajo imparable en corcheas y puñaladas armónicas breves (stabs) en los tiempos 1 y "y del 2".',
    layerNotes: {
      harmony: 'Sintetizador/guitarra toca bloques muy secos solo en 2 pulsos (espacio = groove).',
      bass: 'Ostinato perpetuo en corcheas que recorre tónica, 5ª, b7 y 4ª sin detenerse jamás.',
      drums: 'Bombo en 1 y 3 + caja seca en 2 y 4 + hi-hat apretado y mecánico: cero relleno innecesario.',
      melody: 'Notas repetidas rítmicas sobre la pentatónica menor de F# con síncopas agudas.',
    },
    drumPattern: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1],
    },
    bars: [
      {
        bar: 1,
        roman: 'i',
        chordSymbol: 'F#m7',
        chordMidis: [54, 57, 61, 64],
        bassMidis: [42, 37, 40, 42, 40, 37, 35, 37],
        melodyMidis: [66, 0, 69, 66, 0, 64, 61, 0],
        lyricOrCue: 'Ostinato en F#m7 + puñalada en tiempo 1',
      },
      {
        bar: 2,
        roman: 'ii (color)',
        chordSymbol: 'G#m7/F#',
        chordMidis: [56, 59, 63, 66],
        bassMidis: [42, 37, 40, 42, 40, 37, 35, 37],
        melodyMidis: [68, 0, 66, 64, 0, 61, 0, 0],
        lyricOrCue: 'Acorde vecino sobre pedal de F#',
      },
      {
        bar: 3,
        roman: 'i',
        chordSymbol: 'F#m7',
        chordMidis: [54, 57, 61, 64],
        bassMidis: [42, 37, 40, 42, 40, 37, 35, 37],
        melodyMidis: [66, 66, 69, 0, 73, 0, 71, 0],
        lyricOrCue: 'Pregunta melódica ascendente',
      },
      {
        bar: 4,
        roman: 'bVII → i',
        chordSymbol: 'E/F#',
        chordMidis: [56, 59, 64],
        bassMidis: [42, 37, 40, 42, 40, 37, 40, 42],
        melodyMidis: [69, 0, 66, 64, 61, 0, 66, 0],
        lyricOrCue: 'Resolución rítmica a F#m',
      },
    ],
  },
  {
    id: 'rock-modal-interchange',
    title: 'Balada Rock con Intercambio Modal (Estilo "Creep" / Beatles)',
    artistRef: 'I – III7 (Secundario) – IV – iv (Menor Prestado)',
    level: 2,
    keyLabel: 'G Mayor (Sol)',
    bpm: 92,
    meter: '4/4',
    genre: 'Rock Alternativo / Pop Épico',
    whyItWorks:
      'El III7 (B7) rompe la escala con D# (sensible hacia Em) y al final el iv menor prestado (Cm) derrite el E natural en Eb, creando una línea cromática desgarradora B → B → C → C → B.',
    layerNotes: {
      harmony: 'Guitarra arpegiada limpia deja escuchar claramente la voz interna cromática: D → D# → E → Eb → D.',
      bass: 'Sostiene fundamentales sólidas (G → B → C → C) para que el choque cromático de arriba sea clarísimo.',
      drums: 'Groove rock lento con acento pesado en 2 y 4 y apertura sutil de hi-hat antes del regreso.',
      melody: 'Destaca la nota característica de cada acorde sorpresa: D# en B7 y Eb en Cm.',
    },
    drumPattern: {
      kick: [1, 0, 0, 1, 1, 0, 0, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1],
    },
    bars: [
      {
        bar: 1,
        roman: 'I',
        chordSymbol: 'G',
        chordMidis: [55, 59, 62, 67],
        bassMidis: [43, 0, 43, 0, 43, 0, 43, 45],
        melodyMidis: [71, 0, 71, 67, 62, 0, 0, 0],
        lyricOrCue: 'Inicio diatónico luminoso (nota D)',
      },
      {
        bar: 2,
        roman: 'III7 (V7/vi)',
        chordSymbol: 'B7',
        chordMidis: [59, 63, 66, 69],
        bassMidis: [47, 0, 47, 0, 47, 0, 47, 0],
        melodyMidis: [71, 0, 75, 71, 66, 0, 0, 0],
        lyricOrCue: 'Dominante secundario: aparece D#',
      },
      {
        bar: 3,
        roman: 'IV',
        chordSymbol: 'C',
        chordMidis: [60, 64, 67, 72],
        bassMidis: [48, 0, 48, 0, 48, 0, 48, 0],
        melodyMidis: [72, 0, 76, 72, 67, 0, 0, 0],
        lyricOrCue: 'Resolución engañosa a IV (nota E)',
      },
      {
        bar: 4,
        roman: 'iv (prestado)',
        chordSymbol: 'Cm',
        chordMidis: [60, 63, 67, 72],
        bassMidis: [48, 0, 48, 0, 48, 0, 47, 45],
        melodyMidis: [72, 0, 75, 72, 67, 0, 62, 0],
        lyricOrCue: 'Intercambio modal: E baja a Eb',
      },
    ],
  },
  {
    id: 'ballad-68-compound',
    title: 'Balada / Folclore en 6/8 (Dos Pulsos Grandes de 3 Corcheas)',
    artistRef: 'Compás compuesto 6/8 (UN-dos-tres CUATRO-cinco-seis)',
    level: 2,
    keyLabel: 'E Menor (Mi menor)',
    bpm: 86,
    meter: '6/8',
    genre: 'Balada 6/8 / Folclore',
    whyItWorks:
      'Muestra físicamente la diferencia entre 3/4 y 6/8: el bombo cae en 1 y la caja cae en 4, formando un balanceo de 2 pulsos grandes divididos en 3 corcheas cada uno.',
    layerNotes: {
      harmony: 'Guitarra acústica arpegia 6 corcheas fluidas (P-i-m-a-m-i) acentuando suavemente la 1ª y la 4ª.',
      bass: 'Toca notas largas de negra con puntillo en los pulsos 1 y 4 (ancla del balanceo ternario).',
      drums: 'Bombo en corchea 1, caja en corchea 4, hi-hat/ride marcando 1-2-3 4-5-6.',
      melody: 'Curva cantabile con saltos de sexta y resolución sensible D# → E.',
    },
    drumPattern: {
      kick: [1, 0, 0, 0, 0, 1],
      snare: [0, 0, 0, 1, 0, 0],
      hihat: [1, 1, 1, 1, 1, 1],
    },
    bars: [
      {
        bar: 1,
        roman: 'i',
        chordSymbol: 'Em',
        chordMidis: [52, 59, 64, 67],
        bassMidis: [40, 0, 0, 40, 0, 42],
        melodyMidis: [64, 67, 71, 76, 0, 71],
        lyricOrCue: 'Balanceo 1-2-3 | 4-5-6 en Em',
      },
      {
        bar: 2,
        roman: 'VI',
        chordSymbol: 'C',
        chordMidis: [60, 64, 67, 72],
        bassMidis: [36, 0, 0, 36, 0, 38],
        melodyMidis: [72, 71, 67, 64, 0, 67],
        lyricOrCue: 'Apertura cálida en VI (Do)',
      },
      {
        bar: 3,
        roman: 'iv',
        chordSymbol: 'Am7',
        chordMidis: [57, 60, 64, 67],
        bassMidis: [45, 0, 0, 45, 0, 43],
        melodyMidis: [69, 67, 64, 60, 0, 64],
        lyricOrCue: 'Tensión lírica en Am7',
      },
      {
        bar: 4,
        roman: 'V7',
        chordSymbol: 'B7',
        chordMidis: [59, 63, 66, 69],
        bassMidis: [47, 0, 0, 47, 0, 45],
        melodyMidis: [66, 69, 71, 75, 0, 76],
        lyricOrCue: 'Sensible D# resuelve a E',
      },
    ],
  },
  {
    id: 'jazz-autumn-leaves',
    title: 'Estándar de Jazz por Quintas (Estilo "Autumn Leaves")',
    artistRef: 'ii7 – V7 – Imaj7 – IVmaj7 con Walking Bass y Notas Guía',
    level: 3,
    keyLabel: 'G Mayor / E Menor',
    bpm: 112,
    meter: '4/4',
    genre: 'Jazz Estándar',
    whyItWorks:
      'Las raíces caen por quintas justas (A → D → G → C) mientras la 7ª de cada acorde baja un solo semitono o tono para volverse la 3ª del siguiente (conducción perfecta de notas guía).',
    layerNotes: {
      harmony: 'Piano comping sincopado usa voicings con 3ª y 7ª (shell voicings) dejando espacio al contrabajo.',
      bass: 'Walking bass en 4 negras por compás conectando grados del acorde + aproximación cromática en el pulso 4.',
      drums: 'Ride swing con acento suave en 2 y 4, hi-hat con el pie en 2 y 4 y bombo feathering.',
      melody: 'Motivo ascendente de 3 notas que aterriza exactamente en la 3ª mayor/menor de cada acorde.',
    },
    drumPattern: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hihat: [1, 0, 1, 1, 1, 0, 1, 1],
    },
    bars: [
      {
        bar: 1,
        roman: 'ii7',
        chordSymbol: 'Am7',
        chordMidis: [57, 60, 64, 67],
        bassMidis: [45, 0, 48, 0, 52, 0, 51, 0],
        melodyMidis: [64, 66, 67, 0, 72, 0, 0, 0],
        lyricOrCue: 'ii7: melodía aterriza en C (b3)',
      },
      {
        bar: 2,
        roman: 'V7',
        chordSymbol: 'D7',
        chordMidis: [54, 60, 62, 66],
        bassMidis: [50, 0, 45, 0, 42, 0, 44, 0],
        melodyMidis: [62, 64, 66, 0, 71, 0, 0, 0],
        lyricOrCue: 'V7: G baja a F# (3ª de D7)',
      },
      {
        bar: 3,
        roman: 'Imaj7',
        chordSymbol: 'Gmaj7',
        chordMidis: [55, 59, 62, 66],
        bassMidis: [43, 0, 47, 0, 50, 0, 49, 0],
        melodyMidis: [60, 62, 64, 0, 69, 0, 0, 0],
        lyricOrCue: 'Imaj7: C baja a B (3ª de Gmaj7)',
      },
      {
        bar: 4,
        roman: 'IVmaj7',
        chordSymbol: 'Cmaj7',
        chordMidis: [55, 59, 60, 64],
        bassMidis: [48, 0, 43, 0, 40, 0, 42, 0],
        melodyMidis: [59, 60, 62, 0, 67, 0, 0, 0],
        lyricOrCue: 'IVmaj7: F# baja a E (3ª de Cmaj7)',
      },
    ],
  },
];

export interface SongStepEvent {
  barIndex: number;
  stepIndex: number;
  chordMidis: number[];
  bassMidi: number | null;
  melodyMidi: number | null;
  drums: ('kick' | 'snare' | 'hihat')[];
}

export function buildSongDissectionStepEvents(
  songId: string,
  activeLayers: Record<SongLayerId, boolean>
): SongStepEvent[] {
  const song = REAL_SONG_DISSECTIONS.find((s) => s.id === songId) || REAL_SONG_DISSECTIONS[0];
  const stepsPerBar = song.meter === '6/8' ? 6 : 8;
  const events: SongStepEvent[] = [];

  song.bars.forEach((bar, barIndex) => {
    for (let s = 0; s < stepsPerBar; s++) {
      const drums: ('kick' | 'snare' | 'hihat')[] = [];
      if (activeLayers.drums) {
        if (song.drumPattern.kick[s]) drums.push('kick');
        if (song.drumPattern.snare[s]) drums.push('snare');
        if (song.drumPattern.hihat[s]) drums.push('hihat');
      }
      const isChordHit = s === 0 || (song.meter === '4/4' && s === 4);
      const chordMidis = activeLayers.harmony && isChordHit ? bar.chordMidis : [];
      const rawBass = bar.bassMidis[s] ?? 0;
      const bassMidi = activeLayers.bass && rawBass > 0 ? rawBass : null;
      const rawMel = bar.melodyMidis[s] ?? 0;
      const melodyMidi = activeLayers.melody && rawMel > 0 ? rawMel : null;

      events.push({
        barIndex,
        stepIndex: s,
        chordMidis,
        bassMidi,
        melodyMidi,
        drums,
      });
    }
  });

  return events;
}

// ============================================================================
// 2. ACOUSTIC GUITAR FINGERSTYLE / PIMA / TRAVIS PICKING
// ============================================================================

export type RightHandFinger = 'P' | 'i' | 'm' | 'a' | 'P+m' | 'P+a' | 'X';

export interface FingerstyleChordShape {
  symbol: string;
  /** High-to-low sIdx 0 (1st e) .. 5 (6th E), -1 = muted */
  frets: number[];
  bassPrimarySIdx: number; // 5 (6th) or 4 (5th) or 3 (4th)
  bassAltSIdx: number; // Alternating Travis thumb string
}

export interface FingerstyleStep {
  beatLabel: string;
  finger: RightHandFinger;
  /** 'bass1' | 'bass2' | 0 (1st) | 1 (2nd) | 2 (3rd) | 3 (4th) | 'perc' */
  targets: ('bass1' | 'bass2' | 0 | 1 | 2 | 3 | 'perc')[];
}

export interface FingerstylePattern {
  id: string;
  name: string;
  level: 1 | 2 | 3;
  meter: '4/4' | '6/8';
  defaultBpm: number;
  feel: string;
  techniqueTip: string;
  steps: FingerstyleStep[];
}

export const FINGERSTYLE_CHORD_PROGRESSIONS: {
  id: string;
  label: string;
  chords: FingerstyleChordShape[];
}[] = [
  {
    id: 'c-am-f-g',
    label: 'C – Am – Dm – G (Pop / Balada Clásica)',
    chords: [
      { symbol: 'C', frets: [0, 1, 0, 2, 3, -1], bassPrimarySIdx: 4, bassAltSIdx: 3 },
      { symbol: 'Am', frets: [0, 1, 2, 2, 0, -1], bassPrimarySIdx: 4, bassAltSIdx: 3 },
      { symbol: 'Dm', frets: [1, 3, 2, 0, -1, -1], bassPrimarySIdx: 3, bassAltSIdx: 2 },
      { symbol: 'G', frets: [3, 0, 0, 0, 2, 3], bassPrimarySIdx: 5, bassAltSIdx: 3 },
    ],
  },
  {
    id: 'em-c-g-d',
    label: 'Em – C – G – D (Folk / Acoustic Rock)',
    chords: [
      { symbol: 'Em', frets: [0, 0, 0, 2, 2, 0], bassPrimarySIdx: 5, bassAltSIdx: 3 },
      { symbol: 'C', frets: [0, 1, 0, 2, 3, -1], bassPrimarySIdx: 4, bassAltSIdx: 3 },
      { symbol: 'G', frets: [3, 0, 0, 0, 2, 3], bassPrimarySIdx: 5, bassAltSIdx: 3 },
      { symbol: 'D', frets: [2, 3, 2, 0, -1, -1], bassPrimarySIdx: 3, bassAltSIdx: 2 },
    ],
  },
];

export const FINGERSTYLE_PATTERNS: FingerstylePattern[] = [
  {
    id: 'pima-classic',
    name: '1. Arpegio PIMA Clásico (P – i – m – a – m – i)',
    level: 1,
    meter: '4/4',
    defaultBpm: 76,
    feel: 'Balada fluida de 8 corcheas (estilo "Nothing Else Matters" / "House of the Rising Sun")',
    techniqueTip: 'Asigna 1 dedo por cuerda: Pulgar (P) en bajos 6ª–4ª, Índice (i) en 3ª, Medio (m) en 2ª, Anular (a) en 1ª.',
    steps: [
      { beatLabel: '1', finger: 'P', targets: ['bass1'] },
      { beatLabel: 'y', finger: 'i', targets: [2] },
      { beatLabel: '2', finger: 'm', targets: [1] },
      { beatLabel: 'y', finger: 'a', targets: [0] },
      { beatLabel: '3', finger: 'm', targets: [1] },
      { beatLabel: 'y', finger: 'i', targets: [2] },
      { beatLabel: '4', finger: 'm', targets: [1] },
      { beatLabel: 'y', finger: 'i', targets: [2] },
    ],
  },
  {
    id: 'ballad-68',
    name: '2. Balada 6/8 (P – i – m – a – m – i)',
    level: 1,
    meter: '6/8',
    defaultBpm: 72,
    feel: 'Balanceo ternario clásico de 6 corcheas ("Hallelujah", baladas acústicas)',
    techniqueTip: 'Acentúa sutilmente el pulso 1 (Pulgar) y el pulso 4 (Anular) para sentir el oleaje en 2 pulsos grandes.',
    steps: [
      { beatLabel: '1', finger: 'P', targets: ['bass1'] },
      { beatLabel: '2', finger: 'i', targets: [2] },
      { beatLabel: '3', finger: 'm', targets: [1] },
      { beatLabel: '4', finger: 'a', targets: [0] },
      { beatLabel: '5', finger: 'm', targets: [1] },
      { beatLabel: '6', finger: 'i', targets: [2] },
    ],
  },
  {
    id: 'travis-picking',
    name: '3. Travis Picking (Pulgar Alternado + Síncopa Melódica)',
    level: 2,
    meter: '4/4',
    defaultBpm: 92,
    feel: 'Folk norteamericano y fingerstyle ("Dust in the Wind", "Landslide", Chet Atkins)',
    techniqueTip: 'El pulgar (P) actúa como un metrónomo inalterable en 1-2-3-4 alternando bajo principal y bajo alterno (4ª cuerda).',
    steps: [
      { beatLabel: '1', finger: 'P+a', targets: ['bass1', 0] },
      { beatLabel: 'y', finger: 'i', targets: [2] },
      { beatLabel: '2', finger: 'P', targets: ['bass2'] },
      { beatLabel: 'y', finger: 'm', targets: [1] },
      { beatLabel: '3', finger: 'P', targets: ['bass1'] },
      { beatLabel: 'y', finger: 'i', targets: [2] },
      { beatLabel: '4', finger: 'P+m', targets: ['bass2', 1] },
      { beatLabel: 'y', finger: 'i', targets: [2] },
    ],
  },
  {
    id: 'pop-syncopated',
    name: '4. Fingerstyle Pop Sincopado (Pellizco + Respuesta)',
    level: 2,
    meter: '4/4',
    defaultBpm: 96,
    feel: 'Acompañamiento acústico moderno (Ed Sheeran / John Mayer)',
    techniqueTip: 'Pellizca bajo + agudas juntas en el 1 y vuelve a pellizcar en el "y del 2" para generar impulso hacia delante.',
    steps: [
      { beatLabel: '1', finger: 'P+m', targets: ['bass1', 1] },
      { beatLabel: 'y', finger: 'i', targets: [2] },
      { beatLabel: '2', finger: 'P', targets: ['bass2'] },
      { beatLabel: 'y', finger: 'a', targets: [0] },
      { beatLabel: '3', finger: 'i', targets: [2] },
      { beatLabel: 'y', finger: 'm', targets: [1] },
      { beatLabel: '4', finger: 'P', targets: ['bass2'] },
      { beatLabel: 'y', finger: 'i', targets: [2] },
    ],
  },
  {
    id: 'percussive-slap',
    name: '5. Percusión Acústica (Thumb Slap en Tiempos 2 y 4)',
    level: 2,
    meter: '4/4',
    defaultBpm: 94,
    feel: 'Groove solista con caja simulada golpeando las cuerdas graves con el pulgar',
    techniqueTip: 'En los tiempos 2 y 4 deja caer el costado del pulgar sobre la 6ª/5ª cuerda para producir un "chak" percusivo limpio.',
    steps: [
      { beatLabel: '1', finger: 'P+m', targets: ['bass1', 1] },
      { beatLabel: 'y', finger: 'i', targets: [2] },
      { beatLabel: '2', finger: 'X', targets: ['perc'] },
      { beatLabel: 'y', finger: 'a', targets: [0] },
      { beatLabel: '3', finger: 'P', targets: ['bass1'] },
      { beatLabel: 'y', finger: 'm', targets: [1] },
      { beatLabel: '4', finger: 'X', targets: ['perc'] },
      { beatLabel: 'y', finger: 'i', targets: [2] },
    ],
  },
  {
    id: 'bossa-fingerstyle',
    name: '6. Bossa Nova Fingerstyle (Pulgar en 1 y 3 + Bloque Sincopado)',
    level: 3,
    meter: '4/4',
    defaultBpm: 112,
    feel: 'Clave de Bossa Nova brasileña (João Gilberto)',
    techniqueTip: 'Mantén el pulgar relajado alternando fundamental y 5ª en blancas mientras i-m-a pellizcan bloques sincopados.',
    steps: [
      { beatLabel: '1', finger: 'P+m', targets: ['bass1', 1, 2] },
      { beatLabel: 'y', finger: 'a', targets: [0] },
      { beatLabel: '2', finger: 'm', targets: [1, 2] },
      { beatLabel: 'y', finger: 'i', targets: [2] },
      { beatLabel: '3', finger: 'P', targets: ['bass2'] },
      { beatLabel: 'y', finger: 'm', targets: [0, 1] },
      { beatLabel: '4', finger: 'i', targets: [2] },
      { beatLabel: 'y', finger: 'm', targets: [1, 2] },
    ],
  },
];

const GUITAR_OPEN_MIDIS_HIGH_TO_LOW = [64, 59, 55, 50, 45, 40];

export function resolveFingerstyleStepNotes(
  pattern: FingerstylePattern,
  chord: FingerstyleChordShape,
  stepIdx: number
): { midis: number[]; positions: { sIdx: number; fret: number }[]; isPercussion: boolean; finger: RightHandFinger } {
  const step = pattern.steps[stepIdx % pattern.steps.length];
  const midis: number[] = [];
  const positions: { sIdx: number; fret: number }[] = [];
  let isPercussion = false;

  for (const t of step.targets) {
    if (t === 'perc') {
      isPercussion = true;
      continue;
    }
    const sIdx = t === 'bass1' ? chord.bassPrimarySIdx : t === 'bass2' ? chord.bassAltSIdx : t;
    const fret = chord.frets[sIdx];
    if (fret !== undefined && fret >= 0) {
      midis.push(GUITAR_OPEN_MIDIS_HIGH_TO_LOW[sIdx] + fret);
      positions.push({ sIdx, fret });
    }
  }
  return { midis, positions, isPercussion, finger: step.finger };
}

// ============================================================================
// 3. ELECTRIC GUITAR SIGNAL CHAIN, PICKUPS & EXPRESSIVE TECHNIQUES
// ============================================================================

export type ElectricPickupPos = 'neck' | 'middle' | 'bridge';
export type ElectricPedalId = 'comp' | 'drive' | 'chorus' | 'delay' | 'reverb';

export interface ElectricSignalConfig {
  pickup: ElectricPickupPos;
  activePedals: ElectricPedalId[];
  driveBeforeTimeFx: boolean; // true = Overdrive → Delay/Reverb (clean), false = Delay/Reverb → Overdrive (shoegaze/muddy)
  palmMute: boolean;
}

export interface ElectricSignalAnalysis {
  pickupLabel: string;
  brightnessHz: number;
  driveAmount: number;
  hasChorus: boolean;
  hasDelay: boolean;
  hasReverb: boolean;
  orderVerdict: 'standard' | 'experimental';
  orderExplanation: string;
  chainSummary: string;
}

export interface ElectricTechniqueDemo {
  id: string;
  label: string;
  category: 'fundamentos' | 'expresion';
  defaultConfig: Partial<ElectricSignalConfig>;
  description: string;
  tabPreview: string;
  notes: { midi: number; delaySec: number; duration: number; palmMute?: boolean; bendSemis?: number }[];
}

export const ELECTRIC_TECHNIQUE_DEMOS: ElectricTechniqueDemo[] = [
  {
    id: 'power-chords-pm',
    label: 'Power Chords (5ª) + Palm Mute (Rock / Punk)',
    category: 'fundamentos',
    defaultConfig: { pickup: 'bridge', activePedals: ['drive'], palmMute: true, driveBeforeTimeFx: true },
    description:
      'Sin 3ª mayor ni menor, el intervalo de 5ª justa (1–5–8) no embarra con distorsión. Apoya el canto de la mano derecha sobre el puente para lograr el golpe seco "chug-chug".',
    tabPreview: 'E5 (0-2-2) PM PM → G5 (3-5-5) → A5 (5-7-7) abierto',
    notes: [
      { midi: 40, delaySec: 0.0, duration: 0.22, palmMute: true },
      { midi: 47, delaySec: 0.0, duration: 0.22, palmMute: true },
      { midi: 40, delaySec: 0.24, duration: 0.22, palmMute: true },
      { midi: 47, delaySec: 0.24, duration: 0.22, palmMute: true },
      { midi: 43, delaySec: 0.5, duration: 0.45, palmMute: false },
      { midi: 50, delaySec: 0.5, duration: 0.45, palmMute: false },
      { midi: 45, delaySec: 1.0, duration: 0.65, palmMute: false },
      { midi: 52, delaySec: 1.0, duration: 0.65, palmMute: false },
    ],
  },
  {
    id: 'clean-chorus-arpeggio',
    label: 'Clean Cristalino + Chorus y Delay (80s / Indie / Funk)',
    category: 'fundamentos',
    defaultConfig: { pickup: 'neck', activePedals: ['comp', 'chorus', 'delay', 'reverb'], palmMute: false, driveBeforeTimeFx: true },
    description:
      'La pastilla del mástil ofrece calidez redonda; el compresor iguala el ataque y el chorus + delay estéreo abren la guitarra sin tapar la voz.',
    tabPreview: 'Am9 arpegiado limpio (A – E – B – C – G)',
    notes: [
      { midi: 45, delaySec: 0.0, duration: 0.7 },
      { midi: 52, delaySec: 0.22, duration: 0.7 },
      { midi: 59, delaySec: 0.44, duration: 0.7 },
      { midi: 60, delaySec: 0.66, duration: 0.7 },
      { midi: 67, delaySec: 0.88, duration: 0.9 },
    ],
  },
  {
    id: 'legato-hammer-pull',
    label: 'Legato Fluido (Hammer-On + Pull-Off sin Púa)',
    category: 'expresion',
    defaultConfig: { pickup: 'neck', activePedals: ['comp', 'drive', 'delay'], palmMute: false, driveBeforeTimeFx: true },
    description:
      'Solo se ataca la primera nota con la púa; las siguientes nacen martillando (H) y jalando lateralmente (P) con la mano izquierda para un sonido vocal y sedoso.',
    tabPreview: '3ª cuerda: 5h7h9p7p5 → 4ª cuerda: 7 (La menor)',
    notes: [
      { midi: 60, delaySec: 0.0, duration: 0.16 },
      { midi: 62, delaySec: 0.14, duration: 0.16 },
      { midi: 64, delaySec: 0.28, duration: 0.16 },
      { midi: 62, delaySec: 0.42, duration: 0.16 },
      { midi: 60, delaySec: 0.56, duration: 0.18 },
      { midi: 57, delaySec: 0.72, duration: 0.75 },
    ],
  },
  {
    id: 'lead-bend-vibrato',
    label: 'Bending Afinado de 1 Tono + Vibrato Solista',
    category: 'expresion',
    defaultConfig: { pickup: 'bridge', activePedals: ['drive', 'delay', 'reverb'], palmMute: false, driveBeforeTimeFx: true },
    description:
      'Empuja la cuerda con 3 dedos juntos (índice+medio+anular) girando la muñeca hasta clavar la afinación de la nota objetivo (+2 semitonos) y remata con vibrato parejo.',
    tabPreview: '2ª cuerda tr.8 (G4) → Bend +1 Tono a A4 → Resolución C5',
    notes: [
      { midi: 64, delaySec: 0.0, duration: 0.28 },
      { midi: 67, delaySec: 0.3, duration: 0.75, bendSemis: 2 },
      { midi: 72, delaySec: 1.1, duration: 0.85 },
    ],
  },
  {
    id: 'two-hand-tapping',
    label: 'Two-Hand Tapping (Tríada Am en 1 Cuerda)',
    category: 'expresion',
    defaultConfig: { pickup: 'bridge', activePedals: ['comp', 'drive', 'delay'], palmMute: false, driveBeforeTimeFx: true },
    description:
      'El índice derecho martilla el traste 12 (E) mientras la mano izquierda alterna trastes 5 (A) y 8 (C), logrando saltos rápidos imposibles con púa tradicional.',
    tabPreview: '1ª cuerda: T12p5h8 · T12p5h8 · T15p8h12',
    notes: [
      { midi: 76, delaySec: 0.0, duration: 0.14 },
      { midi: 69, delaySec: 0.12, duration: 0.14 },
      { midi: 72, delaySec: 0.24, duration: 0.14 },
      { midi: 76, delaySec: 0.36, duration: 0.14 },
      { midi: 69, delaySec: 0.48, duration: 0.14 },
      { midi: 72, delaySec: 0.6, duration: 0.14 },
      { midi: 79, delaySec: 0.72, duration: 0.16 },
      { midi: 72, delaySec: 0.86, duration: 0.16 },
      { midi: 76, delaySec: 1.0, duration: 0.55 },
    ],
  },
];

export function computeSignalChainAnalysis(config: ElectricSignalConfig): ElectricSignalAnalysis {
  const pickupMeta: Record<ElectricPickupPos, { label: string; hz: number }> = {
    neck: { label: 'Pastilla Mástil (Cálida · Jazz / Blues / Solos redondos)', hz: 2100 },
    middle: { label: 'Posición Media (Equilibrada · Funk / Pop)', hz: 3400 },
    bridge: { label: 'Pastilla Puente (Mordiente · Rock / Metal / Palm Mute)', hz: 5200 },
  };
  const hasComp = config.activePedals.includes('comp');
  const hasDrive = config.activePedals.includes('drive');
  const hasChorus = config.activePedals.includes('chorus');
  const hasDelay = config.activePedals.includes('delay');
  const hasReverb = config.activePedals.includes('reverb');

  const orderedChain: string[] = ['🎸 Guitarra'];
  if (hasComp) orderedChain.push('Compresor');
  if (config.driveBeforeTimeFx) {
    if (hasDrive) orderedChain.push('🔥 Overdrive');
    if (hasChorus) orderedChain.push('🌊 Chorus');
    if (hasDelay) orderedChain.push('🔁 Delay');
    if (hasReverb) orderedChain.push('🏛️ Reverb');
  } else {
    if (hasChorus) orderedChain.push('🌊 Chorus');
    if (hasDelay) orderedChain.push('🔁 Delay');
    if (hasReverb) orderedChain.push('🏛️ Reverb');
    if (hasDrive) orderedChain.push('🔥 Overdrive');
  }
  orderedChain.push('🔊 Amplificador');

  const timeBeforeDrive = !config.driveBeforeTimeFx && hasDrive && (hasDelay || hasReverb);
  return {
    pickupLabel: pickupMeta[config.pickup].label,
    brightnessHz: config.palmMute ? Math.min(1150, pickupMeta[config.pickup].hz * 0.45) : pickupMeta[config.pickup].hz,
    driveAmount: hasDrive ? 34 : 0,
    hasChorus,
    hasDelay,
    hasReverb,
    orderVerdict: timeBeforeDrive ? 'experimental' : 'standard',
    orderExplanation: timeBeforeDrive
      ? '⚠️ Orden Experimental (Shoegaze / Muro Sucio): El Delay/Reverb entra ANTES del Overdrive, así que las colas de eco también se distorsionan y se emborronan juntas.'
      : '✅ Orden Estándar de Estudio (Dinámica → Saturación → Modulación → Tiempo): El Overdrive satura la nota limpia y el Delay/Reverb repiten el sonido ya definido sin ensuciar la mezcla.',
    chainSummary: orderedChain.join(' → '),
  };
}

// ============================================================================
// 4. BASS MOTOR SKILLS, STRING CROSSING, MUTING & TRANSITION FILLS
// ============================================================================

export interface BassMotorDrillStep {
  sIdx: number; // 0=G, 1=D, 2=A, 3=E
  fret: number;
  finger: 0 | 1 | 2 | 3 | 4;
  rh: 'I' | 'M' | 'R (Rake)' | 'X (Mute)' | 'T (Slap)' | 'P (Pop)';
  noteLabel: string;
}

export interface BassMotorDrill {
  id: string;
  name: string;
  focus: 'Permutación' | 'Cruce / Raking' | 'Apagado 2 Manos' | 'Fill de Transición';
  defaultBpm: number;
  explanation: string;
  steps: BassMotorDrillStep[];
}

export const BASS_MOTOR_DRILLS: BassMotorDrill[] = [
  {
    id: 'bass_perm_1324',
    name: '1. Araña de Independencia 1–3–2–4 (4 Cuerdas)',
    focus: 'Permutación',
    defaultBpm: 76,
    explanation:
      'Fortalece anular y meñique sin despegar los dedos más de 1 cm del diapasón. Alterna estrictamente Índice (I) y Medio (M).',
    steps: [
      { sIdx: 3, fret: 5, finger: 1, rh: 'I', noteLabel: 'A1' },
      { sIdx: 3, fret: 7, finger: 3, rh: 'M', noteLabel: 'B1' },
      { sIdx: 3, fret: 6, finger: 2, rh: 'I', noteLabel: 'Bb1' },
      { sIdx: 3, fret: 8, finger: 4, rh: 'M', noteLabel: 'C2' },
      { sIdx: 2, fret: 5, finger: 1, rh: 'I', noteLabel: 'D2' },
      { sIdx: 2, fret: 7, finger: 3, rh: 'M', noteLabel: 'E2' },
      { sIdx: 2, fret: 6, finger: 2, rh: 'I', noteLabel: 'Eb2' },
      { sIdx: 2, fret: 8, finger: 4, rh: 'M', noteLabel: 'F2' },
    ],
  },
  {
    id: 'bass_raking_desc',
    name: '2. Cruce de Cuerdas y Raking Descendente (G → D → A → E)',
    focus: 'Cruce / Raking',
    defaultBpm: 84,
    explanation:
      'Al bajar de cuerda aguda a grave, deja que el MISMO dedo atraviese la cuerda siguiente ("raking") como una caída natural, evitando enredos de mano derecha.',
    steps: [
      { sIdx: 0, fret: 5, finger: 1, rh: 'M', noteLabel: 'C3' },
      { sIdx: 0, fret: 7, finger: 3, rh: 'I', noteLabel: 'D3' },
      { sIdx: 1, fret: 5, finger: 1, rh: 'R (Rake)', noteLabel: 'G2' },
      { sIdx: 1, fret: 7, finger: 3, rh: 'M', noteLabel: 'A2' },
      { sIdx: 2, fret: 5, finger: 1, rh: 'R (Rake)', noteLabel: 'D2' },
      { sIdx: 2, fret: 7, finger: 3, rh: 'I', noteLabel: 'E2' },
      { sIdx: 3, fret: 5, finger: 1, rh: 'R (Rake)', noteLabel: 'A1' },
      { sIdx: 3, fret: 8, finger: 4, rh: 'M', noteLabel: 'C2' },
    ],
  },
  {
    id: 'bass_floating_thumb_mute',
    name: '3. Apagado a Dos Manos (Floating Thumb + Notas Muertas)',
    focus: 'Apagado 2 Manos',
    defaultBpm: 92,
    explanation:
      'El pulgar derecho "flota" apoyándose sobre la cuerda más grave que la que tocas, mientras la mano izquierda afloja la presión para generar notas fantasma percusivas ("X").',
    steps: [
      { sIdx: 2, fret: 3, finger: 1, rh: 'I', noteLabel: 'C2' },
      { sIdx: 2, fret: 3, finger: 1, rh: 'X (Mute)', noteLabel: 'x (Ghost)' },
      { sIdx: 1, fret: 5, finger: 3, rh: 'M', noteLabel: 'G2' },
      { sIdx: 1, fret: 5, finger: 3, rh: 'X (Mute)', noteLabel: 'x (Ghost)' },
      { sIdx: 0, fret: 5, finger: 4, rh: 'I', noteLabel: 'C3' },
      { sIdx: 0, fret: 3, finger: 1, rh: 'M', noteLabel: 'Bb2' },
      { sIdx: 1, fret: 5, finger: 3, rh: 'R (Rake)', noteLabel: 'G2' },
      { sIdx: 2, fret: 3, finger: 1, rh: 'R (Rake)', noteLabel: 'C2' },
    ],
  },
  {
    id: 'bass_transition_fill',
    name: '4. Fill de Transición C → F (Pentatónica + Cromatismo al Compás 4)',
    focus: 'Fill de Transición',
    defaultBpm: 96,
    explanation:
      'Un buen fill de bajo nunca pierde el tiempo 1 del nuevo acorde: usa 3 notas de la pentatónica + una aproximación de semitono (E → F) para aterrizar con peso.',
    steps: [
      { sIdx: 2, fret: 3, finger: 1, rh: 'I', noteLabel: 'C2 (Acorde C)' },
      { sIdx: 2, fret: 3, finger: 1, rh: 'M', noteLabel: 'C2' },
      { sIdx: 1, fret: 2, finger: 1, rh: 'I', noteLabel: 'E2 (3ª)' },
      { sIdx: 1, fret: 5, finger: 4, rh: 'M', noteLabel: 'G2 (5ª)' },
      { sIdx: 0, fret: 2, finger: 1, rh: 'I', noteLabel: 'A2 (6ª)' },
      { sIdx: 0, fret: 5, finger: 4, rh: 'M', noteLabel: 'C3 (8ª)' },
      { sIdx: 1, fret: 2, finger: 1, rh: 'I', noteLabel: 'E2 (Puente→F)' },
      { sIdx: 1, fret: 3, finger: 2, rh: 'M', noteLabel: 'F2 (¡Aterriza!)' },
    ],
  },
];

// ============================================================================
// 5. ARRANGEMENT LAYER MIXER BY GENRE & ORCHESTRAL TIMBRES / TRANSPOSITION
// ============================================================================

export type ArrangementLayerId = 'drums' | 'bass' | 'harmony' | 'melody';

export interface ArrangementGenreMix {
  id: string;
  label: string;
  bpm: number;
  keyLabel: string;
  maskingLesson: string;
  layers: Record<
    ArrangementLayerId,
    {
      name: string;
      freqZone: string;
      roleCue: string;
      timbre: 'drums' | 'bass' | 'piano' | 'guitar' | 'strings' | 'brass' | 'woodwind' | 'quena';
      /** 8 eighth-note slots; array of midis per slot (empty = rest) */
      pattern: number[][];
    }
  >;
  drumGrid: { kick: number[]; snare: number[]; hihat: number[] };
}

export const ARRANGEMENT_GENRE_MIXES: ArrangementGenreMix[] = [
  {
    id: 'pop-rock',
    label: 'Pop / Rock Moderno (112 BPM)',
    bpm: 112,
    keyLabel: 'C Mayor (I – V)',
    maskingLesson: 'Si quitas el bajo, el bombo suena hueco; si quitas la armonía, la melodía pierde emoción. Cada capa vive en su propia banda de frecuencia.',
    drumGrid: {
      kick: [1, 0, 0, 1, 1, 0, 0, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1],
    },
    layers: {
      drums: { name: 'Batería Pop/Rock', freqZone: 'Sub + Transitorios', roleCue: 'Bombo en 1/3 + Caja en 2/4', timbre: 'drums', pattern: [] },
      bass: { name: 'Bajo Eléctrico', freqZone: '50–250 Hz (Grave)', roleCue: 'Octavas amarradas al bombo', timbre: 'bass', pattern: [[36], [], [36], [36], [43], [], [43], [43]] },
      harmony: { name: 'Guitarra / Piano Rítmico', freqZone: '250 Hz – 2 kHz (Medio)', roleCue: 'Acordes abiertos C y G', timbre: 'guitar', pattern: [[48, 52, 55, 60], [], [], [48, 52, 55], [47, 50, 55, 59], [], [], [47, 50, 55]] },
      melody: { name: 'Melodía Principal', freqZone: '1–4 kHz (Presencia)', roleCue: 'Gancho cantabile sobre la 3ª y 5ª', timbre: 'piano', pattern: [[64], [], [67], [69], [71], [], [67], []] },
    },
  },
  {
    id: 'cinematic-ballad',
    label: 'Balada Cinematográfica (74 BPM)',
    bpm: 74,
    keyLabel: 'A Menor (i – VI)',
    maskingLesson: 'El colchón de cuerdas (pad) llena el fondo sin atacar fuerte para que el arpegio de piano y la melodía respiren sin competir.',
    drumGrid: {
      kick: [1, 0, 0, 0, 0, 0, 1, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0],
    },
    layers: {
      drums: { name: 'Percusión Orquestal Suave', freqZone: 'Sub Profundo', roleCue: 'Pulso espaciado half-time', timbre: 'drums', pattern: [] },
      bass: { name: 'Contrabajo / Cello Grave', freqZone: '45–180 Hz', roleCue: 'Pedales largos A1 → F1', timbre: 'bass', pattern: [[33], [], [], [], [29], [], [], []] },
      harmony: { name: 'Colchón de Cuerdas (Pad)', freqZone: '220 Hz – 1.8 kHz', roleCue: 'Voicing abierto Am9 → Fmaj7', timbre: 'strings', pattern: [[57, 60, 64, 71], [], [], [], [53, 57, 60, 64], [], [], []] },
      melody: { name: 'Flauta / Madera Solista', freqZone: '800 Hz – 3.5 kHz', roleCue: 'Frase lírica en registro agudo', timbre: 'woodwind', pattern: [[76], [], [74], [72], [72], [], [69], []] },
    },
  },
  {
    id: 'funk-soul',
    label: 'Funk / Soul con Metales (106 BPM)',
    bpm: 106,
    keyLabel: 'E Dórico (Em7 – A7)',
    maskingLesson: 'En el Funk nadie toca todo el tiempo: los metales disparan acentos cortos ("stabs") justo en los huecos que deja el bajo y la caja.',
    drumGrid: {
      kick: [1, 0, 0, 1, 0, 1, 0, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1],
    },
    layers: {
      drums: { name: 'Batería Funk Seca', freqZone: 'Punch + Hi-Hat 1/8', roleCue: 'Bombo sincopado + caja cortante', timbre: 'drums', pattern: [] },
      bass: { name: 'Bajo Slap / Finger Funk', freqZone: '50–300 Hz', roleCue: 'Octavas E1–E2 con síncopa', timbre: 'bass', pattern: [[28], [40], [], [35], [33], [], [38], [40]] },
      harmony: { name: 'Guitarra Wah / Stabs', freqZone: '400 Hz – 2.5 kHz', roleCue: 'Voicings agudos Em9 → A13', timbre: 'guitar', pattern: [[], [55, 59, 62, 66], [], [], [], [55, 61, 64, 66], [], []] },
      melody: { name: 'Sección de Metales (Horns)', freqZone: '1–4 kHz (Ataque)', roleCue: 'Puñaladas rítmicas sincronizadas', timbre: 'brass', pattern: [[64, 67, 71], [], [], [64, 67, 71], [], [], [61, 64, 69], []] },
    },
  },
  {
    id: 'jazz-bossa',
    label: 'Jazz / Bossa Nova (118 BPM)',
    bpm: 118,
    keyLabel: 'F Mayor (Gm7 – C7)',
    maskingLesson: 'El piano comping evita tocar la fundamental que ya cubre el bajo, usando voicings sin raíz (3ª, 7ª y 9ª) para sonar limpio y sofisticado.',
    drumGrid: {
      kick: [1, 0, 0, 1, 1, 0, 0, 1],
      snare: [1, 0, 0, 1, 0, 0, 1, 0],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1],
    },
    layers: {
      drums: { name: 'Clave Bossa + Aro', freqZone: 'Brillo Suave', roleCue: 'Clave 3-2 en aro + bombo surdo', timbre: 'drums', pattern: [] },
      bass: { name: 'Bajo Surdo (1 y 5)', freqZone: '45–200 Hz', roleCue: 'Pulso pendular G → D → C → G', timbre: 'bass', pattern: [[43], [], [], [38], [36], [], [], [43]] },
      harmony: { name: 'Piano Rootless Comping', freqZone: '250 Hz – 1.5 kHz', roleCue: 'Gm9 (F-A-Bb-D) → C13 (E-A-Bb-D)', timbre: 'piano', pattern: [[53, 57, 58, 62], [], [], [53, 57, 58, 62], [], [52, 57, 58, 62], [], []] },
      melody: { name: 'Melodía Jazz / Madera', freqZone: '900 Hz – 3 kHz', roleCue: 'Línea relajada con 9ª y 13ª', timbre: 'woodwind', pattern: [[69], [], [67], [65], [64], [], [69], []] },
    },
  },
  {
    id: 'andina-fusion',
    label: 'Fusión Andina / Huayno Moderno (104 BPM)',
    bpm: 104,
    keyLabel: 'E Menor Pentatónica',
    maskingLesson: 'La quena vuela en el registro agudo (E5–E6) mientras el bajo y los acordes acústicos sostienen la síncopa andina (corchea + dos semicorcheas).',
    drumGrid: {
      kick: [1, 0, 1, 0, 1, 0, 1, 0],
      snare: [0, 1, 0, 1, 0, 1, 0, 1],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1],
    },
    layers: {
      drums: { name: 'Bombo Andino + Shaker', freqZone: 'Sub + Medio Grave', roleCue: 'Pulso telúrico de huayno 2/4', timbre: 'drums', pattern: [] },
      bass: { name: 'Bajo Eléctrico Andino', freqZone: '50–220 Hz', roleCue: 'Alterna raíz y quinta (E–B, G–D)', timbre: 'bass', pattern: [[40], [], [47], [], [43], [], [38], []] },
      harmony: { name: 'Guitarra / Charango Rasgueado', freqZone: '350 Hz – 3 kHz', roleCue: 'Acordes Em → G con brillo agudo', timbre: 'guitar', pattern: [[52, 59, 64, 67], [52, 59, 64], [52, 59, 64, 67], [], [55, 59, 62, 67], [55, 59, 62], [55, 59, 62, 67], []] },
      melody: { name: 'Quena Solista (G Mayor / Em)', freqZone: '1.2–4.5 kHz', roleCue: 'Melodía pentatónica andina con aire', timbre: 'quena', pattern: [[76], [79], [83], [79], [76], [], [74], [76]] },
    },
  },
];

export interface OrchestralFamilySpec {
  id: 'strings' | 'brass' | 'woodwind' | 'andino';
  name: string;
  transpositionNote: string;
  concertToWrittenSemis: number; // e.g., +2 for Bb Trumpet (sounds C -> written D)
  instruments: string;
  goldenRule: string;
  closedVoicing: number[];
  openVoicing: number[];
}

export const ORCHESTRAL_SECTION_RANGES: OrchestralFamilySpec[] = [
  {
    id: 'strings',
    name: 'Sección de Cuerdas (Violín I, Violín II, Viola, Cello)',
    transpositionNote: 'Instrumentos en Do (C): suenan exactamente como se escriben (0 semitonos de transposición).',
    concertToWrittenSemis: 0,
    instruments: 'Cello (C2–G4) · Viola (C3–A5) · Violín (G3–E7)',
    goldenRule: 'Deja distancias amplias (5ª u 8ª) entre Cello y Viola para claridad, y acordes más cerrados arriba entre Violines.',
    closedVoicing: [60, 64, 67, 71], // C4 E4 G4 B4
    openVoicing: [48, 59, 64, 67], // C3 B3 E4 G4
  },
  {
    id: 'brass',
    name: 'Sección de Metales (Trompeta Bb, Saxo Alto Eb, Trombón C)',
    transpositionNote: 'Trompeta en Si♭ (Bb): para que suene Do real, debes escribirle 1 tono arriba (+2 semitonos = Re).',
    concertToWrittenSemis: 2,
    instruments: 'Trombón (E2–Bb4) · Saxo Alto Eb · Trompeta Bb (F#3–C6)',
    goldenRule: 'Los metales brillan en Drop 2 y stabs rítmicos breves; deja espacio para respirar cada 2–4 compases.',
    closedVoicing: [60, 64, 67, 70], // C7 closed
    openVoicing: [55, 62, 64, 70], // Drop 2 punch
  },
  {
    id: 'woodwind',
    name: 'Sección de Maderas (Flauta, Oboe, Clarinete Bb, Fagot)',
    transpositionNote: 'Clarinete en Si♭ (+2 semitonos); Flauta, Oboe y Fagot están en Do real (0 semitonos).',
    concertToWrittenSemis: 2,
    instruments: 'Fagot (Bb1–Eb5) · Clarinete Bb (D3–F6) · Flauta (C4–C7)',
    goldenRule: 'En lugar de bloques densos, las maderas lucen al máximo con contramelodías, ecos y doblajes a la octava.',
    closedVoicing: [62, 65, 69, 72], // Dm7
    openVoicing: [50, 60, 65, 76], // Open airy Dm9
  },
  {
    id: 'andino',
    name: 'Aerófonos Andinos (Quena en Sol, Zampoña Malta / Sanka)',
    transpositionNote: 'La Quena estándar está afinada en Sol Mayor / Mi Menor (afinación real en Do, 0 transposición).',
    concertToWrittenSemis: 0,
    instruments: 'Zampoña Sanka (G3–G5) · Quena en Sol (G4–G7)',
    goldenRule: 'Armoniza dos quenas en 3ªs paralelas diatónicas de G Mayor / E Menor o en 6ªs abiertas para sonido épico.',
    closedVoicing: [76, 79, 83], // E5 G5 B5
    openVoicing: [67, 76, 83], // G4 E5 B5
  },
];

// ============================================================================
// 6. GUIDED INTERACTIVE HARMONY CHALLENGES (CREATIVE MECHANICS)
// ============================================================================

export type HarmonyChallengeMechanic = 'mutate-1-note' | 'repair-broken' | 'complete-cadence';

export interface HarmonyGuidedChallenge {
  id: string;
  sectionScope: 'h-triadas' | 'h-septimas' | 'h-cadencias' | 'h-diatonica';
  mechanic: HarmonyChallengeMechanic;
  badge: string;
  title: string;
  prompt: string;
  analogy: string;
  /** Starting chord or broken chord notes (MIDI) */
  initialMidis: number[];
  /** For mutate-1-note & repair-broken: target pitch class (0..11) the user must click on Piano/Guitar/Bass */
  expectedTargetPc?: number;
  /** For mutate-1-note & repair-broken: the replaced/broken note MIDI so playback can demonstrate Before vs After */
  replacedMidi?: number;
  resolvedMidis: number[];
  /** For complete-cadence: context chords played before the missing final chord */
  cadenceSetupChords?: { label: string; midis: number[] }[];
  cadenceOptions?: { id: string; label: string; midis: number[]; isCorrect: boolean; explanation: string }[];
  successFeedback: string;
  hint: string;
}

export const HARMONY_GUIDED_CHALLENGES: HarmonyGuidedChallenge[] = [
  {
    id: 'hg-triad-major-to-minor',
    sectionScope: 'h-triadas',
    mechanic: 'mutate-1-note',
    badge: 'Reto 1 · Cambia Solo 1 Nota',
    title: 'Convierte Do Mayor (C–E–G) en Do Menor (Cm)',
    prompt: 'Escucha C Mayor (alegre). Toca en el Piano, Guitarra o Bajo la ÚNICA nota nueva que transforma esa sonrisa en melancolía (baja la 3ª un semitono).',
    analogy: 'Es como cambiar la iluminación de una escena de día soleado a atardecer tocando un solo interruptor: de Mi (E) a Mi♭ (Eb).',
    initialMidis: [60, 64, 67],
    replacedMidi: 64,
    expectedTargetPc: 3, // Eb / D#
    resolvedMidis: [60, 63, 67],
    successFeedback: '¡Exacto! Bajando Mi (E) un semitono a Mi♭ (Eb) pasas de 3ª Mayor (4 st) a 3ª Menor (3 st): ahora tienes Do Menor (C – Eb – G).',
    hint: 'La 1ª (C) y la 5ª (G) no se mueven. Busca la nota justo 1 semitono debajo de Mi (E): es D# / Eb.',
  },
  {
    id: 'hg-triad-to-sus4',
    sectionScope: 'h-triadas',
    mechanic: 'mutate-1-note',
    badge: 'Reto 2 · Acorde Suspendido',
    title: 'Suspende Do Mayor (C–E–G) para crear Csus4',
    prompt: 'Un acorde sus4 reemplaza la 3ª (E) por la 4ª justa. Pulsa en tu instrumento la nota que suspende el acorde en el aire pidiendo resolver.',
    analogy: 'Como aguantar la respiración antes de hablar (piensa en el inicio de "Pinball Wizard" o "Free Fallin’").',
    initialMidis: [60, 64, 67],
    replacedMidi: 64,
    expectedTargetPc: 5, // F
    resolvedMidis: [60, 65, 67],
    successFeedback: '¡Brillante! Fa (F) sustituye a Mi (E) formando Csus4 (C – F – G). Escucha qué irresistible es bajar de nuevo de F a E.',
    hint: 'Sube 1 semitono desde Mi (E): llegarás a la 4ª justa (Fa / F).',
  },
  {
    id: 'hg-triad-repair-broken',
    sectionScope: 'h-triadas',
    mechanic: 'repair-broken',
    badge: 'Reto 3 · Repara el Acorde Roto',
    title: '¡Este acorde de Sol Mayor suena "roto"! (G – B – C#)',
    prompt: 'Escucha el choque disonante: la quinta está desafinada en C#. Pulsa la nota que repara el acorde para devolverle su 5ª justa sólida (G Mayor).',
    analogy: 'La quinta justa es la viga maestra del acorde; si se desvía un semitono, toda la casa tiembla.',
    initialMidis: [55, 59, 61], // G3 B3 C#4 (broken!)
    replacedMidi: 61,
    expectedTargetPc: 2, // D
    resolvedMidis: [55, 59, 62], // G3 B3 D4
    successFeedback: '¡Acorde reparado! Re (D) restaura la 5ª justa de Sol (7 semitonos) y elimina el tritono accidental G–C#.',
    hint: 'Cuenta 7 semitonos desde Sol (G), o sube un solo semitono desde la nota rota C#: llegarás a Re (D).',
  },
  {
    id: 'hg-seventh-add-maj7',
    sectionScope: 'h-septimas',
    mechanic: 'mutate-1-note',
    badge: 'Reto 1 · Construye un Maj7',
    title: 'Añade el perfume nostálgico a Do Mayor: crea Cmaj7',
    prompt: 'Tienes la tríada C – E – G. Pulsa la nota que añade la 7ª Mayor (1 semitono debajo de la octava Do) para lograr ese color soñador de jazz/lo-fi.',
    analogy: 'Es la diferencia entre una foto de día normal (C) y una puesta de sol en película analógica (Cmaj7).',
    initialMidis: [60, 64, 67],
    expectedTargetPc: 11, // B
    resolvedMidis: [60, 64, 67, 71],
    successFeedback: '¡Perfecto! Si (B) añade la 7ª Mayor (11 semitonos desde C), creando Cmaj7 (C – E – G – B).',
    hint: 'Busca la nota justo 1 semitono debajo de Do (C): es Si (B).',
  },
  {
    id: 'hg-seventh-repair-dom7',
    sectionScope: 'h-septimas',
    mechanic: 'repair-broken',
    badge: 'Reto 2 · Repara el Dominante G7',
    title: 'Convierte Gmaj7 (G–B–D–F#) en el Dominante tenso G7',
    prompt: 'Escucha Gmaj7: suena demasiado tranquilo para resolver a Do. Pulsa la nota que baja la 7ª un semitono y activa el tritono magnético de G7.',
    analogy: 'Sin la séptima menor (F), el dominante no tiene "gancho" para empujarte de vuelta a casa (C).',
    initialMidis: [55, 59, 62, 66],
    replacedMidi: 66,
    expectedTargetPc: 5, // F
    resolvedMidis: [55, 59, 62, 65],
    successFeedback: '¡Boom! Al bajar F# a Fa natural (F) aparece el tritono B–F dentro de G7, que pide a gritos resolver hacia C–E.',
    hint: 'Baja 1 semitono desde F#: llegarás a Fa (F), la 7ª menor de Sol.',
  },
  {
    id: 'hg-cadence-authentic',
    sectionScope: 'h-cadencias',
    mechanic: 'complete-cadence',
    badge: 'Reto 1 · Completa la Cadencia',
    title: 'Cierra la frase con una Cadencia Rota (Engañosa)',
    prompt: 'Escucha C → F → G7. En lugar de caer al final obvio (C), elige el acorde que "engaña" al oído abriendo un giro emotivo menor para alargar el estribillo.',
    analogy: 'Es el "plot twist" armónico de miles de baladas pop y coros de Disney: prometes volver a casa pero giras hacia la nostalgia.',
    initialMidis: [55, 59, 62, 65],
    resolvedMidis: [57, 60, 64, 69],
    cadenceSetupChords: [
      { label: 'I (C)', midis: [60, 64, 67] },
      { label: 'IV (F)', midis: [60, 65, 69] },
      { label: 'V7 (G7)', midis: [59, 62, 65, 67] },
    ],
    cadenceOptions: [
      {
        id: 'opt-c',
        label: 'I · C Mayor (C–E–G)',
        midis: [60, 64, 67],
        isCorrect: false,
        explanation: 'C Mayor produce una Cadencia Auténtica (final cerrado y definitivo), no una cadencia rota.',
      },
      {
        id: 'opt-am',
        label: 'vi · Am (A–C–E)',
        midis: [57, 60, 64, 69],
        isCorrect: true,
        explanation: '¡Exacto! V7 → vi (G7 → Am) es la Cadencia Rota: conserva C y E de Do Mayor, pero el bajo en La sorprende con color menor.',
      },
      {
        id: 'opt-dm',
        label: 'ii · Dm (D–F–A)',
        midis: [50, 57, 62, 65],
        isCorrect: false,
        explanation: 'Volver a Dm (ii) retrocede a función subdominante sin resolver la sensible B → C.',
      },
    ],
    successFeedback: '¡Cadencia Rota dominada! V7 → vi mantiene la emoción viva para repetir o alargar un estribillo.',
    hint: 'Busca el acorde relativo menor de Do Mayor (grado vi), que comparte las notas Do y Mi.',
  },
  {
    id: 'hg-diatonic-repair-progression',
    sectionScope: 'h-diatonica',
    mechanic: 'complete-cadence',
    badge: 'Reto 1 · Repara la Función Tonal',
    title: 'Sustituye el acorde "débil" por una Dominante real en C Mayor',
    prompt: 'Escucha esta vuelta: C (I) → Dm (ii) → ??? → C (I). Elige el acorde diatónico que aporta la máxima tensión (función Dominante) para empujar de vuelta a C.',
    analogy: 'La Subdominante (Dm) te saca de paseo, pero necesitas la Dominante (V7) para que el regreso a casa se sienta triunfal.',
    initialMidis: [62, 65, 69],
    resolvedMidis: [59, 62, 65, 67],
    cadenceSetupChords: [
      { label: 'I (C)', midis: [60, 64, 67] },
      { label: 'ii (Dm)', midis: [62, 65, 69] },
    ],
    cadenceOptions: [
      {
        id: 'opt-g7',
        label: 'V7 · G7 (G–B–D–F)',
        midis: [59, 62, 65, 67],
        isCorrect: true,
        explanation: '¡Correcto! G7 contiene la sensible Si (B → C) y la séptima Fa (F → E), completando el ii–V–I perfecto.',
      },
      {
        id: 'opt-f',
        label: 'IV · F (F–A–C)',
        midis: [60, 65, 69],
        isCorrect: false,
        explanation: 'F también es Subdominante (igual que Dm): se siente cálido pero le falta el empuje de Dominante.',
      },
      {
        id: 'opt-am',
        label: 'vi · Am (A–C–E)',
        midis: [57, 60, 64],
        isCorrect: false,
        explanation: 'Am tiene función de Tónica (reposo), así que frena el impulso antes de llegar a C.',
      },
    ],
    successFeedback: '¡Exacto! I → ii → V7 → I es el motor armónico más eficaz de la música tonal.',
    hint: '¿Qué grado de Do Mayor (el 5º) contiene la sensible Si (B) que sube a Do?',
  },
];

export function evaluateHarmonyChallengeAttempt(
  challengeId: string,
  payload: { midi?: number; optionId?: string }
): { correct: boolean; message: string; playMidis: number[] } {
  const ch = HARMONY_GUIDED_CHALLENGES.find((c) => c.id === challengeId);
  if (!ch) {
    return { correct: false, message: 'Reto no encontrado.', playMidis: [] };
  }
  if (ch.mechanic === 'complete-cadence' && ch.cadenceOptions) {
    const picked = ch.cadenceOptions.find((o) => o.id === payload.optionId);
    if (!picked) {
      return { correct: false, message: 'Elige una opción de acorde.', playMidis: [] };
    }
    return {
      correct: picked.isCorrect,
      message: picked.isCorrect ? ch.successFeedback : picked.explanation,
      playMidis: picked.midis,
    };
  }
  const pc = ((payload.midi ?? -1) % 12 + 12) % 12;
  if (pc === ch.expectedTargetPc) {
    return {
      correct: true,
      message: ch.successFeedback,
      playMidis: ch.resolvedMidis,
    };
  }
  return {
    correct: false,
    message: `Esa nota no resuelve el reto todavía. Pista: ${ch.hint}`,
    playMidis: payload.midi !== undefined ? [payload.midi] : [],
  };
}

// ============================================================================
// 7. DELIBERATE PRACTICE (CHUNKING), MUSICIAN HEALTH & BAND JAM PROTOCOLS
// ============================================================================

export interface ChunkingStepPlan {
  bpm: number;
  targetStreak: number;
  label: string;
}

export function buildDeliberateChunkingLadder(targetBpm: number): ChunkingStepPlan[] {
  const clamped = Math.max(60, Math.min(200, Math.round(targetBpm)));
  return [
    { bpm: Math.max(45, Math.round(clamped * 0.55)), targetStreak: 3, label: 'Fase 1 (55% · Cero Tensión): Mapeo consciente de dedos y postura' },
    { bpm: Math.max(55, Math.round(clamped * 0.72)), targetStreak: 3, label: 'Fase 2 (72% · Control Limpio): Sin errores 3 veces seguidas' },
    { bpm: Math.max(65, Math.round(clamped * 0.88)), targetStreak: 3, label: 'Fase 3 (88% · Fluidez): Misma relajación, mayor velocidad' },
    { bpm: clamped, targetStreak: 3, label: 'Fase 4 (100% · Tempo Real): Integración musical con dinámica' },
  ];
}
