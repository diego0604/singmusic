import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ENCYCLOPEDIA_CONTENT } from './encyclopedia-data';
import {
  MusicAudioEngine,
  NOTE_NAMES,
  hydrateAllLabs,
  replaceLegacyMarkers,
} from './lab-engine';
import { ChordDiagram } from './chord-diagram';
import { DiagramModalManager } from './diagram-modal';
import {
  SECTION_GAMES_SEARCH_META,
  hydrateInteractiveArcade,
  injectSectionGamesIntoCategoryHtml,
} from './interactive-arcade';
import {
  TREATISE_ENRICHMENT_SEARCH_META,
  injectTreatiseEnrichmentIntoCategoryHtml,
} from './treatise-enrichment';
import {
  type VisualInstrumentFocus,
  getVisualInstrumentFocus,
  resolveVisualInstrumentView,
  setVisualInstrumentFocus,
} from './music-games-logic';
import {
  ACADEMY_LEARNING_PATHS,
  ACADEMY_STAGES,
  assembleAcademyCategoryHtml,
  extractIntraLessonAnchors,
  extractSingleSectionHtml,
  findStageForSection,
  getStageProgress,
  resolveCategoryForSectionId,
  type AcademyLearningPath,
  type AcademyStage,
  type IntraLessonJumpItem,
} from './academy-curriculum';
import { applyStage1LessonUpgrades } from './academy-lessons';
import { LessonPracticeDeck, playAcademyAudioPrompt } from './lesson-practice-deck';
import {
  buildActiveReviewQueue,
  detectLessonFrameworkPhases,
  getDueReviews,
  getStageGraduationSummary,
  getTotalGraduationsCount,
  normalizeStageRubricEntry,
  scheduleNextReview,
  type AcademyAudioPrompt,
  type AcademyQuizQuestion,
  type DeliverableMasteryRating,
  type DueReviewItem,
  type GraduationRubricState,
  type LessonFrameworkPhase,
  type LessonReviewRecord,
  type StageGraduationSummary,
  type StageRubricEntry,
} from './academy-practice';
import {
  APP_THEME_PRESETS,
  DEFAULT_APP_THEME,
  THEME_STORAGE_KEY,
  getThemePreset,
  resolveThemeId,
  type AppThemeId,
  type AppThemeOption,
} from './theme-presets';

export interface CategoryPart {
  id: string;
  label: string;
  count: number;
}

export interface SectionAnchor {
  id: string;
  title: string;
  nivel: string;
}

export interface GlobalSearchIndexItem {
  catId: string;
  catLabel: string;
  sectionId: string;
  sectionTitle: string;
  nivel: string;
  keywords: string;
  snippet: string;
}

export interface GlossaryEntry {
  term: string;
  category: string;
  definition: string;
  demoRun?: string;
  sectionId: string;
}

export interface LearningPathStep {
  catId: string;
  sectionId: string;
  title: string;
  badge: string;
}

export interface LearningPathTrack {
  id: string;
  title: string;
  subtitle: string;
  steps: LearningPathStep[];
}

const COMPLETED_STORAGE_KEY = 'enciclopedia_completed_sections_v1';
const REVIEW_RECORDS_STORAGE_KEY = 'academy_review_records_v1';
const GRADUATION_RUBRIC_STORAGE_KEY = 'academy_graduation_rubrics_v1';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [ChordDiagram, LessonPracticeDeck],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(document:keydown.escape)': 'closeAllOverlays()',
  },
})
export class App implements OnInit, OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly modalManager = inject(DiagramModalManager);
  readonly audio = new MusicAudioEngine();
  private sectionObserver: IntersectionObserver | null = null;
  private isProgrammaticScroll = false;

  readonly contentHost = viewChild<ElementRef<HTMLElement>>('contentHost');

  readonly categories: CategoryPart[] = [
    { id: 'teoria', label: '1. Teoría y Acústica', count: 9 },
    { id: 'armonia', label: '2. Armonía Práctica', count: 19 },
    { id: 'composicion', label: '3. Composición y Letras', count: 11 },
    { id: 'guitarra-ac', label: '4. Guitarra Acústica', count: 8 },
    { id: 'guitarra-el', label: '5. Guitarra Eléctrica', count: 6 },
    { id: 'bajo', label: '6. Bajo Eléctrico (4 Cuerdas)', count: 6 },
    { id: 'bateria', label: '7. Batería y Percusión', count: 6 },
    { id: 'canto', label: '8. Canto y Calentamiento Vocal', count: 6 },
    { id: 'folclore', label: '9. Vientos Andinos y Folclore', count: 4 },
    { id: 'arreglos', label: '10. Arreglos y Orquestación', count: 4 },
    { id: 'produccion', label: '11. Producción y Proyectos', count: 3 },
    { id: 'entrenamiento', label: '12. Entrenamiento, Salud y Banda', count: 3 },
    { id: 'all', label: '📚 Toda la Enciclopedia Completa', count: 85 },
  ];

  readonly activeCat = signal<CategoryPart>(this.categories[0]);
  readonly safeContent = signal<SafeHtml>('');
  readonly fullCategoryHtml = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly sections = signal<SectionAnchor[]>([]);
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly activeNoteLabel = signal<string>(
    'Listo · Pulsa cualquier nota, acorde o laboratorio'
  );
  readonly currentInstrument = signal<'guitar' | 'piano' | 'bass'>('guitar');
  readonly visualInstrumentFocus = signal<VisualInstrumentFocus>('all');

  // Curated 4-Theme UI Switcher (Paper Light, Warm Light, Graphite Dark, Slate Dark)
  readonly themePresets = APP_THEME_PRESETS;
  readonly activeTheme = signal<AppThemeId>(DEFAULT_APP_THEME);
  readonly showThemeMenu = signal<boolean>(false);
  readonly activeThemePreset = computed<AppThemeOption>(() => getThemePreset(this.activeTheme()));

  // Reader Mode: 'full' renders the entire module continuously so the user scrolls freely; 'focused' isolates 1 section
  readonly lessonViewMode = signal<'focused' | 'full'>('full');

  // Global Level Filter ('4' = Completo by default so deep pedagogical explanations are never hidden)
  readonly activeLevelFilter = signal<'1' | '2' | '4'>('4');
  readonly hiddenBlocksCount = signal<number>(0);

  readonly filteredSections = computed<SectionAnchor[]>(() => {
    const all = this.sections();
    const maxLvl = parseInt(this.activeLevelFilter(), 10);
    if (maxLvl >= 4) return all;
    const filtered = all.filter((sec) => this.parseMinNivel(sec.nivel) <= maxLvl);
    return filtered.length > 0 ? filtered : all.slice(0, 1);
  });

  readonly activeSectionIndex = computed<number>(() => {
    const list = this.sections();
    const idx = list.findIndex((s) => s.id === this.activeSectionId());
    return idx >= 0 ? idx : 0;
  });

  readonly prevLesson = computed<SectionAnchor | null>(() => {
    const list = this.sections();
    const idx = this.activeSectionIndex();
    return idx > 0 ? list[idx - 1] : null;
  });

  readonly nextLesson = computed<SectionAnchor | null>(() => {
    const list = this.sections();
    const idx = this.activeSectionIndex();
    return idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
  });

  readonly activeStageForSection = computed<AcademyStage>(() => {
    return findStageForSection(this.activeSectionId()) || ACADEMY_STAGES[0];
  });

  readonly intraLessonAnchors = computed<IntraLessonJumpItem[]>(() => {
    const full = this.fullCategoryHtml();
    if (!full || this.lessonViewMode() === 'full') return [];
    const activeHtml = extractSingleSectionHtml(full, this.activeSectionId());
    return extractIntraLessonAnchors(activeHtml);
  });

  readonly lessonFrameworkPhases = computed<LessonFrameworkPhase[]>(() => {
    const full = this.fullCategoryHtml();
    if (!full || this.lessonViewMode() !== 'focused' || this.activeCat().id === 'all') return [];
    const activeHtml = extractSingleSectionHtml(full, this.activeSectionId());
    return detectLessonFrameworkPhases(activeHtml);
  });

  readonly prevCategory = computed<CategoryPart | null>(() => {
    const ordered = this.categories.filter((c) => c.id !== 'all');
    const idx = ordered.findIndex((c) => c.id === this.activeCat().id);
    return idx > 0 ? ordered[idx - 1] : null;
  });

  readonly nextCategory = computed<CategoryPart | null>(() => {
    const ordered = this.categories.filter((c) => c.id !== 'all');
    const idx = ordered.findIndex((c) => c.id === this.activeCat().id);
    if (idx === -1) return ordered[0] ?? null;
    return idx < ordered.length - 1 ? ordered[idx + 1] : null;
  });

  // Live Note Monitor (driven by Studio Enhancements custom window event)
  readonly liveNotes = signal<string[]>([]);
  readonly liveNoteKind = signal<'note' | 'chord' | 'idle'>('idle');
  private liveNotesListener: ((ev: Event) => void) | null = null;
  private visualFocusListener: ((ev: Event) => void) | null = null;

  // Guided Academy (8 Stages), Learning Paths, Completion, Spaced Reviews & Graduation Rubrics
  readonly academyStages = ACADEMY_STAGES;
  readonly showChordDiagram = signal<boolean>(false);
  readonly showPaths = signal<boolean>(false);
  readonly academyDrawerTab = signal<'stages' | 'paths' | 'reviews'>('stages');
  readonly selectedStageId = signal<string>('etapa-0');
  readonly selectedPathId = signal<string>('cero-a-musico');
  readonly activeSectionId = signal<string>('intro');
  readonly completedSections = signal<string[]>([]);
  readonly reviewRecords = signal<Record<string, LessonReviewRecord>>({});
  readonly graduationRubrics = signal<GraduationRubricState>({});
  readonly reviewClock = signal<number>(Date.now());

  // In-drawer Mixed Active Review Session State
  readonly mixedReviewQuestions = signal<AcademyQuizQuestion[]>([]);
  readonly mixedReviewSelections = signal<Record<string, number>>({});
  readonly mixedReviewEvaluated = signal<boolean>(false);
  readonly mixedReviewScorePct = signal<number>(0);

  readonly learningPaths: AcademyLearningPath[] = ACADEMY_LEARNING_PATHS;

  readonly selectedAcademyStage = computed<AcademyStage>(() => {
    return (
      this.academyStages.find((s) => s.id === this.selectedStageId()) || this.academyStages[0]
    );
  });

  readonly selectedStageProgress = computed<{ done: number; total: number; pct: number }>(() => {
    return getStageProgress(this.selectedAcademyStage(), this.completedSections());
  });

  readonly activeSectionReviewRecord = computed<LessonReviewRecord | undefined>(() => {
    return this.reviewRecords()[this.activeSectionId()];
  });

  readonly dueReviewItems = computed<DueReviewItem[]>(() => {
    return getDueReviews(this.reviewRecords(), this.completedSections(), this.reviewClock());
  });

  readonly dueReviewsCount = computed<number>(() => {
    return this.dueReviewItems().filter((item) => item.status === 'due' || item.status === 'untested').length;
  });

  readonly selectedStageRubricEntry = computed<StageRubricEntry>(() => {
    const stage = this.selectedAcademyStage();
    return normalizeStageRubricEntry(stage, this.graduationRubrics()[stage.id]);
  });

  readonly selectedStageGraduationSummary = computed<StageGraduationSummary>(() => {
    return getStageGraduationSummary(this.selectedAcademyStage(), this.graduationRubrics());
  });

  readonly totalGraduationsSummary = computed<{ graduated: number; total: number }>(() => {
    return getTotalGraduationsCount(this.academyStages, this.graduationRubrics());
  });

  readonly mixedReviewAnsweredCount = computed<number>(() => {
    const sel = this.mixedReviewSelections();
    return this.mixedReviewQuestions().filter((q) => typeof sel[q.id] === 'number').length;
  });

  readonly mixedReviewAllAnswered = computed<boolean>(() => {
    const qs = this.mixedReviewQuestions();
    return qs.length > 0 && this.mixedReviewAnsweredCount() === qs.length;
  });

  readonly totalAcademyProgress = computed<{ done: number; total: number; pct: number }>(() => {
    const seen = new Set<string>();
    const allIds: string[] = [];
    for (const st of this.academyStages) {
      for (const l of st.lessons) {
        if (!seen.has(l.sectionId)) {
          seen.add(l.sectionId);
          allIds.push(l.sectionId);
        }
      }
    }
    const completed = new Set(this.completedSections());
    const done = allIds.filter((id) => completed.has(id)).length;
    const total = allIds.length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  });

  readonly activeLearningPath = computed<AcademyLearningPath>(() => {
    return (
      this.learningPaths.find((p) => p.id === this.selectedPathId()) || this.learningPaths[0]
    );
  });

  readonly activePathProgress = computed<{ done: number; total: number; pct: number }>(() => {
    const steps = this.activeLearningPath().steps;
    const completed = new Set(this.completedSections());
    const done = steps.filter((s) => completed.has(s.sectionId)).length;
    const total = steps.length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  });

  // Global Instant Search State
  readonly searchQuery = signal<string>('');
  private readonly globalIndex: GlobalSearchIndexItem[] = [];

  readonly searchResults = computed<GlobalSearchIndexItem[]>(() => {
    const q = this.normalizeText(this.searchQuery().trim());
    if (q.length < 2) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return this.globalIndex
      .filter((item) => tokens.every((tok) => item.keywords.includes(tok)))
      .slice(0, 14);
  });

  // Floating Glossary State
  readonly showGlossary = signal<boolean>(false);
  readonly glossaryFilter = signal<string>('');

  readonly glossaryEntries: GlossaryEntry[] = [
    {
      term: 'Semitono y Tono (Unidad de Medida)',
      category: 'Concepto Base',
      definition:
        'El Semitono (1 st) es la distancia más pequeña entre dos notas en la música occidental (1 traste en la guitarra o 1 tecla contigua en el piano). Un Tono (2 st) equivale exactamente a la suma de 2 semitonos.',
      sectionId: 't-notas',
    },
    {
      term: 'Sostenido (#), Bemol (♭) y Becuadro (♮)',
      category: 'Concepto Base',
      definition:
        'El Sostenido (#) sube la altura de una nota 1 semitono (+1 traste). El Bemol (♭) baja la nota 1 semitono (-1 traste). El Becuadro (♮) cancela cualquier alteración previa.',
      sectionId: 't-notas',
    },
    {
      term: 'Intervalo Musical (¿Qué es y para qué sirve?)',
      category: 'Concepto Base',
      definition:
        'Es la distancia acústica entre dos notas medida en semitonos. Es el ladrillo con el que se construyen todas las escalas, melodías y acordes. Los intervalos 1ª, 4ª, 5ª y 8ª se llaman Justos; los intervalos 2ª, 3ª, 6ª y 7ª son Mayores o Menores.',
      sectionId: 't-intervalos',
    },
    {
      term: 'Tercera Mayor (4 st) vs. Tercera Menor (3 st)',
      category: 'Concepto Base',
      definition:
        'El intervalo que define el estado emocional de un acorde: la 3ª Mayor (4 semitonos, ej. Do→Mi) suena luminosa y alegre; la 3ª Menor (3 semitonos, ej. Do→Mi♭) suena íntima y melancólica.',
      sectionId: 't-intervalos',
    },
    {
      term: 'Quinta Justa (7 st), Disminuida (6 st) y Aumentada (8 st)',
      category: 'Concepto Base',
      definition:
        'La Quinta Justa (7 semitonos, Do→Sol) da estabilidad y potencia (Power Chord). Si se achica 1 semitono es Quinta Disminuida o Tritono (6 st, Do→Sol♭, máxima tensión). Si se agranda 1 semitono es Quinta Aumentada (8 st, Do→Sol#, flotante y misteriosa).',
      sectionId: 't-intervalos',
    },
    {
      term: 'Diatónico vs. Cromático',
      category: 'Concepto Base',
      definition:
        'Diatónico significa que usa únicamente las 7 notas que pertenecen de forma natural a una escala o tonalidad. Cromático significa que incluye cualquiera de las 5 notas alteradas intermedias (los 12 semitonos) para crear color o tensión.',
      sectionId: 't-notas',
    },
    {
      term: 'Música Tonal vs. Música Modal',
      category: 'Concepto Base',
      definition:
        'La Música Tonal funciona por gravedad: el acorde dominante (V7) crea tensión que exige resolver a la casa o Tónica (I). La Música Modal habita un paisaje o color estático (Dórico, Lidio, Frigio) sin que el V7 lo arrastre a la escala mayor.',
      sectionId: 't-modos',
    },
    {
      term: 'Appoggio (Apoyo Vocal)',
      category: 'Canto',
      definition:
        'Equilibrio muscular entre los intercostales externos (que mantienen las costillas abiertas) y el transverso abdominal para regular la presión subglótica sin apretar la garganta.',
      demoRun: 'vocalBreathPacer',
      sectionId: 'v-fundamentos',
    },
    {
      term: 'Passaggio (Puente Vocal)',
      category: 'Canto',
      definition:
        'Zona de transición biomecánica donde el músculo tiroaritenoideo (voz de pecho) cede gradualmente el control al cricotiroideo (voz de cabeza) para evitar el quiebre o gallo.',
      demoRun: 'vocalOctaveSiren',
      sectionId: 'v-afinacion-registros',
    },
    {
      term: 'SOVT (Tracto Vocal Semi-Ocluido)',
      category: 'Canto',
      definition:
        'Ejercicios como Lip Trill (Brrrr) o fonación en popote que devuelven presión acústica (impedancia retrógrada) hacia los pliegues vocales para separarlos suavemente sin impacto.',
      demoRun: 'vocalSovtSlide',
      sectionId: 'v-calentamiento',
    },
    {
      term: 'Arka e Ira (Pareja Sikuri)',
      category: 'Folclore Andino',
      definition:
        'División bipolar de la escala diatónica de la Zampoña en dos mitades complementarias (Arka de 7 tubos e Ira de 6 tubos) que dialogan intercalando cada nota.',
      demoRun: 'zamponaArka',
      sectionId: 'f-zampona',
    },
    {
      term: 'Sesquiáltera / Hemiola (6/8 vs 3/4)',
      category: 'Folclore Latino',
      definition:
        'Polirritmia característica de la Chacarera, Cueca y Joropo donde el rasgueo agudo subdivide en 6/8 (2 pulsos ternarios) mientras el bombo legüero marca 3/4 (3 pulsos binarios).',
      sectionId: 'f-ritmos-latinos',
    },
    {
      term: 'Afinación Reentrante (Charango)',
      category: 'Folclore Andino',
      definition:
        'Disposición de los 5 órdenes dobles del charango (G4–C5–E5/E4–A4–E5) donde las cuerdas graves y agudas se alternan desde el centro hacia afuera para lograr el efecto arpa o campanella.',
      sectionId: 'f-charango',
    },
    {
      term: 'Modo Lidio (#4)',
      category: 'Teoría / Modos',
      definition:
        'Escala mayor con el cuarto grado aumentado (1-2-3-#4-5-6-7). Evoca asombro espacial, ingravidez cinematográfica y luminosidad sin tirón hacia la subdominante.',
      sectionId: 't-modos',
    },
    {
      term: 'Modo Dórico (6ª Mayor en Menor)',
      category: 'Teoría / Modos',
      definition:
        'Modo menor con sexta mayor natural (1-2-b3-4-5-6-b7). Sonoridad característica del Funk, Latin Rock (Santana), Jazz Modal y música andina contemporánea.',
      sectionId: 't-modos',
    },
    {
      term: 'Tritono (Diabolus in Musica)',
      category: 'Armonía',
      definition:
        'Intervalo de 6 semitonos (4ª aumentada o 5ª disminuida) entre el 3er y 7º grado de un acorde dominante G7 (B y F), responsable de la máxima tensión que exige resolver a la tónica.',
      sectionId: 'h-dominantes',
    },
    {
      term: 'Voicing Drop 2',
      category: 'Armonía / Guitarra',
      definition:
        'Disposición de un acorde de 4 notas donde la segunda voz más aguda se baja una octava exacta, creando un espaciado abierto e ideal para las 4 cuerdas contiguas de la guitarra.',
      sectionId: 'h-voicings',
    },
    {
      term: 'Travis Picking',
      category: 'Guitarra Acústica',
      definition:
        'Técnica fingerstyle donde el pulgar derecho mantiene un bajo alternado constante en negras (cuerdas 6-4) mientras los dedos índice y medio pellizcan melodías sincopadas.',
      demoRun: 'guitarTravisDrill',
      sectionId: 'ga-ritmo-fingerstyle',
    },
    {
      term: 'Floating Thumb (Pulgar Flotante)',
      category: 'Bajo Eléctrico',
      definition:
        'Técnica de muteo para bajo donde el pulgar derecho descansa y desciende sobre las cuerdas graves no ejecutadas (E y A) para impedir que vibren por simpatía acústica.',
      demoRun: 'bassFunkDrill',
      sectionId: 'b-mutear-articulacion',
    },
    {
      term: 'Ghost Notes (Notas Fantasma)',
      category: 'Batería / Bajo',
      definition:
        'Golpes o pulsaciones de muy baja amplitud (ejecutados a 2 cm del parche en la tarola o con cuerda apagada en el bajo) que rellenan la subdivisión de semicorcheas y crean el groove.',
      demoRun: 'drumParadiddleDrill',
      sectionId: 'd-fundamentos',
    },
    {
      term: 'Single Paradiddle (R L R R - L R L L)',
      category: 'Batería',
      definition:
        'Rudimento fundamental que combina dos golpes simples seguidos de un golpe doble, permitiendo cambiar naturalmente la mano líder en cada pulso sin cruzar los brazos.',
      demoRun: 'drumParadiddleDrill',
      sectionId: 'd-fundamentos',
    },
  ];

  readonly filteredGlossary = computed<GlossaryEntry[]>(() => {
    const q = this.normalizeText(this.glossaryFilter().trim());
    if (!q) return this.glossaryEntries;
    return this.glossaryEntries.filter(
      (item) =>
        this.normalizeText(item.term).includes(q) ||
        this.normalizeText(item.category).includes(q) ||
        this.normalizeText(item.definition).includes(q)
    );
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const saved = localStorage.getItem(COMPLETED_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            this.completedSections.set(parsed.filter((x) => typeof x === 'string'));
          }
        }
        const savedReviews = localStorage.getItem(REVIEW_RECORDS_STORAGE_KEY);
        if (savedReviews) {
          const parsedRev = JSON.parse(savedReviews);
          if (parsedRev && typeof parsedRev === 'object' && !Array.isArray(parsedRev)) {
            this.reviewRecords.set(parsedRev as Record<string, LessonReviewRecord>);
          }
        }
        const savedRubrics = localStorage.getItem(GRADUATION_RUBRIC_STORAGE_KEY);
        if (savedRubrics) {
          const parsedRub = JSON.parse(savedRubrics);
          if (parsedRub && typeof parsedRub === 'object' && !Array.isArray(parsedRub)) {
            this.graduationRubrics.set(parsedRub as GraduationRubricState);
          }
        }
        const savedTheme = resolveThemeId(localStorage.getItem(THEME_STORAGE_KEY));
        this.activeTheme.set(savedTheme);
        this.applyThemeToDocument(savedTheme);
      } catch {
        this.applyThemeToDocument(DEFAULT_APP_THEME);
      }

      this.liveNotesListener = (ev: Event) => {
        const custom = ev as CustomEvent<{ notes?: string[]; kind?: 'note' | 'chord' | 'idle' }>;
        const notes = Array.isArray(custom.detail?.notes) ? custom.detail.notes : [];
        this.liveNotes.set(notes);
        this.liveNoteKind.set(notes.length === 0 ? 'idle' : custom.detail?.kind || 'note');
      };
      window.addEventListener('enciclopedia:live-notes', this.liveNotesListener);

      const savedFocus = getVisualInstrumentFocus();
      this.visualInstrumentFocus.set(savedFocus);
      if (savedFocus === 'guitar-only') {
        this.currentInstrument.set('guitar');
      } else if (savedFocus === 'bass-only') {
        this.currentInstrument.set('bass');
      }

      this.visualFocusListener = (ev: Event) => {
        const custom = ev as CustomEvent<{ focus?: VisualInstrumentFocus }>;
        const nextFocus = custom.detail?.focus || getVisualInstrumentFocus();
        this.visualInstrumentFocus.set(nextFocus);
        if (nextFocus === 'guitar-only') {
          this.currentInstrument.set('guitar');
        } else if (nextFocus === 'bass-only') {
          this.currentInstrument.set('bass');
        }
      };
      window.addEventListener('enciclopedia:visual-instrument-change', this.visualFocusListener);
    }

    this.buildGlobalSearchIndex();
    this.loadCategory(this.categories[0]);
  }

  ngOnDestroy(): void {
    this.audio.stopAll();
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
      this.sectionObserver = null;
    }
    if (isPlatformBrowser(this.platformId)) {
      if (this.liveNotesListener) {
        window.removeEventListener('enciclopedia:live-notes', this.liveNotesListener);
        this.liveNotesListener = null;
      }
      if (this.visualFocusListener) {
        window.removeEventListener('enciclopedia:visual-instrument-change', this.visualFocusListener);
        this.visualFocusListener = null;
      }
    }
  }

  private normalizeText(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private buildAssembledCategoryHtml(catId: string): string {
    const getEnriched = (id: string): string => {
      const baseHtml =
        id === 'all'
          ? Object.values(ENCYCLOPEDIA_CONTENT).join('\n')
          : id === 'entrenamiento'
            ? ''
            : ENCYCLOPEDIA_CONTENT[id] || '<p>Módulo no encontrado.</p>';
      const withTreatise = injectTreatiseEnrichmentIntoCategoryHtml(id, baseHtml);
      const withGames = injectSectionGamesIntoCategoryHtml(id, withTreatise);
      return replaceLegacyMarkers(withGames);
    };

    const enrichedMain = getEnriched(catId);
    const enrichedTeoria = catId === 'armonia' ? getEnriched('teoria') : undefined;
    return assembleAcademyCategoryHtml(
      catId,
      enrichedMain,
      enrichedTeoria,
      applyStage1LessonUpgrades
    );
  }

  private buildGlobalSearchIndex(): void {
    for (const meta of [...SECTION_GAMES_SEARCH_META, ...TREATISE_ENRICHMENT_SEARCH_META]) {
      this.globalIndex.push({
        catId: meta.catId,
        catLabel: meta.catLabel,
        sectionId: meta.sectionId,
        sectionTitle: meta.sectionTitle,
        nivel: meta.nivel,
        keywords: this.normalizeText(`${meta.catLabel} ${meta.sectionTitle} ${meta.keywords}`),
        snippet: meta.snippet,
      });
    }

    for (const cat of this.categories) {
      if (cat.id === 'all') continue;
      const html = this.buildAssembledCategoryHtml(cat.id);
      const secRegex =
        /<section\s+id="([^"]+)"[^>]*data-nivel="([^"]+)"[^>]*data-menu="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g;
      let match: RegExpExecArray | null;
      while ((match = secRegex.exec(html)) !== null) {
        const sectionId = match[1];
        const nivel = match[2];
        const sectionTitle = match[3];
        const bodyHtml = match[4];
        const plainText = bodyHtml
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        const snippet = plainText.slice(0, 145) + (plainText.length > 145 ? '…' : '');
        const keywords = this.normalizeText(`${cat.label} ${sectionTitle} ${sectionId} ${plainText}`);
        this.globalIndex.push({
          catId: cat.id,
          catLabel: cat.label,
          sectionId,
          sectionTitle,
          nivel,
          keywords,
          snippet,
        });
      }
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  onGlossaryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.glossaryFilter.set(input.value);
  }

  closeAllOverlays(): void {
    this.showPaths.set(false);
    this.showGlossary.set(false);
    this.showThemeMenu.set(false);
    this.mobileMenuOpen.set(false);
    this.modalManager.close();
  }

  toggleThemeMenu(): void {
    this.showThemeMenu.update((v) => !v);
  }

  closeThemeMenu(): void {
    this.showThemeMenu.set(false);
  }

  selectTheme(themeId: AppThemeId): void {
    const resolved = resolveThemeId(themeId);
    this.activeTheme.set(resolved);
    this.showThemeMenu.set(false);
    this.applyThemeToDocument(resolved);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, resolved);
      } catch {
        // Ignore storage write errors in restricted iframes
      }
    }
  }

  private applyThemeToDocument(themeId: AppThemeId): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const preset = getThemePreset(themeId);
    const root = document.documentElement;
    root.dataset['theme'] = preset.id;
    root.classList.toggle('dark', preset.isDark);
    root.style.colorScheme = preset.isDark ? 'dark' : 'light';
  }

  closePaths(): void {
    this.showPaths.set(false);
  }

  closeGlossary(): void {
    this.showGlossary.set(false);
  }

  toggleChordDiagram(): void {
    this.showChordDiagram.update((v) => {
      const next = !v;
      if (next) {
        this.showGlossary.set(false);
        this.showPaths.set(false);
        this.showThemeMenu.set(false);
      }
      return next;
    });
  }

  toggleGlossary(): void {
    this.showGlossary.update((v) => {
      const next = !v;
      if (next) {
        this.showPaths.set(false);
        this.showThemeMenu.set(false);
      }
      return next;
    });
  }

  togglePaths(): void {
    this.showPaths.update((v) => {
      const next = !v;
      if (next) {
        this.showGlossary.set(false);
        this.showThemeMenu.set(false);
      }
      return next;
    });
  }

  setAcademyDrawerTab(tab: 'stages' | 'paths' | 'reviews'): void {
    this.academyDrawerTab.set(tab);
    if (tab === 'reviews') {
      this.reviewClock.set(Date.now());
    }
  }

  selectAcademyStage(stageId: string): void {
    this.selectedStageId.set(stageId);
  }

  selectLearningPath(pathId: string): void {
    this.selectedPathId.set(pathId);
  }

  private persistReviewRecords(next: Record<string, LessonReviewRecord>): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(REVIEW_RECORDS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }

  private persistGraduationRubrics(next: GraduationRubricState): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(GRADUATION_RUBRIC_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }

  onLessonReviewSubmitted(ev: { sectionId: string; scorePct: number }): void {
    const now = Date.now();
    this.reviewRecords.update((prev) => {
      const updatedRec = {
        ...scheduleNextReview(prev[ev.sectionId], ev.scorePct, now),
        sectionId: ev.sectionId,
      };
      const next = { ...prev, [ev.sectionId]: updatedRec };
      this.persistReviewRecords(next);
      return next;
    });
    this.reviewClock.set(now);
  }

  onPracticeNoteStatus(msg: string): void {
    this.activeNoteLabel.set(msg);
  }

  openStageGraduationFromLesson(stageId: string): void {
    this.selectedStageId.set(stageId);
    this.academyDrawerTab.set('stages');
    this.showGlossary.set(false);
    this.showChordDiagram.set(false);
    this.showPaths.set(true);
  }

  toggleDeliverableChecked(stageId: string, idx: number): void {
    const stage = this.academyStages.find((s) => s.id === stageId);
    if (!stage) return;
    this.graduationRubrics.update((prev) => {
      const current = normalizeStageRubricEntry(stage, prev[stageId]);
      const nextChecked = [...current.checked];
      nextChecked[idx] = !nextChecked[idx];
      const nextRatings = [...current.ratings];
      if (nextChecked[idx] && nextRatings[idx] === 0) {
        nextRatings[idx] = 2;
      } else if (!nextChecked[idx]) {
        nextRatings[idx] = 0;
      }
      const next: GraduationRubricState = {
        ...prev,
        [stageId]: { ...current, checked: nextChecked, ratings: nextRatings },
      };
      this.persistGraduationRubrics(next);
      return next;
    });
  }

  setDeliverableRating(stageId: string, idx: number, rating: DeliverableMasteryRating): void {
    const stage = this.academyStages.find((s) => s.id === stageId);
    if (!stage) return;
    this.graduationRubrics.update((prev) => {
      const current = normalizeStageRubricEntry(stage, prev[stageId]);
      const nextRatings = [...current.ratings];
      nextRatings[idx] = rating;
      const nextChecked = [...current.checked];
      nextChecked[idx] = rating > 0;
      const next: GraduationRubricState = {
        ...prev,
        [stageId]: { ...current, checked: nextChecked, ratings: nextRatings },
      };
      this.persistGraduationRubrics(next);
      return next;
    });
  }

  onRubricNoteInput(stageId: string, event: Event): void {
    const stage = this.academyStages.find((s) => s.id === stageId);
    if (!stage) return;
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.graduationRubrics.update((prev) => {
      const current = normalizeStageRubricEntry(stage, prev[stageId]);
      const next: GraduationRubricState = {
        ...prev,
        [stageId]: { ...current, note: value },
      };
      this.persistGraduationRubrics(next);
      return next;
    });
  }

  jumpToPhaseAnchor(phase: LessonFrameworkPhase): void {
    if (!phase.available) return;
    this.scrollToIntraAnchor(phase.anchorId || this.activeSectionId());
  }

  startMixedReviewSession(): void {
    const now = Date.now();
    this.reviewClock.set(now);
    const queue = buildActiveReviewQueue(
      this.reviewRecords(),
      this.completedSections(),
      this.activeSectionId(),
      now,
      5
    );
    this.mixedReviewQuestions.set(queue);
    this.mixedReviewSelections.set({});
    this.mixedReviewEvaluated.set(false);
    this.mixedReviewScorePct.set(0);
  }

  selectMixedAnswer(questionId: string, optIdx: number): void {
    if (this.mixedReviewEvaluated()) return;
    this.mixedReviewSelections.update((prev) => ({ ...prev, [questionId]: optIdx }));
  }

  mixedOptionLetter(idx: number): string {
    return ['A', 'B', 'C', 'D'][idx] || 'A';
  }

  submitMixedReviewSession(): void {
    const qs = this.mixedReviewQuestions();
    if (qs.length === 0 || !this.mixedReviewAllAnswered()) return;
    const sel = this.mixedReviewSelections();
    let totalHits = 0;
    const perSection = new Map<string, { hits: number; total: number }>();

    for (const q of qs) {
      const correct = sel[q.id] === q.correctIndex;
      if (correct) totalHits++;
      const prev = perSection.get(q.sectionId) || { hits: 0, total: 0 };
      prev.total += 1;
      if (correct) prev.hits += 1;
      perSection.set(q.sectionId, prev);
    }

    const overallPct = Math.round((totalHits / qs.length) * 100);
    const now = Date.now();
    this.reviewRecords.update((prev) => {
      const next = { ...prev };
      perSection.forEach((stats, secId) => {
        const secPct = Math.round((stats.hits / stats.total) * 100);
        next[secId] = {
          ...scheduleNextReview(prev[secId], secPct, now),
          sectionId: secId,
        };
      });
      this.persistReviewRecords(next);
      return next;
    });

    this.reviewClock.set(now);
    this.mixedReviewScorePct.set(overallPct);
    this.mixedReviewEvaluated.set(true);
    this.activeNoteLabel.set(`Sesión mixta completada (${overallPct}%): intervalos actualizados`);
  }

  playMixedAudioPrompt(prompt: AcademyAudioPrompt): void {
    playAcademyAudioPrompt(this.audio, prompt);
    this.activeNoteLabel.set(`🔊 ${prompt.label}`);
  }

  jumpToDueReviewLesson(item: DueReviewItem): void {
    this.showPaths.set(false);
    this.mobileMenuOpen.set(false);
    this.openLesson(item.catId, item.sectionId);
  }

  formatReviewCardBadge(item: DueReviewItem): string {
    if (item.status === 'due') return 'Repaso hoy';
    if (item.status === 'untested') return 'Pendiente de evaluar';
    return item.daysUntilDue === 1 ? 'En 1 día' : `En ${item.daysUntilDue} días`;
  }

  setLessonViewMode(mode: 'focused' | 'full'): void {
    if (this.lessonViewMode() === mode) return;
    this.lessonViewMode.set(mode);
    this.renderCurrentViewAndHydrate();
  }

  setLevelFilter(level: '1' | '2' | '4'): void {
    this.activeLevelFilter.set(level);
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.applyLevelDomFilter(), 10);
    }
  }

  onLevelFilterChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as '1' | '2' | '4';
    if (val === '1' || val === '2' || val === '4') {
      this.setLevelFilter(val);
    }
  }

  onVisualFocusChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as VisualInstrumentFocus;
    if (val === 'all' || val === 'guitar-only' || val === 'bass-only') {
      this.setVisualFocus(val);
    }
  }

  onInstrumentChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as 'guitar' | 'piano' | 'bass';
    if (val === 'guitar' || val === 'piano' || val === 'bass') {
      this.audio.stopAll();
      this.currentInstrument.set(val);
      const label =
        val === 'guitar'
          ? 'Guitarra Pulsada'
          : val === 'bass'
            ? 'Bajo Eléctrico (4 Cuerdas)'
            : 'Piano Acústico';
      this.activeNoteLabel.set(`Timbre global: ${label}`);
    }
  }

  onPracticeSectionChange(event: Event): void {
    const secId = (event.target as HTMLSelectElement).value;
    if (secId) {
      this.activeSectionId.set(secId);
      const stage = findStageForSection(secId);
      if (stage) this.selectedStageId.set(stage.id);
    }
  }

  setVisualFocus(focus: VisualInstrumentFocus): void {
    this.visualInstrumentFocus.set(focus);
    setVisualInstrumentFocus(focus);
    if (focus === 'guitar-only') {
      this.currentInstrument.set('guitar');
    } else if (focus === 'bass-only') {
      this.currentInstrument.set('bass');
    }
    this.activeNoteLabel.set(`Vista visual: ${resolveVisualInstrumentView(focus).label}`);
  }

  parseMinNivel(nivelStr: string): number {
    const match = /\d+/.exec(nivelStr || '1');
    return match ? parseInt(match[0], 10) : 1;
  }

  isSectionCompleted(sectionId: string): boolean {
    return this.completedSections().includes(sectionId);
  }

  toggleSectionCompleted(sectionId: string): void {
    this.completedSections.update((prev) => {
      const next = prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId];
      if (isPlatformBrowser(this.platformId)) {
        try {
          localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignore storage quota errors
        }
      }
      return next;
    });
  }

  jumpToPathStep(step: { catId: string; sectionId: string }): void {
    this.showPaths.set(false);
    this.mobileMenuOpen.set(false);
    this.openLesson(step.catId, step.sectionId);
  }

  jumpToSearchResult(item: GlobalSearchIndexItem): void {
    this.searchQuery.set('');
    this.mobileMenuOpen.set(false);
    this.openLesson(item.catId, item.sectionId);
  }

  jumpFromGlossary(entry: GlossaryEntry): void {
    this.showGlossary.set(false);
    this.mobileMenuOpen.set(false);
    this.jumpToCrossSection(entry.sectionId);
  }

  playGlossaryDemo(demoName: string): void {
    this.runDemo(demoName);
  }

  openLesson(catId: string, sectionId: string): void {
    const targetCat = this.categories.find((c) => c.id === catId);
    if (!targetCat) return;
    const stage = findStageForSection(sectionId);
    if (stage) {
      this.selectedStageId.set(stage.id);
    }

    if (this.activeCat().id !== targetCat.id) {
      this.loadCategory(targetCat, sectionId);
    } else {
      this.scrollToSection(sectionId);
    }
  }

  openGuidedTrainingSession(preferredInst?: 'guitarra' | 'bajo' | 'bateria' | 'canto'): void {
    const currentCatId = this.activeCat().id;
    const targetInst: 'guitarra' | 'bajo' | 'bateria' | 'canto' =
      preferredInst ||
      (currentCatId === 'bateria'
        ? 'bateria'
        : currentCatId === 'bajo'
          ? 'bajo'
          : currentCatId === 'canto'
            ? 'canto'
            : 'guitarra');

    this.showPaths.set(false);
    this.showGlossary.set(false);
    this.showChordDiagram.set(false);
    this.mobileMenuOpen.set(false);
    this.searchQuery.set('');

    this.openLesson('entrenamiento', 'entreno-diario');

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const labEl = document.getElementById('lab-sesion-entrenamiento');
        if (labEl) {
          const btn = labEl.querySelector<HTMLButtonElement>(
            `.js-dt-inst[data-inst="${targetInst}"]`
          );
          if (btn && !btn.classList.contains('active')) {
            btn.click();
          }
        }
        const secEl = document.getElementById('entreno-diario');
        if (secEl) {
          this.isProgrammaticScroll = true;
          secEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
            this.isProgrammaticScroll = false;
          }, 700);
        }
      }, 120);
    }
  }

  loadCategory(cat: CategoryPart, initialSectionId?: string): void {
    this.modalManager.close();
    this.audio.stopAll();
    this.activeCat.set(cat);
    this.mobileMenuOpen.set(false);
    if (cat.id === 'bajo' || this.visualInstrumentFocus() === 'bass-only') {
      this.currentInstrument.set('bass');
    } else if (this.visualInstrumentFocus() === 'guitar-only' || this.currentInstrument() === 'bass') {
      this.currentInstrument.set('guitar');
    }

    const assembledHtml = this.buildAssembledCategoryHtml(cat.id);
    this.fullCategoryHtml.set(assembledHtml);
    this.extractSections(assembledHtml, initialSectionId);
    this.renderCurrentViewAndHydrate(initialSectionId);
  }

  private renderCurrentViewAndHydrate(targetSectionId?: string): void {
    const fullHtml = this.fullCategoryHtml();
    const isFocused = this.lessonViewMode() === 'focused' && this.activeCat().id !== 'all';
    const viewHtml = isFocused
      ? extractSingleSectionHtml(fullHtml, this.activeSectionId())
      : fullHtml;

    this.safeContent.set(this.sanitizer.bypassSecurityTrustHtml(viewHtml));

    if (isPlatformBrowser(this.platformId)) {
      if (!targetSectionId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setTimeout(() => {
        const hostEl = this.contentHost()?.nativeElement;
        if (hostEl) {
          hydrateAllLabs(
            hostEl,
            this.audio,
            (msg) => this.activeNoteLabel.set(msg),
            this.modalManager
          );
          hydrateInteractiveArcade(hostEl, this.audio, (msg) => this.activeNoteLabel.set(msg));
          this.ensureActiveSectionVisibleForLevelFilter();
          this.applyLevelDomFilter();
          this.setupSectionScrollObserver(hostEl);
          if (targetSectionId) {
            const targetEl = document.getElementById(targetSectionId);
            if (targetEl) {
              this.isProgrammaticScroll = true;
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              setTimeout(() => {
                this.isProgrammaticScroll = false;
              }, 700);
            }
          }
        }
      }, 25);
    }
  }

  private setupSectionScrollObserver(hostEl: HTMLElement): void {
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
      this.sectionObserver = null;
    }
    if (!isPlatformBrowser(this.platformId) || typeof IntersectionObserver === 'undefined') return;
    if (this.lessonViewMode() !== 'full') return;

    const sectionEls = hostEl.querySelectorAll<HTMLElement>('section.module-section[id]');
    if (sectionEls.length <= 1) return;

    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        if (this.isProgrammaticScroll) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const topEntry = visible[0];
        const secId = topEntry?.target?.getAttribute('id');
        if (secId && secId !== this.activeSectionId()) {
          this.activeSectionId.set(secId);
          const stage = findStageForSection(secId);
          if (stage) this.selectedStageId.set(stage.id);
        }
      },
      { rootMargin: '-18% 0px -68% 0px', threshold: 0 }
    );

    sectionEls.forEach((el) => this.sectionObserver?.observe(el));
  }

  private ensureActiveSectionVisibleForLevelFilter(): void {
    const activeSec = this.sections().find((s) => s.id === this.activeSectionId());
    if (!activeSec) return;
    const minLvl = this.parseMinNivel(activeSec.nivel);
    const currentFilter = parseInt(this.activeLevelFilter(), 10);
    if (minLvl > currentFilter) {
      this.activeLevelFilter.set(minLvl >= 3 ? '4' : '2');
    }
  }

  goPrevLesson(): void {
    const prev = this.prevLesson();
    if (prev) {
      this.scrollToSection(prev.id);
      return;
    }
    const prevCat = this.prevCategory();
    if (prevCat) {
      const prevHtml = this.buildAssembledCategoryHtml(prevCat.id);
      const regex = /<section\s+id="([^"]+)"/g;
      let lastId = '';
      let m: RegExpExecArray | null;
      while ((m = regex.exec(prevHtml)) !== null) {
        lastId = m[1];
      }
      this.loadCategory(prevCat, lastId || undefined);
    }
  }

  goNextLesson(): void {
    const next = this.nextLesson();
    if (next) {
      this.scrollToSection(next.id);
      return;
    }
    const nextCat = this.nextCategory();
    if (nextCat) {
      this.loadCategory(nextCat);
    }
  }

  goPrevCategory(): void {
    const prev = this.prevCategory();
    if (prev) {
      this.loadCategory(prev);
    }
  }

  goNextCategory(): void {
    const next = this.nextCategory();
    if (next) {
      this.loadCategory(next);
    }
  }

  private applyLevelDomFilter(): void {
    const hostEl = this.contentHost()?.nativeElement;
    if (!hostEl) return;

    // Remove previous unlock banners and restore hidden elements cleanly
    hostEl.querySelectorAll('.level-locked-banner').forEach((b) => b.remove());
    hostEl.querySelectorAll('.level-locked-hidden').forEach((el) => {
      el.classList.remove('level-locked-hidden');
    });

    const maxLvl = parseInt(this.activeLevelFilter(), 10);
    if (maxLvl >= 4) {
      this.hiddenBlocksCount.set(0);
      return;
    }

    const levelLabel = maxLvl === 1 ? 'Novato (N1)' : 'Intermedio (N1–N2)';
    let hiddenCount = 0;

    const candidates = hostEl.querySelectorAll<HTMLElement>(
      'section.module-section[data-nivel], .callout-box[data-nivel], .callout[data-nivel], details[data-nivel], article[data-nivel], div[data-nivel]'
    );

    candidates.forEach((el) => {
      const attr = el.getAttribute('data-nivel') || '1';
      const minLvl = this.parseMinNivel(attr);
      if (minLvl <= maxLvl || el.hasAttribute('data-user-unlocked')) return;

      // Avoid double-banners inside an already hidden parent section
      if (el.parentElement?.closest('.level-locked-hidden')) {
        el.classList.add('level-locked-hidden');
        return;
      }

      el.classList.add('level-locked-hidden');
      hiddenCount++;

      const title =
        el.getAttribute('data-menu') ||
        el.querySelector('h2, h3, summary')?.textContent?.trim() ||
        'Bloque avanzado';

      const banner = document.createElement('div');
      banner.className = 'level-locked-banner';
      banner.innerHTML = `
        <span>🔒 <strong>Nivel ${attr}</strong> (${title}) oculto en modo <em>${levelLabel}</em>.</span>
        <button type="button" class="btn btn-primary js-unlock-block">
          🔓 Desbloquear bloque
        </button>
      `;
      banner.querySelector('.js-unlock-block')?.addEventListener('click', () => {
        el.setAttribute('data-user-unlocked', '1');
        el.classList.remove('level-locked-hidden');
        el.querySelectorAll('.level-locked-hidden').forEach((child) =>
          child.classList.remove('level-locked-hidden')
        );
        banner.remove();
        this.hiddenBlocksCount.update((c) => Math.max(0, c - 1));
      });

      el.parentElement?.insertBefore(banner, el);
    });

    this.hiddenBlocksCount.set(hiddenCount);
  }

  stopAllAudio(): void {
    this.audio.stopAll();
    this.activeNoteLabel.set('Reproducción detenida');
  }

  toggleInstrument(): void {
    this.audio.stopAll();
    this.currentInstrument.update((prev) =>
      prev === 'guitar' ? 'piano' : prev === 'piano' ? 'bass' : 'guitar'
    );
    const label =
      this.currentInstrument() === 'guitar'
        ? 'Guitarra Pulsada'
        : this.currentInstrument() === 'bass'
          ? 'Bajo Eléctrico (4 Cuerdas)'
          : 'Piano Acústico';
    this.activeNoteLabel.set(`Timbre global cambiado a: ${label}`);
  }

  private extractSections(html: string, initialSectionId?: string): void {
    const list: SectionAnchor[] = [];
    const regex = /<section\s+id="([^"]+)"[^>]*data-nivel="([^"]+)"[^>]*data-menu="([^"]+)"/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null) {
      list.push({
        id: match[1],
        nivel: match[2],
        title: match[3],
      });
    }
    this.sections.set(list);
    if (list.length > 0) {
      const preferred = initialSectionId && list.some((s) => s.id === initialSectionId)
        ? initialSectionId
        : list[0].id;
      this.activeSectionId.set(preferred);
    }
  }

  scrollToSection(id: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.mobileMenuOpen.set(false);
    const isSameSection = this.activeSectionId() === id;
    this.activeSectionId.set(id);
    const stage = findStageForSection(id);
    if (stage) {
      this.selectedStageId.set(stage.id);
    }

    if (this.lessonViewMode() === 'focused' && this.activeCat().id !== 'all') {
      if (!isSameSection || !document.getElementById(id)) {
        this.renderCurrentViewAndHydrate();
        return;
      }
    }

    const el = document.getElementById(id);
    if (el) {
      if (el.classList.contains('level-locked-hidden')) {
        el.setAttribute('data-user-unlocked', '1');
        this.applyLevelDomFilter();
      }
      this.isProgrammaticScroll = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        this.isProgrammaticScroll = false;
      }, 700);
    }
  }

  scrollToIntraAnchor(anchorId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = document.getElementById(anchorId);
    if (el) {
      if (el.closest('.level-locked-hidden')) {
        const lockedParent = el.closest('.level-locked-hidden') as HTMLElement | null;
        lockedParent?.setAttribute('data-user-unlocked', '1');
        this.applyLevelDomFilter();
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  handleContentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const jumpSessionBtn = target.closest('button.js-jump-guided-session') as HTMLElement | null;
    if (jumpSessionBtn) {
      const inst = jumpSessionBtn.getAttribute('data-inst') as
        | 'guitarra'
        | 'bajo'
        | 'bateria'
        | 'canto'
        | null;
      this.openGuidedTrainingSession(inst || undefined);
      return;
    }

    const jumpCrossBtn = target.closest('button.js-jump-cross-section') as HTMLElement | null;
    if (jumpCrossBtn) {
      const targetId = jumpCrossBtn.getAttribute('data-target');
      if (targetId) {
        this.jumpToCrossSection(targetId);
      }
      return;
    }

    const treatiseBtn = target.closest('button.js-treatise-chord') as HTMLElement | null;
    if (treatiseBtn) {
      const notesRaw = treatiseBtn.getAttribute('data-notes') || '';
      const groupsRaw = treatiseBtn.getAttribute('data-groups') || '';
      const label = treatiseBtn.getAttribute('data-label') || 'Ejemplo Armónico';
      const mode = treatiseBtn.getAttribute('data-mode') || 'chord';
      const rawTimb = (treatiseBtn.getAttribute('data-inst') as 'piano' | 'guitar') || 'piano';
      const focus = this.visualInstrumentFocus();
      const timb: 'piano' | 'guitar' | 'bass' =
        focus === 'guitar-only' ? 'guitar' : focus === 'bass-only' ? 'bass' : rawTimb;

      if (mode === 'prog' && groupsRaw) {
        const groups = groupsRaw
          .split('|')
          .map((g) =>
            g
              .split(',')
              .map((n) => parseInt(n.trim(), 10))
              .filter((n) => !Number.isNaN(n))
          )
          .filter((g) => g.length > 0);
        if (groups.length === 0) return;
        this.audio.stopAll();
        this.activeNoteLabel.set(`🔊 ${label} (${groups.length} acordes)`);
        groups.forEach((chord, idx) => {
          this.audio.schedule(() => {
            if (timb === 'bass') {
              const bassMidi = chord[0] >= 52 ? chord[0] - 12 : chord[0];
              this.audio.playElectricBass(bassMidi, 0.78, 0, 0.36, 'finger', false);
            } else {
              this.audio.strumChord(chord, timb, 0, false);
              const bassMidi = chord[0] >= 48 ? chord[0] - 12 : chord[0];
              this.audio.playElectricBass(bassMidi, 0.78, 0, 0.28, 'finger', false, { skipGlow: true });
            }
            this.activeNoteLabel.set(`🔊 ${label} [Paso ${idx + 1}/${groups.length}]`);
          }, idx * 820);
        });
        return;
      }

      const midis = notesRaw
        .split(',')
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => !Number.isNaN(n));
      if (midis.length === 0) return;

      this.audio.stopAll();
      this.activeNoteLabel.set(`🔊 ${label}`);
      if (mode === 'seq') {
        midis.forEach((m, i) => {
          this.audio.schedule(() => {
            if (timb === 'bass') {
              const bassMidi = m >= 55 ? m - 12 : m;
              this.audio.playElectricBass(bassMidi, 0.55, 0, 0.36, 'finger', false);
            } else if (timb === 'guitar') {
              this.audio.playPluckedGuitar(m, 0.55, 0, 0.28, false);
            } else {
              this.audio.playAcousticPiano(m, 0.55, 0, 0.25, false);
            }
          }, i * 270);
        });
      } else if (timb === 'bass') {
        midis.forEach((m, i) => {
          const bassMidi = m >= 55 ? m - 12 : m;
          this.audio.playElectricBass(bassMidi, 0.7, i * 0.14, 0.34, 'finger', false);
        });
      } else {
        this.audio.strumChord(midis, timb, 0, false);
      }
      return;
    }

    const btn = target.closest('button.btn-audio') as HTMLElement | null;
    if (
      btn &&
      !btn.classList.contains('js-h-single') &&
      !btn.classList.contains('js-treatise-chord') &&
      !btn.classList.contains('js-concept-demo')
    ) {
      const noteAttr = btn.getAttribute('data-play-note');
      const intervalAttr = btn.getAttribute('data-play-interval');
      const runAttr = btn.getAttribute('data-run');

      if (noteAttr) {
        const midi = parseInt(noteAttr, 10);
        this.audio.stopAll();
        this.playMidiNote(midi, 1.3, 0, false);
        const noteName = `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
        this.activeNoteLabel.set(
          `Nota ${noteName} (MIDI ${midi} — ${this.audio.midiToFreq(midi).toFixed(1)} Hz)`
        );
      } else if (intervalAttr) {
        const semitones = parseInt(intervalAttr, 10);
        this.playInterval(60, semitones);
        this.activeNoteLabel.set(
          `Intervalo: +${semitones} semitonos sobre C4 (C4 → ${NOTE_NAMES[(60 + semitones) % 12]})`
        );
      } else if (runAttr) {
        this.runDemo(runAttr);
      }
      return;
    }

    const link = target.closest('a') as HTMLAnchorElement | null;
    if (link && link.getAttribute('href')?.startsWith('#')) {
      const targetId = link.getAttribute('href')!.slice(1);
      const existing = document.getElementById(targetId);
      if (existing) {
        event.preventDefault();
        existing.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        event.preventDefault();
        this.jumpToCrossSection(targetId);
      }
    }
  }

  jumpToCrossSection(sectionId: string): void {
    const resolved = resolveCategoryForSectionId(sectionId);
    const targetCat = this.categories.find((c) => c.id === resolved);
    if (targetCat) {
      this.openLesson(targetCat.id, sectionId);
    }
  }

  playMidiNote(midi: number, duration = 1.25, delay = 0, stopPrev = true): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (stopPrev && delay === 0) {
      this.audio.stopAll();
    }
    const focus = this.visualInstrumentFocus();
    if (this.activeCat().id === 'bajo' || focus === 'bass-only' || this.currentInstrument() === 'bass') {
      const bassMidi = midi >= 55 && focus === 'bass-only' ? midi - 12 : midi;
      this.audio.playElectricBass(bassMidi, duration, delay, 0.38, 'finger', false);
    } else if (this.activeCat().id === 'canto') {
      this.audio.playAcousticPiano(midi, duration, delay, 0.18, false);
      this.audio.playVocalFormant(midi, duration, delay, 0.25, 'a', false);
    } else if (this.activeCat().id === 'folclore') {
      this.audio.playQuenaFlute(midi, duration, delay, 0.26, false);
    } else if (focus === 'guitar-only' || this.currentInstrument() === 'guitar') {
      this.audio.playPluckedGuitar(midi, duration, delay, 0.28, false);
    } else {
      this.audio.playAcousticPiano(midi, duration, delay, 0.26, false);
    }
  }

  playInterval(baseMidi: number, semitones: number): void {
    this.audio.stopAll();
    this.playMidiNote(baseMidi, 0.9, 0, false);
    this.playMidiNote(baseMidi + semitones, 0.9, 0.55, false);
    this.playMidiNote(baseMidi, 1.3, 1.2, false);
    this.playMidiNote(baseMidi + semitones, 1.3, 1.24, false);
  }

  private runDemo(name: string): void {
    this.audio.stopAll();
    this.activeNoteLabel.set(`Reproduciendo ejercicio interactivo: ${name}`);

    if (name === 'demoPulseOnly') {
      [0, 1, 2, 3].forEach((i) => {
        this.audio.playDrumHit(i === 0 ? 'clap' : 'hihat', i * 0.55);
      });
      this.activeNoteLabel.set('Etapa 0 · Pulso constante (1 – 2 – 3 – 4)');
    } else if (name === 'demoRhythmClap') {
      const hits: { piece: 'kick' | 'clap' | 'snare' | 'hihat'; t: number }[] = [
        { piece: 'kick', t: 0 },
        { piece: 'hihat', t: 0.275 },
        { piece: 'snare', t: 0.55 },
        { piece: 'kick', t: 0.825 },
        { piece: 'kick', t: 1.1 },
        { piece: 'snare', t: 1.65 },
        { piece: 'clap', t: 1.925 },
      ];
      hits.forEach((h) => this.audio.playDrumHit(h.piece, h.t));
      this.activeNoteLabel.set('Etapa 0 · Ritmo (golpes largos, cortos y síncopas sobre el pulso)');
    } else if (name === 'demoTimeSig34') {
      // 3/4 Waltz: 2 bars x 3 quarter-note pulses subdivided in pairs (1-y 2-y 3-y)
      const step = 0.28;
      for (let bar = 0; bar < 2; bar++) {
        const base = bar * 6 * step;
        [0, 1, 2, 3, 4, 5].forEach((eighth) => {
          const t = base + eighth * step;
          if (eighth === 0) {
            this.audio.playDrumHit('kick', t);
            this.playMidiNote(48, 0.35, t, false);
          } else if (eighth === 2 || eighth === 4) {
            this.audio.playDrumHit('snare', t);
            this.playMidiNote(64, 0.24, t, false);
          } else {
            this.audio.playDrumHit('hihat', t);
          }
        });
      }
      this.activeNoteLabel.set('Compás 3/4 (Vals): 3 pulsos por compás (UN-y · dos-y · tres-y)');
    } else if (name === 'demoTimeSig68') {
      // 6/8 Compound: 2 bars x 2 big pulses of 3 eighth-notes (UN-dos-tres · CUATRO-cinco-seis)
      const step = 0.24;
      for (let bar = 0; bar < 2; bar++) {
        const base = bar * 6 * step;
        [0, 1, 2, 3, 4, 5].forEach((eighth) => {
          const t = base + eighth * step;
          if (eighth === 0) {
            this.audio.playDrumHit('kick', t);
            this.playMidiNote(48, 0.45, t, false);
          } else if (eighth === 3) {
            this.audio.playDrumHit('clap', t);
            this.playMidiNote(55, 0.45, t, false);
          } else {
            this.audio.playDrumHit('hihat', t);
          }
        });
      }
      this.activeNoteLabel.set('Compás 6/8: 2 pulsos grandes de 3 corcheas (UN-dos-tres · CUATRO-cinco-seis)');
    } else if (name === 'demoMelodyHook') {
      const melody = [60, 64, 67, 64, 60, 62, 64, 60];
      melody.forEach((m, i) => this.playMidiNote(m, 0.36, i * 0.28, false));
      this.activeNoteLabel.set('Etapa 0 · Melodía (ritmo + alturas que suben y bajan)');
    } else if (name === 'demoOctaves') {
      [36, 48, 60, 72, 84].forEach((m, i) => this.playMidiNote(m, 0.85, i * 0.42, false));
    } else if (name === 'demoRiffAudio') {
      const notes = [40, 43, 45, 46, 47, 45, 40];
      notes.forEach((m, i) => this.audio.playPluckedGuitar(m, 0.55, i * 0.24, 0.3, false));
    } else if (name === 'demoVoiceLeadingFalse') {
      const chords = [
        [48, 52, 55],
        [53, 57, 60],
        [55, 59, 62],
        [48, 52, 55],
      ];
      chords.forEach((c, i) => this.audio.strumChord(c, 'piano', i * 0.75, false));
    } else if (name === 'demoVoiceLeadingTrue') {
      const chords = [
        [48, 52, 55],
        [48, 53, 57],
        [47, 53, 55],
        [48, 52, 55],
      ];
      chords.forEach((c, i) => this.audio.strumChord(c, 'piano', i * 0.75, false));
    } else if (name === 'vocalBreathPacer') {
      for (let i = 0; i < 14; i++) {
        this.audio.playDrumHit(i < 4 ? 'hihat' : i < 6 ? 'clap' : 'ghost', i * 0.75);
      }
      this.activeNoteLabel.set('Guía Farinelli: Inhala 4 pulsos → Suspende 2 → Exhala "Ssss" 8 pulsos');
    } else if (name === 'vocalSovtSlide') {
      const steps = [60, 62, 64, 65, 67, 65, 64, 62, 60];
      steps.forEach((m, i) => {
        this.audio.playVocalFormant(m, 0.38, i * 0.34, 0.28, 'lip', false);
        this.audio.playAcousticPiano(m, 0.38, i * 0.34, 0.14, false);
      });
      this.activeNoteLabel.set('Calentamiento SOVT (Lip Trill Brrrr): 1-2-3-4-5-4-3-2-1');
    } else if (name === 'vocalOctaveSiren') {
      const steps = [60, 62, 64, 65, 67, 69, 71, 72, 71, 69, 67, 65, 64, 62, 60];
      steps.forEach((m, i) => {
        this.audio.playVocalFormant(m, 0.22, i * 0.18, 0.26, 'u', false);
      });
      this.activeNoteLabel.set('Sirena Vocal de Octava (1 → 8 → 1) para conectar el Passaggio');
    } else if (name === 'vocalFiveDown') {
      const steps = [67, 65, 64, 62, 60];
      const vowels: ('i' | 'e' | 'a' | 'o' | 'u')[] = ['i', 'e', 'a', 'o', 'u'];
      steps.forEach((m, i) => {
        this.audio.playVocalFormant(m, 0.55, i * 0.5, 0.28, vowels[i], false);
        this.audio.playAcousticPiano(m, 0.55, i * 0.5, 0.15, false);
      });
      this.activeNoteLabel.set('Escala Descendente 5-4-3-2-1 igualando vocales (Mi-Me-Ma-Mo-Mu)');
    } else if (name === 'vocalArp1358') {
      const steps = [60, 64, 67, 72, 67, 64, 60];
      steps.forEach((m, i) => {
        this.audio.playVocalFormant(m, 0.42, i * 0.38, 0.28, 'a', false);
        this.audio.playAcousticPiano(m, 0.42, i * 0.38, 0.15, false);
      });
      this.activeNoteLabel.set('Arpegio Bel Canto: 1 - 3 - 5 - 8 - 5 - 3 - 1');
    } else if (name === 'bassFunkDrill') {
      const notes = [28, 40, 31, 33, 34, 35, 38, 40];
      notes.forEach((m, i) => {
        this.audio.playElectricBass(m, 0.32, i * 0.28, 0.4, 'slap', false);
        this.audio.playDrumHit(i % 2 === 0 ? 'kick' : 'snare', i * 0.28);
      });
      this.activeNoteLabel.set('Bajo Eléctrico 4 Cuerdas: Groove Funk con Octavas y Batería');
    } else if (name === 'drumParadiddleDrill') {
      const hits: ('snare' | 'ghost' | 'hihat' | 'kick')[] = [
        'snare', 'ghost', 'hihat', 'hihat',
        'snare', 'ghost', 'kick', 'kick',
      ];
      for (let r = 0; r < 2; r++) {
        hits.forEach((h, i) => this.audio.playDrumHit(h, (r * 8 + i) * 0.19));
      }
      this.activeNoteLabel.set('Batería: Single Paradiddle (R L R R - L R L L)');
    } else if (name === 'guitarTravisDrill') {
      const pattern = [48, 60, 52, 64, 45, 60, 52, 64, 41, 57, 48, 60, 43, 59, 50, 62];
      pattern.forEach((m, i) => this.audio.playPluckedGuitar(m, 0.48, i * 0.24, 0.28, false));
      this.activeNoteLabel.set('Guitarra Acústica: Patrón Travis Picking (C → Am → F → G)');
    } else if (name === 'zamponaArka') {
      [62, 66, 69, 72, 76, 79, 83].forEach((m, i) =>
        this.audio.playQuenaFlute(m, 0.55, i * 0.34, 0.26, false)
      );
      this.activeNoteLabel.set('Zampoña Fila ARKA (7 tubos: D4 – F#4 – A4 – C5 – E5 – G5 – B5)');
    } else if (name === 'zamponaIra') {
      [64, 67, 71, 74, 78, 81].forEach((m, i) =>
        this.audio.playQuenaFlute(m, 0.55, i * 0.34, 0.26, false)
      );
      this.activeNoteLabel.set('Zampoña Fila IRA (6 tubos: E4 – G4 – B4 – D5 – F#5 – A5)');
    }
  }
}
