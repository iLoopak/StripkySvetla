import type { ChapterOneStage } from "../../game/story/storyTypes";
import type { ObjectiveDefinition } from "../types";

export const objectivesByStage: Readonly<Record<ChapterOneStage, ObjectiveDefinition>> = {
  "meet-mila": {
    id: "talk-to-mila",
    title: "Promluv si s Milou",
    description: "Správkyně slavnosti čeká u cesty.",
  },
  "find-spark": {
    id: "find-light-spark",
    title: "Najdi světelnou jiskru u staré svatyně",
    description: "Jde o drobnou stopu světla, ne o hlavní střípek.",
  },
  "return-to-mila": {
    id: "return-to-mila",
    title: "Vrať se za Milou",
    description: "Ukaž Mile nalezenou světelnou stopu.",
  },
  "lantern-memory": {
    id: "watch-lantern-memory",
    title: "Sleduj vzpomínku světla",
    description: "Jiskra reaguje s úlomkem ukrytým v tvé lampičce.",
  },
  "puk-awakening": {
    id: "meet-puk",
    title: "Promluv si s Pukem a Milou",
    description: "Z úlomku v lampičce se probouzí světelný duch.",
  },
  "receive-rena-delivery": {
    id: "receive-rena-delivery",
    title: "Převezmi zásilku pro Renu",
    description: "Mila připravila zapečetěný festivalový soupis.",
  },
  "travel-to-jasnov": {
    id: "travel-to-jasnov",
    title: "Vydej se do Jasnova",
    description: "Na konci cesty vstup na festivalové náměstí.",
  },
  "deliver-to-rena": {
    id: "deliver-to-rena",
    title: "Doruč Reně festivalový soupis",
    description: "Strážkyně čeká u skladu stužek.",
  },
  "inspect-ribbon-clue": {
    id: "inspect-ribbon-clue",
    title: "Prohlédni okolí skladu",
    description: "Najdi stopu po zmizelých festivalových stužkách.",
  },
  "confront-spunt": {
    id: "find-spunt",
    title: "Najdi domnělého zloděje stužek",
    description: "Drobné otisky vedou za sklad.",
  },
  "resolve-spunt-choice": {
    id: "resolve-spunt-choice",
    title: "Rozhodni, co udělat se Špuntem",
    description: "Důkazy nejsou úplné, ale Rena musí jednat.",
  },
  "reach-forest-gate": {
    id: "reach-forest-gate",
    title: "Dojdi k bráně do Mechového lesa",
    description: "Obě cesty pokračují u zavřené lesní brány.",
  },
  "wave-2-completed": {
    id: "wave-2-completed",
    title: "Cesta do Mechového lesa je otevřená",
    description: "Za bránou na okamžik zazářilo cizí modré světlo.",
    completed: true,
  },
};
