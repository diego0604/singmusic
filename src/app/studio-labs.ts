import {
  BASS_TRAINING_BLOCKS,
  CHORD_MEMORY_LIBRARY,
  DRUM_LIMB_META,
  DRUM_TRAINING_BLOCKS,
  GUITAR_TRAINING_BLOCKS,
  LOGIC_NOTE_NAMES,
  applyEnharmonicGoldenRule,
  assignGuitarChordFingers,
  buildChordMemorySequence,
  buildStructuredVocalTrainingSeries,
  computeAppoggioCyclePhase,
  computeGuitarNeckWindow,
  computeVerticalChordBoxData,
  computeVocalPatternStepState,
  convertProgressionToNashville,
  evaluateChordMemoryAnswer,
  evaluateGapClickTiming,
  getChordMemoryPool,
  getVisualInstrumentFocus,
  getVocalCycleWithRest,
  harmonizeMelodyVoices,
  midiToNoteName,
  reduceLatchGlowState,
  renderTopViewDrumKitSvg,
  renderVerticalGuitarChordSvg,
  resolvePlayableChordVoicing,
  type ChordMemoryItem,
  type ChordMemoryPoolKey,
  type DrumKitCode,
  type DrumLimbHit,
  type LatchedGlowState,
  type NashvilleChordInput,
  type NeckZoneMode,
  type VocalTrainingExercise,
  type VocalTrainingLevel,
} from './music-games-logic';
import type { DiagramModalManager } from './diagram-modal';

export interface NoteGlowHint {
  isChord?: boolean;
  chordGroup?: number;
  chordBatch?: number[];
  skipGlow?: boolean;
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
  onStop(cb: () => void): () => void;
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

interface CompactNeckOptions {
  minFret?: number;
  maxFret?: number;
  fingerPriority?: boolean;
  mutedStrings?: Set<number>;
}

function renderCompactNeckHtml(
  strings: { label: string; openMidi: number }[],
  activeMidis: number[],
  rootPc: number,
  maxFret = 12,
  guitarFingers?: Map<string, number>,
  exactPositions?: Set<string>,
  options?: CompactNeckOptions
): string {
  const minF = Math.max(0, options?.minFret ?? 0);
  const maxF = Math.max(minF, options?.maxFret ?? maxFret);
  const fingerPriority = !!options?.fingerPriority;
  const mutedStrings = options?.mutedStrings;
  const isZoomed = maxF - minF <= 7;

  const activeMidiSet = new Set(activeMidis);
  const activePcSet = new Set(activeMidis.map((m) => ((m % 12) + 12) % 12));
  const useExactPos = !!exactPositions && exactPositions.size > 0;

  let header = `<div class="fretboard-row"><div class="string-label" style="color:#94a3b8; font-size:0.7rem;">Traste</div>`;
  for (let f = minF; f <= maxF; f++) {
    const dot = [3, 5, 7, 9, 12].includes(f) ? '•' : '';
    header += `<div class="fret-cell" data-fret="${f}" style="height:24px; border:none; color:#94a3b8; font-size:0.72rem; font-weight:800; cursor:default;">${f}${dot}</div>`;
  }
  header += `</div>`;

  const rows = strings
    .map((str, sIdx) => {
      const isMuted = !!mutedStrings?.has(sIdx);
      const muteTag = isMuted ? `<span class="string-mute-tag" title="Cuerda silenciada (X)">✕</span>` : '';
      let row = `<div class="fretboard-row"><div class="string-label" style="${isMuted ? 'color:#64748b;' : ''}"><span>${str.label}</span>${muteTag}</div>`;
      for (let f = minF; f <= maxF; f++) {
        const midi = str.openMidi + f;
        const pc = midi % 12;
        const posKey = `${sIdx}:${f}`;
        const isExact = useExactPos ? exactPositions!.has(posKey) : activeMidiSet.has(midi);
        const isPc = activePcSet.has(pc);
        const cls = isExact
          ? pc === rootPc
            ? 'root'
            : 'char'
          : !useExactPos && isPc
            ? pc === rootPc
              ? 'root'
              : 'active'
            : '';
        const ring = isExact ? 'outline:2px solid #ffffff;' : '';
        const fingerNum = guitarFingers?.get(posKey) || 0;
        const showFingerMain = fingerPriority && fingerNum > 0 && f > 0;
        const noteText = showFingerMain ? String(fingerNum) : LOGIC_NOTE_NAMES[pc];
        const cornerBadge =
          fingerNum > 0 && f > 0
            ? `<span class="finger-badge ${showFingerMain ? 'is-note-corner' : ''}" title="${showFingerMain ? `Nota ${LOGIC_NOTE_NAMES[pc]}` : `Dedo ${fingerNum}`}">${showFingerMain ? LOGIC_NOTE_NAMES[pc] : fingerNum}</span>`
            : '';
        row += `<div class="fret-cell js-studio-fret" data-sidx="${sIdx}" data-fret="${f}" data-midi="${midi}" title="${midiToNoteName(midi)} (Traste ${f})${fingerNum > 0 ? ` · Dedo ${fingerNum}` : ''}"><div class="fret-note ${cls} ${fingerNum > 0 && f > 0 ? 'has-finger' : ''}" style="${ring}">${noteText}${cornerBadge}</div></div>`;
      }
      row += `</div>`;
      return row;
    })
    .join('');

  return `<div class="fretboard-wrapper ${isZoomed ? 'neck-zoomed' : ''} ${fingerPriority ? 'finger-priority' : ''}">${header}${rows}</div>`;
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
  if (labType === 'guitar-dexterity-lab') {
    buildGuitarDexterityLab(stage, audio, onStatus);
    return true;
  }
  if (labType === 'chord-memory-lab') {
    buildChordMemoryLab(stage, audio, onStatus);
    return true;
  }
  if (labType === 'daily-training-session-lab') {
    buildDailyTrainingSessionLab(stage, audio, onStatus, preset);
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

  const playClockNote = (midi: number, dur: number, delay = 0, vol = 0.28) => {
    const focus = getVisualInstrumentFocus();
    if (focus === 'bass-only') {
      audio.playElectricBass(midi - 12, dur, delay, 0.36, 'finger', false);
    } else if (focus === 'guitar-only') {
      audio.playPluckedGuitar(midi, dur, delay, 0.3, false);
    } else {
      audio.playAcousticPiano(midi, dur, delay, vol, false);
    }
  };

  stage.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const node = t.closest<HTMLElement>('.js-clock-node');
    if (node) {
      selectedPc = parseInt(node.getAttribute('data-pc')!, 10);
      preferFlats = undefined;
      audio.stopAll();
      playClockNote(60 + selectedPc, 0.9, 0, 0.28);
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
          playClockNote(m, 0.48, 0, 0.25);
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
    {
      id: 'rock',
      name: '5. Rock / Indie Driving en Corcheas (↓ ↓ ↑ ↓ ↓ ↑)',
      meter: '4/4',
      stepsPerBar: 8,
      pattern: ['D', 'd', 'D', 'U', 'D', 'd', 'D', 'U'],
      tip: 'Energía constante marcando graves en "1" y "3" y abriendo con rasgueo completo en "2" y "4".',
    },
    {
      id: 'bolero',
      name: '6. Bolero / Balada Rítmica Latina (↓ · ↓ ↓ ↑ ↓ ↑)',
      meter: '4/4',
      stepsPerBar: 8,
      pattern: ['D', '-', 'd', 'U', 'X', 'd', 'D', 'U'],
      tip: 'Combina un golpe cálido en el bajo del tiempo 1, chasquido suave en el 3 y respuesta ascendente en "3y-4-4y".',
    },
    {
      id: 'bossa',
      name: '7. Bossa Nova / Samba Rasgueada (Sincopada)',
      meter: '4/4',
      stepsPerBar: 8,
      pattern: ['D', '-', 'U', 'd', '-', 'U', 'X', 'U'],
      tip: 'Anticipa el segundo compás ligando la corchea del "2y" y usando el chasquido suave como caja brasileña.',
    },
    {
      id: 'chacarera',
      name: '8. Folclore Latino 6/8 (Chacarera / Bambuco)',
      meter: '6/8',
      stepsPerBar: 6,
      pattern: ['D', 'U', 'X', 'D', 'X', 'U'],
      tip: 'Chasquido característico en el tiempo 3 y 5 del 6/8; deja respirar el grave en el pulso 4.',
    },
    {
      id: 'country',
      name: '9. Country Boom-Chick (Bajo en 1 y 3 + Rasgueo)',
      meter: '4/4',
      stepsPerBar: 8,
      pattern: ['d', '-', 'D', 'U', 'd', '-', 'D', 'U'],
      tip: 'En 1 y 3 golpea suave solo las cuerdas graves (Boom); en 2 y 4 barre las agudas (Chick).',
    },
    {
      id: 'disco',
      name: '10. Disco / Nu-Disco en Contratiempo (16-avos)',
      meter: '4/4',
      stepsPerBar: 8,
      pattern: ['X', 'U', 'D', 'X', 'X', 'U', 'D', 'U'],
      tip: 'Muñeca ultra suelta alternando apagado limpio en tierra y acento brillante en las síncopas.',
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
    boleroDm: {
      label: 'Dm – Gm – C7 – A7 (Bolero / Balada Clásica)',
      chords: [
        { name: 'Dm', rootPc: 2, frets: [-1, -1, 0, 2, 3, 1] },
        { name: 'Gm', rootPc: 7, frets: [3, 5, 5, 3, 3, 3] },
        { name: 'C7', rootPc: 0, frets: [-1, 3, 2, 3, 1, 0] },
        { name: 'A7', rootPc: 9, frets: [-1, 0, 2, 0, 2, 0] },
      ],
    },
    rockE: {
      label: 'E – B – C#m – A (Rock / Pop Energético)',
      chords: [
        { name: 'E', rootPc: 4, frets: [0, 2, 2, 1, 0, 0] },
        { name: 'B', rootPc: 11, frets: [-1, 2, 4, 4, 4, 2] },
        { name: 'C#m', rootPc: 1, frets: [-1, 4, 6, 6, 5, 4] },
        { name: 'A', rootPc: 9, frets: [-1, 0, 2, 2, 2, 0] },
      ],
    },
  };

  let activePresetIdx = 0;
  let activeProgKey = 'pop4';
  let strumNeckZone: NeckZoneMode = 'auto';
  let strumFingerPrio = false;
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

  const clearTimerOnly = () => {
    isPlaying = false;
    playingStep = -1;
    if (loopTimer) {
      clearInterval(loopTimer);
      loopTimer = null;
    }
  };

  const stopPlay = (silenceAudio = true) => {
    clearTimerOnly();
    if (silenceAudio) {
      audio.stopAll(true);
    }
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
      const chordKey = `${curChord.name}:${curChord.frets.join(',')}:${strumNeckZone}:${strumFingerPrio ? 'f' : 'n'}`;
      if (neckEl.getAttribute('data-chord-key') !== chordKey) {
        neckEl.setAttribute('data-chord-key', chordKey);
        const lowToHigh = [40, 45, 50, 55, 59, 64];
        const posList = curChord.frets
          .map((fret, lowIdx) =>
            fret >= 0
              ? { sIdx: 5 - lowIdx, fret, midi: lowToHigh[lowIdx] + fret }
              : null
          )
          .filter((p): p is { sIdx: number; fret: number; midi: number } => p !== null);
        const fingerInfo = assignGuitarChordFingers(posList, true);
        const fingerMap = new Map<string, number>();
        const exactSet = new Set<string>();
        const mutedStrings = new Set<number>([0, 1, 2, 3, 4, 5]);
        posList.forEach((p) => {
          exactSet.add(`${p.sIdx}:${p.fret}`);
          mutedStrings.delete(p.sIdx);
        });
        const fingersSummaryArr: string[] = ['X', 'X', 'X', 'X', 'X', 'X'];
        fingerInfo.positions.forEach((fp) => {
          const lowIdx = 5 - fp.sIdx;
          if (lowIdx >= 0 && lowIdx < 6) fingersSummaryArr[lowIdx] = String(fp.finger);
          if (fp.finger > 0 && fp.fret > 0) fingerMap.set(`${fp.sIdx}:${fp.fret}`, fp.finger);
        });
        const win = computeGuitarNeckWindow(
          curChord.frets.filter((f) => f >= 0),
          strumNeckZone,
          12
        );
        const vBox = computeVerticalChordBoxData({
          positions: fingerInfo.positions.map((fp) => ({ sIdx: fp.sIdx, fret: fp.fret, finger: fp.finger })),
          rootPc: curChord.rootPc,
        });
        neckEl.innerHTML = `
          <div class="guitar-ux-toolbar">
            <div style="font-size:0.78rem; color:#fbbf24; font-weight:700;">
              🎸 Acorde: <strong>${curChord.name}</strong> · Dedos Izq: <span style="color:#fde047; font-family:monospace;">${fingersSummaryArr.join('-')}</span>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
              <div class="guitar-seg-group">
                <button type="button" class="guitar-seg-btn js-strum-zone ${strumNeckZone === 'auto' ? 'active' : ''}" data-z="auto">Auto (${win.minFret}–${win.maxFret})</button>
                <button type="button" class="guitar-seg-btn js-strum-zone ${strumNeckZone === 'all' ? 'active' : ''}" data-z="all">0–12</button>
              </div>
              <div class="guitar-seg-group">
                <button type="button" class="guitar-seg-btn js-strum-prio ${!strumFingerPrio ? 'active' : ''}" data-p="0">Notas</button>
                <button type="button" class="guitar-seg-btn js-strum-prio ${strumFingerPrio ? 'active' : ''}" data-p="1">Dedos 1–4</button>
              </div>
            </div>
          </div>
          <div class="guitar-stage-grid">
            ${renderCompactNeckHtml(GUITAR_6C, midis, curChord.rootPc, 12, fingerMap, exactSet, {
              minFret: win.minFret,
              maxFret: win.maxFret,
              fingerPriority: strumFingerPrio,
              mutedStrings,
            })}
            ${renderVerticalGuitarChordSvg(vBox, { title: curChord.name })}
          </div>
        `;
      }
    }
  };

  stage.innerHTML = `
    <div class="neck-control-deck neck-deck-standalone">
      <div class="neck-deck-row">
        <div class="neck-deck-fields">
          <div class="neck-field">
            <label>Patrón:</label>
            <select class="lab-select js-strum-preset" aria-label="Seleccionar patrón de rasgueo">
              ${PATTERNS.map((p, idx) => `<option value="${idx}">${p.name}</option>`).join('')}
            </select>
          </div>
          <div class="neck-field">
            <label>Progresión:</label>
            <select class="lab-select js-strum-prog" aria-label="Seleccionar progresión de acordes">
              ${Object.entries(PROGRESSIONS)
                .map(([k, v]) => `<option value="${k}">${v.label}</option>`)
                .join('')}
            </select>
          </div>
          <label class="text-xs" style="color:#cbd5e1; display:flex; align-items:center; gap:6px;">
            Tempo: <strong class="js-strum-bpm-val">${bpm}</strong> BPM
            <input type="range" class="js-strum-bpm" min="60" max="145" value="${bpm}" style="width:90px;" />
          </label>
        </div>
        <div class="neck-deck-actions">
          <button type="button" class="btn btn-primary js-strum-play">▶ Reproducir Patrón</button>
          <button type="button" class="btn js-strum-drill" data-drill="mute">🎯 Apagados</button>
        </div>
      </div>
    </div>
    <div class="js-strum-grid" style="margin-bottom:8px;"></div>
    <div class="js-strum-neck"></div>
  `;

  renderGridOnly();

  const unsubStrumStop = audio.onStop(() => {
    if (!document.body.contains(stage)) {
      unsubStrumStop();
      clearTimerOnly();
      return;
    }
    if (isPlaying || loopTimer) {
      stopPlay(false);
    }
  });

  const startPlay = () => {
    stopPlay(true);
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
      return;
    }
    const zoneBtn = t.closest<HTMLElement>('.js-strum-zone');
    if (zoneBtn) {
      strumNeckZone = (zoneBtn.getAttribute('data-z') as NeckZoneMode) === 'all' ? 'all' : 'auto';
      renderGridOnly();
      return;
    }
    const prioBtn = t.closest<HTMLElement>('.js-strum-prio');
    if (prioBtn) {
      strumFingerPrio = prioBtn.getAttribute('data-p') === '1';
      renderGridOnly();
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
            <button type="button" class="btn js-nw-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
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
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="btn btn-primary js-band-play">▶ Escuchar Guía de Banda en ${LOGIC_NOTE_NAMES[targetKeyPc]}</button>
            <button type="button" class="btn js-nw-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
          </div>
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
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="btn btn-primary js-harm-play">▶ Escuchar Arreglo a ${voiceCount} Voces</button>
            <button type="button" class="btn js-nw-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener</button>
          </div>
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

  const unsubNwStop = audio.onStop(() => {
    if (!document.body.contains(stage)) {
      unsubNwStop();
      return;
    }
    if (playingNoteIdx !== -1) {
      playingNoteIdx = -1;
      render();
    }
  });

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
    if (t.closest('.js-nw-stop')) {
      playingNoteIdx = -1;
      audio.stopAll();
      render();
      onStatus('Escritura detenida');
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
          audio.playElectricBass(36 + tRoot, 0.9, 0, 0.34, 'finger', false, { skipGlow: true });
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
  type DrumTab = 'staff' | 'gap' | 'kit' | 'drills';
  let activeTab: DrumTab =
    initialPreset === 'gap'
      ? 'gap'
      : initialPreset === 'kit'
        ? 'kit'
        : initialPreset === 'drills'
          ? 'drills'
          : 'staff';

  // Tab 1: Synced 16-step PAS drum staff
  let grid = {
    HH: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    SD: [0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0],
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

  // Tab 4: Drum Practice & Motor-Skills Exercises
  interface DrumPracticeDrill {
    id: string;
    name: string;
    focus: string;
    tip: string;
    steps: { hand: string; piece: 'kick' | 'snare' | 'ghost' | 'hihat' | 'tom' | 'clap'; dual?: 'kick' | 'hihat' }[];
  }
  const DRUM_DRILLS: DrumPracticeDrill[] = [
    {
      id: 'paradiddle',
      name: '1. Control de Baquetas: Single Paradiddle (R L R R · L R L L)',
      focus: 'Motricidad fina, acentos y rebote parejo',
      tip: 'Acentúa el 1er golpe de cada grupo de 4 (R fuerte en caja, luego r-r suaves en fantasma). Excelente para desplazarte entre timbales.',
      steps: [
        { hand: 'R★', piece: 'snare', dual: 'kick' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'R', piece: 'ghost' },
        { hand: 'R', piece: 'ghost' },
        { hand: 'L★', piece: 'snare' },
        { hand: 'R', piece: 'ghost' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'R★', piece: 'tom', dual: 'kick' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'R', piece: 'ghost' },
        { hand: 'R', piece: 'ghost' },
        { hand: 'L★', piece: 'snare' },
        { hand: 'R', piece: 'ghost' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'L', piece: 'ghost' },
      ],
    },
    {
      id: 'kick16',
      name: '2. Desplazamiento de Bombo en Semicorcheas (1 - e - & - a)',
      focus: 'Control del pie derecho sobre pulso constante',
      tip: 'Mantén hi-hat en negras y caja firme en 2 y 4 mientras el bombo aterriza en el "a" de 1 y en la "e" de 3.',
      steps: [
        { hand: 'HH+BD', piece: 'kick', dual: 'hihat' },
        { hand: '·', piece: 'ghost' },
        { hand: 'HH', piece: 'hihat' },
        { hand: 'BD(a)', piece: 'kick' },
        { hand: 'SD★', piece: 'snare', dual: 'hihat' },
        { hand: '·', piece: 'ghost' },
        { hand: 'HH+BD', piece: 'kick', dual: 'hihat' },
        { hand: '·', piece: 'ghost' },
        { hand: 'HH', piece: 'hihat' },
        { hand: 'BD(e)', piece: 'kick' },
        { hand: 'HH', piece: 'hihat' },
        { hand: '·', piece: 'ghost' },
        { hand: 'SD★', piece: 'snare', dual: 'hihat' },
        { hand: '·', piece: 'ghost' },
        { hand: 'BD(y)', piece: 'kick', dual: 'hihat' },
        { hand: '·', piece: 'ghost' },
      ],
    },
    {
      id: 'ghosts',
      name: '3. Dinámica Extrema: Ghost Notes (1 cm) vs. Backbeat',
      focus: 'Contraste dinámico para Funk, Soul y Pop',
      tip: 'Deja caer la baqueta izquierda desde 1 cm para las notas fantasma (g) y levanta muñeca en 2 y 4.',
      steps: [
        { hand: 'BD', piece: 'kick', dual: 'hihat' },
        { hand: 'g', piece: 'ghost' },
        { hand: 'HH', piece: 'hihat' },
        { hand: 'g', piece: 'ghost' },
        { hand: 'SD★', piece: 'snare', dual: 'hihat' },
        { hand: 'g', piece: 'ghost' },
        { hand: 'HH', piece: 'hihat' },
        { hand: 'g', piece: 'ghost' },
        { hand: 'BD', piece: 'kick', dual: 'hihat' },
        { hand: 'g', piece: 'ghost' },
        { hand: 'BD', piece: 'kick', dual: 'hihat' },
        { hand: 'g', piece: 'ghost' },
        { hand: 'SD★', piece: 'snare', dual: 'hihat' },
        { hand: 'g', piece: 'ghost' },
        { hand: 'HH', piece: 'hihat' },
        { hand: 'g', piece: 'ghost' },
      ],
    },
    {
      id: 'flam_accents',
      name: '4. Acentos Alternos R-L-R / L-R-L (Coordinación y Toms)',
      focus: 'Agilidad entre caja y toms sin tensar antebrazos',
      tip: 'Piensa en grupos de 3 golpes alternos desplazando solo el acento hacia el Tom y volviendo a caja.',
      steps: [
        { hand: 'R(T)★', piece: 'tom', dual: 'kick' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'R', piece: 'ghost' },
        { hand: 'L★', piece: 'snare' },
        { hand: 'R', piece: 'ghost' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'R(T)★', piece: 'tom', dual: 'kick' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'R', piece: 'ghost' },
        { hand: 'L★', piece: 'snare' },
        { hand: 'R', piece: 'ghost' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'R★', piece: 'clap', dual: 'kick' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'R', piece: 'ghost' },
        { hand: 'L★', piece: 'snare' },
      ],
    },
    {
      id: 'double_stroke',
      name: '5. Calentamiento de Rebote: Double Stroke Roll (R R L L · R R L L)',
      focus: 'Control de rebote (fingers + muñeca) para velocidad sin tensión',
      tip: 'Lanza el primer golpe con la muñeca y recoge el segundo rebote cerrando los dedos traseros (anular y meñique) para que el 2º golpe suene igual de definido.',
      steps: [
        { hand: 'R1★', piece: 'snare', dual: 'kick' },
        { hand: 'R2', piece: 'ghost' },
        { hand: 'L1★', piece: 'snare' },
        { hand: 'L2', piece: 'ghost' },
        { hand: 'R1★', piece: 'snare', dual: 'hihat' },
        { hand: 'R2', piece: 'ghost' },
        { hand: 'L1★', piece: 'snare' },
        { hand: 'L2', piece: 'ghost' },
        { hand: 'R1★', piece: 'tom', dual: 'kick' },
        { hand: 'R2', piece: 'tom' },
        { hand: 'L1★', piece: 'snare' },
        { hand: 'L2', piece: 'ghost' },
        { hand: 'R1★', piece: 'snare', dual: 'hihat' },
        { hand: 'R2', piece: 'ghost' },
        { hand: 'L1★', piece: 'snare' },
        { hand: 'L2', piece: 'ghost' },
      ],
    },
    {
      id: 'paradiddle_diddle',
      name: '6. Paradiddle-Diddle (R L R R L L) — Fills Fluidos y Polirritmia',
      focus: 'Motricidad asimétrica en bloques de 6 golpes sobre compás de 4/4',
      tip: 'Combina un grupo de 6 (R L R R L L) dos veces + 4 golpes de cierre (R L R L). El acento se desplaza con musicalidad moderna.',
      steps: [
        { hand: 'R★', piece: 'tom', dual: 'kick' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'R', piece: 'hihat' },
        { hand: 'R', piece: 'hihat' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'R★', piece: 'tom', dual: 'kick' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'R', piece: 'hihat' },
        { hand: 'R', piece: 'hihat' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'R★', piece: 'snare', dual: 'kick' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'R★', piece: 'tom' },
        { hand: 'L★', piece: 'snare' },
      ],
    },
    {
      id: 'foot_independence',
      name: '7. Independencia de Pies: Bombo (PD) vs. Pedal Hi-Hat (PI)',
      focus: 'Coordinación inferior y estabilidad postural sobre el banquillo',
      tip: 'Mantén el Pie Izquierdo (PI) pisando el pedal Hi-Hat en contratiempos o en 2 y 4 mientras el Pie Derecho (BD) dibuja figuras sin tensar la espalda.',
      steps: [
        { hand: 'BD(PD)', piece: 'kick', dual: 'hihat' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'PI(HH)', piece: 'hihat' },
        { hand: 'BD(PD)', piece: 'kick' },
        { hand: 'SD★+PI', piece: 'snare', dual: 'hihat' },
        { hand: 'R', piece: 'hihat' },
        { hand: 'BD(PD)', piece: 'kick' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'BD(PD)', piece: 'kick', dual: 'hihat' },
        { hand: 'BD(PD)', piece: 'kick' },
        { hand: 'PI(HH)', piece: 'hihat' },
        { hand: 'L', piece: 'ghost' },
        { hand: 'SD★+PI', piece: 'snare', dual: 'hihat' },
        { hand: 'R', piece: 'hihat' },
        { hand: 'BD(PD)', piece: 'kick' },
        { hand: 'PI(HH)', piece: 'hihat' },
      ],
    },
    {
      id: 'linear_funk',
      name: '8. Groove Lineal Funk (R – L – BD sin Golpes Simultáneos)',
      focus: 'Precisión milimétrica entre manos y bombo (estilo David Garibaldi)',
      tip: 'Regla de oro del drumming lineal: nunca caen dos extremidades a la vez. Cada semicorchea pertenece a una sola pieza creando un groove limpio y filoso.',
      steps: [
        { hand: 'BD★', piece: 'kick' },
        { hand: 'R(HH)', piece: 'hihat' },
        { hand: 'L(g)', piece: 'ghost' },
        { hand: 'R(HH)', piece: 'hihat' },
        { hand: 'L(SD)★', piece: 'snare' },
        { hand: 'R(HH)', piece: 'hihat' },
        { hand: 'BD', piece: 'kick' },
        { hand: 'L(g)', piece: 'ghost' },
        { hand: 'R(HH)', piece: 'hihat' },
        { hand: 'BD', piece: 'kick' },
        { hand: 'R(HH)', piece: 'hihat' },
        { hand: 'L(g)', piece: 'ghost' },
        { hand: 'L(SD)★', piece: 'snare' },
        { hand: 'R(HH)', piece: 'hihat' },
        { hand: 'L(g)', piece: 'ghost' },
        { hand: 'BD', piece: 'kick' },
      ],
    },
  ];
  let drillIdx = 0;
  let drillBpm = 84;
  let drillPlaying = false;
  let drillStep = -1;
  let drillTimer: ReturnType<typeof setInterval> | null = null;

  const clearDrumTimers = () => {
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
    drillPlaying = false;
    drillStep = -1;
    if (drillTimer) {
      clearInterval(drillTimer);
      drillTimer = null;
    }
  };

  const stopAllDrums = (silenceAudio = true) => {
    clearDrumTimers();
    if (silenceAudio) {
      audio.stopAll(true);
    }
  };

  const renderDrumStaffSvg = (): string => {
    const w = 680;
    const h = 152;
    const lineYs = [42, 56, 70, 84, 98];
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

  const getStaffLimbHits = (stepIdx: number): DrumLimbHit[] => {
    if (stepIdx < 0 || stepIdx >= 16) return [];
    const hits: DrumLimbHit[] = [];
    if (grid.HH[stepIdx]) hits.push({ piece: 'HH', limb: 'R' });
    if (grid.SD[stepIdx] === 1 || grid.SD[stepIdx] === 2) {
      hits.push({ piece: 'SD', limb: 'L', accent: grid.SD[stepIdx] === 1 });
    }
    if (grid.BD[stepIdx]) hits.push({ piece: 'BD', limb: 'RF', accent: true });
    return hits;
  };

  const getDrillLimbHits = (stepIdx: number): DrumLimbHit[] => {
    const drill = DRUM_DRILLS[drillIdx];
    if (!drill || stepIdx < 0 || stepIdx >= drill.steps.length) return [];
    const st = drill.steps[stepIdx];
    const hits: DrumLimbHit[] = [];
    const isLeftFoot = st.hand.includes('PI');
    const mainPiece: DrumKitCode =
      st.piece === 'kick'
        ? 'BD'
        : isLeftFoot && st.piece === 'hihat'
          ? 'HHP'
          : st.piece === 'hihat'
            ? 'HH'
            : st.piece === 'tom'
              ? 'T1'
              : 'SD';
    const isLeft = st.hand.startsWith('L') || st.hand === 'g' || st.hand.startsWith('SD');
    const mainLimb = mainPiece === 'BD' ? 'RF' : mainPiece === 'HHP' ? 'LF' : isLeft ? 'L' : 'R';
    hits.push({ piece: mainPiece, limb: mainLimb, accent: st.hand.includes('★') });
    if (st.dual === 'kick') hits.push({ piece: 'BD', limb: 'RF' });
    if (st.dual === 'hihat') hits.push({ piece: isLeftFoot ? 'HHP' : 'HH', limb: isLeftFoot ? 'LF' : 'R' });
    return hits;
  };

  const renderLimbStripHtml = (hits: DrumLimbHit[]): string => {
    const findPieceFor = (limb: 'R' | 'L' | 'RF' | 'LF'): string => {
      const h = hits.find((item) => item.limb === limb);
      if (!h) return 'En reposo';
      const names: Record<DrumKitCode, string> = {
        BD: 'Bombo (BD)',
        SD: h.accent ? 'Caja★ (Acento)' : 'Caja (SD)',
        HH: 'Hi-Hat (HH)',
        HHP: 'Pedal HH',
        T1: 'Tom 1',
        T2: 'Tom 2',
        FT: 'Floor Tom',
        RD: 'Ride',
        CR: 'Crash',
      };
      return names[h.piece];
    };
    return (['R', 'L', 'RF', 'LF'] as const)
      .map((limb) => {
        const meta = DRUM_LIMB_META[limb];
        const active = hits.some((h) => h.limb === limb);
        return `
          <div style="padding:6px 8px; border-radius:8px; border:1px solid ${active ? meta.color : '#1e293b'}; background:${active ? 'rgba(15,23,42,0.98)' : 'rgba(9,13,22,0.75)'}; display:flex; align-items:center; gap:6px;">
            <span style="display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:6px; background:${active ? meta.color : '#1e293b'}; color:${active ? meta.textCol : '#64748b'}; font-size:0.7rem; font-weight:900;">${meta.short}</span>
            <div style="min-width:0;">
              <div style="font-size:0.68rem; color:${active ? meta.color : '#94a3b8'}; font-weight:800;">${meta.badge}</div>
              <div style="font-size:0.74rem; color:${active ? '#f8fafc' : '#64748b'}; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${findPieceFor(limb)}</div>
            </div>
          </div>
        `;
      })
      .join('');
  };

  const syncStaffDomOnly = () => {
    const svgHost = stage.querySelector<HTMLElement>('.js-dp-svg-host');
    if (svgHost) svgHost.innerHTML = renderDrumStaffSvg();
    const hits = getStaffLimbHits(staffStep);
    const kitHost = stage.querySelector<HTMLElement>('.js-dp-kit-host');
    if (kitHost) {
      kitHost.innerHTML = renderTopViewDrumKitSvg({
        title: 'Batería Visual en Vivo — Colores por Mano y Pie',
        limbHits: hits,
        note: 'Haz clic en cualquier pieza del kit para escucharla · R=Mano Der · L=Mano Izq · PD=Pie Der · PI=Pie Izq',
      });
    }
    const limbStrip = stage.querySelector<HTMLElement>('.js-dp-limb-strip');
    if (limbStrip) limbStrip.innerHTML = renderLimbStripHtml(hits);
    const playBtn = stage.querySelector<HTMLButtonElement>('.js-dp-play');
    if (playBtn) {
      playBtn.textContent = staffPlaying ? '⏹ Detener' : '▶ Reproducir Pentagrama';
    }
    stage.querySelectorAll<HTMLElement>('.js-dp-cell').forEach((cell) => {
      const idx = parseInt(cell.getAttribute('data-idx') || '-1', 10);
      cell.classList.toggle('playing-step', idx === staffStep);
    });
  };

  const syncGapDomOnly = () => {
    const toggleBtn = stage.querySelector<HTMLButtonElement>('.js-gap-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = gapRunning ? '⏹ Detener Gap Click' : '▶ Iniciar Gap Click';
    }
    const beatEl = stage.querySelector<HTMLElement>('.js-gap-beat-label');
    if (beatEl) {
      beatEl.textContent = gapRunning
        ? gapInSilentZone
          ? '🤫 COMPÁS EN SILENCIO (¡Mantén tu pulso interno y presiona TAP / ESPACIO!)'
          : `🔊 Escucha el Click (Tiempo ${(gapBeatCounter % 4) + 1}/4)`
        : 'Listo para entrenar tu reloj interno';
      beatEl.style.color = gapInSilentZone ? '#fbbf24' : '#38bdf8';
    }
    const tapBtn = stage.querySelector<HTMLElement>('.js-gap-tap');
    if (tapBtn) {
      tapBtn.style.background = gapInSilentZone
        ? 'linear-gradient(135deg,#10b981,#059669)'
        : 'linear-gradient(135deg,#38bdf8,#0284c7)';
    }
    const fbEl = stage.querySelector<HTMLElement>('.js-gap-feedback');
    if (fbEl) fbEl.textContent = lastGapEval;
  };

  const syncDrillDomOnly = () => {
    const playBtn = stage.querySelector<HTMLButtonElement>('.js-dd-play');
    if (playBtn) {
      playBtn.textContent = drillPlaying ? '⏹ Detener Ejercicio' : '▶ Practicar Ejercicio';
    }
    const hits = getDrillLimbHits(drillStep);
    const kitHost = stage.querySelector<HTMLElement>('.js-dd-kit-host');
    if (kitHost) {
      kitHost.innerHTML = renderTopViewDrumKitSvg({
        title: 'Batería Visual · Quién Golpea Cada Pieza (Mano Der / Mano Izq / Pie Der)',
        limbHits: hits,
        note: 'Colores en tiempo real: Dorado=Mano Der · Rosa=Mano Izq · Azul=Pie Der · Verde=Pie Izq',
      });
    }
    const limbStrip = stage.querySelector<HTMLElement>('.js-dd-limb-strip');
    if (limbStrip) limbStrip.innerHTML = renderLimbStripHtml(hits);
    stage.querySelectorAll<HTMLElement>('.js-dd-step').forEach((el) => {
      const i = parseInt(el.getAttribute('data-i') || '-1', 10);
      const active = i === drillStep;
      el.style.outline = active ? '2px solid #ffffff' : 'none';
      el.style.background = active ? 'rgba(245,158,11,0.34)' : 'rgba(15,23,42,0.9)';
    });
  };

  const render = () => {
    const tabs = `
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
        <button type="button" class="btn js-dp-tab ${activeTab === 'staff' ? 'active' : ''}" data-tab="staff">🥁 1. Pentagrama PAS Sincronizado</button>
        <button type="button" class="btn js-dp-tab ${activeTab === 'gap' ? 'active' : ''}" data-tab="gap">⏱️ 2. Entrenador de Tempo Interno (Gap Click)</button>
        <button type="button" class="btn js-dp-tab ${activeTab === 'kit' ? 'active' : ''}" data-tab="kit">🎛️ 3. Técnicas, Afinación y Sonido del Kit</button>
        <button type="button" class="btn js-dp-tab ${activeTab === 'drills' ? 'active' : ''}" data-tab="drills">🏋️ 4. Ejercicios de Práctica y Motricidad</button>
      </div>
    `;

    let body = '';
    if (activeTab === 'staff') {
      const hits = getStaffLimbHits(staffStep);
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
              <input type="range" class="js-dp-bpm" min="50" max="150" value="${drumBpm}" style="width:105px;" />
            </label>
            <button type="button" class="btn js-dp-preset" data-p="rock">Rock Clásico</button>
            <button type="button" class="btn js-dp-preset" data-p="funk">Funk + Ghost Notes</button>
          </div>
          <button type="button" class="btn btn-primary js-dp-play">${staffPlaying ? '⏹ Detener' : '▶ Reproducir Pentagrama'}</button>
        </div>
        <div class="js-dp-svg-host" style="margin-bottom:10px;">${renderDrumStaffSvg()}</div>
        <div class="seq-grid" style="margin-bottom:10px;">
          ${makeRow('Hi-Hat (✕)', 'HH', 'on')}
          ${makeRow('Caja / Ghost', 'SD', 'on-gold')}
          ${makeRow('Bombo (●)', 'BD', 'on')}
        </div>
        <div class="js-dp-limb-strip" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(135px, 1fr)); gap:6px; margin-bottom:10px;">
          ${renderLimbStripHtml(hits)}
        </div>
        <div class="js-dp-kit-host">${renderTopViewDrumKitSvg({
          title: 'Batería Visual en Vivo — Colores por Mano y Pie',
          limbHits: hits,
        })}</div>
      `;
    } else if (activeTab === 'gap') {
      const beatLabel = gapRunning
        ? gapInSilentZone
          ? '🤫 COMPÁS EN SILENCIO (¡Mantén tu pulso interno y presiona TAP / ESPACIO!)'
          : `🔊 Escucha el Click (Tiempo ${(gapBeatCounter % 4) + 1}/4)`
        : 'Listo para entrenar tu reloj interno';

      body = `
        <div class="card" style="margin-bottom:10px; border-left:3px solid #38bdf8;">
          <h4 style="color:#38bdf8; margin-bottom:6px;">🧠 ¿Cómo funciona el Entrenador de Tempo Interno (Gap Click)?</h4>
          <p class="text-xs" style="color:#cbd5e1; line-height:1.5; margin-bottom:8px;">
            El metrónomo suena durante <strong>X compases</strong> y luego <strong>se apaga por completo</strong> durante <strong>Y compases</strong> (zona de silencio). Durante ese silencio tu cerebro y tu cuerpo sostienen el pulso solos: pulsa <strong>TAP / ESPACIO</strong> (o toca tu groove) y comprueba si regresas exactamente a tiempo en el <strong>Tiempo 1</strong>.
          </p>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(195px, 1fr)); gap:8px; margin-bottom:8px;">
            <div style="background:rgba(15,23,42,0.88); border:1px solid #1e293b; border-radius:8px; padding:8px;">
              <div class="text-xs" style="color:#fbbf24; font-weight:800; margin-bottom:3px;">1. Cómo leer tu desvío (ms)</div>
              <div class="text-xs" style="color:#cbd5e1;">
                • <strong style="color:#34d399;">±0 a ±25 ms:</strong> Reloj sólido de estudio.<br>
                • <strong style="color:#fb7185;">Negativo (-ms):</strong> Te adelantaste (<em>rushing</em>).<br>
                • <strong style="color:#38bdf8;">Positivo (+ms):</strong> Te atrasaste (<em>dragging</em>).
              </div>
            </div>
            <div style="background:rgba(15,23,42,0.88); border:1px solid #1e293b; border-radius:8px; padding:8px;">
              <div class="text-xs" style="color:#34d399; font-weight:800; margin-bottom:3px;">2. Truco de subdivisión interna</div>
              <div class="text-xs" style="color:#cbd5e1;">
                Nunca cuentes en silencio con notas largas: cuenta mentalmente en <strong>corcheas (1-y-2-y-3-y-4-y)</strong> o mueve el talón izquierdo en <strong>2 y 4</strong> para no perder el pulso al hacer fills.
              </div>
            </div>
            <div style="background:rgba(15,23,42,0.88); border:1px solid #1e293b; border-radius:8px; padding:8px;">
              <div class="text-xs" style="color:#c4b5fd; font-weight:800; margin-bottom:3px;">3. Rutina progresiva (4 Niveles)</div>
              <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:4px;">
                <button type="button" class="btn js-gap-level" data-on="3" data-off="1" style="font-size:0.7rem; padding:3px 7px;">N1: 3+1</button>
                <button type="button" class="btn js-gap-level" data-on="2" data-off="1" style="font-size:0.7rem; padding:3px 7px;">N2: 2+1</button>
                <button type="button" class="btn js-gap-level" data-on="1" data-off="1" style="font-size:0.7rem; padding:3px 7px;">N3: 1+1</button>
                <button type="button" class="btn js-gap-level" data-on="1" data-off="2" style="font-size:0.7rem; padding:3px 7px;">N4: 1+2 Pro</button>
              </div>
            </div>
          </div>
        </div>
        <div class="grid-2" style="align-items:center;">
          <div class="card">
            <h4 style="color:#fbbf24;">⏱️ Configuración del Gap Click</h4>
            <div style="display:flex; flex-wrap:wrap; gap:8px; margin:8px 0;">
              <label class="text-xs">BPM: <strong class="js-gap-bpm-val">${gapBpm}</strong>
                <input type="range" class="js-gap-bpm" min="50" max="150" value="${gapBpm}" style="width:100px;" />
              </label>
              <label class="text-xs">Compases con Click:
                <select class="lab-select js-gap-on">
                  <option value="1" ${gapBarsOn === 1 ? 'selected' : ''}>1 compás</option>
                  <option value="2" ${gapBarsOn === 2 ? 'selected' : ''}>2 compases</option>
                  <option value="3" ${gapBarsOn === 3 ? 'selected' : ''}>3 compases</option>
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
            <p class="text-xs js-gap-beat-label" style="color:${gapInSilentZone ? '#fbbf24' : '#38bdf8'}; font-weight:700; margin-top:10px;">${beatLabel}</p>
          </div>
          <div class="card" style="text-align:center;">
            <button type="button" class="btn btn-primary js-gap-tap" style="width:100%; padding:22px 12px; font-size:1.1rem; background:${gapInSilentZone ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#38bdf8,#0284c7)'}; color:#090c12;">
              🥁 PULSA AQUÍ EN EL TIEMPO 1 (TAP / ESPACIO)
            </button>
            <p class="text-sm js-gap-feedback" style="color:#f8fafc; font-weight:700; margin-top:10px;">${lastGapEval}</p>
          </div>
        </div>
      `;
    } else if (activeTab === 'kit') {
      body = `
        <div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
          <button type="button" class="btn js-kit-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener Kit</button>
        </div>
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
    } else {
      const drill = DRUM_DRILLS[drillIdx];
      const hits = getDrillLimbHits(drillStep);
      body = `
        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
            <select class="lab-select js-dd-select" aria-label="Ejercicio de práctica en batería">
              ${DRUM_DRILLS.map((d, idx) => `<option value="${idx}" ${idx === drillIdx ? 'selected' : ''}>${d.name}</option>`).join('')}
            </select>
            <label class="text-xs" style="color:#cbd5e1;">BPM: <strong class="js-dd-bpm-val">${drillBpm}</strong>
              <input type="range" class="js-dd-bpm" min="50" max="150" value="${drillBpm}" style="width:105px;" />
            </label>
          </div>
          <button type="button" class="btn btn-primary js-dd-play">${drillPlaying ? '⏹ Detener Ejercicio' : '▶ Practicar Ejercicio'}</button>
        </div>
        <p class="text-xs" style="color:#38bdf8; margin-bottom:8px;"><strong>Objetivo Motor:</strong> ${drill.focus} — <span style="color:#cbd5e1;">${drill.tip}</span></p>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(36px, 1fr)); gap:5px; background:#090d16; border:1px solid #1e293b; border-radius:10px; padding:10px; margin-bottom:10px;">
          ${drill.steps
            .map((st, idx) => {
              const isBeat = idx % 4 === 0;
              const isAccent = st.hand.includes('★') || st.hand.includes('BD');
              return `
                <div class="js-dd-step" data-i="${idx}" style="border:1px solid ${isBeat ? 'rgba(251,191,36,0.48)' : '#334155'}; background:${idx === drillStep ? 'rgba(245,158,11,0.34)' : 'rgba(15,23,42,0.9)'}; border-radius:7px; padding:7px 3px; text-align:center;">
                  <div style="font-size:0.62rem; color:${isBeat ? '#fbbf24' : '#64748b'}; font-weight:700;">${idx % 4 === 0 ? Math.floor(idx / 4) + 1 : idx % 4 === 1 ? 'e' : idx % 4 === 2 ? '&' : 'a'}</div>
                  <div style="font-size:0.8rem; font-weight:900; color:${isAccent ? '#fbbf24' : '#cbd5e1'}; margin-top:2px;">${st.hand}</div>
                </div>
              `;
            })
            .join('')}
        </div>
        <div class="js-dd-limb-strip" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(135px, 1fr)); gap:6px; margin-bottom:10px;">
          ${renderLimbStripHtml(hits)}
        </div>
        <div class="js-dd-kit-host">${renderTopViewDrumKitSvg({
          title: 'Batería Visual · Quién Golpea Cada Pieza (Mano Der / Mano Izq / Pie Der)',
          limbHits: hits,
        })}</div>
      `;
    }

    stage.innerHTML = `${tabs}${body}`;
  };

  render();

  const startStaffPlay = () => {
    stopAllDrums(true);
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
      syncStaffDomOnly();
      step++;
    };
    tick();
    staffTimer = setInterval(tick, stepMs);
    onStatus(`Pentagrama de Batería PAS en vivo a ${drumBpm} BPM`);
  };

  const toggleStaffPlay = () => {
    if (staffPlaying) {
      stopAllDrums(true);
      syncStaffDomOnly();
      onStatus('Pentagrama de batería detenido');
      return;
    }
    startStaffPlay();
  };

  const startGapClick = () => {
    stopAllDrums(true);
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
      syncGapDomOnly();
      gapBeatCounter++;
    };
    tick();
    gapTimer = setInterval(tick, beatMs);
    onStatus(`Gap Click activo: ${gapBarsOn} compás sonando → ${gapBarsSilent} compás en silencio`);
  };

  const toggleGapClick = () => {
    if (gapRunning) {
      stopAllDrums(true);
      syncGapDomOnly();
      onStatus('Gap Click detenido');
      return;
    }
    startGapClick();
  };

  const startDrillPlay = () => {
    stopAllDrums(true);
    drillPlaying = true;
    const drill = DRUM_DRILLS[drillIdx];
    const stepMs = (60000 / drillBpm) / 4;
    let step = 0;
    const tick = () => {
      if (!drillPlaying) return;
      drillStep = step % drill.steps.length;
      const st = drill.steps[drillStep];
      audio.playDrumHit(st.piece, 0);
      if (st.dual) audio.playDrumHit(st.dual, 0);
      syncDrillDomOnly();
      step++;
    };
    tick();
    drillTimer = setInterval(tick, stepMs);
    onStatus(`Practicando en batería: ${drill.name} (${drillBpm} BPM)`);
  };

  const toggleDrillPlay = () => {
    if (drillPlaying) {
      stopAllDrums(true);
      syncDrillDomOnly();
      onStatus('Ejercicio de batería detenido');
      return;
    }
    startDrillPlay();
  };

  const triggerGapTap = () => {
    if (!gapRunning) {
      lastGapEval = 'Inicia primero el Gap Click para medir tu precisión.';
      syncGapDomOnly();
      return;
    }
    const elapsed = performance.now() - gapStartTimeMs;
    const res = evaluateGapClickTiming(60000 / gapBpm, elapsed);
    const sign = res.deltaMs > 0 ? `+${res.deltaMs}` : `${res.deltaMs}`;
    lastGapEval = `${res.verdict} (Desvío: ${sign} ms)`;
    audio.playDrumHit('kick', 0);
    syncGapDomOnly();
  };

  const unsubDpStop = audio.onStop(() => {
    if (!document.body.contains(stage)) {
      unsubDpStop();
      clearDrumTimers();
      return;
    }
    if (staffPlaying || gapRunning || drillPlaying || staffTimer || gapTimer || drillTimer) {
      clearDrumTimers();
      syncStaffDomOnly();
      syncGapDomOnly();
      syncDrillDomOnly();
    }
  });

  if (typeof window !== 'undefined' && stage.dataset['gapKeyBound'] !== '1') {
    stage.dataset['gapKeyBound'] = '1';
    window.addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.code !== 'Space' || !document.body.contains(stage)) return;
      const tag = (ev.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'button') return;
      if (activeTab === 'gap' && gapRunning) {
        ev.preventDefault();
        triggerGapTap();
      }
    });
  }

  stage.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const svgPiece = t.closest<HTMLElement>('.js-svg-drum-piece');
    if (svgPiece) {
      const code = svgPiece.getAttribute('data-piece') as DrumKitCode | null;
      if (code) {
        audio.playDrumPiece(code, 0);
        onStatus(`Pieza de batería: ${code}`);
      }
      return;
    }
    const tabBtn = t.closest<HTMLElement>('.js-dp-tab');
    if (tabBtn) {
      stopAllDrums(true);
      activeTab = (tabBtn.getAttribute('data-tab') as DrumTab) || 'staff';
      render();
      return;
    }
    const cell = t.closest<HTMLElement>('.js-dp-cell');
    if (cell) {
      const row = cell.getAttribute('data-row') as 'HH' | 'SD' | 'BD';
      const idx = parseInt(cell.getAttribute('data-idx')!, 10);
      if (row === 'SD') {
        grid.SD[idx] = (grid.SD[idx] + 1) % 3;
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
    const gapLevelBtn = t.closest<HTMLElement>('.js-gap-level');
    if (gapLevelBtn) {
      gapBarsOn = parseInt(gapLevelBtn.getAttribute('data-on') || '2', 10);
      gapBarsSilent = parseInt(gapLevelBtn.getAttribute('data-off') || '1', 10);
      const wasRunning = gapRunning;
      stopAllDrums(true);
      lastGapEval = `Nivel cargado: ${gapBarsOn} compás(es) con click → ${gapBarsSilent} compás(es) en silencio.`;
      render();
      if (wasRunning) startGapClick();
      return;
    }
    if (t.closest('.js-gap-toggle')) {
      toggleGapClick();
      return;
    }
    if (t.closest('.js-gap-tap')) {
      triggerGapTap();
      return;
    }
    if (t.closest('.js-kit-stop')) {
      stopAllDrums(true);
      onStatus('Kit de batería detenido');
      return;
    }
    if (t.closest('.js-dd-play')) {
      toggleDrillPlay();
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

  stage.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.classList.contains('js-dp-bpm')) {
      drumBpm = parseInt(t.value, 10);
      const lbl = stage.querySelector('.js-dp-bpm-val');
      if (lbl) lbl.textContent = String(drumBpm);
    } else if (t.classList.contains('js-gap-bpm')) {
      gapBpm = parseInt(t.value, 10);
      const lbl = stage.querySelector('.js-gap-bpm-val');
      if (lbl) lbl.textContent = String(gapBpm);
    } else if (t.classList.contains('js-dd-bpm')) {
      drillBpm = parseInt(t.value, 10);
      const lbl = stage.querySelector('.js-dd-bpm-val');
      if (lbl) lbl.textContent = String(drillBpm);
    }
  });

  stage.addEventListener('change', (e) => {
    const t = e.target as HTMLSelectElement;
    if (t.classList.contains('js-dp-bpm')) {
      drumBpm = parseInt(t.value, 10);
      if (staffPlaying) startStaffPlay();
    } else if (t.classList.contains('js-gap-bpm')) {
      gapBpm = parseInt(t.value, 10);
      if (gapRunning) startGapClick();
    } else if (t.classList.contains('js-gap-on')) {
      gapBarsOn = parseInt(t.value, 10);
      if (gapRunning) startGapClick();
    } else if (t.classList.contains('js-gap-off')) {
      gapBarsSilent = parseInt(t.value, 10);
      if (gapRunning) startGapClick();
    } else if (t.classList.contains('js-dd-select')) {
      drillIdx = parseInt(t.value, 10);
      if (drillPlaying) startDrillPlay();
      else render();
    } else if (t.classList.contains('js-dd-bpm')) {
      drillBpm = parseInt(t.value, 10);
      if (drillPlaying) startDrillPlay();
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
  let bassBpm = 94;
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

  const clearTimerOnly = () => {
    playing = false;
    stepIdx = -1;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const stop = (silenceAudio = true) => {
    clearTimerOnly();
    if (silenceAudio) {
      audio.stopAll(true);
    }
  };

  const syncLockDomOnly = () => {
    const playBtn = stage.querySelector<HTMLButtonElement>('.js-bl-play');
    if (playBtn) {
      playBtn.textContent = playing ? '⏹ Detener' : '▶ Escuchar Lock-In';
    }
    stage.querySelectorAll<HTMLElement>('.js-bl-k, .js-bl-b').forEach((cell) => {
      const idx = parseInt(cell.getAttribute('data-i') || '-1', 10);
      cell.classList.toggle('playing-step', idx === stepIdx);
    });
    const neckHost = stage.querySelector<HTMLElement>('.js-bl-neck-host');
    if (neckHost) {
      const activeMidis = stepIdx >= 0 && noteArr[stepIdx] > 0 ? [noteArr[stepIdx]] : [28, 33, 40];
      const strings = use5Strings ? BASS_5C : BASS_4C;
      neckHost.innerHTML = renderCompactNeckHtml(strings, activeMidis, use5Strings ? 11 : 4, 7);
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
        <div class="neck-control-deck neck-deck-standalone">
          <div class="neck-deck-row">
            <div class="neck-deck-fields">
              <div class="neck-field">
                <label>Groove:</label>
                <select class="lab-select js-bl-groove" aria-label="Groove de bajo y bombo">
                  ${Object.entries(GROOVES)
                    .map(([k, v]) => `<option value="${k}" ${k === grooveName ? 'selected' : ''}>${v.label}</option>`)
                    .join('')}
                </select>
              </div>
              <label class="text-xs" style="color:#cbd5e1;">BPM: <strong class="js-bl-bpm-val">${bassBpm}</strong>
                <input type="range" class="js-bl-bpm" min="65" max="135" value="${bassBpm}" style="width:85px;" />
              </label>
              <button type="button" class="btn js-bl-5c ${use5Strings ? 'active' : ''}">${use5Strings ? '5 Cuerdas (Con B0)' : '4 Cuerdas (E1–G2)'}</button>
              <button type="button" class="btn js-bl-sus ${sustainMode ? 'active' : ''}">${sustainMode ? 'Sustain (Legato)' : 'Staccato (Corto)'}</button>
              <button type="button" class="btn js-bl-ant ${anticipate ? 'active' : ''}">${anticipate ? 'Anticipación -1/16 ON' : 'Anticipación OFF'}</button>
            </div>
            <div class="neck-deck-actions">
              <button type="button" class="btn btn-primary js-bl-play">${playing ? '⏹ Detener' : '▶ Escuchar Lock-In'}</button>
            </div>
          </div>
        </div>
        <div class="seq-grid" style="margin-bottom:8px;">
          <div class="seq-label">🥁 Bombo</div>
          ${kickArr.map((v, i) => `<button type="button" class="seq-cell js-bl-k ${v ? 'on' : ''} ${stepIdx === i ? 'playing-step' : ''}" data-i="${i}">${v ? '●' : ''}</button>`).join('')}
          <div class="seq-label">🎸 Bajo</div>
          ${effectiveBass.map((v, i) => `<button type="button" class="seq-cell js-bl-b ${v ? 'on-gold' : ''} ${stepIdx === i ? 'playing-step' : ''}" data-i="${i}">${v ? '♩' : ''}</button>`).join('')}
        </div>
        <div class="js-bl-neck-host">${renderCompactNeckHtml(strings, activeMidis, use5Strings ? 11 : 4, 7)}</div>
      `;
    } else {
      body = `
        <div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
          <button type="button" class="btn js-bx-stop" style="background:rgba(244,63,94,0.2); color:#fb7185;">⏹ Detener Audio</button>
        </div>
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

  const startPlay = () => {
    stop(true);
    playing = true;
    const stepMs = (60000 / bassBpm) / 4;
    let s = 0;

    const tick = () => {
      if (!playing) return;
      const effectiveBass = anticipate ? [...bassArr.slice(1), bassArr[0]] : bassArr;
      const effectiveNotes = anticipate ? [...noteArr.slice(1), noteArr[0]] : noteArr;
      stepIdx = s % 16;
      syncLockDomOnly();
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
    onStatus(`Lock-In Bajo + Bombo (${GROOVES[grooveName].label}) a ${bassBpm} BPM`);
  };

  const togglePlay = () => {
    if (playing) {
      stop(true);
      syncLockDomOnly();
      onStatus('Bajo + Bombo detenido');
      return;
    }
    startPlay();
  };

  const unsubBlStop = audio.onStop(() => {
    if (!document.body.contains(stage)) {
      unsubBlStop();
      clearTimerOnly();
      return;
    }
    if (playing || timer) {
      clearTimerOnly();
      syncLockDomOnly();
    }
  });

  stage.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const tabBtn = t.closest<HTMLElement>('.js-bl-tab');
    if (tabBtn) {
      stop(true);
      activeTab = (tabBtn.getAttribute('data-tab') as BassTab) || 'lock';
      render();
      return;
    }
    const fretCell = t.closest<HTMLElement>('.js-studio-fret');
    if (fretCell) {
      const midi = parseInt(fretCell.getAttribute('data-midi') || '-1', 10);
      const sIdx = parseInt(fretCell.getAttribute('data-sidx') || '-1', 10);
      const fret = parseInt(fretCell.getAttribute('data-fret') || '-1', 10);
      if (midi >= 0) {
        audio.playElectricBass(midi, 1.0, 0, 0.38, 'finger', true, {
          sIdx,
          fret,
          scopeEl: fretCell.closest<HTMLElement>('.fretboard-wrapper'),
        });
        onStatus(`Bajo eléctrico: ${midiToNoteName(midi)} (Traste ${fret})`);
      }
      return;
    }
    const kBtn = t.closest<HTMLElement>('.js-bl-k');
    if (kBtn) {
      const i = parseInt(kBtn.getAttribute('data-i')!, 10);
      kickArr[i] = kickArr[i] ? 0 : 1;
      if (playing) {
        kBtn.classList.toggle('on', kickArr[i] === 1);
        kBtn.textContent = kickArr[i] ? '●' : '';
      } else {
        render();
      }
      return;
    }
    const bBtn = t.closest<HTMLElement>('.js-bl-b');
    if (bBtn) {
      const i = parseInt(bBtn.getAttribute('data-i')!, 10);
      bassArr[i] = bassArr[i] ? 0 : 1;
      if (bassArr[i] && !noteArr[i]) noteArr[i] = use5Strings ? 23 : 28;
      if (playing) {
        bBtn.classList.toggle('on-gold', bassArr[i] === 1);
        bBtn.textContent = bassArr[i] ? '♩' : '';
      } else {
        render();
      }
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
      if (playing) {
        render();
      } else {
        render();
      }
      return;
    }
    if (t.closest('.js-bl-play')) {
      togglePlay();
      return;
    }
    if (t.closest('.js-bx-stop')) {
      stop(true);
      onStatus('Demostración de bajo detenida');
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

  stage.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.classList.contains('js-bl-bpm')) {
      bassBpm = parseInt(t.value, 10);
      const lbl = stage.querySelector('.js-bl-bpm-val');
      if (lbl) lbl.textContent = String(bassBpm);
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
      if (playing) {
        render();
        startPlay();
      } else {
        render();
      }
    } else if (t.classList.contains('js-bl-bpm')) {
      bassBpm = parseInt(t.value, 10);
      if (playing) startPlay();
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
  type VocalTab = 'agility' | 'vowels' | 'breath';
  let activeTab: VocalTab =
    initialPreset === 'vowels' ? 'vowels' : initialPreset === 'breath' ? 'breath' : 'agility';

  const RIFFS: Record<string, { label: string; desc: string; offsets: number[]; degrees: string[] }> = {
    pent: {
      label: '1. Escala Pentatónica Pop / R&B (1–2–3–5–6–5–3–2–1)',
      desc: 'Ideal para principiantes: evita los semitonos difíciles (4 y 7) y entrena precisión limpia entre notas abiertas.',
      offsets: [0, 2, 4, 7, 9, 7, 4, 2, 0],
      degrees: ['1', '2', '3', '5', '6', '5', '3', '2', '1'],
    },
    blues: {
      label: '2. Melisma Soul / Blues con Blue Note (1–♭3–4–♭5–4–♭3–1)',
      desc: 'Nivel intermedio: practica el deslizamiento expresivo sobre la ♭5 sin perder afinación al regresar a la tónica.',
      offsets: [0, 3, 5, 6, 5, 3, 0],
      degrees: ['1', '♭3', '4', '♭5', '4', '♭3', '1'],
    },
    harm: {
      label: '3. Agilidad Menor Armónica / Clásica (1–2–♭3–4–5–♭6–7–8)',
      desc: 'Nivel avanzado: incluye el salto exótico de 3 semitonos entre ♭6 y 7 (segunda aumentada) exigiendo apoyo firme.',
      offsets: [0, 2, 3, 5, 7, 8, 11, 12],
      degrees: ['1', '2', '♭3', '4', '5', '♭6', '7', '8'],
    },
    trill: {
      label: '4. Trino y Mordente de Precisión (1–2–1–2–1–3–1)',
      desc: 'Alternancia veloz sin movimiento mandibular: mantén la lengua relajada detrás de los dientes inferiores.',
      offsets: [0, 2, 0, 2, 0, 4, 0],
      degrees: ['1', '2', '1', '2', '1', '3', '1'],
    },
  };

  const BREATH_DRILLS: {
    id: string;
    title: string;
    level: string;
    how: string;
    goal: string;
    pattern: number[];
    vowel: 'lip' | 'u' | 'a' | 'o';
    stepMs: number;
  }[] = [
    {
      id: 'sovt',
      title: '1. Calentamiento SOVT (Lip Trill / Pajilla en 1–3–5–8–5–3–1)',
      level: 'Nivel 1 · Base',
      how: 'Sopla haciendo vibrar suavemente los labios ("brrr") o cantando dentro de un popote/pajilla en agua. La contrapresión protege los pliegues vocales.',
      goal: 'Conectar pecho y cabeza sin empuje de garganta ni aire escapado.',
      pattern: [0, 4, 7, 12, 7, 4, 0],
      vowel: 'lip',
      stepMs: 420,
    },
    {
      id: 'intonation',
      title: '2. Afinación de Intervalos Pilar (1–5–1–3–5–8)',
      level: 'Nivel 1–2 · Oído',
      how: 'Escucha el piano guía, imagina la nota mentalmente ("audiación") antes de emitir sonido y cántala con sílaba suave "Nu" o "Ma".',
      goal: 'Fijar el centro de afinación en quintas, terceras y octavas sin "arrastrar" (scooping) desde abajo.',
      pattern: [0, 7, 0, 4, 7, 12],
      vowel: 'u',
      stepMs: 520,
    },
    {
      id: 'onset',
      title: '3. Ataque Limpio Equilibrado (Haa → Aaa sin Golpe Glótico)',
      level: 'Nivel 2 · Técnica',
      how: 'Ni ataque brusco ("¡Ah!" que golpea las cuerdas) ni ataque soplado ("Hhhhah"). Comienza el flujo de aire justo en el milisegundo en que vibran los pliegues.',
      goal: 'Notas sostenidas claras, estables y sin fatiga al hablar o cantar.',
      pattern: [0, 0, 2, 2, 4, 4, 0],
      vowel: 'a',
      stepMs: 480,
    },
    {
      id: 'sustain',
      title: '4. Sostenido + Relajación Faríngea (Voz Recta → Vibrato Natural)',
      level: 'Nivel 3 · Expresión',
      how: 'Sostén la 5ª del acorde durante 4 tiempos manteniendo las costillas expandidas (Appoggio). Nunca fabriques el vibrato moviendo la mandíbula; nace al soltar la tensión.',
      goal: 'Control dinámico de piano a forte (Messa di Voce) y vibrato orgánico.',
      pattern: [0, 4, 7, 7, 7, 4, 0],
      vowel: 'o',
      stepMs: 560,
    },
  ];

  let riffKey = 'pent';
  let baseMidi = 60; // C4
  let bpm = 90;
  let playing = false;
  let litStep = -1;
  let riffTimers: ReturnType<typeof setTimeout>[] = [];
  let loopWithRest = true;
  let restCountdownSec = 0;
  let restBannerText = '';

  // Tab 2: Vowel modification state
  let targetPitch = 68; // Ab4 (high passaggio / upper mix zone)
  let selectedVowel: 'i' | 'e' | 'a' | 'o' | 'u' = 'i';

  // Tab 3: Breathing 4-2-8 & Vocal Exercise state
  let appoggioActive = false;
  let appoggioTimer: ReturnType<typeof setInterval> | null = null;
  let appoggioSec = 0; // 0..(14 + appoggioRestSec - 1)
  let appoggioRestSec = 4; // explicit rest/recovery pause after exhale
  let appoggioCycles = 0;
  let activeDrillId = 'sovt';
  let drillLitStep = -1;

  const clearRiffTimersOnly = () => {
    riffTimers.forEach((t) => clearTimeout(t));
    riffTimers = [];
    playing = false;
    litStep = -1;
    drillLitStep = -1;
    restCountdownSec = 0;
    restBannerText = '';
  };

  const stopAppoggioOnly = () => {
    if (appoggioTimer) {
      clearInterval(appoggioTimer);
      appoggioTimer = null;
    }
    appoggioActive = false;
    appoggioSec = 0;
  };

  const stopAllLocal = (triggerGlobalStop = true) => {
    clearRiffTimersOnly();
    stopAppoggioOnly();
    if (triggerGlobalStop) audio.stopAll();
  };

  audio.onStop(() => {
    const hadActivity = playing || appoggioActive || riffTimers.length > 0;
    stopAllLocal(false);
    if (hadActivity && stage.isConnected) render();
  });

  const syncRiffStepDom = () => {
    stage.querySelectorAll<HTMLElement>('.js-va-step').forEach((btn, idx) => {
      const lit = idx === litStep;
      btn.style.background = lit ? '#f59e0b' : 'rgba(56,189,248,0.18)';
      btn.style.borderColor = lit ? '#fef08a' : '#38bdf8';
      btn.style.color = lit ? '#090c12' : '#f8fafc';
    });
  };

  const syncDrillStepDom = () => {
    stage.querySelectorAll<HTMLElement>('.js-vb-step').forEach((pill, idx) => {
      const lit = idx === drillLitStep;
      pill.style.background = lit ? '#ec4899' : 'rgba(56,189,248,0.15)';
      pill.style.borderColor = lit ? '#fbcfe8' : '#38bdf8';
      pill.style.color = lit ? '#ffffff' : '#e2e8f0';
    });
  };

  const syncRestBannerDom = () => {
    const el = stage.querySelector<HTMLElement>('.js-va-rest-banner');
    if (!el) return;
    if (restCountdownSec > 0 && restBannerText) {
      el.style.display = 'block';
      el.textContent = restBannerText;
    } else {
      el.style.display = 'none';
      el.textContent = '';
    }
  };

  const getAppoggioPhase = (sec: number) => computeAppoggioCyclePhase(sec, appoggioRestSec);

  const syncAppoggioDom = () => {
    const info = getAppoggioPhase(appoggioSec);
    const phaseEl = stage.querySelector<HTMLElement>('.js-va-appoggio-phase');
    const countEl = stage.querySelector<HTMLElement>('.js-va-appoggio-count');
    const tipEl = stage.querySelector<HTMLElement>('.js-va-appoggio-tip');
    const cycEl = stage.querySelector<HTMLElement>('.js-va-appoggio-cycles');
    if (phaseEl) {
      phaseEl.textContent = appoggioActive
        ? info.phase
        : `Listo para iniciar ciclo 4 – 2 – 8 + ${appoggioRestSec}s descanso`;
      phaseEl.style.color = appoggioActive ? info.color : '#94a3b8';
    }
    if (countEl) {
      countEl.textContent = appoggioActive ? `${info.remaining}s` : `${info.totalCycleSec}s`;
      countEl.style.color = appoggioActive ? info.color : '#f8fafc';
    }
    if (tipEl) {
      tipEl.textContent = appoggioActive
        ? info.tip
        : 'Pulsa Iniciar para entrenar el sostén diafragmático con pausa de descanso libre entre cada ciclo.';
    }
    if (cycEl) cycEl.textContent = `${appoggioCycles}`;
  };

  const render = () => {
    const tabs = `
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
        <button type="button" class="btn js-va-tab ${activeTab === 'agility' ? 'active' : ''}" data-tab="agility">⚡ 1. Gimnasio de Agilidad y Melismas</button>
        <button type="button" class="btn js-va-tab ${activeTab === 'vowels' ? 'active' : ''}" data-tab="vowels">👄 2. Modificación de Vocales (Passaggio)</button>
        <button type="button" class="btn js-va-tab ${activeTab === 'breath' ? 'active' : ''}" data-tab="breath">🫁 3. Respiración 4-2-8, SOVT y Afinación</button>
      </div>
    `;

    let body = '';
    if (activeTab === 'agility') {
      const riff = RIFFS[riffKey];
      body = `
        <p class="text-xs mb-2" style="color:#cbd5e1;">${riff.desc}</p>
        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <select class="lab-select js-va-riff" aria-label="Patrón de melisma">
              ${Object.entries(RIFFS).map(([k, v]) => `<option value="${k}" ${k === riffKey ? 'selected' : ''}>${v.label}</option>`).join('')}
            </select>
            <select class="lab-select js-va-root" aria-label="Tónica vocal">
              ${[55, 57, 59, 60, 62, 64, 65].map((m) => `<option value="${m}" ${m === baseMidi ? 'selected' : ''}>Base ${midiToNoteName(m)}</option>`).join('')}
            </select>
            <label class="text-xs" style="color:#cbd5e1;">Velocidad: <strong class="js-va-bpm-val">${bpm}</strong> BPM
              <input type="range" class="js-va-bpm" min="60" max="145" value="${bpm}" style="width:95px;" />
            </label>
            <label class="text-xs" style="color:#a5b4fc; display:inline-flex; align-items:center; gap:5px; cursor:pointer;">
              <input type="checkbox" class="js-va-loop-rest" ${loopWithRest ? 'checked' : ''} /> 🔄 Repetir con pausa (4s para respirar)
            </label>
          </div>
          <button type="button" class="btn btn-primary js-va-play">${playing ? '⏹ Detener' : '▶ Ejecutar Melisma'}</button>
        </div>

        <div class="js-va-rest-banner text-xs" style="display:${restCountdownSec > 0 ? 'block' : 'none'}; margin-bottom:10px; padding:8px 12px; border-radius:8px; background:rgba(129,140,248,0.16); border:1px solid rgba(129,140,248,0.45); color:#c7d2fe; font-weight:700;">${restBannerText}</div>

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
    } else if (activeTab === 'vowels') {
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
              <button type="button" class="btn js-vv-hear-raw">🔊 Sin Modificar (/${selectedVowel}/)</button>
              <button type="button" class="btn btn-primary js-vv-hear-mod">✨ Con Modificación (${vg.mod.split(' ')[0]})</button>
              <button type="button" class="btn js-va-stop-all">⏹ Detener</button>
            </div>
          </div>
        </div>
      `;
    } else {
      const drill = BREATH_DRILLS.find((d) => d.id === activeDrillId) || BREATH_DRILLS[0];
      const appInfo = getAppoggioPhase(appoggioSec);
      body = `
        <div class="grid-2">
          <div class="card" style="border-left:3px solid #10b981;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
              <h4 style="color:#34d399; margin:0;">🫁 Temporizador de Respiración 4–2–8 (Appoggio)</h4>
              <span class="text-xs" style="color:#94a3b8;">Ciclos: <strong class="js-va-appoggio-cycles">${appoggioCycles}</strong></span>
            </div>
            <div style="background:#090d16; border:1px solid #1e293b; border-radius:10px; padding:12px; text-align:center; margin-bottom:10px;">
              <div class="js-va-appoggio-phase text-xs" style="font-weight:800; color:${appoggioActive ? appInfo.color : '#94a3b8'};">
                ${appoggioActive ? appInfo.phase : `Listo para iniciar ciclo 4 – 2 – 8 + ${appoggioRestSec}s descanso`}
              </div>
              <div class="js-va-appoggio-count" style="font-size:2rem; font-weight:900; color:${appoggioActive ? appInfo.color : '#f8fafc'}; margin:4px 0;">
                ${appoggioActive ? `${appInfo.remaining}s` : `${appInfo.totalCycleSec}s`}
              </div>
              <p class="js-va-appoggio-tip text-xs" style="margin:0; color:#cbd5e1;">
                ${appoggioActive ? appInfo.tip : 'Pulsa Iniciar para entrenar el sostén diafragmático con pausa de descanso libre entre cada ciclo.'}
              </p>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; justify-content:space-between;">
              <button type="button" class="btn btn-primary js-va-appoggio-toggle">${appoggioActive ? '⏹ Detener Respiración' : '▶ Iniciar Ciclo 4-2-8'}</button>
              <label class="text-xs" style="color:#a5b4fc;">Descanso tras exhalar:
                <select class="lab-select js-va-appoggio-rest" aria-label="Descanso entre ciclos de respiración">
                  <option value="0" ${appoggioRestSec === 0 ? 'selected' : ''}>0s (Continuo)</option>
                  <option value="3" ${appoggioRestSec === 3 ? 'selected' : ''}>3s (Breve)</option>
                  <option value="4" ${appoggioRestSec === 4 ? 'selected' : ''}>4s (Recomendado)</option>
                  <option value="6" ${appoggioRestSec === 6 ? 'selected' : ''}>6s (Amplio)</option>
                  <option value="8" ${appoggioRestSec === 8 ? 'selected' : ''}>8s (Profundo)</option>
                </select>
              </label>
            </div>
          </div>

          <div class="card" style="border-left:3px solid #ec4899;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:6px;">
              <h4 style="color:#f472b6; margin:0;">🎤 Ejercicios Guiados (SOVT, Afinación y Vibrato)</h4>
              <select class="lab-select js-va-root" aria-label="Tónica vocal">
                ${[55, 57, 59, 60, 62, 64, 65].map((m) => `<option value="${m}" ${m === baseMidi ? 'selected' : ''}>Base ${midiToNoteName(m)}</option>`).join('')}
              </select>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px;">
              ${BREATH_DRILLS.map((d) => `<button type="button" class="btn js-vb-select ${d.id === activeDrillId ? 'active' : ''}" data-id="${d.id}" style="font-size:0.74rem; padding:4px 8px;">${d.title.split('(')[0].trim()}</button>`).join('')}
            </div>
            <div style="background:#090d16; border:1px solid #1e293b; border-radius:8px; padding:10px; margin-bottom:8px;">
              <div class="text-xs" style="color:#fbbf24; font-weight:800; margin-bottom:4px;">${drill.title} · <span style="color:#38bdf8;">${drill.level}</span></div>
              <p class="text-xs" style="margin-bottom:4px;"><strong>Cómo hacerlo:</strong> ${drill.how}</p>
              <p class="text-xs" style="margin:0; color:#34d399;"><strong>Objetivo:</strong> ${drill.goal}</p>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:10px;">
              ${drill.pattern
                .map((off, idx) => {
                  const lit = idx === drillLitStep;
                  return `<span class="js-vb-step" style="padding:4px 8px; border-radius:6px; font-size:0.74rem; font-weight:800; border:1px solid ${lit ? '#fbcfe8' : '#38bdf8'}; background:${lit ? '#ec4899' : 'rgba(56,189,248,0.15)'}; color:${lit ? '#ffffff' : '#e2e8f0'};">${midiToNoteName(baseMidi + off)}</span>`;
                })
                .join('')}
            </div>
            <div class="js-va-rest-banner text-xs" style="display:${restCountdownSec > 0 ? 'block' : 'none'}; margin-bottom:8px; padding:7px 10px; border-radius:8px; background:rgba(129,140,248,0.16); border:1px solid rgba(129,140,248,0.45); color:#c7d2fe; font-weight:700;">${restBannerText}</div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
              <button type="button" class="btn btn-primary js-vb-play">${playing ? '⏹ Detener Ejercicio' : '▶ Escuchar y Cantar Encima'}</button>
              <button type="button" class="btn js-va-stop-all">⏹ Detener Todo</button>
              <label class="text-xs" style="color:#a5b4fc; display:inline-flex; align-items:center; gap:5px; cursor:pointer;">
                <input type="checkbox" class="js-va-loop-rest" ${loopWithRest ? 'checked' : ''} /> 🔄 Repetir con pausa (4s)
              </label>
            </div>
          </div>
        </div>
      `;
    }

    stage.innerHTML = `${tabs}${body}`;
  };

  render();

  const scheduleRestBeforeNextCycle = (onNextCycle: () => void) => {
    const restSec = 4;
    for (let s = restSec; s >= 1; s--) {
      const waitMs = (restSec - s) * 1000;
      const tid = setTimeout(() => {
        if (!playing || !stage.isConnected) return;
        restCountdownSec = s;
        restBannerText = `🫁 Descansa y respira tranquilo antes de la siguiente repetición: ${s}s...`;
        syncRestBannerDom();
      }, waitMs);
      riffTimers.push(tid);
    }
    const resumeId = setTimeout(() => {
      if (!playing || !stage.isConnected) return;
      restCountdownSec = 0;
      restBannerText = '';
      syncRestBannerDom();
      onNextCycle();
    }, restSec * 1000);
    riffTimers.push(resumeId);
  };

  const startRiff = () => {
    clearRiffTimersOnly();
    audio.stopAll();
    playing = true;
    const riff = RIFFS[riffKey];
    const stepMs = (60000 / bpm) / 2;
    const playBtn = stage.querySelector<HTMLElement>('.js-va-play');
    if (playBtn) playBtn.textContent = '⏹ Detener';

    riff.offsets.forEach((off, idx) => {
      const tid = setTimeout(() => {
        if (!playing) return;
        litStep = idx;
        const m = baseMidi + off;
        audio.playAcousticPiano(m, 0.28, 0, 0.14, false);
        audio.playVocalFormant(m, 0.28, 0, 0.25, 'a', false);
        syncRiffStepDom();
      }, idx * stepMs);
      riffTimers.push(tid);
    });
    const endId = setTimeout(() => {
      if (!playing || !stage.isConnected) return;
      litStep = -1;
      syncRiffStepDom();
      if (loopWithRest) {
        scheduleRestBeforeNextCycle(() => startRiff());
      } else {
        clearRiffTimersOnly();
        render();
      }
    }, riff.offsets.length * stepMs + 120);
    riffTimers.push(endId);
    onStatus(`Gimnasio Vocal: ${riff.label} a ${bpm} BPM`);
  };

  const startBreathDrill = () => {
    clearRiffTimersOnly();
    audio.stopAll();
    playing = true;
    const drill = BREATH_DRILLS.find((d) => d.id === activeDrillId) || BREATH_DRILLS[0];
    const playBtn = stage.querySelector<HTMLElement>('.js-vb-play');
    if (playBtn) playBtn.textContent = '⏹ Detener Ejercicio';

    drill.pattern.forEach((off, idx) => {
      const tid = setTimeout(() => {
        if (!playing) return;
        drillLitStep = idx;
        const m = baseMidi + off;
        audio.playAcousticPiano(m, drill.stepMs / 1000, 0, 0.15, false);
        audio.playVocalFormant(m, drill.stepMs / 1000, 0, 0.26, drill.vowel, false);
        syncDrillStepDom();
      }, idx * drill.stepMs);
      riffTimers.push(tid);
    });
    const endId = setTimeout(() => {
      if (!playing || !stage.isConnected) return;
      drillLitStep = -1;
      syncDrillStepDom();
      if (loopWithRest) {
        scheduleRestBeforeNextCycle(() => startBreathDrill());
      } else {
        clearRiffTimersOnly();
        render();
      }
    }, drill.pattern.length * drill.stepMs + 140);
    riffTimers.push(endId);
    onStatus(`Ejercicio vocal guiado: ${drill.title}`);
  };

  stage.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const tabBtn = t.closest<HTMLElement>('.js-va-tab');
    if (tabBtn) {
      stopAllLocal(true);
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
        stopAllLocal(true);
        render();
        return;
      }
      startRiff();
      return;
    }
    if (t.closest('.js-vb-play')) {
      if (playing) {
        stopAllLocal(true);
        render();
        return;
      }
      startBreathDrill();
      return;
    }
    const drillBtn = t.closest<HTMLElement>('.js-vb-select');
    if (drillBtn) {
      clearRiffTimersOnly();
      audio.stopAll();
      activeDrillId = drillBtn.getAttribute('data-id') || 'sovt';
      render();
      return;
    }
    if (t.closest('.js-va-appoggio-toggle')) {
      if (appoggioActive) {
        stopAppoggioOnly();
        audio.stopAll();
        render();
        return;
      }
      appoggioActive = true;
      appoggioSec = 0;
      const playCue = (sec: number) => {
        if (sec === 0) audio.playAcousticPiano(60, 0.25, 0, 0.14, false);
        else if (sec === 4) audio.playAcousticPiano(64, 0.22, 0, 0.13, false);
        else if (sec === 6) audio.playAcousticPiano(67, 0.3, 0, 0.14, false);
        else if (sec === 14 && appoggioRestSec > 0) audio.playAcousticPiano(62, 0.18, 0, 0.05, false);
      };
      render();
      playCue(0);
      appoggioTimer = setInterval(() => {
        if (!appoggioActive || !stage.isConnected) {
          stopAppoggioOnly();
          return;
        }
        appoggioSec += 1;
        const totalSec = 14 + appoggioRestSec;
        if (appoggioSec >= totalSec) {
          appoggioSec = 0;
          appoggioCycles += 1;
        }
        playCue(appoggioSec);
        syncAppoggioDom();
      }, 1000);
      onStatus(
        `Respiración Appoggio 4-2-8 iniciada (4s inhala · 2s suspende · 8s exhala${appoggioRestSec > 0 ? ` · ${appoggioRestSec}s descanso libre` : ''})`
      );
      return;
    }
    if (t.closest('.js-va-stop-all')) {
      stopAllLocal(true);
      render();
      onStatus('Audio y temporizadores vocales detenidos.');
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

  stage.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.classList.contains('js-va-bpm')) {
      bpm = parseInt(t.value, 10);
      const valEl = stage.querySelector('.js-va-bpm-val');
      if (valEl) valEl.textContent = String(bpm);
    }
  });

  stage.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement | HTMLSelectElement;
    if (t.classList.contains('js-va-riff')) {
      clearRiffTimersOnly();
      riffKey = t.value;
      render();
    } else if (t.classList.contains('js-va-root')) {
      baseMidi = parseInt(t.value, 10);
      render();
    } else if (t.classList.contains('js-va-bpm')) {
      bpm = parseInt(t.value, 10);
      if (playing) startRiff();
      else render();
    } else if (t.classList.contains('js-vv-pitch')) {
      targetPitch = parseInt(t.value, 10);
      render();
    } else if (t.classList.contains('js-va-appoggio-rest')) {
      appoggioRestSec = parseInt(t.value, 10);
      if (!appoggioActive) {
        render();
      } else {
        syncAppoggioDom();
      }
    } else if (t.classList.contains('js-va-loop-rest')) {
      loopWithRest = (t as HTMLInputElement).checked;
      render();
    }
  });
}

/**
 * LAB G: Guitar Fingering, Motor Skills & Speed Lab (10 Exercises + BPM + Neck Zone Zoom + Large 1-4 Fingers)
 */
export function buildGuitarDexterityLab(
  stage: HTMLElement,
  audio: StudioAudioPort,
  onStatus: (msg: string) => void,
  style: 'acoustic' | 'electric' = 'electric'
): void {
  interface DexStep {
    sIdx: number; // 0=e(1ª)..5=E(6ª)
    relFret: number; // 0..4 relative to baseFret
    finger: 1 | 2 | 3 | 4;
    label: string;
  }

  const EXERCISES: Record<
    string,
    { title: string; levelTag: string; focus: string; cue: string; steps: DexStep[] }
  > = {
    spider1234: {
      title: '1. Araña Clásica (1–2–3–4 · Independencia Base)',
      levelTag: 'Nivel 1 · Base',
      focus: 'Motricidad base · Púa alternada (↓ ↑) + 1 dedo por traste',
      cue: 'Mantén los dedos previos cerca de la cuerda al avanzar al siguiente; cero tensión en el pulgar.',
      steps: [
        { sIdx: 5, relFret: 0, finger: 1, label: '6ª-1' },
        { sIdx: 5, relFret: 1, finger: 2, label: '6ª-2' },
        { sIdx: 5, relFret: 2, finger: 3, label: '6ª-3' },
        { sIdx: 5, relFret: 3, finger: 4, label: '6ª-4' },
        { sIdx: 4, relFret: 0, finger: 1, label: '5ª-1' },
        { sIdx: 4, relFret: 1, finger: 2, label: '5ª-2' },
        { sIdx: 4, relFret: 2, finger: 3, label: '5ª-3' },
        { sIdx: 4, relFret: 3, finger: 4, label: '5ª-4' },
        { sIdx: 3, relFret: 0, finger: 1, label: '4ª-1' },
        { sIdx: 3, relFret: 1, finger: 2, label: '4ª-2' },
        { sIdx: 3, relFret: 2, finger: 3, label: '4ª-3' },
        { sIdx: 3, relFret: 3, finger: 4, label: '4ª-4' },
      ],
    },
    perm1324: {
      title: '2. Permutación Disociada (1–3–2–4)',
      levelTag: 'Nivel 1 · Control',
      focus: 'Coordinación interdigital · Evita que los dedos 3 y 4 se levanten',
      cue: 'Ideal para destrabar el anular (3) respecto al medio (2). Toca ligado y uniforme al pulso.',
      steps: [
        { sIdx: 5, relFret: 0, finger: 1, label: '6ª-1' },
        { sIdx: 5, relFret: 2, finger: 3, label: '6ª-3' },
        { sIdx: 5, relFret: 1, finger: 2, label: '6ª-2' },
        { sIdx: 5, relFret: 3, finger: 4, label: '6ª-4' },
        { sIdx: 4, relFret: 0, finger: 1, label: '5ª-1' },
        { sIdx: 4, relFret: 2, finger: 3, label: '5ª-3' },
        { sIdx: 4, relFret: 1, finger: 2, label: '5ª-2' },
        { sIdx: 4, relFret: 3, finger: 4, label: '5ª-4' },
      ],
    },
    perm1423: {
      title: '3. Permutación de Meñique Fuerte (1–4–2–3)',
      levelTag: 'Nivel 1 · Fuerza 4',
      focus: 'Fuerza y puntería del dedo 4 (meñique)',
      cue: 'Curva el dedo 4 para pisar con la punta, no plano. Mantiene la muñeca alineada.',
      steps: [
        { sIdx: 3, relFret: 0, finger: 1, label: '4ª-1' },
        { sIdx: 3, relFret: 3, finger: 4, label: '4ª-4' },
        { sIdx: 3, relFret: 1, finger: 2, label: '4ª-2' },
        { sIdx: 3, relFret: 2, finger: 3, label: '4ª-3' },
        { sIdx: 2, relFret: 0, finger: 1, label: '3ª-1' },
        { sIdx: 2, relFret: 3, finger: 4, label: '3ª-4' },
        { sIdx: 2, relFret: 1, finger: 2, label: '3ª-2' },
        { sIdx: 2, relFret: 2, finger: 3, label: '3ª-3' },
      ],
    },
    perm4321: {
      title: '4. Descenso Invertido de Control (4–3–2–1)',
      levelTag: 'Nivel 2 · Precisión',
      focus: 'Sincronización descendente sin precipitar el dedo 4',
      cue: 'Coloca los 4 dedos suavemente y ve soltando de a uno al pasar al siguiente ataque con púa alternada.',
      steps: [
        { sIdx: 0, relFret: 3, finger: 4, label: '1ª-4' },
        { sIdx: 0, relFret: 2, finger: 3, label: '1ª-3' },
        { sIdx: 0, relFret: 1, finger: 2, label: '1ª-2' },
        { sIdx: 0, relFret: 0, finger: 1, label: '1ª-1' },
        { sIdx: 1, relFret: 3, finger: 4, label: '2ª-4' },
        { sIdx: 1, relFret: 2, finger: 3, label: '2ª-3' },
        { sIdx: 1, relFret: 1, finger: 2, label: '2ª-2' },
        { sIdx: 1, relFret: 0, finger: 1, label: '2ª-1' },
      ],
    },
    cross3rds: {
      title: '5. Cruce de Cuerdas en Terceras (Salto de Púa)',
      levelTag: 'Nivel 2 · Púa Alternada',
      focus: 'Motricidad de salto entre cuerdas vecinas y agudas',
      cue: 'Alterna púa abajo (cuerda grave) y púa arriba (cuerda aguda) con economía de movimiento.',
      steps: [
        { sIdx: 3, relFret: 0, finger: 1, label: '4ª-1' },
        { sIdx: 2, relFret: 1, finger: 2, label: '3ª-2' },
        { sIdx: 3, relFret: 2, finger: 3, label: '4ª-3' },
        { sIdx: 2, relFret: 3, finger: 4, label: '3ª-4' },
        { sIdx: 2, relFret: 0, finger: 1, label: '3ª-1' },
        { sIdx: 1, relFret: 1, finger: 2, label: '2ª-2' },
        { sIdx: 2, relFret: 2, finger: 3, label: '3ª-3' },
        { sIdx: 1, relFret: 3, finger: 4, label: '2ª-4' },
      ],
    },
    stringSkip: {
      title: '6. Salto de Cuerda Amplio (6ª↔4ª / 5ª↔3ª)',
      levelTag: 'Nivel 2 · String Skipping',
      focus: 'Puntería de mano derecha saltando una cuerda intermedia',
      cue: 'Evita que suene la cuerda saltada apoyando suavemente el índice izquierdo sobre ella.',
      steps: [
        { sIdx: 5, relFret: 0, finger: 1, label: '6ª-1' },
        { sIdx: 3, relFret: 2, finger: 3, label: '4ª-3' },
        { sIdx: 5, relFret: 3, finger: 4, label: '6ª-4' },
        { sIdx: 3, relFret: 0, finger: 1, label: '4ª-1' },
        { sIdx: 4, relFret: 0, finger: 1, label: '5ª-1' },
        { sIdx: 2, relFret: 2, finger: 3, label: '3ª-3' },
        { sIdx: 4, relFret: 3, finger: 4, label: '5ª-4' },
        { sIdx: 2, relFret: 0, finger: 1, label: '3ª-1' },
      ],
    },
    wideStretch: {
      title: '7. Apertura de Mano 1–2–4 (+1 Traste de Extensión)',
      levelTag: 'Nivel 2 · Elasticidad',
      focus: 'Extensión de 5 trastes para escalas de 3 notas por cuerda',
      cue: 'Baja el pulgar hacia el centro del mástil para abrir entre dedos 1–2 y 2–4 sin doblar la muñeca.',
      steps: [
        { sIdx: 3, relFret: 0, finger: 1, label: '4ª-1' },
        { sIdx: 3, relFret: 2, finger: 2, label: '4ª-2 (+2)' },
        { sIdx: 3, relFret: 4, finger: 4, label: '4ª-4 (+4)' },
        { sIdx: 3, relFret: 2, finger: 2, label: '4ª-2' },
        { sIdx: 2, relFret: 0, finger: 1, label: '3ª-1' },
        { sIdx: 2, relFret: 2, finger: 2, label: '3ª-2 (+2)' },
        { sIdx: 2, relFret: 4, finger: 4, label: '3ª-4 (+4)' },
        { sIdx: 2, relFret: 2, finger: 2, label: '3ª-2' },
      ],
    },
    legatoHp: {
      title: '8. Ligados Hammer-On y Pull-Off (1–H–3–H–4–P–3–P–1)',
      levelTag: 'Nivel 3 · Legato',
      focus: 'Velocidad fluida sin fatigar la mano derecha',
      cue: 'Golpea como un martillo (Hammer) y pellizca ligeramente hacia abajo al soltar (Pull-Off) para mantener volumen parejo.',
      steps: [
        { sIdx: 2, relFret: 0, finger: 1, label: '3ª-1' },
        { sIdx: 2, relFret: 2, finger: 3, label: '3ª-3(H)' },
        { sIdx: 2, relFret: 3, finger: 4, label: '3ª-4(H)' },
        { sIdx: 2, relFret: 2, finger: 3, label: '3ª-3(P)' },
        { sIdx: 2, relFret: 0, finger: 1, label: '3ª-1(P)' },
        { sIdx: 1, relFret: 0, finger: 1, label: '2ª-1' },
        { sIdx: 1, relFret: 2, finger: 3, label: '2ª-3(H)' },
        { sIdx: 1, relFret: 3, finger: 4, label: '2ª-4(H)' },
      ],
    },
    arpeggioSweep: {
      title: '9. Arpegio Diagonal 4ª→1ª (Economía de Púa / Sweep)',
      levelTag: 'Nivel 3 · Arpegios',
      focus: 'Deslizamiento continuo de púa (↓ ↓ ↓ ↑) sobre tríada menor',
      cue: 'Levanta cada dedo justo al pasar a la siguiente cuerda para que las notas no se empasten como acorde.',
      steps: [
        { sIdx: 3, relFret: 2, finger: 3, label: '4ª-3 (Raíz)' },
        { sIdx: 2, relFret: 0, finger: 1, label: '3ª-1 (♭3)' },
        { sIdx: 1, relFret: 1, finger: 2, label: '2ª-2 (5ª)' },
        { sIdx: 0, relFret: 0, finger: 1, label: '1ª-1 (8ª)' },
        { sIdx: 0, relFret: 3, finger: 4, label: '1ª-4 (♭3 ag)' },
        { sIdx: 0, relFret: 0, finger: 1, label: '1ª-1 (8ª)' },
        { sIdx: 1, relFret: 1, finger: 2, label: '2ª-2 (5ª)' },
        { sIdx: 2, relFret: 0, finger: 1, label: '3ª-1 (♭3)' },
      ],
    },
    shiftPos: {
      title: '10. Cambio Limpio de Posición (+2 Trastes en Bloque)',
      levelTag: 'Nivel 3 · Desplazamiento',
      focus: 'Desplazamiento horizontal del brazo en bloque por el mástil',
      cue: 'Relaja el pulgar un milisegundo al deslizar el dedo 1 dos trastes arriba sin arrastrar ruido.',
      steps: [
        { sIdx: 4, relFret: 0, finger: 1, label: 'Pos A-1' },
        { sIdx: 4, relFret: 1, finger: 2, label: 'Pos A-2' },
        { sIdx: 4, relFret: 2, finger: 3, label: 'Pos A-3' },
        { sIdx: 4, relFret: 3, finger: 4, label: 'Pos A-4' },
        { sIdx: 4, relFret: 2, finger: 1, label: 'Pos B-1' },
        { sIdx: 4, relFret: 3, finger: 2, label: 'Pos B-2' },
        { sIdx: 4, relFret: 4, finger: 3, label: 'Pos B-3' },
        { sIdx: 4, relFret: 5, finger: 4, label: 'Pos B-4' },
      ],
    },
    diagWarmup: {
      title: '11. Calentamiento Cromático en Diagonal (Cuerdas 6ª → 1ª)',
      levelTag: 'Nivel 1 · Calentamiento',
      focus: 'Desplazamiento diagonal fluido para lubricar articulaciones al iniciar',
      cue: 'Cada dedo cae en una cuerda más aguda y un traste más arriba; regresa invirtiendo la diagonal sin tensar el hombro.',
      steps: [
        { sIdx: 5, relFret: 0, finger: 1, label: '6ª-1' },
        { sIdx: 4, relFret: 1, finger: 2, label: '5ª-2' },
        { sIdx: 3, relFret: 2, finger: 3, label: '4ª-3' },
        { sIdx: 2, relFret: 3, finger: 4, label: '3ª-4' },
        { sIdx: 2, relFret: 0, finger: 1, label: '3ª-1' },
        { sIdx: 1, relFret: 1, finger: 2, label: '2ª-2' },
        { sIdx: 0, relFret: 2, finger: 3, label: '1ª-3' },
        { sIdx: 0, relFret: 3, finger: 4, label: '1ª-4' },
      ],
    },
    anchoredSpider: {
      title: '12. Araña Pegada / Dedos Anclados (Cero Vuelo de Dedos)',
      levelTag: 'Nivel 1 · Economía',
      focus: 'Independencia real moviendo solo 1 dedo mientras los otros 3 quedan apoyados',
      cue: 'Deja los 4 dedos posados en la 4ª cuerda y cruza únicamente el dedo activo a la 3ª cuerda antes de regresar.',
      steps: [
        { sIdx: 3, relFret: 0, finger: 1, label: '4ª-1 (Ancla)' },
        { sIdx: 2, relFret: 0, finger: 1, label: '3ª-1 (Cruza)' },
        { sIdx: 3, relFret: 1, finger: 2, label: '4ª-2 (Ancla)' },
        { sIdx: 2, relFret: 1, finger: 2, label: '3ª-2 (Cruza)' },
        { sIdx: 3, relFret: 2, finger: 3, label: '4ª-3 (Ancla)' },
        { sIdx: 2, relFret: 2, finger: 3, label: '3ª-3 (Cruza)' },
        { sIdx: 3, relFret: 3, finger: 4, label: '4ª-4 (Ancla)' },
        { sIdx: 2, relFret: 3, finger: 4, label: '3ª-4 (Cruza)' },
      ],
    },
    ringPinkyTrill: {
      title: '13. Trinos de Resistencia Anular–Meñique (3–4 en 3 Cuerdas)',
      levelTag: 'Nivel 2 · Fuerza 3–4',
      focus: 'Fortalecimiento específico del par más débil de la mano izquierda (dedos 3 y 4)',
      cue: 'Ancla el dedo 1 como referencia suave y alterna 3–4–3–4 con el mismo volumen; detente si notas fatiga.',
      steps: [
        { sIdx: 3, relFret: 2, finger: 3, label: '4ª-3' },
        { sIdx: 3, relFret: 3, finger: 4, label: '4ª-4' },
        { sIdx: 3, relFret: 2, finger: 3, label: '4ª-3' },
        { sIdx: 3, relFret: 3, finger: 4, label: '4ª-4' },
        { sIdx: 2, relFret: 2, finger: 3, label: '3ª-3' },
        { sIdx: 2, relFret: 3, finger: 4, label: '3ª-4' },
        { sIdx: 1, relFret: 2, finger: 3, label: '2ª-3' },
        { sIdx: 1, relFret: 3, finger: 4, label: '2ª-4' },
      ],
    },
    insideOutsidePick: {
      title: '14. Inside / Outside Picking en 2 Cuerdas (Sincronía Púa–Dedos)',
      levelTag: 'Nivel 2 · Mano Derecha',
      focus: 'Limpieza en cambios de cuerda por dentro y por fuera con púa alternada estricta',
      cue: 'Mantén la púa estrictamente ↓ ↑ ↓ ↑ sin repetir dirección al cruzar entre 3ª y 2ª cuerda.',
      steps: [
        { sIdx: 2, relFret: 0, finger: 1, label: '3ª-1 (↓)' },
        { sIdx: 1, relFret: 0, finger: 1, label: '2ª-1 (↑)' },
        { sIdx: 2, relFret: 2, finger: 3, label: '3ª-3 (↓)' },
        { sIdx: 1, relFret: 2, finger: 3, label: '2ª-3 (↑)' },
        { sIdx: 2, relFret: 3, finger: 4, label: '3ª-4 (↓)' },
        { sIdx: 1, relFret: 3, finger: 4, label: '2ª-4 (↑)' },
        { sIdx: 2, relFret: 1, finger: 2, label: '3ª-2 (↓)' },
        { sIdx: 1, relFret: 1, finger: 2, label: '2ª-2 (↑)' },
      ],
    },
  };

  let exKey = style === 'acoustic' ? 'arpeggioSweep' : 'spider1234';
  let baseFret = style === 'acoustic' ? 1 : 5;
  let bpm = 75;
  let clickEnabled = true;
  let autoRamp = false;
  let neckZone: NeckZoneMode = 'auto';
  let fingerPriority = true;
  let playing = false;
  let currentStep = -1;
  let laps = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const clearTimerOnly = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    playing = false;
    currentStep = -1;
  };

  audio.onStop(() => {
    const wasPlaying = playing || timer !== null;
    clearTimerOnly();
    if (wasPlaying && stage.isConnected) render();
  });

  const syncLiveStepDom = () => {
    const ex = EXERCISES[exKey];
    const step = currentStep >= 0 ? ex.steps[currentStep] : null;
    stage.querySelectorAll<HTMLElement>('.js-gd-pill').forEach((pill, idx) => {
      const lit = idx === currentStep;
      pill.style.background = lit ? '#f59e0b' : 'rgba(15,23,42,0.88)';
      pill.style.borderColor = lit ? '#fef08a' : '#334155';
      pill.style.color = lit ? '#090c12' : '#e2e8f0';
    });
    const neckWrap = stage.querySelector<HTMLElement>('.js-gd-neck');
    if (neckWrap) {
      neckWrap.querySelectorAll('.fret-note.playing-glow').forEach((n) => {
        n.classList.remove('playing-glow', 'glow-mode-note');
      });
      if (step) {
        const fret = Math.min(12, baseFret + step.relFret);
        const cell = neckWrap.querySelector<HTMLElement>(
          `.fret-cell[data-sidx="${step.sIdx}"][data-fret="${fret}"] .fret-note`
        );
        if (cell) cell.classList.add('playing-glow', 'glow-mode-note');
      }
    }
    const bpmVal = stage.querySelector<HTMLElement>('.js-gd-bpm-val');
    if (bpmVal) bpmVal.textContent = String(bpm);
    const lapEl = stage.querySelector<HTMLElement>('.js-gd-laps');
    if (lapEl) lapEl.textContent = String(laps);
  };

  const render = () => {
    const ex = EXERCISES[exKey];
    const fingerMap = new Map<string, number>();
    const exactPositions = new Set<string>();
    const activeMidis: number[] = [];
    const activeFrets: number[] = [];

    ex.steps.forEach((st) => {
      const f = Math.min(12, baseFret + st.relFret);
      const key = `${st.sIdx}:${f}`;
      exactPositions.add(key);
      if (!fingerMap.has(key)) fingerMap.set(key, st.finger);
      activeMidis.push(GUITAR_6C[st.sIdx].openMidi + f);
      activeFrets.push(f);
    });

    const win = computeGuitarNeckWindow(activeFrets, neckZone, 12);
    const rootPc = (GUITAR_6C[ex.steps[0].sIdx].openMidi + baseFret) % 12;
    const neckHtml = renderCompactNeckHtml(GUITAR_6C, activeMidis, rootPc, 12, fingerMap, exactPositions, {
      minFret: win.minFret,
      maxFret: win.maxFret,
      fingerPriority,
    });

    stage.innerHTML = `
      <div class="neck-control-deck neck-deck-standalone">
        <div class="neck-deck-row">
          <div class="neck-deck-fields">
            <div class="neck-field">
              <label>Ejercicio:</label>
              <select class="lab-select js-gd-ex" aria-label="Ejercicio de digitación">
                ${Object.entries(EXERCISES).map(([k, v]) => `<option value="${k}" ${k === exKey ? 'selected' : ''}>${v.title}</option>`).join('')}
              </select>
            </div>
            <div class="neck-field">
              <label>Inicio:</label>
              <select class="lab-select js-gd-fret" aria-label="Traste inicial">
                ${[1, 3, 5, 7].map((f) => `<option value="${f}" ${f === baseFret ? 'selected' : ''}>Traste ${f}</option>`).join('')}
              </select>
            </div>
            <div class="guitar-seg-group">
              ${[60, 80, 100, 120]
                .map(
                  (p) =>
                    `<button type="button" class="guitar-seg-btn js-gd-bpm-preset ${bpm === p ? 'active' : ''}" data-bpm="${p}">${p}</button>`
                )
                .join('')}
            </div>
            <button type="button" class="btn js-gd-bpm-nudge" data-d="-5" style="min-height:32px; padding:3px 8px;">-5</button>
            <label class="text-xs" style="color:#cbd5e1; display:flex; align-items:center; gap:5px; font-variant-numeric:tabular-nums;">
              <strong class="js-gd-bpm-val" style="color:#fbbf24; min-width:52px;">${bpm} BPM</strong>
              <input type="range" class="js-gd-bpm" min="50" max="180" value="${bpm}" style="width:82px;" />
            </label>
            <button type="button" class="btn js-gd-bpm-nudge" data-d="5" style="min-height:32px; padding:3px 8px;">+5</button>
          </div>
          <div class="neck-deck-actions">
            <button type="button" class="btn btn-primary js-gd-play">${playing ? '⏹ Detener' : '▶ Iniciar Digitación'}</button>
          </div>
        </div>

        <div class="neck-legend-row">
          <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
            <label class="text-xs" style="color:#cbd5e1; display:flex; align-items:center; gap:4px; cursor:pointer;">
              <input type="checkbox" class="js-gd-click" ${clickEnabled ? 'checked' : ''} /> Metrónomo
            </label>
            <label class="text-xs" style="color:#34d399; display:flex; align-items:center; gap:4px; cursor:pointer;">
              <input type="checkbox" class="js-gd-ramp" ${autoRamp ? 'checked' : ''} /> +5 BPM por vuelta
            </label>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <div class="guitar-seg-group">
              <button type="button" class="guitar-seg-btn js-gd-zone ${neckZone === 'auto' ? 'active' : ''}" data-z="auto">Zona (${win.minFret}–${win.maxFret})</button>
              <button type="button" class="guitar-seg-btn js-gd-zone ${neckZone === 'all' ? 'active' : ''}" data-z="all">0–12 Completo</button>
            </div>
            <div class="guitar-seg-group">
              <button type="button" class="guitar-seg-btn js-gd-prio ${!fingerPriority ? 'active' : ''}" data-p="0">Notas + Dedos</button>
              <button type="button" class="guitar-seg-btn js-gd-prio ${fingerPriority ? 'active' : ''}" data-p="1">🖐️ Dedos 1–4</button>
            </div>
          </div>
        </div>

        <div class="neck-readout-bar" style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px; align-items:center;">
          <span><strong style="color:#38bdf8;">${ex.levelTag} · ${ex.focus}:</strong> ${ex.cue} (1=Índice · 2=Medio · 3=Anular · 4=Meñique)</span>
          <span style="color:#94a3b8; font-variant-numeric:tabular-nums;">Vueltas: <strong class="js-gd-laps" style="color:#fbbf24;">${laps}</strong></span>
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px;">
        ${ex.steps
          .map((st, idx) => {
            const lit = idx === currentStep;
            const f = Math.min(12, baseFret + st.relFret);
            return `
              <button type="button" class="js-gd-pill" data-step="${idx}" style="min-height:36px; padding:4px 8px; border-radius:7px; border:1px solid ${lit ? '#fef08a' : '#334155'}; background:${lit ? '#f59e0b' : 'rgba(15,23,42,0.88)'}; color:${lit ? '#090c12' : '#e2e8f0'}; font-size:0.72rem; font-weight:800; text-align:center; cursor:pointer;">
                <div>Dedo ${st.finger}</div>
                <div style="font-size:0.64rem; opacity:0.86;">${st.label} (tr.${f})</div>
              </button>
            `;
          })
          .join('')}
      </div>

      <div class="js-gd-neck">${neckHtml}</div>
    `;
  };

  const scheduleNextStep = () => {
    if (!playing || !stage.isConnected) return;
    const ex = EXERCISES[exKey];
    currentStep = (currentStep + 1) % ex.steps.length;
    if (currentStep === 0 && laps > 0 && autoRamp) {
      bpm = Math.min(180, bpm + 5);
      const bpmInput = stage.querySelector<HTMLInputElement>('.js-gd-bpm');
      if (bpmInput) bpmInput.value = String(bpm);
    }
    const st = ex.steps[currentStep];
    const fret = Math.min(12, baseFret + st.relFret);
    const midi = GUITAR_6C[st.sIdx].openMidi + fret;

    if (clickEnabled && currentStep % 4 === 0) {
      audio.playDrumHit(currentStep === 0 ? 'hihat' : 'ghost', 0);
    }
    audio.playPluckedGuitar(midi, 0.35, 0, 0.19, false, {
      isChord: false,
      sIdx: st.sIdx,
      fret,
      scopeEl: stage,
    });
    if (currentStep === ex.steps.length - 1) laps += 1;
    syncLiveStepDom();

    const stepMs = (60000 / bpm) / 2; // corcheas a BPM
    timer = setTimeout(scheduleNextStep, stepMs);
  };

  const startPlay = () => {
    clearTimerOnly();
    audio.stopAll();
    playing = true;
    currentStep = -1;
    laps = 0;
    const playBtn = stage.querySelector<HTMLElement>('.js-gd-play');
    if (playBtn) playBtn.textContent = '⏹ Detener';
    onStatus(`Digitación "${EXERCISES[exKey].title}" a ${bpm} BPM`);
    scheduleNextStep();
  };

  render();

  stage.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('.js-gd-play')) {
      if (playing) {
        clearTimerOnly();
        audio.stopAll();
        render();
        onStatus('Ejercicio de digitación detenido.');
      } else {
        startPlay();
      }
      return;
    }
    const zoneBtn = t.closest<HTMLElement>('.js-gd-zone');
    if (zoneBtn) {
      neckZone = (zoneBtn.getAttribute('data-z') as NeckZoneMode) === 'all' ? 'all' : 'auto';
      render();
      syncLiveStepDom();
      return;
    }
    const prioBtn = t.closest<HTMLElement>('.js-gd-prio');
    if (prioBtn) {
      fingerPriority = prioBtn.getAttribute('data-p') === '1';
      render();
      syncLiveStepDom();
      return;
    }
    const presetBpmBtn = t.closest<HTMLElement>('.js-gd-bpm-preset');
    if (presetBpmBtn) {
      bpm = parseInt(presetBpmBtn.getAttribute('data-bpm') || '80', 10);
      if (playing) startPlay();
      else render();
      return;
    }
    const nudgeBtn = t.closest<HTMLElement>('.js-gd-bpm-nudge');
    if (nudgeBtn) {
      bpm = Math.max(50, Math.min(180, bpm + parseInt(nudgeBtn.getAttribute('data-d') || '0', 10)));
      if (playing) startPlay();
      else render();
      return;
    }
    const stepPill = t.closest<HTMLElement>('.js-gd-pill');
    if (stepPill) {
      const idx = parseInt(stepPill.getAttribute('data-step') || '0', 10);
      const ex = EXERCISES[exKey];
      const st = ex.steps[idx];
      if (st) {
        currentStep = idx;
        const fret = Math.min(12, baseFret + st.relFret);
        const midi = GUITAR_6C[st.sIdx].openMidi + fret;
        audio.playPluckedGuitar(midi, 0.7, 0, 0.2, true, { sIdx: st.sIdx, fret, scopeEl: stage });
        syncLiveStepDom();
      }
      return;
    }
    const fretEl = t.closest<HTMLElement>('.js-studio-fret');
    if (fretEl) {
      const m = parseInt(fretEl.getAttribute('data-midi') || '60', 10);
      const sIdx = parseInt(fretEl.getAttribute('data-sidx') || '0', 10);
      const fret = parseInt(fretEl.getAttribute('data-fret') || '0', 10);
      audio.playPluckedGuitar(m, 0.7, 0, 0.18, true, { sIdx, fret, scopeEl: stage });
    }
  });

  stage.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.classList.contains('js-gd-bpm')) {
      bpm = parseInt(t.value, 10);
      const valEl = stage.querySelector('.js-gd-bpm-val');
      if (valEl) valEl.textContent = `${bpm} BPM`;
    }
  });

  stage.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement | HTMLSelectElement;
    if (t.classList.contains('js-gd-ex')) {
      clearTimerOnly();
      exKey = t.value;
      laps = 0;
      render();
    } else if (t.classList.contains('js-gd-fret')) {
      baseFret = parseInt(t.value, 10);
      render();
    } else if (t.classList.contains('js-gd-click')) {
      clickEnabled = (t as HTMLInputElement).checked;
    } else if (t.classList.contains('js-gd-ramp')) {
      autoRamp = (t as HTMLInputElement).checked;
    } else if (t.classList.contains('js-gd-bpm')) {
      bpm = parseInt(t.value, 10);
      if (playing) startPlay();
    }
  });
}

/**
 * LAB H: Randomized Chord Memory on Guitar Neck (Phase 1 Study -> Phase 2 Play Along & Recall)
 */
function buildChordMemoryLab(
  stage: HTMLElement,
  audio: StudioAudioPort,
  onStatus: (msg: string) => void
): void {
  let poolKey: ChordMemoryPoolKey = 'basic';
  let seqLength = 4;
  let bpm = 52;
  let showFingeringInQuiz = true;
  let cmNeckZone: NeckZoneMode = 'auto';
  let cmFingerPriority = false;
  let sequence: ChordMemoryItem[] = buildChordMemorySequence(poolKey, seqLength);

  type Phase = 'idle' | 'study' | 'quiz' | 'done';
  let phase: Phase = 'idle';
  let stepIdx = 0;
  let score = 0;
  let streak = 0;
  let feedback = '';
  let answeredCurrent = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const clearTimerOnly = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const stopAllLocal = (triggerGlobalStop = true) => {
    clearTimerOnly();
    phase = 'idle';
    if (triggerGlobalStop) audio.stopAll();
  };

  audio.onStop(() => {
    const wasRunning = phase === 'study' || phase === 'quiz' || timer !== null || feedback !== '';
    stopAllLocal(false);
    stepIdx = 0;
    answeredCurrent = false;
    feedback = '';
    if (wasRunning && stage.isConnected) render();
  });

  const playChordItem = (item: ChordMemoryItem) => {
    const midis: number[] = [];
    // Guitar strings top->bottom in GUITAR_6C are 0(e)..5(E), while item.fretsLowToHigh is 6ª(E)..1ª(e)
    item.fretsLowToHigh.forEach((fret, rawIdx) => {
      if (fret < 0) return;
      const sIdx = 5 - rawIdx;
      midis.push(GUITAR_6C[sIdx].openMidi + fret);
    });
    audio.strumChord(midis, 'guitar', 0.035, true);
  };

  const render = () => {
    const pool = getChordMemoryPool(poolKey);
    const activeItem = sequence[stepIdx] || sequence[0];
    const fingerMap = new Map<string, number>();
    const exactPositions = new Set<string>();
    const activeMidis: number[] = [];
    const mutedStrings = new Set<number>([0, 1, 2, 3, 4, 5]);
    const boxPosList: { sIdx: number; fret: number; finger?: 0 | 1 | 2 | 3 | 4 }[] = [];

    activeItem.fretsLowToHigh.forEach((fret, rawIdx) => {
      if (fret < 0) return;
      const sIdx = 5 - rawIdx;
      mutedStrings.delete(sIdx);
      const key = `${sIdx}:${fret}`;
      exactPositions.add(key);
      const canonicalFinger = activeItem.fingersLowToHigh[rawIdx];
      if (canonicalFinger > 0) fingerMap.set(key, canonicalFinger);
      activeMidis.push(GUITAR_6C[sIdx].openMidi + fret);
      boxPosList.push({
        sIdx,
        fret,
        finger: canonicalFinger >= 0 && canonicalFinger <= 4 ? (canonicalFinger as 0 | 1 | 2 | 3 | 4) : 0,
      });
    });
    const fingerSummary = activeItem.fingersLowToHigh.map((f) => (f < 0 ? 'X' : String(f))).join('-');

    const hideChordName = phase === 'quiz' && !answeredCurrent;
    const showNeck = phase !== 'quiz' || showFingeringInQuiz || answeredCurrent;
    const win = computeGuitarNeckWindow(
      activeItem.fretsLowToHigh.filter((f) => f >= 0),
      cmNeckZone,
      12
    );
    const vBox = computeVerticalChordBoxData({
      positions: boxPosList,
      rootPc: activeItem.rootPc,
    });
    const neckHtml = showNeck
      ? `
        <div class="guitar-ux-toolbar">
          <div style="font-size:0.74rem; color:#94a3b8;">Zoom mástil: <strong style="color:#fbbf24;">${win.label}</strong></div>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            <div class="guitar-seg-group">
              <button type="button" class="guitar-seg-btn js-cm-zone ${cmNeckZone === 'auto' ? 'active' : ''}" data-z="auto">Auto (${win.minFret}–${win.maxFret})</button>
              <button type="button" class="guitar-seg-btn js-cm-zone ${cmNeckZone === 'all' ? 'active' : ''}" data-z="all">0–12</button>
            </div>
            <div class="guitar-seg-group">
              <button type="button" class="guitar-seg-btn js-cm-prio ${!cmFingerPriority ? 'active' : ''}" data-p="0">Notas</button>
              <button type="button" class="guitar-seg-btn js-cm-prio ${cmFingerPriority ? 'active' : ''}" data-p="1">Dedos 1–4</button>
            </div>
          </div>
        </div>
        <div class="guitar-stage-grid">
          ${renderCompactNeckHtml(GUITAR_6C, activeMidis, activeItem.rootPc, 12, fingerMap, exactPositions, {
            minFret: win.minFret,
            maxFret: win.maxFret,
            fingerPriority: cmFingerPriority,
            mutedStrings,
          })}
          ${renderVerticalGuitarChordSvg(vBox, { title: hideChordName ? '❓ Adivina' : activeItem.symbol })}
        </div>
      `
      : `<div style="background:#090d16; border:1px dashed #334155; border-radius:10px; padding:26px; text-align:center; color:#94a3b8; font-size:0.85rem;">👂 Modo Solo Oído activo en Fase 2: escucha el acorde y toca en tu guitarra antes de seleccionar la respuesta.</div>`;

    const headerStatus =
      phase === 'study'
        ? `Fase 1 (Memoriza y Toca) · Acorde ${stepIdx + 1}/${sequence.length}: <strong style="color:#fbbf24;">${activeItem.symbol} (${activeItem.name})</strong>`
        : phase === 'quiz'
          ? hideChordName
            ? `Fase 2 (Repite y Adivina) · Acorde ${stepIdx + 1}/${sequence.length}: <strong style="color:#38bdf8;">¿Qué acorde está sonando?</strong>`
            : `Fase 2 · Acorde ${stepIdx + 1}/${sequence.length}: <strong style="color:#34d399;">${activeItem.symbol} (${activeItem.name})</strong>`
          : phase === 'done'
            ? `🎉 Secuencia completada: <strong>${score}/${sequence.length}</strong> aciertos`
            : `Secuencia lista (${sequence.length} acordes aleatorios) · Pulsa Fase 1 para estudiar`;

    stage.innerHTML = `
      <div class="neck-control-deck neck-deck-standalone">
        <div class="neck-deck-row">
          <div class="neck-deck-fields">
            <div class="neck-field">
              <label>Colección:</label>
              <select class="lab-select js-cm-pool" aria-label="Colección de acordes">
                <option value="basic" ${poolKey === 'basic' ? 'selected' : ''}>Básicos Abiertos (C, A, G, E, D, Am, Em, Dm)</option>
                <option value="barre7" ${poolKey === 'barre7' ? 'selected' : ''}>Cejillas y Séptimas (F, B7, Bm, F#m, C7, G7...)</option>
                <option value="jazz" ${poolKey === 'jazz' ? 'selected' : ''}>Color y Jazz (Maj7, m7, Add9, Sus4)</option>
                <option value="all" ${poolKey === 'all' ? 'selected' : ''}>Todos los Acordes (${CHORD_MEMORY_LIBRARY.length})</option>
              </select>
            </div>
            <div class="neck-field">
              <label>Cantidad:</label>
              <select class="lab-select js-cm-len" aria-label="Cantidad de acordes">
                ${[3, 4, 5, 6].map((n) => `<option value="${n}" ${n === seqLength ? 'selected' : ''}>${n} Acordes</option>`).join('')}
              </select>
            </div>
            <label class="text-xs" style="color:#cbd5e1; display:flex; align-items:center; gap:5px;">Ritmo: <strong>${bpm}</strong> BPM
              <input type="range" class="js-cm-bpm" min="40" max="90" value="${bpm}" style="width:82px;" />
            </label>
          </div>
          <div class="neck-deck-actions">
            <button type="button" class="btn btn-primary js-cm-study">▶ Fase 1: Ver y Tocar</button>
            <button type="button" class="btn js-cm-quiz" style="border-color:#38bdf8; color:#38bdf8;">🎯 Fase 2: Adivinar</button>
            <button type="button" class="btn js-cm-new">🎲 Nueva</button>
            <button type="button" class="btn js-cm-stop">⏹ Detener</button>
          </div>
        </div>

        <div class="neck-readout-bar" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:space-between; align-items:center;">
          <span>${headerStatus}</span>
          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <label style="color:#cbd5e1; display:flex; align-items:center; gap:4px; cursor:pointer;">
              <input type="checkbox" class="js-cm-guide" ${showFingeringInQuiz ? 'checked' : ''} /> Posición en Fase 2
            </label>
            <span style="color:#34d399; font-weight:800; font-variant-numeric:tabular-nums;">Aciertos: ${score} · Racha: 🔥 ${streak}</span>
          </div>
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
        ${sequence
          .map((item, idx) => {
            const active = idx === stepIdx && phase !== 'idle';
            const masked = phase === 'quiz' && idx >= stepIdx && !(idx === stepIdx && answeredCurrent);
            return `
              <div style="flex:1; min-width:74px; padding:6px 8px; border-radius:7px; text-align:center; border:1px solid ${active ? '#f59e0b' : '#334155'}; background:${active ? 'rgba(245,158,11,0.18)' : '#0f172a'};">
                <div class="text-xs" style="color:#94a3b8;">Paso ${idx + 1}</div>
                <div style="font-weight:900; font-size:0.9rem; color:${active ? '#fbbf24' : '#f8fafc'};">${masked ? '❓' : item.symbol}</div>
              </div>
            `;
          })
          .join('')}
      </div>

      ${neckHtml}

      <div class="text-xs mt-2" style="color:#cbd5e1; display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px;">
        <span>${hideChordName ? 'Dedos mano izquierda visibles: 1=Índice, 2=Medio, 3=Anular, 4=Meñique' : `Digitación ${activeItem.symbol}: <strong>${activeItem.fretsLowToHigh.map((f) => (f < 0 ? 'X' : f)).join('-')}</strong> · Dedos: <strong>${fingerSummary}</strong> · <em>${activeItem.hint}</em>`}</span>
        <button type="button" class="btn js-cm-replay" style="padding:4px 12px; font-size:0.75rem;">🔊 Escuchar Acorde Actual</button>
      </div>

      ${
        phase === 'quiz'
          ? `
        <div class="guitar-card-clean mt-3" style="border-color:rgba(56,189,248,0.4);">
          <div class="text-xs mb-2" style="font-weight:800; color:#38bdf8;">Selecciona qué acorde está sonando (Paso ${stepIdx + 1} de ${sequence.length}):</div>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${pool
              .map(
                (opt) =>
                  `<button type="button" class="btn js-cm-pick" data-id="${opt.id}" ${answeredCurrent ? 'disabled' : ''}>${opt.symbol} <span style="opacity:0.7; font-size:0.72rem;">(${opt.name})</span></button>`
              )
              .join('')}
          </div>
          ${feedback ? `<p class="text-xs mt-2" style="font-weight:800; color:${feedback.startsWith('✅') ? '#34d399' : '#f87171'};">${feedback}</p>` : ''}
        </div>
      `
          : feedback
            ? `<p class="text-xs mt-2" style="font-weight:800; color:#fbbf24;">${feedback}</p>`
            : ''
      }
    `;
  };

  const runStudyStep = (idx: number) => {
    clearTimerOnly();
    if (!stage.isConnected || phase !== 'study') return;
    if (idx >= sequence.length) {
      phase = 'idle';
      stepIdx = 0;
      feedback = '✅ Fase 1 terminada. Pulsa "🎯 Fase 2: Repetir y Adivinar" para ponerte a prueba.';
      render();
      onStatus('Fase 1 completada. Listo para Fase 2.');
      return;
    }
    stepIdx = idx;
    render();
    playChordItem(sequence[idx]);
    const msPerChord = Math.round((60000 / bpm) * 2);
    timer = setTimeout(() => runStudyStep(idx + 1), msPerChord);
  };

  const startQuiz = () => {
    clearTimerOnly();
    phase = 'quiz';
    stepIdx = 0;
    score = 0;
    answeredCurrent = false;
    feedback = '';
    render();
    playChordItem(sequence[0]);
    onStatus('Fase 2: Toca en tu guitarra y selecciona qué acorde suena.');
  };

  render();

  stage.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('.js-cm-study')) {
      phase = 'study';
      stepIdx = 0;
      feedback = '';
      runStudyStep(0);
      return;
    }
    if (t.closest('.js-cm-quiz')) {
      startQuiz();
      return;
    }
    if (t.closest('.js-cm-new')) {
      stopAllLocal(true);
      sequence = buildChordMemorySequence(poolKey, seqLength);
      stepIdx = 0;
      feedback = '';
      render();
      onStatus(`Nueva secuencia de ${seqLength} acordes generada.`);
      return;
    }
    if (t.closest('.js-cm-stop')) {
      stopAllLocal(true);
      stepIdx = 0;
      answeredCurrent = false;
      feedback = '';
      render();
      onStatus('Secuencia de memoria detenida.');
      return;
    }
    if (t.closest('.js-cm-replay')) {
      playChordItem(sequence[stepIdx] || sequence[0]);
      return;
    }
    const cmZoneBtn = t.closest<HTMLElement>('.js-cm-zone');
    if (cmZoneBtn) {
      cmNeckZone = (cmZoneBtn.getAttribute('data-z') as NeckZoneMode) === 'all' ? 'all' : 'auto';
      render();
      return;
    }
    const cmPrioBtn = t.closest<HTMLElement>('.js-cm-prio');
    if (cmPrioBtn) {
      cmFingerPriority = cmPrioBtn.getAttribute('data-p') === '1';
      render();
      return;
    }
    const cmFret = t.closest<HTMLElement>('.js-studio-fret');
    if (cmFret) {
      const m = parseInt(cmFret.getAttribute('data-midi') || '60', 10);
      const sIdx = parseInt(cmFret.getAttribute('data-sidx') || '0', 10);
      const fret = parseInt(cmFret.getAttribute('data-fret') || '0', 10);
      audio.playPluckedGuitar(m, 0.9, 0, 0.24, true, { sIdx, fret, scopeEl: stage });
      return;
    }
    const pickBtn = t.closest<HTMLElement>('.js-cm-pick');
    if (pickBtn && phase === 'quiz' && !answeredCurrent) {
      const guessedId = pickBtn.getAttribute('data-id') || '';
      const expected = sequence[stepIdx];
      const res = evaluateChordMemoryAnswer(expected.id, guessedId, streak);
      answeredCurrent = true;
      streak = res.nextStreak;
      if (res.correct) {
        score += 1;
        feedback = `✅ ¡Correcto! Era ${expected.symbol} (${expected.name}).`;
      } else {
        feedback = `❌ Era ${expected.symbol} (${expected.name}) · Trastes ${expected.fretsLowToHigh.map((f) => (f < 0 ? 'X' : f)).join('-')}.`;
      }
      render();
      timer = setTimeout(() => {
        if (!stage.isConnected || phase !== 'quiz') return;
        if (stepIdx + 1 < sequence.length) {
          stepIdx += 1;
          answeredCurrent = false;
          feedback = '';
          render();
          playChordItem(sequence[stepIdx]);
        } else {
          phase = 'done';
          render();
          onStatus(`Reto terminado: ${score}/${sequence.length} acordes acertados.`);
        }
      }, 1450);
    }
  });

  stage.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement | HTMLSelectElement;
    if (t.classList.contains('js-cm-pool')) {
      stopAllLocal(true);
      poolKey = t.value as ChordMemoryPoolKey;
      sequence = buildChordMemorySequence(poolKey, seqLength);
      stepIdx = 0;
      render();
    } else if (t.classList.contains('js-cm-len')) {
      stopAllLocal(true);
      seqLength = parseInt(t.value, 10);
      sequence = buildChordMemorySequence(poolKey, seqLength);
      stepIdx = 0;
      render();
    } else if (t.classList.contains('js-cm-bpm')) {
      bpm = parseInt(t.value, 10);
      render();
    } else if (t.classList.contains('js-cm-guide')) {
      showFingeringInQuiz = (t as HTMLInputElement).checked;
      render();
    }
  });
}

/**
 * LAB I: Daily Guided Training Session (Guitarra, Bajo Eléctrico, Batería y Canto)
 */
function buildDailyTrainingSessionLab(
  stage: HTMLElement,
  audio: StudioAudioPort,
  onStatus: (msg: string) => void,
  initialPreset = ''
): void {
  type InstKey = 'guitarra' | 'bajo' | 'bateria' | 'canto';

  const INST_META: Record<InstKey, { label: string; icon: string; color: string }> = {
    guitarra: { label: 'Guitarra (Acústica / Eléctrica)', icon: '🎸', color: '#f59e0b' },
    bajo: { label: 'Bajo Eléctrico (4 y 5 Cuerdas)', icon: '🎸', color: '#38bdf8' },
    bateria: { label: 'Batería y Percusión', icon: '🥁', color: '#ec4899' },
    canto: { label: 'Canto y Técnica Vocal', icon: '🎤', color: '#10b981' },
  };

  let inst: InstKey =
    initialPreset === 'bajo' || initialPreset === 'bateria' || initialPreset === 'canto'
      ? initialPreset
      : 'guitarra';
  let totalMinutes = 20;
  let blockIdx = 0;
  let vocalLevel: VocalTrainingLevel = 1;
  let vocalSeries: VocalTrainingExercise[] = buildStructuredVocalTrainingSeries(vocalLevel, totalMinutes);
  let vocalBaseMidiOverride: number | null = null; // lets singer shift pitch comfortably
  let vocalRestBeats = 4; // Breath recovery pause between vocal cycles
  const vocalBlockGapSec = 5; // Pause between ending one exercise block and starting the next
  let transitionRestRemaining = 0;
  let activeBreathStatus = '';
  let vocalRestingStep = false;
  let bassStringsCount: 4 | 5 = 4;
  let guitarNeckZone: NeckZoneMode = 'auto';
  let guitarFingerPriority = false;

  const getDefaultBpm = (k: InstKey, idx: number): number => {
    if (k === 'guitarra') return GUITAR_TRAINING_BLOCKS[idx].defaultBpm;
    if (k === 'bajo') return BASS_TRAINING_BLOCKS[idx].defaultBpm;
    if (k === 'bateria') return DRUM_TRAINING_BLOCKS[idx].defaultBpm;
    return vocalSeries[idx].defaultBpm;
  };

  const getBlockRatio = (k: InstKey, idx: number): number => {
    if (k === 'guitarra') return GUITAR_TRAINING_BLOCKS[idx].ratio;
    if (k === 'bajo') return BASS_TRAINING_BLOCKS[idx].ratio;
    if (k === 'bateria') return DRUM_TRAINING_BLOCKS[idx].ratio;
    return vocalSeries[idx].ratio;
  };

  const getBlockTitle = (k: InstKey, idx: number): string => {
    if (k === 'guitarra') return GUITAR_TRAINING_BLOCKS[idx].title;
    if (k === 'bajo') return BASS_TRAINING_BLOCKS[idx].title;
    if (k === 'bateria') return DRUM_TRAINING_BLOCKS[idx].title;
    return `#${idx + 1} · ${vocalSeries[idx].title}`;
  };

  const getBlockCount = (k: InstKey): number => {
    if (k === 'guitarra') return GUITAR_TRAINING_BLOCKS.length;
    if (k === 'bajo') return BASS_TRAINING_BLOCKS.length;
    if (k === 'bateria') return DRUM_TRAINING_BLOCKS.length;
    return vocalSeries.length;
  };

  let customBpm = getDefaultBpm(inst, blockIdx);
  let remainingSec = Math.round(totalMinutes * 60 * getBlockRatio(inst, blockIdx));
  let running = false;
  let demoRunning = false;
  let clickEnabled = true;
  let activeStep = -1;
  let secTimer: ReturnType<typeof setInterval> | null = null;
  let stepTimer: ReturnType<typeof setInterval> | null = null;
  let clickSubTick = 0;

  const formatMmSs = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getBlockSeconds = (idx: number): number =>
    Math.max(30, Math.round(totalMinutes * 60 * getBlockRatio(inst, idx)));

  const stopTimersOnly = () => {
    if (secTimer) {
      clearInterval(secTimer);
      secTimer = null;
    }
    if (stepTimer) {
      clearInterval(stepTimer);
      stepTimer = null;
    }
    running = false;
    demoRunning = false;
    activeStep = -1;
    transitionRestRemaining = 0;
    vocalRestingStep = false;
    activeBreathStatus = '';
  };

  audio.onStop(() => {
    const wasActive = running || demoRunning || secTimer !== null || stepTimer !== null;
    stopTimersOnly();
    if (wasActive && stage.isConnected) render();
  });

  const renderLimbBadges = (hits: DrumLimbHit[]): string => {
    const describe = (limb: 'R' | 'L' | 'RF' | 'LF'): string => {
      const h = hits.find((x) => x.limb === limb);
      if (!h) return 'En espera';
      const pieceName: Record<DrumKitCode, string> = {
        BD: 'Bombo (BD)',
        SD: h.accent ? 'Caja ★ (Acento)' : 'Caja (SD)',
        HH: 'Hi-Hat (HH)',
        HHP: 'Pedal HH',
        T1: 'Tom 1',
        T2: 'Tom 2',
        FT: 'Tom de Piso',
        RD: 'Plato Ride',
        CR: 'Plato Crash',
      };
      return pieceName[h.piece];
    };
    return (['R', 'L', 'RF', 'LF'] as const)
      .map((limb) => {
        const meta = DRUM_LIMB_META[limb];
        const hit = hits.some((h) => h.limb === limb);
        return `
          <div style="padding:7px 9px; border-radius:8px; border:1px solid ${hit ? meta.color : '#1e293b'}; background:${hit ? 'rgba(15,23,42,0.98)' : '#0b101b'}; display:flex; align-items:center; gap:7px;">
            <span style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:6px; background:${hit ? meta.color : '#1e293b'}; color:${hit ? meta.textCol : '#64748b'}; font-size:0.72rem; font-weight:900; flex-shrink:0;">${meta.short}</span>
            <div style="min-width:0;">
              <div style="font-size:0.68rem; color:${hit ? meta.color : '#94a3b8'}; font-weight:800;">${meta.label}</div>
              <div style="font-size:0.76rem; color:${hit ? '#f8fafc' : '#64748b'}; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${describe(limb)}</div>
            </div>
          </div>
        `;
      })
      .join('');
  };

  const syncCountdownDom = () => {
    const timeEl = stage.querySelector<HTMLElement>('.js-dt-time');
    if (timeEl) timeEl.textContent = formatMmSs(remainingSec);
    const progEl = stage.querySelector<HTMLElement>('.js-dt-prog');
    if (progEl) {
      const totalB = getBlockSeconds(blockIdx);
      const pct = Math.min(100, Math.max(0, Math.round(((totalB - remainingSec) / totalB) * 100)));
      progEl.style.width = `${pct}%`;
    }
  };

  const buildGuitarNeckHtmlForBlock = (): string => {
    const blk = GUITAR_TRAINING_BLOCKS[blockIdx];
    const fingerMap = new Map<string, number>();
    const exactPositions = new Set<string>();
    const activeMidis: number[] = [];
    const activeFrets: number[] = [];
    const mutedStrings = new Set<number>([0, 1, 2, 3, 4, 5]);
    const isChordBlock = blk.steps.some((s) => s.isChord);
    const activeStepObj = blk.steps[activeStep >= 0 ? activeStep % blk.steps.length : 0];
    const stepsToShow = isChordBlock ? [activeStepObj] : blk.steps;
    stepsToShow.forEach((st) => {
      st.positions.forEach((p) => {
        const key = `${p.sIdx}:${p.fret}`;
        exactPositions.add(key);
        mutedStrings.delete(p.sIdx);
        if (p.finger > 0 && !fingerMap.has(key)) fingerMap.set(key, p.finger);
        activeMidis.push(GUITAR_6C[p.sIdx].openMidi + p.fret);
        activeFrets.push(p.fret);
      });
    });
    const rootPc = activeMidis.length > 0 ? activeMidis[0] % 12 : 0;
    const win = computeGuitarNeckWindow(activeFrets, guitarNeckZone, 12);
    const neckRendered = renderCompactNeckHtml(GUITAR_6C, activeMidis, rootPc, 12, fingerMap, exactPositions, {
      minFret: win.minFret,
      maxFret: win.maxFret,
      fingerPriority: guitarFingerPriority,
      mutedStrings: isChordBlock ? mutedStrings : undefined,
    });

    if (isChordBlock && activeStepObj) {
      const vBox = computeVerticalChordBoxData({
        positions: activeStepObj.positions.map((p) => ({ sIdx: p.sIdx, fret: p.fret, finger: p.finger })),
        rootPc,
      });
      return `
        <div class="guitar-stage-grid">
          ${neckRendered}
          ${renderVerticalGuitarChordSvg(vBox, { title: activeStepObj.chordSymbol || activeStepObj.label })}
        </div>
      `;
    }
    return neckRendered;
  };

  const syncExerciseVisualsDom = () => {
    stage.querySelectorAll<HTMLElement>('.js-dt-step-pill').forEach((el, idx) => {
      const lit = idx === activeStep;
      const isRestPill = el.getAttribute('data-kind') === 'rest';
      el.style.borderColor = lit ? (isRestPill ? '#c7d2fe' : '#fef08a') : isRestPill ? '#4f46e5' : '#334155';
      el.style.background = lit
        ? isRestPill
          ? '#6366f1'
          : INST_META[inst].color
        : isRestPill
          ? 'rgba(99,102,241,0.14)'
          : 'rgba(15,23,42,0.9)';
      el.style.color = lit ? (isRestPill ? '#ffffff' : '#090c12') : isRestPill ? '#c7d2fe' : '#e2e8f0';
    });

    if (inst === 'canto') {
      const breathLiveEl = stage.querySelector<HTMLElement>('.js-dt-breath-live');
      if (breathLiveEl) {
        breathLiveEl.textContent =
          activeBreathStatus || 'Pulsa "Iniciar Bloque" o "Escuchar Guía" para seguir los pulsos con descanso entre ciclos.';
        breathLiveEl.style.color = vocalRestingStep ? '#c7d2fe' : '#6ee7b7';
        breathLiveEl.style.borderColor = vocalRestingStep ? 'rgba(129,140,248,0.55)' : 'rgba(16,185,129,0.35)';
        breathLiveEl.style.background = vocalRestingStep ? 'rgba(99,102,241,0.18)' : 'rgba(16,185,129,0.1)';
      }
      return;
    }

    if (inst === 'bateria') {
      const blk = DRUM_TRAINING_BLOCKS[blockIdx];
      const st = activeStep >= 0 ? blk.steps[activeStep % blk.steps.length] : null;
      const hits = st ? st.hits : [];
      const kitHost = stage.querySelector<HTMLElement>('.js-dt-drum-svg');
      if (kitHost) {
        kitHost.innerHTML = renderTopViewDrumKitSvg({
          title: `Batería Visual — ${blk.title.replace(/^\d+\.\s*/, '')} (${customBpm} BPM)`,
          limbHits: hits,
        });
      }
      const limbHost = stage.querySelector<HTMLElement>('.js-dt-drum-limbs');
      if (limbHost) limbHost.innerHTML = renderLimbBadges(hits);
    } else if (inst === 'guitarra' || inst === 'bajo') {
      if (inst === 'guitarra') {
        const blk = GUITAR_TRAINING_BLOCKS[blockIdx];
        if (blk.steps.some((s) => s.isChord)) {
          const neckContainer = stage.querySelector<HTMLElement>('.js-dt-neck');
          if (neckContainer) neckContainer.innerHTML = buildGuitarNeckHtmlForBlock();
        }
      }
      const neckWrap = stage.querySelector<HTMLElement>('.js-dt-neck .fretboard-wrapper');
      if (neckWrap) {
        neckWrap.querySelectorAll('.fret-note.playing-glow').forEach((n) => {
          n.classList.remove('playing-glow', 'glow-mode-note', 'glow-mode-chord');
        });
        if (activeStep >= 0) {
          if (inst === 'guitarra') {
            const blk = GUITAR_TRAINING_BLOCKS[blockIdx];
            const st = blk.steps[activeStep % blk.steps.length];
            const cls = st.isChord ? 'glow-mode-chord' : 'glow-mode-note';
            st.positions.forEach((p) => {
              const fn = neckWrap.querySelector<HTMLElement>(
                `.fret-cell[data-sidx="${p.sIdx}"][data-fret="${p.fret}"] .fret-note`
              );
              if (fn) fn.classList.add('playing-glow', cls);
            });
          } else {
            const blk = BASS_TRAINING_BLOCKS[blockIdx];
            const st = blk.steps[activeStep % blk.steps.length];
            const fn = neckWrap.querySelector<HTMLElement>(
              `.fret-cell[data-sidx="${st.sIdx}"][data-fret="${st.fret}"] .fret-note`
            );
            if (fn) fn.classList.add('playing-glow', 'glow-mode-note');
          }
        }
      }
    }
  };

  const buildInstrumentStageHtml = (): string => {
    if (inst === 'bateria') {
      const blk = DRUM_TRAINING_BLOCKS[blockIdx];
      const st = activeStep >= 0 ? blk.steps[activeStep % blk.steps.length] : null;
      const hits = st ? st.hits : [];
      return `
        <div style="margin-top:10px; border-top:1px solid #1e293b; padding-top:10px;">
          <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:8px;">
            <span class="text-xs" style="color:#f472b6; font-weight:800;">🥁 Mapa de Extremidades y Vista Cenital de la Batería (Haz clic en cualquier paso o pieza del kit)</span>
          </div>
          <div class="js-dt-drum-limbs" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(145px, 1fr)); gap:6px; margin-bottom:10px;">
            ${renderLimbBadges(hits)}
          </div>
          <div class="js-dt-drum-svg" style="margin-bottom:10px;">
            ${renderTopViewDrumKitSvg({
              title: `Batería Visual — ${blk.title.replace(/^\d+\.\s*/, '')} (${customBpm} BPM)`,
              limbHits: hits,
            })}
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(136px, 1fr)); gap:6px;">
            ${blk.steps
              .map((stepObj, idx) => {
                const lit = idx === activeStep;
                const badgeStr = stepObj.hits.map((h) => DRUM_LIMB_META[h.limb].short).join('+');
                return `
                  <button type="button" class="btn js-dt-step-pill" data-step="${idx}" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; padding:7px 8px; border-radius:8px; border:1px solid ${lit ? '#fef08a' : '#334155'}; background:${lit ? INST_META[inst].color : 'rgba(15,23,42,0.9)'}; color:${lit ? '#090c12' : '#e2e8f0'}; text-align:center;">
                    <div style="font-size:0.72rem; font-weight:900;">${stepObj.countLabel} · [${badgeStr}]</div>
                    <div style="font-size:0.68rem; opacity:0.92; line-height:1.25;">${stepObj.actionSummary}</div>
                  </button>
                `;
              })
              .join('')}
          </div>
        </div>
      `;
    }

    if (inst === 'guitarra') {
      const blk = GUITAR_TRAINING_BLOCKS[blockIdx];
      const activeFrets = blk.steps.flatMap((s) => s.positions.map((p) => p.fret));
      const win = computeGuitarNeckWindow(activeFrets, guitarNeckZone, 12);
      const neckHtml = buildGuitarNeckHtmlForBlock();

      return `
        <div style="margin-top:10px; border-top:1px solid #1e293b; padding-top:10px;">
          <div class="guitar-ux-toolbar" style="margin-top:0; margin-bottom:8px;">
            <span class="text-xs" style="color:#fbbf24; font-weight:800;">🎸 Mástil Interactivo (${win.label}) · Dedos 1–4</span>
            <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
              <div class="guitar-seg-group">
                <button type="button" class="guitar-seg-btn js-dt-gzone ${guitarNeckZone === 'auto' ? 'active' : ''}" data-z="auto">Auto</button>
                <button type="button" class="guitar-seg-btn js-dt-gzone ${guitarNeckZone === 'open' ? 'active' : ''}" data-z="open">0–5</button>
                <button type="button" class="guitar-seg-btn js-dt-gzone ${guitarNeckZone === 'mid' ? 'active' : ''}" data-z="mid">4–9</button>
                <button type="button" class="guitar-seg-btn js-dt-gzone ${guitarNeckZone === 'high' ? 'active' : ''}" data-z="high">7–12</button>
                <button type="button" class="guitar-seg-btn js-dt-gzone ${guitarNeckZone === 'all' ? 'active' : ''}" data-z="all">0–12</button>
              </div>
              <div class="guitar-seg-group">
                <button type="button" class="guitar-seg-btn js-dt-gfprio ${!guitarFingerPriority ? 'active' : ''}" data-p="0">Notas + Dedos</button>
                <button type="button" class="guitar-seg-btn js-dt-gfprio ${guitarFingerPriority ? 'active' : ''}" data-p="1">🖐️ Dedos 1–4</button>
              </div>
            </div>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
            ${blk.steps
              .map((st, idx) => {
                const lit = idx === activeStep;
                return `
                  <button type="button" class="btn js-dt-step-pill" data-step="${idx}" style="display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:2px; min-height:42px; padding:6px 10px; border-radius:8px; border:1px solid ${lit ? '#fef08a' : '#334155'}; background:${lit ? '#f59e0b' : 'rgba(15,23,42,0.9)'}; color:${lit ? '#090c12' : '#e2e8f0'}; text-align:left;">
                    <div style="font-size:0.74rem; font-weight:800;">${st.label}</div>
                    <div style="font-size:0.65rem; opacity:0.86;">${st.rightHandCue}</div>
                  </button>
                `;
              })
              .join('')}
          </div>
          <div class="js-dt-neck">${neckHtml}</div>
        </div>
      `;
    }

    if (inst === 'bajo') {
      const blk = BASS_TRAINING_BLOCKS[blockIdx];
      const strings = bassStringsCount === 5 ? BASS_5C : BASS_4C;
      const exactPositions = new Set<string>();
      const activeMidis: number[] = [];
      blk.steps.forEach((st) => {
        exactPositions.add(`${st.sIdx}:${st.fret}`);
        activeMidis.push(strings[st.sIdx].openMidi + st.fret);
      });
      const rootPc = activeMidis.length > 0 ? activeMidis[0] % 12 : 0;
      const neckHtml = renderCompactNeckHtml(strings, activeMidis, rootPc, 12, undefined, exactPositions);

      return `
        <div style="margin-top:10px; border-top:1px solid #1e293b; padding-top:10px;">
          <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:8px;">
            <span class="text-xs" style="color:#38bdf8; font-weight:800;">🎸 Mástil de Bajo Eléctrico (${bassStringsCount} Cuerdas) — Sincronizado con Bombo</span>
            <div style="display:flex; gap:5px;">
              <button type="button" class="btn js-dt-bass-str ${bassStringsCount === 4 ? 'active' : ''}" data-c="4" style="font-size:0.72rem; padding:3px 9px;">4 Cuerdas</button>
              <button type="button" class="btn js-dt-bass-str ${bassStringsCount === 5 ? 'active' : ''}" data-c="5" style="font-size:0.72rem; padding:3px 9px;">5 Cuerdas</button>
            </div>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
            ${blk.steps
              .map((st, idx) => {
                const lit = idx === activeStep;
                return `
                  <button type="button" class="btn js-dt-step-pill" data-step="${idx}" style="display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:2px; padding:6px 10px; border-radius:8px; border:1px solid ${lit ? '#fef08a' : '#334155'}; background:${lit ? '#38bdf8' : 'rgba(15,23,42,0.9)'}; color:${lit ? '#090c12' : '#e2e8f0'}; text-align:left;">
                    <div style="font-size:0.72rem; font-weight:800;">${st.label}</div>
                    <div style="font-size:0.64rem; opacity:0.88;">${st.kickSync ? '🥁 ' : ''}${st.rightHandCue}</div>
                  </button>
                `;
              })
              .join('')}
          </div>
          <div class="js-dt-neck">${neckHtml}</div>
        </div>
      `;
    }

    // Canto: Detailed Step-by-Step Guide + Level 1-3 Structured 4-Phase Series (Breathing Always First)
    const ex = vocalSeries[blockIdx];
    const baseMidi = vocalBaseMidiOverride ?? ex.baseMidi;
    const isBreath = Boolean(ex.isBreathingOnly && ex.breathSteps?.length);
    const breathCycleSteps = isBreath && ex.breathSteps ? getVocalCycleWithRest(ex.breathSteps, vocalRestBeats) : [];
    const LEVEL_LABELS: Record<VocalTrainingLevel, string> = {
      1: '🌱 Nivel 1 · Base',
      2: '🎤 Nivel 2 · Intermedio',
      3: '🏆 Nivel 3 · Avanzado',
    };

    return `
      <div style="margin-top:10px; border-top:1px solid #1e293b; padding-top:10px;">
        <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:10px;">
          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <span class="text-xs" style="color:#34d399; font-weight:800;">🎯 Serie Progresiva de Canto (Respiración obligatoria primero):</span>
            ${([1, 2, 3] as VocalTrainingLevel[])
              .map(
                (lv) => `
                  <button type="button" class="btn js-dt-vocal-level ${vocalLevel === lv ? 'active' : ''}" data-level="${lv}" style="font-size:0.74rem; padding:4px 10px; border:1px solid ${vocalLevel === lv ? '#34d399' : '#334155'}; background:${vocalLevel === lv ? 'rgba(16,185,129,0.2)' : 'rgba(15,23,42,0.85)'}; color:${vocalLevel === lv ? '#6ee7b7' : '#cbd5e1'}; font-weight:700;">
                    ${LEVEL_LABELS[lv]}
                  </button>
                `
              )
              .join('')}
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
            <label class="text-xs" style="color:#a5b4fc;">🫁 Pausa entre ciclos:
              <select class="lab-select js-dt-vocal-rest" aria-label="Pausa de respiración entre ciclos vocales">
                <option value="0" ${vocalRestBeats === 0 ? 'selected' : ''}>Sin pausa (0 pulsos)</option>
                <option value="2" ${vocalRestBeats === 2 ? 'selected' : ''}>2 pulsos (Breve)</option>
                <option value="4" ${vocalRestBeats === 4 ? 'selected' : ''}>4 pulsos (Descanso ideal)</option>
                <option value="6" ${vocalRestBeats === 6 ? 'selected' : ''}>6 pulsos (Amplio)</option>
                <option value="8" ${vocalRestBeats === 8 ? 'selected' : ''}>8 pulsos (Profundo)</option>
              </select>
            </label>
            ${
              isBreath
                ? `<span class="text-xs" style="color:#38bdf8; font-weight:700;">🌬️ Guía rítmica por pulsos</span>`
                : `<label class="text-xs" style="color:#cbd5e1;">Tónica cómoda:
                    <select class="lab-select js-dt-vocal-base" aria-label="Tónica del ejercicio vocal">
                      ${[55, 57, 59, 60, 62, 64, 65].map((m) => `<option value="${m}" ${m === baseMidi ? 'selected' : ''}>${midiToNoteName(m)}</option>`).join('')}
                    </select>
                  </label>`
            }
          </div>
        </div>

        ${
          transitionRestRemaining > 0
            ? `
              <div style="margin-bottom:10px; padding:10px 12px; border-radius:10px; background:rgba(99,102,241,0.2); border:1px solid rgba(129,140,248,0.6); display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px;">
                <div class="text-xs" style="color:#e0e7ff; font-weight:800;">
                  🫁 Descanso entre ejercicios (#${blockIdx + 2}): toma aire profundo y relaja hombros — comienza en <strong style="color:#fef08a;">${transitionRestRemaining}s</strong>
                </div>
                <button type="button" class="btn btn-primary js-dt-skip-gap" style="font-size:0.74rem; padding:4px 10px;">⏭ Empezar Siguiente Ya</button>
              </div>
            `
            : ''
        }

        <div class="grid-2" style="gap:8px; margin-bottom:10px;">
          <div style="background:#0f172a; border:1px solid #1e293b; border-radius:8px; padding:10px;">
            <div class="text-xs" style="color:#34d399; font-weight:800; margin-bottom:8px;">📋 Qué debes hacer paso a paso:</div>
            <div style="display:flex; flex-direction:column; gap:7px; font-size:0.78rem; color:#e2e8f0;">
              ${ex.howToSteps
                .map(
                  (s, sIdx) => `
                  <div style="display:flex; align-items:flex-start; gap:8px;">
                    <span style="flex:0 0 auto; width:20px; height:20px; border-radius:999px; background:rgba(16,185,129,0.2); border:1px solid rgba(52,211,153,0.5); color:#34d399; font-size:0.7rem; font-weight:900; display:inline-flex; align-items:center; justify-content:center; margin-top:1px;">${sIdx + 1}</span>
                    <span style="line-height:1.4;">${s}</span>
                  </div>
                `
                )
                .join('')}
            </div>
          </div>
          <div style="background:#0f172a; border:1px solid #1e293b; border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:7px; justify-content:center;">
            <div class="text-xs" style="line-height:1.45;"><strong style="color:#a78bfa;">🎯 Objetivo técnico:</strong> ${ex.focusTag}</div>
            <div class="text-xs" style="line-height:1.45;"><strong style="color:#fbbf24;">🗣️ Sílaba / Guía:</strong> ${ex.syllableCue}</div>
            <div class="text-xs" style="line-height:1.45;"><strong style="color:#38bdf8;">🧍 Postura y Sensación:</strong> ${ex.postureCue}</div>
            <div class="text-xs" style="line-height:1.45;"><strong style="color:#fb7185;">⚠️ Error a evitar:</strong> ${ex.commonMistake}</div>
          </div>
        </div>

        ${
          isBreath && breathCycleSteps.length
            ? `
              <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:stretch; margin-bottom:8px;">
                ${breathCycleSteps
                  .map((bStep, idx) => {
                    const lit = idx === activeStep;
                    const isRestPill = bStep.kind === 'rest';
                    return `
                      <button type="button" class="btn js-dt-step-pill" data-step="${idx}" data-kind="${bStep.kind}" style="display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:2px; padding:7px 12px; border-radius:8px; border:1px solid ${lit ? (isRestPill ? '#c7d2fe' : '#fef08a') : isRestPill ? '#4f46e5' : '#334155'}; background:${lit ? (isRestPill ? '#6366f1' : '#10b981') : isRestPill ? 'rgba(99,102,241,0.14)' : 'rgba(15,23,42,0.9)'}; color:${lit ? (isRestPill ? '#ffffff' : '#090c12') : isRestPill ? '#c7d2fe' : '#f8fafc'}; text-align:left;">
                        <div style="font-size:0.76rem; font-weight:900;">${isRestPill ? '🫁 ' : ''}${bStep.label}</div>
                        <div style="font-size:0.66rem; opacity:0.9;">${bStep.cue}</div>
                      </button>
                    `;
                  })
                  .join('')}
              </div>
              <div class="js-dt-breath-live text-xs" style="padding:7px 10px; border-radius:8px; border:1px solid ${vocalRestingStep ? 'rgba(129,140,248,0.55)' : 'rgba(16,185,129,0.35)'}; background:${vocalRestingStep ? 'rgba(99,102,241,0.18)' : 'rgba(16,185,129,0.1)'}; color:${vocalRestingStep ? '#c7d2fe' : '#6ee7b7'}; font-weight:700;">
                ${activeBreathStatus || `Pulsa "Iniciar Bloque" o "Escuchar Guía" para seguir los pulsos con ${vocalRestBeats > 0 ? `${vocalRestBeats} pulsos de descanso entre ciclos` : 'ciclos continuos'}.`}
              </div>
            `
            : `
              <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:8px;">
                ${ex.patternOffsets
                  .map((off, idx) => {
                    const m = baseMidi + off;
                    const lit = idx === activeStep;
                    return `
                      <button type="button" class="btn js-dt-step-pill" data-step="${idx}" style="min-width:54px; padding:7px 10px; border-radius:8px; border:1px solid ${lit ? '#fef08a' : '#334155'}; background:${lit ? '#10b981' : 'rgba(15,23,42,0.9)'}; color:${lit ? '#090c12' : '#f8fafc'}; font-weight:800;">
                        ${midiToNoteName(m)}
                      </button>
                    `;
                  })
                  .join('')}
              </div>
              <div class="js-dt-breath-live text-xs" style="padding:7px 10px; border-radius:8px; border:1px solid ${vocalRestingStep ? 'rgba(129,140,248,0.55)' : 'rgba(16,185,129,0.35)'}; background:${vocalRestingStep ? 'rgba(99,102,241,0.18)' : 'rgba(16,185,129,0.1)'}; color:${vocalRestingStep ? '#c7d2fe' : '#6ee7b7'}; font-weight:700;">
                ${activeBreathStatus || (vocalRestBeats > 0 ? `Incluye pausa de ${vocalRestBeats} pulsos para respirar entre cada repetición.` : 'Repetición continua sin pausa entre ciclos.')}
              </div>
            `
        }
      </div>
    `;
  };

  const render = () => {
    const meta = INST_META[inst];
    const totalB = getBlockSeconds(blockIdx);
    const pct = Math.min(100, Math.max(0, Math.round(((totalB - remainingSec) / totalB) * 100)));
    const count = getBlockCount(inst);
    const recBpm = getDefaultBpm(inst, blockIdx);
    const activeTitle = getBlockTitle(inst, blockIdx);
    const activeDrill =
      inst === 'guitarra'
        ? GUITAR_TRAINING_BLOCKS[blockIdx].drill
        : inst === 'bajo'
          ? BASS_TRAINING_BLOCKS[blockIdx].drill
          : inst === 'bateria'
            ? DRUM_TRAINING_BLOCKS[blockIdx].drill
            : vocalSeries[blockIdx].postureCue;
    const activeCue =
      inst === 'guitarra'
        ? GUITAR_TRAINING_BLOCKS[blockIdx].cue
        : inst === 'bajo'
          ? BASS_TRAINING_BLOCKS[blockIdx].cue
          : inst === 'bateria'
            ? DRUM_TRAINING_BLOCKS[blockIdx].cue
            : `Sílaba guía: ${vocalSeries[blockIdx].syllableCue}`;

    stage.innerHTML = `
      <div class="neck-control-deck neck-deck-standalone">
        <div class="neck-deck-row">
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            {INST_BTNS}
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
            <select class="lab-select js-dt-mins" aria-label="Duración de sesión">
              <option value="10" ${totalMinutes === 10 ? 'selected' : ''}>Sesión Exprés (10 min)</option>
              <option value="20" ${totalMinutes === 20 ? 'selected' : ''}>Sesión Completa (20 min)</option>
              <option value="30" ${totalMinutes === 30 ? 'selected' : ''}>Sesión Profunda (30 min)</option>
            </select>
            <label class="text-xs" style="color:#cbd5e1; display:flex; align-items:center; gap:4px; cursor:pointer;">
              <input type="checkbox" class="js-dt-click" ${clickEnabled ? 'checked' : ''} /> Metrónomo guía
            </label>
          </div>
        </div>
      </div>

      ${
        inst === 'canto'
          ? `
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;">
              ${([1, 2, 3, 4] as const)
                .map((phaseNum) => {
                  const phaseItems = vocalSeries
                    .map((ex, idx) => ({ ex, idx }))
                    .filter((item) => item.ex.phaseOrder === phaseNum);
                  if (phaseItems.length === 0) return '';
                  const phaseTitle = phaseItems[0].ex.phaseLabel;
                  return `
                    <div style="background:#0b101b; border:1px solid #1e293b; border-radius:10px; padding:8px;">
                      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:6px;">
                        <span class="text-xs" style="color:#34d399; font-weight:800;">${phaseTitle}</span>
                        <span class="text-xs" style="color:#94a3b8;">${phaseItems.length} ${phaseItems.length === 1 ? 'ejercicio' : 'ejercicios'} · Nivel ${vocalLevel} (${totalMinutes} min)</span>
                      </div>
                      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(190px, 1fr)); gap:6px;">
                        ${phaseItems
                          .map(({ ex, idx }) => {
                            const active = idx === blockIdx;
                            const bSec = getBlockSeconds(idx);
                            const durLabel =
                              bSec % 60 === 0
                                ? `${bSec / 60}m`
                                : `${Math.floor(bSec / 60)}m ${bSec % 60}s`;
                            const bBpm = idx === blockIdx ? customBpm : ex.defaultBpm;
                            return `
                              <button type="button" class="btn js-dt-pick-block" data-idx="${idx}" style="display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-start; gap:3px; text-align:left; padding:8px 10px; border-color:${active ? meta.color : '#334155'}; background:${active ? 'rgba(16,185,129,0.14)' : '#0f172a'};">
                                <div class="text-xs" style="color:${active ? '#6ee7b7' : '#94a3b8'}; font-weight:800;">#${idx + 1} · ${ex.focusTag} · ${durLabel} · ${bBpm} BPM</div>
                                <div class="text-xs" style="color:#f8fafc; font-weight:700; line-height:1.3;">${ex.title}</div>
                              </button>
                            `;
                          })
                          .join('')}
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>
          `
          : inst === 'guitarra'
            ? `
              <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;">
                ${[
                  'Fase 1 · Motricidad y Calentamiento',
                  'Fase 2 · Acordes y Cejillas',
                  'Fase 3 · Fingerpicking, Ligados y Groove',
                ]
                  .map((phaseName) => {
                    const phaseItems = GUITAR_TRAINING_BLOCKS.map((ex, idx) => ({ ex, idx })).filter(
                      (item) => item.ex.phaseLabel === phaseName
                    );
                    if (phaseItems.length === 0) return '';
                    return `
                      <div style="background:#0b101b; border:1px solid #1e293b; border-radius:10px; padding:8px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:6px;">
                          <span class="text-xs" style="color:#fbbf24; font-weight:800;">${phaseName}</span>
                          <span class="text-xs" style="color:#94a3b8;">${phaseItems.length} ejercicios</span>
                        </div>
                        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(195px, 1fr)); gap:6px;">
                          ${phaseItems
                            .map(({ ex, idx }) => {
                              const active = idx === blockIdx;
                              const bSec = getBlockSeconds(idx);
                              const mins = (bSec / 60).toFixed(1).replace('.0', '');
                              const bBpm = idx === blockIdx ? customBpm : ex.defaultBpm;
                              return `
                                <button type="button" class="btn js-dt-pick-block" data-idx="${idx}" style="display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-start; gap:3px; min-height:48px; text-align:left; padding:8px 10px; border-color:${active ? meta.color : '#334155'}; background:${active ? 'rgba(245,158,11,0.14)' : '#0f172a'};">
                                  <div class="text-xs" style="color:${active ? '#fbbf24' : '#94a3b8'}; font-weight:800; font-variant-numeric:tabular-nums;">#${idx + 1} · ${ex.focusTag || 'Guitarra'} · ${mins}m · ${bBpm} BPM</div>
                                  <div class="text-xs" style="color:#f8fafc; font-weight:700; line-height:1.3;">${ex.title.replace(/^\d+\.\s*/, '')}</div>
                                </button>
                              `;
                            })
                            .join('')}
                        </div>
                      </div>
                    `;
                  })
                  .join('')}
              </div>
            `
            : `
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(175px, 1fr)); gap:6px; margin-bottom:10px;">
                ${Array.from({ length: count }, (_, idx) => {
                  const active = idx === blockIdx;
                  const mins = (getBlockSeconds(idx) / 60).toFixed(1).replace('.0', '');
                  const bTitle = getBlockTitle(inst, idx).replace(/^\d+\.\s*/, '');
                  const bBpm = idx === blockIdx ? customBpm : getDefaultBpm(inst, idx);
                  return `
                    <button type="button" class="btn js-dt-pick-block" data-idx="${idx}" style="display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-start; gap:3px; text-align:left; padding:8px 10px; border-color:${active ? meta.color : '#334155'}; background:${active ? 'rgba(56,189,248,0.12)' : '#0f172a'};">
                      <div class="text-xs" style="color:${active ? meta.color : '#94a3b8'}; font-weight:800;">Bloque ${idx + 1} · ${mins}m · ${bBpm} BPM</div>
                      <div class="text-xs" style="color:#f8fafc; font-weight:700; line-height:1.3;">${bTitle}</div>
                    </button>
                  `;
                }).join('')}
              </div>
            `
      }

      <div class="card" style="border:1px solid #1e293b; border-top:3px solid ${meta.color}; background:#090d16;">
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px;">
          <div style="flex:1; min-width:220px;">
            <div class="text-xs" style="color:${meta.color}; font-weight:800;">${meta.icon} ${meta.label} · Metrónomo actual: <strong class="js-dt-bpm-readout">${customBpm}</strong> BPM (sugerido ${recBpm})</div>
            <h4 style="margin:4px 0 6px; color:#f8fafc;">${activeTitle}</h4>
            <p class="text-xs" style="margin-bottom:4px;"><strong>Qué hacer:</strong> ${activeDrill}</p>
            <p class="text-xs" style="margin:0; color:#34d399;"><strong>Enfoque clave:</strong> ${activeCue}</p>
          </div>
          <div style="text-align:center; min-width:140px; padding:8px 14px; border-radius:10px; background:#0f172a; border:1px solid #1e293b;">
            <div class="text-xs" style="color:#94a3b8;">Tiempo del bloque</div>
            <div class="js-dt-time" style="font-size:2rem; font-weight:900; color:${meta.color}; font-variant-numeric:tabular-nums;">${formatMmSs(remainingSec)}</div>
          </div>
        </div>

        <!-- User-Adjustable Metronome Control Strip -->
        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; margin:10px 0 6px; padding:8px 10px; border-radius:8px; background:#0f172a; border:1px solid #1e293b;">
          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <span class="text-xs" style="color:#cbd5e1; font-weight:700;">⏱️ Ajustar Metrónomo:</span>
            <button type="button" class="btn js-dt-bpm-nudge" data-d="-5" style="padding:3px 8px; font-size:0.74rem;">-5</button>
            <input type="range" class="js-dt-bpm" aria-label="BPM del metrónomo" min="45" max="170" value="${customBpm}" style="width:120px;" />
            <button type="button" class="btn js-dt-bpm-nudge" data-d="5" style="padding:3px 8px; font-size:0.74rem;">+5</button>
            <strong class="js-dt-bpm-val text-xs" style="color:${meta.color}; min-width:56px;">${customBpm} BPM</strong>
            <button type="button" class="btn js-dt-bpm-reset" style="padding:3px 8px; font-size:0.7rem;">Sugerido (${recBpm})</button>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            <button type="button" class="btn btn-primary js-dt-toggle">${running ? '⏸ Pausar Sesión' : '▶ Iniciar Bloque'}</button>
            <button type="button" class="btn js-dt-demo" style="background:rgba(56,189,248,0.16); color:#38bdf8; border:1px solid rgba(56,189,248,0.4);">${demoRunning && !running ? '⏹ Parar Guía' : '🎧 Escuchar Guía'}</button>
            <button type="button" class="btn js-dt-next">⏭ Siguiente</button>
            <button type="button" class="btn js-dt-reset">🔄 Reiniciar</button>
            <button type="button" class="btn js-dt-stop">⏹ Detener</button>
          </div>
        </div>

        <div style="height:6px; background:#1e293b; border-radius:999px; overflow:hidden; margin:8px 0;">
          <div class="js-dt-prog" style="height:100%; width:${pct}%; background:${meta.color}; transition:width 0.3s ease;"></div>
        </div>

        ${buildInstrumentStageHtml()}
      </div>
    `.replace(
      '{INST_BTNS}',
      (['guitarra', 'bajo', 'bateria', 'canto'] as InstKey[])
        .map(
          (k) =>
            `<button type="button" class="btn js-dt-inst ${k === inst ? 'active' : ''}" data-inst="${k}">${INST_META[k].icon} ${INST_META[k].label.split(' ')[0]}</button>`
        )
        .join('')
    );
  };

  const triggerExerciseStep = (stepIndex: number, subDivCount: number) => {
    // Metronome click on quarter beats
    if (clickEnabled && (subDivCount === 1 || stepIndex % subDivCount === 0)) {
      const beatInBar = Math.floor(clickSubTick / subDivCount) % 4;
      audio.playDrumHit(beatInBar === 0 ? 'clap' : 'ghost', 0);
    }
    clickSubTick++;

    if (inst === 'bateria') {
      const blk = DRUM_TRAINING_BLOCKS[blockIdx];
      activeStep = stepIndex % blk.steps.length;
      const st = blk.steps[activeStep];
      st.hits.forEach((h) => audio.playDrumPiece(h.piece, 0));
      syncExerciseVisualsDom();
      return;
    }

    if (inst === 'guitarra') {
      const blk = GUITAR_TRAINING_BLOCKS[blockIdx];
      activeStep = stepIndex % blk.steps.length;
      const st = blk.steps[activeStep];
      syncExerciseVisualsDom();
      const neckWrap = stage.querySelector<HTMLElement>('.js-dt-neck .fretboard-wrapper');
      if (st.isChord) {
        const midis = st.positions.map((p) => GUITAR_6C[p.sIdx].openMidi + p.fret);
        st.positions.forEach((p, i) => {
          const m = GUITAR_6C[p.sIdx].openMidi + p.fret;
          audio.playPluckedGuitar(m, 0.72, i * 0.022, 0.16, false, {
            isChord: true,
            chordBatch: midis,
            sIdx: p.sIdx,
            fret: p.fret,
            scopeEl: neckWrap || stage,
          });
        });
      } else if (st.positions[0]) {
        const p = st.positions[0];
        const m = GUITAR_6C[p.sIdx].openMidi + p.fret;
        audio.playPluckedGuitar(m, 0.38, 0, 0.2, false, {
          isChord: false,
          sIdx: p.sIdx,
          fret: p.fret,
          scopeEl: neckWrap || stage,
        });
      }
      return;
    }

    if (inst === 'bajo') {
      const blk = BASS_TRAINING_BLOCKS[blockIdx];
      const strings = bassStringsCount === 5 ? BASS_5C : BASS_4C;
      activeStep = stepIndex % blk.steps.length;
      const st = blk.steps[activeStep];
      syncExerciseVisualsDom();
      const neckWrap = stage.querySelector<HTMLElement>('.js-dt-neck .fretboard-wrapper');
      const m = strings[st.sIdx].openMidi + st.fret;
      audio.playElectricBass(m, 0.48, 0, 0.36, st.style, false, {
        isChord: false,
        sIdx: st.sIdx,
        fret: st.fret,
        scopeEl: neckWrap || stage,
      });
      if (st.kickSync) {
        audio.playDrumPiece('BD', 0);
      }
      return;
    }

    const ex = vocalSeries[blockIdx];
    if (ex.isBreathingOnly && ex.breathSteps?.length) {
      const stepsWithRest = getVocalCycleWithRest(ex.breathSteps, vocalRestBeats);
      const totalBeats = stepsWithRest.reduce((acc, b) => acc + b.beats, 0) || 1;
      const cycleBeat = stepIndex % totalBeats;
      let accum = 0;
      let chosenIdx = 0;
      let beatInStep = 1;
      for (let i = 0; i < stepsWithRest.length; i++) {
        const b = stepsWithRest[i];
        if (cycleBeat < accum + b.beats) {
          chosenIdx = i;
          beatInStep = cycleBeat - accum + 1;
          break;
        }
        accum += b.beats;
      }
      const chosenStep = stepsWithRest[chosenIdx];
      activeStep = chosenIdx;
      vocalRestingStep = chosenStep.kind === 'rest';
      activeBreathStatus = vocalRestingStep
        ? `🫁 ${chosenStep.label} · Pulso ${beatInStep}/${chosenStep.beats} — ${chosenStep.cue}`
        : `${chosenStep.label} · Pulso ${beatInStep}/${chosenStep.beats} — ${chosenStep.cue}`;
      if (beatInStep === 1) {
        const cueMidi =
          chosenStep.kind === 'inhale'
            ? 60
            : chosenStep.kind === 'hold'
              ? 64
              : chosenStep.kind === 'rest'
                ? 62
                : 55;
        audio.playAcousticPiano(cueMidi, 0.22, 0, chosenStep.kind === 'rest' ? 0.05 : 0.1, false);
      }
      syncExerciseVisualsDom();
      return;
    }

    const base = vocalBaseMidiOverride ?? ex.baseMidi;
    const patState = computeVocalPatternStepState(stepIndex, ex.patternOffsets.length, vocalRestBeats);
    if (patState.isRest) {
      activeStep = -1;
      vocalRestingStep = true;
      activeBreathStatus = `🫁 Descansa y respira antes del ciclo #${patState.cycleNumber + 1} · Pulso ${patState.restBeat}/${patState.restTotal} (sin cantar)`;
      syncExerciseVisualsDom();
      return;
    }

    vocalRestingStep = false;
    activeStep = patState.noteIndex;
    activeBreathStatus = `🎤 Ciclo #${patState.cycleNumber} · Nota ${patState.noteIndex + 1}/${ex.patternOffsets.length} (${midiToNoteName(base + ex.patternOffsets[activeStep])})`;
    const m = base + ex.patternOffsets[activeStep];
    const durSec = Math.max(0.28, (60 / customBpm) * 0.85);
    audio.playAcousticPiano(m, durSec, 0, 0.14, false);
    audio.playVocalFormant(m, durSec, 0, 0.24, ex.vowel, false);
    syncExerciseVisualsDom();
  };

  const getSubdivision = (): 1 | 2 => {
    if (inst === 'guitarra') return GUITAR_TRAINING_BLOCKS[blockIdx].subdivisionPerBeat;
    if (inst === 'bajo') return BASS_TRAINING_BLOCKS[blockIdx].subdivisionPerBeat;
    if (inst === 'bateria') return DRUM_TRAINING_BLOCKS[blockIdx].subdivisionPerBeat === 4 ? 2 : 2;
    return 1;
  };

  const startExerciseLoop = () => {
    if (stepTimer) {
      clearInterval(stepTimer);
      stepTimer = null;
    }
    clickSubTick = 0;
    const subDiv = getSubdivision();
    const stepMs = Math.max(120, Math.round(60000 / customBpm / subDiv));
    let stepCounter = 0;
    triggerExerciseStep(stepCounter, subDiv);
    stepTimer = setInterval(() => {
      if ((!running && !demoRunning) || !stage.isConnected) {
        if (stepTimer) {
          clearInterval(stepTimer);
          stepTimer = null;
        }
        return;
      }
      stepCounter += 1;
      triggerExerciseStep(stepCounter, subDiv);
    }, stepMs);
  };

  const advanceToNextBlockNow = () => {
    transitionRestRemaining = 0;
    blockIdx += 1;
    customBpm = getDefaultBpm(inst, blockIdx);
    remainingSec = getBlockSeconds(blockIdx);
    vocalRestingStep = false;
    activeBreathStatus = '';
    render();
    startExerciseLoop();
    onStatus(`Siguiente bloque: ${getBlockTitle(inst, blockIdx)}`);
  };

  const startSession = () => {
    stopTimersOnly();
    audio.stopAll();
    running = true;
    demoRunning = false;
    const toggleBtn = stage.querySelector<HTMLElement>('.js-dt-toggle');
    if (toggleBtn) toggleBtn.textContent = '⏸ Pausar Sesión';
    startExerciseLoop();

    secTimer = setInterval(() => {
      if (!running || !stage.isConnected) {
        stopTimersOnly();
        return;
      }
      if (transitionRestRemaining > 0) {
        transitionRestRemaining -= 1;
        if (transitionRestRemaining <= 0) {
          advanceToNextBlockNow();
        } else {
          render();
        }
        return;
      }
      remainingSec -= 1;
      if (remainingSec <= 0) {
        audio.playAcousticPiano(72, 0.35, 0, 0.14, false);
        const totalBlocks = getBlockCount(inst);
        if (blockIdx + 1 < totalBlocks) {
          if (inst === 'canto' && vocalBlockGapSec > 0) {
            if (stepTimer) {
              clearInterval(stepTimer);
              stepTimer = null;
            }
            activeStep = -1;
            vocalRestingStep = true;
            transitionRestRemaining = vocalBlockGapSec;
            render();
            onStatus(`🫁 Descansa ${vocalBlockGapSec}s y toma aire antes del ejercicio #${blockIdx + 2}`);
          } else {
            advanceToNextBlockNow();
          }
        } else {
          stopTimersOnly();
          remainingSec = 0;
          render();
          onStatus(`🎉 ¡Sesión de ${INST_META[inst].label} completada!`);
        }
        return;
      }
      syncCountdownDom();
    }, 1000);
    onStatus(`Entrenamiento ${INST_META[inst].label}: ${getBlockTitle(inst, blockIdx)} (${customBpm} BPM)`);
  };

  const updateBpmAndSync = (nextBpm: number) => {
    customBpm = Math.max(45, Math.min(170, Math.round(nextBpm)));
    const slider = stage.querySelector<HTMLInputElement>('.js-dt-bpm');
    if (slider) slider.value = String(customBpm);
    const valEl = stage.querySelector<HTMLElement>('.js-dt-bpm-val');
    if (valEl) valEl.textContent = `${customBpm} BPM`;
    const readEl = stage.querySelector<HTMLElement>('.js-dt-bpm-readout');
    if (readEl) readEl.textContent = String(customBpm);
    if (inst === 'bateria') {
      syncExerciseVisualsDom();
    }
    if (running || demoRunning) {
      startExerciseLoop();
    }
  };

  render();

  stage.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const svgPiece = t.closest<HTMLElement>('.js-svg-drum-piece');
    if (svgPiece) {
      const code = svgPiece.getAttribute('data-piece') as DrumKitCode | null;
      if (code) {
        audio.playDrumPiece(code, 0);
        onStatus(`Pieza de batería: ${code}`);
      }
      return;
    }

    const fretCell = t.closest<HTMLElement>('.js-studio-fret');
    if (fretCell) {
      const m = parseInt(fretCell.getAttribute('data-midi') || '48', 10);
      const sIdx = parseInt(fretCell.getAttribute('data-sidx') || '0', 10);
      const fret = parseInt(fretCell.getAttribute('data-fret') || '0', 10);
      if (inst === 'bajo') {
        audio.playElectricBass(m, 0.75, 0, 0.36, 'finger', true, {
          sIdx,
          fret,
          scopeEl: stage,
        });
      } else {
        audio.playPluckedGuitar(m, 0.75, 0, 0.2, true, {
          sIdx,
          fret,
          scopeEl: stage,
        });
      }
      return;
    }

    const stepPill = t.closest<HTMLElement>('.js-dt-step-pill');
    if (stepPill) {
      const idx = parseInt(stepPill.getAttribute('data-step') || '0', 10);
      const sub = getSubdivision();
      if (inst === 'canto') {
        const ex = vocalSeries[blockIdx];
        if (ex.isBreathingOnly && ex.breathSteps?.length) {
          const stepsWithRest = getVocalCycleWithRest(ex.breathSteps, vocalRestBeats);
          let startBeat = 0;
          for (let i = 0; i < Math.min(idx, stepsWithRest.length); i++) {
            startBeat += stepsWithRest[i].beats;
          }
          triggerExerciseStep(startBeat, sub);
          return;
        }
      }
      triggerExerciseStep(idx, sub);
      return;
    }

    if (t.closest('.js-dt-skip-gap')) {
      if (running && transitionRestRemaining > 0 && blockIdx + 1 < getBlockCount(inst)) {
        advanceToNextBlockNow();
      }
      return;
    }

    const instBtn = t.closest<HTMLElement>('.js-dt-inst');
    if (instBtn) {
      stopTimersOnly();
      audio.stopAll();
      inst = (instBtn.getAttribute('data-inst') as InstKey) || 'guitarra';
      if (inst === 'canto') {
        vocalSeries = buildStructuredVocalTrainingSeries(vocalLevel, totalMinutes);
      }
      blockIdx = 0;
      customBpm = getDefaultBpm(inst, 0);
      remainingSec = getBlockSeconds(0);
      render();
      return;
    }

    const bassStrBtn = t.closest<HTMLElement>('.js-dt-bass-str');
    if (bassStrBtn) {
      bassStringsCount = bassStrBtn.getAttribute('data-c') === '5' ? 5 : 4;
      render();
      return;
    }

    const gZoneBtn = t.closest<HTMLElement>('.js-dt-gzone');
    if (gZoneBtn) {
      const z = gZoneBtn.getAttribute('data-z') as NeckZoneMode | null;
      if (z === 'auto' || z === 'open' || z === 'mid' || z === 'high' || z === 'all') {
        guitarNeckZone = z;
        render();
        syncExerciseVisualsDom();
      }
      return;
    }

    const gPrioBtn = t.closest<HTMLElement>('.js-dt-gfprio');
    if (gPrioBtn) {
      guitarFingerPriority = gPrioBtn.getAttribute('data-p') === '1';
      render();
      syncExerciseVisualsDom();
      return;
    }

    const vocalLevelBtn = t.closest<HTMLElement>('.js-dt-vocal-level');
    if (vocalLevelBtn) {
      stopTimersOnly();
      audio.stopAll();
      const rawLv = parseInt(vocalLevelBtn.getAttribute('data-level') || '1', 10);
      vocalLevel = rawLv === 2 || rawLv === 3 ? rawLv : 1;
      vocalSeries = buildStructuredVocalTrainingSeries(vocalLevel, totalMinutes);
      blockIdx = 0;
      customBpm = getDefaultBpm('canto', 0);
      remainingSec = getBlockSeconds(0);
      render();
      onStatus(
        `🎤 Nivel ${vocalLevel} seleccionado (${vocalSeries.length} ejercicios en 4 fases · Respiración primero)`
      );
      return;
    }

    const pickBtn = t.closest<HTMLElement>('.js-dt-pick-block');
    if (pickBtn) {
      const wasRunning = running;
      stopTimersOnly();
      audio.stopAll();
      blockIdx = parseInt(pickBtn.getAttribute('data-idx') || '0', 10);
      customBpm = getDefaultBpm(inst, blockIdx);
      remainingSec = getBlockSeconds(blockIdx);
      render();
      if (wasRunning) startSession();
      return;
    }

    const nudgeBtn = t.closest<HTMLElement>('.js-dt-bpm-nudge');
    if (nudgeBtn) {
      const delta = parseInt(nudgeBtn.getAttribute('data-d') || '0', 10);
      updateBpmAndSync(customBpm + delta);
      return;
    }

    if (t.closest('.js-dt-bpm-reset')) {
      updateBpmAndSync(getDefaultBpm(inst, blockIdx));
      return;
    }

    if (t.closest('.js-dt-demo')) {
      if (demoRunning && !running) {
        stopTimersOnly();
        audio.stopAll();
        render();
        onStatus('Guía visual detenida.');
      } else {
        stopTimersOnly();
        audio.stopAll();
        demoRunning = true;
        render();
        startExerciseLoop();
        onStatus(`Guía interactiva a ${customBpm} BPM`);
      }
      return;
    }

    if (t.closest('.js-dt-toggle')) {
      if (running) {
        stopTimersOnly();
        audio.stopAll();
        render();
        onStatus('Sesión en pausa.');
      } else {
        if (remainingSec <= 0) remainingSec = getBlockSeconds(blockIdx);
        startSession();
      }
      return;
    }

    if (t.closest('.js-dt-next')) {
      const wasRunning = running;
      stopTimersOnly();
      audio.stopAll();
      blockIdx = (blockIdx + 1) % getBlockCount(inst);
      customBpm = getDefaultBpm(inst, blockIdx);
      remainingSec = getBlockSeconds(blockIdx);
      render();
      if (wasRunning) startSession();
      return;
    }

    if (t.closest('.js-dt-reset')) {
      stopTimersOnly();
      audio.stopAll();
      remainingSec = getBlockSeconds(blockIdx);
      render();
      return;
    }

    if (t.closest('.js-dt-stop')) {
      stopTimersOnly();
      audio.stopAll();
      remainingSec = getBlockSeconds(blockIdx);
      render();
      onStatus('Sesión de entrenamiento detenida.');
    }
  });

  stage.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.classList.contains('js-dt-bpm')) {
      customBpm = parseInt(t.value, 10);
      const valEl = stage.querySelector<HTMLElement>('.js-dt-bpm-val');
      if (valEl) valEl.textContent = `${customBpm} BPM`;
      const readEl = stage.querySelector<HTMLElement>('.js-dt-bpm-readout');
      if (readEl) readEl.textContent = String(customBpm);
    }
  });

  stage.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement | HTMLSelectElement;
    if (t.classList.contains('js-dt-bpm')) {
      updateBpmAndSync(parseInt(t.value, 10));
    } else if (t.classList.contains('js-dt-mins')) {
      stopTimersOnly();
      audio.stopAll();
      totalMinutes = parseInt(t.value, 10);
      if (inst === 'canto') {
        vocalSeries = buildStructuredVocalTrainingSeries(vocalLevel, totalMinutes);
        if (blockIdx >= vocalSeries.length) blockIdx = 0;
        customBpm = getDefaultBpm('canto', blockIdx);
      }
      remainingSec = getBlockSeconds(blockIdx);
      render();
    } else if (t.classList.contains('js-dt-vocal-base')) {
      vocalBaseMidiOverride = parseInt(t.value, 10);
      render();
    } else if (t.classList.contains('js-dt-vocal-rest')) {
      vocalRestBeats = parseInt(t.value, 10);
      const wasActive = running || demoRunning;
      if (wasActive && !running) {
        stopTimersOnly();
        audio.stopAll();
        demoRunning = true;
        render();
        startExerciseLoop();
      } else {
        render();
        if (running) startExerciseLoop();
      }
      onStatus(
        vocalRestBeats > 0
          ? `🫁 Pausa de respiración configurada a ${vocalRestBeats} pulsos entre cada ciclo.`
          : 'Ciclos continuos sin pausa intermedia.'
      );
    } else if (t.classList.contains('js-dt-click')) {
      clickEnabled = (t as HTMLInputElement).checked;
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
  audio: StudioAudioPort,
  modalManager?: DiagramModalManager
): void {
  // 1. Subscribe live note illumination (latched until next note/chord/stop, distinct classes for note vs chord)
  if (unsubscribeGlobalHighlighter) {
    unsubscribeGlobalHighlighter();
    unsubscribeGlobalHighlighter = null;
  }

  let latchState: LatchedGlowState<NotePlayEvent> = { kind: 'idle', entries: [] };

  const stripGlowClasses = () => {
    document
      .querySelectorAll('.playing-glow, .playing-pc-glow, .glow-mode-note, .glow-mode-chord')
      .forEach((el) => {
        if (el.closest('[data-angular-fretboard="true"]')) return;
        el.classList.remove('playing-glow', 'playing-pc-glow', 'glow-mode-note', 'glow-mode-chord');
      });
  };

  const clearAllGlow = () => {
    latchState = { kind: 'idle', entries: [] };
    stripGlowClasses();
    window.dispatchEvent(
      new CustomEvent('enciclopedia:live-notes', { detail: { notes: [], midis: [], kind: 'idle' } })
    );
  };

  const syncDomGlow = () => {
    stripGlowClasses();

    if (latchState.entries.length === 0 || latchState.kind === 'idle') {
      window.dispatchEvent(
        new CustomEvent('enciclopedia:live-notes', { detail: { notes: [], midis: [], kind: 'idle' } })
      );
      return;
    }

    const modeClass = latchState.kind === 'chord' ? 'glow-mode-chord' : 'glow-mode-note';
    const activeMidis = [...new Set(latchState.entries.map((ev) => Math.round(ev.midi)))];
    const activeMidiSet = new Set(activeMidis);
    const hasChordPlay = latchState.kind === 'chord';

    const hasExplicitFretScope = latchState.entries.some((ev) =>
      Boolean(ev.scopeEl && ev.sIdx !== undefined && ev.fret !== undefined)
    );

    // Illuminate Fretboards without erasing pre-painted scale guide markers:
    // 1) Explicit (sIdx, fret) scope when provided (stays isolated to its own wrapper)
    // 2) Single compact idiomatic playable voicing when playing a chord globally
    // 3) Single best fret position per MIDI on monotonic necks (no duplicate octave/unison clutter)
    document.querySelectorAll<HTMLElement>('.fretboard-wrapper').forEach((wrapper) => {
      if (wrapper.getAttribute('data-angular-fretboard') === 'true') return;

      const scopedForWrapper = latchState.entries.filter(
        (ev) =>
          ev.scopeEl &&
          ev.sIdx !== undefined &&
          ev.fret !== undefined &&
          (ev.scopeEl === wrapper ||
            ev.scopeEl.contains(wrapper) ||
            wrapper.contains(ev.scopeEl))
      );

      if (scopedForWrapper.length > 0) {
        scopedForWrapper.forEach((ev) => {
          const cells = wrapper.querySelectorAll<HTMLElement>(
            `.fret-cell[data-sidx="${ev.sIdx}"][data-fret="${ev.fret}"], .fret-cell[data-s="${ev.sIdx}"][data-f="${ev.fret}"]`
          );
          if (cells.length > 0) {
            cells.forEach((cell) => {
              const targetEl = cell.querySelector<HTMLElement>('.fret-note') || cell;
              targetEl.classList.add('playing-glow', modeClass);
            });
          } else {
            const stringRows = Array.from(
              wrapper.querySelectorAll<HTMLElement>('.fretboard-row')
            ).filter((r) => r.querySelector('.fret-cell[data-midi]') !== null);
            const rowCells =
              stringRows[ev.sIdx!]?.querySelectorAll<HTMLElement>('.fret-cell[data-midi]');
            const cell = rowCells?.[ev.fret!];
            if (cell) {
              const targetEl = cell.querySelector<HTMLElement>('.fret-note') || cell;
              targetEl.classList.add('playing-glow', modeClass);
            }
          }
        });
        return;
      }

      if (hasExplicitFretScope) return;

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
              const rowCells =
                stringRows[pos.sIdx]?.querySelectorAll<HTMLElement>('.fret-cell[data-midi]');
              const cell = rowCells?.[pos.fret];
              if (cell) {
                const targetEl = cell.querySelector<HTMLElement>('.fret-note') || cell;
                targetEl.classList.add('playing-glow', modeClass);
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
            const targetEl =
              (bestCell as HTMLElement).querySelector<HTMLElement>('.fret-note') || bestCell;
            targetEl.classList.add('playing-glow', modeClass);
          }
        });
        return;
      }

      // Non-monotonic necks (e.g. Charango re-entrant tuning) fall back to exact MIDI match
      wrapper.querySelectorAll<HTMLElement>('.fret-cell[data-midi]').forEach((cell) => {
        const m = parseInt(cell.getAttribute('data-midi') || '-1', 10);
        if (m >= 0 && activeMidiSet.has(m)) {
          const targetEl = cell.querySelector<HTMLElement>('.fret-note') || cell;
          targetEl.classList.add('playing-glow', modeClass);
        }
      });
    });

    // Illuminate Piano Keys with exact MIDI match and distinct note vs chord mode class
    document.querySelectorAll<HTMLElement>('.piano-keys').forEach((piano) => {
      piano.querySelectorAll<HTMLElement>('.key-white[data-midi], .key-black[data-midi]').forEach((keyEl) => {
        const m = parseInt(keyEl.getAttribute('data-midi') || '-1', 10);
        if (m >= 0 && activeMidiSet.has(m)) {
          keyEl.classList.add('playing-glow', modeClass);
        }
      });
    });

    const uniqueNames = [...new Set(activeMidis.map((m) => midiToNoteName(m)))];
    window.dispatchEvent(
      new CustomEvent('enciclopedia:live-notes', {
        detail: { notes: uniqueNames, midis: activeMidis, kind: latchState.kind },
      })
    );
  };

  unsubscribeGlobalHighlighter = audio.onNoteEvent((ev) => {
    if (!ev) {
      clearAllGlow();
      return;
    }
    latchState = reduceLatchGlowState(latchState, ev);
    syncDomGlow();
  });

  // 2. Attach framing banners & expand modal buttons to ALL .interactive-widget elements via DiagramModalManager
  if (modalManager) {
    modalManager.attachExpandButtons(root);
  }
}
