import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
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
import {
  SECTION_GAMES_SEARCH_META,
  hydrateInteractiveArcade,
  injectSectionGamesIntoCategoryHtml,
} from './interactive-arcade';
import {
  TREATISE_ENRICHMENT_SEARCH_META,
  hydrateTreatiseEnrichment,
  injectTreatiseEnrichmentIntoCategoryHtml,
} from './treatise-enrichment';

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

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly audio = new MusicAudioEngine();

  readonly contentHost = viewChild<ElementRef<HTMLElement>>('contentHost');

  readonly categories: CategoryPart[] = [
    { id: 'teoria', label: '1. Teoría y Acústica', count: 10 },
    { id: 'armonia', label: '2. Armonía Práctica', count: 14 },
    { id: 'composicion', label: '3. Composición y Letras', count: 9 },
    { id: 'guitarra-ac', label: '4. Guitarra Acústica', count: 6 },
    { id: 'guitarra-el', label: '5. Guitarra Eléctrica', count: 6 },
    { id: 'bajo', label: '6. Bajo Eléctrico (4 Cuerdas)', count: 6 },
    { id: 'bateria', label: '7. Batería y Percusión', count: 6 },
    { id: 'canto', label: '8. Canto y Calentamiento Vocal', count: 6 },
    { id: 'folclore', label: '9. Vientos Andinos y Folclore', count: 4 },
    { id: 'arreglos', label: '10. Arreglos y Orquestación', count: 4 },
    { id: 'produccion', label: '11. Producción y Proyectos', count: 3 },
    { id: 'all', label: '📚 Toda la Enciclopedia Completa', count: 74 },
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
    this.buildGlobalSearchIndex();
    this.loadCategory(this.categories[0]);
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

  toggleGlossary(): void {
    this.showGlossary.update((v) => !v);
  }

  jumpToSearchResult(item: GlobalSearchIndexItem): void {
    const targetCat = this.categories.find((c) => c.id === item.catId);
    if (!targetCat) return;
    this.searchQuery.set('');
    this.mobileMenuOpen.set(false);
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
    this.jumpToCrossSection(entry.sectionId);
  }

  playGlossaryDemo(demoName: string): void {
    this.runDemo(demoName);
  }

  loadCategory(cat: CategoryPart): void {
    this.audio.stopAll();
    this.activeCat.set(cat);
    this.mobileMenuOpen.set(false);
    if (cat.id === 'bajo') {
      this.currentInstrument.set('bass');
    } else if (this.currentInstrument() === 'bass') {
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
          hydrateAllLabs(hostEl, this.audio, (msg) => this.activeNoteLabel.set(msg));
          hydrateInteractiveArcade(hostEl, this.audio, (msg) => this.activeNoteLabel.set(msg));
          hydrateTreatiseEnrichment(hostEl, this.audio, (msg) => this.activeNoteLabel.set(msg));
        }
      }, 20);
    }
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
  }

  scrollToSection(id: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.mobileMenuOpen.set(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  handleContentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const btn = target.closest('button.btn-audio') as HTMLElement | null;
    if (btn && !btn.classList.contains('js-h-single')) {
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
    if (this.activeCat().id === 'bajo' || this.currentInstrument() === 'bass') {
      this.audio.playElectricBass(midi, duration, delay, 0.38, 'finger', false);
    } else if (this.activeCat().id === 'canto') {
      this.audio.playAcousticPiano(midi, duration, delay, 0.18, false);
      this.audio.playVocalFormant(midi, duration, delay, 0.25, 'a', false);
    } else if (this.activeCat().id === 'folclore') {
      this.audio.playQuenaFlute(midi, duration, delay, 0.26, false);
    } else if (this.currentInstrument() === 'guitar') {
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
