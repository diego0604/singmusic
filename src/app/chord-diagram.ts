import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  CHORD_DIAGRAM_CATALOG,
  SCALE_GUIDE_CATALOG,
  computeChordNeckState,
  midiToNoteName,
} from './music-games-logic';
import { BASS_STRINGS, GUITAR_STRINGS, MusicAudioEngine, NOTE_LABELS, NOTE_NAMES } from './lab-engine';
import { DiagramModalManager } from './diagram-modal';

@Component({
  selector: 'app-chord-diagram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <article
      #widgetCard
      id="chord-diagram-component"
      class="interactive-widget chord-diagram-card"
      data-lab="chord-diagram-component">
      <div class="widget-header">
        <div>
          <strong class="text-amber-300 text-base sm:text-lg flex items-center gap-1.5">
            <mat-icon class="text-sky-400 !text-[20px] !w-[20px] !h-[20px]">piano</mat-icon>
            <span>Diagrama Interactivo de Acordes y Posición en el Mástil</span>
          </strong>
          <p class="text-xs text-slate-400 m-0">
            Selecciona el acorde y la escala guía: se iluminan exclusivamente los trastes pisados del acorde sin borrar las guías de la escala.
          </p>
        </div>

        <div class="widget-controls">
          <button
            type="button"
            (click)="playSelectedChord()"
            class="btn btn-primary js-chord-play-btn">
            <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">play_arrow</mat-icon>
            <span>Tocar Acorde</span>
          </button>

          <button
            type="button"
            (click)="expandFullscreen()"
            class="btn js-expand-diagram"
            aria-label="Expandir diagrama de acordes a pantalla completa">
            <mat-icon class="!text-[15px] !w-[15px] !h-[15px]">open_in_full</mat-icon>
            <span>Expandir</span>
          </button>

          <button
            type="button"
            (click)="stopAudio()"
            class="btn js-chord-stop-btn"
            style="background:rgba(244,63,94,0.18); color:#fda4af; border:1px solid rgba(244,63,94,0.4);">
            <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">stop</mat-icon>
            <span>Detener</span>
          </button>
        </div>
      </div>

      <!-- Selectors Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3">
        <label class="flex flex-col gap-1 text-xs text-slate-300 font-semibold">
          <span>Tónica (Raíz)</span>
          <select
            class="js-cd-root-select"
            [value]="rootPc()"
            (change)="onRootChange($event)">
            @for (lbl of noteLabels; track $index) {
              <option [value]="$index">{{ lbl }}</option>
            }
          </select>
        </label>

        <label class="flex flex-col gap-1 text-xs text-slate-300 font-semibold">
          <span>Acorde</span>
          <select
            class="js-cd-chord-select"
            [value]="selectedChordId()"
            (change)="onChordChange($event)">
            @for (ch of chordCatalog; track ch.id) {
              <option [value]="ch.id">{{ ch.name }} ({{ ch.formula }})</option>
            }
          </select>
        </label>

        <label class="flex flex-col gap-1 text-xs text-slate-300 font-semibold">
          <span>Guía de Escala en el Mástil</span>
          <select
            class="js-cd-scale-select"
            [value]="selectedScaleId()"
            (change)="onScaleChange($event)">
            @for (sc of scaleCatalog; track sc.id) {
              <option [value]="sc.id">{{ sc.name }}</option>
            }
          </select>
        </label>

        <div class="flex flex-col gap-1 text-xs text-slate-300 font-semibold">
          <span>Instrumento</span>
          <div class="flex gap-1.5 h-[36px]">
            <button
              type="button"
              (click)="setInstrument('guitar')"
              class="flex-1 btn text-xs"
              [class.btn-primary]="instrument() === 'guitar'">
              🎸 Guitarra 6c
            </button>
            <button
              type="button"
              (click)="setInstrument('bass')"
              class="flex-1 btn text-xs"
              [class.btn-primary]="instrument() === 'bass'">
              🎸 Bajo 4c
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Chord Selector Chips -->
      <div class="flex flex-wrap gap-1.5 mb-3" role="group" aria-label="Selector rápido de acordes">
        @for (ch of chordCatalog; track ch.id) {
          <button
            type="button"
            (click)="selectChordPreset(ch.id)"
            [attr.data-chord-id]="ch.id"
            class="px-2.5 py-1 rounded-md text-xs font-bold border transition-colors cursor-pointer"
            [class.bg-amber-500]="selectedChordId() === ch.id"
            [class.text-slate-950]="selectedChordId() === ch.id"
            [class.border-amber-300]="selectedChordId() === ch.id"
            [class.bg-slate-900]="selectedChordId() !== ch.id"
            [class.text-slate-200]="selectedChordId() !== ch.id"
            [class.border-slate-700]="selectedChordId() !== ch.id">
            {{ noteNames[rootPc()] }}{{ ch.symbol }}
          </button>
        }
      </div>

      <!-- Active Chord & Scale Telemetry Summary -->
      <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
        <div class="space-y-0.5">
          <div>
            <strong class="text-amber-300 text-sm mr-2">{{ neckState().chordTitle }} ({{ neckState().chord.name }})</strong>
            <span class="font-mono text-sky-300 font-bold">Notas: {{ neckState().chordNoteNames.join(' – ') }}</span>
            <span class="mx-2 text-slate-600">|</span>
            <span class="font-mono text-emerald-300 font-bold">Posición: {{ neckState().tabSummary }}</span>
            @if (instrument() === 'guitar') {
              <span class="mx-2 text-slate-600">|</span>
              <span class="font-mono text-amber-300 font-bold">
                Dedos Izq: {{ neckState().fingerSummary }}
                @if (neckState().barreFret) {
                  (Cejilla tr.{{ neckState().barreFret }})
                }
              </span>
            }
          </div>
          <div class="text-slate-400">
            Fórmula: {{ neckState().chord.formula }} · {{ neckState().chord.character }} · Escala guía:
            <strong class="text-slate-200">{{ neckState().scaleGuide.name }}</strong>
            @if (instrument() === 'guitar') {
              <span class="ml-2 text-amber-200/90">(1: Índice · 2: Medio · 3: Anular · 4: Meñique · 0: Aire)</span>
            }
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          @if (glowMode() === 'chord') {
            <span class="px-2.5 py-1 rounded-md bg-amber-400/20 border border-amber-400/60 text-amber-200 font-bold">
              🎸 Acorde Iluminado ({{ neckState().chordPositions.length }} trastes)
            </span>
          } @else if (glowMode() === 'note' && singleNoteLabel()) {
            <span class="px-2.5 py-1 rounded-md bg-cyan-400/20 border border-cyan-400/60 text-cyan-200 font-bold">
              🎵 Nota Iluminada: {{ singleNoteLabel() }}
            </span>
          } @else {
            <span class="px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 font-semibold">
              ⏹ Sin resaltado activo
            </span>
          }
        </div>
      </div>

      <!-- Visual Legend -->
      <div class="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 mb-1.5">
        <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-[#f59e0b] inline-block border border-[#fef08a]"></span> Tónica escala</span>
        <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-[#0284c7] inline-block border border-[#7dd3fc]"></span> Guía de escala</span>
        <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-[#10b981] inline-block border border-[#a7f3d0]"></span> Nota característica</span>
        <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-[#fde047] inline-block border-2 border-white"></span> Acorde tocado (Dorado)</span>
        <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-[#22d3ee] inline-block border-2 border-white"></span> Nota suelta tocada (Cian)</span>
      </div>

      <!-- 0-12 Fretboard with Preserved Scale Guides & Exclusive .playing-glow -->
      <div
        #fretboardEl
        class="fretboard-wrapper js-cd-fretboard"
        data-angular-fretboard="true">
        <div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.15); margin-bottom:4px;">
          <div class="string-label" style="color:var(--text-muted); font-size:0.7rem;">Traste</div>
          @for (f of frets; track f) {
            <div class="fret-cell" style="height:20px; border:none; color:var(--text-muted); font-size:0.72rem; font-weight:700;">
              {{ f }}@if (f === 3 || f === 5 || f === 7 || f === 9 || f === 12) {•}
            </div>
          }
        </div>

        @for (st of activeStrings(); track st.label; let sIdx = $index) {
          <div class="fretboard-row">
            <div
              class="string-label"
              [style.color]="instrument() === 'bass' ? '#38bdf8' : '#f59e0b'">
              {{ st.label }}
            </div>
            @for (f of frets; track f) {
              @let cellMidi = st.openMidi + f;
              @let pc = cellMidi % 12;
              @let isRoot = pc === rootPc();
              @let isChar = charPcSet().has(pc);
              @let isScale = scalePcSet().has(pc);
              @let isGlow = isCellGlowing(sIdx, f);
              @let fingerNum = getGuitarFinger(sIdx, f);
              <div
                class="fret-cell js-cd-cell"
                [attr.data-sidx]="sIdx"
                [attr.data-fret]="f"
                [attr.data-midi]="cellMidi">
                <button
                  type="button"
                  (click)="onFretClick(sIdx, f, cellMidi)"
                  [attr.aria-label]="'Cuerda ' + st.label + ', Traste ' + f + ': ' + noteNames[pc] + (fingerNum > 0 ? ', Dedo ' + fingerNum : '')"
                  [title]="'Cuerda ' + st.label + ', Traste ' + f + ': ' + noteNames[pc] + (fingerNum > 0 ? ' (Dedo ' + fingerNum + ')' : '')"
                  class="fret-note p-0 relative"
                  [class.root]="isRoot"
                  [class.char]="!isRoot && isChar"
                  [class.active]="!isRoot && !isChar && isScale"
                  [class.playing-glow]="isGlow"
                  [class.glow-mode-chord]="isGlow && glowMode() === 'chord'"
                  [class.glow-mode-note]="isGlow && glowMode() === 'note'">
                  {{ noteNames[pc] }}
                  @if (fingerNum > 0) {
                    <span class="finger-badge">{{ fingerNum }}</span>
                  }
                </button>
              </div>
            }
          </div>
        }
      </div>
    </article>
  `,
})
export class ChordDiagram implements OnInit {
  private readonly modalManager = inject(DiagramModalManager);
  private readonly destroyRef = inject(DestroyRef);

  readonly audio = input.required<MusicAudioEngine>();

  readonly widgetCard = viewChild<ElementRef<HTMLElement>>('widgetCard');
  readonly fretboardEl = viewChild<ElementRef<HTMLElement>>('fretboardEl');

  readonly noteLabels = NOTE_LABELS;
  readonly noteNames = NOTE_NAMES;
  readonly chordCatalog = CHORD_DIAGRAM_CATALOG;
  readonly scaleCatalog = SCALE_GUIDE_CATALOG;
  readonly frets = Array.from({ length: 13 }, (_, i) => i);

  readonly rootPc = signal<number>(0);
  readonly selectedChordId = signal<string>('maj');
  readonly selectedScaleId = signal<string>('major');
  readonly instrument = signal<'guitar' | 'bass'>('guitar');

  readonly glowMode = signal<'chord' | 'note' | 'idle'>('chord');
  readonly singleNotePos = signal<{ sIdx: number; fret: number; midi: number } | null>(null);

  readonly activeStrings = computed(() =>
    this.instrument() === 'bass' ? BASS_STRINGS : GUITAR_STRINGS
  );

  readonly neckState = computed(() =>
    computeChordNeckState({
      rootPc: this.rootPc(),
      chordId: this.selectedChordId(),
      scaleId: this.selectedScaleId(),
      openMidisHighToLow: this.activeStrings().map((s) => s.openMidi),
      maxFret: 12,
    })
  );

  readonly scalePcSet = computed(() => new Set(this.neckState().scalePitchClasses));
  readonly charPcSet = computed(() => new Set(this.neckState().charPitchClasses));
  readonly chordPosKeySet = computed(
    () => new Set(this.neckState().chordPositions.map((p) => `${p.sIdx}:${p.fret}`))
  );
  readonly guitarFingerMap = computed(() => {
    const map = new Map<string, number>();
    if (this.instrument() !== 'guitar') return map;
    this.neckState().chordFingers.forEach((p) => {
      if (p.finger > 0) map.set(`${p.sIdx}:${p.fret}`, p.finger);
    });
    return map;
  });

  getGuitarFinger(sIdx: number, fret: number): number {
    return this.guitarFingerMap().get(`${sIdx}:${fret}`) || 0;
  }

  readonly singleNoteLabel = computed(() => {
    const pos = this.singleNotePos();
    return pos ? midiToNoteName(pos.midi) : '';
  });

  ngOnInit(): void {
    const unsub = this.audio().onNoteEvent((ev) => {
      if (!ev) {
        this.glowMode.set('idle');
        this.singleNotePos.set(null);
        return;
      }
      if (ev.isChord) {
        this.glowMode.set('chord');
        this.singleNotePos.set(null);
      } else {
        this.glowMode.set('note');
        if (ev.sIdx !== undefined && ev.fret !== undefined) {
          this.singleNotePos.set({
            sIdx: ev.sIdx,
            fret: ev.fret,
            midi: Math.round(ev.midi),
          });
        } else {
          // Match best lower-neck fret for single note played outside
          const targetMidi = Math.round(ev.midi);
          const strs = this.activeStrings();
          let bestSIdx = -1;
          let bestFret = -1;
          let bestScore = 1e9;
          for (let sIdx = 0; sIdx < strs.length; sIdx++) {
            const fret = targetMidi - strs[sIdx].openMidi;
            if (fret >= 0 && fret <= 12) {
              const score = (fret > 5 ? 20 + fret : fret) + sIdx * 0.05;
              if (score < bestScore) {
                bestScore = score;
                bestSIdx = sIdx;
                bestFret = fret;
              }
            }
          }
          this.singleNotePos.set(
            bestSIdx >= 0 ? { sIdx: bestSIdx, fret: bestFret, midi: targetMidi } : null
          );
        }
      }
    });

    this.destroyRef.onDestroy(() => unsub());
  }

  private latchSelectedChordVisual(): void {
    this.glowMode.set('chord');
    this.singleNotePos.set(null);
    this.audio().emitChordHighlight(
      this.neckState().chordMidis,
      this.fretboardEl()?.nativeElement
    );
  }

  isCellGlowing(sIdx: number, fret: number): boolean {
    const mode = this.glowMode();
    if (mode === 'chord') {
      return this.chordPosKeySet().has(`${sIdx}:${fret}`);
    }
    if (mode === 'note') {
      const sn = this.singleNotePos();
      return !!sn && sn.sIdx === sIdx && sn.fret === fret;
    }
    return false;
  }

  onRootChange(event: Event): void {
    const val = parseInt((event.target as HTMLSelectElement).value, 10);
    if (!Number.isNaN(val)) {
      this.rootPc.set(val);
      this.latchSelectedChordVisual();
    }
  }

  onChordChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedChordId.set(val);
    this.latchSelectedChordVisual();
  }

  selectChordPreset(chordId: string): void {
    this.selectedChordId.set(chordId);
    this.playSelectedChord();
  }

  onScaleChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedScaleId.set(val);
  }

  setInstrument(inst: 'guitar' | 'bass'): void {
    this.instrument.set(inst);
    this.latchSelectedChordVisual();
  }

  playSelectedChord(): void {
    this.glowMode.set('chord');
    this.singleNotePos.set(null);
    const st = this.neckState();
    try {
      this.audio().strumChord(st.chordMidis, this.instrument(), 0, true);
    } catch {
      this.audio().emitChordHighlight(st.chordMidis, this.fretboardEl()?.nativeElement);
    }
  }

  onFretClick(sIdx: number, fret: number, midi: number): void {
    this.glowMode.set('note');
    this.singleNotePos.set({ sIdx, fret, midi });
    const hint = { sIdx, fret, scopeEl: this.fretboardEl()?.nativeElement };
    try {
      if (this.instrument() === 'bass') {
        this.audio().playElectricBass(midi, 1.35, 0, 0.38, 'finger', true, hint);
      } else {
        this.audio().playPluckedGuitar(midi, 1.5, 0, 0.32, true, hint);
      }
    } catch {
      this.audio().emitNoteHighlight(midi, hint);
    }
  }

  stopAudio(): void {
    this.audio().stopAll();
    this.glowMode.set('idle');
    this.singleNotePos.set(null);
  }

  expandFullscreen(): void {
    const el = this.widgetCard()?.nativeElement;
    if (el) {
      this.modalManager.open(el, `Diagrama de Acordes: ${this.neckState().chordTitle}`);
    }
  }
}
