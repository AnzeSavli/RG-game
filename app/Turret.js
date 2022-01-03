import { Node } from "./Node.js";
import { vec3, mat4, quat } from "../lib/gl-matrix-module.js";
import { Bullet } from "./Bullet.js";

export class Turret extends Node {
  constructor(options, id, turret, loc, bullets) {
    super(options);
    this.id = id;
    this.loc = loc;
    this.turrets = turret;
    this.bullets = bullets;
    this.scale = turret[loc].scale;
    this.mesh = turret[loc].mesh;
    this.translation = options;
    this.firerate = 250;
    this.target;
    this.timeFromLastFire = 0;
    this.updateMatrix();
  }

  shoot(t) {
    let bullet;
    if (this.target && t - this.timeFromLastFire > this.firerate) {
      if (this.loc == 0) {
        let audio = new Audio("../common/sounds/shoot1.mp3");
        audio.play();
      } else if (this.loc == 1) {
        let audio = new Audio("../common/sounds/shoot2.mp3");
        audio.play();
      } else if (this.loc == 2) {
        let audio = new Audio("../common/sounds/shoot3.mp3");
        audio.play();
      }
      const tr = Object.create(this.translation);
      bullet = new Bullet(
        tr,
        this.bullets.length,
        this.target,
        this.bullets,
        this.loc
      );
      this.timeFromLastFire = t;
    }
    return bullet;
  }

  findClosestEnemy(enemies) {
    let razdalja = 3;
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

  rotateToEnemy(enemies, dt) {
    const enemy = this.findClosestEnemy(enemies);
    if (!enemy) {
      this.target = undefined;
      return;
    } else {
      this.target = enemy;
    }
    const TurretDir = [
      -Math.sin(this.rotation[1]),
      0,
      -Math.cos(this.rotation[1]),
    ];

    const EnemyDir = vec3.sub(
      vec3.create(),
      this.translation,
      enemy.translation
    );

    EnemyDir[1] = 0;
    vec3.normalize(EnemyDir, EnemyDir);

    const kot = vec3.angle(TurretDir, EnemyDir);

    this.rotation[1] += kot - Math.PI;

    const newDir = [
      -Math.sin(this.rotation[1]),
      0,
      -Math.cos(this.rotation[1]),
    ];

    const novKot = vec3.angle(newDir, EnemyDir);

    if (0.0001 < kot - novKot) {
      this.rotation[1] -= 2 * (kot - Math.PI);
    }

    quat.fromEuler(
      this.rotation,
      (this.rotation[0] * 180) / Math.PI,
      (this.rotation[1] * 180) / Math.PI,
      (this.rotation[2] * 180) / Math.PI
    );
    this.updateMatrix();
  }

  upgradeTurret() {
    if (this.loc == 0) {
      this.scale = this.turrets[this.loc + 1].scale;
      this.mesh = this.turrets[this.loc + 1].mesh;
      this.firerate = 400;
      this.loc++;
    } else if (this.loc == 1) {
      this.scale = this.turrets[this.loc + 1].scale;
      this.mesh = this.turrets[this.loc + 1].mesh;
      this.firerate = 600;
      this.loc++;
    }
    this.updateMatrix();
  }
}
