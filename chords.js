// Pure music + gesture logic, shared by index.html and chords.test.mjs.

const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const LETTER = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const QUALITIES = {
  '': [0, 4, 7], maj: [0, 4, 7], M: [0, 4, 7],
  m: [0, 3, 7], min: [0, 3, 7], '-': [0, 3, 7],
  dim: [0, 3, 6], '°': [0, 3, 6], o: [0, 3, 6],
  aug: [0, 4, 8], '+': [0, 4, 8],
  sus2: [0, 2, 7], sus4: [0, 5, 7], sus: [0, 5, 7], 5: [0, 7],
  6: [0, 4, 7, 9], m6: [0, 3, 7, 9],
  7: [0, 4, 7, 10], maj7: [0, 4, 7, 11], M7: [0, 4, 7, 11], m7: [0, 3, 7, 10], min7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10], 'ø': [0, 3, 6, 10], dim7: [0, 3, 6, 9], '°7': [0, 3, 6, 9], '7sus4': [0, 5, 7, 10],
  add9: [0, 4, 7, 14], add2: [0, 2, 4, 7], madd9: [0, 3, 7, 14],
  9: [0, 4, 7, 10, 14], maj9: [0, 4, 7, 11, 14], m9: [0, 3, 7, 10, 14],
};

const MAJOR = [[0, ''], [2, 'm'], [4, 'm'], [5, ''], [7, ''], [9, 'm'], [11, 'dim']];
const MINOR = [[0, 'm'], [2, 'dim'], [3, ''], [5, 'm'], [7, 'm'], [8, ''], [10, '']];
const FLAT_MAJOR = new Set([1, 3, 5, 8, 10]); // Db Eb F Ab Bb
const FLAT_MINOR = new Set([0, 2, 3, 5, 7, 10]); // Cm Dm Ebm Fm Gm Bbm

const NUMERALS = ['I', '♭II', 'II', '♭III', 'III', 'IV', '♯IV', 'V', '♭VI', 'VI', '♭VII', 'VII'];
const NUMERALS_MINOR = ['I', '♭II', 'II', 'III', '♯III', 'IV', '♯IV', 'V', 'VI', '♯VI', 'VII', '♯VII'];

const mod12 = (n) => ((n % 12) + 12) % 12;

function pitchClass(s) {
  let n = LETTER[s[0].toUpperCase()];
  for (const ch of s.slice(1)) n += '#♯'.includes(ch) ? 1 : -1;
  return mod12(n);
}

export const noteNames = (key) => ((key.minor ? FLAT_MINOR : FLAT_MAJOR).has(key.root) ? FLAT : SHARP);

// "7" -> G major, "4m" -> E minor (the value format of the key <select>).
export const parseKey = (value) => ({ root: parseInt(value, 10), minor: value.endsWith('m') });

export function keyOptions() {
  const out = [];
  for (const minor of [false, true]) {
    for (let root = 0; root < 12; root++) {
      const key = { root, minor };
      out.push({ value: root + (minor ? 'm' : ''), label: noteNames(key)[root] + (minor ? 'm' : '') });
    }
  }
  return out;
}

export function parseChord(symbol) {
  const m = /^([A-Ga-g])([#b♯♭]?)([^/]*)(?:\/([A-Ga-g][#b♯♭]?))?$/.exec(symbol.trim());
  if (!m) return null;
  const quality = m[3];
  // Unknown suffixes (e.g. "7#9") still play: minor-ish if they start with m/min, otherwise major.
  const intervals = QUALITIES[quality] ?? (/^(m(?!aj)|min|-)/.test(quality) ? QUALITIES.m : QUALITIES['']);
  const root = pitchClass(m[1] + m[2]);
  const name = m[1].toUpperCase() + m[2] + quality + (m[4] ? '/' + m[4][0].toUpperCase() + m[4].slice(1) : '');
  return { name, root, bass: m[4] ? pitchClass(m[4]) : root, intervals };
}

// Any pasted chord sheet -> unique chords in order of first appearance (max 10, one per finger).
export function parseSong(text) {
  const seen = new Set();
  const chords = [];
  for (const token of text.split(/[\s,|()[\]]+/)) {
    const chord = token && parseChord(token);
    if (!chord || seen.has(chord.name)) continue;
    seen.add(chord.name);
    chords.push(chord);
  }
  return chords.slice(0, 10);
}

export function diatonicChords(key) {
  const names = noteNames(key);
  return (key.minor ? MINOR : MAJOR).map(([step, q]) => parseChord(names[mod12(key.root + step)] + q));
}

export function numeral(chord, key) {
  const iv = chord.intervals;
  let n = (key.minor ? NUMERALS_MINOR : NUMERALS)[mod12(chord.root - key.root)];
  if (iv.includes(3) && !iv.includes(4)) n = n.toLowerCase();
  if (iv.includes(6) && !iv.includes(7)) n += iv.includes(10) ? 'ø' : '°';
  else if (iv.includes(8) && !iv.includes(7)) n += '+';
  if ((iv.includes(10) || iv.includes(11)) && !n.endsWith('ø')) n += '7';
  return n;
}

// MIDI notes: bass in octave 2, chord tones packed into G3–F#4 so changes voice-lead smoothly.
export function voice(chord) {
  const upper = [...new Set(chord.intervals.map((i) => 55 + mod12(chord.root + i - 55)))].sort((a, b) => a - b);
  return [36 + mod12(chord.bass - 36), ...upper];
}

export const FINGER_RATIO = 1.15;
export const THUMB_RATIO = 0.75;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

// Extended fingers on one hand, from MediaPipe's 21 world landmarks (metric, so hand size/angle don't matter).
export function countFingers(lm) {
  let n = 0;
  for (const [tip, pip] of [[8, 6], [12, 10], [16, 14], [20, 18]]) {
    if (dist(lm[tip], lm[0]) > dist(lm[pip], lm[0]) * FINGER_RATIO) n++;
  }
  // Thumb counts when its tip is well away from the middle-finger knuckle (tucked thumbs sit on the palm).
  if (dist(lm[4], lm[9]) > dist(lm[0], lm[9]) * THUMB_RATIO) n++;
  return n;
}
