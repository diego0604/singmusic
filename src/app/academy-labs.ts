import {
  MAJOR_SCALE_LADDER_PRESETS,
  RHYTHM_STARTER_PATTERNS,
  resolveKeySignatureFiveSecondRule,
  type MajorScaleLadderPreset,
  type RhythmStarterPattern,
} from './academy-curriculum';
import { getVisualInstrumentFocus } from './music-games-logic';
import {
  FUNDAMENTALS_GUIDED_LESSONS,
  FUNDAMENTALS_PIANO_KEYS,
  evaluateFundamentalsKeyTap,
  getPianoKeySpec,
  pickNextEarDrillMidi,
  renderTrebleStaffNoteSvg,
  type GuidedFundamentalsLesson,
  type GuidedFundamentalsStep,
} from './fundamentals-guided-logic';
import { buildStage3DataLabStage } from './academy-labs-stage3';
import { buildStage4DataLabStage } from './academy-labs-stage4';

export interface AcademyLabAudio {
  stopAll: () => void;
  onStop: (cb: () => void) => () => void;
  ensureContext?: () => AudioContext;
  midiToFreq?: (midi: number) => number;
  playAcousticPiano: (midi: number, duration?: number, delay?: number, vol?: number, glow?: boolean) => void;
  playPluckedGuitar: (midi: number, duration?: number, delay?: number, vol?: number, glow?: boolean) => void;
  playElectricBass: (midi: number, duration?: number, delay?: number, vol?: number, style?: 'finger' | 'slap', glow?: boolean) => void;
  playDrumHit: (piece: 'kick' | 'snare' | 'hihat' | 'clap' | 'ghost' | 'crash' | 'tom', delay?: number) => void;
  playVocalFormant?: (
    midi: number,
    duration?: number,
    delay?: number,
    volume?: number,
    vowel?: 'a' | 'e' | 'i' | 'o' | 'u' | 'lip',
    stopPrevious?: boolean
  ) => void;
  strumChord: (midis: number[], inst?: 'guitar' | 'piano', delay?: number, glow?: boolean) => void;
  schedule: (fn: () => void, ms: number) => void;
}

function playReferenceNote(audio: AcademyLabAudio, midi: number, duration = 0.55, delay = 0): void {
  const focus = getVisualInstrumentFocus();
  if (focus === 'guitar-only') {
    audio.playPluckedGuitar(midi, duration, delay, 0.28, false);
  } else if (focus === 'bass-only') {
    const bassMidi = midi >= 52 ? midi - 12 : midi;
    audio.playElectricBass(bassMidi, duration, delay, 0.36, 'finger', false);
  } else {
    audio.playAcousticPiano(midi, duration, delay, 0.26, false);
  }
}

export function buildAcademyDataLabStage(
  stage: HTMLElement,
  labType: string,
  audio: AcademyLabAudio,
  onStatus: (msg: string) => void,
  article?: HTMLElement
): boolean {
  if (labType === 'rhythm-starter-lab') {
    hydrateRhythmStarterLab(stage, audio, onStatus);
    return true;
  }
  if (labType === 'major-scale-ladder-lab') {
    hydrateMajorScaleLadderLab(stage, audio, onStatus);
    return true;
  }
  if (labType === 'fundamentals-guided-lab') {
    hydrateFundamentalsGuidedLab(stage, audio, onStatus, article);
    return true;
  }
  if (labType === 'key-signature-lab') {
    hydrateKeySignatureLab(stage, audio, onStatus);
    return true;
  }
  if (buildStage3DataLabStage(stage, labType, article, audio, onStatus)) {
    return true;
  }
  return buildStage4DataLabStage(stage, labType, article, audio, onStatus);
}

// ============================================================================
// 1. RHYTHM STARTER LAB (4/4 Pulse, Rests, Dotted, Ties, Syncopation, Swing)
// ============================================================================
function hydrateRhythmStarterLab(
  stage: HTMLElement,
  audio: AcademyLabAudio,
  onStatus: (msg: string) => void
): void {
  let activePatternId = RHYTHM_STARTER_PATTERNS[0].id;
  let bpm = 76;
  let isPlaying = false;
  let barInterval: ReturnType<typeof setInterval> | null = null;

  stage.innerHTML = `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#070b14] border border-slate-800">
        <div class="flex flex-wrap gap-1.5 js-rs-patterns">
          ${RHYTHM_STARTER_PATTERNS.map(
            (p) => `
            <button type="button" data-pat="${p.id}"
              class="btn js-rs-pat-btn text-xs ${p.id === activePatternId ? 'btn-primary' : ''}">
              ${p.label}
            </button>`
          ).join('')}
        </div>
        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <label class="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
            <span>Tempo:</span>
            <input type="range" min="55" max="120" value="${bpm}" class="js-rs-bpm w-24 accent-amber-400" />
            <span class="font-mono text-amber-300 js-rs-bpm-val">${bpm} BPM</span>
          </label>
          <button type="button" class="btn btn-primary js-rs-play">▶ Escuchar Patrón</button>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-[#070b14] border border-slate-800 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="text-sm font-bold text-amber-300 js-rs-title"></div>
            <p class="text-xs text-slate-300 js-rs-desc mb-0"></p>
          </div>
          <div class="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 font-mono text-xs text-sky-300 js-rs-count"></div>
        </div>

        <div class="grid grid-cols-4 gap-2 js-rs-beats">
          ${[1, 2, 3, 4]
            .map(
              (b) => `
            <div data-beat="${b}" class="js-rs-beat-box rounded-lg p-2 text-center border border-slate-800 bg-slate-900/70 transition-all">
              <div class="text-xs font-extrabold text-slate-200">Pulso ${b}</div>
              <div class="text-[10px] text-slate-400">${b === 1 ? 'Fuerte' : b === 3 ? 'Semifuerte' : 'Débil'}</div>
            </div>`
            )
            .join('')}
        </div>

        <div class="js-rs-timeline w-full overflow-x-auto"></div>
      </div>
    </div>
  `;

  const titleEl = stage.querySelector<HTMLElement>('.js-rs-title')!;
  const descEl = stage.querySelector<HTMLElement>('.js-rs-desc')!;
  const countEl = stage.querySelector<HTMLElement>('.js-rs-count')!;
  const timelineEl = stage.querySelector<HTMLElement>('.js-rs-timeline')!;
  const playBtn = stage.querySelector<HTMLButtonElement>('.js-rs-play')!;
  const bpmInput = stage.querySelector<HTMLInputElement>('.js-rs-bpm')!;
  const bpmValEl = stage.querySelector<HTMLElement>('.js-rs-bpm-val')!;
  const beatBoxes = [...stage.querySelectorAll<HTMLElement>('.js-rs-beat-box')];

  const getActivePattern = (): RhythmStarterPattern =>
    RHYTHM_STARTER_PATTERNS.find((p) => p.id === activePatternId) || RHYTHM_STARTER_PATTERNS[0];

  const highlightBeat = (beatIdx: number) => {
    beatBoxes.forEach((box, idx) => {
      if (idx === beatIdx) {
        box.style.borderColor = '#fbbf24';
        box.style.background = 'rgba(245, 158, 11, 0.22)';
      } else {
        box.style.borderColor = '#1e293b';
        box.style.background = 'rgba(15, 23, 42, 0.7)';
      }
    });
  };

  const renderPatternView = () => {
    const pat = getActivePattern();
    titleEl.textContent = pat.concept;
    descEl.textContent = pat.explanation;
    countEl.textContent = `Cuenta: ${pat.countingGuide}`;

    stage.querySelectorAll<HTMLButtonElement>('.js-rs-pat-btn').forEach((btn) => {
      btn.classList.toggle('btn-primary', btn.dataset['pat'] === pat.id);
    });

    const W = 680;
    const H = 110;
    const padL = 26;
    const usableW = W - 52;
    const beatCols = [0, 1, 2, 3]
      .map((b) => {
        const x = padL + (b / 4) * usableW;
        return `
          <line x1="${x}" y1="14" x2="${x}" y2="96" stroke="${b === 0 ? '#fbbf24' : '#334155'}" stroke-width="${b === 0 ? 2 : 1}" stroke-dasharray="${b === 0 ? 'none' : '3,3'}" />
          <text x="${x + 4}" y="20" fill="#94a3b8" font-size="10" font-weight="700">${b + 1}</text>
          <line x1="${x + usableW / 8}" y1="26" x2="${x + usableW / 8}" y2="92" stroke="#1e293b" stroke-width="1" />
        `;
      })
      .join('');

    const stepRects = pat.steps.map((step, idx) => {
      const nextStep = pat.steps[idx + 1];
      const visualFrac = nextStep?.isTieCarry
        ? Math.max(0.42, nextStep.offsetFrac - step.offsetFrac)
        : step.durationSecFactor;
      const x = padL + (step.offsetFrac / 4) * usableW + 3;
      const w = Math.max(28, (visualFrac / 4) * usableW - 6);
      return { step, x, w };
    });

    const tieArcs = stepRects
      .map((item, idx) => {
        const nextItem = stepRects[idx + 1];
        if (!nextItem || !nextItem.step.isTieCarry) return '';
        const x1 = item.x + item.w * 0.58;
        const x2 = nextItem.x + nextItem.w * 0.42;
        const midX = (x1 + x2) / 2;
        return `
          <path d="M ${x1.toFixed(1)} 40 Q ${midX.toFixed(1)} 23 ${x2.toFixed(1)} 40"
                fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" />
          <circle cx="${x1.toFixed(1)}" cy="40" r="2.2" fill="#38bdf8" />
          <circle cx="${x2.toFixed(1)}" cy="40" r="2.2" fill="#38bdf8" />
        `;
      })
      .join('');

    const stepShapes = stepRects
      .map(({ step, x, w }) => {
        const fill = step.isRest
          ? 'rgba(148,163,184,0.12)'
          : step.isTieCarry
            ? 'rgba(56,189,248,0.14)'
            : step.isAccent
              ? 'rgba(245,158,11,0.28)'
              : 'rgba(16,185,129,0.24)';
        const stroke = step.isRest
          ? '#64748b'
          : step.isTieCarry
            ? '#38bdf8'
            : step.isAccent
              ? '#fbbf24'
              : '#34d399';
        const dash = step.isRest || step.isTieCarry ? 'stroke-dasharray="4,3"' : '';
        return `
          <g class="js-rs-step-node" data-step="${step.id}">
            <rect x="${x}" y="42" width="${w}" height="44" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="1.6" ${dash} />
            <text x="${x + w / 2}" y="61" text-anchor="middle" fill="#f8fafc" font-size="11" font-weight="800">${step.beatLabel}</text>
            <text x="${x + w / 2}" y="77" text-anchor="middle" fill="#cbd5e1" font-size="9">${step.caption}</text>
          </g>
        `;
      })
      .join('');

    timelineEl.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" class="w-full min-w-[520px] h-auto block" role="img" aria-label="Línea de tiempo rítmica 4/4">
        <rect x="0" y="0" width="${W}" height="${H}" rx="8" fill="#0b111e" />
        ${beatCols}
        <line x1="${padL + usableW}" y1="14" x2="${padL + usableW}" y2="96" stroke="#475569" stroke-width="2" />
        ${tieArcs}
        ${stepShapes}
      </svg>
    `;
  };

  const stopPlayback = () => {
    isPlaying = false;
    if (barInterval) {
      clearInterval(barInterval);
      barInterval = null;
    }
    highlightBeat(-1);
    playBtn.textContent = '▶ Escuchar Patrón';
  };

  const unsubStop = audio.onStop(() => {
    if (isPlaying) stopPlayback();
  });

  const scheduleOneBar = () => {
    if (!document.body.contains(stage)) {
      stopPlayback();
      unsubStop();
      return;
    }
    const pat = getActivePattern();
    const beatMs = (60 / bpm) * 1000;

    // Schedule metronome pulse on beats 1..4
    for (let b = 0; b < 4; b++) {
      audio.schedule(() => {
        if (!isPlaying) return;
        highlightBeat(b);
        audio.playDrumHit('hihat', 0);
      }, Math.round(b * beatMs));
    }

    // Schedule pattern attacks
    pat.steps.forEach((step) => {
      if (!step.playNote) return;
      audio.schedule(() => {
        if (!isPlaying) return;
        audio.playDrumHit(step.isAccent ? 'snare' : 'clap', 0);
        playReferenceNote(audio, step.isAccent ? 60 : 64, Math.max(0.18, (step.durationSecFactor * beatMs) / 1000), 0);
      }, Math.round(step.offsetFrac * beatMs));
    });
  };

  stage.querySelectorAll<HTMLButtonElement>('.js-rs-pat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activePatternId = btn.dataset['pat'] || RHYTHM_STARTER_PATTERNS[0].id;
      renderPatternView();
      onStatus(`Ritmo Etapa 1: ${getActivePattern().label}`);
    });
  });

  bpmInput.addEventListener('input', () => {
    bpm = parseInt(bpmInput.value, 10) || 76;
    bpmValEl.textContent = `${bpm} BPM`;
    if (isPlaying) {
      stopPlayback();
      playBtn.click();
    }
  });

  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      audio.stopAll();
      stopPlayback();
      onStatus('Entrenador rítmico detenido');
      return;
    }
    audio.stopAll();
    isPlaying = true;
    playBtn.textContent = '⏹ Detener';
    scheduleOneBar();
    const barMs = (60 / bpm) * 4 * 1000;
    barInterval = setInterval(scheduleOneBar, barMs);
    onStatus(`Reproduciendo "${getActivePattern().label}" a ${bpm} BPM`);
  });

  renderPatternView();
}

// ============================================================================
// 2. MAJOR SCALE LADDER LAB (T-T-S-T-T-T-S staircase & C vs G vs F)
// ============================================================================
function hydrateMajorScaleLadderLab(
  stage: HTMLElement,
  audio: AcademyLabAudio,
  onStatus: (msg: string) => void
): void {
  let activeId = MAJOR_SCALE_LADDER_PRESETS[0].id;

  stage.innerHTML = `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#070b14] border border-slate-800">
        <div class="flex flex-wrap gap-1.5 js-ml-presets">
          ${MAJOR_SCALE_LADDER_PRESETS.map(
            (p) => `
            <button type="button" data-root="${p.id}"
              class="btn js-ml-preset-btn text-xs ${p.id === activeId ? 'btn-primary' : ''}">
              ${p.label}
            </button>`
          ).join('')}
        </div>
        <button type="button" class="btn btn-primary js-ml-play-scale shrink-0">▶ Escuchar Escalera (1 → 8)</button>
      </div>

      <div class="p-3 rounded-xl bg-[#070b14] border border-slate-800 space-y-3">
        <p class="text-xs text-slate-200 js-ml-explanation mb-0"></p>
        <div class="js-ml-steps grid grid-cols-4 sm:grid-cols-8 gap-1.5"></div>
        <div class="js-ml-keyboard w-full overflow-x-auto"></div>
      </div>
    </div>
  `;

  const explEl = stage.querySelector<HTMLElement>('.js-ml-explanation')!;
  const stepsEl = stage.querySelector<HTMLElement>('.js-ml-steps')!;
  const kbdEl = stage.querySelector<HTMLElement>('.js-ml-keyboard')!;
  const playScaleBtn = stage.querySelector<HTMLButtonElement>('.js-ml-play-scale')!;

  const getPreset = (): MajorScaleLadderPreset =>
    MAJOR_SCALE_LADDER_PRESETS.find((p) => p.id === activeId) || MAJOR_SCALE_LADDER_PRESETS[0];

  const render = () => {
    const preset = getPreset();
    explEl.innerHTML = `<strong class="text-amber-300">¿Por qué funciona así ${preset.label}?</strong> ${preset.collisionFixExplanation}`;

    stage.querySelectorAll<HTMLButtonElement>('.js-ml-preset-btn').forEach((b) => {
      b.classList.toggle('btn-primary', b.dataset['root'] === preset.id);
    });

    const stepKinds = ['T', 'T', 'S', 'T', 'T', 'T', 'S', '—'];
    stepsEl.innerHTML = preset.notes
      .map((note, idx) => {
        const deg = idx === 7 ? 8 : idx + 1;
        const isAltered = preset.alteredDegrees.includes(deg) || (deg === 8 && preset.alteredDegrees.includes(1));
        const nextStep = stepKinds[idx];
        const isSemi = nextStep === 'S';
        return `
          <button type="button" class="js-ml-note-btn p-2 rounded-lg border text-left transition-colors cursor-pointer ${
            isAltered
              ? 'bg-amber-500/15 border-amber-400/60 hover:bg-amber-500/25'
              : 'bg-slate-900/80 border-slate-700 hover:border-sky-400'
          }" data-midi="${preset.midis[idx]}" data-label="${note} (Grado ${deg})">
            <div class="flex items-center justify-between gap-1">
              <span class="text-[10px] font-mono text-slate-400">Grado ${deg}</span>
              ${idx < 7 ? `<span class="text-[10px] font-bold ${isSemi ? 'text-emerald-300' : 'text-sky-300'}">${nextStep}</span>` : ''}
            </div>
            <div class="text-sm font-extrabold ${isAltered ? 'text-amber-300' : 'text-white'}">${note}</div>
            <div class="text-[10px] ${isAltered ? 'text-amber-200' : 'text-slate-400'}">
              ${isAltered ? 'Tecla negra / ajuste' : idx === 2 || idx === 6 ? 'Paso de 1 st →' : 'Natural'}
            </div>
          </button>
        `;
      })
      .join('');

    stepsEl.querySelectorAll<HTMLButtonElement>('.js-ml-note-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const midi = parseInt(btn.dataset['midi'] || '60', 10);
        audio.stopAll();
        playReferenceNote(audio, midi, 0.85, 0);
        onStatus(`Escala ${preset.id} Mayor · ${btn.dataset['label']}`);
      });
    });

    // Mini 15-note SVG keyboard (C3..E5 window around 48..76) showing exact white/black active keys
    const activeMidis = new Set(preset.midis);
    const whiteMidis = [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76];
    const whiteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E'];
    const kw = 34;
    const svgW = whiteMidis.length * kw;

    const whiteKeysSvg = whiteMidis
      .map((m, i) => {
        const x = i * kw;
        const active = activeMidis.has(m);
        const isRoot = m === preset.midis[0] || m === preset.midis[7];
        const fill = isRoot ? '#f59e0b' : active ? '#38bdf8' : '#e2e8f0';
        return `
          <rect x="${x + 1}" y="4" width="${kw - 2}" height="74" rx="4" fill="${fill}" stroke="#0f172a" stroke-width="1.2" />
          <text x="${x + kw / 2}" y="68" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="800">${whiteNames[i]}</text>
        `;
      })
      .join('');

    const blackOffsets = [1, 3, -1, 6, 8, 10]; // semitones above C
    const blackKeysSvg: string[] = [];
    whiteMidis.forEach((m, i) => {
      const pc = m % 12;
      if (pc === 0 || pc === 2 || pc === 5 || pc === 7 || pc === 9) {
        const blackMidi = m + 1;
        if (blackOffsets.length && blackMidi <= 75) {
          const active = activeMidis.has(blackMidi);
          const isRoot = blackMidi === preset.midis[0] || blackMidi === preset.midis[7];
          const fill = isRoot ? '#f59e0b' : active ? '#fbbf24' : '#0f172a';
          const textFill = active || isRoot ? '#0f172a' : '#64748b';
          const x = i * kw + kw * 0.66;
          blackKeysSvg.push(`
            <rect x="${x}" y="4" width="${kw * 0.68}" height="46" rx="3" fill="${fill}" stroke="#334155" stroke-width="1" />
            ${active ? `<text x="${x + kw * 0.34}" y="42" text-anchor="middle" fill="${textFill}" font-size="8.5" font-weight="800">♯/♭</text>` : ''}
          `);
        }
      }
    });

    kbdEl.innerHTML = `
      <svg viewBox="0 0 ${svgW} 84" class="w-full min-w-[460px] max-w-[660px] h-auto block mx-auto" role="img" aria-label="Teclado de escalera mayor T-T-S-T-T-T-S">
        ${whiteKeysSvg}
        ${blackKeysSvg.join('')}
      </svg>
    `;
  };

  stage.querySelectorAll<HTMLButtonElement>('.js-ml-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeId = btn.dataset['root'] || 'C';
      render();
      onStatus(`Escalera Mayor seleccionada: ${getPreset().label}`);
    });
  });

  playScaleBtn.addEventListener('click', () => {
    const preset = getPreset();
    audio.stopAll();
    preset.midis.forEach((m, i) => {
      audio.schedule(() => {
        playReferenceNote(audio, m, 0.45, 0);
      }, i * 260);
    });
    onStatus(`Reproduciendo escala ${preset.label}: ${preset.notes.join(' – ')}`);
  });

  render();
}

// ============================================================================
// 3. KEY SIGNATURE 5-SECOND LAB (# / b + Treble/Bass Clef SVG + Cadence)
// ============================================================================
function hydrateKeySignatureLab(
  stage: HTMLElement,
  audio: AcademyLabAudio,
  onStatus: (msg: string) => void
): void {
  let kind: 'sharp' | 'flat' = 'sharp';
  let count = 1;
  let clef: 'treble' | 'bass' = 'treble';

  stage.innerHTML = `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#070b14] border border-slate-800">
        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" class="btn js-ks-kind" data-kind="sharp">♯ Sostenidos</button>
          <button type="button" class="btn js-ks-kind" data-kind="flat">♭ Bemoles</button>
          <span class="text-slate-500 px-1">|</span>
          ${[0, 1, 2, 3, 4, 5, 6, 7]
            .map((n) => `<button type="button" class="btn js-ks-count text-xs" data-count="${n}">${n}</button>`)
            .join('')}
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" class="btn js-ks-clef text-xs" data-clef="treble">𝄞 Clave de Sol</button>
          <button type="button" class="btn js-ks-clef text-xs" data-clef="bass">𝄢 Clave de Fa</button>
          <button type="button" class="btn btn-primary js-ks-play text-xs">🔊 Escuchar I–IV–V–I</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 rounded-xl bg-[#070b14] border border-slate-800">
        <div class="md:col-span-6 js-ks-staff"></div>
        <div class="md:col-span-6 space-y-2">
          <div class="flex flex-wrap items-baseline gap-2">
            <span class="text-xl font-extrabold text-amber-300 js-ks-major"></span>
            <span class="text-xs text-sky-300 font-semibold js-ks-minor"></span>
          </div>
          <p class="text-xs text-slate-200 leading-relaxed js-ks-rule mb-0"></p>
          <div class="text-xs font-mono text-emerald-300 js-ks-alts"></div>
        </div>
      </div>
    </div>
  `;

  const staffEl = stage.querySelector<HTMLElement>('.js-ks-staff')!;
  const majorEl = stage.querySelector<HTMLElement>('.js-ks-major')!;
  const minorEl = stage.querySelector<HTMLElement>('.js-ks-minor')!;
  const ruleEl = stage.querySelector<HTMLElement>('.js-ks-rule')!;
  const altsEl = stage.querySelector<HTMLElement>('.js-ks-alts')!;

  const render = () => {
    const info = resolveKeySignatureFiveSecondRule(kind, count);

    stage.querySelectorAll<HTMLButtonElement>('.js-ks-kind').forEach((b) => {
      b.classList.toggle('btn-primary', b.dataset['kind'] === kind);
    });
    stage.querySelectorAll<HTMLButtonElement>('.js-ks-count').forEach((b) => {
      b.classList.toggle('btn-primary', parseInt(b.dataset['count'] || '0', 10) === count);
    });
    stage.querySelectorAll<HTMLButtonElement>('.js-ks-clef').forEach((b) => {
      b.classList.toggle('btn-primary', b.dataset['clef'] === clef);
    });

    majorEl.textContent = info.majorKey;
    minorEl.textContent = `Relativa menor: ${info.relativeMinor}`;
    ruleEl.textContent = info.ruleSummary;
    altsEl.textContent =
      info.accidentals.length > 0
        ? `Alteraciones fijas (${info.accidentals.length}): ${info.accidentals.join(' · ')}`
        : 'Alteraciones fijas (0): Todas las notas naturales';

    // Staff line Y coordinates: top line y=26, spacing 11px -> lines at 26, 37, 48, 59, 70
    // Step size = 5.5px per half-space
    const trebleSharpY = [26, 42.5, 20.5, 37, 53.5, 31.5, 48]; // F5, C5, G5, D5, A4, E5, B4
    const trebleFlatY = [48, 31.5, 53.5, 37, 59, 42.5, 64.5]; // B4, E5, A4, D5, G4, C5, F4
    const bassSharpY = [37, 53.5, 31.5, 48, 64.5, 42.5, 59];
    const bassFlatY = [59, 42.5, 64.5, 48, 70, 53.5, 75.5];

    const ys =
      kind === 'sharp'
        ? clef === 'treble'
          ? trebleSharpY
          : bassSharpY
        : clef === 'treble'
          ? trebleFlatY
          : bassFlatY;

    const glyph = kind === 'sharp' ? '♯' : '♭';
    const accSvg = Array.from({ length: count }, (_, idx) => {
      const x = 88 + idx * 24;
      const y = ys[idx] + 5;
      const isHighlight =
        (kind === 'sharp' && idx === count - 1) || (kind === 'flat' && count >= 2 && idx === count - 2);
      const color = isHighlight ? '#fbbf24' : '#38bdf8';
      return `<text x="${x}" y="${y}" fill="${color}" font-size="22" font-weight="800">${glyph}</text>`;
    }).join('');

    const staffLines = [26, 37, 48, 59, 70]
      .map((y) => `<line x1="16" y1="${y}" x2="294" y2="${y}" stroke="#475569" stroke-width="1.3" />`)
      .join('');

    staffEl.innerHTML = `
      <svg viewBox="0 0 310 100" class="w-full max-w-[340px] h-auto block mx-auto" role="img" aria-label="Armadura en pentagrama para ${info.majorKey}">
        <rect x="0" y="0" width="310" height="100" rx="10" fill="#0b111e" stroke="#1e293b" />
        ${staffLines}
        <text x="26" y="${clef === 'treble' ? 66 : 60}" fill="#f8fafc" font-size="${clef === 'treble' ? 48 : 42}">${
      clef === 'treble' ? '𝄞' : '𝄢'
    }</text>
        ${accSvg}
      </svg>
    `;
  };

  stage.querySelectorAll<HTMLButtonElement>('.js-ks-kind').forEach((btn) => {
    btn.addEventListener('click', () => {
      kind = btn.dataset['kind'] === 'flat' ? 'flat' : 'sharp';
      if (count === 0) count = 1;
      render();
    });
  });

  stage.querySelectorAll<HTMLButtonElement>('.js-ks-count').forEach((btn) => {
    btn.addEventListener('click', () => {
      count = parseInt(btn.dataset['count'] || '0', 10);
      render();
    });
  });

  stage.querySelectorAll<HTMLButtonElement>('.js-ks-clef').forEach((btn) => {
    btn.addEventListener('click', () => {
      clef = btn.dataset['clef'] === 'bass' ? 'bass' : 'treble';
      render();
    });
  });

  stage.querySelector<HTMLButtonElement>('.js-ks-play')?.addEventListener('click', () => {
    const info = resolveKeySignatureFiveSecondRule(kind, count);
    audio.stopAll();
    info.cadenceMidis.forEach((chord, idx) => {
      audio.schedule(() => {
        audio.strumChord(chord, getVisualInstrumentFocus() === 'guitar-only' ? 'guitar' : 'piano', 0, false);
      }, idx * 650);
    });
    onStatus(`Cadencia I–IV–V–I en ${info.majorKey} (reposo en tónica)`);
  });

  render();
}

// ============================================================================
// 4. GUIDED FUNDAMENTALS SERIES (Explicación breve + Ejercicio auditivo táctil)
// ============================================================================
function hydrateFundamentalsGuidedLab(
  stage: HTMLElement,
  audio: AcademyLabAudio,
  onStatus: (msg: string) => void,
  article?: HTMLElement
): void {
  const lessonId = article?.dataset['lesson'] || FUNDAMENTALS_GUIDED_LESSONS[0].id;
  const lesson: GuidedFundamentalsLesson =
    FUNDAMENTALS_GUIDED_LESSONS.find((l) => l.id === lessonId) || FUNDAMENTALS_GUIDED_LESSONS[0];

  let stepIdx = 0;
  let matchedCount = 0;
  const completedStepIds = new Set<string>();
  let mode: 'guided' | 'free' = 'guided';
  let showHint = false;
  let lastTappedMidi: number | null = null;
  let feedbackText = 'Pulsa cualquier tecla del teclado inferior o escucha el ejemplo para comenzar.';
  let feedbackTone: 'ok' | 'info' | 'hint' = 'info';
  let customEarStep: GuidedFundamentalsStep | null = null;
  let drillCounter = 0;

  const getCurrentStep = (): GuidedFundamentalsStep => {
    if (customEarStep) return customEarStep;
    return lesson.steps[stepIdx] ?? lesson.steps[0];
  };

  const playDemo = (step: GuidedFundamentalsStep) => {
    audio.stopAll();
    if (step.demoMode === 'harmonic') {
      step.demoMidis.forEach((m) => playReferenceNote(audio, m, 0.9, 0));
    } else {
      step.demoMidis.forEach((m, idx) => playReferenceNote(audio, m, 0.55, idx * 0.45));
    }
    onStatus(`Reproduciendo ejercicio: ${lesson.title}`);
  };

  const render = () => {
    const step = getCurrentStep();
    const allCompleted = completedStepIds.size >= lesson.steps.length;
    const nextExpectedMidi =
      mode === 'guided' && step.kind === 'sequence'
        ? step.targetMidis[Math.min(matchedCount, step.targetMidis.length - 1)]
        : step.targetMidis[0];
    const shouldRevealVisualHint =
      mode === 'guided' &&
      (showHint || (step.kind === 'sequence' && matchedCount < step.targetMidis.length));

    const whiteKeys = FUNDAMENTALS_PIANO_KEYS.filter((k) => !k.isBlack);
    const blackKeys = FUNDAMENTALS_PIANO_KEYS.filter((k) => k.isBlack);

    const feedbackColorClass =
      feedbackTone === 'ok'
        ? 'bg-[#4ea87b]/15 border-[#4ea87b]/40 text-emerald-200'
        : feedbackTone === 'hint'
          ? 'bg-[#e5a93c]/12 border-[#e5a93c]/35 text-amber-100'
          : 'bg-[#171e2c] border-white/10 text-slate-200';

    const lastKey = lastTappedMidi !== null ? getPianoKeySpec(lastTappedMidi) : undefined;

    stage.innerHTML = `
      <div class="space-y-3">
        <!-- Brief Explanation Block -->
        <div class="p-3 rounded-xl bg-[#0b0e14] border border-white/10 space-y-1.5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-[11px] font-bold uppercase tracking-wider text-[#e5a93c]">${lesson.badge}</span>
            <div class="flex items-center gap-1.5">
              <button type="button" data-fg-mode="guided"
                class="px-2.5 py-1 rounded-md text-xs font-semibold border transition cursor-pointer ${
                  mode === 'guided'
                    ? 'bg-[#e5a93c] text-[#0b0e14] border-[#e5a93c]'
                    : 'bg-[#171e2c] text-slate-300 border-white/10 hover:text-white'
                }">🎯 Ejercicio Guiado</button>
              <button type="button" data-fg-mode="free"
                class="px-2.5 py-1 rounded-md text-xs font-semibold border transition cursor-pointer ${
                  mode === 'free'
                    ? 'bg-[#8ab4f8] text-[#0b0e14] border-[#8ab4f8]'
                    : 'bg-[#171e2c] text-slate-300 border-white/10 hover:text-white'
                }">🎹 Explorar Libre</button>
            </div>
          </div>
          <p class="text-xs sm:text-sm text-slate-200 m-0 leading-relaxed">${lesson.briefExplanation}</p>
        </div>

        ${
          mode === 'guided'
            ? `
          <!-- Step Navigator + Prompt -->
          <div class="p-3 rounded-xl bg-[#121722] border border-white/10 space-y-2.5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex flex-wrap items-center gap-1.5">
                ${lesson.steps
                  .map((s, idx) => {
                    const isActive = !customEarStep && idx === stepIdx;
                    const isDone = completedStepIds.has(s.id);
                    return `
                    <button type="button" data-fg-step="${idx}"
                      class="px-2.5 py-1 rounded-md text-xs font-bold border transition cursor-pointer ${
                        isActive
                          ? 'bg-[#e5a93c]/20 border-[#e5a93c] text-[#e5a93c]'
                          : isDone
                            ? 'bg-[#4ea87b]/15 border-[#4ea87b]/40 text-emerald-300'
                            : 'bg-[#171e2c] border-white/10 text-slate-300 hover:border-white/25'
                      }">
                      ${isDone ? '✓ ' : ''}Paso ${idx + 1}
                    </button>`;
                  })
                  .join('')}
                ${
                  customEarStep
                    ? `<span class="px-2.5 py-1 rounded-md text-xs font-bold bg-[#8ab4f8]/20 border border-[#8ab4f8]/40 text-[#8ab4f8]">🎲 Reto Libre #${drillCounter}</span>`
                    : ''
                }
              </div>
              <span class="text-xs text-slate-400 tabular-nums">${completedStepIds.size}/${lesson.steps.length} completados</span>
            </div>

            <div class="text-sm font-bold text-slate-100 leading-snug">${step.prompt}</div>

            ${
              step.kind === 'staff-read' && step.staffMidi
                ? `<div class="py-1">${renderTrebleStaffNoteSvg(step.staffMidi, showHint)}</div>`
                : ''
            }

            <div class="flex flex-wrap items-center gap-2">
              <button type="button" class="btn btn-primary text-xs js-fg-listen">
                🔊 ${step.kind === 'ear-match' ? 'Escuchar objetivo' : 'Escuchar ejemplo'}
              </button>
              <button type="button" class="btn text-xs js-fg-toggle-hint">
                ${showHint ? '🙈 Ocultar pista' : '💡 Ver pista'}
              </button>
              ${
                lesson.allowsInfiniteEarDrill
                  ? `<button type="button" class="btn text-xs js-fg-new-drill">🎲 Nuevo Reto de Oído</button>`
                  : ''
              }
              ${
                stepIdx < lesson.steps.length - 1 && completedStepIds.has(step.id) && !customEarStep
                  ? `<button type="button" class="btn text-xs js-fg-next" style="border-color: rgba(78,168,123,0.45); color: #6ee7b7;">Siguiente paso →</button>`
                  : ''
              }
            </div>

            ${
              showHint
                ? `<div class="p-2 rounded-lg bg-[#171e2c] border border-[#8ab4f8]/30 text-xs text-slate-200">
                    <strong>Pista:</strong> ${step.hint}${step.staffHint ? ` · <em>${step.staffHint}</em>` : ''}
                  </div>`
                : ''
            }
          </div>
        `
            : `
          <div class="p-3 rounded-xl bg-[#121722] border border-white/10 text-xs text-slate-300">
            <strong>Modo Exploración Libre:</strong> Toca cualquier secuencia de teclas para comparar alturas, semitonos y acordes sin restricciones. Cuando quieras volver al ejercicio, pulsa <em>🎯 Ejercicio Guiado</em>.
          </div>
        `
        }

        <!-- Interactive Playable On-Screen Piano (C4 to C5) -->
        <div class="p-2.5 sm:p-3 rounded-xl bg-[#0b0e14] border border-white/10">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2 text-[11px] text-slate-400">
            <span>🎹 Toca directamente las teclas para oír y responder:</span>
            <span class="font-mono text-slate-200">
              ${lastKey ? `Última nota: <strong class="text-[#e5a93c]">${lastKey.latinName} (${lastKey.americanName})</strong>` : 'Sin pulsar aún'}
            </span>
          </div>

          <div class="relative select-none w-full max-w-[660px] mx-auto h-[138px] sm:h-[156px]">
            <!-- White Keys Row -->
            <div class="grid grid-cols-8 gap-1 h-full">
              ${whiteKeys
                .map((k) => {
                  const isLast = lastTappedMidi === k.midi;
                  const isMatchedInSeq =
                    mode === 'guided' &&
                    step.kind === 'sequence' &&
                    step.targetMidis.slice(0, matchedCount).includes(k.midi);
                  const isHintTarget =
                    shouldRevealVisualHint &&
                    nextExpectedMidi === k.midi &&
                    (step.kind !== 'ear-match' || showHint);
                  let cls =
                    'bg-slate-100 hover:bg-white text-slate-900 border-slate-300';
                  if (isMatchedInSeq) {
                    cls = 'bg-[#4ea87b] text-white border-emerald-300';
                  } else if (isLast) {
                    cls = 'bg-[#e5a93c] text-[#0b0e14] border-amber-200';
                  } else if (isHintTarget) {
                    cls = 'bg-sky-100 text-slate-900 border-[#8ab4f8] ring-2 ring-[#8ab4f8]/60';
                  }
                  return `
                  <button type="button"
                    data-fg-midi="${k.midi}"
                    aria-label="Tecla ${k.latinName} ${k.americanName}"
                    class="relative h-full rounded-b-lg border flex flex-col justify-end items-center pb-2 px-0.5 cursor-pointer transition-colors ${cls}">
                    <span class="text-[10px] sm:text-xs font-extrabold leading-tight text-center">${k.shortLabel}</span>
                  </button>`;
                })
                .join('')}
            </div>

            <!-- Black Keys Overlay -->
            ${blackKeys
              .map((k) => {
                const leftPct = (k.whiteIndex + 1) * 12.5;
                const isLast = lastTappedMidi === k.midi;
                const isMatchedInSeq =
                  mode === 'guided' &&
                  step.kind === 'sequence' &&
                  step.targetMidis.slice(0, matchedCount).includes(k.midi);
                const isHintTarget =
                  shouldRevealVisualHint &&
                  nextExpectedMidi === k.midi &&
                  (step.kind !== 'ear-match' || showHint);
                let cls = 'bg-[#171e2c] hover:bg-[#232c3d] text-slate-200 border-slate-600';
                if (isMatchedInSeq) {
                  cls = 'bg-[#4ea87b] text-white border-emerald-300';
                } else if (isLast) {
                  cls = 'bg-[#e5a93c] text-[#0b0e14] border-amber-200';
                } else if (isHintTarget) {
                  cls = 'bg-[#1e293b] text-[#8ab4f8] border-[#8ab4f8] ring-2 ring-[#8ab4f8]/60';
                }
                return `
                <button type="button"
                  data-fg-midi="${k.midi}"
                  aria-label="Tecla ${k.latinName} ${k.americanName}"
                  style="left: ${leftPct}%; width: 8.6%; transform: translateX(-50%);"
                  class="absolute top-0 z-10 h-[60%] rounded-b-md border shadow-md flex flex-col justify-end items-center pb-1.5 cursor-pointer transition-colors ${cls}">
                  <span class="text-[9px] sm:text-[10px] font-bold leading-none">${k.shortLabel}</span>
                  <span class="text-[8px] opacity-75 leading-none mt-0.5">${k.altLabel || ''}</span>
                </button>`;
              })
              .join('')}
          </div>
        </div>

        <!-- Feedback & Takeaway -->
        <div class="p-2.5 rounded-xl border text-xs leading-relaxed ${feedbackColorClass}">
          ${feedbackText}
        </div>

        ${
          allCompleted
            ? `<div class="p-2.5 rounded-xl bg-[#4ea87b]/12 border border-[#4ea87b]/35 text-xs text-emerald-200">
                <strong>✓ Lección completada:</strong> ${lesson.takeaway}
              </div>`
            : ''
        }
      </div>
    `;

    // Wire events cleanly after render
    stage.querySelectorAll<HTMLButtonElement>('[data-fg-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        mode = btn.dataset['fgMode'] === 'free' ? 'free' : 'guided';
        feedbackText =
          mode === 'free'
            ? 'Explora libremente tocando cualquier tecla.'
            : getCurrentStep().prompt;
        feedbackTone = 'info';
        render();
      });
    });

    stage.querySelectorAll<HTMLButtonElement>('[data-fg-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextIdx = parseInt(btn.dataset['fgStep'] || '0', 10);
        if (!Number.isNaN(nextIdx) && lesson.steps[nextIdx]) {
          customEarStep = null;
          stepIdx = nextIdx;
          matchedCount = 0;
          feedbackText = lesson.steps[nextIdx].prompt;
          feedbackTone = 'info';
          render();
        }
      });
    });

    stage.querySelector<HTMLButtonElement>('.js-fg-listen')?.addEventListener('click', () => {
      playDemo(getCurrentStep());
    });

    stage.querySelector<HTMLButtonElement>('.js-fg-toggle-hint')?.addEventListener('click', () => {
      showHint = !showHint;
      render();
    });

    stage.querySelector<HTMLButtonElement>('.js-fg-next')?.addEventListener('click', () => {
      if (stepIdx < lesson.steps.length - 1) {
        stepIdx += 1;
        matchedCount = 0;
        showHint = false;
        feedbackText = lesson.steps[stepIdx].prompt;
        feedbackTone = 'info';
        render();
      }
    });

    stage.querySelector<HTMLButtonElement>('.js-fg-new-drill')?.addEventListener('click', () => {
      const pool = lesson.earDrillPoolMidis || [62, 64, 65, 67, 69, 71, 72];
      const nextTarget = pickNextEarDrillMidi(pool, customEarStep?.targetMidis[0]);
      const targetSpec = getPianoKeySpec(nextTarget);
      drillCounter += 1;
      customEarStep = {
        id: `ear-drill-${drillCounter}`,
        kind: 'ear-match',
        prompt: `Reto Aleatorio #${drillCounter}: Escucha Do (C4) seguido de la nota incógnita y tócala en el teclado:`,
        hint: `Es una tecla blanca de la escala de Do Mayor (${targetSpec?.latinName ?? ''}). Escúchala de nuevo y compara si está cerca de C4 o de C5.`,
        targetMidis: [nextTarget],
        demoMidis: [60, nextTarget],
        demoMode: 'melodic',
        successFeedback: `¡Exacto! Acertaste ${targetSpec?.latinName ?? ''} (${targetSpec?.americanName ?? ''}). Pulsa "🎲 Nuevo Reto de Oído" para seguir entrenando.`,
      };
      matchedCount = 0;
      showHint = false;
      feedbackText = 'Escucha la referencia Do (C4) + la segunda nota y búscala en el teclado.';
      feedbackTone = 'info';
      render();
      playDemo(customEarStep);
    });

    stage.querySelectorAll<HTMLButtonElement>('[data-fg-midi]').forEach((keyBtn) => {
      keyBtn.addEventListener('click', () => {
        const midi = parseInt(keyBtn.dataset['fgMidi'] || '60', 10);
        lastTappedMidi = midi;
        playReferenceNote(audio, midi, 0.72, 0);
        const tappedSpec = getPianoKeySpec(midi);
        const label = tappedSpec ? `${tappedSpec.latinName} (${tappedSpec.americanName})` : `MIDI ${midi}`;
        onStatus(`Nota tocada: ${label}`);

        if (mode === 'free') {
          feedbackText = `Sonando ${label}. Prueba combinarla con otra nota para escuchar su intervalo.`;
          feedbackTone = 'info';
          render();
          return;
        }

        const activeStep = getCurrentStep();
        const evalRes = evaluateFundamentalsKeyTap(activeStep, midi, matchedCount);
        matchedCount = evalRes.advancedProgress;
        feedbackText = evalRes.feedbackText;
        feedbackTone = evalRes.tone;
        if (evalRes.completedStep && !customEarStep) {
          completedStepIds.add(activeStep.id);
        }
        render();
      });
    });
  };

  render();
}

