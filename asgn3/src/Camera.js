import { Matrix4, Vector3 } from "../lib/cuon-matrix-cse160";

export default class Camera {
  constructor(canvas) {
    this.fov = 60;
    this.eye = new Vector3([0, 1.2, 6]);
    this.at = new Vector3([0, 1.2, 5]);
    this.up = new Vector3([0, 1, 0]);
    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();
    this.speed = 0.22;
    this.panSpeed = 5;
    this.yaw = -90;
    this.pitch = 0;
    this.aspect = canvas.width / canvas.height;

    window.addEventListener("resize", () => {
      this.aspect = canvas.width / canvas.height;
      this.calculateViewProjection();
    });

    this.updateAtFromAngles();
    this.calculateViewProjection();
  }

  forwardVector() {
    const f = new Vector3().set(this.at);
    f.sub(this.eye);
    f.normalize();
    return f;
  }

  moveBy(vector, canMove = () => true) {
    const movement = new Vector3().set(vector);
    const nextEye = new Vector3().set(this.eye);
    nextEye.add(movement);

    // Treat the grass plane as a floor: pitch can look up/down, but the
    // player camera cannot sink below standing height.
    nextEye.elements[1] = Math.max(1.2, nextEye.elements[1]);

    if (!canMove(nextEye.elements[0], nextEye.elements[2])) {
      return;
    }

    movement.elements[1] = nextEye.elements[1] - this.eye.elements[1];
    this.eye.set(nextEye);
    this.at.add(movement);
    this.calculateViewProjection();
  }

  moveForward(speed = this.speed, canMove) {
    this.moveBy(this.forwardVector().mul(speed), canMove);
  }

  moveBackwards(speed = this.speed, canMove) {
    this.moveBy(this.forwardVector().mul(-speed), canMove);
  }

  moveLeft(speed = this.speed, canMove) {
    const side = Vector3.cross(this.up, this.forwardVector()).normalize();
    this.moveBy(side.mul(speed), canMove);
  }

  moveRight(speed = this.speed, canMove) {
    const side = Vector3.cross(this.forwardVector(), this.up).normalize();
    this.moveBy(side.mul(speed), canMove);
  }

  panLeft(alpha = this.panSpeed) {
    this.yaw -= alpha;
    this.updateAtFromAngles();
  }

  panRight(alpha = this.panSpeed) {
    this.yaw += alpha;
    this.updateAtFromAngles();
  }

  rotate(deltaYaw, deltaPitch) {
    this.yaw += deltaYaw;
    this.pitch = Math.max(-80, Math.min(80, this.pitch + deltaPitch));
    this.updateAtFromAngles();
  }

  updateAtFromAngles() {
    const yawRad = (this.yaw * Math.PI) / 180;
    const pitchRad = (this.pitch * Math.PI) / 180;
    const direction = new Vector3([
      Math.cos(pitchRad) * Math.cos(yawRad),
      Math.sin(pitchRad),
      Math.cos(pitchRad) * Math.sin(yawRad)
    ]);
    this.at.set(this.eye);
    this.at.add(direction);
    this.calculateViewProjection();
  }

  calculateViewProjection() {
    this.viewMatrix.setLookAt(
      ...this.eye.elements,
      ...this.at.elements,
      ...this.up.elements
    );

    this.projectionMatrix.setPerspective(this.fov, this.aspect, 0.1, 1000);
  }
}
