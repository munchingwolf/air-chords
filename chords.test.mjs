// Run: node chords.test.mjs
import assert from 'node:assert/strict';
import { parseChord, parseSong, diatonicChords, numeral, voice, keyOptions, parseKey, countFingers } from './chords.js';

const names = (cs) => cs.map((c) => c.name).join(' ');
const G = parseKey('7');

// Keys from the reel: G major gives G Am Bm C D Em F#dim, and Bm is iii, Em is vi.
assert.equal(names(diatonicChords(G)), 'G Am Bm C D Em F#dim');
assert.deepEqual(['G', 'Bm', 'Em'].map((s) => numeral(parseChord(s), G)), ['I', 'iii', 'vi']);
assert.equal(names(diatonicChords(parseKey('3m'))), 'Ebm Fdim Gb Abm Bbm B Db'); // flat keys spell with flats
assert.equal(names(diatonicChords(parseKey('9m'))), 'Am Bdim C Dm Em F G');
assert.equal(keyOptions().length, 24);

// Any song: messy chord sheets parse into unique chords in order.
assert.equal(names(parseSong('[Verse] G  D/F#  Em7 | Cadd9  G D/F# Em7 Cadd9\nBb  F#m7b5 N.C. x2')), 'G D/F# Em7 Cadd9 Bb F#m7b5');
assert.equal(parseSong('hello world').length, 0);
assert.equal(parseSong('A B C D E F G Am Bm Cm Dm Em').length, 10);
assert.deepEqual(parseChord('C#m7').intervals, [0, 3, 7, 10]);
assert.deepEqual(parseChord('Bbmaj7').intervals, [0, 4, 7, 11]);
assert.deepEqual(parseChord('E7#9').intervals, [0, 4, 7]); // unknown suffix still plays
assert.equal(parseChord('Hm'), null);

// Numerals outside the key and with sevenths.
assert.equal(numeral(parseChord('F'), G), '♭VII');
assert.equal(numeral(parseChord('D7'), G), 'V7');
assert.equal(numeral(parseChord('F#m7b5'), G), 'viiø');
assert.equal(numeral(parseChord('Bdim'), parseKey('0')), 'vii°');

// Voicing: bass in octave 2, upper notes within G3–F#4.
assert.deepEqual(voice(parseChord('G')), [43, 55, 59, 62]);
assert.deepEqual(voice(parseChord('D/F#')), [42, 57, 62, 66]);
for (const c of diatonicChords(G)) for (const n of voice(c).slice(1)) assert.ok(n >= 55 && n <= 66);

// Finger counting on a synthetic hand: wrist at origin, fingers along +y.
function hand(extended, thumbOut) {
  const lm = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
  [[5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]].forEach(([mcp, pip, dip, tip], f) => {
    const x = (f - 1.5) * 0.02;
    lm[mcp] = { x, y: 0.09, z: 0 };
    lm[pip] = { x, y: 0.13, z: 0 };
    lm[dip] = extended[f] ? { x, y: 0.155, z: 0 } : { x, y: 0.12, z: 0.02 };
    lm[tip] = extended[f] ? { x, y: 0.175, z: 0 } : { x, y: 0.1, z: 0.03 };
  });
  lm[2] = { x: -0.04, y: 0.04, z: 0 };
  lm[3] = { x: -0.06, y: 0.06, z: 0 };
  lm[4] = thumbOut ? { x: -0.09, y: 0.08, z: 0 } : { x: 0.0, y: 0.08, z: 0.02 };
  return lm;
}
assert.equal(countFingers(hand([0, 0, 0, 0], false)), 0);
assert.equal(countFingers(hand([1, 0, 0, 0], false)), 1);
assert.equal(countFingers(hand([1, 1, 0, 0], true)), 3);
assert.equal(countFingers(hand([1, 1, 1, 1], true)), 5);

console.log('all chord tests passed');
