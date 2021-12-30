import { mat4, vec3 } from "../lib/gl-matrix-module";

export class MouseChecker {
  constructor(camera) {
    this.ray = vec3.create();

    this.projectionMatrix = mat4.create();
    this.viewMatrix = mat4.create();
    this.camera = camera;
  }
}
