export default class Controls {
  constructor(gl, camera, world) {
    this.canvas = gl.canvas;
    this.camera = camera;
    this.world = world;
    this.keys = {};
    this.dragging = false;
    this.lastX = 0;
    this.lastY = 0;

    this.setHandlers();
  }

  setHandlers() {
    window.addEventListener("keydown", (event) => {
      this.keys[event.key.toLowerCase()] = true;

      if (event.key.toLowerCase() === "f") {
        this.world.removeBlockInFront();
      }

      if (event.key.toLowerCase() === "r") {
        this.world.addBlockInFront();
      }

      if (event.key.toLowerCase() === "h") {
        this.world.helpBird();
      }
    });

    window.addEventListener("keyup", (event) => {
      this.keys[event.key.toLowerCase()] = false;
    });

    this.canvas.addEventListener("mousedown", (event) => {
      this.dragging = true;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    });

    window.addEventListener("mouseup", () => {
      this.dragging = false;
    });

    this.canvas.addEventListener("mousemove", (event) => {
      if (!this.dragging) {
        return;
      }

      const dx = event.clientX - this.lastX;
      const dy = event.clientY - this.lastY;
      this.camera.rotate(dx * 0.25, -dy * 0.25);
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    });
  }

  update() {
    const canMove = (x, z) => !this.world.isBlockedAt(x, z);

    if (this.keys.w) this.camera.moveForward(undefined, canMove);
    if (this.keys.s) this.camera.moveBackwards(undefined, canMove);
    if (this.keys.a) this.camera.moveLeft(undefined, canMove);
    if (this.keys.d) this.camera.moveRight(undefined, canMove);
    if (this.keys.q) this.camera.panLeft();
    if (this.keys.e) this.camera.panRight();
  }
}
