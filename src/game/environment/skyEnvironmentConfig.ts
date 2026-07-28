export const MAX_OPTIONAL_CLOUD_CLUSTERS = 4;

export interface SkyGradientStop {
  offset: number;
  color: string;
}

export interface HorizonLayerConfig {
  name: string;
  radius: number;
  baseHeight: number;
  height: number;
  color: string;
  phase: number;
}

export interface OptionalCloudClusterConfig {
  angle: number;
  height: number;
  distance: number;
  scale: number;
}

export interface SkyEnvironmentConfig {
  id: string;
  ownership: "scene";
  dome: {
    radius: number;
    segments: number;
  };
  gradient: {
    stops: readonly SkyGradientStop[];
    warmHorizon: {
      color: string;
      centerX: number;
      centerY: number;
      radiusX: number;
      radiusY: number;
      strength: number;
    };
  };
  horizonLayers: readonly HorizonLayerConfig[];
  cloudSea: {
    height: number;
    mapLowerBoundary: number;
    radius: number;
    opacity: number;
    color: string;
    driftRadiansPerSecond: number;
  };
  optionalCloudClusters: readonly OptionalCloudClusterConfig[];
  scene: {
    clearColor: string;
    ambientColor: string;
    fogColor: string;
    fogStart: number;
    fogEnd: number;
    skyLightColor: string;
    groundLightColor: string;
    skyLightIntensity: number;
  };
}

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

export const jasnovSkyEnvironment: SkyEnvironmentConfig = {
  id: "jasnov-sky-environment",
  ownership: "scene",
  dome: {
    radius: 160,
    segments: 32,
  },
  gradient: {
    stops: [
      { offset: 0, color: "#102830" },
      { offset: 0.28, color: "#183840" },
      { offset: 0.56, color: "#31565a" },
      { offset: 0.72, color: "#78908a" },
      { offset: 1, color: "#516f70" },
    ],
    warmHorizon: {
      color: "#c4a875",
      centerX: 0.7,
      centerY: 0.7,
      radiusX: 0.3,
      radiusY: 0.12,
      strength: 0.2,
    },
  },
  horizonLayers: [
    {
      name: "FarHills",
      radius: 76,
      baseHeight: -6.5,
      height: 9.5,
      color: "#29484b",
      phase: 0.65,
    },
    {
      name: "NearHazeSilhouettes",
      radius: 61,
      baseHeight: -6,
      height: 7,
      color: "#36575a",
      phase: 2.1,
    },
  ],
  cloudSea: {
    height: -4.25,
    mapLowerBoundary: -1.25,
    radius: 44,
    opacity: 0.34,
    color: "#587573",
    driftRadiansPerSecond: 0.0025,
  },
  optionalCloudClusters: [],
  scene: {
    clearColor: "#102830",
    ambientColor: "#38515a",
    fogColor: "#607b79",
    fogStart: 24,
    fogEnd: 92,
    skyLightColor: "#f3deb2",
    groundLightColor: "#315158",
    skyLightIntensity: 1.02,
  },
};

export function isValidHexColor(color: string): boolean {
  return HEX_COLOR_PATTERN.test(color);
}

export function resolveSkyEnvironmentId(mapId: string): string {
  if (mapId.trim().length === 0) {
    throw new Error("A map ID is required to resolve its sky environment.");
  }

  return jasnovSkyEnvironment.id;
}

export function validateSkyEnvironmentConfig(
  config: SkyEnvironmentConfig,
): readonly string[] {
  const errors: string[] = [];
  const colors = [
    ...config.gradient.stops.map((stop) => stop.color),
    config.gradient.warmHorizon.color,
    ...config.horizonLayers.map((layer) => layer.color),
    config.cloudSea.color,
    config.scene.clearColor,
    config.scene.ambientColor,
    config.scene.fogColor,
    config.scene.skyLightColor,
    config.scene.groundLightColor,
  ];

  if (config.ownership !== "scene") {
    errors.push("Sky environment resources must be scene-owned.");
  }
  if (config.dome.radius <= 0) {
    errors.push("Dome radius must be positive.");
  }
  if (config.dome.segments < 8) {
    errors.push("Dome segments must be at least 8.");
  }
  if (
    config.gradient.stops.length < 2 ||
    config.gradient.stops.some(
      (stop, index, stops) =>
        stop.offset < 0 ||
        stop.offset > 1 ||
        (index > 0 && stop.offset <= stops[index - 1].offset),
    )
  ) {
    errors.push("Gradient stops must be strictly ordered between 0 and 1.");
  }
  if (colors.some((color) => !isValidHexColor(color))) {
    errors.push("Environment colors must use six-digit hex values.");
  }
  if (config.horizonLayers.length > 2) {
    errors.push("At most two distant horizon layers are allowed.");
  }
  if (
    config.horizonLayers.some(
      (layer) =>
        layer.radius <= 0 || layer.radius >= config.dome.radius || layer.height <= 0,
    )
  ) {
    errors.push("Horizon layers must fit inside the dome and have positive size.");
  }
  if (config.cloudSea.height >= config.cloudSea.mapLowerBoundary) {
    errors.push("Cloud sea must stay below the map lower boundary.");
  }
  if (
    config.cloudSea.radius <= 0 ||
    config.cloudSea.opacity <= 0 ||
    config.cloudSea.opacity > 1
  ) {
    errors.push("Cloud sea radius and opacity must be in valid ranges.");
  }
  if (config.optionalCloudClusters.length > MAX_OPTIONAL_CLOUD_CLUSTERS) {
    errors.push(
      `At most ${MAX_OPTIONAL_CLOUD_CLUSTERS} optional cloud clusters are allowed.`,
    );
  }
  if (
    config.scene.fogStart < 0 ||
    config.scene.fogEnd <= config.scene.fogStart ||
    config.scene.skyLightIntensity <= 0
  ) {
    errors.push("Fog distances and scene light intensity must be positive and ordered.");
  }

  return errors;
}
