import { describe, expect, it } from "vitest";
import {
  jasnovSkyEnvironment,
  MAX_OPTIONAL_CLOUD_CLUSTERS,
  resolveSkyEnvironmentId,
  validateSkyEnvironmentConfig,
  type SkyEnvironmentConfig,
} from "./skyEnvironmentConfig";

function copyConfig(overrides: Partial<SkyEnvironmentConfig>): SkyEnvironmentConfig {
  return {
    ...jasnovSkyEnvironment,
    ...overrides,
  };
}

describe("sky environment configuration", () => {
  it("keeps the authored Jasnov configuration valid", () => {
    expect(validateSkyEnvironmentConfig(jasnovSkyEnvironment)).toEqual([]);
  });

  it("requires scene ownership instead of map ownership", () => {
    expect(jasnovSkyEnvironment.ownership).toBe("scene");
  });

  it("accepts only six-digit hex colors", () => {
    const invalid = copyConfig({
      scene: {
        ...jasnovSkyEnvironment.scene,
        fogColor: "rgb(10, 20, 30)",
      },
    });

    expect(validateSkyEnvironmentConfig(invalid)).toContain(
      "Environment colors must use six-digit hex values.",
    );
  });

  it("requires strictly ordered gradient stops", () => {
    const invalid = copyConfig({
      gradient: {
        ...jasnovSkyEnvironment.gradient,
        stops: [
          { offset: 0, color: "#102830" },
          { offset: 0.7, color: "#31565a" },
          { offset: 0.4, color: "#78908a" },
        ],
      },
    });

    expect(validateSkyEnvironmentConfig(invalid)).toContain(
      "Gradient stops must be strictly ordered between 0 and 1.",
    );
  });

  it("requires a positive dome radius", () => {
    const invalid = copyConfig({
      dome: { ...jasnovSkyEnvironment.dome, radius: 0 },
    });

    expect(validateSkyEnvironmentConfig(invalid)).toContain(
      "Dome radius must be positive.",
    );
  });

  it("keeps the cloud sea below the map", () => {
    expect(jasnovSkyEnvironment.cloudSea.height).toBeLessThan(
      jasnovSkyEnvironment.cloudSea.mapLowerBoundary,
    );

    const invalid = copyConfig({
      cloudSea: {
        ...jasnovSkyEnvironment.cloudSea,
        height: jasnovSkyEnvironment.cloudSea.mapLowerBoundary,
      },
    });
    expect(validateSkyEnvironmentConfig(invalid)).toContain(
      "Cloud sea must stay below the map lower boundary.",
    );
  });

  it("limits optional cloud clusters", () => {
    const invalid = copyConfig({
      optionalCloudClusters: Array.from(
        { length: MAX_OPTIONAL_CLOUD_CLUSTERS + 1 },
        (_, index) => ({
          angle: index,
          height: 10,
          distance: 50,
          scale: 1,
        }),
      ),
    });

    expect(validateSkyEnvironmentConfig(invalid)).toContain(
      `At most ${MAX_OPTIONAL_CLOUD_CLUSTERS} optional cloud clusters are allowed.`,
    );
  });

  it("resolves the same scene environment across Jasnov map transitions", () => {
    expect(resolveSkyEnvironmentId("jasnov-outskirts")).toBe(
      resolveSkyEnvironmentId("jasnov-future-map"),
    );
    expect(resolveSkyEnvironmentId("jasnov-outskirts")).toBe(jasnovSkyEnvironment.id);
  });
});
