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

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [ChordDiagram],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly modalManager = inject(DiagramModalManager);
  readonly audio = new MusicAudioEngine();

  readonly contentHost = viewChild<ElementRef<HTMLElement>>('contentHost');

  readonly categories: CategoryPart[] = [
    { id: 'teoria', label: '1. Teoría y Acústica', count: 11 },
    { id: 'armonia', label: '2. Armonía Práctica', count: 17 },
    { id: 'composicion', label: '3. Composición y Letras', count: 9 },
    { id: 'guitarra-ac', label: '4. Guitarra Acústica', count: 7 },
    { id: 'guitarra-el', label: '5. Guitarra Eléctrica', count: 6 },
    { id: 'bajo', label: '6. Bajo Eléctrico (4 Cuerdas)', count: 6 },
    { id: 'bateria', label: '7. Batería y Percusión', count: 6 },
    { id: 'canto', label: '8. Canto y Calentamiento Vocal', count: 6 },
    { id: 'folclore', label: '9. Vientos Andinos y Folclore', count: 4 },
    { id: 'arreglos', label: '10. Arreglos y Orquestación', count: 4 },
    { id: 'produccion', label: '11. Producción y Proyectos', count: 3 },
    { id: 'all', label: '📚 Toda la Enciclopedia Completa', count: 79 },
  ];

  readonly activeCat = signal<CategoryPart>(this.categories[0]);
  readonly safeContent = signal<SafeHtml>('');
  readonly loading = signal<boolean>(false);
  readonly sections = signal<SectionAnchor[]>([]);
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly activeNoteLabel = signal<string>(
    'Motor de Síntesis Activo (Guitarra / Bajo / Piano / Voz / Vientos Andinos / Batería)'
  );
  readonly currentInstrument = signal<'guitar' | 'piano' | 'bass'>('guitar');
  readonly visualInstrumentFocus = signal<VisualInstrumentFocus>('all');

  // Global Level Filter ('1' = Novato, '2' = Intermedio, '4' = Completo)
  readonly activeLevelFilter = signal<'1' | '2' | '4'>('4');
  readonly hiddenBlocksCount = signal<number>(0);

  readonly filteredSections = computed<SectionAnchor[]>(() => {
    const all = this.sections();
    const maxLvl = parseInt(this.activeLevelFilter(), 10);
    if (maxLvl >= 4) return all;
    const filtered = all.filter((sec) => this.parseMinNivel(sec.nivel) <= maxLvl);
    return filtered.length > 0 ? filtered : all.slice(0, 1);
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

  // Guided Learning Paths & Completion Tracking & Chord Diagram Studio
  readonly showChordDiagram = signal<boolean>(false);
  readonly showPaths = signal<boolean>(false);
  readonly selectedPathId = signal<string>('cero-a-musico');
  readonly activeSectionId = signal<string>('intro');
  readonly completedSections = signal<string[]>([]);

  readonly learningPaths: LearningPathTrack[] = [
    {
      id: 'cero-a-musico',
      title: '🌱 De Cero a Músico Completo',
      subtitle: 'Empieza sin conocimientos previos: sonido, notas, alteraciones, intervalos, escalas, tríadas y ritmo.',
      steps: [
        { catId: 'teoria', sectionId: 'intro', title: 'Mapa de Navegación y Cómo Estudiar', badge: 'N1' },
        { catId: 'teoria', sectionId: 't-sonido', title: 'El Sonido y la Acústica Musical', badge: 'N1' },
        { catId: 'teoria', sectionId: 't-notas', title: 'Notas, Alteraciones, Enarmonía y Reloj Cromático', badge: 'N1' },
        { catId: 'teoria', sectionId: 't-intervalos', title: 'Intervalos: La Geometría de la Música', badge: 'N1–N2' },
        { catId: 'teoria', sectionId: 't-escalas', title: 'Escalas Mayores, Menores y Pentatónicas', badge: 'N1–N2' },
        { catId: 'teoria', sectionId: 't-ritmo', title: 'Ritmo, Compases y Métricas Irregulares', badge: 'N1–N3' },
        { catId: 'teoria', sectionId: 't-lectura', title: 'Lectura Musical, Claves y Escritura de Banda', badge: 'N1–N3' },
        { catId: 'armonia', sectionId: 'h-triadas', title: 'Tríadas: Los Cuatro Ladrillos Armónicos', badge: 'N1' },
      ],
    },
    {
      id: 'guitarra',
      title: '🎸 Guitarra Rítmica, Rasgueos y Armónica',
      subtitle: 'Acordes abiertos, patrones de rasgueo con púa/mano, fingerstyle y escalas por todo el mástil.',
      steps: [
        { catId: 'teoria', sectionId: 't-notas', title: 'Notas, Alteraciones y Reloj Cromático', badge: 'N1' },
        { catId: 'guitarra-ac', sectionId: 'ga-acordes', title: 'Vocabulario de Acordes y Cejillas', badge: 'N1–N2' },
        { catId: 'guitarra-ac', sectionId: 'ga-rasgueos', title: 'Rasgueos, Púa y Patrones Rítmicos', badge: 'N1–N2' },
        { catId: 'guitarra-ac', sectionId: 'ga-ritmo-fingerstyle', title: 'Ritmo, Arpegios y Fingerstyle', badge: 'N2–N3' },
        { catId: 'armonia', sectionId: 'h-diatonica', title: 'Armonía Diatónica y Funciones Tonales', badge: 'N2' },
        { catId: 'guitarra-el', sectionId: 'ge-escalas-modos', title: 'Escalas, Modos y Tríadas en el Mástil', badge: 'N2–N3' },
        { catId: 'guitarra-el', sectionId: 'ge-tecnicas', title: 'Articulación y Técnicas Expresivas', badge: 'N2–N4' },
      ],
    },
    {
      id: 'bajo',
      title: '🎸 Bajista y Lock-In con Batería',
      subtitle: 'Fundamentos en 4/5 cuerdas, muteo profesional, enlace bajo-bombo y recursos expresivos.',
      steps: [
        { catId: 'teoria', sectionId: 't-notas', title: 'Notas y Enarmonía en el Mástil', badge: 'N1' },
        { catId: 'teoria', sectionId: 't-ritmo', title: 'Subdivisión Rítmica y Síncopa', badge: 'N1–N2' },
        { catId: 'bajo', sectionId: 'b-fundamentos', title: 'Fundamentos del Bajo Eléctrico', badge: 'N1' },
        { catId: 'bajo', sectionId: 'b-mutear-articulacion', title: 'Floating Thumb, Muteo y Slap', badge: 'N2–N3' },
        { catId: 'bajo', sectionId: 'b-bajo-bateria', title: 'Lock-In Bajo + Bombo y Recursos Expresivos', badge: 'N2–N3' },
        { catId: 'bajo', sectionId: 'b-armonia', title: 'Tríadas, Arpegios y Walking Bass', badge: 'N2–N3' },
      ],
    },
    {
      id: 'bateria',
      title: '🥁 Batería, Notación PAS y Tempo Interno',
      subtitle: 'Rudimentos, lectura de pentagrama sincronizada, Gap Click y técnicas del kit.',
      steps: [
        { catId: 'teoria', sectionId: 't-ritmo', title: 'Pulso, Compases y Síncopa', badge: 'N1' },
        { catId: 'bateria', sectionId: 'd-fundamentos', title: 'Rudimentos, Agarre y Ghost Notes', badge: 'N1–N2' },
        { catId: 'bateria', sectionId: 'd-grooves', title: 'Grooves Esenciales y Pentagrama PAS', badge: 'N1–N3' },
        { catId: 'bateria', sectionId: 'd-fills-transiciones', title: 'Fills, Transiciones y Gap Click', badge: 'N2–N3' },
        { catId: 'bateria', sectionId: 'd-independencia', title: 'Independencia de 4 Extremidades', badge: 'N3–N4' },
      ],
    },
    {
      id: 'canto-arreglo',
      title: '🎤 Canto, Melismas y Arreglo a Voces',
      subtitle: 'Calentamiento SOVT, apoyo, agilidad vocal, modificación de vocales y armonización a 2–4 voces.',
      steps: [
        { catId: 'canto', sectionId: 'v-calentamiento', title: 'Rutina Diaria SOVT y Cuidado Vocal', badge: 'N1' },
        { catId: 'canto', sectionId: 'v-fundamentos', title: 'Respiración Costo-Diafragmática y Apoyo', badge: 'N1–N2' },
        { catId: 'canto', sectionId: 'v-afinacion-registros', title: 'Registros, Passaggio y Modificación Vocal', badge: 'N2–N3' },
        { catId: 'canto', sectionId: 'v-interpretacion-estilos', title: 'Gimnasio de Agilidad, Riffs y Melismas', badge: 'N2–N3' },
        { catId: 'teoria', sectionId: 't-lectura', title: 'Escritura Práctica y Arreglo a 2–4 Voces', badge: 'N2–N3' },
        { catId: 'arreglos', sectionId: 'a-integracion', title: 'Orquestación e Integración de Banda', badge: 'N3–N4' },
      ],
    },
  ];

  readonly activeLearningPath = computed<LearningPathTrack>(() => {
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
      } catch {
        // Ignore storage read errors in restricted iframes
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
      const rawHtml = ENCYCLOPEDIA_CONTENT[cat.id] || '';
      const html = injectTreatiseEnrichmentIntoCategoryHtml(cat.id, rawHtml);
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

  toggleChordDiagram(): void {
    this.showChordDiagram.update((v) => {
      const next = !v;
      if (next) {
        this.showGlossary.set(false);
        this.showPaths.set(false);
      }
      return next;
    });
  }

  toggleGlossary(): void {
    this.showGlossary.update((v) => {
      const next = !v;
      if (next) this.showPaths.set(false);
      return next;
    });
  }

  togglePaths(): void {
    this.showPaths.update((v) => {
      const next = !v;
      if (next) this.showGlossary.set(false);
      return next;
    });
  }

  selectLearningPath(pathId: string): void {
    this.selectedPathId.set(pathId);
  }

  setLevelFilter(level: '1' | '2' | '4'): void {
    this.activeLevelFilter.set(level);
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.applyLevelDomFilter(), 10);
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

  jumpToPathStep(step: LearningPathStep): void {
    this.showPaths.set(false);
    this.mobileMenuOpen.set(false);
    const targetCat = this.categories.find((c) => c.id === step.catId);
    if (!targetCat) return;
    this.activeSectionId.set(step.sectionId);
    if (this.activeCat().id !== targetCat.id) {
      this.loadCategory(targetCat);
      setTimeout(() => this.scrollToSection(step.sectionId), 140);
    } else {
      this.scrollToSection(step.sectionId);
    }
  }

  jumpToSearchResult(item: GlobalSearchIndexItem): void {
    const targetCat = this.categories.find((c) => c.id === item.catId);
    if (!targetCat) return;
    this.searchQuery.set('');
    this.mobileMenuOpen.set(false);
    this.activeSectionId.set(item.sectionId);
    if (this.activeCat().id !== targetCat.id) {
      this.loadCategory(targetCat);
      setTimeout(() => this.scrollToSection(item.sectionId), 120);
    } else {
      this.scrollToSection(item.sectionId);
    }
  }

  jumpFromGlossary(entry: GlossaryEntry): void {
    this.showGlossary.set(false);
    this.mobileMenuOpen.set(false);
    this.activeSectionId.set(entry.sectionId);
    this.jumpToCrossSection(entry.sectionId);
  }

  playGlossaryDemo(demoName: string): void {
    this.runDemo(demoName);
  }

  loadCategory(cat: CategoryPart): void {
    this.modalManager.close();
    this.audio.stopAll();
    this.activeCat.set(cat);
    this.mobileMenuOpen.set(false);
    if (cat.id === 'bajo' || this.visualInstrumentFocus() === 'bass-only') {
      this.currentInstrument.set('bass');
    } else if (this.visualInstrumentFocus() === 'guitar-only' || this.currentInstrument() === 'bass') {
      this.currentInstrument.set('guitar');
    }

    const baseHtml =
      cat.id === 'all'
        ? Object.values(ENCYCLOPEDIA_CONTENT).join('\n')
        : ENCYCLOPEDIA_CONTENT[cat.id] || '<p>Módulo no encontrado.</p>';

    const withTreatiseEnrichment = injectTreatiseEnrichmentIntoCategoryHtml(cat.id, baseHtml);
    const withSectionGames = injectSectionGamesIntoCategoryHtml(cat.id, withTreatiseEnrichment);
    const expandedHtml = replaceLegacyMarkers(withSectionGames);
    this.extractSections(expandedHtml);
    this.safeContent.set(this.sanitizer.bypassSecurityTrustHtml(expandedHtml));

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          this.applyLevelDomFilter();
        }
      }, 20);
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
      'section.module-section[data-nivel], .callout-box[data-nivel], details[data-nivel], article[data-nivel]'
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
        <button type="button" class="btn js-unlock-block" style="background:rgba(245,158,11,0.18); color:#fde047; border:1px solid rgba(245,158,11,0.45);">
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

  private extractSections(html: string): void {
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
      this.activeSectionId.set(list[0].id);
    }
  }

  scrollToSection(id: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.mobileMenuOpen.set(false);
    this.activeSectionId.set(id);
    const el = document.getElementById(id);
    if (el) {
      if (el.classList.contains('level-locked-hidden')) {
        el.setAttribute('data-user-unlocked', '1');
        this.applyLevelDomFilter();
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  handleContentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

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
    const prefixMap: Record<string, string> = {
      'intro': 'teoria',
      't-': 'teoria',
      'h-': 'armonia',
      'c-': 'composicion',
      'ga-': 'guitarra-ac',
      'ge-': 'guitarra-el',
      'b-': 'bajo',
      'd-': 'bateria',
      'v-': 'canto',
      'f-': 'folclore',
      'a-': 'arreglos',
      'p-': 'produccion',
      'pr-': 'produccion',
    };
    let foundCatId = '';
    for (const [prefix, catId] of Object.entries(prefixMap)) {
      if (sectionId === prefix || sectionId.startsWith(prefix)) {
        foundCatId = catId;
        break;
      }
    }
    const targetCat = this.categories.find((c) => c.id === foundCatId);
    if (targetCat) {
      this.loadCategory(targetCat);
      setTimeout(() => this.scrollToSection(sectionId), 120);
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

    if (name === 'demoOctaves') {
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
