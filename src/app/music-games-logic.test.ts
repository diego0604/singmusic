import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzePedalInterval,
  analyzeSpanishLyricLine,
  applyEnharmonicGoldenRule,
  buildScaleFretboardPath,
  classifyVocalRangeDetailed,
  computeChordNeckState,
  convertProgressionToNashville,
  createPitchAcuityRound,
  evaluateGapClickTiming,
  harmonizeMelodyVoices,
  reduceLatchGlowState,
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



