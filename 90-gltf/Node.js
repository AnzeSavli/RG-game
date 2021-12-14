import { vec3, mat4, quat } from "../lib/gl-matrix-module.js";

export class Node {
  constructor(options = {}) {
    this.translation = options.translation
      ? vec3.clone(options.translation)
      : vec3.fromValues(0, 0, 0);
    this.rotation = options.rotation
      ? quat.clone(options.rotation)
      : quat.fromValues(0, 0, 0, 1);
    this.scale = options.scale
      ? vec3.clone(options.scale)
      : vec3.fromValues(1, 1, 1);
    this.matrix = options.matrix ? mat4.clone(options.matrix) : mat4.create();
    this.velocity = [0, 0, 0];
    this.mouseSensitivity = 0.002;
    this.maxSpeed = 3;
    this.friction = 0.2;
    this.acceleration = 20;

    if (options.matrix) {
      this.updateTransform();
    } else if (options.translation || options.rotation || options.scale) {
      this.updateMatrix();
    }

    this.camera = options.camera || null;
    this.mesh = options.mesh || null;

    this.children = [...(options.children || [])];
    for (const child of this.children) {
      child.parent = this;
    }
    this.parent = null;

    this.mousemoveHandler = this.mousemoveHandler.bind(this);
    this.keydownHandler = this.keydownHandler.bind(this);
    this.keyupHandler = this.keyupHandler.bind(this);
    this.keys = {};
  }

  updateTransform() {
    mat4.getRotation(this.rotation, this.matrix);
    mat4.getTranslation(this.translation, this.matrix);
    mat4.getScaling(this.scale, this.matrix);
  }

  updateMatrix() {
    mat4.fromRotationTranslationScale(
      this.matrix,
      this.rotation,
      this.translation,
      this.scale
    );
  }

  addChild(node) {
    this.children.push(node);
    node.parent = this;
  }

  removeChild(node) {
    const index = this.children.indexOf(node);
    if (index >= 0) {
      this.children.splice(index, 1);
      node.parent = null;
    }
  }

  clone() {
    return new Node({
      ...this,
      children: this.children.map((child) => child.clone()),
    });
  }

  updateMOVE(dt) {
    const forward = vec3.set(
      vec3.create(),
      -Math.sin(this.rotation[1]),
      0,
      -Math.cos(this.rotation[1])
    );
    const right = vec3.set(
      vec3.create(),
      Math.cos(this.rotation[1]),
      0,
      -Math.sin(this.rotation[1])
    );

    // 1: add movement acceleration
    let acc = vec3.create();
    if (this.keys["KeyW"]) {
      vec3.add(acc, acc, forward);
    }
    if (this.keys["KeyS"]) {
      vec3.sub(acc, acc, forward);
    }
    if (this.keys["KeyD"]) {
      vec3.add(acc, acc, right);
    }
    if (this.keys["KeyA"]) {
      vec3.sub(acc, acc, right);
    }

    // 2: update velocity
    vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.acceleration);

    // 3: if no movement, apply friction
    if (
      !this.keys["KeyW"] &&
      !this.keys["KeyS"] &&
      !this.keys["KeyD"] &&
      !this.keys["KeyA"]
    ) {
      vec3.scale(this.velocity, this.velocity, 1 - this.friction);
    }

    // 4: limit speed
    const len = vec3.len(this.velocity);
    if (len > this.maxSpeed) {
      vec3.scale(this.velocity, this.velocity, this.maxSpeed / len);
    }
  }
  enable() {
    document.addEventListener("mousemove", this.mousemoveHandler);
    document.addEventListener("keydown", this.keydownHandler);
    document.addEventListener("keyup", this.keyupHandler);
  }

  disable() {
    document.removeEventListener("mousemove", this.mousemoveHandler);
    document.removeEventListener("keydown", this.keydownHandler);
    document.removeEventListener("keyup", this.keyupHandler);

    for (let key in this.keys) {
      this.keys[key] = false;
    }
  }
  mousemoveHandler(e) {
    const dx = e.movementX;
    const dy = e.movementY;

    this.rotation[0] -= dy * 0.002;
    this.rotation[1] -= dx * 0.002;

    const pi = Math.PI;
    const twopi = pi * 2;
    const halfpi = pi / 2;

    if (this.rotation[0] > halfpi) {
      this.rotation[0] = halfpi;
    }
    if (this.rotation[0] < -halfpi) {
      this.rotation[0] = -halfpi;
    }

    this.rotation[1] = ((this.rotation[1] % twopi) + twopi) % twopi;
  }

  keydownHandler(e) {
    this.keys[e.code] = true;
  }

  keyupHandler(e) {
    this.keys[e.code] = false;
  }
}
