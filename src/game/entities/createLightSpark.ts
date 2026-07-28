import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { Scene } from "@babylonjs/core/scene";
import type { GridPosition } from "../../content/types";

export interface LightSpark {
  root: TransformNode;
  animate: (elapsedSeconds: number) => void;
  collect: (playEffect?: boolean) => boolean;
  dispose: () => void;
}

export function createLightSpark(
  scene: Scene,
  id: string,
  position: GridPosition,
  terrainHeight: number,
): LightSpark {
  const root = new TransformNode(`${id}-root`, scene);
  root.position.set(position.x, terrainHeight, position.z);
  const material = new StandardMaterial(`${id}-material`, scene);
  material.diffuseColor = Color3.FromHexString("#c9fff1");
  material.emissiveColor = Color3.FromHexString("#87ead8");
  material.specularColor = Color3.Black();

  const core = MeshBuilder.CreatePolyhedron(`${id}-core`, { type: 1, size: 0.36 }, scene);
  core.material = material;
  core.scaling.y = 1.35;
  core.position.y = 0.9;
  core.parent = root;

  const motes = Array.from({ length: 5 }, (_, index) => {
    const mote = MeshBuilder.CreateBox(`${id}-mote-${index}`, { size: 0.08 }, scene);
    mote.material = material;
    mote.parent = root;
    return mote;
  });

  const light = new PointLight(`${id}-light`, new Vector3(0, 0.9, 0), scene);
  light.diffuse = Color3.FromHexString("#9df7e5");
  light.intensity = 2.8;
  light.range = 4;
  light.parent = root;

  let collected = false;
  let disposed = false;
  let burstObserver: Observer<Scene> | null = null;
  let burstMaterial: StandardMaterial | null = null;
  let burstMeshes: Mesh[] = [];

  const disposeSpark = (): void => {
    light.dispose();
    core.dispose();
    motes.forEach((mote) => mote.dispose());
    material.dispose();
    root.dispose();
  };

  const disposeBurst = (): void => {
    if (burstObserver) {
      scene.onBeforeRenderObservable.remove(burstObserver);
      burstObserver = null;
    }
    burstMeshes.forEach((mesh) => mesh.dispose());
    burstMeshes = [];
    burstMaterial?.dispose();
    burstMaterial = null;
  };

  const createBurst = (): void => {
    burstMaterial = new StandardMaterial(`${id}-burst-material`, scene);
    burstMaterial.diffuseColor = Color3.FromHexString("#d8fff5");
    burstMaterial.emissiveColor = Color3.FromHexString("#8aead8");
    const origin = root.position.add(new Vector3(0, 0.9, 0));
    const velocities: Vector3[] = [];
    burstMeshes = Array.from({ length: 8 }, (_, index) => {
      const mesh = MeshBuilder.CreateBox(`${id}-burst-${index}`, { size: 0.1 }, scene);
      mesh.material = burstMaterial;
      mesh.position.copyFrom(origin);
      const angle = (index / 8) * Math.PI * 2;
      velocities.push(
        new Vector3(
          Math.cos(angle) * 1.5,
          1.1 + (index % 2) * 0.45,
          Math.sin(angle) * 1.5,
        ),
      );
      return mesh;
    });

    let elapsed = 0;
    burstObserver = scene.onBeforeRenderObservable.add(() => {
      const delta = Math.min(scene.getEngine().getDeltaTime(), 50) / 1000;
      elapsed += delta;
      burstMeshes.forEach((mesh, index) => {
        const velocity = velocities[index];
        if (velocity) {
          mesh.position.addInPlace(velocity.scale(delta));
          mesh.scaling.setAll(Math.max(0.05, 1 - elapsed * 1.4));
        }
      });
      if (elapsed >= 0.7) {
        disposeBurst();
      }
    });
  };

  return {
    root,
    animate: (elapsedSeconds) => {
      if (collected || disposed) {
        return;
      }
      core.position.y = 0.9 + Math.sin(elapsedSeconds * 2.1) * 0.1;
      core.rotation.y = elapsedSeconds * 0.8;
      light.intensity = 2.6 + Math.sin(elapsedSeconds * 2.4) * 0.35;
      motes.forEach((mote, index) => {
        const phase = elapsedSeconds * 0.7 + (index / motes.length) * Math.PI * 2;
        mote.position.set(
          Math.cos(phase) * 0.55,
          0.9 + Math.sin(phase * 1.7) * 0.3,
          Math.sin(phase) * 0.55,
        );
      });
    },
    collect: (playEffect = true) => {
      if (collected || disposed) {
        return false;
      }
      collected = true;
      if (playEffect) {
        createBurst();
      }
      disposeSpark();
      return true;
    },
    dispose: () => {
      if (disposed) {
        return;
      }
      disposed = true;
      if (!collected) {
        disposeSpark();
      }
      disposeBurst();
    },
  };
}
