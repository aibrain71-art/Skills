// Builds a level: environment chunks, obstacles, collectibles, doors and finish.
import * as THREE from 'three';
import * as TX from './textures.js';
import {
  G, M, mesh, makeCar, makePerson, makeCart, makeBoxes, makeWetSign, makeCone, makeBarrier, makeShelf,
  makePlanter, makeBench, makeKiosk, makeRamp, makeTree, makeStreetLight, makeCollectible, makeFinish,
} from './models.js';

export const CHUNK = 40;
const START_PAD = 40;

export const LAYOUT = {
  street: { half: 9.4, floor: 14 },
  mall: { half: 8.2, floor: 18 },
  shop: { half: 5.6, floor: 13 },
};

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SHOPS = [
  ['MODE', '#ff6b9a'], ['ELEKTRO', '#3a86ff'], ['SPORT', '#06d6a0'], ['CAFÉ', '#8d5a2b'], ['SPIELZEUG', '#ffb703'],
  ['BÄCKEREI', '#e76f51'], ['SCHUHE', '#8338ec'], ['BÜCHER', '#2a9d8f'], ['BLUMEN', '#ef476f'], ['GAMES', '#118ab2'],
];
const BLD_COLORS = ['#c9ada7', '#9a8c98', '#e9c46a', '#f4a261', '#a8dadc', '#b5838d', '#d8e2dc', '#adb5bd'];

export function buildLevel(scene, level) {
  const rng = mulberry32(level.seed);
  const night = level.night;
  const root = new THREE.Group();
  scene.add(root);

  // Segment table
  const segs = [];
  let zc = 0;
  segs.push({ type: level.segments[0].type, z0: -START_PAD, z1: 0 });
  for (const s of level.segments) { segs.push({ type: s.type, z0: zc, z1: zc + s.len }); zc += s.len; }
  const length = zc;
  segs.push({ type: level.segments[level.segments.length - 1].type, z0: length, z1: length + 80 });
  const segAt = (z) => { for (const s of segs) if (z < s.z1) return s; return segs[segs.length - 1]; };
  const typeAt = (z) => segAt(z).type;

  // Chunks
  const chunks = [];
  for (let z = -START_PAD; z < length + 80; z += CHUNK) {
    const c = { z0: z, z1: z + CHUNK, center: new THREE.Group(), neg: new THREE.Group(), pos: new THREE.Group() };
    c.group = new THREE.Group();
    c.group.add(c.center, c.neg, c.pos);
    root.add(c.group);
    chunks.push(c);
  }
  const chunkAt = (z) => chunks[Math.max(0, Math.min(chunks.length - 1, Math.floor((z + START_PAD) / CHUNK)))];

  // Big ground plane
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, length + 600), M(night ? '#1b2a1f' : '#7fb069'));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.05, length / 2);
  root.add(ground);

  for (const c of chunks) buildChunkEnv(c, typeAt(c.z0 + 1), rng, night);

  // Transitions between segment types
  const doors = [];
  for (let i = 1; i < segs.length; i++) {
    const a = segs[i - 1].type, b = segs[i].type;
    if (a !== b) buildTransition(chunkAt(segs[i].z0 + 0.5), segs[i].z0, a, b, doors, rng);
  }

  // Entities
  const obstacles = [];
  const collectibles = [];
  const ctx = { rng, level, obstacles, collectibles, chunkAt, typeAt, root, night };

  let z = 30;
  while (z < length - 25) {
    const t = typeAt(z);
    const used = spawnPattern(ctx, t, z);
    z += used + (14 + rng() * 10) / level.density;
  }
  // Batteries & power-ups along the way
  for (let bz = 90; bz < length - 30; bz += 110 + rng() * 40) addCollectible(ctx, 'battery', lane(ctx, bz), bz);
  const powers = ['magnet', 'shield', 'turbo', 'star'];
  for (let pz = 160; pz < length - 40; pz += 180 + rng() * 80) addCollectible(ctx, powers[(rng() * powers.length) | 0], lane(ctx, pz), pz + 5);

  ensureShoppingList(ctx);

  // Finish gate
  const finishType = typeAt(length - 1);
  const fin = makeFinish(LAYOUT[finishType].half * 2);
  fin.position.z = length;
  chunkAt(length + 1).center.add(fin);

  return {
    root, chunks, obstacles, collectibles, doors, length, segAt, typeAt,
    halfAt: (zz) => LAYOUT[typeAt(zz)].half,
    dispose() {
      scene.remove(root);
      root.traverse((o) => {
        if (o.isMesh && o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          for (const m of mats) if (m.map && m.map.userData.cloned) m.map.dispose();
        }
      });
    },
  };
}

/* ---------------- Environment ---------------- */
function plane(w, l, mat, x, y, z) {
  const p = mesh(G('plane', w, l), mat, x, y, z);
  p.rotation.x = -Math.PI / 2;
  return p;
}

function buildChunkEnv(c, type, rng, night) {
  const zMid = c.z0 + CHUNK / 2;
  if (type === 'street') {
    c.center.add(plane(14, CHUNK, new THREE.MeshLambertMaterial({ map: TX.asphalt(night) }), 0, 0, zMid));
    for (let dz = 2; dz < CHUNK; dz += 8) c.center.add(mesh(G('box', 0.18, 0.02, 3.5), M('#f2f2f2'), 0, 0.01, c.z0 + dz));
    for (const s of [-1, 1]) {
      c.center.add(mesh(G('box', 0.15, 0.02, CHUNK), M('#f2f2f2'), s * 6.7, 0.01, zMid));
      const walk = mesh(G('box', 3.6, 0.16, CHUNK), [M('#999'), M('#999'), new THREE.MeshLambertMaterial({ map: TX.sidewalk() }), M('#999'), M('#999'), M('#999')], s * 8.8, 0.08, zMid);
      c.center.add(walk);
      const grp = s < 0 ? c.neg : c.pos;
      // buildings
      let bz = c.z0;
      while (bz < c.z1 - 0.5) {
        const w = Math.min(7 + rng() * 7, c.z1 - bz);
        const h = 7 + rng() * 16;
        const d = 8;
        const col = BLD_COLORS[(rng() * BLD_COLORS.length) | 0];
        const tex = TX.building(col, night, (rng() * 3) | 0);
        const wall = new THREE.MeshLambertMaterial({ map: tex });
        const b = mesh(G('box', d, h, w - 0.4), [wall, wall, M(night ? '#333' : '#777'), wall, wall, wall], s * (11 + d / 2), h / 2, bz + w / 2);
        grp.add(b);
        // shop awning at ground floor
        if (rng() < 0.5) grp.add(mesh(G('box', 1.4, 0.12, w - 1.2), M(['#e63946', '#2a9d8f', '#ffb703', '#3a86ff'][(rng() * 4) | 0]), s * 10.6, 3, bz + w / 2));
        bz += w;
      }
      for (let tz = 6 + rng() * 4; tz < CHUNK; tz += 13) {
        const tr = makeTree(rng); tr.position.set(s * 10.2, 0.16, c.z0 + tz); grp.add(tr);
      }
      const sl = makeStreetLight(s, night); sl.position.set(s * 10.4, 0.16, c.z0 + (s < 0 ? 0 : 20)); grp.add(sl);
    }
  } else if (type === 'mall') {
    c.center.add(plane(70, CHUNK, M('#bdb3a3'), 0, -0.03, zMid)); // building footprint (seen in 2D view)
    c.center.add(plane(18, CHUNK, new THREE.MeshLambertMaterial({ map: TX.tiles('#efe6d8', '#d9cbb5', 4, 10) }), 0, 0, zMid));
    // ceiling (faces down: invisible from the 2D top camera thanks to back-face culling)
    const ceil = mesh(G('plane', 18, CHUNK), M('#f3efe8'), 0, 7, zMid); ceil.rotation.x = Math.PI / 2; c.center.add(ceil);
    for (let dz = 5; dz < CHUNK; dz += 10) {
      const lp = mesh(G('plane', 6, 1.2), M('#fff', { emissive: '#fff8e0' }), 0, 6.95, c.z0 + dz); lp.rotation.x = Math.PI / 2; c.center.add(lp);
    }
    for (const s of [-1, 1]) {
      const grp = s < 0 ? c.neg : c.pos;
      for (let i = 0; i < 4; i++) {
        const z0 = c.z0 + i * 10, zm = z0 + 5;
        const [name, col] = SHOPS[(rng() * SHOPS.length) | 0];
        grp.add(mesh(G('box', 0.3, 7, 10), M('#e8e2d6'), s * 15, 3.5, zm)); // back wall
        grp.add(mesh(G('box', 6, 7, 0.3), M('#d6cfc2'), s * 12, 3.5, z0)); // divider
        grp.add(plane(6, 10, M(col), s * 12, 0.02, zm));
        grp.add(mesh(G('box', 0.7, 7, 0.7), M('#cfc6b6'), s * 9.25, 3.5, z0)); // pillar
        grp.add(mesh(G('box', 0.08, 3.2, 9.3), new THREE.MeshLambertMaterial({ color: '#bfe9ff', transparent: true, opacity: 0.22, depthWrite: false }), s * 9.2, 1.6, zm));
        grp.add(mesh(G('box', 0.5, 1.6, 9.3), M(col), s * 9.3, 4.0, zm));
        const sg = new THREE.Mesh(G('plane', 7.5, 1.3), new THREE.MeshBasicMaterial({ map: TX.sign(name, col, '#ffffff') }));
        sg.position.set(s * 9.0, 4.0, zm); sg.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2; grp.add(sg);
        grp.add(mesh(G('box', 0.5, 2.2, 9.3), M('#e8e2d6'), s * 9.3, 5.9, zm));
        // displays inside
        for (let k = 0; k < 3; k++) {
          const h = 0.6 + rng() * 1.2;
          grp.add(mesh(G('box', 1, h, 1), M(['#ffffff', col, '#333', '#ffd60a'][(rng() * 4) | 0]), s * (11 + rng() * 3), h / 2, z0 + 2 + k * 3));
        }
      }
    }
  } else {
    // supermarket
    c.center.add(plane(70, CHUNK, M('#b9c3cc'), 0, -0.03, zMid));
    c.center.add(plane(13, CHUNK, new THREE.MeshLambertMaterial({ map: TX.tiles('#f5f7fa', '#dfe5ec', 6, 18, 's') }), 0, 0, zMid));
    const ceil = mesh(G('plane', 15, CHUNK), M('#e9edf2'), 0, 5, zMid); ceil.rotation.x = Math.PI / 2; c.center.add(ceil);
    for (let dz = 4; dz < CHUNK; dz += 8) {
      for (const x of [-3, 3]) {
        const lp = mesh(G('plane', 0.6, 4), M('#fff', { emissive: '#f0fbff' }), x, 4.95, c.z0 + dz); lp.rotation.x = Math.PI / 2; c.center.add(lp);
      }
    }
    for (const s of [-1, 1]) {
      const grp = s < 0 ? c.neg : c.pos;
      const sh = makeShelf(CHUNK - 0.2, 2.4); sh.position.set(s * 6.6, 0, zMid); grp.add(sh);
      grp.add(mesh(G('box', 0.3, 5, CHUNK), M('#d7e3ea'), s * 7.6, 2.5, zMid));
      if (rng() < 0.6) {
        const lbl = ['OBST', 'BROT', 'GETRÄNKE', 'SNACKS', 'MILCH', 'TIEFKÜHL'][(rng() * 6) | 0];
        const sg = new THREE.Mesh(G('plane', 3.2, 0.6), new THREE.MeshBasicMaterial({ map: TX.sign(lbl, '#2a9d8f', '#fff') }));
        sg.position.set(s * 6.05, 3.1, zMid); sg.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2; grp.add(sg);
      }
    }
  }
}

function buildTransition(c, z, from, to, doors, rng) {
  const intoInterior = to !== 'street';
  const half = Math.min(LAYOUT[from].half, LAYOUT[to].half) + (to === 'shop' || from === 'shop' ? 0.7 : 0.4);
  const height = to === 'shop' || from === 'shop' ? 5 : 7;
  const wallCol = to === 'mall' || from === 'mall' ? (to === 'shop' || from === 'shop' ? '#2a9d8f' : '#5e6ad2') : '#2a9d8f';
  // side walls
  for (const s of [-1, 1]) {
    const grp = s < 0 ? c.neg : c.pos;
    const w = 22 - half;
    grp.add(mesh(G('box', w, height + 2, 1.2), M(wallCol), s * (half + w / 2), (height + 2) / 2, z));
  }
  c.center.add(mesh(G('box', half * 2, 2, 1.2), M(wallCol), 0, height + 1, z));
  let label;
  if (to === 'mall') label = 'CITY MALL';
  else if (to === 'shop') label = 'FRISCH MARKT';
  else if (from === 'shop') label = 'KASSE · AUSGANG';
  else label = 'AUSGANG';
  for (const face of [-1, 1]) {
    const sg = new THREE.Mesh(G('plane', Math.min(10, half * 2), 1.6), new THREE.MeshBasicMaterial({ map: TX.sign(label, '#14213d', '#ffcc00') }));
    sg.position.set(0, height + 1, z + face * 0.62);
    sg.rotation.y = face < 0 ? Math.PI : 0;
    c.center.add(sg);
  }
  // sliding glass doors when entering a building
  if (intoInterior) {
    const dw = half;
    const glass = new THREE.MeshLambertMaterial({ color: '#a8e6ff', transparent: true, opacity: 0.35, depthWrite: false });
    const frame = M('#cfd8dc');
    const parts = [];
    for (const s of [-1, 1]) {
      const d = new THREE.Group();
      d.add(mesh(G('box', dw, height - 0.2, 0.12), glass, 0, (height - 0.2) / 2, 0));
      d.add(mesh(G('box', dw, 0.15, 0.16), frame, 0, height - 0.25, 0));
      d.add(mesh(G('box', 0.12, height - 0.2, 0.16), frame, -s * dw / 2, (height - 0.2) / 2, 0));
      d.position.set(s * dw / 2, 0, z - 0.2);
      c.center.add(d);
      parts.push({ obj: d, side: s, closedX: s * dw / 2, openX: s * (dw * 1.5 + 0.2) });
    }
    doors.push({ z, parts, open: 0 });
  }
}

/* ---------------- Entities ---------------- */
function lane(ctx, z) {
  const half = LAYOUT[ctx.typeAt(z)].half - 1;
  return (ctx.rng() * 2 - 1) * half;
}

export function addCollectible(ctx, type, x, z, y = 0.9) {
  const m = makeCollectible(type);
  m.position.set(x, y, z);
  ctx.root.add(m);
  const c = { type, mesh: m, x, y, z, baseY: y, taken: false, phase: ctx.rng() * 6 };
  ctx.collectibles.push(c);
  return c;
}

function addObstacle(ctx, kind, obj, x, z, o = {}) {
  obj.position.set(x, 0, z);
  if (o.rotY) obj.rotation.y = o.rotY;
  ctx.root.add(obj);
  const ob = {
    kind, mesh: obj, x, z, hw: o.hw ?? 0.5, hl: o.hl ?? 0.5, h: o.h ?? 1, jumpable: o.jumpable ?? false,
    vx: o.vx ?? 0, vz: o.vz ?? 0, minX: o.minX, maxX: o.maxX, triggerDist: o.triggerDist ?? 60, active: false,
    knockable: o.knockable ?? false, knocked: false, bounce: o.bounce ?? false, ramp: o.ramp ?? null, solid: o.solid ?? true, walk: o.walk ?? false,
  };
  ctx.obstacles.push(ob);
  return ob;
}

function coinLine(ctx, x, z, n, dx = 0, step = 2.4, y = 0.9) {
  const half = LAYOUT[ctx.typeAt(z)].half - 0.6;
  for (let i = 0; i < n; i++) {
    const xx = Math.max(-half, Math.min(half, x + dx * i));
    addCollectible(ctx, 'coin', xx, z + i * step, y);
  }
  return n * step;
}

function coinArc(ctx, x, z, n, h, len) {
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    addCollectible(ctx, 'coin', x, z + t * len, 0.9 + Math.sin(t * Math.PI) * h);
  }
}

function pickItem(ctx) {
  const pool = ctx.level.pool;
  return pool[(ctx.rng() * pool.length) | 0];
}

function spawnPattern(ctx, type, z) {
  const { rng, level } = ctx;
  const half = LAYOUT[type].half;
  const r = rng();
  const traffic = level.traffic;

  // generic patterns available everywhere
  if (r < 0.16) {
    const x = (rng() * 2 - 1) * (half - 1.5);
    const zig = rng() < 0.5 ? 0 : (rng() < 0.5 ? 0.5 : -0.5);
    return coinLine(ctx, x, z, 6 + ((rng() * 4) | 0), zig);
  }
  if (r < 0.28) {
    const x = (rng() * 2 - 1) * (half - 1.5);
    addCollectible(ctx, pickItem(ctx), x, z);
    coinLine(ctx, x, z + 3, 3);
    return 10;
  }
  if (r < 0.36) {
    // ramp with coin arc and a goodie on top
    const x = (rng() * 2 - 1) * (half - 2.5);
    addObstacle(ctx, 'ramp', makeRamp(3, 3.2, 1.0), x, z, { hw: 1.5, hl: 1.6, h: 1.0, solid: false, ramp: { z0: z - 1.6, len: 3.2, h: 1.0 } });
    // ramp group origin sits at the ramp start; shift mesh so it is centered
    ctx.obstacles[ctx.obstacles.length - 1].mesh.position.z = z - 1.6;
    coinArc(ctx, x, z + 3, 7, 3.2, 12);
    addCollectible(ctx, pickItem(ctx), x, z + 9, 4.2);
    return 18;
  }

  if (type === 'street') {
    if (r < 0.5 && traffic > 0) {
      // moving car in a lane (same direction right side, oncoming left side)
      const oncoming = rng() < 0.5 * traffic;
      const x = oncoming ? 2.2 + rng() * 2.8 : -(2.2 + rng() * 2.8);
      const car = makeCar(rng);
      const speed = oncoming ? -(6 + rng() * 5) : 5 + rng() * 4;
      addObstacle(ctx, 'car', car, x, z + (oncoming ? 40 : 6), { hw: 0.95, hl: 2.0, h: 1.8, vz: speed, rotY: oncoming ? Math.PI : 0, triggerDist: oncoming ? 70 : 40 });
      coinLine(ctx, -x * 0.4, z, 5);
      return 16;
    }
    if (r < 0.62) {
      // zebra crossing with pedestrian or crossing car
      const ch = ctx.chunkAt(z);
      for (let i = -6; i <= 6; i += 1.4) ch.center.add(mesh(G('box', 0.8, 0.02, 3.2), M('#f5f5f5'), i, 0.015, z));
      if (rng() < 0.4 + traffic * 0.3 && traffic > 0.3) {
        const dir = rng() < 0.5 ? 1 : -1;
        const car = makeCar(rng);
        addObstacle(ctx, 'car', car, -dir * 16, z, { hw: 2.0, hl: 0.95, h: 1.8, vx: dir * (8 + rng() * 4), rotY: dir * Math.PI / 2, triggerDist: 34, minX: -18, maxX: 18 });
      } else {
        const n = 1 + ((rng() * 3) | 0);
        for (let i = 0; i < n; i++) {
          const dir = rng() < 0.5 ? 1 : -1;
          addObstacle(ctx, 'person', makePerson(rng), -dir * (7 + i * 2), z + (rng() - 0.5) * 2, { hw: 0.35, hl: 0.3, h: 1.8, vx: dir * (1.4 + rng()), rotY: dir * Math.PI / 2, triggerDist: 45, minX: -9, maxX: 9, walk: true, knockable: false });
        }
      }
      addCollectible(ctx, pickItem(ctx), (rng() * 2 - 1) * 5, z + 6);
      return 10;
    }
    if (r < 0.76) {
      // construction site: cones / barrier with a gap
      const gapX = (rng() * 2 - 1) * (half - 3);
      const useBarrier = rng() < 0.5;
      for (let x = -half + 0.6; x <= half - 0.6; x += useBarrier ? 3 : 1.4) {
        if (Math.abs(x - gapX) < 2) continue;
        if (useBarrier) addObstacle(ctx, 'barrier', makeBarrier(2.6), x, z, { hw: 1.3, hl: 0.2, h: 1.0, jumpable: true, knockable: true });
        else addObstacle(ctx, 'cone', makeCone(), x, z, { hw: 0.3, hl: 0.3, h: 0.8, jumpable: true, knockable: true });
      }
      coinLine(ctx, gapX, z - 4, 4);
      return 8;
    }
    if (r < 0.86) {
      // parked car at the curb + boxes
      const s = rng() < 0.5 ? -1 : 1;
      addObstacle(ctx, 'car', makeCar(rng), s * 5.4, z, { hw: 0.95, hl: 2.0, h: 1.8 });
      addObstacle(ctx, 'boxes', makeBoxes(rng), -s * (1 + rng() * 3), z + 8, { hw: 0.7, hl: 0.5, h: 1.0, jumpable: true, knockable: true });
      coinLine(ctx, 0, z - 2, 5, 0);
      return 14;
    }
    // pedestrian walking along sidewalk
    const s = rng() < 0.5 ? -1 : 1;
    addObstacle(ctx, 'person', makePerson(rng), s * 8.6, z + 10, { hw: 0.35, hl: 0.3, h: 1.8, vz: -1.5, rotY: Math.PI, walk: true, triggerDist: 40 });
    coinLine(ctx, s * 8.6, z, 6);
    return 14;
  }

  if (type === 'mall') {
    if (r < 0.5) {
      // shoppers strolling across
      const n = 1 + ((rng() * (2 + level.density * 2)) | 0);
      for (let i = 0; i < n; i++) {
        const dir = rng() < 0.5 ? 1 : -1;
        addObstacle(ctx, 'person', makePerson(rng), -dir * (rng() * 8), z + i * 3, { hw: 0.35, hl: 0.3, h: 1.8, vx: dir * (1 + rng() * 1.2), rotY: dir * Math.PI / 2, triggerDist: 45, minX: -8.5, maxX: 8.5, walk: true, bounce: true });
      }
      addCollectible(ctx, pickItem(ctx), (rng() * 2 - 1) * 6, z + n * 3 + 2);
      return n * 3 + 6;
    }
    if (r < 0.62) {
      // kiosk island in the middle, coins on both sides
      const k = makeKiosk(rng, ['EIS', 'KAFFEE', 'SALE', 'HANDY', 'CREPES'][(rng() * 5) | 0]);
      addObstacle(ctx, 'kiosk', k, 0, z + 2, { hw: 1.4, hl: 1.8, h: 2.8 });
      coinLine(ctx, -5, z - 2, 4); coinLine(ctx, 5, z - 2, 4);
      return 10;
    }
    if (r < 0.74) {
      // planters & benches
      for (const s of [-1, 1]) {
        if (rng() < 0.6) addObstacle(ctx, 'planter', makePlanter(rng), s * (3 + rng() * 3), z + rng() * 4, { hw: 0.85, hl: 0.85, h: 2 });
        else addObstacle(ctx, 'bench', makeBench(), s * (3 + rng() * 3), z + rng() * 4, { hw: 0.35, hl: 1.0, h: 0.8, jumpable: true });
      }
      coinLine(ctx, 0, z - 3, 5);
      return 10;
    }
    if (r < 0.86) {
      // rolling shopping cart
      const dir = rng() < 0.5 ? 1 : -1;
      addObstacle(ctx, 'cart', makeCart(), -dir * 7, z, { hw: 0.4, hl: 0.55, h: 1.05, jumpable: true, knockable: true, vx: dir * (2.5 + rng() * 2), rotY: dir * Math.PI / 2, minX: -8, maxX: 8, triggerDist: 35 });
      coinArc(ctx, (rng() * 2 - 1) * 4, z - 3, 5, 1.5, 6);
      return 8;
    }
    // wet floor + boxes
    const x = (rng() * 2 - 1) * (half - 2);
    addObstacle(ctx, 'wet', makeWetSign(), x, z, { hw: 0.3, hl: 0.25, h: 0.95, jumpable: true, knockable: true });
    addObstacle(ctx, 'boxes', makeBoxes(rng), -x, z + 5, { hw: 0.7, hl: 0.5, h: 1.0, jumpable: true, knockable: true });
    addCollectible(ctx, 'coin', x, z + 2, 2.2);
    return 8;
  }

  // supermarket
  if (r < 0.52) {
    // aisle section with middle shelves
    const len = 14 + ((rng() * 3) | 0) * 4;
    const layout = rng() < 0.5 ? [0] : [-2.4, 2.4];
    for (const x of layout) {
      addObstacle(ctx, 'shelf', makeShelf(len, 2.2), x, z + len / 2, { hw: 0.5, hl: len / 2, h: 2.4 });
    }
    // coins in aisles
    const aisles = layout.length === 1 ? [-3, 3] : [-4.1, 0, 4.1];
    const ai = aisles[(rng() * aisles.length) | 0];
    coinLine(ctx, ai, z + 1, Math.floor(len / 2.6));
    const other = aisles.filter((a) => a !== ai)[0];
    addCollectible(ctx, pickItem(ctx), other, z + len / 2);
    if (rng() < 0.5) {
      const ax = aisles[(rng() * aisles.length) | 0];
      addObstacle(ctx, 'cart', makeCart(), ax, z + len - 2, { hw: 0.4, hl: 0.55, h: 1.05, jumpable: true, knockable: true, vz: -2, triggerDist: 30 });
    }
    return len + 2;
  }
  if (r < 0.66) {
    const dir = rng() < 0.5 ? 1 : -1;
    addObstacle(ctx, 'person', makePerson(rng), -dir * 4, z, { hw: 0.35, hl: 0.3, h: 1.8, vx: dir * 1.2, rotY: dir * Math.PI / 2, minX: -5.3, maxX: 5.3, walk: true, triggerDist: 40, bounce: true });
    addObstacle(ctx, 'cart', makeCart(), dir * 3, z + 5, { hw: 0.4, hl: 0.55, h: 1.05, jumpable: true, knockable: true });
    coinLine(ctx, 0, z + 1, 4);
    return 10;
  }
  if (r < 0.8) {
    for (let i = 0; i < 3; i++) {
      const x = (rng() * 2 - 1) * (half - 1);
      if (rng() < 0.5) addObstacle(ctx, 'wet', makeWetSign(), x, z + i * 4, { hw: 0.3, hl: 0.25, h: 0.95, jumpable: true, knockable: true });
      else addObstacle(ctx, 'boxes', makeBoxes(rng), x, z + i * 4, { hw: 0.7, hl: 0.5, h: 1.0, jumpable: true, knockable: true });
    }
    addCollectible(ctx, pickItem(ctx), 0, z + 13);
    return 14;
  }
  coinLine(ctx, -3, z, 5, 0.6);
  addCollectible(ctx, pickItem(ctx), 3, z + 6);
  return 12;
}

function ensureShoppingList(ctx) {
  const list = ctx.level.list;
  for (const [type, need] of Object.entries(list)) {
    let have = ctx.collectibles.filter((c) => c.type === type).length;
    const coins = ctx.collectibles.filter((c) => c.type === 'coin' && c.y < 1.5);
    while (have < need + 2 && coins.length) {
      const idx = (ctx.rng() * coins.length) | 0;
      const c = coins.splice(idx, 1)[0];
      ctx.root.remove(c.mesh);
      const nm = makeCollectible(type);
      nm.position.set(c.x, c.y, c.z);
      ctx.root.add(nm);
      c.type = type; c.mesh = nm;
      have++;
    }
  }
}
