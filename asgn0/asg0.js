let canvas;
let ctx;

function main() {
  canvas = document.getElementById('example');
  if (!canvas) {
    console.log('Failed to retrieve the canvas element');
    return;
  }

  ctx = canvas.getContext('2d');
  if (!ctx) {
    console.log('Failed to get 2D context');
    return;
  }

  handleDrawEvent();
}

function clearCanvas() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVector(v, color) {
  const scale = 20;
  const originX = canvas.width / 2;
  const originY = canvas.height / 2;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX + v.elements[0] * scale, originY - v.elements[1] * scale);
  ctx.stroke();
}

function readVector(xId, yId) {
  const x = parseFloat(document.getElementById(xId).value) || 0;
  const y = parseFloat(document.getElementById(yId).value) || 0;
  return new Vector3([x, y, 0]);
}

function handleDrawEvent() {
  clearCanvas();

  const v1 = readVector('v1x', 'v1y');
  const v2 = readVector('v2x', 'v2y');

  drawVector(v1, 'red');
  drawVector(v2, 'blue');
}

function handleDrawOperationEvent() {
  clearCanvas();

  const v1 = readVector('v1x', 'v1y');
  const v2 = readVector('v2x', 'v2y');
  const operation = document.getElementById('operation').value;
  const scalar = parseFloat(document.getElementById('scalar').value);

  drawVector(v1, 'red');
  drawVector(v2, 'blue');

  if (operation === 'add') {
    const v3 = new Vector3(v1.elements);
    v3.add(v2);
    drawVector(v3, 'green');
  } else if (operation === 'sub') {
    const v3 = new Vector3(v1.elements);
    v3.sub(v2);
    drawVector(v3, 'green');
  } else if (operation === 'mul') {
    const v3 = new Vector3(v1.elements);
    const v4 = new Vector3(v2.elements);
    v3.mul(scalar);
    v4.mul(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (operation === 'div') {
    const v3 = new Vector3(v1.elements);
    const v4 = new Vector3(v2.elements);
    v3.div(scalar);
    v4.div(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (operation === 'magnitude') {
    console.log('Magnitude v1:', v1.magnitude());
    console.log('Magnitude v2:', v2.magnitude());
  } else if (operation === 'normalize') {
    const v3 = new Vector3(v1.elements);
    const v4 = new Vector3(v2.elements);
    v3.normalize();
    v4.normalize();
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (operation === 'angle') {
    console.log('Angle:', angleBetween(v1, v2));
  } else if (operation === 'area') {
    console.log('Area of triangle:', areaTriangle(v1, v2));
  }
}

function angleBetween(v1, v2) {
  const dot = Vector3.dot(v1, v2);
  const mag1 = v1.magnitude();
  const mag2 = v2.magnitude();
  const cosine = dot / (mag1 * mag2);
  const clamped = Math.max(-1, Math.min(1, cosine));
  return Math.acos(clamped) * 180 / Math.PI;
}

function areaTriangle(v1, v2) {
  const cross = Vector3.cross(v1, v2);
  return cross.magnitude() / 2;
}