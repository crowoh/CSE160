const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
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
let u_FragColor;
let u_Size;

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedType = POINT;
let g_selectedColor = [1.0, 0.0, 0.0, 1.0];
let g_selectedSize = 12;
let g_selectedSegments = 10;
let g_shapesList = [];
let g_rainbowMode = false;
let g_hue = 0;

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  canvas.onmousedown = function(ev) {
    click(ev);
  };

  canvas.onmousemove = function(ev) {
    if (ev.buttons === 1) {
      click(ev);
    }
  };

  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get WebGL context');
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get a_Position');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get u_Size');
    return;
  }
}

function addActionsForHtmlUI() {
  document.getElementById('pointButton').onclick = function() {
    g_selectedType = POINT;
  };

  document.getElementById('triangleButton').onclick = function() {
    g_selectedType = TRIANGLE;
  };

  document.getElementById('circleButton').onclick = function() {
    g_selectedType = CIRCLE;
  };

  document.getElementById('clearButton').onclick = function() {
    g_shapesList = [];
    renderAllShapes();
  };

  document.getElementById('pictureButton').onclick = function() {
    drawPicture();
  };

  document.getElementById('rainbowButton').onclick = function() {
    g_rainbowMode = !g_rainbowMode;
    document.getElementById('rainbowButton').textContent =
      g_rainbowMode ? 'Rainbow: On' : 'Rainbow: Off';
  };

  document.getElementById('redSlide').addEventListener('input', function() {
    g_selectedColor[0] = this.value / 100;
  });

  document.getElementById('greenSlide').addEventListener('input', function() {
    g_selectedColor[1] = this.value / 100;
  });

  document.getElementById('blueSlide').addEventListener('input', function() {
    g_selectedColor[2] = this.value / 100;
  });

  document.getElementById('sizeSlide').addEventListener('input', function() {
    g_selectedSize = Number(this.value);
  });

  document.getElementById('segmentSlide').addEventListener('input', function() {
    g_selectedSegments = Number(this.value);
  });
}

function click(ev) {
  const [x, y] = convertCoordinatesEventToGL(ev);

  let shape;

  if (g_selectedType === POINT) {
    shape = new Point();
  } else if (g_selectedType === TRIANGLE) {
    shape = new Triangle();
  } else {
    shape = new Circle();
    shape.segments = g_selectedSegments;
  }

  shape.position = [x, y];
  shape.size = g_selectedSize;

  if (g_rainbowMode) {
    shape.color = hsvToRgbColor(g_hue / 360, 1, 1);
    g_hue = (g_hue + 15) % 360;
  } else {
    shape.color = [
      g_selectedColor[0],
      g_selectedColor[1],
      g_selectedColor[2],
      g_selectedColor[3]
    ];
  }

  g_shapesList.push(shape);
  renderAllShapes();
}

function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  const len = g_shapesList.length;
  for (let i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

function convertCoordinatesEventToGL(ev) {
  const rect = ev.target.getBoundingClientRect();
  let x = ev.clientX - rect.left;
  let y = ev.clientY - rect.top;

  x = (x - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - y) / (canvas.height / 2);

  return [x, y];
}

function drawTriangleColored(vertices, color) {
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  drawTriangle(vertices);
}

function drawPicture() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  drawTriangleColored([-1.0, 1.0, -1.0, 0.2, 1.0, 1.0], [0.62, 0.82, 1.0, 1.0]);
  drawTriangleColored([1.0, 1.0, -1.0, 0.2, 1.0, 0.2], [0.62, 0.82, 1.0, 1.0]);

  drawTriangleColored([-1.0, 0.2, -1.0, -1.0, 1.0, 0.2], [0.42, 0.78, 0.38, 1.0]);
  drawTriangleColored([1.0, 0.2, -1.0, -1.0, 1.0, -1.0], [0.37, 0.72, 0.34, 1.0]);

  drawTriangleColored([-0.75, -0.3, 0.55, -0.3, -0.2, -0.34], [0.4, 0.24, 0.08, 1.0]);
  drawTriangleColored([0.55, -0.3, -0.2, -0.34, 0.2, -0.34], [0.35, 0.2, 0.07, 1.0]);

  drawTriangleColored([-0.45, -0.05, -0.12, 0.18, 0.05, -0.08], [0.08, 0.08, 0.08, 1.0]);
  drawTriangleColored([-0.32, -0.1, 0.05, -0.08, -0.05, -0.28], [0.12, 0.12, 0.12, 1.0]);

  drawTriangleColored([-0.18, 0.08, -0.02, 0.28, -0.02, 0.04], [0.05, 0.05, 0.05, 1.0]);
  drawTriangleColored([-0.1, 0.02, 0.18, 0.12, 0.0, -0.04], [0.1, 0.1, 0.1, 1.0]);

  drawTriangleColored([0.05, 0.02, 0.18, 0.06, 0.06, -0.04], [0.95, 0.76, 0.2, 1.0]);

  drawTriangleColored([-0.28, -0.28, -0.25, -0.62, -0.22, -0.28], [0.21, 0.15, 0.05, 1.0]);
  drawTriangleColored([-0.1, -0.28, -0.07, -0.62, -0.04, -0.28], [0.21, 0.15, 0.05, 1.0]);
}

function hsvToRgbColor(h, s, v) {
  let r, g, b;
  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return [r, g, b, 1.0];
}

function initShaders(gl, vshader, fshader) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) {
    return false;
  }

  const program = gl.createProgram();
  if (!program) {
    return false;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    console.log('Failed to link program: ' + gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return false;
  }

  gl.useProgram(program);
  gl.program = program;
  return true;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (shader == null) {
    console.log('unable to create shader');
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    console.log('Failed to compile shader: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}