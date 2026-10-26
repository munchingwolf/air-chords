# Air Chords

Play chords with your hands through your webcam, then sing over them. Hand tracking runs in the browser (MediaPipe), and the sound is synthesized with Web Audio.

- **Hold up N fingers** (both hands add up) to play chord N. Fists or hands down = silence.
- **Any key**: pick one of 24 keys to get its 7 chords.
- **Any song**: paste a song's chords from any chord sheet (e.g. `[Verse] G D/F# Em7 | Cadd9`). Each chord is used once, in order, up to 10 (one per finger).
- **Sounds**: 4 built-in synths plus all 128 General MIDI instruments (piano, guitars, bass, strings, choir, brass, reeds, flutes, synth leads and pads, world instruments, percussion, sound effects). These are recorded samples from the [FluidR3 GM soundfont](https://github.com/gleitz/midi-js-soundfonts), loaded the first time you pick one. Sustained sounds loop while you hold a chord.

Live: https://munchingwolf.github.io/air-chords/

## Run

The camera and ES modules need a local server (opening the file directly won't work):

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765 in Chrome and allow camera access. Hand tracking loads from a CDN, so you need to be online.

Add `?video=clip.mp4` to the URL to replay a recording instead of using the webcam.

## Test

```bash
node chords.test.mjs
```
