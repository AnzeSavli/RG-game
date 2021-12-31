import { GUI } from "../lib/dat.gui.module.js";
import { Application } from "../common/engine/Application.js";

import { GLTFLoader } from "./GLTFLoader.js";
import { Renderer } from "./Renderer.js";
import { Enemy } from "./Enemy.js";
import { Turret } from "./Turret.js";

class App extends Application {
  async start() {
    this.loader = new GLTFLoader();
    await this.loader.load("../common/models/textures/untitled.gltf");

    this.scene = await this.loader.loadScene(this.loader.defaultScene);
    this.enemies = [await this.loader.loadEnemy("enemy0"), await this.loader.loadEnemy("enemy1"), await this.loader.loadEnemy("enemy2")];
    this.turrets = [await this.loader.loadTurret("turret0"), await this.loader.loadTurret("turret1"), await this.loader.loadTurret("turret2")];
    this.wp = await this.loader.loadWayPoints("point", 12);
    this.scene.enemies = [];
    this.scene.turrets = [];

    this.camera = await this.loader.loadNode("Camera");

    if (!this.scene || !this.camera) {
      throw new Error("Scene or Camera not present in glTF");
    }

    if (!this.camera.camera) {
      throw new Error("Camera node does not contain a camera reference");
    }

    this.renderer = new Renderer(this.gl);
    this.renderer.prepareScene(this.scene);
    this.renderer.prepareNodeArray(this.enemies);
    this.renderer.prepareNodeArray(this.turrets);

    this.resize();

    this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
    document.addEventListener("pointerlockchange", this.pointerlockchangeHandler);
    this.addEnemy = this.addEnemy.bind(this);
    document.addEventListener("click", this.addEnemy);

    this.addTurret = this.addTurret.bind(this);
    document.addEventListener("keyup", this.addTurret);
  }

  addEnemy(e, loc = 2) {
    const trans = Object.create(this.enemies[loc].translation);
    let enemy = new Enemy(trans, this.scene.enemies.length, this.wp, this.enemies, loc);
    this.scene.enemies.push(enemy);
  }

  addTurret(e, loc = 2) {
    const trans = Object.create(this.turrets[loc].translation);
    let turret = new Turret(trans, this.scene.turrets.length, this.turrets, loc);
    this.scene.turrets.push(turret);
    this.scene.enemies[0].enemyLvlDown();
  }

  enableCamera() {
    this.canvas.requestPointerLock();
  }

  pointerlockchangeHandler() {
    if (!this.camera) {
      return;
    }

    if (document.pointerLockElement === this.canvas) {
      this.camera.enable();
    } else {
      this.camera.disable();
    }
  }

  update() {
    const t = (this.time = Date.now());
    const dt = (this.time - this.startTime) * 0.001;
    this.startTime = this.time;
    if (this.scene) {
      if (this.camera) {
        this.camera.updateMatrix();
        this.camera.update(dt);
      }

      if (this.physics) {
        this.physics.updateMatrix();
      }

      if (this.scene.enemies) {
        for (let i = 0; i < this.scene.enemies.length; i++) {
          this.scene.enemies[i].rotate(dt);
          this.scene.enemies[i].updateMatrix();
          this.scene.enemies[i].moveEnemy(dt);
        }
      }

      if (this.scene.turrets) {
        for (let i = 0; i < this.scene.turrets.length; i++) {
          if (this.scene.enemies) {
            this.scene.turrets[i].rotateToEnemy(this.scene.enemies);
          }
        }
      }
    }
  }

  render() {
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
      if (this.scene.enemies) {
        this.renderer.renderNodeArray(this.scene.enemies, this.camera);
      }
      if (this.scene.turrets) {
        this.renderer.renderNodeArray(this.scene.turrets, this.camera);
      }
    }
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const aspectRatio = w / h;

    if (this.camera) {
      this.camera.camera.aspect = aspectRatio;
      this.camera.camera.updateMatrix();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("canvas");
  const app = new App(canvas);
  const gui = new GUI();
  gui.add(app, "enableCamera");
});
