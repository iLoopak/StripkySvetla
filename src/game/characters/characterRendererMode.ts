export type CharacterRendererMode = "sprite" | "blocky";

export function resolveCharacterRendererMode(
  configuredMode: string | undefined,
  isDevelopment: boolean,
): CharacterRendererMode {
  return isDevelopment && configuredMode?.toLowerCase() === "blocky"
    ? "blocky"
    : "sprite";
}

export const characterRendererMode = resolveCharacterRendererMode(
  import.meta.env.VITE_CHARACTER_RENDERER,
  import.meta.env.DEV,
);
