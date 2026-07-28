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

export const pukCharacter: CharacterDefinition = {
  id: "puk",
  displayName: "Puk",
  kind: "spirit",
  sprite: {
    assetPath: "/assets/characters/puk.png",
    pixelWidth: 48,
    pixelHeight: 64,
    worldHeight: 0.82,
  },
  palette: {
    primary: "#82e3d0",
    secondary: "#b8f4de",
    skin: "#fff1b8",
    hair: "#25626a",
    boots: "#25626a",
    accent: "#e8bd55",
  },
  proportions: {
    bodyWidth: 0.7,
    bodyHeight: 0.7,
    headSize: 0.5,
    armLength: 0.2,
    legHeight: 0.2,
    footDepth: 0.2,
  },
  hairStyle: "none",
  outfitStyle: "none",
  accessories: ["floating-shard"],
};

export const renaCharacter: CharacterDefinition = {
  id: "rena",
  displayName: "Rena",
  kind: "humanoid",
  sprite: {
    assetPath: "/assets/characters/rena.png",
    pixelWidth: 64,
    pixelHeight: 96,
    worldHeight: 2.35,
  },
  palette: {
    primary: "#355944",
    secondary: "#be542d",
    skin: "#e8ae83",
    hair: "#54301f",
    boots: "#49301e",
    accent: "#b88b3f",
  },
  proportions: {
    bodyWidth: 0.86,
    bodyHeight: 0.82,
    headSize: 0.69,
    armLength: 0.66,
    legHeight: 0.5,
    footDepth: 0.44,
  },
  hairStyle: "ranger-braid",
  outfitStyle: "ranger-coat",
  accessories: ["shoulder-wrap", "gate-key"],
};

export const spuntCharacter: CharacterDefinition = {
  id: "spunt",
  displayName: "Špunt",
  kind: "creature",
  sprite: {
    assetPath: "/assets/characters/spunt.png",
    pixelWidth: 72,
    pixelHeight: 64,
    worldHeight: 1.05,
  },
  palette: {
    primary: "#d86d20",
    secondary: "#f5d698",
    skin: "#f5d698",
    hair: "#7a381b",
    boots: "#183f43",
    accent: "#72d9c0",
  },
  proportions: {
    bodyWidth: 1.1,
    bodyHeight: 0.6,
    headSize: 0.55,
    armLength: 0.25,
    legHeight: 0.32,
    footDepth: 0.32,
  },
  hairStyle: "none",
  outfitStyle: "none",
  accessories: ["ear-notch"],
};

export const charactersById: Readonly<Record<string, CharacterDefinition>> = {
  [playerCharacter.id]: playerCharacter,
  [milaCharacter.id]: milaCharacter,
  [pukCharacter.id]: pukCharacter,
  [renaCharacter.id]: renaCharacter,
  [spuntCharacter.id]: spuntCharacter,
};
