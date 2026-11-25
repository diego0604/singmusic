import {
  ARRANGEMENT_GENRE_MIXES,
  BASS_MOTOR_DRILLS,
  ELECTRIC_TECHNIQUE_DEMOS,
  FINGERSTYLE_CHORD_PROGRESSIONS,
  FINGERSTYLE_PATTERNS,
  HARMONY_GUIDED_CHALLENGES,
  ORCHESTRAL_SECTION_RANGES,
  REAL_SONG_DISSECTIONS,
  buildDeliberateChunkingLadder,
  buildSongDissectionStepEvents,
  computeSignalChainAnalysis,
  evaluateHarmonyChallengeAttempt,
  resolveFingerstyleStepNotes,
  type ArrangementLayerId,
  type ElectricPedalId,
  type ElectricPickupPos,
  type ElectricSignalConfig,
  type ExpansionInstrumentSurface,
  type SongLayerId,
} from './expansion-pack-logic';
import { BASS_STRINGS, GUITAR_STRINGS, NOTE_NAMES, type MusicAudioEngine } from './lab-engine';

/**
 * Dispatcher for all 8 expansion-pack interactive laboratories.
 * Returns true if the labType was handled.
 */
export function buildExpansionDataLabStage(
  stage: HTMLElement,
  labType: string,
  article: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): boolean {
  switch (labType) {
    case 'real-songs-lab':
      buildRealSongsLab(stage, audio, onStatus);
      return true;
    case 'fingerstyle-pima-lab':
      buildFingerstylePimaLab(stage, audio, onStatus);
      return true;
    case 'electric-fx-chain-lab':
      buildElectricFxChainLab(stage, article, audio, onStatus);
      return true;
    case 'bass-motor-lab':
      buildBassMotorLab(stage, audio, onStatus);
      return true;
    case 'arrangement-layer-mixer-lab':
      buildArrangementLayerMixerLab(stage, audio, onStatus);
      return true;
    case 'orchestral-timbre-lab':
      buildOrchestralTimbreLab(stage, audio, onStatus);
      return true;
    case 'harmony-guided-lab':
      buildHarmonyGuidedLab(stage, article, audio, onStatus);
      return true;
    case 'practice-deliberate-lab':
      buildPracticeDeliberateLab(stage, article, audio, onStatus);
      return true;
    default:
      return false;
  }
}

// ============================================================================
// 1. REAL SONG DISSECTIONS LAB ("CÓMO SUENAN CANCIONES REALES")
// ============================================================================

function buildRealSongsLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  let activeSongId = REAL_SONG_DISSECTIONS[0].id;
  let isPlaying = false;
  let loopEnabled = true;
  let activeBarIdx = -1;
  let activeStepIdx = -1;
  const layers: Record<SongLayerId, boolean> = {
    drums: true,
    bass: true,
    harmony: true,
    melody: true,
  };
  let soloLayer: SongLayerId | null = null;

  const layerMeta: { id: SongLayerId; label: string; icon: string; color: string }[] = [
    { id: 'drums', label: 'Batería / Pulso', icon: '🥁', color: '#f59e0b' },
    { id: 'bass', label: 'Bajo Eléctrico', icon: '🎸', color: '#38bdf8' },
    { id: 'harmony', label: 'Armonía (Acordes)', icon: '🎹', color: '#a78bfa' },
    { id: 'melody', label: 'Melodía Principal', icon: '🎶', color: '#34d399' },
  ];

  const effectiveLayers = (): Record<SongLayerId, boolean> => {
    if (!soloLayer) return { ...layers };
    return {
      drums: soloLayer === 'drums',
      bass: soloLayer === 'bass',
      harmony: soloLayer === 'harmony',
      melody: soloLayer === 'melody',
    };
  };

  const getSong = () =>
    REAL_SONG_DISSECTIONS.find((s) => s.id === activeSongId) || REAL_SONG_DISSECTIONS[0];

  const stopPlayback = () => {
    isPlaying = false;
    activeBarIdx = -1;
    activeStepIdx = -1;
    audio.stopAll();
    updateVisualHighlight();
    syncPlayButton();
  };

  audio.onStop(() => {
    isPlaying = false;
    activeBarIdx = -1;
    activeStepIdx = -1;
    updateVisualHighlight();
    syncPlayButton();
  });

  const syncPlayButton = () => {
    const playBtn = stage.querySelector<HTMLButtonElement>('.js-rs-play');
    if (playBtn) {
      playBtn.textContent = isPlaying ? '⏹ Detener Canción' : '▶ Reproducir Arreglo Completo';
      playBtn.style.background = isPlaying ? 'rgba(244,63,94,0.25)' : '';
      playBtn.style.color = isPlaying ? '#fda4af' : '';
    }
  };

  const updateVisualHighlight = () => {
    stage.querySelectorAll<HTMLElement>('.js-rs-bar-card').forEach((card) => {
      const bIdx = parseInt(card.getAttribute('data-bar') || '-1', 10);
      const isNow = isPlaying && bIdx === activeBarIdx;
      card.style.borderColor = isNow ? '#34d399' : 'rgba(255,255,255,0.1)';
      card.style.background = isNow ? 'rgba(16,185,129,0.16)' : 'rgba(15,23,42,0.85)';
      card.style.transform = isNow ? 'translateY(-2px)' : '';
    });
    const beatEl = stage.querySelector<HTMLElement>('.js-rs-beat-badge');
    if (beatEl) {
      beatEl.textContent =
        isPlaying && activeBarIdx >= 0
          ? `Compás ${activeBarIdx + 1} · Pulso ${activeStepIdx + 1}`
          : 'En reposo';
    }
  };

  const scheduleSongCycle = () => {
    if (!isPlaying) return;
    const song = getSong();
    const eff = effectiveLayers();
    const events = buildSongDissectionStepEvents(song.id, eff);
    const stepMs =
      song.meter === '6/8'
        ? Math.round((60000 / song.bpm) / 2.2)
        : Math.round((60000 / song.bpm) / 2);

    events.forEach((ev, idx) => {
      audio.schedule(() => {
        if (!isPlaying) return;
        const liveEff = effectiveLayers();
        const bar = song.bars[ev.barIndex];
        activeBarIdx = ev.barIndex;
        activeStepIdx = ev.stepIndex;
        updateVisualHighlight();

        if (liveEff.drums) {
          if (song.drumPattern.kick[ev.stepIndex]) audio.playDrumHit('kick', 0);
          if (song.drumPattern.snare[ev.stepIndex]) audio.playDrumHit('snare', 0);
          if (song.drumPattern.hihat[ev.stepIndex]) audio.playDrumHit('hihat', 0);
        }
        if (liveEff.harmony && ev.chordMidis.length > 0) {
          audio.strumChord(bar.chordMidis, 'piano', 0, false);
        }
        if (liveEff.bass && ev.bassMidi) {
          audio.playElectricBass(ev.bassMidi, (stepMs / 1000) * 1.45, 0, 0.36, 'finger', false);
        }
        if (liveEff.melody && ev.melodyMidi) {
          audio.playPluckedGuitar(ev.melodyMidi, (stepMs / 1000) * 1.6, 0, 0.28, false);
        }
      }, idx * stepMs);
    });

    const totalMs = events.length * stepMs;
    audio.schedule(() => {
      if (!isPlaying) return;
      if (loopEnabled) {
        scheduleSongCycle();
      } else {
        stopPlayback();
      }
    }, totalMs);
  };

  const render = () => {
    const song = getSong();
    const eff = effectiveLayers();

    stage.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <div style="flex:1; min-width:240px;">
          <label style="display:block; font-size:0.74rem; color:#94a3b8; margin-bottom:4px; font-weight:700;">Elige una canción real para desarmar:</label>
          <select class="js-rs-song" style="width:100%; background:#0f172a; color:#f8fafc; border:1px solid rgba(229,169,60,0.45); border-radius:8px; padding:8px 10px; font-size:0.84rem; font-weight:700;">
            ${REAL_SONG_DISSECTIONS.map(
              (s) =>
                `<option value="${s.id}" ${s.id === activeSongId ? 'selected' : ''}>[Nivel ${s.level}] ${s.title}</option>`
            ).join('')}
          </select>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
          <button type="button" class="btn btn-primary js-rs-play">${isPlaying ? '⏹ Detener Canción' : '▶ Reproducir Arreglo Completo'}</button>
          <button type="button" class="btn js-rs-loop" style="background:${loopEnabled ? 'rgba(16,185,129,0.2)' : 'rgba(30,41,59,0.85)'}; color:${loopEnabled ? '#6ee7b7' : '#94a3b8'}; border:1px solid ${loopEnabled ? 'rgba(16,185,129,0.5)' : '#334155'};">
            🔁 Loop: ${loopEnabled ? 'ON' : 'OFF'}
          </button>
          <span class="js-rs-beat-badge" style="font-size:0.76rem; font-weight:700; color:#fbbf24; padding:5px 9px; border-radius:6px; background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3);">En reposo</span>
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px; font-size:0.78rem;">
        <span style="padding:3px 9px; border-radius:6px; background:rgba(56,189,248,0.14); color:#7dd3fc; font-weight:700;">🎵 ${song.keyLabel}</span>
        <span style="padding:3px 9px; border-radius:6px; background:rgba(245,158,11,0.14); color:#fcd34d; font-weight:700;">⏱️ ${song.bpm} BPM · ${song.meter}</span>
        <span style="padding:3px 9px; border-radius:6px; background:rgba(167,139,250,0.14); color:#c4b5fd; font-weight:700;">🏷️ ${song.genre}</span>
        <span style="padding:3px 9px; border-radius:6px; background:rgba(255,255,255,0.06); color:#cbd5e1;">${song.artistRef}</span>
      </div>

      <div style="padding:10px 12px; border-radius:8px; background:rgba(16,185,129,0.08); border-left:3px solid #10b981; font-size:0.82rem; color:#d1fae5; margin-bottom:12px;">
        <strong>💡 Por qué funciona esta canción:</strong> ${song.whyItWorks}
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(175px, 1fr)); gap:8px; margin-bottom:12px;">
        ${song.bars
          .map(
            (b, i) => `
          <button type="button" class="js-rs-bar-card" data-bar="${i}" style="text-align:left; cursor:pointer; padding:10px; border-radius:9px; background:rgba(15,23,42,0.85); border:1.5px solid rgba(255,255,255,0.1); transition:all 0.15s;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-size:0.72rem; color:#94a3b8; font-weight:700;">Compás ${b.bar}</span>
              <span style="font-size:0.74rem; color:#fbbf24; font-weight:800;">${b.roman}</span>
            </div>
            <div style="font-size:1.1rem; font-weight:900; color:#f8fafc; margin-bottom:3px;">${b.chordSymbol}</div>
            <div style="font-size:0.73rem; color:#cbd5e1; line-height:1.35;">${b.lyricOrCue}</div>
          </button>
        `
          )
          .join('')}
      </div>

      <div style="font-size:0.76rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:6px;">
        Mezclador por Capas (Mutea o Solea en vivo mientras suena)
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:8px;">
        ${layerMeta
          .map((m) => {
            const on = eff[m.id];
            const isSolo = soloLayer === m.id;
            return `
            <div style="padding:10px; border-radius:9px; background:${on ? 'rgba(15,23,42,0.92)' : 'rgba(15,23,42,0.45)'}; border:1px solid ${on ? m.color : 'rgba(255,255,255,0.08)'}; opacity:${on ? '1' : '0.62'};">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; margin-bottom:6px;">
                <strong style="font-size:0.8rem; color:${m.color}; min-width:0; line-height:1.25;">${m.icon} ${m.label}</strong>
                <div style="display:flex; gap:4px; flex-shrink:0;">
                  <button type="button" class="btn js-rs-mute" data-layer="${m.id}" style="padding:3px 7px; font-size:0.7rem; white-space:nowrap; flex-shrink:0; background:${layers[m.id] ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.22)'}; color:${layers[m.id] ? '#6ee7b7' : '#fda4af'}; border:1px solid ${layers[m.id] ? 'rgba(16,185,129,0.45)' : 'rgba(244,63,94,0.45)'};">
                    ${layers[m.id] ? '🔊 ON' : '🔇 MUTE'}
                  </button>
                  <button type="button" class="btn js-rs-solo" data-layer="${m.id}" style="padding:3px 7px; font-size:0.7rem; white-space:nowrap; flex-shrink:0; background:${isSolo ? '#e5a93c' : 'rgba(30,41,59,0.9)'}; color:${isSolo ? '#0b0e14' : '#cbd5e1'}; border:1px solid ${isSolo ? '#e5a93c' : '#334155'}; font-weight:800;">
                    S
                  </button>
                </div>
              </div>
              <p style="font-size:0.74rem; color:#cbd5e1; margin:0; line-height:1.4;">${song.layerNotes[m.id]}</p>
            </div>
          `;
          })
          .join('')}
      </div>
    `;

    stage.querySelector<HTMLSelectElement>('.js-rs-song')?.addEventListener('change', (e) => {
      stopPlayback();
      activeSongId = (e.target as HTMLSelectElement).value;
      render();
      onStatus(`Canción cargada: ${getSong().title}`);
    });

    stage.querySelector<HTMLButtonElement>('.js-rs-play')?.addEventListener('click', () => {
      if (isPlaying) {
        stopPlayback();
        onStatus('Reproducción de canción detenida');
      } else {
        audio.stopAll();
        isPlaying = true;
        syncPlayButton();
        onStatus(`🔊 Desarmando: ${getSong().title}`);
        scheduleSongCycle();
      }
    });

    stage.querySelector<HTMLButtonElement>('.js-rs-loop')?.addEventListener('click', () => {
      loopEnabled = !loopEnabled;
      render();
    });

    stage.querySelectorAll<HTMLButtonElement>('.js-rs-mute').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lid = btn.getAttribute('data-layer') as SongLayerId;
        soloLayer = null;
        layers[lid] = !layers[lid];
        render();
        onStatus(`Capa ${lid}: ${layers[lid] ? 'Activa' : 'Silenciada (Mute)'}`);
      });
    });

    stage.querySelectorAll<HTMLButtonElement>('.js-rs-solo').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lid = btn.getAttribute('data-layer') as SongLayerId;
        soloLayer = soloLayer === lid ? null : lid;
        render();
        onStatus(soloLayer ? `Solo en capa: ${lid}` : 'Todas las capas activas restauradas');
      });
    });

    stage.querySelectorAll<HTMLButtonElement>('.js-rs-bar-card').forEach((card) => {
      card.addEventListener('click', () => {
        const bIdx = parseInt(card.getAttribute('data-bar') || '0', 10);
        const bar = getSong().bars[bIdx];
        if (!bar) return;
        audio.stopAll();
        audio.strumChord(bar.chordMidis, 'piano', 0, false);
        const bassFirst = bar.bassMidis.find((m) => m > 0);
        if (bassFirst) audio.playElectricBass(bassFirst, 1.0, 0, 0.36, 'finger', false);
        onStatus(`Compás ${bar.bar} (${bar.roman} · ${bar.chordSymbol}): ${bar.lyricOrCue}`);
      });
    });
  };

  render();
}

// ============================================================================
// 2. ACOUSTIC GUITAR FINGERSTYLE / PIMA / TRAVIS PICKING LAB
// ============================================================================

function buildFingerstylePimaLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  let patternId = FINGERSTYLE_PATTERNS[0].id;
  let progId = FINGERSTYLE_CHORD_PROGRESSIONS[0].id;
  let bpm = FINGERSTYLE_PATTERNS[0].defaultBpm;
  let isPlaying = false;
  let currentChordIdx = 0;
  let currentStepIdx = -1;

  const getPattern = () =>
    FINGERSTYLE_PATTERNS.find((p) => p.id === patternId) || FINGERSTYLE_PATTERNS[0];
  const getProg = () =>
    FINGERSTYLE_CHORD_PROGRESSIONS.find((p) => p.id === progId) || FINGERSTYLE_CHORD_PROGRESSIONS[0];

  const stop = () => {
    isPlaying = false;
    currentStepIdx = -1;
    audio.stopAll();
    updateStepHighlight();
  };

  audio.onStop(() => {
    isPlaying = false;
    currentStepIdx = -1;
    updateStepHighlight();
  });

  const updateStepHighlight = () => {
    const playBtn = stage.querySelector<HTMLButtonElement>('.js-fp-play');
    if (playBtn) {
      playBtn.textContent = isPlaying ? '⏹ Detener Patrón' : '▶ Tocar Patrón en Loop';
    }
    stage.querySelectorAll<HTMLElement>('.js-fp-step').forEach((el) => {
      const idx = parseInt(el.getAttribute('data-step') || '-1', 10);
      const active = isPlaying && idx === currentStepIdx;
      el.style.borderColor = active ? '#10b981' : 'rgba(255,255,255,0.12)';
      el.style.background = active ? 'rgba(16,185,129,0.22)' : 'rgba(15,23,42,0.85)';
      el.style.transform = active ? 'scale(1.04)' : '';
    });
    stage.querySelectorAll<HTMLElement>('.js-fp-chord-pill').forEach((el) => {
      const idx = parseInt(el.getAttribute('data-cidx') || '-1', 10);
      const active = idx === currentChordIdx;
      el.style.borderColor = active ? '#e5a93c' : 'rgba(255,255,255,0.12)';
      el.style.background = active ? 'rgba(229,169,60,0.2)' : 'rgba(15,23,42,0.75)';
      el.style.color = active ? '#fde68a' : '#cbd5e1';
    });

    const pat = getPattern();
    const chord = getProg().chords[currentChordIdx];
    const resolved =
      currentStepIdx >= 0 ? resolveFingerstyleStepNotes(pat, chord, currentStepIdx) : null;
    const activeStrings = new Set((resolved?.positions || []).map((p) => p.sIdx));

    stage.querySelectorAll<HTMLElement>('.js-fp-string-row').forEach((row) => {
      const sIdx = parseInt(row.getAttribute('data-sidx') || '-1', 10);
      const hit = isPlaying && activeStrings.has(sIdx);
      row.style.background = hit ? 'rgba(16,185,129,0.18)' : 'transparent';
    });
  };

  const playSingleStep = (chordIdx: number, stepIdx: number) => {
    const pat = getPattern();
    const chord = getProg().chords[chordIdx];
    const res = resolveFingerstyleStepNotes(pat, chord, stepIdx);
    if (res.isPercussion) {
      audio.playDrumHit('clap', 0);
      audio.playDrumHit('ghost', 0);
    } else {
      res.midis.forEach((m, i) => {
        audio.playPluckedGuitar(m, 0.72, i * 0.012, 0.27, false);
      });
    }
  };

  const scheduleCycle = () => {
    if (!isPlaying) return;
    const pat = getPattern();
    const prog = getProg();
    const stepMs = Math.round((60000 / bpm) / 2);
    const totalSteps = prog.chords.length * pat.steps.length;

    for (let g = 0; g < totalSteps; g++) {
      const cIdx = Math.floor(g / pat.steps.length);
      const sIdx = g % pat.steps.length;
      audio.schedule(() => {
        if (!isPlaying) return;
        currentChordIdx = cIdx;
        currentStepIdx = sIdx;
        playSingleStep(cIdx, sIdx);
        updateStepHighlight();
      }, g * stepMs);
    }

    audio.schedule(() => {
      if (isPlaying) scheduleCycle();
    }, totalSteps * stepMs);
  };

  const render = () => {
    const pat = getPattern();
    const prog = getProg();
    const activeChord = prog.chords[currentChordIdx];

    const fingerColors: Record<string, string> = {
      P: '#f59e0b',
      i: '#38bdf8',
      m: '#34d399',
      a: '#f472b6',
      'P+m': '#a78bfa',
      'P+a': '#fb7185',
      X: '#ef4444',
    };

    stage.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:10px; margin-bottom:12px;">
        <div>
          <label style="display:block; font-size:0.74rem; color:#94a3b8; font-weight:700; margin-bottom:4px;">Patrón de Mano Derecha (P–i–m–a):</label>
          <select class="js-fp-pattern" style="width:100%; background:#0f172a; color:#f8fafc; border:1px solid rgba(229,169,60,0.45); border-radius:8px; padding:7px 10px; font-size:0.82rem; font-weight:700;">
            ${FINGERSTYLE_PATTERNS.map(
              (p) => `<option value="${p.id}" ${p.id === patternId ? 'selected' : ''}>[N${p.level}] ${p.name}</option>`
            ).join('')}
          </select>
        </div>
        <div>
          <label style="display:block; font-size:0.74rem; color:#94a3b8; font-weight:700; margin-bottom:4px;">Progresión de Acordes:</label>
          <select class="js-fp-prog" style="width:100%; background:#0f172a; color:#f8fafc; border:1px solid rgba(56,189,248,0.4); border-radius:8px; padding:7px 10px; font-size:0.82rem;">
            ${FINGERSTYLE_CHORD_PROGRESSIONS.map(
              (pr) => `<option value="${pr.id}" ${pr.id === progId ? 'selected' : ''}>${pr.label}</option>`
            ).join('')}
          </select>
        </div>
        <div>
          <label style="display:flex; justify-content:space-between; font-size:0.74rem; color:#94a3b8; font-weight:700; margin-bottom:4px;">
            <span>Tempo (BPM)</span><strong class="js-fp-bpm-val" style="color:#fbbf24;">${bpm} BPM</strong>
          </label>
          <input type="range" class="js-fp-bpm" min="52" max="140" value="${bpm}" style="width:100%;">
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${prog.chords
            .map(
              (ch, idx) => `
            <button type="button" class="btn js-fp-chord-pill" data-cidx="${idx}" style="padding:5px 12px; font-size:0.82rem; font-weight:800; border:1.5px solid ${idx === currentChordIdx ? '#e5a93c' : 'rgba(255,255,255,0.12)'}; background:${idx === currentChordIdx ? 'rgba(229,169,60,0.2)' : 'rgba(15,23,42,0.75)'}; color:${idx === currentChordIdx ? '#fde68a' : '#cbd5e1'};">
              ${ch.symbol}
            </button>
          `
            )
            .join('')}
        </div>
        <button type="button" class="btn btn-primary js-fp-play">${isPlaying ? '⏹ Detener Patrón' : '▶ Tocar Patrón en Loop'}</button>
      </div>

      <div style="padding:9px 12px; border-radius:8px; background:rgba(56,189,248,0.08); border-left:3px solid #38bdf8; font-size:0.8rem; color:#bae6fd; margin-bottom:10px;">
        <strong>${pat.meter} · ${pat.feel}</strong><br>
        <span style="color:#e2e8f0;">🎯 Técnica: ${pat.techniqueTip}</span>
      </div>

      <div style="display:grid; grid-template-columns:repeat(${pat.steps.length}, minmax(56px, 1fr)); gap:6px; overflow-x:auto; padding-bottom:4px; margin-bottom:12px;">
        ${pat.steps
          .map((st, idx) => {
            const col = fingerColors[st.finger] || '#38bdf8';
            return `
            <button type="button" class="js-fp-step" data-step="${idx}" style="cursor:pointer; padding:8px 4px; border-radius:8px; background:rgba(15,23,42,0.85); border:1.5px solid rgba(255,255,255,0.12); text-align:center; transition:all 0.12s;">
              <div style="font-size:0.68rem; color:#94a3b8; font-weight:700;">${st.beatLabel}</div>
              <div style="font-size:0.95rem; font-weight:900; color:${col}; margin:2px 0;">${st.finger}</div>
              <div style="font-size:0.66rem; color:#cbd5e1;">${st.targets.map((t) => (t === 'bass1' ? 'Bajo1' : t === 'bass2' ? 'Bajo2' : t === 'perc' ? 'Slap' : `${Number(t) + 1}ª`)).join('+')}</div>
            </button>
          `;
          })
          .join('')}
      </div>

      <div style="background:rgba(11,14,20,0.75); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px; overflow-x:auto;">
        <div style="font-size:0.75rem; font-weight:700; color:#fbbf24; margin-bottom:6px;">
          🎸 Posición de Mano Izquierda (${activeChord.symbol}) y Cuerdas Pulsadas en Vivo:
        </div>
        ${GUITAR_STRINGS.map((str, sIdx) => {
          const fret = activeChord.frets[sIdx];
          const isMuted = fret < 0;
          const noteName = isMuted ? 'X' : NOTE_NAMES[(str.openMidi + fret) % 12];
          const isBass = sIdx === activeChord.bassPrimarySIdx || sIdx === activeChord.bassAltSIdx;
          return `
            <div class="js-fp-string-row" data-sidx="${sIdx}" style="display:flex; align-items:center; gap:8px; padding:4px 6px; border-radius:6px; border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.12s;">
              <span style="width:52px; font-size:0.74rem; font-weight:800; color:${isBass ? '#f59e0b' : '#94a3b8'};">${str.label}</span>
              <span style="width:46px; font-size:0.74rem; font-family:monospace; color:${isMuted ? '#ef4444' : '#34d399'}; font-weight:800;">
                ${isMuted ? '✕ Mute' : `Tr. ${fret}`}
              </span>
              <span style="font-size:0.74rem; color:#e2e8f0; font-weight:700;">${isMuted ? 'No tocar' : `${noteName}${isBass ? ' (Pulgar P)' : ' (Dedos i/m/a)'}`}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    stage.querySelector<HTMLSelectElement>('.js-fp-pattern')?.addEventListener('change', (e) => {
      stop();
      patternId = (e.target as HTMLSelectElement).value;
      bpm = getPattern().defaultBpm;
      render();
      onStatus(`Patrón Fingerstyle: ${getPattern().name}`);
    });

    stage.querySelector<HTMLSelectElement>('.js-fp-prog')?.addEventListener('change', (e) => {
      stop();
      progId = (e.target as HTMLSelectElement).value;
      currentChordIdx = 0;
      render();
    });

    stage.querySelector<HTMLInputElement>('.js-fp-bpm')?.addEventListener('input', (e) => {
      bpm = parseInt((e.target as HTMLInputElement).value, 10) || 84;
      const lbl = stage.querySelector<HTMLElement>('.js-fp-bpm-val');
      if (lbl) lbl.textContent = `${bpm} BPM`;
    });

    stage.querySelector<HTMLButtonElement>('.js-fp-play')?.addEventListener('click', () => {
      if (isPlaying) {
        stop();
        onStatus('Patrón Fingerstyle detenido');
      } else {
        audio.stopAll();
        isPlaying = true;
        onStatus(`🎸 Tocando ${getPattern().name} a ${bpm} BPM`);
        scheduleCycle();
      }
    });

    stage.querySelectorAll<HTMLButtonElement>('.js-fp-chord-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentChordIdx = parseInt(btn.getAttribute('data-cidx') || '0', 10);
        if (!isPlaying) render();
        else updateStepHighlight();
      });
    });

    stage.querySelectorAll<HTMLButtonElement>('.js-fp-step').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sIdx = parseInt(btn.getAttribute('data-step') || '0', 10);
        playSingleStep(currentChordIdx, sIdx);
        const st = getPattern().steps[sIdx];
        onStatus(`Paso ${sIdx + 1} (${st.beatLabel}): Dedo ${st.finger} sobre ${getProg().chords[currentChordIdx].symbol}`);
      });
    });
  };

  render();
}

// ============================================================================
// 3. ELECTRIC GUITAR SIGNAL CHAIN, PICKUPS & EXPRESSIVE TECHNIQUES LAB
// ============================================================================

function buildElectricFxChainLab(
  stage: HTMLElement,
  article: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const presetMode = article.getAttribute('data-preset') === 'expresion' ? 'expresion' : 'fundamentos';
  const relevantDemos = ELECTRIC_TECHNIQUE_DEMOS.filter((d) =>
    presetMode === 'expresion' ? d.category === 'expresion' : true
  );
  let activeDemoId = relevantDemos[0]?.id || ELECTRIC_TECHNIQUE_DEMOS[0].id;

  const config: ElectricSignalConfig = {
    pickup: presetMode === 'expresion' ? 'bridge' : 'bridge',
    activePedals: presetMode === 'expresion' ? ['drive', 'delay', 'reverb'] : ['drive'],
    driveBeforeTimeFx: true,
    palmMute: presetMode === 'fundamentos',
  };

  const pedalMeta: { id: ElectricPedalId; label: string; color: string; desc: string }[] = [
    { id: 'comp', label: '🎚️ Compresor', color: '#38bdf8', desc: 'Iguala volumen y alarga el sustain' },
    { id: 'drive', label: '🔥 Overdrive', color: '#f97316', desc: 'Recorta picos y genera armónicos rock' },
    { id: 'chorus', label: '🌊 Chorus', color: '#a78bfa', desc: 'Duplica y desafina suavemente (80s/Indie)' },
    { id: 'delay', label: '🔁 Delay', color: '#10b981', desc: 'Repeticiones rítmicas de eco' },
    { id: 'reverb', label: '🏛️ Reverb', color: '#ec4899', desc: 'Espacio y profundidad de sala' },
  ];

  const getDemo = () =>
    ELECTRIC_TECHNIQUE_DEMOS.find((d) => d.id === activeDemoId) || ELECTRIC_TECHNIQUE_DEMOS[0];

  const playDemoWithCurrentChain = (demo = getDemo()) => {
    audio.stopAll();
    const analysis = computeSignalChainAnalysis(config);
    demo.notes.forEach((n) => {
      audio.playElectricGuitarFx(n.midi, n.duration, n.delaySec, {
        pickup: config.pickup,
        drive: analysis.driveAmount,
        chorus: analysis.hasChorus,
        delayFx: analysis.hasDelay,
        reverb: analysis.hasReverb,
        driveBeforeTimeFx: config.driveBeforeTimeFx,
        palmMute: n.palmMute ?? config.palmMute,
        bendSemis: n.bendSemis ?? 0,
        volume: config.activePedals.includes('comp') ? 0.34 : 0.28,
      });
    });
    onStatus(`⚡ ${demo.label} — ${analysis.chainSummary}`);
  };

  const render = () => {
    const analysis = computeSignalChainAnalysis(config);
    const demo = getDemo();
    const isExp = analysis.orderVerdict === 'experimental';

    stage.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:12px; margin-bottom:12px;">
        <div style="padding:12px; border-radius:10px; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1);">
          <div style="font-size:0.74rem; font-weight:800; color:#fbbf24; text-transform:uppercase; margin-bottom:6px;">
            1. Selector de Pastillas (Pickups) y Palm Mute
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
            ${(['neck', 'middle', 'bridge'] as ElectricPickupPos[])
              .map((pos) => {
                const active = config.pickup === pos;
                const names: Record<ElectricPickupPos, string> = {
                  neck: 'Mástil (Cálida)',
                  middle: 'Media (Equil.)',
                  bridge: 'Puente (Mordiente)',
                };
                return `<button type="button" class="btn js-efx-pickup" data-pickup="${pos}" style="padding:5px 10px; font-size:0.76rem; font-weight:700; background:${active ? '#e5a93c' : '#171e2c'}; color:${active ? '#0b0e14' : '#cbd5e1'}; border:1px solid ${active ? '#e5a93c' : '#334155'};">${names[pos]}</button>`;
              })
              .join('')}
          </div>
          <div style="font-size:0.75rem; color:#cbd5e1; margin-bottom:8px;">${analysis.pickupLabel} · Brillo: <strong>${Math.round(analysis.brightnessHz)} Hz</strong></div>
          <button type="button" class="btn js-efx-pm" style="padding:5px 10px; font-size:0.76rem; font-weight:700; background:${config.palmMute ? 'rgba(244,63,94,0.22)' : '#171e2c'}; color:${config.palmMute ? '#fda4af' : '#cbd5e1'}; border:1px solid ${config.palmMute ? '#fb7185' : '#334155'};">
            ✋ Palm Mute: ${config.palmMute ? 'ACTIVO (Chug seco)' : 'Desactivado (Abierto)'}
          </button>
        </div>

        <div style="padding:12px; border-radius:10px; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1);">
          <div style="font-size:0.74rem; font-weight:800; color:#38bdf8; text-transform:uppercase; margin-bottom:6px;">
            2. Pedalboard Activo (Enciende o apaga pedales)
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
            ${pedalMeta
              .map((p) => {
                const on = config.activePedals.includes(p.id);
                return `<button type="button" class="btn js-efx-pedal" data-pedal="${p.id}" title="${p.desc}" style="padding:6px 10px; font-size:0.76rem; font-weight:700; background:${on ? 'rgba(16,185,129,0.18)' : '#171e2c'}; color:${on ? p.color : '#94a3b8'}; border:1.5px solid ${on ? p.color : '#334155'};">${p.label} ${on ? '●' : '○'}</button>`;
              })
              .join('')}
          </div>
          <button type="button" class="btn js-efx-order" style="width:100%; padding:6px 10px; font-size:0.76rem; font-weight:800; background:${isExp ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.16)'}; color:${isExp ? '#fde047' : '#6ee7b7'}; border:1px solid ${isExp ? '#f59e0b' : '#10b981'};">
            🔄 Orden de Cadena: ${config.driveBeforeTimeFx ? 'Overdrive → Delay/Reverb (Estándar)' : 'Delay/Reverb → Overdrive (Invertido / Shoegaze)'}
          </button>
        </div>
      </div>

      <div style="padding:10px 12px; border-radius:9px; background:rgba(11,14,20,0.85); border:1px solid ${isExp ? 'rgba(245,158,11,0.45)' : 'rgba(16,185,129,0.35)'}; margin-bottom:12px;">
        <div style="font-size:0.8rem; font-weight:800; color:#f8fafc; margin-bottom:4px;">Ruta de Señal: ${analysis.chainSummary}</div>
        <div style="font-size:0.76rem; color:${isExp ? '#fde68a' : '#a7f3d0'};">${analysis.orderExplanation}</div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${relevantDemos
            .map(
              (d) => `
            <button type="button" class="btn js-efx-demo" data-demo="${d.id}" style="padding:6px 11px; font-size:0.77rem; font-weight:700; background:${d.id === activeDemoId ? 'rgba(56,189,248,0.2)' : '#171e2c'}; color:${d.id === activeDemoId ? '#7dd3fc' : '#cbd5e1'}; border:1px solid ${d.id === activeDemoId ? '#38bdf8' : '#334155'};">
              ${d.label}
            </button>
          `
            )
            .join('')}
        </div>
        <div style="display:flex; gap:6px;">
          <button type="button" class="btn btn-primary js-efx-play">▶ Escuchar Riff / Técnica con esta Cadena</button>
          <button type="button" class="btn js-efx-test-chord" style="background:rgba(229,169,60,0.18); color:#fde68a; border:1px solid rgba(229,169,60,0.45);">🎸 Probar Acorde E5</button>
        </div>
      </div>

      <div style="padding:10px 12px; border-radius:8px; background:rgba(30,41,59,0.55); border:1px solid rgba(255,255,255,0.08); font-size:0.79rem;">
        <strong style="color:#f3c874;">${demo.label}</strong> · <code style="color:#7dd3fc;">${demo.tabPreview}</code>
        <p style="margin:4px 0 0; color:#cbd5e1;">${demo.description}</p>
      </div>
    `;

    stage.querySelectorAll<HTMLButtonElement>('.js-efx-pickup').forEach((btn) => {
      btn.addEventListener('click', () => {
        config.pickup = btn.getAttribute('data-pickup') as ElectricPickupPos;
        render();
        playDemoWithCurrentChain();
      });
    });

    stage.querySelector<HTMLButtonElement>('.js-efx-pm')?.addEventListener('click', () => {
      config.palmMute = !config.palmMute;
      render();
      playDemoWithCurrentChain();
    });

    stage.querySelectorAll<HTMLButtonElement>('.js-efx-pedal').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-pedal') as ElectricPedalId;
        if (config.activePedals.includes(pid)) {
          config.activePedals = config.activePedals.filter((x) => x !== pid);
        } else {
          config.activePedals = [...config.activePedals, pid];
        }
        render();
        playDemoWithCurrentChain();
      });
    });

    stage.querySelector<HTMLButtonElement>('.js-efx-order')?.addEventListener('click', () => {
      config.driveBeforeTimeFx = !config.driveBeforeTimeFx;
      if (!config.activePedals.includes('drive')) config.activePedals.push('drive');
      if (!config.activePedals.includes('delay') && !config.activePedals.includes('reverb')) {
        config.activePedals.push('delay');
      }
      render();
      playDemoWithCurrentChain();
    });

    stage.querySelectorAll<HTMLButtonElement>('.js-efx-demo').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeDemoId = btn.getAttribute('data-demo') || activeDemoId;
        const nextDemo = getDemo();
        if (nextDemo.defaultConfig.pickup) config.pickup = nextDemo.defaultConfig.pickup;
        if (nextDemo.defaultConfig.activePedals) {
          config.activePedals = [...nextDemo.defaultConfig.activePedals];
        }
        if (typeof nextDemo.defaultConfig.palmMute === 'boolean') {
          config.palmMute = nextDemo.defaultConfig.palmMute;
        }
        render();
        playDemoWithCurrentChain(nextDemo);
      });
    });

    stage.querySelector<HTMLButtonElement>('.js-efx-play')?.addEventListener('click', () => {
      playDemoWithCurrentChain();
    });

    stage.querySelector<HTMLButtonElement>('.js-efx-test-chord')?.addEventListener('click', () => {
      audio.stopAll();
      const analysis = computeSignalChainAnalysis(config);
      [40, 47, 52].forEach((m, i) => {
        audio.playElectricGuitarFx(m, 0.95, i * 0.025, {
          pickup: config.pickup,
          drive: analysis.driveAmount,
          chorus: analysis.hasChorus,
          delayFx: analysis.hasDelay,
          reverb: analysis.hasReverb,
          driveBeforeTimeFx: config.driveBeforeTimeFx,
          palmMute: config.palmMute,
          bendSemis: 0,
          volume: 0.28,
        });
      });
      onStatus(`🎸 Acorde E5 · ${analysis.chainSummary}`);
    });
  };

  render();
}

// ============================================================================
// 4. BASS MOTOR SKILLS, STRING CROSSING, MUTING & TRANSITION FILLS LAB
// ============================================================================

function buildBassMotorLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  let activeDrillId = BASS_MOTOR_DRILLS[0].id;
  let bpm = BASS_MOTOR_DRILLS[0].defaultBpm;
  let isPlaying = false;
  let activeStepIdx = -1;

  const getDrill = () =>
    BASS_MOTOR_DRILLS.find((d) => d.id === activeDrillId) || BASS_MOTOR_DRILLS[0];

  const stop = () => {
    isPlaying = false;
    activeStepIdx = -1;
    audio.stopAll();
    updateHighlight();
  };

  audio.onStop(() => {
    isPlaying = false;
    activeStepIdx = -1;
    updateHighlight();
  });

  const playStepSound = (idx: number) => {
    const step = getDrill().steps[idx];
    if (!step) return;
    const midi = BASS_STRINGS[step.sIdx].openMidi + step.fret;
    if (step.rh === 'X (Mute)') {
      audio.playDrumHit('ghost', 0);
      audio.playElectricBass(midi, 0.08, 0, 0.2, 'slap', false);
    } else {
      const style = step.rh === 'T (Slap)' || step.rh === 'P (Pop)' ? 'slap' : 'finger';
      audio.playElectricBass(midi, 0.42, 0, 0.38, style, false);
    }
  };

  const updateHighlight = () => {
    const playBtn = stage.querySelector<HTMLButtonElement>('.js-bm-play');
    if (playBtn) playBtn.textContent = isPlaying ? '⏹ Detener Ejercicio' : '▶ Practicar con Metrónomo';

    const activeStep = activeStepIdx >= 0 ? getDrill().steps[activeStepIdx] : null;
    stage.querySelectorAll<HTMLElement>('.js-bm-step').forEach((el) => {
      const i = parseInt(el.getAttribute('data-step') || '-1', 10);
      const on = isPlaying && i === activeStepIdx;
      el.style.borderColor = on ? '#38bdf8' : 'rgba(255,255,255,0.1)';
      el.style.background = on ? 'rgba(56,189,248,0.2)' : 'rgba(15,23,42,0.85)';
    });

    stage.querySelectorAll<HTMLElement>('.js-bm-fret').forEach((cell) => {
      const s = parseInt(cell.getAttribute('data-sidx') || '-1', 10);
      const f = parseInt(cell.getAttribute('data-fret') || '-1', 10);
      const hit = isPlaying && activeStep && activeStep.sIdx === s && activeStep.fret === f;
      const dot = cell.querySelector<HTMLElement>('.js-bm-dot');
      if (dot) {
        dot.style.boxShadow = hit ? '0 0 0 2.5px #ffffff, 0 0 14px #38bdf8' : '';
        dot.style.transform = hit ? 'scale(1.18)' : '';
      }
    });
  };

  const scheduleDrill = () => {
    if (!isPlaying) return;
    const drill = getDrill();
    const stepMs = Math.round((60000 / bpm) / 2);
    drill.steps.forEach((_, idx) => {
      audio.schedule(() => {
        if (!isPlaying) return;
        activeStepIdx = idx;
        if (idx % 2 === 0) audio.playDrumHit(idx === 0 ? 'kick' : 'hihat', 0);
        playStepSound(idx);
        updateHighlight();
      }, idx * stepMs);
    });
    audio.schedule(() => {
      if (isPlaying) scheduleDrill();
    }, drill.steps.length * stepMs);
  };

  const render = () => {
    const drill = getDrill();
    const minFret = Math.max(0, Math.min(...drill.steps.map((s) => s.fret)) - 1);
    const maxFret = Math.max(minFret + 6, Math.max(...drill.steps.map((s) => s.fret)) + 1);
    const stepLookup = new Map<string, { finger: number; label: string }>();
    drill.steps.forEach((s) => {
      const k = `${s.sIdx}-${s.fret}`;
      if (!stepLookup.has(k)) stepLookup.set(k, { finger: s.finger, label: s.noteLabel.split(' ')[0] });
    });

    let fretHtml = `<div class="fretboard-wrapper"><div class="fretboard-row" style="border-bottom:1px solid rgba(255,255,255,0.14); margin-bottom:4px;"><div class="string-label" style="color:#94a3b8; font-size:0.7rem;">Traste</div>`;
    for (let f = minFret; f <= maxFret; f++) {
      fretHtml += `<div class="fret-cell" style="height:20px; border:none; color:#94a3b8; font-size:0.72rem; font-weight:700;">${f}</div>`;
    }
    fretHtml += `</div>`;

    BASS_STRINGS.forEach((st, sIdx) => {
      fretHtml += `<div class="fretboard-row"><div class="string-label" style="color:#38bdf8; font-weight:800;">${st.label}</div>`;
      for (let f = minFret; f <= maxFret; f++) {
        const midi = st.openMidi + f;
        const hit = stepLookup.get(`${sIdx}-${f}`);
        fretHtml += `
          <div class="fret-cell js-bm-fret" data-sidx="${sIdx}" data-fret="${f}" data-midi="${midi}" style="cursor:pointer;">
            <div class="fret-note js-bm-dot ${hit ? 'char' : ''}" style="transition:transform 0.12s;">
              ${hit ? `${hit.label}<span class="finger-badge">${hit.finger}</span>` : NOTE_NAMES[midi % 12]}
            </div>
          </div>
        `;
      }
      fretHtml += `</div>`;
    });
    fretHtml += `</div>`;

    stage.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${BASS_MOTOR_DRILLS.map(
            (d) => `
            <button type="button" class="btn js-bm-drill" data-drill="${d.id}" style="padding:6px 10px; font-size:0.76rem; font-weight:700; background:${d.id === activeDrillId ? 'rgba(56,189,248,0.22)' : '#171e2c'}; color:${d.id === activeDrillId ? '#7dd3fc' : '#cbd5e1'}; border:1px solid ${d.id === activeDrillId ? '#38bdf8' : '#334155'};">
              ${d.focus}: ${d.name.split('.')[0]}
            </button>
          `
          ).join('')}
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <label style="font-size:0.75rem; color:#94a3b8; font-weight:700;">BPM: <strong class="js-bm-bpm-val" style="color:#38bdf8;">${bpm}</strong></label>
          <input type="range" class="js-bm-bpm" min="55" max="135" value="${bpm}" style="width:110px;">
          <button type="button" class="btn btn-primary js-bm-play">${isPlaying ? '⏹ Detener Ejercicio' : '▶ Practicar con Metrónomo'}</button>
        </div>
      </div>

      <div style="padding:10px 12px; border-radius:8px; background:rgba(56,189,248,0.08); border-left:3px solid #38bdf8; font-size:0.8rem; color:#e0f2fe; margin-bottom:10px;">
        <strong>${drill.name}</strong><br>${drill.explanation}
      </div>

      ${fretHtml}

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(92px, 1fr)); gap:6px; margin-top:10px;">
        ${drill.steps
          .map(
            (s, i) => `
          <button type="button" class="js-bm-step" data-step="${i}" style="cursor:pointer; padding:7px 6px; border-radius:8px; background:rgba(15,23,42,0.85); border:1px solid rgba(255,255,255,0.1); text-align:center;">
            <div style="font-size:0.68rem; color:#94a3b8;">Paso ${i + 1} · ${BASS_STRINGS[s.sIdx].label.split(' ')[0]} tr.${s.fret}</div>
            <div style="font-size:0.84rem; font-weight:800; color:#f8fafc;">${s.noteLabel}</div>
            <div style="font-size:0.68rem; color:#fbbf24; font-weight:700;">Izq D${s.finger} · Der ${s.rh}</div>
          </button>
        `
          )
          .join('')}
      </div>
    `;

    stage.querySelectorAll<HTMLButtonElement>('.js-bm-drill').forEach((btn) => {
      btn.addEventListener('click', () => {
        stop();
        activeDrillId = btn.getAttribute('data-drill') || activeDrillId;
        bpm = getDrill().defaultBpm;
        render();
        onStatus(`Ejercicio de Bajo: ${getDrill().name}`);
      });
    });

    stage.querySelector<HTMLInputElement>('.js-bm-bpm')?.addEventListener('input', (e) => {
      bpm = parseInt((e.target as HTMLInputElement).value, 10) || 84;
      const lbl = stage.querySelector<HTMLElement>('.js-bm-bpm-val');
      if (lbl) lbl.textContent = String(bpm);
    });

    stage.querySelector<HTMLButtonElement>('.js-bm-play')?.addEventListener('click', () => {
      if (isPlaying) {
        stop();
        onStatus('Ejercicio de motricidad detenido');
      } else {
        audio.stopAll();
        isPlaying = true;
        onStatus(`🎸 Bajo Eléctrico: ${getDrill().name} (${bpm} BPM)`);
        scheduleDrill();
      }
    });

    stage.querySelectorAll<HTMLButtonElement>('.js-bm-step').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.getAttribute('data-step') || '0', 10);
        playStepSound(i);
        const s = getDrill().steps[i];
        onStatus(`Bajo Paso ${i + 1}: ${s.noteLabel} (Dedo ${s.finger}, Mano Der: ${s.rh})`);
      });
    });

    stage.querySelectorAll<HTMLElement>('.js-bm-fret').forEach((cell) => {
      cell.addEventListener('click', () => {
        const midi = parseInt(cell.getAttribute('data-midi') || '40', 10);
        audio.playElectricBass(midi, 0.7, 0, 0.38, 'finger', true);
      });
    });
  };

  render();
}

// ============================================================================
// 5. ARRANGEMENT LAYER MIXER BY GENRE (MUTE / SOLO)
// ============================================================================

function buildArrangementLayerMixerLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  let genreId = ARRANGEMENT_GENRE_MIXES[0].id;
  let isPlaying = false;
  let stepIdx = -1;
  const muted: Record<ArrangementLayerId, boolean> = {
    drums: false,
    bass: false,
    harmony: false,
    melody: false,
  };
  let soloId: ArrangementLayerId | null = null;

  const getMix = () =>
    ARRANGEMENT_GENRE_MIXES.find((g) => g.id === genreId) || ARRANGEMENT_GENRE_MIXES[0];

  const isLayerAudible = (id: ArrangementLayerId): boolean =>
    soloId ? soloId === id : !muted[id];

  const stop = () => {
    isPlaying = false;
    stepIdx = -1;
    audio.stopAll();
    updateStepDots();
  };

  audio.onStop(() => {
    isPlaying = false;
    stepIdx = -1;
    updateStepDots();
  });

  const updateStepDots = () => {
    const playBtn = stage.querySelector<HTMLButtonElement>('.js-am-play');
    if (playBtn) playBtn.textContent = isPlaying ? '⏹ Detener Mezcla' : '▶ Escuchar Arreglo en Loop';
    stage.querySelectorAll<HTMLElement>('.js-am-dot').forEach((dot) => {
      const i = parseInt(dot.getAttribute('data-step') || '-1', 10);
      const on = isPlaying && i === stepIdx;
      dot.style.background = on ? '#10b981' : 'rgba(255,255,255,0.12)';
      dot.style.transform = on ? 'scale(1.25)' : '';
    });
  };

  const triggerLayerNotes = (timbre: string, midis: number[], durSec: number) => {
    midis.forEach((m, i) => {
      if (timbre === 'bass') {
        audio.playElectricBass(m, durSec * 1.35, 0, 0.36, 'finger', false);
      } else if (timbre === 'guitar') {
        audio.playPluckedGuitar(m, durSec * 1.4, i * 0.014, 0.22, false);
      } else if (timbre === 'piano') {
        audio.playAcousticPiano(m, durSec * 1.4, i * 0.01, 0.22, false);
      } else if (timbre === 'quena') {
        audio.playQuenaFlute(m, durSec * 1.35, 0, 0.25, false);
      } else if (timbre === 'strings' || timbre === 'brass' || timbre === 'woodwind') {
        audio.playOrchestralVoice(m, durSec * 1.8, 0, timbre, 0.2);
      }
    });
  };

  const scheduleCycle = () => {
    if (!isPlaying) return;
    const mix = getMix();
    const stepMs = Math.round((60000 / mix.bpm) / 2);
    const durSec = stepMs / 1000;

    for (let s = 0; s < 8; s++) {
      audio.schedule(() => {
        if (!isPlaying) return;
        stepIdx = s;
        updateStepDots();

        if (isLayerAudible('drums')) {
          if (mix.drumGrid.kick[s]) audio.playDrumHit('kick', 0);
          if (mix.drumGrid.snare[s]) audio.playDrumHit('snare', 0);
          if (mix.drumGrid.hihat[s]) audio.playDrumHit('hihat', 0);
        }
        (['bass', 'harmony', 'melody'] as ArrangementLayerId[]).forEach((lid) => {
          if (!isLayerAudible(lid)) return;
          const layer = mix.layers[lid];
          const midis = layer.pattern[s] || [];
          if (midis.length > 0) {
            triggerLayerNotes(layer.timbre, midis, durSec);
          }
        });
      }, s * stepMs);
    }

    audio.schedule(() => {
      if (isPlaying) scheduleCycle();
    }, 8 * stepMs);
  };

  const render = () => {
    const mix = getMix();
    const order: { id: ArrangementLayerId; icon: string; color: string }[] = [
      { id: 'drums', icon: '🥁', color: '#f59e0b' },
      { id: 'bass', icon: '🎸', color: '#38bdf8' },
      { id: 'harmony', icon: '🎹', color: '#a78bfa' },
      { id: 'melody', icon: '🎺', color: '#34d399' },
    ];

    stage.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${ARRANGEMENT_GENRE_MIXES.map(
            (g) => `
            <button type="button" class="btn js-am-genre" data-genre="${g.id}" style="padding:6px 11px; font-size:0.76rem; font-weight:700; background:${g.id === genreId ? '#e5a93c' : '#171e2c'}; color:${g.id === genreId ? '#0b0e14' : '#cbd5e1'}; border:1px solid ${g.id === genreId ? '#e5a93c' : '#334155'};">
              ${g.label}
            </button>
          `
          ).join('')}
        </div>
        <button type="button" class="btn btn-primary js-am-play">${isPlaying ? '⏹ Detener Mezcla' : '▶ Escuchar Arreglo en Loop'}</button>
      </div>

      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; padding:8px 12px; border-radius:8px; background:rgba(16,185,129,0.08); border-left:3px solid #10b981; margin-bottom:10px; font-size:0.8rem; color:#d1fae5;">
        <span><strong>🎛️ Lección de Arreglo (${mix.keyLabel}):</strong> ${mix.maskingLesson}</span>
        <div style="display:flex; gap:5px; align-items:center;">
          ${Array.from({ length: 8 }, (_, i) => `<span class="js-am-dot" data-step="${i}" style="width:10px; height:10px; border-radius:999px; background:rgba(255,255,255,0.14); transition:all 0.1s;"></span>`).join('')}
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:8px;">
        ${order
          .map((o) => {
            const l = mix.layers[o.id];
            const audible = isLayerAudible(o.id);
            const isSolo = soloId === o.id;
            return `
            <div style="padding:11px; border-radius:10px; background:${audible ? 'rgba(15,23,42,0.94)' : 'rgba(15,23,42,0.45)'}; border:1.5px solid ${audible ? o.color : 'rgba(255,255,255,0.08)'}; opacity:${audible ? '1' : '0.58'};">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; margin-bottom:5px;">
                <strong style="font-size:0.8rem; color:${o.color}; min-width:0; line-height:1.25;">${o.icon} ${l.name}</strong>
                <div style="display:flex; gap:4px; flex-shrink:0;">
                  <button type="button" class="btn js-am-mute" data-layer="${o.id}" style="padding:3px 7px; font-size:0.7rem; font-weight:800; white-space:nowrap; flex-shrink:0; background:${!muted[o.id] ? 'rgba(16,185,129,0.18)' : 'rgba(244,63,94,0.22)'}; color:${!muted[o.id] ? '#6ee7b7' : '#fda4af'}; border:1px solid ${!muted[o.id] ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.45)'};">
                    ${muted[o.id] ? 'MUTE' : '🔊 ON'}
                  </button>
                  <button type="button" class="btn js-am-solo" data-layer="${o.id}" style="padding:3px 7px; font-size:0.7rem; font-weight:800; white-space:nowrap; flex-shrink:0; background:${isSolo ? '#e5a93c' : '#171e2c'}; color:${isSolo ? '#0b0e14' : '#cbd5e1'}; border:1px solid ${isSolo ? '#e5a93c' : '#334155'};">
                    S
                  </button>
                </div>
              </div>
              <div style="font-size:0.7rem; font-family:monospace; color:#fbbf24; margin-bottom:3px;">Banda: ${l.freqZone}</div>
              <div style="font-size:0.75rem; color:#cbd5e1;">${l.roleCue}</div>
            </div>
          `;
          })
          .join('')}
      </div>
    `;

    stage.querySelectorAll<HTMLButtonElement>('.js-am-genre').forEach((btn) => {
      btn.addEventListener('click', () => {
        const wasPlaying = isPlaying;
        stop();
        genreId = btn.getAttribute('data-genre') || genreId;
        render();
        onStatus(`Género seleccionado: ${getMix().label}`);
        if (wasPlaying) {
          isPlaying = true;
          scheduleCycle();
        }
      });
    });

    stage.querySelector<HTMLButtonElement>('.js-am-play')?.addEventListener('click', () => {
      if (isPlaying) {
        stop();
        onStatus('Mezclador de arreglos detenido');
      } else {
        audio.stopAll();
        isPlaying = true;
        onStatus(`🎛️ Mezclador en vivo: ${getMix().label}`);
        scheduleCycle();
      }
    });

    stage.querySelectorAll<HTMLButtonElement>('.js-am-mute').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lid = btn.getAttribute('data-layer') as ArrangementLayerId;
        soloId = null;
        muted[lid] = !muted[lid];
        render();
      });
    });

    stage.querySelectorAll<HTMLButtonElement>('.js-am-solo').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lid = btn.getAttribute('data-layer') as ArrangementLayerId;
        soloId = soloId === lid ? null : lid;
        render();
      });
    });
  };

  render();
}

// ============================================================================
// 6. ORCHESTRAL TIMBRES, TRANSPOSITION & OPEN/CLOSED VOICING LAB
// ============================================================================

function buildOrchestralTimbreLab(
  stage: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  let activeFamilyId: 'strings' | 'brass' | 'woodwind' | 'andino' = 'strings';
  let concertPitchMidi = 60; // C4

  const getFamily = () =>
    ORCHESTRAL_SECTION_RANGES.find((f) => f.id === activeFamilyId) || ORCHESTRAL_SECTION_RANGES[0];

  const playVoicing = (midis: number[], label: string) => {
    audio.stopAll();
    const fam = getFamily();
    midis.forEach((m, i) => {
      if (fam.id === 'andino') {
        audio.playQuenaFlute(m, 1.45, i * 0.03, 0.24, false);
      } else {
        audio.playOrchestralVoice(m, 1.55, i * 0.02, fam.id, 0.2);
      }
    });
    onStatus(`🎻 ${fam.name} — ${label}`);
  };

  const render = () => {
    const fam = getFamily();
    const writtenMidi = concertPitchMidi + fam.concertToWrittenSemis;
    const concertName = `${NOTE_NAMES[concertPitchMidi % 12]}${Math.floor(concertPitchMidi / 12) - 1}`;
    const writtenName = `${NOTE_NAMES[writtenMidi % 12]}${Math.floor(writtenMidi / 12) - 1}`;

    stage.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
        ${ORCHESTRAL_SECTION_RANGES.map(
          (f) => `
          <button type="button" class="btn js-ot-fam" data-fam="${f.id}" style="padding:6px 12px; font-size:0.78rem; font-weight:700; background:${f.id === activeFamilyId ? '#e5a93c' : '#171e2c'}; color:${f.id === activeFamilyId ? '#0b0e14' : '#cbd5e1'}; border:1px solid ${f.id === activeFamilyId ? '#e5a93c' : '#334155'};">
            ${f.name.split('(')[0].trim()}
          </button>
        `
        ).join('')}
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px;">
        <div style="padding:12px; border-radius:10px; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1);">
          <div style="font-size:0.84rem; font-weight:800; color:#f3c874; margin-bottom:4px;">${fam.name}</div>
          <div style="font-size:0.75rem; color:#7dd3fc; margin-bottom:6px;">Tesituras clave: ${fam.instruments}</div>
          <p style="font-size:0.78rem; color:#cbd5e1; margin:0 0 10px;"><strong>Regla de Oro:</strong> ${fam.goldenRule}</p>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            <button type="button" class="btn js-ot-closed" style="background:rgba(56,189,248,0.18); color:#7dd3fc; border:1px solid rgba(56,189,248,0.45);">
              🔊 Escuchar Voicing Cerrado
            </button>
            <button type="button" class="btn btn-primary js-ot-open">
              🔊 Escuchar Voicing Abierto / Drop 2
            </button>
          </div>
        </div>

        <div style="padding:12px; border-radius:10px; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1);">
          <div style="font-size:0.8rem; font-weight:800; color:#34d399; margin-bottom:6px;">
            🧭 Calculadora de Transposición Real ↔ Partitura
          </div>
          <p style="font-size:0.75rem; color:#cbd5e1; margin:0 0 8px;">${fam.transpositionNote}</p>
          <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
            <select class="js-ot-pitch" style="background:#0b0e14; color:#f8fafc; border:1px solid #334155; border-radius:7px; padding:6px 10px; font-size:0.8rem; font-weight:700;">
              ${Array.from({ length: 12 }, (_, i) => {
                const m = 60 + i;
                return `<option value="${m}" ${m === concertPitchMidi ? 'selected' : ''}>Suena Real: ${NOTE_NAMES[i]}4</option>`;
              }).join('')}
            </select>
            <span style="font-size:0.82rem; font-weight:800; color:#fde047;">
              ${concertName} real → Escribir <span style="padding:2px 8px; border-radius:5px; background:rgba(245,158,11,0.2); border:1px solid #f59e0b;">${writtenName}</span>
            </span>
            <button type="button" class="btn js-ot-play-note" style="padding:5px 10px; font-size:0.75rem; background:rgba(16,185,129,0.2); color:#6ee7b7; border:1px solid #10b981;">
              ▶ Oír ${concertName}
            </button>
          </div>
        </div>
      </div>
    `;

    stage.querySelectorAll<HTMLButtonElement>('.js-ot-fam').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFamilyId = btn.getAttribute('data-fam') as 'strings' | 'brass' | 'woodwind' | 'andino';
        render();
        playVoicing(getFamily().openVoicing, 'Voicing Abierto / Drop 2');
      });
    });

    stage.querySelector<HTMLButtonElement>('.js-ot-closed')?.addEventListener('click', () => {
      playVoicing(getFamily().closedVoicing, 'Voicing Cerrado (Compacto)');
    });

    stage.querySelector<HTMLButtonElement>('.js-ot-open')?.addEventListener('click', () => {
      playVoicing(getFamily().openVoicing, 'Voicing Abierto / Drop 2 (Espacioso)');
    });

    stage.querySelector<HTMLSelectElement>('.js-ot-pitch')?.addEventListener('change', (e) => {
      concertPitchMidi = parseInt((e.target as HTMLSelectElement).value, 10) || 60;
      render();
    });

    stage.querySelector<HTMLButtonElement>('.js-ot-play-note')?.addEventListener('click', () => {
      playVoicing([concertPitchMidi], `Nota real ${concertName} (Escrita: ${writtenName})`);
    });
  };

  render();
}

// ============================================================================
// 7. GUIDED INTERACTIVE HARMONY CHALLENGES (PIANO | GUITARRA | BAJO)
// ============================================================================

function buildHarmonyGuidedLab(
  stage: HTMLElement,
  article: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  const scope = article.getAttribute('data-scope') || 'h-triadas';
  const challenges = HARMONY_GUIDED_CHALLENGES.filter((c) => c.sectionScope === scope);
  const list = challenges.length > 0 ? challenges : HARMONY_GUIDED_CHALLENGES.slice(0, 3);

  let idx = 0;
  let surface: ExpansionInstrumentSurface = 'piano';
  let feedbackState: { type: 'idle' | 'ok' | 'hint' | 'err'; text: string } = {
    type: 'idle',
    text: '',
  };
  const solvedIds = new Set<string>();

  const getChallenge = () => list[idx] || list[0];

  const playChordOnSurface = (midis: number[]) => {
    audio.stopAll();
    if (surface === 'bass') {
      midis.forEach((m, i) => {
        audio.playElectricBass(m >= 55 ? m - 12 : m, 0.72, i * 0.14, 0.36, 'finger', false);
      });
    } else if (surface === 'guitar') {
      audio.strumChord(midis, 'guitar', 0, false);
    } else {
      audio.strumChord(midis, 'piano', 0, false);
    }
  };

  const playSingleNoteOnSurface = (midi: number) => {
    if (surface === 'bass') {
      audio.playElectricBass(midi, 0.65, 0, 0.38, 'finger', true);
    } else if (surface === 'guitar') {
      audio.playPluckedGuitar(midi, 0.85, 0, 0.28, true);
    } else {
      audio.playAcousticPiano(midi, 0.85, 0, 0.26, true);
    }
  };

  const renderSurfaceWidget = (ch: (typeof list)[number]): string => {
    if (ch.mechanic === 'complete-cadence' && ch.cadenceOptions) {
      return `
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px; align-items:center;">
          ${(ch.cadenceSetupChords || [])
            .map(
              (c, i) => `
            <span style="padding:6px 12px; border-radius:8px; background:rgba(56,189,248,0.14); border:1px solid rgba(56,189,248,0.35); color:#bae6fd; font-weight:800; font-size:0.82rem;">
              ${i + 1}. ${c.label}
            </span>
          `
            )
            .join('<span style="color:#64748b; font-weight:800;">→</span>')}
          <span style="color:#64748b; font-weight:800;">→</span>
          <span style="padding:6px 12px; border-radius:8px; background:rgba(245,158,11,0.2); border:1.5px dashed #f59e0b; color:#fde047; font-weight:900; font-size:0.82rem;">
            ¿ ?
          </span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:8px;">
          ${ch.cadenceOptions
            .map(
              (opt) => `
            <button type="button" class="btn js-hg-cadence-opt" data-opt="${opt.id}" style="padding:11px 12px; text-align:left; font-size:0.82rem; font-weight:800; background:#171e2c; color:#f8fafc; border:1.5px solid rgba(255,255,255,0.14); border-radius:9px;">
              🔊 ${opt.label}
            </button>
          `
            )
            .join('')}
        </div>
      `;
    }

    const basePcs = new Set(ch.initialMidis.map((m) => m % 12));
    const brokenPc = ch.replacedMidi !== undefined ? ch.replacedMidi % 12 : -1;

    if (surface === 'piano') {
      const keys = Array.from({ length: 12 }, (_, pc) => {
        const midi = 60 + pc;
        const isBlack = [1, 3, 6, 8, 10].includes(pc);
        const isBroken = pc === brokenPc;
        const isBase = basePcs.has(pc);
        return `
          <button type="button" class="js-hg-note" data-midi="${midi}" style="cursor:pointer; flex:1; min-width:38px; height:${isBlack ? '64px' : '82px'}; border-radius:0 0 7px 7px; border:1.5px solid ${isBroken ? '#f43f5e' : isBase ? '#38bdf8' : 'rgba(255,255,255,0.18)'}; background:${isBroken ? 'rgba(244,63,94,0.26)' : isBase ? 'rgba(56,189,248,0.24)' : isBlack ? '#0f172a' : '#e2e8f0'}; color:${isBroken || isBase || isBlack ? '#f8fafc' : '#0f172a'}; font-weight:800; font-size:0.74rem; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; padding-bottom:6px;">
            <span>${NOTE_NAMES[pc]}</span>
            ${isBroken ? '<span style="font-size:0.6rem; color:#fda4af;">cambiar</span>' : isBase ? '<span style="font-size:0.6rem; color:#7dd3fc;">base</span>' : ''}
          </button>
        `;
      }).join('');
      return `<div style="display:flex; gap:4px; overflow-x:auto; padding:6px; background:rgba(11,14,20,0.75); border-radius:10px; border:1px solid rgba(255,255,255,0.08);">${keys}</div>`;
    }

    const strings = surface === 'bass' ? BASS_STRINGS : GUITAR_STRINGS.slice(0, 4);
    let neckHtml = `<div style="overflow-x:auto; padding:6px; background:rgba(11,14,20,0.75); border-radius:10px; border:1px solid rgba(255,255,255,0.08);"><div class="fretboard-wrapper">`;
    strings.forEach((st) => {
      neckHtml += `<div class="fretboard-row"><div class="string-label" style="color:${surface === 'bass' ? '#38bdf8' : '#fbbf24'};">${st.label}</div>`;
      for (let f = 0; f <= 5; f++) {
        const midi = st.openMidi + f;
        const pc = midi % 12;
        const isBroken = pc === brokenPc;
        const isBase = basePcs.has(pc);
        neckHtml += `
          <div class="fret-cell js-hg-note" data-midi="${midi}" style="cursor:pointer;">
            <div class="fret-note ${isBroken ? 'root' : isBase ? 'active' : ''}" style="${isBroken ? 'background:#f43f5e; color:#fff;' : ''}">
              ${NOTE_NAMES[pc]}
            </div>
          </div>
        `;
      }
      neckHtml += `</div>`;
    });
    neckHtml += `</div></div>`;
    return neckHtml;
  };

  const render = () => {
    const ch = getChallenge();
    const solved = solvedIds.has(ch.id);

    stage.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="display:flex; gap:5px; flex-wrap:wrap;" role="tablist" aria-label="Selector de instrumento">
          ${(['piano', 'guitar', 'bass'] as ExpansionInstrumentSurface[])
            .map((inst) => {
              const labels: Record<ExpansionInstrumentSurface, string> = {
                piano: '🎹 Piano',
                guitar: '🎸 Guitarra',
                bass: '🎸 Bajo',
              };
              const on = surface === inst;
              return `<button type="button" class="btn js-hg-inst" data-inst="${inst}" style="padding:5px 11px; font-size:0.78rem; font-weight:800; background:${on ? '#e5a93c' : '#171e2c'}; color:${on ? '#0b0e14' : '#cbd5e1'}; border:1px solid ${on ? '#e5a93c' : '#334155'};">${labels[inst]}</button>`;
            })
            .join('')}
        </div>
        <div style="display:flex; gap:6px; align-items:center;">
          ${list
            .map(
              (c, i) => `
            <button type="button" class="btn js-hg-tab" data-idx="${i}" style="padding:4px 10px; font-size:0.74rem; font-weight:800; background:${i === idx ? 'rgba(56,189,248,0.22)' : '#171e2c'}; color:${solvedIds.has(c.id) ? '#6ee7b7' : i === idx ? '#7dd3fc' : '#94a3b8'}; border:1px solid ${i === idx ? '#38bdf8' : '#334155'};">
              ${solvedIds.has(c.id) ? '✓ ' : ''}Reto ${i + 1}
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <div style="padding:12px; border-radius:10px; background:rgba(15,23,42,0.92); border:1px solid rgba(255,255,255,0.1); margin-bottom:10px;">
        <div style="font-size:0.72rem; font-weight:800; color:#fbbf24; text-transform:uppercase; margin-bottom:3px;">${ch.badge}</div>
        <div style="font-size:0.95rem; font-weight:900; color:#f8fafc; margin-bottom:4px;">${ch.title}</div>
        <p style="font-size:0.82rem; color:#e2e8f0; margin:0 0 6px;">${ch.prompt}</p>
        <p style="font-size:0.76rem; color:#94a3b8; margin:0 0 10px;">💡 <em>${ch.analogy}</em></p>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <button type="button" class="btn btn-primary js-hg-listen">🔊 Escuchar ${ch.mechanic === 'complete-cadence' ? 'Progresión Incompleta' : 'Acorde Inicial'}</button>
          <button type="button" class="btn js-hg-hint" style="background:rgba(245,158,11,0.16); color:#fde68a; border:1px solid rgba(245,158,11,0.4);">💡 Pista</button>
          ${solved ? `<button type="button" class="btn js-hg-compare" style="background:rgba(16,185,129,0.2); color:#6ee7b7; border:1px solid #10b981;">✨ Oír Antes → Después</button>` : ''}
        </div>
      </div>

      ${renderSurfaceWidget(ch)}

      ${
        feedbackState.type !== 'idle'
          ? `<div style="margin-top:10px; padding:10px 12px; border-radius:9px; font-size:0.82rem; font-weight:600; background:${
              feedbackState.type === 'ok'
                ? 'rgba(16,185,129,0.16)'
                : feedbackState.type === 'hint'
                  ? 'rgba(245,158,11,0.16)'
                  : 'rgba(244,63,94,0.16)'
            }; border:1px solid ${
              feedbackState.type === 'ok'
                ? '#10b981'
                : feedbackState.type === 'hint'
                  ? '#f59e0b'
                  : '#fb7185'
            }; color:${
              feedbackState.type === 'ok'
                ? '#a7f3d0'
                : feedbackState.type === 'hint'
                  ? '#fde68a'
                  : '#fecdd3'
            };">
            ${feedbackState.text}
          </div>`
          : ''
      }
    `;

    stage.querySelectorAll<HTMLButtonElement>('.js-hg-inst').forEach((btn) => {
      btn.addEventListener('click', () => {
        surface = btn.getAttribute('data-inst') as ExpansionInstrumentSurface;
        render();
      });
    });

    stage.querySelectorAll<HTMLButtonElement>('.js-hg-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        idx = parseInt(btn.getAttribute('data-idx') || '0', 10);
        feedbackState = { type: 'idle', text: '' };
        render();
      });
    });

    stage.querySelector<HTMLButtonElement>('.js-hg-listen')?.addEventListener('click', () => {
      if (ch.mechanic === 'complete-cadence' && ch.cadenceSetupChords) {
        audio.stopAll();
        ch.cadenceSetupChords.forEach((c, i) => {
          audio.schedule(() => {
            playChordOnSurface(c.midis);
          }, i * 750);
        });
        onStatus(`🔊 Escuchando contexto de cadencia (${ch.cadenceSetupChords.map((c) => c.label).join(' → ')})`);
      } else {
        playChordOnSurface(ch.initialMidis);
        onStatus(`🔊 Acorde inicial de: ${ch.title}`);
      }
    });

    stage.querySelector<HTMLButtonElement>('.js-hg-hint')?.addEventListener('click', () => {
      feedbackState = { type: 'hint', text: `💡 Pista: ${ch.hint}` };
      render();
    });

    stage.querySelector<HTMLButtonElement>('.js-hg-compare')?.addEventListener('click', () => {
      audio.stopAll();
      playChordOnSurface(ch.initialMidis);
      audio.schedule(() => {
        playChordOnSurface(ch.resolvedMidis);
      }, 850);
      onStatus('🔊 Comparando: Acorde Inicial → Acorde Transformado');
    });

    stage.querySelectorAll<HTMLElement>('.js-hg-note').forEach((el) => {
      el.addEventListener('click', () => {
        const midi = parseInt(el.getAttribute('data-midi') || '60', 10);
        playSingleNoteOnSurface(midi);
        const res = evaluateHarmonyChallengeAttempt(ch.id, { midi });
        if (res.correct) {
          solvedIds.add(ch.id);
          feedbackState = { type: 'ok', text: `✅ ${res.message}` };
          audio.schedule(() => playChordOnSurface(res.playMidis), 240);
          onStatus(`✅ Reto superado: ${ch.title}`);
        } else {
          feedbackState = { type: 'err', text: `❌ ${res.message}` };
        }
        render();
      });
    });

    stage.querySelectorAll<HTMLButtonElement>('.js-hg-cadence-opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const optionId = btn.getAttribute('data-opt') || '';
        const res = evaluateHarmonyChallengeAttempt(ch.id, { optionId });
        playChordOnSurface(res.playMidis);
        if (res.correct) {
          solvedIds.add(ch.id);
          feedbackState = { type: 'ok', text: `✅ ${res.message}` };
          onStatus(`✅ Cadencia completada: ${ch.title}`);
        } else {
          feedbackState = { type: 'err', text: `❌ ${res.message}` };
        }
        render();
      });
    });
  };

  render();
}

// ============================================================================
// 8. DELIBERATE PRACTICE (CHUNKING), ERGONOMICS & BAND JAM SIMULATOR LAB
// ============================================================================

function buildPracticeDeliberateLab(
  stage: HTMLElement,
  article: HTMLElement,
  audio: MusicAudioEngine,
  onStatus: (msg: string) => void
): void {
  let activeTab: 'chunking' | 'band' =
    article.getAttribute('data-preset') === 'band' ? 'band' : 'chunking';
  let targetBpm = 120;
  let activePhaseIdx = 0;
  let cleanStreak = 0;
  let clickActive = false;

  const stopClick = () => {
    clickActive = false;
    audio.stopAll();
    const btn = stage.querySelector<HTMLButtonElement>('.js-pd-click');
    if (btn) btn.textContent = '▶ Metrónomo de esta Fase';
  };

  audio.onStop(() => {
    clickActive = false;
    const btn = stage.querySelector<HTMLButtonElement>('.js-pd-click');
    if (btn) btn.textContent = '▶ Metrónomo de esta Fase';
  });

  const runMetronome = (bpm: number) => {
    if (!clickActive) return;
    const beatMs = Math.round(60000 / bpm);
    for (let i = 0; i < 4; i++) {
      audio.schedule(() => {
        if (!clickActive) return;
        audio.playDrumHit(i === 0 ? 'clap' : 'hihat', 0);
      }, i * beatMs);
    }
    audio.schedule(() => {
      if (clickActive) runMetronome(bpm);
    }, 4 * beatMs);
  };

  const render = () => {
    const ladder = buildDeliberateChunkingLadder(targetBpm);
    const currentPhase = ladder[activePhaseIdx] || ladder[0];

    stage.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
        <button type="button" class="btn js-pd-tab" data-tab="chunking" style="padding:6px 12px; font-size:0.78rem; font-weight:800; background:${activeTab === 'chunking' ? '#e5a93c' : '#171e2c'}; color:${activeTab === 'chunking' ? '#0b0e14' : '#cbd5e1'}; border:1px solid ${activeTab === 'chunking' ? '#e5a93c' : '#334155'};">
          🎯 Escalera de Práctica Deliberada (Chunking)
        </button>
        <button type="button" class="btn js-pd-tab" data-tab="band" style="padding:6px 12px; font-size:0.78rem; font-weight:800; background:${activeTab === 'band' ? '#e5a93c' : '#171e2c'}; color:${activeTab === 'band' ? '#0b0e14' : '#cbd5e1'}; border:1px solid ${activeTab === 'band' ? '#e5a93c' : '#334155'};">
          🤝 Simulador de Dinámica y Señales en Banda
        </button>
      </div>

      ${
        activeTab === 'chunking'
          ? `
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:space-between; margin-bottom:10px;">
          <div style="display:flex; gap:8px; align-items:center;">
            <label style="font-size:0.78rem; font-weight:700; color:#cbd5e1;">Meta de la canción (BPM):</label>
            <input type="number" class="js-pd-bpm" min="60" max="200" value="${targetBpm}" style="width:82px; background:#0f172a; color:#fbbf24; border:1px solid #38bdf8; border-radius:7px; padding:5px 8px; font-weight:800;">
          </div>
          <button type="button" class="btn btn-primary js-pd-click">${clickActive ? '⏹ Detener Metrónomo' : `▶ Metrónomo de esta Fase (${currentPhase.bpm} BPM)`}</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(175px, 1fr)); gap:8px; margin-bottom:12px;">
          ${ladder
            .map(
              (step, i) => `
            <button type="button" class="js-pd-phase" data-idx="${i}" style="cursor:pointer; text-align:left; padding:10px; border-radius:9px; background:${i === activePhaseIdx ? 'rgba(16,185,129,0.16)' : 'rgba(15,23,42,0.85)'}; border:1.5px solid ${i === activePhaseIdx ? '#10b981' : i < activePhaseIdx ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'};">
              <div style="font-size:1.05rem; font-weight:900; color:${i === activePhaseIdx ? '#6ee7b7' : '#f8fafc'};">${step.bpm} BPM ${i < activePhaseIdx ? '✓' : ''}</div>
              <div style="font-size:0.73rem; color:#cbd5e1; margin-top:3px;">${step.label}</div>
            </button>
          `
            )
            .join('')}
        </div>

        <div style="padding:12px; border-radius:10px; background:rgba(15,23,42,0.92); border:1px solid rgba(56,189,248,0.35); display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px;">
          <div>
            <div style="font-size:0.84rem; font-weight:800; color:#7dd3fc;">Regla de 3 Veces Seguidas Sin Tensión (${cleanStreak}/3)</div>
            <div style="font-size:0.76rem; color:#cbd5e1;">Solo subes al siguiente escalón cuando encadenas 3 repeticiones limpias del fragmento difícil (chunk de 2 compases).</div>
          </div>
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn js-pd-hit" style="background:rgba(16,185,129,0.22); color:#6ee7b7; border:1px solid #10b981; font-weight:800;">✓ Limpia (+1)</button>
            <button type="button" class="btn js-pd-miss" style="background:rgba(244,63,94,0.2); color:#fda4af; border:1px solid #fb7185; font-weight:800;">✕ Tensión / Error (Reiniciar)</button>
          </div>
        </div>
      `
          : `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:8px;">
          <div style="padding:11px; border-radius:9px; background:rgba(15,23,42,0.9); border:1px solid rgba(56,189,248,0.3);">
            <strong style="color:#7dd3fc; font-size:0.83rem;">1. Count-In Profesional (Entrada Limpia)</strong>
            <p style="font-size:0.75rem; color:#cbd5e1; margin:5px 0 8px;">El baterista marca 4 golpes claros con las baquetas mirando a todos para fijar el tempo exacto antes del compás 1.</p>
            <button type="button" class="btn btn-primary js-band-cue" data-cue="countin" style="font-size:0.75rem;">🔊 Oír Count-In + Entrada</button>
          </div>
          <div style="padding:11px; border-radius:9px; background:rgba(15,23,42,0.9); border:1px solid rgba(16,185,129,0.3);">
            <strong style="color:#6ee7b7; font-size:0.83rem;">2. Bajar Dinámica para Solo (Señal de Mano Abajo)</strong>
            <p style="font-size:0.75rem; color:#cbd5e1; margin:5px 0 8px;">Batería pasa a rimshot/hi-hat cerrado, guitarra toca notas largas suaves y deja espacio para que respire el solista o cantante.</p>
            <button type="button" class="btn btn-primary js-band-cue" data-cue="dynamics" style="font-size:0.75rem;">🔊 Oír Fuerte → Piano (p)</button>
          </div>
          <div style="padding:11px; border-radius:9px; background:rgba(15,23,42,0.9); border:1px solid rgba(245,158,11,0.3);">
            <strong style="color:#fde68a; font-size:0.83rem;">3. Final en Banda (Señal Visual de Corte)</strong>
            <p style="font-size:0.75rem; color:#cbd5e1; margin:5px 0 8px;">Contacto visual + levantar mástil/baquetas y bajarlos juntos en el tiempo 1 para cortar el acorde final en un unísono profesional.</p>
            <button type="button" class="btn btn-primary js-band-cue" data-cue="ending" style="font-size:0.75rem;">🔊 Oír Corte Final (Trash Ending)</button>
          </div>
        </div>
      `
      }
    `;

    stage.querySelectorAll<HTMLButtonElement>('.js-pd-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        stopClick();
        activeTab = btn.getAttribute('data-tab') as 'chunking' | 'band';
        render();
      });
    });

    stage.querySelector<HTMLInputElement>('.js-pd-bpm')?.addEventListener('change', (e) => {
      targetBpm = Math.max(60, Math.min(200, parseInt((e.target as HTMLInputElement).value, 10) || 120));
      stopClick();
      render();
    });

    stage.querySelector<HTMLButtonElement>('.js-pd-click')?.addEventListener('click', () => {
      if (clickActive) {
        stopClick();
      } else {
        audio.stopAll();
        clickActive = true;
        render();
        runMetronome(currentPhase.bpm);
        onStatus(`Metrónomo Fase ${activePhaseIdx + 1}: ${currentPhase.bpm} BPM`);
      }
    });

    stage.querySelectorAll<HTMLButtonElement>('.js-pd-phase').forEach((btn) => {
      btn.addEventListener('click', () => {
        stopClick();
        activePhaseIdx = parseInt(btn.getAttribute('data-idx') || '0', 10);
        cleanStreak = 0;
        render();
      });
    });

    stage.querySelector<HTMLButtonElement>('.js-pd-hit')?.addEventListener('click', () => {
      cleanStreak++;
      if (cleanStreak >= 3 && activePhaseIdx < ladder.length - 1) {
        activePhaseIdx++;
        cleanStreak = 0;
        audio.playAcousticPiano(72, 0.4, 0, 0.25, true);
        audio.playAcousticPiano(76, 0.5, 0.12, 0.25, false);
        onStatus(`✅ ¡3/3 limpias! Subes a ${ladder[activePhaseIdx].bpm} BPM`);
      } else if (cleanStreak >= 3) {
        cleanStreak = 3;
        audio.strumChord([60, 64, 67, 72], 'piano', 0, true);
        onStatus(`🏆 ¡Pasaje dominado al 100% (${targetBpm} BPM) sin tensión!`);
      } else {
        audio.playAcousticPiano(67, 0.28, 0, 0.22, true);
        onStatus(`✓ Repetición limpia ${cleanStreak}/3 a ${currentPhase.bpm} BPM`);
      }
      render();
    });

    stage.querySelector<HTMLButtonElement>('.js-pd-miss')?.addEventListener('click', () => {
      cleanStreak = 0;
      audio.playDrumHit('ghost', 0);
      onStatus('Sin frustración: respira, suelta hombros y repite despacio (0/3).');
      render();
    });

    stage.querySelectorAll<HTMLButtonElement>('.js-band-cue').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cue = btn.getAttribute('data-cue');
        audio.stopAll();
        if (cue === 'countin') {
          [0, 1, 2, 3].forEach((i) => audio.playDrumHit('clap', i * 0.42));
          audio.schedule(() => {
            audio.playDrumHit('crash', 0);
            audio.playDrumHit('kick', 0);
            audio.playElectricBass(36, 1.1, 0, 0.38, 'finger', false);
            audio.strumChord([48, 55, 60, 64], 'guitar', 0, false);
          }, 4 * 420);
          onStatus('🥁 Count-In (1–2–3–4) → Entrada sincronizada de toda la banda en Do');
        } else if (cue === 'dynamics') {
          audio.playDrumHit('kick', 0);
          audio.playDrumHit('crash', 0);
          audio.strumChord([48, 52, 55, 60], 'guitar', 0, false);
          audio.schedule(() => {
            audio.playDrumHit('hihat', 0);
            audio.playElectricBass(45, 0.9, 0, 0.24, 'finger', false);
            audio.playAcousticPiano(64, 0.9, 0, 0.16, false);
          }, 900);
          onStatus('🎚️ Contraste dinámico: Estribillo Forte (f) → Bajada a Piano (p) para solo');
        } else {
          [0, 1, 2].forEach((i) => audio.playDrumHit('snare', i * 0.16));
          audio.schedule(() => {
            audio.playDrumHit('crash', 0);
            audio.playDrumHit('kick', 0);
            audio.playElectricBass(36, 0.55, 0, 0.4, 'finger', false);
            audio.strumChord([48, 55, 60, 64, 67], 'guitar', 0, false);
          }, 560);
          onStatus('🎬 Señal visual de corte: Redoble → Golpe final unísono limpio');
        }
      });
    });
  };

  render();
}
