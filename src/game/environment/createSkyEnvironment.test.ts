import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { describe, expect, it } from "vitest";
import { createSkyEnvironment } from "./createSkyEnvironment";
import { jasnovSkyEnvironment } from "./skyEnvironmentConfig";

describe("sky environment lifecycle", () => {
  it("reuses one scene-owned dome and cloud sea", () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const camera = new FreeCamera("TestCamera", new Vector3(0, 10, -20), scene);

    const first = createSkyEnvironment(scene, camera, jasnovSkyEnvironment);
    const second = createSkyEnvironment(scene, camera, jasnovSkyEnvironment);

    expect(second).toBe(first);
    expect(
      scene.transformNodes.filter((node) => node.name === "SkyEnvironmentRoot"),
    ).toHaveLength(1);
    expect(scene.meshes.filter((mesh) => mesh.name === "SkyDome")).toHaveLength(1);
    expect(scene.meshes.filter((mesh) => mesh.name === "CloudSea")).toHaveLength(1);

    first.dispose();
    first.dispose();
    expect(scene.getTransformNodeByName("SkyEnvironmentRoot")).toBeNull();
    expect(scene.getMeshByName("SkyDome")).toBeNull();
    expect(scene.getMeshByName("CloudSea")).toBeNull();

    scene.dispose();
    engine.dispose();
  });
});
