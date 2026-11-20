import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzePedalInterval,
  analyzeSpanishLyricLine,
  applyEnharmonicGoldenRule,
  assignGuitarChordFingers,
  BASS_TRAINING_BLOCKS,
  buildChordMemorySequence,
  buildStructuredVocalTrainingSeries,
  buildScaleFretboardPath,
  classifyVocalRangeDetailed,
  computeChordNeckState,
  convertProgressionToNashville,
  createPitchAcuityRound,
  CHORD_DIAGRAM_CATALOG,
  CHORD_MEMORY_LIBRARY,
  DRUM_LIMB_META,
  DRUM_TRAINING_BLOCKS,
  evaluateChordMemoryAnswer,
  evaluateGapClickTiming,
  GUITAR_TRAINING_BLOCKS,
  harmonizeMelodyVoices,
  identifyGuitarChordFromFrets,
  reduceLatchGlowState,
  renderTopViewDrumKitSvg,
  resolvePlayableChordVoicing,
  verifySimonStep,
} from './music-games-logic';

test('E2 to D5 vocal range is accurately classified as Extended Range / Baritenor (34 semitones)', () => {
  const diag = classifyVocalRangeDetailed(40, 74, 'mid'); // E2 = 40, D5 = 74
  assert.equal(diag.lowName, 'E2');
  assert.equal(diag.highName, 'D5');
  assert.equal(diag.semitones, 34);
  assert.equal(diag.isExtendedRange, true);
  assert.ok(diag.primaryClassification.includes('Baritenor'));
  assert.equal(diag.zones.length, 4);
});

test('E2 to D5 with high comfort zone highlights Tenor with low extension', () => {
  const diag = classifyVocalRangeDetailed(40, 74, 'high');
  assert.ok(diag.primaryClassification.includes('Tenor de Rango Extendido'));
});

test('Pedal C interval analysis identifies #4 Lydian and 5th Perfect consonance', () => {
  const lydian = analyzePedalInterval(66, 60); // F#4 over C4
  assert.equal(lydian.semitonesFromPedal, 6);
  assert.ok(lydian.modalFlavor.includes('Lidio'));

  const fifth = analyzePedalInterval(67, 60); // G4 over C4
  assert.equal(fifth.semitonesFromPedal, 7);
  assert.equal(fifth.consonanceLevel, 'Reposo Absoluto');
});

test('Spanish lyric meter analyzer counts syllables, sinalefas, and final stress adjustment', () => {
  // "Canto al sol de mi tierra" -> Can-to (2) + al (1) + sol (1) + de (1) + mi (1) + tie-rra (2) = 8 grammatical
  // Sinalefa between "Canto" (ends vowel o) and "al" (starts vowel a) -> -1 = 7 metric syllables
  const line1 = analyzeSpanishLyricLine('Canto al sol de mi tierra');
  assert.equal(line1.grammaticalSyllables, 8);
  assert.equal(line1.sinalefas, 1);
  assert.equal(line1.metricSyllables, 7);

  // Aguda ending ("corazón") adds +1 metric syllable
  const line2 = analyzeSpanishLyricLine('vibra mi corazón');
  assert.equal(line2.stressType, 'Aguda (+1)');
  assert.equal(line2.metricSyllables, line2.grammaticalSyllables + 1);
});

test('Pitch acuity generator creates accurate frequency ratios for semitones, tones, and microtones', () => {
  const unison = createPitchAcuityRound('basic', 0);
  assert.equal(unison.correctCategory, 'same');
  assert.equal(unison.baseHz, unison.secondHz);

  const semiUp = createPitchAcuityRound('basic', 1);
  assert.equal(semiUp.correctCategory, 'semitone_up');
  assert.ok(semiUp.secondHz > semiUp.baseHz);

  const microSharp = createPitchAcuityRound('microtonal', 1);
  assert.equal(microSharp.correctCategory, 'micro_sharp');
  assert.equal(microSharp.deltaSemitones, 0.25);
});

test('Simon pattern step verifier tracks progression and detects mistakes', () => {
  const seq = [60, 64, 67];
  const s1 = verifySimonStep(seq, 0, 60);
  assert.equal(s1.status, 'continue');
  const s2 = verifySimonStep(seq, 1, 64);
  assert.equal(s2.status, 'continue');
  const s3 = verifySimonStep(seq, 2, 67);
  assert.equal(s3.status, 'level_complete');

  const wrong = verifySimonStep(seq, 1, 62);
  assert.equal(wrong.status, 'wrong');
  assert.equal(wrong.expectedMidi, 64);
});

test('Enharmonic Golden Rule spells F major with Bb (not A#) and C# minor cleanly', () => {
  const fMaj = applyEnharmonicGoldenRule(5); // F major
  assert.deepEqual(fMaj.notes, ['F', 'G', 'A', 'Bb', 'C', 'D', 'E']);

  const fSharpMaj = applyEnharmonicGoldenRule(6, [0, 2, 4, 5, 7, 9, 11], false); // F# major
  assert.deepEqual(fSharpMaj.notes, ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#']);

  const dbMaj = applyEnharmonicGoldenRule(1, [0, 2, 4, 5, 7, 9, 11], true); // Db major
  assert.deepEqual(dbMaj.notes, ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C']);
});

test('Nashville Number System converter translates C-Am-F-G7 and transposes cleanly to G', () => {
  const out = convertProgressionToNashville(
    0, // Key of C
    [
      { rootPc: 0, quality: 'maj' },
      { rootPc: 9, quality: 'min' },
      { rootPc: 5, quality: 'maj' },
      { rootPc: 7, quality: 'dom7' },
    ],
    7 // Transpose to G
  );
  assert.deepEqual(out.map((o) => o.nashville), ['1', '6m', '4', '57']);
  assert.deepEqual(out.map((o) => o.transposedSymbol), ['G', 'Em', 'C', 'D7']);
});

test('2, 3, and 4-voice diatonic harmonizer generates valid ascending voicings and detects parallel 5ths', () => {
  const harm2 = harmonizeMelodyVoices([64, 65, 67], 0, 2); // E4 -> F4 -> G4 in C major
  assert.equal(harm2.length, 3);
  assert.deepEqual(harm2[0].voices, [60, 64]); // C4 + E4 (3rd below)

  const harm3 = harmonizeMelodyVoices([67, 69], 0, 3); // G4 -> A4 in C major closed triad
  assert.equal(harm3[0].voices.length, 3);
  assert.equal(harm3[1].parallelFifthWarning, true); // Parallel closed triads trigger parallel 5th alert

  const harm4 = harmonizeMelodyVoices([72, 74], 0, 4);
  assert.equal(harm4[0].voices.length, 4);
  assert.ok(harm4[0].voices[0] < harm4[0].voices[3]);
});

test('Gap Click timing evaluator classifies pocket, early, late, and off-beat taps', () => {
  const pocket = evaluateGapClickTiming(500, 1012); // +12ms vs beat at 1000ms
  assert.equal(pocket.deltaMs, 12);
  assert.equal(pocket.verdict, 'En el bolsillo (±25 ms)');

  const early = evaluateGapClickTiming(500, 955); // -45ms
  assert.equal(early.deltaMs, -45);
  assert.equal(early.verdict, 'Levemente adelantado');

  const late = evaluateGapClickTiming(500, 1060); // +60ms
  assert.equal(late.deltaMs, 60);
  assert.equal(late.verdict, 'Levemente atrasado');
});

test('buildScaleFretboardPath produces strictly ascending valid 1-fret-per-step paths on guitar and bass', () => {
  const guitarOpen = [64, 59, 55, 50, 45, 40];
  const cMajGuitar = buildScaleFretboardPath(guitarOpen, 0, [0, 2, 4, 5, 7, 9, 11], 12);
  assert.equal(cMajGuitar.length, 8);
  assert.equal(cMajGuitar[0].midi, 48); // C3
  assert.equal(cMajGuitar[7].midi, 60); // C4
  for (let i = 1; i < cMajGuitar.length; i++) {
    assert.ok(cMajGuitar[i].midi > cMajGuitar[i - 1].midi);
    assert.equal(guitarOpen[cMajGuitar[i].sIdx] + cMajGuitar[i].fret, cMajGuitar[i].midi);
  }

  const bassOpen = [43, 38, 33, 28];
  const eMinBass = buildScaleFretboardPath(bassOpen, 4, [0, 2, 3, 5, 7, 8, 10], 12);
  assert.equal(eMinBass.length, 8);
  assert.equal(eMinBass[0].midi, 28); // E1
  assert.equal(eMinBass[0].sIdx, 3);
  assert.equal(eMinBass[0].fret, 0);
});

test('resolvePlayableChordVoicing returns idiomatic single-position guitar chords without duplicate frets', () => {
  const guitarOpen = [64, 59, 55, 50, 45, 40];
  const byString = (voicing: { sIdx: number; fret: number }[]) =>
    Object.fromEntries(voicing.map((v) => [v.sIdx, v.fret]));

  // C Major: 5th string fret 3, 4th fret 2, 3rd fret 0, 2nd fret 1, 1st fret 0
  const cMaj = resolvePlayableChordVoicing([48, 52, 55], guitarOpen, 12);
  const cMap = byString(cMaj);
  assert.equal(cMap[4], 3);
  assert.equal(cMap[3], 2);
  assert.equal(cMap[2], 0);
  assert.equal(cMap[1], 1);
  assert.equal(cMap[5], undefined); // must NOT light 6th string fret 8 duplicate!

  // G Major: 3-2-0-0-0-3
  const gMap = byString(resolvePlayableChordVoicing([43, 47, 50], guitarOpen, 12));
  assert.equal(gMap[5], 3);
  assert.equal(gMap[4], 2);
  assert.equal(gMap[3], 0);
  assert.equal(gMap[2], 0);
  assert.equal(gMap[1], 0);
  assert.equal(gMap[0], 3);

  // D Major: x-x-0-2-3-2
  const dMap = byString(resolvePlayableChordVoicing([50, 54, 57], guitarOpen, 12));
  assert.equal(dMap[3], 0);
  assert.equal(dMap[2], 2);
  assert.equal(dMap[1], 3);
  assert.equal(dMap[0], 2);
  assert.equal(dMap[5], undefined);

  // F Major: 1-3-3-2-1-1
  const fMap = byString(resolvePlayableChordVoicing([41, 45, 48], guitarOpen, 12));
  assert.equal(fMap[5], 1);
  assert.equal(fMap[4], 3);
  assert.equal(fMap[3], 3);
  assert.equal(fMap[2], 2);

  // Cm(maj7) (C Melódica): single compact voicing, max 1 fret per string, covers C Eb G B
  const cmMaj7 = resolvePlayableChordVoicing([48, 51, 55, 59], guitarOpen, 12);
  const uniqueStrings = new Set(cmMaj7.map((v) => v.sIdx));
  assert.equal(uniqueStrings.size, cmMaj7.length);
  const pcs = new Set(cmMaj7.map((v) => v.midi % 12));
  assert.deepEqual([...pcs].sort((a, b) => a - b), [0, 3, 7, 11]);
});

test('reduceLatchGlowState latches single notes vs chords distinctly until next event or Stop', () => {
  let state = reduceLatchGlowState({ kind: 'idle', entries: [] }, { midi: 60, isChord: false });
  assert.equal(state.kind, 'note');
  assert.equal(state.entries.length, 1);
  assert.equal(state.entries[0].midi, 60);

  // Subsequent chord group replaces single note and accumulates notes of the same chordGroup
  state = reduceLatchGlowState(state, { midi: 48, isChord: true, chordGroup: 10 });
  state = reduceLatchGlowState(state, { midi: 52, isChord: true, chordGroup: 10 });
  state = reduceLatchGlowState(state, { midi: 55, isChord: true, chordGroup: 10 });
  assert.equal(state.kind, 'chord');
  assert.deepEqual(state.entries.map((e) => e.midi), [48, 52, 55]);

  // Touching another chord group replaces the older chord group
  state = reduceLatchGlowState(state, { midi: 55, isChord: true, chordGroup: 11 });
  state = reduceLatchGlowState(state, { midi: 59, isChord: true, chordGroup: 11 });
  assert.equal(state.kind, 'chord');
  assert.deepEqual(state.entries.map((e) => e.midi), [55, 59]);

  // Touching a single note replaces the chord with a latched note
  state = reduceLatchGlowState(state, { midi: 64, isChord: false, sIdx: 0, fret: 0 });
  assert.equal(state.kind, 'note');
  assert.equal(state.entries.length, 1);
  assert.equal(state.entries[0].midi, 64);

  // Only null resets to idle
  state = reduceLatchGlowState(state, null);
  assert.equal(state.kind, 'idle');
  assert.equal(state.entries.length, 0);
});

test('computeChordNeckState preserves all scale guides while pinpointing exclusive playable chord frets', () => {
  const guitarOpen = [64, 59, 55, 50, 45, 40];
  const res = computeChordNeckState({
    rootPc: 0,
    chordId: 'maj',
    scaleId: 'major',
    openMidisHighToLow: guitarOpen,
    maxFret: 12,
  });

  assert.equal(res.chordTitle, 'C');
  assert.deepEqual(res.chordNoteNames, ['C', 'E', 'G']);
  assert.deepEqual(res.scalePitchClasses.sort((a, b) => a - b), [0, 2, 4, 5, 7, 9, 11]);
  assert.equal(res.tabSummary, 'x - 3 - 2 - 0 - 1 - 0');
  assert.equal(res.chordPositions.length, 5);
});

test('resolvePlayableChordVoicing resolves idiomatic jazz/extended voicings for ii9-V13-Imaj9-VI7alt', () => {
  const guitarOpen = [64, 59, 55, 50, 45, 40];
  const toTab = (voicing: { sIdx: number; fret: number }[]) => {
    const arr: (number | null)[] = [null, null, null, null, null, null];
    voicing.forEach((v) => {
      arr[5 - v.sIdx] = v.fret;
    });
    return arr.map((f) => (f === null ? 'X' : String(f))).join('-');
  };

  // ii9 (Dm9): [50, 53, 60, 64] -> D, F, C, E all covered cleanly without X-X-0-X-1-0 gap
  const dm9 = resolvePlayableChordVoicing([50, 53, 60, 64], guitarOpen, 12);
  const dm9Pcs = new Set(dm9.map((v) => v.midi % 12));
  assert.deepEqual([...dm9Pcs].sort((a, b) => a - b), [0, 2, 4, 5]);
  assert.equal(toTab(dm9), 'X-5-3-5-5-X');

  // V13 (G13): [43, 53, 59, 64] -> G, B, F, G, B, E (idiomatic open-position 3-2-3-0-0-0 grip)
  const g13 = resolvePlayableChordVoicing([43, 53, 59, 64], guitarOpen, 12);
  const g13Pcs = new Set(g13.map((v) => v.midi % 12));
  assert.deepEqual([...g13Pcs].sort((a, b) => a - b), [4, 5, 7, 11]);
  assert.equal(toTab(g13), '3-2-3-0-0-0');

  // Imaj9 (Cmaj9): [48, 52, 59, 62] -> C, E, B, D, E (idiomatic X-3-2-4-3-0 Cmaj9 grip)
  const cmaj9 = resolvePlayableChordVoicing([48, 52, 59, 62], guitarOpen, 12);
  const cmaj9Pcs = new Set(cmaj9.map((v) => v.midi % 12));
  assert.deepEqual([...cmaj9Pcs].sort((a, b) => a - b), [0, 2, 4, 11]);
  assert.equal(toTab(cmaj9), 'X-3-2-4-3-0');

  // VI7alt (A7b13): [45, 52, 55, 61, 65] -> rooted on A, never X-2-2-2-2-1!
  const a7b13 = resolvePlayableChordVoicing([45, 52, 55, 61, 65], guitarOpen, 12);
  const a7b13Tab = toTab(a7b13);
  assert.notEqual(a7b13Tab, 'X-2-2-2-2-1');
  const lowestVoiced = [...a7b13].sort((a, b) => b.sIdx - a.sIdx)[0];
  assert.equal(lowestVoiced.midi % 12, 9); // Root A
  const a7b13Pcs = new Set(a7b13.map((v) => v.midi % 12));
  assert.ok(a7b13Pcs.has(1) && a7b13Pcs.has(7) && a7b13Pcs.has(5)); // C#, G, F
});

test('reduceLatchGlowState atomically swaps chordBatch without intermediate strum flicker', () => {
  const initial = reduceLatchGlowState({ kind: 'idle', entries: [] }, { midi: 38, isChord: false });
  assert.equal(initial.kind, 'note');

  const dm9Batch = reduceLatchGlowState(initial, {
    midi: 50,
    isChord: true,
    chordGroup: 1,
    chordBatch: [50, 53, 60, 64],
  });
  assert.equal(dm9Batch.kind, 'chord');
  assert.deepEqual(dm9Batch.entries.map((e) => e.midi), [50, 53, 60, 64]);
  assert.ok(dm9Batch.entries.every((e) => e.isChord === true && e.chordBatch === undefined));

  const g13Batch = reduceLatchGlowState(dm9Batch, {
    midi: 43,
    isChord: true,
    chordGroup: 2,
    chordBatch: [43, 53, 59, 64],
  });
  assert.equal(g13Batch.kind, 'chord');
  assert.deepEqual(g13Batch.entries.map((e) => e.midi), [43, 53, 59, 64]);
});

test('assignGuitarChordFingers assigns idiomatic 1-4 left-hand fingers for open, barre, and jazz guitar chords', () => {
  const guitarOpen = [64, 59, 55, 50, 45, 40];
  const bassOpen = [43, 38, 33, 28];

  // Open C Major: x-3-2-0-1-0 -> fingers x-3-2-0-1-0
  const cState = computeChordNeckState({
    rootPc: 0,
    chordId: 'maj',
    scaleId: 'major',
    openMidisHighToLow: guitarOpen,
    maxFret: 12,
  });
  assert.equal(cState.tabSummary, 'x - 3 - 2 - 0 - 1 - 0');
  assert.equal(cState.fingerSummary, 'x - 3 - 2 - 0 - 1 - 0');
  assert.equal(cState.barreFret, null);

  // Barre F Major: 1-3-3-2-1-1 -> barre at fret 1 (finger 1) + 3, 4, 2
  const fState = computeChordNeckState({
    rootPc: 5,
    chordId: 'maj',
    scaleId: 'major',
    openMidisHighToLow: guitarOpen,
    maxFret: 12,
  });
  assert.equal(fState.tabSummary, '1 - 3 - 3 - 2 - 1 - 1');
  assert.equal(fState.fingerSummary, '1 - 3 - 4 - 2 - 1 - 1');
  assert.equal(fState.barreFret, 1);

  // Movable Dm9 shape [50, 53, 60, 64] -> X-5-3-5-5-X -> fingers 2, 1, 3, 4
  const dm9Voicing = resolvePlayableChordVoicing([50, 53, 60, 64], guitarOpen, 12);
  const dm9Fingers = assignGuitarChordFingers(dm9Voicing, true);
  assert.ok(dm9Fingers.positions.every((p) => p.fret === 0 || (p.finger >= 1 && p.finger <= 4)));

  // Bass neck omits guitar finger numbers (finger = 0)
  const bassState = computeChordNeckState({
    rootPc: 0,
    chordId: 'maj',
    scaleId: 'major',
    openMidisHighToLow: bassOpen,
    maxFret: 12,
  });
  assert.ok(bassState.chordFingers.every((p) => p.finger === 0));
});

test('Chord Memory helpers produce non-repeating sequences and track answer streaks cleanly', () => {
  const seq = buildChordMemorySequence('basic', 5, 42);
  assert.equal(seq.length, 5);
  for (let i = 1; i < seq.length; i++) {
    assert.notEqual(seq[i].id, seq[i - 1].id);
  }
  const allSeq = buildChordMemorySequence('all', 6, 99);
  assert.equal(allSeq.length, 6);

  const hit1 = evaluateChordMemoryAnswer('C', 'C', 2);
  assert.equal(hit1.correct, true);
  assert.equal(hit1.nextStreak, 3);

  const miss = evaluateChordMemoryAnswer('Am', 'Em', 3);
  assert.equal(miss.correct, false);
  assert.equal(miss.nextStreak, 0);
});

test('renderTopViewDrumKitSvg renders multiple simultaneous limb hits with limb badges and click targets', () => {
  const svg = renderTopViewDrumKitSvg({
    title: 'Test Kit',
    limbHits: [
      { piece: 'HH', limb: 'R' },
      { piece: 'BD', limb: 'RF' },
      { piece: 'SD', limb: 'L' },
      { piece: 'HHP', limb: 'LF' },
    ],
  });

  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('data-piece="BD"'));
  assert.ok(svg.includes('data-piece="HH"'));
  assert.ok(svg.includes('data-piece="SD"'));
  assert.ok(svg.includes('data-piece="HHP"'));
  assert.ok(svg.includes(`>${DRUM_LIMB_META.R.short}<`));
  assert.ok(svg.includes(`>${DRUM_LIMB_META.L.short}<`));
  assert.ok(svg.includes(`>${DRUM_LIMB_META.RF.short}<`));
  assert.ok(svg.includes(`>${DRUM_LIMB_META.LF.short}<`));
});

test('buildStructuredVocalTrainingSeries is deterministic by level, puts breathing first, scales counts across 4 phases by duration, and covers all vocal skills', () => {
  const levels = [1, 2, 3] as const;
  const expectedCounts = [
    { mins: 10, total: 6, byPhase: [2, 1, 2, 1] },
    { mins: 20, total: 10, byPhase: [3, 3, 2, 2] },
    { mins: 30, total: 12, byPhase: [4, 3, 3, 2] },
  ];

  for (const lv of levels) {
    for (const cfg of expectedCounts) {
      const a = buildStructuredVocalTrainingSeries(lv, cfg.mins);
      const b = buildStructuredVocalTrainingSeries(lv, cfg.mins);

      // Deterministic (not randomized)
      assert.deepEqual(
        a.map((x) => x.id),
        b.map((x) => x.id)
      );
      assert.equal(a.length, cfg.total);

      // Always starts with dedicated breathing exercise(s) before singing
      assert.equal(a[0].phaseOrder, 1);
      assert.equal(a[0].category, 'breathing_support');
      assert.equal(a[0].isBreathingOnly, true);
      assert.ok((a[0].breathSteps?.length ?? 0) >= 2);
      if (cfg.mins >= 20) {
        assert.equal(a[1].category, 'breathing_support');
        assert.equal(a[1].isBreathingOnly, true);
      }

      // Non-decreasing phase order across all 4 phases
      for (let i = 1; i < a.length; i++) {
        assert.ok(a[i].phaseOrder >= a[i - 1].phaseOrder);
      }
      const countsPerPhase = [1, 2, 3, 4].map((p) => a.filter((x) => x.phaseOrder === p).length);
      assert.deepEqual(countsPerPhase, cfg.byPhase);

      // Normalized ratios sum to 1
      const ratioSum = a.reduce((acc, x) => acc + x.ratio, 0);
      assert.ok(Math.abs(ratioSum - 1) < 0.001);

      // Every exercise has complete instructional guidance
      for (const ex of a) {
        assert.equal(ex.level, lv);
        assert.ok(ex.howToSteps.length >= 3);
        assert.ok(ex.postureCue.length > 10);
        assert.ok(ex.syllableCue.length > 5);
        assert.ok(ex.focusTag.length > 4);
      }
    }

    // Full 30-min curriculum for each level explicitly covers every requested vocal skill
    const full30 = buildStructuredVocalTrainingSeries(lv, 30);
    const joinedTagsAndTitles = full30.map((x) => `${x.focusTag} ${x.title}`).join(' ').toLowerCase();
    for (const keyword of [
      'respiraci',
      'calentamiento',
      'vibraci',
      'nasalidad',
      'pecho',
      'cabeza',
      'passaggio',
      'entonaci',
      'afinaci',
      'agilidad',
      'canto',
    ]) {
      assert.ok(joinedTagsAndTitles.includes(keyword), `Missing "${keyword}" in level ${lv}`);
    }
  }
});

test('Guitar, Bass, and Drum training block datasets have valid fingerings, frets, and limb assignments', () => {
  assert.equal(GUITAR_TRAINING_BLOCKS.length, 4);
  for (const blk of GUITAR_TRAINING_BLOCKS) {
    assert.ok(blk.steps.length >= 4);
    for (const st of blk.steps) {
      for (const pos of st.positions) {
        assert.ok(pos.sIdx >= 0 && pos.sIdx <= 5);
        assert.ok(pos.fret >= 0 && pos.fret <= 12);
        assert.ok(pos.finger >= 0 && pos.finger <= 4);
        if (pos.fret > 0) assert.ok(pos.finger >= 1 && pos.finger <= 4);
      }
    }
  }

  assert.equal(BASS_TRAINING_BLOCKS.length, 4);
  for (const blk of BASS_TRAINING_BLOCKS) {
    assert.ok(blk.steps.length >= 4);
    for (const st of blk.steps) {
      assert.ok(st.sIdx >= 0 && st.sIdx <= 3);
      assert.ok(st.fret >= 0 && st.fret <= 12);
    }
  }

  assert.equal(DRUM_TRAINING_BLOCKS.length, 4);
  for (const blk of DRUM_TRAINING_BLOCKS) {
    assert.ok(blk.steps.length === 8);
    for (const st of blk.steps) {
      assert.ok(st.hits.length >= 1);
      for (const h of st.hits) {
        assert.ok(DRUM_LIMB_META[h.limb] !== undefined);
      }
    }
  }
});

test('identifyGuitarChordFromFrets detects James Bond Em(Maj9), Hendrix E7#9, So What Dm11, assigns 1-4 fingers, and flags unplayable 5-finger grips', () => {
  // Correct open James Bond Em(Maj9): 0-2-1-0-0-2 (high-to-low: [2, 0, 0, 1, 2, 0])
  const jbOpen = identifyGuitarChordFromFrets([2, 0, 0, 1, 2, 0]);
  assert.equal(jbOpen.title, 'Em(Maj9)');
  assert.equal(jbOpen.notesText, 'E2 – B2 – D#3 – G3 – B3 – F#4');
  assert.equal(jbOpen.formulaText, '1 – 2/9 – b3/#9 – 5J – 7M');
  assert.equal(jbOpen.tabLowToHigh, '0-2-1-0-0-2');
  assert.equal(jbOpen.fingerLowToHigh, '0-2-1-0-0-3');
  assert.equal(jbOpen.fingersUsed, 3);
  assert.equal(jbOpen.playable, true);

  // Classic Vic Flick James Bond high-register Em(Maj9): 0-10-9-8-7-x (high-to-low: [-1, 7, 8, 9, 10, 0])
  const jbClassic = identifyGuitarChordFromFrets([-1, 7, 8, 9, 10, 0]);
  assert.equal(jbClassic.title, 'Em(Maj9)');
  assert.equal(jbClassic.fingerLowToHigh, '0-4-3-2-1-X');
  assert.equal(jbClassic.fingersUsed, 4);
  assert.equal(jbClassic.playable, true);

  // Old broken 5-finger Esus2 shape ([2, 4, 4, 1, 2, 0] = 0-2-1-4-4-2) MUST be flagged unplayable!
  const brokenOld = identifyGuitarChordFromFrets([2, 4, 4, 1, 2, 0]);
  assert.equal(brokenOld.playable, false);
  assert.equal(brokenOld.fingersUsed, 5);
  assert.ok(brokenOld.warning && brokenOld.warning.includes('5 dedos'));

  // Hendrix Chord E7#9: 0-7-6-7-8-0 (high-to-low: [0, 8, 7, 6, 7, 0])
  const hendrix = identifyGuitarChordFromFrets([0, 8, 7, 6, 7, 0]);
  assert.equal(hendrix.title, 'E7(#9)');
  assert.equal(hendrix.tabLowToHigh, '0-7-6-7-8-0');
  assert.equal(hendrix.fingerLowToHigh, '0-2-1-3-4-0');
  assert.equal(hendrix.fingersUsed, 4);
  assert.equal(hendrix.playable, true);

  // So What Dm11 quartal: x-5-5-5-6-5 (high-to-low: [5, 6, 5, 5, 5, -1])
  const soWhat = identifyGuitarChordFromFrets([5, 6, 5, 5, 5, -1]);
  assert.equal(soWhat.title, 'Dm11');
  assert.equal(soWhat.fingerLowToHigh, 'X-1-1-1-2-1');
  assert.equal(soWhat.barreFret, 5);
  assert.equal(soWhat.playable, true);

  // C9 mini-barre x-3-2-3-3-3 (high-to-low: [3, 3, 3, 2, 3, -1])
  const c9 = identifyGuitarChordFromFrets([3, 3, 3, 2, 3, -1]);
  assert.equal(c9.title, 'C9');
  assert.equal(c9.fingerLowToHigh, 'X-2-1-3-3-3');
  assert.equal(c9.playable, true);
});

test('Full playability audit: every chord in CHORD_DIAGRAM_CATALOG and CHORD_MEMORY_LIBRARY resolves to a playable <=4-finger guitar shape', () => {
  const guitarOpen = [64, 59, 55, 50, 45, 40];

  for (const rootPc of [0, 2, 4, 7, 9]) {
    for (const chord of CHORD_DIAGRAM_CATALOG) {
      const state = computeChordNeckState({
        rootPc,
        chordId: chord.id,
        scaleId: 'none',
        openMidisHighToLow: guitarOpen,
        maxFret: 12,
      });
      const fingerCheck = assignGuitarChordFingers(state.chordPositions, true);
      assert.equal(
        fingerCheck.playable,
        true,
        `Unplayable catalog chord ${state.chordTitle} (${state.tabSummary}): ${fingerCheck.warning}`
      );
      assert.ok(state.chordPositions.length >= 3, `Expected >=3 strings for ${state.chordTitle}`);
    }
  }

  for (const item of CHORD_MEMORY_LIBRARY) {
    const posList = item.fretsLowToHigh
      .map((fret, lowIdx) =>
        fret < 0 ? null : { sIdx: 5 - lowIdx, fret, midi: guitarOpen[5 - lowIdx] + fret }
      )
      .filter((x): x is { sIdx: number; fret: number; midi: number } => x !== null);
    const fingerCheck = assignGuitarChordFingers(posList, true);
    assert.equal(fingerCheck.playable, true, `CHORD_MEMORY_LIBRARY ${item.id} must be playable`);
    item.fingersLowToHigh.forEach((f, lowIdx) => {
      if (f >= 0) {
        const matched = fingerCheck.positions.find((p) => p.sIdx === 5 - lowIdx);
        assert.equal(matched?.finger, f, `Finger mismatch for ${item.id} on string ${6 - lowIdx}`);
      }
    });
  }
});







