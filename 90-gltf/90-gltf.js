import { GUI } from "../lib/dat.gui.module.js";
import { Application } from "../common/engine/Application.js";

import { GLTFLoader } from "./GLTFLoader.js";
import { Renderer } from "./Renderer.js";

class App extends Application {
  async start() {
    this.loader = new GLTFLoader();
    await this.loader.load("../common/models/monkey/untitled.gltf");

    this.scene = await this.loader.loadScene(this.loader.defaultScene);
    this.enemies = [
      await this.loader.loadEnemy("Sphere"),
      //await this.loader.loadEnemy("Sphere.001"),
      //await this.loader.loadEnemy("Sphere.002"),
    ];
    this.camera = await this.loader.loadNode("Camera");

    if (!this.scene || !this.camera) {
      throw new Error("Scene or Camera not present in glTF");
    }

    if (!this.camera.camera) {
      throw new Error("Camera node does not contain a camera reference");
    }

    console.log(this);
    console.log(this.scene);

    this.renderer = new Renderer(this.gl);
    this.renderer.prepareScene(this.scene);
    this.renderer.prepareNodeArray(this.enemies);

    this.resize();

    this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
    document.addEventListener(
      "pointerlockchange",
      this.pointerlockchangeHandler
    );
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

    if (this.camera) {
      this.camera.updateMatrix();
      this.camera.updateMOVE(dt);
    }

    if (this.physics) {
      this.physics.updateMatrix();
    }

    if (this.enemies) {
      for (let i = 0; i < this.enemies.length; i++) {
        this.enemies[i].moveEnemy(dt);
        // this.enemies[i].updateMatrix();
        // this.enemies[i].updateTransform();
      }
    }
  }

  render() {
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
      this.renderer.renderNodeArray(this.enemies, this.camera);
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
