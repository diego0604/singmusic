export const LOGIC_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface VocalRegisterZone {
  label: string;
  rangeText: string;
  mechanism: string;
  color: string;
}

export interface DetailedVocalDiagnosis {
  lowMidi: number;
  highMidi: number;
  lowName: string;
  highName: string;
  semitones: number;
  octaves: number;
  isExtendedRange: boolean;
  primaryClassification: string;
  secondaryPossibilities: string[];
  whyExplanation: string;
  comfortableCenter: string;
  passaggioInfo: string;
  pedalCAdvice: string;
  zones: VocalRegisterZone[];
}

export function midiToNoteName(midi: number): string {
  const clamped = Math.max(12, Math.min(108, Math.round(midi)));
  const pc = ((clamped % 12) + 12) % 12;
  const oct = Math.floor(clamped / 12) - 1;
  return `${LOGIC_NOTE_NAMES[pc]}${oct}`;
}

export function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Classifies vocal range including extended multi-octave ranges like E2 to D5 (34 semitones)
 * where a singer spans Bass/Baritone lows up to Tenor/Head-voice highs.
 */
export function classifyVocalRangeDetailed(
  lowMidiInput: number,
  highMidiInput: number,
  comfortZone: 'low' | 'mid' | 'high' = 'mid'
): DetailedVocalDiagnosis {
  const lowMidi = Math.min(lowMidiInput, highMidiInput - 4);
  const highMidi = Math.max(highMidiInput, lowMidi + 4);
  const semitones = highMidi - lowMidi;
  const octaves = Number((semitones / 12).toFixed(2));
  const lowName = midiToNoteName(lowMidi);
  const highName = midiToNoteName(highMidi);
  const isExtendedRange = semitones >= 28; // More than 2 octaves + 4 semitones

  let primaryClassification = 'Barítono Lírico (Voz Media Masculina)';
  let secondaryPossibilities: string[] = [];
  let whyExplanation = '';
  let comfortableCenter = '';
  let passaggioInfo = '';

  // Specific check for wide male/contemporary ranges spanning E2 (40)–G2 (43) up to C5 (72)–E5 (76)
  if (lowMidi <= 44 && highMidi >= 71) {
    if (comfortZone === 'high') {
      primaryClassification = 'Tenor de Rango Extendido (con Sub-Extensión Grave E2–B2)';
    } else if (comfortZone === 'low') {
      primaryClassification = 'Barítono Lírico/Dramático con Extensión Aguda en Mix/Cabeza';
    } else {
      primaryClassification = 'Baritenor / Rango Vocal Extendido Polirregistral (3 Octavas)';
    }
    secondaryPossibilities = [
      'Baritenor Contemporáneo (Pecho de Barítono E2–E4 + Mix/Belt de Tenor F4–D5)',
      'Tenor con Extensión Grave Modal/Fry y Agudos en Voz Mixta o Cabeza',
      'Barítono Lírico con Registro de Cabeza / Falsete Reforzado Desarrollado (G4–D5)',
    ];
    whyExplanation =
      `Un rango de ${lowName} (${midiToHz(lowMidi).toFixed(1)} Hz) a ${highName} (${midiToHz(highMidi).toFixed(1)} Hz) abarca ${semitones} semitonos (${octaves} octavas). ` +
      `En el canto clásico coral, las voces se dividen en cajas de ~2 octavas (Bajo E2–E4, Barítono A2–A4, Tenor C3–C5), por eso un test simple suele etiquetarte solo como "Tenor" al ver tu nota aguda ${highName}. ` +
      `Sin embargo, como bajas con cuerpo hasta ${lowName} (territorio de Bajo/Barítono) y subes hasta ${highName} (5ª octava), posees un Rango Extendido Polirregistral (Baritenor). ` +
      `Tu clasificación real depende de dónde descansa tu voz hablada y tu "tesitura" (la zona donde puedes cantar durante horas sin fatiga): si tu centro cómodo es A2–E4 eres Barítono con gran dominio de voz mixta/cabeza arriba; si tu centro cómodo es C3–A4 eres Tenor con excelente resonancia grave.`;
    comfortableCenter =
      comfortZone === 'high'
        ? 'C3 – A4 (Centro de Tenor; E2–B2 como graves de pecho relajado)'
        : comfortZone === 'low'
          ? 'G2 – E4 (Centro de Barítono; F4–D5 en Voz Mixta / Cabeza)'
          : 'A2 – G4 (Centro Baritenor; graves E2–G2 y agudos A4–D5 por cambio de mecanismo)';
    passaggioInfo =
      '1º Passaggio (Pecho → Mix): B3–D4 | 2º Passaggio (Mix → Cabeza/Reinforced Falsetto): E4–G4';
  } else if (lowMidi <= 42 && highMidi <= 66) {
    primaryClassification = 'Bajo (Voz Grave Masculina)';
    secondaryPossibilities = ['Bajo Profundo', 'Bajo Cantante / Bajo-Barítono'];
    whyExplanation = `Tu rango (${lowName}–${highName}) destaca por una masa cordal densa en la octava 2, ideal para el cimiento armónico.`;
    comfortableCenter = `${midiToNoteName(lowMidi + 4)} – ${midiToNoteName(highMidi - 4)}`;
    passaggioInfo = '1º Passaggio: A3 – Bb3 | 2º Passaggio: C#4 – D4';
  } else if (lowMidi <= 46 && highMidi <= 70) {
    primaryClassification = 'Barítono (Voz Media Masculina)';
    secondaryPossibilities = ['Barítono Lírico', 'Barítono Martín / Baritenor'];
    whyExplanation = `Tu rango (${lowName}–${highName}) equilibra calidez en la octava 2 y proyección heroica en la octava 4.`;
    comfortableCenter = `${midiToNoteName(lowMidi + 4)} – ${midiToNoteName(highMidi - 4)}`;
    passaggioInfo = '1º Passaggio: B3 – C4 | 2º Passaggio: E4 – F4';
  } else if (lowMidi <= 51 && highMidi <= 75) {
    primaryClassification = 'Tenor (Voz Aguda Masculina)';
    secondaryPossibilities = ['Tenor Lírico', 'Tenor Ligero / Pop-Rock'];
    whyExplanation = `Tu rango (${lowName}–${highName}) brilla naturalmente sobre la octava 4 y alcanza la octava 5.`;
    comfortableCenter = `${midiToNoteName(lowMidi + 4)} – ${midiToNoteName(highMidi - 4)}`;
    passaggioInfo = '1º Passaggio: D4 – Eb4 | 2º Passaggio: G4 – A4';
  } else if (lowMidi <= 55 && highMidi <= 79) {
    primaryClassification =
      semitones >= 28
        ? 'Contralto / Tenor Altino de Rango Extendido'
        : 'Contralto (Voz Grave Femenina / Voz Mixta)';
    secondaryPossibilities = ['Contralto Dramática', 'Mezzosoprano con extensión grave', 'Contratenor'];
    whyExplanation = `Tu rango (${lowName}–${highName}, ${octaves} octavas) combina graves ricos en la octava 3 con agudos firmes en la octava 5.`;
    comfortableCenter = `${midiToNoteName(lowMidi + 4)} – ${midiToNoteName(highMidi - 4)}`;
    passaggioInfo = '1º Passaggio: C4 – D4 | 2º Passaggio: C5 – D5';
  } else if (lowMidi <= 58 && highMidi <= 82) {
    primaryClassification =
      semitones >= 28 ? 'Mezzosoprano de Rango Extendido' : 'Mezzosoprano (Voz Media Femenina)';
    secondaryPossibilities = ['Mezzosoprano Lírica', 'Soprano Dramática'];
    whyExplanation = `Tu rango (${lowName}–${highName}) domina el registro medio-alto con gran versatilidad tímbrica.`;
    comfortableCenter = `${midiToNoteName(lowMidi + 4)} – ${midiToNoteName(highMidi - 4)}`;
    passaggioInfo = '1º Passaggio: D4 – Eb4 | 2º Passaggio: D5 – E5';
  } else {
    primaryClassification =
      semitones >= 28 ? 'Soprano de Rango Extendido (Coloratura / Lírica)' : 'Soprano (Voz Aguda Femenina)';
    secondaryPossibilities = ['Soprano Lírica', 'Soprano Ligera / Coloratura'];
    whyExplanation = `Tu rango (${lowName}–${highName}) proyecta con facilidad en la octava 5 y superior.`;
    comfortableCenter = `${midiToNoteName(lowMidi + 4)} – ${midiToNoteName(highMidi - 4)}`;
    passaggioInfo = '1º Passaggio: Eb4 – F4 | 2º Passaggio: E5 – F#5';
  }

  const zones: VocalRegisterZone[] = [
    {
      label: '1. Registro Grave Modal (M1 Profundo)',
      rangeText: `${lowName} – ${midiToNoteName(Math.min(highMidi, lowMidi + 7))}`,
      mechanism: 'Músculo Tiroaritenoideo (TA) relajado y grueso. Evita empujar aire de más.',
      color: '#38bdf8',
    },
    {
      label: '2. Tesitura Central (Zona Reina / Voz de Pecho)',
      rangeText: `${midiToNoteName(Math.min(highMidi, lowMidi + 8))} – ${midiToNoteName(Math.min(highMidi, lowMidi + 19))}`,
      mechanism: 'Equilibrio TA + apoyo costal (Appoggio). Aquí vive el 80% de tus canciones.',
      color: '#10b981',
    },
    {
      label: '3. Zona de Passaggio y Voz Mixta (Puente)',
      rangeText: `${midiToNoteName(Math.min(highMidi, lowMidi + 20))} – ${midiToNoteName(Math.min(highMidi, lowMidi + 26))}`,
      mechanism: 'Transición TA → Cricotiroideo (CT). Estrecha las vocales (O/U) para no gritar.',
      color: '#f59e0b',
    },
    {
      label: '4. Extensión Superior (Voz de Cabeza / Mix Agudo / M2)',
      rangeText: `${midiToNoteName(Math.min(highMidi, lowMidi + 27))} – ${highName}`,
      mechanism: 'Dominio del Cricotiroideo (CT) + resonancia faríngea/nasal (Twang) sin tensión de cuello.',
      color: '#a855f7',
    },
  ];

  const pedalCAdvice =
    `Activa el Pedal C (Do3 = 130.8 Hz o Do4 = 261.6 Hz) y canta lentamente de C3 a C4 y luego a C5: ` +
    `sentirás cómo tu resonancia de pecho en la octava 3 debe adelgazarse en E4–G4 para llegar a ${highName} afinado con el armónico del pedal.`;

  return {
    lowMidi,
    highMidi,
    lowName,
    highName,
    semitones,
    octaves,
    isExtendedRange,
    primaryClassification,
    secondaryPossibilities,
    whyExplanation,
    comfortableCenter,
    passaggioInfo,
    pedalCAdvice,
    zones,
  };
}

/**
 * Explains the musical & acoustic relationship of any note played over a Pedal Tone (e.g., Pedal C)
 */
export interface PedalIntervalAnalysis {
  semitonesFromPedal: number;
  degreeLabel: string;
  intervalName: string;
  consonanceLevel: 'Reposo Absoluto' | 'Consonancia Imperfecta' | 'Tensión Suave / Color' | 'Alta Tensión / Gravedad';
  modalFlavor: string;
  coachingTip: string;
}

export function analyzePedalInterval(noteMidi: number, pedalMidi = 48): PedalIntervalAnalysis {
  const semi = (((noteMidi - pedalMidi) % 12) + 12) % 12;
  const table: Record<number, Omit<PedalIntervalAnalysis, 'semitonesFromPedal'>> = {
    0: {
      degreeLabel: '1 / 8 (Tónica / Octava)',
      intervalName: 'Unísono u Octava Justa',
      consonanceLevel: 'Reposo Absoluto',
      modalFlavor: 'Centro gravitacional puro (Estabilidad total)',
      coachingTip: 'Fúndete con el pedal hasta que desaparezcan por completo los batimentos acústicos.',
    },
    1: {
      degreeLabel: 'b2 (Segunda Menor)',
      intervalName: 'Segunda Menor / Novena Menor',
      consonanceLevel: 'Alta Tensión / Gravedad',
      modalFlavor: 'Modo Frigio / Flamenco / Tensión oscura',
      coachingTip: 'Siente el roce intenso de semitono que pide resolver descendiendo un semitono hacia la tónica C.',
    },
    2: {
      degreeLabel: '2 / 9 (Segunda Mayor)',
      intervalName: 'Segunda Mayor / Novena Mayor',
      consonanceLevel: 'Tensión Suave / Color',
      modalFlavor: 'Color suspendido (sus2 / add9) moderno y cristalino',
      coachingTip: 'Muy usado en pop acústico y cine: flota entre la tónica (1) y la tercera (3).',
    },
    3: {
      degreeLabel: 'b3 (Tercera Menor)',
      intervalName: 'Tercera Menor',
      consonanceLevel: 'Consonancia Imperfecta',
      modalFlavor: 'Modo Menor (Eólico / Dórico) — Introspección y melancolía',
      coachingTip: 'Define inmediatamente el carácter menor sobre el Pedal C.',
    },
    4: {
      degreeLabel: '3 (Tercera Mayor)',
      intervalName: 'Tercera Mayor',
      consonanceLevel: 'Consonancia Imperfecta',
      modalFlavor: 'Modo Mayor (Jónico / Lidio / Mixolidio) — Luminosidad y calidez',
      coachingTip: 'Es el 5º armónico natural del Pedal C; si lo afinas un poco suave brilla con dulzura pura.',
    },
    5: {
      degreeLabel: '4 / 11 (Cuarta Justa)',
      intervalName: 'Cuarta Justa',
      consonanceLevel: 'Tensión Suave / Color',
      modalFlavor: 'Suspensión (Csus4) que gravita hacia la 3ª (Mi)',
      coachingTip: 'Sobre un Pedal C suena solemne y expectante; resuélvela bajando a Mi (3ª).',
    },
    6: {
      degreeLabel: '#4 / b5 (Tritono)',
      intervalName: 'Cuarta Aumentada / Quinta Disminuida',
      consonanceLevel: 'Alta Tensión / Gravedad',
      modalFlavor: 'Modo Lidio (#4 Asombro Espacial) o Escala de Blues (b5)',
      coachingTip: 'Escucha cómo el #4 sobre el Pedal C crea la atmósfera flotante de películas de ciencia ficción.',
    },
    7: {
      degreeLabel: '5 (Quinta Justa)',
      intervalName: 'Quinta Justa (Proporción 3:2)',
      consonanceLevel: 'Reposo Absoluto',
      modalFlavor: 'Pilar heroico, potente y estable (Power Chord)',
      coachingTip: 'Es el 3º armónico del Pedal C: aporta fuerza estructural sin definir aún si es mayor o menor.',
    },
    8: {
      degreeLabel: 'b6 (Sexta Menor)',
      intervalName: 'Sexta Menor',
      consonanceLevel: 'Tensión Suave / Color',
      modalFlavor: 'Modo Eólico / Menor Armónica — Drama cinematográfico (Acorde Fm/C)',
      coachingTip: 'Tiene una fuerte atracción descendente de semitono hacia la 5ª justa (Sol).',
    },
    9: {
      degreeLabel: '6 (Sexta Mayor)',
      intervalName: 'Sexta Mayor',
      consonanceLevel: 'Consonancia Imperfecta',
      modalFlavor: 'Modo Dórico (en menor) o Pastoral Luminoso (en mayor)',
      coachingTip: 'Nota característica del Funk, Soul y música andina sobre tónica.',
    },
    10: {
      degreeLabel: 'b7 (Séptima Menor)',
      intervalName: 'Séptima Menor',
      consonanceLevel: 'Tensión Suave / Color',
      modalFlavor: 'Modo Mixolidio / Dominante Blues-Rock (C7)',
      coachingTip: 'Elimina la rigidez clásica y le da actitud de rock, funk o folclore al Pedal C.',
    },
    11: {
      degreeLabel: '7 (Séptima Mayor / Sensible)',
      intervalName: 'Séptima Mayor',
      consonanceLevel: 'Tensión Suave / Color',
      modalFlavor: 'Color Maj7 (Jazz / Bossa Nova / Dreampop) o Sensible hacia la octava',
      coachingTip: 'Sostenida junto al Pedal C crea el acorde Cmaj7 nostálgico; o súbela 1 semitono para resolver en C.',
    },
  };

  return {
    semitonesFromPedal: semi,
    ...table[semi],
  };
}

/**
 * Spanish Lyric & Poetic Meter Analyzer (Syllables, Sinalefa & Final Stress Rule)
 */
export interface LyricLineAnalysis {
  text: string;
  wordCount: number;
  grammaticalSyllables: number;
  sinalefas: number;
  stressType: 'Aguda (+1)' | 'Grave / Llana (=)' | 'Esdrújula (-1)' | 'Vacío';
  metricSyllables: number;
  rhymeKeyAssonant: string;
  rhymeKeyConsonant: string;
}

const VOWEL_RE = /[aeiouáéíóúü]/i;
const STRONG_VOWEL_RE = /[aeoáéíóú]/i;

export function countWordSyllablesSpanish(rawWord: string): {
  syllables: number;
  startsWithVowelSound: boolean;
  endsWithVowelSound: boolean;
  stressAdjustment: number;
  stressLabel: 'Aguda (+1)' | 'Grave / Llana (=)' | 'Esdrújula (-1)';
} {
  const clean = rawWord
    .toLowerCase()
    .replace(/[^a-záéíóúüñ]/g, '');
  if (!clean) {
    return {
      syllables: 0,
      startsWithVowelSound: false,
      endsWithVowelSound: false,
      stressAdjustment: 0,
      stressLabel: 'Grave / Llana (=)',
    };
  }

  // Strip silent leading 'h' for vowel-sound check (sinalefa)
  const phonetic = clean.replace(/^h/, '');
  const startsWithVowelSound =
    VOWEL_RE.test(phonetic[0] || '') || (phonetic === 'y');
  const lastChar = clean[clean.length - 1] || '';
  const endsWithVowelSound = VOWEL_RE.test(lastChar) || lastChar === 'y';

  // Count vowel nuclei, separating hiatuses (two strong vowels together: a, e, o, or accented weak vowel í, ú)
  let syllables = 0;
  let i = 0;
  while (i < clean.length) {
    const ch = clean[i];
    if (VOWEL_RE.test(ch) || (ch === 'y' && i === clean.length - 1)) {
      syllables++;
      // Advance through diphthong/triphthong unless two strong vowels form a hiatus
      while (i + 1 < clean.length) {
        const curr = clean[i];
        const next = clean[i + 1];
        // Qu / Gu silent u before e/i
        if ((curr === 'u') && i > 0 && (clean[i - 1] === 'q' || clean[i - 1] === 'g') && /[eiéí]/.test(next)) {
          i++;
          continue;
        }
        if (VOWEL_RE.test(next)) {
          const bothStrong = STRONG_VOWEL_RE.test(curr) && STRONG_VOWEL_RE.test(next);
          if (bothStrong) {
            // Hiatus -> separate syllable!
            break;
          }
          i++;
        } else {
          break;
        }
      }
    }
    i++;
  }
  syllables = Math.max(1, syllables);

  // Determine Spanish stress rule (Aguda +1, Grave 0, Esdrújula -1)
  let stressAdjustment = 0;
  let stressLabel: 'Aguda (+1)' | 'Grave / Llana (=)' | 'Esdrújula (-1)' = 'Grave / Llana (=)';

  const accentMatch = clean.match(/[áéíóú]/);
  if (accentMatch && accentMatch.index !== undefined) {
    const afterAccent = clean.slice(accentMatch.index + 1);
    const vowelsAfter = (afterAccent.match(/[aeiouáéíóúü]/g) || []).length;
    if (vowelsAfter === 0) {
      stressAdjustment = 1;
      stressLabel = 'Aguda (+1)';
    } else if (vowelsAfter >= 2) {
      stressAdjustment = -1;
      stressLabel = 'Esdrújula (-1)';
    }
  } else if (syllables === 1) {
    stressAdjustment = 1;
    stressLabel = 'Aguda (+1)';
  } else if (!/[aeiouns]$/.test(clean)) {
    // Words without tilde ending in consonant other than n/s are Agudas
    stressAdjustment = 1;
    stressLabel = 'Aguda (+1)';
  }

  return {
    syllables,
    startsWithVowelSound,
    endsWithVowelSound,
    stressAdjustment,
    stressLabel,
  };
}

export function analyzeSpanishLyricLine(line: string): LyricLineAnalysis {
  const words = line
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]/g, ''))
    .filter(Boolean);

  if (words.length === 0) {
    return {
      text: line,
      wordCount: 0,
      grammaticalSyllables: 0,
      sinalefas: 0,
      stressType: 'Vacío',
      metricSyllables: 0,
      rhymeKeyAssonant: '—',
      rhymeKeyConsonant: '—',
    };
  }

  const analyzed = words.map((w) => countWordSyllablesSpanish(w));
  const grammaticalSyllables = analyzed.reduce((acc, item) => acc + item.syllables, 0);

  let sinalefas = 0;
  for (let i = 0; i < analyzed.length - 1; i++) {
    if (analyzed[i].endsWithVowelSound && analyzed[i + 1].startsWithVowelSound) {
      sinalefas++;
    }
  }

  const lastWordInfo = analyzed[analyzed.length - 1];
  const metricSyllables = Math.max(
    1,
    grammaticalSyllables - sinalefas + lastWordInfo.stressAdjustment
  );

  const lastRaw = words[words.length - 1]
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const vowelsOnly = (lastRaw.match(/[aeiou]/g) || []).slice(-2).join('-');
  const tailConsonant = lastRaw.slice(-3);

  return {
    text: line,
    wordCount: words.length,
    grammaticalSyllables,
    sinalefas,
    stressType: lastWordInfo.stressLabel,
    metricSyllables,
    rhymeKeyAssonant: vowelsOnly || lastRaw,
    rhymeKeyConsonant: tailConsonant,
  };
}

/**
 * Pitch Acuity Test Logic (Unison, Semitone, Whole Tone, Microtonal Cents)
 */
export type AcuityDifficulty = 'basic' | 'intermediate' | 'microtonal';

export interface PitchAcuityRound {
  baseMidi: number;
  baseHz: number;
  secondHz: number;
  deltaSemitones: number; // e.g., 0, 1, -1, 2, -2, 0.25 (+25 cents), -0.25 (-25 cents)
  correctCategory: 'same' | 'semitone_up' | 'semitone_down' | 'tone_up' | 'tone_down' | 'micro_sharp' | 'micro_flat';
  label: string;
}

export function createPitchAcuityRound(
  difficulty: AcuityDifficulty,
  seedIndex: number
): PitchAcuityRound {
  const baseMidis = [57, 60, 62, 64, 67, 69];
  const baseMidi = baseMidis[Math.abs(seedIndex) % baseMidis.length];
  const baseHz = midiToHz(baseMidi);

  const basicOptions: {
    delta: number;
    cat: PitchAcuityRound['correctCategory'];
    label: string;
  }[] = [
    { delta: 0, cat: 'same', label: 'Misma Altura Exacta (Unísono · 0 ST)' },
    { delta: 1, cat: 'semitone_up', label: 'Semitono Más Agudo (+1 ST)' },
    { delta: -1, cat: 'semitone_down', label: 'Semitono Más Grave (-1 ST)' },
    { delta: 2, cat: 'tone_up', label: 'Tono Completo Más Agudo (+2 ST)' },
    { delta: -2, cat: 'tone_down', label: 'Tono Completo Más Grave (-2 ST)' },
  ];

  const microOptions: {
    delta: number;
    cat: PitchAcuityRound['correctCategory'];
    label: string;
  }[] = [
    { delta: 0, cat: 'same', label: 'Afinación Exacta (0 cents)' },
    { delta: 0.25, cat: 'micro_sharp', label: 'Microtono Alto (+25 cents · 1/4 de tono arriba)' },
    { delta: -0.25, cat: 'micro_flat', label: 'Microtono Bajo (-25 cents · 1/4 de tono abajo)' },
    { delta: 1, cat: 'semitone_up', label: 'Semitono Completo Arriba (+100 cents)' },
    { delta: -1, cat: 'semitone_down', label: 'Semitono Completo Abajo (-100 cents)' },
  ];

  const pool = difficulty === 'microtonal' ? microOptions : basicOptions;
  const pick = pool[Math.abs(seedIndex) % pool.length];
  const secondHz = baseHz * Math.pow(2, pick.delta / 12);

  return {
    baseMidi,
    baseHz,
    secondHz,
    deltaSemitones: pick.delta,
    correctCategory: pick.cat,
    label: pick.label,
  };
}

/**
 * Simon Musical Pattern Verification Logic
 */
export interface SimonStepResult {
  status: 'continue' | 'level_complete' | 'wrong';
  matchedCount: number;
  expectedMidi: number;
}

export function verifySimonStep(
  sequence: number[],
  currentStepIndex: number,
  playedMidi: number
): SimonStepResult {
  const expectedMidi = sequence[currentStepIndex];
  if (playedMidi !== expectedMidi) {
    return {
      status: 'wrong',
      matchedCount: currentStepIndex,
      expectedMidi,
    };
  }
  const nextCount = currentStepIndex + 1;
  if (nextCount >= sequence.length) {
    return {
      status: 'level_complete',
      matchedCount: nextCount,
      expectedMidi,
    };
  }
  return {
    status: 'continue',
    matchedCount: nextCount,
    expectedMidi,
  };
}

/**
 * Enharmonic Golden Rule: Spells any 7-note diatonic scale using each letter C-D-E-F-G-A-B strictly once.
 */
export interface EnharmonicScaleResult {
  rootLabel: string;
  notes: string[];
  enharmonicTwin: string;
  usesFlats: boolean;
  explanation: string;
}

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
const LETTER_NATURAL_PCS = [0, 2, 4, 5, 7, 9, 11] as const;

const FLAT_ROOT_NAMES: Record<number, string> = {
  0: 'C', 1: 'Db', 2: 'D', 3: 'Eb', 4: 'E', 5: 'F',
  6: 'Gb', 7: 'G', 8: 'Ab', 9: 'A', 10: 'Bb', 11: 'B',
};

const SHARP_ROOT_NAMES: Record<number, string> = {
  0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E', 5: 'F',
  6: 'F#', 7: 'G', 8: 'G#', 9: 'A', 10: 'A#', 11: 'B',
};

function spellPitchForLetter(targetPc: number, letterIndex: number): string {
  const natPc = LETTER_NATURAL_PCS[letterIndex];
  let diff = (targetPc - natPc + 12) % 12;
  if (diff > 6) diff -= 12;
  const letter = LETTERS[letterIndex];
  if (diff === 0) return letter;
  if (diff === 1) return `${letter}#`;
  if (diff === 2) return `${letter}##`;
  if (diff === -1) return `${letter}b`;
  if (diff === -2) return `${letter}bb`;
  return SHARP_ROOT_NAMES[((targetPc % 12) + 12) % 12];
}

export function applyEnharmonicGoldenRule(
  rootPcInput: number,
  scaleOffsets: number[] = [0, 2, 4, 5, 7, 9, 11],
  preferFlats?: boolean
): EnharmonicScaleResult {
  const rootPc = ((rootPcInput % 12) + 12) % 12;
  // Default conventional key signature preference if not explicitly specified
  const defaultFlatRoots = new Set([1, 3, 5, 6, 8, 10]); // Db, Eb, F, Gb, Ab, Bb
  const useFlats = preferFlats !== undefined ? preferFlats : defaultFlatRoots.has(rootPc);

  // Pick starting letter for rootPc
  let startLetterIdx = LETTER_NATURAL_PCS.indexOf(rootPc as 0 | 2 | 4 | 5 | 7 | 9 | 11);
  if (startLetterIdx === -1) {
    // Accidental root: choose upper natural letter if flat, lower natural letter if sharp
    const adjPc = useFlats ? (rootPc + 1) % 12 : (rootPc + 11) % 12;
    startLetterIdx = LETTER_NATURAL_PCS.indexOf(adjPc as 0 | 2 | 4 | 5 | 7 | 9 | 11);
    if (startLetterIdx === -1) startLetterIdx = 0;
  }

  const rootLabel = spellPitchForLetter(rootPc, startLetterIdx);
  const notes = scaleOffsets.map((offset, stepIdx) => {
    const pc = (rootPc + offset) % 12;
    if (scaleOffsets.length === 7) {
      return spellPitchForLetter(pc, (startLetterIdx + stepIdx) % 7);
    }
    return useFlats ? FLAT_ROOT_NAMES[pc] : SHARP_ROOT_NAMES[pc];
  });

  const twin =
    SHARP_ROOT_NAMES[rootPc] !== FLAT_ROOT_NAMES[rootPc]
      ? `${SHARP_ROOT_NAMES[rootPc]} ↔ ${FLAT_ROOT_NAMES[rootPc]}`
      : `${rootLabel} (sin enarmonía común)`;

  const explanation =
    scaleOffsets.length === 7
      ? `Regla de Oro aplicada desde ${rootLabel}: cada una de las 7 letras (C–D–E–F–G–A–B) aparece exactamente una vez (${notes.join(' – ')}) sin repetir ni saltar letras.`
      : `Ortografía cromática aplicada desde ${rootLabel}: ${notes.join(' – ')}.`;

  return {
    rootLabel,
    notes,
    enharmonicTwin: twin,
    usesFlats: useFlats,
    explanation,
  };
}

/**
 * Nashville Number System Converter & Transposer
 */
export interface NashvilleChordInput {
  rootPc: number;
  quality: 'maj' | 'min' | 'dim' | 'dom7' | 'maj7' | 'm7';
}

export interface NashvilleChordOutput {
  nashville: string;
  originalSymbol: string;
  transposedSymbol: string;
}

const ACCIDENTAL_ROMAN_NASHVILLE: Record<number, string> = {
  0: '1',
  1: 'b2',
  2: '2',
  3: 'b3',
  4: '3',
  5: '4',
  6: '#4',
  7: '5',
  8: 'b6',
  9: '6',
  10: 'b7',
  11: '7',
};

function qualitySuffix(q: NashvilleChordInput['quality']): string {
  if (q === 'min') return 'm';
  if (q === 'dim') return '°';
  if (q === 'dom7') return '7';
  if (q === 'maj7') return 'maj7';
  if (q === 'm7') return 'm7';
  return '';
}

export function convertProgressionToNashville(
  keyPcInput: number,
  chords: NashvilleChordInput[],
  targetKeyPcInput?: number
): NashvilleChordOutput[] {
  const keyPc = ((keyPcInput % 12) + 12) % 12;
  const targetKeyPc = targetKeyPcInput !== undefined ? ((targetKeyPcInput % 12) + 12) % 12 : keyPc;
  const origFlat = new Set([1, 3, 5, 6, 8, 10]).has(keyPc);
  const targFlat = new Set([1, 3, 5, 6, 8, 10]).has(targetKeyPc);

  return chords.map((ch) => {
    const cRoot = ((ch.rootPc % 12) + 12) % 12;
    const interval = (cRoot - keyPc + 12) % 12;
    const deg = ACCIDENTAL_ROMAN_NASHVILLE[interval] || '1';
    const suf = qualitySuffix(ch.quality);
    const nashville = `${deg}${suf}`;

    const origName = origFlat ? FLAT_ROOT_NAMES[cRoot] : SHARP_ROOT_NAMES[cRoot];
    const transposedRoot = (targetKeyPc + interval) % 12;
    const targName = targFlat ? FLAT_ROOT_NAMES[transposedRoot] : SHARP_ROOT_NAMES[transposedRoot];

    return {
      nashville,
      originalSymbol: `${origName}${suf}`,
      transposedSymbol: `${targName}${suf}`,
    };
  });
}

/**
 * 2, 3, and 4-Voice Diatonic Melody Harmonizer + Parallel 5th/8ve Checker
 */
export interface HarmonizedChordStep {
  melodyMidi: number;
  voices: number[]; // Sorted low -> high, ending on melodyMidi
  parallelFifthWarning: boolean;
  parallelOctaveWarning: boolean;
}

export function harmonizeMelodyVoices(
  melodyMidis: number[],
  keyPcInput: number,
  numVoices: 2 | 3 | 4,
  scaleOffsets: number[] = [0, 2, 4, 5, 7, 9, 11]
): HarmonizedChordStep[] {
  const keyPc = ((keyPcInput % 12) + 12) % 12;
  const scalePcs = scaleOffsets.map((o) => (keyPc + o) % 12);

  // Build sorted ascending pool of scale midis from 36 to 96
  const scalePool: number[] = [];
  for (let m = 36; m <= 96; m++) {
    if (scalePcs.includes(m % 12)) {
      scalePool.push(m);
    }
  }

  const findScaleStepIndex = (midi: number): number => {
    let bestIdx = 0;
    let bestDist = 999;
    scalePool.forEach((sm, idx) => {
      const d = Math.abs(sm - midi);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = idx;
      }
    });
    return bestIdx;
  };

  const results: HarmonizedChordStep[] = [];

  melodyMidis.forEach((melMidi, stepIdx) => {
    const topIdx = findScaleStepIndex(melMidi);
    let voices: number[];
    if (numVoices === 2) {
      // 2 voices: diatonic 3rd below (-2 scale steps)
      const lower = scalePool[Math.max(0, topIdx - 2)] ?? melMidi - 4;
      voices = [lower, melMidi];
    } else if (numVoices === 3) {
      // 3 voices: closed triad (-4 and -2 scale steps)
      const thirdBelow = scalePool[Math.max(0, topIdx - 2)] ?? melMidi - 4;
      const fifthBelow = scalePool[Math.max(0, topIdx - 4)] ?? melMidi - 7;
      voices = [fifthBelow, thirdBelow, melMidi];
    } else {
      // 4 voices: Drop 2 style open spread (-9, -4, -2 scale steps)
      const secondFromTop = scalePool[Math.max(0, topIdx - 2)] ?? melMidi - 4;
      const thirdFromTop = scalePool[Math.max(0, topIdx - 4)] ?? melMidi - 7;
      const bass = scalePool[Math.max(0, topIdx - 9)] ?? melMidi - 16;
      voices = [bass, thirdFromTop, secondFromTop, melMidi];
    }

    let parallelFifthWarning = false;
    let parallelOctaveWarning = false;

    if (stepIdx > 0) {
      const prev = results[stepIdx - 1].voices;
      const len = Math.min(prev.length, voices.length);
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const prevInt = (prev[j] - prev[i]) % 12;
          const currInt = (voices[j] - voices[i]) % 12;
          const moved = prev[i] !== voices[i] && prev[j] !== voices[j];
          if (moved && prevInt === 7 && currInt === 7) {
            parallelFifthWarning = true;
          }
          if (moved && prevInt === 0 && currInt === 0) {
            parallelOctaveWarning = true;
          }
        }
      }
    }

    results.push({
      melodyMidi: melMidi,
      voices,
      parallelFifthWarning,
      parallelOctaveWarning,
    });
  });

  return results;
}

/**
 * Gap Click Internal Tempo Timing Evaluator
 */
export interface GapClickTimingResult {
  deltaMs: number; // Negative = early, Positive = late
  absErrorMs: number;
  verdict: 'En el bolsillo (±25 ms)' | 'Levemente adelantado' | 'Levemente atrasado' | 'Fuera de tiempo';
}

export function evaluateGapClickTiming(
  beatIntervalMs: number,
  tapElapsedMs: number
): GapClickTimingResult {
  const safeInterval = Math.max(150, beatIntervalMs);
  const nearestBeat = Math.round(tapElapsedMs / safeInterval) * safeInterval;
  const deltaMs = Math.round(tapElapsedMs - nearestBeat);
  const absErrorMs = Math.abs(deltaMs);

  let verdict: GapClickTimingResult['verdict'] = 'Fuera de tiempo';
  if (absErrorMs <= 25) {
    verdict = 'En el bolsillo (±25 ms)';
  } else if (absErrorMs <= 75) {
    verdict = deltaMs < 0 ? 'Levemente adelantado' : 'Levemente atrasado';
  }

  return { deltaMs, absErrorMs, verdict };
}

export interface ScaleFretStep {
  sIdx: number;
  fret: number;
  midi: number;
}

/**
 * Computes a comfortable ascending 1-octave scale path on a stringed instrument neck,
 * mapping each scale step to exactly ONE (string, fret, midi) position so scale playback
 * illuminates only the single note currently sounding.
 */
export function buildScaleFretboardPath(
  openMidisHighToLow: number[],
  rootPc: number,
  intervals: number[],
  maxFret = 12
): ScaleFretStep[] {
  if (openMidisHighToLow.length === 0 || intervals.length === 0) return [];

  const lowestOpen = openMidisHighToLow[openMidisHighToLow.length - 1];
  const highestOpen = openMidisHighToLow[0];
  const minPlayable = lowestOpen;
  const maxPlayable = highestOpen + maxFret;

  // Choose a comfortable starting octave root MIDI in the lower half of the neck
  let startRootMidi = lowestOpen + ((rootPc - (lowestOpen % 12) + 12) % 12);
  if (startRootMidi + 12 > maxPlayable) {
    startRootMidi = Math.max(minPlayable, startRootMidi - 12);
  }

  const semitoneSteps = [...intervals, 12];
  const path: ScaleFretStep[] = [];
  let prevFret = 2;

  for (const semi of semitoneSteps) {
    const targetMidi = startRootMidi + semi;
    const candidates: { sIdx: number; fret: number; score: number }[] = [];

    openMidisHighToLow.forEach((openMidi, sIdx) => {
      const fret = targetMidi - openMidi;
      if (fret >= 0 && fret <= maxFret) {
        // Prefer lower-to-mid frets (0..7) and minimal hand jump from previous fret
        const stretchPenalty = Math.abs(fret - prevFret);
        const openBonus = fret === 0 ? -0.3 : 0;
        const highFretPenalty = fret > 7 ? (fret - 7) * 1.5 : 0;
        candidates.push({
          sIdx,
          fret,
          score: stretchPenalty + highFretPenalty + openBonus,
        });
      }
    });

    if (candidates.length > 0) {
      candidates.sort((a, b) => a.score - b.score || b.sIdx - a.sIdx);
      const best = candidates[0];
      prevFret = best.fret === 0 ? prevFret : best.fret;
      path.push({ sIdx: best.sIdx, fret: best.fret, midi: targetMidi });
    } else {
      path.push({ sIdx: 0, fret: 0, midi: targetMidi });
    }
  }

  return path;
}

export interface ChordFretPos {
  sIdx: number;
  fret: number;
  midi: number;
}

/**
 * Resolves a chord's MIDI notes to ONE idiomatic, compact playable voicing on a guitar or bass neck
 * (preferring standard open voicings when available, else compact 4-fret movable boxes),
 * never scattering duplicate unisons/octaves across all 12 frets.
 */
export function resolvePlayableChordVoicing(
  midiNotes: number[],
  openMidisHighToLow: number[],
  maxFret = 12
): ChordFretPos[] {
  const numStrings = openMidisHighToLow.length;
  if (midiNotes.length === 0 || numStrings === 0) return [];

  const sortedMidis = [...midiNotes].map((m) => Math.round(m)).sort((a, b) => a - b);
  const bassPc = ((sortedMidis[0] % 12) + 12) % 12;
  const fifthPc = (bassPc + 7) % 12;
  const chordPcs = [...new Set(sortedMidis.map((m) => ((m % 12) + 12) % 12))];
  const chordPcSet = new Set(chordPcs);
  const isBassNeck = numStrings <= 4;

  interface WinSpec {
    winMin: number;
    winMax: number;
    allowOpen: boolean;
  }

  const windows: WinSpec[] = [{ winMin: 1, winMax: Math.min(4, maxFret), allowOpen: true }];
  for (let w = 1; w <= Math.max(1, maxFret - 3); w++) {
    windows.push({ winMin: w, winMax: Math.min(maxFret, w + 3), allowOpen: false });
  }

  let bestScore = -1e9;
  let bestResult: ChordFretPos[] = [];

  for (const win of windows) {
    const getValidFrets = (sIdx: number): number[] => {
      const openM = openMidisHighToLow[sIdx];
      const list: number[] = [];
      for (let f = 0; f <= maxFret; f++) {
        const inWin = (f === 0 && win.allowOpen) || (f >= win.winMin && f <= win.winMax);
        if (!inWin) continue;
        if (chordPcSet.has((openM + f) % 12)) {
          list.push(f);
        }
      }
      return list;
    };

    const minBassString = Math.min(numStrings - 1, isBassNeck ? 1 : 2);
    for (let bassSIdx = numStrings - 1; bassSIdx >= minBassString; bassSIdx--) {
      const bassFrets = getValidFrets(bassSIdx).filter(
        (f) => (openMidisHighToLow[bassSIdx] + f) % 12 === bassPc
      );
      if (bassFrets.length === 0) continue;

      for (const bassFret of bassFrets) {
        const bassMidi = openMidisHighToLow[bassSIdx] + bassFret;
        const perStringOptions: (number | null)[][] = [];

        for (let s = bassSIdx - 1; s >= 0; s--) {
          const valid = getValidFrets(s);
          if (valid.length === 0) {
            perStringOptions.push([null]);
          } else {
            // Allow muting strings (e.g. A-string skip in 6th-string jazz grips like 3-x-3-4-5-x, or high strings)
            perStringOptions.push([...valid, null]);
          }
        }

        const combos: ChordFretPos[][] = [[]];
        for (let idx = 0; idx < perStringOptions.length; idx++) {
          const sIdx = bassSIdx - 1 - idx;
          const opts = perStringOptions[idx];
          const nextCombos: ChordFretPos[][] = [];
          for (const prev of combos) {
            for (const f of opts) {
              if (f === null) {
                nextCombos.push(prev);
              } else {
                nextCombos.push([
                  ...prev,
                  { sIdx, fret: f, midi: openMidisHighToLow[sIdx] + f },
                ]);
              }
            }
          }
          combos.splice(0, combos.length, ...nextCombos.slice(0, 2000));
        }

        for (const upper of combos) {
          const voicing: ChordFretPos[] = [
            { sIdx: bassSIdx, fret: bassFret, midi: bassMidi },
            ...upper,
          ];
          if (isBassNeck && voicing.length > 3) continue;
          if (!isBassNeck && chordPcs.length >= 3 && voicing.length < 3) continue;

          const coveredPcs = new Set(voicing.map((v) => v.midi % 12));
          const nonZeroFrets = voicing.filter((v) => v.fret > 0).map((v) => v.fret);
          const span =
            nonZeroFrets.length > 1
              ? Math.max(...nonZeroFrets) - Math.min(...nonZeroFrets)
              : 0;
          if (span > 4) continue;

          // Evaluate interior muted-string gaps between lowest sounded string (bassSIdx) and highest sounded string
          const highestSoundedSIdx = Math.min(...voicing.map((v) => v.sIdx));
          const soundedSet = new Set(voicing.map((v) => v.sIdx));
          let interiorHoles = 0;
          let onlyBassSkipHole = false;
          for (let s = bassSIdx - 1; s > highestSoundedSIdx; s--) {
            if (!soundedSet.has(s)) {
              interiorHoles++;
              if (s === bassSIdx - 1 && bassSIdx >= 4 && interiorHoles === 1) {
                onlyBassSkipHole = true;
              } else {
                onlyBassSkipHole = false;
              }
            }
          }

          let score = coveredPcs.size * 1000;
          // Prioritize non-5th color tones (3rds, 7ths, 9ths, 13ths, alterations) over the 5th
          let essentialCount = 0;
          coveredPcs.forEach((pc) => {
            if (pc !== bassPc && pc !== fifthPc) essentialCount++;
          });
          score += essentialCount * 180;

          // Ergonomics & span scoring
          score += voicing.length * 18;
          const avgFret =
            voicing.reduce((sum, v) => sum + v.fret, 0) / Math.max(1, voicing.length);
          score -= avgFret * 9;
          score -= span * 15;
          if (span === 4 && win.winMin > 1) {
            score -= 35;
          }

          if (interiorHoles > 0) {
            if (onlyBassSkipHole) {
              // Standard thumb/index muted 5th-string jazz grip (e.g. 3-x-3-4-5-x, 5-x-5-6-6-5)
              score -= 8;
            } else {
              score -= interiorHoles * 180;
            }
          }

          if (win.allowOpen) {
            score += 24;
            score += voicing.filter((v) => v.fret === 0).length * 8;
          }
          // Prefer root on deeper string (6th or 5th) when available cleanly
          score += bassSIdx * 4;

          // Avoid muddy low 3rds in bottom register (e.g. F2-A2 <= 45), while allowing standard G2-B2 (47)
          for (let i = 1; i < voicing.length; i++) {
            const diff = voicing[i].midi - voicing[i - 1].midi;
            if (diff <= 0) score -= 45;
            if (voicing[i].midi <= 45 && diff < 5) {
              score -= 90;
            }
            if (voicing[i].midi <= 54 && diff <= 2) {
              score -= 40;
            }
          }

          if (!isBassNeck) {
            const fingerCheck = assignGuitarChordFingers(voicing, true);
            if (!fingerCheck.playable) {
              score -= 5000;
            }
          }

          if (score > bestScore) {
            bestScore = score;
            bestResult = voicing;
          }
        }
      }
    }
  }

  return bestResult;
}

export type GlowModeKind = 'idle' | 'note' | 'chord';

export interface LatchedGlowEntry {
  midi: number;
  isChord?: boolean;
  chordGroup?: number;
  chordBatch?: number[];
  sIdx?: number;
  fret?: number;
  scopeId?: string;
}

export interface LatchedGlowState<T extends LatchedGlowEntry = LatchedGlowEntry> {
  kind: GlowModeKind;
  entries: T[];
}

/**
 * Pure latched highlight reducer:
 * - Single notes replace any prior highlight and stay latched until another event or Stop (null).
 * - Atomic chordBatch events replace any prior highlight in a single state transition (zero strum flicker).
 * - Grouped chord notes matching `chordGroup` accumulate safely, and Stop (null) resets to idle.
 */
export function reduceLatchGlowState<T extends LatchedGlowEntry>(
  state: LatchedGlowState<T>,
  ev: T | null
): LatchedGlowState<T> {
  if (!ev) {
    return { kind: 'idle', entries: [] };
  }

  const normalized = { ...ev, midi: Math.round(ev.midi) };

  if (normalized.chordBatch && normalized.chordBatch.length > 0) {
    const batchMidis = [...new Set(normalized.chordBatch.map((m) => Math.round(m)))];
    return {
      kind: 'chord',
      entries: batchMidis.map((m) => ({
        ...normalized,
        midi: m,
        isChord: true,
        chordBatch: undefined,
      })),
    };
  }

  if (!normalized.isChord) {
    return {
      kind: 'note',
      entries: [normalized],
    };
  }

  const sameGroup =
    normalized.chordGroup !== undefined
      ? state.entries.filter(
          (entry) => entry.isChord && entry.chordGroup === normalized.chordGroup
        )
      : state.kind === 'chord'
        ? state.entries
        : [];

  return {
    kind: 'chord',
    entries: [...sameGroup, normalized],
  };
}

export interface ChordDiagramDef {
  id: string;
  name: string;
  symbol: string;
  intervals: number[];
  formula: string;
  character: string;
}

export const CHORD_DIAGRAM_CATALOG: ChordDiagramDef[] = [
  {
    id: 'maj',
    name: 'Mayor',
    symbol: '',
    intervals: [0, 4, 7],
    formula: '1 - 3 - 5',
    character: 'Estable, luminoso y afirmativo.',
  },
  {
    id: 'min',
    name: 'Menor',
    symbol: 'm',
    intervals: [0, 3, 7],
    formula: '1 - b3 - 5',
    character: 'Melancólico, serio e íntimo.',
  },
  {
    id: 'maj7',
    name: 'Maj7 (Séptima Mayor)',
    symbol: 'Maj7',
    intervals: [0, 4, 7, 11],
    formula: '1 - 3 - 5 - 7',
    character: 'Sofisticado, cálido y cinematográfico.',
  },
  {
    id: '7',
    name: 'Dominante 7',
    symbol: '7',
    intervals: [0, 4, 7, 10],
    formula: '1 - 3 - 5 - b7',
    character: 'Contiene el tritono (3 y b7); pide resolver a la tónica.',
  },
  {
    id: 'm7',
    name: 'Menor 7 (m7)',
    symbol: 'm7',
    intervals: [0, 3, 7, 10],
    formula: '1 - b3 - 5 - b7',
    character: 'Fluido y urbano; pilar del soul, funk y ii–V–I.',
  },
  {
    id: 'm7b5',
    name: 'Semidisminuido (m7b5)',
    symbol: 'm7b5',
    intervals: [0, 3, 6, 10],
    formula: '1 - b3 - b5 - b7',
    character: 'Tensión poética; grado ii del modo menor.',
  },
  {
    id: 'dim7',
    name: 'Disminuido 7 (dim7)',
    symbol: 'dim7',
    intervals: [0, 3, 6, 9],
    formula: '1 - b3 - b5 - bb7',
    character: 'Simétrico por terceras menores; puente modulante.',
  },
  {
    id: 'mMaj7',
    name: 'Menor (Maj7)',
    symbol: 'm(Maj7)',
    intervals: [0, 3, 7, 11],
    formula: '1 - b3 - 5 - 7',
    character: 'Misterioso, cine noir y color menor melódico.',
  },
  {
    id: 'mMaj9',
    name: 'Menor (Maj9) — "James Bond"',
    symbol: 'm(Maj9)',
    intervals: [0, 3, 7, 11, 14],
    formula: '1 - b3 - 5 - 7 - 9',
    character: 'Cinemático, espionaje clásico (007) y menor melódico nocturno.',
  },
  {
    id: 'add9',
    name: 'Mayor add9',
    symbol: 'add9',
    intervals: [0, 4, 7, 14],
    formula: '1 - 3 - 5 - 9',
    character: 'Abierto y acústico sin densidad de séptima.',
  },
  {
    id: '9',
    name: 'Dominante 9',
    symbol: '9',
    intervals: [0, 4, 7, 10, 14],
    formula: '1 - 3 - 5 - b7 - 9',
    character: 'Funk, blues y soul con novena mayor brillante.',
  },
  {
    id: '7#9',
    name: 'Dominante 7(#9) — "Hendrix"',
    symbol: '7(#9)',
    intervals: [0, 4, 7, 10, 15],
    formula: '1 - 3 - 5 - b7 - #9',
    character: 'Disonancia eléctrica agresiva (#9 sobre 3M) emblema del blues-rock.',
  },
  {
    id: '7b9',
    name: 'Dominante 7b9',
    symbol: '7b9',
    intervals: [0, 4, 7, 10, 13],
    formula: '1 - 3 - 5 - b7 - b9',
    character: 'Alta tensión hacia acordes menores (bolero, flamenco, jazz).',
  },
  {
    id: 'sus4',
    name: 'Suspendido 4 (sus4)',
    symbol: 'sus4',
    intervals: [0, 5, 7],
    formula: '1 - 4 - 5',
    character: 'Expectante; la 4ª pide resolver hacia la 3ª.',
  },
  {
    id: 'sus2',
    name: 'Suspendido 2 (sus2)',
    symbol: 'sus2',
    intervals: [0, 2, 7],
    formula: '1 - 2 - 5',
    character: 'Moderno, cristalino y sin género mayor/menor.',
  },
];

export interface ScaleGuideDef {
  id: string;
  name: string;
  intervals: number[];
  charOffsets: number[];
  formula: string;
}

export const SCALE_GUIDE_CATALOG: ScaleGuideDef[] = [
  {
    id: 'major',
    name: 'Escala Mayor (Jónica)',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    charOffsets: [11],
    formula: '1 - 2 - 3 - 4 - 5 - 6 - 7',
  },
  {
    id: 'minor',
    name: 'Menor Natural (Eólica)',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    charOffsets: [8],
    formula: '1 - 2 - b3 - 4 - 5 - b6 - b7',
  },
  {
    id: 'pent_minor',
    name: 'Pentatónica Menor',
    intervals: [0, 3, 5, 7, 10],
    charOffsets: [],
    formula: '1 - b3 - 4 - 5 - b7',
  },
  {
    id: 'dorian',
    name: 'Modo Dórico',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    charOffsets: [9],
    formula: '1 - 2 - b3 - 4 - 5 - 6 - b7',
  },
  {
    id: 'mixolydian',
    name: 'Modo Mixolidio',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    charOffsets: [10],
    formula: '1 - 2 - 3 - 4 - 5 - 6 - b7',
  },
  {
    id: 'lydian',
    name: 'Modo Lidio',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    charOffsets: [6],
    formula: '1 - 2 - 3 - #4 - 5 - 6 - 7',
  },
  {
    id: 'none',
    name: 'Solo Notas del Acorde',
    intervals: [],
    charOffsets: [],
    formula: 'Sin escala superpuesta',
  },
];

export interface ChordNeckComputation {
  rootPc: number;
  chord: ChordDiagramDef;
  scaleGuide: ScaleGuideDef;
  chordTitle: string;
  chordNoteNames: string[];
  chordMidis: number[];
  chordPositions: ChordFretPos[];
  chordFingers: GuitarFingerPos[];
  barreFret: number | null;
  scalePitchClasses: number[];
  charPitchClasses: number[];
  tabSummary: string;
  fingerSummary: string;
}

export interface GuitarFingerPos extends ChordFretPos {
  finger: 0 | 1 | 2 | 3 | 4;
}

const KNOWN_OPEN_GUITAR_FINGERS: Record<string, (0 | 1 | 2 | 3 | 4 | -1)[]> = {
  // Format [6th(E), 5th(A), 4th(D), 3rd(G), 2nd(B), 1st(e)]
  '-1,3,2,0,1,0': [-1, 3, 2, 0, 1, 0],     // C
  '-1,3,2,0,0,0': [-1, 3, 2, 0, 0, 0],     // Cmaj7
  '-1,3,2,3,1,0': [-1, 3, 2, 4, 1, 0],     // C7
  '-1,3,2,4,3,0': [-1, 2, 1, 4, 3, 0],     // Cmaj9
  '-1,3,2,3,3,3': [-1, 2, 1, 3, 3, 3],     // C9 (mini-barre finger 3 on top 3 strings)
  '3,2,0,0,0,3': [2, 1, 0, 0, 0, 3],       // G
  '3,2,0,0,3,3': [2, 1, 0, 0, 3, 4],       // G (4-finger)
  '3,2,0,0,0,1': [3, 2, 0, 0, 0, 1],       // G7
  '3,2,0,0,0,0': [2, 1, 0, 0, 0, 0],       // G6
  '3,2,3,0,0,0': [2, 1, 3, 0, 0, 0],       // G13
  '-1,10,9,11,10,-1': [-1, 2, 1, 4, 3, -1], // Gmaj9 jazz
  '-1,-1,0,2,3,2': [-1, -1, 0, 1, 3, 2],   // D
  '-1,-1,0,2,3,1': [-1, -1, 0, 2, 3, 1],   // Dm
  '-1,-1,0,2,1,2': [-1, -1, 0, 2, 1, 3],   // D7
  '-1,-1,0,2,1,1': [-1, -1, 0, 2, 1, 1],   // Dm7
  '-1,-1,0,2,2,2': [-1, -1, 0, 1, 2, 3],   // Dmaj7
  '-1,5,3,5,5,-1': [-1, 2, 1, 3, 4, -1],   // Dm9
  '-1,5,5,5,6,5': [-1, 1, 1, 1, 2, 1],     // Dm11 "So What" quartal
  '-1,0,2,2,2,0': [-1, 0, 1, 2, 3, 0],     // A
  '-1,0,2,2,1,0': [-1, 0, 2, 3, 1, 0],     // Am
  '-1,0,2,0,1,0': [-1, 0, 2, 0, 1, 0],     // Am7
  '-1,0,2,0,2,0': [-1, 0, 1, 0, 2, 0],     // A7
  '-1,0,2,1,2,0': [-1, 0, 2, 1, 3, 0],     // Am(maj7)
  '-1,0,2,2,2,2': [-1, 0, 1, 1, 1, 1],     // A6 (partial barre)
  '0,2,2,1,0,0': [0, 2, 3, 1, 0, 0],       // E
  '0,2,2,0,0,0': [0, 2, 3, 0, 0, 0],       // Em
  '0,2,0,1,0,0': [0, 2, 0, 1, 0, 0],       // E7
  '0,2,0,0,0,0': [0, 2, 0, 0, 0, 0],       // Em7
  '0,2,1,0,0,0': [0, 2, 1, 0, 0, 0],       // Em(maj7)
  '0,2,1,0,0,2': [0, 2, 1, 0, 0, 3],       // Em(maj9) James Bond (3 fingers!)
  '0,10,9,8,7,-1': [0, 4, 3, 2, 1, -1],    // Em(maj9) James Bond Classic Vic Flick
  '0,7,6,7,8,0': [0, 2, 1, 3, 4, 0],       // E7#9 Hendrix
  '-1,-1,3,2,1,0': [-1, -1, 3, 2, 1, 0],   // Fmaj7
  '-1,2,1,2,0,2': [-1, 2, 1, 3, 0, 4],     // B7
  '-1,2,4,4,4,2': [-1, 1, 3, 3, 3, 1],     // B barre
  '1,3,3,2,1,1': [1, 3, 4, 2, 1, 1],       // F barre
  '1,3,3,1,1,1': [1, 3, 4, 1, 1, 1],       // Fm barre
  '1,3,1,2,1,1': [1, 3, 1, 2, 1, 1],       // F7 barre
  '-1,2,4,4,3,2': [-1, 1, 3, 4, 2, 1],     // Bm barre
  '-1,2,4,2,3,2': [-1, 1, 3, 1, 2, 1],     // Bm7 barre
};

export interface GuitarFingerAssignmentResult {
  positions: GuitarFingerPos[];
  barreFret: number | null;
  fingersUsed: number;
  playable: boolean;
  warning?: string;
}

export function assignGuitarChordFingers(
  voicing: ChordFretPos[],
  isGuitar = true
): GuitarFingerAssignmentResult {
  if (!isGuitar || voicing.length === 0) {
    return {
      positions: voicing.map((v) => ({ ...v, finger: 0 })),
      barreFret: null,
      fingersUsed: 0,
      playable: true,
    };
  }

  // Build 6-string pattern low-to-high (sIdx 5 down to 0)
  const arr6: number[] = [-1, -1, -1, -1, -1, -1];
  let valid6 = true;
  for (const v of voicing) {
    const idxLow = 5 - v.sIdx;
    if (idxLow < 0 || idxLow > 5) {
      valid6 = false;
      break;
    }
    arr6[idxLow] = v.fret;
  }

  if (valid6) {
    const key = arr6.join(',');
    const known = KNOWN_OPEN_GUITAR_FINGERS[key];
    if (known) {
      let barreCandidate: number | null = null;
      const positiveFrets = arr6.filter((f) => f > 0);
      const minPos = positiveFrets.length > 0 ? Math.min(...positiveFrets) : 0;
      const f1Count = arr6.filter((f, idx) => f > 0 && f === minPos && known[idx] === 1).length;
      if (f1Count >= 2 && minPos > 0) barreCandidate = minPos;
      const usedSet = new Set(known.filter((f) => f > 0));
      return {
        positions: voicing.map((v) => {
          const f = known[5 - v.sIdx];
          const finger: 0 | 1 | 2 | 3 | 4 = f >= 1 && f <= 4 ? (f as 1 | 2 | 3 | 4) : 0;
          return { ...v, finger };
        }),
        barreFret: barreCandidate,
        fingersUsed: usedSet.size,
        playable: true,
      };
    }
  }

  const fretted = voicing.filter((v) => v.fret > 0);
  if (fretted.length === 0) {
    return {
      positions: voicing.map((v) => ({ ...v, finger: 0 })),
      barreFret: null,
      fingersUsed: 0,
      playable: true,
    };
  }

  const minFret = Math.min(...fretted.map((v) => v.fret));
  const maxFret = Math.max(...fretted.map((v) => v.fret));
  const stretch = maxFret - minFret;
  const atMin = fretted.filter((v) => v.fret === minFret);
  const higherFrets = fretted.filter((v) => v.fret > minFret);
  const openStrings = voicing.filter((v) => v.fret === 0);

  // Determine whether index finger (1) can legitimately barre at minFret:
  // Any open string must be strictly lower in pitch (higher sIdx, e.g. open 6th/5th bass)
  // than the barre's highest-numbered (lowest-pitched) string, OR there are no open strings.
  const barreMaxSIdx = atMin.length > 0 ? Math.max(...atMin.map((v) => v.sIdx)) : -1;
  const barreMinSIdx = atMin.length > 0 ? Math.min(...atMin.map((v) => v.sIdx)) : -1;
  const openBlocksBarre = openStrings.some((o) => o.sIdx < barreMaxSIdx);

  let barreFret: number | null = null;
  if (!openBlocksBarre && atMin.length >= 2) {
    // Allow full/partial index barre when either higher frets exist (classic barre) or >=3 adjacent strings share minFret
    if (higherFrets.length >= 1 && (barreMaxSIdx - barreMinSIdx >= 2 || atMin.length >= 3 || fretted.length > 4)) {
      barreFret = minFret;
    } else if (higherFrets.length === 0 && atMin.length >= 3) {
      barreFret = minFret;
    }
  }

  const fingerMap = new Map<string, 0 | 1 | 2 | 3 | 4>();
  voicing.forEach((v) => {
    if (v.fret === 0) fingerMap.set(`${v.sIdx}:${v.fret}`, 0);
  });

  let fingersRequired = 0;

  if (barreFret !== null) {
    atMin.forEach((v) => fingerMap.set(`${v.sIdx}:${v.fret}`, 1));
    const remaining = [...higherFrets].sort((a, b) => a.fret - b.fret || b.sIdx - a.sIdx);
    // Check if remaining notes form a clean A-shape / C9 partial barre on contiguous top strings at maxFret
    const atSameHigher =
      remaining.length >= 2 &&
      remaining.every((r) => r.fret === remaining[0].fret) &&
      remaining.every((r, idx, arr) => idx === 0 || arr[idx - 1].sIdx - r.sIdx === 1) &&
      !openStrings.some((o) => o.sIdx < remaining[0].sIdx) &&
      !atMin.some((m) => m.sIdx < remaining[remaining.length - 1].sIdx);

    if (atSameHigher && remaining.length >= 2 && remaining.length <= 3) {
      const barreFinger: 2 | 3 | 4 = remaining[0].fret - minFret >= 2 ? 3 : 2;
      remaining.forEach((v) => fingerMap.set(`${v.sIdx}:${v.fret}`, barreFinger));
      fingersRequired = 2;
    } else {
      let nextFinger = 2;
      remaining.forEach((v) => {
        if (nextFinger <= 4) {
          fingerMap.set(`${v.sIdx}:${v.fret}`, nextFinger as 2 | 3 | 4);
        } else {
          fingerMap.set(`${v.sIdx}:${v.fret}`, 4);
        }
        nextFinger++;
      });
      fingersRequired = 1 + remaining.length;
    }
  } else {
    // No index barre: check if highest treble strings share same fret (e.g., C9 x-3-2-3-3-3 where finger 3/4 mini-barres)
    const sorted = [...fretted].sort((a, b) => a.fret - b.fret || b.sIdx - a.sIdx);
    const sameMaxGroup = fretted.filter((v) => v.fret === maxFret).sort((a, b) => b.sIdx - a.sIdx);
    const nonMax = fretted.filter((v) => v.fret < maxFret).sort((a, b) => a.fret - b.fret || b.sIdx - a.sIdx);
    const isContiguousTrebleMiniBarre =
      sameMaxGroup.length >= 2 &&
      sameMaxGroup.length <= 3 &&
      nonMax.length <= 2 &&
      sameMaxGroup.every((v, i, arr) => i === 0 || arr[i - 1].sIdx - v.sIdx === 1) &&
      !openStrings.some((o) => o.sIdx < sameMaxGroup[0].sIdx) &&
      nonMax.every((n) => n.sIdx > sameMaxGroup[sameMaxGroup.length - 1].sIdx);

    if (fretted.length > 4 && isContiguousTrebleMiniBarre) {
      let nextFinger = 1;
      nonMax.forEach((v) => {
        fingerMap.set(`${v.sIdx}:${v.fret}`, Math.min(4, nextFinger) as 1 | 2 | 3 | 4);
        nextFinger++;
      });
      const miniBarreFinger = Math.min(4, Math.max(nextFinger, 3)) as 2 | 3 | 4;
      sameMaxGroup.forEach((v) => fingerMap.set(`${v.sIdx}:${v.fret}`, miniBarreFinger));
      fingersRequired = nonMax.length + 1;
    } else {
      let nextFinger = 1;
      sorted.forEach((v) => {
        fingerMap.set(`${v.sIdx}:${v.fret}`, Math.min(4, nextFinger) as 1 | 2 | 3 | 4);
        nextFinger++;
      });
      fingersRequired = fretted.length;
    }
  }

  let warning: string | undefined;
  let playable = true;
  if (fingersRequired > 4) {
    playable = false;
    warning = `Postura impracticable con 1 mano: requiere ${fingersRequired} dedos sin cejilla válida (máximo 4 dedos). Usa una cejilla o quita una cuerda.`;
  } else if (stretch > 5) {
    playable = false;
    warning = `Apertura extrema (${stretch} trastes de separación entre traste ${minFret} y ${maxFret}): impracticable sin estirar más de 5 trastes.`;
  }

  return {
    positions: voicing.map((v) => ({
      ...v,
      finger: fingerMap.get(`${v.sIdx}:${v.fret}`) ?? 0,
    })),
    barreFret,
    fingersUsed: fingersRequired,
    playable,
    warning,
  };
}

export function computeChordNeckState(params: {
  rootPc: number;
  chordId: string;
  scaleId: string;
  openMidisHighToLow: number[];
  maxFret?: number;
}): ChordNeckComputation {
  const rootPc = ((params.rootPc % 12) + 12) % 12;
  const maxFret = params.maxFret ?? 12;
  const chord =
    CHORD_DIAGRAM_CATALOG.find((c) => c.id === params.chordId) || CHORD_DIAGRAM_CATALOG[0];
  const scaleGuide =
    SCALE_GUIDE_CATALOG.find((s) => s.id === params.scaleId) || SCALE_GUIDE_CATALOG[0];

  const isBass = params.openMidisHighToLow.length <= 4;
  const baseRootMidi = (isBass ? 36 : 48) + rootPc;
  const chordMidis = chord.intervals.map((semi) => baseRootMidi + semi);
  const chordPositions = resolvePlayableChordVoicing(
    chordMidis,
    params.openMidisHighToLow,
    maxFret
  );
  const fingerInfo = assignGuitarChordFingers(chordPositions, !isBass);

  const chordPcs = chord.intervals.map((i) => (rootPc + i) % 12);
  const rawScalePcs =
    scaleGuide.intervals.length > 0
      ? scaleGuide.intervals.map((i) => (rootPc + i) % 12)
      : chordPcs;
  const scalePitchClasses = [...new Set([...rawScalePcs, ...chordPcs])];
  const charPitchClasses = scaleGuide.charOffsets.map((i) => (rootPc + i) % 12);

  const numStrings = params.openMidisHighToLow.length;
  const fretsLowToHigh: string[] = [];
  const fingersLowToHigh: string[] = [];
  for (let sIdx = numStrings - 1; sIdx >= 0; sIdx--) {
    const match = fingerInfo.positions.find((p) => p.sIdx === sIdx);
    fretsLowToHigh.push(match ? String(match.fret) : 'x');
    fingersLowToHigh.push(match ? (match.finger === 0 ? '0' : String(match.finger)) : 'x');
  }

  return {
    rootPc,
    chord,
    scaleGuide,
    chordTitle: `${LOGIC_NOTE_NAMES[rootPc]}${chord.symbol}`,
    chordNoteNames: chord.intervals.map((i) => LOGIC_NOTE_NAMES[(rootPc + i) % 12]),
    chordMidis,
    chordPositions,
    chordFingers: fingerInfo.positions,
    barreFret: fingerInfo.barreFret,
    scalePitchClasses,
    charPitchClasses,
    tabSummary: fretsLowToHigh.join(' - '),
    fingerSummary: fingersLowToHigh.join(' - '),
  };
}

export interface ReverseChordAnalysis {
  title: string;
  detectedSymbol: string;
  notesText: string;
  formulaText: string;
  midis: number[];
  activePositions: GuitarFingerPos[];
  barreFret: number | null;
  tabLowToHigh: string;
  fingerLowToHigh: string;
  fingersUsed: number;
  playable: boolean;
  warning?: string;
}

const REVERSE_INTERVAL_LABELS = [
  '1',
  'b2/b9',
  '2/9',
  'b3/#9',
  '3M',
  '4/11',
  'b5/#11',
  '5J',
  'b6/b13',
  '6/13',
  'b7',
  '7M',
];

/**
 * Pure Reverse Chord Finder analyzer: identifies chord quality, inversion, exact intervals,
 * left-hand 1–4 guitar fingers, barre detection, and biomechanical playability.
 */
export function identifyGuitarChordFromFrets(
  fretsHighToLow: number[],
  openMidisHighToLow: number[] = [64, 59, 55, 50, 45, 40]
): ReverseChordAnalysis {
  const active: ChordFretPos[] = [];
  const numStrings = Math.min(fretsHighToLow.length, openMidisHighToLow.length);
  for (let sIdx = numStrings - 1; sIdx >= 0; sIdx--) {
    const f = fretsHighToLow[sIdx];
    if (f >= 0) {
      active.push({ sIdx, fret: f, midi: openMidisHighToLow[sIdx] + f });
    }
  }

  if (active.length === 0) {
    return {
      title: 'Ninguna cuerda activa (Haz clic en los trastes para pisar notas)',
      detectedSymbol: '—',
      notesText: '—',
      formulaText: '—',
      midis: [],
      activePositions: [],
      barreFret: null,
      tabLowToHigh: Array(numStrings).fill('X').join('-'),
      fingerLowToHigh: Array(numStrings).fill('X').join('-'),
      fingersUsed: 0,
      playable: true,
    };
  }

  const fingerInfo = assignGuitarChordFingers(active, true);
  const tabLowToHigh = fretsHighToLow
    .slice(0, numStrings)
    .reverse()
    .map((f) => (f < 0 ? 'X' : String(f)))
    .join('-');

  const fingerLowArr: string[] = [];
  for (let sIdx = numStrings - 1; sIdx >= 0; sIdx--) {
    if (fretsHighToLow[sIdx] < 0) {
      fingerLowArr.push('X');
    } else {
      const fp = fingerInfo.positions.find((p) => p.sIdx === sIdx);
      fingerLowArr.push(fp ? String(fp.finger) : '0');
    }
  }
  const fingerLowToHigh = fingerLowArr.join('-');

  const bass = active[0];
  const bassPc = ((bass.midi % 12) + 12) % 12;
  const uniquePcs = [bassPc, ...new Set(active.map((a) => ((a.midi % 12) + 12) % 12))].filter(
    (pc, idx, arr) => arr.indexOf(pc) === idx
  );
  const notesText = active.map((a) => midiToNoteName(a.midi)).join(' – ');

  let bestName = `${LOGIC_NOTE_NAMES[bassPc]} (Intervalo / Cluster)`;
  let bestSymbol = LOGIC_NOTE_NAMES[bassPc];
  let bestFormula = '';
  let bestScore = -1;

  for (const candidateRoot of uniquePcs) {
    const relSet = new Set(uniquePcs.map((pc) => (pc - candidateRoot + 12) % 12));
    const has3M = relSet.has(4);
    const has3m = relSet.has(3);
    const has5 = relSet.has(7);
    const hasb5 = relSet.has(6);
    const hasSharp5 = relSet.has(8);
    const has7M = relSet.has(11);
    const hasb7 = relSet.has(10);
    const has6 = relSet.has(9);
    const has9 = relSet.has(2);
    const hasb9 = relSet.has(1);
    const has4 = relSet.has(5);

    let suffix = '';
    let qualityScore = 0;

    if (has3m && has7M && has9) {
      suffix = 'm(Maj9)';
      qualityScore = 100;
    } else if (has3M && has7M && has9) {
      suffix = 'Maj9';
      qualityScore = 98;
    } else if (has3m && has7M) {
      suffix = 'm(Maj7)';
      qualityScore = 94;
    } else if (has3M && has7M && hasb5 && !has5) {
      suffix = 'Maj7(#11)';
      qualityScore = 92;
    } else if (has3M && has7M) {
      suffix = 'Maj7';
      qualityScore = 90;
    } else if (has3M && hasb7 && has3m) {
      suffix = '7(#9)';
      qualityScore = 96;
    } else if (has3M && hasb7 && hasb9) {
      suffix = '7(b9)';
      qualityScore = 93;
    } else if (has3M && hasb7 && has6) {
      suffix = '13';
      qualityScore = 92;
    } else if (has3M && hasb7 && has9) {
      suffix = '9';
      qualityScore = 91;
    } else if (has3M && hasb7) {
      suffix = '7';
      qualityScore = 88;
    } else if (has3m && hasb7 && has4 && has9) {
      suffix = 'm11';
      qualityScore = 95;
    } else if (has3m && hasb7 && has4) {
      suffix = 'm11';
      qualityScore = 92;
    } else if (has3m && hasb7 && has9) {
      suffix = 'm9';
      qualityScore = 90;
    } else if (has3m && hasb7 && hasb5) {
      suffix = 'm7b5';
      qualityScore = 89;
    } else if (has3m && hasb7) {
      suffix = 'm7';
      qualityScore = 86;
    } else if (!has3M && has3m && hasb5 && !has5 && has6) {
      suffix = 'dim7';
      qualityScore = 85;
    } else if (!has3M && has3m && hasb5 && !has5) {
      suffix = 'dim';
      qualityScore = 76;
    } else if (has3M && !has5 && hasSharp5) {
      suffix = 'aug';
      qualityScore = 76;
    } else if (has3M && has6 && has9) {
      suffix = '6/9';
      qualityScore = 84;
    } else if (has3M && has6 && !has7M && !hasb7) {
      suffix = '6';
      qualityScore = 80;
    } else if (has3m && has6 && !has7M && !hasb7) {
      suffix = 'm6';
      qualityScore = 80;
    } else if (has3M && has9 && !has7M && !hasb7) {
      suffix = 'add9';
      qualityScore = 82;
    } else if (has3m && has9 && !has7M && !hasb7) {
      suffix = 'm(add9)';
      qualityScore = 82;
    } else if (!has3M && !has3m && hasb7 && has4 && has5) {
      suffix = '7sus4';
      qualityScore = 78;
    } else if (!has3M && !has3m && has7M && has9 && has5) {
      suffix = 'sus2(Maj7)';
      qualityScore = 74;
    } else if (has3M && (has5 || uniquePcs.length >= 2)) {
      suffix = ' Mayor';
      qualityScore = 72;
    } else if (has3m && (has5 || uniquePcs.length >= 2)) {
      suffix = 'm';
      qualityScore = 72;
    } else if (!has3M && !has3m && has4 && has5) {
      suffix = 'sus4';
      qualityScore = 68;
    } else if (!has3M && !has3m && has9 && has5) {
      suffix = 'sus2';
      qualityScore = 68;
    } else if (!has3M && !has3m && !has4 && !has9 && has5 && uniquePcs.length === 2) {
      suffix = '5';
      qualityScore = 64;
    }

    if (suffix) {
      const rootBias = candidateRoot === bassPc ? 20 : 0;
      const totalScore = qualityScore + rootBias;
      if (totalScore > bestScore) {
        bestScore = totalScore;
        const rootName = LOGIC_NOTE_NAMES[candidateRoot];
        const cleanSuffix = suffix === ' Mayor' ? '' : suffix;
        const slash =
          candidateRoot !== bassPc
            ? ` / ${LOGIC_NOTE_NAMES[bassPc]} (Inversión con ${LOGIC_NOTE_NAMES[bassPc]} en el bajo)`
            : '';
        bestSymbol = `${rootName}${cleanSuffix}${candidateRoot !== bassPc ? `/${LOGIC_NOTE_NAMES[bassPc]}` : ''}`;
        bestName = `${rootName}${suffix}${slash}`;
        bestFormula = [...relSet]
          .sort((a, b) => a - b)
          .map((st) => REVERSE_INTERVAL_LABELS[st])
          .join(' – ');
      }
      if (candidateRoot === bassPc && qualityScore >= 90) break;
    }
  }

  return {
    title: bestName,
    detectedSymbol: bestSymbol,
    notesText,
    formulaText: bestFormula || 'Conjunto libre de notas',
    midis: active.map((a) => a.midi),
    activePositions: fingerInfo.positions,
    barreFret: fingerInfo.barreFret,
    tabLowToHigh,
    fingerLowToHigh,
    fingersUsed: fingerInfo.fingersUsed,
    playable: fingerInfo.playable,
    warning: fingerInfo.warning,
  };
}

/**
 * Guitar Chord Memory Trainer Library & Helpers
 */
export interface ChordMemoryItem {
  id: string;
  symbol: string;
  name: string;
  pool: 'basic' | 'barre7' | 'jazz';
  rootPc: number;
  fretsLowToHigh: number[]; // length 6, -1 = muted
  fingersLowToHigh: (0 | 1 | 2 | 3 | 4 | -1)[];
  hint: string;
}

export const CHORD_MEMORY_LIBRARY: ChordMemoryItem[] = [
  { id: 'C', symbol: 'C', name: 'Do Mayor', pool: 'basic', rootPc: 0, fretsLowToHigh: [-1, 3, 2, 0, 1, 0], fingersLowToHigh: [-1, 3, 2, 0, 1, 0], hint: 'Forma abierta en escalera 3-2-1 desde 5ª cuerda' },
  { id: 'G', symbol: 'G', name: 'Sol Mayor', pool: 'basic', rootPc: 7, fretsLowToHigh: [3, 2, 0, 0, 0, 3], fingersLowToHigh: [2, 1, 0, 0, 0, 3], hint: 'Raíz en 6ª traste 3 y 1ª cuerda traste 3' },
  { id: 'D', symbol: 'D', name: 'Re Mayor', pool: 'basic', rootPc: 2, fretsLowToHigh: [-1, -1, 0, 2, 3, 2], fingersLowToHigh: [-1, -1, 0, 1, 3, 2], hint: 'Triángulo agudo en trastes 2-3-2 con 4ª al aire' },
  { id: 'A', symbol: 'A', name: 'La Mayor', pool: 'basic', rootPc: 9, fretsLowToHigh: [-1, 0, 2, 2, 2, 0], fingersLowToHigh: [-1, 0, 1, 2, 3, 0], hint: 'Tres dedos juntos en el traste 2 (4ª, 3ª y 2ª)' },
  { id: 'E', symbol: 'E', name: 'Mi Mayor', pool: 'basic', rootPc: 4, fretsLowToHigh: [0, 2, 2, 1, 0, 0], fingersLowToHigh: [0, 2, 3, 1, 0, 0], hint: '6 cuerdas suenan; 3ª cuerda traste 1 define modo mayor' },
  { id: 'Am', symbol: 'Am', name: 'La Menor', pool: 'basic', rootPc: 9, fretsLowToHigh: [-1, 0, 2, 2, 1, 0], fingersLowToHigh: [-1, 0, 2, 3, 1, 0], hint: 'Igual que E pero bajado una cuerda entera' },
  { id: 'Em', symbol: 'Em', name: 'Mi Menor', pool: 'basic', rootPc: 4, fretsLowToHigh: [0, 2, 2, 0, 0, 0], fingersLowToHigh: [0, 2, 3, 0, 0, 0], hint: 'Solo 2 dedos en traste 2 (5ª y 4ª cuerda)' },
  { id: 'Dm', symbol: 'Dm', name: 'Re Menor', pool: 'basic', rootPc: 2, fretsLowToHigh: [-1, -1, 0, 2, 3, 1], fingersLowToHigh: [-1, -1, 0, 2, 3, 1], hint: '1ª cuerda traste 1 (Fa = b3) con 4ª al aire' },
  { id: 'F', symbol: 'F', name: 'Fa Mayor (Cejilla)', pool: 'barre7', rootPc: 5, fretsLowToHigh: [1, 3, 3, 2, 1, 1], fingersLowToHigh: [1, 3, 4, 2, 1, 1], hint: 'Cejilla dedo 1 en traste 1 + molde de E' },
  { id: 'Bm', symbol: 'Bm', name: 'Si Menor (Cejilla)', pool: 'barre7', rootPc: 11, fretsLowToHigh: [-1, 2, 4, 4, 3, 2], fingersLowToHigh: [-1, 1, 3, 4, 2, 1], hint: 'Cejilla traste 2 desde 5ª cuerda + molde de Am' },
  { id: 'G7', symbol: 'G7', name: 'Sol Dominante 7', pool: 'barre7', rootPc: 7, fretsLowToHigh: [3, 2, 0, 0, 0, 1], fingersLowToHigh: [3, 2, 0, 0, 0, 1], hint: 'Baja la 1ª cuerda a traste 1 (Fa = b7) para resolver a C' },
  { id: 'C7', symbol: 'C7', name: 'Do Dominante 7', pool: 'barre7', rootPc: 0, fretsLowToHigh: [-1, 3, 2, 3, 1, 0], fingersLowToHigh: [-1, 3, 2, 4, 1, 0], hint: 'Añade dedo 4 (Meñique) en 3ª cuerda traste 3 (Si♭)' },
  { id: 'D7', symbol: 'D7', name: 'Re Dominante 7', pool: 'barre7', rootPc: 2, fretsLowToHigh: [-1, -1, 0, 2, 1, 2], fingersLowToHigh: [-1, -1, 0, 2, 1, 3], hint: 'Triángulo invertido: dedo 1 en 2ª traste 1 (Do = b7)' },
  { id: 'E7', symbol: 'E7', name: 'Mi Dominante 7', pool: 'barre7', rootPc: 4, fretsLowToHigh: [0, 2, 0, 1, 0, 0], fingersLowToHigh: [0, 2, 0, 1, 0, 0], hint: 'E Mayor quitando el dedo 3 (4ª cuerda al aire = Re)' },
  { id: 'A7', symbol: 'A7', name: 'La Dominante 7', pool: 'barre7', rootPc: 9, fretsLowToHigh: [-1, 0, 2, 0, 2, 0], fingersLowToHigh: [-1, 0, 1, 0, 2, 0], hint: 'A Mayor dejando la 3ª cuerda (Sol = b7) al aire' },
  { id: 'Am7', symbol: 'Am7', name: 'La Menor 7', pool: 'barre7', rootPc: 9, fretsLowToHigh: [-1, 0, 2, 0, 1, 0], fingersLowToHigh: [-1, 0, 2, 0, 1, 0], hint: 'Am sin el dedo anular (3ª cuerda al aire = Sol)' },
  { id: 'Dm7', symbol: 'Dm7', name: 'Re Menor 7', pool: 'barre7', rootPc: 2, fretsLowToHigh: [-1, -1, 0, 2, 1, 1], fingersLowToHigh: [-1, -1, 0, 2, 1, 1], hint: 'Mini cejilla del dedo 1 en cuerdas 2 y 1 traste 1' },
  { id: 'Em7', symbol: 'Em7', name: 'Mi Menor 7', pool: 'barre7', rootPc: 4, fretsLowToHigh: [0, 2, 0, 0, 0, 0], fingersLowToHigh: [0, 2, 0, 0, 0, 0], hint: 'Un solo dedo en 5ª cuerda traste 2' },
  { id: 'Cmaj7', symbol: 'Cmaj7', name: 'Do Maj7', pool: 'jazz', rootPc: 0, fretsLowToHigh: [-1, 3, 2, 0, 0, 0], fingersLowToHigh: [-1, 3, 2, 0, 0, 0], hint: 'C Mayor levantando el dedo 1 (2ª al aire = Si 7M)' },
  { id: 'Fmaj7', symbol: 'Fmaj7', name: 'Fa Maj7', pool: 'jazz', rootPc: 5, fretsLowToHigh: [-1, -1, 3, 2, 1, 0], fingersLowToHigh: [-1, -1, 3, 2, 1, 0], hint: 'Escalera 3-2-1 desde 4ª cuerda con 1ª (Mi = 7M) al aire' },
  { id: 'G6', symbol: 'G6', name: 'Sol Sexta', pool: 'jazz', rootPc: 7, fretsLowToHigh: [3, 2, 0, 0, 0, 0], fingersLowToHigh: [2, 1, 0, 0, 0, 0], hint: 'G abierto con 1ª cuerda (Mi = 6ª) al aire' },
  { id: 'Cmaj9', symbol: 'Cmaj9', name: 'Do Maj9', pool: 'jazz', rootPc: 0, fretsLowToHigh: [-1, 3, 2, 4, 3, 0], fingersLowToHigh: [-1, 2, 1, 4, 3, 0], hint: 'Voicing clásico de Bossa/Jazz en trastes 2–4' },
  { id: 'Dm9', symbol: 'Dm9', name: 'Re Menor 9', pool: 'jazz', rootPc: 2, fretsLowToHigh: [-1, 5, 3, 5, 5, -1], fingersLowToHigh: [-1, 2, 1, 3, 4, -1], hint: 'Voicing Jazz sin cejilla en trastes 3–5' },
  { id: 'EmMaj9', symbol: 'Em(Maj9)', name: 'Mi Menor Maj9 (James Bond)', pool: 'jazz', rootPc: 4, fretsLowToHigh: [0, 2, 1, 0, 0, 2], fingersLowToHigh: [0, 2, 1, 0, 0, 3], hint: 'Solo 3 dedos: 0-2-1-0-0-3 con 3ª y 2ª al aire (1-b3-5-7M-9)' },
  { id: 'B7', symbol: 'B7', name: 'Si Dominante 7', pool: 'jazz', rootPc: 11, fretsLowToHigh: [-1, 2, 1, 2, 0, 2], fingersLowToHigh: [-1, 2, 1, 3, 0, 4], hint: 'Diamante clásico de Blues en E Mayor' },
];

export type ChordMemoryPoolKey = 'basic' | 'barre7' | 'jazz' | 'all';

export function getChordMemoryPool(poolKey: ChordMemoryPoolKey): ChordMemoryItem[] {
  if (poolKey === 'all') return CHORD_MEMORY_LIBRARY;
  if (poolKey === 'basic') return CHORD_MEMORY_LIBRARY.filter((c) => c.pool === 'basic');
  if (poolKey === 'barre7') {
    return CHORD_MEMORY_LIBRARY.filter((c) => c.pool === 'basic' || c.pool === 'barre7');
  }
  return CHORD_MEMORY_LIBRARY.filter((c) => c.pool === 'jazz' || c.pool === 'barre7');
}

export function buildChordMemorySequence(
  poolKey: ChordMemoryPoolKey,
  length: number,
  seed = Date.now()
): ChordMemoryItem[] {
  const pool = getChordMemoryPool(poolKey);
  const count = Math.max(2, Math.min(8, length));
  if (pool.length === 0) return [];
  let state = Math.abs(Math.floor(seed)) || 1337;
  const nextRand = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const seq: ChordMemoryItem[] = [];
  for (let i = 0; i < count; i++) {
    let pick = pool[Math.floor(nextRand() * pool.length)];
    if (pool.length > 1 && i > 0 && pick.id === seq[i - 1].id) {
      const idx = pool.findIndex((c) => c.id === pick.id);
      pick = pool[(idx + 1 + Math.floor(nextRand() * (pool.length - 1))) % pool.length];
    }
    seq.push(pick);
  }
  return seq;
}

export function evaluateChordMemoryAnswer(
  expectedId: string,
  chosenId: string,
  currentStreak: number
): { correct: boolean; nextStreak: number } {
  const correct = expectedId === chosenId;
  return {
    correct,
    nextStreak: correct ? currentStreak + 1 : 0,
  };
}

/**
 * Top-View Ergonomic Drum Kit SVG Renderer with Multi-Limb Annotations
 */
export type DrumKitCode = 'BD' | 'SD' | 'HH' | 'HHP' | 'T1' | 'T2' | 'FT' | 'RD' | 'CR';
export type DrumLimb = 'R' | 'L' | 'RF' | 'LF';

export interface DrumLimbHit {
  piece: DrumKitCode;
  limb: DrumLimb;
  accent?: boolean;
  action?: string;
}

export const DRUM_LIMB_META: Record<
  DrumLimb,
  { short: string; label: string; badge: string; color: string; textCol: string }
> = {
  R: {
    short: 'R',
    label: 'Mano Derecha (R)',
    badge: 'Mano Der',
    color: '#fbbf24',
    textCol: '#090c12',
  },
  L: {
    short: 'L',
    label: 'Mano Izquierda (L)',
    badge: 'Mano Izq',
    color: '#fb7185',
    textCol: '#ffffff',
  },
  RF: {
    short: 'PD',
    label: 'Pie Derecho (Bombo)',
    badge: 'Pie Der',
    color: '#38bdf8',
    textCol: '#090c12',
  },
  LF: {
    short: 'PI',
    label: 'Pie Izquierdo (Pedal HH)',
    badge: 'Pie Izq',
    color: '#34d399',
    textCol: '#090c12',
  },
};

const DRUM_PIECE_ANCHORS: Record<DrumKitCode, { x: number; y: number }> = {
  HHP: { x: 221, y: 126 },
  BD: { x: 342, y: 31 },
  SD: { x: 272, y: 108 },
  T1: { x: 306, y: 63 },
  T2: { x: 368, y: 63 },
  FT: { x: 422, y: 104 },
  HH: { x: 195, y: 84 },
  CR: { x: 235, y: 31 },
  RD: { x: 445, y: 40 },
};

export function renderTopViewDrumKitSvg(params: {
  title?: string;
  activePieces?: DrumKitCode[];
  limbHits?: DrumLimbHit[];
  highlightedPiece?: DrumKitCode | null;
  note?: string;
}): string {
  const title =
    params.title ||
    'Batería Acústica — Vista Cenital (Colores por Mano/Pie · Clic para tocar)';
  const activePieces = params.activePieces || [
    'BD',
    'SD',
    'HH',
    'HHP',
    'T1',
    'T2',
    'FT',
    'RD',
    'CR',
  ];
  const activeSet = new Set<DrumKitCode>(activePieces);
  const limbHits: DrumLimbHit[] = [...(params.limbHits || [])];
  if (params.highlightedPiece && !limbHits.some((h) => h.piece === params.highlightedPiece)) {
    const inferredLimb: DrumLimb =
      params.highlightedPiece === 'BD'
        ? 'RF'
        : params.highlightedPiece === 'HHP'
          ? 'LF'
          : params.highlightedPiece === 'SD'
            ? 'L'
            : 'R';
    limbHits.push({ piece: params.highlightedPiece, limb: inferredLimb });
  }

  const hitsByPiece = new Map<DrumKitCode, DrumLimbHit[]>();
  limbHits.forEach((h) => {
    const arr = hitsByPiece.get(h.piece) || [];
    arr.push(h);
    hitsByPiece.set(h.piece, arr);
  });

  const fillCol = (code: DrumKitCode, base: string, active: string): string => {
    const hits = hitsByPiece.get(code);
    if (hits && hits.length > 0) {
      return DRUM_LIMB_META[hits[0].limb].color;
    }
    return activeSet.has(code) ? active : base;
  };

  const strokeCol = (code: DrumKitCode): string => {
    const hits = hitsByPiece.get(code);
    if (hits && hits.length > 0) {
      return '#f8fafc';
    }
    return activeSet.has(code) ? '#475569' : '#334155';
  };

  const strokeWidth = (code: DrumKitCode, def: string): string =>
    hitsByPiece.has(code) ? '2.8' : def;

  const isHit = (code: DrumKitCode): boolean => hitsByPiece.has(code);
  const hitTextCol = (code: DrumKitCode, defaultActiveCol: string, baseCol = '#cbd5e1'): string => {
    const hits = hitsByPiece.get(code);
    if (hits && hits.length > 0) return DRUM_LIMB_META[hits[0].limb].textCol;
    return activeSet.has(code) ? defaultActiveCol : baseCol;
  };

  const limbBadgesSvg = Array.from(hitsByPiece.entries())
    .map(([code, hits]) => {
      const anchor = DRUM_PIECE_ANCHORS[code];
      const badgesText = hits.map((h) => DRUM_LIMB_META[h.limb].short).join('+');
      const meta = DRUM_LIMB_META[hits[0].limb];
      const pillW = Math.max(24, badgesText.length * 9 + 12);
      return `
        <g pointer-events="none">
          <rect x="${anchor.x - pillW / 2}" y="${anchor.y - 9}" width="${pillW}" height="17" rx="8.5" fill="#090c12" stroke="${meta.color}" stroke-width="1.8" />
          <text x="${anchor.x}" y="${anchor.y + 3}" text-anchor="middle" font-size="9" font-weight="900" fill="${meta.color}">${badgesText}</text>
        </g>
      `;
    })
    .join('');

  const note =
    params.note ||
    'Haz clic en cualquier pieza del kit para probar su sonido · R=Mano Der · L=Mano Izq · PD=Pie Der · PI=Pie Izq';

  const w = 680;
  const h = 248;
  return `
    <figure class="svg-fig" style="margin:0 auto; max-width:680px; width:100%;">
      <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; display:block; user-select:none; border-radius:10px; box-shadow:0 8px 22px rgba(0,0,0,0.45);">
        <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="8" fill="#0b1220" stroke="#1e293b"/>
        <text x="${w / 2}" y="19" text-anchor="middle" font-size="10.5" font-weight="bold" fill="#f8fafc">${title}</text>
        <rect x="115" y="28" width="450" height="192" rx="8" fill="#0f172a" stroke="#334155" stroke-dasharray="4,3"/>

        <g class="js-svg-drum-piece" data-piece="HHP" role="button" tabindex="0" aria-label="Pedal Hi-Hat Pie Izquierdo" style="cursor:pointer;">
          <rect x="212" y="136" width="18" height="40" rx="3" fill="${fillCol('HHP', '#1e293b', '#065f46')}" stroke="${strokeCol('HHP')}" stroke-width="${strokeWidth('HHP', '1.5')}"/>
          <text x="221" y="188" text-anchor="middle" font-size="7.5" font-weight="bold" fill="#cbd5e1">Pedal HH [PI]</text>
        </g>

        <g class="js-svg-drum-piece" data-piece="BD" role="button" tabindex="0" aria-label="Pedal Bombo Pie Derecho" style="cursor:pointer;">
          <rect x="332" y="114" width="20" height="42" rx="3" fill="${fillCol('BD', '#1e293b', '#075985')}" stroke="${strokeCol('BD')}" stroke-width="${strokeWidth('BD', '1.5')}"/>
          <text x="342" y="168" text-anchor="middle" font-size="7.5" font-weight="bold" fill="#cbd5e1">Pedal BD [PD]</text>
        </g>

        <g class="js-svg-drum-piece" data-piece="BD" role="button" tabindex="0" aria-label="Bombo BD" style="cursor:pointer;">
          <rect x="295" y="38" width="94" height="62" rx="10" fill="${fillCol('BD', '#1e293b', '#991b1b')}" stroke="${strokeCol('BD')}" stroke-width="${strokeWidth('BD', '2')}"/>
          <text x="342" y="53" text-anchor="middle" font-size="9" font-weight="bold" fill="${hitTextCol('BD', '#f8fafc')}">BOMBO (BD)</text>
        </g>

        <g class="js-svg-drum-piece" data-piece="SD" role="button" tabindex="0" aria-label="Caja Snare SD" style="cursor:pointer;">
          <circle cx="272" cy="142" r="33" fill="${fillCol('SD', '#1e293b', '#1d4ed8')}" stroke="${strokeCol('SD')}" stroke-width="${strokeWidth('SD', '2')}"/>
          <circle cx="272" cy="142" r="23" fill="none" stroke="${isHit('SD') ? '#090c12' : '#60a5fa'}" stroke-opacity="0.5" stroke-dasharray="3,2"/>
          <text x="272" y="145" text-anchor="middle" font-size="9.5" font-weight="bold" fill="${hitTextCol('SD', '#ffffff')}">CAJA (SD)</text>
        </g>

        <g class="js-svg-drum-piece" data-piece="T1" role="button" tabindex="0" aria-label="Tom 1 Agudo" style="cursor:pointer;">
          <circle cx="306" cy="84" r="22" fill="${fillCol('T1', '#1e293b', '#2563eb')}" stroke="${strokeCol('T1')}" stroke-width="${strokeWidth('T1', '1.8')}"/>
          <text x="306" y="87" text-anchor="middle" font-size="8.2" font-weight="bold" fill="${hitTextCol('T1', '#ffffff')}">TOM 1</text>
        </g>

        <g class="js-svg-drum-piece" data-piece="T2" role="button" tabindex="0" aria-label="Tom 2 Medio" style="cursor:pointer;">
          <circle cx="368" cy="84" r="24" fill="${fillCol('T2', '#1e293b', '#1e40af')}" stroke="${strokeCol('T2')}" stroke-width="${strokeWidth('T2', '1.8')}"/>
          <text x="368" y="87" text-anchor="middle" font-size="8.2" font-weight="bold" fill="${hitTextCol('T2', '#ffffff')}">TOM 2</text>
        </g>

        <g class="js-svg-drum-piece" data-piece="FT" role="button" tabindex="0" aria-label="Tom de Piso FT" style="cursor:pointer;">
          <circle cx="422" cy="140" r="34" fill="${fillCol('FT', '#1e293b', '#1e3a8a')}" stroke="${strokeCol('FT')}" stroke-width="${strokeWidth('FT', '2')}"/>
          <text x="422" y="143" text-anchor="middle" font-size="8.8" font-weight="bold" fill="${hitTextCol('FT', '#ffffff')}">FLOOR TOM</text>
        </g>

        <g class="js-svg-drum-piece" data-piece="HH" role="button" tabindex="0" aria-label="Hi-Hat Charles" style="cursor:pointer;">
          <circle cx="195" cy="112" r="27" fill="${fillCol('HH', '#332814', '#b45309')}" stroke="${strokeCol('HH')}" stroke-width="${strokeWidth('HH', '2')}"/>
          <circle cx="195" cy="112" r="5" fill="#090c12"/>
          <text x="195" y="102" text-anchor="middle" font-size="8.5" font-weight="bold" fill="${hitTextCol('HH', '#fef3c7')}">HI-HAT</text>
        </g>

        <g class="js-svg-drum-piece" data-piece="CR" role="button" tabindex="0" aria-label="Plato Crash" style="cursor:pointer;">
          <circle cx="235" cy="58" r="29" fill="${fillCol('CR', '#332814', '#d97706')}" stroke="${strokeCol('CR')}" stroke-width="${strokeWidth('CR', '2')}" fill-opacity="0.92"/>
          <circle cx="235" cy="58" r="5" fill="#090c12"/>
          <text x="235" y="48" text-anchor="middle" font-size="8.5" font-weight="bold" fill="${hitTextCol('CR', '#fef3c7')}">CRASH</text>
        </g>

        <g class="js-svg-drum-piece" data-piece="RD" role="button" tabindex="0" aria-label="Plato Ride" style="cursor:pointer;">
          <circle cx="445" cy="74" r="35" fill="${fillCol('RD', '#332814', '#b45309')}" stroke="${strokeCol('RD')}" stroke-width="${strokeWidth('RD', '2')}" fill-opacity="0.92"/>
          <circle cx="445" cy="74" r="7" fill="#090c12"/>
          <text x="445" y="61" text-anchor="middle" font-size="8.5" font-weight="bold" fill="${hitTextCol('RD', '#fef3c7')}">RIDE</text>
        </g>

        <circle cx="312" cy="197" r="18" fill="#1e293b" stroke="#64748b" stroke-width="1.8"/>
        <text x="312" y="200" text-anchor="middle" font-size="7.5" font-weight="bold" fill="#f8fafc">SILLÍN</text>

        <!-- Leyenda de Extremidades (Izquierda) -->
        <rect x="12" y="34" width="96" height="180" rx="6" fill="#111a2e" stroke="#334155"/>
        <text x="60" y="49" text-anchor="middle" font-size="8" font-weight="bold" fill="#f8fafc">Manos y Pies</text>
        <rect x="19" y="59" width="12" height="12" rx="3" fill="#fbbf24" stroke="#090c12" stroke-width="0.8"/>
        <text x="36" y="68" font-size="7.5" font-weight="bold" fill="#fde68a">R · Mano Der</text>
        <rect x="19" y="79" width="12" height="12" rx="3" fill="#fb7185" stroke="#090c12" stroke-width="0.8"/>
        <text x="36" y="88" font-size="7.5" font-weight="bold" fill="#fecdd3">L · Mano Izq</text>
        <rect x="19" y="99" width="12" height="12" rx="3" fill="#38bdf8" stroke="#090c12" stroke-width="0.8"/>
        <text x="36" y="108" font-size="7.5" font-weight="bold" fill="#bae6fd">PD · Pie Der</text>
        <rect x="19" y="119" width="12" height="12" rx="3" fill="#34d399" stroke="#090c12" stroke-width="0.8"/>
        <text x="36" y="128" font-size="7.5" font-weight="bold" fill="#a7f3d0">PI · Pie Izq</text>
        <text x="19" y="150" font-size="7" fill="#94a3b8">• Diestro estándar</text>
        <text x="19" y="162" font-size="7" fill="#94a3b8">• Manos cruzadas en</text>
        <text x="19" y="172" font-size="7" fill="#94a3b8">  Hi-Hat (R) y Caja (L)</text>
        <text x="19" y="192" font-size="7" font-weight="bold" fill="#fbbf24">• Clic = Sonar pieza</text>

        <!-- Leyenda Lateral Derecha -->
        <rect x="572" y="34" width="96" height="180" rx="6" fill="#111a2e" stroke="#334155"/>
        <text x="620" y="49" text-anchor="middle" font-size="8" font-weight="bold" fill="#f8fafc">Atajos y Kit</text>
        <text x="580" y="66" font-size="7.1" fill="#cbd5e1">B: Bombo (Pie Der)</text>
        <text x="580" y="80" font-size="7.1" fill="#cbd5e1">W: Pedal HH (Pie Izq)</text>
        <text x="580" y="94" font-size="7.1" fill="#cbd5e1">S: Caja (Mano Izq)</text>
        <text x="580" y="108" font-size="7.1" fill="#cbd5e1">H: Hi-Hat (Mano Der)</text>
        <text x="580" y="122" font-size="7.1" fill="#cbd5e1">T / Y: Toms Aéreos</text>
        <text x="580" y="136" font-size="7.1" fill="#cbd5e1">U: Tom de Piso</text>
        <text x="580" y="150" font-size="7.1" fill="#cbd5e1">C: Crash · R: Ride</text>
        <text x="580" y="172" font-size="7" font-weight="bold" fill="#f8fafc">Postura:</text>
        <text x="580" y="184" font-size="6.8" fill="#94a3b8">Cadera > rodilla (100°)</text>
        <text x="580" y="196" font-size="6.8" fill="#94a3b8">Hombros sin tensión</text>

        ${limbBadgesSvg}

        <text x="${w / 2}" y="236" text-anchor="middle" font-size="8" fill="#94a3b8">${note}</text>
      </svg>
    </figure>
  `;
}

/**
 * Interactive Guided Training Exercises for Drums, Guitar, Bass & Randomized Ordered Vocal Series
 */
export interface DrumTrainingStep {
  countLabel: string;
  actionSummary: string;
  hits: DrumLimbHit[];
}

export interface DrumTrainingBlock {
  id: string;
  title: string;
  defaultBpm: number;
  ratio: number;
  subdivisionPerBeat: 2 | 4; // 2 = eighth notes, 4 = 16th notes
  drill: string;
  cue: string;
  steps: DrumTrainingStep[];
}

export const DRUM_TRAINING_BLOCKS: DrumTrainingBlock[] = [
  {
    id: 'drum_stick_control',
    title: '1. Control de Baquetas: Singles y Paradiddle (R L R R · L R L L)',
    defaultBpm: 78,
    ratio: 0.25,
    subdivisionPerBeat: 2,
    drill: 'Alterna acentos en Caja y Hi-Hat manteniendo rebote fluido sin apretar los dedos.',
    cue: 'Mano Derecha (dorado) en Hi-Hat/Tom; Mano Izquierda (rosa) en Caja. Deja caer la baqueta por gravedad.',
    steps: [
      { countLabel: '1', actionSummary: 'R Caja★ + PD Bombo', hits: [{ piece: 'SD', limb: 'R', accent: true }, { piece: 'BD', limb: 'RF' }] },
      { countLabel: '&', actionSummary: 'L Caja suave', hits: [{ piece: 'SD', limb: 'L' }] },
      { countLabel: '2', actionSummary: 'R Hi-Hat', hits: [{ piece: 'HH', limb: 'R' }] },
      { countLabel: '&', actionSummary: 'R Hi-Hat', hits: [{ piece: 'HH', limb: 'R' }] },
      { countLabel: '3', actionSummary: 'L Caja★ + PI Pedal', hits: [{ piece: 'SD', limb: 'L', accent: true }, { piece: 'HHP', limb: 'LF' }] },
      { countLabel: '&', actionSummary: 'R Hi-Hat', hits: [{ piece: 'HH', limb: 'R' }] },
      { countLabel: '4', actionSummary: 'L Caja suave', hits: [{ piece: 'SD', limb: 'L' }] },
      { countLabel: '&', actionSummary: 'L Caja suave', hits: [{ piece: 'SD', limb: 'L' }] },
    ],
  },
  {
    id: 'drum_rock_groove',
    title: '2. Groove Rock Base (Manos Cruzadas + Bombo en 1 y 3)',
    defaultBpm: 86,
    ratio: 0.25,
    subdivisionPerBeat: 2,
    drill: 'Corcheas firmes con Mano Derecha en Hi-Hat, Mano Izquierda firme en Caja (2 y 4) y Bombo con Pie Derecho.',
    cue: 'Amarra el golpe del Hi-Hat (R) exactamente con el Bombo (PD) en 1 y 3, y con la Caja (L) en 2 y 4.',
    steps: [
      { countLabel: '1', actionSummary: 'R HH + PD Bombo', hits: [{ piece: 'HH', limb: 'R' }, { piece: 'BD', limb: 'RF', accent: true }] },
      { countLabel: '&', actionSummary: 'R Hi-Hat solo', hits: [{ piece: 'HH', limb: 'R' }] },
      { countLabel: '2', actionSummary: 'R HH + L Caja★', hits: [{ piece: 'HH', limb: 'R' }, { piece: 'SD', limb: 'L', accent: true }] },
      { countLabel: '&', actionSummary: 'R Hi-Hat solo', hits: [{ piece: 'HH', limb: 'R' }] },
      { countLabel: '3', actionSummary: 'R HH + PD Bombo', hits: [{ piece: 'HH', limb: 'R' }, { piece: 'BD', limb: 'RF', accent: true }] },
      { countLabel: '&', actionSummary: 'R HH + PD Bombo', hits: [{ piece: 'HH', limb: 'R' }, { piece: 'BD', limb: 'RF' }] },
      { countLabel: '4', actionSummary: 'R HH + L Caja★', hits: [{ piece: 'HH', limb: 'R' }, { piece: 'SD', limb: 'L', accent: true }] },
      { countLabel: '&', actionSummary: 'R Hi-Hat + PI Chick', hits: [{ piece: 'HH', limb: 'R' }, { piece: 'HHP', limb: 'LF' }] },
    ],
  },
  {
    id: 'drum_independence',
    title: '3. Independencia 4 Extremidades (Ride + Pedal HH en 2 y 4)',
    defaultBpm: 90,
    ratio: 0.25,
    subdivisionPerBeat: 2,
    drill: 'Mano Derecha lleva el Ride, Pie Izquierdo pisa Pedal HH en 2 y 4, Pie Derecho sincopa el Bombo y Mano Izquierda responde en Caja.',
    cue: 'Observa las 4 tarjetas de extremidades para verificar qué pie o mano se activa simultáneamente.',
    steps: [
      { countLabel: '1', actionSummary: 'R Ride + PD Bombo', hits: [{ piece: 'RD', limb: 'R' }, { piece: 'BD', limb: 'RF', accent: true }] },
      { countLabel: '&', actionSummary: 'R Ride solo', hits: [{ piece: 'RD', limb: 'R' }] },
      { countLabel: '2', actionSummary: 'R Ride + L Caja + PI Pedal', hits: [{ piece: 'RD', limb: 'R' }, { piece: 'SD', limb: 'L', accent: true }, { piece: 'HHP', limb: 'LF' }] },
      { countLabel: '&', actionSummary: 'R Ride + PD Bombo', hits: [{ piece: 'RD', limb: 'R' }, { piece: 'BD', limb: 'RF' }] },
      { countLabel: '3', actionSummary: 'R Ride solo', hits: [{ piece: 'RD', limb: 'R' }] },
      { countLabel: '&', actionSummary: 'R Ride + PD Bombo', hits: [{ piece: 'RD', limb: 'R' }, { piece: 'BD', limb: 'RF' }] },
      { countLabel: '4', actionSummary: 'R Ride + L Caja + PI Pedal', hits: [{ piece: 'RD', limb: 'R' }, { piece: 'SD', limb: 'L', accent: true }, { piece: 'HHP', limb: 'LF' }] },
      { countLabel: '&', actionSummary: 'R Ride + L Ghost', hits: [{ piece: 'RD', limb: 'R' }, { piece: 'SD', limb: 'L' }] },
    ],
  },
  {
    id: 'drum_tom_fill',
    title: '4. Fill Descendente por Toms y Cierre con Crash + Bombo',
    defaultBpm: 94,
    ratio: 0.25,
    subdivisionPerBeat: 2,
    drill: 'Recorre Caja → Tom 1 → Tom 2 → Floor Tom en sentido horario y resuelve al tiempo 1 con Crash (R) + Bombo (PD).',
    cue: 'Evita acelerar durante el recorrido por los toms; apunta al centro de cada parche.',
    steps: [
      { countLabel: '1', actionSummary: 'R Crash + PD Bombo', hits: [{ piece: 'CR', limb: 'R', accent: true }, { piece: 'BD', limb: 'RF', accent: true }] },
      { countLabel: '&', actionSummary: 'L Caja', hits: [{ piece: 'SD', limb: 'L' }] },
      { countLabel: '2', actionSummary: 'R Tom 1', hits: [{ piece: 'T1', limb: 'R' }] },
      { countLabel: '&', actionSummary: 'L Tom 1', hits: [{ piece: 'T1', limb: 'L' }] },
      { countLabel: '3', actionSummary: 'R Tom 2', hits: [{ piece: 'T2', limb: 'R' }] },
      { countLabel: '&', actionSummary: 'L Tom 2', hits: [{ piece: 'T2', limb: 'L' }] },
      { countLabel: '4', actionSummary: 'R Floor Tom', hits: [{ piece: 'FT', limb: 'R', accent: true }] },
      { countLabel: '&', actionSummary: 'L Floor Tom + PI HH', hits: [{ piece: 'FT', limb: 'L' }, { piece: 'HHP', limb: 'LF' }] },
    ],
  },
];

export interface FretTrainingNotePos {
  sIdx: number;
  fret: number;
  finger: 0 | 1 | 2 | 3 | 4;
}

export interface GuitarTrainingStep {
  label: string;
  rightHandCue: string;
  isChord?: boolean;
  chordSymbol?: string;
  positions: FretTrainingNotePos[];
}

export interface GuitarTrainingBlock {
  id: string;
  title: string;
  defaultBpm: number;
  ratio: number;
  subdivisionPerBeat: 1 | 2;
  drill: string;
  cue: string;
  steps: GuitarTrainingStep[];
}

export const GUITAR_TRAINING_BLOCKS: GuitarTrainingBlock[] = [
  {
    id: 'gtr_spider',
    title: '1. Calentamiento Motor (Araña 1-2-3-4 en Trastes 5–8)',
    defaultBpm: 72,
    ratio: 0.25,
    subdivisionPerBeat: 2,
    drill: 'Sube y baja por las cuerdas tocando exactamente 1 dedo por traste con púa alternada (↓ ↑).',
    cue: 'Deja el pulgar detrás del mástil y levanta los dedos apenas unos milímetros.',
    steps: [
      { label: '6ª tr.5 (Dedo 1)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 5, fret: 5, finger: 1 }] },
      { label: '6ª tr.6 (Dedo 2)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 5, fret: 6, finger: 2 }] },
      { label: '6ª tr.7 (Dedo 3)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 5, fret: 7, finger: 3 }] },
      { label: '6ª tr.8 (Dedo 4)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 5, fret: 8, finger: 4 }] },
      { label: '5ª tr.5 (Dedo 1)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 4, fret: 5, finger: 1 }] },
      { label: '5ª tr.6 (Dedo 2)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 4, fret: 6, finger: 2 }] },
      { label: '5ª tr.7 (Dedo 3)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 4, fret: 7, finger: 3 }] },
      { label: '5ª tr.8 (Dedo 4)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 4, fret: 8, finger: 4 }] },
    ],
  },
  {
    id: 'gtr_chords',
    title: '2. Cambio Limpio de Acordes (C – G – Am – Fmaj7)',
    defaultBpm: 76,
    ratio: 0.25,
    subdivisionPerBeat: 1,
    drill: 'Toca cada acorde limpio dejando sonar todas las cuerdas correctas; anticipa mentalmente el siguiente molde.',
    cue: 'Coloca primero el dedo guía del bajo y mantén el péndulo constante en la mano derecha.',
    steps: [
      {
        label: 'Do Mayor (C)',
        chordSymbol: 'C',
        rightHandCue: 'Rasgueo ↓ ↓ ↑',
        isChord: true,
        positions: [
          { sIdx: 4, fret: 3, finger: 3 },
          { sIdx: 3, fret: 2, finger: 2 },
          { sIdx: 2, fret: 0, finger: 0 },
          { sIdx: 1, fret: 1, finger: 1 },
          { sIdx: 0, fret: 0, finger: 0 },
        ],
      },
      {
        label: 'Sol Mayor (G)',
        chordSymbol: 'G',
        rightHandCue: 'Rasgueo ↓ ↓ ↑',
        isChord: true,
        positions: [
          { sIdx: 5, fret: 3, finger: 2 },
          { sIdx: 4, fret: 2, finger: 1 },
          { sIdx: 3, fret: 0, finger: 0 },
          { sIdx: 2, fret: 0, finger: 0 },
          { sIdx: 1, fret: 0, finger: 0 },
          { sIdx: 0, fret: 3, finger: 3 },
        ],
      },
      {
        label: 'La Menor (Am)',
        chordSymbol: 'Am',
        rightHandCue: 'Rasgueo ↓ ↓ ↑',
        isChord: true,
        positions: [
          { sIdx: 4, fret: 0, finger: 0 },
          { sIdx: 3, fret: 2, finger: 2 },
          { sIdx: 2, fret: 2, finger: 3 },
          { sIdx: 1, fret: 1, finger: 1 },
          { sIdx: 0, fret: 0, finger: 0 },
        ],
      },
      {
        label: 'Fa Maj7 (Fmaj7)',
        chordSymbol: 'Fmaj7',
        rightHandCue: 'Rasgueo ↓ ↑ ↓',
        isChord: true,
        positions: [
          { sIdx: 3, fret: 3, finger: 3 },
          { sIdx: 2, fret: 2, finger: 2 },
          { sIdx: 1, fret: 1, finger: 1 },
          { sIdx: 0, fret: 0, finger: 0 },
        ],
      },
    ],
  },
  {
    id: 'gtr_perm1324',
    title: '3. Velocidad y Permutación Disociada (1-3-2-4 · Escala Am)',
    defaultBpm: 92,
    ratio: 0.25,
    subdivisionPerBeat: 2,
    drill: 'Alterna dedos 1-3-2-4 entre las cuerdas 4ª, 3ª y 2ª para soltar el anular y meñique sin tensión.',
    cue: 'Si pierdes limpieza rítmica, baja 5 BPM con el control antes de subir velocidad.',
    steps: [
      { label: '4ª tr.5 (Dedo 1)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 3, fret: 5, finger: 1 }] },
      { label: '4ª tr.7 (Dedo 3)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 3, fret: 7, finger: 3 }] },
      { label: '4ª tr.6 (Dedo 2)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 3, fret: 6, finger: 2 }] },
      { label: '4ª tr.8 (Dedo 4)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 3, fret: 8, finger: 4 }] },
      { label: '3ª tr.5 (Dedo 1)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 2, fret: 5, finger: 1 }] },
      { label: '3ª tr.7 (Dedo 3)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 2, fret: 7, finger: 3 }] },
      { label: '2ª tr.5 (Dedo 1)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 1, fret: 5, finger: 1 }] },
      { label: '2ª tr.8 (Dedo 4)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 1, fret: 8, finger: 4 }] },
    ],
  },
  {
    id: 'gtr_groove_arpegio',
    title: '4. Arpegio Funcional + Acordes de Color (Em7 – A7 – Dmaj7)',
    defaultBpm: 88,
    ratio: 0.25,
    subdivisionPerBeat: 1,
    drill: 'Combina el rasgueo de tríadas y séptimas con pulgar e índice siguiendo la progresión ii–V–I en Re.',
    cue: 'Escucha cómo resuelve el Sol (b7 de A7) bajando medio tono hacia Fa# (3ª de Dmaj7).',
    steps: [
      {
        label: 'Mi Menor 7 (Em7)',
        chordSymbol: 'Em7',
        rightHandCue: 'Pulgar + ↓ ↑',
        isChord: true,
        positions: [
          { sIdx: 5, fret: 0, finger: 0 },
          { sIdx: 4, fret: 2, finger: 2 },
          { sIdx: 3, fret: 0, finger: 0 },
          { sIdx: 2, fret: 0, finger: 0 },
          { sIdx: 1, fret: 0, finger: 0 },
          { sIdx: 0, fret: 0, finger: 0 },
        ],
      },
      {
        label: 'La Dominante 7 (A7)',
        chordSymbol: 'A7',
        rightHandCue: 'Pulgar + ↓ ↑',
        isChord: true,
        positions: [
          { sIdx: 4, fret: 0, finger: 0 },
          { sIdx: 3, fret: 2, finger: 1 },
          { sIdx: 2, fret: 0, finger: 0 },
          { sIdx: 1, fret: 2, finger: 2 },
          { sIdx: 0, fret: 0, finger: 0 },
        ],
      },
      {
        label: 'Re Maj7 (Dmaj7)',
        chordSymbol: 'Dmaj7',
        rightHandCue: 'Arpegio P-i-m-a',
        isChord: true,
        positions: [
          { sIdx: 3, fret: 0, finger: 0 },
          { sIdx: 2, fret: 2, finger: 1 },
          { sIdx: 1, fret: 2, finger: 2 },
          { sIdx: 0, fret: 2, finger: 3 },
        ],
      },
      {
        label: 'Re 6 / Reposo (D)',
        chordSymbol: 'D',
        rightHandCue: 'Rasgueo abierto ↓',
        isChord: true,
        positions: [
          { sIdx: 3, fret: 0, finger: 0 },
          { sIdx: 2, fret: 2, finger: 1 },
          { sIdx: 1, fret: 3, finger: 3 },
          { sIdx: 0, fret: 2, finger: 2 },
        ],
      },
    ],
  },
];

export interface BassTrainingStep {
  label: string;
  rightHandCue: string;
  kickSync: boolean;
  style: 'finger' | 'slap';
  sIdx: number; // 0=G, 1=D, 2=A, 3=E (works identically on BASS_4C and top 4 strings of BASS_5C)
  fret: number;
}

export interface BassTrainingBlock {
  id: string;
  title: string;
  defaultBpm: number;
  ratio: number;
  subdivisionPerBeat: 1 | 2;
  drill: string;
  cue: string;
  steps: BassTrainingStep[];
}

export const BASS_TRAINING_BLOCKS: BassTrainingBlock[] = [
  {
    id: 'bass_im_1234',
    title: '1. Alternancia Estricta Índice–Medio (I–M) en Trastes 5–8',
    defaultBpm: 76,
    ratio: 0.25,
    subdivisionPerBeat: 2,
    drill: 'Alterna estrictamente Índice (I) y Medio (M) sin repetir dedo al cruzar de la 4ª (E) a la 3ª cuerda (A).',
    cue: 'Descansa el pulgar derecho sobre la pastilla y apaga la cuerda superior al bajar.',
    steps: [
      { label: '4ª tr.5 (A1)', rightHandCue: 'Dedo I', kickSync: true, style: 'finger', sIdx: 3, fret: 5 },
      { label: '4ª tr.6 (Bb1)', rightHandCue: 'Dedo M', kickSync: false, style: 'finger', sIdx: 3, fret: 6 },
      { label: '4ª tr.7 (B1)', rightHandCue: 'Dedo I', kickSync: false, style: 'finger', sIdx: 3, fret: 7 },
      { label: '4ª tr.8 (C2)', rightHandCue: 'Dedo M', kickSync: false, style: 'finger', sIdx: 3, fret: 8 },
      { label: '3ª tr.5 (D2)', rightHandCue: 'Dedo I', kickSync: true, style: 'finger', sIdx: 2, fret: 5 },
      { label: '3ª tr.6 (Eb2)', rightHandCue: 'Dedo M', kickSync: false, style: 'finger', sIdx: 2, fret: 6 },
      { label: '3ª tr.7 (E2)', rightHandCue: 'Dedo I', kickSync: false, style: 'finger', sIdx: 2, fret: 7 },
      { label: '3ª tr.8 (F2)', rightHandCue: 'Dedo M', kickSync: false, style: 'finger', sIdx: 2, fret: 8 },
    ],
  },
  {
    id: 'bass_lockin',
    title: '2. Lock-In Bombo + Bajo (Cajón Tónica – 5ª – Octava en C)',
    defaultBpm: 88,
    ratio: 0.25,
    subdivisionPerBeat: 2,
    drill: 'Amarra la tónica C y su quinta G exactamente sobre los golpes marcados con Bombo.',
    cue: 'Controla cuándo se corta la nota levantando suavemente la presión de la mano izquierda.',
    steps: [
      { label: 'C2 Raíz (3ª tr.3)', rightHandCue: 'I + Bombo', kickSync: true, style: 'finger', sIdx: 2, fret: 3 },
      { label: 'G2 5ª (2ª tr.5)', rightHandCue: 'M firme', kickSync: false, style: 'finger', sIdx: 1, fret: 5 },
      { label: 'C3 Octava (1ª tr.5)', rightHandCue: 'I Staccato', kickSync: false, style: 'finger', sIdx: 0, fret: 5 },
      { label: 'Bb2 b7 (1ª tr.3)', rightHandCue: 'M ligada', kickSync: false, style: 'finger', sIdx: 0, fret: 3 },
      { label: 'G1 5ª Grave (4ª tr.3)', rightHandCue: 'I + Bombo', kickSync: true, style: 'finger', sIdx: 3, fret: 3 },
      { label: 'C2 Raíz (3ª tr.3)', rightHandCue: 'M', kickSync: false, style: 'finger', sIdx: 2, fret: 3 },
      { label: 'C2 Raíz (3ª tr.3)', rightHandCue: 'I + Bombo', kickSync: true, style: 'finger', sIdx: 2, fret: 3 },
      { label: 'G1 Anacrusa (4ª tr.3)', rightHandCue: 'M', kickSync: false, style: 'finger', sIdx: 3, fret: 3 },
    ],
  },
  {
    id: 'bass_slap_octaves',
    title: '3. Octavas Funk y Slap/Pop (E1 → E2 → G1 → G2 → A1 → A2)',
    defaultBpm: 94,
    ratio: 0.25,
    subdivisionPerBeat: 2,
    drill: 'Golpea la nota grave con el hueso del pulgar (Thumb) y pellizca la octava dos cuerdas abajo (Pop).',
    cue: 'Mueve el antebrazo con rotación de picaporte, no con tirones del brazo entero.',
    steps: [
      { label: 'E1 (4ª al aire)', rightHandCue: 'Thumb + Bombo', kickSync: true, style: 'slap', sIdx: 3, fret: 0 },
      { label: 'E2 Octava (2ª tr.2)', rightHandCue: 'Pop Índice', kickSync: false, style: 'slap', sIdx: 1, fret: 2 },
      { label: 'G1 (4ª tr.3)', rightHandCue: 'Thumb + Bombo', kickSync: true, style: 'slap', sIdx: 3, fret: 3 },
      { label: 'G2 Octava (2ª tr.5)', rightHandCue: 'Pop Índice', kickSync: false, style: 'slap', sIdx: 1, fret: 5 },
      { label: 'A1 (4ª tr.5)', rightHandCue: 'Thumb + Bombo', kickSync: true, style: 'slap', sIdx: 3, fret: 5 },
      { label: 'A2 Octava (2ª tr.7)', rightHandCue: 'Pop Índice', kickSync: false, style: 'slap', sIdx: 1, fret: 7 },
      { label: 'B1 (3ª tr.2)', rightHandCue: 'Thumb', kickSync: false, style: 'slap', sIdx: 2, fret: 2 },
      { label: 'E2 Reposo (2ª tr.2)', rightHandCue: 'Pop suave', kickSync: false, style: 'slap', sIdx: 1, fret: 2 },
    ],
  },
  {
    id: 'bass_walking',
    title: '4. Walking Bass ii–V–I (Dm7 – G7 – Cmaj7 con Aproximaciones)',
    defaultBpm: 100,
    ratio: 0.25,
    subdivisionPerBeat: 1,
    drill: 'Camina en negras conectando raíces y terceras con aproximaciones cromáticas en el pulso 4.',
    cue: 'Canta la línea grave mientras la tocas; conecta siempre el pulso 4 a medio tono del nuevo acorde.',
    steps: [
      { label: 'D2 · Dm7 Raíz (3ª tr.5)', rightHandCue: 'I + Bombo', kickSync: true, style: 'finger', sIdx: 2, fret: 5 },
      { label: 'F2 · b3 (2ª tr.3)', rightHandCue: 'M', kickSync: false, style: 'finger', sIdx: 1, fret: 3 },
      { label: 'A2 · 5ª (2ª tr.7)', rightHandCue: 'I', kickSync: false, style: 'finger', sIdx: 1, fret: 7 },
      { label: 'Ab2 · Cromática→G', rightHandCue: 'M (Puente)', kickSync: false, style: 'finger', sIdx: 1, fret: 6 },
      { label: 'G1 · G7 Raíz (4ª tr.3)', rightHandCue: 'I + Bombo', kickSync: true, style: 'finger', sIdx: 3, fret: 3 },
      { label: 'B1 · 3ª Mayor (3ª tr.2)', rightHandCue: 'M', kickSync: false, style: 'finger', sIdx: 2, fret: 2 },
      { label: 'D2 · 5ª (3ª tr.5)', rightHandCue: 'I', kickSync: false, style: 'finger', sIdx: 2, fret: 5 },
      { label: 'C2 · Cmaj7 Destino (3ª tr.3)', rightHandCue: 'M + Bombo', kickSync: true, style: 'finger', sIdx: 2, fret: 3 },
    ],
  },
];

export type VocalTrainingLevel = 1 | 2 | 3;

export type VocalTrainingCategory =
  | 'breathing_support'
  | 'warmup_vibrations'
  | 'nasality_registers'
  | 'passaggio_intonation'
  | 'agility_singing';

export interface VocalBreathStep {
  label: string;
  cue: string;
  beats: number;
  kind: 'inhale' | 'hold' | 'exhale';
}

export interface VocalTrainingExercise {
  id: string;
  level: VocalTrainingLevel;
  phaseOrder: 1 | 2 | 3 | 4;
  category: VocalTrainingCategory;
  phaseLabel: string;
  focusTag: string;
  title: string;
  defaultBpm: number;
  ratio: number;
  vowel: 'a' | 'e' | 'i' | 'o' | 'u' | 'lip';
  syllableCue: string;
  postureCue: string;
  howToSteps: string[];
  commonMistake: string;
  baseMidi: number;
  patternOffsets: number[];
  isBreathingOnly?: boolean;
  breathSteps?: VocalBreathStep[];
}

const PHASE_1_LABEL = 'Fase 1 · Respiración y Calentamiento / Vibraciones';
const PHASE_2_LABEL = 'Fase 2 · Nasalidad, Voz de Pecho y Voz de Cabeza';
const PHASE_3_LABEL = 'Fase 3 · Passaggio, Entonación y Afinación';
const PHASE_4_LABEL = 'Fase 4 · Agilidad, Afinación y Canto Aplicado';

// Ordered slots inside each level (12 exercises per level):
// 0: Breathing 1 (ALWAYS first), 1: Breathing 2 (ALWAYS second when 20/30 min),
// 2: Warmup/Vibrations 1, 3: Warmup/Vibrations 2,
// 4: Nasality (plus Pecho/Cabeza balance cue), 5: Voz de Pecho, 6: Voz de Cabeza,
// 7: Passaggio, 8: Entonación, 9: Afinación,
// 10: Agilidad y Afinación, 11: Canto y Expresión
const VOCAL_LEVEL_1_EXERCISES: VocalTrainingExercise[] = [
  {
    id: 'v1_breath_diafragmatica',
    level: 1,
    phaseOrder: 1,
    category: 'breathing_support',
    phaseLabel: PHASE_1_LABEL,
    focusTag: '🌬️ Respiración (Obligatorio 1º)',
    title: 'Respiración Costo-Diafragmática y Exhalación "Sss"',
    defaultBpm: 66,
    ratio: 0.1,
    vowel: 'lip',
    syllableCue: 'Sin cantar aún · Exhalación constante en "Ssssss" suave',
    postureCue: 'Pies al ancho de hombros, pecho estable (no sube), expansión lateral en costillas bajas y abdomen.',
    howToSteps: [
      'Inhala por la nariz/boca en 4 pulsos dejando que bajen el diafragma y se abran las costillas flotantes.',
      'Mantén el aire suspendido 2 pulsos con la garganta completamente abierta y relajada (sin trancar).',
      'Exhala 8 pulsos con una "Sss" fina y pareja sintiendo el cinturón abdominal sostener la salida.',
    ],
    commonMistake: 'Subir los hombros al inhalar o soltar todo el aire en el primer segundo de la "Sss".',
    baseMidi: 60,
    patternOffsets: [0, 0, 0, 0],
    isBreathingOnly: true,
    breathSteps: [
      { label: 'Inhala 4t', cue: 'Expande costillas y abdomen sin elevar hombros', beats: 4, kind: 'inhale' },
      { label: 'Suspende 2t', cue: 'Garganta abierta, mantén costillas anchas', beats: 2, kind: 'hold' },
      { label: 'Exhala "Sss" 8t', cue: 'Hilo fino y constante, sin empujar', beats: 8, kind: 'exhale' },
    ],
  },
  {
    id: 'v1_breath_recuperacion',
    level: 1,
    phaseOrder: 1,
    category: 'breathing_support',
    phaseLabel: PHASE_1_LABEL,
    focusTag: '🌬️ Apoyo Respiratorio',
    title: 'Impulso Suave "Fff – Sss" y Recuperación Silenciosa',
    defaultBpm: 70,
    ratio: 0.1,
    vowel: 'lip',
    syllableCue: 'Pulsos rítmicos de aire en "Fff" + relajación inmediata del abdomen',
    postureCue: 'Cuello suelto; imagina un acordeón suave entre las costillas inferiores.',
    howToSteps: [
      'Toma una inhalación silenciosa en 2 pulsos (como sorpresa agradable, sin ruido en la garganta).',
      'Haz 4 pulsos suaves de "Fff" separados por micro-pausas manteniendo las costillas abiertas.',
      'Al terminar el cuarto pulso, suelta el abdomen para que el aire vuelva a entrar solo sin esfuerzo.',
    ],
    commonMistake: 'Jalar aire con ruido agudo ("jadeo") o apretar la mandíbula entre cada impulso.',
    baseMidi: 60,
    patternOffsets: [0, 0, 0, 0],
    isBreathingOnly: true,
    breathSteps: [
      { label: 'Toma Silenciosa 2t', cue: 'Abre boca y costillas en silencio total', beats: 2, kind: 'inhale' },
      { label: 'Pulsos "Fff" 4t', cue: 'Cuatro empujes suaves desde la zona baja', beats: 4, kind: 'exhale' },
      { label: 'Suelta y Recupera 2t', cue: 'Relaja el cinturón abdominal y deja entrar el aire', beats: 2, kind: 'hold' },
    ],
  },
  {
    id: 'v1_warmup_lip_trill',
    level: 1,
    phaseOrder: 1,
    category: 'warmup_vibrations',
    phaseLabel: PHASE_1_LABEL,
    focusTag: '💫 Calentamiento y Vibraciones',
    title: 'Lip Trill ("Brrr") · Vibración Labial en 5 Notas',
    defaultBpm: 72,
    ratio: 0.1,
    vowel: 'lip',
    syllableCue: '"Brrrrr" continuo despertando vibración labial suave',
    postureCue: 'Si los labios se detienen, coloca suavemente dos dedos en las comisuras de las mejillas hacia arriba.',
    howToSteps: [
      'Aplica la respiración del paso anterior antes de emitir el primer sonido.',
      'Haz vibrar los labios con "Brrr" recorriendo 1–2–3–4–5–4–3–2–1 a volumen muy cómodo.',
      'Observa un cosquilleo ligero en labios y frente sin sentir presión en la nuez.',
    ],
    commonMistake: 'Soplar con demasiada fuerza o dejar que el labio deje de vibrar al llegar al 5º grado.',
    baseMidi: 60,
    patternOffsets: [0, 2, 4, 5, 7, 5, 4, 2, 0],
  },
  {
    id: 'v1_warmup_humming',
    level: 1,
    phaseOrder: 1,
    category: 'warmup_vibrations',
    phaseLabel: PHASE_1_LABEL,
    focusTag: '🫧 Vibraciones y Desbloqueo',
    title: 'Zumbido "Mmm" (Vibración en Máscara y Labios)',
    defaultBpm: 70,
    ratio: 0.1,
    vowel: 'u',
    syllableCue: '"Mmmmmm" suave sintiendo vibración en pómulos y nariz',
    postureCue: 'Labios cerrados sin fuerza, muelas separadas 1 cm por dentro y lengua descansando abajo.',
    howToSteps: [
      'Bosteza suavemente con la boca cerrada para crear espacio interno detrás del paladar.',
      'Canta "Mmm" en tríada 1–3–5–3–1 buscando vibración clara en los labios y el puente nasal.',
      'Mantén la sensación de vibración frontal sin empujar volumen.',
    ],
    commonMistake: 'Apretar las muelas o retroceder la lengua hacia la garganta.',
    baseMidi: 60,
    patternOffsets: [0, 4, 7, 4, 0],
  },
  {
    id: 'v1_nasality_balance',
    level: 1,
    phaseOrder: 2,
    category: 'nasality_registers',
    phaseLabel: PHASE_2_LABEL,
    focusTag: '👃 Nasalidad + Balance Pecho/Cabeza',
    title: 'Control de Nasalidad ("Ma–Ba–Ma") y Balance Base',
    defaultBpm: 74,
    ratio: 0.1,
    vowel: 'a',
    syllableCue: 'Alterna "Ma" (con brillo frontal) y "Ba" (100% oral, cero escape nasal)',
    postureCue: 'Haz la prueba rápida de tapar la nariz 1 segundo en la "Ba": el sonido no debe cambiar ni ahogarse.',
    howToSteps: [
      'Comienza con "Ma" sintiendo resonancia brillante adelante sin dejar caer el velo del paladar en exceso.',
      'Cambia a "Ba" elevando ligeramente el paladar blando como al oler una flor (sonido oral redondo).',
      'Combina suavidad en las notas agudas del patrón para equilibrar pecho cómodo y ligereza superior.',
    ],
    commonMistake: 'Dejar que la vocal "a" suene gangosa/nasal cuando deja la consonante "M".',
    baseMidi: 60,
    patternOffsets: [0, 2, 4, 2, 0, 4, 0],
  },
  {
    id: 'v1_chest_voice',
    level: 1,
    phaseOrder: 2,
    category: 'nasality_registers',
    phaseLabel: PHASE_2_LABEL,
    focusTag: '🫁 Voz de Pecho',
    title: 'Voz de Pecho Hablada y Firme ("Bah–Mah–Bah")',
    defaultBpm: 76,
    ratio: 0.1,
    vowel: 'a',
    syllableCue: '"Bah – Mah – Bah" con naturalidad de voz hablada y clara',
    postureCue: 'Coloca una palma suave sobre el esternón: sentirás vibración cálida y estable en el pecho.',
    howToSteps: [
      'Habla primero "Bah" en tu tono cómodo y convierte esa misma sensación natural en canto.',
      'Canta 1–3–5–3–1 manteniendo la mandíbula vertical sin forzar volumen ni oscurecer de más.',
      'Asegura un cierre vocal limpio y sin aire escapado ("voz firme y cálida").',
    ],
    commonMistake: 'Gritar o empujar la laringe hacia abajo para sonar artificialmente más grave.',
    baseMidi: 57,
    patternOffsets: [0, 4, 7, 4, 0],
  },
  {
    id: 'v1_head_voice',
    level: 1,
    phaseOrder: 2,
    category: 'nasality_registers',
    phaseLabel: PHASE_2_LABEL,
    focusTag: '👑 Voz de Cabeza',
    title: 'Voz de Cabeza Ligera ("Hoo–Wuu") Tipo Lechuza',
    defaultBpm: 74,
    ratio: 0.1,
    vowel: 'u',
    syllableCue: '"Hoo – Wuu" dulce, ligera y enfocada en la coronilla',
    postureCue: 'Labios en forma de pequeño círculo suave; sensación de flotar sin peso de pecho.',
    howToSteps: [
      'Arranca arriba en la 5ª nota con una "Hoo" muy liviana y redonda, sin apretar.',
      'Desciende por grados conjuntos (5–4–3–2–1) conservando la ligereza de cabeza sin golpear al bajar.',
      'Deja que el aire fluya parejo con mínimo esfuerzo muscular.',
    ],
    commonMistake: 'Intentar cantar la nota alta con peso de voz hablada o dejar escapar demasiado aire roto.',
    baseMidi: 64,
    patternOffsets: [7, 5, 4, 2, 0],
  },
  {
    id: 'v1_passaggio_bridge',
    level: 1,
    phaseOrder: 3,
    category: 'passaggio_intonation',
    phaseLabel: PHASE_3_LABEL,
    focusTag: '🌉 Passaggio',
    title: 'Primer Puente Mixto ("Guh → Goh") en 1–3–5–3–1',
    defaultBpm: 76,
    ratio: 0.1,
    vowel: 'o',
    syllableCue: 'Consonante suave "G" para unir cuerdas + vocal cerrada "/u/"→"/o/"',
    postureCue: 'Al subir al 5º grado, redondea los labios suavemente para evitar que la voz se abra o se rompa.',
    howToSteps: [
      'La sílaba "Guh" ayuda a juntar los pliegues vocales sin empuje excesivo al cruzar hacia el puente.',
      'Permite que la voz se vuelva un poco más delgada al subir, sin miedo a perder volumen.',
      'Regresa a la tónica con el mismo foco frontal sin "caer" de golpe al registro pesado.',
    ],
    commonMistake: 'Estirar la boca hacia los lados al subir, provocando quiebre o gallo en el passaggio.',
    baseMidi: 60,
    patternOffsets: [0, 4, 7, 4, 0],
  },
  {
    id: 'v1_intonation_thirds',
    level: 1,
    phaseOrder: 3,
    category: 'passaggio_intonation',
    phaseLabel: PHASE_3_LABEL,
    focusTag: '🎯 Entonación',
    title: 'Entonación Limpia de Segundas y Terceras ("Do–Re–Mi")',
    defaultBpm: 74,
    ratio: 0.1,
    vowel: 'e',
    syllableCue: 'Escucha el piano 1 pulso en mente antes de cantar cada nota afinada',
    postureCue: 'Cabeza nivelada; no levantes la barbilla en las notas más agudas ni la bajes en las graves.',
    howToSteps: [
      'Asegura que el 3er grado (3ª mayor) quede ligeramente brillante y arriba, nunca "caído".',
      'Canta sin deslizar desde abajo ("cero portamento"): entra directo al centro exacto de la nota.',
      'Al bajar 3–2–1, mantén el apoyo costal activo para no desafinar hacia abajo.',
    ],
    commonMistake: 'Quedarse corto de afinación en la tercera mayor o descender sin apoyo.',
    baseMidi: 60,
    patternOffsets: [0, 2, 4, 2, 0],
  },
  {
    id: 'v1_tuning_octave_target',
    level: 1,
    phaseOrder: 3,
    category: 'passaggio_intonation',
    phaseLabel: PHASE_3_LABEL,
    focusTag: '🎚️ Afinación',
    title: 'Afinación Estable en Arpegio 1–3–5–8–5–3–1',
    defaultBpm: 76,
    ratio: 0.1,
    vowel: 'o',
    syllableCue: '"No – No – No" centrando exactamente la afinación en cada salto',
    postureCue: 'Costillas expandidas de inicio a fin; el aire mantiene la afinación estable en el 8º grado.',
    howToSteps: [
      'Escucha el acorde tónica en el piano para ubicar mentalmente la 5ª y la 8ª antes de atacar.',
      'Redondea la vocal /o/ al llegar a la octava para mantener afinación centrada y cero tensión.',
      'Comprueba al final del patrón que la nota 1 suena exactamente igual de afinada que al inicio.',
    ],
    commonMistake: 'Quedarse plano (bajo) al aterrizar en la octava o caer de tono al volver al 1.',
    baseMidi: 58,
    patternOffsets: [0, 4, 7, 12, 7, 4, 0],
  },
  {
    id: 'v1_agility_five_note',
    level: 1,
    phaseOrder: 4,
    category: 'agility_singing',
    phaseLabel: PHASE_4_LABEL,
    focusTag: '⚡ Agilidad y Afinación',
    title: 'Agilidad Base en 5 Notas ("La–Le–Li–Le–La")',
    defaultBpm: 84,
    ratio: 0.1,
    vowel: 'a',
    syllableCue: 'Solo la punta de la lengua articula; mandíbula quieta y relajada',
    postureCue: 'Flujo de aire ligero y continuo; agilidad significa soltura, no fuerza.',
    howToSteps: [
      'Canta 1–2–3–4–5–4–3–2–1 separando cada nota con precisión sin emborronar los tonos.',
      'Mantén las cinco notas con el mismo volumen parejo.',
      'Verifica que la velocidad no sacrifique la afinación del 2º y 4º grado.',
    ],
    commonMistake: 'Mover la mandíbula hacia arriba y abajo con cada cambio de nota.',
    baseMidi: 60,
    patternOffsets: [0, 2, 4, 5, 7, 5, 4, 2, 0],
  },
  {
    id: 'v1_singing_phrase',
    level: 1,
    phaseOrder: 4,
    category: 'agility_singing',
    phaseLabel: PHASE_4_LABEL,
    focusTag: '🎶 Canto Aplicado',
    title: 'Fraseo Cantado Legato ("Mah–Meh–Moh" Expresivo)',
    defaultBpm: 76,
    ratio: 0.1,
    vowel: 'a',
    syllableCue: 'Une todas las notas en una sola línea fluida y expresiva de canto',
    postureCue: 'Expresión facial natural, mirada relajada, apoyo continuo hasta el último pulso de la frase.',
    howToSteps: [
      'Aplica todo lo trabajado: respiración previa silenciosa, vibración frontal y cero tensión.',
      'Canta la melodía 1–3–5–6–5–3–2–1 como si contaras una frase musical con intención.',
      'Sostén la última nota 2 pulsos con estabilidad y afinación limpia sin cortar el aire de golpe.',
    ],
    commonMistake: 'Cortar el apoyo antes de terminar la última nota de la frase.',
    baseMidi: 60,
    patternOffsets: [0, 4, 7, 9, 7, 4, 2, 0],
  },
];

const VOCAL_LEVEL_2_EXERCISES: VocalTrainingExercise[] = [
  {
    id: 'v2_breath_expansion_hold',
    level: 2,
    phaseOrder: 1,
    category: 'breathing_support',
    phaseLabel: PHASE_1_LABEL,
    focusTag: '🌬️ Respiración (Obligatorio 1º)',
    title: 'Appoggio Clásico: Expansión Costal y Exhalación "Zzz" 10t',
    defaultBpm: 70,
    ratio: 0.1,
    vowel: 'lip',
    syllableCue: 'Vibración sonora "Zzz" constante manteniendo costillas abiertas',
    postureCue: 'Esternón noble (erguido pero sin rigidez), espalda baja expandiéndose hacia atrás y los lados.',
    howToSteps: [
      'Inhala en 4 pulsos expandiendo 360° alrededor de la cintura y costillas inferiores.',
      'Suspende 3 pulsos sintiendo que el diafragma resiste suavemente sin cerrar la laringe.',
      'Exhala en "Zzz" durante 10 pulsos manteniendo la pared abdominal elástica (sin colapsar el pecho).',
    ],
    commonMistake: 'Colapsar el esternón al llegar al pulso 5 de la exhalación.',
    baseMidi: 60,
    patternOffsets: [0, 0, 0, 0],
    isBreathingOnly: true,
    breathSteps: [
      { label: 'Inhala 360° (4t)', cue: 'Expande costillas, espalda baja y abdomen', beats: 4, kind: 'inhale' },
      { label: 'Appoggio 3t', cue: 'Sostén expansión abierta con garganta libre', beats: 3, kind: 'hold' },
      { label: 'Exhala "Zzz" 10t', cue: 'Flujo sonoro parejo sin hundir el pecho', beats: 10, kind: 'exhale' },
    ],
  },
  {
    id: 'v2_breath_staccato_control',
    level: 2,
    phaseOrder: 1,
    category: 'breathing_support',
    phaseLabel: PHASE_1_LABEL,
    focusTag: '🌬️ Apoyo Dinámico',
    title: 'Pulsos Staccato "Shh–Shh–Shh" + Rebote Elástico',
    defaultBpm: 76,
    ratio: 0.1,
    vowel: 'lip',
    syllableCue: '4 impulsos cortos en "Shh" + 1 exhalación continua en "Sss"',
    postureCue: 'Cada "Shh" nace del abdomen bajo como risa silenciosa; hombros totalmente inmóviles.',
    howToSteps: [
      'Inhala en 2 pulsos relajando la faja abdominal.',
      'Ejecuta 4 golpes secos y elásticos de "Shh" sin re-inhalar entre ellos.',
      'Sin soltar del todo, enlaza 4 pulsos seguidos de "Sss" continua para comprobar control residual.',
    ],
    commonMistake: 'Tensionar la nuca o cerrar la garganta entre cada pulso de "Shh".',
    baseMidi: 60,
    patternOffsets: [0, 0, 0, 0],
    isBreathingOnly: true,
    breathSteps: [
      { label: 'Inhala 2t', cue: 'Carga baja silenciosa', beats: 2, kind: 'inhale' },
      { label: '4x "Shh" (4t)', cue: 'Rebote elástico abdominal sin apretar cuello', beats: 4, kind: 'exhale' },
      { label: '"Sss" Ligada 4t', cue: 'Exhalación pareja sin perder postura costal', beats: 4, kind: 'exhale' },
    ],
  },
  {
    id: 'v2_warmup_straw_sovt',
    level: 2,
    phaseOrder: 1,
    category: 'warmup_vibrations',
    phaseLabel: PHASE_1_LABEL,
    focusTag: '💫 Calentamiento y Vibraciones',
    title: 'Tracción SOVT Pajilla /u/ · Arpegio Completo (1–3–5–8–5–3–1)',
    defaultBpm: 78,
    ratio: 0.1,
    vowel: 'u',
    syllableCue: '"/u/" estrecha (como soplar en pajilla) sintiendo vibración facial',
    postureCue: 'Labios proyectados ligeramente al frente; presión equilibrada arriba y abajo de las cuerdas vocales.',
    howToSteps: [
      'Activa primero el flujo de aire en 1 pulso y luego entra al /u/ cerrado y brillante.',
      'Recorre el arpegio hasta la octava sintiendo vibración en los labios y el paladar duro.',
      'Desciende suavemente comprobando cero fatiga o carraspera.',
    ],
    commonMistake: 'Ensanchar los labios al subir a la octava perdiendo la resistencia SOVT.',
    baseMidi: 58,
    patternOffsets: [0, 4, 7, 12, 7, 4, 0],
  },
  {
    id: 'v2_warmup_tongue_trill',
    level: 2,
    phaseOrder: 1,
    category: 'warmup_vibrations',
    phaseLabel: PHASE_1_LABEL,
    focusTag: '🫧 Vibraciones y Lengua Libre',
    title: 'Vibración Lingual "Rrrr" en Escala de 9 Notas',
    defaultBpm: 80,
    ratio: 0.1,
    vowel: 'lip',
    syllableCue: '"Rrrrr" suave con punta de la lengua vibrante y mandíbula quieta',
    postureCue: 'Si cuesta la "Rrrr", alterna con Lip Trill "Brrr" buscando la misma vibración frontal.',
    howToSteps: [
      'Asegura que la lengua vibre con poco aire, nunca con fuerza bruta.',
      'Sube la escala 1–2–3–4–5–6–7–8–7–6–5–4–3–2–1 a ritmo parejo.',
      'Nota cómo se libera cualquier rigidez en la raíz de la lengua y la laringe.',
    ],
    commonMistake: 'Morder ligeramente o tensar el piso de la boca debajo del mentón.',
    baseMidi: 60,
    patternOffsets: [0, 2, 4, 5, 7, 9, 11, 12, 7, 4, 0],
  },
  {
    id: 'v2_nasality_ng_maa',
    level: 2,
    phaseOrder: 2,
    category: 'nasality_registers',
    phaseLabel: PHASE_2_LABEL,
    focusTag: '👃 Control de Nasalidad',
    title: 'Resonancia en Máscara vs Nasalidad ("Ng → Maa")',
    defaultBpm: 78,
    ratio: 0.1,
    vowel: 'a',
    syllableCue: '1 tiempo en "Ng..." (pómulos) y abre limpio a "Maa" oral brillante',
    postureCue: 'Distingue brillo en la máscara (deseado) de voz gangosa (exceso de aire por la nariz).',
    howToSteps: [
      'Canta "Ng" en el primer pulso enfocando la vibración entre nariz y pómulos.',
      'Abre de golpe la mandíbula hacia abajo a "Maa" dejando pasar el sonido por la boca.',
      'Repite comprobando con pinza suave de dedos en la nariz que la "Maa" sigue sonando abierta y libre.',
    ],
    commonMistake: 'Dejar el velo palatino caído durante toda la "Maa" haciendo que suene gangosa.',
    baseMidi: 60,
    patternOffsets: [0, 4, 7, 7, 4, 0],
  },
  {
    id: 'v2_chest_projection',
    level: 2,
    phaseOrder: 2,
    category: 'nasality_registers',
    phaseLabel: PHASE_2_LABEL,
    focusTag: '🫁 Voz de Pecho',
    title: 'Anclaje y Proyección de Pecho ("Goh–Bah–Goh")',
    defaultBpm: 80,
    ratio: 0.1,
    vowel: 'o',
    syllableCue: '"Goh – Bah – Goh" con cuerpo sólido en registro grave-medio',
    postureCue: 'Sensación de amplitud detrás de los molares y resonancia firme en el pecho sin empujar garganta.',
    howToSteps: [
      'Canta la secuencia descendente y ascendente 5–3–1–3–5 en voz de pecho conectada.',
      'Siente cómo la consonante "G" ayuda al cierre limpio sin soplo de aire.',
      'Conserva el pecho ancho pero listo para aligerar al acercarte a la zona media.',
    ],
    commonMistake: 'Dejar la voz aireada ("breathiness") en notas graves o tensar el cuello.',
    baseMidi: 55,
    patternOffsets: [7, 4, 0, 4, 7, 4, 0],
  },
  {
    id: 'v2_head_floating',
    level: 2,
    phaseOrder: 2,
    category: 'nasality_registers',
    phaseLabel: PHASE_2_LABEL,
    focusTag: '👑 Voz de Cabeza',
    title: 'Voz de Cabeza Flotante y Conectada ("Yuu–Hoo–Yaa")',
    defaultBpm: 78,
    ratio: 0.1,
    vowel: 'u',
    syllableCue: '"Yuu" enfocada arriba → "Hoo" ligera → "Yaa" brillante en cabeza',
    postureCue: 'Imagina que el sonido sale por encima de los ojos mientras las costillas sostienen abajo.',
    howToSteps: [
      'Ataca directamente el 8º grado con "Yuu" suave y bien afinada (sin glissando).',
      'Desciende por el arpegio 8–5–3–1 evitando el golpe brusco al entrar en la zona media.',
      'Siente continuidad tímbrica entre la cabeza aguda y la mezcla media.',
    ],
    commonMistake: 'Dejar que la voz de cabeza suene débil y sin centro por falta de apoyo abdominal.',
    baseMidi: 62,
    patternOffsets: [12, 7, 4, 0, 4, 7, 12],
  },
  {
    id: 'v2_passaggio_nu_no',
    level: 2,
    phaseOrder: 3,
    category: 'passaggio_intonation',
    phaseLabel: PHASE_3_LABEL,
    focusTag: '🌉 Passaggio',
    title: 'Puente Mixto "Nu → Nɔ" en Octava (1–5–8–5–1)',
    defaultBpm: 82,
    ratio: 0.1,
    vowel: 'o',
    syllableCue: '"Nu" al arrancar en pecho → modifica hacia "Nɔ" (o abierta) en el 8º grado',
    postureCue: 'El modificador vocálico abre espacio vertical atrás para cruzar el passaggio sin grito ni quiebre.',
    howToSteps: [
      'Canta 1 y 5 con apoyo costal sólido pero sin exceso de peso.',
      'Al acercarte a la octava, redondea y abre verticalmente la vocal hacia una /ɔ/ noble.',
      'Vuelve al 5 y al 1 suavizando la transición de regreso al pecho.',
    ],
    commonMistake: 'Mantener la vocal horizontal ancha en el passaggio y chocar con el techo vocal.',
    baseMidi: 60,
    patternOffsets: [0, 7, 12, 7, 0],
  },
  {
    id: 'v2_intonation_leaps',
    level: 2,
    phaseOrder: 3,
    category: 'passaggio_intonation',
    phaseLabel: PHASE_3_LABEL,
    focusTag: '🎯 Entonación',
    title: 'Saltos Limpios de 5ª y 6ª Mayor ("Mi–Mo–Ma")',
    defaultBpm: 84,
    ratio: 0.1,
    vowel: 'o',
    syllableCue: '"Mi" base · "Mo" en 5ª y 6ª · "Ma" en descenso (cero arrastre)',
    postureCue: 'Apunta el salto mentalmente un milímetro arriba del pómulo para llegar justo al centro tonal.',
    howToSteps: [
      'Aterriza en la 5ª y 6ª directo al centro de afinación sin deslizar ("no scooping").',
      'Relaja la lengua entre sílabas manteniendo siempre el mismo espacio de resonancia.',
      'Controla que la vuelta a la 3ª mayor y tónica no caiga por debajo del tono.',
    ],
    commonMistake: 'Deslizar desde la nota inferior hasta alcanzar la afinación de la 6ª.',
    baseMidi: 62,
    patternOffsets: [0, 7, 9, 7, 4, 0],
  },
  {
    id: 'v2_tuning_semitones',
    level: 2,
    phaseOrder: 3,
    category: 'passaggio_intonation',
    phaseLabel: PHASE_3_LABEL,
    focusTag: '🎚️ Afinación',
    title: 'Afinación de Precisión en Semitonos (Sensible 7 → 8)',
    defaultBpm: 76,
    ratio: 0.1,
    vowel: 'i',
    syllableCue: '"Ni – Na – Ni" cuidando la tensión justa entre 3–4 y 7–8',
    postureCue: 'Escucha la distancia corta del semitono ascendente y descendente sin vibrato excesivo.',
    howToSteps: [
      'Canta línea recta ("straight tone" limpio) para detectar cualquier micro-desviación.',
      'Coloca la sensible (7º grado) bien alta para que resuelva con brillo a la octava.',
      'Compara mentalmente cada grado con el piano guía tras cada compás.',
    ],
    commonMistake: 'Hacer los semitonos descendentes demasiado grandes (quedar bajo en el 7º o 3º grado).',
    baseMidi: 60,
    patternOffsets: [0, 4, 5, 4, 11, 12, 11, 7, 0],
  },
  {
    id: 'v2_agility_staccato_arpeggio',
    level: 2,
    phaseOrder: 4,
    category: 'agility_singing',
    phaseLabel: PHASE_4_LABEL,
    focusTag: '⚡ Agilidad y Afinación',
    title: 'Agilidad Rítmica Ligero–Staccato ("Ha–Ha–Ha–Laaa")',
    defaultBpm: 90,
    ratio: 0.1,
    vowel: 'a',
    syllableCue: 'Notas cortas limpias en ascenso + legato afinado al bajar',
    postureCue: 'Cada staccato nace de un micro-rebote costal; nunca tosas ni golpees la glotis.',
    howToSteps: [
      'Articula 1–3–5–8 con rebotes ligeros y afinados al milímetro.',
      'Conecta inmediatamente el descenso 8–7–5–4–3–2–1 en una sola vocal ligada.',
      'Asegura que el cambio de staccato a legato mantiene exactamente la misma colocación.',
    ],
    commonMistake: 'Apretar la garganta en las notas cortas en lugar de impulsar desde el abdomen.',
    baseMidi: 60,
    patternOffsets: [0, 4, 7, 12, 11, 7, 5, 4, 2, 0],
  },
  {
    id: 'v2_singing_messa_voce',
    level: 2,
    phaseOrder: 4,
    category: 'agility_singing',
    phaseLabel: PHASE_4_LABEL,
    focusTag: '🎶 Canto Aplicado',
    title: 'Canto Expresivo: Messa di Voce (p → f → p) y Fraseo',
    defaultBpm: 82,
    ratio: 0.1,
    vowel: 'o',
    syllableCue: '"/o/" redonda creciendo con el apoyo y recogiendo suave sin desafinar',
    postureCue: 'Regula la intensidad abriendo costillas y espacio oral, jamás subiendo los hombros.',
    howToSteps: [
      'Ataca en piano (suave) el 1–3–5 con absoluta pureza y cero aire escapado.',
      'Crece gradualmente hacia el 6º y 5º grado conservando el timbre redondo y afinado.',
      'Recoge la dinámica al resolver al 1 sin que la afinación se baje ni se endurezca.',
    ],
    commonMistake: 'Subir la afinación cuando crece el volumen o desafinar hacia abajo al bajar a piano.',
    baseMidi: 60,
    patternOffsets: [0, 4, 7, 9, 7, 4, 0],
  },
];

const VOCAL_LEVEL_3_EXERCISES: VocalTrainingExercise[] = [
  {
    id: 'v3_breath_long_phrase',
    level: 3,
    phaseOrder: 1,
    category: 'breathing_support',
    phaseLabel: PHASE_1_LABEL,
    focusTag: '🌬️ Respiración (Obligatorio 1º)',
    title: 'Resistencia de Frase Larga: Inhala 4t · Suspende 4t · Exhala 14t',
    defaultBpm: 72,
    ratio: 0.1,
    vowel: 'lip',
    syllableCue: 'Exhalación dosificada en "Sss" de 14 pulsos con economía total',
    postureCue: 'Equilibrio entre presión subglótica y retención costal; sensación de reserva de aire hasta el pulso 14.',
    howToSteps: [
      'Inhala en 4 pulsos llenando la base costal lateral y dorsal sin tensión superior.',
      'Suspende 4 pulsos manteniendo abierto el espacio torácico.',
      'Dosifica una "Sss" uniforme durante 14 pulsos sin acelerar el gasto en los primeros 4.',
    ],
    commonMistake: 'Gastar el 70% del aire en los primeros 4 pulsos y llegar ahogado al pulso 10.',
    baseMidi: 60,
    patternOffsets: [0, 0, 0, 0],
    isBreathingOnly: true,
    breathSteps: [
      { label: 'Inhala 4t', cue: 'Carga lateral y dorsal profunda', beats: 4, kind: 'inhale' },
      { label: 'Retén Abierto 4t', cue: 'Cinturón expandido, garganta en calma', beats: 4, kind: 'hold' },
      { label: 'Exhala "Sss" 14t', cue: 'Economía total hasta el último pulso', beats: 14, kind: 'exhale' },
    ],
  },
  {
    id: 'v3_breath_appoggio_switch',
    level: 3,
    phaseOrder: 1,
    category: 'breathing_support',
    phaseLabel: PHASE_1_LABEL,
    focusTag: '🌬️ Control de Presión',
    title: 'Crescendo / Diminuendo Respiratorio ("Sss" p → f → p)',
    defaultBpm: 76,
    ratio: 0.1,
    vowel: 'lip',
    syllableCue: 'Aumenta y reduce la densidad del "Sss" controlando el diafragma',
    postureCue: 'El abdomen acompaña suavemente el crescendo sin colapsar las costillas en el diminuendo.',
    howToSteps: [
      'Inhala en 2 pulsos con apertura inmediata y silenciosa.',
      'Exhala 4 pulsos suavemente ("p"), sube la energía otros 4 ("f") y vuelve suave los últimos 4 ("p").',
      'Repite notando cero tensión en cuello o hombros durante el cambio de presión.',
    ],
    commonMistake: 'Empujar la mandíbula hacia adelante al pasar a la parte fuerte.',
    baseMidi: 60,
    patternOffsets: [0, 0, 0, 0],
    isBreathingOnly: true,
    breathSteps: [
      { label: 'Inhala Rápida 2t', cue: 'Apertura costal inmediata', beats: 2, kind: 'inhale' },
      { label: '"Sss" p→f (8t)', cue: 'Aumenta densidad desde el centro sin tensar cuello', beats: 8, kind: 'exhale' },
      { label: '"Sss" f→p (4t)', cue: 'Recoge suavemente manteniendo costillas abiertas', beats: 4, kind: 'exhale' },
    ],
  },
  {
    id: 'v3_warmup_siren_sovt',
    level: 3,
    phaseOrder: 1,
    category: 'warmup_vibrations',
    phaseLabel: PHASE_1_LABEL,
    focusTag: '💫 Calentamiento y Vibraciones',
    title: 'Calentamiento de Rango Amplio ("Brrr" en 9ª y Octava)',
    defaultBpm: 84,
    ratio: 0.1,
    vowel: 'lip',
    syllableCue: '"Brrr" o "Vvv" conectando graves, zona media y 9ª superior',
    postureCue: 'Permite el adelgazamiento acústico automático al cruzar la zona de puente.',
    howToSteps: [
      'Recorre el patrón 1–3–5–8–9–8–5–3–1 manteniendo la vibración labial intacta arriba.',
      'No agregues más aire en el 9º grado: mantén la misma fluidez que en la tónica.',
      'Observa cómo el paso entre registros se vuelve imperceptible.',
    ],
    commonMistake: 'Cortar la vibración de labios justo antes de la octava por exceso de presión.',
    baseMidi: 58,
    patternOffsets: [0, 4, 7, 12, 14, 12, 7, 4, 0],
  },
  {
    id: 'v3_warmup_vocal_fry_mask',
    level: 3,
    phaseOrder: 1,
    category: 'warmup_vibrations',
    phaseLabel: PHASE_1_LABEL,
    focusTag: '🫧 Vibraciones de Alta Máscara',
    title: 'Zumbido Frontal + Apertura ("Nnn → Nee → Naa") en Arpegio',
    defaultBpm: 82,
    ratio: 0.1,
    vowel: 'e',
    syllableCue: 'Vibración intensa en paladar duro y dientes superiores ("Nnn–Nee")',
    postureCue: 'Lengua alta suavemente atrás en "ee", punta detrás de incisivos inferiores.',
    howToSteps: [
      'Siente la vibración enfocada de la "Nnn" en el primer pulso antes de abrir a vocal.',
      'Mantén esa vibración adelantada al subir por la 5ª y la 8ª en "Nee".',
      'Suaviza a "Naa" manteniendo la ligereza del punto de resonancia.',
    ],
    commonMistake: 'Retraer la lengua hacia atrás cuando la melodía pasa del 5º al 8º grado.',
    baseMidi: 60,
    patternOffsets: [0, 4, 7, 12, 7, 4, 0],
  },
  {
    id: 'v3_nasality_vowel_clarity',
    level: 3,
    phaseOrder: 2,
    category: 'nasality_registers',
    phaseLabel: PHASE_2_LABEL,
    focusTag: '👃 Control de Nasalidad',
    title: 'Pureza Oral vs Nasal en Vocales Críticas (/i/–/e/–/a/)',
    defaultBpm: 82,
    ratio: 0.1,
    vowel: 'i',
    syllableCue: '"Bee – Beh – Bah" (100% limpio sin escape nasal, sonido brillante)',
    postureCue: 'Comprueba tapando brevemente la nariz en "/i/" y "/a/": el timbre debe mantenerse idéntico.',
    howToSteps: [
      'Alterna vocales cerradas (/i/) y abiertas (/a/) conservando la elevación suave del velo palatino.',
      'Evita nasalizar la "/i/" aguda para buscar falso brillo; busca espacio faríngeo + proyección frontal.',
      'Unifica el color oral en todo el salto de 5ª y 8ª.',
    ],
    commonMistake: 'Colapsar el velo del paladar en la "/i/" aguda generando timbre estridente nasal.',
    baseMidi: 60,
    patternOffsets: [0, 7, 12, 7, 4, 0],
  },
  {
    id: 'v3_chest_dominant_mix',
    level: 3,
    phaseOrder: 2,
    category: 'nasality_registers',
    phaseLabel: PHASE_2_LABEL,
    focusTag: '🫁 Voz de Pecho',
    title: 'Voz de Pecho Resonante y Estable ("Vah–Zoh–Bah")',
    defaultBpm: 84,
    ratio: 0.1,
    vowel: 'a',
    syllableCue: '"Vah – Zoh – Bah" con vibración fricativa previa para máxima firmeza',
    postureCue: 'Apoyo abdominal firme pero cara relajada; sin empujar peso más allá de tu zona media.',
    howToSteps: [
      'La consonante sonora "V/Z" nivela la presión de aire antes de abrir el pecho.',
      'Canta 1–2–3–5–6–5–3–2–1 con cuerpo pleno pero sin apretar el cuello.',
      'Al llegar al 6º grado permite una ligera inclinación hacia mezcla sin perder calidez.',
    ],
    commonMistake: 'Arrastrar exceso de peso de pecho ("belting rígido") hacia el 6º grado.',
    baseMidi: 57,
    patternOffsets: [0, 2, 4, 7, 9, 7, 4, 2, 0],
  },
  {
    id: 'v3_head_agility_high',
    level: 3,
    phaseOrder: 2,
    category: 'nasality_registers',
    phaseLabel: PHASE_2_LABEL,
    focusTag: '👑 Voz de Cabeza',
    title: 'Voz de Cabeza Ágil y Resonante ("Wee–Hoo–Wee") en Agudos',
    defaultBpm: 86,
    ratio: 0.1,
    vowel: 'i',
    syllableCue: '"Wee – Hoo – Wee" enfocada arriba con brillo noble (sin aire flojo)',
    postureCue: 'Labios ligeramente redondeados incluso en "Wee" para dar profundidad acústica al agudo.',
    howToSteps: [
      'Ataca con claridad el arpegio ascendente hasta el 10º grado en registro de cabeza limpio.',
      'Siente anclaje costal firme mientras la cabeza resuena libre y ligera.',
      'Desciende manteniendo el timbre brillante sin desconexión al llegar a la tónica.',
    ],
    commonMistake: 'Dejar la voz de cabeza sin núcleo ("falsete aireado") en lugar de cabeza resonante.',
    baseMidi: 60,
    patternOffsets: [0, 4, 7, 12, 16, 12, 7, 4, 0],
  },
  {
    id: 'v3_passaggio_narrow_i',
    level: 3,
    phaseOrder: 3,
    category: 'passaggio_intonation',
    phaseLabel: PHASE_3_LABEL,
    focusTag: '🌉 Passaggio',
    title: 'Estrechar Vocal /i/→/ɪ/ y /e/→/ɛ/ en Passaggio (9ª)',
    defaultBpm: 86,
    ratio: 0.1,
    vowel: 'i',
    syllableCue: 'Suaviza "/i/" hacia una "/ɪ/" abierta vertical al cruzar el puente',
    postureCue: 'Sonrisa interna en el paladar blando; comisuras labiales completamente quietas.',
    howToSteps: [
      'Sube 1–3–5–8–9 permitiendo que la vocal se redondee milimétricamente arriba del 5º grado.',
      'Evita estirar la boca lateralmente ("sonrisa tensa") al atravesar la zona de paso.',
      'Desciende por el mismo canal abierto conservando color uniforme.',
    ],
    commonMistake: 'Abrir la vocal horizontalmente al llegar a la octava y novena, tensando la faringe.',
    baseMidi: 62,
    patternOffsets: [0, 4, 7, 12, 14, 12, 7, 4, 0],
  },
  {
    id: 'v3_intonation_maj7',
    level: 3,
    phaseOrder: 3,
    category: 'passaggio_intonation',
    phaseLabel: PHASE_3_LABEL,
    focusTag: '🎯 Entonación',
    title: 'Entonación Armónica de Arpegio Maj7 y 9ª (1–3–5–7–9)',
    defaultBpm: 84,
    ratio: 0.1,
    vowel: 'e',
    syllableCue: '"Le – La – Le" definiendo 3ª mayor, 7ª mayor y 9ª con exactitud',
    postureCue: 'Oído interno activo: escucha la sonoridad de acorde Maj7 en el piano y encaja dentro.',
    howToSteps: [
      'Afina limpiamente la 7ª mayor (11 semitonos) sin caer hacia la 7ª menor.',
      'Resuelve la 9ª arriba con apoyo sereno y desciende tocando cada intervalo del acorde.',
      'Cero deslizamientos entre notas del arpegio.',
    ],
    commonMistake: 'Quedar corto en la 7ª mayor o confundir el salto 5→7 con una sexta.',
    baseMidi: 60,
    patternOffsets: [0, 4, 7, 11, 14, 11, 7, 4, 0],
  },
  {
    id: 'v3_tuning_chromatic_clean',
    level: 3,
    phaseOrder: 3,
    category: 'passaggio_intonation',
    phaseLabel: PHASE_3_LABEL,
    focusTag: '🎚️ Afinación',
    title: 'Afinación Cromática y Tono Recto (1–♭2–2–♭3–3–2–1)',
    defaultBpm: 78,
    ratio: 0.1,
    vowel: 'a',
    syllableCue: '"Na – Na – Na" sin vibrato en cada semitono para precisión quirúrgica',
    postureCue: 'Flujo mínimo y constante de aire; escucha la afinación exacta de ida y vuelta.',
    howToSteps: [
      'Canta sin vibrato cada paso cromático asegurando distancias iguales de medio tono.',
      'Presta doble atención al regreso descendente (3→♭3→2→♭2→1), donde la mayoría desafina bajo.',
      'Comprueba que el 1 final coincide idéntico con el piano guía.',
    ],
    commonMistake: 'Hacer los semitonos demasiado grandes al bajar y terminar por debajo de la tónica.',
    baseMidi: 60,
    patternOffsets: [0, 1, 2, 3, 4, 3, 2, 1, 0],
  },
  {
    id: 'v3_agility_pentatonic_melisma',
    level: 3,
    phaseOrder: 4,
    category: 'agility_singing',
    phaseLabel: PHASE_4_LABEL,
    focusTag: '⚡ Agilidad y Afinación',
    title: 'Melisma Pentatónico Pop/R&B (1–2–3–5–6–8–6–5–3–2–1)',
    defaultBpm: 98,
    ratio: 0.1,
    vowel: 'a',
    syllableCue: 'Una sola vocal fluida "Laa" separando cada nota como perlas limpias',
    postureCue: 'Mandíbula inmóvil; la agilidad ocurre dentro de la flexibilidad glótica con aire ligero.',
    howToSteps: [
      'Asegura primero afinación perfecta de cada grado pentatónico a velocidad media.',
      'Acelera progresivamente en el metrónomo sin sacudir el mentón en los cambios.',
      'Remata la tónica final con afinación clavada y vibrato natural.',
    ],
    commonMistake: 'Emborronar las notas rápidas o mover la barbilla para marcar el ritmo.',
    baseMidi: 60,
    patternOffsets: [0, 2, 4, 7, 9, 12, 9, 7, 4, 2, 0],
  },
  {
    id: 'v3_singing_soul_expression',
    level: 3,
    phaseOrder: 4,
    category: 'agility_singing',
    phaseLabel: PHASE_4_LABEL,
    focusTag: '🎶 Canto Aplicado',
    title: 'Canto Expresivo Soul / Blues (Blue Note 1–♭3–4–♭5–4–♭3–1)',
    defaultBpm: 88,
    ratio: 0.1,
    vowel: 'o',
    syllableCue: '"/ʌ/" o "/ɔ/" con carácter, blue note enfocada y vibrato final',
    postureCue: 'Combina apoyo firme, color frontal equilibrado y expresión auténtica en toda la frase.',
    howToSteps: [
      'Coloca la ♭3 y la ♭5 (blue note) con intención expresiva sin perder el centro tonal.',
      'Mantén el passaggio suelto si subes tu tónica cómoda en el selector.',
      'Cierra la tónica final sosteniendo 2 pulsos con vibrato natural relajado.',
    ],
    commonMistake: 'Desafinar la ♭3 dejándola imprecisa o apretar la garganta buscando actitud.',
    baseMidi: 60,
    patternOffsets: [0, 3, 5, 6, 5, 3, 0],
  },
];

const VOCAL_CURRICULUM_BY_LEVEL: Record<VocalTrainingLevel, VocalTrainingExercise[]> = {
  1: VOCAL_LEVEL_1_EXERCISES,
  2: VOCAL_LEVEL_2_EXERCISES,
  3: VOCAL_LEVEL_3_EXERCISES,
};

function withNormalizedRatios(
  items: VocalTrainingExercise[],
  weights: number[]
): VocalTrainingExercise[] {
  const sum = weights.reduce((acc, w) => acc + w, 0) || 1;
  return items.map((item, idx) => ({
    ...item,
    ratio: (weights[idx] ?? 1) / sum,
  }));
}

export function buildStructuredVocalTrainingSeries(
  level: VocalTrainingLevel = 1,
  durationMinutes = 20
): VocalTrainingExercise[] {
  const pool = VOCAL_CURRICULUM_BY_LEVEL[level] ?? VOCAL_LEVEL_1_EXERCISES;

  // Express (10 min): 6 exercises across all 4 phases (Breathing 1st ALWAYS)
  // Phase 1 (2): [0] Breathing, [2] Warmup/Vibrations
  // Phase 2 (1): [4] Nasality + Pecho/Cabeza balance
  // Phase 3 (2): [7] Passaggio, [8] Entonación
  // Phase 4 (1): [10] Agilidad y Afinación / Canto
  if (durationMinutes <= 12) {
    const selected = [pool[0], pool[2], pool[4], pool[7], pool[8], pool[10]];
    return withNormalizedRatios(selected, [0.15, 0.15, 0.175, 0.175, 0.175, 0.175]);
  }

  // Complete (20 min): 10 exercises across all 4 phases (2 Breathing 1st ALWAYS + all skills)
  // Phase 1 (3): [0] Resp 1, [1] Resp 2, [2] Calentamiento/Vibraciones
  // Phase 2 (3): [4] Nasalidad, [5] Voz de Pecho, [6] Voz de Cabeza
  // Phase 3 (2): [7] Passaggio, [9] Entonación y Afinación
  // Phase 4 (2): [10] Agilidad y Afinación, [11] Canto Aplicado
  if (durationMinutes <= 22) {
    const selected = [
      pool[0],
      pool[1],
      pool[2],
      pool[4],
      pool[5],
      pool[6],
      pool[7],
      pool[9],
      pool[10],
      pool[11],
    ];
    return withNormalizedRatios(selected, [0.075, 0.075, 0.1, 0.1, 0.1, 0.1, 0.125, 0.1, 0.1, 0.125]);
  }

  // Deep (30 min): Full 12 exercises across all 4 phases
  // Phase 1 (4): [0] Resp 1, [1] Resp 2, [2] Calentamiento/Vibraciones 1, [3] Vibraciones 2
  // Phase 2 (3): [4] Nasalidad, [5] Voz de Pecho, [6] Voz de Cabeza
  // Phase 3 (3): [7] Passaggio, [8] Entonación, [9] Afinación
  // Phase 4 (2): [10] Agilidad y Afinación, [11] Canto Aplicado
  return withNormalizedRatios(
    pool,
    [0.0667, 0.0667, 0.0833, 0.0833, 0.0833, 0.0833, 0.0833, 0.1, 0.0833, 0.0833, 0.0834, 0.1]
  );
}






