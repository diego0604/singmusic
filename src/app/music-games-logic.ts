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
          } else if (isBassNeck || s === 0) {
            perStringOptions.push([...valid, null]);
          } else {
            perStringOptions.push(valid);
          }
        }

        // Enumerate combinations (<= ~32 per bass string)
        const combos: { sIdx: number; fret: number; midi: number }[][] = [[]];
        for (let idx = 0; idx < perStringOptions.length; idx++) {
          const sIdx = bassSIdx - 1 - idx;
          const opts = perStringOptions[idx];
          const nextCombos: { sIdx: number; fret: number; midi: number }[][] = [];
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
          combos.splice(0, combos.length, ...nextCombos.slice(0, 96));
        }

        for (const upper of combos) {
          const voicing: ChordFretPos[] = [
            { sIdx: bassSIdx, fret: bassFret, midi: bassMidi },
            ...upper,
          ];
          if (isBassNeck && voicing.length > 3) continue;

          const coveredPcs = new Set(voicing.map((v) => v.midi % 12));
          const nonZeroFrets = voicing.filter((v) => v.fret > 0).map((v) => v.fret);
          const span =
            nonZeroFrets.length > 1
              ? Math.max(...nonZeroFrets) - Math.min(...nonZeroFrets)
              : 0;
          if (span > 4) continue;

          let score = coveredPcs.size * 1000;
          // Prefer full-sounding shapes (more strings covered cleanly)
          score += voicing.length * 18;
          // Prefer lower/open position over high neck
          const avgFret =
            voicing.reduce((sum, v) => sum + v.fret, 0) / Math.max(1, voicing.length);
          score -= avgFret * 9;
          score -= span * 12;
          if (win.allowOpen) {
            score += 24;
            score += voicing.filter((v) => v.fret === 0).length * 8;
          }
          // Prefer root on deeper string when available in open/low position
          score += bassSIdx * 4;

          // Avoid muddy low 3rds in bottom register (e.g. F2-A2 <= 45), while allowing standard G2-B2 (47)
          for (let i = 1; i < voicing.length; i++) {
            const diff = voicing[i].midi - voicing[i - 1].midi;
            if (diff <= 0) score -= 45;
            if (voicing[i].midi <= 45 && diff < 5) {
              score -= 90;
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
 * - Chords group notes matching `chordGroup`, replace prior notes or older chords, and stay latched until next event or Stop (null).
 */
export function reduceLatchGlowState<T extends LatchedGlowEntry>(
  state: LatchedGlowState<T>,
  ev: T | null
): LatchedGlowState<T> {
  if (!ev) {
    return { kind: 'idle', entries: [] };
  }

  const normalized = { ...ev, midi: Math.round(ev.midi) };

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
  scalePitchClasses: number[];
  charPitchClasses: number[];
  tabSummary: string;
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

  const chordPcs = chord.intervals.map((i) => (rootPc + i) % 12);
  const rawScalePcs =
    scaleGuide.intervals.length > 0
      ? scaleGuide.intervals.map((i) => (rootPc + i) % 12)
      : chordPcs;
  const scalePitchClasses = [...new Set([...rawScalePcs, ...chordPcs])];
  const charPitchClasses = scaleGuide.charOffsets.map((i) => (rootPc + i) % 12);

  const numStrings = params.openMidisHighToLow.length;
  const fretsLowToHigh: string[] = [];
  for (let sIdx = numStrings - 1; sIdx >= 0; sIdx--) {
    const match = chordPositions.find((p) => p.sIdx === sIdx);
    fretsLowToHigh.push(match ? String(match.fret) : 'x');
  }

  return {
    rootPc,
    chord,
    scaleGuide,
    chordTitle: `${LOGIC_NOTE_NAMES[rootPc]}${chord.symbol}`,
    chordNoteNames: chord.intervals.map((i) => LOGIC_NOTE_NAMES[(rootPc + i) % 12]),
    chordMidis,
    chordPositions,
    scalePitchClasses,
    charPitchClasses,
    tabSummary: fretsLowToHigh.join(' - '),
  };
}



