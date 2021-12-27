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
    this.rotateSpeedX = 1;
    this.rotateSpeedY = 1;
  }

  rotate(dt) {
    quat.rotateY(this.rotation, this.rotation, this.rotateSpeedY * dt);
    quat.rotateX(this.rotation, this.rotation, this.rotateSpeedX * dt);
    this.updateMatrix();
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
}
