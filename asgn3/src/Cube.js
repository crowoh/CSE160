import { Matrix4 } from "../lib/cuon-matrix-cse160";

export default class Cube {
  constructor() {
    this.vertices = new Float32Array([
      -0.5,0.5,0.5, -0.5,-0.5,0.5, 0.5,-0.5,0.5,
      -0.5,0.5,0.5, 0.5,-0.5,0.5, 0.5,0.5,0.5,
      -0.5,0.5,-0.5, -0.5,-0.5,-0.5, -0.5,-0.5,0.5,
      -0.5,0.5,-0.5, -0.5,-0.5,0.5, -0.5,0.5,0.5,
      0.5,0.5,0.5, 0.5,-0.5,0.5, 0.5,-0.5,-0.5,
      0.5,0.5,0.5, 0.5,-0.5,-0.5, 0.5,0.5,-0.5,
      -0.5,0.5,-0.5, -0.5,0.5,0.5, 0.5,0.5,0.5,
      -0.5,0.5,-0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5,
      0.5,0.5,-0.5, 0.5,-0.5,-0.5, -0.5,0.5,-0.5,
      -0.5,0.5,-0.5, 0.5,-0.5,-0.5, -0.5,-0.5,-0.5,
      -0.5,-0.5,0.5, -0.5,-0.5,-0.5, 0.5,-0.5,-0.5,
      -0.5,-0.5,0.5, 0.5,-0.5,-0.5, 0.5,-0.5,0.5
    ]);
    this.uvs = new Float32Array([
      0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
      0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
      0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
      0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
      0,1, 0,0, 1,1, 1,1, 0,0, 1,0,
      0,1, 0,0, 1,0, 0,1, 1,0, 1,1
    ]);
    this.vertexBuffer = null;
    this.uvBuffer = null;
    this.locations = null;
  }

  initLocations(gl) {
    if (this.locations !== null) {
      return;
    }

    this.locations = {
      aPosition: gl.getAttribLocation(gl.program, "aPosition"),
      uv: gl.getAttribLocation(gl.program, "uv"),
      modelMatrix: gl.getUniformLocation(gl.program, "modelMatrix"),
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

    if (this.uvBuffer === null) {
      this.uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.locations.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.locations.aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.vertexAttribPointer(this.locations.uv, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.locations.uv);
  }

  render(gl, camera, options = {}) {
    const {
      matrix = new Matrix4(),
      color = [1, 1, 1, 1],
      textureIndex = 0,
      textureWeight = 0
    } = options;

    this.initBuffers(gl);

    gl.uniformMatrix4fv(
      this.locations.modelMatrix,
      false,
      matrix.elements
    );
    gl.uniformMatrix4fv(
      this.locations.viewMatrix,
      false,
      camera.viewMatrix.elements
    );
    gl.uniformMatrix4fv(
      this.locations.projectionMatrix,
      false,
      camera.projectionMatrix.elements
    );
    gl.uniform4fv(this.locations.uBaseColor, color);
    gl.uniform1i(this.locations.uTextureIndex, textureIndex);
    gl.uniform1f(this.locations.uTextureWeight, textureWeight);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
  }
}
