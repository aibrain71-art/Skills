// Tiny WebAudio synth – all sounds are generated, no audio files.
let ctx = null;
let master = null;
let motor = null;
let enabled = true;

export function setSoundEnabled(v) {
  enabled = v;
  if (master) master.gain.value = v ? 0.5 : 0;
}

export function unlockAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = enabled ? 0.5 : 0;
  master.connect(ctx.destination);
}

function tone(freq, dur, type = 'square', vol = 0.2, slideTo = null, delay = 0) {
  if (!ctx || !enabled) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}

function noise(dur, vol = 0.3, filterFreq = 800) {
  if (!ctx || !enabled) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass'; f.frequency.value = filterFreq;
  const g = ctx.createGain(); g.gain.value = vol;
  src.connect(f); f.connect(g); g.connect(master);
  src.start();
}

export const sfx = {
  coin: (combo = 0) => { const b = 880 + Math.min(combo, 20) * 30; tone(b, 0.07, 'square', 0.12); tone(b * 1.5, 0.1, 'square', 0.1, null, 0.05); },
  item: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.12, 'triangle', 0.18, null, i * 0.05)); },
  power: () => { [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.1, 'sawtooth', 0.1, null, i * 0.04)); },
  battery: () => { tone(300, 0.25, 'sine', 0.25, 1200); },
  jump: () => tone(220, 0.25, 'triangle', 0.2, 660),
  land: () => noise(0.08, 0.2, 400),
  crash: () => { noise(0.45, 0.6, 1200); tone(140, 0.4, 'sawtooth', 0.25, 40); },
  knock: () => { noise(0.15, 0.35, 2000); tone(300, 0.1, 'square', 0.1, 120); },
  shield: () => { tone(1200, 0.3, 'sine', 0.2, 300); },
  honk: () => { tone(330, 0.25, 'square', 0.12); tone(415, 0.25, 'square', 0.1); },
  count: (go) => tone(go ? 880 : 440, go ? 0.4 : 0.18, 'square', 0.2),
  win: () => { [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, 0.18, 'triangle', 0.2, null, i * 0.11)); },
  lose: () => { [440, 392, 349, 262].forEach((f, i) => tone(f, 0.3, 'triangle', 0.2, null, i * 0.18)); },
  door: () => noise(0.5, 0.12, 600),
  click: () => tone(660, 0.05, 'square', 0.08),
};

export function motorStart() {
  if (!ctx || motor) return;
  const o = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  const g = ctx.createGain();
  const f = ctx.createBiquadFilter();
  o.type = 'sawtooth'; o2.type = 'sine';
  f.type = 'lowpass'; f.frequency.value = 900;
  g.gain.value = 0;
  o.connect(f); o2.connect(f); f.connect(g); g.connect(master);
  o.start(); o2.start();
  motor = { o, o2, g };
}

export function motorUpdate(speed, on) {
  if (!motor || !ctx) return;
  const t = ctx.currentTime;
  const target = on && enabled ? 0.025 + Math.min(speed, 26) * 0.0015 : 0;
  motor.g.gain.setTargetAtTime(target, t, 0.1);
  motor.o.frequency.setTargetAtTime(90 + speed * 14, t, 0.1);
  motor.o2.frequency.setTargetAtTime(180 + speed * 28, t, 0.1);
}
