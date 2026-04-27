const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotation;
  void main() {
    gl_Position = u_GlobalRotation * u_ModelMatrix * a_Position;
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`;

let canvas;
let gl;
let a_Position;
let u_ModelMatrix;
let u_GlobalRotation;
let u_FragColor;
let cubeBuffer;
let coneBuffer;
let cubeVertexCount = 0;
let coneVertexCount = 0;

let gAnimalGlobalRotation = 0;
let gMouseRotX = -8;
let gMouseRotY = 18;
let gLeftUpperWing = 0;
let gLeftLowerWing = 0;
let gLeftWingTip = 0;
let gRightUpperWing = 0;
let gRightLowerWing = 0;
let gRightWingTip = 0;
let gTail = 0;
let gHead = 0;
let gAnimation = true;
let gPokeStart = 0;
let gSeconds = 0;
let gStartTime = performance.now() / 1000;
let gLastFrame = performance.now();
let gLastPerfUpdate = 0;
let gFrameCounter = 0;

let GREEN = [0.10, 0.62, 0.43, 1.0];
let LIGHT_GREEN = [0.28, 0.82, 0.57, 1.0];
let WING = [0.10, 0.44, 0.52, 1.0];
let WING_DARK = [0.07, 0.28, 0.36, 1.0];
let RED = [0.86, 0.12, 0.26, 1.0];
const DARK_GREEN = [0.05, 0.30, 0.22, 1.0];
const BLACK = [0.02, 0.02, 0.02, 1.0];
const BEAK = [0.08, 0.07, 0.06, 1.0];
const LEG = [0.18, 0.11, 0.05, 1.0];

function main() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext('webgl', { antialias: true });
  if (!gl) {
    alert('WebGL is not supported in this browser.');
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    alert('Failed to initialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotation = gl.getUniformLocation(gl.program, 'u_GlobalRotation');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.80, 0.93, 1.0, 1.0);

  initCubeBuffer();
  initConeBuffer();
  setupControls();
  setupMouseControls();

  requestAnimationFrame(tick);
}

function initShaders(gl, vshader, fshader) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) return false;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return false;
  }

  gl.useProgram(program);
  gl.program = program;
  return true;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function initCubeBuffer() {
  const vertices = new Float32Array([
    -0.5,-0.5, 0.5,   0.5,-0.5, 0.5,   0.5, 0.5, 0.5,
    -0.5,-0.5, 0.5,   0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,

    -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5,
    -0.5,-0.5,-0.5,   0.5, 0.5,-0.5,   0.5,-0.5,-0.5,

    -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5,   0.5, 0.5, 0.5,
    -0.5, 0.5,-0.5,   0.5, 0.5, 0.5,   0.5, 0.5,-0.5,

    -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,
    -0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5,

     0.5,-0.5,-0.5,   0.5, 0.5,-0.5,   0.5, 0.5, 0.5,
     0.5,-0.5,-0.5,   0.5, 0.5, 0.5,   0.5,-0.5, 0.5,

    -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5,  -0.5, 0.5, 0.5,
    -0.5,-0.5,-0.5,  -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,
  ]);

  cubeVertexCount = vertices.length / 3;
  cubeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
}

function initConeBuffer() {
  const segments = 32;
  const data = [];
  const tip = [0.5, 0, 0];
  const center = [-0.5, 0, 0];
  const radius = 0.5;

  for (let i = 0; i < segments; i++) {
    const a1 = 2 * Math.PI * i / segments;
    const a2 = 2 * Math.PI * (i + 1) / segments;
    const p1 = [-0.5, Math.cos(a1) * radius, Math.sin(a1) * radius];
    const p2 = [-0.5, Math.cos(a2) * radius, Math.sin(a2) * radius];

    data.push(...tip, ...p1, ...p2);
    data.push(...center, ...p2, ...p1);
  }

  const vertices = new Float32Array(data);
  coneVertexCount = vertices.length / 3;
  coneBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, coneBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
}

function setupControls() {
  const bindSlider = (id, setter) => {
    const slider = document.getElementById(id);
    const label = document.getElementById(id + 'Value');
    slider.addEventListener('input', () => {
      const value = Number(slider.value);
      gAnimation = false;
      setter(value);
      label.textContent = value;
      renderScene();
    });
  };

  bindSlider('globalRotation', v => gAnimalGlobalRotation = v);
  bindSlider('leftUpperWing', v => gLeftUpperWing = v);
  bindSlider('leftLowerWing', v => gLeftLowerWing = v);
  bindSlider('leftWingTip', v => gLeftWingTip = v);
  bindSlider('rightUpperWing', v => gRightUpperWing = v);
  bindSlider('rightLowerWing', v => gRightLowerWing = v);
  bindSlider('rightWingTip', v => gRightWingTip = v);
  bindSlider('tail', v => gTail = v);
  bindSlider('head', v => gHead = v);

  setupColorControls();

  document.getElementById('animationOn').onclick = () => gAnimation = true;
  document.getElementById('animationOff').onclick = () => gAnimation = false;
  document.getElementById('resetView').onclick = () => {
    gMouseRotX = -8;
    gMouseRotY = 18;
    gAnimalGlobalRotation = 0;
    document.getElementById('globalRotation').value = 0;
    document.getElementById('globalRotationValue').textContent = 0;
    renderScene();
  };
}


function hexToColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b, 1.0];
}

function darker(color, amount) {
  return [
    Math.max(color[0] - amount, 0),
    Math.max(color[1] - amount, 0),
    Math.max(color[2] - amount, 0),
    1.0
  ];
}

function setupColorControls() {
  const bindColor = (id, setter) => {
    const input = document.getElementById(id);
    setter(input.value);
    input.addEventListener('input', () => {
      setter(input.value);
      renderScene();
    });
  };

  bindColor('bodyColor', hex => GREEN = hexToColor(hex));
  bindColor('headColor', hex => LIGHT_GREEN = hexToColor(hex));
  bindColor('wingColor', hex => {
    WING = hexToColor(hex);
    WING_DARK = darker(WING, 0.12);
  });
  bindColor('throatColor', hex => RED = hexToColor(hex));
}

function setControlValue(id, value) {
  const rounded = Math.round(value);
  const slider = document.getElementById(id);
  const label = document.getElementById(id + 'Value');
  if (slider) slider.value = rounded;
  if (label) label.textContent = rounded;
}

function syncAnimatedSliderLabels() {
  if (!gAnimation) return;
  setControlValue('leftUpperWing', gLeftUpperWing);
  setControlValue('leftLowerWing', gLeftLowerWing);
  setControlValue('leftWingTip', gLeftWingTip);
  setControlValue('rightUpperWing', gRightUpperWing);
  setControlValue('rightLowerWing', gRightLowerWing);
  setControlValue('rightWingTip', gRightWingTip);
  setControlValue('tail', gTail);
  setControlValue('head', gHead);
}

function setupMouseControls() {
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener('mousedown', event => {
    if (event.shiftKey) {
      gPokeStart = performance.now() / 1000;
      return;
    }
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
  });

  canvas.addEventListener('mousemove', event => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    gMouseRotY += dx * 0.5;
    gMouseRotX += dy * 0.5;
    lastX = event.clientX;
    lastY = event.clientY;
    renderScene();
  });

  window.addEventListener('mouseup', () => dragging = false);

  canvas.addEventListener('click', event => {
    if (event.shiftKey) {
      gPokeStart = performance.now() / 1000;
    }
  });
}

function tick(now) {
  gSeconds = now / 1000 - gStartTime;
  updateAnimationAngles();
  syncAnimatedSliderLabels();
  renderScene();
  updatePerformance(now);
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  const pokeElapsed = performance.now() / 1000 - gPokeStart;
  const pokeActive = pokeElapsed >= 0 && pokeElapsed < 1.2;

  if (gAnimation) {
    const flap = Math.sin(gSeconds * 18) * 52;
    const bend = Math.sin(gSeconds * 18 + 0.8) * 28;
    const tip = Math.sin(gSeconds * 18 + 1.6) * 22;
    const tail = Math.sin(gSeconds * 5) * 12;
    const head = Math.sin(gSeconds * 3) * 8;

    gLeftUpperWing = flap;
    gLeftLowerWing = bend;
    gLeftWingTip = tip;
    gRightUpperWing = -flap;
    gRightLowerWing = -bend;
    gRightWingTip = -tip;
    gTail = tail;
    gHead = head;
  }

  if (pokeActive) {
    const chaos = Math.sin(gSeconds * 45) * 35;
    gLeftUpperWing += chaos;
    gRightUpperWing -= chaos;
    gHead += Math.sin(gSeconds * 30) * 18;
    gTail += Math.sin(gSeconds * 25) * 25;
  }
}

function updatePerformance(now) {
  gFrameCounter++;
  if (now - gLastPerfUpdate > 500) {
    const frameTime = now - gLastFrame;
    const fps = Math.round(1000 / Math.max(frameTime, 1));
    document.getElementById('performance').textContent = `FPS: ${fps} | Frame time: ${frameTime.toFixed(2)} ms`;
    gLastPerfUpdate = now;
  }
  gLastFrame = now;
}

function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const globalRot = new Matrix4();
  globalRot.rotate(gMouseRotX, 1, 0, 0);
  globalRot.rotate(gAnimalGlobalRotation + gMouseRotY, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotation, false, globalRot.elements);

  const pokeElapsed = performance.now() / 1000 - gPokeStart;
  const pokeActive = pokeElapsed >= 0 && pokeElapsed < 1.2;
  const bob = Math.sin(gSeconds * 4) * 0.035;
  const panicDip = pokeActive ? Math.sin(pokeElapsed * Math.PI * 3) * 0.15 : 0;

  const body = new Matrix4();
  body.translate(0, bob - panicDip, 0);
  if (pokeActive) body.rotate(Math.sin(pokeElapsed * Math.PI * 4) * 15, 0, 0, 1);

  drawHummingbird(body);
}

function drawHummingbird(body) {
  drawPart(body, [0, 0, 0], [0.75, 0.42, 0.34], GREEN);
  drawPart(body, [0.04, -0.02, 0.01], [0.52, 0.25, 0.36], LIGHT_GREEN);
  drawPart(body, [0.36, -0.07, 0.01], [0.22, 0.17, 0.24], RED);

  const neck = new Matrix4(body);
  neck.translate(0.46, 0.17, 0);
  neck.rotate(gHead, 0, 1, 0);
  drawPart(neck, [0, 0, 0], [0.28, 0.25, 0.28], LIGHT_GREEN);

  const head = new Matrix4(neck);
  head.translate(0.22, 0.06, 0);
  drawPart(head, [0, 0, 0], [0.34, 0.30, 0.30], LIGHT_GREEN);
  drawPart(head, [0.08, 0.07, 0.16], [0.055, 0.055, 0.055], BLACK);
  drawPart(head, [0.08, 0.07, -0.16], [0.055, 0.055, 0.055], BLACK);

  const beak = new Matrix4(head);
  beak.translate(0.38, 0.02, 0);
  beak.scale(0.70, 0.07, 0.07);
  drawCone(beak, BEAK);

  drawWing(body, 1);
  drawWing(body, -1);
  drawTail(body);
  drawLegs(body);
}

function drawWing(parent, side) {
  const upperAngle = side === 1 ? gLeftUpperWing : gRightUpperWing;
  const lowerAngle = side === 1 ? gLeftLowerWing : gRightLowerWing;
  const tipAngle = side === 1 ? gLeftWingTip : gRightWingTip;

  const upper = new Matrix4(parent);
  upper.translate(-0.05, 0.10, side * 0.25);
  upper.rotate(side * 8, 1, 0, 0);
  upper.rotate(upperAngle, 0, 0, 1);
  upper.translate(-0.34, 0, side * 0.16);
  drawPart(upper, [0, 0, 0], [0.70, 0.08, 0.26], WING);

  const lower = new Matrix4(upper);
  lower.translate(-0.36, 0, side * 0.13);
  lower.rotate(lowerAngle, 0, 0, 1);
  lower.translate(-0.32, 0, side * 0.08);
  drawPart(lower, [0, 0, 0], [0.64, 0.065, 0.20], WING_DARK);

  const tip = new Matrix4(lower);
  tip.translate(-0.35, 0, side * 0.06);
  tip.rotate(tipAngle, 0, 0, 1);
  tip.translate(-0.22, 0, side * 0.03);
  drawPart(tip, [0, 0, 0], [0.44, 0.045, 0.14], WING_DARK);
}

function drawTail(parent) {
  const tailBase = new Matrix4(parent);
  tailBase.translate(-0.46, -0.02, 0);
  tailBase.rotate(gTail, 0, 1, 0);
  drawPart(tailBase, [-0.16, 0, 0], [0.34, 0.12, 0.18], DARK_GREEN);

  const leftFeather = new Matrix4(tailBase);
  leftFeather.translate(-0.36, 0.02, 0.10);
  leftFeather.rotate(18, 0, 1, 0);
  drawPart(leftFeather, [0, 0, 0], [0.44, 0.065, 0.10], DARK_GREEN);

  const rightFeather = new Matrix4(tailBase);
  rightFeather.translate(-0.36, 0.02, -0.10);
  rightFeather.rotate(-18, 0, 1, 0);
  drawPart(rightFeather, [0, 0, 0], [0.44, 0.065, 0.10], DARK_GREEN);

  const centerFeather = new Matrix4(tailBase);
  centerFeather.translate(-0.39, -0.02, 0);
  drawPart(centerFeather, [0, 0, 0], [0.48, 0.055, 0.08], DARK_GREEN);
}

function drawLegs(parent) {
  const leftLeg = new Matrix4(parent);
  leftLeg.translate(0.03, -0.27, 0.11);
  drawPart(leftLeg, [0, 0, 0], [0.055, 0.22, 0.055], LEG);
  drawPart(leftLeg, [0.04, -0.13, 0.04], [0.16, 0.045, 0.07], LEG);

  const rightLeg = new Matrix4(parent);
  rightLeg.translate(0.03, -0.27, -0.11);
  drawPart(rightLeg, [0, 0, 0], [0.055, 0.22, 0.055], LEG);
  drawPart(rightLeg, [0.04, -0.13, -0.04], [0.16, 0.045, 0.07], LEG);
}

function drawPart(parent, translation, scale, color) {
  const m = new Matrix4(parent);
  m.translate(translation[0], translation[1], translation[2]);
  m.scale(scale[0], scale[1], scale[2]);
  drawCube(m, color);
}

function drawCube(matrix, color) {
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
  gl.uniform4fv(u_FragColor, color);
  gl.drawArrays(gl.TRIANGLES, 0, cubeVertexCount);
}

function drawCone(matrix, color) {
  gl.bindBuffer(gl.ARRAY_BUFFER, coneBuffer);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
  gl.uniform4fv(u_FragColor, color);
  gl.drawArrays(gl.TRIANGLES, 0, coneVertexCount);
}

window.onload = main;
