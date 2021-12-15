import { Node } from "./Node.js";
import { vec3, mat4, quat } from "../lib/gl-matrix-module.js";

export class Enemy extends Node {
  constructor(options, health = 100, speed = 1, waypoints) {
    super(options);
    this.health = health;
    this.speed = speed;
    this.currWaypoint = 0;
    this.wp = waypoints;
    this.setSpawnPosition();
  }

  setSpawnPosition() {
    this.matrix[12] = this.wp[this.currWaypoint].matrix[12];
    this.matrix[14] = this.wp[this.currWaypoint].matrix[14];
  }

  Spin() {
    this.rotation[0] -= 1 * 0.002;
    this.rotation[1] -= 1 * 0.002;

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

  moveEnemy(dt) {
    this.Spin();

    let acc = vec3.create();

    console.log(this.matrix);

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
