import type { WorldMapDefinition } from "../types";
import { jasnovFestivalSquare } from "./jasnovFestivalSquare";
import { jasnovOutskirts } from "./jasnovOutskirts";

export const mapsById: Readonly<Record<string, WorldMapDefinition>> = {
  [jasnovOutskirts.id]: jasnovOutskirts,
  [jasnovFestivalSquare.id]: jasnovFestivalSquare,
};

export function mapEntryPoint(map: WorldMapDefinition, entryPointId: string) {
  return map.entryPoints.find((entryPoint) => entryPoint.id === entryPointId) ?? null;
}
