export const worldVisualPalette = {
  sky: "#132b34",
  fog: "#18343b",
  ambient: "#314852",
  skyLight: "#ffe7b5",
  groundLight: "#29434a",
  grass: "#668f68",
  grassLight: "#769d70",
  dirt: "#6c5143",
  path: "#b99c6a",
  water: "#4f9298",
  stone: "#8b8a8d",
  stoneDark: "#565c63",
  wood: "#67483a",
  leaves: "#3f7058",
  mintLight: "#9de5d4",
  goldLight: "#f2cd7c",
  burgundy: "#82495a",
  shrinePaving: "#718e87",
} as const;

export type WorldVisualColor = keyof typeof worldVisualPalette;
