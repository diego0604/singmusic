export type GuidedInstrument = 'piano' | 'guitar' | 'bass';

export interface GuidedRootOption {
  pc: number; // 0..11
  american: string;
  latin: string;
  label: string;
  pianoBaseMidi: number; // inside C4..A4 (60..69) so +12 <= A5 (81)
}

export const GUIDED_ROOT_OPTIONS: GuidedRootOption[] = [
  { pc: 0, american: 'C', latin: 'Do', label: 'Do (C)', pianoBaseMidi: 60 },
  { pc: 2, american: 'D', latin: 'Re', label: 'Re (D)', pianoBaseMidi: 62 },
  { pc: 4, american: 'E', latin: 'Mi', label: 'Mi (E)', pianoBaseMidi: 64 },
  { pc: 5, american: 'F', latin: 'Fa', label: 'Fa (F)', pianoBaseMidi: 65 },
  { pc: 7, american: 'G', latin: 'Sol', label: 'Sol (G)', pianoBaseMidi: 67 },
  { pc: 9, american: 'A', latin: 'La', label: 'La (A)', pianoBaseMidi: 69 },
];

export interface PianoKeySpec {
  midi: number;
  latinName: string;
  americanName: string;
  isBlack: boolean;
  whiteIndex: number; // 0-based index of white key (or left white key for black keys)
  shortLabel: string;
  altLabel?: string;
}

const NOTE_LATIN_BY_PC = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
const NOTE_AMERICAN_BY_PC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_ALT_BY_PC: Record<number, string> = {
  1: 'D♭',
  3: 'E♭',
  6: 'G♭',
  8: 'A♭',
  10: 'B♭',
};

export function formatMidiNoteName(midi: number): {
  latin: string;
  american: string;
  shortLabel: string;
  altLabel?: string;
} {
  const pc = ((midi % 12) + 12) % 12;
  const oct = Math.floor(midi / 12) - 1;
  const latinBase = NOTE_LATIN_BY_PC[pc];
  const amerBase = NOTE_AMERICAN_BY_PC[pc];
  const isBlack = [1, 3, 6, 8, 10].includes(pc);
  return {
    latin: `${latinBase}${oct}`,
    american: `${amerBase}${oct}`,
    shortLabel: isBlack ? amerBase : `${latinBase} / ${amerBase}`,
    altLabel: FLAT_ALT_BY_PC[pc],
  };
}

function buildPianoKeysRange(startMidi: number, endMidi: number): PianoKeySpec[] {
  const keys: PianoKeySpec[] = [];
  let whiteIdx = -1;
  for (let m = startMidi; m <= endMidi; m++) {
    const pc = ((m % 12) + 12) % 12;
    const isBlack = [1, 3, 6, 8, 10].includes(pc);
    if (!isBlack) {
      whiteIdx += 1;
    }
    const oct = Math.floor(m / 12) - 1;
    const info = formatMidiNoteName(m);
    const shortWhite = oct >= 5 ? `${NOTE_LATIN_BY_PC[pc]}${oct} / ${NOTE_AMERICAN_BY_PC[pc]}${oct}` : info.shortLabel;
    keys.push({
      midi: m,
      latinName: info.latin,
      americanName: info.american,
      isBlack,
      whiteIndex: Math.max(0, whiteIdx),
      shortLabel: isBlack ? info.shortLabel : shortWhite,
      altLabel: info.altLabel,
    });
  }
  return keys;
}

/** Legacy 1-octave C4..C5 span (13 keys) preserved for existing compatibility */
export const FUNDAMENTALS_PIANO_KEYS: PianoKeySpec[] = buildPianoKeysRange(60, 72);

/** Extended C4..A5 span (22 keys, 13 white keys) so every selectable root C..A has a full octave */
export const FUNDAMENTALS_PIANO_KEYS_EXTENDED: PianoKeySpec[] = buildPianoKeysRange(60, 81);

export interface FretboardStringRow {
  stringNumber: number; // 1 = thinnest/highest pitch
  openLabel: string;
  openMidi: number;
  cells: {
    fret: number;
    midi: number;
    pc: number;
    american: string;
    latin: string;
    isRoot: boolean;
  }[];
}

export function buildInstrumentFretboardGrid(
  instrument: 'guitar' | 'bass',
  rootPc: number,
  maxFret = 9
): FretboardStringRow[] {
  const strings =
    instrument === 'bass'
      ? [
          { num: 1, label: '1ª G2', openMidi: 43 },
          { num: 2, label: '2ª D2', openMidi: 38 },
          { num: 3, label: '3ª A1', openMidi: 33 },
          { num: 4, label: '4ª E1', openMidi: 28 },
        ]
      : [
          { num: 1, label: '1ª e4', openMidi: 64 },
          { num: 2, label: '2ª B3', openMidi: 59 },
          { num: 3, label: '3ª G3', openMidi: 55 },
          { num: 4, label: '4ª D3', openMidi: 50 },
          { num: 5, label: '5ª A2', openMidi: 45 },
          { num: 6, label: '6ª E2', openMidi: 40 },
        ];

  const normalizedRoot = ((rootPc % 12) + 12) % 12;

  return strings.map((s) => ({
    stringNumber: s.num,
    openLabel: s.label,
    openMidi: s.openMidi,
    cells: Array.from({ length: maxFret + 1 }, (_, fret) => {
      const midi = s.openMidi + fret;
      const pc = ((midi % 12) + 12) % 12;
      return {
        fret,
        midi,
        pc,
        american: NOTE_AMERICAN_BY_PC[pc],
        latin: NOTE_LATIN_BY_PC[pc],
        isRoot: pc === normalizedRoot,
      };
    }),
  }));
}

export type GuidedStepKind = 'sequence' | 'ear-match' | 'staff-read';

export interface GuidedFundamentalsStep {
  id: string;
  kind: GuidedStepKind;
  prompt: string;
  hint: string;
  targetMidis: number[];
  /** When true (guitar/bass fretboards), evaluate note identity by pitch class instead of exact octave */
  matchByPitchClass?: boolean;
  demoMidis: number[];
  demoMode: 'melodic' | 'harmonic';
  staffMidi?: number;
  staffClef?: 'treble' | 'bass';
  staffHint?: string;
  successFeedback: string;
}

export interface GuidedFundamentalsLesson {
  id: string;
  orderNumber: number;
  sectionId: string;
  badge: string;
  title: string;
  briefExplanation: string;
  takeaway: string;
  steps: GuidedFundamentalsStep[];
  allowsInfiniteEarDrill?: boolean;
  earDrillPoolMidis?: number[];
  /** Indicates whether root selector transposes this lesson dynamically */
  supportsRootTransposition: boolean;
}

export function getGuidedRootOption(rootPc: number): GuidedRootOption {
  const norm = ((rootPc % 12) + 12) % 12;
  return GUIDED_ROOT_OPTIONS.find((r) => r.pc === norm) ?? GUIDED_ROOT_OPTIONS[0];
}

function getInstrumentMidiBase(instrument: GuidedInstrument, rootPc: number): number {
  const root = getGuidedRootOption(rootPc);
  if (instrument === 'bass') {
    // Keep playable bass octave comfortably between E1 (28) and D#2 (39)
    // E(4)=28, F(5)=29, G(7)=31, A(9)=33, C(0)=36, D(2)=38
    return root.pc >= 4 ? 24 + root.pc : 36 + root.pc;
  }
  if (instrument === 'guitar') {
    // Keep playable guitar anchor cleanly within frets 0..9 across E2..B3 (40..59)
    // E(4)=40, F(5)=41, G(7)=43, A(9)=45, C(0)=48, D(2)=50
    return root.pc >= 4 ? 36 + root.pc : 48 + root.pc;
  }
  return root.pianoBaseMidi;
}

function pcLabel(pc: number): string {
  const norm = ((pc % 12) + 12) % 12;
  return `${NOTE_LATIN_BY_PC[norm]} (${NOTE_AMERICAN_BY_PC[norm]})`;
}

function semitoneNoteLabel(baseMidi: number, offset: number): string {
  const info = formatMidiNoteName(baseMidi + offset);
  return `${info.latin} (${info.american})`;
}

export function resolveGuidedLessonForContext(
  lessonId: string,
  instrument: GuidedInstrument = 'piano',
  rootPc = 0
): GuidedFundamentalsLesson {
  const root = getGuidedRootOption(rootPc);
  const baseMidi = getInstrumentMidiBase(instrument, root.pc);
  const isFret = instrument === 'guitar' || instrument === 'bass';
  const surfaceNoun =
    instrument === 'piano' ? 'el teclado' : instrument === 'guitar' ? 'el diapasón de guitarra' : 'el mástil de bajo';

  const noteAt = (offset: number) => semitoneNoteLabel(baseMidi, offset);
  const deg4 = pcLabel(root.pc + 5);
  const deg5 = pcLabel(root.pc + 7);
  const deg3M = pcLabel(root.pc + 4);
  const deg3m = pcLabel(root.pc + 3);
  const deg7M = pcLabel(root.pc + 11);
  const degSharp4 = pcLabel(root.pc + 6);
  const degSharp5 = pcLabel(root.pc + 8);
  const deg6 = pcLabel(root.pc + 9);

  switch (lessonId) {
    case 'f1-orientacion': {
      const octTop = noteAt(12);
      const lowNote = noteAt(0);
      const bridgeNote = noteAt(5);
      const anchorExplain =
        instrument === 'piano'
          ? `Las teclas negras se agrupan siempre de 2 en 2 y de 3 en 3: Do (C) está pegada a la izquierda del bloque de 2 negras y Fa (F) a la izquierda del bloque de 3 negras. Desde cualquier tónica elegida (${root.label}), subir 12 teclas completas llega a su octava.`
          : instrument === 'guitar'
            ? `En guitarra cada traste sube exactamente 1 semitono y las cuerdas al aire son E–A–D–G–B–e. Los puntos del mástil (trastes 3, 5, 7 y 9) sirven de brújula visual para ubicar ${root.label} y saltar a su octava (2 cuerdas abajo y 2 o 3 trastes a la derecha).`
            : `En bajo de 4 cuerdas (E–A–D–G, una octava debajo de la guitarra) cada traste avanza 1 semitono. La figura diagonal de octava es fija y simétrica: desde cualquier nota en 4ª o 3ª cuerda, baja 2 cuerdas y avanza 2 trastes para encontrar su octava exacta.`;
      return {
        id: 'f1-orientacion',
        orderNumber: 1,
        sectionId: 'intro',
        badge: 'Lección Guiada 1/8 · Etapa 0',
        title: `Orientación Táctil en ${instrument === 'piano' ? 'Piano' : instrument === 'guitar' ? 'Guitarra' : 'Bajo'}: Tónica ${root.label} y Octava`,
        briefExplanation: anchorExplain,
        takeaway: `Ya ubicas tu nota hogar (${root.label}), un salto ascendente claro y la octava en ${surfaceNoun}.`,
        supportsRootTransposition: true,
        steps: [
          {
            id: 'f1-s1',
            kind: 'sequence',
            prompt: `Paso 1: Encuentra y toca la nota hogar ${lowNote} en ${surfaceNoun}.`,
            hint:
              instrument === 'piano'
                ? `Busca la tecla marcada con ${root.label} (recuerda: Do a la izq. de 2 negras, Fa a la izq. de 3 negras).`
                : `Pulsa cualquier punto resaltado en dorado (${root.american}) sobre las cuerdas.`,
            targetMidis: [baseMidi],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi],
            demoMode: 'melodic',
            successFeedback: `¡Exacto! Ese es tu punto de partida ${lowNote}. Memoriza su ubicación visual en ${surfaceNoun}.`,
          },
          {
            id: 'f1-s2',
            kind: 'sequence',
            prompt: `Paso 2: Sube cinco semitonos desde ${root.latin} tocando ${bridgeNote}.`,
            hint:
              instrument === 'piano'
                ? `Cuenta 5 teclas hacia la derecha desde ${lowNote} (incluyendo blancas y negras) hasta ${bridgeNote}.`
                : `En el mástil, son 5 trastes arriba en la misma cuerda o la misma altura en la cuerda más aguda siguiente (${deg4}).`,
            targetMidis: [baseMidi + 5],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi, baseMidi + 5],
            demoMode: 'melodic',
            successFeedback: `¡Perfecto! Subiste de ${root.latin} a ${deg4} (5 semitonos arriba) con claridad.`,
          },
          {
            id: 'f1-s3',
            kind: 'sequence',
            prompt: `Paso 3: Toca la octava completa tocando primero ${lowNote} y luego su octava aguda ${octTop}.`,
            hint:
              instrument === 'piano'
                ? `Pulsa ${lowNote} y luego la tecla con el mismo nombre 12 pasos a la derecha (${octTop}).`
                : `Pulsa primero un ${root.american} grave (cuerda 6ª/5ª/4ª) y después un ${root.american} agudo (2 cuerdas más delgadas, +2 trastes a la derecha).`,
            targetMidis: [baseMidi, baseMidi + 12],
            matchByPitchClass: false,
            demoMidis: [baseMidi, baseMidi + 12],
            demoMode: 'melodic',
            successFeedback: `¡Octava lograda! Aunque la segunda nota vibra al doble de velocidad, tu oído reconoce la misma identidad ${root.latin}.`,
          },
        ],
      };
    }

    case 'f2-consonancia': {
      return {
        id: 'f2-consonancia',
        orderNumber: 2,
        sectionId: 't-sonido',
        badge: 'Lección Guiada 2/8 · Sonido',
        title: `Consonancia Abierta vs. Fricción de Semitono desde ${root.label}`,
        briefExplanation: `Cuando dos frecuencias encajan en proporciones simples (como la octava o el pilar abierto ${root.american}–${NOTE_AMERICAN_BY_PC[(root.pc + 7) % 12]}), sus ondas suenan limpias y estables. Cuando dos notas vecinas están a solo 1 semitono (${noteAt(4)} y ${noteAt(5)}), chocan dentro del oído creando tensión que pide movimiento.`,
        takeaway: 'La consonancia crea reposo y amplitud; las notas a 1 semitono generan fricción dramática.',
        supportsRootTransposition: true,
        steps: [
          {
            id: 'f2-s1',
            kind: 'sequence',
            prompt: `Paso 1: Toca ${noteAt(0)} y enseguida ${noteAt(7)} (${deg5}) para escuchar una consonancia abierta y firme.`,
            hint: `Pulsa ${root.label} y luego ${deg5} (7 semitonos arriba).`,
            targetMidis: [baseMidi, baseMidi + 7],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi, baseMidi + 7],
            demoMode: 'harmonic',
            successFeedback: `¡Limpio y sólido! ${root.american} + ${NOTE_AMERICAN_BY_PC[(root.pc + 7) % 12]} (proporción 3:2) es el pilar de estabilidad más fuerte tras la octava.`,
          },
          {
            id: 'f2-s2',
            kind: 'sequence',
            prompt: `Paso 2: Ahora toca dos notas pegadas a 1 solo semitono: ${noteAt(4)} → ${noteAt(5)} para sentir el roce directo.`,
            hint: `Pulsa ${deg3M} y justo el paso contiguo ${deg4}.`,
            targetMidis: [baseMidi + 4, baseMidi + 5],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi + 4, baseMidi + 5],
            demoMode: 'harmonic',
            successFeedback: `¿Notas la vibración apretada entre ${deg3M} y ${deg4}? Dos notas pegadas a 1 semitono crean tensión que quiere resolverse.`,
          },
          {
            id: 'f2-s3',
            kind: 'ear-match',
            prompt: `Paso 3 (Reto auditivo): Pulsa "🔊 Escuchar objetivo". Suena ${noteAt(0)} seguida de otra nota: ¿cuál oíste?`,
            hint: `Si suena pegada y tensa muy cerca de ${root.american}, es ${semitoneNoteLabel(baseMidi, 1)}; si suena abierta y amplia, es ${deg5}.`,
            targetMidis: [baseMidi + 1],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi, baseMidi + 1],
            demoMode: 'melodic',
            successFeedback: `¡Oído atento! Identificaste ${semitoneNoteLabel(baseMidi, 1)}, a solo 1 semitono sobre ${root.american}.`,
          },
        ],
      };
    }

    case 'f3-semitonos': {
      return {
        id: 'f3-semitonos',
        orderNumber: 3,
        sectionId: 't-notas',
        badge: 'Lección Guiada 3/8 · Notas y Alteraciones',
        title: `Semitonos, Tonos y Sostenidos (#) desde ${root.label}`,
        briefExplanation: `Un semitono es el paso de una nota a la inmediatamente vecina (1 traste en ${instrument === 'piano' ? 'mástil o 1 tecla' : 'el mástil'}); un tono suma 2 semitonos. Entre Mi–Fa y Si–Do nunca hay tecla negra, mientras que al subir desde ${root.label} verás dónde caen los pasos de 1 y 2 semitonos.`,
        takeaway: 'Identificar en el acto qué pasos miden 1 semitono y cuáles 1 tono evita tropiezos al alterar notas.',
        supportsRootTransposition: true,
        steps: [
          {
            id: 'f3-s1',
            kind: 'sequence',
            prompt: `Paso 1: Toca los dos semitonos naturales fijos del sistema: Mi→Fa (E→F) y Si→Do (B→C).`,
            hint:
              instrument === 'piano'
                ? 'Busca las dos parejas de teclas blancas SIN tecla negra en medio: E4→F4 y B4→C5.'
                : 'Pulsa E → F (1 traste de distancia) y luego B → C (1 traste de distancia).',
            targetMidis: isFret ? [64, 65, 71, 72] : [64, 65, 71, 72],
            matchByPitchClass: isFret,
            demoMidis: [64, 65, 71, 72],
            demoMode: 'melodic',
            successFeedback: '¡Excelente! E–F y B–C son las únicas parejas naturales separadas por solo 1 semitono.',
          },
          {
            id: 'f3-s2',
            kind: 'sequence',
            prompt: `Paso 2: Toca un Tono completo ascendente desde tu tónica: ${noteAt(0)} → ${noteAt(2)}.`,
            hint:
              instrument === 'piano'
                ? `Pulsa ${noteAt(0)}, salta la tecla intermedia y toca ${noteAt(2)} (2 semitonos arriba).`
                : `Pulsa ${root.american} y avanza exactamente 2 trastes hasta ${pcLabel(root.pc + 2)}.`,
            targetMidis: [baseMidi, baseMidi + 2],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi, baseMidi + 2],
            demoMode: 'melodic',
            successFeedback: `¡Correcto! De ${root.american} a ${NOTE_AMERICAN_BY_PC[(root.pc + 2) % 12]} hay 2 semitonos = 1 Tono completo.`,
          },
          {
            id: 'f3-s3',
            kind: 'sequence',
            prompt: `Paso 3: Desde ${noteAt(5)} (${deg4}), sube 1 semitono tocando ${noteAt(6)} (${degSharp4}).`,
            hint: `Pulsa ${deg4} y justo el paso siguiente (+1 semitono) ${degSharp4}.`,
            targetMidis: [baseMidi + 5, baseMidi + 6],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi + 5, baseMidi + 6],
            demoMode: 'melodic',
            successFeedback: `¡Exacto! Subir 1 semitono convierte ${deg4} en ${degSharp4} (o su nombre enarmónico con bemol al bajar).`,
          },
        ],
      };
    }

    case 'f4-intervalos-emocion': {
      return {
        id: 'f4-intervalos-emocion',
        orderNumber: 4,
        sectionId: 't-intervalos',
        badge: 'Lección Guiada 4/8 · Intervalos',
        title: `Las 4 Distancias Clave desde ${root.label} en ${instrument === 'piano' ? 'Piano' : instrument === 'guitar' ? 'Guitarra' : 'Bajo'}`,
        briefExplanation: `Cada intervalo tiene un gesto emocional reconocible: la 3ª Mayor (${deg3M}, 4 st) suena cálida; la 4ª Justa (${deg4}, 5 st) empuja heroica; el Tritono (${degSharp4}, 6 st) pide resolver con urgencia; y la 5ª Justa (${deg5}, 7 st) da potencia sólida.`,
        takeaway: 'Dominar la 3ª, 4ª, Tritono y 5ª desde cualquier tónica te prepara para construir escalas y acordes.',
        supportsRootTransposition: true,
        steps: [
          {
            id: 'f4-int-s1',
            kind: 'sequence',
            prompt: `Paso 1: Desde ${noteAt(0)}, construye una 4ª Justa heroica tocando ${noteAt(0)} → ${noteAt(5)}.`,
            hint: `Pulsa ${root.label} y sube 5 semitonos hasta ${deg4}.`,
            targetMidis: [baseMidi, baseMidi + 5],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi, baseMidi + 5],
            demoMode: 'melodic',
            successFeedback: `¡4ª Justa limpia (${root.american} → ${NOTE_AMERICAN_BY_PC[(root.pc + 5) % 12]})! Es el arranque clásico de marchas y estribillos épicos.`,
          },
          {
            id: 'f4-int-s2',
            kind: 'sequence',
            prompt: `Paso 2: Ahora toca el Tritono (6 semitonos, justo la mitad de la octava): ${noteAt(0)} → ${noteAt(6)}.`,
            hint: `Pulsa ${root.label} y luego ${degSharp4}.`,
            targetMidis: [baseMidi, baseMidi + 6],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi, baseMidi + 6],
            demoMode: 'melodic',
            successFeedback: `¡Tritono detectado (${root.american} → ${NOTE_AMERICAN_BY_PC[(root.pc + 6) % 12]})! Esa tensión magnética de 6 semitonos es el motor de los acordes dominantes.`,
          },
          {
            id: 'f4-int-s3',
            kind: 'ear-match',
            prompt: `Paso 3 (Reto auditivo): Pulsa "🔊 Escuchar objetivo". Oirás ${noteAt(0)} y una segunda nota: ¿cuál es?`,
            hint: `Compara si suena dulce y cálida (${deg3M} = 3ª Mayor) o hueca y firme (${deg5} = 5ª Justa).`,
            targetMidis: [baseMidi + 4],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi, baseMidi + 4],
            demoMode: 'melodic',
            successFeedback: `¡Exacto! Era ${deg3M}: la 3ª Mayor (4 semitonos), corazón luminoso de la tonalidad mayor.`,
          },
        ],
      };
    }

    case 'f5-mayor-menor': {
      return {
        id: 'f5-mayor-menor',
        orderNumber: 5,
        sectionId: 't-escalas',
        badge: 'Lección Guiada 5/8 · Escalas',
        title: `Interruptor Emocional en ${root.label}: Mayor vs. Menor y Menor Armónica`,
        briefExplanation: `Cambiar una sola nota —la 3ª— transforma toda la emoción desde ${root.label}: con 3ª Mayor (${deg3M}, 4 st) la escalera T–T–S–T suena luminosa; al bajarla a 3ª Menor (${deg3m}, 3 st) se vuelve íntima o melancólica. Y conservar la 7ª mayor (${deg7M}) junto al ♭6 (${degSharp5}) crea el giro exótico de la Menor Armónica.`,
        takeaway: 'La 3ª decide entre Mayor y Menor; el salto ♭6 → 7 da el color inconfundible de la Menor Armónica.',
        supportsRootTransposition: true,
        steps: [
          {
            id: 'f5-esc-s1',
            kind: 'sequence',
            prompt: `Paso 1: Toca los primeros 5 grados luminosos de ${root.latin} Mayor: ${noteAt(0)} → ${noteAt(2)} → ${noteAt(4)} → ${noteAt(5)} → ${noteAt(7)}.`,
            hint: `Sigue los pasos Tono–Tono–Semitono–Tono empezando en ${root.label} pasando por ${deg3M}.`,
            targetMidis: [baseMidi, baseMidi + 2, baseMidi + 4, baseMidi + 5, baseMidi + 7],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi, baseMidi + 2, baseMidi + 4, baseMidi + 5, baseMidi + 7],
            demoMode: 'melodic',
            successFeedback: `¡Brillante! Siente cómo la 3ª Mayor (${deg3M}) ilumina la escalera T–T–S–T desde ${root.latin}.`,
          },
          {
            id: 'f5-esc-s2',
            kind: 'sequence',
            prompt: `Paso 2: Baja solo la 3ª medio tono (${deg3M} → ${deg3m}) para pasar a ${root.latin} Menor: ${noteAt(0)} → ${noteAt(2)} → ${noteAt(3)} → ${noteAt(5)} → ${noteAt(7)}.`,
            hint: `Igual que antes, pero sustituye ${deg3M} por ${deg3m}.`,
            targetMidis: [baseMidi, baseMidi + 2, baseMidi + 3, baseMidi + 5, baseMidi + 7],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi, baseMidi + 2, baseMidi + 3, baseMidi + 5, baseMidi + 7],
            demoMode: 'melodic',
            successFeedback: `¡Qué contraste! Mover una sola nota medio tono hacia abajo cambió por completo la luz de ${root.latin}.`,
          },
          {
            id: 'f5-esc-s3',
            kind: 'sequence',
            prompt: `Paso 3: Siente el giro exótico de ${root.latin} Menor Armónica tocando el cierre ${noteAt(8)} (♭6) → ${noteAt(11)} (7) → ${noteAt(12)} (${root.latin}).`,
            hint: `Pulsa ${degSharp5}, salta 3 semitonos hasta la sensible ${deg7M} y resuelve en ${root.label}.`,
            targetMidis: [baseMidi + 8, baseMidi + 11, baseMidi + 12],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi + 8, baseMidi + 11, baseMidi + 12],
            demoMode: 'melodic',
            successFeedback: `¡Sonido clásico y flamenco logrado! Ese salto de 3 semitonos (${degSharp5} → ${deg7M}) empuja con fuerza hacia ${root.latin}.`,
          },
        ],
      };
    }

    case 'f6-centro-tonal': {
      return {
        id: 'f6-centro-tonal',
        orderNumber: 6,
        sectionId: 't-tonalidades',
        badge: 'Lección Guiada 6/8 · Tonalidades',
        title: `Gravedad Tonal en ${root.label} Mayor: Sensible → Casa y Relativa Menor`,
        briefExplanation: `Una canción está en tonalidad de ${root.label} Mayor cuando ${root.latin} actúa como centro de gravedad. Su 7ª nota (${deg7M}, a solo 1 semitono debajo) funciona como un imán que pide resolver en ${root.latin}. Y si usas exactamente las mismas 7 notas descansando en el 6º grado (${deg6}), entras a su Relativa Menor.`,
        takeaway: `La sensible a 1 semitono bajo la tónica explica la gravedad tonal y por qué nacen los sostenidos al cambiar de tono.`,
        supportsRootTransposition: true,
        steps: [
          {
            id: 'f6-s1',
            kind: 'sequence',
            prompt: `Paso 1: Siente la atracción magnética de la sensible en ${root.latin} Mayor: toca ${noteAt(11)} (${deg7M}) y resuelve en ${noteAt(12)} (${root.latin}).`,
            hint: `Pulsa ${deg7M} y sube 1 solo semitono hasta ${root.label}.`,
            targetMidis: [baseMidi + 11, baseMidi + 12],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi, baseMidi + 4, baseMidi + 7, baseMidi + 11, baseMidi + 12],
            demoMode: 'melodic',
            successFeedback: `¡Eso es gravedad tonal! Sin subir de ${deg7M} a ${root.latin}, la frase queda colgada en el aire.`,
          },
          {
            id: 'f6-s2',
            kind: 'sequence',
            prompt: `Paso 2: Si nos mudamos a la tonalidad vecina (${deg5} Mayor), la nueva sensible queda justo 1 semitono abajo: toca ${noteAt(6)} (${degSharp4}) → ${noteAt(7)} (${deg5}).`,
            hint: `Pulsa ${degSharp4} y resuelve un paso a la derecha en ${deg5}.`,
            targetMidis: [baseMidi + 6, baseMidi + 7],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi + 7, baseMidi + 6, baseMidi + 7],
            demoMode: 'melodic',
            successFeedback: `¡Exacto! Por eso cada paso horario por el Círculo de Quintas añade 1 sostenido en la sensible nueva (${degSharp4} → ${deg5}).`,
          },
          {
            id: 'f6-s3',
            kind: 'sequence',
            prompt: `Paso 3: Compara los dos hogares de la misma armadura: toca la tríada ${noteAt(0)}–${noteAt(4)}–${noteAt(7)} y termina descansando en la Relativa Menor ${noteAt(9)} (${deg6}).`,
            hint: `Pulsa ${root.american}, ${deg3M}, ${deg5} y cierra en ${deg6}.`,
            targetMidis: [baseMidi, baseMidi + 4, baseMidi + 7, baseMidi + 9],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi, baseMidi + 4, baseMidi + 7, baseMidi + 9],
            demoMode: 'melodic',
            successFeedback: `¡Genial! ${root.latin} Mayor y ${deg6} menor comparten exactamente las mismas 7 notas pero cambian su centro de gravedad.`,
          },
        ],
      };
    }

    case 'f7-lectura-anclas': {
      if (instrument === 'bass') {
        return {
          id: 'f7-lectura-anclas',
          orderNumber: 7,
          sectionId: 't-lectura',
          badge: 'Lección Guiada 7/8 · Lectura en Clave de Fa (Bajo)',
          title: 'Lee la Clave de Fa por Anclas Tocando en el Mástil de Bajo',
          briefExplanation:
            'El bajo eléctrico se escribe en Clave de Fa (𝄢): los dos puntitos de la clave abrazan exactamente la 4ª línea = Fa3 (F3). Combinando esa ancla con la 1ª línea = Sol2 (G2), el 2º espacio = Do3 (C3) y el 4º espacio = Sol3 (G3), lees cualquier línea de bajo sin contar de uno en uno.',
          takeaway: 'En Clave de Fa dominas las líneas graves del bajo ubicando F3 en la 4ª línea y C3 en el 2º espacio.',
          supportsRootTransposition: false,
          steps: [
            {
              id: 'f7-bass-s1',
              kind: 'staff-read',
              prompt: 'Nota en Clave de Fa 1/4: Está en la 4ª línea, justo entre los dos puntitos de la clave. Tócala en el bajo:',
              hint: 'Los dos puntos de la Clave de Fa señalan Fa (F3) — traste 3 en 2ª cuerda D o traste 8 en 3ª cuerda A.',
              targetMidis: [53],
              matchByPitchClass: true,
              demoMidis: [41],
              demoMode: 'melodic',
              staffMidi: 53,
              staffClef: 'bass',
              staffHint: '4ª línea = Ancla Fa (F3)',
              successFeedback: '¡Correcto! La 4ª línea de Clave de Fa siempre es Fa (F).',
            },
            {
              id: 'f7-bass-s2',
              kind: 'staff-read',
              prompt: 'Nota en Clave de Fa 2/4: Mira el 2º espacio desde abajo (la nota centro más usada en líneas de bajo). Tócala:',
              hint: 'Es Do (C3) — traste 3 de la 3ª cuerda (A) o traste 8 de la 4ª cuerda (E).',
              targetMidis: [48],
              matchByPitchClass: true,
              demoMidis: [36],
              demoMode: 'melodic',
              staffMidi: 48,
              staffClef: 'bass',
              staffHint: '2º espacio = Ancla Do (C3)',
              successFeedback: '¡Muy bien! El 2º espacio en Clave de Fa es Do (C).',
            },
            {
              id: 'f7-bass-s3',
              kind: 'staff-read',
              prompt: 'Nota en Clave de Fa 3/4: Baja a la 1ª línea del pentagrama (grave). ¿Qué nota del bajo es?',
              hint: 'La 1ª línea inferior de Clave de Fa es Sol (G2) — traste 3 en la 4ª cuerda (E).',
              targetMidis: [43],
              matchByPitchClass: true,
              demoMidis: [31],
              demoMode: 'melodic',
              staffMidi: 43,
              staffClef: 'bass',
              staffHint: '1ª línea = Sol grave (G2)',
              successFeedback: '¡Exacto! Sol (G) en la 1ª línea es una nota grave pilar del bajo.',
            },
            {
              id: 'f7-bass-s4',
              kind: 'staff-read',
              prompt: 'Nota en Clave de Fa 4/4: Sube al 1er espacio desde abajo. Tócala en el mástil:',
              hint: 'Un paso arriba de G2 (1ª línea) está el 1er espacio: La (A2) — 3ª cuerda al aire o traste 5 en 4ª cuerda.',
              targetMidis: [45],
              matchByPitchClass: true,
              demoMidis: [33],
              demoMode: 'melodic',
              staffMidi: 45,
              staffClef: 'bass',
              staffHint: '1er espacio = La (A2, 3ª cuerda al aire)',
              successFeedback: '¡Lectura en Clave de Fa completada! Con G, A, C y F ya tienes anclas arriba y abajo.',
            },
          ],
        };
      }

      return {
        id: 'f7-lectura-anclas',
        orderNumber: 7,
        sectionId: 't-lectura',
        badge: `Lección Guiada 7/8 · Lectura en Clave de Sol (${instrument === 'piano' ? 'Piano' : 'Guitarra'})`,
        title: `Lee el Pentagrama por Anclas Tocando en ${instrument === 'piano' ? 'el Teclado' : 'el Mástil de Guitarra'}`,
        briefExplanation:
          'No cuentes líneas de memoria desde abajo: usa 3 anclas visuales en Clave de Sol — Do central (C4) con su propia rayita debajo, Sol (G4) atravesado por la 2ª línea donde nace el rizo de la clave, y Do5 (C5) en el 3er espacio — y lee el resto avanzando paso a paso (línea↔espacio).',
        takeaway: 'Leer por anclas y contorno multiplica por 3 tu velocidad tanto en teclado como en mástil.',
        supportsRootTransposition: false,
        steps: [
          {
            id: 'f7-s1',
            kind: 'staff-read',
            prompt: `Nota en pentagrama 1/4: Está sobre la 2ª línea (donde gira el espiral de la Clave de Sol). Tócala en ${surfaceNoun}:`,
            hint: 'La Clave de Sol señala la nota Sol (G4) en la 2ª línea (3ª cuerda al aire en guitarra).',
            targetMidis: [67],
            matchByPitchClass: isFret,
            demoMidis: [instrument === 'guitar' ? 55 : 67],
            demoMode: 'melodic',
            staffMidi: 67,
            staffClef: 'treble',
            staffHint: '2ª línea = Ancla G4 (Sol)',
            successFeedback: '¡Correcto! Siempre que veas una nota en la 2ª línea en Clave de Sol es Sol (G).',
          },
          {
            id: 'f7-s2',
            kind: 'staff-read',
            prompt: `Nota en pentagrama 2/4: Vive justo debajo de la 1ª línea con su propia rayita (línea adicional). ¿Qué nota es?`,
            hint: 'Es el puente Do central (C4) — en guitarra suena en traste 1 de 2ª cuerda o traste 3 de 5ª cuerda.',
            targetMidis: [60],
            matchByPitchClass: isFret,
            demoMidis: [instrument === 'guitar' ? 48 : 60],
            demoMode: 'melodic',
            staffMidi: 60,
            staffClef: 'treble',
            staffHint: 'Línea adicional inferior = Do central (C4)',
            successFeedback: '¡Muy bien! Ese es Do (C), el punto de referencia entre graves y agudos.',
          },
          {
            id: 'f7-s3',
            kind: 'staff-read',
            prompt: `Nota en pentagrama 3/4: Sube a la 1ª línea del pentagrama. Tócala en ${surfaceNoun}:`,
            hint: 'La 1ª línea de Clave de Sol siempre es Mi (E4) — 1ª o 6ª cuerda al aire en guitarra.',
            targetMidis: [64],
            matchByPitchClass: isFret,
            demoMidis: [instrument === 'guitar' ? 52 : 64],
            demoMode: 'melodic',
            staffMidi: 64,
            staffClef: 'treble',
            staffHint: '1ª línea = E4 (Mi)',
            successFeedback: '¡Exacto! Mi (E) en la 1ª línea. Pasar de Do (línea adicional) a Mi (1ª línea) es un salto de 3ª.',
          },
          {
            id: 'f7-s4',
            kind: 'staff-read',
            prompt: `Nota en pentagrama 4/4: Mira el 3er espacio desde abajo (F–A–C–E). Toca esta última ancla:`,
            hint: 'El 3er espacio es Do agudo (C5).',
            targetMidis: [72],
            matchByPitchClass: isFret,
            demoMidis: [instrument === 'guitar' ? 60 : 72],
            demoMode: 'melodic',
            staffMidi: 72,
            staffClef: 'treble',
            staffHint: '3er espacio = Ancla C5 (Do agudo)',
            successFeedback: '¡Lectura completada! Con Do, Mi y Sol dominados ya ubicas cualquier nota vecina al instante.',
          },
        ],
      };
    }

    case 'f8-oido-activo':
    default: {
      return {
        id: 'f8-oido-activo',
        orderNumber: 8,
        sectionId: 't-oido',
        badge: 'Lección Guiada 8/8 · Oído Funcional',
        title: `Oído Relativo en ${root.label}: Escucha la Tónica y Encuentra el Grado`,
        briefExplanation: `El oído relativo entrena sintiendo adónde viaja una melodía respecto a su hogar ${root.label}: el grado 3 (${deg3M}) brilla cálido y estable, el grado 5 (${deg5}) suena amplio y firme, y el grado 7 (${deg7M}) pide subir urgente un semitono hacia la octava.`,
        takeaway: `Puedes practicar infinitos dictados auditivos de 2 notas desde ${root.label} con el botón de nuevo reto.`,
        supportsRootTransposition: true,
        allowsInfiniteEarDrill: true,
        earDrillPoolMidis: [2, 4, 5, 7, 9, 11, 12].map((off) => baseMidi + off),
        steps: [
          {
            id: 'f8-s1',
            kind: 'ear-match',
            prompt: `Reto 1: Escucha ${noteAt(0)} seguido del grado 5 (pilar abierto) y tócalo en ${surfaceNoun}:`,
            hint: `7 semitonos arriba de ${root.label}: ${deg5}.`,
            targetMidis: [baseMidi + 7],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi, baseMidi + 7],
            demoMode: 'melodic',
            successFeedback: `¡Acertaste el 5º grado (${deg5})! Es el ancla más fácil de oír junto con la octava.`,
          },
          {
            id: 'f8-s2',
            kind: 'ear-match',
            prompt: `Reto 2: Escucha ${noteAt(0)} seguido de la nota con máxima tensión hacia arriba. ¿Cuál es?`,
            hint: `Está justo 1 semitono debajo de la octava de ${root.latin}: la sensible ${deg7M}.`,
            targetMidis: [baseMidi + 11],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi, baseMidi + 11],
            demoMode: 'melodic',
            successFeedback: `¡Oído agudo! ${deg7M} (7º grado) tiene una gravedad inconfundible hacia ${root.latin}.`,
          },
          {
            id: 'f8-s3',
            kind: 'ear-match',
            prompt: `Reto 3: Escucha ${noteAt(0)} seguido del grado cálido y dulce en el centro del acorde. Tócalo:`,
            hint: `Es el 3er grado mayor de ${root.latin}: ${deg3M}.`,
            targetMidis: [baseMidi + 4],
            matchByPitchClass: isFret,
            demoMidis: [baseMidi, baseMidi + 4],
            demoMode: 'melodic',
            successFeedback: `¡Dominado! Reconociste el 3er grado (${deg3M}). Pulsa "🎲 Nuevo Reto de Oído" para seguir entrenando en ${root.label}.`,
          },
        ],
      };
    }
  }
}

export const FUNDAMENTALS_GUIDED_LESSONS: GuidedFundamentalsLesson[] = [
  resolveGuidedLessonForContext('f1-orientacion', 'piano', 0),
  resolveGuidedLessonForContext('f2-consonancia', 'piano', 0),
  resolveGuidedLessonForContext('f3-semitonos', 'piano', 0),
  resolveGuidedLessonForContext('f4-intervalos-emocion', 'piano', 0),
  resolveGuidedLessonForContext('f5-mayor-menor', 'piano', 0),
  resolveGuidedLessonForContext('f6-centro-tonal', 'piano', 0),
  resolveGuidedLessonForContext('f7-lectura-anclas', 'piano', 0),
  resolveGuidedLessonForContext('f8-oido-activo', 'piano', 0),
];

export interface GuidedTapEvalResult {
  matchedStep: boolean;
  advancedProgress: number;
  completedStep: boolean;
  feedbackText: string;
  tone: 'ok' | 'info' | 'hint';
}

export function getPianoKeySpec(midi: number): PianoKeySpec | undefined {
  return FUNDAMENTALS_PIANO_KEYS_EXTENDED.find((k) => k.midi === midi);
}

function isMatchingNote(tappedMidi: number, expectedMidi: number, matchByPitchClass?: boolean): boolean {
  if (matchByPitchClass) {
    return ((tappedMidi % 12) + 12) % 12 === ((expectedMidi % 12) + 12) % 12;
  }
  return tappedMidi === expectedMidi;
}

export function evaluateFundamentalsKeyTap(
  step: GuidedFundamentalsStep,
  tappedMidi: number,
  currentMatchedCount: number
): GuidedTapEvalResult {
  const tappedInfo = formatMidiNoteName(tappedMidi);
  const keyLabel = `${tappedInfo.latin} (${tappedInfo.american})`;

  if (step.kind === 'ear-match' || step.kind === 'staff-read') {
    const expected = step.targetMidis[0];
    if (isMatchingNote(tappedMidi, expected, step.matchByPitchClass)) {
      return {
        matchedStep: true,
        advancedProgress: 1,
        completedStep: true,
        feedbackText: step.successFeedback,
        tone: 'ok',
      };
    }
    if (step.matchByPitchClass) {
      const expInfo = formatMidiNoteName(expected);
      return {
        matchedStep: false,
        advancedProgress: 0,
        completedStep: false,
        feedbackText: `Tocaste ${tappedInfo.latin.replace(/\d+$/, '')} (${tappedInfo.american.replace(/\d+$/, '')}). Escucha la referencia y busca ${expInfo.latin.replace(/\d+$/, '')} (${expInfo.american.replace(/\d+$/, '')}) en las cuerdas.`,
        tone: 'hint',
      };
    }
    const diff = tappedMidi - expected;
    const dirMsg =
      diff > 0
        ? `Tocaste ${keyLabel}, que suena más aguda que el objetivo. Prueba un poco más a la izquierda.`
        : `Tocaste ${keyLabel}, que suena más grave que el objetivo. Prueba un poco más a la derecha.`;
    return {
      matchedStep: false,
      advancedProgress: 0,
      completedStep: false,
      feedbackText: dirMsg,
      tone: 'hint',
    };
  }

  // Sequence mode
  const safeIdx = Math.max(0, Math.min(currentMatchedCount, step.targetMidis.length - 1));
  const expectedMidi = step.targetMidis[safeIdx];
  if (isMatchingNote(tappedMidi, expectedMidi, step.matchByPitchClass)) {
    const nextProgress = safeIdx + 1;
    const completed = nextProgress >= step.targetMidis.length;
    return {
      matchedStep: true,
      advancedProgress: nextProgress,
      completedStep: completed,
      feedbackText: completed
        ? step.successFeedback
        : `✓ Bien (${keyLabel}, ${nextProgress}/${step.targetMidis.length}). Continúa con la siguiente nota.`,
      tone: completed ? 'ok' : 'info',
    };
  }

  const expInfo = formatMidiNoteName(expectedMidi);
  const expectedLabel = step.matchByPitchClass
    ? `${expInfo.latin.replace(/\d+$/, '')} (${expInfo.american.replace(/\d+$/, '')})`
    : `${expInfo.latin} (${expInfo.american})`;
  return {
    matchedStep: false,
    advancedProgress: safeIdx,
    completedStep: false,
    feedbackText: `Tocaste ${keyLabel}. Para completar este paso (${safeIdx + 1}/${step.targetMidis.length}), busca ahora ${expectedLabel}.`,
    tone: 'hint',
  };
}

export function pickNextEarDrillMidi(pool: number[], previousMidi?: number): number {
  const candidates = pool.filter((m) => m !== previousMidi);
  const source = candidates.length > 0 ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)] ?? 67;
}

export function renderStaffNoteSvg(
  midi: number,
  clef: 'treble' | 'bass' = 'treble',
  showAnchorLabel = false
): string {
  if (clef === 'bass') {
    const bassByMidi: Record<number, { y: number; sharp: boolean; ledgerTop: boolean }> = {
      40: { y: 82, sharp: false, ledgerTop: false }, // E2
      41: { y: 82, sharp: false, ledgerTop: false }, // F2 bottom space? Wait: bass lines 76=G2, 64=B2, 52=D3, 40=F3, 28=A3!
      43: { y: 76, sharp: false, ledgerTop: false }, // G2 1st line
      45: { y: 70, sharp: false, ledgerTop: false }, // A2 1st space
      47: { y: 64, sharp: false, ledgerTop: false }, // B2 2nd line
      48: { y: 58, sharp: false, ledgerTop: false }, // C3 2nd space
      50: { y: 52, sharp: false, ledgerTop: false }, // D3 3rd line
      52: { y: 46, sharp: false, ledgerTop: false }, // E3 3rd space
      53: { y: 40, sharp: false, ledgerTop: false }, // F3 4th line (between dots!)
      55: { y: 34, sharp: false, ledgerTop: false }, // G3 4th space
      57: { y: 28, sharp: false, ledgerTop: false }, // A3 5th line
      60: { y: 16, sharp: false, ledgerTop: true }, // C4 ledger above
    };
    const info = bassByMidi[midi] ?? bassByMidi[53];
    const lines = [28, 40, 52, 64, 76]
      .map((y) => {
        const isAnchor = showAnchorLabel && y === 40;
        return `<line x1="18" y1="${y}" x2="252" y2="${y}" stroke="${isAnchor ? '#8ab4f8' : '#475569'}" stroke-width="${isAnchor ? '1.9' : '1.4'}" />`;
      })
      .join('');
    const ledger = info.ledgerTop
      ? `<line x1="146" y1="16" x2="178" y2="16" stroke="#e5a93c" stroke-width="2" />`
      : '';
    const anchorText = showAnchorLabel
      ? `<text x="72" y="36" fill="#8ab4f8" font-size="8.5" font-weight="700">4ª línea = Fa3</text>`
      : '';
    return `
      <svg viewBox="0 0 270 110" class="block mx-auto w-auto max-w-full h-[108px]" role="img" aria-label="Nota en pentagrama en Clave de Fa">
        <rect x="0" y="0" width="270" height="110" rx="10" fill="#0b0e14" stroke="#232c3d" />
        ${lines}
        <text x="24" y="64" fill="#cbd5e1" font-size="44">𝄢</text>
        ${anchorText}
        ${ledger}
        <ellipse cx="162" cy="${info.y}" rx="9.5" ry="6.8" transform="rotate(-16 162 ${info.y})" fill="#e5a93c" />
      </svg>
    `;
  }

  const trebleByMidi: Record<number, { y: number; sharp: boolean; ledgerC4: boolean }> = {
    60: { y: 88, sharp: false, ledgerC4: true },
    61: { y: 88, sharp: true, ledgerC4: true },
    62: { y: 82, sharp: false, ledgerC4: false },
    63: { y: 82, sharp: true, ledgerC4: false },
    64: { y: 76, sharp: false, ledgerC4: false },
    65: { y: 70, sharp: false, ledgerC4: false },
    66: { y: 70, sharp: true, ledgerC4: false },
    67: { y: 64, sharp: false, ledgerC4: false },
    68: { y: 64, sharp: true, ledgerC4: false },
    69: { y: 58, sharp: false, ledgerC4: false },
    70: { y: 58, sharp: true, ledgerC4: false },
    71: { y: 52, sharp: false, ledgerC4: false },
    72: { y: 46, sharp: false, ledgerC4: false },
  };
  const info = trebleByMidi[midi] ?? trebleByMidi[67];
  const lines = [28, 40, 52, 64, 76]
    .map((y) => {
      const isAnchor = showAnchorLabel && y === 64;
      return `<line x1="18" y1="${y}" x2="252" y2="${y}" stroke="${isAnchor ? '#8ab4f8' : '#475569'}" stroke-width="${isAnchor ? '1.9' : '1.4'}" />`;
    })
    .join('');
  const ledger = info.ledgerC4
    ? `<line x1="146" y1="88" x2="178" y2="88" stroke="#e5a93c" stroke-width="2" />`
    : '';
  const sharp = info.sharp
    ? `<text x="140" y="${info.y + 5}" fill="#e5a93c" font-size="16" font-weight="800">♯</text>`
    : '';
  const anchorText = showAnchorLabel
    ? `<text x="72" y="61" fill="#8ab4f8" font-size="8.5" font-weight="700">2ª línea = Sol4</text>`
    : '';
  return `
    <svg viewBox="0 0 270 110" class="block mx-auto w-auto max-w-full h-[108px]" role="img" aria-label="Nota en pentagrama en Clave de Sol">
      <rect x="0" y="0" width="270" height="110" rx="10" fill="#0b0e14" stroke="#232c3d" />
      ${lines}
      <text x="24" y="72" fill="#cbd5e1" font-size="50">𝄞</text>
      ${anchorText}
      ${ledger}
      ${sharp}
      <ellipse cx="162" cy="${info.y}" rx="9.5" ry="6.8" transform="rotate(-16 162 ${info.y})" fill="#e5a93c" />
    </svg>
  `;
}

export function renderTrebleStaffNoteSvg(midi: number, showAnchorLabel = false): string {
  return renderStaffNoteSvg(midi, 'treble', showAnchorLabel);
}
