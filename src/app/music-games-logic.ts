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
    ratio: 0.17,
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
    id: 'drum_double_stroke',
    title: '2. Calentamiento de Rebote: Double Stroke Roll (R R L L)',
    defaultBpm: 80,
    ratio: 0.17,
    subdivisionPerBeat: 2,
    drill: 'Acompaña el primer golpe con la muñeca y recoge el segundo rebote cerrando suavemente los dedos traseros.',
    cue: 'El segundo golpe de cada mano (R2 y L2) debe sonar igual de claro que el primero, sin precipitarse.',
    steps: [
      { countLabel: '1', actionSummary: 'R1 Caja + PD Bombo', hits: [{ piece: 'SD', limb: 'R', accent: true }, { piece: 'BD', limb: 'RF' }] },
      { countLabel: '&', actionSummary: 'R2 Rebote Caja', hits: [{ piece: 'SD', limb: 'R' }] },
      { countLabel: '2', actionSummary: 'L1 Caja + PI Pedal', hits: [{ piece: 'SD', limb: 'L', accent: true }, { piece: 'HHP', limb: 'LF' }] },
      { countLabel: '&', actionSummary: 'L2 Rebote Caja', hits: [{ piece: 'SD', limb: 'L' }] },
      { countLabel: '3', actionSummary: 'R1 Tom 1 + PD Bombo', hits: [{ piece: 'T1', limb: 'R', accent: true }, { piece: 'BD', limb: 'RF' }] },
      { countLabel: '&', actionSummary: 'R2 Rebote Tom 1', hits: [{ piece: 'T1', limb: 'R' }] },
      { countLabel: '4', actionSummary: 'L1 Caja + PI Pedal', hits: [{ piece: 'SD', limb: 'L', accent: true }, { piece: 'HHP', limb: 'LF' }] },
      { countLabel: '&', actionSummary: 'L2 Rebote Caja', hits: [{ piece: 'SD', limb: 'L' }] },
    ],
  },
  {
    id: 'drum_rock_groove',
    title: '3. Groove Rock Base (Manos Cruzadas + Bombo en 1 y 3)',
    defaultBpm: 86,
    ratio: 0.17,
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
    title: '4. Independencia 4 Extremidades (Ride + Pedal HH en 2 y 4)',
    defaultBpm: 90,
    ratio: 0.17,
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
    id: 'drum_linear_funk',
    title: '5. Coordinación Lineal Funk (PD – R – L sin Superponer Golpes)',
    defaultBpm: 88,
    ratio: 0.16,
    subdivisionPerBeat: 2,
    drill: 'Ninguna extremidad golpea al mismo tiempo: alterna Bombo (PD), Hi-Hat (R) y Caja/Ghost (L) como un engranaje limpio.',
    cue: 'Asegúrate de dejar aire entre cada golpe: la limpieza del groove lineal depende de no encimar manos y pie.',
    steps: [
      { countLabel: '1', actionSummary: 'PD Bombo solo', hits: [{ piece: 'BD', limb: 'RF', accent: true }] },
      { countLabel: '&', actionSummary: 'R Hi-Hat solo', hits: [{ piece: 'HH', limb: 'R' }] },
      { countLabel: '2', actionSummary: 'L Caja★ solo', hits: [{ piece: 'SD', limb: 'L', accent: true }] },
      { countLabel: '&', actionSummary: 'R Hi-Hat solo', hits: [{ piece: 'HH', limb: 'R' }] },
      { countLabel: '3', actionSummary: 'PD Bombo solo', hits: [{ piece: 'BD', limb: 'RF', accent: true }] },
      { countLabel: '&', actionSummary: 'L Ghost suave', hits: [{ piece: 'SD', limb: 'L' }] },
      { countLabel: '4', actionSummary: 'R Hi-Hat solo', hits: [{ piece: 'HH', limb: 'R' }] },
      { countLabel: '&', actionSummary: 'L Caja★ cierre', hits: [{ piece: 'SD', limb: 'L', accent: true }] },
    ],
  },
  {
    id: 'drum_tom_fill',
    title: '6. Fill Descendente por Toms y Cierre con Crash + Bombo',
    defaultBpm: 94,
    ratio: 0.16,
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
  phaseLabel?: string;
  focusTag?: string;
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
    phaseLabel: 'Fase 1 · Motricidad y Calentamiento',
    focusTag: 'Púa alternada 1-2-3-4',
    title: '1. Calentamiento Motor (Araña 1-2-3-4 en Trastes 5–8)',
    defaultBpm: 72,
    ratio: 0.1,
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
    id: 'gtr_perm1324',
    phaseLabel: 'Fase 1 · Motricidad y Calentamiento',
    focusTag: 'Disociación 1-3-2-4',
    title: '2. Velocidad y Permutación Disociada (1-3-2-4 · Am)',
    defaultBpm: 84,
    ratio: 0.1,
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
    id: 'gtr_diagonal_warmup',
    phaseLabel: 'Fase 1 · Motricidad y Calentamiento',
    focusTag: 'Cromático diagonal',
    title: '3. Calentamiento Cromático en Diagonal (Cuerdas 6ª → 3ª)',
    defaultBpm: 76,
    ratio: 0.1,
    subdivisionPerBeat: 2,
    drill: 'Avanza 1 traste por cada dedo y sube 1 cuerda al mismo tiempo formando una escalera diagonal limpia.',
    cue: 'Relaja el hombro y desplaza el antebrazo en bloque sin girar la muñeca.',
    steps: [
      { label: '6ª tr.5 (Dedo 1)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 5, fret: 5, finger: 1 }] },
      { label: '5ª tr.6 (Dedo 2)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 4, fret: 6, finger: 2 }] },
      { label: '4ª tr.7 (Dedo 3)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 3, fret: 7, finger: 3 }] },
      { label: '3ª tr.8 (Dedo 4)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 2, fret: 8, finger: 4 }] },
      { label: '3ª tr.5 (Dedo 1)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 2, fret: 5, finger: 1 }] },
      { label: '4ª tr.6 (Dedo 2)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 3, fret: 6, finger: 2 }] },
      { label: '5ª tr.7 (Dedo 3)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 4, fret: 7, finger: 3 }] },
      { label: '6ª tr.8 (Dedo 4)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 5, fret: 8, finger: 4 }] },
    ],
  },
  {
    id: 'gtr_ring_pinky_stretch',
    phaseLabel: 'Fase 1 · Motricidad y Calentamiento',
    focusTag: 'Fuerza 3–4 y extensión',
    title: '4. Independencia Anular–Meñique (3–4) y Extensión 1–2–4',
    defaultBpm: 74,
    ratio: 0.1,
    subdivisionPerBeat: 2,
    drill: 'Combina trino controlado entre dedos 3 y 4 con una apertura elástica 1–2–4 (+1 traste) en cuerdas centrales.',
    cue: 'Apunta la yema del meñique perpendicular a la cuerda y baja el pulgar al centro trasero del mástil.',
    steps: [
      { label: '4ª tr.7 (Dedo 3)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 3, fret: 7, finger: 3 }] },
      { label: '4ª tr.8 (Dedo 4)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 3, fret: 8, finger: 4 }] },
      { label: '4ª tr.7 (Dedo 3)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 3, fret: 7, finger: 3 }] },
      { label: '4ª tr.8 (Dedo 4)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 3, fret: 8, finger: 4 }] },
      { label: '3ª tr.5 (Dedo 1)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 2, fret: 5, finger: 1 }] },
      { label: '3ª tr.7 (Dedo 2)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 2, fret: 7, finger: 2 }] },
      { label: '3ª tr.9 (Dedo 4)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 2, fret: 9, finger: 4 }] },
      { label: '3ª tr.7 (Dedo 2)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 2, fret: 7, finger: 2 }] },
    ],
  },
  {
    id: 'gtr_chords',
    phaseLabel: 'Fase 2 · Acordes y Cejillas',
    focusTag: 'Acordes abiertos',
    title: '5. Cambio Limpio de Acordes (C – G – Am – Fmaj7)',
    defaultBpm: 76,
    ratio: 0.1,
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
    id: 'gtr_groove_arpegio',
    phaseLabel: 'Fase 2 · Acordes y Cejillas',
    focusTag: 'Cadencia ii–V–I',
    title: '6. Acordes de Color ii–V–I (Em7 – A7 – Dmaj7 – D)',
    defaultBpm: 84,
    ratio: 0.1,
    subdivisionPerBeat: 1,
    drill: 'Combina el rasgueo de tríadas y séptimas con pulgar e índice siguiendo la progresión ii–V–I en Re.',
    cue: 'Escucha cómo resuelve el Sol (♭7 de A7) bajando medio tono hacia Fa♯ (3ª de Dmaj7).',
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
        label: 'Re Mayor (D)',
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
  {
    id: 'gtr_barre_shapes',
    phaseLabel: 'Fase 2 · Acordes y Cejillas',
    focusTag: 'Cejillas móviles',
    title: '7. Cejillas Móviles en 6ª y 5ª Cuerda (F – Bm7 – C♯m7 – G7)',
    defaultBpm: 70,
    ratio: 0.1,
    subdivisionPerBeat: 1,
    drill: 'Apoya el canto lateral del dedo 1 (índice) cerca del traste metálico y suelta la pinza entre cambios.',
    cue: 'No aprietes con el pulgar hacia adentro: usa el peso del brazo izquierdo hacia atrás suavemente.',
    steps: [
      {
        label: 'Fa Cejilla (F tr.1)',
        chordSymbol: 'F',
        rightHandCue: 'Rasgueo firme ↓ ↑',
        isChord: true,
        positions: [
          { sIdx: 5, fret: 1, finger: 1 },
          { sIdx: 4, fret: 3, finger: 3 },
          { sIdx: 3, fret: 3, finger: 4 },
          { sIdx: 2, fret: 2, finger: 2 },
          { sIdx: 1, fret: 1, finger: 1 },
          { sIdx: 0, fret: 1, finger: 1 },
        ],
      },
      {
        label: 'Si Menor 7 (Bm7 tr.2)',
        chordSymbol: 'Bm7',
        rightHandCue: 'Desde 5ª cuerda ↓ ↑',
        isChord: true,
        positions: [
          { sIdx: 4, fret: 2, finger: 1 },
          { sIdx: 3, fret: 4, finger: 3 },
          { sIdx: 2, fret: 2, finger: 1 },
          { sIdx: 1, fret: 3, finger: 2 },
          { sIdx: 0, fret: 2, finger: 1 },
        ],
      },
      {
        label: 'Do♯ Menor 7 (C♯m7 tr.4)',
        chordSymbol: 'C#m7',
        rightHandCue: 'Desliza molde +2 tr.',
        isChord: true,
        positions: [
          { sIdx: 4, fret: 4, finger: 1 },
          { sIdx: 3, fret: 6, finger: 3 },
          { sIdx: 2, fret: 4, finger: 1 },
          { sIdx: 1, fret: 5, finger: 2 },
          { sIdx: 0, fret: 4, finger: 1 },
        ],
      },
      {
        label: 'Sol Dominante 7 (G7 tr.3)',
        chordSymbol: 'G7',
        rightHandCue: 'Cejilla 6ª completa ↓',
        isChord: true,
        positions: [
          { sIdx: 5, fret: 3, finger: 1 },
          { sIdx: 4, fret: 5, finger: 3 },
          { sIdx: 3, fret: 3, finger: 1 },
          { sIdx: 2, fret: 4, finger: 2 },
          { sIdx: 1, fret: 3, finger: 1 },
          { sIdx: 0, fret: 3, finger: 1 },
        ],
      },
    ],
  },
  {
    id: 'gtr_fingerpicking_pima',
    phaseLabel: 'Fase 3 · Fingerpicking, Ligados y Groove',
    focusTag: 'Arpegio P-i-m-a',
    title: '8. Arpegio Fingerpicking P–i–m–a (Em → Cmaj7)',
    defaultBpm: 80,
    ratio: 0.1,
    subdivisionPerBeat: 2,
    drill: 'Deja caer el Pulgar (P) en los bajos 6ª/5ª y asigna Índice (3ª), Medio (2ª) y Anular (1ª) con pulso parejo.',
    cue: 'Mantén los dedos de mano izquierda pisando todo el compás para que las cuerdas resuenen superpuestas.',
    steps: [
      { label: 'Em · Bajo E (6ª tr.0)', rightHandCue: 'Pulgar (P) 6ª', positions: [{ sIdx: 5, fret: 0, finger: 0 }] },
      { label: 'Em · Sol (3ª tr.0)', rightHandCue: 'Índice (i) 3ª', positions: [{ sIdx: 2, fret: 0, finger: 0 }] },
      { label: 'Em · Si (2ª tr.0)', rightHandCue: 'Medio (m) 2ª', positions: [{ sIdx: 1, fret: 0, finger: 0 }] },
      { label: 'Em · Mi (1ª tr.0)', rightHandCue: 'Anular (a) 1ª', positions: [{ sIdx: 0, fret: 0, finger: 0 }] },
      { label: 'Cmaj7 · Do (5ª tr.3)', rightHandCue: 'Pulgar (P) 5ª', positions: [{ sIdx: 4, fret: 3, finger: 3 }] },
      { label: 'Cmaj7 · Sol (3ª tr.0)', rightHandCue: 'Índice (i) 3ª', positions: [{ sIdx: 2, fret: 0, finger: 0 }] },
      { label: 'Cmaj7 · Si (2ª tr.0)', rightHandCue: 'Medio (m) 2ª', positions: [{ sIdx: 1, fret: 0, finger: 0 }] },
      { label: 'Cmaj7 · Mi (1ª tr.0)', rightHandCue: 'Anular (a) 1ª', positions: [{ sIdx: 0, fret: 0, finger: 0 }] },
    ],
  },
  {
    id: 'gtr_pentatonic_legato',
    phaseLabel: 'Fase 3 · Fingerpicking, Ligados y Groove',
    focusTag: 'Pentatónica Am + H/P',
    title: '9. Pentatónica Menor de La con Ligados (Trastes 5–8)',
    defaultBpm: 92,
    ratio: 0.1,
    subdivisionPerBeat: 2,
    drill: 'Toca la Caja 1 de La menor pentatónica articulando Hammer-On al subir y Pull-Off limpio al regresar.',
    cue: 'Púa firme en la primera nota de cada cuerda; deja que el dedo 3 o 4 martille con precisión.',
    steps: [
      { label: '6ª tr.5 · La (Dedo 1)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 5, fret: 5, finger: 1 }] },
      { label: '6ª tr.8 · Do (Hammer 4)', rightHandCue: 'Ligado Hammer (H)', positions: [{ sIdx: 5, fret: 8, finger: 4 }] },
      { label: '5ª tr.5 · Re (Dedo 1)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 4, fret: 5, finger: 1 }] },
      { label: '5ª tr.7 · Mi (Hammer 3)', rightHandCue: 'Ligado Hammer (H)', positions: [{ sIdx: 4, fret: 7, finger: 3 }] },
      { label: '4ª tr.5 · Sol (Dedo 1)', rightHandCue: 'Púa ↓', positions: [{ sIdx: 3, fret: 5, finger: 1 }] },
      { label: '4ª tr.7 · La (Hammer 3)', rightHandCue: 'Ligado Hammer (H)', positions: [{ sIdx: 3, fret: 7, finger: 3 }] },
      { label: '3ª tr.7 · Re (Dedo 3)', rightHandCue: 'Púa ↑', positions: [{ sIdx: 2, fret: 7, finger: 3 }] },
      { label: '3ª tr.5 · Do (Pull-Off 1)', rightHandCue: 'Ligado Pull-Off (P)', positions: [{ sIdx: 2, fret: 5, finger: 1 }] },
    ],
  },
  {
    id: 'gtr_upper_triads',
    phaseLabel: 'Fase 3 · Fingerpicking, Ligados y Groove',
    focusTag: 'Tríadas agudas 1ª–3ª',
    title: '10. Tríadas Agudas Móviles (C – F – G – Am en Cuerdas 1ª–3ª)',
    defaultBpm: 86,
    ratio: 0.1,
    subdivisionPerBeat: 1,
    drill: 'Rasguea únicamente las 3 cuerdas agudas (3ª–2ª–1ª) cortando el sonido entre pulsos con la mano izquierda.',
    cue: 'Ideal para funk, pop y reggae sin chocar con las frecuencias graves del bajo.',
    steps: [
      {
        label: 'Tríada C (2ª inv · tr.3–5)',
        chordSymbol: 'C',
        rightHandCue: 'Staccato ↓ ↑ ✕',
        isChord: true,
        positions: [
          { sIdx: 2, fret: 5, finger: 2 },
          { sIdx: 1, fret: 5, finger: 3 },
          { sIdx: 0, fret: 3, finger: 1 },
        ],
      },
      {
        label: 'Tríada F (Fund. · tr.5–6)',
        chordSymbol: 'F',
        rightHandCue: 'Staccato ↓ ↑ ✕',
        isChord: true,
        positions: [
          { sIdx: 2, fret: 5, finger: 1 },
          { sIdx: 1, fret: 6, finger: 2 },
          { sIdx: 0, fret: 5, finger: 1 },
        ],
      },
      {
        label: 'Tríada G (Fund. · tr.7–8)',
        chordSymbol: 'G',
        rightHandCue: 'Staccato ↓ ↑ ✕',
        isChord: true,
        positions: [
          { sIdx: 2, fret: 7, finger: 1 },
          { sIdx: 1, fret: 8, finger: 2 },
          { sIdx: 0, fret: 7, finger: 1 },
        ],
      },
      {
        label: 'Tríada Am (1ª inv · tr.5)',
        chordSymbol: 'Am',
        rightHandCue: 'Media cejilla / 1-2-3 ↓',
        isChord: true,
        positions: [
          { sIdx: 2, fret: 5, finger: 1 },
          { sIdx: 1, fret: 5, finger: 2 },
          { sIdx: 0, fret: 5, finger: 3 },
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
    title: '1. Calentamiento: Alternancia Estricta Índice–Medio (I–M) Trastes 5–8',
    defaultBpm: 76,
    ratio: 0.125,
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
    id: 'bass_spider_1324',
    title: '2. Motricidad: Permutación Araña 1–3–2–4 en 4 Cuerdas',
    defaultBpm: 78,
    ratio: 0.125,
    subdivisionPerBeat: 2,
    drill: 'Fortalece dedos 3 y 4 manteniendo los demás cerca del diapasón en trastes 5–8.',
    cue: 'Cero tensión en el pulgar izquierdo; pisa justo detrás de la varilla metálica.',
    steps: [
      { label: '4ª tr.5 (Dedo 1)', rightHandCue: 'I', kickSync: true, style: 'finger', sIdx: 3, fret: 5 },
      { label: '4ª tr.7 (Dedo 3)', rightHandCue: 'M', kickSync: false, style: 'finger', sIdx: 3, fret: 7 },
      { label: '4ª tr.6 (Dedo 2)', rightHandCue: 'I', kickSync: false, style: 'finger', sIdx: 3, fret: 6 },
      { label: '4ª tr.8 (Dedo 4)', rightHandCue: 'M', kickSync: false, style: 'finger', sIdx: 3, fret: 8 },
      { label: '2ª tr.5 (Dedo 1)', rightHandCue: 'I', kickSync: true, style: 'finger', sIdx: 1, fret: 5 },
      { label: '2ª tr.7 (Dedo 3)', rightHandCue: 'M', kickSync: false, style: 'finger', sIdx: 1, fret: 7 },
      { label: '2ª tr.6 (Dedo 2)', rightHandCue: 'I', kickSync: false, style: 'finger', sIdx: 1, fret: 6 },
      { label: '2ª tr.8 (Dedo 4)', rightHandCue: 'M', kickSync: false, style: 'finger', sIdx: 1, fret: 8 },
    ],
  },
  {
    id: 'bass_string_crossing_raking',
    title: '3. Cruce de Cuerdas (String Crossing) y Raking G → D → A → E',
    defaultBpm: 84,
    ratio: 0.125,
    subdivisionPerBeat: 2,
    drill: 'Desciende por las 4 cuerdas aprovechando el raking natural al bajar de cuerda aguda a grave.',
    cue: 'Deja que el dedo caiga con gravedad hacia la cuerda superior para ahorrar energía.',
    steps: [
      { label: '1ª tr.5 (C3)', rightHandCue: 'M', kickSync: true, style: 'finger', sIdx: 0, fret: 5 },
      { label: '1ª tr.7 (D3)', rightHandCue: 'I', kickSync: false, style: 'finger', sIdx: 0, fret: 7 },
      { label: '2ª tr.5 (G2)', rightHandCue: 'I (Rake)', kickSync: false, style: 'finger', sIdx: 1, fret: 5 },
      { label: '2ª tr.7 (A2)', rightHandCue: 'M', kickSync: false, style: 'finger', sIdx: 1, fret: 7 },
      { label: '3ª tr.5 (D2)', rightHandCue: 'M (Rake)', kickSync: true, style: 'finger', sIdx: 2, fret: 5 },
      { label: '3ª tr.7 (E2)', rightHandCue: 'I', kickSync: false, style: 'finger', sIdx: 2, fret: 7 },
      { label: '4ª tr.5 (A1)', rightHandCue: 'I (Rake)', kickSync: false, style: 'finger', sIdx: 3, fret: 5 },
      { label: '4ª tr.8 (C2)', rightHandCue: 'M', kickSync: false, style: 'finger', sIdx: 3, fret: 8 },
    ],
  },
  {
    id: 'bass_floating_thumb_muting',
    title: '4. Apagado a Dos Manos (Floating Thumb + Notas Muertas)',
    defaultBpm: 88,
    ratio: 0.125,
    subdivisionPerBeat: 2,
    drill: 'Silencia cuerdas graves con el pulgar flotante derecho y controla staccato limpio con la izquierda.',
    cue: 'En el bajo profesional el silencio entre notas pesa tanto como la nota misma.',
    steps: [
      { label: '3ª tr.3 (C2)', rightHandCue: 'I + Pulgar en 4ª', kickSync: true, style: 'finger', sIdx: 2, fret: 3 },
      { label: '3ª tr.3 (Corte)', rightHandCue: 'M (Ghost)', kickSync: false, style: 'finger', sIdx: 2, fret: 3 },
      { label: '2ª tr.5 (G2)', rightHandCue: 'I + Pulgar en 3ª', kickSync: false, style: 'finger', sIdx: 1, fret: 5 },
      { label: '2ª tr.5 (Corte)', rightHandCue: 'M (Ghost)', kickSync: false, style: 'finger', sIdx: 1, fret: 5 },
      { label: '1ª tr.5 (C3)', rightHandCue: 'I + Pulgar en 2ª', kickSync: true, style: 'finger', sIdx: 0, fret: 5 },
      { label: '1ª tr.3 (Bb2)', rightHandCue: 'M', kickSync: false, style: 'finger', sIdx: 0, fret: 3 },
      { label: '2ª tr.5 (G2)', rightHandCue: 'M (Rake)', kickSync: false, style: 'finger', sIdx: 1, fret: 5 },
      { label: '3ª tr.3 (C2)', rightHandCue: 'I + Bombo', kickSync: false, style: 'finger', sIdx: 2, fret: 3 },
    ],
  },
  {
    id: 'bass_lockin',
    title: '5. Lock-In Bombo + Bajo (Cajón Tónica – 5ª – Octava en C)',
    defaultBpm: 90,
    ratio: 0.125,
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
    title: '6. Octavas Funk y Slap/Pop (E1 → E2 → G1 → G2 → A1 → A2)',
    defaultBpm: 94,
    ratio: 0.125,
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
    id: 'bass_transition_fills',
    title: '7. Fills de Transición entre Acordes (C → F con Cromatismo)',
    defaultBpm: 96,
    ratio: 0.125,
    subdivisionPerBeat: 2,
    drill: 'Conecta el acorde C hacia F usando un dibujo pentatónico y aproximación de semitono E → F.',
    cue: 'Un fill musical siempre aterriza limpio en el tiempo 1 del acorde destino.',
    steps: [
      { label: 'C2 Raíz (3ª tr.3)', rightHandCue: 'I + Bombo', kickSync: true, style: 'finger', sIdx: 2, fret: 3 },
      { label: 'C2 (3ª tr.3)', rightHandCue: 'M', kickSync: false, style: 'finger', sIdx: 2, fret: 3 },
      { label: 'E2 3ªM (2ª tr.2)', rightHandCue: 'I', kickSync: false, style: 'finger', sIdx: 1, fret: 2 },
      { label: 'G2 5ªJ (2ª tr.5)', rightHandCue: 'M', kickSync: false, style: 'finger', sIdx: 1, fret: 5 },
      { label: 'A2 6ªM (1ª tr.2)', rightHandCue: 'I', kickSync: true, style: 'finger', sIdx: 0, fret: 2 },
      { label: 'C3 8ª (1ª tr.5)', rightHandCue: 'M', kickSync: false, style: 'finger', sIdx: 0, fret: 5 },
      { label: 'E2 Puente (2ª tr.2)', rightHandCue: 'I (Semitono)', kickSync: false, style: 'finger', sIdx: 1, fret: 2 },
      { label: 'F2 Destino (2ª tr.3)', rightHandCue: 'M + Bombo', kickSync: true, style: 'finger', sIdx: 1, fret: 3 },
    ],
  },
  {
    id: 'bass_walking',
    title: '8. Walking Bass ii–V–I (Dm7 – G7 – Cmaj7 con Aproximaciones)',
    defaultBpm: 100,
    ratio: 0.125,
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
  kind: 'inhale' | 'hold' | 'exhale' | 'rest';
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

/**
 * Pure & persistent helper for hiding piano keyboards and focusing on Guitar or Bass
 * in Theory / Harmony / Section 0-1 exercises.
 */
export type VisualInstrumentFocus = 'all' | 'guitar-only' | 'bass-only';

export interface VisualInstrumentViewConfig {
  focus: VisualInstrumentFocus;
  showPiano: boolean;
  neckMode: 'guitar' | 'bass';
  audioTimbre: 'guitar' | 'bass' | 'piano';
  label: string;
}

const VISUAL_INSTRUMENT_STORAGE_KEY = 'enciclopedia_visual_instrument_focus_v1';
let memoryVisualInstrumentFocus: VisualInstrumentFocus = 'all';

export function resolveVisualInstrumentView(
  focus: VisualInstrumentFocus
): VisualInstrumentViewConfig {
  if (focus === 'guitar-only') {
    return {
      focus: 'guitar-only',
      showPiano: false,
      neckMode: 'guitar',
      audioTimbre: 'guitar',
      label: 'Solo Guitarra (6 cuerdas · Piano oculto)',
    };
  }
  if (focus === 'bass-only') {
    return {
      focus: 'bass-only',
      showPiano: false,
      neckMode: 'bass',
      audioTimbre: 'bass',
      label: 'Solo Bajo 4c (4 cuerdas · Piano oculto)',
    };
  }
  return {
    focus: 'all',
    showPiano: true,
    neckMode: 'guitar',
    audioTimbre: 'guitar',
    label: 'Piano + Guitarra / Bajo',
  };
}

export function computeEffectiveExplorerInstrument(
  focus: VisualInstrumentFocus,
  localInstrument: 'guitar' | 'piano' | 'bass'
): 'guitar' | 'piano' | 'bass' {
  if (focus === 'guitar-only') return 'guitar';
  if (focus === 'bass-only') return 'bass';
  return localInstrument;
}

export function getVisualInstrumentFocus(): VisualInstrumentFocus {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      const saved = window.localStorage.getItem(VISUAL_INSTRUMENT_STORAGE_KEY);
      if (saved === 'all' || saved === 'guitar-only' || saved === 'bass-only') {
        memoryVisualInstrumentFocus = saved;
        return saved;
      }
    } catch {
      // ignore storage errors
    }
  }
  return memoryVisualInstrumentFocus;
}

export function setVisualInstrumentFocus(focus: VisualInstrumentFocus): void {
  memoryVisualInstrumentFocus = focus;
  if (typeof window !== 'undefined') {
    if (typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.setItem(VISUAL_INSTRUMENT_STORAGE_KEY, focus);
      } catch {
        // ignore storage errors
      }
    }
    window.dispatchEvent(
      new CustomEvent('enciclopedia:visual-instrument-change', {
        detail: resolveVisualInstrumentView(focus),
      })
    );
  }
}

/**
 * Pure vocal breathing & cycle recovery helpers so singers always get calm
 * breath-recovery beats between repetitions and after exhale phases.
 */
export function getVocalCycleWithRest(
  steps: VocalBreathStep[],
  restBeats: number
): VocalBreathStep[] {
  if (!Array.isArray(steps) || steps.length === 0) return [];
  const safeRest = Math.max(0, Math.round(restBeats));
  if (safeRest <= 0) return steps;
  if (steps[steps.length - 1]?.kind === 'rest') return steps;
  return [
    ...steps,
    {
      label: `Descansa ${safeRest}t`,
      cue: 'Respira libre y suelta hombros antes del siguiente ciclo.',
      beats: safeRest,
      kind: 'rest',
    },
  ];
}

export interface VocalPatternStepState {
  isRest: boolean;
  noteIndex: number;
  restBeat: number;
  restTotal: number;
  cycleNumber: number;
}

export function computeVocalPatternStepState(
  stepIndex: number,
  patternLength: number,
  restBeatsBetweenReps: number
): VocalPatternStepState {
  const safeLen = Math.max(1, Math.round(patternLength));
  const safeRest = Math.max(0, Math.round(restBeatsBetweenReps));
  const cycleLen = safeLen + safeRest;
  const safeStep = Math.max(0, Math.floor(stepIndex));
  const pos = safeStep % cycleLen;
  const cycleNumber = Math.floor(safeStep / cycleLen) + 1;

  if (pos < safeLen) {
    return {
      isRest: false,
      noteIndex: pos,
      restBeat: 0,
      restTotal: safeRest,
      cycleNumber,
    };
  }

  return {
    isRest: true,
    noteIndex: -1,
    restBeat: pos - safeLen + 1,
    restTotal: safeRest,
    cycleNumber,
  };
}

export interface AppoggioPhaseInfo {
  phase: string;
  remaining: number;
  color: string;
  tip: string;
  isRest: boolean;
  totalCycleSec: number;
}

export function computeAppoggioCyclePhase(
  sec: number,
  restSeconds = 4
): AppoggioPhaseInfo {
  const safeRest = Math.max(0, Math.round(restSeconds));
  const totalCycleSec = 14 + safeRest;
  const s = ((Math.floor(sec) % totalCycleSec) + totalCycleSec) % totalCycleSec;

  if (s < 4) {
    return {
      phase: '1. INHALA SILENCIOSO (Costillas y Abdomen)',
      remaining: 4 - s,
      color: '#38bdf8',
      tip: 'Expande cintura 360° sin levantar los hombros ni hacer ruido al aspirar.',
      isRest: false,
      totalCycleSec,
    };
  }
  if (s < 6) {
    return {
      phase: '2. SUSPENSIÓN ABIERTA (Appoggio)',
      remaining: 6 - s,
      color: '#fbbf24',
      tip: 'No cierres la garganta: mantén las costillas abiertas como si siguieras inhalando.',
      isRest: false,
      totalCycleSec,
    };
  }
  if (s < 14) {
    return {
      phase: '3. EXHALA CONSTANTE ("Ssss" o "Ffff" uniforme)',
      remaining: 14 - s,
      color: '#10b981',
      tip: 'Deja salir un hilo fino y estable de aire sin empujar de golpe al final.',
      isRest: false,
      totalCycleSec,
    };
  }
  return {
    phase: '4. DESCANSO Y RESPIRACIÓN LIBRE',
    remaining: totalCycleSec - s,
    color: '#818cf8',
    tip: 'Suelta hombros y abdomen; respira tranquilo antes del próximo ciclo.',
    isRest: true,
    totalCycleSec,
  };
}

/**
 * Pure Neck-Window & Vertical Chord Diagram Helpers
 * Keeps horizontal fretboards readable and easy to tap across desktop and mobile viewports.
 */
export type NeckZoneMode = 'auto' | 'all' | 'open' | 'mid' | 'high';

export interface NeckWindowRange {
  minFret: number;
  maxFret: number;
  label: string;
  fretCount: number;
}

export function computeGuitarNeckWindow(
  activeFrets: number[],
  zoneMode: NeckZoneMode = 'auto',
  neckMaxFret = 12
): NeckWindowRange {
  const safeMax = Math.max(5, Math.round(neckMaxFret));
  if (zoneMode === 'all') {
    return { minFret: 0, maxFret: safeMax, label: `0–${safeMax} Completo`, fretCount: safeMax + 1 };
  }
  if (zoneMode === 'open') {
    const hi = Math.min(safeMax, 5);
    return { minFret: 0, maxFret: hi, label: `Zona Abierta (0–${hi})`, fretCount: hi + 1 };
  }
  if (zoneMode === 'mid') {
    const lo = Math.min(safeMax - 4, 4);
    const hi = Math.min(safeMax, lo + 5);
    return { minFret: lo, maxFret: hi, label: `Zona Media (${lo}–${hi})`, fretCount: hi - lo + 1 };
  }
  if (zoneMode === 'high') {
    const lo = Math.max(0, safeMax - 5);
    return { minFret: lo, maxFret: safeMax, label: `Zona Aguda (${lo}–${safeMax})`, fretCount: safeMax - lo + 1 };
  }

  // 'auto': focus a crisp 5-6 fret zone around the active fretted notes
  const fretted = activeFrets.filter((f) => Number.isFinite(f) && f > 0 && f <= safeMax);
  if (fretted.length === 0) {
    const hi = Math.min(safeMax, 5);
    return { minFret: 0, maxFret: hi, label: `Zona Activa (0–${hi})`, fretCount: hi + 1 };
  }

  const loActive = Math.min(...fretted);
  const hiActive = Math.max(...fretted);
  const hasOpen = activeFrets.some((f) => f === 0);

  if (hiActive <= 5 && (loActive <= 3 || hasOpen)) {
    const hi = Math.min(safeMax, 5);
    return { minFret: 0, maxFret: hi, label: `Zona Activa (0–${hi})`, fretCount: hi + 1 };
  }

  let winMin = hasOpen && hiActive <= 6 ? 0 : Math.max(1, loActive - 1);
  const winMax = Math.min(safeMax, Math.max(winMin + 5, hiActive + 1));
  if (winMax - winMin < 5) {
    winMin = Math.max(0, winMax - 5);
  }
  return {
    minFret: winMin,
    maxFret: winMax,
    label: `Zona Activa (${winMin}–${winMax})`,
    fretCount: winMax - winMin + 1,
  };
}

export interface VerticalChordStringItem {
  lowToHighIdx: number; // 0 = 6ª(E) .. 5 = 1ª(e)
  sIdx: number; // 0 = 1ª(e) .. 5 = 6ª(E)
  label: string;
  fret: number; // -1 muted
  finger: 0 | 1 | 2 | 3 | 4;
  midi: number;
  noteName: string;
  isMuted: boolean;
  isOpen: boolean;
  isRoot: boolean;
  relRow: number; // 1..5 inside box
}

export interface VerticalChordBoxData {
  startFret: number;
  showNut: boolean;
  fretCount: number;
  strings: VerticalChordStringItem[];
  barre: { relRow: number; fromLowIdx: number; toLowIdx: number; finger: number } | null;
  tabSummary: string;
  fingerSummary: string;
}

const DEFAULT_GUITAR_OPEN_HIGH_TO_LOW = [64, 59, 55, 50, 45, 40];
const DEFAULT_GUITAR_STRING_NAMES_LOW_TO_HIGH = ['E', 'A', 'D', 'G', 'B', 'e'];

export function computeVerticalChordBoxData(params: {
  positions: { sIdx: number; fret: number; finger?: 0 | 1 | 2 | 3 | 4 }[];
  rootPc: number;
  openMidisHighToLow?: number[];
}): VerticalChordBoxData {
  const openHigh = params.openMidisHighToLow?.length === 6 ? params.openMidisHighToLow : DEFAULT_GUITAR_OPEN_HIGH_TO_LOW;
  const chordFretPos: ChordFretPos[] = params.positions
    .filter((p) => p.sIdx >= 0 && p.sIdx < 6 && p.fret >= 0)
    .map((p) => ({
      sIdx: p.sIdx,
      fret: p.fret,
      midi: openHigh[p.sIdx] + p.fret,
    }));

  const explicitFingerBySIdx = new Map<number, 0 | 1 | 2 | 3 | 4>();
  params.positions.forEach((p) => {
    if (p.finger !== undefined) {
      explicitFingerBySIdx.set(p.sIdx, p.finger);
    }
  });

  const assigned = assignGuitarChordFingers(chordFretPos, true);
  const posBySIdx = new Map<number, { fret: number; finger: 0 | 1 | 2 | 3 | 4; midi: number }>();
  assigned.positions.forEach((p) => {
    const f = explicitFingerBySIdx.has(p.sIdx) ? explicitFingerBySIdx.get(p.sIdx)! : p.finger;
    posBySIdx.set(p.sIdx, { fret: p.fret, finger: f, midi: p.midi });
  });

  const frettedFrets = Array.from(posBySIdx.values())
    .map((v) => v.fret)
    .filter((f) => f > 0);
  const minPos = frettedFrets.length > 0 ? Math.min(...frettedFrets) : 1;
  const maxPos = frettedFrets.length > 0 ? Math.max(...frettedFrets) : 4;
  const hasOpen = Array.from(posBySIdx.values()).some((v) => v.fret === 0);
  const startFret = hasOpen || maxPos <= 4 || minPos <= 2 ? 1 : minPos;
  const showNut = startFret === 1;
  const fretCount = Math.max(4, Math.min(5, maxPos - startFret + 1 < 4 ? 4 : maxPos - startFret + 1));

  const strings: VerticalChordStringItem[] = [];
  for (let lowIdx = 0; lowIdx < 6; lowIdx++) {
    const sIdx = 5 - lowIdx;
    const hit = posBySIdx.get(sIdx);
    const fret = hit ? hit.fret : -1;
    const finger = hit ? hit.finger : 0;
    const midi = openHigh[sIdx] + Math.max(0, fret);
    const pc = ((midi % 12) + 12) % 12;
    strings.push({
      lowToHighIdx: lowIdx,
      sIdx,
      label: DEFAULT_GUITAR_STRING_NAMES_LOW_TO_HIGH[lowIdx],
      fret,
      finger,
      midi,
      noteName: LOGIC_NOTE_NAMES[pc],
      isMuted: fret < 0,
      isOpen: fret === 0,
      isRoot: fret >= 0 && pc === ((params.rootPc % 12) + 12) % 12,
      relRow: fret > 0 ? fret - startFret + 1 : 0,
    });
  }

  let barre: VerticalChordBoxData['barre'] = null;
  if (assigned.barreFret !== null && assigned.barreFret >= startFret) {
    const barreStrings = strings.filter((s) => s.fret === assigned.barreFret && s.finger === 1);
    if (barreStrings.length >= 2) {
      barre = {
        relRow: assigned.barreFret - startFret + 1,
        fromLowIdx: Math.min(...barreStrings.map((s) => s.lowToHighIdx)),
        toLowIdx: Math.max(...barreStrings.map((s) => s.lowToHighIdx)),
        finger: 1,
      };
    }
  }

  return {
    startFret,
    showNut,
    fretCount,
    strings,
    barre,
    tabSummary: strings.map((s) => (s.isMuted ? 'X' : String(s.fret))).join('-'),
    fingerSummary: strings.map((s) => (s.isMuted ? 'X' : String(s.finger))).join('-'),
  };
}

export function renderVerticalGuitarChordSvg(
  box: VerticalChordBoxData,
  options?: { title?: string; subtitle?: string; showNoteNames?: boolean }
): string {
  const showNotes = options?.showNoteNames ?? true;
  const w = 188;
  const h = 198;
  const padL = 32;
  const padT = 38;
  const gridW = 128;
  const gridH = 124;
  const strGap = gridW / 5;
  const fretGap = gridH / box.fretCount;
  const parts: string[] = [];

  if (options?.title) {
    parts.push(
      `<text x="${w / 2}" y="15" text-anchor="middle" fill="#fbbf24" font-size="11.5" font-weight="800">${options.title}</text>`
    );
  }

  if (box.showNut) {
    parts.push(
      `<line x1="${padL}" y1="${padT}" x2="${padL + gridW}" y2="${padT}" stroke="#f8fafc" stroke-width="4.2" stroke-linecap="round" />`
    );
  } else {
    parts.push(
      `<line x1="${padL}" y1="${padT}" x2="${padL + gridW}" y2="${padT}" stroke="#64748b" stroke-width="1.6" />`
    );
    parts.push(
      `<text x="${padL - 7}" y="${padT + fretGap * 0.64}" text-anchor="end" fill="#fbbf24" font-size="11" font-weight="900">${box.startFret}fr</text>`
    );
  }

  for (let r = 1; r <= box.fretCount; r++) {
    const y = padT + r * fretGap;
    parts.push(`<line x1="${padL}" y1="${y}" x2="${padL + gridW}" y2="${y}" stroke="#334155" stroke-width="1.3" />`);
  }

  // Optional index-finger barre pill behind individual dots
  if (box.barre) {
    const x1 = padL + box.barre.fromLowIdx * strGap;
    const x2 = padL + box.barre.toLowIdx * strGap;
    const cy = padT + (box.barre.relRow - 0.5) * fretGap;
    parts.push(
      `<rect x="${x1 - 9}" y="${cy - 9}" width="${x2 - x1 + 18}" height="18" rx="9" fill="rgba(245,158,11,0.34)" stroke="#fbbf24" stroke-width="1.4" />`
    );
  }

  for (const st of box.strings) {
    const x = padL + st.lowToHighIdx * strGap;
    const sw = (2.1 - st.lowToHighIdx * 0.2).toFixed(2);
    parts.push(
      `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + gridH}" stroke="#94a3b8" stroke-width="${sw}" />`
    );
    parts.push(
      `<text x="${x}" y="${padT + gridH + 15}" text-anchor="middle" fill="${st.isMuted ? '#475569' : '#cbd5e1'}" font-size="10" font-weight="800">${st.label}</text>`
    );

    if (st.isMuted) {
      parts.push(
        `<text x="${x}" y="${padT - 8}" text-anchor="middle" fill="#fb7185" font-size="12" font-weight="900">✕</text>`
      );
    } else if (st.isOpen) {
      parts.push(
        `<circle cx="${x}" cy="${padT - 11}" r="5.5" fill="${st.isRoot ? '#f59e0b' : 'none'}" stroke="${st.isRoot ? '#fef08a' : '#38bdf8'}" stroke-width="2" />`
      );
    } else if (st.relRow >= 1 && st.relRow <= box.fretCount) {
      const cy = padT + (st.relRow - 0.5) * fretGap;
      const fill = st.isRoot ? '#f59e0b' : '#0284c7';
      const stroke = st.isRoot ? '#fef08a' : '#7dd3fc';
      const innerText = st.finger > 0 ? String(st.finger) : st.noteName;
      parts.push(
        `<circle cx="${x}" cy="${cy}" r="10.2" fill="${fill}" stroke="${stroke}" stroke-width="1.8" />`
      );
      parts.push(
        `<text x="${x}" y="${cy + 3.8}" text-anchor="middle" fill="${st.isRoot ? '#090c12' : '#ffffff'}" font-size="10.5" font-weight="900">${innerText}</text>`
      );
      if (showNotes && st.finger > 0) {
        parts.push(
          `<text x="${x}" y="${padT + gridH + 27}" text-anchor="middle" fill="#94a3b8" font-size="8.2" font-weight="700">${st.noteName}</text>`
        );
      }
    }
  }

  return `
    <div class="vertical-chord-card">
      <svg viewBox="0 0 ${w} ${h}" class="vertical-chord-svg" role="img" aria-label="Diagrama vertical de acorde ${options?.title || ''}">
        ${parts.join('')}
      </svg>
      <div class="vertical-chord-meta">
        <span>Trastes: <strong>${box.tabSummary}</strong></span>
        <span>Dedos: <strong>${box.fingerSummary}</strong></span>
      </div>
    </div>
  `;
}

/**
 * Pure Interval & Inversion (Ley del 9 y del 12) Analyzer
 */
export interface IntervalAnalysisResult {
  rootPc: number;
  targetPc: number;
  semitones: number;
  simpleSemitones: number;
  shortLabel: string;
  fullName: string;
  consonance: string;
  character: string;
  invertedSemitones: number;
  invertedShortLabel: string;
  invertedFullName: string;
  inversionLawText: string;
}

const INTERVAL_META_TABLE: Record<
  number,
  {
    short: string;
    name: string;
    consonance: string;
    character: string;
    invShort: string;
    invName: string;
    ordinalSum: string;
  }
> = {
  0: {
    short: '1J',
    name: 'Unísono Justo (0 st)',
    consonance: 'Consonancia Perfecta Absoluta',
    character: 'Fusión total sin distancia ni fricción.',
    invShort: '8J',
    invName: 'Octava Justa (12 st)',
    ordinalSum: '1ª + 8ª = 9',
  },
  1: {
    short: '2m (b2)',
    name: 'Segunda Menor (1 st)',
    consonance: 'Disonancia Fuerte',
    character: 'Fricción inmediata; color Frigio y flamenca tensión hacia abajo.',
    invShort: '7M',
    invName: 'Séptima Mayor (11 st)',
    ordinalSum: '2ª + 7ª = 9',
  },
  2: {
    short: '2M',
    name: 'Segunda Mayor (2 st)',
    consonance: 'Disonancia Suave / Melódica',
    character: 'Paso diatónico natural (1 Tono) y base de acordes sus2.',
    invShort: '7m (b7)',
    invName: 'Séptima Menor (10 st)',
    ordinalSum: '2ª + 7ª = 9',
  },
  3: {
    short: '3m (b3)',
    name: 'Tercera Menor (3 st)',
    consonance: 'Consonancia Imperfecta',
    character: 'Define el carácter menor, íntimo, serio o melancólico.',
    invShort: '6M',
    invName: 'Sexta Mayor (9 st)',
    ordinalSum: '3ª + 6ª = 9',
  },
  4: {
    short: '3M',
    name: 'Tercera Mayor (4 st)',
    consonance: 'Consonancia Imperfecta',
    character: 'Define el carácter mayor, abierto, cálido y afirmativo.',
    invShort: '6m (b6)',
    invName: 'Sexta Menor (8 st)',
    ordinalSum: '3ª + 6ª = 9',
  },
  5: {
    short: '4J',
    name: 'Cuarta Justa (5 st)',
    consonance: 'Consonancia / Suspensión',
    character: 'Firmeza abierta (afinación estándar de cuerdas en bajo y guitarra).',
    invShort: '5J',
    invName: 'Quinta Justa (7 st)',
    ordinalSum: '4ª + 5ª = 9',
  },
  6: {
    short: '4A / 5d',
    name: 'Tritono (6 st)',
    consonance: 'Disonancia Inestable',
    character: 'Máxima simetría e inestabilidad; motor de resolución dominante.',
    invShort: '5d / 4A',
    invName: 'Tritono Espejo (6 st)',
    ordinalSum: '4ª + 5ª = 9',
  },
  7: {
    short: '5J',
    name: 'Quinta Justa (7 st)',
    consonance: 'Consonancia Perfecta',
    character: 'Pilar estructural (proporción 3:2) sin modo mayor ni menor.',
    invShort: '4J',
    invName: 'Cuarta Justa (5 st)',
    ordinalSum: '5ª + 4ª = 9',
  },
  8: {
    short: '6m (b6)',
    name: 'Sexta Menor (8 st)',
    consonance: 'Consonancia Imperfecta',
    character: 'Expresión dramática y lírica; inversión exacta de la 3ª Mayor.',
    invShort: '3M',
    invName: 'Tercera Mayor (4 st)',
    ordinalSum: '6ª + 3ª = 9',
  },
  9: {
    short: '6M',
    name: 'Sexta Mayor (9 st)',
    consonance: 'Consonancia Imperfecta',
    character: 'Luminosidad pastoral y sabor Dórico/Soul; inversión de la 3ª Menor.',
    invShort: '3m (b3)',
    invName: 'Tercera Menor (3 st)',
    ordinalSum: '6ª + 3ª = 9',
  },
  10: {
    short: '7m (b7)',
    name: 'Séptima Menor (10 st)',
    consonance: 'Disonancia Suave',
    character: 'Impulso blues/rock/mixolidio; inversión de la 2ª Mayor.',
    invShort: '2M',
    invName: 'Segunda Mayor (2 st)',
    ordinalSum: '7ª + 2ª = 9',
  },
  11: {
    short: '7M',
    name: 'Séptima Mayor (11 st)',
    consonance: 'Disonancia Brillante / Sensible',
    character: 'Nostalgia sofisticada (Maj7) y atracción magnética hacia la octava.',
    invShort: '2m (b2)',
    invName: 'Segunda Menor (1 st)',
    ordinalSum: '7ª + 2ª = 9',
  },
  12: {
    short: '8J',
    name: 'Octava Justa (12 st)',
    consonance: 'Consonancia Perfecta (2:1)',
    character: 'Misma nota en registro duplicado (+12 trastes en cada cuerda).',
    invShort: '1J',
    invName: 'Unísono Justo (0 st)',
    ordinalSum: '8ª + 1ª = 9',
  },
  14: {
    short: '9M',
    name: 'Novena Mayor (14 st)',
    consonance: 'Intervalo Compuesto (8J + 2M)',
    character: 'Extensión cristalina sobre octava; base de acordes add9 y Maj9.',
    invShort: '7m (b7)',
    invName: 'Séptima Menor simple (10 st)',
    ordinalSum: '2ª + 7ª = 9',
  },
  16: {
    short: '10M',
    name: 'Décima Mayor (16 st)',
    consonance: 'Intervalo Compuesto (8J + 3M)',
    character: 'Disposición abierta clásica de guitarra acústica (bajo + 3ª alta).',
    invShort: '6m (b6)',
    invName: 'Sexta Menor simple (8 st)',
    ordinalSum: '3ª + 6ª = 9',
  },
  17: {
    short: '11J',
    name: 'Oncena Justa (17 st)',
    consonance: 'Intervalo Compuesto (8J + 4J)',
    character: 'Tensión aérea muy fluida en acordes menores (m11) y cuartales.',
    invShort: '5J',
    invName: 'Quinta Justa simple (7 st)',
    ordinalSum: '4ª + 5ª = 9',
  },
  21: {
    short: '13M',
    name: 'Trecena Mayor (21 st)',
    consonance: 'Intervalo Compuesto (8J + 6M)',
    character: 'Extensión aguda elegante sobre acordes dominantes y Maj7.',
    invShort: '3m (b3)',
    invName: 'Tercera Menor simple (3 st)',
    ordinalSum: '6ª + 3ª = 9',
  },
};

export function analyzeIntervalAndInversion(rootPcInput: number, semitonesInput: number): IntervalAnalysisResult {
  const rootPc = ((rootPcInput % 12) + 12) % 12;
  const semitones = Math.max(0, Math.min(24, Math.round(semitonesInput)));
  const simpleSemitones = semitones === 12 ? 12 : semitones % 12;
  const targetPc = (rootPc + semitones) % 12;

  const meta = INTERVAL_META_TABLE[semitones] || INTERVAL_META_TABLE[simpleSemitones] || INTERVAL_META_TABLE[0];
  const invBaseSemi = semitones === 0 ? 12 : semitones === 12 ? 0 : 12 - (semitones % 12);

  return {
    rootPc,
    targetPc,
    semitones,
    simpleSemitones,
    shortLabel: meta.short,
    fullName: meta.name,
    consonance: meta.consonance,
    character: meta.character,
    invertedSemitones: invBaseSemi,
    invertedShortLabel: meta.invShort,
    invertedFullName: meta.invName,
    inversionLawText: `${meta.ordinalSum} · ${semitones % 12 === 0 && semitones > 0 ? 12 : semitones % 12} + ${invBaseSemi} = 12 semitonos (Mayor ↔ Menor · Justo ↔ Justo)`,
  };
}

/**
 * Note Explorer (Pre-Scale Theory Chapter 2) Filter Helper
 */
export type NoteFilterMode = 'single' | 'natural' | 'accidentals' | 'chromatic';

export interface NoteExplorerResult {
  filterMode: NoteFilterMode;
  activePcs: number[];
  rootPc: number;
  summaryTitle: string;
  summaryBody: string;
}

const NATURAL_PCS = [0, 2, 4, 5, 7, 9, 11];
const ACCIDENTAL_PCS = [1, 3, 6, 8, 10];
const ENHARMONIC_TWINS: Record<number, string> = {
  0: 'C (Do) · sin alteración habitual (B# en contextos teóricos)',
  1: 'C# ↔ Db (Do# / Reb)',
  2: 'D (Re)',
  3: 'D# ↔ Eb (Re# / Mib)',
  4: 'E (Mi) · a 1 semitono directo de F (Fa)',
  5: 'F (Fa) · a 1 semitono directo de E (Mi)',
  6: 'F# ↔ Gb (Fa# / Solb)',
  7: 'G (Sol)',
  8: 'G# ↔ Ab (Sol# / Lab)',
  9: 'A (La · 440 Hz en octava 4)',
  10: 'A# ↔ Bb (La# / Sib)',
  11: 'B (Si) · a 1 semitono directo de C (Do)',
};

export function computeNoteExplorerState(filterMode: NoteFilterMode, rootPcInput: number): NoteExplorerResult {
  const rootPc = ((rootPcInput % 12) + 12) % 12;
  if (filterMode === 'natural') {
    return {
      filterMode,
      activePcs: NATURAL_PCS,
      rootPc,
      summaryTitle: 'Solo las 7 Notas Naturales (C – D – E – F – G – A – B)',
      summaryBody: 'Observa que entre E–F y B–C no hay traste vacío en medio (1 semitono directo), mientras que los demás pares saltan 1 traste (2 semitonos).',
    };
  }
  if (filterMode === 'accidentals') {
    return {
      filterMode,
      activePcs: ACCIDENTAL_PCS,
      rootPc,
      summaryTitle: 'Las 5 Notas Alteradas (# Sostenidos / b Bemoles)',
      summaryBody: 'Corresponden exactamente a las 5 teclas negras del piano (grupos de 2 y 3). Cada una comparte traste con dos nombres enarmónicos (ej. C#/Db).',
    };
  }
  if (filterMode === 'chromatic') {
    return {
      filterMode,
      activePcs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      rootPc,
      summaryTitle: `Mapa Cromático Completo (12 Semitonos · Referencia ${LOGIC_NOTE_NAMES[rootPc]})`,
      summaryBody: 'Cada traste hacia la derecha suma +1 semitono; al llegar al traste 12 la nota se repite exactamente una octava más aguda.',
    };
  }
  return {
    filterMode: 'single',
    activePcs: [rootPc],
    rootPc,
    summaryTitle: `Localizador de Octavas y Unísonos: ${LOGIC_NOTE_NAMES[rootPc]}`,
    summaryBody: `Enarmónico / Dato clave: ${ENHARMONIC_TWINS[rootPc]}. Regla de octava en el mástil: +2 cuerdas y +2 trastes (o +3 trastes al cruzar de 3ª G a 2ª B).`,
  };
}

/**
 * 7 Greek Modes Parallel Catalog with Characteristic Degrees
 */
export interface GreekModeMeta {
  id: 'major' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'minor' | 'locrian';
  label: string;
  intervals: number[];
  charOffset: number;
  charDegreeName: string;
  formula: string;
  degrees: string;
  character: string;
}

export const GREEK_MODES_CATALOG: GreekModeMeta[] = [
  {
    id: 'major',
    label: '1. Jónico (Mayor)',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    charOffset: 11,
    charDegreeName: '7M (Sensible)',
    formula: 'T - T - S - T - T - T - S',
    degrees: '1 - 2 - 3 - 4 - 5 - 6 - 7',
    character: 'Luminoso, estable y resolutivo; el grado 4 evita choque si no se sostiene sobre I.',
  },
  {
    id: 'dorian',
    label: '2. Dórico ★6M',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    charOffset: 9,
    charDegreeName: '6M (Sexta Mayor)',
    formula: 'T - S - T - T - T - S - T',
    degrees: '1 - 2 - b3 - 4 - 5 - 6 - b7',
    character: 'Menor elegante y funk/jazz (Santana, So What); la 6M ilumina la tríada menor.',
  },
  {
    id: 'phrygian',
    label: '3. Frigio ★b2',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    charOffset: 1,
    charDegreeName: 'b2 (Segunda Menor)',
    formula: 'S - T - T - T - S - T - T',
    degrees: '1 - b2 - b3 - 4 - 5 - b6 - b7',
    character: 'Tensión flamenca y oscura creada por el semitono inmediato entre 1 y b2.',
  },
  {
    id: 'lydian',
    label: '4. Lidio ★#4',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    charOffset: 6,
    charDegreeName: '#4 (Cuarta Aumentada)',
    formula: 'T - T - T - S - T - T - S',
    degrees: '1 - 2 - 3 - #4 - 5 - 6 - 7',
    character: 'Asombro cinematográfico y flotación espacial al elevar el 4º grado a #4.',
  },
  {
    id: 'mixolydian',
    label: '5. Mixolidio ★b7',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    charOffset: 10,
    charDegreeName: 'b7 (Séptima Menor)',
    formula: 'T - T - S - T - T - S - T',
    degrees: '1 - 2 - 3 - 4 - 5 - 6 - b7',
    character: 'Mayor con actitud blues, rock y funk gracias a la b7 en lugar de sensible.',
  },
  {
    id: 'minor',
    label: '6. Eólico ★b6',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    charOffset: 8,
    charDegreeName: 'b6 (Sexta Menor)',
    formula: 'T - S - T - T - S - T - T',
    degrees: '1 - 2 - b3 - 4 - 5 - b6 - b7',
    character: 'Menor natural emotivo y épico; la b6 tira con gravedad hacia la 5ª justa.',
  },
  {
    id: 'locrian',
    label: '7. Locrio ★b5',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    charOffset: 6,
    charDegreeName: 'b5 (Quinta Disminuida)',
    formula: 'S - T - T - S - T - T - T',
    degrees: '1 - b2 - b3 - 4 - b5 - b6 - b7',
    character: 'Inestable y disonante; al carecer de 5ª justa sirve sobre acordes m7b5.',
  },
];

/**
 * Pedagogical Explorer Mode Resolution (prevents Scale UI leaks in Notes/Intervals chapters)
 */
export type PedagogicalExplorerKind = 'notes' | 'interval' | 'scale' | 'modes' | 'chord';

export function resolveExplorerKind(params: {
  labType: string;
  dataMode?: string | null;
  dataSet?: string | null;
}): PedagogicalExplorerKind {
  if (params.labType === 'interval-lab') return 'interval';
  if (params.dataMode === 'notes') return 'notes';
  if (params.labType === 'scale-explorer' && params.dataSet === 'modes') return 'modes';
  if (params.labType === 'chord-explorer' || params.labType === 'poly-hybrid' || params.dataMode === 'chord-window' || params.dataMode === 'arpeggio') {
    return 'chord';
  }
  return 'scale';
}

/**
 * 5 Movable CAGED Guitar Shapes & Chord Surgery Helpers
 */
export type CagedShapeLetter = 'C' | 'A' | 'G' | 'E' | 'D';

export interface CagedComputedShape {
  shapeLetter: CagedShapeLetter;
  rootPc: number;
  quality: 'maj' | 'min';
  title: string;
  positions: GuitarFingerPos[];
  barreFret: number | null;
  tabSummary: string;
  fingerSummary: string;
  neckWindow: NeckWindowRange;
  rootStringsText: string;
}

const CAGED_TEMPLATES: Record<
  CagedShapeLetter,
  { openRootPc: number; rootDesc: string; majRel: number[]; minRel: number[] }
> = {
  C: {
    openRootPc: 0, // C shape root on 5th (fret 3) & 2nd (fret 1) -> normalized to baseFret = 0 open C
    rootDesc: 'Raíz en 5ª y 2ª cuerda',
    majRel: [-1, 3, 2, 0, 1, 0],
    minRel: [-1, 3, 1, 0, 1, -1],
  },
  A: {
    openRootPc: 9,
    rootDesc: 'Raíz en 5ª y 3ª cuerda',
    majRel: [-1, 0, 2, 2, 2, 0],
    minRel: [-1, 0, 2, 2, 1, 0],
  },
  G: {
    openRootPc: 7,
    rootDesc: 'Raíz en 6ª, 3ª y 1ª cuerda',
    majRel: [3, 2, 0, 0, 0, 3],
    minRel: [3, 1, 0, 0, -1, -1],
  },
  E: {
    openRootPc: 4,
    rootDesc: 'Raíz en 6ª, 4ª y 1ª cuerda',
    majRel: [0, 2, 2, 1, 0, 0],
    minRel: [0, 2, 2, 0, 0, 0],
  },
  D: {
    openRootPc: 2,
    rootDesc: 'Raíz en 4ª y 2ª cuerda',
    majRel: [-1, -1, 0, 2, 3, 2],
    minRel: [-1, -1, 0, 2, 3, 1],
  },
};

export function computeCagedGuitarShape(
  shapeLetter: CagedShapeLetter,
  rootPcInput: number,
  quality: 'maj' | 'min' = 'maj'
): CagedComputedShape {
  const rootPc = ((rootPcInput % 12) + 12) % 12;
  const tpl = CAGED_TEMPLATES[shapeLetter];
  const shift = (rootPc - tpl.openRootPc + 12) % 12;
  const baseRel = quality === 'min' ? tpl.minRel : tpl.majRel;
  const guitarOpen = DEFAULT_GUITAR_OPEN_HIGH_TO_LOW;

  const fretsLowToHigh = baseRel.map((f) => (f < 0 ? -1 : f + shift));
  const maxNeckFret = Math.max(12, ...fretsLowToHigh);

  const voicing: ChordFretPos[] = [];
  for (let lowIdx = 0; lowIdx < 6; lowIdx++) {
    const fret = fretsLowToHigh[lowIdx];
    if (fret >= 0) {
      const sIdx = 5 - lowIdx;
      voicing.push({ sIdx, fret, midi: guitarOpen[sIdx] + fret });
    }
  }

  const fingerResult = assignGuitarChordFingers(voicing, true);
  const tabSummary = fretsLowToHigh.map((f) => (f < 0 ? 'X' : String(f))).join('-');
  const fingerBySIdx = new Map(fingerResult.positions.map((p) => [p.sIdx, p.finger]));
  const fingerSummary = fretsLowToHigh
    .map((f, lowIdx) => (f < 0 ? 'X' : String(fingerBySIdx.get(5 - lowIdx) ?? 0)))
    .join('-');
  const activeFrets = voicing.map((v) => v.fret);

  return {
    shapeLetter,
    rootPc,
    quality,
    title: `${LOGIC_NOTE_NAMES[rootPc]}${quality === 'min' ? 'm' : ''} (Molde CAGED "${shapeLetter}")`,
    positions: fingerResult.positions,
    barreFret: fingerResult.barreFret,
    tabSummary,
    fingerSummary,
    neckWindow: computeGuitarNeckWindow(activeFrets, 'auto', maxNeckFret),
    rootStringsText: tpl.rootDesc,
  };
}

/**
 * 5 Pentatonic Boxes Calculator (Minor & Relative Major Boxes)
 */
export interface PentatonicBoxResult {
  boxIndex: 1 | 2 | 3 | 4 | 5;
  title: string;
  rootPc: number;
  positions: { sIdx: number; fret: number; midi: number; isRoot: boolean }[];
  neckWindow: NeckWindowRange;
}

const PENT_BOX_OFFSETS: Record<1 | 2 | 3 | 4 | 5, { name: string; relLow: [number, number][]; spanStartRel: number }> = {
  // Offsets relative to box root fret on 6th string (for Minor Pentatonic Box 1..5)
  1: { name: 'Caja 1 (Molde Em · Más usada)', spanStartRel: 0, relLow: [[0, 3], [0, 2], [0, 2], [0, 2], [0, 3], [0, 3]] },
  2: { name: 'Caja 2 (Molde Dm · "B.B. King")', spanStartRel: 2, relLow: [[3, 5], [2, 5], [2, 5], [2, 4], [3, 5], [3, 5]] },
  3: { name: 'Caja 3 (Molde Cm)', spanStartRel: 5, relLow: [[5, 7], [5, 7], [5, 7], [4, 7], [5, 8], [5, 7]] },
  4: { name: 'Caja 4 (Molde Am)', spanStartRel: 7, relLow: [[7, 10], [7, 10], [7, 9], [7, 9], [8, 10], [7, 10]] },
  5: { name: 'Caja 5 (Molde Gm)', spanStartRel: 9, relLow: [[10, 12], [10, 12], [9, 12], [9, 12], [10, 13], [10, 12]] },
};

export function computePentatonicBoxWindow(rootPcInput: number, boxIndex: 1 | 2 | 3 | 4 | 5): PentatonicBoxResult {
  const rootPc = ((rootPcInput % 12) + 12) % 12;
  const guitarOpen = DEFAULT_GUITAR_OPEN_HIGH_TO_LOW;
  const baseRoot6 = (rootPc - 4 + 12) % 12;
  const spec = PENT_BOX_OFFSETS[boxIndex];

  // Fold the entire box down 12 frets cleanly if it sits above fret 12
  const minRel = Math.min(...spec.relLow.flat());
  const effectiveBase = baseRoot6 + minRel >= 12 ? baseRoot6 - 12 : baseRoot6;

  const positions: PentatonicBoxResult['positions'] = [];
  for (let lowIdx = 0; lowIdx < 6; lowIdx++) {
    const sIdx = 5 - lowIdx;
    for (const relF of spec.relLow[lowIdx]) {
      const f = effectiveBase + relF;
      if (f >= 0 && f <= 15) {
        const midi = guitarOpen[sIdx] + f;
        positions.push({ sIdx, fret: f, midi, isRoot: midi % 12 === rootPc });
      }
    }
  }

  const maxBoxFret = Math.max(12, ...positions.map((p) => p.fret));
  return {
    boxIndex,
    title: `${LOGIC_NOTE_NAMES[rootPc]}m Pentatónica — ${spec.name}`,
    rootPc,
    positions,
    neckWindow: computeGuitarNeckWindow(positions.map((p) => p.fret), 'auto', maxBoxFret),
  };
}

/**
 * Extension Pyramid & Quartal/Quintal Stack Calculator (`stack-lab`)
 */
export type StackModeKind = 'thirds' | 'fourths' | 'fifths' | 'clusters';

export interface StackLabResult {
  degreeLabel: string;
  chordSymbol: string;
  intervalsFromChordRoot: number[];
  noteNames: string[];
  midis: number[];
  avoidNotesWarning: string | null;
  guitarPositions: GuitarFingerPos[];
  guitarTab: string;
  guitarFingers: string;
}

export function computeExtensionPyramid(params: {
  keyRootPc: number;
  scaleIntervals: number[];
  degreeIndex: number;
  size: number; // 3..7
  stackMode: StackModeKind;
}): StackLabResult {
  const keyRootPc = ((params.keyRootPc % 12) + 12) % 12;
  const scale = params.scaleIntervals.length >= 5 ? params.scaleIntervals : [0, 2, 4, 5, 7, 9, 11];
  const n = scale.length;
  const degIdx = ((params.degreeIndex % n) + n) % n;
  const chordRootPc = (keyRootPc + scale[degIdx]) % 12;
  const stepJump = params.stackMode === 'fourths' ? 3 : params.stackMode === 'fifths' ? 4 : params.stackMode === 'clusters' ? 1 : 2;
  const count = Math.max(3, Math.min(7, params.size));

  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][degIdx] || `${degIdx + 1}`;
  const midis: number[] = [];
  const rawSteps: number[] = [];

  for (let i = 0; i < count; i++) {
    const scalePos = degIdx + i * stepJump;
    const octShift = Math.floor(scalePos / n) * 12;
    const pcOffset = scale[scalePos % n];
    const absSemi = pcOffset + octShift;
    const baseSemi = scale[degIdx];
    rawSteps.push(absSemi - baseSemi);
    midis.push(48 + keyRootPc + absSemi);
  }

  // Keep guitar playable within realistic 4-5 notes if 6 or 7 layers stacked (Root, 3rd/4th, 7th, top extensions)
  const playMidis = midis.length <= 4 ? midis : [midis[0], midis[1], midis[3], midis[midis.length - 1]];
  const guitarPositions = resolvePlayableChordVoicing(playMidis, DEFAULT_GUITAR_OPEN_HIGH_TO_LOW, 12);
  const fingerInfo = assignGuitarChordFingers(guitarPositions, true);

  const pcsMod = rawSteps.map((s) => ((s % 12) + 12) % 12);
  const has3M = pcsMod.includes(4);
  const has3m = pcsMod.includes(3);
  const has4J = rawSteps.includes(17) || rawSteps.includes(5);
  const hasb9Clash = has3M && rawSteps.includes(17) && params.stackMode === 'thirds';

  let suffix = '';
  if (params.stackMode === 'fourths') suffix = ' (Voicing Cuartal)';
  else if (params.stackMode === 'fifths') suffix = ' (Voicing Quintal)';
  else if (params.stackMode === 'clusters') suffix = ' (Cluster por 2ªs)';
  else {
    const q = has3m ? (pcsMod.includes(6) ? 'm7b5' : 'm') : pcsMod.includes(11) ? 'Maj' : '';
    const extTag = count === 3 ? (has3m ? 'm' : pcsMod.includes(6) ? '°' : '') : count === 4 ? (pcsMod.includes(11) ? (has3m ? 'm(Maj7)' : 'Maj7') : `${q}7`) : count === 5 ? `${q || 'Maj'}9` : count === 6 ? `${q || 'Maj'}11` : `${q || 'Maj'}13`;
    suffix = extTag;
  }

  const arrTab = [-1, -1, -1, -1, -1, -1];
  const arrFin = [-1, -1, -1, -1, -1, -1];
  fingerInfo.positions.forEach((p) => {
    const lowIdx = 5 - p.sIdx;
    arrTab[lowIdx] = p.fret;
    arrFin[lowIdx] = p.finger;
  });

  return {
    degreeLabel: `Grado ${roman} (${LOGIC_NOTE_NAMES[chordRootPc]})`,
    chordSymbol: `${LOGIC_NOTE_NAMES[chordRootPc]}${suffix}`,
    intervalsFromChordRoot: rawSteps,
    noteNames: midis.map((m) => LOGIC_NOTE_NAMES[m % 12]),
    midis,
    avoidNotesWarning: hasb9Clash && has4J ? '⚠️ Atención acústica: la 11ª Justa forma choque de 9ª menor (13 st) contra la 3ª Mayor; omite la 3ª o altérala a #11.' : null,
    guitarPositions: fingerInfo.positions,
    guitarTab: arrTab.map((f) => (f < 0 ? 'X' : String(f))).join('-'),
    guitarFingers: arrFin.map((f) => (f < 0 ? 'X' : String(f))).join('-'),
  };
}

/**
 * Detailed Spanish Poetic Scansion & Musical Beat Alignment Analyzer (`prosodia-lab`)
 */
export interface PoeticWordScansion {
  word: string;
  syllables: string[];
  stressedSyllableIdx: number;
  hasSinalefaWithPrev: boolean;
  stressedVowel: string;
}

export interface PoeticProsodyDetail extends LyricLineAnalysis {
  meterName: string;
  artCategory: 'Arte Menor (≤ 8)' | 'Arte Mayor (≥ 9)' | 'Vacío';
  scansionTokens: { text: string; stressed: boolean; isSinalefa: boolean }[];
  anacrusisSlots: string[];
  vowelRegisterAdvice: string;
  hasClosedPeakVowel: boolean;
  wordsAnalysis: PoeticWordScansion[];
}

function splitSpanishWordSyllables(rawWord: string): {
  syllables: string[];
  stressedSyllableIdx: number;
  stressedVowel: string;
} {
  const clean = rawWord.trim();
  const lower = clean.toLowerCase();
  if (!clean) return { syllables: [], stressedSyllableIdx: 0, stressedVowel: '' };

  const vowelRe = /[aeiouáéíóúü]/i;
  const strongRe = /[aeoáéó]/i;
  const weakAccentedRe = /[íú]/i;
  const vowelClusters: { start: number; end: number; hasAccent: boolean }[] = [];

  let i = 0;
  while (i < lower.length) {
    if (vowelRe.test(lower[i])) {
      const start = i;
      let hasAccent = /[áéíóú]/.test(lower[i]);
      while (i + 1 < lower.length) {
        const cur = lower[i];
        const nxt = lower[i + 1];
        if (cur === 'u' && i > 0 && (lower[i - 1] === 'q' || lower[i - 1] === 'g') && /[eiéí]/.test(nxt)) {
          i++;
          hasAccent = hasAccent || /[áéíóú]/.test(lower[i]);
          continue;
        }
        if (vowelRe.test(nxt)) {
          const curStrong = strongRe.test(cur) || weakAccentedRe.test(cur);
          const nxtStrong = strongRe.test(nxt) || weakAccentedRe.test(nxt);
          if (curStrong && nxtStrong) break;
          i++;
          hasAccent = hasAccent || /[áéíóú]/.test(lower[i]);
        } else {
          break;
        }
      }
      vowelClusters.push({ start, end: i, hasAccent });
    }
    i++;
  }

  if (vowelClusters.length === 0) {
    return { syllables: [clean], stressedSyllableIdx: 0, stressedVowel: '' };
  }

  const syllables: string[] = [];
  let sliceStart = 0;
  for (let c = 0; c < vowelClusters.length - 1; c++) {
    const endV = vowelClusters[c].end;
    const nextV = vowelClusters[c + 1].start;
    const consCount = nextV - endV - 1;
    let cut = endV + 1;
    if (consCount === 1) {
      cut = endV + 1;
    } else if (consCount === 2) {
      const pair = lower.slice(endV + 1, nextV);
      const inseparable = /^(bl|br|cl|cr|dr|fl|fr|gl|gr|pl|pr|tr|ch|ll|rr)$/.test(pair);
      cut = inseparable ? endV + 1 : endV + 2;
    } else if (consCount >= 3) {
      const lastTwo = lower.slice(nextV - 2, nextV);
      const inseparable = /^(bl|br|cl|cr|dr|fl|fr|gl|gr|pl|pr|tr|ch|ll|rr)$/.test(lastTwo);
      cut = inseparable ? nextV - 2 : nextV - 1;
    }
    syllables.push(clean.slice(sliceStart, cut));
    sliceStart = cut;
  }
  syllables.push(clean.slice(sliceStart));

  // Locate stressed syllable
  let stressedIdx = vowelClusters.findIndex((vc) => vc.hasAccent);
  if (stressedIdx < 0) {
    if (syllables.length === 1) {
      stressedIdx = 0;
    } else if (/[aeiouns]$/i.test(lower)) {
      stressedIdx = syllables.length - 2; // Grave / Llana
    } else {
      stressedIdx = syllables.length - 1; // Aguda without tilde
    }
  }

  const stressedSyl = (syllables[stressedIdx] || '').toLowerCase();
  const vMatch = stressedSyl.normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[aeiou]/);
  return {
    syllables,
    stressedSyllableIdx: Math.max(0, Math.min(syllables.length - 1, stressedIdx)),
    stressedVowel: vMatch ? vMatch[0].toUpperCase() : '',
  };
}

export function classifySpanishPoeticMeter(metricSyllables: number): {
  meterName: string;
  artCategory: 'Arte Menor (≤ 8)' | 'Arte Mayor (≥ 9)' | 'Vacío';
} {
  if (metricSyllables <= 0) return { meterName: 'Sin texto', artCategory: 'Vacío' };
  const artCategory = metricSyllables <= 8 ? 'Arte Menor (≤ 8)' : 'Arte Mayor (≥ 9)';
  const names: Record<number, string> = {
    2: 'Bisílabo (2)',
    3: 'Trisílabo (3)',
    4: 'Tetrasílabo (4 · Pie quebrado)',
    5: 'Pentasílabo (5 · Seguidilla / Adónico)',
    6: 'Hexasílabo (6 · Romancillo / Villancico)',
    7: 'Heptasílabo (7 · Seguidilla / Anacreóntico)',
    8: 'Octosílabo (8 · Romance / Décima / Corrido)',
    9: 'Eneasílabo (9 · Lírica moderna / Trova)',
    10: 'Decasílabo (10 · Himno / Anapéstico)',
    11: 'Endecasílabo (11 · Soneto / Lira / Balada)',
    12: 'Dodecasílabo (12 · Seguidilla compuesta)',
    14: 'Alejandrino (14 = 7+7 · Hemistiquios clásicos)',
  };
  return {
    meterName: names[metricSyllables] || `Verso libre / compuesto (${metricSyllables} sílabas)`,
    artCategory,
  };
}

export function analyzePoeticProsodyDetailed(line: string): PoeticProsodyDetail {
  const base = analyzeSpanishLyricLine(line);
  const rawWords = line
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]/g, ''))
    .filter(Boolean);

  if (rawWords.length === 0) {
    return {
      ...base,
      meterName: 'Sin texto',
      artCategory: 'Vacío',
      scansionTokens: [],
      anacrusisSlots: [],
      vowelRegisterAdvice: 'Escribe o elige un verso para analizar sus sílabas tónicas, sinalefas y apertura vocal.',
      hasClosedPeakVowel: false,
      wordsAnalysis: [],
    };
  }

  const wordsAnalysis: PoeticWordScansion[] = [];
  const scansionTokens: { text: string; stressed: boolean; isSinalefa: boolean }[] = [];

  for (let wIdx = 0; wIdx < rawWords.length; wIdx++) {
    const word = rawWords[wIdx];
    const info = splitSpanishWordSyllables(word);
    const prevWord = wIdx > 0 ? rawWords[wIdx - 1].toLowerCase() : '';
    const currLow = word.toLowerCase();
    const prevEndsVowel = /[aeiouáéíóúüy]$/i.test(prevWord);
    const currStartsVowel = /^(?:[aeiouáéíóúü]|h[aeiouáéíóúü])/i.test(currLow);
    const hasSinalefaWithPrev = wIdx > 0 && prevEndsVowel && currStartsVowel;

    // Function words (articles/prepositions) are prosodically unstressed unless solitary final
    const isUnstressedFunc =
      rawWords.length > 1 &&
      wIdx < rawWords.length - 1 &&
      /^(el|la|los|las|un|una|de|del|al|a|en|con|sin|por|para|y|o|que|mi|tu|su|se|me|te|le|lo|nos)$/i.test(currLow);

    wordsAnalysis.push({
      word,
      syllables: info.syllables,
      stressedSyllableIdx: isUnstressedFunc ? -1 : info.stressedSyllableIdx,
      hasSinalefaWithPrev,
      stressedVowel: info.stressedVowel,
    });

    info.syllables.forEach((syl, sIdx) => {
      const stressed = !isUnstressedFunc && sIdx === info.stressedSyllableIdx;
      if (sIdx === 0 && hasSinalefaWithPrev && scansionTokens.length > 0) {
        const prev = scansionTokens[scansionTokens.length - 1];
        prev.text = `${prev.text}‿${syl}`;
        prev.stressed = prev.stressed || stressed;
        prev.isSinalefa = true;
      } else {
        scansionTokens.push({ text: syl, stressed, isSinalefa: false });
      }
    });
  }

  const { meterName, artCategory } = classifySpanishPoeticMeter(base.metricSyllables);
  const lastWordObj = wordsAnalysis[wordsAnalysis.length - 1];
  const peakVowel = lastWordObj?.stressedVowel || 'A';
  const hasClosedPeakVowel = peakVowel === 'I' || peakVowel === 'U';
  const vowelRegisterAdvice = hasClosedPeakVowel
    ? `⚠️ Final en vocal cerrada "${peakVowel}" (palabra "${lastWordObj.word}"): en notas agudas (> G4/C5) estrecha la laringe; úsala en registro medio/íntimo o sustitúyela por vocal abierta (A, O, E) en el clímax.`
    : `✅ Final resonante en vocal abierta "${peakVowel}" (palabra "${lastWordObj.word}"): ideal para sostener notas largas o agudas en el clímax sin estrangular la voz.`;

  // Build musical alignment hints: lead-in unstressed syllables go into anacrusis before Beat 1
  const firstStressedIdx = scansionTokens.findIndex((t) => t.stressed);
  const anacrusisSlots =
    firstStressedIdx > 0
      ? scansionTokens.slice(0, firstStressedIdx).map((t) => t.text)
      : [];

  return {
    ...base,
    meterName,
    artCategory,
    scansionTokens,
    anacrusisSlots,
    vowelRegisterAdvice,
    hasClosedPeakVowel,
    wordsAnalysis,
  };
}

/**
 * Song Form Architect Templates (Linear + Non-Traditional Forms)
 */
export interface SongFormBlock {
  id: string;
  label: string;
  bars: number;
  energy: number; // 1..10
  role: string;
  color: string;
  chordSnippet: number[]; // MIDI chords for audio preview
}

export interface SongFormTemplate {
  id: string;
  name: string;
  category: 'Clásica' | 'No Lineal / Sin Estribillo' | 'Moderna / Invertida' | 'Épica / Progresiva';
  summary: string;
  blocks: SongFormBlock[];
}

export const SONG_FORM_ARCHITECT_TEMPLATES: SongFormTemplate[] = [
  {
    id: 'pop-classic',
    name: 'Verso – Precoro – Coro (Clásico Pop/Rock)',
    category: 'Clásica',
    summary: 'Arquitectura estándar con rampa ascendente (Precoro) y estallido en el Coro antes del segundo 45.',
    blocks: [
      { id: 'intro', label: 'Intro', bars: 4, energy: 3, role: 'Motivo semilla', color: '#38bdf8', chordSnippet: [48, 60, 64, 67] },
      { id: 'v1', label: 'Verso 1', bars: 8, energy: 4, role: 'Narrativa íntima', color: '#60a5fa', chordSnippet: [45, 57, 60, 64] },
      { id: 'pc1', label: 'Precoro', bars: 4, energy: 7, role: 'Escalera de tensión', color: '#a855f7', chordSnippet: [53, 57, 60, 65] },
      { id: 'c1', label: 'Estribillo 1', bars: 8, energy: 9, role: 'Título + Clímax', color: '#f59e0b', chordSnippet: [48, 60, 64, 67] },
      { id: 'v2', label: 'Verso 2', bars: 8, energy: 5, role: 'Nueva capa rítmica', color: '#60a5fa', chordSnippet: [45, 57, 60, 64] },
      { id: 'pc2', label: 'Precoro 2', bars: 4, energy: 7, role: 'Empuje dominante', color: '#a855f7', chordSnippet: [55, 59, 62, 65] },
      { id: 'c2', label: 'Estribillo 2', bars: 8, energy: 9, role: 'Armonías vocales', color: '#f59e0b', chordSnippet: [48, 60, 64, 67] },
      { id: 'br', label: 'Puente (Middle 8)', bars: 8, energy: 6, role: 'Giro armónico', color: '#10b981', chordSnippet: [56, 60, 63, 68] },
      { id: 'c3', label: 'Estribillo Final', bars: 12, energy: 10, role: 'Clímax máximo', color: '#ef4444', chordSnippet: [50, 62, 66, 69] },
      { id: 'outro', label: 'Outro', bars: 4, energy: 2, role: 'Resolución', color: '#94a3b8', chordSnippet: [48, 60, 64, 67] },
    ],
  },
  {
    id: 'aaa-strophic',
    name: 'AAA Estrofa Pura / Folclore / Balada Narrativa (Sin Estribillo)',
    category: 'No Lineal / Sin Estribillo',
    summary: 'No hay coro ni precoro: cada estrofa cuenta un capítulo distinto cerrando con el título (Refrán al pie, como Bob Dylan, Silvio Rodríguez o corridos/romances).',
    blocks: [
      { id: 'intro', label: 'Intro Acústica', bars: 4, energy: 3, role: 'Establece el paisaje', color: '#38bdf8', chordSnippet: [48, 60, 64, 67] },
      { id: 'a1', label: 'Estrofa A1 + Refrán', bars: 16, energy: 5, role: 'Planteamiento + verso título', color: '#60a5fa', chordSnippet: [48, 55, 64, 67] },
      { id: 'a2', label: 'Estrofa A2 + Refrán', bars: 16, energy: 6, role: 'Desarrollo + capa de bajo', color: '#60a5fa', chordSnippet: [45, 57, 60, 64] },
      { id: 'solo', label: 'Interludio / Solo', bars: 8, energy: 7, role: 'Respiro instrumental', color: '#10b981', chordSnippet: [53, 57, 60, 64] },
      { id: 'a3', label: 'Estrofa A3 + Refrán', bars: 16, energy: 8, role: 'Clímax narrativo', color: '#f59e0b', chordSnippet: [55, 59, 62, 67] },
      { id: 'a4', label: 'Estrofa A4 (Desenlace)', bars: 16, energy: 4, role: 'Giro poético final', color: '#94a3b8', chordSnippet: [48, 60, 64, 67] },
    ],
  },
  {
    id: 'aaba-standard',
    name: 'AABA de 32 Compases (Jazz, Bolero, Broadway)',
    category: 'No Lineal / Sin Estribillo',
    summary: 'Sin estribillo separado: el título abre o cierra la sección A (8 c.), y una sola sección B (Puente) cambia de centro tonal en el compás 17.',
    blocks: [
      { id: 'a1', label: 'A1 (Tema + Título)', bars: 8, energy: 5, role: 'Exposición A', color: '#60a5fa', chordSnippet: [48, 60, 64, 67, 71] },
      { id: 'a2', label: 'A2 (Repetición)', bars: 8, energy: 6, role: 'Fijación en memoria', color: '#60a5fa', chordSnippet: [48, 60, 64, 67, 71] },
      { id: 'b', label: 'B (Puente / Liberación)', bars: 8, energy: 8, role: 'Contraste al IV o iii', color: '#10b981', chordSnippet: [53, 60, 65, 69] },
      { id: 'a3', label: 'A3 (Retorno)', bars: 8, energy: 6, role: 'Regreso al hogar', color: '#f59e0b', chordSnippet: [55, 59, 62, 65] },
      { id: 'tag', label: 'Tag / Turnaround', bars: 4, energy: 4, role: 'Coda de 3 compases', color: '#94a3b8', chordSnippet: [48, 60, 64, 67, 71] },
    ],
  },
  {
    id: 'hook-first',
    name: 'Estructura Invertida / Chorus-First (Pop Moderno & Urbano)',
    category: 'Moderna / Invertida',
    summary: 'Empieza directamente por el Estribillo/Hook en el segundo 0, alterna Versos breves con Drops instrumentales y evita el precoro largo.',
    blocks: [
      { id: 'c0', label: 'Hook / Coro Inicial', bars: 8, energy: 8, role: 'Impacto en segundo 0', color: '#f59e0b', chordSnippet: [48, 60, 64, 67] },
      { id: 'v1', label: 'Verso 1 (Minimal)', bars: 8, energy: 4, role: 'Voz seca + subgrave', color: '#60a5fa', chordSnippet: [45, 57, 60, 64] },
      { id: 'c1', label: 'Coro 1', bars: 8, energy: 9, role: 'Regresa el gancho', color: '#f59e0b', chordSnippet: [48, 60, 64, 67] },
      { id: 'drop', label: 'Post-Coro / Drop', bars: 8, energy: 10, role: 'Clímax rítmico sin voz', color: '#ef4444', chordSnippet: [53, 60, 65, 69] },
      { id: 'v2', label: 'Verso 2 / Rap', bars: 8, energy: 5, role: 'Flujo denso', color: '#60a5fa', chordSnippet: [45, 57, 60, 64] },
      { id: 'c2', label: 'Coro + Drop Final', bars: 16, energy: 10, role: 'Cierre explosivo', color: '#ef4444', chordSnippet: [55, 59, 62, 67] },
    ],
  },
  {
    id: 'through-composed',
    name: 'Through-Composed / Suite Progresiva (A–B–C–D sin retorno)',
    category: 'Épica / Progresiva',
    summary: 'Forma abierta cinematográfica ("Bohemian Rhapsody", rock progresivo, canción de autor épica): cada acto introduce música nueva sin volver al estribillo anterior.',
    blocks: [
      { id: 'act1', label: 'Acto I: Prólogo Íntimo', bars: 8, energy: 3, role: 'Piano y voz a capella', color: '#38bdf8', chordSnippet: [46, 58, 62, 65] },
      { id: 'act2', label: 'Acto II: Balada (B)', bars: 16, energy: 6, role: 'Narración dramática', color: '#60a5fa', chordSnippet: [48, 55, 60, 63] },
      { id: 'act3', label: 'Acto III: Secc. Contraste (C)', bars: 12, energy: 8, role: 'Cambio de compás / modo', color: '#a855f7', chordSnippet: [51, 58, 63, 67] },
      { id: 'act4', label: 'Acto IV: Clímax (D)', bars: 16, energy: 10, role: 'Riff pesado / Orquesta', color: '#ef4444', chordSnippet: [53, 60, 65, 68] },
      { id: 'epil', label: 'Epílogo / Silencio', bars: 8, energy: 2, role: 'Retorno al susurro inicial', color: '#94a3b8', chordSnippet: [46, 58, 62, 65] },
    ],
  },
];

export interface SongFormMetrics {
  totalBars: number;
  totalSeconds: number;
  formattedDuration: string;
  peakEnergy: number;
  peakBlockLabel: string;
  peakPositionPercent: number;
  isGoldenRatioPeak: boolean;
}

export function computeSongFormMetrics(blocks: SongFormBlock[], bpm: number, beatsPerBar = 4): SongFormMetrics {
  const safeBpm = Math.max(40, Math.min(220, bpm || 110));
  const totalBars = blocks.reduce((acc, b) => acc + Math.max(1, b.bars), 0);
  const secPerBar = (beatsPerBar * 60) / safeBpm;
  const totalSeconds = Math.round(totalBars * secPerBar);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const formattedDuration = `${mins}:${secs.toString().padStart(2, '0')}`;

  let accBars = 0;
  let peakEnergy = -1;
  let peakBlockLabel = blocks[0]?.label || '—';
  let peakMidBars = 0;

  blocks.forEach((b) => {
    const mid = accBars + b.bars / 2;
    if (b.energy >= peakEnergy) {
      peakEnergy = b.energy;
      peakBlockLabel = b.label;
      peakMidBars = mid;
    }
    accBars += b.bars;
  });

  const peakPositionPercent = totalBars > 0 ? Math.round((peakMidBars / totalBars) * 100) : 0;
  const isGoldenRatioPeak = peakPositionPercent >= 55 && peakPositionPercent <= 85;

  return {
    totalBars,
    totalSeconds,
    formattedDuration,
    peakEnergy: Math.max(0, peakEnergy),
    peakBlockLabel,
    peakPositionPercent,
    isGoldenRatioPeak,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TALLER DE COMPOSICIÓN POÉTICA (MÓDULO 3 · SECCIÓN 10)
 * Pure rhyme engine (consonant + assonant), non-linear structure generator,
 * level-based creative writing advice, and local word-prompt draft evaluator.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type PoeticWordCategory =
  | 'Naturaleza y Cosmos'
  | 'Objetos y Lugares'
  | 'Emoción y Sonido'
  | 'Tiempo y Movimiento';

export interface PoeticWordBankEntry {
  word: string;
  category: PoeticWordCategory;
}

export const SPANISH_POETIC_WORD_BANK: PoeticWordBankEntry[] = [
  // Naturaleza y Cosmos
  { word: 'luna', category: 'Naturaleza y Cosmos' },
  { word: 'cuna', category: 'Naturaleza y Cosmos' },
  { word: 'duna', category: 'Naturaleza y Cosmos' },
  { word: 'laguna', category: 'Naturaleza y Cosmos' },
  { word: 'fortuna', category: 'Naturaleza y Cosmos' },
  { word: 'bruma', category: 'Naturaleza y Cosmos' },
  { word: 'espuma', category: 'Naturaleza y Cosmos' },
  { word: 'lluvia', category: 'Naturaleza y Cosmos' },
  { word: 'mar', category: 'Naturaleza y Cosmos' },
  { word: 'sal', category: 'Naturaleza y Cosmos' },
  { word: 'sol', category: 'Naturaleza y Cosmos' },
  { word: 'cielo', category: 'Naturaleza y Cosmos' },
  { word: 'desvelo', category: 'Naturaleza y Cosmos' },
  { word: 'consuelo', category: 'Naturaleza y Cosmos' },
  { word: 'lucero', category: 'Naturaleza y Cosmos' },
  { word: 'sendero', category: 'Naturaleza y Cosmos' },
  { word: 'viento', category: 'Naturaleza y Cosmos' },
  { word: 'invierno', category: 'Naturaleza y Cosmos' },
  { word: 'eterno', category: 'Naturaleza y Cosmos' },
  { word: 'niebla', category: 'Naturaleza y Cosmos' },
  { word: 'estrella', category: 'Naturaleza y Cosmos' },
  { word: 'huella', category: 'Naturaleza y Cosmos' },
  { word: 'ceniza', category: 'Naturaleza y Cosmos' },
  { word: 'río', category: 'Naturaleza y Cosmos' },
  { word: 'frío', category: 'Naturaleza y Cosmos' },
  { word: 'rocío', category: 'Naturaleza y Cosmos' },
  { word: 'luz', category: 'Naturaleza y Cosmos' },
  { word: 'sur', category: 'Naturaleza y Cosmos' },
  { word: 'metal', category: 'Objetos y Lugares' },
  { word: 'señal', category: 'Objetos y Lugares' },
  { word: 'aurora', category: 'Naturaleza y Cosmos' },
  { word: 'sombra', category: 'Naturaleza y Cosmos' },
  { word: 'alfombra', category: 'Naturaleza y Cosmos' },
  { word: 'raíz', category: 'Naturaleza y Cosmos' },
  { word: 'flor', category: 'Naturaleza y Cosmos' },
  { word: 'fuego', category: 'Naturaleza y Cosmos' },
  { word: 'hielo', category: 'Naturaleza y Cosmos' },
  { word: 'arena', category: 'Naturaleza y Cosmos' },
  { word: 'marea', category: 'Naturaleza y Cosmos' },
  { word: 'bosque', category: 'Naturaleza y Cosmos' },
  { word: 'nube', category: 'Naturaleza y Cosmos' },
  { word: 'relámpago', category: 'Naturaleza y Cosmos' },
  { word: 'piedra', category: 'Naturaleza y Cosmos' },
  { word: 'tierra', category: 'Naturaleza y Cosmos' },
  { word: 'alba', category: 'Naturaleza y Cosmos' },
  { word: 'calma', category: 'Naturaleza y Cosmos' },
  { word: 'ocaso', category: 'Naturaleza y Cosmos' },
  { word: 'horizonte', category: 'Naturaleza y Cosmos' },
  { word: 'monte', category: 'Naturaleza y Cosmos' },
  { word: 'hoja', category: 'Naturaleza y Cosmos' },
  { word: 'ola', category: 'Naturaleza y Cosmos' },
  { word: 'trueno', category: 'Naturaleza y Cosmos' },
  // Objetos y Lugares
  { word: 'cristal', category: 'Objetos y Lugares' },
  { word: 'umbral', category: 'Objetos y Lugares' },
  { word: 'portal', category: 'Objetos y Lugares' },
  { word: 'espejo', category: 'Objetos y Lugares' },
  { word: 'ventana', category: 'Objetos y Lugares' },
  { word: 'llave', category: 'Objetos y Lugares' },
  { word: 'nave', category: 'Objetos y Lugares' },
  { word: 'puente', category: 'Objetos y Lugares' },
  { word: 'fuente', category: 'Objetos y Lugares' },
  { word: 'frente', category: 'Objetos y Lugares' },
  { word: 'ciudad', category: 'Objetos y Lugares' },
  { word: 'verdad', category: 'Objetos y Lugares' },
  { word: 'soledad', category: 'Objetos y Lugares' },
  { word: 'andén', category: 'Objetos y Lugares' },
  { word: 'tren', category: 'Objetos y Lugares' },
  { word: 'reloj', category: 'Objetos y Lugares' },
  { word: 'balcón', category: 'Objetos y Lugares' },
  { word: 'rincón', category: 'Objetos y Lugares' },
  { word: 'carta', category: 'Objetos y Lugares' },
  { word: 'mapa', category: 'Objetos y Lugares' },
  { word: 'calle', category: 'Objetos y Lugares' },
  { word: 'valle', category: 'Objetos y Lugares' },
  { word: 'faro', category: 'Objetos y Lugares' },
  { word: 'puerto', category: 'Objetos y Lugares' },
  { word: 'desierto', category: 'Objetos y Lugares' },
  { word: 'techo', category: 'Objetos y Lugares' },
  { word: 'lecho', category: 'Objetos y Lugares' },
  { word: 'mesa', category: 'Objetos y Lugares' },
  { word: 'fresa', category: 'Objetos y Lugares' },
  { word: 'promesa', category: 'Objetos y Lugares' },
  { word: 'muro', category: 'Objetos y Lugares' },
  { word: 'futuro', category: 'Objetos y Lugares' },
  { word: 'barco', category: 'Objetos y Lugares' },
  { word: 'charco', category: 'Objetos y Lugares' },
  { word: 'hilo', category: 'Objetos y Lugares' },
  { word: 'filo', category: 'Objetos y Lugares' },
  { word: 'papel', category: 'Objetos y Lugares' },
  { word: 'piel', category: 'Objetos y Lugares' },
  { word: 'miel', category: 'Objetos y Lugares' },
  { word: 'café', category: 'Objetos y Lugares' },
  // Emoción y Sonido
  { word: 'silencio', category: 'Emoción y Sonido' },
  { word: 'canto', category: 'Emoción y Sonido' },
  { word: 'llanto', category: 'Emoción y Sonido' },
  { word: 'manto', category: 'Emoción y Sonido' },
  { word: 'voz', category: 'Emoción y Sonido' },
  { word: 'adiós', category: 'Emoción y Sonido' },
  { word: 'eco', category: 'Emoción y Sonido' },
  { word: 'hueco', category: 'Emoción y Sonido' },
  { word: 'susurro', category: 'Emoción y Sonido' },
  { word: 'latido', category: 'Emoción y Sonido' },
  { word: 'olvido', category: 'Emoción y Sonido' },
  { word: 'ruido', category: 'Emoción y Sonido' },
  { word: 'nido', category: 'Emoción y Sonido' },
  { word: 'canción', category: 'Emoción y Sonido' },
  { word: 'corazón', category: 'Emoción y Sonido' },
  { word: 'razón', category: 'Emoción y Sonido' },
  { word: 'pasión', category: 'Emoción y Sonido' },
  { word: 'emoción', category: 'Emoción y Sonido' },
  { word: 'acorde', category: 'Emoción y Sonido' },
  { word: 'borde', category: 'Emoción y Sonido' },
  { word: 'pulso', category: 'Emoción y Sonido' },
  { word: 'impulso', category: 'Emoción y Sonido' },
  { word: 'aliento', category: 'Emoción y Sonido' },
  { word: 'lamento', category: 'Emoción y Sonido' },
  { word: 'sueño', category: 'Emoción y Sonido' },
  { word: 'dueño', category: 'Emoción y Sonido' },
  { word: 'miedo', category: 'Emoción y Sonido' },
  { word: 'enredo', category: 'Emoción y Sonido' },
  { word: 'calor', category: 'Emoción y Sonido' },
  { word: 'dolor', category: 'Emoción y Sonido' },
  { word: 'temblor', category: 'Emoción y Sonido' },
  { word: 'rumor', category: 'Emoción y Sonido' },
  { word: 'melodía', category: 'Emoción y Sonido' },
  { word: 'armonía', category: 'Emoción y Sonido' },
  { word: 'nostalgia', category: 'Emoción y Sonido' },
  { word: 'magia', category: 'Emoción y Sonido' },
  { word: 'pena', category: 'Emoción y Sonido' },
  { word: 'serena', category: 'Emoción y Sonido' },
  { word: 'vértigo', category: 'Emoción y Sonido' },
  { word: 'grito', category: 'Emoción y Sonido' },
  // Tiempo y Movimiento
  { word: 'ayer', category: 'Tiempo y Movimiento' },
  { word: 'amanecer', category: 'Tiempo y Movimiento' },
  { word: 'volver', category: 'Tiempo y Movimiento' },
  { word: 'arder', category: 'Tiempo y Movimiento' },
  { word: 'caer', category: 'Tiempo y Movimiento' },
  { word: 'correr', category: 'Tiempo y Movimiento' },
  { word: 'caminar', category: 'Tiempo y Movimiento' },
  { word: 'soñar', category: 'Tiempo y Movimiento' },
  { word: 'cantar', category: 'Tiempo y Movimiento' },
  { word: 'callar', category: 'Tiempo y Movimiento' },
  { word: 'volar', category: 'Tiempo y Movimiento' },
  { word: 'andar', category: 'Tiempo y Movimiento' },
  { word: 'despertar', category: 'Tiempo y Movimiento' },
  { word: 'sentir', category: 'Tiempo y Movimiento' },
  { word: 'huir', category: 'Tiempo y Movimiento' },
  { word: 'latir', category: 'Tiempo y Movimiento' },
  { word: 'vivir', category: 'Tiempo y Movimiento' },
  { word: 'seguir', category: 'Tiempo y Movimiento' },
  { word: 'instante', category: 'Tiempo y Movimiento' },
  { word: 'distante', category: 'Tiempo y Movimiento' },
  { word: 'errante', category: 'Tiempo y Movimiento' },
  { word: 'eternidad', category: 'Tiempo y Movimiento' },
  { word: 'madrugada', category: 'Tiempo y Movimiento' },
  { word: 'mirada', category: 'Tiempo y Movimiento' },
  { word: 'noche', category: 'Tiempo y Movimiento' },
  { word: 'derroche', category: 'Tiempo y Movimiento' },
  { word: 'tarde', category: 'Tiempo y Movimiento' },
  { word: 'cobarde', category: 'Tiempo y Movimiento' },
  { word: 'prisa', category: 'Tiempo y Movimiento' },
  { word: 'brisa', category: 'Tiempo y Movimiento' },
  { word: 'risa', category: 'Tiempo y Movimiento' },
  { word: 'regreso', category: 'Tiempo y Movimiento' },
  { word: 'peso', category: 'Tiempo y Movimiento' },
  { word: 'beso', category: 'Tiempo y Movimiento' },
  { word: 'camino', category: 'Tiempo y Movimiento' },
  { word: 'destino', category: 'Tiempo y Movimiento' },
  { word: 'paso', category: 'Tiempo y Movimiento' },
  { word: 'abrazo', category: 'Tiempo y Movimiento' },
  { word: 'trazo', category: 'Tiempo y Movimiento' },
  { word: 'ausencia', category: 'Tiempo y Movimiento' },
  { word: 'paciencia', category: 'Tiempo y Movimiento' },
  { word: 'esencia', category: 'Emoción y Sonido' },
  { word: 'presencia', category: 'Emoción y Sonido' },
  { word: 'conciencia', category: 'Emoción y Sonido' },
  { word: 'camino', category: 'Tiempo y Movimiento' },
  { word: 'destino', category: 'Tiempo y Movimiento' },
  { word: 'peregrino', category: 'Tiempo y Movimiento' },
  { word: 'molino', category: 'Objetos y Lugares' },
  { word: 'memoria', category: 'Tiempo y Movimiento' },
  { word: 'historia', category: 'Tiempo y Movimiento' },
];

export interface SpanishRhymeKeys {
  cleanWord: string;
  normalizedWord: string;
  consonantKey: string;
  assonantKey: string;
  stressedVowel: string;
  openForHighSinging: boolean;
}

function stripSpanishDiacritics(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function extractSyllableNucleusVowel(syllable: string): string {
  const lower = syllable.toLowerCase();
  const accented = lower.match(/[áéíóú]/);
  if (accented) {
    return stripSpanishDiacritics(accented[0]);
  }
  const norm = stripSpanishDiacritics(lower);
  const strong = norm.match(/[aeo]/);
  if (strong) return strong[0];
  const vowels = norm.match(/[aeiou]/g);
  if (!vowels || vowels.length === 0) return '';
  return vowels[vowels.length - 1];
}

export function extractSpanishPoeticRhymeKeys(rawWord: string): SpanishRhymeKeys {
  const cleaned = rawWord
    .trim()
    .split(/\s+/)
    .pop()
    ?.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]/g, '') || '';

  if (!cleaned) {
    return {
      cleanWord: '',
      normalizedWord: '',
      consonantKey: '',
      assonantKey: '',
      stressedVowel: '',
      openForHighSinging: true,
    };
  }

  const sylInfo = splitSpanishWordSyllables(cleaned);
  const stressedSyl = sylInfo.syllables[sylInfo.stressedSyllableIdx] || cleaned;
  const tailSyllables = sylInfo.syllables.slice(sylInfo.stressedSyllableIdx);
  const tailJoinedNorm = stripSpanishDiacritics(tailSyllables.join(''));
  const stressedVowel = extractSyllableNucleusVowel(stressedSyl) || sylInfo.stressedVowel.toLowerCase();

  // Consonant key: from the stressed nucleus vowel inside the stressed syllable to the end of the word
  const stressedSylNorm = stripSpanishDiacritics(stressedSyl);
  let startInStressed = stressedSylNorm.indexOf(stressedVowel);
  if (startInStressed < 0) startInStressed = Math.max(0, stressedSylNorm.search(/[aeiou]/));
  const restAfterStressedSyl = stripSpanishDiacritics(
    sylInfo.syllables.slice(sylInfo.stressedSyllableIdx + 1).join('')
  );
  const rawConsKey =
    (startInStressed >= 0 ? stressedSylNorm.slice(startInStressed) : stressedSylNorm) +
    restAfterStressedSyl;

  // Normalize classic Spanish phonetic consonant equivalences for rhyme matching (z/s, b/v, c/s in -ción? keep exact orthographic tail with gentle z<->s / v<->b optional, keeping pure clean tail first)
  const consonantKey = rawConsKey || tailJoinedNorm;

  // Assonant key: nuclear vowel of each syllable from stressed syllable to end
  const assonantVowels = tailSyllables
    .map((s) => extractSyllableNucleusVowel(s))
    .filter(Boolean);
  const assonantKey = assonantVowels.join('-') || stressedVowel || tailJoinedNorm;

  const openForHighSinging =
    stressedVowel === 'a' || stressedVowel === 'e' || stressedVowel === 'o';

  return {
    cleanWord: cleaned,
    normalizedWord: stripSpanishDiacritics(cleaned),
    consonantKey,
    assonantKey,
    stressedVowel: stressedVowel.toUpperCase(),
    openForHighSinging,
  };
}

export interface SpanishRhymeSearchResult {
  target: SpanishRhymeKeys;
  consonantMatches: string[];
  assonantMatches: string[];
}

export function findSpanishRhymes(
  targetWord: string,
  extraWords: readonly string[] = []
): SpanishRhymeSearchResult {
  const target = extractSpanishPoeticRhymeKeys(targetWord);
  if (!target.cleanWord) {
    return { target, consonantMatches: [], assonantMatches: [] };
  }

  const seen = new Set<string>();
  const pool: string[] = [];
  for (const w of extraWords) {
    const clean = w.trim();
    if (!clean) continue;
    const norm = stripSpanishDiacritics(clean);
    if (!seen.has(norm)) {
      seen.add(norm);
      pool.push(clean);
    }
  }
  for (const entry of SPANISH_POETIC_WORD_BANK) {
    const norm = stripSpanishDiacritics(entry.word);
    if (!seen.has(norm)) {
      seen.add(norm);
      pool.push(entry.word);
    }
  }

  const consonantMatches: string[] = [];
  const assonantMatches: string[] = [];

  for (const candidate of pool) {
    const k = extractSpanishPoeticRhymeKeys(candidate);
    if (!k.cleanWord || k.normalizedWord === target.normalizedWord) continue;
    if (k.consonantKey && k.consonantKey === target.consonantKey) {
      consonantMatches.push(k.cleanWord);
    } else if (k.assonantKey && k.assonantKey === target.assonantKey) {
      assonantMatches.push(k.cleanWord);
    }
  }

  return {
    target,
    consonantMatches,
    assonantMatches,
  };
}

export interface NonLinearBlockSpec {
  step: number;
  name: string;
  barsLabel: string;
  creativePrompt: string;
  exampleLine: string;
}

export interface NonLinearPoeticStructure {
  id:
    | 'flujo-conciencia'
    | 'narrativa-circular'
    | 'polifonia-voces'
    | 'montaje-cinematico'
    | 'espiral-inversa'
    | 'letania-expansiva';
  name: string;
  tagline: string;
  theoryNote: string;
  recommendedMeter: string;
  blocks: NonLinearBlockSpec[];
}

export const NONLINEAR_POETIC_STRUCTURES: NonLinearPoeticStructure[] = [
  {
    id: 'flujo-conciencia',
    name: 'Flujo de Conciencia (Stream of Consciousness)',
    tagline: 'Pensamiento asociativo continuo sin estribillo fijo ni puntuación rígida.',
    theoryNote:
      'Inspirada en Joyce, Cortázar y la canción de autor experimental: una imagen dispara un recuerdo, el recuerdo detona un sonido y una frase ancla reaparece cada 4–6 líneas como un latido.',
    recommendedMeter: 'Verso libre o polimetría (6–13 sílabas)',
    blocks: [
      {
        step: 1,
        name: 'Detonante Sensorial',
        barsLabel: '4 compases · Sin rima forzada',
        creativePrompt: 'Arranca en mitad de un pensamiento físico: un olor, ruido de calle o detalle mínimo.',
        exampleLine: 'El vapor de la taza borra la fecha del billete...',
      },
      {
        step: 2,
        name: 'Deriva Asociativa (Salto de Memoria)',
        barsLabel: '6–8 compases · Encabalgamiento',
        creativePrompt: 'Conecta el objeto con otra época sin decir "me acuerdo de"; encabalga dos frases seguidas.',
        exampleLine: 'y en esa mancha tibia vuelven los patios donde nadie cerraba las puertas',
      },
      {
        step: 3,
        name: 'Imagen Ancla (Estribillo Líquido)',
        barsLabel: '2 compases · Frase breve',
        creativePrompt: 'Inserta una frase corta de 3–5 palabras que corte la deriva y vuelva al presente.',
        exampleLine: 'Todo sigue girando afuera.',
      },
      {
        step: 4,
        name: 'Aceleración y Disolución',
        barsLabel: '8 compases · Sinestesia / Pregunta abierta',
        creativePrompt: 'Acumula verbos rápidos o imágenes simultáneas y termina dejando una puerta entreabierta.',
        exampleLine: 'El semáforo respira verde sobre tus zapatos vacíos y el reloj aún late...',
      },
    ],
  },
  {
    id: 'narrativa-circular',
    name: 'Narrativa Circular (Anillo / Ouroboros)',
    tagline: 'El último verso es idéntico al primero, pero cambia por completo de significado.',
    theoryNote:
      'En lugar de resolver en un coro triunfal, el poema da una vuelta de 360 grados: empiezas con una escena enigmática, recorres sus grietas y al repetirla al final el oyente comprende por fin la verdad oculta.',
    recommendedMeter: 'Octosílabo (8) o Endecasílabo (11) con rima asonante',
    blocks: [
      {
        step: 1,
        name: 'Umbral / Verso Espejo (Inicio)',
        barsLabel: '4 compases · Frase memorable',
        creativePrompt: 'Escribe 2 versos de apertura ambiguos (una escena concreta sin explicar el porqué).',
        exampleLine: 'Dejé las llaves sobre la mesa antes que despertara el mar.',
      },
      {
        step: 2,
        name: 'Órbita Exterior (Contexto y Tensiones)',
        barsLabel: '8 compases · Detalles físicos',
        creativePrompt: 'Recorre la habitación o el paisaje añadiendo 2 pistas sutiles sobre lo ocurrido.',
        exampleLine: 'Quedó tu abrigo doblado en la silla y un vaso quieto junto al cristal.',
      },
      {
        step: 3,
        name: 'Punto de Giro (El Núcleo Oculto)',
        barsLabel: '4–8 compases · Cambio armónico / Silencio',
        creativePrompt: 'Revela una sola verdad emotiva breve en segunda o primera persona.',
        exampleLine: 'No era huida: era devolverte el silencio que te robé.',
      },
      {
        step: 4,
        name: 'Retorno al Umbral (Verso Espejo Final)',
        barsLabel: '4 compases · Repetición exacta resignificada',
        creativePrompt: 'Repite literalmente los versos del paso 1: tras el giro, ahora suenan totalmente distintos.',
        exampleLine: 'Dejé las llaves sobre la mesa antes que despertara el mar.',
      },
    ],
  },
  {
    id: 'polifonia-voces',
    name: 'Polifonía de Voces (Perspectivas Alternas)',
    tagline: 'Dos o tres narradores / tiempos responden sobre la misma escena sin coro central.',
    theoryNote:
      'Ideal para duetos, canciones narrativas y letras dramáticas: cada sección cambia de pronombre ("Yo" → "Tú" → "La Ciudad / El Objeto") mostrando las aristas del mismo instante.',
    recommendedMeter: 'Arte menor (7–8 sílabas) o contraste 11 + 5',
    blocks: [
      {
        step: 1,
        name: 'Voz A · Primera Persona (Urgencia)',
        barsLabel: '4–6 compases',
        creativePrompt: 'Habla desde el "Yo" usando verbos presentes e inmediatos.',
        exampleLine: 'Camino rápido para no oír tus pasos tras la esquina.',
      },
      {
        step: 2,
        name: 'Voz B · Segunda Persona (Réplica)',
        barsLabel: '4–6 compases',
        creativePrompt: 'Responde desde el "Tú" contradiciendo o matizando la escena anterior.',
        exampleLine: 'No me oías porque el viento llevaba otro nombre en tu boca.',
      },
      {
        step: 3,
        name: 'Voz C · El Testigo Mudo (Objeto o Espacio)',
        barsLabel: '4 compases · Tercera persona imparcial',
        creativePrompt: 'Describe qué observan las cosas inanimadas (el banco, el farol, la lluvia) sin juzgar.',
        exampleLine: 'La lluvia borra dos huellas distintas sobre la misma acera.',
      },
      {
        step: 4,
        name: 'Cruce Final (Nosotros / Silencio)',
        barsLabel: '4 compases',
        creativePrompt: 'Funde las voces en una sola imagen breve compartida.',
        exampleLine: 'Y abajo, el puente guarda las dos mitades de la misma canción.',
      },
    ],
  },
  {
    id: 'montaje-cinematico',
    name: 'Montaje Cinemático / Collage de Viñetas',
    tagline: 'Escenas breves aparentemente inconexas unidas por un hilo sensorial oculto.',
    theoryNote:
      'Basado en el efecto Kuleshov del cine: al yuxtaponer 3 o 4 postales de tiempos y lugares distintos que comparten un color, sonido o materia, el cerebro del oyente inventa la historia emocional entre los cortes.',
    recommendedMeter: 'Estrofas de 3 versos (Tercetos) o Verso Libre visual',
    blocks: [
      {
        step: 1,
        name: 'Viñeta 1 · Plano Detalle (Interior)',
        barsLabel: '4 compases · Luz / Color',
        creativePrompt: 'Describe un micro-momento doméstico con un color o textura protagonista.',
        exampleLine: 'Un hilo de polvo dorado cruza la persiana de las cuatro.',
      },
      {
        step: 2,
        name: 'Viñeta 2 · Corte Brusco (Exterior / Infancia)',
        barsLabel: '4 compases · Mismo motivo sensorial',
        creativePrompt: 'Salta a otro lugar u otra edad donde aparezca ese mismo color, sonido o luz.',
        exampleLine: 'En el andén de agosto un tren deja chispas del mismo oro breve.',
      },
      {
        step: 3,
        name: 'Viñeta 3 · Plano Nocturno (Presente)',
        barsLabel: '4 compases · Transformación del motivo',
        creativePrompt: 'Muestra el mismo elemento transformado en sombra, eco o calma.',
        exampleLine: 'Ahora solo brilla la sal seca en el borde de tu cuaderno.',
      },
      {
        step: 4,
        name: 'Sutura Final (Un Solo Verso Blanco)',
        barsLabel: '2–4 compases',
        creativePrompt: 'Cierra con una línea serena que revele qué une a las tres postales.',
        exampleLine: 'Todo lo que amamos dura lo que tarda una tarde en doblarse.',
      },
    ],
  },
  {
    id: 'espiral-inversa',
    name: 'Espiral Inversa (Del Desenlace al Origen)',
    tagline: 'Comienza en las consecuencias del final y retrocede en el tiempo hacia la chispa inicial.',
    theoryNote:
      'Al revelar el desenlace en el primer verso, eliminas el suspense barato ("¿qué pasará?") y conviertes toda la canción en una búsqueda poética profunda ("¿cómo llegamos a sentir esto?").',
    recommendedMeter: 'Endecasílabo (11) o Alejandrino (14)',
    blocks: [
      {
        step: 1,
        name: 'Las Ruinas o la Calma Final (T = 0)',
        barsLabel: '4 compases',
        creativePrompt: 'Muestra el resultado ya consumado (la maleta hecha, la ceniza fría, el silencio después).',
        exampleLine: 'Ya no queda humo ni rastro de voces en este cuarto.',
      },
      {
        step: 2,
        name: 'Un Paso Atrás (La Víspera)',
        barsLabel: '6–8 compases',
        creativePrompt: 'Retrocede horas o meses: muestra la duda o la palabra que aún pudo cambiarlo todo.',
        exampleLine: 'Anoche todavía buscabas el acorde exacto bajo la lluvia.',
      },
      {
        step: 3,
        name: 'El Origen Luminoso (El Primer Día)',
        barsLabel: '6–8 compases',
        creativePrompt: 'Llega al principio inocente: describe el primer gesto con máxima ternura o claridad.',
        exampleLine: 'Pero antes de todo fue solo una risa compartida frente al mar.',
      },
    ],
  },
  {
    id: 'letania-expansiva',
    name: 'Letanía / Mantra en Expansión',
    tagline: 'Una célula verbal se repite y va ganando capas léxicas y tensión rítmica.',
    theoryNote:
      'Potente para post-rock, folclore hipnótico, rap poético o indie: usa la anáfora ("Sin X / Con Y / Hasta que Z") expandiendo cada ciclo de 4 a 8 a 12 sílabas hasta romper en quietud.',
    recommendedMeter: 'Crecimiento progresivo (5 → 8 → 11 → 5 sílabas)',
    blocks: [
      {
        step: 1,
        name: 'Semilla (Anáfora Mínima)',
        barsLabel: '4 compases · 5 sílabas/línea',
        creativePrompt: 'Elige una preposición o verbo inicial fijo y repite 2 líneas cortas.',
        exampleLine: 'Guardo tu nombre / guardo la brisa.',
      },
      {
        step: 2,
        name: 'Expansión Media (Adición de Lugar)',
        barsLabel: '4–6 compases · 8 sílabas/línea',
        creativePrompt: 'Conserva el inicio exacto pero alarga la línea añadiendo un lugar o tiempo.',
        exampleLine: 'Guardo tu nombre en el cristal / guardo la brisa del portal.',
      },
      {
        step: 3,
        name: 'Desborde (Clímax Acumulativo)',
        barsLabel: '8 compases · 11+ sílabas',
        creativePrompt: 'Lleva el mantra a su máxima intensidad combinando imágenes rápidas sin pausa.',
        exampleLine: 'Guardo tu nombre donde la ciudad apaga su miedo y vuelve a latir.',
      },
      {
        step: 4,
        name: 'Desnudez Final',
        barsLabel: '2–4 compases · Reducción súbita',
        creativePrompt: 'Reduce todo de golpe a un verso de 3–5 palabras sin acompañamiento denso.',
        exampleLine: 'Solo queda el eco.',
      },
    ],
  },
];

export interface GeneratedNonLinearPlan {
  structure: NonLinearPoeticStructure;
  tempoFeel: string;
  skeletonText: string;
}

export function generateNonLinearStructure(
  structureId?: string,
  seed = 0,
  tempoFeel: '4/4 Balada' | '3/4 Vals' | '6/8 Folclore' | 'Verso Libre' = 'Verso Libre'
): GeneratedNonLinearPlan {
  const pool = NONLINEAR_POETIC_STRUCTURES;
  const chosen =
    (structureId ? pool.find((s) => s.id === structureId) : undefined) ||
    pool[Math.abs(seed) % pool.length];

  const skeletonText = chosen.blocks
    .map(
      (b) =>
        `[${b.step}. ${b.name} — ${b.creativePrompt}]\n`
    )
    .join('\n');

  return {
    structure: chosen,
    tempoFeel,
    skeletonText: skeletonText.trim(),
  };
}

export type CreativeWritingLevelId = 'principiante' | 'intermedio' | 'avanzado';

export interface CreativeWritingTipCard {
  title: string;
  principle: string;
  beforeExample: string;
  afterExample: string;
  musicTip: string;
}

export interface CreativeWritingLevelGuide {
  id: CreativeWritingLevelId;
  label: string;
  subtitle: string;
  cards: CreativeWritingTipCard[];
}

export const CREATIVE_WRITING_ADVICE_BY_LEVEL: CreativeWritingLevelGuide[] = [
  {
    id: 'principiante',
    label: 'Nivel 1 · Principiante (Desbloqueo y Verdad)',
    subtitle:
      'Pasa de frases genéricas y rimas forzadas a escenas físicas que cualquier oyente pueda ver y sentir.',
    cards: [
      {
        title: '1. Sustituye emociones abstractas por objetos tocables ("Muestra, no expliques")',
        principle:
          'Palabras como "tristeza", "amor", "dolor" o "soledad" son etiquetas vacías si no hay una escena concreta detrás.',
        beforeExample: 'Siento una gran tristeza desde que te fuiste de mi vida.',
        afterExample: 'Quedaron dos tazas frías y tu chaqueta colgada en la silla.',
        musicTip: 'Las palabras concretas de 1–2 sílabas (mar, luz, sal, voz) encajan mejor en notas largas.',
      },
      {
        title: '2. Evita el "Relleno por Rima" (el yugo del consonante fácil)',
        principle:
          'Nunca tuerzas el sentido de una frase solo para hacer rimar "corazón / pasión / ilusión". Si la rima consonante suena forzada, usa rima asonante o verso blanco.',
        beforeExample: 'Eres mi única ilusión / dentro de este corazón.',
        afterExample: 'Tu nombre cabe en un suspiro / aunque la calle siga en ruido.',
        musicTip: 'En música, la melodía ya aporta estructura; la rima asonante suena moderna y natural.',
      },
      {
        title: '3. Regla de los 5 Minutos Sin Borrar (Separar Creatividad de Edición)',
        principle:
          'Escribir y juzgar al mismo tiempo bloquea la página. Escribe primero todo el borrador crudo con tus palabras elegidas y edita la métrica después.',
        beforeExample: 'Quedarse 20 minutos mirando la primera línea buscando la palabra perfecta.',
        afterExample: 'Escribir 12 líneas libres seguidas y subrayar solo las 4 imágenes más vivas.',
        musicTip: 'Tararea un pulso de 4/4 mientras lees tu borrador en voz alta para detectar trabas.',
      },
    ],
  },
  {
    id: 'intermedio',
    label: 'Nivel 2 · Intermedio (Arquitectura, Ritmo y Voz)',
    subtitle:
      'Controla el tamaño de los versos, el encabalgamiento y la tensión cinemática entre estrofas.',
    cards: [
      {
        title: '1. Alterna Plano General y Plano Detalle (Zoom Narrativo)',
        principle:
          'Si toda la canción describe paisajes enormes ("el universo, el océano") cansa; alterna una toma amplia con un detalle microscópico.',
        beforeExample: 'El cielo inmenso cubre el mundo entero bajo la noche eterna.',
        afterExample: 'Cruza la lluvia toda la ciudad / mientras tiembla una gota en tu reloj.',
        musicTip: 'Plano detalle en estrofa íntima (guitarra/piano suave); plano abierto en clímax.',
      },
      {
        title: '2. Usa el Encabalgamiento para Romper el Compás Cuadrado',
        principle:
          'No cierres siempre la idea al final de cada línea. Deja que una frase continúe en el verso siguiente para crear elegancia y movimiento.',
        beforeExample: 'Te busqué en el andén. / Ya no estaba el tren.',
        afterExample: 'Guardé en el borde del andén / las palabras que el último tren se llevó.',
        musicTip: 'Permite empezar la siguiente línea en anacrusa fluida en lugar de cortar siempre en silencio.',
      },
      {
        title: '3. Cuida la Sonoridad de las Vocales y Consonantes (Instrumentación Verbal)',
        principle:
          'Las consonantes líquidas y nasales (l, m, n, s) calman; las oclusivas y vibrantes (t, k, p, r) golpean como percusión.',
        beforeExample: 'Camino despacio en la noche tranquila sin ruido.',
        afterExample: 'Lenta la bruma lame el cristal (calma) vs. Rompe el pulso contra el portón (garra).',
        musicTip: 'En notas agudas sostenidas (> G4) prioriza vocales abiertas A, E, O en la sílaba tónica.',
      },
    ],
  },
  {
    id: 'avanzado',
    label: 'Nivel 3 · Avanzado (Subtexto, Extrañamiento y Contradicción)',
    subtitle:
      'Domina el arte de decir más omitiendo lo obvio, crear giros insólitos y contrastar texto con armonía.',
    cards: [
      {
        title: '1. El Extrañamiento Poético (Ostranenie)',
        principle:
          'Desautomatiza la mirada: describe un objeto cotidiano o un sentimiento gastado desde una metáfora física inesperada, sin nombrarlo directamente.',
        beforeExample: 'Tengo miedo de olvidarte con el paso de los años.',
        afterExample: 'El calendario empieza a borrar con tiza blanca la tinta de tu voz.',
        musicTip: 'Ideal para estructuras no lineales como Flujo de Conciencia o Montaje Cinemático.',
      },
      {
        title: '2. Contradicción Tonal (Fricción Emocional Texto ↔ Música)',
        principle:
          'Letra triste con música triste es predecible. Prueba letra luminosa sobre armonía menor dórica, o confesión cruda sobre un groove alegre.',
        beforeExample: 'Letra de ruptura sobre progresión lenta menor tradicional.',
        afterExample: 'Celebrar con ironía una despedida sobre un ritmo bailable luminoso en modo Lidio.',
        musicTip: 'La fricción entre letra y acorde multiplica la profundidad dramática sin melodrama.',
      },
      {
        title: '3. Economía Extrema y Omisión (La Técnica del Iceberg)',
        principle:
          'Elimina el 30% de adjetivos explicativos. Si el lector entiende la herida por lo que los personajes hacen con sus manos, jamás expliques lo que sienten.',
        beforeExample: 'Estaba tan nervioso y arrepentido que no me atrevía a hablarte.',
        afterExample: 'Doblé cuatro veces el mismo papel hasta partirlo por la mitad.',
        musicTip: 'Dejar compases respirar sin texto permite que un solo acorde o silencio "diga" la frase omitida.',
      },
    ],
  },
];

export function pickRandomWritingPromptWords(
  count: number,
  seed = Date.now(),
  categoryFilter: PoeticWordCategory | 'Todas' = 'Todas'
): string[] {
  const safeCount = Math.max(2, Math.min(5, Math.round(count) || 3));
  const candidates =
    categoryFilter === 'Todas'
      ? SPANISH_POETIC_WORD_BANK
      : SPANISH_POETIC_WORD_BANK.filter((e) => e.category === categoryFilter);

  if (candidates.length <= safeCount) {
    return candidates.map((c) => c.word);
  }

  // Deterministic LCG PRNG from seed so tests and UI both behave predictably & evenly
  let state = (Math.abs(Math.floor(seed)) % 2147483646) + 1;
  const nextRand = (): number => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };

  if (categoryFilter === 'Todas') {
    // Prefer cross-category evocative combinations first!
    const cats: PoeticWordCategory[] = [
      'Naturaleza y Cosmos',
      'Objetos y Lugares',
      'Emoción y Sonido',
      'Tiempo y Movimiento',
    ];
    const picked: string[] = [];
    const used = new Set<string>();
    for (let i = 0; i < safeCount; i++) {
      const cat = cats[(i + Math.floor(nextRand() * cats.length)) % cats.length];
      const catPool = SPANISH_POETIC_WORD_BANK.filter(
        (e) => e.category === cat && !used.has(e.word)
      );
      if (catPool.length > 0) {
        const pick = catPool[Math.floor(nextRand() * catPool.length)].word;
        picked.push(pick);
        used.add(pick);
      }
    }
    while (picked.length < safeCount) {
      const pick = candidates[Math.floor(nextRand() * candidates.length)].word;
      if (!used.has(pick)) {
        used.add(pick);
        picked.push(pick);
      }
    }
    return picked;
  }

  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    const tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }
  return shuffled.slice(0, safeCount).map((c) => c.word);
}

export interface WritingDraftWordStatus {
  word: string;
  used: boolean;
}

export interface WritingDraftLineTelemetry {
  lineNumber: number;
  text: string;
  metricSyllables: number;
  meterName: string;
  rhymeAssonant: string;
  rhymeConsonant: string;
  sinalefas: number;
}

export interface WritingDraftEvaluation {
  wordStatuses: WritingDraftWordStatus[];
  usedCount: number;
  totalTargetWords: number;
  allWordsUsed: boolean;
  totalLines: number;
  totalWordsWritten: number;
  lines: WritingDraftLineTelemetry[];
}

export function evaluateWritingDraftWithWords(
  draft: string,
  targetWords: readonly string[]
): WritingDraftEvaluation {
  const nonEmptyLines = draft
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('['));

  const userBodyText = nonEmptyLines.join(' ');
  const normalizedDraftTokens = stripSpanishDiacritics(userBodyText)
    .split(/[^a-zñ]+/)
    .filter(Boolean);

  const wordStatuses: WritingDraftWordStatus[] = targetWords.map((w) => {
    const targetNorm = stripSpanishDiacritics(w.trim());
    if (!targetNorm) return { word: w, used: false };
    // Match exact word or Spanish plural/simple inflection starting cleanly on word boundary
    const used = normalizedDraftTokens.some(
      (tok) =>
        tok === targetNorm ||
        tok === `${targetNorm}s` ||
        tok === `${targetNorm}es` ||
        (targetNorm.length >= 4 &&
          (targetNorm.endsWith('a') || targetNorm.endsWith('o') || targetNorm.endsWith('e')) &&
          tok.startsWith(targetNorm.slice(0, -1)) &&
          tok.length <= targetNorm.length + 3)
    );
    return { word: w, used };
  });

  const usedCount = wordStatuses.filter((s) => s.used).length;

  const lines: WritingDraftLineTelemetry[] = nonEmptyLines.map((line, idx) => {
    const scansion = analyzePoeticProsodyDetailed(line);
    const lastWord = line
      .split(/\s+/)
      .map((t) => t.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]/g, ''))
      .filter(Boolean)
      .pop() || '';
    const rhyme = extractSpanishPoeticRhymeKeys(lastWord);
    return {
      lineNumber: idx + 1,
      text: line,
      metricSyllables: scansion.metricSyllables,
      meterName: scansion.meterName,
      rhymeAssonant: rhyme.assonantKey || '—',
      rhymeConsonant: rhyme.consonantKey || '—',
      sinalefas: scansion.sinalefas,
    };
  });

  return {
    wordStatuses,
    usedCount,
    totalTargetWords: targetWords.length,
    allWordsUsed: targetWords.length > 0 && usedCount === targetWords.length,
    totalLines: nonEmptyLines.length,
    totalWordsWritten: normalizedDraftTokens.length,
    lines,
  };
}

export interface IntervalFretboardPos {
  sIdx: number; // high-to-low index matching GUITAR_STRINGS (0=e..5=E) or BASS_STRINGS (0=G..3=E)
  lowStrIdx: number; // low-to-high index (0=E..5=e or 0=E..3=G)
  fret: number;
  midi: number;
  stringLabel: string;
}

export interface IntervalFretboardShape {
  mode: 'guitar' | 'bass';
  rootPos: IntervalFretboardPos;
  targetPos: IntervalFretboardPos;
  frets: number[]; // low-to-high (-1 = muted)
  baseFret: number;
  rootMidi: number;
  targetMidi: number;
  tabText: string;
  sameString: boolean;
}

/**
 * Finds a playable exact-octave 2-note interval shape on Guitar (6c) or Bass (4c)
 * guaranteeing `targetMidi - rootMidi === semi` (so 9ths/11ths/13ths never collapse to 2nds/4ths/6ths).
 */
export function computeIntervalFretboardShape(
  rootPc: number,
  semi: number,
  mode: 'guitar' | 'bass'
): IntervalFretboardShape {
  const normRoot = ((rootPc % 12) + 12) % 12;
  const openLow = mode === 'bass' ? [28, 33, 38, 43] : [40, 45, 50, 55, 59, 64];
  const labelsLow = mode === 'bass' ? ['4ª E', '3ª A', '2ª D', '1ª G'] : ['6ª E', '5ª A', '4ª D', '3ª G', '2ª B', '1ª e'];
  const nStr = openLow.length;

  let bestScore = Number.POSITIVE_INFINITY;
  let bestPair: { rLow: number; rFret: number; rMidi: number; tLow: number; tFret: number; tMidi: number } | null = null;

  for (let rLow = 0; rLow < nStr; rLow++) {
    for (let rFret = 0; rFret <= 12; rFret++) {
      const rMidi = openLow[rLow] + rFret;
      if (rMidi % 12 !== normRoot) continue;
      const tMidi = rMidi + semi;

      for (let tLow = rLow; tLow < nStr; tLow++) {
        const tFret = tMidi - openLow[tLow];
        if (tFret < 0 || tFret > 15) continue;
        if (tLow === rLow && tFret === rFret) continue;

        const sameString = tLow === rLow;
        const fretted = [rFret, tFret].filter((f) => f > 0);
        const span = fretted.length === 2 ? Math.abs(fretted[1] - fretted[0]) : 0;
        const maxFret = Math.max(rFret, tFret);
        const minFret = Math.min(rFret, tFret);

        // Score: prefer 2 distinct strings with playable <=4-fret span inside frets 0..12
        let score = 0;
        if (sameString) {
          score += semi <= 2 ? 12 : 85;
        }
        if (span > 4) score += (span - 4) * 45;
        else score += span * 2.5;
        if (maxFret > 12) score += (maxFret - 12) * 35;
        score += minFret * 1.6 + maxFret * 0.9;
        // Prefer lower/middle root strings for comfortable anchor
        score += rLow * 2.2;
        // Slight penalty for wide open+high fret combos
        if ((rFret === 0 && tFret > 5) || (tFret === 0 && rFret > 5)) {
          score += 28;
        }

        if (score < bestScore) {
          bestScore = score;
          bestPair = { rLow, rFret, rMidi, tLow, tFret, tMidi };
        }
      }
    }
  }

  // Guaranteed fallback if extreme semi on 4-string bass exceeds fret 15
  if (!bestPair) {
    const rFret = (normRoot - (openLow[0] % 12) + 12) % 12;
    const rMidi = openLow[0] + rFret;
    const tLow = nStr - 1;
    const tMidi = rMidi + semi;
    const tFret = Math.max(0, tMidi - openLow[tLow]);
    bestPair = { rLow: 0, rFret, rMidi, tLow, tFret, tMidi };
  }

  const frets = Array.from({ length: nStr }, () => -1);
  frets[bestPair.rLow] = bestPair.rFret;
  frets[bestPair.tLow] = bestPair.tFret;

  const nonZero = [bestPair.rFret, bestPair.tFret].filter((f) => f > 0);
  const maxNz = nonZero.length ? Math.max(...nonZero) : 0;
  const minNz = nonZero.length ? Math.min(...nonZero) : 1;
  const baseFret = maxNz <= 4 ? 1 : minNz;

  const tabTokens = frets.map((f) => (f < 0 ? 'X' : String(f)));
  const sameString = bestPair.rLow === bestPair.tLow;
  const tabText = sameString
    ? `${labelsLow[bestPair.rLow]}: tr.${bestPair.rFret} → tr.${bestPair.tFret}`
    : tabTokens.join('-');

  return {
    mode,
    rootPos: {
      sIdx: nStr - 1 - bestPair.rLow,
      lowStrIdx: bestPair.rLow,
      fret: bestPair.rFret,
      midi: bestPair.rMidi,
      stringLabel: labelsLow[bestPair.rLow],
    },
    targetPos: {
      sIdx: nStr - 1 - bestPair.tLow,
      lowStrIdx: bestPair.tLow,
      fret: bestPair.tFret,
      midi: bestPair.tMidi,
      stringLabel: labelsLow[bestPair.tLow],
    },
    frets,
    baseFret,
    rootMidi: bestPair.rMidi,
    targetMidi: bestPair.tMidi,
    tabText,
    sameString,
  };
}







