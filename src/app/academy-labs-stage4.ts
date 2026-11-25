import type { AcademyLabAudio } from './academy-labs';
import {
  COMPLEX_WORK_SECTIONS,
  EQ_PRESETS,
  MIDI_GROOVE_PRESETS,
  MIX_STEM_LABELS,
  SYNTH_PATCH_PRESETS,
  auditIntegratorBlueprint,
  buildMidiRollEvents,
  computeAdsrEnvelopePoints,
  computeEqCurveDb,
  computeLowPassResponseCurve,
  evaluateMixAndMasterMetrics,
  formatMidiNoteName,
  type IntegratorBlueprintSelection,
  type MixEqSettings,
  type MixStemId,
  type SynthAdsrConfig,
  type SynthWaveform,
} from './academy-stage4-logic';

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getSafeAudioContext(audio: AcademyLabAudio): AudioContext | null {
  if (typeof audio.ensureContext === 'function') {
    return audio.ensureContext();
  }
  return null;
}

function playSynthPatchVoice(
  audio: AcademyLabAudio,
  midi: number,
  waveform: SynthWaveform,
  subOscLevel: number,
  cutoffHz: number,
  resonanceQ: number,
  adsr: SynthAdsrConfig,
  holdSec = 0.35,
  delaySec = 0,
  gainScale = 0.24
): void {
  const ctx = getSafeAudioContext(audio);
  if (!ctx) {
    audio.playAcousticPiano(midi, holdSec + 0.25, delaySec, gainScale, false);
    return;
  }

  const freq = typeof audio.midiToFreq === 'function' ? audio.midiToFreq(midi) : 440 * Math.pow(2, (midi - 69) / 12);
  const now = ctx.currentTime + delaySec;

  const atk = Math.max(0.005, adsr.attackMs / 1000);
  const dec = Math.max(0.02, adsr.decayMs / 1000);
  const sus = Math.max(0.05, Math.min(1, adsr.sustain));
  const rel = Math.max(0.03, adsr.releaseMs / 1000);
  const noteEnd = now + atk + dec + holdSec;
  const stopAt = noteEnd + rel + 0.04;

  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.linearRampToValueAtTime(gainScale, now + atk);
  amp.gain.exponentialRampToValueAtTime(Math.max(0.001, gainScale * sus), now + atk + dec);
  amp.gain.setValueAtTime(Math.max(0.001, gainScale * sus), noteEnd);
  amp.gain.exponentialRampToValueAtTime(0.0001, noteEnd + rel);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.max(80, Math.min(14000, cutoffHz)), now);
  filter.Q.setValueAtTime(Math.max(0.5, Math.min(12, resonanceQ)), now);

  const osc = ctx.createOscillator();
  osc.type = waveform;
  osc.frequency.setValueAtTime(freq, now);
  osc.connect(filter);

  let subOsc: OscillatorNode | null = null;
  if (subOscLevel > 0.02) {
    subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(freq * 0.5, now);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(subOscLevel, now);
    subOsc.connect(subGain);
    subGain.connect(filter);
  }

  filter.connect(amp);
  amp.connect(ctx.destination);

  osc.start(now);
  osc.stop(stopAt);
  if (subOsc) {
    subOsc.start(now);
    subOsc.stop(stopAt);
  }
}

export function buildStage4DataLabStage(
  stage: HTMLElement,
  labType: string,
  _article: HTMLElement | undefined,
  audio: AcademyLabAudio,
  onStatus: (msg: string) => void
): boolean {
  if (labType === 'synth-midi-lab') {
    hydrateSynthMidiLab(stage, audio, onStatus);
    return true;
  }
  if (labType === 'mix-master-lab') {
    hydrateMixMasterLab(stage, audio, onStatus);
    return true;
  }
  if (labType === 'work-analysis-lab') {
    hydrateWorkAnalysisLab(stage, audio, onStatus);
    return true;
  }
  if (labType === 'master-project-lab') {
    hydrateMasterProjectLab(stage, audio, onStatus);
    return true;
  }
  return false;
}

// ============================================================================
// 1. SYNTHESIS (ADSR + FILTER) & MIDI PIANO-ROLL LAB
// ============================================================================

function hydrateSynthMidiLab(
  stage: HTMLElement,
  audio: AcademyLabAudio,
  onStatus: (msg: string) => void
): void {
  let tab: 'synth' | 'midi' = 'synth';
  let patchId = SYNTH_PATCH_PRESETS[0].id;
  let waveform: SynthWaveform = SYNTH_PATCH_PRESETS[0].waveform;
  let subOscLevel = SYNTH_PATCH_PRESETS[0].subOscLevel;
  let cutoffHz = SYNTH_PATCH_PRESETS[0].cutoffHz;
  let resonanceQ = SYNTH_PATCH_PRESETS[0].resonanceQ;
  let adsr: SynthAdsrConfig = { ...SYNTH_PATCH_PRESETS[0].adsr };

  let midiPresetId = MIDI_GROOVE_PRESETS[0].id;
  let midiRoot = 48; // C3
  let humanizePct = 30;
  let activeSteps = new Set<number>(MIDI_GROOVE_PRESETS[0].steps.map((s) => s.step));
  let activeStepPlay = -1;

  audio.onStop(() => {
    activeStepPlay = -1;
    render();
  });

  stage.innerHTML = `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#070b14] border border-slate-800">
        <div class="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Modo del laboratorio de síntesis y MIDI">
          <button type="button" data-tab="synth" class="btn text-xs whitespace-nowrap shrink-0 js-sm-tab">🎛️ Sintetizador Sustractivo &amp; ADSR</button>
          <button type="button" data-tab="midi" class="btn text-xs whitespace-nowrap shrink-0 js-sm-tab">🎹 Secuenciador MIDI &amp; Humanización</button>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" class="btn btn-primary text-xs whitespace-nowrap shrink-0 js-sm-play-main">▶ Probar Sonido</button>
          <button type="button" class="btn text-xs whitespace-nowrap shrink-0 js-sm-stop" aria-label="Detener síntesis o secuencia">⏹ Stop</button>
        </div>
      </div>

      <div class="js-sm-body"></div>
    </div>
  `;

  const bodyEl = stage.querySelector<HTMLElement>('.js-sm-body')!;
  const playMainBtn = stage.querySelector<HTMLButtonElement>('.js-sm-play-main')!;

  const renderSynthBody = () => {
    const adsrSvg = computeAdsrEnvelopePoints(adsr, 320, 108);
    const lpfCurve = computeLowPassResponseCurve(cutoffHz, resonanceQ);
    const lpfPoints = lpfCurve
      .map((pt, i) => {
        const x = 18 + (i / (lpfCurve.length - 1)) * 284;
        const y = 54 - pt.db * 1.45;
        return `${x.toFixed(1)},${Math.max(8, Math.min(98, y)).toFixed(1)}`;
      })
      .join(' ');
    const presetMeta = SYNTH_PATCH_PRESETS.find((p) => p.id === patchId) || SYNTH_PATCH_PRESETS[0];

    bodyEl.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 rounded-xl bg-[#070b14] border border-slate-800">
        <div class="lg:col-span-7 space-y-3">
          <div class="flex flex-wrap items-center gap-2">
            <label class="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <span>Preset:</span>
              <select class="js-sm-preset bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300">
                ${SYNTH_PATCH_PRESETS.map((p) => `<option value="${p.id}" ${p.id === patchId ? 'selected' : ''}>${escapeHtml(p.label)}</option>`).join('')}
              </select>
            </label>
            <label class="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <span>Onda:</span>
              <select class="js-sm-wave bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-sky-300">
                <option value="sawtooth" ${waveform === 'sawtooth' ? 'selected' : ''}>Sierra (Sawtooth)</option>
                <option value="square" ${waveform === 'square' ? 'selected' : ''}>Cuadrada (Square)</option>
                <option value="triangle" ${waveform === 'triangle' ? 'selected' : ''}>Triangular (Triangle)</option>
                <option value="sine" ${waveform === 'sine' ? 'selected' : ''}>Senoidal (Sine)</option>
              </select>
            </label>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-2.5 rounded-lg bg-[#0b111e] border border-slate-800">
              <div class="text-[11px] font-bold text-emerald-300 mb-1">Envolvente ADSR (${adsrSvg.totalMs} ms)</div>
              <svg viewBox="0 0 320 108" class="w-full h-auto block" role="img" aria-label="Curva de envolvente ADSR">
                <rect x="0" y="0" width="320" height="108" rx="6" fill="#060a12" />
                <line x1="12" y1="94" x2="308" y2="94" stroke="#1e293b" stroke-width="1" />
                <polyline points="${adsrSvg.pointsAttr}" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linejoin="round" />
                ${adsrSvg.nodes
                  .map(
                    (n) => `
                  <circle cx="${n.x}" cy="${n.y}" r="4" fill="#fbbf24" />
                  <text x="${n.x}" y="${Math.max(11, n.y - 6)}" text-anchor="middle" fill="#cbd5e1" font-size="9" font-weight="700">${n.label}</text>
                `
                  )
                  .join('')}
              </svg>
            </div>
            <div class="p-2.5 rounded-lg bg-[#0b111e] border border-slate-800">
              <div class="text-[11px] font-bold text-sky-300 mb-1">Filtro Pasa-Bajos (${cutoffHz} Hz · Q ${resonanceQ.toFixed(1)})</div>
              <svg viewBox="0 0 320 108" class="w-full h-auto block" role="img" aria-label="Curva de respuesta del filtro pasa bajos">
                <rect x="0" y="0" width="320" height="108" rx="6" fill="#060a12" />
                <line x1="18" y1="54" x2="302" y2="54" stroke="#334155" stroke-dasharray="3 3" stroke-width="1" />
                <polyline points="${lpfPoints}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round" />
                <text x="20" y="99" fill="#64748b" font-size="9">40 Hz</text>
                <text x="160" y="99" text-anchor="middle" fill="#94a3b8" font-size="9">Corte ${cutoffHz} Hz</text>
                <text x="300" y="99" text-anchor="end" fill="#64748b" font-size="9">16 kHz</text>
              </svg>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-[11px] text-slate-400 mr-1">Disparar tecla:</span>
            ${[
              { midi: 48, label: 'C3' },
              { midi: 52, label: 'E3' },
              { midi: 55, label: 'G3' },
              { midi: 59, label: 'B3' },
              { midi: 60, label: 'C4' },
            ]
              .map(
                (k) =>
                  `<button type="button" data-midi="${k.midi}" class="btn text-xs px-2.5 py-1 bg-slate-900 border-slate-700 js-sm-note">${k.label}</button>`
              )
              .join('')}
            <button type="button" class="btn text-xs px-2.5 py-1 bg-amber-500/20 border-amber-400/50 text-amber-200 js-sm-chord">🎹 Acorde Cmaj7</button>
          </div>
        </div>

        <div class="lg:col-span-5 p-3 rounded-xl bg-[#0b111e] border border-slate-800 space-y-2.5">
          <div class="text-xs text-slate-300 leading-relaxed">${escapeHtml(presetMeta.description)}</div>
          <div class="grid grid-cols-2 gap-2.5 text-xs">
            <label class="space-y-1">
              <span class="flex justify-between text-slate-300"><span>Cutoff</span><strong class="font-mono tabular-nums text-sky-300">${cutoffHz} Hz</strong></span>
              <input type="range" min="150" max="8000" step="50" value="${cutoffHz}" class="w-full accent-sky-400 js-sm-cutoff" />
            </label>
            <label class="space-y-1">
              <span class="flex justify-between text-slate-300"><span>Resonancia Q</span><strong class="font-mono tabular-nums text-sky-300">${resonanceQ.toFixed(1)}</strong></span>
              <input type="range" min="0.5" max="10" step="0.2" value="${resonanceQ}" class="w-full accent-sky-400 js-sm-q" />
            </label>
            <label class="space-y-1">
              <span class="flex justify-between text-slate-300"><span>Ataque (A)</span><strong class="font-mono tabular-nums text-emerald-300">${adsr.attackMs} ms</strong></span>
              <input type="range" min="5" max="600" step="5" value="${adsr.attackMs}" class="w-full accent-emerald-400 js-sm-atk" />
            </label>
            <label class="space-y-1">
              <span class="flex justify-between text-slate-300"><span>Decay (D)</span><strong class="font-mono tabular-nums text-emerald-300">${adsr.decayMs} ms</strong></span>
              <input type="range" min="30" max="700" step="10" value="${adsr.decayMs}" class="w-full accent-emerald-400 js-sm-dec" />
            </label>
            <label class="space-y-1">
              <span class="flex justify-between text-slate-300"><span>Sustain (S)</span><strong class="font-mono tabular-nums text-emerald-300">${Math.round(adsr.sustain * 100)}%</strong></span>
              <input type="range" min="10" max="100" step="5" value="${Math.round(adsr.sustain * 100)}" class="w-full accent-emerald-400 js-sm-sus" />
            </label>
            <label class="space-y-1">
              <span class="flex justify-between text-slate-300"><span>Release (R)</span><strong class="font-mono tabular-nums text-emerald-300">${adsr.releaseMs} ms</strong></span>
              <input type="range" min="40" max="900" step="20" value="${adsr.releaseMs}" class="w-full accent-emerald-400 js-sm-rel" />
            </label>
          </div>
          <div class="text-[11px] text-slate-400 border-t border-slate-800 pt-2"><strong>Uso en mezcla:</strong> ${escapeHtml(presetMeta.musicalRole)}</div>
        </div>
      </div>
    `;
  };

  const renderMidiBody = () => {
    const preset = MIDI_GROOVE_PRESETS.find((p) => p.id === midiPresetId) || MIDI_GROOVE_PRESETS[0];
    const events = buildMidiRollEvents(midiPresetId, humanizePct, midiRoot, activeSteps);

    bodyEl.innerHTML = `
      <div class="space-y-3 p-3 rounded-xl bg-[#070b14] border border-slate-800">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <label class="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <span>Patrón MIDI:</span>
              <select class="js-sm-midi-preset bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300">
                ${MIDI_GROOVE_PRESETS.map((p) => `<option value="${p.id}" ${p.id === midiPresetId ? 'selected' : ''}>${escapeHtml(p.label)} (${p.bpm} BPM)</option>`).join('')}
              </select>
            </label>
            <label class="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <span>Tónica:</span>
              <select class="js-sm-midi-root bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-sky-300">
                ${[45, 48, 50, 52, 53, 55].map((m) => `<option value="${m}" ${m === midiRoot ? 'selected' : ''}>${formatMidiNoteName(m)}</option>`).join('')}
              </select>
            </label>
          </div>
          <label class="text-xs text-slate-300 font-semibold flex items-center gap-2">
            <span>Humanización (Micro-tiempo &amp; Velocity):</span>
            <input type="range" min="0" max="100" step="5" value="${humanizePct}" class="w-28 accent-amber-400 js-sm-humanize" />
            <strong class="font-mono tabular-nums text-amber-300">${humanizePct}%</strong>
          </label>
        </div>

        <p class="text-xs text-slate-300 mb-0">${escapeHtml(preset.scaleHint)} · Pulsa cada paso (1–8) para activar o silenciar notas MIDI antes de reproducir.</p>

        <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">
          ${Array.from({ length: 8 }, (_, stepIdx) => {
            const ev = events.find((e) => e.step === stepIdx);
            const enabled = activeSteps.has(stepIdx);
            const isPlaying = activeStepPlay === stepIdx;
            return `
              <button type="button" data-step="${stepIdx}"
                class="js-sm-step p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500/25 border-amber-400 text-white'
                    : enabled
                      ? 'bg-slate-900 border-emerald-500/50 text-slate-100 hover:border-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-500 opacity-70'
                }">
                <div class="flex items-center justify-between text-[10px] font-mono">
                  <span>Paso ${stepIdx + 1}</span>
                  <span>${enabled ? 'ON' : 'OFF'}</span>
                </div>
                <div class="text-xs font-extrabold mt-0.5 text-amber-300">${ev ? ev.noteName : '—'}</div>
                <div class="text-[10px] font-mono tabular-nums text-slate-400">${ev ? `Vel ${ev.velocity}` : 'Silencio'}</div>
              </button>
            `;
          }).join('')}
        </div>

        <div class="p-2.5 rounded-lg bg-[#0b111e] border border-slate-800">
          <div class="text-[11px] font-bold text-sky-300 mb-1.5">Monitor de Mensajes MIDI en Vivo (Note-On Hex · Velocity · Desfase ms)</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 font-mono tabular-nums text-[11px] js-sm-midi-log">
            ${events
              .map(
                (ev) => `
              <div class="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                <span class="text-amber-300">#${ev.step + 1} ${ev.noteName}</span> · Vel ${ev.velocity} · ${ev.timingOffsetMs >= 0 ? `+${ev.timingOffsetMs}` : ev.timingOffsetMs}ms
                <div class="text-[10px] text-slate-500">${ev.hexNoteOn}</div>
              </div>`
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  };

  const render = () => {
    stage.querySelectorAll<HTMLButtonElement>('.js-sm-tab').forEach((btn) => {
      const active = btn.dataset['tab'] === tab;
      btn.classList.toggle('btn-primary', active);
    });
    playMainBtn.textContent = tab === 'synth' ? '▶ Probar Patch (Acorde)' : '▶ Reproducir Secuencia MIDI';
    if (tab === 'synth') renderSynthBody();
    else renderMidiBody();
  };

  const playMidiSequence = () => {
    audio.stopAll();
    const preset = MIDI_GROOVE_PRESETS.find((p) => p.id === midiPresetId) || MIDI_GROOVE_PRESETS[0];
    const events = buildMidiRollEvents(midiPresetId, humanizePct, midiRoot, activeSteps);
    if (events.length === 0) {
      onStatus('Activa al menos un paso MIDI para escuchar la secuencia.');
      return;
    }
    const eighthMs = Math.round(60000 / preset.bpm / 2);
    for (const ev of events) {
      const startMs = Math.max(0, ev.step * eighthMs + ev.timingOffsetMs);
      const vol = 0.08 + (ev.velocity / 127) * 0.22;
      audio.schedule(() => {
        activeStepPlay = ev.step;
        playSynthPatchVoice(audio, ev.midi, waveform, subOscLevel, cutoffHz, resonanceQ, adsr, ev.durationMs / 1000, 0, vol);
        render();
      }, startMs);
    }
    audio.schedule(() => {
      activeStepPlay = -1;
      render();
    }, 8 * eighthMs + 220);
    onStatus(`Secuencia MIDI "${preset.label}" · Humanización ${humanizePct}%`);
  };

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const tabBtn = target.closest<HTMLButtonElement>('.js-sm-tab');
    if (tabBtn) {
      tab = (tabBtn.dataset['tab'] as 'synth' | 'midi') || 'synth';
      render();
      return;
    }
    if (target.closest('.js-sm-stop')) {
      audio.stopAll();
      activeStepPlay = -1;
      render();
      onStatus('Síntesis detenida');
      return;
    }
    if (target.closest('.js-sm-play-main')) {
      if (tab === 'midi') {
        playMidiSequence();
      } else {
        audio.stopAll();
        [48, 52, 55, 59].forEach((m, idx) =>
          playSynthPatchVoice(audio, m, waveform, subOscLevel, cutoffHz, resonanceQ, adsr, 0.55, idx * 0.04, 0.14)
        );
        onStatus(`Patch sustractivo (${waveform}, corte ${cutoffHz} Hz)`);
      }
      return;
    }
    const noteBtn = target.closest<HTMLButtonElement>('.js-sm-note');
    if (noteBtn) {
      const m = parseInt(noteBtn.dataset['midi'] || '60', 10);
      audio.stopAll();
      playSynthPatchVoice(audio, m, waveform, subOscLevel, cutoffHz, resonanceQ, adsr, 0.45, 0, 0.26);
      onStatus(`Nota ${formatMidiNoteName(m)} · ${waveform} · LPF ${cutoffHz} Hz`);
      return;
    }
    if (target.closest('.js-sm-chord')) {
      audio.stopAll();
      [48, 52, 55, 59].forEach((m) =>
        playSynthPatchVoice(audio, m, waveform, subOscLevel, cutoffHz, resonanceQ, adsr, 0.55, 0, 0.14)
      );
      onStatus(`Acorde Cmaj7 con envolvente A=${adsr.attackMs}ms R=${adsr.releaseMs}ms`);
      return;
    }
    const stepBtn = target.closest<HTMLButtonElement>('.js-sm-step');
    if (stepBtn) {
      const st = parseInt(stepBtn.dataset['step'] || '0', 10);
      if (activeSteps.has(st)) activeSteps.delete(st);
      else activeSteps.add(st);
      render();
    }
  });

  stage.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    if (target.classList.contains('js-sm-preset')) {
      const p = SYNTH_PATCH_PRESETS.find((x) => x.id === target.value) || SYNTH_PATCH_PRESETS[0];
      patchId = p.id;
      waveform = p.waveform;
      subOscLevel = p.subOscLevel;
      cutoffHz = p.cutoffHz;
      resonanceQ = p.resonanceQ;
      adsr = { ...p.adsr };
      render();
    } else if (target.classList.contains('js-sm-wave')) {
      waveform = (target.value as SynthWaveform) || 'sawtooth';
      render();
    } else if (target.classList.contains('js-sm-midi-preset')) {
      midiPresetId = target.value;
      const preset = MIDI_GROOVE_PRESETS.find((x) => x.id === midiPresetId) || MIDI_GROOVE_PRESETS[0];
      activeSteps = new Set(preset.steps.map((s) => s.step));
      render();
    } else if (target.classList.contains('js-sm-midi-root')) {
      midiRoot = parseInt(target.value, 10) || 48;
      render();
    }
  });

  stage.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.classList.contains('js-sm-cutoff')) cutoffHz = parseInt(target.value, 10) || 620;
    else if (target.classList.contains('js-sm-q')) resonanceQ = parseFloat(target.value) || 2;
    else if (target.classList.contains('js-sm-atk')) adsr = { ...adsr, attackMs: parseInt(target.value, 10) || 12 };
    else if (target.classList.contains('js-sm-dec')) adsr = { ...adsr, decayMs: parseInt(target.value, 10) || 240 };
    else if (target.classList.contains('js-sm-sus')) adsr = { ...adsr, sustain: (parseInt(target.value, 10) || 55) / 100 };
    else if (target.classList.contains('js-sm-rel')) adsr = { ...adsr, releaseMs: parseInt(target.value, 10) || 180 };
    else if (target.classList.contains('js-sm-humanize')) humanizePct = parseInt(target.value, 10) || 0;
    else return;
    render();
  });

  render();
}

// ============================================================================
// 2. VISUAL EQ, COMPRESSION & MASTERING LAB (Stage 6)
// ============================================================================

function hydrateMixMasterLab(
  stage: HTMLElement,
  audio: AcademyLabAudio,
  onStatus: (msg: string) => void
): void {
  let presetId = EQ_PRESETS[0].id;
  let settings: MixEqSettings = {
    stemId: 'full-band',
    targetLufs: -14,
    ...EQ_PRESETS[0].settings,
    hpfHz: MIX_STEM_LABELS['full-band'].recommendedHpfHz,
  };

  stage.innerHTML = `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#070b14] border border-slate-800">
        <div class="flex flex-wrap items-center gap-2">
          <label class="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
            <span>Fuente:</span>
            <select class="js-mm-stem bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-sky-300">
              ${(Object.keys(MIX_STEM_LABELS) as MixStemId[])
                .map((id) => `<option value="${id}">${escapeHtml(MIX_STEM_LABELS[id].title)}</option>`)
                .join('')}
            </select>
          </label>
          <label class="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
            <span>Perfil EQ/Máster:</span>
            <select class="js-mm-preset bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300">
              ${EQ_PRESETS.map((p) => `<option value="${p.id}">${escapeHtml(p.label)}</option>`).join('')}
            </select>
          </label>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" class="btn btn-primary text-xs whitespace-nowrap shrink-0 js-mm-play-proc">▶ Escuchar CON Proceso</button>
          <button type="button" class="btn text-xs whitespace-nowrap shrink-0 js-mm-play-dry">🔊 Bypass (Sin EQ)</button>
          <button type="button" class="btn text-xs whitespace-nowrap shrink-0 js-mm-stop">⏹ Stop</button>
        </div>
      </div>

      <div class="js-mm-body"></div>
    </div>
  `;

  const bodyEl = stage.querySelector<HTMLElement>('.js-mm-body')!;

  const playMixAudition = (withProcessing: boolean) => {
    audio.stopAll();
    const ctx = getSafeAudioContext(audio);
    if (!ctx) {
      audio.strumChord([48, 55, 60, 64, 67], 'piano', 0, false);
      onStatus(withProcessing ? 'Audición con EQ/Compresión' : 'Audición Bypass');
      return;
    }

    const now = ctx.currentTime;
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.setValueAtTime(withProcessing ? settings.hpfHz : 20, now);

    const mudBell = ctx.createBiquadFilter();
    mudBell.type = 'peaking';
    mudBell.frequency.setValueAtTime(250, now);
    mudBell.Q.setValueAtTime(1.2, now);
    mudBell.gain.setValueAtTime(withProcessing ? settings.lowMidDb : 0, now);

    const presBell = ctx.createBiquadFilter();
    presBell.type = 'peaking';
    presBell.frequency.setValueAtTime(3000, now);
    presBell.Q.setValueAtTime(1.0, now);
    presBell.gain.setValueAtTime(withProcessing ? settings.presenceDb : 0, now);

    const airShelf = ctx.createBiquadFilter();
    airShelf.type = 'highshelf';
    airShelf.frequency.setValueAtTime(8500, now);
    airShelf.gain.setValueAtTime(withProcessing ? settings.airDb : 0, now);

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(withProcessing ? settings.compThreshDb : -2, now);
    comp.ratio.setValueAtTime(withProcessing ? settings.compRatio : 1, now);
    comp.attack.setValueAtTime(0.01, now);
    comp.release.setValueAtTime(0.18, now);

    const masterOut = ctx.createGain();
    masterOut.gain.setValueAtTime(withProcessing ? 0.34 : 0.32, now);

    hpf.connect(mudBell);
    mudBell.connect(presBell);
    presBell.connect(airShelf);
    airShelf.connect(comp);
    comp.connect(masterOut);
    masterOut.connect(ctx.destination);

    // Synthesize a realistic chord + bass + vocal-like tone sequence through the chain
    const chord =
      settings.stemId === 'electric-bass'
        ? [36, 43]
        : settings.stemId === 'lead-vocal'
          ? [60, 64, 67]
          : settings.stemId === 'rhythm-guitar'
            ? [52, 55, 60, 64]
            : [36, 48, 55, 60, 64, 72];

    chord.forEach((m, idx) => {
      const freq = typeof audio.midiToFreq === 'function' ? audio.midiToFreq(m) : 440 * Math.pow(2, (m - 69) / 12);
      const start = now + idx * 0.03;
      const osc = ctx.createOscillator();
      osc.type = m < 50 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, start);
      g.gain.linearRampToValueAtTime(0.18, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0008, start + 1.15);
      osc.connect(g);
      g.connect(hpf);
      osc.start(start);
      osc.stop(start + 1.2);
    });

    onStatus(
      withProcessing
        ? `A/B CON Proceso · HPF ${settings.hpfHz} Hz · 250 Hz ${settings.lowMidDb >= 0 ? '+' : ''}${settings.lowMidDb} dB`
        : 'A/B SIN Proceso (Bypass crudo sin filtros ni compresor)'
    );
  };

  const render = () => {
    const curve = computeEqCurveDb(settings);
    const evalRes = evaluateMixAndMasterMetrics(settings);
    const stemMeta = MIX_STEM_LABELS[settings.stemId];

    const polyPoints = curve
      .map((pt, idx) => {
        const x = 26 + (idx / (curve.length - 1)) * 468;
        const y = 78 - pt.db * 2.6;
        return `${x.toFixed(1)},${Math.max(12, Math.min(138, y)).toFixed(1)}`;
      })
      .join(' ');

    const statusBadgeClass =
      evalRes.mudRisk === 'critical'
        ? 'text-rose-300 border-rose-500/40 bg-rose-500/10'
        : evalRes.mudRisk === 'warning'
          ? 'text-amber-300 border-amber-500/40 bg-amber-500/10'
          : 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10';

    bodyEl.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 rounded-xl bg-[#070b14] border border-slate-800">
        <div class="lg:col-span-7 space-y-3">
          <div class="px-3 py-2 rounded-lg border text-xs font-semibold flex flex-wrap items-center justify-between gap-2 js-mm-status ${statusBadgeClass}">
            <span>${escapeHtml(evalRes.statusLabel)}</span>
            <span class="font-mono tabular-nums text-[11px] opacity-90">HPF rec.: ${stemMeta.recommendedHpfHz} Hz</span>
          </div>

          <div class="p-2.5 rounded-lg bg-[#0b111e] border border-slate-800 w-full overflow-x-auto">
            <svg viewBox="0 0 520 155" class="w-full min-w-[380px] h-auto block" role="img" aria-label="Curva de ecualización y zona de enmascaramiento 250 Hz">
              <rect x="0" y="0" width="520" height="155" rx="8" fill="#060a12" />
              <!-- Shaded 250 Hz mud zone -->
              <rect x="130" y="12" width="76" height="122" fill="#f59e0b" fill-opacity="0.08" />
              <text x="168" y="24" text-anchor="middle" fill="#fbbf24" font-size="9" font-weight="700">Zona Barro (250 Hz)</text>
              <line x1="26" y1="78" x2="494" y2="78" stroke="#334155" stroke-dasharray="4 3" stroke-width="1" />
              <polyline points="${polyPoints}" fill="none" stroke="#38bdf8" stroke-width="2.8" stroke-linejoin="round" />
              <text x="26" y="147" fill="#94a3b8" font-size="9">30 Hz</text>
              <text x="155" y="147" text-anchor="middle" fill="#94a3b8" font-size="9">250 Hz</text>
              <text x="315" y="147" text-anchor="middle" fill="#94a3b8" font-size="9">3 kHz</text>
              <text x="494" y="147" text-anchor="end" fill="#94a3b8" font-size="9">16 kHz</text>
            </svg>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono tabular-nums">
            <div class="p-2 rounded-lg bg-[#0b111e] border border-slate-800">
              <div class="text-[10px] text-slate-400">Volumen Máster</div>
              <div class="text-sm font-bold text-amber-300 js-mm-lufs">${evalRes.estimatedLufs} LUFS</div>
            </div>
            <div class="p-2 rounded-lg bg-[#0b111e] border border-slate-800">
              <div class="text-[10px] text-slate-400">Crest Factor</div>
              <div class="text-sm font-bold text-emerald-300 js-mm-crest">${evalRes.crestFactorDb} dB</div>
            </div>
            <div class="p-2 rounded-lg bg-[#0b111e] border border-slate-800">
              <div class="text-[10px] text-slate-400">Reducción Comp.</div>
              <div class="text-sm font-bold text-sky-300">-${evalRes.gainReductionDb} dB</div>
            </div>
            <div class="p-2 rounded-lg bg-[#0b111e] border border-slate-800">
              <div class="text-[10px] text-slate-400">True Peak Techo</div>
              <div class="text-sm font-bold text-slate-100">${evalRes.truePeakDbtp} dBTP</div>
            </div>
          </div>

          <p class="text-xs text-slate-300 mb-0"><strong>Diagnóstico:</strong> ${escapeHtml(evalRes.diagnosticNote)} <span class="text-slate-400">(${escapeHtml(stemMeta.focusNote)})</span></p>
        </div>

        <div class="lg:col-span-5 p-3 rounded-xl bg-[#0b111e] border border-slate-800 space-y-2.5 text-xs">
          <div class="font-bold text-slate-200">Controles EQ Sustractiva + Dinámica</div>
          <label class="block space-y-1">
            <span class="flex justify-between text-slate-300"><span>Pasa-Altos (HPF)</span><strong class="font-mono tabular-nums text-sky-300">${settings.hpfHz} Hz</strong></span>
            <input type="range" min="20" max="240" step="5" value="${settings.hpfHz}" class="w-full accent-sky-400 js-mm-hpf" />
          </label>
          <label class="block space-y-1">
            <span class="flex justify-between text-slate-300"><span>Barro / Cuerpo (250 Hz)</span><strong class="font-mono tabular-nums text-amber-300">${settings.lowMidDb >= 0 ? '+' : ''}${settings.lowMidDb.toFixed(1)} dB</strong></span>
            <input type="range" min="-8" max="8" step="0.5" value="${settings.lowMidDb}" class="w-full accent-amber-400 js-mm-lowmid" />
          </label>
          <label class="block space-y-1">
            <span class="flex justify-between text-slate-300"><span>Presencia / Claridad (3 kHz)</span><strong class="font-mono tabular-nums text-emerald-300">${settings.presenceDb >= 0 ? '+' : ''}${settings.presenceDb.toFixed(1)} dB</strong></span>
            <input type="range" min="-6" max="8" step="0.5" value="${settings.presenceDb}" class="w-full accent-emerald-400 js-mm-pres" />
          </label>
          <label class="block space-y-1">
            <span class="flex justify-between text-slate-300"><span>Aire / Brillo (10 kHz)</span><strong class="font-mono tabular-nums text-emerald-300">${settings.airDb >= 0 ? '+' : ''}${settings.airDb.toFixed(1)} dB</strong></span>
            <input type="range" min="-6" max="8" step="0.5" value="${settings.airDb}" class="w-full accent-emerald-400 js-mm-air" />
          </label>
          <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
            <label class="space-y-1">
              <span class="flex justify-between text-slate-300"><span>Ratio Comp.</span><strong class="font-mono tabular-nums text-sky-300">${settings.compRatio.toFixed(1)}:1</strong></span>
              <input type="range" min="1" max="10" step="0.5" value="${settings.compRatio}" class="w-full accent-sky-400 js-mm-ratio" />
            </label>
            <label class="space-y-1">
              <span class="flex justify-between text-slate-300"><span>Umbral</span><strong class="font-mono tabular-nums text-sky-300">${settings.compThreshDb} dB</strong></span>
              <input type="range" min="-32" max="-4" step="1" value="${settings.compThreshDb}" class="w-full accent-sky-400 js-mm-thresh" />
            </label>
          </div>
          <label class="block space-y-1">
            <span class="flex justify-between text-slate-300"><span>Techo Limitador (True Peak)</span><strong class="font-mono tabular-nums text-rose-300">${settings.limiterCeilingDb.toFixed(1)} dBTP</strong></span>
            <input type="range" min="-3.0" max="0.0" step="0.1" value="${settings.limiterCeilingDb}" class="w-full accent-rose-400 js-mm-ceil" />
          </label>
        </div>
      </div>
    `;
  };

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('.js-mm-play-proc')) playMixAudition(true);
    else if (target.closest('.js-mm-play-dry')) playMixAudition(false);
    else if (target.closest('.js-mm-stop')) {
      audio.stopAll();
      onStatus('Consola detenida');
    }
  });

  stage.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    if (target.classList.contains('js-mm-stem')) {
      const nextStem = (target.value as MixStemId) || 'full-band';
      settings = {
        ...settings,
        stemId: nextStem,
        hpfHz: presetId === 'clean-pro' ? MIX_STEM_LABELS[nextStem].recommendedHpfHz : settings.hpfHz,
      };
      render();
    } else if (target.classList.contains('js-mm-preset')) {
      presetId = target.value;
      const p = EQ_PRESETS.find((x) => x.id === presetId) || EQ_PRESETS[0];
      settings = {
        ...settings,
        ...p.settings,
        hpfHz: presetId === 'clean-pro' ? MIX_STEM_LABELS[settings.stemId].recommendedHpfHz : p.settings.hpfHz,
      };
      render();
    }
  });

  stage.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.classList.contains('js-mm-hpf')) settings = { ...settings, hpfHz: parseInt(target.value, 10) || 80 };
    else if (target.classList.contains('js-mm-lowmid')) settings = { ...settings, lowMidDb: parseFloat(target.value) || 0 };
    else if (target.classList.contains('js-mm-pres')) settings = { ...settings, presenceDb: parseFloat(target.value) || 0 };
    else if (target.classList.contains('js-mm-air')) settings = { ...settings, airDb: parseFloat(target.value) || 0 };
    else if (target.classList.contains('js-mm-ratio')) settings = { ...settings, compRatio: parseFloat(target.value) || 2 };
    else if (target.classList.contains('js-mm-thresh')) settings = { ...settings, compThreshDb: parseInt(target.value, 10) || -18 };
    else if (target.classList.contains('js-mm-ceil')) settings = { ...settings, limiterCeilingDb: parseFloat(target.value) || -1.0 };
    else return;
    render();
  });

  render();
}

// ============================================================================
// 3. COMPLEX WORK GUIDED ANALYSIS INSPECTOR ("Horizonte de Cristal" - Etapa 7)
// ============================================================================

function hydrateWorkAnalysisLab(
  stage: HTMLElement,
  audio: AcademyLabAudio,
  onStatus: (msg: string) => void
): void {
  let activeId = COMPLEX_WORK_SECTIONS[0].id;
  let activeBeatIdx = -1;

  audio.onStop(() => {
    activeBeatIdx = -1;
    render();
  });

  stage.innerHTML = `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#070b14] border border-slate-800">
        <div class="flex flex-wrap gap-1.5 js-wa-tabs">
          ${COMPLEX_WORK_SECTIONS.map(
            (sec) =>
              `<button type="button" data-sec="${sec.id}" class="btn text-xs whitespace-nowrap shrink-0 js-wa-tab">${escapeHtml(sec.label)}</button>`
          ).join('')}
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" class="btn btn-primary text-xs whitespace-nowrap shrink-0 js-wa-play">▶ Audicionar Sección</button>
          <button type="button" class="btn text-xs whitespace-nowrap shrink-0 js-wa-duet">🎼 Solo Bajo + Melodía</button>
          <button type="button" class="btn text-xs whitespace-nowrap shrink-0 js-wa-stop">⏹ Stop</button>
        </div>
      </div>
      <div class="js-wa-body"></div>
    </div>
  `;

  const bodyEl = stage.querySelector<HTMLElement>('.js-wa-body')!;

  const render = () => {
    const sec = COMPLEX_WORK_SECTIONS.find((s) => s.id === activeId) || COMPLEX_WORK_SECTIONS[0];
    stage.querySelectorAll<HTMLButtonElement>('.js-wa-tab').forEach((btn) => {
      btn.classList.toggle('btn-primary', btn.dataset['sec'] === sec.id);
    });

    const W = 560;
    const H = 148;
    const stepX = (i: number) => 56 + (i / Math.max(1, sec.bassMidis.length - 1)) * (W - 112);
    const midiToY = (m: number) => Math.max(18, Math.min(130, 134 - ((m - 34) / 46) * 112));

    const flatNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    const useFlats = sec.id === 'estribillo' || sec.id === 'puente' || sec.id === 'intro';
    const fmtSectionNote = (m: number) => {
      if (!useFlats) return formatMidiNoteName(m);
      const octave = Math.floor(m / 12) - 1;
      return `${flatNames[((m % 12) + 12) % 12]}${octave}`;
    };

    const bassLine = sec.bassMidis.map((m, i) => `${stepX(i).toFixed(1)},${midiToY(m).toFixed(1)}`).join(' ');
    const melLine = sec.melodyMidis.map((m, i) => `${stepX(i).toFixed(1)},${midiToY(m).toFixed(1)}`).join(' ');

    bodyEl.innerHTML = `
      <div class="p-3 rounded-xl bg-[#070b14] border border-slate-800 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <strong class="text-sm text-amber-300">${escapeHtml(sec.label)} (${escapeHtml(sec.barsLabel)})</strong>
            <span class="text-slate-400"> · Centro Tonal: ${escapeHtml(sec.keyCenter)}</span>
          </div>
          <div class="text-sky-300 font-semibold">${escapeHtml(sec.harmonicDevices.join(' · '))}</div>
        </div>

        <div class="w-full overflow-x-auto rounded-lg bg-[#0b111e] border border-slate-800 p-2">
          <svg viewBox="0 0 ${W} ${H}" class="w-full min-w-[420px] h-auto block" role="img" aria-label="Contorno comparativo de melodía superior y línea de bajo">
            <rect x="0" y="0" width="${W}" height="${H}" rx="6" fill="#060a12" />
            <line x1="26" y1="78" x2="${W - 26}" y2="78" stroke="#1e293b" stroke-dasharray="3 3" />
            <polyline points="${bassLine}" fill="none" stroke="#f59e0b" stroke-width="2.6" />
            <polyline points="${melLine}" fill="none" stroke="#38bdf8" stroke-width="2.6" />
            ${sec.bassMidis
              .map((bm, i) => {
                const mm = sec.melodyMidis[i];
                const x = stepX(i);
                const isActive = activeBeatIdx === i;
                return `
                  <circle cx="${x}" cy="${midiToY(bm)}" r="${isActive ? 6.5 : 4.5}" fill="#f59e0b" />
                  <text x="${x}" y="${midiToY(bm) + 14}" text-anchor="middle" fill="#fcd34d" font-size="9.5" font-weight="700">${fmtSectionNote(bm)}</text>
                  <circle cx="${x}" cy="${midiToY(mm)}" r="${isActive ? 6.5 : 4.5}" fill="#38bdf8" />
                  <text x="${x}" y="${Math.max(11, midiToY(mm) - 7)}" text-anchor="middle" fill="#bae6fd" font-size="9.5" font-weight="700">${fmtSectionNote(mm)}</text>
                `;
              })
              .join('')}
          </svg>
        </div>

        <div class="flex flex-wrap gap-2">
          ${sec.chordSymbols
            .map(
              (sym, idx) => `
            <button type="button" data-idx="${idx}" class="btn text-xs font-mono js-wa-chord ${activeBeatIdx === idx ? 'btn-primary' : 'bg-slate-900 border-slate-700'}">
              🔊 ${escapeHtml(sym)}
            </button>`
            )
            .join('')}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
          <div class="p-2.5 rounded-lg bg-[#0b111e] border border-slate-800 text-slate-300">
            <strong class="text-emerald-300 block mb-0.5">Arquitectura y Textura:</strong>
            ${escapeHtml(sec.textureRole)}
          </div>
          <div class="p-2.5 rounded-lg bg-[#0b111e] border border-slate-800 text-slate-300">
            <strong class="text-sky-300 block mb-0.5">Qué Escuchar Aquí:</strong>
            ${escapeHtml(sec.listeningCue)}
          </div>
        </div>
      </div>
    `;
  };

  const playSection = (fullHarmony: boolean) => {
    audio.stopAll();
    const sec = COMPLEX_WORK_SECTIONS.find((s) => s.id === activeId) || COMPLEX_WORK_SECTIONS[0];
    const stepMs = 760;
    sec.chordMidis.forEach((ch, idx) => {
      audio.schedule(() => {
        activeBeatIdx = idx;
        audio.playElectricBass(sec.bassMidis[idx], 0.65, 0, 0.34, 'finger', false);
        if (fullHarmony) {
          audio.strumChord(ch, 'piano', 0, false);
        }
        audio.playPluckedGuitar(sec.melodyMidis[idx], 0.6, 0.08, 0.25, false);
        render();
      }, idx * stepMs);
    });
    audio.schedule(() => {
      activeBeatIdx = -1;
      render();
    }, sec.chordMidis.length * stepMs + 220);
    onStatus(`${sec.label}: ${sec.chordSymbols.join(' → ')}`);
  };

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const tabBtn = target.closest<HTMLButtonElement>('.js-wa-tab');
    if (tabBtn) {
      activeId = tabBtn.dataset['sec'] || COMPLEX_WORK_SECTIONS[0].id;
      activeBeatIdx = -1;
      render();
      return;
    }
    const chordBtn = target.closest<HTMLButtonElement>('.js-wa-chord');
    if (chordBtn) {
      const idx = parseInt(chordBtn.dataset['idx'] || '0', 10);
      const sec = COMPLEX_WORK_SECTIONS.find((s) => s.id === activeId) || COMPLEX_WORK_SECTIONS[0];
      audio.stopAll();
      audio.playElectricBass(sec.bassMidis[idx], 0.7, 0, 0.34, 'finger', false);
      audio.strumChord(sec.chordMidis[idx], 'piano', 0, false);
      audio.playAcousticPiano(sec.melodyMidis[idx], 0.65, 0.12, 0.24, false);
      onStatus(`${sec.chordSymbols[idx]} · Bajo ${formatMidiNoteName(sec.bassMidis[idx])}`);
      return;
    }
    if (target.closest('.js-wa-play')) playSection(true);
    else if (target.closest('.js-wa-duet')) playSection(false);
    else if (target.closest('.js-wa-stop')) {
      audio.stopAll();
      activeBeatIdx = -1;
      render();
    }
  });

  render();
}

// ============================================================================
// 4. INTEGRATOR MASTER PROJECT ARCHITECT (Etapa 7)
// ============================================================================

function hydrateMasterProjectLab(
  stage: HTMLElement,
  audio: AcademyLabAudio,
  onStatus: (msg: string) => void
): void {
  let sel: IntegratorBlueprintSelection = {
    projectStyleId: 'andino',
    keyLabel: 'E',
    rootMidi: 4,
    bpm: 96,
    bassOctave: 1,
    harmonyRegister: 'mid',
    harmonicDevice: 'dim-bridge',
  };

  stage.innerHTML = `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#070b14] border border-slate-800">
        <div class="flex flex-wrap items-center gap-2">
          <label class="text-xs text-slate-300 font-semibold flex items-center gap-1">
            <span>Proyecto:</span>
            <select class="js-mp-style bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300">
              <option value="andino">1. Fusión Andina (6/8)</option>
              <option value="funk">2. Funk / Neo-Soul</option>
              <option value="ballad">3. Balada Modulación</option>
            </select>
          </label>
          <label class="text-xs text-slate-300 font-semibold flex items-center gap-1">
            <span>Tónica:</span>
            <select class="js-mp-key bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-sky-300">
              <option value="0|C">C (Do)</option>
              <option value="2|D">D (Re)</option>
              <option value="4|E" selected>E (Mi)</option>
              <option value="5|F">F (Fa)</option>
              <option value="7|G">G (Sol)</option>
              <option value="9|A">A (La)</option>
            </select>
          </label>
          <label class="text-xs text-slate-300 font-semibold flex items-center gap-1">
            <span>Bajo:</span>
            <select class="js-mp-bass bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200">
              <option value="1" selected>Octava 1 (Grave)</option>
              <option value="2">Octava 2 (Media-Grave)</option>
              <option value="3">Octava 3 (⚠️ Solapa)</option>
            </select>
          </label>
          <label class="text-xs text-slate-300 font-semibold flex items-center gap-1">
            <span>Armonía:</span>
            <select class="js-mp-harm bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200">
              <option value="low">Registro Grave (⚠️ Choque)</option>
              <option value="mid" selected>Registro Medio (Abierto)</option>
              <option value="high">Registro Agudo (Drop)</option>
            </select>
          </label>
          <label class="text-xs text-slate-300 font-semibold flex items-center gap-1">
            <span>Recurso:</span>
            <select class="js-mp-dev bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-emerald-300">
              <option value="dim-bridge" selected>Puente °7</option>
              <option value="tritone-sub">Sustituto Tritonal</option>
              <option value="modal-interchange">Intercambio Modal</option>
            </select>
          </label>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" class="btn btn-primary text-xs whitespace-nowrap shrink-0 js-mp-play">▶ Audicionar Maqueta</button>
          <button type="button" class="btn text-xs whitespace-nowrap shrink-0 js-mp-stop">⏹ Stop</button>
        </div>
      </div>

      <div class="js-mp-body"></div>
    </div>
  `;

  const bodyEl = stage.querySelector<HTMLElement>('.js-mp-body')!;

  const render = () => {
    const audit = auditIntegratorBlueprint(sel);
    const badgeCls = audit.hasCollision
      ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
      : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';

    bodyEl.innerHTML = `
      <div class="p-3 rounded-xl bg-[#070b14] border border-slate-800 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="text-sm font-bold text-amber-300">${escapeHtml(audit.styleTitle)}</div>
            <div class="text-xs text-slate-400">Tempo: <strong class="font-mono tabular-nums text-slate-200">${sel.bpm} BPM</strong></div>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span>Ajustar BPM:</span>
            <input type="range" min="64" max="136" step="2" value="${sel.bpm}" class="w-28 accent-amber-400 js-mp-bpm" />
          </div>
        </div>

        <div class="px-3 py-2 rounded-lg border text-xs font-semibold flex flex-wrap items-center justify-between gap-2 js-mp-audit-badge ${badgeCls}">
          <span>${escapeHtml(audit.collisionSummary)}</span>
          <span class="font-mono">${escapeHtml(audit.scoreLabel)}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono tabular-nums text-xs">
          <div class="p-2.5 rounded-lg bg-[#0b111e] border border-slate-800">
            <div class="text-[10px] text-slate-400">Negra (1/4)</div>
            <div class="text-sm font-bold text-sky-300">${audit.quarterMs} ms</div>
          </div>
          <div class="p-2.5 rounded-lg bg-[#0b111e] border border-slate-800">
            <div class="text-[10px] text-slate-400">Delay Musical (1/8.)</div>
            <div class="text-sm font-bold text-amber-300">${audit.dottedEighthDelayMs} ms</div>
          </div>
          <div class="p-2.5 rounded-lg bg-[#0b111e] border border-slate-800">
            <div class="text-[10px] text-slate-400">Pre-Delay Vocal (1/64)</div>
            <div class="text-sm font-bold text-emerald-300">${audit.vocalPreDelayMs} ms</div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-slate-400">Progresión resultante (pulsa cada acorde):</span>
          ${audit.chordProgression
            .map(
              (ch, i) => `
            <button type="button" data-idx="${i}" class="btn text-xs font-mono bg-slate-900 border-slate-700 js-mp-chord">
              🔊 ${escapeHtml(ch)}
            </button>`
            )
            .join('')}
        </div>
      </div>
    `;
  };

  stage.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const chBtn = target.closest<HTMLButtonElement>('.js-mp-chord');
    if (chBtn) {
      const idx = parseInt(chBtn.dataset['idx'] || '0', 10);
      const audit = auditIntegratorBlueprint(sel);
      audio.stopAll();
      audio.playElectricBass(audit.bassMidis[idx], 0.6, 0, 0.34, 'finger', false);
      audio.strumChord(audit.chordMidis[idx], 'piano', 0, false);
      onStatus(`${audit.chordProgression[idx]} · Bajo ${formatMidiNoteName(audit.bassMidis[idx])}`);
      return;
    }
    if (target.closest('.js-mp-play')) {
      const audit = auditIntegratorBlueprint(sel);
      audio.stopAll();
      const beatMs = Math.round((60000 / sel.bpm) * 1.4);
      audit.chordMidis.forEach((ch, idx) => {
        audio.schedule(() => {
          audio.playDrumHit('kick', 0);
          audio.playDrumHit('hihat', 0.18);
          audio.playElectricBass(audit.bassMidis[idx], 0.55, 0, 0.34, 'finger', false);
          audio.strumChord(ch, 'piano', 0, false);
          audio.playPluckedGuitar(audit.leadMidis[idx], 0.45, 0.12, 0.25, false);
        }, idx * beatMs);
      });
      onStatus(`Maqueta "${audit.styleTitle}" a ${sel.bpm} BPM (${audit.scoreLabel})`);
    } else if (target.closest('.js-mp-stop')) {
      audio.stopAll();
    }
  });

  stage.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    if (target.classList.contains('js-mp-style')) {
      sel = { ...sel, projectStyleId: (target.value as IntegratorBlueprintSelection['projectStyleId']) || 'andino' };
    } else if (target.classList.contains('js-mp-key')) {
      const [mStr, lbl] = target.value.split('|');
      sel = { ...sel, rootMidi: parseInt(mStr, 10) || 0, keyLabel: lbl || 'C' };
    } else if (target.classList.contains('js-mp-bass')) {
      sel = { ...sel, bassOctave: (parseInt(target.value, 10) as 1 | 2 | 3) || 1 };
    } else if (target.classList.contains('js-mp-harm')) {
      sel = { ...sel, harmonyRegister: (target.value as IntegratorBlueprintSelection['harmonyRegister']) || 'mid' };
    } else if (target.classList.contains('js-mp-dev')) {
      sel = { ...sel, harmonicDevice: (target.value as IntegratorBlueprintSelection['harmonicDevice']) || 'dim-bridge' };
    } else {
      return;
    }
    render();
  });

  stage.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.classList.contains('js-mp-bpm')) {
      sel = { ...sel, bpm: parseInt(target.value, 10) || 96 };
      render();
    }
  });

  render();
}
