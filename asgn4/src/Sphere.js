import { Matrix4 } from "../lib/cuon-matrix-cse160";

export default class Sphere {
  constructor(segments = 24) {
    const vertices = [];
    const normals = [];
    const uvs = [];

    for (let y = 0; y < segments; y++) {
      const v0 = y / segments;
      const v1 = (y + 1) / segments;
      const theta0 = v0 * Math.PI;
      const theta1 = v1 * Math.PI;

      for (let x = 0; x < segments; x++) {
        const u0 = x / segments;
        const u1 = (x + 1) / segments;
        const phi0 = u0 * Math.PI * 2;
        const phi1 = u1 * Math.PI * 2;

        const p00 = this.point(theta0, phi0);
        const p01 = this.point(theta0, phi1);
        const p10 = this.point(theta1, phi0);
        const p11 = this.point(theta1, phi1);

        this.pushVertex(vertices, normals, uvs, p00, u0, v0);
        this.pushVertex(vertices, normals, uvs, p10, u0, v1);
        this.pushVertex(vertices, normals, uvs, p11, u1, v1);

        this.pushVertex(vertices, normals, uvs, p00, u0, v0);
        this.pushVertex(vertices, normals, uvs, p11, u1, v1);
        this.pushVertex(vertices, normals, uvs, p01, u1, v0);
      }
    }

    this.vertices = new Float32Array(vertices);
    this.normals = new Float32Array(normals);
    this.uvs = new Float32Array(uvs);
    this.vertexBuffer = null;
    this.normalBuffer = null;
    this.uvBuffer = null;
    this.locations = null;
  }

  point(theta, phi) {
    return [
      Math.sin(theta) * Math.cos(phi),
      Math.cos(theta),
      Math.sin(theta) * Math.sin(phi)
    ];
  }

  pushVertex(vertices, normals, uvs, point, u, v) {
    vertices.push(point[0], point[1], point[2]);
    normals.push(point[0], point[1], point[2]);
    uvs.push(u, v);
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
