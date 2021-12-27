import { Node } from "./Node.js";
import { vec3, mat4, quat } from "../lib/gl-matrix-module.js";

export class Turret extends Node {
  constructor(options) {
    super(options);
  }

  findClosestEnemy(enemies) {
    let razdalja = 99999;
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

    const TurretRotation = [
      -Math.sin(this.rotation[1]),
      0,
      -Math.cos(this.rotation[1]),
    ];
    const EnemyRotation = vec3.sub(
      vec3.create(),
      enemy.translation,
      this.translation
    );

    EnemyRotation[1] = 0;
    vec3.normalize(EnemyRotation, EnemyRotation);

    const kot = vec3.angle(TurretRotation, EnemyRotation);

    this.rotation[1] += kot;

    const NewTurretRotation = [
      -Math.sin(this.rotation[1]),
      0,
      -Math.cos(this.rotation[1]),
    ];

    const updatedKot = vec3.angle(NewTurretRotation, EnemyRotation);

    if (updatedKot > kot) {
      this.rotation[1] -= 2 * kot;
    }

    this.rotation[1] =
      ((this.rotation[1] % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    const koti = this.rotation.map((x) => (x * 180) / Math.PI);
    quat.fromEuler(this.rotation, ...koti);

    this.updateMatrix();
  }
}
