import { Matrix4 } from "../lib/cuon-matrix-cse160";

export default class Model {
  constructor() {
    this.vertices = new Float32Array([]);
    this.normals = new Float32Array([]);
    this.uvs = new Float32Array([]);
    this.vertexBuffer = null;
    this.normalBuffer = null;
    this.uvBuffer = null;
    this.locations = null;
    this.loaded = false;
  }

  async load(url) {
    const text = await fetch(url).then((response) => response.text());
    this.parse(text);
    this.loaded = true;
  }

  parse(text) {
    const positions = [];
    const normalsIn = [];
    const texcoords = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

    const addFaceVertex = (token, faceNormal) => {
      const parts = token.split("/");
      const p = positions[parseInt(parts[0], 10) - 1];
      const t = parts[1] ? texcoords[parseInt(parts[1], 10) - 1] : [0, 0];
      const n = parts[2] ? normalsIn[parseInt(parts[2], 10) - 1] : faceNormal;
      vertices.push(p[0], p[1], p[2]);
      normals.push(n[0], n[1], n[2]);
      uvs.push(t[0], t[1]);
    };

    text.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const parts = trimmed.split(/\s+/);

      if (parts[0] === "v") {
        positions.push(parts.slice(1, 4).map(Number));
      } else if (parts[0] === "vn") {
        normalsIn.push(parts.slice(1, 4).map(Number));
      } else if (parts[0] === "vt") {
        texcoords.push(parts.slice(1, 3).map(Number));
      } else if (parts[0] === "f") {
        const face = parts.slice(1);
        for (let i = 1; i < face.length - 1; i++) {
          const tri = [face[0], face[i], face[i + 1]];
          const faceNormal = this.faceNormal(tri, positions);
          tri.forEach((token) => addFaceVertex(token, faceNormal));
        }
      }
    });

    this.vertices = new Float32Array(vertices);
    this.normals = new Float32Array(normals);
    this.uvs = new Float32Array(uvs);
  }

  faceNormal(tri, positions) {
    const getPos = (token) => positions[parseInt(token.split("/")[0], 10) - 1];
    const a = getPos(tri[0]);
    const b = getPos(tri[1]);
    const c = getPos(tri[2]);
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    return [nx / length, ny / length, nz / length];
  }

  initLocations(gl) {
    if (this.locations !== null) return;
    this.locations = {
      aPosition: gl.getAttribLocation(gl.program, "aPosition"),
      aNormal: gl.getAttribLocation(gl.program, "aNormal"),
      uv: gl.getAttribLocation(gl.program, "uv"),
      modelMatrix: gl.getUniformLocation(gl.program, "modelMatrix"),
      normalMatrix: gl.getUniformLocation(gl.program, "normalMatrix"),
      viewMatrix: gl.getUniformLocation(gl.program, "viewMatrix"),
      projectionMatrix: gl.getUniformLocation(gl.program, "projectionMatrix"),
      uBaseColor: gl.getUniformLocation(gl.program, "uBaseColor"),
      uTextureIndex: gl.getUniformLocation(gl.program, "uTextureIndex"),
      uTextureWeight: gl.getUniformLocation(gl.program, "uTextureWeight")
    };
  }

  initBuffers(gl) {
    this.initLocations(gl);

    if (this.vertexBuffer === null) {
      this.vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    }

    if (this.normalBuffer === null) {
      this.normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
    }

    if (this.uvBuffer === null) {
      this.uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.locations.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.locations.aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(this.locations.aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.locations.aNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.vertexAttribPointer(this.locations.uv, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.locations.uv);
  }

  render(gl, camera, options = {}) {
    if (!this.loaded) return;

    const { matrix = new Matrix4(), color = [1, 1, 1, 1], textureIndex = 0, textureWeight = 0 } = options;

    this.initBuffers(gl);

    const normalMatrix = new Matrix4();
    normalMatrix.setInverseOf(matrix);
    normalMatrix.transpose();

    gl.uniformMatrix4fv(this.locations.modelMatrix, false, matrix.elements);
    gl.uniformMatrix4fv(this.locations.normalMatrix, false, normalMatrix.elements);
    gl.uniformMatrix4fv(this.locations.viewMatrix, false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(this.locations.projectionMatrix, false, camera.projectionMatrix.elements);
    gl.uniform4fv(this.locations.uBaseColor, color);
    gl.uniform1i(this.locations.uTextureIndex, textureIndex);
    gl.uniform1f(this.locations.uTextureWeight, textureWeight);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
  }
}
