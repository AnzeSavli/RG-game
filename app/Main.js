import { GUI } from "../lib/dat.gui.module.js";
import { Application } from "../common/engine/Application.js";
import { vec3 } from "../lib/gl-matrix-module.js";

import { GLTFLoader } from "./GLTFLoader.js";
import { Renderer } from "./Renderer.js";
import { Enemy } from "./Enemy.js";
import { Turret } from "./Turret.js";
import { Bullet } from "./Bullet.js";

class App extends Application {
  constructor(health, money, wave, canvas, glOptions) {
    super(canvas, glOptions);
    this.guiData = new Object();
    this.healthNode = health;
    this.moneyNode = money;
    this.waveNode = wave;

    Object.assign(this.guiData, {
      mapSelection: 55,
    });
  }
  async start() {
    this.spawned = false;
    this.waves = [{lvl0:1, lvl1:0, lvl2:0, delay: 500}, {lvl0:2, lvl1:0, lvl2:0, delay: 500}];    
    this.pause = true;
    this.loader = new GLTFLoader();
    await this.loader.load("../common/models/textures/untitled.gltf");

    //-2 = tla/nesmes postavljati // -1 = prazna postavljiva površina // 0/1/2 = postavljeni turreti
    this.mapMatrix = [
      -1, -2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -2, -1, -1, -1, -2,
      -2, -2, -1, -1, -1, -1, -1, -2, -1, -1, -1, -2, -1, -2, -1, -1, -1, -1,
      -1, -2, -2, -2, -2, -2, -2, -2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -2,
      -1, -1, -2, -2, -2, -1, -1, -1, -1, -1, -1, -2, -1, -1, -2, -1, -2, -1,
      -1, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1, -1, -2, -1, -1, -1, -2,
      -1, -1, -2, -1, -1, -1, -1, -2, -1, -1, -1, -2, -1, -1, -2, -1, -1, -1,
      -1, -2, -1, -1, -1, -2, -1, -1, -2, -1, -1, -1, -1, -2, -2, -2, -2, -2,
      -1, -1, -2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -2, -1, -1, -1,
    ];

    this.scene = await this.loader.loadScene(this.loader.defaultScene);
    this.enemies = [
      await this.loader.loadEnemy("enemy0"),
      await this.loader.loadEnemy("enemy1"),
      await this.loader.loadEnemy("enemy2"),
    ];
    this.turrets = [
      await this.loader.loadTurret("turret0"),
      await this.loader.loadTurret("turret1"),
      await this.loader.loadTurret("turret2"),
    ];

    this.bullets = [
      await this.loader.loadBullet("bullet0"),
      await this.loader.loadBullet("bullet1"),
      await this.loader.loadBullet("bullet2"),
    ];
    this.wp = await this.loader.loadWayPoints("point", 12);
    this.scene.enemies = [];
    this.scene.turrets = [];
    this.scene.bullets = [];

    this.camera = await this.loader.loadNode("Camera");

    this.hp = 3;
    this.money = 100;
    this.currwave = 0;  	

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
    this.renderer.prepareNodeArray(this.bullets);

    this.resize();

    this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
    document.addEventListener(
      "pointerlockchange",
      this.pointerlockchangeHandler
    );
    //this.addEnemy = this.addEnemy.bind(this);
    //document.addEventListener("click", this.addEnemy);
  }

  addEnemy(e, loc = 2, delay = 200, time = Date.now()) {
    const trans = Object.create(this.enemies[loc].translation);
    let enemy = new Enemy(
      trans,
      this.scene.enemies.length,
      this.wp,
      this.enemies,
      loc,
      delay,
      time
    );
    this.scene.enemies.push(enemy);
  }

  addTurret(loc = 2, trans, id) {
    let turret = new Turret(trans, id, this.turrets, loc, this.bullets);
    this.scene.turrets.push(turret);
    console.log(turret);
  }

  enableCamera() {
    this.canvas.requestPointerLock();
  }

  dodaj_Nadgradi_Turret() {
    if (this.guiData["mapSelection"] != -1) {
      if (
        this.mapMatrix[this.guiData["mapSelection"]] == -1 &&
        this.money >= 25
      ) {
        const x = Math.floor(this.guiData["mapSelection"] % 12) * 1 - 5.5;
        const y = Math.floor(this.guiData["mapSelection"] / 12) * 1 - 5.5;
        const z = 0.4;

        const trans = vec3.fromValues(x, z, y);
        this.addTurret(0, trans, this.guiData["mapSelection"]);
        this.mapMatrix[this.guiData["mapSelection"]]++;
        this.money -= 25;

        //new turret, dodaj id v turret = "mapSelection"
      } else if (
        this.mapMatrix[this.guiData["mapSelection"]] == 0 &&
        this.money >= 30
      ) {
        for (let i = 0; i < this.scene.turrets.length; i++) {
          if (this.scene.turrets[i].id == this.guiData["mapSelection"]) {
            this.scene.turrets[i].upgradeTurret();
            this.mapMatrix[this.guiData["mapSelection"]]++;
            this.money -= 30;
          }
        }
      } else if (
        this.mapMatrix[this.guiData["mapSelection"]] == 1 &&
        this.money >= 45
      ) {
        for (let i = 0; i < this.scene.turrets.length; i++) {
          if (this.scene.turrets[i].id == this.guiData["mapSelection"]) {
            this.scene.turrets[i].upgradeTurret();
            this.mapMatrix[this.guiData["mapSelection"]]++;
            this.money -= 45;
          }
        }
      }
    }
  }

  odstrani_Turret() {
    if (this.guiData["mapSelection"] != -1) {
      for (let i = 0; i < this.scene.turrets.length; i++) {
        if (this.scene.turrets[i].id == this.guiData["mapSelection"]) {
          if (this.mapMatrix[this.guiData["mapSelection"]] == 0) {
            this.money += 15;
          } else if (this.mapMatrix[this.guiData["mapSelection"]] == 1) {
            this.money += 45;
          } else if (this.mapMatrix[this.guiData["mapSelection"]] == 2) {
            this.money += 75;
          }
          this.scene.turrets.splice(i, 1);
        }
        if (this.mapMatrix[this.guiData["mapSelection"]] != -2)
          this.mapMatrix[this.guiData["mapSelection"]] = -1;
      }
    }
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
        this.camera.update(dt);
      }

      if (this.physics) {
        this.physics.updateMatrix();
      }

      if (this.scene.enemies && !this.pause) {
        if(!this.spawned) {
          this.spawned = true;     
          let delay = 0;     
          for(let i = 0; i < this.waves[this.currwave].lvl0; i++) {
            delay += this.waves[this.currwave].delay
            this.addEnemy(dt, 0, delay);
          }
          for(let i = 0; i < this.waves[this.currwave].lvl1; i++) {
            delay += this.waves[this.currwave].delay
            this.addEnemy(dt, 1, delay);
          }
          for(let i = 0; i < this.waves[this.currwave].lvl2; i++) {
            delay += this.waves[this.currwave].delay
            this.addEnemy(dt, 2, delay);
          }
        }
        if(this.scene.enemies.length == 0) {
          this.pause = true;
          this.currwave++;
          this.spawned = false;
        }
        for (const enemy of this.scene.enemies) {
          if (enemy.dead() || enemy.reachedEnd()) {
            if (enemy.reachedEnd()) {
              this.hp--;
            }
            if (enemy.dead()) {
              this.money += 10;
            }
            let j = 0;
            while (j < this.scene.bullets.length) {
              if (this.scene.bullets[j].enemy == enemy) {
                this.scene.bullets.splice(j, 1);
              } else {
                ++j;
              }
            }
            const i = this.scene.enemies.indexOf(enemy);
            this.scene.enemies.splice(i, 1);
            continue;
          }
          enemy.rotate(dt);
          if(!this.pause)
            enemy.moveEnemy(dt, t);
        }
      }

      if (this.scene.turrets) {
        for (const turret of this.scene.turrets) {
          turret.rotateToEnemy(this.scene.enemies, dt);
          let bullet = turret.shoot(this.time);
          if (bullet) {
            this.scene.bullets.push(bullet);
          }
        }
      }

      if (this.scene.bullets) {
        for (const bullet of this.scene.bullets) {
          bullet.moveToEnemy(dt);
          if (bullet.collision()) {
            const i = this.scene.bullets.indexOf(bullet);
            this.scene.bullets.splice(i, 1);
          }
        }
      }
    }

    if (this.hp <= 0) {
      location.reload(true);
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
      if (this.scene.bullets) {
        this.renderer.renderNodeArray(this.scene.bullets, this.camera);
      }
    }
    this.showHP();
    this.showMoney();
    this.showWave();
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

  showHP() {
    this.healthNode.nodeValue = this.hp;
  }
  showMoney() {
    this.moneyNode.nodeValue = this.money;
  }
  showWave() {
    this.waveNode.nodeValue = this.currwave;
  }
  begin() {
    this.pause = false;
  }

}
window.onload = function () {
  const canvas = document.querySelector("canvas");
  var healthElement = document.querySelector("#health");
  var healthNode = document.createTextNode("");
  var moneyElement = document.querySelector("#money");
  var moneyNode = document.createTextNode("");
  var waveElement = document.querySelector("#wave");
  var waveNode = document.createTextNode("");
  healthElement.appendChild(healthNode);
  moneyElement.appendChild(moneyNode);
  waveElement.appendChild(waveNode);

  const app = new App(healthNode, moneyNode, waveNode, canvas);
  const gui = new GUI();
  gui.add(app, "enableCamera");
  gui.add(app.guiData, "mapSelection", 0, 143);
  gui.add(app, "dodaj_Nadgradi_Turret");
  gui.add(app, "odstrani_Turret");
  gui.add(app, "begin");
};
//document.addEventListener("DOMContentLoaded", () => {});
