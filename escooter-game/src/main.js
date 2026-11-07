// Scooter Rush – main game loop, cameras, player physics, UI.
import * as THREE from 'three';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App } from '@capacitor/app';
import { LEVELS } from './levels.js';
import { buildLevel } from './world.js';
import { makeScooter, ITEM_INFO, G, M, mesh } from './models.js';
import { sfx, unlockAudio, setSoundEnabled, motorStart, motorUpdate } from './audio.js';

const $ = (id) => document.getElementById(id);
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

/* ================= Save data ================= */
const SAVE_KEY = 'scooterrush.v1';
const DEFAULT_SETTINGS = { sound: true, vibe: true, autogas: isTouch, cam: 'chase' };
function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch { return {}; }
}
const save = Object.assign({ levels: {} }, loadSave());
save.settings = Object.assign({}, DEFAULT_SETTINGS, save.settings);
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* ignore */ } }
setSoundEnabled(save.settings.sound);

/* ================= Renderer & scene ================= */
const renderer = new THREE.WebGLRenderer({ antialias: window.devicePixelRatio < 2, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
$('game').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#8fd3ff');
scene.fog = new THREE.Fog('#8fd3ff', 70, 180);
const hemi = new THREE.HemisphereLight('#ffffff', '#5a6472', 1.8);
const sun = new THREE.DirectionalLight('#fff3dc', 1.8);
sun.position.set(-20, 40, -10);
scene.add(hemi, sun, sun.target);
const headlight = new THREE.PointLight('#fff1c4', 0, 22, 1);
scene.add(headlight);

const persp = new THREE.PerspectiveCamera(68, 1, 0.1, 420);
const sideCam = new THREE.PerspectiveCamera(30, 1, 1, 420);
const ortho = new THREE.OrthographicCamera(-10, 10, 10, -10, 1, 200);
ortho.up.set(0, 0, 1);
const CAMS = ['chase', 'fpv', 'side', 'top'];
const CAM_NAMES = { chase: '3D', fpv: 'Ego', side: 'Seite', top: '2D' };
let camMode = save.settings.cam;
let activeCam = persp;

function resize() {
  const w = window.innerWidth, h = window.innerHeight, a = w / h;
  renderer.setSize(w, h);
  persp.aspect = a; persp.fov = a < 1 ? 82 : 68; persp.updateProjectionMatrix();
  sideCam.aspect = a; sideCam.fov = a < 1 ? 55 : 30; sideCam.updateProjectionMatrix();
  let hh = 13, hw = hh * a;
  if (hw < 10) { hw = 10; hh = hw / a; }
  ortho.left = -hw; ortho.right = hw; ortho.top = hh; ortho.bottom = -hh; ortho.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

/* ================= Player ================= */
const scooter = makeScooter();
scene.add(scooter.root);
const turboFx = mesh(G('cone', 0.22, 1.4, 10), new THREE.MeshBasicMaterial({ color: '#ff9f1c', transparent: true, opacity: 0.85 }), 0, 0.4, -1.4);
turboFx.rotation.x = -Math.PI / 2;
turboFx.visible = false;
scooter.root.add(turboFx);
const magnetFx = mesh(G('torus', 1.6, 0.05, 6, 32), M('#ff4d6d', { emissive: '#ff4d6d', emissiveIntensity: 0.8 }), 0, 0.1, 0);
magnetFx.rotation.x = Math.PI / 2;
magnetFx.visible = false;
scooter.root.add(magnetFx);

const P = {};
const run = {};
let world = null;
let levelIdx = 0;
let state = 'menu';
let countdownT = 0;
let shake = 0;
let clock = 0;

function resetPlayer() {
  Object.assign(P, {
    x: -2.5, z: 0, y: 0, vx: 0, vy: 0, speed: 0, battery: 100, lives: 3, invuln: 0,
    shield: false, magnet: 0, turbo: 0, rampOb: null, rampLaunch: false, airT: 0, wheelRot: 0,
  });
  Object.assign(run, { score: 0, coins: 0, items: {}, combo: 0, comboT: 0, time: 0, airBonus: 0, crashes: 0, finished: false });
}

/* ================= Input ================= */
const keys = { left: false, right: false, gas: false, brake: false };
let jumpQueued = 0;
const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'gas', KeyW: 'gas', ArrowDown: 'brake', KeyS: 'brake',
};
window.addEventListener('keydown', (e) => {
  unlockAudio();
  if (KEYMAP[e.code]) { keys[KEYMAP[e.code]] = true; e.preventDefault(); }
  if (e.repeat) return;
  if (e.code === 'Space') { jumpQueued = 0.15; e.preventDefault(); }
  if (e.code === 'KeyC') cycleCam();
  if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) setCam(CAMS[+e.code.slice(5) - 1]);
  if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
});
window.addEventListener('keyup', (e) => { if (KEYMAP[e.code]) keys[KEYMAP[e.code]] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

document.querySelectorAll('.tc').forEach((b) => {
  const k = b.dataset.key;
  const down = (e) => {
    e.preventDefault(); unlockAudio();
    try { b.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    b.classList.add('on');
    if (k === 'jump') jumpQueued = 0.15; else keys[k] = true;
  };
  const up = (e) => { e.preventDefault(); b.classList.remove('on'); if (k !== 'jump') keys[k] = false; };
  b.addEventListener('pointerdown', down);
  b.addEventListener('pointerup', up);
  b.addEventListener('pointercancel', up);
  b.addEventListener('lostpointercapture', up);
});
window.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('pointerdown', unlockAudio, { once: false, passive: true });

/* ================= Feedback ================= */
function buzz(style = ImpactStyle.Light) {
  if (!save.settings.vibe) return;
  try { Haptics.impact({ style }).catch(() => {}); } catch { /* ignore */ }
}
const popLayer = $('popups');
const tmpV = new THREE.Vector3();
function popup(text, pos, color = '#fff') {
  if (popLayer.childElementCount > 24) popLayer.firstChild.remove();
  tmpV.copy(pos).project(activeCam);
  const el = document.createElement('div');
  el.className = 'popup';
  el.textContent = text;
  el.style.color = color;
  el.style.left = ((tmpV.x + 1) / 2) * window.innerWidth + 'px';
  el.style.top = ((1 - tmpV.y) / 2) * window.innerHeight + 'px';
  popLayer.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}
function banner(text, color) {
  const el = document.createElement('div');
  el.className = 'banner';
  el.textContent = text;
  if (color) el.style.color = color;
  popLayer.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}
function flash(hit) {
  const f = $('flash');
  f.classList.toggle('hit', !!hit);
  f.style.transition = 'none'; f.style.opacity = hit ? 0.45 : 0.6;
  requestAnimationFrame(() => { f.style.transition = 'opacity .35s'; f.style.opacity = 0; });
}

/* ================= Cameras ================= */
function setCam(mode) {
  camMode = mode;
  activeCam = mode === 'top' ? ortho : mode === 'side' ? sideCam : persp;
  $('cam-name').textContent = CAM_NAMES[mode];
  scooter.rider.visible = mode !== 'fpv';
  if (state === 'playing') flash(false);
  snapCam = true;
}
function cycleCam() { setCam(CAMS[(CAMS.indexOf(camMode) + 1) % CAMS.length]); sfx.click(); }
$('btn-cam').addEventListener('click', (e) => { e.stopPropagation(); cycleCam(); });

let snapCam = true;
const camPos = new THREE.Vector3();
const camLook = new THREE.Vector3();
const wantPos = new THREE.Vector3();
const wantLook = new THREE.Vector3();
function updateCamera(dt) {
  const sx = (Math.random() - 0.5) * shake, sy = (Math.random() - 0.5) * shake;
  shake = Math.max(0, shake - dt * 2.5);
  if (camMode === 'chase') {
    const back = 6.5 + P.speed * 0.08;
    wantPos.set(P.x * 0.7, 3.3 + P.y * 0.6, P.z - back);
    wantLook.set(P.x * 0.85, 1.3 + P.y * 0.8, P.z + 7);
  } else if (camMode === 'fpv') {
    wantPos.set(P.x, 1.95 + P.y, P.z - 0.05);
    wantLook.set(P.x + P.vx * 0.15, 1.35 + P.y, P.z + 10);
  } else if (camMode === 'side') {
    wantPos.set(-21, 4.5 + P.y * 0.3, P.z + 4);
    wantLook.set(0, 1.6, P.z + 4);
  } else {
    wantPos.set(P.x * 0.25, 60, P.z + 6);
    wantLook.set(P.x * 0.25, 0, P.z + 6);
  }
  const k = snapCam ? 1 : camMode === 'fpv' ? 1 : Math.min(1, dt * 8);
  camPos.lerp(wantPos, k);
  camLook.lerp(wantLook, k);
  if (camMode === 'fpv' || camMode === 'top') { camPos.z = wantPos.z; camLook.z = wantLook.z; }
  snapCam = false;
  activeCam.position.set(camPos.x + sx, camPos.y + sy, camPos.z);
  activeCam.lookAt(camLook.x + sx, camLook.y, camLook.z);
  if (camMode === 'fpv') activeCam.rotateZ(P.vx * 0.012);
  if (camMode !== 'top') {
    const fovBoost = camMode === 'side' ? 0 : Math.min(14, Math.max(0, P.speed - 12) * 0.9);
    const base = activeCam === persp ? (persp.aspect < 1 ? 82 : 68) : activeCam.fov;
    if (activeCam === persp && Math.abs(persp.fov - (base + fovBoost)) > 0.1) {
      persp.fov += (base + fovBoost - persp.fov) * Math.min(1, dt * 4);
      persp.updateProjectionMatrix();
    }
  }
}

/* ================= Level flow ================= */
function startLevel(i) {
  levelIdx = i;
  if (world) world.dispose();
  const L = LEVELS[i];
  world = buildLevel(scene, L);
  resetPlayer();
  for (const k in keys) keys[k] = false;
  const bg = new THREE.Color(world.typeAt(0) === 'street' ? L.sky : INTERIOR[world.typeAt(0)]);
  scene.background.copy(bg); scene.fog.color.copy(bg);
  setCam(save.settings.cam);
  snapCam = true;
  showScreen(null);
  $('hud').classList.remove('hidden');
  $('touch').classList.toggle('hidden', !isTouch);
  buildHudList();
  state = 'countdown';
  countdownT = 3.2;
  lastCount = -1;
  motorStart();
}

const INTERIOR = { mall: '#eadcc4', shop: '#e4edf5' };
const tmpColor = new THREE.Color();

function finishLevel(win, reason) {
  if (state !== 'playing') return;
  state = 'result';
  motorUpdate(0, false);
  const L = LEVELS[levelIdx];
  const listDone = Object.entries(L.list).every(([t, n]) => (run.items[t] || 0) >= n);
  const timeLeft = Math.max(0, Math.ceil(L.time - run.time));
  const timeBonus = win ? timeLeft * 20 : 0;
  const lifeBonus = win ? P.lives * 150 : 0;
  const total = run.score + timeBonus + lifeBonus;
  let stars = 0;
  if (win) { stars = 1; if (listDone) stars++; if (total >= L.target) stars++; }
  const prev = save.levels[levelIdx] || { best: 0, stars: 0 };
  const record = win && total > prev.best;
  if (win) {
    save.levels[levelIdx] = { best: Math.max(prev.best, total), stars: Math.max(prev.stars, stars) };
    persist();
  }
  win ? sfx.win() : sfx.lose();
  buzz(win ? ImpactStyle.Medium : ImpactStyle.Heavy);

  setTimeout(() => {
    $('res-title').textContent = win ? (stars === 3 ? 'Perfekt! 🏆' : 'Geschafft! 🎉') : reason;
    $('res-stars').innerHTML = [0, 1, 2].map((i) => `<span class="${i < stars ? '' : 'off'}">⭐</span>`).join('');
    const listTxt = Object.entries(L.list).map(([t, n]) => `${ITEM_INFO[t].icon} ${Math.min(run.items[t] || 0, n)}/${n}`).join('  ');
    const rows = [
      ['Münzen', run.coins],
      ['Einkaufsliste ' + (listDone ? '✅' : '❌'), listTxt],
      ['Sprung-Bonus', run.airBonus],
      ['Punkte', run.score],
    ];
    if (win) rows.push(['Zeitbonus (' + timeLeft + ' s)', '+' + timeBonus], ['Leben-Bonus', '+' + lifeBonus]);
    rows.push(['Gesamt' + (record ? ' – Rekord!' : ''), total]);
    rows.push(['Punkteziel für ⭐⭐⭐', L.target]);
    $('res-lines').innerHTML = rows.map(([k, v], i) => `<div class="${i === rows.length - 2 ? 'total' : ''}">${k}</div><div class="v ${i === rows.length - 2 ? 'total' : ''}">${v}</div>`).join('');
    const hasNext = levelIdx + 1 < LEVELS.length;
    $('btn-res-next').disabled = !(win && hasNext);
    $('btn-res-next').textContent = win && !hasNext ? 'Alle Level geschafft!' : 'Weiter ▶';
    showScreen('result');
    $('touch').classList.add('hidden');
  }, win ? 900 : 1200);
}

function togglePause() {
  if (state === 'playing' || state === 'countdown') {
    state = 'paused'; motorUpdate(0, false); showScreen('pause');
  } else if (state === 'paused') {
    showScreen(null); state = 'countdown'; countdownT = 1.2; lastCount = -1;
  }
}
$('btn-pause').addEventListener('click', (e) => { e.stopPropagation(); togglePause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && (state === 'playing' || state === 'countdown')) togglePause(); });
try {
  App.addListener('backButton', () => {
    if (state === 'playing' || state === 'countdown' || state === 'paused') togglePause();
    else if (!$('screen-menu').classList.contains('hidden')) App.exitApp();
    else showScreen('menu');
  });
} catch { /* web */ }

/* ================= Update ================= */
function rampSurface() {
  for (const ob of world.obstacles) {
    if (!ob.ramp) continue;
    const r = ob.ramp;
    if (P.z < r.z0 - 0.2 || P.z > r.z0 + r.len) continue;
    if (Math.abs(P.x - ob.x) > ob.hw) continue;
    return { y: r.h * Math.max(0, (P.z - r.z0) / r.len), ob };
  }
  return null;
}

function update(dt) {
  const L = LEVELS[levelIdx];
  run.time += dt;
  jumpQueued = Math.max(0, jumpQueued - dt);

  // ----- speed & battery -----
  const gas = keys.gas;
  let target;
  if (P.turbo > 0) target = 27;
  else if (keys.brake) target = 2.5;
  else if (gas) target = 19.5;
  else target = save.settings.autogas ? 13 : 0;
  if (P.battery <= 0 && P.turbo <= 0) target = Math.min(target, 7);
  const accel = target > P.speed ? (P.turbo > 0 ? 30 : 9) : keys.brake ? 26 : 5;
  P.speed += Math.sign(target - P.speed) * Math.min(Math.abs(target - P.speed), accel * dt);
  if (P.turbo <= 0) P.battery = Math.max(0, P.battery - dt * (gas ? 2.1 : 0.85));
  P.turbo = Math.max(0, P.turbo - dt);
  P.magnet = Math.max(0, P.magnet - dt);
  P.invuln = Math.max(0, P.invuln - dt);

  // ----- steering -----
  const steer = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  const latMax = 7 + P.speed * 0.22;
  P.vx += (-steer * latMax - P.vx) * Math.min(1, dt * 7);
  P.x += P.vx * dt;
  const half = Math.min(world.halfAt(P.z), world.halfAt(P.z + 4));
  if (P.x > half) { P.x = Math.max(half, P.x - 30 * dt); P.vx = Math.min(P.vx, 0); }
  if (P.x < -half) { P.x = Math.min(-half, P.x + 30 * dt); P.vx = Math.max(P.vx, 0); }
  P.z += P.speed * dt;

  // ----- vertical: ramps, jump, gravity -----
  const surf = rampSurface();
  const grounded = (surf && P.y <= surf.y + 0.35 && P.vy <= 0) || (P.y <= 0.001 && P.vy <= 0);
  if (jumpQueued > 0 && grounded) {
    P.vy = 8.2; jumpQueued = 0; P.rampOb = null; sfx.jump(); buzz();
  }
  if (surf && P.vy <= 0 && P.y <= surf.y + 0.35) {
    P.y = surf.y; P.vy = 0; P.rampOb = surf.ob;
  } else {
    if (P.rampOb && !surf && P.z > P.rampOb.ramp.z0 + P.rampOb.ramp.len * 0.6) {
      P.vy = 5.5 + P.speed * 0.32; P.rampLaunch = true; P.airT = 0; sfx.jump(); buzz();
    }
    P.rampOb = null;
    P.vy -= 24 * dt;
    P.y += P.vy * dt;
    if (P.y > 0) P.airT += dt;
    if (P.y <= 0) {
      if (P.vy < -5) { sfx.land(); }
      if (P.rampLaunch) {
        const pts = 100 + Math.round(P.airT * 150);
        run.score += pts; run.airBonus += pts;
        banner(`AIR +${pts}`, '#00d8ff');
        P.rampLaunch = false;
      }
      P.y = 0; P.vy = 0; P.airT = 0;
    }
  }

  // ----- combo -----
  if (run.comboT > 0) { run.comboT -= dt; if (run.comboT <= 0) run.combo = 0; }

  const behind = camMode === 'side' ? 45 : 25;
  const ahead = camMode === 'top' ? 45 : camMode === 'side' ? 75 : 190;

  // ----- obstacles -----
  for (const ob of world.obstacles) {
    const dz = ob.z - P.z;
    const vis = dz > -behind && dz < ahead;
    ob.mesh.visible = vis && !(ob.knocked && ob.kt > 2.5);
    if (!ob.active && dz < ob.triggerDist) ob.active = true;
    if (ob.knocked) {
      if (ob.kt < 3) {
        ob.kt += dt;
        const k = ob.kv;
        k.vy -= 22 * dt;
        ob.mesh.position.x += k.vx * dt; ob.mesh.position.y = Math.max(0, ob.mesh.position.y + k.vy * dt); ob.mesh.position.z += k.vz * dt;
        if (ob.mesh.position.y <= 0) { k.vx *= 0.9; k.vz *= 0.9; k.vy = Math.abs(k.vy) * 0.3; }
        ob.mesh.rotation.x += k.rx * dt; ob.mesh.rotation.z += k.rz * dt;
      }
      continue;
    }
    if (ob.active && (ob.vx || ob.vz)) {
      ob.x += ob.vx * dt; ob.z += ob.vz * dt;
      if (ob.minX !== undefined && (ob.x < ob.minX || ob.x > ob.maxX)) {
        if (ob.bounce) { ob.vx = -ob.vx; ob.mesh.rotation.y += Math.PI; ob.x = Math.max(ob.minX, Math.min(ob.maxX, ob.x)); }
        else { ob.vx = 0; ob.walk = false; }
      }
      ob.mesh.position.x = ob.x; ob.mesh.position.z = ob.z;
      if (ob.walk && ob.mesh.userData.legs) {
        const s = Math.sin(clock * 9 + ob.z) * 0.5;
        ob.mesh.userData.legs[0].rotation.x = s; ob.mesh.userData.legs[1].rotation.x = -s;
      }
      if (ob.kind === 'car' && Math.abs(dz) < 14 && Math.abs(ob.x - P.x) < 3 && !ob.honked) { ob.honked = true; sfx.honk(); }
    }
    // collision
    if (!ob.solid || Math.abs(ob.z - P.z) > ob.hl + 0.85 || Math.abs(ob.x - P.x) > ob.hw + 0.32) continue;
    if (P.y > ob.h - (ob.jumpable ? 0.3 : 0)) continue;
    hitObstacle(ob);
  }

  // ----- collectibles -----
  const magR = P.magnet > 0 ? 9 : 0;
  for (const c of world.collectibles) {
    if (c.taken) continue;
    const dz = c.z - P.z;
    const vis = dz > -behind && dz < ahead;
    c.mesh.visible = vis;
    if (!vis) continue;
    const inner = c.mesh.userData.inner;
    if (c.type === 'coin' && camMode === 'top') { c.mesh.rotation.x = -Math.PI / 2; inner.rotation.y = 0; }
    else { c.mesh.rotation.x = 0; inner.rotation.y += dt * (c.type === 'coin' ? 4 : 2); }
    if (magR && dz < magR && dz > -3 && Math.abs(c.x - P.x) < magR) {
      const k = Math.min(1, dt * 7);
      c.x += (P.x - c.x) * k; c.z += (P.z + 0.5 - c.z) * k; c.y += (P.y + 0.9 - c.y) * k; c.baseY = c.y;
    }
    c.mesh.position.set(c.x, c.baseY + Math.sin(clock * 3 + c.phase) * 0.12, c.z);
    const dx = c.x - P.x, dzz = c.z - P.z, dy = c.y - (P.y + 0.9);
    if (dx * dx + dzz * dzz < 1.25 && Math.abs(dy) < 1.4) collect(c);
  }

  // ----- doors -----
  for (const d of world.doors) {
    const want = P.z > d.z - 22 && P.z < d.z + 12 ? 1 : 0;
    if (want && d.open < 0.01) sfx.door();
    d.open += (want - d.open) * Math.min(1, dt * 4);
    for (const p of d.parts) p.obj.position.x = p.closedX + (p.openX - p.closedX) * d.open;
  }

  // ----- finish / fail -----
  if (P.z >= world.length) { run.finished = true; banner('ZIEL!', '#ffcc00'); finishLevel(true); }
  else if (run.time >= L.time) finishLevel(false, 'Zeit abgelaufen ⏰');
}

function hitObstacle(ob) {
  const small = ob.knockable;
  if (small) {
    ob.knocked = true; ob.kt = 0;
    ob.kv = { vx: (ob.x - P.x) * 3 + (Math.random() - 0.5) * 4, vy: 5 + P.speed * 0.2, vz: P.speed * 0.7, rx: (Math.random() - 0.5) * 12, rz: (Math.random() - 0.5) * 12 };
    sfx.knock();
    if (P.turbo > 0) { run.score += 25; popup('STRIKE +25', ob.mesh.position.clone().setY(1.5), '#ffcc00'); return; }
    P.speed *= 0.45; run.combo = 0; run.comboT = 0; shake = 0.35; buzz(ImpactStyle.Medium);
    popup('Autsch!', ob.mesh.position.clone().setY(1.6), '#ff9f43');
    return;
  }
  if (P.invuln > 0) return;
  if (P.shield) {
    P.shield = false; P.invuln = 1.2; sfx.shield(); buzz(ImpactStyle.Medium);
    banner('Schild!', '#4cc9f0'); shake = 0.4;
    return;
  }
  P.lives--; run.crashes++;
  P.invuln = 2.2; P.speed = 2; run.combo = 0; run.comboT = 0;
  P.vx = (P.x >= ob.x ? 1 : -1) * 8;
  shake = 0.9; flash(true); sfx.crash(); buzz(ImpactStyle.Heavy);
  banner(ob.kind === 'car' ? 'CRASH! 🚗' : ob.kind === 'person' ? 'Pardon! 🙈' : 'BONK!', '#ff4d6d');
  if (P.lives <= 0) finishLevel(false, 'Keine Leben mehr 💥');
}

function collect(c) {
  c.taken = true;
  c.mesh.visible = false;
  const info = ITEM_INFO[c.type];
  run.combo++; run.comboT = 2.4;
  const mult = Math.min(5, 1 + Math.floor(run.combo / 6));
  const pts = info.pts * mult;
  run.score += pts;
  const pos = new THREE.Vector3(c.x, c.y + 0.6, c.z);
  switch (c.type) {
    case 'coin': run.coins++; sfx.coin(run.combo); break;
    case 'battery': P.battery = Math.min(100, P.battery + 35); sfx.battery(); popup('+35% 🔋', pos, '#3ddc84'); buzz(); return;
    case 'magnet': P.magnet = 9; sfx.power(); banner('MAGNET 🧲'); buzz(); return;
    case 'shield': P.shield = true; sfx.power(); banner('SCHILD 🛡️', '#4cc9f0'); buzz(); return;
    case 'turbo': P.turbo = 4.5; sfx.power(); banner('TURBO 🚀', '#ff9f1c'); buzz(ImpactStyle.Medium); shake = 0.2; return;
    case 'star': sfx.power(); banner(`SUPERSTERN +${pts}`); buzz(); return;
    default: {
      run.items[c.type] = (run.items[c.type] || 0) + 1;
      sfx.item(); buzz();
      const need = LEVELS[levelIdx].list[c.type];
      if (need && run.items[c.type] === need) banner(`${info.icon} erledigt!`, '#3ddc84');
      popup(`${info.icon} +${pts}`, pos, '#ffcc00');
      return;
    }
  }
  if (mult > 1 && run.combo % 6 === 0) banner(`COMBO x${mult}!`);
  else popup(`+${pts}`, pos, '#ffe066');
}

/* ================= Visual sync ================= */
function syncVisuals(dt) {
  const L = LEVELS[levelIdx];
  const r = scooter.root;
  r.position.set(P.x, P.y, P.z);
  r.rotation.y = Math.atan2(P.vx, Math.max(4, P.speed)) * 0.7;
  scooter.body.rotation.z = -P.vx * 0.025;
  scooter.body.rotation.x = P.y > 0.05 ? -Math.min(0.35, P.vy * 0.03) : 0;
  P.wheelRot += (P.speed * dt) / 0.21;
  for (const w of scooter.wheels) w.rotation.x = P.wheelRot;
  scooter.shadow.position.y = -P.y + 0.03 + (P.rampOb ? 0 : 0);
  scooter.shadow.scale.setScalar(Math.max(0.4, 1 - P.y * 0.15));
  scooter.shield.visible = P.shield;
  scooter.shield.rotation.y += dt;
  turboFx.visible = P.turbo > 0;
  turboFx.scale.set(1, 0.7 + Math.random() * 0.6, 1);
  magnetFx.visible = P.magnet > 0;
  magnetFx.rotation.z += dt * 4;
  scooter.body.visible = !(P.invuln > 0 && Math.floor(clock * 12) % 2 === 0 && camMode !== 'fpv');

  // world chunk culling
  const behind = camMode === 'side' ? 45 : 25;
  const ahead = camMode === 'top' ? 45 : camMode === 'side' ? 75 : 190;
  for (const c of world.chunks) {
    c.group.visible = c.z1 > P.z - behind && c.z0 < P.z + ahead;
    c.neg.visible = camMode !== 'side';
  }

  // atmosphere per area
  const type = world.typeAt(P.z + 6);
  const interior = type !== 'street';
  tmpColor.set(interior ? INTERIOR[type] : L.sky);
  const k = Math.min(1, dt * 2.5);
  scene.background.lerp(tmpColor, k);
  scene.fog.color.copy(scene.background);
  const hemiT = interior ? 1.9 : L.night ? 0.55 : 1.8;
  const sunT = interior ? 0.7 : L.night ? 0.2 : 1.8;
  hemi.intensity += (hemiT - hemi.intensity) * k;
  sun.intensity += (sunT - sun.intensity) * k;
  if (camMode === 'top') { scene.fog.near = 500; scene.fog.far = 600; }
  else if (camMode === 'side') { scene.fog.near = 90; scene.fog.far = 220; }
  else { scene.fog.near = interior ? 50 : 70; scene.fog.far = interior ? 150 : 185; }
  headlight.intensity = L.night && !interior ? 40 : 0;
  headlight.position.set(P.x, 1.6 + P.y, P.z + 3);
  sun.position.set(P.x - 20, 40, P.z - 10);
  sun.target.position.set(P.x, 0, P.z);
}

/* ================= HUD ================= */
const hudCache = {};
function setText(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; $(id).textContent = v; } }
function setHTML(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; $(id).innerHTML = v; } }
function buildHudList() { for (const k in hudCache) delete hudCache[k]; }
function updateHud() {
  const L = LEVELS[levelIdx];
  setText('hud-score', run.score.toLocaleString('de-CH'));
  const mult = Math.min(5, 1 + Math.floor(run.combo / 6));
  setText('hud-mult', 'x' + mult);
  $('hud-mult').classList.toggle('hidden', mult < 2);
  const tl = Math.max(0, Math.ceil(L.time - run.time));
  setText('hud-time', tl + ' s');
  setHTML('hud-lives', '❤️'.repeat(Math.max(0, P.lives)) + '<span style="opacity:.25">' + '❤️'.repeat(Math.max(0, 3 - P.lives)) + '</span>');
  const bf = $('hud-battery-fill');
  const bw = Math.round(P.battery) + '%';
  if (hudCache.bat !== bw) { hudCache.bat = bw; bf.style.width = bw; bf.classList.toggle('low', P.battery < 20); }
  setHTML('hud-list', Object.entries(L.list).map(([t, n]) => {
    const h = Math.min(run.items[t] || 0, n);
    return `<span class="it ${h >= n ? 'done' : ''}">${ITEM_INFO[t].icon} ${h}/${n}</span>`;
  }).join(''));
  const pw = [];
  if (P.magnet > 0) pw.push(`🧲 ${Math.ceil(P.magnet)}`);
  if (P.turbo > 0) pw.push(`🚀 ${Math.ceil(P.turbo)}`);
  if (P.shield) pw.push('🛡️');
  setHTML('hud-powers', pw.map((p) => `<span class="pw">${p}</span>`).join(''));
  const prog = Math.min(100, (P.z / world.length) * 100).toFixed(1) + '%';
  if (hudCache.prog !== prog) { hudCache.prog = prog; $('hud-progress').style.width = prog; $('hud-progress-dot').style.left = prog; }
}

/* ================= Main loop ================= */
let last = performance.now();
let lastCount = -1;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  clock += dt;
  showroom.visible = state === 'menu';

  if (state === 'menu') {
    // attract mode: slow orbit around the scooter
    scooter.root.position.set(0, 0, 0);
    scooter.root.rotation.y = clock * 0.5;
    for (const w of scooter.wheels) w.rotation.x += dt * 4;
    persp.position.set(Math.sin(clock * 0.2) * 4, 2.2, -4.5);
    persp.lookAt(0, 1, 0);
    renderer.render(scene, persp);
    return;
  }
  if (!world) return;

  if (state === 'countdown') {
    countdownT -= dt;
    const n = Math.ceil(countdownT - 0.2);
    if (n !== lastCount) {
      lastCount = n;
      const el = $('countdown');
      if (n > 0) { el.textContent = n; el.className = ''; sfx.count(false); }
      else { el.textContent = 'LOS!'; el.className = 'go'; sfx.count(true); }
    }
    if (countdownT <= 0) { state = 'playing'; $('countdown').className = 'hidden'; }
  }
  if (state === 'playing') update(dt);
  if (state === 'result' && run.finished) { P.speed = Math.max(0, P.speed - dt * 10); P.z += P.speed * dt; }
  syncVisuals(dt);
  updateCamera(dt);
  if (state === 'playing' || state === 'countdown' || state === 'result') updateHud();
  motorUpdate(P.speed, state === 'playing');
  renderer.render(scene, activeCam);
}

/* ================= Screens / menus ================= */
const SCREENS = ['menu', 'levels', 'intro', 'pause', 'result', 'settings', 'help'];
function showScreen(name) {
  for (const s of SCREENS) $('screen-' + s).classList.toggle('hidden', s !== name);
  document.body.classList.toggle('menu-open', name === 'menu' || name === 'levels');
  if (name === 'menu' || name === 'levels' || name === 'settings' || name === 'help') {
    $('hud').classList.add('hidden'); $('touch').classList.add('hidden');
  }
  if (name === 'levels') renderLevelGrid();
  if (name === 'menu') renderMenuTotal();
}

function unlocked(i) { return i === 0 || (save.levels[i - 1] && save.levels[i - 1].stars > 0); }

function renderLevelGrid() {
  $('level-grid').innerHTML = LEVELS.map((L, i) => {
    const s = save.levels[i];
    const lock = !unlocked(i);
    const stars = s ? '⭐'.repeat(s.stars) + '☆'.repeat(3 - s.stars) : '☆☆☆';
    const icons = [...new Set(L.segments.map((x) => ({ street: '🛣️', mall: '🏬', shop: '🛒' })[x.type]))].join(' ');
    return `<button class="lvl ${lock ? 'locked' : ''}" data-i="${i}" ${lock ? 'disabled' : ''}>
      <span class="n">Level ${i + 1} ${lock ? '🔒' : ''} ${L.night ? '🌙' : ''}</span>
      <span class="t">${L.name}</span><span class="b">${icons}</span>
      <span class="s">${stars}</span><span class="b">${s ? 'Rekord: ' + s.best : ''}</span></button>`;
  }).join('');
  $('level-grid').querySelectorAll('.lvl').forEach((b) => b.addEventListener('click', () => { sfx.click(); openIntro(+b.dataset.i); }));
}

function renderMenuTotal() {
  const st = Object.values(save.levels).reduce((a, l) => a + l.stars, 0);
  $('menu-total').textContent = `⭐ ${st} / ${LEVELS.length * 3} Sterne gesammelt`;
}

function openIntro(i) {
  levelIdx = i;
  const L = LEVELS[i];
  $('intro-num').textContent = `Level ${i + 1} / ${LEVELS.length}`;
  $('intro-name').textContent = L.name;
  $('intro-desc').textContent = L.desc;
  $('intro-list').innerHTML = Object.entries(L.list).map(([t, n]) => `<span class="it">${ITEM_INFO[t].icon} ${n}× ${ITEM_INFO[t].name}</span>`).join('');
  $('intro-goal').textContent = `⏱ ${L.time} s Zeit · ⭐⭐⭐ ab ${L.target} Punkten · Tipp: 🎥 wechselt die Kamera`;
  showScreen('intro');
}

$('btn-play').addEventListener('click', () => {
  unlockAudio(); sfx.click();
  let i = 0;
  while (i + 1 < LEVELS.length && unlocked(i + 1) && save.levels[i]) i++;
  openIntro(i);
});
$('btn-levels').addEventListener('click', () => { unlockAudio(); sfx.click(); showScreen('levels'); });
$('btn-settings').addEventListener('click', () => { sfx.click(); syncSettingsUi(); showScreen('settings'); });
$('btn-help').addEventListener('click', () => { sfx.click(); showScreen('help'); });
$('btn-start').addEventListener('click', () => { unlockAudio(); startLevel(levelIdx); });
document.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => { sfx.click(); showScreen(b.dataset.back); }));
$('btn-resume').addEventListener('click', () => togglePause());
$('btn-restart').addEventListener('click', () => startLevel(levelIdx));
$('btn-quit').addEventListener('click', () => goMenu());
$('btn-res-menu').addEventListener('click', () => goMenu());
$('btn-res-retry').addEventListener('click', () => startLevel(levelIdx));
$('btn-res-next').addEventListener('click', () => openIntro(levelIdx + 1));

function goMenu() {
  state = 'menu';
  motorUpdate(0, false);
  if (world) { world.dispose(); world = null; }
  scene.background.set('#0b1020'); scene.fog.color.set('#0b1020');
  scooter.rider.visible = true; scooter.body.visible = true;
  scooter.shield.visible = false; turboFx.visible = false; magnetFx.visible = false;
  hemi.intensity = 1.8; sun.intensity = 1.8; headlight.intensity = 0;
  sun.position.set(-20, 40, -10); sun.target.position.set(0, 0, 0);
  persp.fov = persp.aspect < 1 ? 82 : 68; persp.updateProjectionMatrix();
  $('countdown').className = 'hidden';
  showScreen('menu');
}

function syncSettingsUi() {
  $('set-sound').checked = save.settings.sound;
  $('set-vibe').checked = save.settings.vibe;
  $('set-autogas').checked = save.settings.autogas;
  $('set-cam').value = save.settings.cam;
}
$('set-sound').addEventListener('change', (e) => { save.settings.sound = e.target.checked; setSoundEnabled(e.target.checked); persist(); });
$('set-vibe').addEventListener('change', (e) => { save.settings.vibe = e.target.checked; persist(); });
$('set-autogas').addEventListener('change', (e) => { save.settings.autogas = e.target.checked; persist(); });
$('set-cam').addEventListener('change', (e) => { save.settings.cam = e.target.value; persist(); });
// two-tap confirmation (native confirm() dialogs are blocked in some webviews)
let resetArmed = 0;
$('btn-reset').addEventListener('click', () => {
  const b = $('btn-reset');
  if (Date.now() - resetArmed < 4000) {
    save.levels = {}; persist(); b.textContent = 'Fortschritt löschen'; resetArmed = 0; showScreen('menu');
    return;
  }
  resetArmed = Date.now();
  b.textContent = 'Nochmal tippen zum Löschen';
  setTimeout(() => { if (Date.now() - resetArmed >= 4000) b.textContent = 'Fortschritt löschen'; }, 4100);
});

// Menu backdrop: a small showroom
const showroom = new THREE.Group();
const floor = mesh(G('circle', 6, 40), M('#1d2850'));
floor.rotation.x = -Math.PI / 2;
showroom.add(floor);
const ring = mesh(G('torus', 5.8, 0.06, 6, 64), M('#00d8ff', { emissive: '#00d8ff', emissiveIntensity: 1 }), 0, 0.02, 0);
ring.rotation.x = Math.PI / 2;
showroom.add(ring);
scene.add(showroom);
// debug handle for automated tests
window.__dbg = { P, run, get world() { return world; }, keys, setCam, startLevel, get state() { return state; } };

scene.background.set('#0b1020');
scene.fog.color.set('#0b1020');
showScreen('menu');
requestAnimationFrame(frame);

