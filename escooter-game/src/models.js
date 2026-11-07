// Low-poly models built from primitives (mobile friendly, no asset downloads).
import * as THREE from 'three';
import * as TX from './textures.js';

const geoCache = new Map();
export function G(type, ...a) {
  const key = type + a.join(',');
  if (geoCache.has(key)) return geoCache.get(key);
  let g;
  switch (type) {
    case 'box': g = new THREE.BoxGeometry(...a); break;
    case 'cyl': g = new THREE.CylinderGeometry(...a); break;
    case 'sph': g = new THREE.SphereGeometry(...a); break;
    case 'cone': g = new THREE.ConeGeometry(...a); break;
    case 'torus': g = new THREE.TorusGeometry(...a); break;
    case 'plane': g = new THREE.PlaneGeometry(...a); break;
    case 'circle': g = new THREE.CircleGeometry(...a); break;
    default: throw new Error('geo ' + type);
  }
  geoCache.set(key, g);
  return g;
}

const matCache = new Map();
export function M(color, extra = {}) {
  const key = color + JSON.stringify(extra, (k, v) => (v && v.isTexture ? v.uuid : v));
  if (matCache.has(key)) return matCache.get(key);
  const opts = { color, ...extra };
  if (extra.emissive && extra.emissiveIntensity === undefined) opts.emissiveIntensity = 1;
  const m = new THREE.MeshLambertMaterial(opts);
  matCache.set(key, m);
  return m;
}

export function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}

/* ---------------- Scooter + rider ---------------- */
export function makeScooter(accent = '#00d8ff', helmet = '#ff4d6d') {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const dark = M('#20252e');
  const acc = M(accent, { emissive: accent, emissiveIntensity: 0.5 });

  body.add(mesh(G('box', 0.46, 0.1, 1.3), dark, 0, 0.28, 0));
  body.add(mesh(G('box', 0.44, 0.02, 1.0), M('#0e0f12'), 0, 0.34, -0.05));
  body.add(mesh(G('box', 0.5, 0.035, 1.24), acc, 0, 0.225, 0));
  body.add(mesh(G('box', 0.3, 0.06, 0.45), dark, 0, 0.45, -0.6)); // rear fender

  const wheels = [];
  const wGeo = G('cyl', 0.21, 0.21, 0.12, 18);
  const hubGeo = G('cyl', 0.1, 0.1, 0.14, 10);
  for (const z of [0.62, -0.62]) {
    const w = new THREE.Group();
    w.position.set(0, 0.21, z);
    const t = mesh(wGeo, M('#111')); t.rotation.z = Math.PI / 2; w.add(t);
    const h = mesh(hubGeo, M('#c9d1d9')); h.rotation.z = Math.PI / 2; w.add(h);
    const spoke = mesh(G('box', 0.15, 0.36, 0.05), M('#8b96a3')); w.add(spoke);
    body.add(w); wheels.push(w);
  }
  const stem = mesh(G('cyl', 0.04, 0.045, 1.08, 8), M('#aab4c0'), 0, 0.82, 0.58);
  stem.rotation.x = -0.12; body.add(stem);
  const bar = mesh(G('cyl', 0.03, 0.03, 0.66, 8), M('#2c313a'), 0, 1.34, 0.52);
  bar.rotation.z = Math.PI / 2; body.add(bar);
  for (const x of [-0.3, 0.3]) {
    const gr = mesh(G('cyl', 0.042, 0.042, 0.12, 8), M('#0a0a0a'), x, 1.34, 0.52);
    gr.rotation.z = Math.PI / 2; body.add(gr);
  }
  body.add(mesh(G('box', 0.16, 0.06, 0.1), M('#111', { emissive: accent, emissiveIntensity: 0.9 }), 0, 1.38, 0.5)); // display
  body.add(mesh(G('box', 0.14, 0.1, 0.06), M('#fff', { emissive: '#fffbe0' }), 0, 1.0, 0.68)); // headlight
  body.add(mesh(G('box', 0.2, 0.05, 0.04), M('#f00', { emissive: '#ff2030' }), 0, 0.47, -0.84)); // tail light

  // Rider
  const rider = new THREE.Group();
  const skin = M('#f1c27d'), shirt = M('#3a86ff'), pants = M('#273043');
  const legL = mesh(G('box', 0.15, 0.78, 0.17), pants, -0.11, 0.74, 0.12);
  const legR = mesh(G('box', 0.15, 0.78, 0.17), pants, 0.11, 0.74, -0.18);
  legL.rotation.x = 0.08; legR.rotation.x = -0.08;
  rider.add(legL, legR);
  rider.add(mesh(G('box', 0.17, 0.09, 0.28), M('#fff'), -0.11, 0.39, 0.16));
  rider.add(mesh(G('box', 0.17, 0.09, 0.28), M('#fff'), 0.11, 0.39, -0.14));
  const torso = mesh(G('box', 0.44, 0.62, 0.26), shirt, 0, 1.43, 0.02);
  torso.rotation.x = 0.18; rider.add(torso);
  for (const x of [-0.24, 0.24]) {
    const arm = mesh(G('box', 0.11, 0.11, 0.56), shirt, x, 1.48, 0.3);
    arm.rotation.x = 0.35; rider.add(arm);
    rider.add(mesh(G('sph', 0.065, 8, 6), skin, x * 1.15, 1.36, 0.53));
  }
  rider.add(mesh(G('sph', 0.17, 14, 10), skin, 0, 1.92, 0.07));
  const hel = mesh(new THREE.SphereGeometry(0.2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(helmet), 0, 1.95, 0.05);
  rider.add(hel);
  rider.add(mesh(G('box', 0.3, 0.05, 0.12), M(helmet), 0, 1.97, 0.24)); // visor
  rider.add(mesh(G('box', 0.32, 0.4, 0.16), M('#ffb703'), 0, 1.45, -0.2)); // backpack
  body.add(rider);

  const shadow = new THREE.Mesh(G('plane', 1.3, 2.2), new THREE.MeshBasicMaterial({ map: TX.blob(), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.03;
  root.add(shadow);

  // Shield bubble
  const shield = mesh(G('sph', 1.3, 20, 14), new THREE.MeshLambertMaterial({ color: '#4cc9f0', emissive: '#1d6fa5', transparent: true, opacity: 0.28, depthWrite: false }), 0, 1.1, 0);
  shield.visible = false;
  root.add(shield);

  return { root, body, wheels, rider, shadow, shield };
}

/* ---------------- Obstacles ---------------- */
const CAR_COLORS = ['#e63946', '#ffb703', '#2a9d8f', '#3a86ff', '#f1faee', '#8338ec', '#fb8500', '#222', '#06d6a0'];
export function makeCar(rng) {
  const g = new THREE.Group();
  const col = CAR_COLORS[(rng() * CAR_COLORS.length) | 0];
  const taxi = rng() < 0.12;
  const paint = M(taxi ? '#ffd60a' : col);
  g.add(mesh(G('box', 1.9, 0.7, 4.0), paint, 0, 0.62, 0));
  g.add(mesh(G('box', 1.66, 0.62, 2.1), M('#253447'), 0, 1.27, -0.2));
  g.add(mesh(G('box', 1.7, 0.1, 2.15), paint, 0, 1.62, -0.2));
  if (taxi) g.add(mesh(G('box', 0.6, 0.22, 0.3), M('#fff', { emissive: '#ffe066', emissiveIntensity: 0.6 }), 0, 1.78, -0.2));
  const wGeo = G('cyl', 0.36, 0.36, 0.28, 14);
  for (const [x, z] of [[-0.9, 1.3], [0.9, 1.3], [-0.9, -1.3], [0.9, -1.3]]) {
    const w = mesh(wGeo, M('#111'), x, 0.36, z); w.rotation.z = Math.PI / 2; g.add(w);
  }
  for (const x of [-0.65, 0.65]) {
    g.add(mesh(G('box', 0.4, 0.18, 0.06), M('#fff', { emissive: '#fff6c8' }), x, 0.72, 2.01));
    g.add(mesh(G('box', 0.4, 0.16, 0.06), M('#a00', { emissive: '#ff1a1a', emissiveIntensity: 0.7 }), x, 0.74, -2.01));
  }
  return g;
}

const SHIRTS = ['#e63946', '#2a9d8f', '#e9c46a', '#8338ec', '#ff6b9a', '#06d6a0', '#3a86ff', '#fb8500'];
const SKINS = ['#f1c27d', '#c68642', '#8d5524', '#ffdbac', '#e0ac69'];
export function makePerson(rng) {
  const g = new THREE.Group();
  const shirt = M(SHIRTS[(rng() * SHIRTS.length) | 0]);
  const skin = M(SKINS[(rng() * SKINS.length) | 0]);
  const pants = M(rng() < 0.5 ? '#264653' : '#5a5a66');
  const legs = [];
  for (const x of [-0.12, 0.12]) {
    const pivot = new THREE.Group(); pivot.position.set(x, 0.9, 0);
    pivot.add(mesh(G('box', 0.16, 0.88, 0.18), pants, 0, -0.44, 0));
    g.add(pivot); legs.push(pivot);
  }
  g.add(mesh(G('box', 0.46, 0.66, 0.28), shirt, 0, 1.24, 0));
  for (const x of [-0.29, 0.29]) g.add(mesh(G('box', 0.11, 0.6, 0.13), shirt, x, 1.22, 0));
  g.add(mesh(G('sph', 0.17, 12, 8), skin, 0, 1.75, 0));
  g.add(mesh(new THREE.SphereGeometry(0.18, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2.2), M(rng() < 0.5 ? '#2b1d14' : '#d4a373'), 0, 1.78, -0.01));
  if (rng() < 0.5) g.add(mesh(G('box', 0.3, 0.32, 0.12), M(SHIRTS[(rng() * SHIRTS.length) | 0]), 0.36, 0.95, 0)); // shopping bag
  g.userData.legs = legs;
  return g;
}

export function makeCart() {
  const g = new THREE.Group();
  const metal = M('#b8c2cc');
  const basket = mesh(G('box', 0.7, 0.5, 1.0), new THREE.MeshLambertMaterial({ color: '#c6d0da', transparent: true, opacity: 0.75 }), 0, 0.72, 0);
  g.add(basket);
  g.add(mesh(G('box', 0.72, 0.04, 1.02), metal, 0, 0.98, 0));
  g.add(mesh(G('box', 0.74, 0.06, 0.06), M('#e63946'), 0, 1.05, -0.56)); // handle
  g.add(mesh(G('box', 0.62, 0.04, 0.9), metal, 0, 0.2, 0));
  for (const [x, z] of [[-0.28, 0.4], [0.28, 0.4], [-0.28, -0.4], [0.28, -0.4]]) {
    g.add(mesh(G('box', 0.03, 0.35, 0.03), metal, x, 0.35, z));
    g.add(mesh(G('sph', 0.07, 6, 4), M('#222'), x, 0.07, z));
  }
  // a few groceries
  g.add(mesh(G('box', 0.2, 0.25, 0.2), M('#f4a261'), -0.15, 0.95, 0.2));
  g.add(mesh(G('box', 0.18, 0.3, 0.12), M('#2a9d8f'), 0.15, 0.97, -0.1));
  return g;
}

export function makeBoxes(rng) {
  const g = new THREE.Group();
  const card = M('#c08a52'), tape = M('#e9d8a6');
  const n = 2 + ((rng() * 2) | 0);
  for (let i = 0; i < n; i++) {
    const s = 0.5 + rng() * 0.25;
    const y = i < 2 ? s / 2 : 0.62 + s / 2;
    const x = i < 2 ? (i - 0.5) * 0.65 : 0;
    const b = mesh(G('box', s, s, s), card, x, y, (rng() - 0.5) * 0.2);
    b.rotation.y = (rng() - 0.5) * 0.5;
    b.add(mesh(G('box', s * 1.01, 0.04, 0.12), tape, 0, s / 2, 0));
    g.add(b);
  }
  return g;
}

export function makeWetSign() {
  const g = new THREE.Group();
  const y = M('#ffd60a');
  const a = mesh(G('box', 0.55, 0.9, 0.04), y, 0, 0.45, 0.14); a.rotation.x = -0.28;
  const b = mesh(G('box', 0.55, 0.9, 0.04), y, 0, 0.45, -0.14); b.rotation.x = 0.28;
  g.add(a, b);
  const icon = mesh(G('box', 0.3, 0.3, 0.02), M('#111'), 0, 0.5, 0.17); icon.rotation.x = -0.28;
  g.add(icon);
  return g;
}

export function makeCone() {
  const g = new THREE.Group();
  g.add(mesh(G('box', 0.6, 0.06, 0.6), M('#222'), 0, 0.03, 0));
  g.add(mesh(G('cone', 0.26, 0.75, 12), M('#ff6b1a'), 0, 0.42, 0));
  g.add(mesh(G('cyl', 0.15, 0.19, 0.12, 12), M('#fff'), 0, 0.45, 0));
  return g;
}

export function makeBarrier(width) {
  const g = new THREE.Group();
  const board = mesh(G('box', width, 0.32, 0.08), new THREE.MeshLambertMaterial({ map: TX.stripes() }), 0, 0.7, 0);
  g.add(board);
  for (const x of [-width / 2 + 0.2, width / 2 - 0.2]) {
    g.add(mesh(G('box', 0.08, 0.85, 0.08), M('#ddd'), x, 0.42, 0));
    g.add(mesh(G('box', 0.4, 0.06, 0.5), M('#333'), x, 0.03, 0));
  }
  g.add(mesh(G('sph', 0.08, 8, 6), M('#ffb000', { emissive: '#ff9500' }), -width / 2 + 0.2, 0.92, 0));
  return g;
}

export function makeShelf(len, h = 2.2) {
  const g = new THREE.Group();
  const tex = TX.shelf().clone();
  tex.needsUpdate = true;
  tex.userData.cloned = true;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(Math.max(1, Math.round(len / 2.5)), 1);
  const side = new THREE.MeshLambertMaterial({ map: tex });
  const top = M('#cfd6dd');
  g.add(mesh(G('box', 1.0, h, len), [side, side, top, top, top, top], 0, h / 2, 0));
  g.add(mesh(G('box', 1.05, 0.25, len + 0.05), M('#e63946'), 0, h + 0.12, 0));
  return g;
}

export function makePlanter(rng) {
  const g = new THREE.Group();
  g.add(mesh(G('cyl', 0.85, 0.7, 0.7, 14), M('#d9d2c5'), 0, 0.35, 0));
  g.add(mesh(G('sph', 0.9, 12, 9), M(rng() < 0.5 ? '#2d6a4f' : '#40916c'), 0, 1.2, 0));
  g.add(mesh(G('sph', 0.55, 10, 8), M('#52b788'), 0.3, 1.75, 0.1));
  return g;
}

export function makeBench() {
  const g = new THREE.Group();
  g.add(mesh(G('box', 0.6, 0.08, 2.0), M('#8d5a2b'), 0, 0.45, 0));
  g.add(mesh(G('box', 0.08, 0.4, 2.0), M('#8d5a2b'), -0.28, 0.7, 0));
  for (const z of [-0.85, 0.85]) g.add(mesh(G('box', 0.5, 0.45, 0.08), M('#333'), 0, 0.22, z));
  return g;
}

export function makeKiosk(rng, label) {
  const g = new THREE.Group();
  const col = ['#ff6b9a', '#3a86ff', '#ffb703', '#06d6a0'][(rng() * 4) | 0];
  g.add(mesh(G('box', 2.6, 1.1, 3.4), M(col), 0, 0.55, 0));
  g.add(mesh(G('box', 2.7, 0.08, 3.5), M('#f1f1f1'), 0, 1.14, 0));
  for (const [x, z] of [[-1.2, -1.6], [1.2, -1.6], [-1.2, 1.6], [1.2, 1.6]]) g.add(mesh(G('box', 0.08, 1.4, 0.08), M('#ccc'), x, 1.85, z));
  g.add(mesh(G('box', 2.9, 0.16, 3.7), M(col), 0, 2.6, 0));
  const s = new THREE.Mesh(G('plane', 2.6, 0.5), new THREE.MeshBasicMaterial({ map: TX.sign(label, '#14213d', '#ffcc00') }));
  s.position.set(0, 2.95, -1.86); s.rotation.y = Math.PI; g.add(s);
  const s2 = s.clone(); s2.position.z = 1.86; s2.rotation.y = 0; g.add(s2);
  return g;
}

export function makeRamp(w = 3, len = 3.2, h = 1.0) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0); shape.lineTo(len, 0); shape.lineTo(len, h); shape.lineTo(0, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: w, bevelEnabled: false });
  geo.rotateY(-Math.PI / 2);
  geo.translate(w / 2, 0, 0);
  const tex = TX.rampTex();
  const m = new THREE.Mesh(geo, [new THREE.MeshLambertMaterial({ color: '#ffcc00' }), new THREE.MeshLambertMaterial({ map: tex })]);
  const g = new THREE.Group(); g.add(m);
  return g;
}

export function makeTree(rng) {
  const g = new THREE.Group();
  g.add(mesh(G('cyl', 0.15, 0.2, 2.2, 7), M('#6b4226'), 0, 1.1, 0));
  const leaf = M(['#2d6a4f', '#40916c', '#52b788'][(rng() * 3) | 0]);
  g.add(mesh(G('sph', 1.2, 10, 8), leaf, 0, 2.8, 0));
  g.add(mesh(G('sph', 0.8, 8, 6), leaf, 0.4, 3.5, 0.2));
  return g;
}

export function makeStreetLight(side, night) {
  const g = new THREE.Group();
  g.add(mesh(G('cyl', 0.08, 0.1, 5.5, 7), M('#5c6773'), 0, 2.75, 0));
  const arm = mesh(G('box', 1.6, 0.08, 0.08), M('#5c6773'), -side * 0.8, 5.45, 0);
  g.add(arm);
  g.add(mesh(G('box', 0.5, 0.12, 0.3), M('#fff', { emissive: night ? '#ffe9a8' : '#cccccc', emissiveIntensity: night ? 1.4 : 0.3 }), -side * 1.5, 5.35, 0));
  if (night) {
    const cone = mesh(G('cone', 1.8, 5.2, 12, 1, true), new THREE.MeshBasicMaterial({ color: '#ffe9a8', transparent: true, opacity: 0.08, depthWrite: false }), -side * 1.5, 2.7, 0);
    g.add(cone);
  }
  return g;
}

/* ---------------- Collectibles ---------------- */
export const ITEM_INFO = {
  coin: { pts: 10, icon: '🪙', name: 'Münze' },
  bag: { pts: 50, icon: '🛍️', name: 'Einkaufstüte' },
  gift: { pts: 75, icon: '🎁', name: 'Geschenk' },
  phone: { pts: 100, icon: '📱', name: 'Handy' },
  shoe: { pts: 60, icon: '👟', name: 'Sneaker' },
  apple: { pts: 30, icon: '🍎', name: 'Apfel' },
  donut: { pts: 40, icon: '🍩', name: 'Donut' },
  pizza: { pts: 45, icon: '🍕', name: 'Pizza' },
  battery: { pts: 20, icon: '🔋', name: 'Akku' },
  magnet: { pts: 25, icon: '🧲', name: 'Magnet' },
  shield: { pts: 25, icon: '🛡️', name: 'Schild' },
  turbo: { pts: 25, icon: '🚀', name: 'Turbo' },
  star: { pts: 250, icon: '⭐', name: 'Superstern' },
};

export function makeCollectible(type) {
  const g = new THREE.Group();
  const inner = new THREE.Group();
  g.add(inner);
  switch (type) {
    case 'coin': {
      const c = mesh(G('cyl', 0.32, 0.32, 0.07, 18), M('#ffd23f', { emissive: '#b8860b', emissiveIntensity: 0.6 }));
      c.rotation.x = Math.PI / 2; inner.add(c);
      const c2 = mesh(G('cyl', 0.2, 0.2, 0.08, 14), M('#ffe680', { emissive: '#c99700', emissiveIntensity: 0.5 }));
      c2.rotation.x = Math.PI / 2; inner.add(c2);
      break;
    }
    case 'bag': {
      inner.add(mesh(G('box', 0.55, 0.6, 0.25), M('#ff4d6d', { emissive: '#801030', emissiveIntensity: 0.4 })));
      const h = mesh(G('torus', 0.16, 0.03, 6, 12, Math.PI), M('#222'), 0, 0.3, 0); inner.add(h);
      break;
    }
    case 'gift': {
      inner.add(mesh(G('box', 0.55, 0.5, 0.55), M('#3a86ff', { emissive: '#103080', emissiveIntensity: 0.4 })));
      inner.add(mesh(G('box', 0.57, 0.52, 0.1), M('#ffd60a')));
      inner.add(mesh(G('box', 0.1, 0.52, 0.57), M('#ffd60a')));
      inner.add(mesh(G('torus', 0.1, 0.035, 6, 10), M('#ffd60a'), -0.08, 0.3, 0));
      inner.add(mesh(G('torus', 0.1, 0.035, 6, 10), M('#ffd60a'), 0.08, 0.3, 0));
      break;
    }
    case 'phone': {
      inner.add(mesh(G('box', 0.36, 0.66, 0.06), M('#222')));
      inner.add(mesh(G('box', 0.31, 0.56, 0.065), M('#0af', { emissive: '#22c8ff', emissiveIntensity: 0.9 })));
      break;
    }
    case 'shoe': {
      inner.add(mesh(G('box', 0.32, 0.16, 0.7), M('#fff'), 0, -0.12, 0));
      inner.add(mesh(G('box', 0.3, 0.26, 0.38), M('#ff6b1a', { emissive: '#802000', emissiveIntensity: 0.3 }), 0, 0.08, -0.12));
      inner.add(mesh(G('box', 0.3, 0.12, 0.3), M('#ff6b1a'), 0, -0.0, 0.18));
      break;
    }
    case 'apple': {
      inner.add(mesh(G('sph', 0.3, 14, 10), M('#e63946', { emissive: '#600', emissiveIntensity: 0.4 })));
      inner.add(mesh(G('cyl', 0.025, 0.025, 0.18, 5), M('#5b3a1a'), 0, 0.33, 0));
      const leaf = mesh(G('box', 0.16, 0.03, 0.08), M('#52b788'), 0.08, 0.36, 0); leaf.rotation.z = 0.5; inner.add(leaf);
      break;
    }
    case 'donut': {
      const d = mesh(G('torus', 0.22, 0.11, 10, 18), M('#d4a373')); inner.add(d);
      const icing = mesh(G('torus', 0.22, 0.09, 8, 18), M('#ff8fab', { emissive: '#803050', emissiveIntensity: 0.4 }), 0, 0, 0.04); inner.add(icing);
      break;
    }
    case 'pizza': {
      const p = mesh(G('cone', 0.4, 0.06, 3), M('#f4a261', { emissive: '#7a3d00', emissiveIntensity: 0.3 })); p.rotation.x = Math.PI / 2; inner.add(p);
      for (const [x, y] of [[0, 0.1], [0.1, -0.1], [-0.1, -0.08]]) {
        const pep = mesh(G('cyl', 0.06, 0.06, 0.08, 8), M('#c1121f'), x, y, 0.02);
        pep.rotation.x = Math.PI / 2; inner.add(pep);
      }
      break;
    }
    case 'battery': {
      inner.add(mesh(G('cyl', 0.2, 0.2, 0.6, 12), M('#3ddc84', { emissive: '#0c7a3a', emissiveIntensity: 0.6 })));
      inner.add(mesh(G('cyl', 0.08, 0.08, 0.1, 8), M('#ccc'), 0, 0.35, 0));
      inner.add(mesh(G('box', 0.08, 0.3, 0.42), M('#fff', { emissive: '#ffffaa' }), 0, 0, 0));
      break;
    }
    case 'magnet': {
      const u = mesh(G('torus', 0.25, 0.09, 8, 16, Math.PI), M('#e63946', { emissive: '#700', emissiveIntensity: 0.5 })); u.rotation.z = Math.PI; inner.add(u);
      inner.add(mesh(G('box', 0.18, 0.12, 0.18), M('#ddd'), -0.25, 0.04, 0));
      inner.add(mesh(G('box', 0.18, 0.12, 0.18), M('#ddd'), 0.25, 0.04, 0));
      break;
    }
    case 'shield': {
      inner.add(mesh(G('sph', 0.32, 14, 10), new THREE.MeshLambertMaterial({ color: '#4cc9f0', emissive: '#1d6fa5', transparent: true, opacity: 0.8 })));
      inner.add(mesh(G('box', 0.2, 0.26, 0.05), M('#fff', { emissive: '#bdf' }), 0, 0, 0.3));
      break;
    }
    case 'turbo': {
      const r = mesh(G('cone', 0.22, 0.5, 10), M('#ff8800', { emissive: '#ff5500', emissiveIntensity: 0.6 }), 0, 0.15, 0); inner.add(r);
      inner.add(mesh(G('cyl', 0.22, 0.22, 0.35, 10), M('#eee'), 0, -0.25, 0));
      const flame = mesh(G('cone', 0.15, 0.3, 8), M('#ffd60a', { emissive: '#ffaa00' }), 0, -0.55, 0);
      flame.rotation.x = Math.PI; inner.add(flame);
      break;
    }
    case 'star': {
      const s = new THREE.Shape();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 0.18 : 0.42, a = (i / 10) * Math.PI * 2 + Math.PI / 2;
        i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      const geo = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false }); geo.center();
      inner.add(new THREE.Mesh(geo, M('#ffd60a', { emissive: '#ffaa00', emissiveIntensity: 0.8 })));
      break;
    }
  }
  // glow ring on ground for visibility in 2D top view
  if (type !== 'coin') {
    const ring = new THREE.Mesh(G('circle', 0.55, 16), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.25, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    g.add(ring);
    g.userData.ring = ring;
  }
  g.userData.inner = inner;
  return g;
}

export function makeFinish(width) {
  const g = new THREE.Group();
  for (const x of [-width / 2, width / 2]) g.add(mesh(G('box', 0.5, 5.2, 0.5), M('#e63946'), x, 2.6, 0));
  const b = new THREE.Mesh(G('box', width + 0.5, 1.2, 0.3), [M('#e63946'), M('#e63946'), M('#e63946'), M('#e63946'),
    new THREE.MeshBasicMaterial({ map: TX.finishBanner() }), new THREE.MeshBasicMaterial({ map: TX.finishBanner() })]);
  b.position.y = 5.2; g.add(b);
  const line = new THREE.Mesh(G('plane', width, 1.2), new THREE.MeshLambertMaterial({ map: TX.checker() }));
  line.rotation.x = -Math.PI / 2; line.position.y = 0.04; g.add(line);
  return g;
}
