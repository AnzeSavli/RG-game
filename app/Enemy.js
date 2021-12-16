import { Node } from "./Node.js";
import { vec3, mat4, quat } from "../lib/gl-matrix-module.js";

export class Enemy extends Node {
  constructor(options, health = 100, speed = 200, waypoints) {
    super(options);
    this.health = health;
    this.speed = speed;
    this.currWaypoint = 0;
    this.wp = waypoints;
    this.translation = waypoints[0].translation;
    this.updateMatrix();
    this.r0 = 1;
    this.r1 = 1;
  }

  rotate(dt) {
    const pi = Math.PI;
    const twopi = pi * 2;
    const halfpi = pi / 2;

    const c = this;

    c.rotation[0] -= dt * 0.1 * this.r0;
    c.rotation[1] -= dt * 0.1 * this.r1;

    if (c.rotation[0] < -0.5 || c.rotation[0] > 0.5) {
      this.r0 *= -1;
    }
    if (c.rotation[1] < -0.1 || c.rotation[1] > 0.1) {
      this.r1 *= -1;
    }

    /*     if (c.rotation[0] > halfpi) {
      c.rotation[0] = 0;
    }
    if (c.rotation[0] < -halfpi) {
      c.rotation[0] = -0;
    }

    if (c.rotation[1] > halfpi) {
      c.rotation[1] = 0;
    }
    if (c.rotation[1] < -halfpi) {
      c.rotation[1] = -0;
    } */
    c.rotation[1] = (c.rotation[1] % twopi) % twopi;
  }

  moveEnemy(dt) {
    let direction = vec3.create();
    vec3.sub(
      direction,
      this.translation,
      this.wp[this.currWaypoint + 1].translation
    );
    vec3.normalize(direction, direction);
    direction[0] = -direction[0];
    direction[1] = -direction[1];
    direction[2] = -direction[2];
    const velocity = [0, 0, 0];
    let acc = vec3.create();
    vec3.add(acc, acc, direction);
    vec3.scaleAndAdd(velocity, velocity, acc, dt * this.speed);
    vec3.scaleAndAdd(this.translation, this.translation, velocity, dt);
    this.updateMatrix();
    if (
      vec3.distance(
        this.translation,
        this.wp[this.currWaypoint + 1].translation
      ) <= 0.05 &&
      this.currWaypoint < this.wp.length - 2
    ) {
      this.currWaypoint++;
    }
  }

  moveEnemy1(dt) {
    let acc = vec3.create();

    let x = this.matrix[12] - this.wp[this.currWaypoint + 1].matrix[12];
    let y = this.matrix[14] - this.wp[this.currWaypoint + 1].matrix[14];

    if (y < 0 && Math.abs(y) > 0.1) {
      this.matrix[14] += dt * this.speed;
    }
    if (y > 0 && Math.abs(y) > 0.1) {
      this.matrix[14] -= dt * this.speed;
    }
    if (x < 0 && Math.abs(x) > 0.1) {
      this.matrix[12] += dt * this.speed;
    }
    if (x > 0 && Math.abs(x) > 0.1) {
      this.matrix[12] -= dt * this.speed;
    }
    if (
      Math.abs(x) < 0.1 &&
      Math.abs(y) < 0.1 &&
      this.currWaypoint < this.wp.length - 2
    ) {
      this.currWaypoint++;
    }

    vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.speed);
  }
}
