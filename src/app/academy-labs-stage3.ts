import type { AcademyLabAudio } from './academy-labs';
import {
  analyzeCounterpointMotion,
  COUNTERPOINT_PRESETS,
  generateImprovisationPhrase,
  IMPROVISATION_ROOT_OPTIONS,
  IMPROVISATION_TRACKS,
  INSTRUMENT_ANATOMY_DATA,
  type AnatomyInstrumentId,
  type CounterpointPreset,
  type ImprovTrackId,
} from './academy-stage3-logic';
import { getVisualInstrumentFocus } from './music-games-logic';

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function playNoteWithFocus(audio: AcademyLabAudio, midi: number, duration = 0.5, delay = 0): void {
  const focus = getVisualInstrumentFocus();
  if (focus === 'guitar-only') {
    audio.playPluckedGuitar(midi, duration, delay, 0.27, false);
  } else if (focus === 'bass-only') {
    const bassMidi = midi >= 55 ? midi - 12 : midi;
    audio.playElectricBass(bassMidi, duration, delay, 0.34, 'finger', false);
  } else {
    audio.playAcousticPiano(midi, duration, delay, 0.24, false);
  }
}

export function buildStage3DataLabStage(
  stage: HTMLElement,
  labType: string,
  article: HTMLElement | undefined,
  audio: AcademyLabAudio,
  onStatus: (msg: string) => void
): boolean {
  if (labType === 'counterpoint-lab') {
    hydrateCounterpointLab(stage, audio, onStatus);
    return true;
  }
  if (labType === 'improvisation-gym-lab') {
    hydrateImprovisationGymLab(stage, audio, onStatus);
    return true;
  }
  if (labType === 'anatomy-lab') {
    const rawInst = (article?.getAttribute('data-instrument') || 'guitar') as AnatomyInstrumentId;
    const inst: AnatomyInstrumentId =
      rawInst === 'bass' || rawInst === 'drum' || rawInst === 'voice' ? rawInst : 'guitar';
    hydrateAnatomyLab(stage, inst, audio, onStatus);
    return true;
  }
  return false;
}

// ============================================================================
// 1. COUNTERPOINT & VOICE-LEADING STUDIO LAB
// ============================================================================

const DIATONIC_C_MIDIS = [
  48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79,
];

function midiToLabel(midi: number): string {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return `${names[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

function stepDiatonic(midi: number, dir: 1 | -1): number {
  let closestIdx = 0;
  let bestDist = 999;
  DIATONIC_C_MIDIS.forEach((m, i) => {
    const d = Math.abs(m - midi);
    if (d < bestDist) {
      bestDist = d;
      closestIdx = i;
    }
  });
  const nextIdx = Math.max(0, Math.min(DIATONIC_C_MIDIS.length - 1, closestIdx + dir));
  return DIATONIC_C_MIDIS[nextIdx];
}

function hydrateCounterpointLab(
  stage: HTMLElement,
  audio: AcademyLabAudio,
  onStatus: (msg: string) => void
): void {
  let activePresetId = COUNTERPOINT_PRESETS[0].id;
  let tempoBpm = 84;
  let cantus = [...COUNTERPOINT_PRESETS[0].cantusMidis];
  let counter = [...COUNTERPOINT_PRESETS[0].counterMidis];
  let extras: number[][] = [];
  let activePlayStep = -1;

  const getPreset = (): CounterpointPreset =>
    COUNTERPOINT_PRESETS.find((p) => p.id === activePresetId) || COUNTERPOINT_PRESETS[0];

  const loadPreset = (id: string) => {
    activePresetId = id;
    const p = getPreset();
    cantus = [...p.cantusMidis];
    counter = [...p.counterMidis];
    extras = p.extraVoicesMidis ? p.extraVoicesMidis.map((v) => [...v]) : [];
    activePlayStep = -1;
  };

  stage.innerHTML = `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#070b14] border border-slate-800">
        <div class="flex flex-wrap items-center gap-2 min-w-0 w-full xl:w-auto">
          <label for="cpPresetSel" class="text-xs font-bold text-slate-300 whitespace-nowrap">Especie / Estilo:</label>
          <select id="cpPresetSel" class="js-cp-preset min-h-[38px] px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-amber-300 w-full sm:w-auto sm:min-w-[285px]">
            ${COUNTERPOINT_PRESETS.map(
              (p) => `<option value="${p.id}">${escapeHtml(p.label)}</option>`
            ).join('')}
          </select>
        </div>

        <div class="flex flex-wrap items-center gap-1.5 shrink-0">
          <label class="text-xs text-slate-300 flex items-center gap-1.5">
            <span>BPM:</span>
            <input type="range" min="60" max="124" value="${tempoBpm}" class="js-cp-bpm w-20 accent-amber-400" />
            <span class="font-mono text-amber-300 tabular-nums js-cp-bpm-val">${tempoBpm}</span>
          </label>
          <button type="button" class="btn btn-primary js-cp-play-both text-xs whitespace-nowrap">▶ Escuchar Voces</button>
          <button type="button" class="btn js-cp-play-counter text-xs whitespace-nowrap">🔊 Solo Contrapunto</button>
          <button type="button" class="btn js-cp-play-cantus text-xs whitespace-nowrap">🔊 Solo Bajo/Cantus</button>
          <button type="button" class="btn js-cp-stop text-xs whitespace-nowrap">⏹</button>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-[#070b14] border border-slate-800 space-y-2.5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="text-xs sm:text-sm font-extrabold text-amber-300 js-cp-title"></div>
            <p class="text-xs text-slate-300 m-0 js-cp-summary"></p>
          </div>
          <div class="text-xs font-mono tabular-nums font-bold js-cp-verdict"></div>
        </div>

        <div class="w-full overflow-x-auto js-cp-svg-wrap"></div>

        <div class="space-y-1">
          <div class="text-[11px] font-semibold text-slate-400">
            Editor interactivo (ajusta cualquier nota de la voz superior con ▲ / ▼ y comprueba las reglas al instante):
          </div>
          <div class="grid grid-cols-4 sm:grid-cols-8 gap-1.5 js-cp-steps"></div>
        </div>
      </div>
    </div>
  `;

  const presetSel = stage.querySelector<HTMLSelectElement>('.js-cp-preset')!;
  const bpmInput = stage.querySelector<HTMLInputElement>('.js-cp-bpm')!;
  const bpmVal = stage.querySelector<HTMLElement>('.js-cp-bpm-val')!;
  const titleEl = stage.querySelector<HTMLElement>('.js-cp-title')!;
  const summaryEl = stage.querySelector<HTMLElement>('.js-cp-summary')!;
  const verdictEl = stage.querySelector<HTMLElement>('.js-cp-verdict')!;
  const svgWrap = stage.querySelector<HTMLElement>('.js-cp-svg-wrap')!;
  const stepsEl = stage.querySelector<HTMLElement>('.js-cp-steps')!;

  const render = () => {
    const preset = getPreset();
    const analysis = analyzeCounterpointMotion(cantus, counter);

    titleEl.textContent = `${preset.label} — ${preset.speciesLabel}`;
    summaryEl.textContent = preset.summary;
    verdictEl.textContent = analysis.verdict;
    verdictEl.className =
      analysis.forbiddenParallelsCount > 0
        ? 'text-xs font-mono tabular-nums font-bold text-rose-300 js-cp-verdict'
        : 'text-xs font-mono tabular-nums font-bold text-emerald-300 js-cp-verdict';

    const n = analysis.steps.length;
    const svgW = Math.max(560, n * 74);
    const svgH = 190;
    const minMidi = 46;
    const maxMidi = 80;
    const mapY = (m: number) => 156 - ((Math.max(minMidi, Math.min(maxMidi, m)) - minMidi) / (maxMidi - minMidi)) * 124;
    const mapX = (i: number) => 48 + i * ((svgW - 88) / Math.max(1, n - 1));

    const gridLines = [48, 55, 60, 67, 72, 79]
      .map((m) => {
        const y = mapY(m);
        return `<line x1="28" y1="${y.toFixed(1)}" x2="${svgW - 18}" y2="${y.toFixed(1)}" stroke="#1e293b" stroke-width="1" />
                <text x="8" y="${(y + 3).toFixed(1)}" fill="#64748b" font-size="9">${midiToLabel(m)}</text>`;
      })
      .join('');

    const extraPaths = extras
      .map((voice, vIdx) => {
        const pts = voice.slice(0, n).map((m, i) => `${mapX(i).toFixed(1)},${mapY(m).toFixed(1)}`).join(' ');
        const color = vIdx === 0 ? '#a78bfa' : '#34d399';
        return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="4 3" opacity="0.85" />`;
      })
      .join('');

    const cantusPts = analysis.steps.map((s) => `${mapX(s.stepIndex).toFixed(1)},${mapY(s.cantusMidi).toFixed(1)}`).join(' ');
    const counterPts = analysis.steps.map((s) => `${mapX(s.stepIndex).toFixed(1)},${mapY(s.counterMidi).toFixed(1)}`).join(' ');

    const nodes = analysis.steps
      .map((s) => {
        const x = mapX(s.stepIndex);
        const yc = mapY(s.cantusMidi);
        const ym = mapY(s.counterMidi);
        const isPlay = s.stepIndex === activePlayStep;
        const linkColor = s.isForbiddenParallel ? '#f43f5e' : s.motion === 'contrario' ? '#34d399' : '#38bdf8';
        return `
          <line x1="${x.toFixed(1)}" y1="${yc.toFixed(1)}" x2="${x.toFixed(1)}" y2="${ym.toFixed(1)}"
            stroke="${linkColor}" stroke-width="${s.isForbiddenParallel ? '2.8' : '1.5'}" stroke-dasharray="3 2" opacity="0.85" />
          <circle cx="${x.toFixed(1)}" cy="${yc.toFixed(1)}" r="${isPlay ? 8 : 6}" fill="#f59e0b" stroke="#0b0f19" stroke-width="1.5" />
          <circle cx="${x.toFixed(1)}" cy="${ym.toFixed(1)}" r="${isPlay ? 8 : 6}" fill="${s.isForbiddenParallel ? '#f43f5e' : '#38bdf8'}" stroke="#0b0f19" stroke-width="1.5" />
          <text x="${x.toFixed(1)}" y="${(ym - 11).toFixed(1)}" text-anchor="middle" fill="#e2e8f0" font-size="9.5" font-weight="700">${midiToLabel(s.counterMidi)}</text>
          <text x="${x.toFixed(1)}" y="176" text-anchor="middle" fill="${s.isForbiddenParallel ? '#fda4af' : '#7dd3fc'}" font-size="10" font-weight="800">${s.isForbiddenParallel ? '⚠️ ' : ''}${s.intervalShort}</text>
        `;
      })
      .join('');

    svgWrap.innerHTML = `
      <svg viewBox="0 0 ${svgW} ${svgH}" class="w-full min-w-[520px] h-auto block rounded-lg bg-[#0b111e] border border-slate-800" role="img" aria-label="Gráfico contrapuntístico de dos o más voces">
        ${gridLines}
        ${extraPaths}
        <polyline points="${cantusPts}" fill="none" stroke="#f59e0b" stroke-width="2.6" />
        <polyline points="${counterPts}" fill="none" stroke="#38bdf8" stroke-width="2.6" />
        ${nodes}
      </svg>
    `;

    stepsEl.innerHTML = analysis.steps
      .map((s) => {
        const motionTag =
          s.motion === 'inicio'
            ? 'Inicio'
            : s.motion === 'contrario'
              ? '↗↘ Contr.'
              : s.motion === 'oblicuo'
                ? '→↘ Oblic.'
                : s.motion === 'paralelo'
                  ? '↗↗ Paral.'
                  : '↗↗ Directo';
        const borderCls = s.isForbiddenParallel
          ? 'border-rose-500/70 bg-rose-950/30'
          : 'border-slate-800 bg-slate-900/70';
        return `
          <div class="p-1.5 rounded-lg border ${borderCls} text-center space-y-1">
            <div class="text-[10px] font-mono text-slate-400 tabular-nums">P${s.stepIndex + 1} · ${s.intervalShort}</div>
            <div class="text-[11px] font-bold ${s.isForbiddenParallel ? 'text-rose-300' : 'text-sky-300'}">${midiToLabel(s.counterMidi)} / ${midiToLabel(s.cantusMidi)}</div>
            <div class="text-[10px] ${s.motion === 'contrario' ? 'text-emerald-300' : 'text-slate-400'}">${motionTag}</div>
            <div class="flex items-center justify-center gap-1 pt-0.5">
              <button type="button" class="js-cp-nudge px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-100 cursor-pointer" data-idx="${s.stepIndex}" data-dir="1" aria-label="Subir nota paso ${s.stepIndex + 1}">▲</button>
              <button type="button" class="js-cp-nudge px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-100 cursor-pointer" data-idx="${s.stepIndex}" data-dir="-1" aria-label="Bajar nota paso ${s.stepIndex + 1}">▼</button>
            </div>
          </div>
        `;
      })
      .join('');
  };

  const playSequence = (mode: 'both' | 'counter' | 'cantus') => {
    audio.stopAll();
    const stepMs = Math.round(60000 / tempoBpm);
    const len = Math.min(cantus.length, counter.length);
    for (let i = 0; i < len; i++) {
      audio.schedule(() => {
        activePlayStep = i;
        if (mode === 'both' || mode === 'cantus') {
          audio.playAcousticPiano(cantus[i], stepMs / 1000 * 0.92, 0, 0.22, false);
        }
        if (mode === 'both' || mode === 'counter') {
          audio.playPluckedGuitar(counter[i], stepMs / 1000 * 0.92, 0, 0.25, false);
        }
        if (mode === 'both') {
          extras.forEach((v) => {
            if (typeof v[i] === 'number') {
              audio.playAcousticPiano(v[i], stepMs / 1000 * 0.9, 0, 0.14, false);
            }
          });
        }
        render();
      }, i * stepMs);
    }
    audio.schedule(() => {
      activePlayStep = -1;
      render();
    }, len * stepMs + 80);
    onStatus(`Reproduciendo contrapunto (${getPreset().label}) a ${tempoBpm} BPM`);
  };

  presetSel.addEventListener('change', () => {
    audio.stopAll();
    loadPreset(presetSel.value);
    render();
    onStatus(`Ejemplo contrapuntístico cargado: ${getPreset().label}`);
  });

  bpmInput.addEventListener('input', () => {
    tempoBpm = parseInt(bpmInput.value, 10) || 84;
    bpmVal.textContent = String(tempoBpm);
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const nudgeBtn = target.closest<HTMLButtonElement>('.js-cp-nudge');
    if (nudgeBtn) {
      const idx = parseInt(nudgeBtn.dataset['idx'] || '0', 10);
      const dir = parseInt(nudgeBtn.dataset['dir'] || '1', 10) >= 0 ? 1 : -1;
      if (idx >= 0 && idx < counter.length) {
        counter[idx] = stepDiatonic(counter[idx], dir);
        audio.stopAll();
        audio.playAcousticPiano(cantus[idx], 0.55, 0, 0.22, false);
        audio.playPluckedGuitar(counter[idx], 0.55, 0, 0.25, false);
        render();
      }
      return;
    }
    if (target.closest('.js-cp-play-both')) {
      playSequence('both');
    } else if (target.closest('.js-cp-play-counter')) {
      playSequence('counter');
    } else if (target.closest('.js-cp-play-cantus')) {
      playSequence('cantus');
    } else if (target.closest('.js-cp-stop')) {
      audio.stopAll();
      activePlayStep = -1;
      render();
      onStatus('Reproducción detenida');
    }
  });

  render();
}

// ============================================================================
// 2. IMPROVISATION & PHRASING GYM LAB (6 Idiomatic Tracks)
// ============================================================================

function hydrateImprovisationGymLab(
  stage: HTMLElement,
  audio: AcademyLabAudio,
  onStatus: (msg: string) => void
): void {
  let trackId: ImprovTrackId = 'frases-motivos';
  let rootMidi = 60;
  let phraseSeed = 1;
  let activeStep = -1;

  stage.innerHTML = `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#070b14] border border-slate-800">
        <div class="flex flex-wrap items-center gap-2 min-w-0">
          <label for="improvTrackSel" class="text-xs font-bold text-slate-300 whitespace-nowrap">Estilo:</label>
          <select id="improvTrackSel" class="js-ig-track min-h-[38px] px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-amber-300 max-w-full">
            ${IMPROVISATION_TRACKS.map(
              (t) => `<option value="${t.id}">${escapeHtml(t.label)}</option>`
            ).join('')}
          </select>

          <label for="improvRootSel" class="text-xs font-bold text-slate-300 whitespace-nowrap">Tónica:</label>
          <select id="improvRootSel" class="js-ig-root min-h-[38px] px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-sky-300">
            ${IMPROVISATION_ROOT_OPTIONS.map(
              (r) => `<option value="${r.midi}" ${r.midi === rootMidi ? 'selected' : ''}>${escapeHtml(r.name)}</option>`
            ).join('')}
          </select>
        </div>

        <div class="flex flex-wrap items-center gap-1.5 shrink-0">
          <button type="button" class="btn js-ig-new text-xs whitespace-nowrap">🎲 Nueva Frase</button>
          <button type="button" class="btn btn-primary js-ig-play-all text-xs whitespace-nowrap">▶ Tocar Solo + Base</button>
          <button type="button" class="btn js-ig-play-base text-xs whitespace-nowrap">🎹 Solo Base</button>
          <button type="button" class="btn js-ig-stop text-xs whitespace-nowrap">⏹</button>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-[#070b14] border border-slate-800 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="text-xs sm:text-sm font-extrabold text-amber-300 js-ig-title"></div>
            <p class="text-xs text-slate-300 m-0 mt-0.5 js-ig-rule"></p>
          </div>
          <span class="text-xs font-mono tabular-nums text-sky-300 js-ig-meta"></span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 js-ig-bars"></div>

        <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-emerald-300 js-ig-tip"></div>
      </div>
    </div>
  `;

  const trackSel = stage.querySelector<HTMLSelectElement>('.js-ig-track')!;
  const rootSel = stage.querySelector<HTMLSelectElement>('.js-ig-root')!;
  const titleEl = stage.querySelector<HTMLElement>('.js-ig-title')!;
  const ruleEl = stage.querySelector<HTMLElement>('.js-ig-rule')!;
  const metaEl = stage.querySelector<HTMLElement>('.js-ig-meta')!;
  const barsEl = stage.querySelector<HTMLElement>('.js-ig-bars')!;
  const tipEl = stage.querySelector<HTMLElement>('.js-ig-tip')!;

  const render = () => {
    const session = generateImprovisationPhrase(trackId, rootMidi, phraseSeed);
    titleEl.textContent = `${session.track.label} · en ${session.rootName}`;
    ruleEl.textContent = session.track.conceptRule;
    metaEl.textContent = `${session.track.genreTag} · ${session.track.bpm} BPM`;
    tipEl.innerHTML = `<strong>Consejo de fraseo:</strong> ${escapeHtml(session.track.phraseTip)}`;

    barsEl.innerHTML = session.chords
      .map((ch, barIdx) => {
        const barNum = barIdx + 1;
        const barNotes = session.notes.filter((n) => n.bar === barNum);
        const roleTag = barNum <= 2 ? 'Pregunta (Motivo)' : 'Respuesta (Cierre)';
        return `
          <div class="p-2.5 rounded-xl bg-[#0b111e] border border-slate-800 space-y-2">
            <div class="flex items-center justify-between gap-1.5 border-b border-slate-800 pb-1.5">
              <span class="text-xs font-extrabold text-amber-300">Comp. ${barNum}: ${escapeHtml(ch.label)}</span>
              <span class="text-[10px] font-semibold ${barNum <= 2 ? 'text-sky-300' : 'text-emerald-300'}">${roleTag}</span>
            </div>
            <div class="space-y-1.5">
              ${barNotes
                .map((n) => {
                  const isPlaying = n.step === activeStep;
                  const badgeTone =
                    n.toneBadge === 'Color / Blue Note'
                      ? 'text-purple-300'
                      : n.toneBadge === 'Nota Guía (3ª/7ª)'
                        ? 'text-emerald-300'
                        : n.toneBadge === 'Tónica / Pilar'
                          ? 'text-amber-300'
                          : 'text-slate-400';
                  return `
                    <button type="button" data-midi="${n.midi}" data-step="${n.step}"
                      class="js-ig-note w-full text-left px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isPlaying
                          ? 'bg-amber-500/25 border-amber-400 text-white'
                          : 'bg-slate-900/80 border-slate-800 hover:border-sky-400/50 text-slate-200'
                      }">
                      <div class="flex items-center justify-between gap-2 text-xs">
                        <strong class="font-mono">${escapeHtml(n.noteLabel)}</strong>
                        <span class="text-[10px] font-semibold ${badgeTone}">${escapeHtml(n.toneBadge)}</span>
                      </div>
                      <div class="text-[10px] text-slate-400 mt-0.5">${escapeHtml(n.fretHint)}</div>
                    </button>
                  `;
                })
                .join('')}
            </div>
          </div>
        `;
      })
      .join('');
  };

  const playSession = (withSolo: boolean) => {
    const session = generateImprovisationPhrase(trackId, rootMidi, phraseSeed);
    audio.stopAll();
    const beatMs = Math.round(60000 / session.track.bpm);
    const barMs = beatMs * 3; // 3 clear slots per bar to align evenly with notes

    session.chords.forEach((ch, barIdx) => {
      audio.schedule(() => {
        audio.strumChord(ch.midis, 'piano', 0, false);
        audio.playDrumHit('kick', 0);
        audio.playDrumHit('hihat', beatMs / 1000);
        audio.playDrumHit('snare', (beatMs * 2) / 1000);
      }, barIdx * barMs);
    });

    if (withSolo) {
      session.notes.forEach((n, idx) => {
        const barIdx = n.bar - 1;
        const posInBar = idx % 3;
        const delayMs = barIdx * barMs + posInBar * beatMs + 40;
        audio.schedule(() => {
          activeStep = n.step;
          audio.playPluckedGuitar(n.midi, 0.52, 0, 0.28, false);
          render();
        }, delayMs);
      });
    }

    audio.schedule(() => {
      activeStep = -1;
      render();
    }, session.chords.length * barMs + 120);

    onStatus(
      withSolo
        ? `Reproduciendo fraseo de improvisación (${session.track.label}) en ${session.rootName}`
        : `Reproduciendo base armónica (${session.track.progressionLabels.join(' – ')})`
    );
  };

  trackSel.addEventListener('change', () => {
    trackId = (trackSel.value as ImprovTrackId) || 'frases-motivos';
    activeStep = -1;
    render();
  });

  rootSel.addEventListener('change', () => {
    rootMidi = parseInt(rootSel.value, 10) || 60;
    activeStep = -1;
    render();
  });

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const noteBtn = target.closest<HTMLButtonElement>('.js-ig-note');
    if (noteBtn) {
      const m = parseInt(noteBtn.dataset['midi'] || '60', 10);
      audio.stopAll();
      playNoteWithFocus(audio, m, 0.65, 0);
      onStatus(`Nota objetivo: ${midiToLabel(m)}`);
      return;
    }
    if (target.closest('.js-ig-new')) {
      phraseSeed++;
      activeStep = -1;
      render();
      onStatus('Nueva variación motívica generada');
    } else if (target.closest('.js-ig-play-all')) {
      playSession(true);
    } else if (target.closest('.js-ig-play-base')) {
      playSession(false);
    } else if (target.closest('.js-ig-stop')) {
      audio.stopAll();
      activeStep = -1;
      render();
    }
  });

  render();
}

// ============================================================================
// 3. INSTRUMENT ANATOMY INTERACTIVE DIAGRAMS (Guitar, Bass, Drum, Voice)
// ============================================================================

function buildAnatomySvgBody(inst: AnatomyInstrumentId): string {
  if (inst === 'guitar') {
    return `
      <!-- Acoustic Guitar Silhouette -->
      <path d="M 340,65 C 375,30 430,28 465,60 C 492,84 510,56 545,48 C 595,38 625,75 625,115 C 625,155 595,192 545,182 C 510,174 492,146 465,170 C 430,202 375,200 340,165 Z"
        fill="#1e1b18" stroke="#f59e0b" stroke-width="2" />
      <rect x="115" y="96" width="248" height="32" rx="3" fill="#0f172a" stroke="#64748b" stroke-width="1.5" />
      <polygon points="44,88 115,96 115,128 44,136" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5" />
      <rect x="114" y="96" width="5" height="32" fill="#e2e8f0" />
      <circle cx="432" cy="115" r="34" fill="#070b14" stroke="#f59e0b" stroke-width="2" />
      <rect x="546" y="92" width="14" height="46" rx="3" fill="#78350f" stroke="#fbbf24" stroke-width="1.2" />
      ${[148, 178, 206, 232, 256, 278, 298, 316, 333, 349]
        .map((x) => `<line x1="${x}" y1="96" x2="${x}" y2="128" stroke="#475569" stroke-width="1.2" />`)
        .join('')}
      ${[100, 105, 110, 115, 120, 125]
        .map((y) => `<line x1="56" y1="${y}" x2="550" y2="${y}" stroke="#cbd5e1" stroke-width="0.9" opacity="0.65" />`)
        .join('')}
    `;
  }
  if (inst === 'bass') {
    return `
      <!-- Electric 4-String Bass Silhouette -->
      <path d="M 335,74 C 370,48 410,48 445,62 C 482,76 510,52 555,56 C 600,60 622,88 622,115 C 622,145 596,178 548,180 C 505,182 475,156 442,168 C 402,182 365,175 335,152 Z"
        fill="#111827" stroke="#38bdf8" stroke-width="2" />
      <rect x="108" y="98" width="250" height="28" rx="3" fill="#0f172a" stroke="#64748b" stroke-width="1.5" />
      <path d="M 38,90 Q 75,82 108,98 L 108,126 Q 72,135 42,126 Z" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5" />
      <rect x="420" y="94" width="24" height="40" rx="4" fill="#020617" stroke="#fbbf24" stroke-width="1.5" />
      <rect x="492" y="94" width="20" height="40" rx="4" fill="#020617" stroke="#34d399" stroke-width="1.5" />
      <rect x="546" y="95" width="22" height="38" rx="3" fill="#334155" stroke="#94a3b8" stroke-width="1.4" />
      ${[102, 109, 116, 123]
        .map((y, idx) => `<line x1="52" y1="${y}" x2="556" y2="${y}" stroke="#e2e8f0" stroke-width="${(2.1 - idx * 0.35).toFixed(2)}" opacity="0.72" />`)
        .join('')}
    `;
  }
  if (inst === 'drum') {
    return `
      <!-- Top-Down 5-Piece Acoustic Drum Kit -->
      <rect x="296" y="88" width="88" height="76" rx="14" fill="#0f172a" stroke="#f59e0b" stroke-width="2.2" />
      <circle cx="165" cy="122" r="34" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
      <circle cx="255" cy="158" r="36" fill="#0b111e" stroke="#e2e8f0" stroke-width="2.4" />
      <circle cx="306" cy="108" r="24" fill="#0f172a" stroke="#94a3b8" stroke-width="1.6" />
      <circle cx="372" cy="108" r="26" fill="#0f172a" stroke="#94a3b8" stroke-width="1.6" />
      <circle cx="432" cy="144" r="34" fill="#0f172a" stroke="#34d399" stroke-width="2" />
      <circle cx="522" cy="126" r="44" fill="#451a03" fill-opacity="0.5" stroke="#fbbf24" stroke-width="2" />
      <circle cx="188" cy="64" r="30" fill="#451a03" fill-opacity="0.45" stroke="#fbbf24" stroke-width="1.6" />
    `;
  }
  // voice
  return `
    <!-- Stylized Vocal Tract & Respiratory Support Schematic -->
    <ellipse cx="250" cy="182" rx="145" ry="44" fill="#064e3b" fill-opacity="0.18" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="5 4" />
    <path d="M 155,175 Q 250,138 345,175 L 345,216 Q 250,202 155,216 Z" fill="#064e3b" fill-opacity="0.45" stroke="#34d399" stroke-width="2" />
    <rect x="234" y="126" width="32" height="44" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8" />
    <rect x="314" y="104" width="54" height="34" rx="10" fill="#1e1b4b" stroke="#fbbf24" stroke-width="2" />
    <path d="M 368,118 Q 418,62 486,62 L 560,62 L 560,94 L 470,94 Q 410,96 368,128 Z" fill="#0f172a" stroke="#a78bfa" stroke-width="2" />
    <path d="M 476,40 Q 536,30 572,58 L 486,62 Z" fill="#0f172a" stroke="#f59e0b" stroke-width="1.6" />
    <text x="112" y="132" fill="#34d399" font-size="10" font-weight="700">Costillas / Apoyo 360°</text>
    <text x="340" y="154" text-anchor="middle" fill="#fbbf24" font-size="10" font-weight="700">Laringe</text>
    <text x="432" y="114" text-anchor="middle" fill="#c4b5fd" font-size="10" font-weight="700">Faringe</text>
    <text x="530" y="28" text-anchor="middle" fill="#fcd34d" font-size="10" font-weight="700">Máscara</text>
  `;
}

function hydrateAnatomyLab(
  stage: HTMLElement,
  inst: AnatomyInstrumentId,
  audio: AcademyLabAudio,
  onStatus: (msg: string) => void
): void {
  const kit = INSTRUMENT_ANATOMY_DATA[inst];
  let activeHotspotId = kit.hotspots[0].id;

  stage.innerHTML = `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-1.5 js-an-tabs"></div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center p-3 rounded-xl bg-[#070b14] border border-slate-800">
        <div class="lg:col-span-7 w-full overflow-x-auto js-an-svg-host"></div>
        <div class="lg:col-span-5 p-3 rounded-xl bg-[#0b111e] border border-slate-800 space-y-2 js-an-detail"></div>
      </div>
    </div>
  `;

  const tabsEl = stage.querySelector<HTMLElement>('.js-an-tabs')!;
  const svgHost = stage.querySelector<HTMLElement>('.js-an-svg-host')!;
  const detailEl = stage.querySelector<HTMLElement>('.js-an-detail')!;

  const playHotspotAudio = (spotId: string) => {
    const spot = kit.hotspots.find((h) => h.id === spotId) || kit.hotspots[0];
    audio.stopAll();
    if (spot.demoType === 'drum') {
      const m = spot.demoMidis[0];
      const piece =
        m === 36 ? 'kick' : m === 38 ? 'snare' : m === 45 ? 'tom' : m === 49 ? 'crash' : 'hihat';
      audio.playDrumHit(piece, 0);
      audio.playDrumHit(piece, 0.35);
    } else if (spot.demoType === 'chord') {
      audio.strumChord(spot.demoMidis, 'guitar', 0, false);
    } else if (spot.demoType === 'vocal') {
      spot.demoMidis.forEach((m, idx) => {
        if (audio.playVocalFormant) {
          audio.playVocalFormant(m, 0.45, idx * 0.34, 0.28, spot.id === 'mascara' ? 'i' : 'a', false);
        } else {
          audio.playAcousticPiano(m, 0.45, idx * 0.34, 0.24, false);
        }
      });
    } else {
      spot.demoMidis.forEach((m, idx) => {
        audio.schedule(() => {
          if (inst === 'bass') {
            audio.playElectricBass(m, 0.45, 0, 0.36, spot.id === 'pastilla-j' ? 'slap' : 'finger', false);
          } else {
            audio.playPluckedGuitar(m, 0.45, 0, 0.28, false);
          }
        }, idx * 240);
      });
    }
    onStatus(`Anatomía (${kit.title}): ${spot.label}`);
  };

  const render = () => {
    const active = kit.hotspots.find((h) => h.id === activeHotspotId) || kit.hotspots[0];

    tabsEl.innerHTML = kit.hotspots
      .map((h) => {
        const isSel = h.id === active.id;
        return `
          <button type="button" data-spot="${h.id}"
            class="btn js-an-spot-btn text-xs ${isSel ? 'btn-primary' : ''}">
            ${escapeHtml(h.label)}
          </button>`;
      })
      .join('');

    const pins = kit.hotspots
      .map((h, i) => {
        const isSel = h.id === active.id;
        return `
          <g class="js-an-svg-pin cursor-pointer" data-spot="${h.id}">
            <circle cx="${h.svgX}" cy="${h.svgY}" r="${isSel ? 17 : 13}" fill="${isSel ? '#f59e0b' : '#0ea5e9'}" fill-opacity="${isSel ? '0.95' : '0.82'}" stroke="#0b0f19" stroke-width="2" />
            <text x="${h.svgX}" y="${h.svgY + 4}" text-anchor="middle" fill="#0b0f19" font-size="12" font-weight="900">${i + 1}</text>
          </g>
        `;
      })
      .join('');

    svgHost.innerHTML = `
      <svg viewBox="${kit.svgViewBox}" class="w-full min-w-[280px] h-auto block rounded-lg bg-[#0b111e] border border-slate-800" role="img" aria-label="${escapeHtml(kit.title)}">
        ${buildAnatomySvgBody(inst)}
        ${pins}
      </svg>
    `;

    detailEl.innerHTML = `
      <div class="text-[11px] font-bold uppercase tracking-wider text-sky-400">${escapeHtml(active.zoneTag)}</div>
      <div class="text-sm font-extrabold text-amber-300">${escapeHtml(active.label)}</div>
      <p class="text-xs text-slate-200 leading-relaxed m-0"><strong>Función:</strong> ${escapeHtml(active.functionText)}</p>
      <p class="text-xs text-emerald-300 leading-relaxed m-0"><strong>Técnica:</strong> ${escapeHtml(active.techniqueTip)}</p>
      <p class="text-xs text-rose-300 leading-relaxed m-0"><strong>Evita:</strong> ${escapeHtml(active.commonMistake)}</p>
      <button type="button" class="btn btn-primary js-an-replay text-xs w-full mt-1">🔊 Escuchar demostración de esta zona</button>
    `;
  };

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const spotTrigger =
      target.closest<HTMLElement>('.js-an-spot-btn') || target.closest<HTMLElement>('.js-an-svg-pin');
    if (spotTrigger) {
      const id = spotTrigger.getAttribute('data-spot');
      if (id) {
        activeHotspotId = id;
        render();
        playHotspotAudio(id);
      }
      return;
    }
    if (target.closest('.js-an-replay')) {
      playHotspotAudio(activeHotspotId);
    }
  });

  render();
}
