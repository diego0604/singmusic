import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzePedalInterval,
  analyzeSpanishLyricLine,
  classifyVocalRangeDetailed,
  createPitchAcuityRound,
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
