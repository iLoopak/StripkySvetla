import type { Wave1StoryStage } from "../../game/story/storyTypes";
import type { ObjectiveDefinition } from "../types";

export const wave1ObjectivesByStage: Readonly<
  Record<Wave1StoryStage, ObjectiveDefinition>
> = {
  "meet-mila": {
    id: "talk-to-mila",
    title: "Promluv si s Milou",
    description: "Správkyně slavnosti čeká u cesty.",
  },
  "find-spark": {
    id: "find-light-spark",
    title: "Najdi světelnou jiskru u staré svatyně",
    description: "Hledej drobnou záři mezi kameny.",
  },
  "return-to-mila": {
    id: "return-to-mila",
    title: "Vrať se za Milou",
    description: "Ukaž Mile nalezenou světelnou stopu.",
  },
  completed: {
    id: "wave-1-complete",
    title: "Cíl splněn",
    description: "Jiskra ukázala cestu k Mechovému lesu.",
    completed: true,
  },
};
