import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
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

const SPRITE_GROUND_OFFSET = 0.008;
const OUTER_SHADOW_BASE_ALPHA = 0.13;
const CONTACT_SHADOW_BASE_ALPHA = 0.23;
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

  const outerShadowMaterial = new StandardMaterial(
    `${instanceName}-OuterShadowMaterial`,
    scene,
  );
  outerShadowMaterial.diffuseColor = Color3.FromHexString("#10242b");
  outerShadowMaterial.specularColor = Color3.Black();
  outerShadowMaterial.alpha = OUTER_SHADOW_BASE_ALPHA;
  outerShadowMaterial.transparencyMode = Material.MATERIAL_ALPHABLEND;
  outerShadowMaterial.disableLighting = true;

  const outerShadow = MeshBuilder.CreateDisc(
    `${instanceName}-OuterGroundShadow`,
    {
      radius: 0.58,
      tessellation: 32,
      sideOrientation: Mesh.DOUBLESIDE,
    },
    scene,
  );
  outerShadow.parent = root;
  outerShadow.position.y = 0.018;
  outerShadow.rotation.x = Math.PI * 0.5;
  outerShadow.scaling.y = 0.48;
  outerShadow.material = outerShadowMaterial;
  outerShadow.isPickable = false;

  const contactShadowMaterial = new StandardMaterial(
    `${instanceName}-ContactShadowMaterial`,
    scene,
  );
  contactShadowMaterial.diffuseColor = Color3.FromHexString("#08191e");
  contactShadowMaterial.specularColor = Color3.Black();
  contactShadowMaterial.alpha = CONTACT_SHADOW_BASE_ALPHA;
  contactShadowMaterial.transparencyMode = Material.MATERIAL_ALPHABLEND;
  contactShadowMaterial.disableLighting = true;

  const contactShadow = MeshBuilder.CreateDisc(
    `${instanceName}-ContactShadow`,
    {
      radius: 0.34,
      tessellation: 32,
      sideOrientation: Mesh.DOUBLESIDE,
    },
    scene,
  );
  contactShadow.parent = root;
  contactShadow.position.y = 0.026;
  contactShadow.rotation.x = Math.PI * 0.5;
  contactShadow.scaling.y = 0.34;
  contactShadow.material = contactShadowMaterial;
  contactShadow.isPickable = false;

  let lanternGlow: Mesh | null = null;
  let lanternGlowMaterial: StandardMaterial | null = null;
  let lanternGlowLayer: GlowLayer | null = null;

  if (definition.accessories.includes("light-pendant")) {
    const gold = Color3.FromHexString("#ffe2a0");
    lanternGlowMaterial = new StandardMaterial(
      `${instanceName}-LanternGlowMaterial`,
      scene,
    );
    lanternGlowMaterial.diffuseColor = gold.scale(0.24);
    lanternGlowMaterial.emissiveColor = gold;
    lanternGlowMaterial.specularColor = Color3.Black();
    lanternGlowMaterial.alpha = 0.82;
    lanternGlowMaterial.transparencyMode = Material.MATERIAL_ALPHABLEND;
    lanternGlowMaterial.disableLighting = true;
    lanternGlowMaterial.disableDepthWrite = true;
    lanternGlowMaterial.backFaceCulling = false;

    lanternGlow = MeshBuilder.CreatePlane(
      `${instanceName}-LanternGlowCore`,
      {
        size: 0.14,
        sideOrientation: Mesh.DOUBLESIDE,
      },
      scene,
    );
    lanternGlow.parent = plane;
    lanternGlow.position.set(0.19, -0.16, -0.025);
    lanternGlow.rotation.z = Math.PI * 0.25;
    lanternGlow.material = lanternGlowMaterial;
    lanternGlow.renderingGroupId = 2;
    lanternGlow.isPickable = false;

    lanternGlowLayer = new GlowLayer(`${instanceName}-LanternGlowLayer`, scene, {
      blurKernelSize: 12,
      excludeByDefault: true,
      mainTextureFixedSize: 128,
    });
    lanternGlowLayer.intensity = 0.34;
    lanternGlowLayer.addIncludedOnlyMesh(lanternGlow);
  }

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
      const outerShadowScale = 1 - bounceRatio * 0.11;
      outerShadow.scaling.set(outerShadowScale, 0.48 * outerShadowScale, 1);
      outerShadowMaterial.alpha = OUTER_SHADOW_BASE_ALPHA - bounceRatio * 0.035;

      const contactShadowScale = 1 - bounceRatio * 0.18;
      contactShadow.scaling.set(contactShadowScale, 0.34 * contactShadowScale, 1);
      contactShadowMaterial.alpha = CONTACT_SHADOW_BASE_ALPHA - bounceRatio * 0.075;

      if (lanternGlow && lanternGlowMaterial && lanternGlowLayer) {
        const glowPulse = 0.94 + Math.sin(elapsedSeconds * 2.35) * 0.06;
        lanternGlow.scaling.setAll(glowPulse);
        lanternGlowMaterial.alpha = 0.78 + glowPulse * 0.05;
        lanternGlowLayer.setEffectIntensity(lanternGlow, glowPulse);
      }
    },
  };
}
