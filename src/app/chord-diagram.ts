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
  NeckZoneMode,
  SCALE_GUIDE_CATALOG,
  computeChordNeckState,
  computeGuitarNeckWindow,
  computeVerticalChordBoxData,
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
            Acércate por zona del mástil (0–5, 4–9, 7–12 o 0–12), alterna Notas vs Dedos (1–4) y compara el mástil horizontal con la caja vertical.
          </p>
        </div>

        <div class="widget-controls">
          <button
            type="button"
            (click)="playSelectedChord()"
            class="btn btn-primary js-chord-play-btn min-h-[38px]">
            <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">play_arrow</mat-icon>
            <span>Tocar Acorde</span>
          </button>

          <button
            type="button"
            (click)="expandFullscreen()"
            class="btn js-expand-diagram min-h-[38px]"
            aria-label="Expandir diagrama de acordes a pantalla completa">
            <mat-icon class="!text-[15px] !w-[15px] !h-[15px]">open_in_full</mat-icon>
            <span>Expandir</span>
          </button>

          <button
            type="button"
            (click)="stopAudio()"
            class="btn js-chord-stop-btn min-h-[38px]"
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
          <div class="flex gap-1.5 min-h-[38px]">
            <button
              type="button"
              (click)="setInstrument('guitar')"
              class="flex-1 btn text-xs whitespace-nowrap"
              [class.btn-primary]="instrument() === 'guitar'">
              🎸 Guitarra 6c
            </button>
            <button
              type="button"
              (click)="setInstrument('bass')"
              class="flex-1 btn text-xs whitespace-nowrap"
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
            class="min-h-[34px] px-2.5 py-1 rounded-md text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap"
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

      <!-- Active Chord & Scale Readout -->
      <div class="p-3 rounded-xl bg-slate-950/75 border border-slate-800 flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
        <div class="space-y-0.5 min-w-0">
          <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <strong class="text-amber-300 text-sm">{{ neckState().chordTitle }} ({{ neckState().chord.name }})</strong>
            <span class="font-mono text-sky-300 font-bold">Notas: {{ neckState().chordNoteNames.join(' – ') }}</span>
            <span class="font-mono text-emerald-300 font-bold tabular-nums">Trastes: {{ neckState().tabSummary }}</span>
            @if (instrument() === 'guitar') {
              <span class="font-mono text-amber-300 font-bold tabular-nums">
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
              <span class="ml-1.5 text-amber-200/90">· 1 Índice · 2 Medio · 3 Anular · 4 Meñique · 0 Aire · ✕ Muda</span>
            }
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          @if (glowMode() === 'chord') {
            <span class="px-2.5 py-1 rounded-md bg-amber-400/20 border border-amber-400/60 text-amber-200 font-bold whitespace-nowrap">
              🎸 Acorde Activo ({{ neckState().chordPositions.length }} notas)
            </span>
          } @else if (glowMode() === 'note' && singleNoteLabel()) {
            <span class="px-2.5 py-1 rounded-md bg-cyan-400/20 border border-cyan-400/60 text-cyan-200 font-bold whitespace-nowrap">
              🎵 Nota: {{ singleNoteLabel() }}
            </span>
          } @else {
            <span class="px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 font-semibold whitespace-nowrap">
              ⏹ Sin resaltado activo
            </span>
          }
        </div>
      </div>

      <!-- Ergonomic Fret-Zone Zoom & Fingering Readout Bar -->
      <div class="guitar-ux-toolbar">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-[11px] font-bold text-slate-400 mr-1">Zoom del Mástil:</span>
          <div class="guitar-seg-group" role="group" aria-label="Zoom por zona de trastes">
            <button
              type="button"
              (click)="setNeckZone('auto')"
              class="guitar-seg-btn js-cd-zone-btn"
              [class.active]="neckZone() === 'auto'">
              Auto ({{ neckWindow().minFret }}–{{ neckWindow().maxFret }})
            </button>
            <button
              type="button"
              (click)="setNeckZone('open')"
              class="guitar-seg-btn js-cd-zone-btn"
              [class.active]="neckZone() === 'open'">
              0–5
            </button>
            <button
              type="button"
              (click)="setNeckZone('mid')"
              class="guitar-seg-btn js-cd-zone-btn"
              [class.active]="neckZone() === 'mid'">
              4–9
            </button>
            <button
              type="button"
              (click)="setNeckZone('high')"
              class="guitar-seg-btn js-cd-zone-btn"
              [class.active]="neckZone() === 'high'">
              7–12
            </button>
            <button
              type="button"
              (click)="setNeckZone('all')"
              class="guitar-seg-btn js-cd-zone-btn"
              [class.active]="neckZone() === 'all'">
              0–12 Completo
            </button>
          </div>
        </div>

        @if (instrument() === 'guitar') {
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-[11px] font-bold text-slate-400 mr-1">Ver en Trastes:</span>
            <div class="guitar-seg-group" role="group" aria-label="Modo de visualización de dedos o notas">
              <button
                type="button"
                (click)="setFingerPriority(false)"
                class="guitar-seg-btn js-cd-disp-notes"
                [class.active]="!fingerPriority()">
                Notas + Dedos
              </button>
              <button
                type="button"
                (click)="setFingerPriority(true)"
                class="guitar-seg-btn js-cd-disp-fingers"
                [class.active]="fingerPriority()">
                🖐️ Dedos Grandes (1–4)
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Visual Legend -->
      <div class="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 mt-2 mb-1">
        <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-[#f59e0b] inline-block border border-[#fef08a]"></span> Tónica</span>
        <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-[#0284c7] inline-block border border-[#7dd3fc]"></span> Escala guía</span>
        <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-[#10b981] inline-block border border-[#a7f3d0]"></span> Nota característica</span>
        <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-[#fde047] inline-block border-2 border-white"></span> Acorde tocado</span>
        <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-[#22d3ee] inline-block border-2 border-white"></span> Nota suelta</span>
      </div>

      <!-- 2-Zone Stage: Ergonomic Horizontal Neck + Vertical Chord Grip SVG (Guitar) -->
      <div [class]="instrument() === 'guitar' ? 'guitar-stage-grid' : ''">
        <div
          #fretboardEl
          class="fretboard-wrapper js-cd-fretboard"
          [class.neck-zoomed]="isZoomedWindow()"
          [class.finger-priority]="fingerPriority() && instrument() === 'guitar'"
          data-angular-fretboard="true">
          <div class="fretboard-row">
            <div class="string-label" style="color:var(--text-muted); font-size:0.7rem;">Traste</div>
            @for (f of visibleFrets(); track f) {
              <div class="fret-cell" [attr.data-fret]="f" style="height:24px; border:none; color:var(--text-muted); font-size:0.72rem; font-weight:800; cursor:default;">
                {{ f }}@if (f === 3 || f === 5 || f === 7 || f === 9 || f === 12) {•}
              </div>
            }
          </div>

          @for (st of activeStrings(); track st.label; let sIdx = $index) {
            @let isStringMuted = instrument() === 'guitar' && !soundedStringSet().has(sIdx);
            <div class="fretboard-row">
              <div
                class="string-label"
                [style.color]="instrument() === 'bass' ? '#38bdf8' : isStringMuted ? '#64748b' : '#f59e0b'">
                <span>{{ st.label }}</span>
                @if (isStringMuted) {
                  <span class="string-mute-tag" title="Cuerda silenciada (X)">✕</span>
                }
              </div>
              @for (f of visibleFrets(); track f) {
                @let cellMidi = st.openMidi + f;
                @let pc = cellMidi % 12;
                @let isRoot = pc === rootPc();
                @let isChar = charPcSet().has(pc);
                @let isScale = scalePcSet().has(pc);
                @let isGlow = isCellGlowing(sIdx, f);
                @let fingerNum = getGuitarFinger(sIdx, f);
                @let showFingerMain = fingerPriority() && instrument() === 'guitar' && fingerNum > 0 && f > 0;
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
                    [class.has-finger]="fingerNum > 0 && f > 0"
                    [class.playing-glow]="isGlow"
                    [class.glow-mode-chord]="isGlow && glowMode() === 'chord'"
                    [class.glow-mode-note]="isGlow && glowMode() === 'note'">
                    {{ showFingerMain ? fingerNum : noteNames[pc] }}
                    @if (fingerNum > 0 && f > 0) {
                      <span
                        class="finger-badge"
                        [class.is-note-corner]="showFingerMain">{{ showFingerMain ? noteNames[pc] : fingerNum }}</span>
                    }
                  </button>
                </div>
              }
            </div>
          }
        </div>

        @if (instrument() === 'guitar') {
          <aside class="vertical-chord-card" aria-label="Diagrama vertical de acorde">
            <svg viewBox="0 0 188 198" class="vertical-chord-svg" role="img" [attr.aria-label]="'Acorde ' + neckState().chordTitle">
              <text x="94" y="15" text-anchor="middle" fill="#fbbf24" font-size="12" font-weight="800">{{ neckState().chordTitle }}</text>
              @if (verticalBox().showNut) {
                <line x1="32" y1="38" x2="160" y2="38" stroke="#f8fafc" stroke-width="4.2" stroke-linecap="round" />
              } @else {
                <line x1="32" y1="38" x2="160" y2="38" stroke="#64748b" stroke-width="1.6" />
                <text x="25" [attr.y]="38 + verticalFretGap() * 0.64" text-anchor="end" fill="#fbbf24" font-size="11" font-weight="900">{{ verticalBox().startFret }}fr</text>
              }

              @for (rowY of verticalFretLines(); track rowY) {
                <line x1="32" [attr.y1]="rowY" x2="160" [attr.y2]="rowY" stroke="#334155" stroke-width="1.3" />
              }

              @if (verticalBarreRect(); as b) {
                <rect
                  [attr.x]="b.x"
                  [attr.y]="b.y"
                  [attr.width]="b.width"
                  height="18"
                  rx="9"
                  fill="rgba(245,158,11,0.34)"
                  stroke="#fbbf24"
                  stroke-width="1.4" />
              }

              @for (item of verticalStringItems(); track item.lowToHighIdx) {
                <line
                  [attr.x1]="item.x"
                  y1="38"
                  [attr.x2]="item.x"
                  y2="162"
                  stroke="#94a3b8"
                  [attr.stroke-width]="item.strokeW" />
                <text
                  [attr.x]="item.x"
                  y="177"
                  text-anchor="middle"
                  [attr.fill]="item.isMuted ? '#475569' : '#cbd5e1'"
                  font-size="10"
                  font-weight="800">{{ item.label }}</text>

                @if (item.isMuted) {
                  <text [attr.x]="item.x" y="30" text-anchor="middle" fill="#fb7185" font-size="12" font-weight="900">✕</text>
                } @else if (item.isOpen) {
                  <circle
                    [attr.cx]="item.x"
                    cy="27"
                    r="5.5"
                    (click)="onFretClick(item.sIdx, 0, item.midi)"
                    class="cursor-pointer"
                    [attr.fill]="item.isRoot ? '#f59e0b' : 'none'"
                    [attr.stroke]="item.isRoot ? '#fef08a' : '#38bdf8'"
                    stroke-width="2" />
                } @else if (item.cy > 0) {
                  <circle
                    [attr.cx]="item.x"
                    [attr.cy]="item.cy"
                    r="10.2"
                    (click)="onFretClick(item.sIdx, item.fret, item.midi)"
                    class="cursor-pointer"
                    [attr.fill]="item.isRoot ? '#f59e0b' : '#0284c7'"
                    [attr.stroke]="item.isRoot ? '#fef08a' : '#7dd3fc'"
                    stroke-width="1.8" />
                  <text
                    [attr.x]="item.x"
                    [attr.y]="item.cy + 3.8"
                    text-anchor="middle"
                    pointer-events="none"
                    [attr.fill]="item.isRoot ? '#090c12' : '#ffffff'"
                    font-size="10.5"
                    font-weight="900">{{ item.finger > 0 ? item.finger : item.noteName }}</text>
                  @if (item.finger > 0) {
                    <text [attr.x]="item.x" y="189" text-anchor="middle" fill="#94a3b8" font-size="8.2" font-weight="700">{{ item.noteName }}</text>
                  }
                }
              }
            </svg>
            <div class="vertical-chord-meta">
              <span>Trastes: <strong>{{ verticalBox().tabSummary }}</strong></span>
              <span>Dedos: <strong>{{ verticalBox().fingerSummary }}</strong></span>
            </div>
          </aside>
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

  readonly rootPc = signal<number>(0);
  readonly selectedChordId = signal<string>('maj');
  readonly selectedScaleId = signal<string>('major');
  readonly instrument = signal<'guitar' | 'bass'>('guitar');
  readonly neckZone = signal<NeckZoneMode>('auto');
  readonly fingerPriority = signal<boolean>(false);

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

  readonly neckWindow = computed(() => {
    const activeFrets = this.neckState().chordPositions.map((p) => p.fret);
    return computeGuitarNeckWindow(activeFrets, this.neckZone(), 12);
  });

  readonly visibleFrets = computed(() => {
    const win = this.neckWindow();
    const list: number[] = [];
    for (let f = win.minFret; f <= win.maxFret; f++) {
      list.push(f);
    }
    return list;
  });

  readonly isZoomedWindow = computed(() => this.visibleFrets().length <= 7);

  readonly soundedStringSet = computed(() => new Set(this.neckState().chordPositions.map((p) => p.sIdx)));
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

  readonly verticalBox = computed(() => {
    const st = this.neckState();
    const pos = st.chordFingers.map((p) => ({
      sIdx: p.sIdx,
      fret: p.fret,
      finger: p.finger,
    }));
    return computeVerticalChordBoxData({
      positions: pos,
      rootPc: this.rootPc(),
      openMidisHighToLow: GUITAR_STRINGS.map((s) => s.openMidi),
    });
  });

  readonly verticalFretGap = computed(() => 124 / this.verticalBox().fretCount);

  readonly verticalFretLines = computed(() => {
    const gap = this.verticalFretGap();
    const count = this.verticalBox().fretCount;
    const ys: number[] = [];
    for (let r = 1; r <= count; r++) {
      ys.push(38 + r * gap);
    }
    return ys;
  });

  readonly verticalBarreRect = computed(() => {
    const b = this.verticalBox().barre;
    if (!b) return null;
    const strGap = 128 / 5;
    const fretGap = this.verticalFretGap();
    const x1 = 32 + b.fromLowIdx * strGap;
    const x2 = 32 + b.toLowIdx * strGap;
    const cy = 38 + (b.relRow - 0.5) * fretGap;
    return { x: x1 - 9, y: cy - 9, width: x2 - x1 + 18 };
  });

  readonly verticalStringItems = computed(() => {
    const box = this.verticalBox();
    const strGap = 128 / 5;
    const fretGap = this.verticalFretGap();
    return box.strings.map((st) => ({
      ...st,
      x: 32 + st.lowToHighIdx * strGap,
      strokeW: (2.1 - st.lowToHighIdx * 0.2).toFixed(2),
      cy: st.relRow >= 1 && st.relRow <= box.fretCount ? 38 + (st.relRow - 0.5) * fretGap : -1,
    }));
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

  setNeckZone(zone: NeckZoneMode): void {
    this.neckZone.set(zone);
  }

  setFingerPriority(prio: boolean): void {
    this.fingerPriority.set(prio);
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
