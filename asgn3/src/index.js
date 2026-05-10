import "./styles.css";
import { initShaders } from "../lib/cuon-utils";
import { Matrix4 } from "../lib/cuon-matrix-cse160";
import getContext from "./Context";
import Stats from "stats.js";
import Cube from "./Cube";
import Camera from "./Camera";
import Controls from "./Controls";
import dirtImg from "./img/dirt.svg";
import grassImg from "./img/grass.svg";
import stoneImg from "./img/stone.svg";
import woodImg from "./img/wood.svg";

const VSHADER_SOURCE = `
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;

  attribute vec3 aPosition;
  attribute vec2 uv;

  varying vec2 vUv;

  void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(aPosition, 1.0);
    vUv = uv;
  }
`;

const FSHADER_SOURCE = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform vec4 uBaseColor;
  uniform float uTextureWeight;
  uniform int uTextureIndex;
  uniform sampler2D uTexture0;
  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  uniform sampler2D uTexture3;

  varying vec2 vUv;

  void main() {
    vec4 texColor = texture2D(uTexture0, vUv);
    if (uTextureIndex == 1) {
      texColor = texture2D(uTexture1, vUv);
    } else if (uTextureIndex == 2) {
      texColor = texture2D(uTexture2, vUv);
    } else if (uTextureIndex == 3) {
      texColor = texture2D(uTexture3, vUv);
    }

    gl_FragColor = mix(uBaseColor, texColor, uTextureWeight);
  }
`;

const WORLD_SIZE = 32;
const HALF_WORLD = WORLD_SIZE / 2;
const BIRD_X = -8;
const BIRD_Z = -10;
const FIREWORK_LAUNCHERS = [
  [-13, -13],
  [-5, -13],
  [5, -13],
  [13, -13],
  [-13, 13],
  [-5, 13],
  [5, 13],
  [13, 13]
];
const WORLD_MAP = [
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 1, 1, 2, 1, 0, 0, 1, 1, 3, 1, 1, 2, 1, 1, 0, 0, 1, 4, 1, 1, 1, 2, 1, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
];
const stats = new Stats();
document.body.append(stats.dom);
let birdHelpStart = 0;

const gl = getContext();

if (!gl) {
  console.log("Failed to get WebGL context.");
}

if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
  console.log("Failed to initialize shaders.");
}

gl.clearColor(0.55, 0.72, 0.95, 1.0);
gl.enable(gl.DEPTH_TEST);

const cube = new Cube();
const camera = new Camera(gl.canvas);
const world = createWorld();
const controls = new Controls(gl, camera, world);
const status = createStatus();

loadTextures(gl, [dirtImg, grassImg, stoneImg, woodImg]);
tick();

function createWorld() {
  const heights = WORLD_MAP.map((row) => row.slice());
  const textures = heights.map((row, z) =>
    row.map((height, x) => {
      const isGrove = Math.abs(x - 8) < 4 && Math.abs(z - 6) < 4;
      return isGrove ? 3 : height > 0 ? 2 : 0;
    })
  );

  return {
    heights,
    textures,
    isBlockedAt(worldX, worldZ) {
      const playerRadius = 0.12;
      const mapX = Math.floor(worldX + HALF_WORLD);
      const mapZ = Math.floor(worldZ + HALF_WORLD);

      if (mapX < 0 || mapX >= WORLD_SIZE || mapZ < 0 || mapZ >= WORLD_SIZE) {
        return true;
      }

      for (let z = Math.max(0, mapZ - 1); z <= Math.min(WORLD_SIZE - 1, mapZ + 1); z++) {
        for (let x = Math.max(0, mapX - 1); x <= Math.min(WORLD_SIZE - 1, mapX + 1); x++) {
          if (this.heights[z][x] > 0 && circleTouchesBlock(worldX, worldZ, playerRadius, x, z)) {
            return true;
          }
        }
      }

      return false;
    },
    addBlockInFront() {
      const cell = cellInFront();
      if (!cell) return;
      this.heights[cell.z][cell.x] = Math.min(4, this.heights[cell.z][cell.x] + 1);
      this.textures[cell.z][cell.x] = 0;
    },
    removeBlockInFront() {
      const cell = cellInFront();
      if (!cell) return;
      this.heights[cell.z][cell.x] = Math.max(0, this.heights[cell.z][cell.x] - 1);
    },
    helpBird() {
      if (birdHelpStart || distanceToBird() > 4) {
        return;
      }

      birdHelpStart = performance.now() / 1000;
    }
  };
}

function distanceToBird() {
  const dx = camera.eye.elements[0] - BIRD_X;
  const dz = camera.eye.elements[2] - BIRD_Z;
  return Math.sqrt(dx * dx + dz * dz);
}

function circleTouchesBlock(worldX, worldZ, radius, mapX, mapZ) {
  const minX = mapX - HALF_WORLD;
  const maxX = minX + 1;
  const minZ = mapZ - HALF_WORLD;
  const maxZ = minZ + 1;
  const closestX = Math.max(minX, Math.min(worldX, maxX));
  const closestZ = Math.max(minZ, Math.min(worldZ, maxZ));
  const dx = worldX - closestX;
  const dz = worldZ - closestZ;

  return dx * dx + dz * dz < radius * radius;
}

function cellInFront() {
  const f = camera.forwardVector();
  const x = camera.eye.elements[0] + f.elements[0] * 2;
  const z = camera.eye.elements[2] + f.elements[2] * 2;
  const mapX = Math.floor(x + HALF_WORLD);
  const mapZ = Math.floor(z + HALF_WORLD);

  if (mapX < 1 || mapX >= WORLD_SIZE - 1 || mapZ < 1 || mapZ >= WORLD_SIZE - 1) {
    return null;
  }

  return { x: mapX, z: mapZ };
}

function loadTextures(gl, images) {
  images.forEach((src, index) => {
    const texture = gl.createTexture();
    const image = new Image();

    image.onload = () => {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.uniform1i(gl.getUniformLocation(gl.program, `uTexture${index}`), index);
    };

    image.src = src;
  });
}

function createStatus() {
  const panel = document.createElement("div");
  panel.className = "hud";
  panel.innerHTML = `
    <h1>Hummingbird Garden</h1>
    <p>WASD move | Q/E turn | drag mouse look | R add block | F delete block | H help bird</p>
    <p id="story">Find the hummingbird in the grove, then press H to help it fly.</p>
  `;
  document.body.append(panel);

  const crosshair = document.createElement("div");
  crosshair.className = "crosshair";
  document.body.append(crosshair);

  return panel.querySelector("#story");
}

function tick() {
  stats.begin();
  controls.update();
  renderScene();
  updateStory();
  stats.end();
  requestAnimationFrame(tick);
}

function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawSky();
  drawGround();
  drawTerrainPatches();
  drawMap();
  drawHummingbird(BIRD_X, birdY(), BIRD_Z);

  if (birdHelpStart) drawFireworks();
}

function birdY() {
  if (!birdHelpStart) {
    return 1.2;
  }

  const elapsed = performance.now() / 1000 - birdHelpStart;
  return 1.2 + Math.min(elapsed * 0.85, 6);
}

function drawSky() {
  drawCube([0, 0, 0], [220, 220, 220], [0.38, 0.48, 0.92, 1], 0, 0);
}

function drawGround() {
  drawCube([0, -0.05, 0], [WORLD_SIZE, 0.1, WORLD_SIZE], [0.55, 0.75, 0.32, 1], 1, 1);
}

function drawTerrainPatches() {
  drawCube([-8, 0.01, -9], [7, 0.04, 5], [0.45, 0.68, 0.27, 1], 1, 1);
  drawCube([6, 0.01, 8], [6, 0.04, 4], [0.45, 0.68, 0.27, 1], 1, 1);
  drawCube([3, 0.02, -6], [4, 0.06, 3], [0.48, 0.72, 0.33, 1], 1, 1);
}

function drawMap() {
  for (let z = 0; z < WORLD_SIZE; z++) {
    for (let x = 0; x < WORLD_SIZE; x++) {
      const height = world.heights[z][x];
      const textureIndex = world.textures[z][x];

      for (let y = 0; y < height; y++) {
        drawCube(
          [x - HALF_WORLD + 0.5, y + 0.5, z - HALF_WORLD + 0.5],
          [1, 1, 1],
          [1, 1, 1, 1],
          textureIndex,
          1
        );
      }
    }
  }
}

function drawHummingbird(x, y, z) {
  const t = performance.now() * 0.006;
  const bob = Math.sin(t) * 0.08;
  const flap = Math.sin(t * 8) * 35;
  const body = new Matrix4().setTranslate(x, y + bob, z).scale(0.9, 0.9, 0.9);

  drawPart(body, [0, 0, 0], [0.75, 0.42, 0.34], [0.1, 0.62, 0.43, 1]);
  drawPart(body, [0.36, -0.07, 0.01], [0.22, 0.17, 0.24], [0.86, 0.12, 0.26, 1]);

  const head = new Matrix4(body).translate(0.55, 0.2, 0);
  drawPart(head, [0, 0, 0], [0.34, 0.3, 0.3], [0.28, 0.82, 0.57, 1]);
  drawPart(head, [0.2, 0.03, 0], [0.42, 0.06, 0.06], [0.08, 0.07, 0.06, 1]);
  drawPart(head, [0.05, 0.08, 0.18], [0.05, 0.05, 0.05], [0.02, 0.02, 0.02, 1]);

  drawWing(body, 1, flap);
  drawWing(body, -1, -flap);
  drawPart(body, [-0.52, -0.02, 0], [0.42, 0.08, 0.18], [0.05, 0.3, 0.22, 1]);
}

function drawWing(parent, side, angle) {
  const wing = new Matrix4(parent);
  wing.translate(-0.08, 0.1, side * 0.24);
  wing.rotate(angle, 0, 0, 1);
  drawPart(wing, [-0.38, 0, side * 0.14], [0.72, 0.07, 0.24], [0.1, 0.44, 0.52, 1]);
  drawPart(wing, [-0.86, 0, side * 0.22], [0.52, 0.05, 0.16], [0.07, 0.28, 0.36, 1]);
}

function drawFireworks() {
  const elapsed = performance.now() / 1000 - birdHelpStart;
  const colors = [
    [1, 0.25, 0.2, 1],
    [1, 0.85, 0.2, 1],
    [0.2, 0.75, 1, 1],
    [0.7, 0.3, 1, 1],
    [0.2, 1, 0.45, 1],
    [1, 0.45, 0.05, 1],
    [0.15, 1, 0.95, 1],
    [1, 0.2, 0.75, 1]
  ];

  FIREWORK_LAUNCHERS.forEach(([x, z], launcherIndex) => {
    const cycle = (elapsed + launcherIndex * 0.18) % 3.4;
    const color = colors[launcherIndex % colors.length];
    const peakY = 8.5 + (launcherIndex % 4) * 1.15;
    const driftX = Math.sin(launcherIndex * 1.7) * 0.8;
    const driftZ = Math.cos(launcherIndex * 1.3) * 0.8;

    if (cycle < 1.55) {
      const t = cycle / 1.55;
      const rocketY = 0.35 + t * peakY;
      const rocketX = x + driftX * t;
      const rocketZ = z + driftZ * t;

      drawCube([rocketX, rocketY, rocketZ], [0.2, 0.6, 0.2], color, 0, 0);
      drawCube([rocketX, rocketY - 0.58, rocketZ], [0.1, 0.7, 0.1], [1, 0.55, 0.12, 1], 0, 0);
      return;
    }

    const burstAge = cycle - 1.55;
    const burstCenter = [x + driftX, peakY + 0.8, z + driftZ];
    drawExplosion(burstCenter, burstAge, color, colors);
  });
}

function drawExplosion(center, age, baseColor, colors) {
  const radius = Math.min(1.0 + age * 2.2, 4.8);
  const particleCount = 12;

  if (age > 1.35) {
    return;
  }

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount;
    const vertical = ((i % 5) - 2) * 0.32;
    const color = i % 3 === 0 ? baseColor : colors[(i + Math.floor(age * 5)) % colors.length];
    const sparkle = 0.14 + (i % 2) * 0.06;

    drawCube(
      [
        center[0] + Math.cos(angle) * radius,
        center[1] + vertical + Math.sin(age * 6 + i) * 0.18,
        center[2] + Math.sin(angle) * radius
      ],
      [sparkle, sparkle, sparkle],
      color,
      0,
      0
    );
  }
}

function drawPart(parent, translation, scale, color) {
  const matrix = new Matrix4(parent);
  matrix.translate(...translation);
  matrix.scale(...scale);
  cube.render(gl, camera, { matrix, color });
}

function drawCube(translation, scale, color, textureIndex, textureWeight) {
  const matrix = new Matrix4();
  matrix.setTranslate(...translation);
  matrix.scale(...scale);
  cube.render(gl, camera, { matrix, color, textureIndex, textureWeight });
}

function updateStory() {
  const nearBird = distanceToBird() < 4;
  status.textContent = nearBird
    ? birdHelpStart
      ? "The hummingbird is flying free."
      : "You found the hummingbird. Press H to help it fly."
    : "Find the hummingbird in the grove, then press H to help it fly.";
}
