import { Node } from "./Node.js";
import { vec3, mat4, quat } from "../lib/gl-matrix-module.js";

export class Turret extends Node {
  constructor(options, id, turret, loc) {
    super(options);
    this.id = id;
    console.log(turret);
    this.scale = turret[loc].scale;
    this.mesh = turret[loc].mesh;
    this.translation = options;
  }

  findClosestEnemy(enemies) {
    let razdalja = 999999;
    let najblizji_i = -1;
    let tmp_razdalja;

    for (let i = 0; i < enemies.length; i++) {
      const element = enemies[i];
      tmp_razdalja = vec3.distance(this.translation, enemies[i].translation);
      if (tmp_razdalja < razdalja) {
        razdalja = tmp_razdalja;
        najblizji_i = i;
      }
    }

    return enemies[najblizji_i];
  }

  rotateToEnemy(enemies) {
    const enemy = this.findClosestEnemy(enemies);

    if (!enemy) return;

    const TurretDir = [-Math.sin(this.rotation[1]), 0, -Math.cos(this.rotation[1])];

    const EnemyDir = vec3.sub(vec3.create(), this.translation, enemy.translation);

    EnemyDir[1] = 0;
    vec3.normalize(EnemyDir, EnemyDir);

    const kot = vec3.angle(TurretDir, EnemyDir);

    this.rotation[1] += kot - Math.PI;

    const newDir = [-Math.sin(this.rotation[1]), 0, -Math.cos(this.rotation[1])];

    const novKot = vec3.angle(newDir, EnemyDir);

    if (0.0001 < kot - novKot) {
      this.rotation[1] -= 2 * (kot - Math.PI);
    }

    quat.fromEuler(this.rotation, (this.rotation[0] * 180) / Math.PI, (this.rotation[1] * 180) / Math.PI, (this.rotation[2] * 180) / Math.PI);

    this.updateMatrix();
  }
}
