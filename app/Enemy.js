import { Node } from "./Node.js";
import { vec3, mat4, quat } from "../lib/gl-matrix-module.js";

export class Enemy extends Node {
  constructor(options, id, waypoints, enemies, loc, delay, time) {
    super(options);
    this.id = id;
    this.loc = loc;
    this.delay = delay;
    this.time = time;
    if (loc == 0) {
      this.health = 100;
    } else if (loc == 1) {
      this.health = 200;
    } else {
      this.health = 300;
    }
    this.speed = 200;
    this.currWaypoint = 0;
    this.wp = waypoints;
    this.enemy = enemies;
    this.scale = enemies[loc].scale;
    this.mesh = enemies[loc].mesh;
    this.translation = Object.create(this.wp[this.currWaypoint].translation);
    this.rotateSpeedX = 1;
    this.rotateSpeedY = 1;
    this.move = false;
    this.updateMatrix();
  }

  hit() {
    this.enemyLvlDown();
  }
  rotate(dt) {
    quat.rotateY(this.rotation, this.rotation, this.rotateSpeedY * dt);
    quat.rotateX(this.rotation, this.rotation, this.rotateSpeedX * dt);
    this.updateMatrix();
  }

  moveEnemy(dt, time) {
    if (this.currWaypoint == 0) {
      this.speed = 1000;
    } else {
      this.speed = 200;
    }
    if (!this.move) {
      if (time - this.time > this.delay) {
        this.move = true;
      } else {
        return;
      }
    }
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
      this.currWaypoint < this.wp.length - 1
    ) {
      this.currWaypoint++;
    }
  }
  dead() {
    return this.health < 0;
  }
  enemyLvlDown() {
    if (this.health > 200) {
      this.health -= 25;
    } else if (this.health <= 200 && this.health > 100) {
      this.loc = 1;
      this.scale = this.enemy[this.loc].scale;
      this.mesh = this.enemy[this.loc].mesh;
      this.health -= 15;
    } else if (this.health <= 100 && this.health > 0) {
      this.loc = 0;
      this.scale = this.enemy[this.loc].scale;
      this.mesh = this.enemy[this.loc].mesh;
      this.health -= 25;
    } else {
      this.health = -100;
    }
  }

  reachedEnd() {
    if (this.currWaypoint == this.wp.length - 1) return true;

    return false;
  }
}
