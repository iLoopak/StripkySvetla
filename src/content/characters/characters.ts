import type { CharacterDefinition } from "../types";

export const playerCharacter: CharacterDefinition = {
  id: "light-bearer",
  displayName: "Poutník",
  palette: {
    clothing: "#355d78",
    skin: "#efc39f",
    hair: "#3d2b35",
    boots: "#4a3740",
    accent: "#f3c969",
  },
  hairStyle: "cap",
  hasLamp: true,
};

export const milaCharacter: CharacterDefinition = {
  id: "mila",
  displayName: "Mila",
  palette: {
    clothing: "#8f5061",
    skin: "#e9b995",
    hair: "#c58b4d",
    boots: "#49383c",
    accent: "#8fc3a5",
  },
  hairStyle: "bun",
  hasLamp: false,
};

export const charactersById: Readonly<Record<string, CharacterDefinition>> = {
  [playerCharacter.id]: playerCharacter,
  [milaCharacter.id]: milaCharacter,
};
