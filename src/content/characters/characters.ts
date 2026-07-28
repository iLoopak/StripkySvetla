import type { CharacterDefinition } from "../types";

export const playerCharacter: CharacterDefinition = {
  id: "light-bearer",
  displayName: "Poutník",
  sprite: {
    assetPath: "/assets/characters/player.png",
    pixelWidth: 64,
    pixelHeight: 96,
    worldHeight: 2.35,
  },
  palette: {
    primary: "#285565",
    secondary: "#d9d0b9",
    skin: "#efc39f",
    hair: "#273a43",
    boots: "#403b3d",
    accent: "#f3cf78",
  },
  proportions: {
    bodyWidth: 0.8,
    bodyHeight: 0.76,
    headSize: 0.72,
    armLength: 0.65,
    legHeight: 0.5,
    footDepth: 0.46,
  },
  hairStyle: "courier-hood",
  outfitStyle: "courier-tunic",
  accessories: ["scarf", "light-pendant"],
};

export const milaCharacter: CharacterDefinition = {
  id: "mila",
  displayName: "Mila",
  sprite: {
    assetPath: "/assets/characters/mila.png",
    pixelWidth: 64,
    pixelHeight: 96,
    worldHeight: 2.35,
  },
  palette: {
    primary: "#87485b",
    secondary: "#c66e65",
    skin: "#e9b995",
    hair: "#5a3634",
    boots: "#443436",
    accent: "#e0b866",
  },
  proportions: {
    bodyWidth: 0.86,
    bodyHeight: 0.8,
    headSize: 0.7,
    armLength: 0.66,
    legHeight: 0.48,
    footDepth: 0.42,
  },
  hairStyle: "festival-bun",
  outfitStyle: "festival-steward",
  accessories: ["sash", "festival-brooch"],
};

export const charactersById: Readonly<Record<string, CharacterDefinition>> = {
  [playerCharacter.id]: playerCharacter,
  [milaCharacter.id]: milaCharacter,
};
