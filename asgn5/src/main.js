import * as THREE from '../node_modules/three/build/three.module.js';

const canvas = document.getElementById('game');
const hudObjective = document.getElementById('objective');
const fpsBox = document.getElementById('fps');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x071326, 28, 135);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.08, 260);
camera.position.set(0, 1.55, 17);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setClearColor(0x071326, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.28;
renderer.shadowMap.enabled = false;
renderer.info.autoReset = false;

let renderScale = window.innerWidth > 1400 ? 0.42 : 0.55;
function resize() {
  const w = Math.max(480, Math.floor(window.innerWidth * renderScale));
  const h = Math.max(270, Math.floor(window.innerHeight * renderScale));
  renderer.setPixelRatio(1);
  renderer.setSize(w, h, false);
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const loader = new THREE.TextureLoader();
function tex(path, repeat = 1) {
  const t = loader.load(path);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestMipmapLinearFilter;
  t.anisotropy = 1;
  return t;
}

const textures = {
  grass: tex('assets/textures/grass.png', 32),
  wood: tex('assets/textures/wood.png', 1),
  stone: tex('assets/textures/stone.png', 3),
  crate: tex('assets/textures/crate.png', 1),
  cabin: tex('assets/textures/cabin.png', 1),
  radio: tex('assets/textures/radio_diffuse.png', 1)
};

function phong(options) {
  return new THREE.MeshPhongMaterial({
    shininess: options.shininess ?? 22,
    specular: options.specular ?? 0x202840,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    ...options
  });
}

const mat = {
  grass: phong({ map: textures.grass, color: 0x7faa5f, shininess: 6, specular: 0x101810 }),
  wood: phong({ map: textures.wood, color: 0xc18c54, shininess: 18, specular: 0x2a1b10 }),
  stone: phong({ map: textures.stone, color: 0xaab2bd, shininess: 28, specular: 0x4a5363 }),
  crate: phong({ map: textures.crate, color: 0xffffff, shininess: 35, specular: 0x777777 }),
  cabin: phong({ map: textures.cabin, color: 0xd5b17c, shininess: 16, specular: 0x2d2218 }),
  dark: phong({ color: 0x0b0f16, shininess: 12, specular: 0x111111 }),
  metal: phong({ color: 0x7d94aa, shininess: 80, specular: 0xb9d7f0 }),
  trunk: phong({ color: 0x5e351e, shininess: 10, specular: 0x1c1008 }),
  leaves: phong({ color: 0x0b6436, shininess: 14, specular: 0x102a17 }),
  glow: new THREE.MeshBasicMaterial({ color: 0x8dffe4, toneMapped: false }),
  orangeGlow: new THREE.MeshBasicMaterial({ color: 0xff9b30, toneMapped: false }),
  red: new THREE.MeshBasicMaterial({ color: 0xff3344, toneMapped: false }),
  yellow: new THREE.MeshBasicMaterial({ color: 0xfff15a, toneMapped: false }),
  windowGlow: new THREE.MeshBasicMaterial({ color: 0xffe38a, toneMapped: false })
};

const geos = {
  box: new THREE.BoxGeometry(1, 1, 1),
  crate: new THREE.BoxGeometry(1.4, 1.1, 1.4),
  cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
  cone: new THREE.ConeGeometry(1, 2.2, 8),
  sphere: new THREE.SphereGeometry(1, 12, 8),
  rock: new THREE.DodecahedronGeometry(1, 0),
  plane: new THREE.PlaneGeometry(220, 220, 1, 1)
};

let visibleShapeCount = 0;
function add(mesh) { scene.add(mesh); visibleShapeCount++; return mesh; }
function mesh(geo, material, pos, scale, rotY = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(pos[0], pos[1], pos[2]);
  m.scale.set(scale[0], scale[1], scale[2]);
  m.rotation.y = rotY;
  return add(m);
}

const circleGeo = new THREE.CircleGeometry(1, 24);
function glowDisc(x, z, radius, color, opacity) {
  const m = new THREE.Mesh(circleGeo, new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false
  }));
  m.position.set(x, 0.018, z);
  m.rotation.x = -Math.PI / 2;
  m.scale.set(radius, radius, radius);
  scene.add(m);
  return m;
}
function fakeShadow(x, z, sx, sz, opacity = 0.22) {
  const m = new THREE.Mesh(circleGeo, new THREE.MeshBasicMaterial({
    color: 0x000000, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide
  }));
  m.position.set(x, 0.016, z);
  m.rotation.x = -Math.PI / 2;
  m.scale.set(sx, sz, 1);
  scene.add(m);
  return m;
}

// ASG4-inspired lighting: low ambient base + cool moon + warm point light + focused spotlight.
// This gives the scene real diffuse/specular contrast without expensive real-time shadows.
const ambient = new THREE.AmbientLight(0x1a2438, 0.34);
scene.add(ambient);
const hemi = new THREE.HemisphereLight(0x9bc8ff, 0x0d2b16, 0.86);
scene.add(hemi);
const moon = new THREE.DirectionalLight(0xc8ddff, 1.35);
moon.position.set(-24, 46, 26);
scene.add(moon);
const campfireLight = new THREE.PointLight(0xff8c35, 7.0, 30, 2.0);
campfireLight.position.set(-5, 2.4, 5);
scene.add(campfireLight);
const cabinLight = new THREE.PointLight(0xffd37a, 2.8, 20, 2.0);
cabinLight.position.set(-8.3, 2.35, 5.4);
scene.add(cabinLight);
const radioLight = new THREE.PointLight(0x4affef, 1.55, 15, 2.0);
radioLight.position.set(0, 1.35, -5.5);
scene.add(radioLight);
const beaconSpot = new THREE.SpotLight(0x79fff1, 0.0, 80, Math.PI / 7, 0.45, 1.5);
beaconSpot.position.set(8, 13, -7);
beaconSpot.target.position.set(8, 0, -7);
scene.add(beaconSpot, beaconSpot.target);

// Textured skybox built from a large inside-out cube.
const skyMats = ['px','nx','py','ny','pz','nz'].map(s => new THREE.MeshBasicMaterial({
  map: loader.load(`assets/textures/sky_${s}.png`), side: THREE.BackSide, fog: false
}));
const skybox = new THREE.Mesh(new THREE.BoxGeometry(240, 240, 240), skyMats);
skybox.position.y = 40;
scene.add(skybox);

// Ground.
const ground = new THREE.Mesh(geos.plane, mat.grass);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
visibleShapeCount++;

// Survival camp structures.
mesh(geos.box, mat.cabin, [-11, 2, 2], [6, 4, 7]);
mesh(geos.box, mat.dark, [-11, 5.0, 2], [7.4, 0.6, 8.4]);
mesh(geos.box, mat.windowGlow, [-8.1, 2.2, 5.56], [1.5, 1.2, 0.05]);
mesh(geos.box, mat.wood, [6, 1.6, -8], [5.5, 3.2, 4.6]);
mesh(geos.box, mat.dark, [6, 3.55, -8], [6.4, 0.45, 5.6]);
mesh(geos.cyl, mat.metal, [8, 5.5, -7], [0.45, 10.5, 0.45]);
mesh(geos.sphere, mat.glow, [8, 11.2, -7], [1.05, 1.05, 1.05]);
mesh(geos.box, mat.dark, [8, 9.4, -7], [3, 0.35, 3]);

// Campfire.
mesh(geos.cyl, mat.stone, [-5, 0.15, 5], [1.8, 0.3, 1.8]);
const flame = mesh(geos.cone, mat.orangeGlow, [-5, 1.0, 5], [0.75, 1.8, 0.75]);
const flame2 = mesh(geos.cone, mat.yellow, [-5, 1.15, 5], [0.4, 1.2, 0.4]);
const campfireGlowDisc = glowDisc(-5, 5, 8.5, 0xff7b24, 0.34);
const cabinWindowGlowDisc = glowDisc(-8.2, 5.1, 5.2, 0xffd17b, 0.22);
const radioGlowDisc = glowDisc(0, -5.5, 4.2, 0x38fff4, 0.16);
fakeShadow(-11, 2, 6.0, 7.0, 0.32);
fakeShadow(6, -8, 5.2, 4.8, 0.28);
fakeShadow(8, -7, 2.8, 2.8, 0.26);
fakeShadow(-5, 5, 2.0, 2.0, 0.18);

// Gate and walls.
const gateLeft = mesh(geos.box, mat.wood, [-1.7, 1.5, -20], [0.35, 3, 3.8]);
const gateRight = mesh(geos.box, mat.wood, [1.7, 1.5, -20], [0.35, 3, 3.8]);
for (let x = -20; x <= 20; x += 4) {
  if (Math.abs(x) < 3) continue;
  mesh(geos.box, mat.wood, [x, 1.15, -20], [0.35, 2.3, 0.35]);
  mesh(geos.box, mat.wood, [x, 2.25, -20], [3.5, 0.25, 0.25]);
}

// Instanced repeated props: one draw call per prop type.
const treePositions = [
  [-24,-9],[-22,10],[-18,-17],[-16,16],[-13,-10],[-7,-18],[-3,19],[4,17],[11,-17],[14,13],[20,-8],[24,8],[-28,5],[27,-18],[-26,20],[18,21]
];
const trunks = new THREE.InstancedMesh(geos.cyl, mat.trunk, treePositions.length);
const leaves = new THREE.InstancedMesh(geos.cone, mat.leaves, treePositions.length);
let dummy = new THREE.Object3D();
treePositions.forEach(([x,z], i) => {
  dummy.position.set(x, 1.7, z); dummy.scale.set(0.35, 3.4, 0.35); dummy.rotation.set(0,0.1*i,0); dummy.updateMatrix(); trunks.setMatrixAt(i, dummy.matrix);
  dummy.position.set(x, 4.4, z); dummy.scale.set(1.6, 1.9, 1.6); dummy.rotation.set(0,0.2*i,0); dummy.updateMatrix(); leaves.setMatrixAt(i, dummy.matrix);
});
scene.add(trunks, leaves); visibleShapeCount += treePositions.length * 2;

const rockPositions = [[-18,6],[-15,-5],[-10,13],[-3,-13],[3,10],[12,5],[17,-14],[22,18],[-24,-18]];
const rocks = new THREE.InstancedMesh(geos.rock, mat.stone, rockPositions.length);
rockPositions.forEach(([x,z], i) => {
  dummy.position.set(x, 0.45, z); dummy.scale.set(0.5+0.2*(i%3),0.35+0.1*(i%2),0.6+0.18*(i%4)); dummy.rotation.set(i, i*0.4, i*0.2); dummy.updateMatrix(); rocks.setMatrixAt(i, dummy.matrix);
});
scene.add(rocks); visibleShapeCount += rockPositions.length;

// Supplies and objective objects.
const supplies = [
  { pos: new THREE.Vector3(-16, 0.65, -9), picked: false },
  { pos: new THREE.Vector3(14, 0.65, 9), picked: false },
  { pos: new THREE.Vector3(-2, 0.65, -14), picked: false },
  { pos: new THREE.Vector3(18, 0.65, -2), picked: false }
];
for (const s of supplies) {
  s.mesh = mesh(geos.crate, mat.crate, [s.pos.x, s.pos.y, s.pos.z], [1,1,1]);
  s.beam = mesh(geos.cyl, mat.glow, [s.pos.x, 2.5, s.pos.z], [0.07, 3.6, 0.07]);
}

let radioObject = null;
let radioRepaired = false;
let gateOpen = false;
let suppliesCollected = 0;
let beaconActive = false;

async function loadCustomOBJMTL(objURL, mtlURL) {
  // Small OBJ/MTL loader for this assignment: loads material texture from .mtl and parses OBJ vertices/uvs/faces.
  const [objText, mtlText] = await Promise.all([fetch(objURL).then(r => r.text()), fetch(mtlURL).then(r => r.text())]);
  let texturePath = 'assets/model/radio_diffuse.png';
  for (const line of mtlText.split('\n')) {
    const parts = line.trim().split(/\s+/);
    if (parts[0] === 'map_Kd' && parts[1]) texturePath = 'assets/model/' + parts.slice(1).join(' ');
  }
  const modelTex = loader.load(texturePath);
  modelTex.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshPhongMaterial({ map: modelTex, shininess: 60, specular: 0x80ffee, emissive: 0x063933, emissiveIntensity: 0.18 });
  const verts = [], uvs = [], normals = [];
  const outPos = [], outUv = [], outNorm = [];
  function pushVert(token) {
    const [vi, ti, ni] = token.split('/').map(v => v ? parseInt(v, 10) : 0);
    const v = verts[vi - 1]; const uv = uvs[ti - 1] || [0,0]; const n = normals[ni - 1] || [0,1,0];
    outPos.push(v[0], v[1], v[2]); outUv.push(uv[0], uv[1]); outNorm.push(n[0], n[1], n[2]);
  }
  for (const raw of objText.split('\n')) {
    const line = raw.trim(); if (!line || line.startsWith('#')) continue;
    const p = line.split(/\s+/);
    if (p[0] === 'v') verts.push(p.slice(1,4).map(Number));
    else if (p[0] === 'vt') uvs.push(p.slice(1,3).map(Number));
    else if (p[0] === 'vn') normals.push(p.slice(1,4).map(Number));
    else if (p[0] === 'f') {
      for (let i = 2; i < p.length - 1; i++) { pushVert(p[1]); pushVert(p[i]); pushVert(p[i+1]); }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(outPos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(outUv, 2));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(outNorm, 3));
  geo.computeBoundingSphere();
  return new THREE.Mesh(geo, material);
}

loadCustomOBJMTL('assets/model/radio.obj', 'assets/model/radio.mtl').then(obj => {
  radioObject = obj;
  obj.position.set(0, 0.1, -5.5);
  obj.scale.set(1.5, 1.5, 1.5);
  obj.rotation.y = Math.PI;
  scene.add(obj); visibleShapeCount++;
}).catch(err => {
  console.error('OBJ/MTL load failed, fallback radio shown:', err);
  radioObject = mesh(geos.box, mat.glow, [0, 0.8, -5.5], [2.6,1.2,1.2]);
});

// Movement and collision from Assignment 3 style, simplified for this scene.
const keys = Object.create(null);
let yaw = -Math.PI / 2;
let pitch = 0;
let pointerLocked = false;
const blocked = [
  {x:-11,z:2,r:5.4}, {x:6,z:-8,r:4.6}, {x:8,z:-7,r:1.2}, {x:-5,z:5,r:2.0}
];
function resetPlayer() { camera.position.set(0, 1.55, 17); yaw = -Math.PI / 2; pitch = 0; updateCameraLook(); }
function isBlocked(x,z) {
  if (x < -34 || x > 34 || z < -28 || z > 25) return true;
  if (!gateOpen && z < -18.3 && Math.abs(x) < 3.2) return true;
  for (const b of blocked) { const dx=x-b.x, dz=z-b.z; if (dx*dx+dz*dz < b.r*b.r) return true; }
  return false;
}
function updateCameraLook() {
  pitch = Math.max(-1.25, Math.min(1.2, pitch));
  const dir = new THREE.Vector3(Math.cos(pitch)*Math.cos(yaw), Math.sin(pitch), Math.cos(pitch)*Math.sin(yaw));
  camera.lookAt(camera.position.clone().add(dir));
}
window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === 'e') interact();
  if (e.key.toLowerCase() === 'f') launchFireworks(true);
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
window.addEventListener('mousemove', e => {
  if (!pointerLocked) return;
  // Normal FPS feel: mouse right turns right, mouse down looks down.
  // Sensitivity is intentionally low so it does not feel slippery.
  const mouseSensitivity = 0.00135;
  yaw += e.movementX * mouseSensitivity;
  pitch -= e.movementY * mouseSensitivity;
  updateCameraLook();
});
document.addEventListener('pointerlockchange', () => { pointerLocked = document.pointerLockElement === canvas; });
canvas.addEventListener('click', () => canvas.requestPointerLock && canvas.requestPointerLock());
startBtn.addEventListener('click', () => canvas.requestPointerLock && canvas.requestPointerLock());
resetBtn.addEventListener('click', resetPlayer);
updateCameraLook();

function interact() {
  const p = camera.position;
  for (const s of supplies) {
    if (!s.picked && p.distanceTo(s.pos) < 3.0) {
      s.picked = true; suppliesCollected++;
      s.mesh.visible = false; s.beam.visible = false;
      updateObjective('Supply collected.'); return;
    }
  }
  if (radioObject && p.distanceTo(radioObject.position) < 4.0) {
    if (suppliesCollected >= 4 && !radioRepaired) {
      radioRepaired = true; beaconSpot.intensity = 7.5; beaconActive = true; radioLight.intensity = 4.0; updateObjective('Radio repaired. Go to the front gate.'); return;
    }
    if (!radioRepaired) { updateObjective('Need all four supplies before repairing the radio.'); return; }
  }
  const gatePos = new THREE.Vector3(0, 1.5, -20);
  if (radioRepaired && !gateOpen && p.distanceTo(gatePos) < 6.0) {
    gateOpen = true; gateLeft.position.x -= 3.2; gateRight.position.x += 3.2; launchFireworks(false); updateObjective('Gate opened. Rescue fireworks launched.'); return;
  }
  updateObjective('Move closer to a glowing supply crate, radio, or gate.');
}
function updateObjective(prefix = '') {
  const base = `Supplies collected: ${suppliesCollected} / 4`;
  let next = 'Find the glowing supply crates.';
  if (suppliesCollected >= 4 && !radioRepaired) next = 'Return to the radio console and press E.';
  if (radioRepaired && !gateOpen) next = 'Go to the front gate and press E.';
  if (gateOpen) next = 'Rescue active. Press F for more fireworks.';
  hudObjective.textContent = `${prefix} ${base}. ${next}`;
}

// Fireworks: visible, cheap one geometry per burst.
const fireworks = [];
const fireworkFlashes = [];
function launchFireworks(inFront) {
  const origin = inFront
    ? camera.position.clone().add(new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw)).multiplyScalar(18)).add(new THREE.Vector3(0, 14, 0))
    : new THREE.Vector3(0, 18, -19);
  const flash = new THREE.PointLight(0xffffff, 10, 70, 2);
  flash.position.copy(origin);
  scene.add(flash);
  fireworkFlashes.push({ light: flash, age: 0, life: 0.8 });
  for (let b = 0; b < 4; b++) {
    const count = 120;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i++) {
      positions[i*3] = origin.x + (b-1)*5;
      positions[i*3+1] = origin.y + b*2;
      positions[i*3+2] = origin.z;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 6 + Math.random() * 7;
      velocities.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.cos(phi) * speed + 3,
        Math.sin(phi) * Math.sin(theta) * speed
      ));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const colors = [0xff3355, 0x55ccff, 0xffff77, 0x8dff9a, 0xd783ff];
    const material = new THREE.PointsMaterial({ color: colors[(Math.random()*colors.length)|0], size: 1.55, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(geo, material);
    scene.add(pts);
    fireworks.push({ pts, velocities, age: 0, life: 2.4 });
  }
}

let last = performance.now();
let fpsLast = performance.now();
let fpsFrames = 0;
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;

  // Movement.
  const speed = (keys.shift ? 10.5 : 5.8) * dt;
  const forward = new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));
  const right = new THREE.Vector3(-forward.z, 0, forward.x);
  const move = new THREE.Vector3();
  if (keys.w) move.add(forward);
  if (keys.s) move.sub(forward);
  if (keys.d) move.add(right);
  if (keys.a) move.sub(right);
  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(speed);
    const nx = camera.position.x + move.x;
    const nz = camera.position.z + move.z;
    if (!isBlocked(nx, camera.position.z)) camera.position.x = nx;
    if (!isBlocked(camera.position.x, nz)) camera.position.z = nz;
  }
  // Lower eye height: closer to a normal first-person player instead of floating above the camp.
  camera.position.y = 1.55;
  updateCameraLook();

  // Cheap animations.
  const t = now * 0.001;
  flame.scale.y = 1.8 + Math.sin(t * 9) * 0.18;
  flame.rotation.y += dt * 2.5;
  flame2.rotation.y -= dt * 3.0;
  campfireLight.intensity = 6.6 + Math.sin(t * 8) * 0.75;
  cabinLight.intensity = 2.4 + Math.sin(t * 2.7) * 0.25;
  radioLight.intensity = (radioRepaired ? 4.0 : 1.55) + Math.sin(t * 4.5) * 0.25;
  supplies.forEach((s, i) => {
    if (!s.picked) {
      s.mesh.rotation.y += dt * 1.7;
      s.mesh.position.y = s.pos.y + Math.sin(t * 2.8 + i) * 0.09;
      s.beam.scale.y = 1 + Math.sin(t * 3.3 + i) * 0.12;
    }
  });
  if (beaconActive) beaconSpot.intensity = 7.5 + Math.sin(t * 5) * 1.6;

  for (let i = fireworks.length - 1; i >= 0; i--) {
    const f = fireworks[i]; f.age += dt;
    const arr = f.pts.geometry.attributes.position.array;
    for (let p = 0; p < f.velocities.length; p++) {
      const v = f.velocities[p]; v.y -= 8.5 * dt;
      arr[p*3] += v.x * dt; arr[p*3+1] += v.y * dt; arr[p*3+2] += v.z * dt;
    }
    f.pts.geometry.attributes.position.needsUpdate = true;
    f.pts.material.opacity = Math.max(0, 1 - f.age / f.life);
    if (f.age > f.life) { scene.remove(f.pts); f.pts.geometry.dispose(); f.pts.material.dispose(); fireworks.splice(i,1); }
  }

  for (let i = fireworkFlashes.length - 1; i >= 0; i--) {
    const f = fireworkFlashes[i];
    f.age += dt;
    f.light.intensity = Math.max(0, 10 * (1 - f.age / f.life));
    if (f.age > f.life) { scene.remove(f.light); fireworkFlashes.splice(i, 1); }
  }

  renderer.info.reset();
  renderer.render(scene, camera);

  fpsFrames++;
  if (now - fpsLast > 500) {
    const fps = Math.round(fpsFrames * 1000 / (now - fpsLast));
    fpsBox.innerHTML = `FPS: ${fps}<br>Draws: ${renderer.info.render.calls}<br>Shapes: ${visibleShapeCount}<br>Scale: ${renderScale.toFixed(2)}`;
    fpsFrames = 0; fpsLast = now;
  }
}
requestAnimationFrame(animate);
