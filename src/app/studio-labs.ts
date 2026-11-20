import {
  LOGIC_NOTE_NAMES,
  applyEnharmonicGoldenRule,
  convertProgressionToNashville,
  evaluateGapClickTiming,
  harmonizeMelodyVoices,
  midiToNoteName,
  resolvePlayableChordVoicing,
  type NashvilleChordInput,
} from './music-games-logic';

export interface NoteGlowHint {
  isChord?: boolean;
  chordGroup?: number;
  sIdx?: number;
  fret?: number;
  scopeEl?: HTMLElement | null;
}

export interface NotePlayEvent extends NoteGlowHint {
  midi: number;
  durationSec: number;
  instrument: string;
}

export interface StudioAudioPort {
  ensureContext(): AudioContext;
  midiToFreq(midi: number): number;
  stopAll(keepDrone?: boolean): void;
  schedule(fn: () => void, delayMs: number): void;
  playFreqTone(freqHz: number, duration?: number, delay?: number, volume?: number, stopPrevious?: boolean): void;
  playPluckedGuitar(
    midi: number,
    duration?: number,
    delay?: number,
    volume?: number,
    stopPrevious?: boolean,
    glowHint?: NoteGlowHint
  ): void;
  playElectricBass(
    midi: number,
    duration?: number,
    delay?: number,
    volume?: number,
    style?: 'finger' | 'slap',
    stopPrevious?: boolean,
    glowHint?: NoteGlowHint
  ): void;
  playAcousticPiano(
    midi: number,
    duration?: number,
    delay?: number,
    volume?: number,
    stopPrevious?: boolean,
    glowHint?: NoteGlowHint
  ): void;
  playVocalFormant(
    midi: number,
    duration?: number,
    delay?: number,
    volume?: number,
    vowel?: 'a' | 'e' | 'i' | 'o' | 'u' | 'lip',
    stopPrevious?: boolean
  ): void;
  playDrumHit(
    type: 'kick' | 'snare' | 'ghost' | 'hihat' | 'openhat' | 'crash' | 'tom' | 'clap',
    delay?: number
  ): void;
  playDrumPiece(piece: 'BD' | 'SD' | 'HH' | 'HHP' | 'T1' | 'T2' | 'FT' | 'RD' | 'CR', delay?: number): void;
  strumChord(midiNotes: number[], instrument?: 'guitar' | 'piano' | 'bass', delayOffset?: number, stopPrevious?: boolean): void;
  onNoteEvent(cb: (ev: NotePlayEvent | null) => void): () => void;
}

const GUITAR_6C = [
  { label: 'e (1ª)', openMidi: 64 },
  { label: 'B (2ª)', openMidi: 59 },
  { label: 'G (3ª)', openMidi: 55 },
  { label: 'D (4ª)', openMidi: 50 },
  { label: 'A (5ª)', openMidi: 45 },
  { label: 'E (6ª)', openMidi: 40 },
];

const BASS_4C = [
  { label: 'G (1ª)', openMidi: 43 },
  { label: 'D (2ª)', openMidi: 38 },
  { label: 'A (3ª)', openMidi: 33 },
  { label: 'E (4ª)', openMidi: 28 },
];

const BASS_5C = [
  { label: 'G (1ª)', openMidi: 43 },
  { label: 'D (2ª)', openMidi: 38 },
  { label: 'A (3ª)', openMidi: 33 },
  { label: 'E (4ª)', openMidi: 28 },
  { label: 'B (5ª)', openMidi: 23 },
];

function renderCompactNeckHtml(
  strings: { label: string; openMidi: number }[],
  activeMidis: number[],
  rootPc: number,
  maxFret = 12
): string {
  const activeMidiSet = new Set(activeMidis);
  const activePcSet = new Set(activeMidis.map((m) => ((m % 12) + 12) % 12));

  let header = `<div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.12); margin-bottom:4px;"><div class="string-label" style="color:#94a3b8; font-size:0.68rem;">Traste</div>`;
  for (let f = 0; f <= maxFret; f++) {
    const dot = [3, 5, 7, 9, 12].includes(f) ? '•' : '';
    header += `<div class="fret-cell" style="height:20px; border:none; color:#94a3b8; font-size:0.7rem; font-weight:700;">${f}${dot}</div>`;
  }
  header += `</div>`;

  const rows = strings
    .map((str, sIdx) => {
      let row = `<div class="fretboard-row"><div class="string-label">${str.label}</div>`;
      for (let f = 0; f <= maxFret; f++) {
        const midi = str.openMidi + f;
        const pc = midi % 12;
        const isExact = activeMidiSet.has(midi);
        const isPc = activePcSet.has(pc);
        const cls = isExact
          ? pc === rootPc
            ? 'root'
            : 'char'
          : isPc
            ? pc === rootPc
              ? 'root'
              : 'active'
            : '';
        const ring = isExact ? 'outline:2px solid #ffffff;' : '';
        row += `<div class="fret-cell js-studio-fret" data-sidx="${sIdx}" data-fret="${f}" data-midi="${midi}" title="${midiToNoteName(midi)} (Traste ${f})"><div class="fret-note ${cls}" style="${ring}">${LOGIC_NOTE_NAMES[pc]}</div></div>`;
      }
      row += `</div>`;
      return row;
    })
    .join('');

  return `<div class="fretboard-wrapper ${maxFret <= 7 ? 'compact-neck' : ''}">${header}${rows}</div>`;
}

/**
 * Dispatches specialized new interactive labs from studio-labs.ts
 */
export function buildStudioDataLabStage(
  stage: HTMLElement,
  labType: string,
  article: HTMLElement,
  audio: StudioAudioPort,
  onStatus: (msg: string) => void
): boolean {
  const preset = article.getAttribute('data-preset') || '';
  if (labType === 'chromatic-clock-lab') {
    buildChromaticClockLab(stage, audio, onStatus);
    return true;
  }
  if (labType === 'guitar-strumming-lab') {
    buildGuitarStrummingLab(stage, audio, onStatus);
    return true;
  }
  if (labType === 'notation-writer-lab') {
    buildNotationWriterLab(stage, audio, onStatus, preset);
    return true;
  }
  if (labType === 'drum-pro-lab') {
    buildDrumProLab(stage, audio, onStatus, preset);
    return true;
  }
  if (labType === 'bass-lock-lab') {
    buildBassLockLab(stage, audio, onStatus, preset);
    return true;
  }
  if (labType === 'vocal-agility-lab') {
    buildVocalAgilityLab(stage, audio, onStatus, preset);
    return true;
  }
  return false;
}

/**
 * LAB A: Interactive 12-Hour Chromatic Clock + Golden Rule of Enharmony
 */
function buildChromaticClockLab(
  stage: HTMLElement,
  audio: StudioAudioPort,
  onStatus: (msg: string) => void
): void {
  let selectedPc = 5; // Start on F so Bb vs A# Golden Rule is immediately crystal clear!
  let preferFlats: boolean | undefined = undefined;
  let activeChordMidis: number[] = [];

  const SHARP_LABELS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLAT_LABELS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  const render = () => {
    const golden = applyEnharmonicGoldenRule(selectedPc, [0, 2, 4, 5, 7, 9, 11], preferFlats);
    const scalePcSet = new Set([0, 2, 4, 5, 7, 9, 11].map((o) => (selectedPc + o) % 12));

    const cx = 185;
    const cy = 185;
    const rOuter = 136;

    const nodesHtml = Array.from({ length: 12 }, (_, pc) => {
      const angle = ((pc * 30 - 90) * Math.PI) / 180;
      const x = cx + rOuter * Math.cos(angle);
      const y = cy + rOuter * Math.sin(angle);
      const isRoot = pc === selectedPc;
      const inScale = scalePcSet.has(pc);
      const isNatural = [0, 2, 4, 5, 7, 9, 11].includes(pc);
      const mainLbl = SHARP_LABELS[pc] === FLAT_LABELS[pc]
        ? SHARP_LABELS[pc]
        : `${SHARP_LABELS[pc]}/${FLAT_LABELS[pc]}`;

      const fill = isRoot ? '#f59e0b' : inScale ? '#0284c7' : isNatural ? '#1e293b' : '#0f172a';
      const stroke = isRoot ? '#fef08a' : inScale ? '#38bdf8' : '#475569';
      const txtCol = isRoot ? '#090c12' : '#f8fafc';

      return `
        <g class="js-clock-node" data-pc="${pc}" style="cursor:pointer;">
          <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${isRoot ? 24 : 20}" fill="${fill}" stroke="${stroke}" stroke-width="${isRoot ? 2.5 : 1.5}" />
          <text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" fill="${txtCol}" font-size="${mainLbl.length > 3 ? 9.5 : 12}" font-weight="800">${mainLbl}</text>
        </g>
      `;
    }).join('');

    // Draw connecting heptagon of the major scale on the clock
    const pts = [0, 2, 4, 5, 7, 9, 11].map((o) => {
      const pc = (selectedPc + o) % 12;
      const angle = ((pc * 30 - 90) * Math.PI) / 180;
      return `${(cx + rOuter * Math.cos(angle)).toFixed(1)},${(cy + rOuter * Math.sin(angle)).toFixed(1)}`;
    });

    stage.innerHTML = `
      <div class="grid-2" style="align-items:center;">
        <div style="display:flex; flex-direction:column; align-items:center; background:#090d16; border:1px solid #1e293b; border-radius:12px; padding:12px;">
          <svg viewBox="0 0 370 370" style="width:100%; max-width:340px;" role="img" aria-label="Reloj Cromático de 12 Semitonos">
            <circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="4,4" />
            <polygon points="${pts.join(' ')}" fill="rgba(56,189,248,0.08)" stroke="#38bdf8" stroke-width="1.6" />
            <circle cx="${cx}" cy="${cy}" r="48" fill="#111827" stroke="#f59e0b" stroke-width="1.5" />
            <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#fbbf24" font-size="14" font-weight="800">${golden.rootLabel} Mayor</text>
            <text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="#94a3b8" font-size="10">12 Semitonos</text>
            ${nodesHtml}
          </svg>
        </div>

        <div class="card">
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
            <button type="button" class="btn btn-primary js-clock-play-scale">🔊 Escuchar Escala de ${golden.rootLabel} Mayor</button>
            <button type="button" class="btn js-clock-toggle-acc">${preferFlats === true ? 'Preferir # (Sostenidos)' : preferFlats === false ? 'Preferir ♭ (Bemoles)' : 'Alternar # / ♭'}</button>
          </div>
          <h4 style="color:#fbbf24; margin:0 0 6px 0;">Ortografía Correcta (Regla de Oro):</h4>
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
            ${golden.notes
              .map(
                (n, idx) =>
                  `<span class="scale-pill ${idx === 0 ? 'char' : ''}" style="font-size:0.86rem; font-weight:700;">${idx + 1}. ${n}</span>`
              )
              .join('')}
          </div>
          <p class="text-xs" style="color:#cbd5e1; margin-bottom:8px;">
            ${golden.explanation}
          </p>
          <p class="text-xs" style="color:#38bdf8; margin:0;">
            <strong>Pareja Enarmónica de la Tónica:</strong> <code>${golden.enharmonicTwin}</code>.<br>
            <em>Prueba hacer clic en <strong>F (Fa)</strong> en el reloj: verás por qué el 4º escalón debe llamarse <strong>Si♭ (Bb)</strong> y NO La# (para no repetir la letra A y saltar la B).</em>
          </p>
        </div>
      </div>
    `;
  };

  render();

  stage.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const node = t.closest<HTMLElement>('.js-clock-node');
    if (node) {
      selectedPc = parseInt(node.getAttribute('data-pc')!, 10);
      preferFlats = undefined;
      audio.stopAll();
      audio.playAcousticPiano(60 + selectedPc, 0.9, 0, 0.28, false);
      render();
      onStatus(`Reloj Cromático: Nota ${SHARP_LABELS[selectedPc]}/${FLAT_LABELS[selectedPc]} (Escala de ${applyEnharmonicGoldenRule(selectedPc).rootLabel} Mayor)`);
      return;
    }
    if (t.closest('.js-clock-play-scale')) {
      const golden = applyEnharmonicGoldenRule(selectedPc, [0, 2, 4, 5, 7, 9, 11], preferFlats);
      audio.stopAll();
      activeChordMidis = [0, 2, 4, 5, 7, 9, 11, 12].map((o) => 60 + selectedPc + o);
      activeChordMidis.forEach((m, i) => {
        audio.schedule(() => {
          audio.playAcousticPiano(m, 0.48, 0, 0.25, false);
        }, i * 240);
      });
      onStatus(`Escala Mayor (${golden.notes.join(' – ')})`);
      return;
    }
    if (t.closest('.js-clock-toggle-acc')) {
      preferFlats = preferFlats === undefined ? true : preferFlats === true ? false : undefined;
      render();
    }
  });
}

/**
 * LAB B: Guitar Acoustic Strumming & Drills Laboratory
 */
function buildGuitarStrummingLab(
  stage: HTMLElement,
  audio: StudioAudioPort,
  onStatus: (msg: string) => void
): void {
  type StrumToken = 'D' | 'd' | 'U' | 'X' | '-';
  interface StrumPatternPreset {
    id: string;
    name: string;
    meter: '4/4' | '6/8';
    stepsPerBar: number;
    pattern: StrumToken[];
    tip: string;
  }

  const PATTERNS: StrumPatternPreset[] = [
    {
      id: 'pop',
      name: '1. Rasgueo Universal Pop / Balada (↓ ↓ ↑ ↑ ↓ ↑)',
      meter: '4/4',
      stepsPerBar: 8,
      pattern: ['D', '-', 'D', 'U', '-', 'U', 'D', 'U'],
      tip: 'La mano derecha oscila SIEMPRE como un péndulo (abajo en los tiempos 1-2-3-4, arriba en los "y"), aunque algunas pasadas pasen al aire.',
    },
    {
      id: 'folk68',
      name: '2. Vals / Folclore 6/8 (↓ ↓ ↑ ↓ ↑)',
      meter: '6/8',
      stepsPerBar: 6,
      pattern: ['D', '-', 'd', 'U', 'D', 'U'],
      tip: 'Dos pulsos grandes ternarios (1-2-3 | 4-5-6). Acentúa los pulsos 1 y 4.',
    },
    {
      id: 'funk',
      name: '3. Groove Funk con Apagado Percusivo (X)',
      meter: '4/4',
      stepsPerBar: 8,
      pattern: ['D', 'X', 'U', 'X', '-', 'U', 'D', 'X'],
      tip: 'El símbolo X (Chasquido) apaga las cuerdas con la palma izquierda o el canto de la derecha para crear percusión seca.',
    },
    {
      id: 'reggae',
      name: '4. Reggae Skank (Contratiempo Seco en 2 y 4)',
      meter: '4/4',
      stepsPerBar: 8,
      pattern: ['-', '-', 'D', 'X', '-', '-', 'D', 'X'],
      tip: 'Corta el acorde inmediatamente después de golpear los tiempos 2 y 4.',
    },
  ];

  const PROGRESSIONS: Record<string, { label: string; chords: { name: string; rootPc: number; frets: number[] }[] }> = {
    pop4: {
      label: 'C – G – Am – F (El Ciclo Dorado)',
      chords: [
        { name: 'C', rootPc: 0, frets: [-1, 3, 2, 0, 1, 0] },
        { name: 'G', rootPc: 7, frets: [3, 2, 0, 0, 0, 3] },
        { name: 'Am', rootPc: 9, frets: [-1, 0, 2, 2, 1, 0] },
        { name: 'F', rootPc: 5, frets: [1, 3, 3, 2, 1, 1] },
      ],
    },
    folkG: {
      label: 'G – D – Em – C (Acústica Abierta)',
      chords: [
        { name: 'G', rootPc: 7, frets: [3, 2, 0, 0, 0, 3] },
        { name: 'D', rootPc: 2, frets: [-1, -1, 0, 2, 3, 2] },
        { name: 'Em', rootPc: 4, frets: [0, 2, 2, 0, 0, 0] },
        { name: 'C', rootPc: 0, frets: [-1, 3, 2, 0, 1, 0] },
      ],
    },
    latinAm: {
      label: 'Am – G – F – E7 (Cadencia Andaluza)',
      chords: [
        { name: 'Am', rootPc: 9, frets: [-1, 0, 2, 2, 1, 0] },
        { name: 'G', rootPc: 7, frets: [3, 2, 0, 0, 0, 3] },
        { name: 'F', rootPc: 5, frets: [1, 3, 3, 2, 1, 1] },
        { name: 'E7', rootPc: 4, frets: [0, 2, 0, 1, 0, 0] },
      ],
    },
  };

  let activePresetIdx = 0;
  let activeProgKey = 'pop4';
  let bpm = 92;
  let customPattern: StrumToken[] = [...PATTERNS[0].pattern];
  let activeChordIdx = 0;
  let playingStep = -1;
  let isPlaying = false;
  let loopTimer: ReturnType<typeof setInterval> | null = null;

  const fretsToMidis = (frets: number[]): number[] => {
    const lowToHigh = [40, 45, 50, 55, 59, 64];
    return frets
      .map((f, idx) => (f >= 0 ? lowToHigh[idx] + f : -1))
      .filter((m) => m >= 0);
  };

  const stopPlay = () => {
    isPlaying = false;
    playingStep = -1;
    if (loopTimer) {
      clearInterval(loopTimer);
      loopTimer = null;
    }
    audio.stopAll(true);
    renderGridOnly();
  };

  const playStrumStep = (tok: StrumToken, midis: number[]) => {
    if (tok === '-') return;
    if (tok === 'X') {
      audio.playDrumHit('clap', 0);
      return;
    }
    const ordered = tok === 'U' ? [...midis].reverse() : midis;
    const vol = tok === 'd' ? 0.16 : 0.24;
    const gap = tok === 'U' ? 0.016 : 0.022;
    ordered.forEach((m, idx) => {
      audio.playPluckedGuitar(m, tok === 'U' ? 0.45 : 0.72, idx * gap, vol, false);
    });
  };

  const tokenVisual = (tok: StrumToken): { symbol: string; sub: string; bg: string; col: string } => {
    if (tok === 'D') return { symbol: '↓', sub: 'Fuerte', bg: 'rgba(245,158,11,0.22)', col: '#fbbf24' };
    if (tok === 'd') return { symbol: '↓', sub: 'Suave', bg: 'rgba(56,189,248,0.18)', col: '#38bdf8' };
    if (tok === 'U') return { symbol: '↑', sub: 'Arriba', bg: 'rgba(16,185,129,0.2)', col: '#34d399' };
    if (tok === 'X') return { symbol: '✕', sub: 'Mute', bg: 'rgba(244,63,94,0.2)', col: '#fb7185' };
    return { symbol: '·', sub: 'Aire', bg: '#0f172a', col: '#64748b' };
  };

  const renderGridOnly = () => {
    const preset = PATTERNS[activePresetIdx];
    const prog = PROGRESSIONS[activeProgKey];
    const curChord = prog.chords[activeChordIdx % prog.chords.length];
    const midis = fretsToMidis(curChord.frets);

    const gridEl = stage.querySelector<HTMLElement>('.js-strum-grid');
    const neckEl = stage.querySelector<HTMLElement>('.js-strum-neck');
    const playBtn = stage.querySelector<HTMLButtonElement>('.js-strum-play');

    if (playBtn) {
      playBtn.textContent = isPlaying ? '⏹ Detener Rasgueo' : '▶ Reproducir Patrón';
    }

    if (gridEl) {
      const subLabels =
        preset.meter === '6/8'
          ? ['1', '2', '3', '4', '5', '6']
          : ['1', 'y', '2', 'y', '3', 'y', '4', 'y'];

      gridEl.innerHTML = `
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
          ${prog.chords
            .map(
              (c, ci) =>
                `<button type="button" class="btn js-strum-chord-pill ${ci === activeChordIdx ? 'active' : ''}" data-cidx="${ci}">${c.name}</button>`
            )
            .join('')}
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(56px, 1fr)); gap:6px; padding-bottom:4px;">
          ${customPattern
            .map((tok, i) => {
              const v = tokenVisual(tok);
              const activeBorder = playingStep === i ? '2px solid #ffffff' : '1px solid #334155';
              return `
                <button type="button" class="js-strum-cell" data-sidx="${i}" style="background:${v.bg}; border:${activeBorder}; border-radius:8px; padding:8px 4px; text-align:center; cursor:pointer; transition:transform 0.1s;">
                  <div style="font-size:0.65rem; color:#94a3b8; font-weight:700;">${subLabels[i] || i + 1}</div>
                  <div style="font-size:1.35rem; font-weight:900; color:${v.col}; line-height:1.1;">${v.symbol}</div>
                  <div style="font-size:0.64rem; color:#cbd5e1;">${v.sub}</div>
                </button>
              `;
            })
            .join('')}
        </div>
        <p class="text-xs" style="color:#94a3b8; margin-top:8px;">
          💡 <strong>${preset.tip}</strong> (Haz clic en cualquier casilla del patrón para cambiar entre <code>↓ Fuerte</code>, <code>↓ Suave</code>, <code>↑ Arriba</code>, <code>✕ Apagado</code> y <code>· Aire</code>).
        </p>
      `;
    }

    if (neckEl) {
      const chordKey = `${curChord.name}:${midis.join(',')}`;
      if (neckEl.getAttribute('data-chord-key') !== chordKey) {
        neckEl.setAttribute('data-chord-key', chordKey);
        neckEl.innerHTML = `
          <div style="font-size:0.78rem; color:#fbbf24; font-weight:700; margin-bottom:4px;">
            🎸 Acorde Activo: ${curChord.name} (Las notas se iluminan al rasguear)
          </div>
          ${renderCompactNeckHtml(GUITAR_6C, midis, curChord.rootPc, 5)}
        `;
      }
    }
  };

  stage.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; margin-bottom:12px;">
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
        <select class="lab-select js-strum-preset" aria-label="Seleccionar patrón de rasgueo">
          ${PATTERNS.map((p, idx) => `<option value="${idx}">${p.name}</option>`).join('')}
        </select>
        <select class="lab-select js-strum-prog" aria-label="Seleccionar progresión de acordes">
          ${Object.entries(PROGRESSIONS)
            .map(([k, v]) => `<option value="${k}">${v.label}</option>`)
            .join('')}
        </select>
        <label style="font-size:0.8rem; color:#cbd5e1; display:flex; align-items:center; gap:6px;">
          Tempo: <strong class="js-strum-bpm-val">${bpm}</strong> BPM
          <input type="range" class="js-strum-bpm" min="60" max="145" value="${bpm}" style="width:95px;" />
        </label>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        <button type="button" class="btn btn-primary js-strum-play">▶ Reproducir Patrón</button>
        <button type="button" class="btn js-strum-drill" data-drill="mute">🎯 Ejercicio Apagados</button>
      </div>
    </div>
    <div class="js-strum-grid" style="margin-bottom:12px;"></div>
    <div class="js-strum-neck"></div>
  `;

  renderGridOnly();

  const startPlay = () => {
    stopPlay();
    isPlaying = true;
    const preset = PATTERNS[activePresetIdx];
    const subdivisionMs = preset.meter === '6/8' ? (60000 / bpm) / 3 : (60000 / bpm) / 2;
    let step = 0;

    const tick = () => {
      if (!isPlaying) return;
      const len = customPattern.length;
      if (step > 0 && step % len === 0) {
        const prog = PROGRESSIONS[activeProgKey];
        activeChordIdx = (activeChordIdx + 1) % prog.chords.length;
      }
      playingStep = step % len;
      const prog = PROGRESSIONS[activeProgKey];
      const curChord = prog.chords[activeChordIdx % prog.chords.length];
      renderGridOnly();
      playStrumStep(customPattern[playingStep], fretsToMidis(curChord.frets));
      step++;
    };

    tick();
    loopTimer = setInterval(tick, subdivisionMs);
    onStatus(`Rasgueo Guitarra: ${preset.name} a ${bpm} BPM`);
  };

  stage.addEventListener('change', (e) => {
    const t = e.target as HTMLSelectElement;
    if (t.classList.contains('js-strum-preset')) {
      activePresetIdx = parseInt(t.value, 10);
      customPattern = [...PATTERNS[activePresetIdx].pattern];
      activeChordIdx = 0;
      if (isPlaying) startPlay();
      else renderGridOnly();
    } else if (t.classList.contains('js-strum-prog')) {
      activeProgKey = t.value;
      activeChordIdx = 0;
      renderGridOnly();
    } else if (t.classList.contains('js-strum-bpm')) {
      bpm = parseInt(t.value, 10);
      const valEl = stage.querySelector('.js-strum-bpm-val');
      if (valEl) valEl.textContent = String(bpm);
      if (isPlaying) startPlay();
    }
  });

  stage.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const fretCell = t.closest<HTMLElement>('.js-studio-fret');
    if (fretCell) {
      const midi = parseInt(fretCell.getAttribute('data-midi') || '-1', 10);
      const sIdx = parseInt(fretCell.getAttribute('data-sidx') || '-1', 10);
      const fret = parseInt(fretCell.getAttribute('data-fret') || '-1', 10);
      if (midi >= 0) {
        audio.playPluckedGuitar(midi, 1.1, 0, 0.28, true, {
          sIdx,
          fret,
          scopeEl: fretCell.closest<HTMLElement>('.fretboard-wrapper'),
        });
      }
      return;
    }
    const cell = t.closest<HTMLElement>('.js-strum-cell');
    if (cell) {
      const sidx = parseInt(cell.getAttribute('data-sidx')!, 10);
      const order: StrumToken[] = ['D', 'd', 'U', 'X', '-'];
      const cur = customPattern[sidx];
      customPattern[sidx] = order[(order.indexOf(cur) + 1) % order.length];
      renderGridOnly();
      return;
    }
    const pill = t.closest<HTMLElement>('.js-strum-chord-pill');
    if (pill) {
      activeChordIdx = parseInt(pill.getAttribute('data-cidx')!, 10);
      const prog = PROGRESSIONS[activeProgKey];
      const curChord = prog.chords[activeChordIdx];
      renderGridOnly();
      playStrumStep('D', fretsToMidis(curChord.frets));
      return;
    }
    if (t.closest('.js-strum-play')) {
      if (isPlaying) stopPlay();
      else startPlay();
      return;
    }
    if (t.closest('.js-strum-drill')) {
      activePresetIdx = 2; // Funk mute drill
      customPattern = [...PATTERNS[2].pattern];
      bpm = 78;
      const sel = stage.querySelector<HTMLSelectElement>('.js-strum-preset');
      if (sel) sel.value = '2';
      startPlay();
      onStatus('Ejercicio Guiado: Acentúa ↓ y corta limpiamente en ✕ sin detener el péndulo');
    }
  });
}

/**
 * LAB C: Interactive Score Writer + Band Lead Sheets / Nashville + 2, 3 & 4-Voice Harmonizer
 */
function buildNotationWriterLab(
  stage: HTMLElement,
  audio: StudioAudioPort,
  onStatus: (msg: string) => void,
  initialPreset = ''
): void {
  type WriterTab = 'score' | 'band' | 'voices';
  let activeTab: WriterTab =
    initialPreset === 'band' ? 'band' : initialPreset === 'voices' ? 'voices' : 'score';

  // Tab 1 State: Score Builder
  let clef: 'treble' | 'bass' | 'alto' = 'treble';
  let meter: '4/4' | '3/4' | '6/8' = '4/4';
  let durationBeat = 1; // 4=whole, 2=half, 1=quarter, 0.5=eighth, 0=rest
  let isRestMode = false;
  let scoreNotes: { midi: number; beats: number; rest: boolean }[] = [
    { midi: 64, beats: 1, rest: false },
    { midi: 64, beats: 1, rest: false },
    { midi: 65, beats: 1, rest: false },
    { midi: 67, beats: 1, rest: false },
    { midi: 67, beats: 1, rest: false },
    { midi: 65, beats: 1, rest: false },
    { midi: 64, beats: 1, rest: false },
    { midi: 62, beats: 1, rest: false },
  ];
  let playingNoteIdx = -1;

  // Tab 2 State: Nashville & Lead Sheet Band Charts
  let origKeyPc = 0;
  let targetKeyPc = 7;
  let progPresetIdx = 0;
  const BAND_PROGS: { label: string; chords: NashvilleChordInput[]; kicks: boolean[] }[] = [
    {
      label: '1 – 6m – 4 – 57 (Pop / Balada)',
      chords: [
        { rootPc: 0, quality: 'maj' },
        { rootPc: 9, quality: 'min' },
        { rootPc: 5, quality: 'maj' },
        { rootPc: 7, quality: 'dom7' },
      ],
      kicks: [true, false, true, false, true, true, false, true],
    },
    {
      label: '2m7 – 57 – 1maj7 – 6m7 (Jazz / Neo-Soul)',
      chords: [
        { rootPc: 2, quality: 'm7' },
        { rootPc: 7, quality: 'dom7' },
        { rootPc: 0, quality: 'maj7' },
        { rootPc: 9, quality: 'm7' },
      ],
      kicks: [true, false, false, true, true, false, true, false],
    },
    {
      label: '1 – 4 – 1 – 57 (Rock / Country)',
      chords: [
        { rootPc: 0, quality: 'maj' },
        { rootPc: 5, quality: 'maj' },
        { rootPc: 0, quality: 'maj' },
        { rootPc: 7, quality: 'dom7' },
      ],
      kicks: [true, false, true, false, true, false, true, true],
    },
  ];

  // Tab 3 State: 2, 3, 4 Voice Harmonizer
  let voiceCount: 2 | 3 | 4 = 3;
  const harmKeyPc = 0;
  let harmMelody = [64, 65, 67, 72]; // E4 F4 G4 C5

  const clefBaseMidi = () => (clef === 'treble' ? 64 : clef === 'bass' ? 43 : 53); // Bottom line E4 / G2 / F3
  const clefRangeMidis = () =>
    clef === 'treble'
      ? [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77] // C4..F5
      : clef === 'bass'
        ? [40, 41, 43, 45, 47, 48, 50, 52, 53, 55, 57] // E2..A3
        : [50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67]; // D3..G4

  const diatonicStepFromC = (midi: number): number => {
    const oct = Math.floor(midi / 12) - 1;
    const pc = ((midi % 12) + 12) % 12;
    const pcSteps: Record<number, number> = {
      0: 0, 1: 0, 2: 1, 3: 1, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 5, 10: 5, 11: 6,
    };
    return oct * 7 + (pcSteps[pc] ?? 0);
  };

  const renderStaffSvg = (notes: { midi: number; beats: number; rest: boolean }[]): string => {
    const w = 680;
    const h = 150;
    const bottomLineY = 104;
    const stepPx = 6.5;
    const baseStep = diatonicStepFromC(clefBaseMidi());

    const lines = Array.from({ length: 5 }, (_, i) => {
      const y = bottomLineY - i * (stepPx * 2);
      return `<line x1="20" y1="${y}" x2="${w - 20}" y2="${y}" stroke="#475569" stroke-width="1.3" />`;
    }).join('');

    const clefGlyph = clef === 'treble' ? '𝄞 Sol' : clef === 'bass' ? '𝄢 Fa' : '𝄡 Do 3ª';
    const noteItems = notes
      .map((n, idx) => {
        const x = 105 + idx * 54;
        const isPlay = idx === playingNoteIdx;
        const col = isPlay ? '#fbbf24' : '#38bdf8';
        if (n.rest) {
          return `
            <g class="js-score-note-item" data-idx="${idx}" style="cursor:pointer;">
              <rect x="${x - 8}" y="72" width="16" height="8" rx="2" fill="${col}" />
              <text x="${x}" y="136" text-anchor="middle" fill="#94a3b8" font-size="9">Sil(${n.beats}t)</text>
            </g>
          `;
        }
        const stepsAbove = diatonicStepFromC(n.midi) - baseStep;
        const y = bottomLineY - stepsAbove * stepPx;
        const hollow = n.beats >= 2;
        const stemUp = stepsAbove < 4;
        const stemX = stemUp ? x + 6 : x - 6;
        const stemY2 = stemUp ? y - 28 : y + 28;
        const ledger =
          stepsAbove < -1 || stepsAbove > 9
            ? `<line x1="${x - 11}" y1="${y}" x2="${x + 11}" y2="${y}" stroke="#94a3b8" stroke-width="1.4" />`
            : '';
        const flag = n.beats < 1 ? `<path d="M ${stemX} ${stemY2} Q ${stemX + 10} ${stemY2 + 6} ${stemX + 8} ${stemY2 + 16}" fill="none" stroke="${col}" stroke-width="2" />` : '';

        return `
          <g class="js-score-note-item" data-idx="${idx}" style="cursor:pointer;">
            ${ledger}
            <ellipse cx="${x}" cy="${y}" rx="7" ry="5" fill="${hollow ? '#090d16' : col}" stroke="${col}" stroke-width="2" transform="rotate(-18 ${x} ${y})" />
            ${n.beats < 4 ? `<line x1="${stemX}" y1="${y}" x2="${stemX}" y2="${stemY2}" stroke="${col}" stroke-width="1.8" />` : ''}
            ${flag}
            <text x="${x}" y="138" text-anchor="middle" fill="#cbd5e1" font-size="9.5" font-weight="700">${midiToNoteName(n.midi)}</text>
          </g>
        `;
      })
      .join('');

    return `
      <svg viewBox="0 0 ${w} ${h}" style="width:100%; background:#090d16; border:1px solid #1e293b; border-radius:10px;">
        ${lines}
        <text x="32" y="84" fill="#fbbf24" font-size="16" font-weight="800">${clefGlyph}</text>
        <text x="72" y="75" fill="#e2e8f0" font-size="14" font-weight="900">${meter.split('/')[0]}</text>
        <text x="72" y="96" fill="#e2e8f0" font-size="14" font-weight="900">${meter.split('/')[1]}</text>
        ${noteItems}
      </svg>
    `;
  };

  const renderVoicesStaffSvg = (): string => {
    const harm = harmonizeMelodyVoices(harmMelody, harmKeyPc, voiceCount);
    const w = 660;
    const h = 165;
    const bottomLineY = 112;
    const stepPx = 6.2;
    const baseStep = diatonicStepFromC(64); // Treble staff bottom E4

    const lines = Array.from({ length: 5 }, (_, i) => {
      const y = bottomLineY - i * (stepPx * 2);
      return `<line x1="20" y1="${y}" x2="${w - 20}" y2="${y}" stroke="#475569" stroke-width="1.2" />`;
    }).join('');

    const cols = harm
      .map((step, cIdx) => {
        const x = 135 + cIdx * 125;
        const warn = step.parallelFifthWarning || step.parallelOctaveWarning;
        const notesHtml = step.voices
          .map((vm, vIdx) => {
            const st = diatonicStepFromC(vm) - baseStep;
            const y = bottomLineY - st * stepPx;
            const isLead = vIdx === step.voices.length - 1;
            const col = isLead ? '#f472b6' : vIdx === 0 ? '#fbbf24' : '#38bdf8';
            const ledger =
              st <= -2 ? `<line x1="${x - 10}" y1="${y}" x2="${x + 10}" y2="${y}" stroke="#94a3b8" stroke-width="1.3" />` : '';
            return `${ledger}<ellipse cx="${x}" cy="${y}" rx="6.5" ry="4.5" fill="${col}" transform="rotate(-15 ${x} ${y})" />`;
          })
          .join('');
        const tag = warn
          ? `<text x="${x}" y="22" text-anchor="middle" fill="#fb7185" font-size="10" font-weight="800">⚠️ 5ª/8ª Paralela</text>`
          : `<text x="${x}" y="22" text-anchor="middle" fill="#34d399" font-size="10" font-weight="700">✓ Voces Limpias</text>`;
        const labels = step.voices.map((m) => LOGIC_NOTE_NAMES[m % 12]).join('-');
        return `
          <g class="js-harm-col" data-cidx="${cIdx}" style="cursor:pointer;">
            ${tag}
            ${notesHtml}
            <text x="${x}" y="152" text-anchor="middle" fill="#e2e8f0" font-size="10.5" font-weight="700">${labels}</text>
          </g>
        `;
      })
      .join('');

    return `
      <svg viewBox="0 0 ${w} ${h}" style="width:100%; background:#090d16; border:1px solid #1e293b; border-radius:10px;">
        ${lines}
        <text x="34" y="88" fill="#fbbf24" font-size="15" font-weight="800">𝄞 ${voiceCount}V</text>
        ${cols}
      </svg>
    `;
  };

  const render = () => {
    const tabBtns = `
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
        <button type="button" class="btn js-nw-tab ${activeTab === 'score' ? 'active' : ''}" data-tab="score">🎼 1. Escritor de Pentagrama (Sol/Fa/Do 3ª)</button>
        <button type="button" class="btn js-nw-tab ${activeTab === 'band' ? 'active' : ''}" data-tab="band">🎺 2. Escritura Práctica de Banda (Kicks & Nashville)</button>
        <button type="button" class="btn js-nw-tab ${activeTab === 'voices' ? 'active' : ''}" data-tab="voices">🎶 3. Arreglo Escrito a 2, 3 y 4 Voces</button>
      </div>
    `;

    let body = '';

    if (activeTab === 'score') {
      const pitchBtns = clefRangeMidis()
        .map(
          (m) =>
            `<button type="button" class="btn js-nw-add-note" data-midi="${m}" style="padding:4px 8px; font-size:0.75rem;">+ ${midiToNoteName(m)}</button>`
        )
        .join('');
      body = `
        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; margin-bottom:10px;">
          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <select class="lab-select js-nw-clef" aria-label="Clave musical">
              <option value="treble" ${clef === 'treble' ? 'selected' : ''}>Clave de Sol (Guitarra / Voz / Piano)</option>
              <option value="bass" ${clef === 'bass' ? 'selected' : ''}>Clave de Fa 4ª (Bajo / Chelo / Trombón)</option>
              <option value="alto" ${clef === 'alto' ? 'selected' : ''}>Clave de Do 3ª (Viola)</option>
            </select>
            <select class="lab-select js-nw-meter" aria-label="Compás">
              <option value="4/4" ${meter === '4/4' ? 'selected' : ''}>4/4</option>
              <option value="3/4" ${meter === '3/4' ? 'selected' : ''}>3/4</option>
              <option value="6/8" ${meter === '6/8' ? 'selected' : ''}>6/8</option>
            </select>
            <select class="lab-select js-nw-dur" aria-label="Figura rítmica">
              <option value="4" ${!isRestMode && durationBeat === 4 ? 'selected' : ''}>𝅝 Redonda (4t)</option>
              <option value="2" ${!isRestMode && durationBeat === 2 ? 'selected' : ''}>𝅗𝅥 Blanca (2t)</option>
              <option value="1" ${!isRestMode && durationBeat === 1 ? 'selected' : ''}>♩ Negra (1t)</option>
              <option value="0.5" ${!isRestMode && durationBeat === 0.5 ? 'selected' : ''}>♪ Corchea (1/2t)</option>
              <option value="rest1" ${isRestMode ? 'selected' : ''}>𝄽 Silencio (1t)</option>
            </select>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            <button type="button" class="btn btn-primary js-nw-play-score">▶ Tocar Partitura</button>
            <button type="button" class="btn js-nw-undo">⌫ Borrar Última</button>
            <button type="button" class="btn js-nw-clear">🗑 Limpiar</button>
          </div>
        </div>
        <div style="margin-bottom:10px;">${renderStaffSvg(scoreNotes)}</div>
        <div style="display:flex; flex-wrap:wrap; gap:5px; align-items:center;">
          <span class="text-xs" style="color:#94a3b8; font-weight:700; margin-right:4px;">Añadir nota al compás:</span>
          ${pitchBtns}
        </div>
      `;
    } else if (activeTab === 'band') {
      const bp = BAND_PROGS[progPresetIdx];
      const converted = convertProgressionToNashville(origKeyPc, bp.chords, targetKeyPc);
      body = `
        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
            <select class="lab-select js-band-prog" aria-label="Progresión de banda">
              ${BAND_PROGS.map((p, idx) => `<option value="${idx}" ${idx === progPresetIdx ? 'selected' : ''}>${p.label}</option>`).join('')}
            </select>
            <label class="text-xs" style="color:#cbd5e1;">Tono Original:
              <select class="lab-select js-band-orig-key">
                ${LOGIC_NOTE_NAMES.map((n, i) => `<option value="${i}" ${i === origKeyPc ? 'selected' : ''}>${n}</option>`).join('')}
              </select>
            </label>
            <label class="text-xs" style="color:#fbbf24;">Transportar para Banda a:
              <select class="lab-select js-band-targ-key">
                ${LOGIC_NOTE_NAMES.map((n, i) => `<option value="${i}" ${i === targetKeyPc ? 'selected' : ''}>${n}</option>`).join('')}
              </select>
            </label>
          </div>
          <button type="button" class="btn btn-primary js-band-play">▶ Escuchar Guía de Banda en ${LOGIC_NOTE_NAMES[targetKeyPc]}</button>
        </div>

        <div class="grid-2" style="margin-bottom:10px;">
          <div class="card">
            <h4 style="color:#38bdf8;">🔢 Sistema Nashville Universal (Independiente del Tono)</h4>
            <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">
              ${converted
                .map(
                  (c, idx) => `
                  <div style="background:#090d16; border:1px solid #334155; border-radius:8px; padding:8px 12px; min-width:85px; text-align:center;">
                    <div style="font-size:0.68rem; color:#94a3b8;">Compás ${idx + 1}</div>
                    <div style="font-size:1.15rem; font-weight:900; color:#fbbf24;">${c.nashville}</div>
                    <div style="font-size:0.75rem; color:#38bdf8;">${c.transposedSymbol}</div>
                  </div>
                `
                )
                .join('')}
            </div>
          </div>
          <div class="card">
            <h4 style="color:#f472b6;">♦ Kicks / Cortes Rítmicos de Banda (Haz clic para activar cortes)</h4>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(46px, 1fr)); gap:5px; margin-top:8px;">
              ${bp.kicks
                .map(
                  (on, kIdx) => `
                  <button type="button" class="js-band-kick" data-kidx="${kIdx}" style="padding:8px 2px; border-radius:6px; border:1px solid ${on ? '#f472b6' : '#334155'}; background:${on ? 'rgba(244,114,182,0.22)' : '#090d16'}; color:${on ? '#f472b6' : '#64748b'}; font-weight:900; cursor:pointer;">
                    ${on ? '♦' : '—'}<br><span style="font-size:0.65rem;">${kIdx % 2 === 0 ? Math.floor(kIdx / 2) + 1 : '&'}</span>
                  </button>
                `
                )
                .join('')}
            </div>
          </div>
        </div>
      `;
    } else {
      const harm = harmonizeMelodyVoices(harmMelody, harmKeyPc, voiceCount);
      body = `
        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; margin-bottom:10px;">
          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <button type="button" class="btn js-harm-vc ${voiceCount === 2 ? 'active' : ''}" data-vc="2">2 Voces (3ªs/6ªs)</button>
            <button type="button" class="btn js-harm-vc ${voiceCount === 3 ? 'active' : ''}" data-vc="3">3 Voces (Tríada Cerrada)</button>
            <button type="button" class="btn js-harm-vc ${voiceCount === 4 ? 'active' : ''}" data-vc="4">4 Voces (Drop 2 / SATB)</button>
            <select class="lab-select js-harm-melody" aria-label="Melodía guía">
              <option value="up" ${harmMelody[0] === 64 ? 'selected' : ''}>Melodía Ascendente (Mi–Fa–Sol–Do)</option>
              <option value="arch" ${harmMelody[0] === 67 ? 'selected' : ''}>Arco Lírico (Sol–La–Sol–Mi)</option>
              <option value="cad" ${harmMelody[0] === 72 ? 'selected' : ''}>Descenso Coral (Do5–Si–La–Sol)</option>
            </select>
          </div>
          <button type="button" class="btn btn-primary js-harm-play">▶ Escuchar Arreglo a ${voiceCount} Voces</button>
        </div>
        <div style="margin-bottom:8px;">${renderVoicesStaffSvg()}</div>
        <p class="text-xs" style="color:#cbd5e1; margin:0;">
          ${harm.some((s) => s.parallelFifthWarning)
            ? '⚠️ En bloques paralelos cerrados a 3 voces aparecen <strong>quintas paralelas</strong> útiles en pop/rock, pero evitadas en coral clásico. Cambia a <strong>4 Voces Drop 2</strong> para abrir el registro como un cuarteto de cuerdas o metales.'
            : '✓ Arreglo con conducción equilibrada entre la melodía (Rosa), voces internas (Cian) y el bajo (Dorado). Haz clic en cualquier compás del pentagrama para audicionarlo.'}
        </p>
      `;
    }

    stage.innerHTML = `${tabBtns}${body}`;
  };

  render();

  stage.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const tabBtn = t.closest<HTMLElement>('.js-nw-tab');
    if (tabBtn) {
      activeTab = (tabBtn.getAttribute('data-tab') as WriterTab) || 'score';
      render();
      return;
    }
    const addNote = t.closest<HTMLElement>('.js-nw-add-note');
    if (addNote) {
      const midi = parseInt(addNote.getAttribute('data-midi')!, 10);
      if (scoreNotes.length >= 10) scoreNotes.shift();
      scoreNotes.push({ midi, beats: durationBeat, rest: isRestMode });
      if (!isRestMode) audio.playAcousticPiano(midi, 0.5, 0, 0.25, true);
      render();
      return;
    }
    if (t.closest('.js-nw-undo')) {
      scoreNotes.pop();
      render();
      return;
    }
    if (t.closest('.js-nw-clear')) {
      scoreNotes = [];
      render();
      return;
    }
    if (t.closest('.js-nw-play-score')) {
      if (scoreNotes.length === 0) return;
      audio.stopAll();
      let accMs = 0;
      scoreNotes.forEach((n, idx) => {
        const ms = n.beats * 460;
        audio.schedule(() => {
          playingNoteIdx = idx;
          if (!n.rest) {
            if (clef === 'bass') audio.playElectricBass(n.midi, n.beats * 0.42, 0, 0.34, 'finger', false);
            else audio.playAcousticPiano(n.midi, n.beats * 0.42, 0, 0.25, false);
          }
          render();
        }, accMs);
        accMs += ms;
      });
      audio.schedule(() => {
        playingNoteIdx = -1;
        render();
      }, accMs + 80);
      onStatus(`Partitura en Clave de ${clef === 'treble' ? 'Sol' : clef === 'bass' ? 'Fa' : 'Do 3ª'} (${meter})`);
      return;
    }
    const kickBtn = t.closest<HTMLElement>('.js-band-kick');
    if (kickBtn) {
      const kIdx = parseInt(kickBtn.getAttribute('data-kidx')!, 10);
      BAND_PROGS[progPresetIdx].kicks[kIdx] = !BAND_PROGS[progPresetIdx].kicks[kIdx];
      render();
      return;
    }
    if (t.closest('.js-band-play')) {
      const bp = BAND_PROGS[progPresetIdx];
      audio.stopAll();
      bp.chords.forEach((ch, ci) => {
        const tRoot = (targetKeyPc + ((ch.rootPc - origKeyPc + 12) % 12)) % 12;
        const base = 48 + tRoot;
        const offsets =
          ch.quality === 'min'
            ? [0, 3, 7]
            : ch.quality === 'm7'
              ? [0, 3, 7, 10]
              : ch.quality === 'dom7'
                ? [0, 4, 7, 10]
                : ch.quality === 'maj7'
                  ? [0, 4, 7, 11]
                  : [0, 4, 7];
        const chordMidis = offsets.map((o) => base + o);
        audio.schedule(() => {
          audio.playElectricBass(36 + tRoot, 0.9, 0, 0.34, 'finger', false);
          audio.strumChord(chordMidis, 'piano', 0, false);
          if (bp.kicks[ci * 2] || bp.kicks[ci * 2 + 1]) {
            audio.playDrumHit('crash', 0);
          }
        }, ci * 860);
      });
      onStatus(`Reproduciendo Lead Sheet en ${LOGIC_NOTE_NAMES[targetKeyPc]} (Sistema Nashville)`);
      return;
    }
    const vcBtn = t.closest<HTMLElement>('.js-harm-vc');
    if (vcBtn) {
      voiceCount = (parseInt(vcBtn.getAttribute('data-vc')!, 10) as 2 | 3 | 4) || 3;
      render();
      return;
    }
    const harmCol = t.closest<HTMLElement>('.js-harm-col');
    if (harmCol) {
      const cIdx = parseInt(harmCol.getAttribute('data-cidx')!, 10);
      const harm = harmonizeMelodyVoices(harmMelody, harmKeyPc, voiceCount);
      if (harm[cIdx]) {
        audio.stopAll();
        audio.strumChord(harm[cIdx].voices, 'piano', 0, false);
      }
      return;
    }
    if (t.closest('.js-harm-play')) {
      const harm = harmonizeMelodyVoices(harmMelody, harmKeyPc, voiceCount);
      audio.stopAll();
      harm.forEach((step, idx) => {
        audio.schedule(() => {
          audio.strumChord(step.voices, 'piano', 0, false);
        }, idx * 620);
      });
      onStatus(`Arreglo Coral/Metales a ${voiceCount} Voces`);
    }
  });

  stage.addEventListener('change', (e) => {
    const t = e.target as HTMLSelectElement;
    if (t.classList.contains('js-nw-clef')) {
      clef = t.value as 'treble' | 'bass' | 'alto';
      scoreNotes = clefRangeMidis().slice(2, 6).map((m) => ({ midi: m, beats: 1, rest: false }));
      render();
    } else if (t.classList.contains('js-nw-meter')) {
      meter = t.value as '4/4' | '3/4' | '6/8';
      render();
    } else if (t.classList.contains('js-nw-dur')) {
      if (t.value === 'rest1') {
        isRestMode = true;
        durationBeat = 1;
      } else {
        isRestMode = false;
        durationBeat = parseFloat(t.value);
      }
      render();
    } else if (t.classList.contains('js-band-prog')) {
      progPresetIdx = parseInt(t.value, 10);
      render();
    } else if (t.classList.contains('js-band-orig-key')) {
      origKeyPc = parseInt(t.value, 10);
      render();
    } else if (t.classList.contains('js-band-targ-key')) {
      targetKeyPc = parseInt(t.value, 10);
      render();
    } else if (t.classList.contains('js-harm-melody')) {
      if (t.value === 'arch') harmMelody = [67, 69, 67, 64];
      else if (t.value === 'cad') harmMelody = [72, 71, 69, 67];
      else harmMelody = [64, 65, 67, 72];
      render();
    }
  });
}

/**
 * LAB D: Synced Drum Staff + Gap Click Internal Tempo Trainer + Kit Techniques Lab
 */
function buildDrumProLab(
  stage: HTMLElement,
  audio: StudioAudioPort,
  onStatus: (msg: string) => void,
  initialPreset = ''
): void {
  type DrumTab = 'staff' | 'gap' | 'kit';
  let activeTab: DrumTab =
    initialPreset === 'gap' ? 'gap' : initialPreset === 'kit' ? 'kit' : 'staff';

  // Tab 1: Synced 16-step PAS drum staff
  let grid = {
    HH: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    SD: [0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0], // ghost note options supported
    BD: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  };
  let drumBpm = 94;
  let staffPlaying = false;
  let staffStep = -1;
  let staffTimer: ReturnType<typeof setInterval> | null = null;

  // Tab 2: Gap Click
  let gapBpm = 88;
  let gapBarsOn = 2;
  let gapBarsSilent = 1;
  let gapRunning = false;
  let gapTimer: ReturnType<typeof setInterval> | null = null;
  let gapStartTimeMs = 0;
  let gapBeatCounter = 0;
  let gapInSilentZone = false;
  let lastGapEval = 'Pulsa "Iniciar Gap Click" y toca TAP / ESPACIO manteniendo el pulso durante el silencio.';

  const stopAllDrums = () => {
    staffPlaying = false;
    staffStep = -1;
    if (staffTimer) {
      clearInterval(staffTimer);
      staffTimer = null;
    }
    gapRunning = false;
    if (gapTimer) {
      clearInterval(gapTimer);
      gapTimer = null;
    }
  };

  const renderDrumStaffSvg = (): string => {
    const w = 680;
    const h = 152;
    const lineYs = [42, 56, 70, 84, 98]; // Top line 5 (F5=42) -> bottom line 1 (E4=98)
    const lines = lineYs
      .map((y) => `<line x1="20" y1="${y}" x2="${w - 20}" y2="${y}" stroke="#475569" stroke-width="1.3" />`)
      .join('');

    const stepCols = Array.from({ length: 16 }, (_, i) => {
      const x = 96 + i * 35.5;
      const isCur = staffStep === i;
      const barLine = i > 0 && i % 4 === 0 ? `<line x1="${x - 16}" y1="42" x2="${x - 16}" y2="98" stroke="#334155" stroke-dasharray="3,3" />` : '';
      const playHead = isCur ? `<rect x="${x - 12}" y="22" width="24" height="96" rx="5" fill="rgba(245,158,11,0.22)" stroke="#fbbf24" />` : '';
      const hhMark = grid.HH[i]
        ? `<text x="${x}" y="38" text-anchor="middle" fill="#38bdf8" font-size="14" font-weight="900">✕</text>`
        : '';
      const sdVal = grid.SD[i];
      const sdMark =
        sdVal === 2
          ? `<text x="${x}" y="67" text-anchor="middle" fill="#a78bfa" font-size="12" font-weight="800">(●)</text>`
          : sdVal === 1
            ? `<circle cx="${x}" cy="63" r="5.5" fill="#fb7185" />`
            : '';
      const bdMark = grid.BD[i]
        ? `<circle cx="${x}" cy="91" r="6" fill="#34d399" />`
        : '';

      return `${barLine}${playHead}${hhMark}${sdMark}${bdMark}<text x="${x}" y="135" text-anchor="middle" fill="${isCur ? '#fbbf24' : '#94a3b8'}" font-size="9.5" font-weight="700">${i % 4 === 0 ? Math.floor(i / 4) + 1 : i % 4 === 2 ? 'y' : '·'}</text>`;
    }).join('');

    return `
      <svg viewBox="0 0 ${w} ${h}" style="width:100%; background:#090d16; border:1px solid #1e293b; border-radius:10px;">
        ${lines}
        <rect x="34" y="56" width="6" height="28" fill="#cbd5e1" rx="2" />
        <rect x="44" y="56" width="6" height="28" fill="#cbd5e1" rx="2" />
        <text x="58" y="38" fill="#38bdf8" font-size="9">HH</text>
        <text x="58" y="66" fill="#fb7185" font-size="9">SD</text>
        <text x="58" y="94" fill="#34d399" font-size="9">BD</text>
        ${stepCols}
      </svg>
    `;
  };

  const render = () => {
    const tabs = `
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
        <button type="button" class="btn js-dp-tab ${activeTab === 'staff' ? 'active' : ''}" data-tab="staff">🥁 1. Pentagrama PAS Sincronizado</button>
        <button type="button" class="btn js-dp-tab ${activeTab === 'gap' ? 'active' : ''}" data-tab="gap">⏱️ 2. Entrenador de Tempo Interno (Gap Click)</button>
        <button type="button" class="btn js-dp-tab ${activeTab === 'kit' ? 'active' : ''}" data-tab="kit">🎛️ 3. Técnicas, Afinación y Sonido del Kit</button>
      </div>
    `;

    let body = '';
    if (activeTab === 'staff') {
      const makeRow = (label: string, key: 'HH' | 'SD' | 'BD', colorClass: string) =>
        `<div class="seq-label">${label}</div>` +
        grid[key]
          .map(
            (val, i) =>
              `<button type="button" class="seq-cell js-dp-cell ${val ? colorClass : ''} ${staffStep === i ? 'playing-step' : ''}" data-row="${key}" data-idx="${i}">${val === 2 ? 'g' : val === 1 ? '●' : ''}</button>`
          )
          .join('');

      body = `
        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
            <label class="text-xs" style="color:#cbd5e1;">BPM: <strong class="js-dp-bpm-val">${drumBpm}</strong>
              <input type="range" class="js-dp-bpm" min="65" max="135" value="${drumBpm}" style="width:95px;" />
            </label>
            <button type="button" class="btn js-dp-preset" data-p="rock">Rock Clásico</button>
            <button type="button" class="btn js-dp-preset" data-p="funk">Funk + Ghost Notes</button>
          </div>
          <button type="button" class="btn btn-primary js-dp-play">${staffPlaying ? '⏹ Detener' : '▶ Reproducir Pentagrama'}</button>
        </div>
        <div style="margin-bottom:10px;">${renderDrumStaffSvg()}</div>
        <div class="seq-grid">
          ${makeRow('Hi-Hat (✕)', 'HH', 'on')}
          ${makeRow('Caja / Ghost', 'SD', 'on-gold')}
          ${makeRow('Bombo (●)', 'BD', 'on')}
        </div>
      `;
    } else if (activeTab === 'gap') {
      const beatLabel = gapRunning
        ? gapInSilentZone
          ? '🤫 COMPÁS EN SILENCIO (¡Mantén tu pulso interno y presiona TAP!)'
          : `🔊 Escucha el Click (Tiempo ${(gapBeatCounter % 4) + 1}/4)`
        : 'Listo para entrenar tu reloj interno';

      body = `
        <div class="grid-2" style="align-items:center;">
          <div class="card">
            <h4 style="color:#fbbf24;">⏱️ Configuración del Gap Click</h4>
            <div style="display:flex; flex-wrap:wrap; gap:8px; margin:8px 0;">
              <label class="text-xs">BPM: <strong>${gapBpm}</strong>
                <input type="range" class="js-gap-bpm" min="60" max="135" value="${gapBpm}" style="width:100px;" />
              </label>
              <label class="text-xs">Compases con Click:
                <select class="lab-select js-gap-on">
                  <option value="1" ${gapBarsOn === 1 ? 'selected' : ''}>1 compás</option>
                  <option value="2" ${gapBarsOn === 2 ? 'selected' : ''}>2 compases</option>
                </select>
              </label>
              <label class="text-xs">Compases en Silencio:
                <select class="lab-select js-gap-off">
                  <option value="1" ${gapBarsSilent === 1 ? 'selected' : ''}>1 compás</option>
                  <option value="2" ${gapBarsSilent === 2 ? 'selected' : ''}>2 compases</option>
                </select>
              </label>
            </div>
            <button type="button" class="btn btn-primary js-gap-toggle">${gapRunning ? '⏹ Detener Gap Click' : '▶ Iniciar Gap Click'}</button>
            <p class="text-xs" style="color:${gapInSilentZone ? '#fbbf24' : '#38bdf8'}; font-weight:700; margin-top:10px;">${beatLabel}</p>
          </div>
          <div class="card" style="text-align:center;">
            <button type="button" class="btn btn-primary js-gap-tap" style="width:100%; padding:22px 12px; font-size:1.1rem; background:${gapInSilentZone ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#38bdf8,#0284c7)'}; color:#090c12;">
              🥁 PULSA AQUÍ EN EL TIEMPO 1 (TAP)
            </button>
            <p class="text-sm js-gap-feedback" style="color:#f8fafc; font-weight:700; margin-top:10px;">${lastGapEval}</p>
          </div>
        </div>
      `;
    } else {
      body = `
        <div class="grid-cards">
          <div class="card">
            <h4>1. Afinación de Toms por Intervalos (3ª/4ª)</h4>
            <p class="text-xs">Afina Tom 1, Tom 2 y Tom de Piso en intervalos claros (4ª o 3ª descendentes) para que los fills suenen musicales y sin vibraciones raras.</p>
            <button type="button" class="btn-audio js-kit-demo" data-k="toms">🔊 Escuchar Escalera T1 → T2 → FT</button>
          </div>
          <div class="card">
            <h4>2. Rimshot vs. Cross-Stick (Aro)</h4>
            <p class="text-xs">El <strong>Rimshot</strong> golpea parche y aro a la vez (máxima proyección rock); el <strong>Cross-Stick</strong> apoya la palma y golpea el aro (balada/bossa).</p>
            <button type="button" class="btn-audio js-kit-demo" data-k="rim">🔊 Rimshot vs. Cross-Stick</button>
          </div>
          <div class="card">
            <h4>3. Ghost Notes vs. Acento en Caja</h4>
            <p class="text-xs">Alternar golpes suaves a 2 cm del parche (<em>ghost</em>) con el acento fuerte en 2 y 4 multiplica el groove sin subir el volumen.</p>
            <button type="button" class="btn-audio js-kit-demo" data-k="ghost">🔊 Ghost Notes + Acento</button>
          </div>
          <div class="card">
            <h4>4. Escobillas (Brushes Sweep) & Apagado</h4>
            <p class="text-xs">Barrido circular continuo con escobillas para Jazz/Bolero, y uso de sordinas/gel para acortar la cola de resonancia en estudio.</p>
            <button type="button" class="btn-audio js-kit-demo" data-k="brushes">🔊 Escobillas Jazz</button>
          </div>
        </div>
      `;
    }

    stage.innerHTML = `${tabs}${body}`;
  };

  render();

  const toggleStaffPlay = () => {
    if (staffPlaying) {
      stopAllDrums();
      render();
      return;
    }
    stopAllDrums();
    staffPlaying = true;
    const stepMs = (60000 / drumBpm) / 4;
    let step = 0;
    const tick = () => {
      if (!staffPlaying) return;
      staffStep = step % 16;
      if (grid.HH[staffStep]) audio.playDrumHit('hihat', 0);
      if (grid.SD[staffStep] === 2) audio.playDrumHit('ghost', 0);
      else if (grid.SD[staffStep] === 1) audio.playDrumHit('snare', 0);
      if (grid.BD[staffStep]) audio.playDrumHit('kick', 0);
      render();
      step++;
    };
    tick();
    staffTimer = setInterval(tick, stepMs);
    onStatus(`Pentagrama de Batería PAS en vivo a ${drumBpm} BPM`);
  };

  const toggleGapClick = () => {
    if (gapRunning) {
      stopAllDrums();
      render();
      return;
    }
    stopAllDrums();
    gapRunning = true;
    gapBeatCounter = 0;
    gapStartTimeMs = performance.now();
    const beatMs = 60000 / gapBpm;
    const cycleBeats = (gapBarsOn + gapBarsSilent) * 4;
    const activeBeats = gapBarsOn * 4;

    const tick = () => {
      if (!gapRunning) return;
      const pos = gapBeatCounter % cycleBeats;
      gapInSilentZone = pos >= activeBeats;
      if (!gapInSilentZone) {
        audio.playDrumHit(pos % 4 === 0 ? 'clap' : 'hihat', 0);
      }
      render();
      gapBeatCounter++;
    };
    tick();
    gapTimer = setInterval(tick, beatMs);
    onStatus(`Gap Click activo: ${gapBarsOn} compás sonando → ${gapBarsSilent} compás en silencio`);
  };

  stage.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const tabBtn = t.closest<HTMLElement>('.js-dp-tab');
    if (tabBtn) {
      stopAllDrums();
      activeTab = (tabBtn.getAttribute('data-tab') as DrumTab) || 'staff';
      render();
      return;
    }
    const cell = t.closest<HTMLElement>('.js-dp-cell');
    if (cell) {
      const row = cell.getAttribute('data-row') as 'HH' | 'SD' | 'BD';
      const idx = parseInt(cell.getAttribute('data-idx')!, 10);
      if (row === 'SD') {
        grid.SD[idx] = (grid.SD[idx] + 1) % 3; // 0 -> 1 (accent) -> 2 (ghost)
      } else {
        grid[row][idx] = grid[row][idx] ? 0 : 1;
      }
      render();
      return;
    }
    const presetBtn = t.closest<HTMLElement>('.js-dp-preset');
    if (presetBtn) {
      const p = presetBtn.getAttribute('data-p');
      if (p === 'rock') {
        grid = {
          HH: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
          SD: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
          BD: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
        };
      } else {
        grid = {
          HH: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
          SD: [0, 0, 0, 2, 1, 0, 0, 2, 0, 2, 0, 0, 1, 0, 2, 0],
          BD: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        };
      }
      render();
      return;
    }
    if (t.closest('.js-dp-play')) {
      toggleStaffPlay();
      return;
    }
    if (t.closest('.js-gap-toggle')) {
      toggleGapClick();
      return;
    }
    if (t.closest('.js-gap-tap')) {
      if (!gapRunning) {
        lastGapEval = 'Inicia primero el Gap Click para medir tu precisión.';
        render();
        return;
      }
      const elapsed = performance.now() - gapStartTimeMs;
      const res = evaluateGapClickTiming(60000 / gapBpm, elapsed);
      const sign = res.deltaMs > 0 ? `+${res.deltaMs}` : `${res.deltaMs}`;
      lastGapEval = `${res.verdict} (Desvío: ${sign} ms)`;
      audio.playDrumHit('kick', 0);
      render();
      return;
    }
    const kitBtn = t.closest<HTMLElement>('.js-kit-demo');
    if (kitBtn) {
      const k = kitBtn.getAttribute('data-k');
      audio.stopAll();
      if (k === 'toms') {
        ['T1', 'T1', 'T2', 'T2', 'FT', 'FT'].forEach((p, idx) =>
          audio.playDrumPiece(p as 'T1' | 'T2' | 'FT', idx * 0.22)
        );
      } else if (k === 'rim') {
        audio.playDrumHit('snare', 0);
        audio.playDrumHit('clap', 0.48);
        audio.playDrumHit('clap', 0.96);
      } else if (k === 'ghost') {
        (['ghost', 'ghost', 'snare', 'ghost', 'ghost', 'snare'] as const).forEach((h, idx) =>
          audio.playDrumHit(h, idx * 0.16)
        );
      } else {
        (['hihat', 'ghost', 'hihat', 'HHP'] as const).forEach((h, idx) => {
          if (h === 'HHP') audio.playDrumPiece('HHP', idx * 0.25);
          else audio.playDrumHit(h, idx * 0.25);
        });
      }
      onStatus(`Demostración Técnica de Batería: ${k}`);
    }
  });

  stage.addEventListener('change', (e) => {
    const t = e.target as HTMLSelectElement;
    if (t.classList.contains('js-dp-bpm')) {
      drumBpm = parseInt(t.value, 10);
      if (staffPlaying) toggleStaffPlay();
      render();
    } else if (t.classList.contains('js-gap-bpm')) {
      gapBpm = parseInt(t.value, 10);
      if (gapRunning) toggleGapClick();
      render();
    } else if (t.classList.contains('js-gap-on')) {
      gapBarsOn = parseInt(t.value, 10);
      if (gapRunning) toggleGapClick();
      render();
    } else if (t.classList.contains('js-gap-off')) {
      gapBarsSilent = parseInt(t.value, 10);
      if (gapRunning) toggleGapClick();
      render();
    }
  });
}

/**
 * LAB E: Bass Lock-In (Kick + Bass 4c/5c) + Advanced Expressive Techniques
 */
function buildBassLockLab(
  stage: HTMLElement,
  audio: StudioAudioPort,
  onStatus: (msg: string) => void,
  initialPreset = ''
): void {
  type BassTab = 'lock' | 'expressive';
  let activeTab: BassTab = initialPreset === 'expressive' ? 'expressive' : 'lock';
  let use5Strings = false;
  let sustainMode = true;
  let anticipate = false;
  let grooveName = 'funk';
  const bassBpm = 94;
  let playing = false;
  let stepIdx = -1;
  let timer: ReturnType<typeof setInterval> | null = null;

  const GROOVES: Record<string, { label: string; kick: number[]; bass: number[]; notes: number[] }> = {
    funk: {
      label: 'Funk Sincopado (16-avos)',
      kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
      bass: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1],
      notes: [28, 0, 0, 40, 0, 0, 31, 0, 33, 0, 35, 0, 0, 40, 0, 38],
    },
    rock: {
      label: 'Rock Cuadrado (Corcheas Bombo+Bajo)',
      kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      bass: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      notes: [28, 0, 28, 0, 28, 0, 31, 0, 33, 0, 33, 0, 35, 0, 31, 0],
    },
    reggae: {
      label: 'Reggae One Drop (Espacio en 1)',
      kick: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      bass: [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
      notes: [0, 0, 33, 0, 0, 0, 28, 0, 0, 35, 0, 0, 33, 0, 0, 0],
    },
    b5: {
      label: '5 Cuerdas Subgrave (B0 – D1 – E1)',
      kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
      bass: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
      notes: [23, 0, 0, 26, 0, 0, 28, 0, 0, 0, 23, 0, 0, 26, 0, 0],
    },
  };

  let kickArr = [...GROOVES['funk'].kick];
  let bassArr = [...GROOVES['funk'].bass];
  let noteArr = [...GROOVES['funk'].notes];

  const stop = () => {
    playing = false;
    stepIdx = -1;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const render = () => {
    const activeMidis = stepIdx >= 0 && noteArr[stepIdx] > 0 ? [noteArr[stepIdx]] : [28, 33, 40];
    const strings = use5Strings ? BASS_5C : BASS_4C;

    const tabs = `
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
        <button type="button" class="btn js-bl-tab ${activeTab === 'lock' ? 'active' : ''}" data-tab="lock">🔒 1. Laboratorio "Lock-In" Bajo + Bombo</button>
        <button type="button" class="btn js-bl-tab ${activeTab === 'expressive' ? 'active' : ''}" data-tab="expressive">✨ 2. Recursos Expresivos Avanzados (Armónicos, 10ªs, Fretless)</button>
      </div>
    `;

    let body = '';
    if (activeTab === 'lock') {
      const effectiveBass = anticipate
        ? [...bassArr.slice(1), bassArr[0]]
        : bassArr;

      body = `
        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <select class="lab-select js-bl-groove" aria-label="Groove de bajo y bombo">
              ${Object.entries(GROOVES)
                .map(([k, v]) => `<option value="${k}" ${k === grooveName ? 'selected' : ''}>${v.label}</option>`)
                .join('')}
            </select>
            <button type="button" class="btn js-bl-5c ${use5Strings ? 'active' : ''}">${use5Strings ? '5 Cuerdas (Con B0)' : '4 Cuerdas (E1–G2)'}</button>
            <button type="button" class="btn js-bl-sus ${sustainMode ? 'active' : ''}">${sustainMode ? 'Sustain (Legato)' : 'Staccato (Corto)'}</button>
            <button type="button" class="btn js-bl-ant ${anticipate ? 'active' : ''}">${anticipate ? 'Anticipación -1/16 ON' : 'Anticipación OFF'}</button>
          </div>
          <button type="button" class="btn btn-primary js-bl-play">${playing ? '⏹ Detener' : '▶ Escuchar Lock-In'}</button>
        </div>
        <div class="seq-grid" style="margin-bottom:10px;">
          <div class="seq-label">🥁 Bombo</div>
          ${kickArr.map((v, i) => `<button type="button" class="seq-cell js-bl-k ${v ? 'on' : ''} ${stepIdx === i ? 'playing-step' : ''}" data-i="${i}">${v ? '●' : ''}</button>`).join('')}
          <div class="seq-label">🎸 Bajo</div>
          ${effectiveBass.map((v, i) => `<button type="button" class="seq-cell js-bl-b ${v ? 'on-gold' : ''} ${stepIdx === i ? 'playing-step' : ''}" data-i="${i}">${v ? '♩' : ''}</button>`).join('')}
        </div>
        ${renderCompactNeckHtml(strings, activeMidis, use5Strings ? 11 : 4, 7)}
      `;
    } else {
      body = `
        <div class="grid-cards">
          <div class="card">
            <h4>🔔 Armónicos Naturales (Trastes 12, 7, 5, 4)</h4>
            <p class="text-xs">Roza suavemente la cuerda justo encima de la varilla metálica del traste 12 (8ª), 7 (12ª) o 5 (doble octava) para sacar timbres cristalinos estilo Jaco Pastorius.</p>
            <button type="button" class="btn-audio js-bx-demo" data-x="harm">🔊 Escuchar Armónicos Naturales</button>
          </div>
          <div class="card">
            <h4>🎸 Acordes y Décimas en el Bajo (<code>1 – 5 – 10</code>)</h4>
            <p class="text-xs">Si tocas intervalos cerrados abajo sonará barroso; usa la fundamental en 4ª cuerda + 5ª en 3ª + <strong>10ª (3ª una octava arriba)</strong> en 1ª cuerda.</p>
            <button type="button" class="btn-audio js-bx-demo" data-x="tenths">🔊 Escuchar Décimas (C – Am – F – G)</button>
          </div>
          <div class="card">
            <h4>🌊 Palm Mute y Notas Muertas (Ghost Notes)</h4>
            <p class="text-xs">Apaga con el canto derecho junto al puente (<em>Palm Mute</em> estilo Motown) o alterna notas percusivas mudas entre los pulsos reales.</p>
            <button type="button" class="btn-audio js-bx-demo" data-x="palm">🔊 Palm Mute + Ghost Groove</button>
          </div>
          <div class="card">
            <h4>🐍 Glissando Lírico (Estilo Fretless)</h4>
            <p class="text-xs">Desliza suavemente la nota hacia la fundamental superior para cantar frases vocales en baladas y jazz fusión.</p>
            <button type="button" class="btn-audio js-bx-demo" data-x="glide">🔊 Escuchar Frase Glissando</button>
          </div>
        </div>
      `;
    }

    stage.innerHTML = `${tabs}${body}`;
  };

  render();

  const togglePlay = () => {
    if (playing) {
      stop();
      render();
      return;
    }
    playing = true;
    const stepMs = (60000 / bassBpm) / 4;
    let s = 0;
    const effectiveBass = anticipate ? [...bassArr.slice(1), bassArr[0]] : bassArr;
    const effectiveNotes = anticipate ? [...noteArr.slice(1), noteArr[0]] : noteArr;

    const tick = () => {
      if (!playing) return;
      stepIdx = s % 16;
      render();
      if (kickArr[stepIdx]) audio.playDrumHit('kick', 0);
      if (stepIdx % 4 === 2) audio.playDrumHit('hihat', 0);
      if (effectiveBass[stepIdx]) {
        const note = effectiveNotes[stepIdx] || (use5Strings ? 23 : 28);
        audio.playElectricBass(note, sustainMode ? 0.36 : 0.11, 0, 0.38, 'finger', false);
      }
      s++;
    };
    tick();
    timer = setInterval(tick, stepMs);
    onStatus(`Lock-In Bajo + Bombo (${GROOVES[grooveName].label})`);
  };

  stage.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const tabBtn = t.closest<HTMLElement>('.js-bl-tab');
    if (tabBtn) {
      stop();
      activeTab = (tabBtn.getAttribute('data-tab') as BassTab) || 'lock';
      render();
      return;
    }
    const kBtn = t.closest<HTMLElement>('.js-bl-k');
    if (kBtn) {
      const i = parseInt(kBtn.getAttribute('data-i')!, 10);
      kickArr[i] = kickArr[i] ? 0 : 1;
      render();
      return;
    }
    const bBtn = t.closest<HTMLElement>('.js-bl-b');
    if (bBtn) {
      const i = parseInt(bBtn.getAttribute('data-i')!, 10);
      bassArr[i] = bassArr[i] ? 0 : 1;
      if (bassArr[i] && !noteArr[i]) noteArr[i] = use5Strings ? 23 : 28;
      render();
      return;
    }
    if (t.closest('.js-bl-5c')) {
      use5Strings = !use5Strings;
      render();
      return;
    }
    if (t.closest('.js-bl-sus')) {
      sustainMode = !sustainMode;
      render();
      return;
    }
    if (t.closest('.js-bl-ant')) {
      anticipate = !anticipate;
      if (playing) togglePlay();
      render();
      return;
    }
    if (t.closest('.js-bl-play')) {
      togglePlay();
      return;
    }
    const demo = t.closest<HTMLElement>('.js-bx-demo');
    if (demo) {
      const x = demo.getAttribute('data-x');
      audio.stopAll();
      if (x === 'harm') {
        [67, 62, 59, 64].forEach((m, idx) => audio.playPluckedGuitar(m, 1.3, idx * 0.34, 0.24, false));
      } else if (x === 'tenths') {
        [
          [36, 52],
          [33, 48],
          [29, 45],
          [31, 47],
        ].forEach((pair, idx) => {
          audio.schedule(() => {
            audio.playElectricBass(pair[0], 0.72, 0, 0.36, 'finger', false);
            audio.playElectricBass(pair[1], 0.72, 0.03, 0.28, 'finger', false);
          }, idx * 620);
        });
      } else if (x === 'palm') {
        [28, 28, 31, 33, 35, 33, 31, 28].forEach((m, idx) => {
          audio.playElectricBass(m, 0.14, idx * 0.2, idx % 2 === 1 ? 0.2 : 0.38, 'finger', false);
        });
      } else {
        [33, 35, 36, 40, 43, 40].forEach((m, idx) => audio.playElectricBass(m, 0.42, idx * 0.28, 0.34, 'finger', false));
      }
      onStatus(`Técnica Expresiva de Bajo: ${x}`);
    }
  });

  stage.addEventListener('change', (e) => {
    const t = e.target as HTMLSelectElement;
    if (t.classList.contains('js-bl-groove')) {
      grooveName = t.value;
      kickArr = [...GROOVES[grooveName].kick];
      bassArr = [...GROOVES[grooveName].bass];
      noteArr = [...GROOVES[grooveName].notes];
      if (grooveName === 'b5') use5Strings = true;
      if (playing) togglePlay();
      render();
    }
  });
}

/**
 * LAB F: Vocal Agility / Riffs / Melismas + Interactive Vowel Modification
 */
function buildVocalAgilityLab(
  stage: HTMLElement,
  audio: StudioAudioPort,
  onStatus: (msg: string) => void,
  initialPreset = ''
): void {
  type VocalTab = 'agility' | 'vowels';
  let activeTab: VocalTab = initialPreset === 'vowels' ? 'vowels' : 'agility';

  const RIFFS: Record<string, { label: string; offsets: number[]; degrees: string[] }> = {
    pent: {
      label: '1. Escala Pentatónica Pop / R&B (1–2–3–5–6–5–3–2–1)',
      offsets: [0, 2, 4, 7, 9, 7, 4, 2, 0],
      degrees: ['1', '2', '3', '5', '6', '5', '3', '2', '1'],
    },
    blues: {
      label: '2. Melisma Soul / Blues con Blue Note (1–♭3–4–♭5–4–♭3–1)',
      offsets: [0, 3, 5, 6, 5, 3, 0],
      degrees: ['1', '♭3', '4', '♭5', '4', '♭3', '1'],
    },
    harm: {
      label: '3. Agilidad Menor Armónica / Clásica (1–2–♭3–4–5–♭6–7–8)',
      offsets: [0, 2, 3, 5, 7, 8, 11, 12],
      degrees: ['1', '2', '♭3', '4', '5', '♭6', '7', '8'],
    },
    trill: {
      label: '4. Trino y Mordente de Precisión (1–2–1–2–1–3–1)',
      offsets: [0, 2, 0, 2, 0, 4, 0],
      degrees: ['1', '2', '1', '2', '1', '3', '1'],
    },
  };

  let riffKey = 'pent';
  let baseMidi = 60; // C4
  let bpm = 90;
  let playing = false;
  let litStep = -1;

  // Tab 2: Vowel modification state
  let targetPitch = 68; // Ab4 (high passaggio / upper mix zone)
  let selectedVowel: 'i' | 'e' | 'a' | 'o' | 'u' = 'i';

  const stopRiff = () => {
    playing = false;
    litStep = -1;
    audio.stopAll();
  };

  const render = () => {
    const tabs = `
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
        <button type="button" class="btn js-va-tab ${activeTab === 'agility' ? 'active' : ''}" data-tab="agility">⚡ 1. Gimnasio de Agilidad, Riffs y Melismas</button>
        <button type="button" class="btn js-va-tab ${activeTab === 'vowels' ? 'active' : ''}" data-tab="vowels">👄 2. Modificación de Vocales en el Passaggio</button>
      </div>
    `;

    let body = '';
    if (activeTab === 'agility') {
      const riff = RIFFS[riffKey];
      body = `
        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <select class="lab-select js-va-riff" aria-label="Patrón de melisma">
              ${Object.entries(RIFFS).map(([k, v]) => `<option value="${k}" ${k === riffKey ? 'selected' : ''}>${v.label}</option>`).join('')}
            </select>
            <select class="lab-select js-va-root" aria-label="Tónica vocal">
              ${[55, 57, 59, 60, 62, 64, 65].map((m) => `<option value="${m}" ${m === baseMidi ? 'selected' : ''}>Base ${midiToNoteName(m)}</option>`).join('')}
            </select>
            <label class="text-xs" style="color:#cbd5e1;">Velocidad: <strong>${bpm}</strong> BPM
              <input type="range" class="js-va-bpm" min="60" max="145" value="${bpm}" style="width:95px;" />
            </label>
          </div>
          <button type="button" class="btn btn-primary js-va-play">${playing ? '⏹ Detener' : '▶ Ejecutar Melisma'}</button>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:flex-end; min-height:110px; background:#090d16; border:1px solid #1e293b; border-radius:10px; padding:12px;">
          ${riff.offsets
            .map((off, idx) => {
              const height = 34 + off * 4.5;
              const lit = idx === litStep;
              return `
                <button type="button" class="js-va-step" data-midi="${baseMidi + off}" style="flex:1; min-width:36px; height:${height}px; background:${lit ? '#f59e0b' : 'rgba(56,189,248,0.18)'}; border:1px solid ${lit ? '#fef08a' : '#38bdf8'}; border-radius:8px; color:${lit ? '#090c12' : '#f8fafc'}; font-weight:800; cursor:pointer; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                  <span style="font-size:0.78rem;">${riff.degrees[idx]}</span>
                  <span style="font-size:0.64rem; opacity:0.85;">${midiToNoteName(baseMidi + off)}</span>
                </button>
              `;
            })
            .join('')}
        </div>
      `;
    } else {
      const regName =
        targetPitch < 61
          ? 'Pecho Cómodo (M1)'
          : targetPitch <= 66
            ? 'Zona de Passaggio / Puente (C4–F#4)'
            : 'Registro Agudo / Voz Mixta-Cabeza (G4+)';

      const vowelGuide: Record<'i' | 'e' | 'a' | 'o' | 'u', { mod: string; tip: string; targetVowel: 'i' | 'e' | 'a' | 'o' | 'u' }> = {
        i: { mod: 'i → /ɪ/ o /u/ cerrada ("tu-i")', tip: 'En agudos, la /i/ pura tensa la lengua; redondéala suavemente hacia /u/ para liberar espacio faríngeo.', targetVowel: 'u' },
        e: { mod: 'e → /œ/ (bostezo suave)', tip: 'Si abres horizontalmente una /e/ en el passaggio gritarás; piensa una /e/ con labios ligeramente de /o/.', targetVowel: 'o' },
        a: { mod: 'a → /ɔ/ (a redondeada oscura)', tip: 'En notas cumbre convierte la /a/ ancha ("a de gato") en /ɔ/ vertical ("a de bostezo") para lograr cuerpo sin tensión.', targetVowel: 'o' },
        o: { mod: 'o → /u/ focalizada', tip: 'La /o/ ya favorece el tracto vocal estable; estréchala hacia /u/ al subir por encima de G4.', targetVowel: 'u' },
        u: { mod: 'u pura (vocal facilitadora SOVT)', tip: 'La /u/ mantiene la laringe baja y facilita la inclinación cricotiroidea sin empuje de pecho.', targetVowel: 'u' },
      };
      const vg = vowelGuide[selectedVowel];

      body = `
        <div class="grid-2">
          <div class="card">
            <h4 style="color:#fbbf24;">1. Elige Altura y Vocal Original</h4>
            <p class="text-xs" style="color:#38bdf8; margin-bottom:6px;">Altura Actual: <strong>${midiToNoteName(targetPitch)}</strong> — ${regName}</p>
            <input type="range" class="js-vv-pitch" min="55" max="76" value="${targetPitch}" style="width:100%; margin-bottom:10px;" />
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              ${(['i', 'e', 'a', 'o', 'u'] as const)
                .map(
                  (v) =>
                    `<button type="button" class="btn js-vv-vow ${selectedVowel === v ? 'active' : ''}" data-v="${v}">Vocal /${v}/</button>`
                )
                .join('')}
            </div>
          </div>
          <div class="card">
            <h4 style="color:#34d399;">2. Prescripción Acústica: <code>${vg.mod}</code></h4>
            <p class="text-xs" style="margin-bottom:10px;">${vg.tip}</p>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              <button type="button" class="btn js-vv-hear-raw">🔊 Escuchar Sin Modificar (/${selectedVowel}/)</button>
              <button type="button" class="btn btn-primary js-vv-hear-mod">✨ Escuchar Con Modificación (${vg.mod.split(' ')[0]})</button>
            </div>
          </div>
        </div>
      `;
    }

    stage.innerHTML = `${tabs}${body}`;
  };

  render();

  stage.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const tabBtn = t.closest<HTMLElement>('.js-va-tab');
    if (tabBtn) {
      stopRiff();
      activeTab = (tabBtn.getAttribute('data-tab') as VocalTab) || 'agility';
      render();
      return;
    }
    const stepBtn = t.closest<HTMLElement>('.js-va-step');
    if (stepBtn) {
      const m = parseInt(stepBtn.getAttribute('data-midi')!, 10);
      audio.stopAll();
      audio.playAcousticPiano(m, 0.45, 0, 0.16, false);
      audio.playVocalFormant(m, 0.45, 0, 0.25, 'a', false);
      return;
    }
    if (t.closest('.js-va-play')) {
      if (playing) {
        stopRiff();
        render();
        return;
      }
      playing = true;
      const riff = RIFFS[riffKey];
      const stepMs = (60000 / bpm) / 2; // Eighth-note agility grid
      audio.stopAll();
      riff.offsets.forEach((off, idx) => {
        audio.schedule(() => {
          litStep = idx;
          const m = baseMidi + off;
          audio.playAcousticPiano(m, 0.28, 0, 0.14, false);
          audio.playVocalFormant(m, 0.28, 0, 0.25, 'a', false);
          render();
        }, idx * stepMs);
      });
      audio.schedule(() => {
        playing = false;
        litStep = -1;
        render();
      }, riff.offsets.length * stepMs + 120);
      onStatus(`Gimnasio Vocal: ${riff.label} a ${bpm} BPM`);
      return;
    }
    const vowBtn = t.closest<HTMLElement>('.js-vv-vow');
    if (vowBtn) {
      selectedVowel = (vowBtn.getAttribute('data-v') as 'i' | 'e' | 'a' | 'o' | 'u') || 'i';
      render();
      return;
    }
    if (t.closest('.js-vv-hear-raw')) {
      audio.stopAll();
      audio.playVocalFormant(targetPitch, 1.0, 0, 0.28, selectedVowel, false);
      onStatus(`Vocal pura /${selectedVowel}/ en ${midiToNoteName(targetPitch)}`);
      return;
    }
    if (t.closest('.js-vv-hear-mod')) {
      const modMap: Record<string, 'i' | 'e' | 'a' | 'o' | 'u'> = { i: 'u', e: 'o', a: 'o', o: 'u', u: 'u' };
      const targetV = modMap[selectedVowel] || 'u';
      audio.stopAll();
      audio.playVocalFormant(targetPitch, 1.0, 0, 0.28, targetV, false);
      onStatus(`Vocal modificada (/${selectedVowel}/ → /${targetV}/) en ${midiToNoteName(targetPitch)}`);
    }
  });

  stage.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement | HTMLSelectElement;
    if (t.classList.contains('js-va-riff')) {
      riffKey = t.value;
      render();
    } else if (t.classList.contains('js-va-root')) {
      baseMidi = parseInt(t.value, 10);
      render();
    } else if (t.classList.contains('js-va-bpm')) {
      bpm = parseInt(t.value, 10);
      render();
    } else if (t.classList.contains('js-vv-pitch')) {
      targetPitch = parseInt(t.value, 10);
      render();
    }
  });
}

/**
 * LIVE FRETBOARD & MONITOR ILLUMINATOR:
 * Subscribes to MusicAudioEngine note events and illuminates matching .fret-note & piano keys across the entire DOM!
 */
let unsubscribeGlobalHighlighter: (() => void) | null = null;

export function attachStudioEnhancements(
  root: HTMLElement,
  audio: StudioAudioPort
): void {
  // 1. Subscribe live note illumination (exact-note for maps/scales; multi-note only for simultaneous chords)
  if (unsubscribeGlobalHighlighter) {
    unsubscribeGlobalHighlighter();
    unsubscribeGlobalHighlighter = null;
  }

  interface ActiveGlowEntry {
    id: number;
    ev: NotePlayEvent;
  }

  let nextGlowId = 1;
  let activeEntries: ActiveGlowEntry[] = [];

  const clearAllGlow = () => {
    activeEntries = [];
    document.querySelectorAll('.playing-glow, .playing-pc-glow').forEach((el) => {
      el.classList.remove('playing-glow', 'playing-pc-glow');
    });
    window.dispatchEvent(new CustomEvent('enciclopedia:live-notes', { detail: { notes: [] } }));
  };

  const syncDomGlow = () => {
    document.querySelectorAll('.playing-glow, .playing-pc-glow').forEach((el) => {
      el.classList.remove('playing-glow', 'playing-pc-glow');
    });

    if (activeEntries.length === 0) {
      window.dispatchEvent(new CustomEvent('enciclopedia:live-notes', { detail: { notes: [] } }));
      return;
    }

    const activeMidis = [...new Set(activeEntries.map((a) => Math.round(a.ev.midi)))];
    const activeMidiSet = new Set(activeMidis);
    const hasChordPlay = activeEntries.some((a) => a.ev.isChord);

    // Illuminate Fretboards without dimming pre-painted notes:
    // 1) Explicit (sIdx, fret) scope when provided
    // 2) Single compact idiomatic playable voicing when strumming/playing a chord
    // 3) Single best fret position per MIDI on monotonic necks (no duplicate octave/unison clutter)
    document.querySelectorAll<HTMLElement>('.fretboard-wrapper').forEach((wrapper) => {
      const scopedForWrapper = activeEntries.filter(
        (a) =>
          a.ev.scopeEl &&
          a.ev.sIdx !== undefined &&
          a.ev.fret !== undefined &&
          (a.ev.scopeEl === wrapper ||
            a.ev.scopeEl.contains(wrapper) ||
            wrapper.contains(a.ev.scopeEl))
      );

      if (scopedForWrapper.length > 0) {
        scopedForWrapper.forEach(({ ev }) => {
          const cells = wrapper.querySelectorAll<HTMLElement>(
            `.fret-cell[data-sidx="${ev.sIdx}"][data-fret="${ev.fret}"], .fret-cell[data-s="${ev.sIdx}"][data-f="${ev.fret}"]`
          );
          if (cells.length > 0) {
            cells.forEach((cell) => {
              const targetEl = cell.querySelector<HTMLElement>('.fret-note') || cell;
              targetEl.classList.add('playing-glow');
            });
          } else {
            const stringRows = Array.from(wrapper.querySelectorAll<HTMLElement>('.fretboard-row')).filter(
              (r) => r.querySelector('.fret-cell[data-midi]') !== null
            );
            const rowCells = stringRows[ev.sIdx!]?.querySelectorAll<HTMLElement>('.fret-cell[data-midi]');
            const cell = rowCells?.[ev.fret!];
            if (cell) {
              const targetEl = cell.querySelector<HTMLElement>('.fret-note') || cell;
              targetEl.classList.add('playing-glow');
            }
          }
        });
        return;
      }

      const stringRows = Array.from(wrapper.querySelectorAll<HTMLElement>('.fretboard-row')).filter(
        (r) => r.querySelector('.fret-cell[data-midi]') !== null
      );
      const openMidis = stringRows.map((r) => {
        const firstCell = r.querySelector<HTMLElement>('.fret-cell[data-midi]');
        return firstCell ? parseInt(firstCell.getAttribute('data-midi') || '-1', 10) : -1;
      });
      const isMonotonic =
        openMidis.length >= 2 &&
        openMidis.every((m, idx) => m >= 0 && (idx === 0 || m < openMidis[idx - 1]));

      if (isMonotonic) {
        const maxFret = Math.max(
          0,
          (stringRows[0]?.querySelectorAll('.fret-cell[data-midi]').length ?? 13) - 1
        );

        if (hasChordPlay && activeMidis.length >= 2) {
          const voicing = resolvePlayableChordVoicing(activeMidis, openMidis, maxFret);
          if (voicing.length > 0) {
            voicing.forEach((pos) => {
              const rowCells = stringRows[pos.sIdx]?.querySelectorAll<HTMLElement>('.fret-cell[data-midi]');
              const cell = rowCells?.[pos.fret];
              if (cell) {
                const targetEl = cell.querySelector<HTMLElement>('.fret-note') || cell;
                targetEl.classList.add('playing-glow');
              }
            });
            return;
          }
        }

        // Unhinted single note: illuminate at most ONE best matching position on monotonic necks
        activeMidis.forEach((targetMidi) => {
          let bestCell: HTMLElement | null = null;
          let bestScore = 1e9;
          stringRows.forEach((row, sIdx) => {
            const cells = row.querySelectorAll<HTMLElement>('.fret-cell[data-midi]');
            cells.forEach((cell, fIdx) => {
              const m = parseInt(cell.getAttribute('data-midi') || '-1', 10);
              if (m === targetMidi) {
                const score = (fIdx > 5 ? 20 + fIdx : fIdx) + sIdx * 0.05;
                if (score < bestScore) {
                  bestScore = score;
                  bestCell = cell;
                }
              }
            });
          });
          if (bestCell) {
            const targetEl = (bestCell as HTMLElement).querySelector<HTMLElement>('.fret-note') || bestCell;
            targetEl.classList.add('playing-glow');
          }
        });
        return;
      }

      // Non-monotonic necks (e.g. Charango re-entrant tuning) fall back to exact MIDI match
      wrapper.querySelectorAll<HTMLElement>('.fret-cell[data-midi]').forEach((cell) => {
        const m = parseInt(cell.getAttribute('data-midi') || '-1', 10);
        if (m >= 0 && activeMidiSet.has(m)) {
          const targetEl = cell.querySelector<HTMLElement>('.fret-note') || cell;
          targetEl.classList.add('playing-glow');
        }
      });
    });

    // Illuminate Piano Keys: exact MIDI match without dimming unplayed scale keys
    document.querySelectorAll<HTMLElement>('.piano-keys').forEach((piano) => {
      piano.querySelectorAll<HTMLElement>('.key-white[data-midi], .key-black[data-midi]').forEach((keyEl) => {
        const m = parseInt(keyEl.getAttribute('data-midi') || '-1', 10);
        if (m >= 0 && activeMidiSet.has(m)) {
          keyEl.classList.add('playing-glow');
        }
      });
    });

    const uniqueNames = [...new Set(activeMidis.map((m) => midiToNoteName(m)))];
    window.dispatchEvent(new CustomEvent('enciclopedia:live-notes', { detail: { notes: uniqueNames, midis: activeMidis } }));
  };

  unsubscribeGlobalHighlighter = audio.onNoteEvent((ev) => {
    if (!ev) {
      clearAllGlow();
      return;
    }
    const normalizedMidi = Math.round(ev.midi);
    if (!ev.isChord) {
      // Single-note scale/map playback replaces prior note immediately for crisp tracking
      activeEntries = activeEntries.filter((a) => a.ev.isChord);
    } else if (ev.chordGroup !== undefined) {
      // Consecutive chord strums cleanly replace older chord groups while keeping notes of the same chord together
      activeEntries = activeEntries.filter(
        (a) => a.ev.isChord && a.ev.chordGroup === ev.chordGroup
      );
    }

    const id = nextGlowId++;
    activeEntries.push({ id, ev: { ...ev, midi: normalizedMidi } });
    syncDomGlow();

    const holdMs = ev.isChord
      ? Math.max(520, Math.min(1250, Math.round(ev.durationSec * 720)))
      : Math.max(185, Math.min(620, Math.round(ev.durationSec * 580)));

    setTimeout(() => {
      const prevLen = activeEntries.length;
      activeEntries = activeEntries.filter((entry) => entry.id !== id);
      if (activeEntries.length !== prevLen) {
        syncDomGlow();
      }
    }, holdMs);
  });

  // 2. Attach "🔍 Agrandar Diagrama" modal trigger + context framing to all node/graph diagrams
  const DIAGRAM_FRAME: Record<string, { what: string; how: string; why: string }> = {
    'interval-9th-visualizer': {
      what: 'Mapa radial que conecta cada nota del acorde para mostrar todos los intervalos que se forman entre ellas.',
      how: 'Apilando terceras o subiendo una nota una octava (+12 semitonos): la 2ª se vuelve 9ª, la 4ª se vuelve 11ª y la 6ª se vuelve 13ª.',
      why: 'Para detectar tensiones ricas o choques antes de tocar el acorde en guitarra, bajo o piano.',
    },
    'neo-riemann': {
      what: 'Árbol genealógico y red fractal que enlaza tríadas moviendo solo UNA nota (Glue 2/3) mediante P, L, R y Slide.',
      how: 'Partiendo de una tríada raíz (C), aplicas transformaciones de 1 o 2 semitonos para ramificar 3 generaciones sin usar cadencias tradicionales.',
      why: 'Para componer progresiones cinematográficas y épicas enlazando acordes lejanos con total suavidad.',
    },
    'modes-network-14': {
      what: 'Cartografía de los 14 modos ordenados de más luminoso a más oscuro y conectados por líneas continuas.',
      how: 'Moviendo una sola nota 1 semitono (1 traste) saltas de un modo a su vecino (Lidio → Jónico → Mixolidio → Dórico → Eólico → Frigio).',
      why: 'Para cambiar de atmósfera emocional al instante o elegir por descarte los 3 acordes clave de cualquier modo.',
    },
    'tension-pyramid-visualizer': {
      what: 'Pirámide jerárquica que muestra todos los acordes compatibles cuando una melodía sostiene una nota específica.',
      how: 'Siguiendo los hilos de color (Rosa = Tónica, Dorado = 5ª, Cian = 3ª) hacia acordes inferiores con 9, 11 o 13.',
      why: 'Para rearmonizar melodías conocidas o modular de forma orgánica manteniendo una nota común en el agudo.',
    },
    'cof-legacy': {
      what: 'Reloj de 12 horas ordenado por quintas justas (+7 semitonos) que muestra parentescos armónicos y simetrías.',
      how: 'Sumando 1 sostenido por paso hacia la derecha y 1 bemol hacia la izquierda, con el tritono diametralmente opuesto a 180°.',
      why: 'Para deducir armaduras al instante, encontrar relativos menores, cadenas 6–2–5–1 y sustitutos tritonales.',
    },
  };

  root.querySelectorAll<HTMLElement>('.interactive-widget').forEach((widget) => {
    const key = widget.getAttribute('data-lab') || widget.getAttribute('data-usar') || '';
    const info = DIAGRAM_FRAME[key];
    if (!info) return;

    // Inject crisp What/How/Why framing banner once if not present
    if (!widget.querySelector('.js-diagram-framing')) {
      const framing = document.createElement('div');
      framing.className = 'js-diagram-framing diagram-framing-grid';
      framing.innerHTML = `
        <div class="diagram-framing-item"><strong class="df-what">❓ ¿Qué es?</strong><span>${info.what}</span></div>
        <div class="diagram-framing-item"><strong class="df-how">🧭 ¿Cómo llegamos ahí?</strong><span>${info.how}</span></div>
        <div class="diagram-framing-item"><strong class="df-why">🎯 ¿Para qué se usa?</strong><span>${info.why}</span></div>
      `;
      const header = widget.querySelector('.widget-header');
      if (header && header.nextSibling) {
        widget.insertBefore(framing, header.nextSibling);
      } else {
        widget.prepend(framing);
      }
    }

    // Add "🔍 Agrandar Diagrama" button
    if (!widget.querySelector('.js-expand-diagram')) {
      const controls = widget.querySelector('.widget-controls') || widget.querySelector('.widget-header');
      if (controls) {
        const expBtn = document.createElement('button');
        expBtn.type = 'button';
        expBtn.className = 'btn js-expand-diagram';
        expBtn.style.cssText =
          'background:rgba(56,189,248,0.18); color:#7dd3fc; border:1px solid rgba(56,189,248,0.45); font-size:0.78rem;';
        expBtn.textContent = '🔍 Agrandar Diagrama';
        controls.appendChild(expBtn);

        expBtn.addEventListener('click', () => openDiagramFullscreenModal(widget));
      }
    }
  });
}

function openDiagramFullscreenModal(widget: HTMLElement): void {
  if (
    widget.classList.contains('diagram-expanded-active') ||
    document.querySelector('.diagram-fullscreen-backdrop')
  ) {
    return;
  }

  const placeholder = document.createElement('div');
  placeholder.style.cssText = 'padding:24px; text-align:center; color:#94a3b8; border:1px dashed #334155; border-radius:12px;';
  placeholder.textContent = 'Diagrama abierto en vista ampliada...';

  const parent = widget.parentElement;
  if (!parent) return;
  parent.replaceChild(placeholder, widget);

  const backdrop = document.createElement('div');
  backdrop.className = 'diagram-fullscreen-backdrop';
  backdrop.innerHTML = `
    <div class="diagram-fullscreen-shell" role="dialog" aria-modal="true" aria-label="Vista Ampliada del Diagrama Interactivo">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid #334155; background:#0f172a;">
        <strong style="color:#fbbf24; font-size:0.95rem;">🔍 Vista Ampliada Interactiva (Haz clic en cualquier nodo para escuchar)</strong>
        <button type="button" class="btn js-close-expanded-modal" style="background:rgba(244,63,94,0.2); color:#fda4af; border:1px solid rgba(244,63,94,0.45);">✕ Cerrar Vista Ampliada</button>
      </div>
      <div class="diagram-fullscreen-body" style="padding:16px; overflow:auto; flex:1;"></div>
    </div>
  `;

  const body = backdrop.querySelector<HTMLElement>('.diagram-fullscreen-body')!;
  widget.classList.add('diagram-expanded-active');
  body.appendChild(widget);
  document.body.appendChild(backdrop);

  const restore = () => {
    document.removeEventListener('keydown', onEsc);
    widget.classList.remove('diagram-expanded-active');
    if (placeholder.parentElement) {
      placeholder.parentElement.replaceChild(widget, placeholder);
    }
    backdrop.remove();
  };

  const onEsc = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') restore();
  };
  document.addEventListener('keydown', onEsc);

  backdrop.querySelector('.js-close-expanded-modal')?.addEventListener('click', restore);
  backdrop.addEventListener('click', (ev) => {
    if (ev.target === backdrop) restore();
  });
}
