// Procedural canvas textures – no external image assets needed.
import * as THREE from 'three';

const cache = new Map();

function make(key, w, h, draw, repeat = null) {
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  cache.set(key, t);
  return t;
}

function noise(g, w, h, base, spread, n) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) {
    const v = Math.random() * spread - spread / 2;
    g.fillStyle = v > 0 ? `rgba(255,255,255,${v / 255})` : `rgba(0,0,0,${-v / 255})`;
    g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  }
}

export const asphalt = (night) => make('asphalt' + night, 256, 256,
  (g, w, h) => noise(g, w, h, night ? '#2a2d35' : '#3c4049', 60, 5000), [3, 8]);

export const sidewalk = () => make('sidewalk', 128, 128, (g, w, h) => {
  noise(g, w, h, '#b9b4aa', 30, 1200);
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2;
  for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); }
  g.beginPath(); g.moveTo(64, 0); g.lineTo(64, h); g.stroke();
}, [1, 10]);

export const tiles = (a, b, rx, ry, key = '') => make(`tiles${a}${b}${rx}${ry}${key}`, 128, 128, (g, w, h) => {
  const s = 64;
  for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
    g.fillStyle = (x + y) % 2 ? a : b; g.fillRect(x * s, y * s, s, s);
  }
  g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2;
  for (let i = 0; i <= 2; i++) {
    g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke();
    g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.stroke();
  }
  // subtle shine
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, 'rgba(255,255,255,.08)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}, [rx, ry]);

export const building = (color, night, seed) => make(`bld${color}${night}${seed}`, 128, 256, (g, w, h) => {
  g.fillStyle = color; g.fillRect(0, 0, w, h);
  const cols = 4, rows = 8;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const lit = Math.random() < (night ? 0.55 : 0.15);
    g.fillStyle = lit ? (night ? '#ffd877' : '#cfe8ff') : (night ? '#1a2238' : '#4b6585');
    g.fillRect(10 + c * 29, 12 + r * 30, 18, 20);
    g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(10 + c * 29, 12 + r * 30, 18, 3);
  }
}, null);

export const sign = (text, bg, fg) => make(`sign${text}${bg}${fg}`, 512, 96, (g, w, h) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8);
  g.fillStyle = fg; g.font = '900 60px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, w / 2, h / 2 + 3);
});

export const shelf = () => make('shelf', 256, 128, (g, w, h) => {
  g.fillStyle = '#e9edf1'; g.fillRect(0, 0, w, h);
  const colors = ['#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#457b9d', '#8ecae6', '#ff6b9a', '#6a4c93', '#90be6d', '#f8f9fa'];
  for (let r = 0; r < 4; r++) {
    const y0 = r * 32;
    g.fillStyle = '#9aa4ad'; g.fillRect(0, y0 + 28, w, 4);
    let x = 2;
    while (x < w - 4) {
      const pw = 6 + Math.random() * 14, ph = 12 + Math.random() * 14;
      g.fillStyle = colors[(Math.random() * colors.length) | 0];
      g.fillRect(x, y0 + 28 - ph, pw, ph);
      g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + 1, y0 + 28 - ph + 2, pw - 2, 3);
      x += pw + 1;
    }
  }
}, [4, 1]);

export const checker = () => make('checker', 128, 64, (g, w, h) => {
  const s = 16;
  for (let y = 0; y < h / s; y++) for (let x = 0; x < w / s; x++) {
    g.fillStyle = (x + y) % 2 ? '#111' : '#fff'; g.fillRect(x * s, y * s, s, s);
  }
});

export const finishBanner = () => make('finish', 512, 128, (g, w, h) => {
  const s = 16;
  for (let y = 0; y < h / s; y++) for (let x = 0; x < w / s; x++) {
    g.fillStyle = (x + y) % 2 ? '#111' : '#fff'; g.fillRect(x * s, y * s, s, s);
  }
  g.fillStyle = 'rgba(0,0,0,.65)'; g.fillRect(120, 22, 272, 84);
  g.fillStyle = '#ffcc00'; g.font = '900 72px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('ZIEL', w / 2, h / 2 + 4);
});

export const stripes = () => make('stripes', 128, 32, (g, w, h) => {
  for (let i = -2; i < 10; i++) {
    g.fillStyle = i % 2 ? '#e8e8e8' : '#d62828';
    g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16 + 16, 0); g.lineTo(i * 16 + 32, h); g.lineTo(i * 16 + 16, h); g.fill();
  }
});

export const rampTex = () => make('ramp', 64, 64, (g, w, h) => {
  for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#111' : '#ffcc00'; g.fillRect(0, i * 16, w, 16); }
});

export const blob = () => make('blob', 64, 64, (g, w, h) => {
  const gr = g.createRadialGradient(32, 32, 2, 32, 32, 32);
  gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});
