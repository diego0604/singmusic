import { ACADEMY_STAGES, type AcademyStage } from './academy-curriculum';

export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;

export interface AcademyAudioPrompt {
  label: string;
  kind: 'notes' | 'chord' | 'interval' | 'progression';
  midis: number[];
  chordGroups?: number[][];
}

export interface AcademyQuizQuestion {
  id: string;
  sectionId: string;
  topicTag: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  audioPrompt?: AcademyAudioPrompt;
}

export interface LessonMicroChallenge {
  sectionId: string;
  exerciseGoal: string;
  instrumentApplication: string;
  checkStep: string;
}

export interface LessonFrameworkPhase {
  num: number;
  name: string;
  available: boolean;
  anchorId: string;
}

export interface LessonReviewRecord {
  sectionId: string;
  intervalIndex: number;
  intervalDays: number;
  lastReviewedAt: number;
  nextReviewAt: number;
  streak: number;
  lastScorePct: number;
}

export interface DueReviewItem {
  sectionId: string;
  catId: string;
  title: string;
  stageTitle: string;
  status: 'untested' | 'due' | 'upcoming';
  daysUntilDue: number;
  intervalDays: number;
  lastScorePct: number | null;
}

export type DeliverableMasteryRating = 0 | 1 | 2 | 3; // 0: pendiente, 1: en práctica, 2: logrado, 3: con fluidez

export interface StageRubricEntry {
  checked: boolean[];
  ratings: DeliverableMasteryRating[];
  note: string;
}

export type GraduationRubricState = Record<string, StageRubricEntry>;

export interface StageGraduationSummary {
  stageId: string;
  checkedCount: number;
  totalCount: number;
  pct: number;
  isGraduated: boolean;
  averageRatingLabel: string;
}

// ============================================================================
// 1. 10-ELEMENT LESSON ARCHITECTURE MAPPER
// ============================================================================

export function detectLessonFrameworkPhases(sectionHtml: string): LessonFrameworkPhase[] {
  const lower = (sectionHtml || '').toLowerCase();
  const findFirstId = (regex: RegExp, fallback = ''): string => {
    const match = regex.exec(sectionHtml);
    return match?.[1] || fallback;
  };

  const firstH3Id = findFirstId(/<h3[^>]*\bid="([^"]+)"/i, '');
  const labId = findFirstId(/<article[^>]*\bid="([^"]+)"[^>]*data-lab="/i, '');
  const calloutExId = findFirstId(/<div[^>]*\bid="([^"]+)"[^>]*class="[^"]*exercise/i, '');

  const hasVisual =
    /<svg\b/i.test(lower) ||
    lower.includes('data-lab=') ||
    lower.includes('piano') ||
    lower.includes('mástil') ||
    lower.includes('pentagrama');

  const hasAudio =
    lower.includes('btn-audio') ||
    lower.includes('js-treatise-chord') ||
    lower.includes('data-run=') ||
    lower.includes('data-play-note=');

  return [
    { num: 1, name: 'Fundamento', available: true, anchorId: firstH3Id },
    { num: 2, name: 'Teoría', available: /<h3|<table|<ul|<ol/i.test(lower), anchorId: firstH3Id },
    { num: 3, name: 'Visualización', available: hasVisual, anchorId: labId || firstH3Id },
    { num: 4, name: 'Escucha', available: hasAudio, anchorId: firstH3Id },
    { num: 5, name: 'Laboratorio', available: Boolean(labId), anchorId: labId },
    { num: 6, name: 'Ejercicios', available: true, anchorId: calloutExId || 'academy-lesson-practice' },
    { num: 7, name: 'Aplicación', available: true, anchorId: 'academy-lesson-practice' },
    { num: 8, name: 'Evaluación', available: true, anchorId: 'academy-lesson-evaluation' },
    { num: 9, name: 'Proyecto', available: true, anchorId: 'academy-lesson-practice' },
    { num: 10, name: 'Repaso', available: true, anchorId: 'academy-lesson-evaluation' },
  ];
}

// ============================================================================
// 2. SPACED REPETITION ENGINE (ACTIVE RECALL)
// ============================================================================

export function scheduleNextReview(
  prev: LessonReviewRecord | undefined,
  scorePct: number,
  nowMs: number
): LessonReviewRecord {
  const clamped = Math.max(0, Math.min(100, Math.round(scorePct)));
  const prevIdx = prev ? Math.max(0, Math.min(REVIEW_INTERVAL_DAYS.length - 1, prev.intervalIndex)) : -1;

  let nextIdx: number;
  let nextStreak: number;

  if (clamped >= 75) {
    nextIdx = prev ? Math.min(REVIEW_INTERVAL_DAYS.length - 1, prevIdx + 1) : 1; // Jump straight to 3d on strong initial mastery
    nextStreak = (prev?.streak ?? 0) + 1;
  } else if (clamped >= 50) {
    nextIdx = Math.max(0, prevIdx >= 0 ? prevIdx : 0);
    nextStreak = prev?.streak ?? 0;
  } else {
    nextIdx = 0;
    nextStreak = 0;
  }

  const intervalDays = REVIEW_INTERVAL_DAYS[nextIdx];
  const dayMs = 86_400_000;

  return {
    sectionId: prev?.sectionId || '',
    intervalIndex: nextIdx,
    intervalDays,
    lastReviewedAt: nowMs,
    nextReviewAt: nowMs + intervalDays * dayMs,
    streak: nextStreak,
    lastScorePct: clamped,
  };
}

export function formatReviewStatusLabel(record: LessonReviewRecord | undefined, nowMs: number): string {
  if (!record) return 'Pendiente de evaluación inicial';
  const diffMs = record.nextReviewAt - nowMs;
  if (diffMs <= 0) return 'Repaso recomendado hoy';
  const days = Math.max(1, Math.ceil(diffMs / 86_400_000));
  return days === 1
    ? `Próximo repaso en 1 día (racha ${record.streak})`
    : `Próximo repaso en ${days} días (racha ${record.streak})`;
}

export function getDueReviews(
  records: Record<string, LessonReviewRecord>,
  completedIds: string[],
  nowMs: number
): DueReviewItem[] {
  const completedSet = new Set(completedIds);
  const items: DueReviewItem[] = [];
  const seen = new Set<string>();

  for (const stage of ACADEMY_STAGES) {
    for (const lesson of stage.lessons) {
      if (seen.has(lesson.sectionId)) continue;
      seen.add(lesson.sectionId);
      const rec = records[lesson.sectionId];
      const isCompleted = completedSet.has(lesson.sectionId);

      if (!rec && !isCompleted) continue;

      if (!rec && isCompleted) {
        items.push({
          sectionId: lesson.sectionId,
          catId: lesson.catId,
          title: lesson.title,
          stageTitle: stage.title,
          status: 'untested',
          daysUntilDue: 0,
          intervalDays: 0,
          lastScorePct: null,
        });
        continue;
      }

      if (rec) {
        const diffDays = Math.ceil((rec.nextReviewAt - nowMs) / 86_400_000);
        items.push({
          sectionId: lesson.sectionId,
          catId: lesson.catId,
          title: lesson.title,
          stageTitle: stage.title,
          status: rec.nextReviewAt <= nowMs ? 'due' : 'upcoming',
          daysUntilDue: Math.max(0, diffDays),
          intervalDays: rec.intervalDays,
          lastScorePct: rec.lastScorePct,
        });
      }
    }
  }

  const priorityOrder: Record<DueReviewItem['status'], number> = { due: 0, untested: 1, upcoming: 2 };
  return items.sort((a, b) => {
    const pDiff = priorityOrder[a.status] - priorityOrder[b.status];
    if (pDiff !== 0) return pDiff;
    return a.daysUntilDue - b.daysUntilDue;
  });
}

// ============================================================================
// 3. INTERACTIVE GRADUATION RUBRICS FOR ALL 8 STAGES
// ============================================================================

export function normalizeStageRubricEntry(stage: AcademyStage, raw?: Partial<StageRubricEntry>): StageRubricEntry {
  const len = stage.graduationProject.deliverables.length;
  const checked = Array.from({ length: len }, (_, i) => Boolean(raw?.checked?.[i]));
  const ratings = Array.from({ length: len }, (_, i) => {
    const r = raw?.ratings?.[i];
    return r === 1 || r === 2 || r === 3 ? r : checked[i] ? 2 : 0;
  }) as DeliverableMasteryRating[];
  return {
    checked,
    ratings,
    note: typeof raw?.note === 'string' ? raw.note : '',
  };
}

export function getStageGraduationSummary(
  stage: AcademyStage,
  rubricState: GraduationRubricState
): StageGraduationSummary {
  const entry = normalizeStageRubricEntry(stage, rubricState[stage.id]);
  const totalCount = entry.checked.length;
  const checkedCount = entry.checked.filter(Boolean).length;
  const pct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
  const isGraduated = totalCount > 0 && checkedCount === totalCount;

  const rated = entry.ratings.filter((r) => r > 0);
  const avg = rated.length > 0 ? rated.reduce<number>((acc, v) => acc + v, 0) / rated.length : 0;
  const averageRatingLabel =
    avg >= 2.6 ? 'Con fluidez' : avg >= 1.7 ? 'Logrado' : avg >= 0.8 ? 'En práctica' : 'Sin iniciar';

  return {
    stageId: stage.id,
    checkedCount,
    totalCount,
    pct,
    isGraduated,
    averageRatingLabel,
  };
}

export function getTotalGraduationsCount(
  stages: AcademyStage[],
  rubricState: GraduationRubricState
): { graduated: number; total: number } {
  let graduated = 0;
  for (const st of stages) {
    if (getStageGraduationSummary(st, rubricState).isGraduated) {
      graduated++;
    }
  }
  return { graduated, total: stages.length };
}

// ============================================================================
// 4. CURATED ACTIVE RECALL QUESTION BANK + PRACTICAL MICRO-CHALLENGES
// ============================================================================

const QUIZ_BANK_BY_SECTION: Record<string, AcademyQuizQuestion[]> = {
  intro: [
    {
      id: 'q-intro-1',
      sectionId: 'intro',
      topicTag: 'Pulso vs. Ritmo',
      question: '¿Qué diferencia al pulso de un ritmo cuando escuchas una canción?',
      options: [
        'El pulso es el latido parejo que cuentas (1-2-3-4); el ritmo reparte golpes largos, cortos y silencios sobre él',
        'El pulso solo lo toca el bajo y el ritmo solo la voz',
        'El pulso cambia cada compás y el ritmo siempre es constante',
        'Son exactamente sinónimos en todas las canciones',
      ],
      correctIndex: 0,
      explanation:
        'El pulso es el reloj constante que marcas con el pie; el ritmo es la combinación de duraciones y silencios que baila encima de ese pulso.',
      audioPrompt: {
        label: 'Escuchar pulso base + ritmo',
        kind: 'notes',
        midis: [60, 60, 64, 60],
      },
    },
    {
      id: 'q-intro-2',
      sectionId: 'intro',
      topicTag: 'Octavas',
      question: 'Si subes exactamente 12 semitonos desde cualquier nota Do (C4 → C5), ¿qué ocurre?',
      options: [
        'Obtienes una nota disonante sin relación',
        'Llegas a una quinta justa (Sol)',
        'Llegas a la misma nota (Do) el doble de aguda: una octava arriba',
        'Cambias de compás 4/4 a 3/4',
      ],
      correctIndex: 2,
      explanation:
        'Cada 12 semitonos se duplica la frecuencia y el nombre de la nota se repite en una octava superior.',
      audioPrompt: {
        label: 'Escuchar C4 → C5 (octava)',
        kind: 'interval',
        midis: [60, 72],
      },
    },
  ],
  't-sonido': [
    {
      id: 'q-sonido-1',
      sectionId: 't-sonido',
      topicTag: 'Cualidades del sonido',
      question: 'Si una guitarra y una flauta tocan exactamente la misma nota (C4) al mismo volumen, ¿qué cualidad nos permite distinguirlas?',
      options: ['La duración', 'El timbre (huella de armónicos)', 'El tempo BPM', 'La armadura'],
      correctIndex: 1,
      explanation:
        'El timbre depende de la mezcla particular de armónicos y el ataque de cada instrumento aunque compartan altura e intensidad.',
    },
    {
      id: 'q-sonido-2',
      sectionId: 't-sonido',
      topicTag: 'Altura',
      question: '¿Qué describe la altura musical de una nota?',
      options: [
        'Qué tan fuerte o suave suena',
        'Cuántos pulsos dura en el compás',
        'Qué tan grave o aguda suena según su frecuencia de vibración',
        'Si lleva puntillo o ligadura',
      ],
      correctIndex: 2,
      explanation:
        'A mayor frecuencia de vibración percibimos un sonido más agudo; a menor frecuencia, más grave.',
      audioPrompt: {
        label: 'Comparar nota grave (C3) vs aguda (G4)',
        kind: 'interval',
        midis: [48, 67],
      },
    },
  ],
  't-notas': [
    {
      id: 'q-notas-1',
      sectionId: 't-notas',
      topicTag: 'Semitonos naturales',
      question: 'En la escala cromática de 12 notas, ¿qué dos pares de notas naturales están a solo 1 semitono sin tecla negra entre ellas?',
      options: ['Do–Re y Fa–Sol', 'Mi–Fa (E–F) y Si–Do (B–C)', 'Re–Mi y Sol–La', 'La–Si y Do–Re'],
      correctIndex: 1,
      explanation:
        'Entre E–F y B–C existe un semitono natural (1 traste en guitarra o 2 teclas blancas pegadas en piano).',
      audioPrompt: {
        label: 'Escuchar semitono E4 → F4',
        kind: 'interval',
        midis: [64, 65],
      },
    },
    {
      id: 'q-notas-2',
      sectionId: 't-notas',
      topicTag: 'Enarmonía',
      question: '¿Por qué F# y G♭ suenan idénticos en un piano o guitarra actual?',
      options: [
        'Porque F y G no tienen diferencia de altura',
        'Por enarmonía: subir F un semitono (#) cae en la misma tecla/traste que bajar G un semitono (♭)',
        'Porque siempre hay 2 semitonos entre ellos',
        'Solo ocurre en compases compuestos',
      ],
      correctIndex: 1,
      explanation:
        'La enarmonía ocurre cuando dos nombres distintos representan exactamente la misma altura temperada según el contexto de la escala.',
    },
  ],
  't-ritmo': [
    {
      id: 'q-ritmo-1',
      sectionId: 't-ritmo',
      topicTag: 'Puntillo',
      question: 'En compás de 4/4, ¿cuántos pulsos dura exactamente una negra con puntillo?',
      options: ['1 pulso', '1.5 pulsos (3 corcheas)', '2 pulsos exactos', '3 pulsos'],
      correctIndex: 1,
      explanation:
        'El puntillo siempre suma la mitad de la figura original: 1 pulso (negra) + 0.5 pulso (corchea) = 1.5 pulsos.',
    },
    {
      id: 'q-ritmo-2',
      sectionId: 't-ritmo',
      topicTag: 'Contratiempo vs Síncopa',
      question: '¿Qué define específicamente a una síncopa frente a un simple contratiempo?',
      options: [
        'Tocar todas las figuras en blanca',
        'Atacar en una parte débil y prolongar (ligar) la nota sobre el pulso fuerte siguiente',
        'Subir el tempo a más de 120 BPM',
        'Añadir siempre silencios de redonda',
      ],
      correctIndex: 1,
      explanation:
        'En el contratiempo tocas en el aire tras un silencio; en la síncopa además extiendes ese sonido cruzando el tiempo fuerte siguiente.',
    },
  ],
  't-escalas': [
    {
      id: 'q-escalas-1',
      sectionId: 't-escalas',
      topicTag: 'Escalera Mayor',
      question: '¿Por qué G Mayor necesita un F# (Fa sostenido) y no puede usar Fa natural?',
      options: [
        'Porque entre Mi (6º grado) y Fa natural solo hay 1 semitono, y la escalera mayor exige Tono en 6→7 y Semitono en 7→8',
        'Porque todas las escalas mayores llevan al menos dos sostenidos',
        'Para eliminar el 4º grado de la escala',
        'Porque G Mayor es una escala menor armónica',
      ],
      correctIndex: 0,
      explanation:
        'Al subir Fa a F#, creamos un Tono entre E–F# (6→7) y dejamos 1 semitono exacto entre F#–G (7→8, sensible que resuelve en tónica).',
      audioPrompt: {
        label: 'Escuchar E–F#–G (sensible resolviendo)',
        kind: 'notes',
        midis: [64, 66, 67],
      },
    },
    {
      id: 'q-escalas-2',
      sectionId: 't-escalas',
      topicTag: 'Pentatónica',
      question: '¿Qué dos grados de la escala mayor se quitan para obtener la Pentatónica Mayor (1–2–3–5–6)?',
      options: [
        'Los grados 1 y 5',
        'Los grados 4 y 7 (los que forman el tritono tenso)',
        'Los grados 2 y 6',
        'Los grados 3 y 8',
      ],
      correctIndex: 1,
      explanation:
        'Al omitir el 4º y 7º grado desaparecen los choques de semitono y el tritono, por eso la pentatónica fluye casi sin notas "peligrosas".',
      audioPrompt: {
        label: 'Escuchar Pentatónica Mayor de C',
        kind: 'notes',
        midis: [60, 62, 64, 67, 69, 72],
      },
    },
  ],
  't-intervalos': [
    {
      id: 'q-intervalos-1',
      sectionId: 't-intervalos',
      topicTag: 'Terceras',
      question: '¿Cuántos semitonos distinguen a una Tercera Mayor frente a una Tercera Menor?',
      options: [
        '2 semitonos (Mayor) vs 1 semitono (Menor)',
        '4 semitonos (Mayor) vs 3 semitonos (Menor)',
        '5 semitonos (Mayor) vs 4 semitonos (Menor)',
        '7 semitonos (Mayor) vs 6 semitonos (Menor)',
      ],
      correctIndex: 1,
      explanation:
        'La 3ª Mayor mide 4 semitonos (Do→Mi) y define acordes brillantes; la 3ª Menor mide 3 semitonos (Do→Mi♭) y da carácter melancólico.',
      audioPrompt: {
        label: 'Comparar 3ª Mayor (Do-Mi) vs 3ª Menor (Do-Mi♭)',
        kind: 'progression',
        midis: [],
        chordGroups: [[60, 64], [60, 63]],
      },
    },
    {
      id: 'q-intervalos-2',
      sectionId: 't-intervalos',
      topicTag: 'Inversión / Ley del 9',
      question: 'Según la Ley del 9, si inviertes una Tercera Mayor hacia abajo o hacia arriba, ¿en qué intervalo se convierte?',
      options: ['Sexta Menor', 'Quinta Justa', 'Sexta Mayor', 'Cuarta Justa'],
      correctIndex: 0,
      explanation:
        'En la inversión: 9 - 3 = 6 (Sexta), y la cualidad Mayor invierte a Menor (4 st + 8 st = 12 semitonos).',
    },
  ],
  't-tonalidades': [
    {
      id: 'q-tonal-1',
      sectionId: 't-tonalidades',
      topicTag: 'Lectura de Armaduras',
      question: 'Ves una partitura con 3 sostenidos en la armadura (F#, C#, G#). Aplicando la regla de 5 segundos, ¿cuál es su tonalidad mayor?',
      options: ['Sol Mayor', 'Re Mayor', 'La Mayor (medio tono arriba del último #: G#)', 'Mi Mayor'],
      correctIndex: 2,
      explanation:
        'Con sostenidos, el último # es la sensible (7º grado). Un semitono arriba de G# está A (La Mayor).',
    },
    {
      id: 'q-tonal-2',
      sectionId: 't-tonalidades',
      topicTag: 'Armaduras con bemoles',
      question: 'Si una armadura tiene 3 bemoles (B♭, E♭, A♭), ¿cómo identificas la tonalidad mayor al instante?',
      options: [
        'El penúltimo bemol (E♭) te da directamente la tonalidad: Mi♭ Mayor',
        'Subes medio tono al último bemol',
        'Siempre es Fa Mayor',
        'Cuentas los bemoles y restas 2',
      ],
      correctIndex: 0,
      explanation:
        'Con 2 o más bemoles, el penúltimo bemol es literalmente la tónica mayor (B♭, E♭, A♭ → E♭ Mayor).',
      audioPrompt: {
        label: 'Escuchar cadencia I–IV–V–I en E♭ Mayor',
        kind: 'progression',
        midis: [],
        chordGroups: [[63, 67, 70], [68, 72, 75], [70, 74, 77], [63, 67, 70]],
      },
    },
  ],
  't-lectura': [
    {
      id: 'q-lectura-1',
      sectionId: 't-lectura',
      topicTag: 'Claves y Barras',
      question: '¿Qué indica una clave (𝄞 de Sol o 𝄢 de Fa) al principio de un pentagrama?',
      options: [
        'La velocidad exacta en BPM',
        'Fija qué nota corresponde a una línea concreta del pentagrama para situar todo el registro',
        'Indica cuántas veces repetir el estribillo',
        'Solo sirve para guitarra eléctrica',
      ],
      correctIndex: 1,
      explanation:
        'Sin clave las 5 líneas no tienen nombre de altura; la Clave de Sol ancla Sol4 en la 2ª línea y la de Fa ancla Fa3 en la 4ª línea.',
    },
    {
      id: 'q-lectura-2',
      sectionId: 't-lectura',
      topicTag: 'Signos cotidianos',
      question: 'En una partitura o cifra, ¿qué orden te indica D.C. al Fine?',
      options: [
        'Tocar más fuerte de golpe',
        'Volver al principio (Da Capo) y detenerte donde dice "Fine"',
        'Saltar directamente al último compás',
        'Subir todas las notas una octava',
      ],
      correctIndex: 1,
      explanation:
        'Da Capo (D.C.) significa "desde la cabeza/principio"; "al Fine" indica dónde terminar al repetir.',
    },
  ],
  't-oido': [
    {
      id: 'q-oido-1',
      sectionId: 't-oido',
      topicTag: 'Oído relativo',
      question: '¿Por qué es más práctico entrenar primero el oído relativo que perseguir el oído absoluto?',
      options: [
        'Porque la música funciona por relaciones (tensión y reposo) entre grados, aplicables en cualquier tonalidad',
        'Porque el oído relativo ignora los intervalos',
        'Porque solo sirve para batería',
        'Porque todas las canciones están en Do Mayor',
      ],
      correctIndex: 0,
      explanation:
        'El oído relativo reconoce distancias y funciones (como un V que quiere ir al I), lo que permite sacar canciones y transportar al vuelo.',
      audioPrompt: {
        label: 'Escuchar tensión V7 → reposo I',
        kind: 'progression',
        midis: [],
        chordGroups: [[55, 59, 62, 65], [60, 64, 67]],
      },
    },
  ],
  'h-triadas': [
    {
      id: 'q-triadas-1',
      sectionId: 'h-triadas',
      topicTag: 'Estructura de Tríadas',
      question: '¿Cómo se construye una tríada menor en comparación con una tríada mayor desde la misma tónica?',
      options: [
        'Se baja la 5ª un semitono',
        'Se baja la 3ª un semitono (3ªm + 5ªJ = 0–3–7 semitonos)',
        'Se sube la 3ª un tono completo',
        'Se elimina la tónica',
      ],
      correctIndex: 1,
      explanation:
        'Tríada Mayor = 1–3–5 (0–4–7 st); Tríada Menor = 1–♭3–5 (0–3–7 st). Solo cambia medio tono en la 3ª.',
      audioPrompt: {
        label: 'Comparar C Mayor vs C Menor',
        kind: 'progression',
        midis: [],
        chordGroups: [[60, 64, 67], [60, 63, 67]],
      },
    },
  ],
  'h-diatonica': [
    {
      id: 'q-diat-1',
      sectionId: 'h-diatonica',
      topicTag: 'Funciones Tonales',
      question: 'En una escala mayor armonizada, ¿qué función cumplen los acordes de grado V y VII°?',
      options: [
        'Reposo absoluto (Tónica)',
        'Preparación suave (Subdominante)',
        'Tensión direccional que pide resolver hacia la Tónica (Dominante)',
        'Acordes puramente cromáticos fuera de escala',
      ],
      correctIndex: 2,
      explanation:
        'Tanto el V como el vii° contienen la sensible (7º grado) y forman el tritono diatónico que empuja de regreso al I.',
    },
  ],
  'h-ii-v-i': [
    {
      id: 'q-251-1',
      sectionId: 'h-ii-v-i',
      topicTag: 'Notas Guía',
      question: '¿Qué par de notas dentro de ii7 → V7 → Imaj7 conducen la armonía moviéndose por semitono o grado conjunto?',
      options: ['La 1ª y la 5ª', 'La 3ª y la 7ª (notas guía)', 'Solo las notas de bajo', 'Las novenas aumentadas'],
      correctIndex: 1,
      explanation:
        'La 7ª del ii7 desciende medio tono para convertirse en la 3ª del V7, y la 7ª del V7 baja medio tono a la 3ª del Imaj7.',
      audioPrompt: {
        label: 'Escuchar Dm7 → G7 → Cmaj7',
        kind: 'progression',
        midis: [],
        chordGroups: [[50, 57, 60, 65], [55, 59, 62, 65], [48, 55, 59, 64]],
      },
    },
  ],
  't-modos': [
    {
      id: 'q-modos-1',
      sectionId: 't-modos',
      topicTag: 'Enfoque Paralelo',
      question: 'Si tocas Do Dórico frente a Do Eólico (menor natural), ¿qué nota característica produce su color más abierto y groove?',
      options: ['La ♭2 (Re♭)', 'La 6ª Mayor natural (La♮)', 'La #4 (Fa#)', 'La 7ª Mayor (Si♮)'],
      correctIndex: 1,
      explanation:
        'El modo Dórico tiene estructura menor (♭3, ♭7) pero con 6ª Mayor (1–2–♭3–4–5–6–♭7), evitando el color oscuro del Eólico.',
      audioPrompt: {
        label: 'Escuchar escala Do Dórico',
        kind: 'notes',
        midis: [60, 62, 63, 65, 67, 69, 70, 72],
      },
    },
  ],
  'c-contrapunto': [
    {
      id: 'q-contra-1',
      sectionId: 'c-contrapunto',
      topicTag: 'Movimiento de Voces',
      question: '¿Qué tipo de movimiento entre dos melodías crea mayor independencia y claridad polifónica?',
      options: [
        'Movimiento paralelo en octavas seguidas',
        'Movimiento contrario (una voz sube mientras la otra baja)',
        'Tocar exactamente al unísono todo el tiempo',
        'Silenciar ambas voces en el tiempo 1',
      ],
      correctIndex: 1,
      explanation:
        'El movimiento contrario separa claramente los contornos melódicos para que el oído siga dos líneas independientes sin fundirse.',
      audioPrompt: {
        label: 'Escuchar movimiento contrario C4→G4 vs C5→E4',
        kind: 'progression',
        midis: [],
        chordGroups: [[60, 72], [62, 71], [64, 69], [67, 67]],
      },
    },
    {
      id: 'q-contra-2',
      sectionId: 'c-contrapunto',
      topicTag: 'Fuga y Contrasujeto',
      question: 'En una fuga, cuando la segunda voz entra imitando el tema principal en la 5ª (Respuesta), ¿qué función cumple el Contrasujeto?',
      options: [
        'Repetir el tema exactamente al unísono',
        'Ofrecer una contramelodía con ritmo y contorno complementarios mientras suena la Respuesta',
        'Detener la armonía durante 4 compases',
        'Sustituir la tonalidad por escala cromática',
      ],
      correctIndex: 1,
      explanation:
        'El buen contrasujeto contrasta rítmicamente con el sujeto (si el sujeto corre, el contrasujeto sostiene o respira) para que ambas voces se distingan.',
    },
  ],
  'ge-riffs-solos': [
    {
      id: 'q-improv-1',
      sectionId: 'ge-riffs-solos',
      topicTag: 'Fraseo y Notas Guía',
      question: 'En improvisación sobre jazz o cambios armónicos (ii7–V7–Imaj7), ¿qué par de notas conviene conectar por semitono para que el solo suene "dentro de los cambios"?',
      options: [
        'Solo la 5ª justa repetida en todos los compases',
        'La 3ª y la 7ª (notas guía) de cada acorde activo',
        'Únicamente la 4ª justa sobre el Imaj7',
        'Tocar todas las notas de la escala cromática sin pausa',
      ],
      correctIndex: 1,
      explanation:
        'Las notas guía (3ª y 7ª) definen la cualidad mayor/menor/dominante de cada acorde y enlazan por grado conjunto (ej. F→E entre G7 y Cmaj7).',
      audioPrompt: {
        label: 'Escuchar conexión de guías Dm7 → G7 → Cmaj7',
        kind: 'progression',
        midis: [],
        chordGroups: [[50, 60, 65], [55, 59, 65], [48, 59, 64]],
      },
    },
    {
      id: 'q-improv-2',
      sectionId: 'ge-riffs-solos',
      topicTag: 'Construcción de Motivos',
      question: '¿Qué estructura ayuda a que un solo improvisado suene musical y memorable en lugar de una escala al azar?',
      options: [
        'Tocar sin ningún silencio de principio a fin',
        'Pregunta–Respuesta: exponer un motivo breve de 3–4 notas, respirar y responderlo con variación hacia una nota estable',
        'Cambiar de púa cada medio segundo',
        'Evitar cualquier nota del acorde de fondo',
      ],
      correctIndex: 1,
      explanation:
        'Alternar motivos breves (Pregunta) con pausas reales y resoluciones variadas (Respuesta) da forma narrativa y emoción al fraseo.',
    },
  ],
  'ga-fundamentos': [
    {
      id: 'q-ga-anat-1',
      sectionId: 'ga-fundamentos',
      topicTag: 'Anatomía de Guitarra',
      question: 'En guitarra acústica o eléctrica, ¿dónde debes colocar exactamente el dedo de la mano izquierda dentro de un traste para lograr sonido limpio con menos fuerza?',
      options: [
        'Pegado justo detrás de la barrita metálica siguiente del traste',
        'Exactamente sobre el borde hacia la cejuela',
        'Encima de la barrita metálica siguiente tapando el sonido',
        'A la mitad de dos trastes con el dedo acostado',
      ],
      correctIndex: 0,
      explanation:
        'Pisar justo detrás de la varilla metálica requiere la mínima presión y elimina trasteos metálicos.',
    },
  ],
  'b-fundamentos': [
    {
      id: 'q-bajo-anat-1',
      sectionId: 'b-fundamentos',
      topicTag: 'Anatomía del Bajo',
      question: '¿Para qué sirve la técnica de Floating Thumb (pulgar flotante) en la mano derecha del bajo eléctrico?',
      options: [
        'Para doblar las cuerdas hacia arriba',
        'Para apoyar y mutear progresivamente las cuerdas más graves que no estás tocando',
        'Para afinar la 4ª cuerda mientras tocas',
        'Para reemplazar el uso de los dedos índice y medio',
      ],
      correctIndex: 1,
      explanation:
        'Al desplazar el pulgar hacia las cuerdas graves inactivas evitas vibraciones por simpatía y consigues un grave limpio y definido.',
    },
  ],
  'd-fundamentos': [
    {
      id: 'q-drum-anat-1',
      sectionId: 'd-fundamentos',
      topicTag: 'Anatomía de Batería',
      question: 'En un groove estándar 4/4 de rock o pop, ¿qué función cumple normalmente la Tarola / Caja frente al Bombo?',
      options: [
        'El Bombo ancla tiempos 1 y 3 (junto al bajo) y la Tarola marca el backbeat firme en los pulsos 2 y 4',
        'Ambos se pisan únicamente en el tiempo 1 de cada cuatro compases',
        'La Tarola solo se toca con el pie izquierdo',
        'El Crash sustituye al Bombo en todo el verso',
      ],
      correctIndex: 0,
      explanation:
        'La alternancia entre el cimiento grave del Bombo (1 y 3) y el chasquido de la Tarola (2 y 4) crea el balanceo clásico del groove.',
    },
  ],
  'v-fundamentos': [
    {
      id: 'q-voz-anat-1',
      sectionId: 'v-fundamentos',
      topicTag: 'Anatomía Vocal',
      question: '¿Qué tres subsistemas trabajan coordinados en tu instrumento vocal al cantar una frase limpia?',
      options: [
        'Solo los labios y los dientes',
        'Motor respiratorio (diafragma/costillas), vibrador (pliegues vocales en laringe) y resonadores (faringe y máscara facial)',
        'Únicamente los hombros y la clavícula elevada',
        'El pecho cerrado sin salida de aire',
      ],
      correctIndex: 1,
      explanation:
        'Un flujo de aire estable (motor) hace vibrar los pliegues sin tensión (vibrador), y faringe + máscara amplifican los armónicos (resonadores) sin gritar.',
      audioPrompt: {
        label: 'Escuchar referencia suave de afinación vocal (C4–E4–G4)',
        kind: 'notes',
        midis: [60, 64, 67, 64, 60],
      },
    },
  ],
  'c-taller-poetico': [
    {
      id: 'q-poetico-1',
      sectionId: 'c-taller-poetico',
      topicTag: 'Rima y Estructura',
      question: '¿En qué se diferencia una rima asonante de una rima consonante desde la última vocal acentuada?',
      options: [
        'La asonante coincide solo en vocales (ej. viento / sueño); la consonante coincide en vocales y consonantes (vuelo / suelo)',
        'La asonante solo se usa en inglés',
        'La consonante no tiene sílabas tónicas',
        'Ambas prohíben las sinalefas',
      ],
      correctIndex: 0,
      explanation:
        'La rima asonante da frescura y evita sonar predecible o infantil; la consonante aporta cierre firme y memorable.',
    },
  ],
  'a-fundamentos': [
    {
      id: 'q-arr-1',
      sectionId: 'a-fundamentos',
      topicTag: 'Orquestación y Registros',
      question: '¿Por qué conviene evitar acordes cerrados densos en el registro grave (por debajo de Do3)?',
      options: [
        'Porque el oído pierde resolución en bandas graves cercanas y se genera "barro" acústico',
        'Porque los bajos no pueden tocar tónicas',
        'Porque las octavas graves no tienen armónicos',
        'Porque solo aplica a instrumentos de viento',
      ],
      correctIndex: 0,
      explanation:
        'Según el límite de intervalo grave (Low Interval Limit), abajo conviene usar raíces/quintas abiertas y reservar las terceras y tensiones al registro medio.',
    },
  ],
  'p-fundamentos': [
    {
      id: 'q-prod-synth-1',
      sectionId: 'p-fundamentos',
      topicTag: 'Síntesis Sustractiva',
      question: 'En un sintetizador sustractivo, ¿qué etapa moldea la velocidad con la que nace el sonido y cuánto tarda en apagarse tras soltar la tecla?',
      options: [
        'La envolvente ADSR (Ataque, Decaimiento, Sostenimiento y Liberación)',
        'Únicamente el patrón polar del micrófono',
        'El cálculo de delay en corchea con puntillo',
        'La inversión del acorde en el bajo',
      ],
      correctIndex: 0,
      explanation:
        'Attack fija el tiempo de subida inicial y Release determina la cola al soltar la nota; Sustain fija el nivel mientras mantienes pulsada la tecla.',
    },
    {
      id: 'q-prod-midi-2',
      sectionId: 'p-fundamentos',
      topicTag: 'Protocolo MIDI',
      question: '¿Qué parámetro MIDI controla qué tan fuerte y expresiva suena cada nota sin cambiar su altura?',
      options: [
        'Pitch Bend exclusivamente',
        'Velocity (rango de 1 a 127)',
        'El filtro pasa-altos de la mezcla',
        'El número de octavas de la guitarra',
      ],
      correctIndex: 1,
      explanation:
        'La Velocity (1–127) codifica la intensidad del ataque; variarla junto a micro-desfases temporales devuelve humanidad a una secuencia MIDI.',
    },
  ],
  'p-mezcla': [
    {
      id: 'q-mix-1',
      sectionId: 'p-mezcla',
      topicTag: 'EQ y Espacio',
      question: 'Cuando la voz principal compite con una guitarra acústica rasgueada, ¿qué decisión limpia la mezcla con menos daño?',
      options: [
        'Subir +10 dB todo el máster',
        'Aplicar filtro pasa-altos suave y atenuar selectivamente la banda de presencia/barro en la guitarra donde respira la voz',
        'Paneo extremo de la voz al 100% izquierda',
        'Eliminar el bombo y el bajo',
      ],
      correctIndex: 1,
      explanation:
        'Hacer hueco con ecualización sustractiva y paneo lateral ligero deja la zona central de inteligibilidad libre para la voz.',
    },
    {
      id: 'q-mix-master-2',
      sectionId: 'p-mezcla',
      topicTag: 'Masterización y LUFS',
      question: '¿Por qué se recomienda dejar el techo del limitador final alrededor de -1.0 dBTP al masterizar para streaming (-14 LUFS)?',
      options: [
        'Para evitar recortes entre muestras (Inter-Sample Peaks) al codificar a AAC/MP3 y conservar pegada dinámica',
        'Porque el oído humano no escucha frecuencias por encima de 100 Hz',
        'Para forzar el Crest Factor por debajo de 2 dB',
        'Para eliminar el efecto estéreo de la reverb',
      ],
      correctIndex: 0,
      explanation:
        'Los códecs de streaming reconstruyen picos entre muestras digitales; un margen de -1.0 dBTP protege contra distorsión no deseada.',
    },
  ],
  'c-ejemplo': [
    {
      id: 'q-cejem-1',
      sectionId: 'c-ejemplo',
      topicTag: 'Análisis de Obra',
      question: 'En el estribillo de "Horizonte de Cristal", ¿cómo conviven una progresión jazz cromática (Eb7#11, Db7#11) y una melodía cantable?',
      options: [
        'La voz canta saltos cromáticos aleatorios de séptima mayor',
        'La voz desciende por grados conjuntos diatónicos sencillos (B4–A4–G4–F4–E4) que funcionan como tensiones o guías sobre los acordes debajo',
        'El bajo toca únicamente la misma nota pedal durante toda la canción',
        'Se eliminan todos los acordes para dejar solo batería',
      ],
      correctIndex: 1,
      explanation:
        'La maestría compositiva equilibra complejidad armónica en el acompañamiento con líneas vocales claras y memorables.',
      audioPrompt: {
        label: 'Escuchar enlace cromático Em7 → Eb7#11 → Dm9 → Db7#11 → Cmaj9',
        kind: 'progression',
        midis: [],
        chordGroups: [
          [52, 55, 59, 62],
          [51, 55, 58, 61, 69],
          [50, 53, 57, 60, 64],
          [49, 53, 56, 59, 67],
          [48, 52, 55, 59, 62],
        ],
      },
    },
  ],
  'pr-proyectos': [
    {
      id: 'q-pr-1',
      sectionId: 'pr-proyectos',
      topicTag: 'Proyecto Integrador',
      question: 'Antes de grabar y mezclar una obra multi-instrumento, ¿qué error de registro arruina más rápido la claridad de la maqueta?',
      options: [
        'Calcular los milisegundos del delay según el BPM del proyecto',
        'Dejar al bajo eléctrico y a los voicings densos del piano/guitarra compitiendo en la misma octava grave (C2–C3)',
        'Usar inversiones suaves en el bajo para conectar acordes',
        'Contrastar la textura de la estrofa respecto al estribillo',
      ],
      correctIndex: 1,
      explanation:
        'Resolver las colisiones de octava desde el arreglo permite que cada pista respire sin depender de correcciones agresivas de ecualización.',
    },
  ],
};

function buildFallbackQuestions(sectionId: string): AcademyQuizQuestion[] {
  const stage = ACADEMY_STAGES.find((st) => st.lessons.some((l) => l.sectionId === sectionId));
  const lesson = stage?.lessons.find((l) => l.sectionId === sectionId);
  const stageNum = stage?.number ?? 1;
  const title = lesson?.title || 'Concepto de la lección';

  if (stageNum === 2) {
    return [
      {
        id: `q-${sectionId}-inst1`,
        sectionId,
        topicTag: 'Técnica e Instrumento',
        question: `Al practicar "${title}", ¿qué señal confirma que tu técnica es eficiente antes de subir el tempo?`,
        options: [
          'Tocar lo más rápido posible aunque las notas trasteen o se apaguen',
          'Sonido limpio, hombros relajados y cambios a tiempo a un pulso lento constante (60–75 BPM)',
          'Mirar únicamente la partitura sin escuchar el resultado',
          'Apretar al máximo la mano izquierda para compensar el ritmo',
        ],
        correctIndex: 1,
        explanation:
          'La coordinación limpia se construye sin tensión muscular en tempo controlado; subir el BPM con suciedad solo fija errores.',
      },
      {
        id: `q-${sectionId}-inst2`,
        sectionId,
        topicTag: 'Aplicación Musical',
        question: '¿Cómo sabes que realmente dominaste un patrón técnico o acorde nuevo?',
        options: [
          'Cuando lo puedes enlazar dentro de un compás real sin detener el metrónomo',
          'Cuando lo memorizas una vez aislado en silencio',
          'Cuando tocas cada nota lo más fuerte posible',
          'Cuando evitas el tiempo 1 del compás',
        ],
        correctIndex: 0,
        explanation:
          'El dominio instrumental real aparece en la transición continua dentro del pulso, no en posturas estáticas aisladas.',
      },
    ];
  }

  if (stageNum === 3 || stageNum === 4 || stageNum === 7) {
    return [
      {
        id: `q-${sectionId}-arm1`,
        sectionId,
        topicTag: 'Lenguaje Armónico',
        question: `Al trabajar "${title}", ¿qué elemento explica por qué un acorde o tensión pide resolver hacia otro?`,
        options: [
          'El volumen de la batería únicamente',
          'La conducción por semitono/tono de las notas activas (como 3ª, 7ª y alteraciones)',
          'El número de trastes de la guitarra',
          'La cantidad de versos de la letra',
        ],
        correctIndex: 1,
        explanation:
          'La gravedad armónica nace del movimiento mínimo de voces entre tensiones (tritono, sensibles, alteraciones) y notas estables del acorde siguiente.',
        audioPrompt: {
          label: 'Escuchar resolución G7 → Cmaj7',
          kind: 'progression',
          midis: [],
          chordGroups: [[55, 59, 62, 65], [48, 55, 59, 64]],
        },
      },
      {
        id: `q-${sectionId}-arm2`,
        sectionId,
        topicTag: 'Aplicación Práctica',
        question: '¿Cuál es la forma más efectiva de llevar un concepto armónico avanzado a tu oído?',
        options: [
          'Memorizar tablas sin tocar nunca el instrumento',
          'Tocar la tónica como pedal y escuchar cómo cambia cada color o tensión respecto a ella',
          'Evitar comparar los acordes en el tiempo',
          'Usar únicamente acordes en posición fundamental',
        ],
        correctIndex: 1,
        explanation:
          'Escuchar tensiones y acordes contra un centro tonal claro entrena la intuición auditiva real además de la teoría.',
      },
    ];
  }

  if (stageNum === 5) {
    return [
      {
        id: `q-${sectionId}-comp1`,
        sectionId,
        topicTag: 'Composición Creativa',
        question: `En "${title}", ¿qué recurso evita que una idea musical se vuelva monótona sin perder coherencia?`,
        options: [
          'Cambiar de género y tonalidad cada dos segundos',
          'Repetir un motivo reconocible variando su altura, ritmo o armonía (repetición con variación)',
          'Escribir versos sin acentos definidos',
          'Eliminar cualquier silencio en toda la canción',
        ],
        correctIndex: 1,
        explanation:
          'El cerebro disfruta el equilibrio entre familiaridad (motivo repetido) y sorpresa (variación rítmica, melódica o armónica).',
      },
      {
        id: `q-${sectionId}-comp2`,
        sectionId,
        topicTag: 'Prosodia y Forma',
        question: '¿Por qué importa alinear los acentos naturales del texto con los tiempos fuertes musicales?',
        options: [
          'Para que la frase suene cantable, natural y emotiva sin forzar sílabas átonas',
          'Para poder tocar únicamente redondas',
          'Porque todas las canciones deben seguir verso-coro estricto',
          'Para evitar rimas asonantes',
        ],
        correctIndex: 0,
        explanation:
          'Cuando el acento verbal coincide con el acento métrico o melódico, el oyente comprende y siente la letra sin esfuerzo.',
      },
    ];
  }

  if (stageNum === 6) {
    return [
      {
        id: `q-${sectionId}-prod1`,
        sectionId,
        topicTag: 'Arreglos y Producción',
        question: `Al aplicar "${title}" en un tema multipista, ¿qué decisión mejora más la claridad del conjunto?`,
        options: [
          'Poner todos los instrumentos al mismo volumen y en la misma octava central',
          'Asignar a cada instrumento una función rítmica y un rango de registro complementario',
          'Comprimir el máster a -3 LUFS antes de arreglar las secciones',
          'Duplicar exactamente la línea de bajo con el teclado grave',
        ],
        correctIndex: 1,
        explanation:
          'Un buen arreglo resuelve los choques de espacio y frecuencia desde la orquestación antes incluso de abrir un ecualizador.',
      },
    ];
  }

  return [
    {
      id: `q-${sectionId}-gen1`,
      sectionId,
      topicTag: 'Consolidación',
      question: `¿Cuál es la mejor prueba de haber asimilado "${title}" antes de pasar a la siguiente lección?`,
      options: [
        'Leer la definición una sola vez sin probar el audio',
        'Explicarlo con tus propias palabras y reproducirlo o aplicarlo sobre un pulso estable',
        'Saltarse los ejercicios prácticos',
        'Memorizar solo los nombres latinos',
      ],
      correctIndex: 1,
      explanation:
        'La recuperación activa combinada con aplicación sonora consolida tanto la memoria auditiva como la muscular.',
    },
  ];
}

export function getLessonQuizQuestions(sectionId: string): AcademyQuizQuestion[] {
  const curated = QUIZ_BANK_BY_SECTION[sectionId];
  if (curated && curated.length > 0) {
    return curated;
  }
  return buildFallbackQuestions(sectionId);
}

export function getLessonPracticalMicroChallenge(sectionId: string): LessonMicroChallenge {
  const map: Record<string, LessonMicroChallenge> = {
    intro: {
      sectionId: 'intro',
      exerciseGoal: 'Marca 8 compases de 4/4 con el pie mientras aplaudes solo en los pulsos 2 y 4.',
      instrumentApplication: 'Canta o toca tus primeras 3 notas sobre un Do central sin cortar el pulso.',
      checkStep: '¿Pudiste distinguir cuándo el pulso seguía constante aunque cambiaras el ritmo con las palmas?',
    },
    't-ritmo': {
      sectionId: 't-ritmo',
      exerciseGoal: 'En el entrenador 4/4, alterna el patrón #2 (Silencios) y #6 (Síncopa) a 72 BPM diciendo "1 · (2) y (3) · 4".',
      instrumentApplication: 'Toca una sola cuerda o tecla repitiendo la síncopa sin acelerar en los silencios.',
      checkStep: '¿Tu golpe cayó exactamente en el aire del 2 ("2y") sosteniendo sobre el pulso 3?',
    },
    't-escalas': {
      sectionId: 't-escalas',
      exerciseGoal: 'Compara en la Escalera Mayor C → G → F y localiza a oído el momento en que G necesita F# y F necesita B♭.',
      instrumentApplication: 'Toca la escala mayor en una sola cuerda o en teclas blancas/negras cantando los grados 1–8.',
      checkStep: '¿Identificaste por qué los semitonos quedan siempre entre 3→4 y 7→8?',
    },
    't-tonalidades': {
      sectionId: 't-tonalidades',
      exerciseGoal: 'En el lector de armaduras, elige 3 sostenidos y 4 bemoles al azar y nombra la tonalidad antes de mirar el resultado.',
      instrumentApplication: 'Toca la cadencia I–IV–V–I en G Mayor y en E♭ Mayor sintiendo el reposo en el I.',
      checkStep: '¿Logras descifrar cualquier armadura en menos de 5 segundos?',
    },
    'c-contrapunto': {
      sectionId: 'c-contrapunto',
      exerciseGoal: 'Abre la trampa "5ªs y 8ªs Paralelas" en el estudio contrapuntístico y corrige al menos 3 pasos con ▲ / ▼ hasta dejar 0 alertas rojas.',
      instrumentApplication: 'Canta o toca el bajo (cantus) en tu instrumento y luego haz lo mismo con la voz superior escuchando su independencia.',
      checkStep: '¿El resumen final marca 0 quintas/octavas paralelas y predominio de movimiento contrario/oblicuo?',
    },
    'ge-riffs-solos': {
      sectionId: 'ge-riffs-solos',
      exerciseGoal: 'Alterna entre Blues y Jazz (ii–V–I) en el gimnasio de improvisación, pulsa cada Nota Guía y escucha cómo aterriza sobre el acorde activo.',
      instrumentApplication: 'Improvisa 4 compases usando solo un motivo de 3 notas en Pregunta (c. 1–2) y resolviendo por semitono en Respuesta (c. 3–4).',
      checkStep: '¿Dejaste al menos 1 pulso de aire entre la Pregunta y la Respuesta en lugar de tocar notas sin pausa?',
    },
    'ga-fundamentos': {
      sectionId: 'ga-fundamentos',
      exerciseGoal: 'Recorre las 5 zonas de la anatomía de guitarra escuchando la diferencia de timbre entre boca cálida (sul tasto) y puente brillante (sul ponticello).',
      instrumentApplication: 'Coloca el pulgar izquierdo detrás del traste 2, pisa detrás de la varilla metálica y verifica que las 6 cuerdas suenen limpias.',
      checkStep: '¿Cada nota suena clara sin zumbido metálico ni tensión en el hombro?',
    },
    'b-fundamentos': {
      sectionId: 'b-fundamentos',
      exerciseGoal: 'Compara en el diagrama la pastilla Precision vs. Jazz y prueba tocar alternando estrictamente índice–medio (i–m) en la cuerda A y D.',
      instrumentApplication: 'Practica descansar el pulgar en la cuerda E al tocar en A o D (Floating Thumb) para silenciar vibraciones parásitas.',
      checkStep: '¿Las cuerdas graves que no tocas permanecen completamente mudas?',
    },
    'd-fundamentos': {
      sectionId: 'd-fundamentos',
      exerciseGoal: 'Pulsa las 5 piezas del kit de batería e identifica qué extremidad controla Hi-Hat, Tarola (2 y 4) y Bombo (1 y 3).',
      instrumentApplication: 'Marca corcheas suaves en rodilla derecha (Hi-Hat), pie derecho en 1 y 3 (Bombo) y mano izquierda en 2 y 4 (Tarola).',
      checkStep: '¿Logras sostener 4 compases estables sin acelerar al entrar el golpe de Tarola?',
    },
    'v-fundamentos': {
      sectionId: 'v-fundamentos',
      exerciseGoal: 'Explora los 4 puntos anatómicos vocales (diafragma, laringe, faringe y máscara) y escucha cada referencia suave.',
      instrumentApplication: 'Inhala expandiendo costillas sin subir hombros y desliza un "Mmmm" suave hacia la máscara facial sin apretar la garganta.',
      checkStep: '¿Sientes vibración ligera en labios/nariz con cero esfuerzo en el cuello?',
    },
    'p-fundamentos': {
      sectionId: 'p-fundamentos',
      exerciseGoal: 'En el laboratorio de Síntesis y MIDI, compara un Pad (Ataque lento 320 ms) frente a un Pluck (Ataque 5 ms) y prueba subir la Humanización MIDI de 0% a 55%.',
      instrumentApplication: 'Graba o programa una frase MIDI de 4 compases variando la Velocity entre acentos (110) y notas fantasma (60).',
      checkStep: '¿Escuchaste cómo la envolvente ADSR y las dinámicas MIDI cambian por completo la emoción sin cambiar las notas?',
    },
    'p-mezcla': {
      sectionId: 'p-mezcla',
      exerciseGoal: 'Alterna entre "Barro en 250 Hz" y "Limpieza Profesional" pulsando "Escuchar CON Proceso" vs "Bypass" hasta notar el espacio extra.',
      instrumentApplication: 'En tu mezcla o demo, aplica un pasa-altos a 100 Hz en guitarras/teclados agudos y deja el techo del limitador en -1.0 dBTP.',
      checkStep: '¿El medidor muestra estado Balanceado y Crest Factor entre 7 y 13 dB sin sobrelimitación?',
    },
    'c-ejemplo': {
      sectionId: 'c-ejemplo',
      exerciseGoal: 'Recorre las 5 secciones de "Horizonte de Cristal" comparando la Audición Completa contra "Solo Bajo + Melodía".',
      instrumentApplication: 'Toma 4 compases de una progresión tuya y reescribe el bajo usando al menos una inversión (C/E o Am/G) para suavizar el movimiento.',
      checkStep: '¿El contorno de bajo y voz mantiene movimiento contrario o escalonado sin choques innecesarios?',
    },
    'pr-proyectos': {
      sectionId: 'pr-proyectos',
      exerciseGoal: 'Prueba provocar una colisión poniendo Bajo en Octava 3 o Armonía Grave en el Arquitecto Integrador y luego corrígela hasta ver el estado limpio.',
      instrumentApplication: 'Anota el tiempo exacto de Delay en corchea con puntillo (1/8.) para el BPM de tu canción original y define el reparto de octavas de tus 4 pistas.',
      checkStep: '¿Tu maqueta supera la auditoría sin colisiones de registro y conserva un contraste real entre secciones?',
    },
  };

  if (map[sectionId]) return map[sectionId];

  const stage = ACADEMY_STAGES.find((st) => st.lessons.some((l) => l.sectionId === sectionId));
  const lesson = stage?.lessons.find((l) => l.sectionId === sectionId);
  return {
    sectionId,
    exerciseGoal: `Practica el laboratorio de "${lesson?.title || 'esta lección'}" durante 5 minutos a tempo lento (60–75 BPM) escuchando cada ejemplo.`,
    instrumentApplication:
      stage && stage.number >= 3
        ? 'Transporta la idea principal a al menos dos tonalidades distintas (por ejemplo Do Mayor y Sol Mayor).'
        : 'Lleva el concepto directamente a tu instrumento principal o voz contando el pulso en voz alta.',
    checkStep: `Relaciona lo aprendido hoy con tu meta de etapa: ${stage?.graduationProject.title || 'Proyecto práctico'}.`,
  };
}

export function buildActiveReviewQueue(
  records: Record<string, LessonReviewRecord>,
  completedIds: string[],
  activeSectionId: string,
  nowMs: number,
  maxItems = 5
): AcademyQuizQuestion[] {
  const due = getDueReviews(records, completedIds, nowMs);
  const candidateSectionIds: string[] = [];

  for (const item of due) {
    if (!candidateSectionIds.includes(item.sectionId)) {
      candidateSectionIds.push(item.sectionId);
    }
  }
  if (activeSectionId && !candidateSectionIds.includes(activeSectionId)) {
    candidateSectionIds.push(activeSectionId);
  }
  // Fill with foundational questions if the user is just getting started
  for (const fallbackId of ['intro', 't-ritmo', 't-escalas', 't-tonalidades', 'h-triadas']) {
    if (candidateSectionIds.length >= maxItems) break;
    if (!candidateSectionIds.includes(fallbackId)) {
      candidateSectionIds.push(fallbackId);
    }
  }

  const questions: AcademyQuizQuestion[] = [];
  for (const secId of candidateSectionIds) {
    const bank = getLessonQuizQuestions(secId);
    if (bank.length > 0) {
      questions.push(bank[0]);
    }
    if (questions.length >= maxItems) break;
  }
  return questions;
}
