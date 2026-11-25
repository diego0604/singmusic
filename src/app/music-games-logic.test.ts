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
  computeAppoggioCyclePhase,
  computeChordNeckState,
  computeEffectiveExplorerInstrument,
  computeGuitarNeckWindow,
  computeVerticalChordBoxData,
  computeVocalPatternStepState,
  convertProgressionToNashville,
  createPitchAcuityRound,
  CHORD_DIAGRAM_CATALOG,
  CHORD_MEMORY_LIBRARY,
  DRUM_LIMB_META,
  DRUM_TRAINING_BLOCKS,
  evaluateChordMemoryAnswer,
  evaluateGapClickTiming,
  getVocalCycleWithRest,
  GUITAR_TRAINING_BLOCKS,
  harmonizeMelodyVoices,
  identifyGuitarChordFromFrets,
  reduceLatchGlowState,
  renderTopViewDrumKitSvg,
  renderVerticalGuitarChordSvg,
  resolvePlayableChordVoicing,
  resolveVisualInstrumentView,
  verifySimonStep,
  analyzeIntervalAndInversion,
  computeCagedGuitarShape,
  computeExtensionPyramid,
  computeNoteExplorerState,
  computePentatonicBoxWindow,
  GREEK_MODES_CATALOG,
  resolveExplorerKind,
  analyzePoeticProsodyDetailed,
  classifySpanishPoeticMeter,
  SONG_FORM_ARCHITECT_TEMPLATES,
  computeSongFormMetrics,
  SPANISH_POETIC_WORD_BANK,
  extractSpanishPoeticRhymeKeys,
  findSpanishRhymes,
  NONLINEAR_POETIC_STRUCTURES,
  generateNonLinearStructure,
  CREATIVE_WRITING_ADVICE_BY_LEVEL,
  pickRandomWritingPromptWords,
  evaluateWritingDraftWithWords,
} from './music-games-logic';
import {
  ACADEMY_LEARNING_PATHS,
  ACADEMY_STAGES,
  MAJOR_SCALE_LADDER_PRESETS,
  RHYTHM_STARTER_PATTERNS,
  TEORIA_PEDAGOGICAL_ORDER,
  assembleAcademyCategoryHtml,
  extractSingleSectionHtml,
  findStageForSection,
  getStageProgress,
  resolveCategoryForSectionId,
  resolveKeySignatureFiveSecondRule,
  splitHtmlSections,
} from './academy-curriculum';
import {
  buildActiveReviewQueue,
  detectLessonFrameworkPhases,
  formatReviewStatusLabel,
  getDueReviews,
  getLessonPracticalMicroChallenge,
  getLessonQuizQuestions,
  getStageGraduationSummary,
  getTotalGraduationsCount,
  scheduleNextReview,
} from './academy-practice';
import {
  analyzeCounterpointMotion,
  COUNTERPOINT_PRESETS,
  generateImprovisationPhrase,
  IMPROVISATION_TRACKS,
  INSTRUMENT_ANATOMY_DATA,
} from './academy-stage3-logic';
import { applyStage1LessonUpgrades } from './academy-lessons';
import {
  auditIntegratorBlueprint,
  buildMidiRollEvents,
  COMPLEX_WORK_SECTIONS,
  computeAdsrEnvelopePoints,
  computeEqCurveDb,
  computeLowPassResponseCurve,
  EQ_PRESETS,
  evaluateMixAndMasterMetrics,
  MIDI_GROOVE_PRESETS,
  SYNTH_PATCH_PRESETS,
} from './academy-stage4-logic';
import { ENCYCLOPEDIA_CONTENT } from './encyclopedia-data';
import { injectTreatiseEnrichmentIntoCategoryHtml } from './treatise-enrichment';
import {
  FUNDAMENTALS_GUIDED_LESSONS,
  FUNDAMENTALS_PIANO_KEYS,
  evaluateFundamentalsKeyTap,
  pickNextEarDrillMidi,
  renderTrebleStaffNoteSvg,
} from './fundamentals-guided-logic';

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
  assert.equal(GUITAR_TRAINING_BLOCKS.length, 8);
  const ratioSum = GUITAR_TRAINING_BLOCKS.reduce((acc, b) => acc + b.ratio, 0);
  assert.ok(Math.abs(ratioSum - 1) < 0.01);
  for (const blk of GUITAR_TRAINING_BLOCKS) {
    assert.ok(blk.steps.length >= 4);
    assert.ok(blk.phaseLabel && blk.phaseLabel.length > 4);
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

test('VisualInstrumentFocus hides piano and focuses Guitar or Bass cleanly', () => {
  const allCfg = resolveVisualInstrumentView('all');
  assert.equal(allCfg.showPiano, true);
  assert.equal(allCfg.neckMode, 'guitar');

  const gtrCfg = resolveVisualInstrumentView('guitar-only');
  assert.equal(gtrCfg.showPiano, false);
  assert.equal(gtrCfg.neckMode, 'guitar');
  assert.equal(gtrCfg.audioTimbre, 'guitar');
  assert.equal(computeEffectiveExplorerInstrument('guitar-only', 'piano'), 'guitar');
  assert.equal(computeEffectiveExplorerInstrument('guitar-only', 'bass'), 'guitar');

  const bassCfg = resolveVisualInstrumentView('bass-only');
  assert.equal(bassCfg.showPiano, false);
  assert.equal(bassCfg.neckMode, 'bass');
  assert.equal(bassCfg.audioTimbre, 'bass');
  assert.equal(computeEffectiveExplorerInstrument('bass-only', 'piano'), 'bass');
  assert.equal(computeEffectiveExplorerInstrument('bass-only', 'guitar'), 'bass');

  assert.equal(computeEffectiveExplorerInstrument('all', 'piano'), 'piano');
});

test('Vocal cycle rest helpers insert breath-recovery pause between breathing cycles, pitched patterns, and Appoggio 4-2-8 timer', () => {
  const baseBreath = [
    { label: 'Inhala 4t', cue: 'Expande costillas', beats: 4, kind: 'inhale' as const },
    { label: 'Suspende 2t', cue: 'Garganta abierta', beats: 2, kind: 'hold' as const },
    { label: 'Exhala "Sss" 8t', cue: 'Hilo constante', beats: 8, kind: 'exhale' as const },
  ];

  // Zero rest keeps original steps
  assert.equal(getVocalCycleWithRest(baseBreath, 0).length, 3);

  // Positive rest appends explicit 'rest' step after exhale, idempotently
  const withRest = getVocalCycleWithRest(baseBreath, 4);
  assert.equal(withRest.length, 4);
  assert.equal(withRest[3].kind, 'rest');
  assert.equal(withRest[3].beats, 4);
  assert.equal(getVocalCycleWithRest(withRest, 4).length, 4);

  // Pitched vocal exercise pattern (5 notes + 3 rest beats = 8-beat cycle)
  const s0 = computeVocalPatternStepState(0, 5, 3);
  assert.deepEqual(s0, { isRest: false, noteIndex: 0, restBeat: 0, restTotal: 3, cycleNumber: 1 });
  const s4 = computeVocalPatternStepState(4, 5, 3);
  assert.deepEqual(s4, { isRest: false, noteIndex: 4, restBeat: 0, restTotal: 3, cycleNumber: 1 });
  const s5 = computeVocalPatternStepState(5, 5, 3);
  assert.deepEqual(s5, { isRest: true, noteIndex: -1, restBeat: 1, restTotal: 3, cycleNumber: 1 });
  const s7 = computeVocalPatternStepState(7, 5, 3);
  assert.deepEqual(s7, { isRest: true, noteIndex: -1, restBeat: 3, restTotal: 3, cycleNumber: 1 });
  const s8 = computeVocalPatternStepState(8, 5, 3);
  assert.deepEqual(s8, { isRest: false, noteIndex: 0, restBeat: 0, restTotal: 3, cycleNumber: 2 });

  // Appoggio 4-2-8 + 4s rest (total 18s cycle)
  assert.equal(computeAppoggioCyclePhase(0, 4).isRest, false);
  assert.equal(computeAppoggioCyclePhase(4, 4).phase.startsWith('2.'), true);
  assert.equal(computeAppoggioCyclePhase(6, 4).phase.startsWith('3.'), true);
  const restStart = computeAppoggioCyclePhase(14, 4);
  assert.equal(restStart.isRest, true);
  assert.equal(restStart.remaining, 4);
  assert.equal(restStart.totalCycleSec, 18);
  assert.ok(restStart.phase.includes('DESCANSO'));
  const wrapBack = computeAppoggioCyclePhase(18, 4);
  assert.equal(wrapBack.isRest, false);
  assert.equal(wrapBack.phase.startsWith('1.'), true);
});

test('computeGuitarNeckWindow computes ergonomic zoomed fret ranges and preserves full 0-12 option', () => {
  const openWin = computeGuitarNeckWindow([0, 1, 2, 3], 'auto', 12);
  assert.deepEqual({ minFret: openWin.minFret, maxFret: openWin.maxFret }, { minFret: 0, maxFret: 5 });

  const highWin = computeGuitarNeckWindow([7, 8, 9, 10], 'auto', 12);
  assert.ok(highWin.minFret >= 5 && highWin.maxFret >= 10 && highWin.fretCount >= 6);

  const allWin = computeGuitarNeckWindow([1, 2, 3], 'all', 12);
  assert.deepEqual({ minFret: allWin.minFret, maxFret: allWin.maxFret, fretCount: allWin.fretCount }, { minFret: 0, maxFret: 12, fretCount: 13 });

  const midWin = computeGuitarNeckWindow([], 'mid', 12);
  assert.deepEqual({ minFret: midWin.minFret, maxFret: midWin.maxFret }, { minFret: 4, maxFret: 9 });
});

test('computeVerticalChordBoxData and renderVerticalGuitarChordSvg capture nut, barre, mutes, and finger numbers cleanly', () => {
  // F barre: 1-3-3-2-1-1
  const fBox = computeVerticalChordBoxData({
    rootPc: 5,
    positions: [
      { sIdx: 5, fret: 1, finger: 1 },
      { sIdx: 4, fret: 3, finger: 3 },
      { sIdx: 3, fret: 3, finger: 4 },
      { sIdx: 2, fret: 2, finger: 2 },
      { sIdx: 1, fret: 1, finger: 1 },
      { sIdx: 0, fret: 1, finger: 1 },
    ],
  });
  assert.equal(fBox.showNut, true);
  assert.equal(fBox.tabSummary, '1-3-3-2-1-1');
  assert.equal(fBox.fingerSummary, '1-3-4-2-1-1');
  assert.ok(fBox.barre !== null && fBox.barre.relRow === 1);

  const svg = renderVerticalGuitarChordSvg(fBox, { title: 'F Mayor' });
  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('F Mayor'));

  // Movable Dm9: X-5-3-5-5-X -> starts above nut with 3fr
  const dm9Box = computeVerticalChordBoxData({
    rootPc: 2,
    positions: [
      { sIdx: 4, fret: 5, finger: 2 },
      { sIdx: 3, fret: 3, finger: 1 },
      { sIdx: 2, fret: 5, finger: 3 },
      { sIdx: 1, fret: 5, finger: 4 },
    ],
  });
  assert.equal(dm9Box.showNut, false);
  assert.equal(dm9Box.startFret, 3);
  assert.equal(dm9Box.strings[0].isMuted, true);
  assert.equal(dm9Box.strings[5].isMuted, true);
});

test('resolveExplorerKind enforces pedagogical progression without leaking scales into Notes or Intervals chapters', () => {
  assert.equal(resolveExplorerKind({ labType: 'fretboard-lab', dataMode: 'notes' }), 'notes');
  assert.equal(resolveExplorerKind({ labType: 'interval-lab', dataMode: 'build' }), 'interval');
  assert.equal(resolveExplorerKind({ labType: 'scale-explorer', dataSet: 'modes' }), 'modes');
  assert.equal(resolveExplorerKind({ labType: 'scale-explorer', dataSet: 'all' }), 'scale');
  assert.equal(resolveExplorerKind({ labType: 'chord-explorer', dataMode: null }), 'chord');
  assert.equal(resolveExplorerKind({ labType: 'fretboard-lab', dataMode: 'chord-window' }), 'chord');
});

test('computeNoteExplorerState filters natural, accidental, chromatic, and single-note octaves cleanly', () => {
  const singleC = computeNoteExplorerState('single', 0);
  assert.deepEqual(singleC.activePcs, [0]);
  assert.ok(singleC.summaryTitle.includes('C'));

  const naturals = computeNoteExplorerState('natural', 0);
  assert.deepEqual(naturals.activePcs, [0, 2, 4, 5, 7, 9, 11]);

  const accidentals = computeNoteExplorerState('accidentals', 0);
  assert.deepEqual(accidentals.activePcs, [1, 3, 6, 8, 10]);

  const chromatic = computeNoteExplorerState('chromatic', 0);
  assert.equal(chromatic.activePcs.length, 12);
});

test('analyzeIntervalAndInversion computes exact target pitch and Ley del 9 / 12 inversion pairs', () => {
  // C (0) + 4 semitones = E (4) 3M <-> 6m (8 semitones)
  const maj3 = analyzeIntervalAndInversion(0, 4);
  assert.equal(maj3.targetPc, 4);
  assert.equal(maj3.shortLabel, '3M');
  assert.equal(maj3.invertedSemitones, 8);
  assert.equal(maj3.invertedShortLabel, '6m (b6)');

  // C (0) + 7 semitones = G (7) 5J <-> 4J (5 semitones)
  const perf5 = analyzeIntervalAndInversion(0, 7);
  assert.equal(perf5.targetPc, 7);
  assert.equal(perf5.shortLabel, '5J');
  assert.equal(perf5.invertedSemitones, 5);
  assert.equal(perf5.invertedShortLabel, '4J');
});

test('GREEK_MODES_CATALOG covers all 7 Greek modes with distinct characteristic offsets', () => {
  assert.equal(GREEK_MODES_CATALOG.length, 7);
  const ids = GREEK_MODES_CATALOG.map((m) => m.id);
  assert.deepEqual(ids, ['major', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'minor', 'locrian']);
  GREEK_MODES_CATALOG.forEach((m) => {
    assert.equal(m.intervals.length, 7);
    assert.ok(m.intervals.includes(m.charOffset), `Characteristic ${m.charOffset} missing in ${m.id}`);
  });
});

test('computeCagedGuitarShape computes playable 1-4 fingerings and neck zoom windows across all 5 CAGED shapes', () => {
  for (const shape of ['C', 'A', 'G', 'E', 'D'] as const) {
    const res = computeCagedGuitarShape(shape, 0, 'maj'); // C Major in all 5 CAGED forms
    assert.ok(res.positions.length >= 4, `Expected >=4 strings for shape ${shape}`);
    assert.ok(res.positions.every((p) => p.fret >= 0 && p.fret <= 15));
    assert.ok(res.positions.every((p) => p.finger >= 0 && p.finger <= 4));
    assert.ok(res.neckWindow.maxFret - res.neckWindow.minFret <= 6);
  }
});

test('computePentatonicBoxWindow and computeExtensionPyramid compute valid guitar boxes and avoid-note alerts', () => {
  for (const boxIdx of [1, 2, 3, 4, 5] as const) {
    const box = computePentatonicBoxWindow(9, boxIdx); // A minor pentatonic boxes 1..5
    assert.equal(box.positions.length, 12);
    assert.ok(box.positions.some((p) => p.isRoot));
    assert.ok(box.neckWindow.maxFret <= 15);
  }

  // C Major degree I with 6 stacked thirds (1-3-5-7-9-11) triggers avoid-note warning (11 vs 3)
  const cmaj11 = computeExtensionPyramid({
    keyRootPc: 0,
    scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
    degreeIndex: 0,
    size: 6,
    stackMode: 'thirds',
  });
  assert.equal(cmaj11.noteNames.length, 6);
  assert.ok(cmaj11.avoidNotesWarning !== null);

  // D Dorian quartal stack (D-G-C-F) produces clean quartal voicing with no b9 clash warning
  const dQuartal = computeExtensionPyramid({
    keyRootPc: 2,
    scaleIntervals: [0, 2, 3, 5, 7, 9, 10],
    degreeIndex: 0,
    size: 4,
    stackMode: 'fourths',
  });
  assert.deepEqual(dQuartal.noteNames, ['D', 'G', 'C', 'F']);
  assert.equal(dQuartal.avoidNotesWarning, null);
});

test('analyzePoeticProsodyDetailed detects sinalefas, poetic meter, anacrusis, and vowel openness', () => {
  const endecas = analyzePoeticProsodyDetailed('Cuando el invierno apague tu calor');
  assert.equal(endecas.sinalefas, 2);
  assert.equal(endecas.metricSyllables, 11);
  assert.ok(endecas.meterName.includes('Endecasílabo'));
  assert.equal(endecas.hasClosedPeakVowel, false);
  assert.ok(endecas.scansionTokens.some((t) => t.text.includes('‿')));

  const octos = analyzePoeticProsodyDetailed('El corazón que late hoy');
  assert.equal(octos.anacrusisSlots[0], 'El');
  assert.ok(octos.scansionTokens.some((t) => t.stressed && /zón/i.test(t.text)));

  const closedVowel = analyzePoeticProsodyDetailed('Solo en silencio sin ti');
  assert.equal(closedVowel.hasClosedPeakVowel, true);

  const alex = classifySpanishPoeticMeter(14);
  assert.ok(alex.meterName.includes('Alejandrino'));
  assert.equal(alex.artCategory, 'Arte Mayor (≥ 9)');
});

test('SONG_FORM_ARCHITECT_TEMPLATES includes non-traditional structures and computes duration & golden-ratio climax', () => {
  assert.ok(SONG_FORM_ARCHITECT_TEMPLATES.some((t) => t.id === 'aaa-strophic'));
  assert.ok(SONG_FORM_ARCHITECT_TEMPLATES.some((t) => t.id === 'through-composed'));
  assert.ok(SONG_FORM_ARCHITECT_TEMPLATES.some((t) => t.id === 'hook-first'));

  const classic = SONG_FORM_ARCHITECT_TEMPLATES.find((t) => t.id === 'pop-classic')!;
  const metrics = computeSongFormMetrics(classic.blocks, 120, 4);
  assert.equal(metrics.totalBars, 68);
  assert.equal(metrics.totalSeconds, 136);
  assert.equal(metrics.formattedDuration, '2:16');
  assert.equal(metrics.isGoldenRatioPeak, true);
});

test('extractSpanishPoeticRhymeKeys and findSpanishRhymes distinguish consonant and assonant rhymes accurately', () => {
  const lunaKeys = extractSpanishPoeticRhymeKeys('luna');
  assert.equal(lunaKeys.consonantKey, 'una');
  assert.equal(lunaKeys.assonantKey, 'u-a');
  assert.equal(lunaKeys.openForHighSinging, false); // stressed U

  const silencioKeys = extractSpanishPoeticRhymeKeys('silencio');
  assert.equal(silencioKeys.consonantKey, 'encio');
  assert.equal(silencioKeys.assonantKey, 'e-o');
  assert.equal(silencioKeys.openForHighSinging, true); // stressed E

  const cancionKeys = extractSpanishPoeticRhymeKeys('canción');
  assert.equal(cancionKeys.consonantKey, 'on');
  assert.equal(cancionKeys.assonantKey, 'o');

  // Check rhyme lookup against dictionary + extra test words
  const lunaRhymes = findSpanishRhymes('luna', ['cuna', 'laguna']);
  assert.ok(lunaRhymes.consonantMatches.includes('cuna'));
  assert.ok(lunaRhymes.consonantMatches.includes('laguna'));
  assert.ok(!lunaRhymes.assonantMatches.includes('cuna'));
  assert.ok(lunaRhymes.assonantMatches.includes('bruma'));
  assert.ok(lunaRhymes.assonantMatches.includes('lluvia'));

  const cancionRhymes = findSpanishRhymes('canción');
  assert.ok(cancionRhymes.consonantMatches.includes('corazón'));
  assert.ok(cancionRhymes.consonantMatches.includes('razón'));
  assert.ok(cancionRhymes.assonantMatches.includes('sol'));
});

test('NONLINEAR_POETIC_STRUCTURES & generateNonLinearStructure provide flujo-conciencia, narrativa-circular and writing skeletons', () => {
  assert.ok(NONLINEAR_POETIC_STRUCTURES.some((s) => s.id === 'flujo-conciencia'));
  assert.ok(NONLINEAR_POETIC_STRUCTURES.some((s) => s.id === 'narrativa-circular'));
  assert.ok(NONLINEAR_POETIC_STRUCTURES.length >= 6);

  const circular = generateNonLinearStructure('narrativa-circular', 0, '3/4 Vals');
  assert.equal(circular.structure.id, 'narrativa-circular');
  assert.equal(circular.tempoFeel, '3/4 Vals');
  assert.ok(circular.skeletonText.includes('Verso Espejo'));

  assert.equal(CREATIVE_WRITING_ADVICE_BY_LEVEL.length, 3);
  assert.deepEqual(
    CREATIVE_WRITING_ADVICE_BY_LEVEL.map((l) => l.id),
    ['principiante', 'intermedio', 'avanzado']
  );
});

test('pickRandomWritingPromptWords picks 2..5 distinct words and evaluateWritingDraftWithWords tracks local word usage & scansion', () => {
  assert.ok(SPANISH_POETIC_WORD_BANK.length >= 120);
  const picked3 = pickRandomWritingPromptWords(3, 42, 'Todas');
  assert.equal(picked3.length, 3);
  assert.equal(new Set(picked3).size, 3);

  const picked5 = pickRandomWritingPromptWords(5, 99, 'Naturaleza y Cosmos');
  assert.equal(picked5.length, 5);
  assert.equal(new Set(picked5).size, 5);

  const targets = ['luna', 'cristal', 'silencio'];
  const evalResult = evaluateWritingDraftWithWords(
    '[1. Umbral]\nBajo la luna fría tiemblan los cristales.\n',
    targets
  );
  assert.equal(evalResult.totalTargetWords, 3);
  assert.equal(evalResult.usedCount, 2);
  assert.equal(evalResult.allWordsUsed, false);
  assert.equal(evalResult.wordStatuses.find((w) => w.word === 'luna')?.used, true);
  assert.equal(evalResult.wordStatuses.find((w) => w.word === 'cristal')?.used, true);
  assert.equal(evalResult.wordStatuses.find((w) => w.word === 'silencio')?.used, false);
  assert.equal(evalResult.totalLines, 1); // ignores bracket header lines
  assert.ok(evalResult.lines[0].metricSyllables > 0);
});

test('ACADEMY_STAGES covers 8 progressive stages (Etapa 0 to Etapa 7) with Graduation Projects and expanded routes', () => {
  assert.equal(ACADEMY_STAGES.length, 8);
  assert.deepEqual(
    ACADEMY_STAGES.map((s) => s.number),
    [0, 1, 2, 3, 4, 5, 6, 7]
  );
  for (const st of ACADEMY_STAGES) {
    assert.ok(st.lessons.length >= 3, `Stage ${st.number} should have lessons`);
    assert.ok(st.graduationProject.title.length > 5);
    assert.equal(st.graduationProject.deliverables.length, 3);
  }
  assert.equal(findStageForSection('intro')?.number, 0);
  assert.equal(findStageForSection('t-ritmo')?.number, 1);
  assert.equal(findStageForSection('t-modos')?.number, 4);

  const p = getStageProgress(ACADEMY_STAGES[0], ['intro', 't-sonido']);
  assert.equal(p.done, 2);
  assert.equal(p.total, 3);
  assert.equal(p.pct, 67);

  assert.ok(ACADEMY_LEARNING_PATHS.some((pTrack) => pTrack.id === 'ruta-guitarra-completa' && pTrack.steps.length === 8));
  assert.ok(ACADEMY_LEARNING_PATHS.some((pTrack) => pTrack.id === 'ruta-maestria-teorica' && pTrack.steps.length === 8));
});

test('assembleAcademyCategoryHtml reorders Teoria pedagogically and relocates 3B & Modos to Armonia cleanly', () => {
  const teoriaEnriched = injectTreatiseEnrichmentIntoCategoryHtml('teoria', ENCYCLOPEDIA_CONTENT['teoria']);
  const armoniaEnriched = injectTreatiseEnrichmentIntoCategoryHtml('armonia', ENCYCLOPEDIA_CONTENT['armonia']);

  const teoriaFinal = assembleAcademyCategoryHtml('teoria', teoriaEnriched, undefined, applyStage1LessonUpgrades);
  const armoniaFinal = assembleAcademyCategoryHtml('armonia', armoniaEnriched, teoriaEnriched, applyStage1LessonUpgrades);

  const teoriaSections = splitHtmlSections(teoriaFinal);
  assert.deepEqual(
    teoriaSections.map((s) => s.id),
    TEORIA_PEDAGOGICAL_ORDER.map((x) => x.id)
  );
  assert.ok(!teoriaSections.some((s) => s.id === 't-visualizador-9nintervalos'));
  assert.ok(!teoriaSections.some((s) => s.id === 't-modos'));

  // Rhythm starter, scale staircase, and key signature labs are embedded inside Stage 1
  assert.ok(teoriaFinal.includes('data-lab="rhythm-starter-lab"'));
  assert.ok(teoriaFinal.includes('data-lab="major-scale-ladder-lab"'));
  assert.ok(teoriaFinal.includes('data-lab="key-signature-lab"'));
  assert.ok(teoriaFinal.includes('data-run="demoPulseOnly"'));

  const armoniaSections = splitHtmlSections(armoniaFinal);
  assert.ok(armoniaSections.some((s) => s.id === 't-visualizador-9nintervalos'));
  assert.ok(armoniaSections.some((s) => s.id === 't-modos'));
  assert.equal(resolveCategoryForSectionId('t-visualizador-9nintervalos'), 'armonia');
  assert.equal(resolveCategoryForSectionId('t-modos'), 'armonia');

  const focusedRitmo = extractSingleSectionHtml(teoriaFinal, 't-ritmo');
  assert.equal(splitHtmlSections(focusedRitmo).length, 1);
  assert.equal(splitHtmlSections(focusedRitmo)[0].id, 't-ritmo');
});

test('resolveKeySignatureFiveSecondRule and MAJOR_SCALE_LADDER_PRESETS compute exact accidentals and explanations', () => {
  const cMaj = resolveKeySignatureFiveSecondRule('sharp', 0);
  assert.equal(cMaj.majorKey, 'C Mayor');

  const aMaj = resolveKeySignatureFiveSecondRule('sharp', 3); // F#, C#, G# -> last is G# -> A Mayor
  assert.equal(aMaj.majorKey, 'A Mayor');
  assert.equal(aMaj.relativeMinor, 'F# menor');
  assert.deepEqual(aMaj.accidentals, ['F#', 'C#', 'G#']);

  const fMaj = resolveKeySignatureFiveSecondRule('flat', 1); // 1 flat exception = F Mayor
  assert.equal(fMaj.majorKey, 'F Mayor');

  const ebMaj = resolveKeySignatureFiveSecondRule('flat', 3); // Bb, Eb, Ab -> penultimate Eb -> Eb Mayor
  assert.equal(ebMaj.majorKey, 'E♭ Mayor');
  assert.equal(ebMaj.relativeMinor, 'C menor');

  const gPreset = MAJOR_SCALE_LADDER_PRESETS.find((p) => p.id === 'G');
  assert.ok(gPreset);
  assert.equal(gPreset.notes[6], 'F#');
  assert.deepEqual(gPreset.alteredDegrees, [7]);

  const fPreset = MAJOR_SCALE_LADDER_PRESETS.find((p) => p.id === 'F');
  assert.ok(fPreset);
  assert.equal(fPreset.notes[3], 'B♭');
  assert.deepEqual(fPreset.alteredDegrees, [4]);

  assert.equal(RHYTHM_STARTER_PATTERNS.length, 7);
});

test('scheduleNextReview and getDueReviews manage spaced-repetition intervals cleanly', () => {
  const dayMs = 86_400_000;
  const t0 = 1_700_000_000_000;

  // Initial pass >=75% schedules first spaced review at 3 days; borderline 60% schedules 1 day
  const freshPass = scheduleNextReview(undefined, 100, t0);
  const borderlineFirst = scheduleNextReview(undefined, 60, t0);
  assert.equal(freshPass.intervalDays, 3);
  assert.equal(freshPass.streak, 1);
  assert.equal(freshPass.nextReviewAt, t0 + 3 * dayMs);
  assert.equal(borderlineFirst.intervalDays, 1);
  assert.equal(borderlineFirst.streak, 0);

  // Advancing again moves 3d -> 7d -> 14d -> 30d
  const pass2 = scheduleNextReview({ ...freshPass, sectionId: 't-ritmo' }, 80, t0 + 3 * dayMs);
  assert.equal(pass2.intervalDays, 7);
  assert.equal(pass2.streak, 2);

  // Failing (<50%) resets interval to 1 day and streak to 0
  const failReset = scheduleNextReview(pass2, 25, t0 + 10 * dayMs);
  assert.equal(failReset.intervalDays, 1);
  assert.equal(failReset.streak, 0);

  // Mid score (50..74%) holds interval
  const midHold = scheduleNextReview(pass2, 60, t0 + 10 * dayMs);
  assert.equal(midHold.intervalDays, 7);

  // getDueReviews surfaces due first, then untested completed, then upcoming
  const dueList = getDueReviews(
    {
      intro: { ...freshPass, sectionId: 'intro', nextReviewAt: t0 - 1000 },
      't-escalas': { ...pass2, sectionId: 't-escalas', nextReviewAt: t0 + 5 * dayMs },
    },
    ['intro', 't-notas', 't-escalas'],
    t0
  );
  assert.equal(dueList[0].sectionId, 'intro');
  assert.equal(dueList[0].status, 'due');
  assert.equal(dueList[1].sectionId, 't-notas');
  assert.equal(dueList[1].status, 'untested');
  assert.equal(dueList[2].sectionId, 't-escalas');
  assert.equal(dueList[2].status, 'upcoming');
  assert.ok(formatReviewStatusLabel(undefined, t0).includes('Pendiente'));
  assert.ok(formatReviewStatusLabel(dueList[0].status === 'due' ? { ...freshPass, nextReviewAt: t0 - 1000 } : undefined, t0).includes('hoy'));
});

test('getStageGraduationSummary and getTotalGraduationsCount track 8-stage rubrics accurately', () => {
  const stage0 = ACADEMY_STAGES[0];
  const emptySummary = getStageGraduationSummary(stage0, {});
  assert.equal(emptySummary.checkedCount, 0);
  assert.equal(emptySummary.totalCount, 3);
  assert.equal(emptySummary.isGraduated, false);

  const partialRubric = {
    [stage0.id]: {
      checked: [true, true, false],
      ratings: [2, 3, 1] as (0 | 1 | 2 | 3)[],
      note: 'Estrellita tocada a 70 BPM',
    },
  };
  const partialSummary = getStageGraduationSummary(stage0, partialRubric);
  assert.equal(partialSummary.checkedCount, 2);
  assert.equal(partialSummary.pct, 67);
  assert.equal(partialSummary.isGraduated, false);

  const fullRubric = {
    [stage0.id]: {
      checked: [true, true, true],
      ratings: [3, 3, 3] as (0 | 1 | 2 | 3)[],
      note: 'Completado',
    },
  };
  const fullSummary = getStageGraduationSummary(stage0, fullRubric);
  assert.equal(fullSummary.checkedCount, 3);
  assert.equal(fullSummary.pct, 100);
  assert.equal(fullSummary.isGraduated, true);
  assert.equal(fullSummary.averageRatingLabel, 'Con fluidez');

  const totals = getTotalGraduationsCount(ACADEMY_STAGES, fullRubric);
  assert.equal(totals.graduated, 1);
  assert.equal(totals.total, 8);
});

test('Every academy lesson has valid active-recall quiz questions, practical challenge, and 10-phase framework map', () => {
  for (const stage of ACADEMY_STAGES) {
    for (const lesson of stage.lessons) {
      const qs = getLessonQuizQuestions(lesson.sectionId);
      assert.ok(qs.length >= 1, `Missing quiz questions for ${lesson.sectionId}`);
      for (const q of qs) {
        assert.equal(q.options.length, 4);
        assert.ok(q.correctIndex >= 0 && q.correctIndex <= 3);
        assert.ok(q.explanation.length > 10);
      }
      const challenge = getLessonPracticalMicroChallenge(lesson.sectionId);
      assert.ok(challenge.exerciseGoal.length > 10);
      assert.ok(challenge.instrumentApplication.length > 10);
    }
  }

  const phases = detectLessonFrameworkPhases(
    '<section id="t-ritmo"><h3 id="h3-a">Sub</h3><button class="btn-audio" data-run="demoPulseOnly">Play</button><article id="lab-1" data-lab="rhythm-starter-lab"><svg></svg></article></section>'
  );
  assert.equal(phases.length, 10);
  assert.equal(phases[0].name, 'Fundamento');
  assert.equal(phases[4].name, 'Laboratorio');
  assert.equal(phases[4].available, true);
  assert.equal(phases[9].name, 'Repaso');

  const queue = buildActiveReviewQueue({}, ['intro', 't-ritmo'], 't-escalas', Date.now(), 4);
  assert.equal(queue.length, 4);
  assert.equal(new Set(queue.map((q) => q.id)).size, 4);
});

test('Stage 3 Counterpoint analyzer flags forbidden parallel 5ths/8ths and validates clean contrary motion presets', () => {
  assert.equal(COUNTERPOINT_PRESETS.length, 8);

  const cleanSpecies1 = COUNTERPOINT_PRESETS.find((p) => p.id === 'especie-1-contrario')!;
  const cleanResult = analyzeCounterpointMotion(cleanSpecies1.cantusMidis, cleanSpecies1.counterMidis);
  assert.equal(cleanResult.forbiddenParallelsCount, 0);
  assert.ok(cleanResult.contraryCount >= 4);
  assert.ok(cleanResult.verdict.includes('0 quintas/octavas paralelas'));

  const trapPreset = COUNTERPOINT_PRESETS.find((p) => p.id === 'trampa-paralelas')!;
  const trapResult = analyzeCounterpointMotion(trapPreset.cantusMidis, trapPreset.counterMidis);
  assert.ok(trapResult.forbiddenParallelsCount >= 5);
  assert.ok(trapResult.steps.some((s) => s.isForbiddenParallel && s.warningText !== null));
});

test('Stage 3 Improvisation Gym generates 4-bar Question/Response phrases across all 6 genres and target roots', () => {
  assert.equal(IMPROVISATION_TRACKS.length, 6);

  for (const track of IMPROVISATION_TRACKS) {
    const session = generateImprovisationPhrase(track.id, 60, 2);
    assert.equal(session.chords.length, 4);
    assert.equal(session.notes.length, 12);
    assert.equal(session.notes[0].role, 'Pregunta (Motivo)');
    assert.equal(session.notes[11].role, 'Respuesta (Resolución)');
    assert.ok(session.notes.every((n) => n.fretHint.length > 5 && n.noteLabel.length >= 2));
  }

  // Jazz ii-V-I highlight guide tones on C root
  const jazz = generateImprovisationPhrase('jazz', 60, 1);
  assert.deepEqual(
    jazz.chords.map((c) => c.label),
    ['ii7', 'V7', 'Imaj7', 'Imaj7']
  );
  assert.ok(jazz.notes.some((n) => n.toneBadge === 'Nota Guía (3ª/7ª)'));
});

test('Stage 3 Anatomy kits and lesson assembly inject interactive counterpoint, improvisation, and anatomy labs cleanly', () => {
  for (const inst of ['guitar', 'bass', 'drum', 'voice'] as const) {
    const kit = INSTRUMENT_ANATOMY_DATA[inst];
    assert.ok(kit.hotspots.length >= 4, `Expected >=4 hotspots for ${inst}`);
    for (const h of kit.hotspots) {
      assert.ok(h.functionText.length > 15);
      assert.ok(h.techniqueTip.length > 15);
      assert.ok(h.commonMistake.length > 15);
      assert.ok(h.demoMidis.length >= 1);
    }
  }

  const compHtml = assembleAcademyCategoryHtml(
    'composicion',
    injectTreatiseEnrichmentIntoCategoryHtml('composicion', ENCYCLOPEDIA_CONTENT['composicion']),
    undefined,
    applyStage1LessonUpgrades
  );
  assert.ok(compHtml.includes('data-lab="counterpoint-lab"'));
  assert.ok(compHtml.includes('Fuga: Sujeto, Respuesta y Contrasujeto'));

  const gtrElHtml = assembleAcademyCategoryHtml(
    'guitarra-el',
    injectTreatiseEnrichmentIntoCategoryHtml('guitarra-el', ENCYCLOPEDIA_CONTENT['guitarra-el']),
    undefined,
    applyStage1LessonUpgrades
  );
  assert.ok(gtrElHtml.includes('data-lab="improvisation-gym-lab"'));

  for (const [catId, inst] of [
    ['guitarra-ac', 'guitar'],
    ['bajo', 'bass'],
    ['bateria', 'drum'],
    ['canto', 'voice'],
  ] as const) {
    const catHtml = assembleAcademyCategoryHtml(
      catId,
      injectTreatiseEnrichmentIntoCategoryHtml(catId, ENCYCLOPEDIA_CONTENT[catId]),
      undefined,
      applyStage1LessonUpgrades
    );
    assert.ok(catHtml.includes(`data-lab="anatomy-lab"`), `Missing anatomy lab in ${catId}`);
    assert.ok(catHtml.includes(`data-instrument="${inst}"`), `Missing data-instrument="${inst}" in ${catId}`);
  }

  // Curated quizzes for Stage 3 lessons
  for (const secId of ['c-contrapunto', 'ge-riffs-solos', 'ga-fundamentos', 'b-fundamentos', 'd-fundamentos', 'v-fundamentos']) {
    const qs = getLessonQuizQuestions(secId);
    assert.ok(qs.length >= 1);
    const ch = getLessonPracticalMicroChallenge(secId);
    assert.ok(ch.exerciseGoal.length > 20);
  }
});

test('Stage 4 Synthesis ADSR, resonant LPF curve, and MIDI humanization compute deterministic bounded values', () => {
  assert.ok(SYNTH_PATCH_PRESETS.length >= 4);
  const env = computeAdsrEnvelopePoints({ attackMs: 25, decayMs: 200, sustain: 0.6, releaseMs: 300 });
  assert.equal(env.nodes.length, 5);
  assert.ok(env.pointsAttr.split(' ').length === 5);

  const lpf = computeLowPassResponseCurve(800, 4.5);
  const lowFreq = lpf.find((p) => p.freqHz === 80)!;
  const highFreq = lpf.find((p) => p.freqHz === 16000)!;
  assert.ok(lowFreq.db > highFreq.db, 'Low frequencies must pass louder than attenuated highs above cutoff');

  const tightMidi = buildMidiRollEvents(MIDI_GROOVE_PRESETS[0].id, 0, 48);
  const humanMidi = buildMidiRollEvents(MIDI_GROOVE_PRESETS[0].id, 80, 48);
  assert.equal(tightMidi.length, humanMidi.length);
  assert.ok(tightMidi.every((ev) => ev.timingOffsetMs === 0));
  assert.ok(humanMidi.some((ev) => ev.timingOffsetMs !== 0));
  assert.ok(humanMidi.every((ev) => ev.velocity >= 1 && ev.velocity <= 127 && ev.hexNoteOn.startsWith('0x90 ')));
});

test('Stage 4 EQ curve and Mastering auditor classify clean mix, 250 Hz mud, and over-limiting accurately', () => {
  const cleanCurve = computeEqCurveDb({ hpfHz: 110, lowMidDb: -3.5, presenceDb: 2.5, airDb: 2.0 });
  const pt30 = cleanCurve.find((p) => p.freqHz === 30)!;
  const pt250 = cleanCurve.find((p) => p.freqHz === 250)!;
  assert.ok(pt30.db < -10, 'HPF at 110 Hz must strongly roll off 30 Hz');
  assert.ok(pt250.db < 0);

  const nominal = evaluateMixAndMasterMetrics({
    stemId: 'lead-vocal',
    targetLufs: -14,
    ...EQ_PRESETS[0].settings,
  });
  assert.equal(nominal.mudRisk, 'nominal');

  const muddy = evaluateMixAndMasterMetrics({
    stemId: 'rhythm-guitar',
    targetLufs: -14,
    ...EQ_PRESETS[1].settings,
  });
  assert.equal(muddy.mudRisk, 'warning');

  const squashed = evaluateMixAndMasterMetrics({
    stemId: 'full-band',
    targetLufs: -9,
    ...EQ_PRESETS[2].settings,
  });
  assert.equal(squashed.mudRisk, 'critical');
});

test('Stage 4 Complex Work inspector, Integrator auditor, and Stage 6-7 lesson upgrades assemble cleanly', () => {
  assert.equal(COMPLEX_WORK_SECTIONS.length, 5);
  for (const sec of COMPLEX_WORK_SECTIONS) {
    assert.equal(sec.bassMidis.length, sec.chordSymbols.length);
    assert.equal(sec.melodyMidis.length, sec.chordSymbols.length);
  }

  const cleanProject = auditIntegratorBlueprint({
    projectStyleId: 'andino',
    keyLabel: 'E',
    rootMidi: 4,
    bpm: 100,
    bassOctave: 1,
    harmonyRegister: 'mid',
    harmonicDevice: 'dim-bridge',
  });
  assert.equal(cleanProject.hasCollision, false);
  assert.equal(cleanProject.quarterMs, 600);
  assert.equal(cleanProject.dottedEighthDelayMs, 450);

  const collidingProject = auditIntegratorBlueprint({
    projectStyleId: 'funk',
    keyLabel: 'C',
    rootMidi: 0,
    bpm: 96,
    bassOctave: 3,
    harmonyRegister: 'low',
    harmonicDevice: 'tritone-sub',
  });
  assert.equal(collidingProject.hasCollision, true);

  const prodHtml = assembleAcademyCategoryHtml(
    'produccion',
    injectTreatiseEnrichmentIntoCategoryHtml('produccion', ENCYCLOPEDIA_CONTENT['produccion']),
    undefined,
    applyStage1LessonUpgrades
  );
  assert.ok(prodHtml.includes('data-lab="synth-midi-lab"'));
  assert.ok(prodHtml.includes('data-lab="mix-master-lab"'));
  assert.ok(prodHtml.includes('data-lab="master-project-lab"'));

  const compHtml = assembleAcademyCategoryHtml(
    'composicion',
    injectTreatiseEnrichmentIntoCategoryHtml('composicion', ENCYCLOPEDIA_CONTENT['composicion']),
    undefined,
    applyStage1LessonUpgrades
  );
  assert.ok(compHtml.includes('data-lab="work-analysis-lab"'));

  for (const secId of ['p-fundamentos', 'p-mezcla', 'c-ejemplo', 'pr-proyectos']) {
    const qs = getLessonQuizQuestions(secId);
    assert.ok(qs.length >= 1, `Missing quiz for ${secId}`);
    const ch = getLessonPracticalMicroChallenge(secId);
    assert.ok(ch.exerciseGoal.length > 20, `Missing challenge for ${secId}`);
  }
});

test('Guided Fundamentals series covers 8 Teoria chapters with playable C4-C5 piano keys and deterministic evaluation', () => {
  assert.equal(FUNDAMENTALS_PIANO_KEYS.length, 13);
  assert.equal(FUNDAMENTALS_GUIDED_LESSONS.length, 8);

  const expectedSections = ['intro', 't-sonido', 't-notas', 't-escalas', 't-intervalos', 't-tonalidades', 't-lectura', 't-oido'];
  assert.deepEqual(
    FUNDAMENTALS_GUIDED_LESSONS.map((l) => l.sectionId),
    expectedSections
  );

  for (const lesson of FUNDAMENTALS_GUIDED_LESSONS) {
    assert.ok(lesson.briefExplanation.length > 60, `Expected clear explanation for ${lesson.id}`);
    assert.ok(lesson.steps.length >= 3, `Expected at least 3 interactive steps for ${lesson.id}`);
    for (const step of lesson.steps) {
      assert.ok(step.targetMidis.every((m) => m >= 60 && m <= 72));
      assert.ok(step.demoMidis.every((m) => m >= 60 && m <= 72));
    }
  }

  // Sequence evaluation step-by-step
  const seqStep = FUNDAMENTALS_GUIDED_LESSONS[2].steps[0]; // E4 -> F4 -> B4 -> C5
  const hit1 = evaluateFundamentalsKeyTap(seqStep, 64, 0);
  assert.equal(hit1.matchedStep, true);
  assert.equal(hit1.advancedProgress, 1);
  assert.equal(hit1.completedStep, false);

  const wrong = evaluateFundamentalsKeyTap(seqStep, 67, 1);
  assert.equal(wrong.matchedStep, false);
  assert.equal(wrong.advancedProgress, 1);

  const hit2 = evaluateFundamentalsKeyTap(seqStep, 65, 1);
  const hit3 = evaluateFundamentalsKeyTap(seqStep, 71, 2);
  const hit4 = evaluateFundamentalsKeyTap(seqStep, 72, 3);
  assert.equal(hit2.advancedProgress, 2);
  assert.equal(hit3.advancedProgress, 3);
  assert.equal(hit4.completedStep, true);
  assert.equal(hit4.tone, 'ok');

  // Staff SVG rendering and ear drill selection
  const staffSvg = renderTrebleStaffNoteSvg(60); // C4 ledger line
  assert.ok(staffSvg.includes('<svg') && staffSvg.includes('y1="88"'));
  const nextEar = pickNextEarDrillMidi([62, 64, 67], 64);
  assert.notEqual(nextEar, 64);

  // Full Teoria assembly includes all 8 guided fundamentals labs cleanly
  const teoriaFinal = assembleAcademyCategoryHtml(
    'teoria',
    injectTreatiseEnrichmentIntoCategoryHtml('teoria', ENCYCLOPEDIA_CONTENT['teoria']),
    undefined,
    applyStage1LessonUpgrades
  );
  for (const lesson of FUNDAMENTALS_GUIDED_LESSONS) {
    assert.ok(
      teoriaFinal.includes(`data-lesson="${lesson.id}"`),
      `Missing guided fundamentals lab ${lesson.id} in Teoria`
    );
  }
  assert.ok(teoriaFinal.includes('¿Por qué existen 3 Escalas Menores'));
  assert.ok(teoriaFinal.includes('Cómo leer Tablatura (TAB) sin invertir las cuerdas'));
  assert.ok(teoriaFinal.includes('Relativa vs. Paralela'));
});













