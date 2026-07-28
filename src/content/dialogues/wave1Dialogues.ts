import type { DialogueDefinition } from "../types";

export const wave1Dialogues = [
  {
    id: "mila-introduction",
    speakerName: "Mila",
    lines: [
      "Díky světlu, někdo přišel. Po prasknutí lucerny dopadla ke staré svatyni drobná záře.",
      "Není to pravý střípek, jen světelná jiskra. Najdeš ji pro mě, prosím?",
    ],
  },
  {
    id: "mila-searching",
    speakerName: "Mila",
    lines: [
      "Jiskra dopadla poblíž staré svatyně. Její světlo mezi kameny určitě zahlédneš.",
    ],
  },
  {
    id: "mila-return",
    speakerName: "Mila",
    lines: [
      "Ano, to je ona. Počkej… její světlo se stáčí k severu.",
      "Ukazuje cestu k Mechovému lesu. Tam začíná naše další stopa.",
    ],
  },
  {
    id: "mila-completed",
    speakerName: "Mila",
    lines: ["Mechový les na nás počká. Až budeš připraven, vydáme se za světlem."],
  },
] as const satisfies readonly DialogueDefinition[];

export const dialoguesById: Readonly<Record<string, DialogueDefinition>> =
  Object.fromEntries(wave1Dialogues.map((dialogue) => [dialogue.id, dialogue]));
