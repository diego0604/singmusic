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
