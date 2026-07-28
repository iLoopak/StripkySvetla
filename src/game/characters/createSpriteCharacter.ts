import { Material } from "@babylonjs/core/Materials/material";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { CharacterDefinition } from "../../content/types";
import type { CharacterVisual } from "./characterVisualTypes";

const SPRITE_GROUND_OFFSET = 0.035;
const SHADOW_BASE_ALPHA = 0.22;
const WALK_BOUNCE_HEIGHT = 0.075;

export function createSpriteCharacter(
  scene: Scene,
  definition: CharacterDefinition,
  instanceName = definition.id,
): CharacterVisual {
  const root = new TransformNode(`${instanceName}-CharacterRoot`, scene);
  const { sprite } = definition;
  const planeWidth = sprite.worldHeight * (sprite.pixelWidth / sprite.pixelHeight);

  const texture = new Texture(sprite.assetPath, scene, {
    noMipmap: true,
    invertY: true,
    samplingMode: Texture.NEAREST_SAMPLINGMODE,
  });
  texture.name = `${instanceName}-SpriteTexture`;
  texture.hasAlpha = true;
  texture.wrapU = Texture.CLAMP_ADDRESSMODE;
  texture.wrapV = Texture.CLAMP_ADDRESSMODE;
  texture.anisotropicFilteringLevel = 1;

  const spriteMaterial = new StandardMaterial(`${instanceName}-SpriteMaterial`, scene);
  spriteMaterial.diffuseTexture = texture;
  spriteMaterial.emissiveTexture = texture;
  spriteMaterial.emissiveColor = Color3.White();
  spriteMaterial.useAlphaFromDiffuseTexture = true;
  spriteMaterial.transparencyMode = Material.MATERIAL_ALPHATEST;
  spriteMaterial.alphaCutOff = 0.5;
  spriteMaterial.backFaceCulling = false;
  spriteMaterial.disableLighting = true;
  spriteMaterial.specularColor = Color3.Black();

  const plane = MeshBuilder.CreatePlane(
    `${instanceName}-SpritePlane`,
    {
      width: planeWidth,
      height: sprite.worldHeight,
      sideOrientation: Mesh.DOUBLESIDE,
    },
    scene,
  );
  plane.parent = root;
  plane.position.y = SPRITE_GROUND_OFFSET + sprite.worldHeight * 0.5;
  plane.billboardMode = TransformNode.BILLBOARDMODE_Y;
  plane.material = spriteMaterial;
  plane.isPickable = false;

  const shadowMaterial = new StandardMaterial(`${instanceName}-ShadowMaterial`, scene);
  shadowMaterial.diffuseColor = Color3.FromHexString("#10242b");
  shadowMaterial.specularColor = Color3.Black();
  shadowMaterial.alpha = SHADOW_BASE_ALPHA;
  shadowMaterial.transparencyMode = Material.MATERIAL_ALPHABLEND;
  shadowMaterial.disableLighting = true;

  const shadow = MeshBuilder.CreateDisc(
    `${instanceName}-GroundShadow`,
    {
      radius: 0.52,
      tessellation: 32,
      sideOrientation: Mesh.DOUBLESIDE,
    },
    scene,
  );
  shadow.parent = root;
  shadow.position.y = 0.022;
  shadow.rotation.x = Math.PI * 0.5;
  shadow.scaling.y = 0.48;
  shadow.material = shadowMaterial;
  shadow.isPickable = false;

  return {
    root,
    animate: ({ elapsedSeconds, isMoving, facing }) => {
      const walkPhase = elapsedSeconds * 8.2;
      const idlePhase = elapsedSeconds * 1.8;
      const bounce = isMoving
        ? Math.abs(Math.sin(walkPhase)) * WALK_BOUNCE_HEIGHT
        : Math.sin(idlePhase) * 0.006;
      const squash = isMoving
        ? Math.cos(walkPhase * 2) * 0.022
        : Math.sin(idlePhase) * 0.005;
      const scaleY = 1 - squash;
      const scaleX = 1 + squash * 0.45;
      const facingScale = facing === "left" ? -1 : 1;

      plane.scaling.set(facingScale * scaleX, scaleY, 1);
      plane.position.y =
        SPRITE_GROUND_OFFSET + sprite.worldHeight * scaleY * 0.5 + bounce;
      plane.rotation.z = isMoving ? Math.sin(walkPhase) * 0.018 : 0;

      const bounceRatio = Math.max(0, bounce) / WALK_BOUNCE_HEIGHT;
      const shadowScale = 1 - bounceRatio * 0.1;
      shadow.scaling.set(shadowScale, 0.48 * shadowScale, 1);
      shadowMaterial.alpha = SHADOW_BASE_ALPHA - bounceRatio * 0.045;
    },
  };
}
