import { GUI } from "../lib/dat.gui.module.js";
import { Application } from "../common/engine/Application.js";

import { GLTFLoader } from "./GLTFLoader.js";
import { Renderer } from "./Renderer.js";
import { vec3, vec4, mat4, quat } from "../lib/gl-matrix-module.js";

class App extends Application {
  async start() {
    this.loader = new GLTFLoader();
    await this.loader.load("../common/models/textures/untitled.gltf");

    this.scene = await this.loader.loadScene(this.loader.defaultScene);
    this.enemies = [
      await this.loader.loadEnemy("enemy0"),
      //await this.loader.loadEnemy("enemy1"),
      //await this.loader.loadEnemy("enemy2"),
    ];
    this.turrets = [
      await this.loader.loadTurret("turret0"),
      await this.loader.loadTurret("turret1"),
      await this.loader.loadTurret("turret2"),
    ];

    this.grid = [
      await this.loader.loadNode("grid0"),
      await this.loader.loadNode("grid1"),
      await this.loader.loadNode("grid2"),
      await this.loader.loadNode("grid3"),
      await this.loader.loadNode("grid4"),
      await this.loader.loadNode("grid5"),
      await this.loader.loadNode("grid6"),
      await this.loader.loadNode("grid7"),
      await this.loader.loadNode("grid8"),
      await this.loader.loadNode("grid9"),
      await this.loader.loadNode("grid10"),
      await this.loader.loadNode("grid11"),
      await this.loader.loadNode("grid12"),
    ];
    this.bullets = [await this.loader.loadNode("bullet0")];
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
    this.renderer.prepareNodeArray(this.grid);
    this.renderer.prepareNodeArray(this.bullets);

    this.resize();

    this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
    document.addEventListener(
      "pointerlockchange",
      this.pointerlockchangeHandler
    );

    this.mousedownHandler = this.mousedownHandler.bind(this);
    document.addEventListener("mousedown", this.mousedownHandler);
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
      this.camera.update(dt);
    }

    if (this.physics) {
      this.physics.updateMatrix();
    }

    if (this.enemies) {
      for (let i = 0; i < this.enemies.length; i++) {
        this.enemies[i].rotate(dt);
        this.enemies[i].updateMatrix();
        this.enemies[i].moveEnemy(dt);
      }
    }

    if (this.turrets) {
      for (let i = 0; i < this.turrets.length; i++) {
        if (this.enemies) {
          this.turrets[i].rotateToEnemy(this.enemies);
        }
      }
    }
  }

  render() {
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
      this.renderer.renderNodeArray(this.grid, this.camera);
      this.renderer.renderNodeArray(this.bullets, this.camera);
      this.renderer.renderNodeArray(this.enemies, this.camera);
      this.renderer.renderNodeArray(this.turrets, this.camera);
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

  mousedownHandler(e) {
    let mouseX = e.clientX;
    let mouseY = e.clientY;

    let x = (2.0 * mouseX) / this.canvas.width - 1.0;
    let y = 1.0 - (2.0 * mouseY) / this.canvas.height;
    let z = 1.0;

    let ray_nds = vec3.fromValues(x, y, z);

    let ray_clip = vec4.fromValues(ray_nds[0], ray_nds[1], -1.0, 1.0);

    let tmp_ray_eye = mat4.create();
    mat4.invert(tmp_ray_eye, this.camera.projection);

    let tmp_ray = vec4.create();
    vec4.transformMat4(tmp_ray, [1, 1, 1, 1], tmp_ray_eye);

    vec4.multiply(tmp_ray, tmp_ray, ray_clip);

    let ray_eye = vec4.fromValues(tmp_ray[0], tmp_ray[1], -1.0, 0.0);

    let ray_wor4 = vec4.create();
    vec4.transformMat4(ray_wor4, [1, 1, 1, 1], this.camera.matrix);

    vec4.multiply(ray_wor4, ray_wor4, ray_eye);
    let ray_wor = vec3.fromValues(ray_wor4[0], ray_wor4[1], ray_wor4[2]);
    vec3.normalize(ray_wor, ray_wor);

    console.log(ray_wor);
    console.log(this.grid[0]);
    console.log(this.grid[1]);

    let new_pos = this.getPointOnRay(ray_wor, this.camera, 1000);

    console.log(new_pos);
  }

  getPointOnRay(ray, camera, distance) {
    let camera_pos = vec3.fromValues(
      camera.translation[0],
      camera.translation[1],
      camera.translation[2]
    );

    let scaledRay = vec3.fromValues(
      ray[0] * distance,
      ray[1] * distance,
      ray[2] * distance
    );

    vec3.add(camera_pos, camera_pos, scaledRay);
    return camera_pos;
  }

  binarySearch(count, start, finish, ray) {}
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("canvas");
  const app = new App(canvas);
  const gui = new GUI();
  gui.add(app, "enableCamera");
});
