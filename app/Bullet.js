import { vec3 } from "../lib/gl-matrix-module.js";
import { Node } from "./Node.js";

export class Bullet extends Node {
  constructor(options, enemy) {
    super(options);
    this.enemy = enemy;
    this.speed = 2;
  }

  MoveToEnemy(dt) {
    let smer = vec3.sub(
      vec3.create(),
      this.translation,
      this.enemy.translation
    );

    vec3.normalize(smer, smer);

    smer = vec3.fromValues(-smer[0], 0, -smer[2]);

    let smer2 = vec3.create();
    vec3.add(smer2, smer2, smer);

    vec3.scaleAndAdd(this.velocity, this.velocity, smer2, dt * this.speed);

    vec3.scaleAndAdd(this.translation, this.translation, this.velocity, dt);

    this.updateMatrix();
  }
}
